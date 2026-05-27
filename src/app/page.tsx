import React from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";

// ข้อมูลจำลองตั้งต้นกรณีที่ระบบจำลองยังไม่มีประวัติใน Database (พรีวิวตอนแรกสุด)
const MOCK_INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 1500,
    category: "💰 เงินเดือน",
    date: "2026-05-28",
  },
  {
    id: "2",
    type: "expense",
    amount: 120,
    category: "🍔 อาหาร",
    date: "2026-05-28",
  },
  {
    id: "3",
    type: "expense",
    amount: 350,
    category: "🚗 เดินทาง",
    date: "2026-05-27",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  let serverTransactions: Transaction[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      serverTransactions = data as Transaction[];
    }
  }

  // ใช้ข้อมูลจริงจาก Database หรือใช้ข้อมูลจำลองพรีวิวเพื่อความละมุน
  const finalTransactions =
    serverTransactions.length > 0 ? serverTransactions : MOCK_INITIAL_TRANSACTIONS;

  return <DashboardClient initialTransactions={finalTransactions} />;
}
