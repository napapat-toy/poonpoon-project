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
        <span className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-primary-pastel" />
          เงินออมพูนพูน (ยอดคงเหลือ)
        </span>
        <h2 className="text-4xl font-extrabold text-text-dark tracking-tight">
          ฿
          {balance.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* รายรับประจำเดือน */}
        <div className="bg-pastel-green rounded-2xl p-4 border border-[#C8E6C9] flex flex-col justify-between shadow-sm">
          <span className="text-sm text-[#0F3D13] font-bold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            รายรับเดือนนี้
          </span>
          <span className="text-xl font-black text-[#1B5E20] mt-2 block">
            +฿{totalIncome.toLocaleString("th-TH")}
          </span>
        </div>

        {/* รายจ่ายประจำเดือน */}
        <div className="bg-pastel-pink rounded-2xl p-4 border border-[#F8BBD0] flex flex-col justify-between shadow-sm">
          <span className="text-sm text-[#5C062B] font-bold flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4" />
            รายจ่ายเดือนนี้
          </span>
          <span className="text-xl font-black text-[#880E4F] mt-2 block">
            -฿{totalExpense.toLocaleString("th-TH")}
          </span>
        </div>
      </div>
    </Card>
  );
}
