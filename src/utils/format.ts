export const formatThaiDateShort = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return (
    new Intl.DateTimeFormat("th-TH", {
      year: "2-digit", // แสดงปี พ.ศ. แค่สองหลักท้าย เช่น 69
      month: "short", // แสดงชื่อเดือนแบบย่อ เช่น พ.ค.
      day: "numeric", // แสดงวันที่ตัวเลข เช่น 27
      hour: "2-digit", // แสดงชั่วโมง 2 หลัก เช่น 08
      minute: "2-digit", // แสดงนาที 2 หลัก เช่น 30
      hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
    }).format(date) + " น."
  );
};
