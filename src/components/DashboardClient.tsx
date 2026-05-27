"use client";

import React, { useEffect, useState } from "react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { TransactionHistory } from "@/components/TransactionHistory";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { CategoryChart } from "@/components/ui/CategoryChart";
import { TransactionForm } from "@/components/ui/TransactionForm";
import { Transaction, SavingGoal } from "@/types";
import { createClient } from "@/utils/supabase/client";

interface DashboardClientProps {
  initialTransactions: Transaction[];
  initialSavingGoals?: SavingGoal[];
}

export function DashboardClient({
  initialTransactions,
  initialSavingGoals = [],
}: DashboardClientProps) {
  // โหลดรายการธุรกรรมเริ่มต้นจาก Server Component และมาเก็บเป็น Client State
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [savingGoals] = useState<SavingGoal[]>(initialSavingGoals);

  // แสดงผลลัพธ์เป้าหมายการเงินใน Console เพื่อเป็นข้อมูลตรวจสอบระบบ
  useEffect(() => {
    if (savingGoals.length > 0) {
      console.log(`[PoonPoon] Loaded ${savingGoals.length} saving goals from database.`);
    }
  }, [savingGoals]);

  // สถานะข้อมูลผู้ใช้งานสำหรับแสดงบน Header
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    emoji: string;
  }>({
    displayName: "พี่ปูพูน",
    emoji: "🦖",
  });

  // โหลดโปรไฟล์ผู้ใช้เมื่อเมาท์คอมโพเนนต์
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      if (!supabase) return; // โหมดจำลอง

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserProfile({
          displayName:
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "สมาชิกพูนพูน",
          emoji: "🪙",
        });
      }
    };
    fetchUser();
  }, []);

  // คำนวณรายรับ-รายจ่ายรายเดือน
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header ทักทาย */}
      <DashboardHeader displayName={userProfile.displayName} emoji={userProfile.emoji} />

      {/* 2. Card สรุปยอดเงินคงเหลือ / รายรับ / รายจ่าย */}
      <BalanceCard
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* 3. กราฟวิเคราะห์แบ่งตามหมวดหมู่สีพาสเทลแฮนด์เมด */}
      <CategoryChart transactions={transactions} />

      {/* 4. ฟอร์มบันทึกรายรับ-รายจ่ายด่วน */}
      <TransactionForm onAddTransaction={handleAddTransaction} />

      {/* 5. ตารางประวัติความเคลื่อนไหวล่าสุด */}
      <TransactionHistory transactions={transactions} />
    </div>
  );
}
