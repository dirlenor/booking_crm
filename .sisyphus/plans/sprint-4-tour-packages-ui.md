# Sprint 4: Tour Packages (UI)

## เป้าหมาย
- สร้าง UI หน้ารายการแพ็คเกจทัวร์ (list/grid)
- สร้าง UI หน้ารายละเอียดแพ็คเกจ (detail)
- สร้าง quota display เพื่อแสดงที่นั่งคงเหลือ
- ใช้ mock data เท่านั้น (ห้ามเชื่อม backend)

## ขอบเขตงาน
### หน้ารายการ (List)
- Header: ชื่อหน้า + คำอธิบาย + ปุ่มเพิ่มแพ็คเกจ
- Search/Filter (UI only)
- Grid card แสดงแพ็คเกจ

### หน้ารายละเอียด (Detail)
- Header แสดงชื่อแพ็คเกจ + badge สถานะ + action buttons
- ส่วนข้อมูลหลัก: ราคา, ระยะเวลา, จุดหมาย, วันออกเดินทาง
- Quota display แบบ progress
- Highlights/Itinerary แบบรายการ

## ไฟล์ที่ต้องสร้าง/แก้ไข
- `app/(dashboard)/packages/page.tsx`
- `app/(dashboard)/packages/[id]/page.tsx`
- `components/features/packages/package-card.tsx`
- `components/features/packages/package-grid.tsx`
- `components/features/packages/package-search.tsx`
- `components/features/packages/package-detail-view.tsx`
- `components/features/packages/package-header.tsx`
- `components/features/packages/package-info.tsx`
- `components/features/packages/package-quota-display.tsx`
- `lib/mock-data/packages.ts`

## แพทเทิร์นที่ยึดตาม
- List layout: `app/(dashboard)/customers/page.tsx`
- Detail routing: `app/(dashboard)/customers/[id]/page.tsx`
- Card/Badge/Button: `components/ui/*`
- Detail section layout: `components/features/customers/*`

## Mock Data (lib/mock-data/packages.ts)
- กำหนด interface `TourPackage`
- สร้าง mock data 6-8 รายการ
- ฟิลด์หลัก: id, name, description, destination, duration, price, maxPax, currentPax, departureDate, status, category, highlights

## Verification
- เปิดดูหน้า list และ detail บน browser
- เก็บ screenshot ของ list + detail
- รัน LSP diagnostics ในไฟล์ที่แก้ไข

## ข้อห้าม
- ห้ามเชื่อม backend/API
- ห้ามเพิ่ม dependency ใหม่
- ห้ามสร้าง logic booking จริง
