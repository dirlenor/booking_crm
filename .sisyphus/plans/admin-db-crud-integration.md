# Admin DB/CRUD Integration Plan

## เป้าหมาย
- เปลี่ยนหน้า Admin จาก mock data → Supabase DB จริง
- ทำให้แสดงผลได้จริง พร้อม CRUD ขั้นต่ำ (read + create/update/delete ที่จำเป็น)
- ทดสอบแต่ละโมดูลบน UI ให้แสดงข้อมูลจริง

## ลำดับโมดูล (แนะนำ)
1) Packages → Trips → Bookings → Payments → Customers → Dashboard summary

เหตุผล: Packages/Trips เป็นแหล่งข้อมูลหลักที่ downstream ใช้ใน Bookings/Payments

## รายละเอียดงานรายโมดูล

### 1) Packages
- **Read**: ดึง `packages` จาก Supabase
- **Detail**: `/packages/[id]` ดึง 1 record
- **Quota display**: ใช้ `max_pax` และคำนวณ `current_pax` จาก bookings (phase ต่อไป)

### 2) Trips
- **Read**: ดึง `trips` + join `packages` เพื่อแสดงชื่อแพ็กเกจ
- **Calendar**: ใช้ data จริงแทน mock

### 3) Bookings
- **Read list**: ดึง `bookings` + join `customers`, `trips`, `packages`
- **Detail**: ดึง 1 booking + passengers + payments
- **Create**: ใช้ form เดิม แต่ POST เข้า Supabase

### 4) Payments
- **Read list**: ดึง `payments` + join booking/customer/package
- **Record**: modal สร้าง payment record ใน DB

### 5) Customers
- **Read list**: ดึง `customers`
- **Profile**: ดึง customer + booking history

### 6) Dashboard
- สร้าง query สรุปยอด (count/sum) จาก DB
- Recent bookings + upcoming trips

## เทคนิคและข้อจำกัด
- ใช้ `@supabase/supabase-js` ฝั่ง client (ไม่มี `@supabase/ssr` ตอนนี้)
- ใช้ state + loading + error ในแต่ละ page
- ไม่แก้โครงสร้าง UI ให้ใหญ่ — เปลี่ยน data source เท่านั้น

## Admin Role / RLS
- ต้องกำหนด `profiles.role = 'admin'` ให้ผู้ใช้ทดสอบ
- ถ้าไม่ตั้ง role จะเห็นเฉพาะข้อมูล public (packages published, trips scheduled)

## Verification
- เปิดแต่ละหน้าและตรวจว่าดึงข้อมูลจริงได้
- ทดสอบ create อย่างน้อย 1 รายการ (เช่น payments หรือ bookings)
- LSP diagnostics ผ่านทุกไฟล์ที่แก้
