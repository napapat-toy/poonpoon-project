import { PieChart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";

interface CategoryChartProps {
  transactions: Transaction[];
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "🍚 อาหาร-มื้อหลัก": "#FFB74D",
  "☕ เครื่องดื่ม/ของว่าง": "#FFCC02",
  "🛒 ของใช้ในบ้าน": "#A5D6A7",
  "🏠 ค่าเช่า/ที่พัก": "#90CAF9",
  "💡 ค่าน้ำ-ไฟ-อินเทอร์เน็ต": "#4FC3F7",
  "🚌 เดินทาง-ประจำวัน": "#BA68C8",
  "✈️ ท่องเที่ยว/เดินทางไกล": "#9575CD",
  "👕 เสื้อผ้า/แฟชั่น": "#F06292",
  "📱 อุปกรณ์/แกดเจ็ต": "#7986CB",
  "🏥 ค่าหมอ/ยา": "#E57373",
  "💇 ความงาม/ดูแลตัวเอง": "#EC407A",
  "🎓 การศึกษา/คอร์สเรียน": "#4DB6AC",
  "🎮 บันเทิง/เกม": "#DCE775",
  "🐾 สัตว์เลี้ยง": "#FFD54F",
  "🎁 ของขวัญ/เงินช่วยเหลือ": "#FFF176",
  "🏦 ผ่อนชำระ/หนี้": "#90A4AE",
};

const DEFAULT_COLOR = "#E6DFD5";

export function CategoryChart({ transactions, className }: CategoryChartProps) {
  // 1. กรองเฉพาะรายการที่เป็นรายจ่าย (expense)
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // 2. จัดกลุ่มรายจ่ายตามหมวดหมู่
  const categoryGroups = expenses.reduce(
    (groups, t) => {
      groups[t.category] = (groups[t.category] || 0) + t.amount;
      return groups;
    },
    {} as Record<string, number>,
  );

  // 3. แปลงกลุ่มรายจ่ายเป็น Array เพื่อใช้จัดอันดับและคำนวณสัดส่วน
  const sortedCategories = Object.entries(categoryGroups)
    .map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category] || DEFAULT_COLOR,
    }))
    .sort((a, b) => b.amount - a.amount); // เรียงลำดับจากจ่ายเยอะสุดไปน้อยสุด

  // จัดกลุ่ม Top 5 + ส่วนที่เหลือรวมเป็น "💸 อื่นๆ"
  const topCategories = sortedCategories.slice(0, 5);
  const otherCategories = sortedCategories.slice(5);

  const categoryData: { category: string; amount: number; color: string }[] = [...topCategories];

  if (otherCategories.length > 0) {
    const otherAmount = otherCategories.reduce((sum, item) => sum + item.amount, 0);
    categoryData.push({
      category: "💸 อื่นๆ",
      amount: otherAmount,
      color: "#ECEFF1", // สีเทาพาสเทลสำหรับกลุ่ม "อื่นๆ"
    });
  }

  // คำนวณสัดส่วนเปอร์เซ็นต์ของแต่ละรายการที่ผ่านการจัดกลุ่มแล้ว
  const categoryDataWithPercentage = categoryData.map((item) => ({
    ...item,
    percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
  }));

  // ฟังก์ชันช่วยเหลือสำหรับแสดงสัดส่วนเปอร์เซ็นต์ ป้องกัน 0% ปลอมของเศษสตางค์
  const renderPercentageText = (percentage: number) => {
    if (percentage > 0 && percentage < 1) {
      return "< 1%";
    }
    return `${percentage.toFixed(1)}%`;
  };

  // คำนวณความยาวเส้นรอบวงของวงกลม Donut Chart (รัศมี r = 40, เส้นรอบวง C = 2 * PI * r ≈ 251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const chartSlices = categoryDataWithPercentage.map((data, index) => {
    const accumulated = categoryDataWithPercentage
      .slice(0, index)
      .reduce((sum, item) => sum + item.percentage, 0);
    const dashLength = (data.percentage / 100) * circumference;
    const strokeOffset = -((accumulated / 100) * circumference);
    return {
      ...data,
      dashLength,
      strokeOffset,
    };
  });

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 border-b border-[#F5EFE6] pb-3">
        <PieChart className="h-5.5 w-5.5 text-primary-pastel" />
        <h3 className="font-extrabold text-text-dark text-lg">
          สัดส่วนรายจ่ายรายหมวดหมู่
        </h3>
      </div>

      {totalExpense === 0 ? (
        // กล่องแจ้งเตือนกรณียังไม่มีประวัติรายจ่าย
        <div className="py-8 text-center space-y-2 select-none">
          <span className="text-4xl block">🦖</span>
          <p className="text-sm font-semibold text-text-dark">
            ยังไม่มีข้อมูลรายจ่ายในระบบ
          </p>
          <p className="text-xs text-text-muted">
            ลองบันทึกรายจ่ายด้านบนเพื่อแสดงกราฟวิเคราะห์นะพูน!
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* ส่วนแสดงผลกราฟ Donut SVG แบบแฮนด์เมดน่ารัก */}
          <div className="relative h-32 w-32 shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform -rotate-90"
            >
              {/* วงกลมพื้นหลัง (Background Circle) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#FDFBF7"
                strokeWidth="12"
              />

              {/* วาดส่วนสัดส่วนของแต่ละหมวดหมู่สะสมต่อกัน */}
              {chartSlices.map((data, index) => {
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={data.color}
                    strokeWidth="12"
                    strokeDasharray={`${data.dashLength} ${circumference}`}
                    strokeDashoffset={data.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}
            </svg>

            {/* ข้อความกลางโดนัท */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                รายจ่ายรวม
              </span>
              <span className="text-base font-black text-text-dark">
                ฿{totalExpense.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ส่วนแสดง Legend รายละเอียดสีพาสเทลและมูลค่า */}
          <div className="flex-1 w-full space-y-2">
            {categoryDataWithPercentage.map((data, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                  <span className="font-semibold text-text-dark">
                    {data.category}
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    ({renderPercentageText(data.percentage)})
                  </span>
                </div>
                <span className="font-bold text-text-dark">
                  ฿{data.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
