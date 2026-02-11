## Task: Fix Hardcoded Times in Business Paths

### Summary
✅ **COMPLETED** - ค้นหาและจัดประเภท hardcoded times ทั้งหมด

### Findings

#### 1. Hardcoded Times Found (9 matches in 5 files)

| File | Line | Value | Type | Status |
|------|------|-------|------|--------|
| `trip-form-modal.tsx` | 67 | `"09:00"` | UI Default | ✅ Documented |
| `option-card.tsx` | 46 | `"09:00"` | UI Default | ✅ Documented |
| `destination-detail.ts` | 129, 149 | `"09:00"`, `"08:00"` | Mock Data | ✅ OK (Demo) |
| `package-options.ts` | 13 | Comment only | Documentation | ✅ OK |
| `task5-verification.md` | 84-91 | References | Documentation | ✅ OK |

#### 2. Classification

**Business Logic (ต้องแก้):** ❌ None found
- ✅ No hardcoded times in `components/features/bookings/`
- ✅ No hardcoded times in `app/` (business paths)

**UI Defaults (ได้อยู่แต่ต้อง document):** ✅ 2 items
1. `trip-form-modal.tsx:67` - Default "09:00" when creating new trip
2. `option-card.tsx:46` - Default "09:00" when adding time slot

**Mock/Demo (ไม่ต้องแก้):** ✅ 2 items
1. `destination-detail.ts` - Mock itinerary with various times
2. `package-options.ts` - Type comment example

#### 3. Actions Taken

1. ✅ Searched for all `"08:00"` and `"09:00"` occurrences
2. ✅ Classified each occurrence by type
3. ✅ Verified no hardcoded times in business logic paths
4. ✅ Documented UI defaults in `docs/contracts/time-price-contracts.md`
   - Added Section 5: "UI Default Values (ไม่ใช่ Business Logic)"
   - Documented rationale for each UI default
   - Marked as "UI-only, ไม่ใช่ Business Logic"

#### 4. Verification Results

- ✅ Grep search: No hardcoded times in business paths
- ✅ LSP diagnostics: Clean (no errors)
- ✅ Documentation: Updated with UI defaults rationale

### Conclusion

**Status:** ✅ COMPLETE

All hardcoded times have been properly classified:
- Business logic: ✅ None (clean)
- UI defaults: ✅ Documented with rationale
- Mock data: ✅ Acceptable for demo purposes

The contract `docs/contracts/time-price-contracts.md` now clearly distinguishes between:
1. **Runtime Truth:** `trips.time` (from database)
2. **Template Source:** `options.times` (for UI defaults)
3. **UI Defaults:** Allowed in components with documentation
4. **Mock Data:** Acceptable for demo/example purposes
