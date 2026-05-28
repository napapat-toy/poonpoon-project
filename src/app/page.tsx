export const dynamic = 'force-dynamic';

import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { getSavingGoals } from "@/actions/savingGoals";

export default async function DashboardPage() {
  const supabase = await createClient();

  // คำนวณช่วงเวลาวันที่สำหรับ "เดือนปัจจุบัน" (Current Month) อ้างอิงตามเขตเวลาประเทศไทย (+07:00) เสมอ
  const now = new Date();
  const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = bangkokTime.getUTCFullYear();
  const month = bangkokTime.getUTCMonth(); // 0-indexed (0 = มกราคม, 11 = ธันวาคม)

  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00.000+07:00`;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999+07:00`;

  // ฟังก์ชันดึงข้อมูลแบบ Asynchronous สำหรับส่งต่อเป็น Promise แท้ไปยัง Client Component
  const fetchTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .is("deleted_at", null)
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data as Transaction[];
  };

  const transactionsPromise = fetchTransactions();
  const savingGoalsPromise = getSavingGoals();

  return (
    <DashboardClient
      transactionsPromise={transactionsPromise}
      savingGoalsPromise={savingGoalsPromise}
    />
  );
}
