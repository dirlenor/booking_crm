# API Layer Implementation Plan

## สิ่งที่จะสร้าง

เปลี่ยนจาก "Browser → Supabase ตรง" เป็น "Browser → API Route → Supabase"
โดยใช้ Next.js Route Handlers ที่มีอยู่แล้วในโปรเจค ไม่ต้องตั้ง server แยก

---

## Phase 1: Foundation (ต้องทำก่อน — ส่วนอื่นพึ่งพาหมด)

### 1.1 Supabase Server Client
- **สร้าง:** `/lib/supabase/server.ts`
- ใช้ `createClient` แบบ server-side พร้อม service role key
- แยกจาก client.ts ที่ใช้ anon key ฝั่ง browser

### 1.2 Auth Middleware
- **สร้าง:** `/lib/api/auth.ts`
- Function `getAuthUser(request)` — ดึง session จาก cookie/header
- Function `requireAuth(request)` — throw 401 ถ้าไม่ login
- Function `requireRole(request, roles[])` — throw 403 ถ้าไม่มีสิทธิ์

### 1.3 API Utilities
- **สร้าง:** `/lib/api/utils.ts`
- `apiResponse(data, status)` — standard JSON response format
- `apiError(message, status)` — standard error format
- `parseSearchParams(request)` — parse query string สำหรับ filter/pagination
- `validateBody(request, schema)` — validate request body ด้วย zod

### 1.4 Zod Validation Schemas
- **สร้าง:** `/lib/validations/`
- `booking.ts` — CreateBookingSchema, UpdateBookingSchema
- `customer.ts` — CreateCustomerSchema, UpdateCustomerSchema
- `package.ts` — CreatePackageSchema, UpdatePackageSchema
- `payment.ts` — CreatePaymentSchema
- `trip.ts` — CreateTripSchema, UpdateTripSchema

### 1.5 ติดตั้ง Dependencies
- `zod` — request validation
- `@supabase/ssr` — server-side Supabase client (ถ้าจำเป็น)

---

## Phase 2: Core API Routes (ขนานกันได้ — แต่ละ module อิสระ)

### 2.1 Bookings API
**Files:**
- `/app/api/bookings/route.ts` — GET (list + filter), POST (create)
- `/app/api/bookings/[id]/route.ts` — GET (detail), PATCH (update status), DELETE

**Business Logic ที่ย้ายมา:**
- **POST** — ตรวจที่ว่าง (availability check), คำนวณราคาฝั่ง server, สร้าง booking_ref, insert booking + passengers
- **PATCH** — cancel booking, update status (pending → confirmed → completed)
- **GET** — join customers + trips + packages, filter by status/date/search

**สิ่งที่ดีขึ้น:**
- ป้องกัน overbooking (server-side capacity check)
- User แก้ราคา/status เองไม่ได้
- Booking ref สร้างฝั่ง server เท่านั้น

### 2.2 Customers API
**Files:**
- `/app/api/customers/route.ts` — GET (list + search), POST (create)
- `/app/api/customers/[id]/route.ts` — GET (profile + stats), PATCH, DELETE

**Business Logic:**
- **DELETE** — ตรวจว่าไม่มี booking ก่อนลบ (ย้ายจาก client)
- **GET** — คำนวณ totalBookings, totalSpent, lastBookingDate ฝั่ง server

### 2.3 Packages API
**Files:**
- `/app/api/packages/route.ts` — GET (list + filter), POST (create)
- `/app/api/packages/[id]/route.ts` — GET (detail), PATCH (update), DELETE

**Business Logic:**
- **POST/PATCH** — validate options/pricing, manage itinerary items, sync trips
- **DELETE** — ตรวจว่าไม่มี trip ก่อนลบ
- **GET public** — เฉพาะ status='published' (แยก endpoint หรือ query param)

### 2.4 Payments API
**Files:**
- `/app/api/payments/route.ts` — GET (list), POST (record payment)
- `/app/api/payments/[id]/route.ts` — GET (detail), PATCH (refund)

**Business Logic:**
- **POST** — validate amount ไม่เกิน remaining balance, update booking payment_status
- **PATCH refund** — update payment + booking status atomically

### 2.5 Trips API
**Files:**
- `/app/api/trips/route.ts` — GET (list + filter), POST (create)
- `/app/api/trips/[id]/route.ts` — GET (detail), PATCH, DELETE

**Business Logic:**
- **GET** — join packages + bookings, คำนวณ occupancy
- **POST** — validate ไม่ซ้ำ date+time+package

### 2.6 Availability API (Public)
**Files:**
- `/app/api/public/packages/route.ts` — GET published packages
- `/app/api/public/packages/[id]/route.ts` — GET detail + availability
- `/app/api/public/availability/route.ts` — GET real-time availability per trip

**Business Logic:**
- คำนวณ remaining seats ฝั่ง server
- ส่งเฉพาะข้อมูลที่ public ควรเห็น (ไม่ส่ง cost price, internal notes)

---

## Phase 3: Dashboard/Stats API

### 3.1 Dashboard Stats API
**Files:**
- `/app/api/dashboard/stats/route.ts` — GET aggregated stats

**ย้ายมาจาก:** dashboard/page.tsx (6 queries → 1 API call)
- Total revenue (30 days)
- Active bookings count
- New customers count
- Tour occupancy rate
- Recent bookings (top 5)
- Upcoming trips (top 5)

---

## Phase 4: Frontend Migration (ทำทีละ module)

เปลี่ยน component ทุกตัวจาก `supabase.from(...)` เป็น `fetch("/api/...")`

### 4.1 สร้าง API Client
- **สร้าง:** `/lib/api/client.ts`
- Wrapper function: `api.get()`, `api.post()`, `api.patch()`, `api.delete()`
- Auto-attach auth headers
- Centralized error handling
- Type-safe responses

### 4.2 ย้ายทีละหน้า
| หน้า | Supabase calls ปัจจุบัน | เปลี่ยนเป็น |
|------|-------------------------|-------------|
| Dashboard | 6 queries | `api.get("/api/dashboard/stats")` |
| Customers list | 2 queries + delete logic | `api.get("/api/customers")` + `api.delete(...)` |
| Customer profile | 2 queries | `api.get("/api/customers/:id")` |
| Bookings list | 1 query | `api.get("/api/bookings")` |
| Booking detail | 1 query + cancel/refund | `api.get/patch("/api/bookings/:id")` |
| Booking create | 2 queries + insert | `api.post("/api/bookings")` |
| Packages list | 3 queries + delete | `api.get("/api/packages")` + `api.delete(...)` |
| Package create | 2 inserts | `api.post("/api/packages")` |
| Package edit | 5+ queries | `api.patch("/api/packages/:id")` |
| Payments list | 1 query | `api.get("/api/payments")` |
| Record payment | 1 query + insert | `api.post("/api/payments")` |
| Trips page | query + modal | `api.get/post/patch("/api/trips")` |
| Destinations (public) | 1 query | `api.get("/api/public/packages")` |
| Destination detail | 4 queries | `api.get("/api/public/packages/:id")` |

---

## Phase 5: Testing

### 5.1 API Unit Tests
- ทดสอบแต่ละ endpoint ด้วย mock data
- ตรวจ validation (ส่งข้อมูลผิด → ได้ error ที่ถูกต้อง)
- ตรวจ auth (ไม่ login → 401, ไม่มีสิทธิ์ → 403)

### 5.2 E2E Tests (Playwright)
- ทดสอบ flow จริง: สร้าง booking → จ่ายเงิน → ดู dashboard
- ใช้ Playwright MCP + skill ที่ติดตั้งไว้

---

## Parallel Execution Strategy

```
Phase 1 (Foundation)     ← ทำก่อน ตามลำดับ
    ↓
Phase 2 (API Routes)     ← spawn 6 agents ขนาน
    ↓                       Agent A: Bookings API
    ↓                       Agent B: Customers API
    ↓                       Agent C: Packages API
    ↓                       Agent D: Payments API
    ↓                       Agent E: Trips API
    ↓                       Agent F: Public/Availability API
    ↓
Phase 3 (Dashboard API)  ← 1 agent
    ↓
Phase 4 (Frontend)       ← ทีละหน้า (มี dependency กับ API)
    ↓
Phase 5 (Testing)        ← Playwright + unit tests
```

---

## File Structure สุดท้าย

```
/app/api/
├── bookings/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/route.ts         GET, PATCH, DELETE
├── customers/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/route.ts         GET, PATCH, DELETE
├── packages/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/route.ts         GET, PATCH, DELETE
├── payments/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/route.ts         GET, PATCH (refund)
├── trips/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/route.ts         GET, PATCH, DELETE
├── dashboard/
│   └── stats/route.ts        GET (aggregated)
└── public/
    ├── packages/
    │   ├── route.ts          GET (published only)
    │   └── [id]/route.ts     GET (detail + availability)
    └── availability/route.ts GET (real-time seats)

/lib/
├── api/
│   ├── auth.ts               Auth middleware
│   ├── utils.ts              Response helpers
│   └── client.ts             Frontend API client
├── services/
│   ├── booking-service.ts    Booking business logic
│   ├── customer-service.ts   Customer business logic
│   ├── package-service.ts    Package business logic
│   ├── payment-service.ts    Payment business logic
│   └── trip-service.ts       Trip business logic
├── supabase/
│   ├── client.ts             (existing) Browser client
│   └── server.ts             (new) Server client
└── validations/
    ├── booking.ts            Zod schemas
    ├── customer.ts
    ├── package.ts
    ├── payment.ts
    └── trip.ts

```

---

## API Response Format (Standard)

```typescript
// Success
{ "data": { ... }, "meta": { "total": 100, "page": 1, "limit": 20 } }

// Error
{ "error": { "message": "...", "code": "VALIDATION_ERROR", "details": [...] } }
```

---

## สรุปปริมาณงาน

| Phase | Files ใหม่ | ประมาณ |
|-------|-----------|--------|
| Phase 1: Foundation | 6-8 files | พื้นฐานที่ทุกอย่างพึ่งพา |
| Phase 2: API Routes | 12 route files + 5 service files | หัวใจหลัก |
| Phase 3: Dashboard API | 1 file | รวม 6 queries เป็น 1 endpoint |
| Phase 4: Frontend Migration | แก้ ~14 files | เปลี่ยน supabase calls → fetch |
| Phase 5: Testing | 6-10 test files | ทดสอบทุก endpoint |
| **รวม** | **~45-50 files** | |
