"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, PiggyBank, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SavingGoal } from "@/types";

interface SavingGoalsCardProps {
  goals: SavingGoal[];
  onUpdateGoalAmount: (
    id: string,
    amount: number,
  ) => Promise<{ success: boolean; error?: string }>;
  onCreateGoal: (data: {
    name: string;
    target_amount: number;
    target_date?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
  className?: string;
}

export function SavingGoalsCard({
  goals,
  onUpdateGoalAmount,
  onCreateGoal,
  onDeleteGoal,
  className,
}: SavingGoalsCardProps) {
  // ควบคุมการแสดงผลฟอร์มสร้างเป้าหมายใหม่
  const [isCreating, setIsCreating] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false);

  // ควบคุมการแสดงผลฟอร์ม หยอดกระปุก/ถอนเงิน รายเป้าหมาย
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [actionAmount, setActionAmount] = useState("");
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // ฟอร์แมตวันที่เป้าหมายตามแบบไทย (พ.ศ.) แบบไม่มีส่วนของเวลา
  const formatTargetDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        calendar: "buddhist",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // จัดการการสร้างเป้าหมายการเงิน
  const handleCreateGoal = async () => {
    if (!newGoalName.trim()) {
      setCreateError("กรุณาระบุชื่อเป้าหมายเงินออมนะพูน");
      return;
    }
    const targetVal = parseFloat(newGoalTarget);
    if (isNaN(targetVal) || targetVal <= 0) {
      setCreateError("กรุณาระบุยอดเงินเป้าหมายที่ถูกต้อง (ต้องมากกว่า 0 บาท)");
      return;
    }

    setCreateError("");
    setIsCreatingSubmitting(true);
    const result = await onCreateGoal({
      name: newGoalName.trim(),
      target_amount: targetVal,
      target_date: newGoalDate || null,
    });
    setIsCreatingSubmitting(false);

    if (result.success) {
      setIsCreating(false);
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalDate("");
    } else {
      setCreateError(result.error || "เกิดข้อผิดพลาดในการสร้างเป้าหมาย");
    }
  };

  // จัดการหยอดกระปุก / ถอนเงิน
  const handleUpdateAmount = async (id: string, isDeposit: boolean) => {
    const amountVal = parseFloat(actionAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("กรุณาระบุจำนวนเงินที่ถูกต้องและมากกว่า 0 บาทนะพูน");
      return;
    }

    setIsActionSubmitting(true);
    // ถ้าเป็นการถอนเงิน ให้ส่งค่าติดลบเข้าไป
    const changeAmount = isDeposit ? amountVal : -amountVal;
    const result = await onUpdateGoalAmount(id, changeAmount);
    setIsActionSubmitting(false);

    if (result.success) {
      setActiveGoalId(null);
      setActionAmount("");
    } else {
      alert(result.error || "ไม่สามารถอัปเดตยอดเงินได้นะพูน");
    }
  };

  // จัดการการลบเป้าหมายการเงิน
  const handleDeleteGoal = async (id: string, name: string) => {
    if (window.confirm(`ต้องการลบเป้าหมาย "${name}" ใช่หรือไม่นะพูน? 🪙`)) {
      const result = await onDeleteGoal(id);
      if (!result.success) {
        alert(result.error || "ไม่สามารถลบเป้าหมายได้นะพูน");
      }
    }
  };

  return (
    <Card className={cn("space-y-4", className)}>
      {/* ส่วนหัวของการ์ด */}
      <div className="flex items-center justify-between pb-1 border-b border-[#F7F5F0]">
        <h3 className="font-extrabold text-text-dark text-lg flex items-center gap-2">
          <span>🎯</span> เป้าหมายการเงิน
        </h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#81C784] hover:bg-[#E8F5E9] hover:text-[#66BB6A] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#81C784]/30"
          >
            <Plus className="h-4 w-4" /> เพิ่มเป้าหมาย
          </button>
        )}
      </div>

      {/* ฟอร์มสร้างเป้าหมายใหม่ */}
      {isCreating && (
        <div className="p-4 bg-[#FDFBF7] border border-dashed border-[#EAE4DB] rounded-3xl space-y-3 animate-fadeIn">
          <h4 className="text-sm font-bold text-text-dark flex items-center gap-1.5">
            <span>🎯</span> สร้างเป้าหมายใหม่
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                ชื่อเป้าหมาย
              </label>
              <input
                type="text"
                placeholder="เช่น ไปเที่ยวญี่ปุ่น, ซื้อคอนโด..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#EAE4DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EAE4DB] font-medium text-text-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                ยอดเป้าหมาย (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="เช่น 10000"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#EAE4DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EAE4DB] font-medium text-text-dark"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-muted mb-1">
                วันที่ต้องการสำเร็จ (ไม่บังคับ)
              </label>
              <input
                type="date"
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#EAE4DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EAE4DB] font-medium text-text-dark"
              />
            </div>
          </div>
          {createError && (
            <p className="text-xs text-[#E53935] font-bold">{createError}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewGoalName("");
                setNewGoalTarget("");
                setNewGoalDate("");
                setCreateError("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleCreateGoal}
              disabled={isCreatingSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#81C784] hover:bg-[#66BB6A] transition-colors cursor-pointer disabled:opacity-50"
            >
              สร้างเป้าหมาย 🎯
            </button>
          </div>
        </div>
      )}

      {/* รายการเป้าหมายออมเงิน */}
      {goals.length === 0 ? (
        <div className="py-6 text-center space-y-2 select-none border border-dashed border-[#F3EFE9] rounded-2xl bg-[#FDFBF7]">
          <span className="text-2xl block animate-bounce">🎯</span>
          <p className="text-sm font-bold text-text-dark">
            ยังไม่มีเป้าหมายเงินออมเลยนะพูน
          </p>
          <p className="text-xs text-text-muted px-4">
            ลองตั้งเป้าหมายทางการเงินแรกของคุณเพื่อสร้างวินัยการออมที่ดีกันเถอะ!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((item) => {
            const percentage = Math.min(
              100,
              Math.max(
                0,
                Math.round((item.current_amount / item.target_amount) * 100),
              ),
            );

            // คำนวณสีโทนพาสเทลตามเปอร์เซ็นต์ความสำเร็จ
            let progressGradient = "from-[#FFB74D] to-[#FFA726]"; // สีส้ม
            let textProgressColor = "text-[#E65100]";
            let bgFillColor = "bg-[#FFE0B2]/30";
            if (percentage >= 100) {
              progressGradient = "from-[#81C784] to-[#66BB6A]"; // สีเขียวสำเร็จ
              textProgressColor = "text-[#2E7D32]";
              bgFillColor = "bg-[#E8F5E9]/50";
            } else if (percentage < 30) {
              progressGradient = "from-[#FF8A80] to-[#FF5252]"; // สีแดงช่วงเริ่มต้น
              textProgressColor = "text-[#C62828]";
              bgFillColor = "bg-[#FFEBEE]/40";
            }

            const isActionActive = activeGoalId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 border border-[#F7F5F0] rounded-2xl space-y-2.5 transition-all",
                  bgFillColor,
                  percentage >= 100 && "border-[#E8F5E9]",
                )}
              >
                {/* หัวข้อย่อยของเป้าหมาย */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-text-dark flex items-center gap-1">
                      <span>✨</span> {item.name}
                    </h4>
                    {item.target_date && (
                      <span className="text-xs text-text-muted font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> สิ้นสุด:{" "}
                        {formatTargetDate(item.target_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-extrabold text-text-dark">
                      ฿
                      {item.current_amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-text-muted font-medium">
                      /
                    </span>
                    <span className="text-xs font-bold text-text-muted">
                      ฿
                      {item.target_amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* แถบ Progress Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-[#F7F5F0] rounded-full overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full bg-linear-to-r transition-all duration-700 ease-out",
                        progressGradient,
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={textProgressColor}>
                      {percentage}% ของเป้าหมาย
                    </span>
                    {percentage >= 100 && (
                      <span className="text-[#2E7D32] animate-bounce">
                        ยินดีด้วยนะพูน! สำเร็จแล้ว 🌟
                      </span>
                    )}
                  </div>
                </div>

                {/* เมนูการจัดการและปุ่มดำเนินการ */}
                <div className="flex justify-between items-center pt-1 border-t border-[#F7F5F0]/50">
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(item.id, item.name)}
                    className="p-1.5 text-text-muted hover:text-[#880E4F] hover:bg-[#FCE4EC]/50 rounded-xl transition-all cursor-pointer"
                    aria-label="ลบเป้าหมาย"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {!isActionActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGoalId(item.id);
                        setActionAmount("");
                      }}
                      className="flex items-center gap-1 text-[11px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <PiggyBank className="h-3.5 w-3.5" /> จัดการยอดเงิน 🪙
                    </button>
                  )}
                </div>

                {/* แผงขยายสำหรับ หยอดกระปุก / ถอนเงิน */}
                {isActionActive && (
                  <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 bg-[#FDFBF7] p-3 rounded-2xl border border-[#F3EFE9] animate-fadeIn">
                    <div className="relative w-full sm:w-auto flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
                        ฿
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="ระบุจำนวนเงิน..."
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-[#EAE4DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#81C784]/30 font-bold text-text-dark"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleUpdateAmount(item.id, true)}
                        disabled={isActionSubmitting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#81C784] hover:bg-[#66BB6A] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <PiggyBank className="h-3.5 w-3.5" /> หยอด
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAmount(item.id, false)}
                        disabled={isActionSubmitting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF8A80] hover:bg-[#FF5252] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> ถอน
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGoalId(null);
                          setActionAmount("");
                        }}
                        className="px-2 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:bg-[#F7F5F0] transition-all cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// 3. โครงสร้างจำลอง SavingGoalsSkeleton เพื่อล๊อคความสูงป้องกัน Layout Shift (CLS)
export function SavingGoalsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("space-y-4 animate-pulse", className)}>
      <div className="flex items-center justify-between pb-1 border-b border-[#F7F5F0]">
        <div className="h-7 w-36 bg-[#EAE4DB] rounded-md" />
        <div className="h-6 w-24 bg-[#EAE4DB]/60 rounded-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="p-4 border border-[#F7F5F0] rounded-2xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1 max-w-[150px] sm:max-w-xs">
                <div className="h-4.5 w-32 bg-[#EAE4DB] rounded-md" />
                <div className="h-3 w-20 bg-[#EAE4DB]/50 rounded-md" />
              </div>
              <div className="h-4.5 w-24 bg-[#EAE4DB] rounded-md shrink-0" />
            </div>
            <div className="h-3 w-full bg-[#EAE4DB]/50 rounded-full" />
            <div className="flex justify-between items-center">
              <div className="h-4 w-12 bg-[#EAE4DB]/35 rounded-md" />
              <div className="h-7 w-28 bg-[#EAE4DB]/60 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
