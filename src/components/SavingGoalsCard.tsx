"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SavingGoal } from "@/types";
import { SavingGoalItem } from "@/components/SavingGoalItem";

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
          {goals.map((item) => (
            <SavingGoalItem
              key={item.id}
              item={item}
              onUpdateGoalAmount={onUpdateGoalAmount}
              onDeleteGoal={onDeleteGoal}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// โครงสร้างจำลอง SavingGoalsSkeleton เพื่อล๊อคความสูงป้องกัน Layout Shift (CLS)
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
