# Contract: Time & Pricing Logic Rules

เอกสารฉบับนี้กำหนดมาตรฐานการจัดการเวลา (Time) และราคา (Pricing) เพื่อให้ Frontend และ Backoffice ทำงานร่วมกันได้อย่างถูกต้องและป้องกันข้อผิดพลาดที่เคยเกิดขึ้น (เช่น Flat-rate ถูกคูณ Pax)

---

## 1. Time Source Rules

### 1.1 Runtime Truth (แหล่งข้อมูลจริง)
- **แหล่งข้อมูลเดียวที่อนุญาตให้ใช้ในระบบ Runtime คือ `trips.time` เท่านั้น**
- ข้อมูลนี้มาจาก Database Table `trips`
- ใช้สำหรับการทำ Booking, การแสดงผลใน Cart, และการออก Invoice

### 1.2 Template Source (แหล่งข้อมูลต้นแบบ)
- **`options.times` (ใน Package Option) คือ "Template" เท่านั้น**
- ใช้สำหรับ:
    1. แสดงตัวเลือกเวลาให้ User ในหน้าเลือกแพ็กเกจ (ถ้ายังไม่มี Trip ถูกสร้างไว้)
    2. ใช้เป็นค่าตั้งต้น (Default) เมื่อมีการสร้าง Trip ใหม่ในระบบ
- **ห้ามใช้ `options.times` เป็นค่าเวลาจริงในการทำ Booking** หากไม่มี `trips.time` รองรับ

### 1.3 Forbidden Fallback (ข้อห้าม)
- **ห้าม Fallback จาก `trips.time` ไปยัง `options.times` ในขั้นตอนการบันทึก Booking**
- หากในระบบไม่มี Trip ที่ระบุเวลาไว้ ต้องบังคับให้มีการระบุเวลาลงใน `trips.time` ก่อนเสมอ

---

## 2. Pricing Rules

กติกาการคำนวณราคาต้องเป็นมาตรฐานเดียวกันทั้งระบบ (Shared Logic)

### 2.1 Flat-rate Pricing (ราคาเหมา)
- **เงื่อนไข:** เมื่อ `isFlatRate === true`
- **การคำนวณ:** `Total Price = flatRatePrice`
- **ข้อห้าม:** ห้ามนำ `flatRatePrice` ไปคูณกับจำนวน Pax (`pax`) เด็ดขาด

### 2.2 Tier-based Pricing (ราคาตามจำนวนคน)
- **เงื่อนไข:** เมื่อ `isFlatRate === false`
- **การคำนวณ:** 
    1. หา `PricingTier` ที่สอดคล้องกับจำนวน `pax` (โดยที่ `minPax <= pax <= maxPax`)
    2. `Total Price = pricePerPerson * pax`
- **Fallback:** หากไม่พบ Tier ที่สอดคล้อง ให้ใช้ `base_price` ของ Package นั้นๆ คูณกับ `pax`

---

## 3. Code Implementation Examples

### 3.1 การคำนวณราคาที่ถูกต้อง (TypeScript)

```typescript
const calculatePrice = (option: PackageOption, pax: number, basePrice: number) => {
  if (option.isFlatRate && option.flatRatePrice) {
    // กฎ Flat-rate: ไม่คูณ pax
    return {
      unitPrice: option.flatRatePrice,
      total: option.flatRatePrice,
      isFlatRate: true
    };
  }

  // กฎ Tier-based: ต้องหา Tier ก่อน
  const tier = option.pricingTiers.find(t => {
    const max = t.maxPax ?? Number.POSITIVE_INFINITY;
    return pax >= t.minPax && pax <= max;
  });

  const unitPrice = tier ? tier.pricePerPerson : basePrice;
  return {
    unitPrice,
    total: unitPrice * pax,
    isFlatRate: false
  };
};
```

### 3.2 การจัดการใน Cart (Logic Fix)

เมื่อมีการอัปเดตจำนวน Pax ใน Cart ต้องเช็ค `isFlatRate` เสมอ:

```typescript
// ใน lib/cart/local-cart.ts (Correct pattern)
if (isFlatRate) {
  item.pax = nextPax; // อัปเดตจำนวนคนได้
  item.totalPrice = item.unitPrice; // แต่ราคารวมต้องคงที่ (เท่ากับราคาเหมา)
} else {
  item.pax = nextPax;
  item.totalPrice = item.unitPrice * nextPax;
}
```

---

---

## 5. UI Default Values (ไม่ใช่ Business Logic)

### 5.1 Allowed UI Defaults
ค่าเริ่มต้นต่อไปนี้ **อนุญาต** ให้ใช้ใน UI Components เพื่อให้ User Experience ดีขึ้น:

#### 5.1.1 Trip Form Modal (`components/features/trips/trip-form-modal.tsx`)
- **Default Time:** `"09:00"` (เมื่อสร้าง Trip ใหม่)
- **Rationale:** ให้ User มีค่าเริ่มต้นที่สมเหตุสมผล แต่ User ต้องเปลี่ยนแปลงได้ตามต้องการ
- **Status:** ✅ UI-only, ไม่ใช่ Business Logic

#### 5.1.2 Option Card Time Slot (`components/features/packages/price-options/option-card.tsx`)
- **Default Time Slot:** `"09:00"` (เมื่อเพิ่ม Time Slot ใหม่)
- **Rationale:** ให้ Admin มีค่าเริ่มต้นที่สมเหตุสมผล แต่ Admin ต้องเปลี่ยนแปลงได้ตามต้องการ
- **Status:** ✅ UI-only, ไม่ใช่ Business Logic

### 5.2 Mock Data (ไม่ใช่ Business Logic)
Mock data ใน `lib/mock-data/destination-detail.ts` ใช้เวลาต่างๆ (08:00, 09:00, 12:00, เป็นต้น) เพื่อแสดงตัวอย่าง:
- **Status:** ✅ Demo/Mock only, ไม่ใช่ Business Logic

---

## 6. Verification Checklist

- [ ] `docs/contracts/time-price-contracts.md` ถูกอ้างอิงใน Code Review
- [ ] Logic ใน `app/(public)/destinations/[slug]/page.tsx` ตรงตามสัญญานี้
- [ ] Logic ใน `components/features/bookings/booking-create-form.tsx` ตรงตามสัญญานี้
- [ ] Unit Test สำหรับการคำนวณราคาครอบคลุมทั้ง Flat-rate และ Tier-based
- [ ] UI Default values ใน Trip Form Modal และ Option Card ได้ถูก document แล้ว
