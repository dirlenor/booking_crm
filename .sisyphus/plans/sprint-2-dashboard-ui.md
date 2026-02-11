# Sprint 2 Plan — Dashboard UI (UI-Only)

## Goal
Build the Dashboard UI with mock data only. Replace the default Next.js landing page with the Dashboard and verify the UI in browser with a screenshot.

## Scope
### In Scope
- Dashboard layout with sidebar + main content.
- Summary cards (4 metrics).
- Recent bookings table (last 5).
- Upcoming trips list (next 3).
- Quick actions (3-4 primary actions).
- Page header (welcome + date).

### Out of Scope
- Any backend/API/Supabase integration.
- Real data fetching.
- Auth, permissions, or settings.
- Mobile-first polish (desktop-first only).

## Files
### Create
- `app/(dashboard)/layout.tsx` — Dashboard shell (sidebar + content).
- `app/(dashboard)/page.tsx` — Dashboard page content.
- `components/features/dashboard/sidebar.tsx`
- `components/features/dashboard/summary-card.tsx`
- `components/features/dashboard/recent-bookings.tsx`
- `components/features/dashboard/upcoming-trips.tsx`
- `components/features/dashboard/quick-actions.tsx`
- `lib/mock-data/dashboard.ts`

### Modify
- `app/page.tsx` — remove scaffold; route to the dashboard (use the route group).

## UI Structure
### Layout
- Sidebar: logo, nav items, user block.
- Main: header row + grid sections.

### Sections
1) Header
- Title: "Dashboard"
- Subtext: "Welcome back" + date.

2) Summary Cards (4)
- Today’s Bookings
- Monthly Revenue
- Upcoming Trips
- New Customers

3) Quick Actions
- New Booking
- Add Customer
- View Trips
- Create Package

4) Recent Bookings
- Table columns: Booking ID, Customer, Package, Status, Amount.
- Use `Badge` for status.

5) Upcoming Trips
- Compact list with date, destination, seats filled.

## Component Notes
- Use existing shadcn base components: `Card`, `Button`, `Badge`, `Table`, `Input`.
- Keep tokens consistent with `app/globals.css` (bg-background, bg-card, text-foreground, etc.).
- Use `lucide-react` icons (already installed) if needed.

## Mock Data
Define static data in `lib/mock-data/dashboard.ts`:
- `summaryCards` array
- `recentBookings` array
- `upcomingTrips` array
- `quickActions` array (label, icon, intent)

## Implementation Steps
1) Remove scaffold in `app/page.tsx` and route to `app/(dashboard)/page.tsx`.
2) Build layout shell in `app/(dashboard)/layout.tsx` with sidebar.
3) Create feature components in `components/features/dashboard/`.
4) Wire mock data into the dashboard page.
5) Visual polish: spacing, card shadows, alignment, hierarchy.

## Verification
- Run dev server and open `/`.
- Use Playwright to capture a full-page screenshot:
  - `docs/phase4-build/sprint2-dashboard.png`
- Run LSP diagnostics on modified files.

## Acceptance Criteria
- Dashboard renders at root (`/`) with sidebar + all sections visible.
- No backend/API calls.
- Colors and typography match Design System.
- Screenshot captured and saved at the specified path.
