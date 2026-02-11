# AGENTS.md — 6CAT Booking CRM

> **Project Guide for OhMyOpenCode Agents**  
> **Philosophy: UI/UX First, Functionality Second**

---

## 🎯 Project Vision

6CAT Booking CRM เป็นระบบจัดการการจองทัวร์สำหรับบริษัททัวร์ ที่ต้องดูและรู้สึกเหมือน Premium SaaS Product (แนว Notion + Stripe + HubSpot)

### ⚠️ CRITICAL RULES (ห้ามฝ่าฝืนเด็ดขาด)

```
┌─────────────────────────────────────────────────────────────┐
│  1. UI ต้องสวยก่อน ฟังก์ชันค่อยทำทีหลัง                      │
│  2. วางแผนก่อนลงมือทำเสมอ — ถ้าไม่แน่ใจให้ถามก่อน          │
│  3. ห้ามแตะ Backend/API จนกว่า UI จะ pixel-perfect          │
│  4. ทุกหน้าต้องดูดีบน browser ก่อนเริ่มงานถัดไป             │
│  5. ใช้หลาย skills ทำงานร่วมกันเสมอ                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Development Philosophy

### "Design-Led Development"

```
┌─────────────────────────────────────────────────────────┐
│  UI/UX First  →  Visual Polish  →  Functionality       │
│  (สร้าง UI)      (ปรับให้สวย)      (เชื่อมต่อระบบ)      │
└─────────────────────────────────────────────────────────┘
```

**Rule #1:** ห้ามเชื่อมต่อ Backend/API จนกว่า UI จะ pixel-perfect  
**Rule #2:** ทุกหน้าต้องดูดีบน browser ก่อนเริ่มงานถัดไป  
**Rule #3:** วางแผนก่อนลงมือทำเสมอ — ถ้าไม่แน่ใจให้ถามก่อน

---

## 📋 MVP Scope (Phase 4: Build)

### Core Modules (6 หน้าจอ)

| Module | Screens | Priority |
|--------|---------|----------|
| **Dashboard** | Summary cards, Recent bookings, Quick actions | P0 |
| **Customers** | List view, Profile (Info + Bookings tabs) | P0 |
| **Tour Packages** | Package cards, Detail view, Quota display | P0 |
| **Bookings** | Booking list, Create form, Detail view | P0 |
| **Payments** | Payment list, Record modal | P0 |
| **Trip Schedule** | Calendar view, Trip detail | P0 |

---

## 🎨 Design System

### Colors
- **Primary:** Midnight Blue (`#1e3a5f`)
- **Accent:** Cat Orange (`#f97316`)
- **Neutral:** Soft Gray (`#f3f4f6`)
- **Semantic:** Green (success), Amber (warning), Red (error), Blue (info)

### Typography
- **Heading/Body:** Inter
- **Thai Support:** Prompt

### Components
- **Buttons:** 44-48px height, 14-16px radius
- **Cards:** White bg, soft shadow, 20-24px padding, 16-20px radius
- **Inputs:** 44-48px height, visible focus ring
- **Tables:** Generous spacing, hover highlight, minimal gridlines

---

## 🤖 Agent Collaboration Model

### Multi-Skill Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Project Workflow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. PLAN (Metis/Momus)                                      │
│     └─ วางแผน → ทบทวนแผน → ยืนยันแผน                       │
│                                                             │
│  2. DESIGN (Frontend-UI-UX)                                 │
│     └─ สร้าง UI components → ปรับให้สวย → Screenshot       │
│                                                             │
│  3. VERIFY (Playwright/Dev-Browser)                         │
│     └─ เปิด browser → ตรวจสอบ UI → แคปหน้าจอ              │
│                                                             │
│  4. SCHEMA (Database-Schema-Designer)                       │
│     └─ ออกแบบ DB schema → รีวิว → ยืนยัน                   │
│                                                             │
│  5. CONNECT (Supabase-Postgres-Best-Practices)              │
│     └─ สร้าง tables → RLS policies → Migrations            │
│                                                             │
│  6. INTEGRATE (Frontend + Backend)                          │
│     └─ เชื่อม UI กับ API → เทส → รีวิว                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Skill Assignments

| Skill | Role | When to Use |
|-------|------|-------------|
| `metis` | Pre-planning consultant | ก่อนเริ่มงานใหญ่, วิเคราะห์ requirements |
| `momus` | Plan reviewer | ทบทวนแผนก่อน execute |
| `frontend-ui-ux` | UI/UX developer | สร้าง UI ทั้งหมด |
| `playwright` / `dev-browser` | QA/Verification | ตรวจสอบ UI บน browser |
| `database-schema-designer` | DB architect | ออกแบบ schema |
| `supabase-postgres-best-practices` | Backend engineer | สร้าง tables, policies |
| `git-master` | Version control | ทุกครั้งที่ commit |
| `requesting-code-review` | Code reviewer | ก่อน finish แต่ละ phase |

---

## 📁 Project Structure (Target)

```
6cat-booking-crm/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── customers/
│   │   ├── packages/
│   │   ├── bookings/
│   │   ├── payments/
│   │   └── trips/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # Base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── modal.tsx
│   └── features/                       # Feature components
│       ├── dashboard/
│       ├── customers/
│       ├── bookings/
│       └── trips/
├── lib/
│   ├── utils.ts
│   └── supabase/                       # Supabase client
├── types/
│   └── index.ts
├── supabase/
│   └── migrations/                     # Database migrations
└── docs/
    ├── phase1-planning/
    ├── phase2-ux-structure/
    ├── phase3-ui-design/
    └── phase4-build/
```

---

## 🔄 Sprint Workflow

### Sprint Structure (Each Screen = 1 Sprint)

```
Sprint: Dashboard (Example)

Day 1: PLAN
├── Metis: Analyze requirements
├── Momus: Review plan
└── Output: Sprint plan approved

Day 2: UI FOUNDATION
├── Frontend-UI-UX: Create layout + base components
├── Dev-Browser: Screenshot for review
└── Output: Layout + empty components

Day 3: UI POLISH
├── Frontend-UI-UX: Add mock data, polish styling
├── Dev-Browser: Verify on browser
└── Output: Pixel-perfect UI with mock data

Day 4: SCHEMA (if needed)
├── Database-Schema-Designer: Design schema
└── Output: Schema design approved

Day 5: INTEGRATION (Optional for MVP UI)
└── Connect UI to real data (skip if UI-first phase)
```

---

## ✅ Definition of Done (Per Screen)

ก่อนถือว่า "เสร็จ" ต้องผ่านทั้งหมดนี้:

- [ ] UI สวย เรียงร้อย ตาม Design System
- [ ] มี Mock data แสดงผลได้จริง
- [ ] Dev-Browser screenshot แสดงให้ดู
- [ ] Responsive (desktop-first, mobile-later)
- [ ] Code review passed (LSP diagnostics clean)
- [ ] Git committed with clear message

**ห้ามข้ามไปหน้าถัดไปจนกว่าจะครบทุกข้อ!**

---

## 🚀 Phase 4: Build Plan

### Sprint 1: Project Setup
- [ ] Initialize Next.js project with shadcn/ui
- [ ] Setup Tailwind with Design System colors
- [ ] Setup Supabase project
- [ ] Create base UI components (Button, Card, Input, Table)
- [ ] **Verification:** Screenshot of component showcase

### Sprint 2: Dashboard
- [ ] Dashboard layout with sidebar
- [ ] Summary cards component
- [ ] Recent bookings list
- [ ] Upcoming trips section
- [ ] Quick actions
- [ ] **Verification:** Browser screenshot of full dashboard

### Sprint 3: Customers Module
- [ ] Customer list with search/filter
- [ ] Customer profile page
- [ ] Customer info tab
- [ ] Customer bookings history tab
- [ ] **Verification:** Walk through customer flows

### Sprint 4: Tour Packages
- [ ] Package grid/cards view
- [ ] Package detail page
- [ ] Quota display component
- [ ] **Verification:** Package browsing flow

### Sprint 5: Bookings Module
- [ ] Booking list with filters
- [ ] Booking detail view
- [ ] Create booking form (multi-step)
- [ ] Status workflow display
- [ ] **Verification:** Create booking flow

### Sprint 6: Payments
- [ ] Payment list
- [ ] Record payment modal
- [ ] Payment status indicators
- [ ] **Verification:** Payment recording flow

### Sprint 7: Trip Schedule
- [ ] Calendar view component
- [ ] Trip detail view
- [ ] Customer list per trip
- [ ] **Verification:** Calendar navigation

---

## 🎯 Current Priority

> **RIGHT NOW: Start Sprint 1 — Project Setup**

เป้าหมายทันที:
1. สร้าง Next.js project
2. ติดตั้ง shadcn/ui
3. สร้าง base components
4. เปิดบน browser ดูว่าโอเคไหม

**อย่าเพิ่งทำอะไรที่มากกว่านี้จนกว่า UI จะสวย!**

---

## 📣 Agent Communication Rules

1. **Always plan first** — ใช้ Metis/Momus ก่อนเริ่มงานใหญ่
2. **UI before API** — ห้ามแตะ backend จนกว่า UI จะเสร็จ
3. **Show, don't tell** — ต้องมี screenshot จาก browser เสมอ
4. **Verify before proceed** — ตรวจสอบก่อนขั้นตอนถัดไป
5. **Collaborate** — ใช้หลาย skills พร้อมกันได้
6. **ภาษาไทยเท่านั้น** — ตอบโต้และอธิบายทุกอย่างเป็นภาษาไทย

---

## 🎨 UI-First Checklist (ก่อนเชื่อม API)

- [ ] Layout ถูกต้อง ไม่เบี้ยว
- [ ] Typography อ่านง่าย สวยงาม
- [ ] Colors ตรงตาม Design System
- [ ] Spacing consistent (4/8/12/16/24/32/48px scale)
- [ ] Components มี states ครบ (default, hover, focus, disabled)
- [ ] Mock data ดูสมจริง
- [ ] ไม่มี placeholder text แปลกๆ (lorem ipsum, etc.)

---

## 📝 Notes for Agents

- **Frontend-UI-UX:** เน้นความสวยงามก่อนเสมอ ใช้ mock data ที่สมจริง
- **Dev-Browser:** เปิดดูผลงานบน browser หลังจาก UI ทำเสร็จแต่ละหน้า
- **Playwright:** ใช้สำหรับ screenshot และ verification
- **Database-Schema-Designer:** รอจนกว่า UI จะเสร็จก่อนค่อยออกแบบ schema

---

**Ready to start?**  
**Next Action:** Initialize Next.js project + Setup Design System
