"use client";

import {
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

// แผนผังการกำหนดธีมสีพาสเทลสำหรับแต่ละหมวดหมู่
const CATEGORY_STYLES: Record<
  string,
  { activeClass: string; inactiveClass: string }
> = {
  // ── รายจ่าย ──────────────────────────────────────────────────────────────
  "🍚 อาหาร-มื้อหลัก": {
    activeClass:
      "bg-[#FFE0B2] border-[#FFB74D] text-[#E65100] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFF8E1]",
  },
  "☕ เครื่องดื่ม/ของว่าง": {
    activeClass:
      "bg-[#FFF3E0] border-[#FFCC02] text-[#E65100] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFFDE7]",
  },
  "🛒 ของใช้ในบ้าน": {
    activeClass:
      "bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#F1F8E9]",
  },
  "🏠 ค่าเช่า/ที่พัก": {
    activeClass:
      "bg-[#E3F2FD] border-[#90CAF9] text-[#0D47A1] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E3F2FD]/50",
  },
  "💡 ค่าน้ำ-ไฟ-อินเทอร์เน็ต": {
    activeClass:
      "bg-[#E1F5FE] border-[#4FC3F7] text-[#01579B] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E0F7FA]",
  },
  "🚌 เดินทาง-ประจำวัน": {
    activeClass:
      "bg-[#F3E5F5] border-[#BA68C8] text-[#4A148C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FAEAFF]",
  },
  "✈️ ท่องเที่ยว/เดินทางไกล": {
    activeClass:
      "bg-[#EDE7F6] border-[#9575CD] text-[#311B92] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#EDE7F6]/50",
  },
  "👕 เสื้อผ้า/แฟชั่น": {
    activeClass:
      "bg-[#FCE4EC] border-[#F06292] text-[#880E4F] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFF0F5]",
  },
  "📱 อุปกรณ์/แกดเจ็ต": {
    activeClass:
      "bg-[#E8EAF6] border-[#7986CB] text-[#1A237E] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E8EAF6]/50",
  },
  "🏥 ค่าหมอ/ยา": {
    activeClass:
      "bg-[#FFEBEE] border-[#E57373] text-[#B71C1C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFEBEE]/30",
  },
  "💇 ความงาม/ดูแลตัวเอง": {
    activeClass:
      "bg-[#F8BBD9] border-[#EC407A] text-[#880E4F] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FCE4EC]/30",
  },
  "🎓 การศึกษา/คอร์สเรียน": {
    activeClass:
      "bg-[#E0F2F1] border-[#4DB6AC] text-[#004D40] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E0F2F1]/50",
  },
  "🎮 บันเทิง/เกม": {
    activeClass:
      "bg-[#F9FBE7] border-[#DCE775] text-[#827717] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#F9FBE7]/50",
  },
  "🐾 สัตว์เลี้ยง": {
    activeClass:
      "bg-[#FFF8E1] border-[#FFD54F] text-[#F57F17] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFF8E1]/50",
  },
  "🎁 ของขวัญ/เงินช่วยเหลือ": {
    activeClass:
      "bg-[#FFF9C4] border-[#FFF176] text-[#F9A825] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFFDE7]/30",
  },
  "🏦 ผ่อนชำระ/หนี้": {
    activeClass:
      "bg-[#ECEFF1] border-[#90A4AE] text-[#263238] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#ECEFF1]/50",
  },

  // ── รายรับ ───────────────────────────────────────────────────────────────
  "💰 เงินเดือน/ค่าจ้างประจำ": {
    activeClass:
      "bg-[#E8F5E9] border-[#81C784] text-[#1B5E20] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E8F5E9]/30",
  },
  "💼 รายได้อิสระ/ฟรีแลนซ์": {
    activeClass:
      "bg-[#E0F7FA] border-[#4DD0E1] text-[#006064] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E0F7FA]/30",
  },
  "🎁 โบนัส/เงินรางวัล": {
    activeClass:
      "bg-[#FFFDE7] border-[#FFF176] text-[#F57F17] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFFDE7]/30",
  },
  "📈 เงินลงทุน/ปันผล": {
    activeClass:
      "bg-[#E8F5E9] border-[#66BB6A] text-[#1B5E20] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E8F5E9]/30",
  },
  "🫂 เงินรับจากครอบครัว/คนรู้จัก": {
    activeClass:
      "bg-[#EDE7F6] border-[#D1C4E9] text-[#4A148C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#EDE7F6]/30",
  },
  "💵 เงินคืน/เงินทอน": {
    activeClass:
      "bg-[#E8F5E9] border-[#A5D6A7] text-[#388E3C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E8F5E9]/20",
  },
};

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const {
    amount,
    setAmount,
    type,
    category,
    setCategory,
    date,
    setDate,
    isPending,
    feedback,
    getCategories,
    handleTypeChange,
    handleSubmit,
  } = useTransactionForm({ onAddTransaction });

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[#F5EFE6] pb-3">
        <Sparkles className="h-5 w-5 text-primary-pastel animate-pulse" />
        <h3 className="font-bold text-text-dark text-base">บันทึกรายการด่วน</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* สวิตช์เลือกประเภท (รายรับ / รายจ่าย) */}
        <div className="grid grid-cols-2 gap-2 bg-[#F7F5F0] p-1 rounded-2xl">
          <Button
            type="button"
            variant={type === "income" ? "income" : "ghost"}
            disabled={isPending}
            onClick={() => handleTypeChange("income")}
            className="py-2.5 rounded-xl shadow-none font-semibold text-sm"
          >
            รายรับ 💸
          </Button>
          <Button
            type="button"
            variant={type === "expense" ? "expense" : "ghost"}
            disabled={isPending}
            onClick={() => handleTypeChange("expense")}
            className="py-2.5 rounded-xl shadow-none font-semibold text-sm"
          >
            รายจ่าย 🍰
          </Button>
        </div>

        {/* ช่องกรอกจำนวนเงิน */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted block">
            จำนวนเงิน (บาท)
          </label>
          <Input
            type="number"
            step="1"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            icon={<span className="text-lg font-bold text-text-muted">฿</span>}
            className="py-3 text-lg font-bold"
            required
          />
        </div>

        {/* เลือกหมวดหมู่สำเร็จรูปสีพาสเทลเด่นชัด */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted block">
            เลือกหมวดหมู่
          </label>
          <div className="grid grid-cols-2 gap-2">
            {getCategories().map((cat) => {
              const style = CATEGORY_STYLES[cat] ?? {
                activeClass:
                  "bg-primary-pastel/15 border-primary-pastel text-text-dark font-semibold shadow-sm",
                inactiveClass:
                  "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FDFBF7]",
              };
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  disabled={isPending}
                  className={cn(
                    "py-2.5 px-3 text-xs font-bold rounded-2xl border text-left transition-all duration-200 select-none flex items-center gap-2",
                    category === cat ? style.activeClass : style.inactiveClass,
                  )}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ช่องกรอกวันที่ */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted block">
            วันที่บันทึก
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isPending}
            icon={<Calendar className="h-4 w-4 text-text-muted" />}
            required
          />
        </div>

        {/* ปุ่มบันทึกข้อมูล */}
        <Button
          type="submit"
          variant={type === "income" ? "income" : "expense"}
          isPending={isPending}
          className="w-full py-3.5"
        >
          {!isPending && <Plus className="h-4 w-4 mr-1 shrink-0" />}
          <span>
            {isPending ? "กำลังพูนเงินออม..." : "บันทึกความดีทางการเงิน ✨"}
          </span>
        </Button>
      </form>

      {/* ข้อความฟีดแบ็ก */}
      {feedback && (
        <div
          className={cn(
            "p-3 rounded-2xl flex items-start gap-2 text-xs border",
            feedback.success
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-rose-50 border-rose-100 text-rose-800",
          )}
        >
          {feedback.success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </Card>
  );
}
