import Image from "next/image";

import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  className?: string;
}

export function DashboardHeader({
  displayName = "พี่ปูพูน",
  avatarUrl,
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
          <span className="font-semibold text-text-dark">{displayName}</span>
        </p>
      </div>

      {/* รูปโปรไฟล์ผู้ใช้ — ถ้ามี avatarUrl ใช้รูปจริง ถ้าไม่มีใช้ตัวอักษรแรกของชื่อแทน */}
      <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName ?? "โปรไฟล์"}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-[#E6DFD5] flex items-center justify-center text-lg font-bold text-text-dark">
            {displayName?.[0]?.toUpperCase() ?? "🪙"}
          </div>
        )}
      </div>
    </header>
  );
}
