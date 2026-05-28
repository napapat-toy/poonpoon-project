"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface DashboardHeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  email?: string | null;
  className?: string;
}

export function DashboardHeader({
  displayName = "พี่ปูพูน",
  avatarUrl,
  email,
  className,
}: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Refresh router and redirect to login page
      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={cn("relative flex items-center justify-between py-2 z-50", className)}>
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

      {/* Profile picture & Dropdown container */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-pastel"
        >
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
        </button>

        {/* Dropdown Menu - Cute Pastel Style */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EAE4DB] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2.5">
              <p className="text-sm font-bold text-text-dark truncate">
                {displayName}
              </p>
              {email && (
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {email}
                </p>
              )}
            </div>
            
            <hr className="border-t border-[#F5EFE6] my-1" />
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl text-[#880E4F] hover:bg-[#FCE4EC] transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? (
                <div className="h-4 w-4 border-2 border-[#880E4F] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <LogOut className="h-4 w-4 shrink-0" />
              )}
              <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

