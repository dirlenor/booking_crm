# Sprint 3 Plan — Customers Module (UI-Only)

## Goal
Build Customers List and Customer Profile UI with mock data only. No backend/API work.

## Scope
### In Scope
- Customers list page at `/customers`
- Customer profile page at `/customers/:id`
- Search + filter UI (visual only)
- Tabs for Info + Bookings history (visual only)

### Out of Scope
- API/Supabase integration
- Real CRUD actions
- Auth / permissions

## File Structure
### Create
- `app/(dashboard)/customers/page.tsx`
- `app/(dashboard)/customers/[id]/page.tsx`
- `components/features/customers/`
  - `customer-table.tsx`
  - `customer-row.tsx`
  - `customer-search.tsx`
  - `customer-profile-header.tsx`
  - `customer-info-tab.tsx`
  - `customer-bookings-tab.tsx`
  - `customer-avatar.tsx`
- `lib/mock-data/customers.ts`

## UI Sections
### Customers List
- Page header + subtext
- Search input + status filter (UI only)
- Table: Name, Status, Phone, Total Bookings, Total Spent, Last Booking

### Customer Profile
- Header: avatar, name, contact, status badge, action buttons
- Tabs: Info + Bookings
- Info: stats cards + contact details
- Bookings: table of past bookings

## Mock Data
`lib/mock-data/customers.ts`
- `Customer` interface
- `CustomerBooking` interface
- `customers` array (8–10 entries, Thai-realistic names)
- `customerBookings` map keyed by customer id

## Implementation Steps
1) Create mock data and types.
2) Build Customers List components and page.
3) Build Customer Profile components and page.
4) Polish spacing, states, and hierarchy.
5) Verify in browser and capture screenshots.

## Verification
- Playwright screenshots:
  - `docs/phase4-build/sprint3-customers-list.png`
  - `docs/phase4-build/sprint3-customer-profile.png`
- LSP diagnostics on all modified files.

## Constraints
- Use existing design tokens (`app/globals.css`).
- Use shadcn base components only (`Card`, `Button`, `Input`, `Table`, `Badge`).
- UI-first: no backend/API.
