"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleGoogleLogin = () => {
    setFeedback(null);
    const supabase = createClient();

    if (!supabase) {
      setFeedback({
        success: true,
        message: "เข้าสู่ระบบจำลองด้วย Google สำเร็จ! 🪙 (ฐานข้อมูลยังไม่ได้ผูกต่อ)",
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`, // จุดดีดกลับหลังจากล็อกอินสำเร็จ
          },
        });

        if (error) {
          setFeedback({
            success: false,
            message: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sign-in",
          });
        }
      } catch (err) {
        console.error("Google login error:", err);
        setFeedback({
          success: false,
          message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 max-w-sm mx-auto w-full">
      {/* ส่วนต้อนรับด้านบน */}
      <div className="text-center space-y-2 mb-8 select-none">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-[#FDFBF7] border border-[#EAE4DB] shadow-sm text-3xl">
          🪙
        </div>
        <h1 className="text-2xl font-black text-text-dark tracking-tight">
          ยินดีต้อนรับสู่ พูนพูน
        </h1>
        <p className="text-xs text-text-muted">
          บันทึกรายรับ-รายจ่ายและเงินออมกลุ่มร่วมกันอย่างมีความสุข
        </p>
      </div>

      {/* บล็อกล็อกอินด้วย Google */}
      <Card className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#F5EFE6] pb-3">
          <Sparkles className="h-5 w-5 text-primary-pastel animate-pulse" />
          <h2 className="font-bold text-text-dark text-base">
            ลงชื่อเข้าใช้งานระบบ
          </h2>
        </div>

        <p className="text-xs text-text-muted text-center py-1">
          ระบบพูนพูนเปิดสิทธิ์ใช้งานเฉพาะบัญชี Google ของสมาชิกในบ้านเท่านั้น
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          isPending={isPending}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-white border border-[#EAE4DB] hover:bg-[#FDFBF7] text-text-dark font-bold text-sm shadow-sm"
        >
          {!isPending && (
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
          )}
          <span>{isPending ? "กำลังเชื่อมต่อ..." : "เข้าสู่บ้านด้วยบัญชี Google 🪙"}</span>
        </Button>

        {/* กล่องแสดงผลลัพธ์แจ้งเตือน (Feedback Message) */}
        {feedback && (
          <div
            className={cn(
              "p-3 rounded-2xl flex items-start gap-2 text-xs border",
              feedback.success
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
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
    </div>
  );
}
