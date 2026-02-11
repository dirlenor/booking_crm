## Task 1: Schema Linkage Decisions (2026-02-08)

### Decision 1: Create New Migration Instead of Modifying Existing
**Context:** Found FK dependency order issue in existing migrations

**Options Considered:**
1. Modify existing migration file (20260207090000)
2. Create new migration to fix dependencies

**Decision:** Create new migration (20260208120000_fix_schema_dependencies.sql)

**Rationale:**
- Existing migrations may have already been applied to production
- Modifying existing migrations breaks idempotency
- New migration is safer and follows migration best practices
- Can verify and fix issues without rerunning entire schema

**Trade-offs:**
- ✅ Safe for production (no destructive changes)
- ✅ Clear audit trail of fixes
- ❌ Slightly more migration files to manage

---

### Decision 2: Use Composite Indexes for Common Query Patterns
**Context:** Need to optimize JOIN performance and filtering

**Options Considered:**
1. Single-column indexes only
2. Composite indexes matching query patterns
3. Full-text indexes for search

**Decision:** Add 6 composite indexes for common patterns

**Rationale:**
- Query patterns identified from TypeScript code:
  * Package schedule views: trips (package_id, date)
  * Calendar filtering: trips (date, status)
  * Customer history: bookings (customer_id, booking_date DESC)
  * Admin dashboards: bookings (status, payment_status)
  * Payment timeline: payments (booking_id, payment_date DESC)
- Column order matches WHERE/ORDER BY usage in actual queries
- Performance impact: Faster JOINs + filtering at cost of slightly slower INSERTs

**Trade-offs:**
- ✅ 10-100x faster for complex queries
- ✅ Matches real usage patterns in code
- ❌ Slightly slower INSERT/UPDATE (acceptable for OLTP)
- ❌ More storage space (~5-10% overhead)

---

### Decision 3: Use RESTRICT vs CASCADE for Booking FKs
**Context:** Define ON DELETE behavior for foreign keys

**Decisions Made:**
- `bookings.customer_id -> customers.id` : **RESTRICT**
- `bookings.trip_id -> trips.id` : **RESTRICT**
- `booking_passengers.booking_id -> bookings.id` : **CASCADE**
- `payments.booking_id -> bookings.id` : **CASCADE**
- `trips.package_id -> packages.id` : **CASCADE**

**Rationale:**
- RESTRICT for customers/trips: Prevent accidental deletion of customers/trips with bookings
- CASCADE for passengers/payments: Should be deleted when booking is deleted (dependent data)
- CASCADE for trips->packages: When package deleted, all trips should be removed

**Business Logic:**
- Customers and trips are core entities, should not be deleted if referenced
- Passengers and payments are booking details, have no meaning without booking
- This prevents data integrity issues and orphaned records

---

### Decision 4: Enable RLS on All Tables
**Context:** Security and access control for multi-tenant SaaS

**Decision:** Enable RLS with authenticated-only policies

**Rationale:**
- Future-proof for multi-tenant support
- Standard Supabase best practice
- Policies defined: Authenticated users full CRUD, anonymous read published packages only
- Can add tenant-specific policies later without schema changes

**Trade-offs:**
- ✅ Better security posture
- ✅ Prepared for multi-tenancy
- ❌ Slight performance overhead (minimal)
- ❌ Must use Supabase client with auth

---

### Decision 5: Use IF NOT EXISTS Pattern Throughout
**Context:** Migrations must be rerunnable and safe

**Decision:** All DDL uses IF NOT EXISTS / DO $$ guards

**Rationale:**
- Idempotent migrations can be rerun without errors
- Safe for development environments (reset database easily)
- No conflicts if migrations run out of order (e.g., during testing)
- Standard practice for production migrations

**Implementation:**
```sql
create table if not exists ...
create index if not exists ...
do $$ begin
  if not exists (select 1 from pg_constraint ...) then
    alter table ... add constraint ...
  end if;
end $$;
```

---

### Decision 6: Add Table/Column Comments
**Context:** Database schema documentation

**Decision:** Add COMMENT ON TABLE/COLUMN for key entities

**Rationale:**
- Schema self-documents (visible in pg_catalog)
- Helps future developers understand purpose
- Shows up in database tools (pgAdmin, DBeaver, etc.)
- Minimal overhead, high value for maintenance

**Examples:**
```sql
comment on table public.packages is 'Tour package definitions with options';
comment on column public.packages.options is 'JSONB array of pricing options with times';
```

