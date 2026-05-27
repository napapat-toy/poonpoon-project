import { useEffect, useState, useTransition } from "react";

import { createTransaction } from "@/actions/transactions";
import { Transaction } from "@/types";

interface UseTransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

/**
 * Custom hook to manage the transaction form's state and submission logic.
 * Separates presentation (UI) from business logic.
 */
export function useTransactionForm({
  onAddTransaction,
}: UseTransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");

  // ป้องกัน Hydration Error: ตั้งค่าเริ่มต้นเป็นค่าว่าง แล้วจึงระบุวันที่ฝั่ง Client ตอนเมาท์คอมโพเนนต์
  const [date, setDate] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDate(new Date().toISOString().split("T")[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const getCategories = () => {
    if (type === "income") {
      return ["💰 เงินเดือน", "🎁 เงินขวัญถุง/โบนัส", "📈 เงินออมงอกเงย"];
    }
    return [
      "🍔 อาหาร",
      "🏠 ค่าน้ำค่าไฟ",
      "🚗 เดินทาง",
      "🛍️ ช้อปปิ้ง",
      "🏥 สุขภาพ",
    ];
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFeedback({
        success: false,
        message: "กรุณาระบุจำนวนเงินที่มากกว่า 0 บาท",
      });
      return;
    }
    if (!category) {
      setFeedback({
        success: false,
        message: "กรุณาเลือกหรือเลือกหมวดหมู่ก่อนบันทึก",
      });
      return;
    }

    setFeedback(null);
    const parsedAmount = Number(amount);

    startTransition(async () => {
      try {
        const result = await createTransaction({
          amount: parsedAmount,
          type,
          category,
          date,
        });

        if (result.success) {
          setFeedback({
            success: true,
            message: "บันทึกข้อมูลเรียบร้อยแล้วนะพูน! 🎉",
          });
          onAddTransaction({
            id: String(Date.now()),
            type,
            amount: parsedAmount,
            category,
            date,
          });
          setAmount("");
          setCategory("");
        } else {
          console.warn(
            "Supabase not connected. Falling back to local state:",
            result.error,
          );
          setFeedback({
            success: true,
            message:
              result.error === "DATABASE_NOT_CONFIGURED"
                ? "บันทึกในเครื่องสำเร็จ! 🪙 (จำลองเนื่องจากยังไม่ได้ผูก Database)"
                : `บันทึกในเครื่องสำเร็จ! 🪙 (พบข้อผิดพลาด: ${result.error})`,
          });
          onAddTransaction({
            id: String(Date.now()),
            type,
            amount: parsedAmount,
            category,
            date,
          });
          setAmount("");
          setCategory("");
        }
      } catch (err) {
        console.error(err);
        setFeedback({
          success: false,
          message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        });
      }
    });
  };

  return {
    amount,
    setAmount,
    type,
    category,
    setCategory,
    date,
    setDate,
    isPending,
    feedback,
    getCategories,
    handleTypeChange,
    handleSubmit,
  };
}
