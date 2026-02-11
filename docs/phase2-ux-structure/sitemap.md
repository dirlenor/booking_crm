# Sitemap — 6CAT Booking CRM

---

## Application Structure

```
6CAT Booking CRM
│
├── 🔐 Authentication
│   ├── Login
│   └── Forgot Password
│
├── 📊 Dashboard                          ← Landing Page (หลัง Login)
│   ├── Summary Cards (ยอดจอง, รายได้, ทริปใกล้ถึง)
│   ├── Recent Bookings
│   ├── Upcoming Trips
│   └── Quick Actions
│
├── 👥 Customers
│   ├── Customer List                     ← ค้นหา / กรอง / เรียงลำดับ
│   ├── Customer Profile                  ← ดูรายละเอียด + ประวัติจอง
│   │   ├── Info Tab (ข้อมูลส่วนตัว)
│   │   ├── Bookings Tab (ประวัติจอง)
│   │   └── Notes Tab (บันทึก) [P1]
│   ├── Add Customer (Modal/Drawer)
│   └── Edit Customer (Modal/Drawer)
│
├── 🗂️ Tour Packages
│   ├── Package List                      ← แสดงแพ็กเกจทั้งหมด
│   ├── Package Detail                    ← รายละเอียด + โควต้า + Bookings
│   ├── Add Package (Modal/Drawer)
│   └── Edit Package (Modal/Drawer)
│
├── 📋 Bookings
│   ├── Booking List                      ← กรองตามสถานะ / วันที่ / แพ็กเกจ
│   ├── Booking Detail                    ← ข้อมูลจอง + สถานะ + การชำระ
│   ├── Create Booking (Multi-step Form)
│   └── Edit Booking (Modal/Drawer)
│
├── 💳 Payments
│   ├── Payment List                      ← รายการชำระทั้งหมด
│   ├── Payment Detail                    ← รายละเอียดการชำระ
│   └── Record Payment (Modal)            ← บันทึกการชำระใหม่
│
├── 📅 Trip Schedule
│   ├── Calendar View                     ← ภาพรวมทริปทั้งเดือน
│   ├── Trip Detail                       ← รายละเอียดทริป + รายชื่อลูกค้า
│   └── List View (toggle)               ← ดูแบบรายการ
│
└── ⚙️ Settings [P1]
    ├── Company Profile
    ├── User Management
    └── System Preferences
```

---

## Navigation Structure

### Sidebar (Primary Navigation)

```
┌──────────────────────┐
│  🐾 6CAT CRM         │
│                      │
│  📊 Dashboard        │
│  👥 Customers        │
│  🗂️ Tour Packages    │
│  📋 Bookings         │
│  💳 Payments         │
│  📅 Trip Schedule    │
│                      │
│  ─────────────────── │
│  ⚙️ Settings  [P1]   │
│                      │
│  ┌────────────────┐  │
│  │ 👤 User Name   │  │
│  │    Role        │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Header (Secondary Navigation)

```
┌─────────────────────────────────────────────────────────────┐
│  Page Title          🔍 Global Search [P2]    🔔  👤 Avatar │
│  Breadcrumb                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Page Inventory

| # | Page | URL Path | ใครใช้ | Priority |
|---|------|----------|--------|----------|
| 1 | Login | `/login` | All | MVP |
| 2 | Dashboard | `/` | All | MVP |
| 3 | Customer List | `/customers` | Sales, Admin | MVP |
| 4 | Customer Profile | `/customers/:id` | Sales, Admin | MVP |
| 5 | Package List | `/packages` | Sales, Admin | MVP |
| 6 | Package Detail | `/packages/:id` | Sales, Admin, Ops | MVP |
| 7 | Booking List | `/bookings` | Sales, Admin | MVP |
| 8 | Booking Detail | `/bookings/:id` | Sales, Admin, Ops | MVP |
| 9 | Payment List | `/payments` | Sales, Admin | MVP |
| 10 | Trip Schedule | `/trips` | Ops, Admin | MVP |
| 11 | Trip Detail | `/trips/:id` | Ops, Admin | MVP |
| 12 | Settings | `/settings` | Admin | P1 |
| 13 | User Management | `/settings/users` | Admin | P1 |

---

## Modal / Drawer Inventory

| Component | Trigger | Type |
|-----------|---------|------|
| Add Customer | ปุ่ม "Add Customer" ใน Customer List | Drawer (Right) |
| Edit Customer | ปุ่ม Edit ใน Customer Profile | Drawer (Right) |
| Add Package | ปุ่ม "Add Package" ใน Package List | Drawer (Right) |
| Edit Package | ปุ่ม Edit ใน Package Detail | Drawer (Right) |
| Create Booking | ปุ่ม "New Booking" (หลายที่) | Full Page / Multi-step |
| Edit Booking | ปุ่ม Edit ใน Booking Detail | Drawer (Right) |
| Record Payment | ปุ่ม "Record Payment" ใน Booking Detail | Modal (Center) |
| Confirm Cancel | ปุ่ม Cancel Booking | Modal (Center) |
| Delete Confirm | ปุ่มลบทุกที่ | Modal (Center) |
