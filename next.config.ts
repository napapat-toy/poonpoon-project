import withPWAInit from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
  dest: 'public', // โฟลเดอร์ปลายทางสำหรับ Service Worker และ Assets
  disable: process.env.NODE_ENV === 'development', // ปิดการทำงานในโหมด Development
})

const nextConfig: NextConfig = {
  /* ใส่คอนฟิก Next.js อื่นๆ ตรงนี้ได้เลย */
  turbopack: {}, // ป้องกันข้อผิดพลาดของ Turbopack เมื่อใช้ร่วมกับ Custom Webpack plugins ในโหมด Dev
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // รูปโปรไฟล์จาก Google OAuth
      },
    ],
  },
}

export default withPWA(nextConfig)
