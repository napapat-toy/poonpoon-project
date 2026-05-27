'use server'

import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

// 1. กำหนด Zod Schema สำหรับตรวจสอบความถูกต้องของข้อมูล
const createTransactionSchema = z.object({
  amount: z
    .number({
      message: 'จำนวนเงินต้องเป็นตัวเลขเท่านั้น',
    })
    .positive('จำนวนเงินต้องมากกว่า 0 บาท')
    .max(9999999999.99, 'จำนวนเงินสูงสุดคือ 9,999,999,999.99 บาท')
    .refine(
      (val) => {
        // ตรวจสอบว่าทศนิยมไม่เกิน 2 ตำแหน่งโดยป้องกันปัญหา Floating Point Precision
        return Number((Math.round(val * 100) / 100).toFixed(2)) === val;
      },
      { message: 'จำนวนเงินรองรับทศนิยมสูงสุด 2 ตำแหน่งเท่านั้น' }
    ),
  type: z.enum(['income', 'expense'], {
    message: 'กรุณาระบุประเภทรายการ (รายรับ/รายจ่าย)',
  }),
  category: z
    .string({
      message: 'กรุณาระบุหมวดหมู่',
    })
    .min(1, 'กรุณาเลือกหรือระบุหมวดหมู่'),
  date: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
})

export type CreateTransactionInput = z.input<typeof createTransactionSchema>

/**
 * Server Action สำหรับการบันทึกรายรับ-รายจ่ายใหม่ลงในตาราง transactions
 * มีการป้องกันความปลอดภัยขั้นสูง (Auth Check, Data Validation, Anti-IDOR, Error Masking)
 */
export async function createTransaction(rawInput: CreateTransactionInput) {
  try {
    // 2. Validate ข้อมูลด้วย Zod
    const validation = createTransactionSchema.safeParse(rawInput)
    if (!validation.success) {
      const errorMessages = validation.error.issues
          .map((issue) => issue.message)
          .join(', ')
      return {
        success: false,
        error: `ข้อมูลไม่ถูกต้อง: ${errorMessages}`,
      }
    }

    const { amount, type, category, date } = validation.data

    // 3. เชื่อมต่อ Supabase Server Client และทำ Auth Check
    const supabase = await createClient()
    if (!supabase) {
      return {
        success: false,
        error: 'DATABASE_NOT_CONFIGURED',
      }
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'สิทธิ์การใช้งานไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      }
    }

    // 4. บันทึกข้อมูลลงฐานข้อมูลโดยใช้ user.id จาก Server (Anti-IDOR)
    const { data, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id, // ดึงจากเซิร์ฟเวอร์โดยตรงเพื่อความปลอดภัย
        type,
        amount,
        category,
        date: date.toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database Error:', dbError)
      // 5. ปิดบังข้อผิดพลาดจริงของฐานข้อมูล (Error Masking) เพื่อความปลอดภัย
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Unhandled Server Action Error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดที่ไม่คาดคิดในการเชื่อมต่อระบบ',
    }
  }
}
