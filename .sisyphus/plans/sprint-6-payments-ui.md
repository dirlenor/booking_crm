# Sprint 6: Payments (UI)

## เป้าหมาย
- สร้าง UI หน้า Payments list
- สร้าง Record Payment modal (UI only)
- ใช้ mock data เท่านั้น (ห้ามเชื่อม backend)

## ขอบเขตงาน
### Payments List
- Header: ชื่อหน้า + คำอธิบาย + ปุ่ม Record Payment
- Search/Filter (status, method, date range)
- Table แสดงรายการชำระเงิน + badges

### Record Payment Modal
- ฟอร์มบันทึกการชำระเงิน (amount, method, date, notes)
- แสดงสรุป booking แบบ readonly

## ไฟล์ที่ต้องสร้าง/แก้ไข
- `app/(dashboard)/payments/page.tsx`
- `components/features/payments/payment-search.tsx`
- `components/features/payments/payment-table.tsx`
- `components/features/payments/payment-row.tsx`
- `components/features/payments/payment-status-badge.tsx`
- `components/features/payments/payment-method-badge.tsx`
- `components/features/payments/record-payment-modal.tsx`
- `lib/mock-data/payments.ts`

## แพทเทิร์นที่ยึดตาม
- List layout: `app/(dashboard)/bookings/page.tsx`
- Table: `components/features/bookings/booking-table.tsx`
- Status badge: `components/features/bookings/booking-status-badge.tsx`
- Modal: `components/ui/dialog.tsx`
- Payment layout reference: `components/features/bookings/booking-payment-tab.tsx`

## Mock Data (lib/mock-data/payments.ts)
- interface Payment
- mock data 8-10 รายการ (หลาย method/status)
- ฟิลด์หลัก: id, bookingId, bookingRef, customerName, packageName, amount, date, method, status

## Verification
- เปิดดู `/payments` บน browser
- เก็บ screenshot หน้า list + modal (open state)
- รัน LSP diagnostics ในไฟล์ที่แก้ไข

## ข้อห้าม
- ห้ามเชื่อม backend/API
- ห้ามเพิ่ม dependency ใหม่
- ห้ามทำ payment detail page
