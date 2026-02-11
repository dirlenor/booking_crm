# User Personas — 6CAT Booking CRM

---

## 1. Admin (ผู้ดูแลระบบ)

### Profile
- **Role:** เจ้าของธุรกิจ / ผู้จัดการบริษัททัวร์
- **เป้าหมาย:** มองภาพรวมธุรกิจ ตัดสินใจจากข้อมูล ควบคุมการทำงานทั้งระบบ
- **Tech Comfort:** ปานกลาง — ใช้ระบบได้แต่ไม่อยากเสียเวลาเรียนรู้นาน

### Pain Points
- ไม่มี Dashboard รวมที่เห็นยอดขาย/จอง/ปัญหาในที่เดียว
- ต้องถามทีมทุกครั้งเพื่อรู้สถานะงาน
- ข้อมูลกระจายอยู่ใน Excel, LINE, กระดาษ

### Needs
- Dashboard สรุปยอดขาย, จำนวนจอง, สถานะทริป
- จัดการ User & Permission ของทีม
- ดู Report แพ็กเกจยอดนิยม / รายได้ / ลูกค้าเก่า-ใหม่
- ตั้งค่าระบบ (ช่องทางชำระเงิน, เทมเพลต, แพ็กเกจ)

### Key Screens
Dashboard, Reports, Settings, User Management

---

## 2. Sales Team (ทีมขาย)

### Profile
- **Role:** พนักงานขาย / ทีม Customer Service
- **เป้าหมาย:** ปิดการขายเร็ว ดูแลลูกค้าได้ดี ไม่หลุดรายชื่อ
- **Tech Comfort:** ปานกลาง-สูง — ใช้ LINE, Social Media คล่อง

### Pain Points
- ลืม Follow-up ลูกค้าที่สนใจแต่ยังไม่จอง
- หา History ลูกค้าเก่าไม่เจอ
- สร้าง Quotation / Invoice ช้า ต้องทำมือ
- ไม่รู้โควต้าทัวร์เหลือเท่าไหร่ ต้องถาม Operation

### Needs
- Customer List + ค้นหาเร็ว + ดูประวัติครบ
- สร้าง Booking ใหม่ได้ใน 2-3 คลิก
- เช็คโควต้าแพ็กเกจแบบ Real-time
- สร้าง Quotation / Invoice อัตโนมัติ
- ระบบ Lead Tracking (สนใจ → ติดต่อ → ปิดการขาย)
- แจ้งเตือนงานที่ต้อง Follow-up

### Key Screens
Customer List, Customer Profile, Booking Form, Tour Packages, Payments

---

## 3. Operation Team (ทีมปฏิบัติการ)

### Profile
- **Role:** ทีมจัดทริป / Coordinator / ผู้ประสานงานไกด์-รถ-โรงแรม
- **เป้าหมาย:** จัดทริปไม่พลาด ข้อมูลครบ ทุกอย่างพร้อมก่อนวันเดินทาง
- **Tech Comfort:** ปานกลาง — เน้นใช้งานง่าย ดูข้อมูลจากมือถือได้

### Pain Points
- ข้อมูลลูกค้า/ทริปกระจัดกระจาย
- ไม่รู้จำนวนลูกค้ายืนยันจนกว่าจะถามทีม Sales
- การมอบหมายไกด์/รถ ทำผ่าน LINE ไม่มี Record
- ลืมเตรียมเอกสาร/อุปกรณ์ก่อนวันเดินทาง

### Needs
- Trip Schedule แบบ Calendar View — เห็นทริปทั้งเดือน
- รายละเอียดทริป: จำนวนคน, ไกด์, รถ, โรงแรม, สถานที่
- มอบหมายทรัพยากร (ไกด์, รถ, ทีมงาน) ในระบบ
- Checklist ก่อนวันเดินทาง
- แจ้งเตือนอัตโนมัติ (3 วัน / 1 วันก่อนทริป)
- ดูรายชื่อลูกค้าในแต่ละทริป + เอกสารที่จำเป็น

### Key Screens
Trip Schedule (Calendar), Trip Detail, Resource Assignment, Booking Detail

---

## 4. Customer (ลูกค้า) — Optional / Phase ถัดไป

### Profile
- **Role:** ลูกค้าที่จองทัวร์
- **เป้าหมาย:** เช็คสถานะจอง ดูรายละเอียดทริป ชำระเงินสะดวก
- **Tech Comfort:** ต่ำ-สูง (หลากหลาย) — ต้องใช้ง่ายมาก

### Pain Points
- ไม่รู้สถานะการจองของตัวเอง ต้องถามทาง LINE ซ้ำ
- หาใบเสร็จ/เอกสารไม่เจอ
- อยากรู้กำหนดการทริปแต่ข้อมูลกระจัดกระจาย

### Needs
- หน้าเช็คสถานะจอง (Booking Status Page)
- ดูกำหนดการทริปของตัวเอง
- อัปโหลดเอกสาร (พาสปอร์ต, สลิปโอนเงิน)
- รับแจ้งเตือนก่อนเดินทาง

### Key Screens
Booking Status Page, Trip Itinerary View, Document Upload

### Note
> Customer Portal เป็น Optional — จะพัฒนาหลัง MVP
> ใน Phase แรก ลูกค้าจะถูกจัดการผ่าน Sales Team เป็นหลัก
