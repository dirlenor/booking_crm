# Core Booking Workflow — 6CAT Booking CRM

---

## Main Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ลูกค้าสนใจ         สร้าง Booking        ชำระเงิน                  │
│   ┌─────────┐       ┌─────────────┐      ┌──────────┐              │
│   │  LEAD   │──────▶│   PENDING   │─────▶│ CONFIRMED│              │
│   └─────────┘       └─────────────┘      └──────────┘              │
│       │                    │                   │                     │
│       │                    │                   │                     │
│       ▼                    ▼                   ▼                     │
│   ┌─────────┐       ┌─────────────┐      ┌──────────┐              │
│   │  LOST   │       │  CANCELLED  │      │COMPLETED │              │
│   └─────────┘       └─────────────┘      └──────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Workflow Stages

### Stage 1 — Lead / Inquiry (ลูกค้าสนใจ)

**ใครทำ:** Sales Team

| Step | Action | ระบบทำอะไร |
|------|--------|-----------|
| 1.1 | ลูกค้าติดต่อเข้ามา (LINE, โทร, Walk-in) | Sales สร้าง Customer Record |
| 1.2 | สอบถามความสนใจ แพ็กเกจ วันที่ | Sales เปิดดูแพ็กเกจ + เช็คโควต้า |
| 1.3 | ส่ง Quotation / รายละเอียดให้ลูกค้า | (P1) สร้าง Quotation PDF จากระบบ |
| 1.4 | Follow-up ลูกค้า | (P1) ระบบแจ้งเตือน Follow-up |

**Status:** Lead → Contacted → Negotiating

**Exit:**
- ลูกค้าตกลงจอง → ไป Stage 2
- ลูกค้าไม่สนใจ → Mark as Lost

---

### Stage 2 — Booking Created (สร้างการจอง)

**ใครทำ:** Sales Team

| Step | Action | ระบบทำอะไร |
|------|--------|-----------|
| 2.1 | สร้าง Booking ใหม่ | เลือก Customer + Package + จำนวนคน + วันเดินทาง |
| 2.2 | ยืนยันโควต้า | ระบบเช็คโควต้าคงเหลือ → หักอัตโนมัติ |
| 2.3 | Booking ถูกสร้าง | สถานะ = **Pending** (รอชำระเงิน) |

**Status:** Pending

**Exit:**
- ลูกค้าชำระเงิน → ไป Stage 3
- ลูกค้ายกเลิก → Cancelled (คืนโควต้า)

---

### Stage 3 — Payment (ชำระเงิน)

**ใครทำ:** Sales Team / Admin

| Step | Action | ระบบทำอะไร |
|------|--------|-----------|
| 3.1 | ลูกค้าโอนมัดจำ | Sales บันทึกยอดชำระ + แนบสลิป (P1) |
| 3.2 | เช็คยอดชำระ | ระบบคำนวณ: ชำระแล้ว vs ยอดรวม |
| 3.3a | มัดจำเสร็จ | สถานะ Payment = **Partial** |
| 3.3b | จ่ายครบ | สถานะ Payment = **Paid** |
| 3.4 | ยืนยันการจอง | Booking Status เปลี่ยนเป็น **Confirmed** |

**Payment States:**

```
Unpaid ──▶ Partial (มัดจำ) ──▶ Paid (จ่ายครบ)
```

**Exit:**
- จ่ายครบ + ยืนยัน → ไป Stage 4
- ไม่จ่ายตามกำหนด → (P1) แจ้งเตือน / Admin ตัดสินใจยกเลิก

---

### Stage 4 — Trip Preparation (เตรียมทริป)

**ใครทำ:** Operation Team

| Step | Action | ระบบทำอะไร |
|------|--------|-----------|
| 4.1 | ทริปปรากฏใน Trip Schedule | Calendar View แสดงทริปที่ Confirmed |
| 4.2 | มอบหมายทรัพยากร | (P1) Assign ไกด์, รถ, ทีมงาน |
| 4.3 | เตรียมเอกสาร | (P1) Checklist ก่อนวันเดินทาง |
| 4.4 | แจ้งเตือนก่อนทริป | (P1) Notification 3 วัน / 1 วันก่อน |
| 4.5 | ดูรายชื่อลูกค้า | Operation เปิดดูรายชื่อ + ข้อมูลสำคัญ |

**Exit:**
- ถึงวันเดินทาง → ไป Stage 5

---

### Stage 5 — Trip Completed (เสร็จสิ้นทริป)

**ใครทำ:** Operation Team / Admin

| Step | Action | ระบบทำอะไร |
|------|--------|-----------|
| 5.1 | ทริปเสร็จสิ้น | Operation Mark เป็น **Completed** |
| 5.2 | เก็บข้อมูลใน Customer History | ระบบบันทึกลง Customer Profile |
| 5.3 | (P2) Follow-up หลังทริป | ขอ Feedback / เสนอทริปถัดไป |

**Status:** Completed

---

## Booking Status Summary

| Status | ความหมาย | เงื่อนไขเปลี่ยนสถานะ |
|--------|----------|---------------------|
| **Pending** | สร้าง Booking แล้ว รอชำระ | สร้าง Booking สำเร็จ |
| **Confirmed** | ชำระเงินแล้ว ยืนยันแล้ว | ชำระมัดจำ/เต็มจำนวน + Admin/Sales ยืนยัน |
| **Completed** | ทริปเสร็จสิ้น | Operation mark เสร็จ หลังวันเดินทาง |
| **Cancelled** | ยกเลิก | Sales/Admin ยกเลิก → คืนโควต้า |

---

## Payment Status Summary

| Status | ความหมาย |
|--------|----------|
| **Unpaid** | ยังไม่ชำระ |
| **Partial** | ชำระมัดจำแล้ว ยังเหลือยอดค้าง |
| **Paid** | ชำระครบเต็มจำนวน |
| **Refunded** | คืนเงินแล้ว (กรณียกเลิก) |

---

## Data Relationships

```
Customer ──┐
            ├──▶ Booking ──▶ Payment(s)
Package  ──┘        │
                     ▼
                Trip Schedule
                     │
                     ▼
              Resource Assignment
              (Guide, Vehicle, Staff)
```

### Key Rules
1. **1 Customer → หลาย Bookings** ได้
2. **1 Booking → 1 Package + 1 วันเดินทาง**
3. **1 Booking → หลาย Payments** ได้ (มัดจำ + จ่ายส่วนที่เหลือ)
4. **1 Package → หลาย Bookings** (จนกว่าโควต้าเต็ม)
5. **1 Trip Date → หลาย Bookings** รวมกัน = 1 ทริปจริง
6. **เมื่อยกเลิก Booking → คืนโควต้าให้ Package อัตโนมัติ**
