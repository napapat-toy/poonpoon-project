"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

import { deleteTransaction } from "@/actions/transactions";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Transaction } from "@/types";

interface HistoryClientProps {
  initialTransactions: Transaction[];
}

export function HistoryClient({ initialTransactions }: HistoryClientProps) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [, startTransition] = useTransition();

  type OptimisticAction = { type: "delete"; id: string };

  const [optimisticTransactions, dispatchOptimistic] = useOptimistic<
    Transaction[],
    OptimisticAction
  >(transactions, (state, action) => {
    if (action.type === "delete") {
      return state.filter((tx) => tx.id !== action.id);
    }
    return state;
  });

  const handleDeleteTransaction = async (id: string) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        // 1. ลบรายการแบบ Optimistic ทันทีบนหน้าจอประวัติทั้งหมด
        dispatchOptimistic({ type: "delete", id });

        try {
          // 2. เรียก Server Action ลบข้อมูลจริง (Soft Delete)
          const result = await deleteTransaction(id);
          if (result.success) {
            // 3. หากสำเร็จ อัปเดตข้อมูลจริงใน Base State
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

  return (
    <div className="space-y-6">
      {/* ส่วนหัวหน้าจอประวัติพร้อมปุ่มย้อนกลับ */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-12 w-12 rounded-2xl bg-white border border-[#EAE4DB] flex items-center justify-center text-text-dark hover:bg-[#FDFBF7] transition-all focus:outline-none focus:ring-2 focus:ring-primary-pastel shrink-0 cursor-pointer"
          aria-label="กลับไปหน้าหลัก"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5.5 w-5.5 text-primary-pastel animate-pulse" />
            <h1 className="text-xl font-black text-text-dark">
              ประวัติความเคลื่อนไหวทั้งหมด
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            แสดงรายการบันทึกรายรับ-รายจ่ายทั้งหมดตั้งแต่เริ่มต้นนะพูน! 🪙
          </p>
        </div>
      </div>

      {/* ตารางแสดงประวัติรายการทั้งหมด (ไม่จำกัดจำนวน) */}
      <TransactionHistory
        transactions={optimisticTransactions}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
