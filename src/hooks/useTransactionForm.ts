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
      return [
        "💰 เงินเดือน/ค่าจ้างประจำ",
        "💼 รายได้อิสระ/ฟรีแลนซ์",
        "🎁 โบนัส/เงินรางวัล",
        "📈 เงินลงทุน/ปันผล",
        "💵 เงินคืน/เงินทอน",
      ];
    }
    return [
      "🍚 อาหาร-มื้อหลัก",
      "☕ เครื่องดื่ม/ของว่าง",
      "🛒 ของใช้ในบ้าน",
      "🏠 ค่าเช่า/ที่พัก",
      "💡 ค่าน้ำ-ไฟ-อินเทอร์เน็ต",
      "🚌 เดินทาง-ประจำวัน",
      "✈️ ท่องเที่ยว/เดินทางไกล",
      "👕 เสื้อผ้า/แฟชั่น",
      "📱 อุปกรณ์/แกดเจ็ต",
      "🏥 ค่าหมอ/ยา",
      "💇 ความงาม/ดูแลตัวเอง",
      "🎓 การศึกษา/คอร์สเรียน",
      "🎮 บันเทิง/เกม",
      "🐾 สัตว์เลี้ยง",
      "🎁 ของขวัญ/เงินช่วยเหลือ",
      "🏦 ผ่อนชำระ/หนี้",
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
          setFeedback({
            success: false,
            message: result.error ?? "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          });
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
