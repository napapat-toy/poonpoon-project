'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { SavingGoal } from '@/types'

// 1. กำหนด Zod Schema สำหรับการบันทึกเป้าหมายใหม่
const createSavingGoalSchema = z.object({
  name: z
    .string({
      message: 'กรุณาระบุชื่อเป้าหมายเงินออม',
    })
    .min(1, 'ชื่อเป้าหมายต้องมีอย่างน้อย 1 ตัวอักษร')
    .max(80, 'ชื่อเป้าหมายต้องไม่เกิน 80 ตัวอักษร')
    .transform((val) => val.trim()),
  target_amount: z
    .number({
      message: 'จำนวนเงินเป้าหมายต้องเป็นตัวเลขเท่านั้น',
    })
    .positive('จำนวนเงินเป้าหมายต้องมากกว่า 0 บาท')
    .max(9999999999.99, 'จำนวนเงินสูงสุดคือ 9,999,999,999.99 บาท')
    .refine(
      (val) => Number((Math.round(val * 100) / 100).toFixed(2)) === val,
      { message: 'จำนวนเงินเป้าหมายรองรับทศนิยมสูงสุด 2 ตำแหน่งเท่านั้น' }
    ),
  target_date: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
})

export type CreateSavingGoalInput = z.input<typeof createSavingGoalSchema>

/**
 * ดึงข้อมูลรายการเป้าหมายเงินออมทั้งหมดของผู้ใช้ปัจจุบัน
 */
export async function getSavingGoals() {
  try {
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

    const { data, error: dbError } = await supabase
      .from('saving_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (dbError) {
      console.error('Fetch Saving Goals Error:', dbError)
      return {
        success: false,
        error: 'ไม่สามารถดึงข้อมูลเป้าหมายเงินออมได้นะพูน',
      }
    }

    return {
      success: true,
      data: data as SavingGoal[],
    }
  } catch (error) {
    console.error('Unhandled Fetch Saving Goals Error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
    }
  }
}

/**
 * สร้างเป้าหมายเงินออมชิ้นใหม่
 */
export async function createSavingGoal(rawInput: CreateSavingGoalInput) {
  try {
    const validation = createSavingGoalSchema.safeParse(rawInput)
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => issue.message)
        .join(', ')
      return {
        success: false,
        error: `ข้อมูลไม่ถูกต้อง: ${errorMessages}`,
      }
    }

    const { name, target_amount, target_date } = validation.data

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

    const { data, error: dbError } = await supabase
      .from('saving_goals')
      .insert({
        user_id: user.id, // ดึงจากเซิร์ฟเวอร์โดยตรงเพื่อป้องกัน IDOR
        name,
        target_amount,
        current_amount: 0, // เริ่มต้นเป้าหมายใหม่ด้วยยอดเงิน 0 บาท
        target_date,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Create Saving Goal Error:', dbError)
      return {
        success: false,
        error: 'ไม่สามารถสร้างเป้าหมายเงินออมได้ กรุณาลองใหม่อีกครั้งนะพูน',
      }
    }

    return {
      success: true,
      data: data as SavingGoal,
    }
  } catch (error) {
    console.error('Unhandled Create Saving Goal Error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
    }
  }
}

/**
 * อัปเดตจำนวนเงินออมในเป้าหมาย (ฝากเงินเพิ่ม / ถอนเงินออก)
 * @param id ID ของเป้าหมายเงินออม
 * @param amount จำนวนเงินที่จะเปลี่ยนแปลง (ค่าบวกคือการหยอดกระปุก, ค่าลบคือการถอนออก)
 */
export async function updateSavingGoalAmount(id: string, amount: number) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'กรุณาระบุ ID ของเป้าหมายที่ต้องการอัปเดต',
      }
    }

    if (isNaN(amount) || amount === 0) {
      return {
        success: false,
        error: 'จำนวนเงินฝากหรือถอนต้องไม่เท่ากับศูนย์นะพูน',
      }
    }

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

    // 1. ดึงเป้าหมายเงินออมปัจจุบันมาตรวจสอบยอดเพื่อความถูกต้อง (ป้องกันการติดลบ)
    const { data: goal, error: fetchError } = await supabase
      .from('saving_goals')
      .select('current_amount, target_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !goal) {
      return {
        success: false,
        error: 'ไม่พบเป้าหมายการเงินนี้ หรือไม่มีสิทธิ์เข้าถึงนะพูน',
      }
    }

    // 2. คำนวณและปัดทศนิยมให้ถูกต้องตามมาตรฐานการเงิน
    const current = Number(goal.current_amount)
    const rawNewAmount = current + amount
    const newAmount = Number((Math.round(rawNewAmount * 100) / 100).toFixed(2))

    if (newAmount < 0) {
      return {
        success: false,
        error: `ไม่สามารถถอนเงินได้นะพูน ยอดปัจจุบันคือ ฿${current.toLocaleString()} แต่คุณต้องการถอน ฿${Math.abs(amount).toLocaleString()}`,
      }
    }

    // 3. บันทึกยอดเงินใหม่ลงในฐานข้อมูล
    const { data, error: updateError } = await supabase
      .from('saving_goals')
      .update({
        current_amount: newAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // บังคับ user_id ป้องกัน IDOR
      .select()
      .single()

    if (updateError) {
      console.error('Update Saving Goal Error:', updateError)
      return {
        success: false,
        error: 'ไม่สามารถทำรายการอัปเดตยอดเงินได้นะพูน',
      }
    }

    return {
      success: true,
      data: data as SavingGoal,
    }
  } catch (error) {
    console.error('Unhandled Update Saving Goal Error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
    }
  }
}

/**
 * ลบเป้าหมายเงินออมออกจากฐานข้อมูล
 */
export async function deleteSavingGoal(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'กรุณาระบุ ID ของเป้าหมายเงินออมที่ต้องการลบ',
      }
    }

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

    // ลบเป้าหมายการเงินโดยระบุ user_id ป้องกันช่องโหว่ IDOR
    const { error: dbError } = await supabase
      .from('saving_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Delete Saving Goal Error:', dbError)
      return {
        success: false,
        error: 'ไม่สามารถลบเป้าหมายเงินออมได้นะพูน',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unhandled Delete Saving Goal Error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
    }
  }
}
