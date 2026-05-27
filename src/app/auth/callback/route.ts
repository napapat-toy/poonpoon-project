import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // ถ้าไม่มี code ใน URL → น่าจะมีปัญหาจาก Google/Supabase ดีดไปหน้า Login พร้อม error
  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  // แลกเปลี่ยนตั๋วจาก Google เป็น Session ของ Supabase
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // code หมดอายุ, ถูกใช้ไปแล้ว หรือ token ผิดพลาด → ดีดกลับหน้า Login
    console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(loginUrl);
  }

  // ล็อกอินเสร็จ ดีดกลับหน้าแรก (Dashboard พูนพูน)
  return NextResponse.redirect(requestUrl.origin);
}
