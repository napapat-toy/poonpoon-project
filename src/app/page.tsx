import React from "react";

import { DashboardClient } from "@/components/DashboardClient";
import { Transaction, SavingGoal } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  let serverTransactions: Transaction[] = [];
  let serverSavingGoals: SavingGoal[] = [];

  if (supabase) {
    // 1. ดึงข้อมูลประวัติรายรับ-รายจ่ายจริงจาก Supabase
    const { data: transData, error: transError } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (!transError && transData) {
      serverTransactions = transData as Transaction[];
    }

    // 2. ดึงข้อมูลเป้าหมายการเงินจริงจาก Supabase
    const { data: goalsData, error: goalsError } = await supabase
      .from("saving_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!goalsError && goalsData) {
      serverSavingGoals = goalsData as SavingGoal[];
    }
  }

  return (
    <DashboardClient
      initialTransactions={serverTransactions}
      initialSavingGoals={serverSavingGoals}
    />
  );
}
