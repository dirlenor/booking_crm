# Feature Priority — 6CAT Booking CRM

---

## Priority Tiers

| Tier | ความหมาย | เป้าหมาย |
|------|----------|----------|
| **P0 — MVP** | ต้องมีก่อนใช้งานจริง | ระบบใช้งานได้ครบ Loop การจองทัวร์ |
| **P1 — Essential** | สำคัญ แต่ทยอยเพิ่มได้ | เพิ่มประสิทธิภาพการทำงานของทีม |
| **P2 — Nice to Have** | ช่วยให้ระบบสมบูรณ์ขึ้น | Scale + Automation |
| **P3 — Future** | แผนระยะยาว | ขยายระบบ / Customer-facing |

---

## P0 — MVP (ต้องมีก่อน Launch)

### Dashboard
- [ ] สรุปยอดจองวันนี้ / สัปดาห์ / เดือน
- [ ] จำนวนทริปที่กำลังจะมาถึง
- [ ] ยอดรายได้รวม
- [ ] Quick Actions (สร้างจอง, เพิ่มลูกค้า)

### Customer Management
- [ ] CRUD ข้อมูลลูกค้า (ชื่อ, เบอร์, email, หมายเหตุ)
- [ ] ค้นหา + กรองลูกค้า
- [ ] Customer Profile — ดูประวัติจองทั้งหมด
- [ ] Tag / Label ลูกค้า (VIP, Corporate, Walk-in)

### Tour Packages
- [ ] CRUD แพ็กเกจทัวร์ (ชื่อ, รายละเอียด, ราคา, จำนวนโควต้า)
- [ ] แสดงโควต้าคงเหลือ
- [ ] สถานะแพ็กเกจ (Active / Inactive / Sold Out)
- [ ] กำหนดช่วงวันเดินทาง

### Booking Management
- [ ] สร้าง Booking ใหม่ (เลือกลูกค้า + แพ็กเกจ + จำนวนคน)
- [ ] Booking Status Workflow: Pending → Confirmed → Completed / Cancelled
- [ ] แก้ไข / ยกเลิกการจอง
- [ ] รายการจองทั้งหมด + Filter ตามสถานะ/วันที่/แพ็กเกจ
- [ ] หักโควต้าอัตโนมัติเมื่อจองสำเร็จ

### Payments
- [ ] บันทึกการชำระเงิน (มัดจำ / จ่ายเต็ม)
- [ ] สถานะการชำระ: Unpaid → Partial → Paid
- [ ] ผูกการชำระกับ Booking
- [ ] ดูยอดค้างชำระของแต่ละ Booking

### Trip Schedule
- [ ] Calendar View — แสดงทริปทั้งหมดในเดือน
- [ ] รายละเอียดทริป (แพ็กเกจ, จำนวนคน, วันเดินทาง)
- [ ] รายชื่อลูกค้าในแต่ละทริป

---

## P1 — Essential (เพิ่มหลัง MVP)

### Customer CRM Enhancement
- [ ] Lead Status Tracking (Lead → Contacted → Negotiating → Won / Lost)
- [ ] บันทึก Notes / Activity Log ต่อลูกค้า
- [ ] Customer Segmentation (กลุ่มลูกค้า: ครอบครัว, คู่รัก, กรุ๊ปทัวร์)
- [ ] ประวัติการติดต่อ (โทร, LINE, Email)

### Payments Enhancement
- [ ] สร้าง Invoice / Quotation PDF
- [ ] แนบสลิปโอนเงิน
- [ ] Payment Reminder (แจ้งเตือนยอดค้าง)

### Trip Operations
- [ ] มอบหมายไกด์ / รถ / ทีมงาน ให้แต่ละทริป
- [ ] Checklist ก่อนวันเดินทาง
- [ ] แจ้งเตือนก่อนทริป (3 วัน / 1 วัน)

### User & Permission
- [ ] เพิ่ม/ลบ User ในระบบ
- [ ] กำหนด Role (Admin / Sales / Operation)
- [ ] Permission ตาม Role

---

## P2 — Nice to Have

### Reports & Analytics
- [ ] รายงานยอดขายรายเดือน / รายปี
- [ ] แพ็กเกจยอดนิยม
- [ ] อัตราการปิดการขาย (Conversion Rate)
- [ ] Export รายงาน CSV / PDF

### Automation
- [ ] แจ้งเตือนอัตโนมัติผ่าน LINE / Email
- [ ] Auto-update Booking Status ตามการชำระเงิน
- [ ] Recurring Trip Template

### UX Polish
- [ ] Drag & Drop จัดทริป
- [ ] Bulk Actions (เลือกหลาย Booking ทำทีเดียว)
- [ ] Global Search (ค้นทุกอย่างในระบบ)
- [ ] Dark Mode

---

## P3 — Future

### Customer Portal
- [ ] ลูกค้าเช็คสถานะจองเอง
- [ ] อัปโหลดเอกสาร (พาสปอร์ต, วีซ่า)
- [ ] ชำระเงินออนไลน์

### Advanced Features
- [ ] Multi-branch Support (หลายสาขา)
- [ ] API สำหรับเชื่อมกับระบบอื่น
- [ ] Mobile App (iOS / Android)
- [ ] AI-powered Recommendation (แนะนำแพ็กเกจให้ลูกค้า)

---

## MVP Scope Summary

```
MVP = Dashboard + Customers + Packages + Bookings + Payments + Trip Schedule
```

> ทำ 6 หน้าจอหลักนี้ให้ UI สวย ใช้งานได้จริง
> แล้วค่อยขยาย Feature ตาม P1 → P2 → P3
