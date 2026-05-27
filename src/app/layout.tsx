import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"], // ลบ "thai" ที่ไม่สนับสนุนใน typings ของ Plus Jakarta Sans ออก
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "พูนพูน (PoonPoon) 🪙 - บันทึกเงินออมและรายจ่ายแสนละมุน",
  description: "แอปบันทึกเงินออมและรายจ่ายสุดน่ารักสำหรับครอบครัวและกลุ่มเพื่อน",
  manifest: "/manifest.json", // เตรียมพร้อมสำหรับ PWA
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
