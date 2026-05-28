import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // ดึงข้อมูลประวัติรายรับ-รายจ่ายจริงจาก Supabase (กรองรายการที่ถูก Soft Delete ออก)
  const { data: transData, error: transError } = await supabase
    .from("transactions")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  const serverTransactions: Transaction[] =
    !transError && transData ? (transData as Transaction[]) : [];

  return <DashboardClient initialTransactions={serverTransactions} />;
}
