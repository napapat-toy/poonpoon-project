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
import { Transaction } from "@/types";

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

// แผนผังการกำหนดธีมสีพาสเทลและประเภทปุ่มเลือกหมวดหมู่ที่เหมาะสม
const CATEGORY_STYLES: Record<
  string,
  {
    activeClass: string;
    inactiveClass: string;
  }
> = {
  "🍔 อาหาร": {
    activeClass:
      "bg-[#FFE0B2] border-[#FFB74D] text-[#E65100] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFF8E1]",
  },
  "🏠 ค่าน้ำค่าไฟ": {
    activeClass:
      "bg-[#E1F5FE] border-[#4FC3F7] text-[#01579B] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E0F7FA]",
  },
  "🚗 เดินทาง": {
    activeClass:
      "bg-[#F3E5F5] border-[#BA68C8] text-[#4A148C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FAEAFF]",
  },
  "🛍️ ช้อปปิ้ง": {
    activeClass:
      "bg-[#FCE4EC] border-[#F06292] text-[#880E4F] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFF0F5]",
  },
  "🏥 สุขภาพ": {
    activeClass:
      "bg-[#FFEBEE] border-[#E57373] text-[#B71C1C] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFEBEE]/30",
  },
  "💰 เงินเดือน": {
    activeClass:
      "bg-[#E8F5E9] border-[#81C784] text-[#1B5E20] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E8F5E9]/30",
  },
  "🎁 เงินขวัญถุง/โบนัส": {
    activeClass:
      "bg-[#FFFDE7] border-[#FFF176] text-[#F57F17] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#FFFDE7]/30",
  },
  "📈 เงินออมงอกเงย": {
    activeClass:
      "bg-[#E0F7FA] border-[#4DD0E1] text-[#006064] font-bold shadow-sm",
    inactiveClass:
      "bg-white border-[#EAE4DB] text-text-muted hover:bg-[#E0F7FA]/30",
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
            step="0.01"
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
              const style = CATEGORY_STYLES[cat] || {
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
