# Sprint 5: Bookings (UI)

## เป้าหมาย
- สร้าง UI หน้า Booking list พร้อมตัวกรองและตาราง
- สร้าง UI หน้า Booking detail พร้อมแท็บข้อมูล/การชำระเงิน
- สร้าง UI หน้า Create Booking แบบ multi-step
- ใช้ mock data เท่านั้น (ห้ามเชื่อม backend)

## ขอบเขตงาน
### Booking List
- Header: ชื่อหน้า + คำอธิบาย + ปุ่ม Create Booking
- Search/Filter (status, payment status, date)
- Table แสดงรายการ booking พร้อม badge สถานะ

### Booking Detail
- Header: booking ref + badge สถานะ + action buttons
- Tabs: Info / Payment
- Info: รายละเอียดการจอง + ลูกค้า + ผู้โดยสาร
- Payment: สรุปยอด + ตารางประวัติชำระเงิน

### Create Booking (Multi-step)
- Step 1: เลือกลูกค้า
- Step 2: เลือกแพ็คเกจ/รอบเดินทาง + จำนวนคน
- Step 3: กรอกผู้โดยสาร
- Step 4: สรุปและยืนยัน

## ไฟล์ที่ต้องสร้าง/แก้ไข
- `app/(dashboard)/bookings/page.tsx`
- `app/(dashboard)/bookings/[id]/page.tsx`
- `app/(dashboard)/bookings/create/page.tsx`
- `components/features/bookings/booking-table.tsx`
- `components/features/bookings/booking-row.tsx`
- `components/features/bookings/booking-search.tsx`
- `components/features/bookings/booking-status-badge.tsx`
- `components/features/bookings/booking-detail-view.tsx`
- `components/features/bookings/booking-detail-header.tsx`
- `components/features/bookings/booking-info-tab.tsx`
- `components/features/bookings/booking-payment-tab.tsx`
- `components/features/bookings/booking-create-form.tsx`
- `components/features/bookings/booking-step-customer.tsx`
- `components/features/bookings/booking-step-package.tsx`
- `components/features/bookings/booking-step-passengers.tsx`
- `components/features/bookings/booking-step-summary.tsx`
- `lib/mock-data/bookings.ts`

## แพทเทิร์นที่ยึดตาม
- List layout: `app/(dashboard)/customers/page.tsx`
- Detail routing: `app/(dashboard)/customers/[id]/page.tsx`
- Table: `components/features/customers/customer-table.tsx`
- Tabs: `components/features/customers/customer-profile-view.tsx`
- Detail layout: `components/features/packages/package-detail-view.tsx`

## Mock Data (lib/mock-data/bookings.ts)
- สร้าง interface Booking + BookingPayment + BookingPassenger
- สร้าง mock data 8-10 รายการ (หลายสถานะ)
- ผูกชื่อแพ็คเกจ/ลูกค้าให้สมจริง

## Verification
- เปิดดู `/bookings`, `/bookings/[id]`, `/bookings/create` บน browser
- เก็บ screenshot ของ list, detail (info/payment), create steps
- รัน LSP diagnostics ในไฟล์ที่แก้ไข

## ข้อห้าม
- ห้ามเชื่อม backend/API
- ห้ามเพิ่ม dependency ใหม่
- ห้ามใส่ logic booking จริง
