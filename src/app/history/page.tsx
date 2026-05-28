import { redirect } from "next/navigation";

import { HistoryClient } from "@/components/HistoryClient";
import { Transaction } from "@/types";
import { createClient } from "@/utils/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();

  // ดึงข้อมูลผู้ใช้งานระดับเซิร์ฟเวอร์
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // หากไม่ได้ลงชื่อเข้าใช้งาน ให้ย้ายกลับไปหน้าเข้าสู่ระบบ
  if (!user) {
    redirect("/login");
  }

  // ดึงข้อมูลธุรกรรมทั้งหมดที่ยังไม่ถูกลบ (ไม่กรองวันเวลาเดือนปัจจุบัน เพื่อโชว์ทั้งหมด)
  const { data: transData, error: transError } = await supabase
    .from("transactions")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  const serverTransactions: Transaction[] =
    !transError && transData ? (transData as Transaction[]) : [];

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <HistoryClient initialTransactions={serverTransactions} />
    </div>
  );
}
