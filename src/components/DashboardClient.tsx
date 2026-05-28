"use client";

import { useEffect, useState, useOptimistic, useTransition } from "react";

import { createTransaction, deleteTransaction } from "@/actions/transactions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TransactionHistory } from "@/components/TransactionHistory";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { CategoryChart } from "@/components/ui/CategoryChart";
import { TransactionForm } from "@/components/ui/TransactionForm";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/client";

interface DashboardClientProps {
  initialTransactions: Transaction[];
}

export function DashboardClient({ initialTransactions }: DashboardClientProps) {
  // โหลดรายการธุรกรรมเริ่มต้นจาก Server Component และมาเก็บเป็น Client State
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [, startTransition] = useTransition();
  
  type OptimisticAction =
    | { type: "add"; transaction: Transaction }
    | { type: "delete"; id: string };

  // สร้าง Optimistic State สำหรับใช้แสดงผลแทน base transactions เพื่อให้ UI ตอบสนองในเสี้ยววินาที
  const [optimisticTransactions, dispatchOptimistic] = useOptimistic<
    Transaction[],
    OptimisticAction
  >(transactions, (state, action) => {
    if (action.type === "add") {
      return [action.transaction, ...state];
    }
    if (action.type === "delete") {
      return state.filter((tx) => tx.id !== action.id);
    }
    return state;
  });

  // สถานะข้อมูลผู้ใช้งานสำหรับแสดงบน Header
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    avatarUrl: string | null;
    email: string | null;
  }>({
    displayName: "สมาชิกพูนพูน",
    avatarUrl: null,
    email: null,
  });

  // โหลดโปรไฟล์ผู้ใช้เมื่อเมาท์คอมโพเนนต์
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserProfile({
          displayName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "สมาชิกพูนพูน",
          avatarUrl:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          email: user.email || null,
        });
      }
    };
    fetchUser();
  }, []);

  // คำนวณรายรับ-รายจ่ายรายเดือน จากข้อมูล Optimistic (อัปเดตแบบเรียลไทม์ไม่ต้องรอเซิร์ฟเวอร์)
  const totalIncome = optimisticTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = optimisticTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // จัดการการบันทึกรายการด้วยสถาปัตยกรรม Optimistic Updates
  const handleAddTransaction = async (newTxData: {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
  }) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        // 1. จำลองข้อมูลแบบ Optimistic (แสดงบน UI ทันที)
        const optimisticTx: Transaction = {
          id: "opt-" + Date.now(),
          ...newTxData,
        };
        dispatchOptimistic({ type: "add", transaction: optimisticTx });

        try {
          // 2. เรียก Server Action ส่งข้อมูลไปยังฐานข้อมูลจริง
          const result = await createTransaction(newTxData);
          if (result.success && result.data) {
            // 3. หากสำเร็จ อัปเดตข้อมูลถาวร (ฐานข้อมูลจริงจะเข้ามาแทนที่จำลองเมื่อ Transition จบ)
            setTransactions((prev) => [result.data as Transaction, ...prev]);
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
            });
          }
        } catch (err) {
          console.error("Optimistic transaction error:", err);
          resolve({
            success: false,
            error: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      });
    });
  };

  // จัดการการลบรายการด้วยสถาปัตยกรรม Optimistic Updates
  const handleDeleteTransaction = async (id: string) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        // 1. ลบข้อมูลแบบ Optimistic ทันทีบน UI
        dispatchOptimistic({ type: "delete", id });

        try {
          // 2. เรียก Server Action ลบข้อมูลจริงแบบ Soft Delete
          const result = await deleteTransaction(id);
          if (result.success) {
            // 3. หากสำเร็จ อัปเดตข้อมูลจริงใน Base State
            setTransactions((prev) => prev.filter((tx) => tx.id !== id));
            resolve({ success: true });
          } else {
            alert(result.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
            resolve({
              success: false,
              error: result.error || "เกิดข้อผิดพลาดในการลบข้อมูล",
            });
          }
        } catch (err) {
          console.error("Optimistic delete error:", err);
          alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
          resolve({
            success: false,
            error: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header ทักทาย */}
      <DashboardHeader
        displayName={userProfile.displayName}
        avatarUrl={userProfile.avatarUrl}
        email={userProfile.email}
      />

      {/* 2. Card สรุปยอดเงินคงเหลือ / รายรับ / รายจ่าย */}
      <BalanceCard
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* 3. กราฟวิเคราะห์แบ่งตามหมวดหมู่สีพาสเทลแฮนด์เมด */}
      <CategoryChart transactions={optimisticTransactions} />

      {/* 4. ฟอร์มบันทึกรายรับ-รายจ่ายด่วน */}
      <TransactionForm onAddTransaction={handleAddTransaction} />

      {/* 5. ตารางประวัติความเคลื่อนไหวล่าสุด */}
      <TransactionHistory
        transactions={optimisticTransactions}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
