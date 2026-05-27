import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // ถ้าไม่มี code ใน URL → มีปัญหาจาก Google/Supabase ดีดกลับหน้า Login พร้อม error
  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  // สร้าง redirect response ก่อน แล้ว write session cookie ลงตัวนี้โดยตรง
  // (ถ้าสร้าง NextResponse.redirect หลัง exchange แล้ว cookie จะไม่ติดไปกับ response)
  const successRedirect = NextResponse.redirect(requestUrl.origin);

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          successRedirect.cookies.set(name, value, options),
        );
      },
    },
  });

  // แลกเปลี่ยนตั๋วจาก Google เป็น Session ของ Supabase
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // code หมดอายุ, ถูกใช้ไปแล้ว หรือ token ผิดพลาด → ดีดกลับหน้า Login
    console.error(
      "[Auth Callback] exchangeCodeForSession failed:",
      error.message,
    );
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(loginUrl);
  }

  // คืน response ที่มี session cookie พ่วงมาด้วยแล้ว → browser จะ redirect พร้อม session
  return successRedirect;
}
