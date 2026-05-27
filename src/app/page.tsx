import { DashboardClient } from "@/components/DashboardClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  let serverTransactions: Transaction[] = [];

  if (supabase) {
    // ดึงข้อมูลประวัติรายรับ-รายจ่ายจริงจาก Supabase
    const { data: transData, error: transError } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (!transError && transData) {
      serverTransactions = transData as Transaction[];
    }
  }

  return <DashboardClient initialTransactions={serverTransactions} />;
}
