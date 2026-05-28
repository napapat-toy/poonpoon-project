import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // คำนวณช่วงเวลาวันที่สำหรับ "เดือนปัจจุบัน" (Current Month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  // ดึงข้อมูลประวัติรายรับ-รายจ่ายจริงจาก Supabase เฉพาะของเดือนปัจจุบัน (กรองรายการที่ถูก Soft Delete ออก)
  const { data: transData, error: transError } = await supabase
    .from("transactions")
    .select("*")
    .is("deleted_at", null)
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date", { ascending: false });

  const serverTransactions: Transaction[] =
    !transError && transData ? (transData as Transaction[]) : [];

  return <DashboardClient initialTransactions={serverTransactions} />;
}
