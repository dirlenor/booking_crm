-- Migration: Fix schema dependencies and ensure complete linkage
-- Purpose: Ensure trips exists before bookings FK, verify all constraints/indexes

-- ============================================
-- 1. ENSURE TRIPS TABLE EXISTS (should be created by earlier migration)
-- ============================================

-- trips table should exist from 20260208091000_create_trips_table.sql
-- This is just a safety check
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'scheduled',
  max_participants integer not null default 1,
  guide_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================

-- Ensure bookings.trip_id -> trips.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'bookings_trip_id_fkey' 
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_trip_id_fkey
      foreign key (trip_id)
      references public.trips(id)
      on delete restrict;
  end if;
end $$;

-- Ensure bookings.customer_id -> customers.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'bookings_customer_id_fkey'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_customer_id_fkey
      foreign key (customer_id)
      references public.customers(id)
      on delete restrict;
  end if;
end $$;

-- Ensure trips.package_id -> packages.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'trips_package_id_fkey'
      and conrelid = 'public.trips'::regclass
  ) then
    alter table public.trips
      add constraint trips_package_id_fkey
      foreign key (package_id)
      references public.packages(id)
      on delete cascade;
  end if;
end $$;

-- Ensure booking_passengers.booking_id -> bookings.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'booking_passengers_booking_id_fkey'
      and conrelid = 'public.booking_passengers'::regclass
  ) then
    alter table public.booking_passengers
      add constraint booking_passengers_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete cascade;
  end if;
end $$;

-- Ensure payments.booking_id -> bookings.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'payments_booking_id_fkey'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete cascade;
  end if;
end $$;

-- Ensure package_itinerary_items.package_id -> packages.id FK exists
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'package_itinerary_items_package_id_fkey'
      and conrelid = 'public.package_itinerary_items'::regclass
  ) then
    alter table public.package_itinerary_items
      add constraint package_itinerary_items_package_id_fkey
      foreign key (package_id)
      references public.packages(id)
      on delete cascade;
  end if;
end $$;

-- ============================================
-- 3. VERIFY INDEXES ON FOREIGN KEYS (Critical for JOIN performance)
-- ============================================

-- Index on bookings.trip_id (for JOIN with trips)
create index if not exists bookings_trip_id_idx 
  on public.bookings (trip_id);

-- Index on bookings.customer_id (for JOIN with customers)
create index if not exists bookings_customer_id_idx 
  on public.bookings (customer_id);

-- Index on trips.package_id (for JOIN with packages)
create index if not exists trips_package_id_idx 
  on public.trips (package_id);

-- Index on booking_passengers.booking_id (for JOIN with bookings)
create index if not exists booking_passengers_booking_id_idx 
  on public.booking_passengers (booking_id);

-- Index on payments.booking_id (for JOIN with bookings)
create index if not exists payments_booking_id_idx 
  on public.payments (booking_id);

-- Index on package_itinerary_items.package_id (for JOIN with packages)
create index if not exists package_itinerary_items_package_id_idx 
  on public.package_itinerary_items (package_id);

-- ============================================
-- 4. ADD COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Composite index for trip lookup by package + date
create index if not exists trips_package_date_idx 
  on public.trips (package_id, date);

-- Composite index for trip lookup by date + status (for calendar views)
create index if not exists trips_date_status_idx 
  on public.trips (date, status);

-- Composite index for bookings by customer + date
create index if not exists bookings_customer_date_idx 
  on public.bookings (customer_id, booking_date desc);

-- Composite index for bookings by status + payment_status (for filtering)
create index if not exists bookings_status_payment_idx 
  on public.bookings (status, payment_status);

-- Composite index for payments by booking + date
create index if not exists payments_booking_date_idx 
  on public.payments (booking_id, payment_date desc);

-- ============================================
-- 5. VERIFY RLS POLICIES EXIST
-- ============================================

-- Enable RLS on all tables (idempotent)
alter table public.customers enable row level security;
alter table public.packages enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.payments enable row level security;
alter table public.package_itinerary_items enable row level security;

-- Policies are already created in earlier migrations, just verify they exist
-- (RLS policies are created in 20260207090000_create_core_booking_entities.sql
--  and 20260208091000_create_trips_table.sql)

-- ============================================
-- 6. ADD HELPFUL COMMENTS
-- ============================================

comment on table public.customers is 'Customer records with tier system';
comment on table public.packages is 'Tour package definitions with options';
comment on table public.trips is 'Scheduled trip instances from packages';
comment on table public.bookings is 'Booking records linking customers to trips';
comment on table public.booking_passengers is 'Passenger details for each booking';
comment on table public.payments is 'Payment records with slip upload support';
comment on table public.package_itinerary_items is 'Day-by-day itinerary for packages';

comment on column public.packages.options is 'JSONB array of pricing options with times';
comment on column public.packages.image_urls is 'Array of image URLs (max 6)';
comment on column public.bookings.booking_ref is 'Human-readable booking reference';
comment on column public.bookings.payment_status is 'Payment progress: unpaid/partial/paid/refunded';
comment on column public.trips.status is 'Trip status: scheduled/active/completed/cancelled';
