import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // ดึงข้อมูลประวัติรายรับ-รายจ่ายจริงจาก Supabase
  const { data: transData, error: transError } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  const serverTransactions: Transaction[] =
    !transError && transData ? (transData as Transaction[]) : [];

  return <DashboardClient initialTransactions={serverTransactions} />;
}
