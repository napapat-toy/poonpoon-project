import React from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  displayName?: string;
  emoji?: string;
  className?: string;
}

export function DashboardHeader({
  displayName = "พี่ปูพูน",
  emoji = "🦖",
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between py-2", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">🪙</span>
          <h1 className="text-2xl font-bold tracking-tight text-text-dark">
            พูนพูน
          </h1>
          <span className="bg-pastel-pink text-xs text-[#C2185B] px-2 py-0.5 rounded-full font-medium">
            PoonPoon
          </span>
        </div>
        <p className="text-sm text-text-muted">
          ยินดีต้อนรับกลับบ้านนะ,{" "}
          <span className="font-semibold text-text-dark">
            {displayName} {emoji}
          </span>
        </p>
      </div>
      <div className="h-10 w-10 rounded-full bg-[#E6DFD5] border-2 border-white flex items-center justify-center text-lg shadow-sm">
        {emoji}
      </div>
    </header>
  );
}
