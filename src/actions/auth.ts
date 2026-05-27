'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

const loginSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
})

const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, 'กรุณาระบุชื่อที่แสดงในบ้าน'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>

/**
 * Server Action สำหรับการลงชื่อเข้าใช้งาน (Login)
 */
export async function loginUser(input: LoginInput) {
  try {
    const validation = loginSchema.safeParse(input)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((i) => i.message).join(', ')
      return { success: false, error: errorMessages }
    }

    const { email, password } = validation.data
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'DATABASE_NOT_CONFIGURED' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Login Error:', err)
    return { success: false, error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง' }
  }
}

/**
 * Server Action สำหรับการลงทะเบียนสมาชิกใหม่ (Register)
 */
export async function signupUser(input: SignupInput) {
  try {
    const validation = signupSchema.safeParse(input)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((i) => i.message).join(', ')
      return { success: false, error: errorMessages }
    }

    const { email, password, displayName } = validation.data
    const supabase = await createClient()
    if (!supabase) {
      return { success: false, error: 'DATABASE_NOT_CONFIGURED' }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Signup Error:', err)
    return { success: false, error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง' }
  }
}
