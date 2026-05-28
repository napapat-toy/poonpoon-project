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
  const categoryData = Object.entries(categoryGroups)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[category] || DEFAULT_COLOR,
    }))
    .sort((a, b) => b.amount - a.amount); // เรียงลำดับจากจ่ายเยอะสุดไปน้อยสุด

  // คำนวณความยาวเส้นรอบวงของวงกลม Donut Chart (รัศมี r = 40, เส้นรอบวง C = 2 * PI * r ≈ 251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const chartSlices = categoryData.map((data, index) => {
    const accumulated = categoryData
      .slice(0, index)
      .reduce((sum, item) => sum + item.percentage, 0);
    const strokeOffset = circumference - (accumulated / 100) * circumference;
    return {
      ...data,
      strokeOffset,
    };
  });

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 border-b border-[#F5EFE6] pb-3">
        <PieChart className="h-5 w-5 text-primary-pastel" />
        <h3 className="font-bold text-text-dark text-base">
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
              className="w-full h-full transform -rotate-95"
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
                    strokeDasharray={circumference}
                    strokeDashoffset={data.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}
            </svg>

            {/* ข้อความกลางโดนัท */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                รายจ่ายรวม
              </span>
              <span className="text-sm font-black text-text-dark">
                ฿{totalExpense.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ส่วนแสดง Legend รายละเอียดสีพาสเทลและมูลค่า */}
          <div className="flex-1 w-full space-y-2">
            {categoryData.map((data, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                  <span className="font-semibold text-text-dark">
                    {data.category}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">
                    ({data.percentage.toFixed(0)}%)
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
