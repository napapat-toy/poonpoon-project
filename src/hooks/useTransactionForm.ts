import { useEffect, useState, useTransition } from "react";

interface UseTransactionFormProps {
  onAddTransaction: (transaction: {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Custom hook to manage the transaction form's state and submission logic.
 * Separates presentation (UI) from business logic.
 */
export function useTransactionForm({
  onAddTransaction,
}: UseTransactionFormProps) {
  const [amount, rawSetAmount] = useState("");
  const setAmount = (val: string) => {
    // ดักจับและอนุญาตเฉพาะตัวเลขและทศนิยมไม่เกิน 2 ตำแหน่งเท่านั้น
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      rawSetAmount(val);
    }
  };
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

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
        "🫂 เงินรับจากครอบครัว/คนรู้จัก",
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

    // รวมวันที่จาก Input เข้ากับเวลาปัจจุบันของ Client เพื่อป้องกันปัญหาเวลาเป็น 00:00:00 (เที่ยงคืนตรง)
    const currentTime = new Date().toTimeString().split(" ")[0]; // ได้เป็น "HH:MM:SS"
    const combinedDateTime = new Date(`${date}T${currentTime}`);
    const isoDateString = isNaN(combinedDateTime.getTime())
      ? new Date().toISOString()
      : combinedDateTime.toISOString();

    startTransition(async () => {
      try {
        const result = await onAddTransaction({
          amount: parsedAmount,
          type,
          category,
          date: isoDateString,
          description: description.trim() || undefined,
        });

        if (result.success) {
          setFeedback({
            success: true,
            message: "บันทึกข้อมูลเรียบร้อยแล้วนะพูน! 🎉",
          });
          setAmount("");
          setCategory("");
          setDescription("");
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
    description,
    setDescription,
    isPending,
    feedback,
    getCategories,
    handleTypeChange,
    handleSubmit,
  };
}
