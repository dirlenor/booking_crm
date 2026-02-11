# Sprint 7: Trip Calendar (UI)

## เป้าหมาย
- สร้างหน้า Trip Calendar สำหรับแอดมิน (มุมมองปฏิทินรายเดือน)
- แสดงรายการทริปในแต่ละวัน + แผงรายละเอียดทริปด้านขวา
- ใช้ mock data เท่านั้น (ห้ามเชื่อม backend)

## ขอบเขตงาน
### Calendar View
- ปฏิทินเริ่มสัปดาห์วันจันทร์ (ตามบริบทไทย)
- มุมมองเดือนเป็นค่าเริ่มต้น (Month)
- ไฮไลต์ “วันนี้” ด้วย accent
- คลิกการ์ดทริปเพื่อเปิดรายละเอียดด้านขวา (inline panel)

### Trip Detail Panel (Inline)
- แสดงข้อมูลทริป: แพ็กเกจ, วันเวลา, destination, duration, guide, โควต้า
- รายชื่อผู้จองในทริป + สถานะชำระเงิน
- ปุ่ม Action (UI only): View Details / Print Manifest

## ค่าเริ่มต้นที่เลือก
- Start day: Monday
- Detail panel: inline (ไม่ overlay)
- ไม่มีปุ่ม “Add Customer” ในรอบนี้ (view-only)
- Month navigation ไม่จำกัดช่วง (UI only)

## ไฟล์ที่ต้องสร้าง/แก้ไข
- `app/(dashboard)/trips/page.tsx`
- `components/features/trips/trip-calendar.tsx`
- `components/features/trips/trip-calendar-header.tsx`
- `components/features/trips/trip-calendar-day.tsx`
- `components/features/trips/trip-card.tsx`
- `components/features/trips/trip-detail-panel.tsx`
- `components/features/trips/trip-customer-list.tsx`
- `components/features/trips/trip-status-badge.tsx`
- `lib/mock-data/trips.ts`

## แพทเทิร์นที่ยึดตาม
- Page layout: `app/(dashboard)/bookings/page.tsx`
- Card/Table: `components/ui/card.tsx`, `components/ui/table.tsx`
- Status badge: `components/features/bookings/booking-status-badge.tsx`
- Sidebar layout: `app/(dashboard)/layout.tsx`

## Mock Data (lib/mock-data/trips.ts)
- interface Trip + TripCustomer
- mock data 15-20 ทริป ครอบคลุม 2 เดือน
- fields หลัก: id, packageId, packageName, destination, date, time, duration, participants, maxParticipants, guide, status, customers[]
- payment status: paid / partial / unpaid

## Verification
- เปิดดู `/trips` บน browser
- เก็บ screenshot calendar view + detail panel
- รัน LSP diagnostics ในไฟล์ที่แก้ไข

## ข้อห้าม
- ห้ามเชื่อม backend/API
- ห้ามเพิ่ม dependency ใหม่
- ห้ามใช้ library calendar ภายนอก
