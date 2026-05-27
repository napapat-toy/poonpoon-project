import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "[Supabase] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

/**
 * Next.js 16 Proxy - Replaces the deprecated middleware convention.
 * Intercepts requests on the server before rendering pages.
 */
export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // ตั้งค่า Supabase Server Client สำหรับใช้ใน Proxy
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    } satisfies CookieMethodsServer,
  });

  // ตรวจสอบความถูกต้องของสิทธิ์ผู้ใช้ (Session Verification)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  // ดักเส้นทางตามสถานะการเข้าสู่ระบบ (Protected Route Gate)
  if (!user && !isAuthPage) {
    // ผู้ใช้ยังไม่ได้ล็อกอินพยายามเข้าหน้าแดชบอร์ด -> ดีดไปหน้า /login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // ผู้ใช้ล็อกอินแล้วพยายามกลับไปหน้า /login -> ดีดไปหน้าแดชบอร์ดหลัก (/)
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * ดักจับการเข้าถึงทุกหน้ายกเว้นหน้าทรัพยากรคงที่ (Static Assets) และรูปไอคอน PWA
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|manifest\\.webmanifest|icon-192\\.png|icon-512\\.png).*)",
  ],
};
