"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { CategoryChart } from "@/components/CategoryChart";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/client";

interface DashboardClientProps {
  initialTransactions: Transaction[];
}

export function DashboardClient({ initialTransactions }: DashboardClientProps) {
  // โหลดรายการธุรกรรมเริ่มต้นจาก Server Component และมาเก็บเป็น Client State
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

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
