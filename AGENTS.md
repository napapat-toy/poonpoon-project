<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# PoonPoon Project Rules & Guidelines

พูนพูนเป็นโปรเจกต์ Next.js 16 + React 19 + Tailwind CSS v4 + Supabase ที่เน้นความคลีน ความปลอดภัย และประสิทธิภาพสูง โปรดปฏิบัติตามกฎเหล็กเหล่านี้อย่างเคร่งครัดทุกครั้งที่เขียนหรือแก้ไขโค้ด:

### 1. Code Architecture & Component Length (SOLID - SRP)

- **กฎ 250 บรรทัด:** ห้ามปล่อยให้ไฟล์คอมโพเนนต์หน้าบ้าน (UI Component) มีความยาวเกิน 250 บรรทัดเด็ดขาด
- หากตรรกะ (State / Handlers / Optimistic Updates) เริ่มหนาแน่น ให้สกัดออกไปสร้างเป็น Custom Hook ใน `src/hooks/` ทันที
- ไฟล์ UI ต้องทำหน้าที่เพียงแค่แสดงผล (Presentation Layer) และจัดการ Suspense/ErrorBoundary เท่านั้น

### 2. React 19 & Next.js Strict Coding

- **No Unused Imports:** ห้ามมี Unused Imports หรืดตัวแปรที่ประกาศแล้วไม่ได้ใช้งานหลุดรอดเด็ดขาด
- **React 19 JSX Transform:** ห้ามใส่ `import React from "react";` พร่ำเพรื่อในไฟล์ที่มี JSX หากไม่ได้เรียกใช้ตัวแปร React ตรง ๆ
- ใช้สถาปัตยกรรม Streaming Data (Promises ผ่าน Props) คู่กับ React 19 `use()` hook และ `useOptimistic` สำหรับแดชบอร์ดเสมอ

### 3. Tailwind CSS v4 Modern Syntax

- โปรเจกต์นี้ใช้ Tailwind CSS v4 เต็มรูปแบบ
- **Gradients Syntax:** ห้ามใช้ `bg-gradient-to-*` เวอร์ชันเก่า ให้เปลี่ยนมาใช้ **`bg-linear-to-*`** (เช่น `bg-linear-to-r`) เสนอตัวอย่างที่ทันสมัยเสมอ
- รักษาโทนสีพาสเทล มินิมอล นุ่มนวล สบายตา ตามอัตลักษณ์เดิมของแอปพูนพูน

### 4. Security & Anti-IDOR

- ทุก Server Actions ต้องมีการตรวจสอบสิทธิ์ผ่าน `supabase.auth.getUser()` เสมอ
- ห้ามรับ `user_id` จากหน้าบ้าน ให้ดึงจากเซิร์ฟเวอร์โดยตรงเพื่อป้องกันช่องโหว่ IDOR
<!-- END:nextjs-agent-rules -->
