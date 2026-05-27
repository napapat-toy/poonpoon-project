import React from "react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import { Card } from "@/components/ui/card";

interface TransactionHistoryProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionHistory({
  transactions,
  className,
}: TransactionHistoryProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between pb-1">
        <h3 className="font-bold text-text-dark text-base">
          ความเคลื่อนไหวล่าสุด
        </h3>
        <span className="text-xs text-text-muted font-medium hover:underline cursor-pointer">
          ดูทั้งหมด
        </span>
      </div>

      <div className="divide-y divide-[#F7F5F0]">
        {transactions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-sm",
                  item.type === "income" ? "bg-[#E8F5E9]" : "bg-[#FCE4EC]"
                )}
              >
                {item.type === "income" ? "💸" : "🍰"}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-dark">
                  {item.category}
                </h4>
                <span className="text-xs text-text-muted block mt-0.5">
                  {item.date}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                item.type === "income" ? "text-[#1B5E20]" : "text-[#880E4F]"
              )}
            >
              {item.type === "income" ? "+" : "-"}฿
              {item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
