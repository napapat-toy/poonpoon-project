"use client";

import { useEffect, useState, useOptimistic, useTransition } from "react";
import { Transaction, SavingGoal } from "@/types";
import { createTransaction, deleteTransaction } from "@/actions/transactions";
import { createSavingGoal, updateSavingGoalAmount, deleteSavingGoal } from "@/actions/savingGoals";
import { createClient } from "@/utils/supabase/client";

interface UseDashboardProps {
  transactionsPromise: Promise<Transaction[]>;
  savingGoalsPromise: Promise<{
    success: boolean;
    data?: SavingGoal[];
    error?: string;
  }>;
}

export function useDashboard({
  transactionsPromise,
  savingGoalsPromise,
}: UseDashboardProps) {
  const [, startTransition] = useTransition();

  // 1. โหลดรายการธุรกรรมเริ่มต้นและเก็บเป็น Client State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. โหลดรายการเป้าหมายเงินออมเริ่มต้นและเก็บเป็น Client State
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);

  // 3. สถานะข้อมูลผู้ใช้งานสำหรับแสดงบน Header
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    avatarUrl: string | null;
    email: string | null;
  }>({
    displayName: "สมาชิกพูนพูน",
    avatarUrl: null,
    email: null,
  });

  // คอยอัปเดตข้อมูลจริงใน Base State เมื่อ Promise โหลดเสร็จจากเซิร์ฟเวอร์
  useEffect(() => {
    transactionsPromise.then((data) => {
      setTransactions(data);
      setIsLoading(false);
    });
  }, [transactionsPromise]);

  // คอยอัปเดตข้อมูลจริงของเป้าหมายเงินออมเมื่อ Promise โหลดเสร็จจากเซิร์ฟเวอร์
  useEffect(() => {
    savingGoalsPromise.then((res) => {
      if (res.success && res.data) {
        setSavingGoals(res.data);
      }
      setIsGoalsLoading(false);
    });
  }, [savingGoalsPromise]);

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

  // 4. ระบบ Optimistic Update สำหรับธุรกรรม (Transactions)
  type OptimisticAction =
    | { type: "add"; transaction: Transaction }
    | { type: "delete"; id: string };

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

  // 5. ระบบ Optimistic Update สำหรับเป้าหมายเงินออม (Saving Goals)
  type OptimisticGoalAction =
    | { type: "add"; goal: SavingGoal }
    | { type: "delete"; id: string }
    | { type: "updateAmount"; id: string; amount: number };

  const [optimisticGoals, dispatchOptimisticGoals] = useOptimistic<
    SavingGoal[],
    OptimisticGoalAction
  >(savingGoals, (state, action) => {
    if (action.type === "add") {
      return [...state, action.goal];
    }
    if (action.type === "delete") {
      return state.filter((g) => g.id !== action.id);
    }
    if (action.type === "updateAmount") {
      return state.map((g) => {
        if (g.id === action.id) {
          const newAmount = Number((g.current_amount + action.amount).toFixed(2));
          return { ...g, current_amount: Math.max(0, newAmount) };
        }
        return g;
      });
    }
    return state;
  });

  // คำนวณรายรับ-รายจ่ายรายเดือน จากข้อมูล Optimistic (อัปเดตแบบเรียลไทม์ไม่ต้องรอเซิร์ฟเวอร์)
  const totalIncome = optimisticTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = optimisticTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // จัดการการบันทึกรายการธุรกรรมด้วยสถาปัตยกรรม Optimistic Updates
  const handleAddTransaction = async (newTxData: {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
  }) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        const optimisticTx: Transaction = {
          id: "opt-" + Date.now(),
          ...newTxData,
        };
        dispatchOptimistic({ type: "add", transaction: optimisticTx });

        try {
          const result = await createTransaction(newTxData);
          if (result.success && result.data) {
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

  // จัดการการลบรายการธุรกรรมด้วยสถาปัตยกรรม Optimistic Updates
  const handleDeleteTransaction = async (id: string) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        dispatchOptimistic({ type: "delete", id });

        try {
          const result = await deleteTransaction(id);
          if (result.success) {
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

  // จัดการการสร้างเป้าหมายเงินออมด้วยสถาปัตยกรรม Optimistic Updates
  const handleCreateGoal = async (data: {
    name: string;
    target_amount: number;
    target_date?: string | null;
  }) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        const tempId = "opt-" + Date.now();
        const optGoal: SavingGoal = {
          id: tempId,
          user_id: "temp-user",
          name: data.name,
          target_amount: data.target_amount,
          current_amount: 0,
          target_date: data.target_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dispatchOptimisticGoals({ type: "add", goal: optGoal });

        try {
          const result = await createSavingGoal(data);
          if (result.success && result.data) {
            setSavingGoals((prev) => [...prev, result.data as SavingGoal]);
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: result.error || "เกิดข้อผิดพลาดในการสร้างเป้าหมาย",
            });
          }
        } catch (err) {
          console.error("Optimistic create goal error:", err);
          resolve({
            success: false,
            error: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      });
    });
  };

  // จัดการการอัปเดตยอดเงินในเป้าหมายด้วยสถาปัตยกรรม Optimistic Updates
  const handleUpdateGoalAmount = async (id: string, amount: number) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        dispatchOptimisticGoals({ type: "updateAmount", id, amount });

        try {
          const result = await updateSavingGoalAmount(id, amount);
          if (result.success && result.data) {
            setSavingGoals((prev) =>
              prev.map((g) => (g.id === id ? (result.data as SavingGoal) : g))
            );
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: result.error || "เกิดข้อผิดพลาดในการอัปเดตยอดเงิน",
            });
          }
        } catch (err) {
          console.error("Optimistic update goal error:", err);
          resolve({
            success: false,
            error: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      });
    });
  };

  // จัดการการลบเป้าหมายการเงินด้วยสถาปัตยกรรม Optimistic Updates
  const handleDeleteGoal = async (id: string) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        dispatchOptimisticGoals({ type: "delete", id });

        try {
          const result = await deleteSavingGoal(id);
          if (result.success) {
            setSavingGoals((prev) => prev.filter((g) => g.id !== id));
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: result.error || "เกิดข้อผิดพลาดในการลบเป้าหมาย",
            });
          }
        } catch (err) {
          console.error("Optimistic delete goal error:", err);
          resolve({
            success: false,
            error: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      });
    });
  };

  return {
    userProfile,
    isLoading,
    isGoalsLoading,
    optimisticTransactions,
    optimisticGoals,
    totalIncome,
    totalExpense,
    balance,
    handleAddTransaction,
    handleDeleteTransaction,
    handleCreateGoal,
    handleUpdateGoalAmount,
    handleDeleteGoal,
  };
}
