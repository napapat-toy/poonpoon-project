export const formatThaiDateShort = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("th-TH", {
    year: "2-digit", // แสดงปี พ.ศ. แค่สองหลักท้าย เช่น 69
    month: "short", // แสดงชื่อเดือนแบบย่อ เช่น พ.ค.
    day: "numeric",
  }).format(date);
};
// ผลลัพธ์บนหน้าจอจะสั้นกระชับน่ารักมาก: "27 พ.ค. 69" เหมาะกับหน้าจอมือถือที่สุดครับ!
