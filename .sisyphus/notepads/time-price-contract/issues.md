## Existing Type Mismatches
-  type in  and  is missing , , and  properties, causing LSP errors.
-  currently calculates  by multiplying  and  without checking for .
## Existing Type Mismatches
- `TourPackage` type in `components/features/bookings/booking-create-form.tsx` and `app/(dashboard)/bookings/page.tsx` is missing `days`, `nights`, and `options` properties, causing LSP errors.
- `local-cart.ts` currently calculates `totalPrice` by multiplying `pax` and `unitPrice` without checking for `isFlatRate`.
