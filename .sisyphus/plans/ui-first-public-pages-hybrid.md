# แผนงาน UI-First Public Pages (Hybrid ต่อโมดูล)

## TL;DR

> **Quick Summary**: ปิดงานหน้าเว็บฝั่งลูกค้าให้ครบก่อน (About, Contact, Checkout, Payment, Thank You, Profile ใหม่) โดยทำแบบ Hybrid: ทำ UI ต่อโมดูล + ล็อก Endpoint/Payload contract ต่อหน้า เพื่อลด rework ตอนเชื่อม CRM/DB
>
> **Deliverables**:
> - หน้าใหม่: `/about`, `/contact`, `/checkout`, `/payment`, `/thank-you`, `/profile`
> - ปรับ route เดิม: redirect `/my-bookings` -> `/profile`
> - มาตรฐาน section label ภายในแบบตัวเล็กทุกหน้า (internal only)
> - เอกสาร data contract รายหน้า (request/response/state/error)
>
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Section Convention -> Checkout -> Payment -> Thank You -> Profile + Redirect

---

## Context

### Original Request
ลูกค้าประชุมใหม่ ต้องวางแผนหน้าเว็บใหม่ โดยทำ UI ฝั่งหน้าบ้านให้ครบทุกหน้าก่อน แล้วค่อยลุย CRM หลังบ้าน โดยกังวลว่า feature ฝั่งหน้าบ้านจะพึ่ง DB สูงและทำให้แก้ซ้ำทีหลัง

### Interview Summary
**Key Decisions**:
- แนวทางหลัก: Hybrid ต่อโมดูล (ทำ UI ก่อน แล้วล็อก contract ขั้นต่ำของโมดูลนั้นทันที)
- ลำดับงาน: About/Contact -> Destination Detail Polish -> Checkout -> Payment -> Thank You -> Profile
- Test infra: ยังไม่ตั้งอัตโนมัติในเฟสนี้ (ใช้ Agent-Executed QA เป็นหลัก)
- Contract level: ล็อกระดับ Endpoint + Payload ต่อหน้า
- Section naming: ใช้ชื่อ section ตัวเล็กทุกหน้าเพื่อคุยงาน (internal only ไม่โชว์ผู้ใช้)
- Profile: สร้างหน้าใหม่ `/profile` ตามดีไซน์ที่ผู้ใช้ส่ง
- Checkout auth: ดู checkout ได้ แต่ต้อง login ก่อนเข้า payment
- Payment scope: UI mock + payment states เท่านั้น (ไม่เชื่อม gateway จริง)
- Route strategy: redirect `/my-bookings` ไป `/profile`
- Branding: คงของเดิมให้ครบก่อน แล้วค่อยพิจารณารีแบรนด์รวม

### Research Findings
- มีหน้าเดิมแล้ว: `/`, `/destinations`, `/destinations/[slug]`, `/cart`, `/my-bookings`
- หน้า `/my-bookings` มีการ query Supabase จริงอยู่แล้ว
- หน้า `/cart` ใช้ `LocalCartItem` จาก localStorage เป็น contract สำคัญสำหรับ checkout
- Header มี dead links (`About Us`, `Contact`) ยังชี้ `#`
- ยังไม่มี test infra ในโปรเจกต์ (`package.json` ไม่มี test script, ไม่พบ config test หลัก)

### Metis Review (Applied)
- ล็อก guardrail ไม่เพิ่ม backend coupling ในหน้าใหม่
- ล็อกว่า checkout/payment ต้องผูกกับ cart contract เดิม
- ล็อกว่าการเปลี่ยน header href ต้องทำพร้อมหน้าเป้าหมายเท่านั้น

---

## Work Objectives

### Core Objective
ส่งมอบหน้า public ครบตามแบบ โดยทำให้พร้อมต่อ backend ในรอบถัดไปผ่าน data contract ที่ชัดเจน และลดการแก้ซ้ำจาก dependency ระหว่าง cart/checkout/payment/profile

### Concrete Deliverables
- Route ใหม่พร้อม UI: `/about`, `/contact`, `/checkout`, `/payment`, `/thank-you`, `/profile`
- Redirect: `/my-bookings` -> `/profile`
- อัปเดต header links สำหรับ About/Contact ให้เป็น route จริง
- ไฟล์ markdown contract ต่อหน้าใน `.sisyphus/` สำหรับ handoff backend

### Definition of Done
- [ ] ทุก route ตอบ 200 (`/about`, `/contact`, `/checkout`, `/payment`, `/thank-you`, `/profile`)
- [ ] ทุกหน้ามี section labels ภายในแบบ lowercase ตาม convention เดียวกัน
- [ ] `/my-bookings` redirect ไป `/profile` ได้จริง
- [ ] ไม่มี `import { supabase }` ใหม่ในหน้า public ที่สร้างเพิ่มในเฟสนี้
- [ ] มี evidence ครบใน `.sisyphus/evidence/` ตาม QA scenarios

### Must Have
- ใช้ `LocalCartItem` เดิมจาก `lib/cart/local-cart.ts` เป็นแหล่งข้อมูลหลักของ flow checkout/payment
- รักษาโครง layout สาธารณะผ่าน `app/(public)/layout.tsx`
- ทำงานตามดีไซน์ที่ผู้ใช้ส่งเป็นรายหน้าแบบ iterative

### Must NOT Have (Guardrails)
- ห้ามเชื่อม payment gateway จริงในเฟสนี้
- ห้ามเพิ่ม Supabase query ใหม่ในหน้า public ใหม่
- ห้ามแยกแผนเป็นหลายไฟล์ (ใช้แผนนี้ไฟล์เดียว)
- ห้ามแก้ CRM dashboard scope ในเฟสนี้
- ห้ามโชว์ section labels ให้ user ปลายทางเห็นบน production UI

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ทุก acceptance criteria ต้องถูกตรวจโดย agent เท่านั้น (Playwright/Bash/AST search) และมี evidence path ชัดเจน

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (เฟสนี้)
- **Framework**: N/A

### Agent-Executed QA Scenarios (All Tasks)
- Frontend/UI: ใช้ Playwright (`/playwright`) เพื่อ navigate + assert + screenshot
- API/Route check: ใช้ Bash (`curl`) ยืนยัน status code
- Contract leakage check: ใช้ `ast_grep_search` ตรวจการ import Supabase ในไฟล์ใหม่

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately)
- Task 1: Section Label Convention + Contract Template
- Task 2: About Us
- Task 3: Contact Us

Wave 2 (After Wave 1)
- Task 4: Destination Detail Polish
- Task 5: Checkout (depends on Task 1)

Wave 3 (After Wave 2)
- Task 6: Payment (depends on Task 5)
- Task 7: Thank You (depends on Task 6)
- Task 8: Profile + Redirect from my-bookings (depends on Task 1)

Critical Path: 1 -> 5 -> 6 -> 7

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 5, 8 | 2, 3 |
| 2 | None | Header link finish | 1, 3 |
| 3 | None | Header link finish | 1, 2 |
| 4 | 1 | None | 5 |
| 5 | 1 | 6 | 4 |
| 6 | 5 | 7 | 8 |
| 7 | 6 | None | 8 |
| 8 | 1 | Redirect finalization | 6, 7 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|--------------------|
| 1 | 1,2,3 | `task(category="visual-engineering", load_skills=["frontend-ui-ux","playwright"])` |
| 2 | 4,5 | `task(category="visual-engineering", load_skills=["frontend-ui-ux","playwright"])` |
| 3 | 6,7,8 | `task(category="visual-engineering", load_skills=["frontend-ui-ux","playwright","git-master"])` |

---

## TODOs

- [ ] 1. กำหนด Section Label Convention + Data Contract Template

  **What to do**:
  - กำหนด section labels lowercase มาตรฐาน (เช่น `profile_header`, `booking_tabs`, `payment_summary`)
  - กำหนด format contract ต่อหน้า: endpoint, request, response, states, errors
  - กำหนด naming rule ว่าเป็น internal only (เช่น `data-section="profile_header"`)

  **Must NOT do**:
  - ห้ามโชว์ label เหล่านี้เป็นข้อความบน UI production
  - ห้ามผูกกับ backend จริง

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: งานหลักเป็นมาตรฐานและเอกสาร handoff
  - **Skills**: `frontend-ui-ux`, `playwright`
    - `frontend-ui-ux`: ช่วยตั้ง section naming ให้ใช้งานจริงกับ component tree
    - `playwright`: ช่วยตรวจว่า labels ฝังใน DOM ได้และไม่รั่วเป็นข้อความผู้ใช้
  - **Skills Evaluated but Omitted**:
    - `database-schema-designer`: ยังไม่ต้องออกแบบ schema ลึกใน task นี้

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2,3)
  - **Blocks**: 5, 8
  - **Blocked By**: None

  **References**:
  - `app/(public)/layout.tsx` - รูปแบบ layout ที่ทุกหน้า public ต้องเกาะ
  - `components/features/landing/landing-header.tsx` - รูปแบบ nav/header ที่จะต้องอ้างอิง section/route
  - `lib/cart/local-cart.ts` - ตัวอย่าง type contract ที่ชัดเจนสำหรับ data handoff

  **Acceptance Criteria**:
  - [ ] มีไฟล์มาตรฐาน section + contract อยู่ใน `.sisyphus/` พร้อมใช้ทุกหน้าถัดไป
  - [ ] DOM ของหน้าที่พัฒนาใหม่มี `data-section` lowercase ตามมาตรฐาน

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Validate lowercase section labels in DOM
    Tool: Playwright
    Preconditions: Dev server running at localhost:3000
    Steps:
      1. Navigate to each completed route
      2. Evaluate DOM for [data-section] attributes
      3. Assert every value matches regex ^[a-z0-9_]+$
      4. Screenshot each page
    Expected Result: All section labels lowercase and present
    Evidence: .sisyphus/evidence/task-1-section-labels-*.png
  ```

- [ ] 2. สร้างหน้า About Us

  **What to do**:
  - สร้าง route `/about` ตามแบบที่ผู้ใช้ส่ง
  - ใส่ section labels internal ครบทุก block
  - อัปเดต header link `About Us` จาก `#` ไป `/about` เมื่อหน้านี้พร้อม

  **Must NOT do**:
  - ห้ามเพิ่ม API/Supabase call ใหม่

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `supabase-postgres-best-practices`: ไม่เกี่ยวกับหน้า static

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Header link completion
  - **Blocked By**: None

  **References**:
  - `app/(public)/page.tsx` - baseline สไตล์ public page
  - `components/features/landing/landing-header.tsx` - จุดที่ต้องแก้ href
  - `components/features/landing/landing-footer.tsx` - pattern footer consistency

  **Acceptance Criteria**:
  - [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about` ได้ `200`
  - [ ] คลิก nav `About Us` แล้ว URL เป็น `/about`
  - [ ] ไม่มี import Supabase ในไฟล์หน้าใหม่

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: About route and nav integrity
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /
      2. Click nav link "About Us"
      3. Assert URL is /about
      4. Assert page has [data-section="about_hero"] and [data-section="about_content"]
      5. Screenshot
    Expected Result: Route works and sections are referenceable
    Evidence: .sisyphus/evidence/task-2-about-route.png
  ```

- [ ] 3. สร้างหน้า Contact Us

  **What to do**:
  - สร้าง route `/contact` ตามแบบ
  - ฟอร์มเป็น UI/mock state เท่านั้น
  - อัปเดต header link `Contact` จาก `#` ไป `/contact` เมื่อหน้านี้พร้อม

  **Must NOT do**:
  - ห้ามส่งข้อมูลเข้าระบบจริง

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `dev-browser`: ไม่จำเป็นหาก Playwright ครอบคลุมแล้ว

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Header link completion
  - **Blocked By**: None

  **References**:
  - `app/(public)/layout.tsx` - ต้องคง header/footer ตามโครง public
  - `components/ui/input.tsx` - pattern input มาตรฐานของโปรเจกต์
  - `components/ui/button.tsx` - pattern button states

  **Acceptance Criteria**:
  - [ ] `/contact` status 200
  - [ ] ฟอร์มมี field ชัดเจน (name, email, message)
  - [ ] ปุ่ม submit ทำงานเป็น mock success/failure state ในหน้า

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Contact form mock states
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /contact
      2. Fill name/email/message ด้วยข้อมูลทดสอบ
      3. Click submit
      4. Assert success state text appears
      5. Submit invalid email path and assert error state text appears
      6. Screenshot both states
    Expected Result: Happy path และ error path แสดงผลครบ
    Evidence: .sisyphus/evidence/task-3-contact-states.png
  ```

- [ ] 4. Polish หน้า Destination Detail ให้เข้ามาตรฐาน section labels

  **What to do**:
  - ปรับดีไซน์ destination detail ตามแบบล่าสุดโดยไม่ทำลาย flow เดิม
  - เพิ่ม section labels internal ให้ครบ section หลัก

  **Must NOT do**:
  - ห้ามเปลี่ยน cart add logic หลักในรอบนี้

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `ultrabrain`: งานนี้ไม่ใช่โจทย์ logic หนัก

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `app/(public)/destinations/[slug]/page.tsx` - entry route ของหน้า detail
  - `components/features/packages/destination-detail/booking-cta.tsx` - จุดเชื่อมไป cart
  - `lib/cart/local-cart.ts` - contract item ที่ต้องเข้ากัน

  **Acceptance Criteria**:
  - [ ] หน้า detail ยังเพิ่ม cart item ได้เหมือนเดิม
  - [ ] section labels ครบและเป็น lowercase

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Destination detail add-to-cart continuity
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /destinations/[slug] ของรายการที่มีขาย
      2. Click booking CTA/add to cart
      3. Assert cart badge count เพิ่มขึ้น
      4. Assert page sections include lowercase data-section labels
      5. Screenshot
    Expected Result: Flow เดิมไม่พังหลัง polish
    Evidence: .sisyphus/evidence/task-4-detail-cart-flow.png
  ```

- [ ] 5. สร้างหน้า Checkout (ต้อง login ก่อน payment)

  **What to do**:
  - สร้าง route `/checkout` อ่านข้อมูลจาก local cart
  - ถ้า cart ว่าง ให้ redirect/guide กลับ `/cart`
  - อนุญาตดู checkout ได้ แต่ก่อนเข้า `/payment` ต้องผ่าน auth gate
  - ล็อก contract payload สำหรับ checkout summary + customer form

  **Must NOT do**:
  - ห้าม query DB ใหม่
  - ห้ามเปลี่ยน `LocalCartItem` schema โดยไม่ migration plan

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `database-schema-designer`: เฟสนี้ยังเป็น UI contract

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 6
  - **Blocked By**: 1

  **References**:
  - `app/(public)/cart/page.tsx` - source behavior สำหรับ empty cart และ summary
  - `lib/cart/local-cart.ts` - type และ helper ที่ต้องใช้ซ้ำ
  - `components/features/landing/landing-header.tsx` - auth state behavior ที่มีอยู่แล้ว

  **Acceptance Criteria**:
  - [ ] `/checkout` status 200
  - [ ] empty cart แล้วเข้า `/checkout` ต้องไม่เข้า flow จ่ายต่อ
  - [ ] มี gate บังคับ login ก่อนเปลี่ยนไป `/payment`
  - [ ] ไม่มี Supabase import ใหม่ในไฟล์ checkout

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Checkout renders with cart data
    Tool: Playwright
    Preconditions: localStorage key novatrip_cart_v1 มี mock item อย่างน้อย 1
    Steps:
      1. Navigate to /checkout
      2. Assert มีรายการสินค้าและยอดรวม
      3. Click continue to payment
      4. Assert หากยังไม่ login -> ถูกพาไป /login หรือมี login gate
      5. Screenshot
    Expected Result: Checkout ใช้ข้อมูล cart ได้และบังคับ auth ก่อน payment
    Evidence: .sisyphus/evidence/task-5-checkout-auth-gate.png

  Scenario: Empty cart protection
    Tool: Playwright
    Preconditions: localStorage novatrip_cart_v1 = []
    Steps:
      1. Navigate to /checkout
      2. Assert มี empty state หรือ redirect ไป /cart
      3. Screenshot
    Expected Result: ไม่สามารถไปขั้น payment จาก empty cart
    Evidence: .sisyphus/evidence/task-5-checkout-empty-cart.png
  ```

- [ ] 6. สร้างหน้า Payment (UI mock + states)

  **What to do**:
  - สร้าง route `/payment` ตามแบบ
  - แสดง order summary + payment states (`pending`, `success`, `failed`)
  - ล็อก contract สำหรับ payment result object (mock)

  **Must NOT do**:
  - ห้ามฝัง SDK จ่ายเงินจริง
  - ห้ามเรียก API gateway จริง

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `supabase-postgres-best-practices`: ยังไม่แตะ DB/payment transaction จริง

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7,8 after dependency)
  - **Blocks**: 7
  - **Blocked By**: 5

  **References**:
  - `app/(dashboard)/payments/page.tsx` - pattern status representation ที่ระบบใช้อยู่
  - `lib/mock-data/payments.ts` - mock structure ฝั่ง payment ที่มีอยู่
  - `app/(public)/cart/page.tsx` - order summary formatting consistency

  **Acceptance Criteria**:
  - [ ] `/payment` status 200
  - [ ] มี UI state ครบ pending/success/failed
  - [ ] mock payment result นำทางไป `/thank-you` ได้ในกรณี success

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Payment state switching
    Tool: Playwright
    Preconditions: Dev server running and authenticated test session
    Steps:
      1. Navigate to /payment
      2. Trigger pending state and assert pending indicator
      3. Trigger failed state and assert retry/error message
      4. Trigger success state and assert redirect/button to /thank-you
      5. Screenshot each state
    Expected Result: ทุก payment state ทำงานตาม mock contract
    Evidence: .sisyphus/evidence/task-6-payment-states.png
  ```

- [ ] 7. สร้างหน้า Thank You

  **What to do**:
  - สร้าง route `/thank-you`
  - แสดง booking/payment summary แบบ mock ที่สอดคล้องกับ payment result

  **Must NOT do**:
  - ห้ามผูก email/notification จริง

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`, `playwright`
  - **Skills Evaluated but Omitted**:
    - `artistry`: ไม่ต้องใช้ระดับ creative exploration สูง

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: 6

  **References**:
  - `app/(public)/cart/page.tsx` - summary/number format consistency
  - `app/(public)/layout.tsx` - public layout consistency

  **Acceptance Criteria**:
  - [ ] `/thank-you` status 200
  - [ ] มีข้อความยืนยันสำเร็จ + reference id แบบ mock

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Thank-you confirmation rendering
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /thank-you
      2. Assert confirmation headline appears
      3. Assert mock booking reference is present
      4. Assert CTA back to profile/destinations exists
      5. Screenshot
    Expected Result: หน้ายืนยันเสร็จสมบูรณ์และนำทางต่อได้
    Evidence: .sisyphus/evidence/task-7-thank-you.png
  ```

- [ ] 8. สร้างหน้า Profile ใหม่ + Redirect จาก my-bookings

  **What to do**:
  - สร้าง `/profile` ตามดีไซน์ที่ผู้ใช้ให้ (booking-centric)
  - ใส่ section labels internal ทุก section
  - ทำ redirect `/my-bookings` -> `/profile`
  - lock profile page contract (ข้อมูล user summary + booking cards + state tabs)

  **Must NOT do**:
  - ห้ามเพิ่ม query Supabase ใหม่ในหน้า profile รอบนี้
  - ห้ามลบ route เก่าแบบ hard break (ต้อง redirect เพื่อ backward compatibility)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`, `playwright`, `git-master`
  - **Skills Evaluated but Omitted**:
    - `dev-browser`: Playwright พอสำหรับ verification flow

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Redirect closure
  - **Blocked By**: 1

  **References**:
  - `app/(public)/my-bookings/page.tsx` - behavior เดิมที่ต้องไม่หายหลัง redirect
  - `components/features/landing/landing-header.tsx` - จุดเชื่อม navigation/account flow
  - `app/(public)/layout.tsx` - layout container เดียวกัน
  - `lib/supabase/client.ts` - เข้าใจ boundary ว่าหน้าใหม่ห้ามเพิ่มการเรียกใหม่ในเฟสนี้

  **Acceptance Criteria**:
  - [ ] `/profile` status 200
  - [ ] เข้า `/my-bookings` แล้วถูก redirect ไป `/profile`
  - [ ] มี booking sections ตามดีไซน์ใหม่พร้อม label ภายใน

  **Agent-Executed QA Scenarios**:
  ```text
  Scenario: Legacy route redirect
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /my-bookings
      2. Wait for navigation
      3. Assert URL equals /profile
      4. Screenshot profile landing
    Expected Result: Legacy URL redirects successfully without 404
    Evidence: .sisyphus/evidence/task-8-mybookings-redirect.png

  Scenario: Profile booking tabs render
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /profile
      2. Assert tabs/sections (e.g. upcoming/completed/cancelled) visible
      3. Assert data-section attributes exist and lowercase
      4. Screenshot
    Expected Result: Profile UI structure complete and referenceable by section label
    Evidence: .sisyphus/evidence/task-8-profile-sections.png
  ```

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `docs(plan): define section and contract convention` | `.sisyphus/*` | markdown review |
| 2-3 | `feat(public): add about and contact pages` | `app/(public)/*`, header | route + screenshot |
| 4-5 | `feat(public): polish destination and add checkout flow` | destination + checkout + cart-adjacent | flow QA |
| 6-7 | `feat(public): add payment and thank-you mock flow` | payment + thank-you | state QA |
| 8 | `feat(public): add profile page and redirect legacy bookings` | profile + redirect | redirect QA |

---

## Success Criteria

### Verification Commands
```bash
npm run dev
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/contact
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/checkout
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/payment
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/thank-you
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/profile
ast-grep --pattern 'import { supabase } from "@/lib/supabase/client"' --lang tsx app/(public)
```

### Final Checklist
- [ ] ทุกหน้า public ที่ตกลงไว้พร้อมใช้งานและผ่าน QA scenario
- [ ] มี section labels lowercase ครบและใช้อ้างอิงคุยงานได้
- [ ] ไม่มีการเชื่อม backend/payment gateway ใหม่เกิน scope
- [ ] `/my-bookings` redirect ไป `/profile` สำเร็จ
- [ ] มี evidence ครบใน `.sisyphus/evidence/`
