import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import { formatThaiDateShort } from "@/utils/format";

interface TransactionHistoryProps {
  transactions: Transaction[];
  className?: string;
  onDeleteTransaction?: (id: string) => void;
}

export function TransactionHistory({
  transactions,
  className,
  onDeleteTransaction,
}: TransactionHistoryProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between pb-1">
        <h3 className="font-extrabold text-text-dark text-lg">
          ความเคลื่อนไหวล่าสุด
        </h3>
        {transactions.length > 0 && (
          <span className="text-sm text-text-muted font-medium hover:underline cursor-pointer">
            ดูทั้งหมด
          </span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center space-y-2 select-none border border-dashed border-[#F3EFE9] rounded-2xl bg-[#FDFBF7]">
          <span className="text-3xl block animate-bounce">🪙</span>
          <p className="text-sm font-bold text-text-dark">
            เริ่มต้นออมเงินให้พูนพูนกันวันนี้เลย! 🪙
          </p>
          <p className="text-xs text-text-muted">
            บันทึกรายการแรกของคุณด้านบนเพื่อเริ่มสร้างประวัติการเงินร่วมกันนะพูน!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F7F5F0]">
          {transactions.map((item) => {
            const parts = item.category.split(" ");
            const emoji = parts[0];
            const categoryName = parts.slice(1).join(" ");
            
            const displayEmoji = parts.length > 1 ? emoji : (item.type === "income" ? "💸" : "🍰");
            const displayTitle = parts.length > 1 ? categoryName : item.category;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0",
                      item.type === "income" ? "bg-[#E8F5E9]" : "bg-[#FCE4EC]",
                    )}
                  >
                    {displayEmoji}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-text-dark">
                      {displayTitle}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-text-muted font-medium mt-0.5 max-w-[150px] sm:max-w-xs wrap-break-word">
                        &quot;{item.description}&quot;
                      </p>
                    )}
                    <span className="text-xs text-text-muted block mt-0.5" suppressHydrationWarning>
                      {formatThaiDateShort(item.date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <span
                    className={cn(
                      "text-base font-extrabold",
                      item.type === "income" ? "text-[#1B5E20]" : "text-[#880E4F]",
                    )}
                  >
                    {item.type === "income" ? "+" : "-"}฿
                    {item.amount.toLocaleString()}
                  </span>
                  {onDeleteTransaction && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "ต้องการลบรายการนี้ใช่หรือไม่นะพูน? 🪙"
                          )
                        ) {
                          onDeleteTransaction(item.id);
                        }
                      }}
                      disabled={item.id.startsWith("opt-")}
                      className="h-12 w-12 flex items-center justify-center rounded-xl text-text-muted hover:text-[#880E4F] hover:bg-[#FCE4EC]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#880E4F]/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted"
                      aria-label="ลบรายการ"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
