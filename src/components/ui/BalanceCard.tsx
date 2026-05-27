import React from "react";

import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  className?: string;
}

export function BalanceCard({
  balance,
  totalIncome,
  totalExpense,
  className,
}: BalanceCardProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5 text-primary-pastel" />
          เงินออมพูนพูน (ยอดคงเหลือ)
        </span>
        <h2 className="text-3xl font-extrabold text-text-dark tracking-tight">
          ฿
          {balance.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* รายรับประจำเดือน */}
        <div className="bg-pastel-green rounded-2xl p-4 border border-[#E0F2F1] flex flex-col justify-between">
          <span className="text-xs text-[#2E7D32] font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            รายรับเดือนนี้
          </span>
          <span className="text-lg font-bold text-[#1B5E20] mt-2 block">
            +฿{totalIncome.toLocaleString("th-TH")}
          </span>
        </div>

        {/* รายจ่ายประจำเดือน */}
        <div className="bg-pastel-pink rounded-2xl p-4 border border-[#FCE4EC] flex flex-col justify-between">
          <span className="text-xs text-[#C2185B] font-semibold flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            รายจ่ายเดือนนี้
          </span>
          <span className="text-lg font-bold text-[#880E4F] mt-2 block">
            -฿{totalExpense.toLocaleString("th-TH")}
          </span>
        </div>
      </div>
    </Card>
  );
}
