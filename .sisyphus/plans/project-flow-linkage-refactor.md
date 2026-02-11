# Refactor Plan: Time Flow Linkage (Backoffice ↔ Frontend ↔ Supabase)

## TL;DR

> **Quick Summary**: ปรับโครงข้อมูลเวลาใหม่ให้ทั้งระบบยึด `trips.time` เป็นแหล่งจริงเดียว ลดความเพี้ยนระหว่างหลังบ้าน/หน้าบ้าน/ฐานข้อมูล และทำให้ booking + pricing เดินกติกาเดียวกัน
>
> **Deliverables**:
> - ปรับ flow การสร้าง/เลือกเวลาให้สอดคล้องกันทั้งระบบ
> - จัด migration/schema ให้ตรงกับโค้ดที่ใช้งานจริง
> - ทำให้ backoffice booking ใช้ pricing rules เดียวกับ frontend
> - เพิ่ม QA scenarios แบบรันได้จริงครบ happy path + error path
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Schema Baseline -> Time Source Refactor -> Booking/Pricing Consistency -> End-to-End QA

---

## Context

### Original Request
ผู้ใช้ต้องการตรวจทั้งโปรเจคว่าข้อมูลลิงก์ครบหรือไม่ (หลังบ้าน/หน้าบ้าน/Supabase), พบว่า `options.times` เหมือนไม่มีผลจริง และขอแตก flow ใหม่ก่อนลงโค้ด

### Interview Summary
**Key Decisions**:
- แหล่งเวลาจริงของระบบ: `trips.time`
- `options.times` ทำหน้าที่ template/config เท่านั้น ไม่ใช่ runtime truth
- การคำนวณราคาใน backoffice booking ต้องใช้กติกาเดียวกับ frontend (tier/flat-rate)
- Test strategy: **Tests-after** + Agent-Executed QA scenarios (บังคับ)

**Research Findings**:
- เวลาในระบบมีหลายแหล่งและมี hardcoded time บางจุด ทำให้ flow เพี้ยน
- บาง path ยังเลือกเวลาไม่ได้จริงในหลังบ้าน
- ความครบของ migration ใน repo เสี่ยงไม่ตรงกับ code expectations

### Metis Review (Addressed)
- Gap: Source of truth หลายจุด -> แก้ด้วย policy เดียว `trips.time`
- Gap: เสี่ยง scope creep -> ใส่ guardrails ชัดเจน (ไม่ขยายไป checkout/reward/new features)
- Gap: acceptance criteria คลุมเครือ -> ระบุ command/selector/data/evidence ชัด

---

## Work Objectives

### Core Objective
ทำให้ข้อมูลเวลา/ทริป/ราคาไหลจากหลังบ้านสู่หน้าบ้านและ booking persistence แบบสอดคล้องหนึ่งเดียว ตรวจสอบได้ด้วย automated + agent-run QA โดยไม่พึ่งการเทสมือ

### Concrete Deliverables
- Refactor จุดใช้งานเวลาให้ทุกหน้าดึงจาก `trips.time` ณ runtime
- ปรับ logic package edit + trip schedule ให้ template เวลาไม่เพี้ยนกับ trip จริง
- ปรับ backoffice booking ให้เลือกเวลาได้และบันทึกได้จริง
- ปรับ pricing consistency ระหว่าง backoffice กับ frontend
- จัด migration ที่ขาด/คลาดให้รองรับ table/column ที่โค้ดใช้งานจริง

### Definition of Done
- [ ] ไม่มี path ใดที่ใช้งาน runtime time จาก `options.times` โดยตรง
- [ ] เพิ่ม/แก้เวลาในหลังบ้านแล้วหน้าบ้านเลือกได้ตรงกับ trip จริง
- [ ] Backoffice booking บันทึก trip/time และราคาตามกติกาเดียวกับ frontend
- [ ] QA scenarios ผ่านครบ (UI/API/DB evidence ครบไฟล์)

### Must Have
- ใช้ `trips.time` เป็น runtime truth ทั้งระบบ
- Backoffice pricing = Frontend pricing logic
- Migration + data model รองรับ flow ใหม่ครบ

### Must NOT Have (Guardrails)
- ห้ามขยายงานไป feature ใหม่ที่ไม่เกี่ยว time/booking/pricing linkage
- ห้ามทำ breaking change ต่อข้อมูลเดิมโดยไม่มี migration path
- ห้ามใช้ hardcoded เวลา (`"08:00"`, `"09:00"`) ใน business flow

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ทุก acceptance criteria ต้องรันได้ด้วย agent/tools เท่านั้น

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after
- **Framework**: ใช้ test runner ที่มีใน repo (กำหนดจริงตอนลงงาน)

### Agent-Executed QA Scenarios (Global)
- Frontend/UI: Playwright
- API/DB verification: Bash (curl/sql where applicable)
- CLI/dev flow: Bash

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Schema + Contracts):
- Task 1, 2

Wave 2 (Runtime Flow Refactor):
- Task 3, 4, 5

Wave 3 (Pricing + E2E hardening):
- Task 6, 7, 8

Critical Path:
Task 1 -> Task 3 -> Task 4 -> Task 6 -> Task 8

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3,4,5,6 | 2 |
| 2 | None | 6 | 1 |
| 3 | 1 | 4,8 | 5 |
| 4 | 1,3 | 6,8 | 5 |
| 5 | 1 | 8 | 3,4 |
| 6 | 2,4 | 8 | 7 |
| 7 | 1 | 8 | 6 |
| 8 | 3,4,5,6,7 | None | None |

---

## TODOs

- [x] 1) Baseline Schema Reconciliation (Supabase)

  **What to do**:
  - ตรวจ mapping ตาราง/คอลัมน์ที่โค้ดใช้จริงกับ migration ที่มี
  - สร้าง migration เติมส่วนขาดของ core entities ที่ใช้ใน flow นี้
  - ยืนยัน FK/constraints/indexes สำหรับเส้นทาง package -> trips -> bookings

  **Must NOT do**:
  - ไม่แตะ feature นอก flow ที่กำลัง refactor

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `database-schema-designer`, `supabase-postgres-best-practices`

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (with Task 2)
  - Blocks: 3,4,5,6,7
  - Blocked By: None

  **References**:
  - `supabase/migrations/20260208_create_trips_table.sql` - trips baseline
  - `app/(dashboard)/packages/[id]/edit/page.tsx` - columns/queries ที่พึ่งพา
  - `components/features/bookings/booking-create-form.tsx` - bookings dependencies
  - `components/features/payments/record-payment-modal.tsx` - payment writes

  **Acceptance Criteria**:
  - [ ] มี migration ครอบคลุม entities/columns ที่ flow นี้ใช้งานจริง
  - [ ] FK และ indexes จำเป็นถูกกำหนดครบ

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Schema supports package->trip->booking linkage
    Tool: Bash
    Preconditions: DB พร้อมรับ migration
    Steps:
      1. Apply migrations in test environment
      2. Insert package row (minimum fields)
      3. Insert trip row linked by package_id
      4. Insert booking row linked by trip_id
      5. Query joins package/trip/booking
    Expected Result: Insert/query ผ่านครบ ไม่มี FK errors
    Evidence: .sisyphus/evidence/task-1-schema-linkage.txt
  ```

- [x] 2) Define and Publish Time/Price Contracts

  **What to do**:
  - ระบุ contract ชัด: runtime time = `trips.time`
  - ระบุ contract ชัด: pricing rules ใช้ร่วมกันทั้ง backoffice/frontend
  - ระบุ fallback behavior ที่อนุญาตและที่ห้าม

  **Must NOT do**:
  - ไม่กำหนด contract คลุมเครือแบบ "แล้วแต่หน้าจอ"

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `supabase-postgres-best-practices`

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (with Task 1)
  - Blocks: 6
  - Blocked By: None

  **References**:
  - `types/package-options.ts` - shape ของ options/times/tier
  - `app/(public)/destinations/[slug]/page.tsx` - current fallback behavior
  - `lib/cart/local-cart.ts` - persisted pricing/time fields

  **Acceptance Criteria**:
  - [ ] มีเอกสาร contract ที่ทีม implement ตรงกัน
  - [ ] มี rule ชัดสำหรับ flat-rate vs per-pax

- [x] 3) Refactor Package Edit Save Flow (Options -> Trips Template Sync)

  **What to do**:
  - ทำให้การ save package ใช้ `options.times` เป็น template เพื่อสร้าง/sync trip slots เท่านั้น
  - ตัด hardcoded time จาก path นี้
  - ป้องกัน duplicate trip keys (`date|time|package_id`)

  **Must NOT do**:
  - ไม่ให้ `options.times` ถูกอ่านเป็น runtime source ในหน้าขาย

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `frontend-ui-ux`, `supabase-postgres-best-practices`

  **Parallelization**:
  - Can Run In Parallel: NO
  - Parallel Group: Wave 2
  - Blocks: 4,8
  - Blocked By: 1

  **References**:
  - `app/(dashboard)/packages/[id]/edit/page.tsx`
  - `components/features/packages/trips/trip-schedule-editor.tsx`
  - `components/features/packages/price-options/option-card.tsx`

  **Acceptance Criteria**:
  - [ ] Save package แล้ว trip ถูก sync ตาม dates x template times
  - [ ] ไม่มี hardcoded business time เหลือใน path นี้

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Save package with new option times generates trip slots
    Tool: Playwright
    Preconditions: มี package ทดสอบ 1 รายการ
    Steps:
      1. เปิดหน้า edit package
      2. ที่แท็บ Trips เลือกวันที่ 2026-02-20 และ 2026-02-21
      3. ที่แท็บ Options เพิ่มเวลา 09:00 และ 13:30
      4. กด Save Changes
      5. เปิดแท็บ Trips/รายการทริปเพื่อตรวจ slot ที่ถูกสร้าง
    Expected Result: ได้ 4 trips (2 dates x 2 times) โดยไม่ซ้ำ
    Evidence: .sisyphus/evidence/task-3-trip-template-sync.png
  
  Scenario: Duplicate save does not duplicate trip rows
    Tool: Playwright
    Preconditions: มีข้อมูลจาก scenario ก่อนหน้า
    Steps:
      1. กด Save Changes ซ้ำโดยไม่แก้ข้อมูล
      2. ตรวจจำนวนทริปเดิม
    Expected Result: จำนวนทริปไม่เพิ่ม
    Evidence: .sisyphus/evidence/task-3-no-duplicate.txt
  ```

- [x] 4) Refactor Public Destination Time Selection to Trips-only Runtime

  **What to do**:
  - ปรับหน้าปลายทางให้ดึง time slots จาก `trips.time` ของวันที่เลือกเท่านั้น
  - คงการกรอง capacity ตาม bookings เดิม
  - ลบ dual-source fallback ที่ทำให้ผู้ใช้เห็นเวลาที่จองไม่ได้จริง

  **Must NOT do**:
  - ไม่ใช้ `selectedOption.times` เป็น runtime slot list

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`

  **Parallelization**:
  - Can Run In Parallel: NO
  - Parallel Group: Wave 2
  - Blocks: 6,8
  - Blocked By: 1,3

  **References**:
  - `app/(public)/destinations/[slug]/page.tsx`
  - `lib/cart/local-cart.ts`

  **Acceptance Criteria**:
  - [ ] เวลาใน UI มาจาก `trips.time` เท่านั้น
  - [ ] เลือกเวลาแล้ว add to cart ได้เฉพาะ slot ที่ว่างจริง

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Customer sees only real trip times for selected date
    Tool: Playwright
    Preconditions: package มี trip วันที่ 2026-02-20 เวลา 09:00, 13:30
    Steps:
      1. เปิดหน้าปลายทางของ package
      2. เลือกวันที่ 2026-02-20
      3. อ่านรายการเวลาที่แสดง
      4. เทียบกับ DB trip rows ของวันนั้น
    Expected Result: รายการเวลาเท่ากับ trips.time ทั้งหมดและเท่านั้น
    Evidence: .sisyphus/evidence/task-4-runtime-times.png
  
  Scenario: Option has extra template time but no trip row
    Tool: Playwright
    Preconditions: options.times มี 16:00 แต่ไม่มี trip row เวลา 16:00
    Steps:
      1. เปิดหน้าปลายทางและเลือกวันที่เดียวกัน
      2. ตรวจรายการเวลาที่แสดง
    Expected Result: 16:00 ไม่ถูกแสดงใน runtime selection
    Evidence: .sisyphus/evidence/task-4-no-template-leak.txt
  ```

- [x] 5) Backoffice Booking Time Selection (No Hardcoded Time)

  **What to do**:
  - เพิ่มการเลือกเวลาใน backoffice booking flow
  - map date+time ไปยัง trip ที่ถูกต้อง
  - หากไม่มี trip ตามเวลา ต้องแจ้งชัด/สร้างตามกฎที่กำหนดใน contract

  **Must NOT do**:
  - ห้าม fallback เป็น hardcoded time

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `frontend-ui-ux`, `supabase-postgres-best-practices`

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 2 (with Task 3/4 หลัง schema พร้อม)
  - Blocks: 8
  - Blocked By: 1

  **References**:
  - `components/features/bookings/booking-create-form.tsx`
  - `components/features/trips/trip-form-modal.tsx`

  **Acceptance Criteria**:
  - [ ] Backoffice booking บังคับเลือกเวลาได้
  - [ ] ไม่พบ string hardcoded เวลาใน booking business path

- [x] 6) Pricing Consistency Refactor (Backoffice = Frontend)

  **What to do**:
  - ใช้กติกาเดียวกันสำหรับ pricing tiers/flat-rate ทั้งสองฝั่ง
  - ปรับ cart และ booking total calculation ให้สอดคล้อง
  - ปิดจุดคำนวณซ้ำที่พาให้ยอดต่างกัน

  **Must NOT do**:
  - ไม่ให้ backoffice คิดราคาแบบ base_price*x แบบเดิมเมื่อเลือก option tier

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
  - **Skills**: `frontend-ui-ux`

  **Parallelization**:
  - Can Run In Parallel: NO
  - Parallel Group: Wave 3
  - Blocks: 8
  - Blocked By: 2,4

  **References**:
  - `app/(public)/destinations/[slug]/page.tsx`
  - `components/features/bookings/booking-create-form.tsx`
  - `lib/cart/local-cart.ts`
  - `app/(public)/cart/page.tsx`

  **Acceptance Criteria**:
  - [ ] ชุดข้อมูลเดียวกันให้ยอดรวมเท่ากันใน frontend/backoffice/cart
  - [ ] flat-rate ไม่ถูกคูณตาม pax ผิดกฎ

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Flat-rate option stays constant when pax changes
    Tool: Playwright
    Preconditions: มี option แบบ flat-rate ราคา 5000
    Steps:
      1. เพิ่มสินค้า flat-rate ลง cart
      2. เปลี่ยน pax จาก 1 -> 3
      3. ตรวจ unit/total price
    Expected Result: total ยังคง 5000 ตามกฎ flat-rate
    Evidence: .sisyphus/evidence/task-6-flat-rate.png
  
  Scenario: Tier pricing matches in frontend and backoffice booking
    Tool: Bash + Playwright
    Preconditions: ตั้งค่า tier 1-2=1000, 3-5=900
    Steps:
      1. Frontend เลือก pax=3 แล้วบันทึกยอด
      2. Backoffice สร้าง booking pax=3 option เดียวกัน
      3. เทียบ total_amount
    Expected Result: ยอดเท่ากัน
    Evidence: .sisyphus/evidence/task-6-tier-match.txt
  ```

- [x] 7) Remove Remaining Hardcoded Time Defaults in Business Paths

  **What to do**:
  - ค้นหาและแทนที่ hardcoded times ที่กระทบ flow ธุรกิจ
  - คง default UI เฉพาะจุดที่ไม่กระทบ business logic และมี rationale

  **Must NOT do**:
  - ไม่เปลี่ยน mock/demo-only constants ที่ไม่เกี่ยว production flow โดยไม่จำเป็น

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 3 (with Task 6)
  - Blocks: 8
  - Blocked By: 1

  **References**:
  - `components/features/bookings/booking-create-form.tsx`
  - `components/features/trips/trip-form-modal.tsx`
  - `components/features/packages/price-options/option-card.tsx`

  **Acceptance Criteria**:
  - [ ] ไม่มี hardcoded เวลาในเส้นทางธุรกิจหลัก
  - [ ] default ที่คงไว้ถูก documented ว่าเป็น UI-only

- [x] 8) End-to-End Validation (Backoffice -> Frontend -> Booking Persistence)

  _Execution note (2026-02-10): Full E2E path was waived by user request due to runtime cost; smoke validation executed and documented in `.sisyphus/evidence/task-8-e2e-happy.txt`._

  **What to do**:
  - รัน E2E ครบเส้นทางตั้งแต่แก้ package ถึงการสร้าง booking
  - ยืนยันข้อมูลใน DB ตรงกับ UI ทุกจุดสำคัญ
  - เก็บ evidence ครบทุก scenario

  **Must NOT do**:
  - ห้ามปิดงานโดยไม่มี evidence ไฟล์ตาม path

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `playwright`, `dev-browser`

  **Parallelization**:
  - Can Run In Parallel: NO
  - Parallel Group: Wave 3 final
  - Blocks: None
  - Blocked By: 3,4,5,6,7

  **References**:
  - `app/(dashboard)/packages/[id]/edit/page.tsx`
  - `app/(public)/destinations/[slug]/page.tsx`
  - `components/features/bookings/booking-create-form.tsx`
  - `lib/cart/local-cart.ts`

  **Acceptance Criteria**:
  - [ ] สร้างเวลาทริปจากหลังบ้านแล้วหน้าบ้านเลือกได้จริง
  - [ ] Add to cart และ create booking บันทึกเวลา/ราคาได้ตรง
  - [ ] ตรวจ DB row แล้วสัมพันธ์ถูกต้อง

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: End-to-end happy path (admin -> customer -> booking)
    Tool: Playwright + Bash
    Preconditions: ระบบรันได้, DB test data พร้อม
    Steps:
      1. Admin ปรับ package options template times และ save
      2. ตรวจว่า trips rows ถูก sync ตาม date x time
      3. Customer เปิดหน้า destination เลือก date/time/pax แล้ว add to cart
      4. Backoffice สร้าง booking จากข้อมูลเดียวกัน
      5. Query DB ตรวจ trip_id/time/total_amount consistency
    Expected Result: ข้อมูลสอดคล้องทุกจุด
    Evidence: .sisyphus/evidence/task-8-e2e-happy.txt
  
  Scenario: Capacity exhausted blocks booking
    Tool: Playwright + Bash
    Preconditions: trip หนึ่งรายการเหลือ 0 ที่นั่ง
    Steps:
      1. Customer เลือก slot ที่เต็ม
      2. กดตรวจ availability และพยายามดำเนินการต่อ
    Expected Result: ระบบ block และแสดงข้อความชัดเจน
    Evidence: .sisyphus/evidence/task-8-capacity-block.png
  ```

---

## Commit Strategy

| After Task | Message | Verification |
|------------|---------|--------------|
| 1-2 | `chore(db): align schema contracts for trip-time flow` | migration checks pass |
| 3-5 | `fix(flow): unify trip time runtime selection across backoffice/public` | UI + DB sync scenarios pass |
| 6-7 | `fix(pricing): unify backoffice and frontend pricing rules` | pricing parity scenarios pass |
| 8 | `test(e2e): validate time linkage and booking consistency` | full E2E evidence present |

---

## Success Criteria

### Verification Commands (Example Targets)
```bash
# run app tests
npm test

# run type check/build
npm run build

# run targeted e2e (if configured)
npm run test:e2e
```

### Final Checklist
- [ ] Runtime time source เดียว (`trips.time`) ใช้งานจริงทุกหน้า
- [ ] Backoffice booking เลือกเวลาได้และไม่ hardcode
- [ ] Pricing rule คำนวณตรงกันทั้ง frontend/backoffice/cart
- [ ] Schema/migrations รองรับ flow จริงครบ
- [ ] Agent-executed QA evidence ครบใน `.sisyphus/evidence/`
