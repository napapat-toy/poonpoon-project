"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";

import { loginUser, signupUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();

  // Mode Toggle: true = Login, false = Signup
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Password toggle visibility state
  const [showPassword, setShowPassword] = useState(false);

  // States for handling actions
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleModeChange = () => {
    setIsLoginMode((prev) => !prev);
    setFeedback(null);
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      let result;
      if (isLoginMode) {
        result = await loginUser({ email, password });
      } else {
        result = await signupUser({ email, password, displayName });
      }

      if (result.success) {
        setFeedback({
          success: true,
          message: isLoginMode
            ? "เข้าสู่ระบบสำเร็จ! กำลังพาท่านเข้าสู่หน้าหลัก... 🪙"
            : "ลงทะเบียนสมาชิกใหม่สำเร็จ! กรุณาเข้าสู่ระบบ... 🎉",
        });
        
        // หากเป็นการสมัครสมาชิกสำเร็จ ให้สลับหน้าล็อกอินอัตโนมัติ
        if (!isLoginMode) {
          setTimeout(() => {
            setIsLoginMode(true);
            setFeedback(null);
          }, 2000);
        } else {
          // หากล็อกอินสำเร็จ ให้เด้งกลับหน้าหลัก
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      } else {
        // จัดการกรณีจำลองเมื่อไม่มีข้อมูลในฐานข้อมูล ( DATABASE_NOT_CONFIGURED )
        if (result.error === "DATABASE_NOT_CONFIGURED") {
          setFeedback({
            success: true,
            message: `ลงชื่อเข้าใช้จำลองสำเร็จ! 🪙 (ฐานข้อมูลยังไม่ได้ผูกต่อ)`,
          });
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setFeedback({
            success: false,
            message: result.error || "เกิดข้อผิดพลาดในการลงชื่อเข้าใช้",
          });
        }
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-10 max-w-sm mx-auto w-full">
      {/* ส่วนต้อนรับด้านบน */}
      <div className="text-center space-y-2 mb-8 select-none">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-[#FDFBF7] border border-[#EAE4DB] shadow-sm text-3xl">
          🪙
        </div>
        <h1 className="text-2xl font-black text-text-dark tracking-tight">
          {isLoginMode ? "ยินดีต้อนรับสู่ พูนพูน" : "ร่วมออมกับ พูนพูน"}
        </h1>
        <p className="text-xs text-text-muted">
          {isLoginMode
            ? "บันทึกรายรับ-รายจ่ายและเงินออมกลุ่มร่วมกันอย่างมีความสุข"
            : "สร้างบัญชีใหม่เพื่อตั้งเป้าหมายการเงินกับคนที่คุณรัก"}
        </p>
      </div>

      {/* บล็อกฟอร์ม ล็อกอิน / สมัครสมาชิก */}
      <Card className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#F5EFE6] pb-3">
          <Sparkles className="h-5 w-5 text-primary-pastel animate-pulse" />
          <h2 className="font-bold text-text-dark text-base">
            {isLoginMode ? "เข้าสู่ระบบสมาชิก" : "ลงทะเบียนใหม่"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ส่วนระบุชื่อแสดง - แสดงเฉพาะตอนสมัครสมาชิก */}
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted block">
                ชื่อที่ใช้แสดงในบ้าน
              </label>
              <Input
                type="text"
                placeholder="เช่น พี่ปูพูน, แม่ปลาพูน"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isPending}
                icon={<User className="h-4 w-4" />}
                required
              />
            </div>
          )}

          {/* อีเมล */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted block">
              ที่อยู่อีเมล
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              icon={<Mail className="h-4 w-4" />}
              required
            />
          </div>

          {/* รหัสผ่านพร้อมตัวเปิดตาปิดตาเพื่อผู้สูงอายุ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted block">
              รหัสผ่าน (6 ตัวขึ้นไป)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                icon={<Lock className="h-4 w-4" />}
                className="pr-12"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark focus:outline-none transition-colors py-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* ปุ่มส่งฟอร์ม */}
          <Button
            type="submit"
            variant={isLoginMode ? "primary" : "income"}
            isPending={isPending}
            className="w-full mt-2"
          >
            {isLoginMode ? "เข้าสู่บ้านพูนพูน 🚪" : "สมัครสมาชิกตอนนี้ ✨"}
          </Button>
        </form>

        {/* ปุ่มเปลี่ยนโหมด (สลับล็อกอิน / สมัครสมาชิก) */}
        <div className="text-center pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleModeChange}
            className="text-xs font-semibold text-primary-pastel hover:underline hover:text-opacity-80 transition-all focus:outline-none disabled:opacity-50"
          >
            {isLoginMode
              ? "ยังไม่มีบัญชีใช่ไหม? สมัครสมาชิกที่นี่"
              : "มีบัญชีอยู่แล้ว? กลับหน้าเข้าสู่ระบบ"}
          </button>
        </div>

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
