create extension if not exists "pgcrypto";

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'active',
  tier text not null default 'Standard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_status_check check (status in ('active', 'inactive')),
  constraint customers_tier_check check (tier in ('Standard', 'VIP', 'Platinum'))
);

alter table public.customers add column if not exists auth_user_id uuid;
alter table public.customers add column if not exists name text;
alter table public.customers add column if not exists email text;
alter table public.customers add column if not exists phone text;
alter table public.customers add column if not exists notes text;
alter table public.customers add column if not exists status text;
alter table public.customers add column if not exists tier text;
alter table public.customers add column if not exists created_at timestamptz;
alter table public.customers add column if not exists updated_at timestamptz;

update public.customers set status = 'active' where status is null;
update public.customers set tier = 'Standard' where tier is null;
update public.customers set created_at = now() where created_at is null;
update public.customers set updated_at = now() where updated_at is null;

alter table public.customers alter column name set not null;
alter table public.customers alter column email set not null;
alter table public.customers alter column status set default 'active';
alter table public.customers alter column status set not null;
alter table public.customers alter column tier set default 'Standard';
alter table public.customers alter column tier set not null;
alter table public.customers alter column created_at set default now();
alter table public.customers alter column created_at set not null;
alter table public.customers alter column updated_at set default now();
alter table public.customers alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_auth_user_id_fkey'
  ) then
    alter table public.customers
      add constraint customers_auth_user_id_fkey
      foreign key (auth_user_id)
      references auth.users(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_status_check'
  ) then
    alter table public.customers
      add constraint customers_status_check
      check (status in ('active', 'inactive'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_tier_check'
  ) then
    alter table public.customers
      add constraint customers_tier_check
      check (tier in ('Standard', 'VIP', 'Platinum'));
  end if;
end $$;

create unique index if not exists customers_email_unique_idx on public.customers (email);
create unique index if not exists customers_auth_user_id_unique_idx on public.customers (auth_user_id) where auth_user_id is not null;
create index if not exists customers_created_at_idx on public.customers (created_at desc);
create index if not exists customers_status_idx on public.customers (status);
create index if not exists customers_tier_idx on public.customers (tier);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'customers_set_updated_at'
  ) then
    create trigger customers_set_updated_at
    before update on public.customers
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end $$;

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  destination text,
  duration text,
  base_price numeric(12,2) not null default 0,
  max_pax integer not null default 1,
  status text not null default 'draft',
  category text not null default 'Cultural',
  image_url text,
  image_urls text[] not null default '{}'::text[],
  highlights text[] not null default '{}'::text[],
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_status_check check (status in ('draft', 'published', 'archived')),
  constraint packages_category_check check (category in ('Adventure', 'Cultural', 'Relaxation', 'City', 'Nature', 'Luxury')),
  constraint packages_max_pax_positive check (max_pax >= 1),
  constraint packages_base_price_non_negative check (base_price >= 0),
  constraint packages_image_urls_max_6 check (cardinality(image_urls) <= 6),
  constraint packages_options_array_check check (jsonb_typeof(options) = 'array')
);

alter table public.packages add column if not exists name text;
alter table public.packages add column if not exists description text;
alter table public.packages add column if not exists destination text;
alter table public.packages add column if not exists duration text;
alter table public.packages add column if not exists base_price numeric(12,2);
alter table public.packages add column if not exists max_pax integer;
alter table public.packages add column if not exists status text;
alter table public.packages add column if not exists category text;
alter table public.packages add column if not exists image_url text;
alter table public.packages add column if not exists image_urls text[];
alter table public.packages add column if not exists highlights text[];
alter table public.packages add column if not exists options jsonb;
alter table public.packages add column if not exists created_at timestamptz;
alter table public.packages add column if not exists updated_at timestamptz;

update public.packages set base_price = 0 where base_price is null;
update public.packages set max_pax = 1 where max_pax is null or max_pax < 1;
update public.packages set status = 'draft' where status is null;
update public.packages set category = 'Cultural' where category is null;
update public.packages set image_urls = '{}'::text[] where image_urls is null;
update public.packages set highlights = '{}'::text[] where highlights is null;
update public.packages set options = '[]'::jsonb where options is null;
update public.packages set created_at = now() where created_at is null;
update public.packages set updated_at = now() where updated_at is null;

alter table public.packages alter column name set not null;
alter table public.packages alter column base_price set default 0;
alter table public.packages alter column base_price set not null;
alter table public.packages alter column max_pax set default 1;
alter table public.packages alter column max_pax set not null;
alter table public.packages alter column status set default 'draft';
alter table public.packages alter column status set not null;
alter table public.packages alter column category set default 'Cultural';
alter table public.packages alter column category set not null;
alter table public.packages alter column image_urls set default '{}'::text[];
alter table public.packages alter column image_urls set not null;
alter table public.packages alter column highlights set default '{}'::text[];
alter table public.packages alter column highlights set not null;
alter table public.packages alter column options set default '[]'::jsonb;
alter table public.packages alter column options set not null;
alter table public.packages alter column created_at set default now();
alter table public.packages alter column created_at set not null;
alter table public.packages alter column updated_at set default now();
alter table public.packages alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_status_check'
  ) then
    alter table public.packages
      add constraint packages_status_check
      check (status in ('draft', 'published', 'archived'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_category_check'
  ) then
    alter table public.packages
      add constraint packages_category_check
      check (category in ('Adventure', 'Cultural', 'Relaxation', 'City', 'Nature', 'Luxury'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_max_pax_positive'
  ) then
    alter table public.packages
      add constraint packages_max_pax_positive
      check (max_pax >= 1);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_base_price_non_negative'
  ) then
    alter table public.packages
      add constraint packages_base_price_non_negative
      check (base_price >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_image_urls_max_6'
  ) then
    alter table public.packages
      add constraint packages_image_urls_max_6
      check (cardinality(image_urls) <= 6);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'packages_options_array_check'
  ) then
    alter table public.packages
      add constraint packages_options_array_check
      check (jsonb_typeof(options) = 'array');
  end if;
end $$;

create index if not exists packages_created_at_idx on public.packages (created_at desc);
create index if not exists packages_status_idx on public.packages (status);
create index if not exists packages_category_idx on public.packages (category);
create index if not exists packages_destination_idx on public.packages (destination);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'packages_set_updated_at'
  ) then
    create trigger packages_set_updated_at
    before update on public.packages
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  trip_id uuid not null references public.trips(id) on delete restrict,
  pax integer not null,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  booking_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_pax_positive check (pax >= 1),
  constraint bookings_total_amount_non_negative check (total_amount >= 0),
  constraint bookings_status_check check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  constraint bookings_payment_status_check check (payment_status in ('unpaid', 'partial', 'paid', 'refunded'))
);

alter table public.bookings add column if not exists booking_ref text;
alter table public.bookings add column if not exists customer_id uuid;
alter table public.bookings add column if not exists trip_id uuid;
alter table public.bookings add column if not exists pax integer;
alter table public.bookings add column if not exists total_amount numeric(12,2);
alter table public.bookings add column if not exists status text;
alter table public.bookings add column if not exists payment_status text;
alter table public.bookings add column if not exists booking_date timestamptz;
alter table public.bookings add column if not exists notes text;
alter table public.bookings add column if not exists created_at timestamptz;
alter table public.bookings add column if not exists updated_at timestamptz;

update public.bookings set booking_ref = concat('BK-', to_char(now(), 'YYYY'), '-', upper(substr(md5(random()::text), 1, 6))) where booking_ref is null;
update public.bookings set pax = 1 where pax is null or pax < 1;
update public.bookings set total_amount = 0 where total_amount is null;
update public.bookings set status = 'pending' where status is null;
update public.bookings set payment_status = 'unpaid' where payment_status is null;
update public.bookings set booking_date = now() where booking_date is null;
update public.bookings set created_at = now() where created_at is null;
update public.bookings set updated_at = now() where updated_at is null;

alter table public.bookings alter column booking_ref set not null;
alter table public.bookings alter column pax set not null;
alter table public.bookings alter column total_amount set default 0;
alter table public.bookings alter column total_amount set not null;
alter table public.bookings alter column status set default 'pending';
alter table public.bookings alter column status set not null;
alter table public.bookings alter column payment_status set default 'unpaid';
alter table public.bookings alter column payment_status set not null;
alter table public.bookings alter column booking_date set default now();
alter table public.bookings alter column booking_date set not null;
alter table public.bookings alter column created_at set default now();
alter table public.bookings alter column created_at set not null;
alter table public.bookings alter column updated_at set default now();
alter table public.bookings alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_customer_id_fkey'
  ) then
    alter table public.bookings
      add constraint bookings_customer_id_fkey
      foreign key (customer_id)
      references public.customers(id)
      on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_trip_id_fkey'
  ) then
    alter table public.bookings
      add constraint bookings_trip_id_fkey
      foreign key (trip_id)
      references public.trips(id)
      on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_pax_positive'
  ) then
    alter table public.bookings
      add constraint bookings_pax_positive
      check (pax >= 1);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_total_amount_non_negative'
  ) then
    alter table public.bookings
      add constraint bookings_total_amount_non_negative
      check (total_amount >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_status_check'
  ) then
    alter table public.bookings
      add constraint bookings_status_check
      check (status in ('pending', 'confirmed', 'completed', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_payment_status_check'
  ) then
    alter table public.bookings
      add constraint bookings_payment_status_check
      check (payment_status in ('unpaid', 'partial', 'paid', 'refunded'));
  end if;
end $$;

create unique index if not exists bookings_booking_ref_unique_idx on public.bookings (booking_ref);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
create index if not exists bookings_trip_id_idx on public.bookings (trip_id);
create index if not exists bookings_booking_date_idx on public.bookings (booking_date desc);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_payment_status_idx on public.bookings (payment_status);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'bookings_set_updated_at'
  ) then
    create trigger bookings_set_updated_at
    before update on public.bookings
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end $$;

create table if not exists public.booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  name text not null,
  type text not null,
  age integer,
  passport_number text,
  special_requests text,
  created_at timestamptz not null default now(),
  constraint booking_passengers_type_check check (type in ('Adult', 'Child', 'Infant')),
  constraint booking_passengers_age_non_negative check (age is null or age >= 0)
);

alter table public.booking_passengers add column if not exists booking_id uuid;
alter table public.booking_passengers add column if not exists name text;
alter table public.booking_passengers add column if not exists type text;
alter table public.booking_passengers add column if not exists age integer;
alter table public.booking_passengers add column if not exists passport_number text;
alter table public.booking_passengers add column if not exists special_requests text;
alter table public.booking_passengers add column if not exists created_at timestamptz;

update public.booking_passengers set created_at = now() where created_at is null;

alter table public.booking_passengers alter column booking_id set not null;
alter table public.booking_passengers alter column name set not null;
alter table public.booking_passengers alter column type set not null;
alter table public.booking_passengers alter column created_at set default now();
alter table public.booking_passengers alter column created_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'booking_passengers_booking_id_fkey'
  ) then
    alter table public.booking_passengers
      add constraint booking_passengers_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'booking_passengers_type_check'
  ) then
    alter table public.booking_passengers
      add constraint booking_passengers_type_check
      check (type in ('Adult', 'Child', 'Infant'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'booking_passengers_age_non_negative'
  ) then
    alter table public.booking_passengers
      add constraint booking_passengers_age_non_negative
      check (age is null or age >= 0);
  end if;
end $$;

create index if not exists booking_passengers_booking_id_idx on public.booking_passengers (booking_id);
create index if not exists booking_passengers_type_idx on public.booking_passengers (type);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date timestamptz not null default now(),
  method text not null,
  status text not null default 'pending',
  note text,
  slip_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_non_negative check (amount >= 0),
  constraint payments_method_check check (method in ('Credit Card', 'Bank Transfer', 'Cash', 'PromptPay')),
  constraint payments_status_check check (status in ('completed', 'pending', 'failed', 'refunded'))
);

alter table public.payments add column if not exists booking_id uuid;
alter table public.payments add column if not exists amount numeric(12,2);
alter table public.payments add column if not exists payment_date timestamptz;
alter table public.payments add column if not exists method text;
alter table public.payments add column if not exists status text;
alter table public.payments add column if not exists note text;
alter table public.payments add column if not exists slip_url text;
alter table public.payments add column if not exists created_at timestamptz;
alter table public.payments add column if not exists updated_at timestamptz;

update public.payments set amount = 0 where amount is null;
update public.payments set payment_date = now() where payment_date is null;
update public.payments set method = 'Cash' where method is null;
update public.payments set status = 'pending' where status is null;
update public.payments set created_at = now() where created_at is null;
update public.payments set updated_at = now() where updated_at is null;

alter table public.payments alter column booking_id set not null;
alter table public.payments alter column amount set not null;
alter table public.payments alter column payment_date set default now();
alter table public.payments alter column payment_date set not null;
alter table public.payments alter column method set not null;
alter table public.payments alter column status set default 'pending';
alter table public.payments alter column status set not null;
alter table public.payments alter column created_at set default now();
alter table public.payments alter column created_at set not null;
alter table public.payments alter column updated_at set default now();
alter table public.payments alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_booking_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_amount_non_negative'
  ) then
    alter table public.payments
      add constraint payments_amount_non_negative
      check (amount >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_method_check'
  ) then
    alter table public.payments
      add constraint payments_method_check
      check (method in ('Credit Card', 'Bank Transfer', 'Cash', 'PromptPay'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_status_check'
  ) then
    alter table public.payments
      add constraint payments_status_check
      check (status in ('completed', 'pending', 'failed', 'refunded'));
  end if;
end $$;

create index if not exists payments_booking_id_idx on public.payments (booking_id);
create index if not exists payments_payment_date_idx on public.payments (payment_date desc);
create index if not exists payments_status_idx on public.payments (status);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'payments_set_updated_at'
  ) then
    create trigger payments_set_updated_at
    before update on public.payments
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end $$;

alter table public.customers enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.payments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Authenticated users can read customers'
  ) then
    create policy "Authenticated users can read customers"
      on public.customers for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Authenticated users can insert customers'
  ) then
    create policy "Authenticated users can insert customers"
      on public.customers for insert to authenticated with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Authenticated users can update customers'
  ) then
    create policy "Authenticated users can update customers"
      on public.customers for update to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Authenticated users can delete customers'
  ) then
    create policy "Authenticated users can delete customers"
      on public.customers for delete to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'Public can read published packages'
  ) then
    create policy "Public can read published packages"
      on public.packages for select to anon using (status = 'published');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'Authenticated users can read packages'
  ) then
    create policy "Authenticated users can read packages"
      on public.packages for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'Authenticated users can insert packages'
  ) then
    create policy "Authenticated users can insert packages"
      on public.packages for insert to authenticated with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'Authenticated users can update packages'
  ) then
    create policy "Authenticated users can update packages"
      on public.packages for update to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'packages' and policyname = 'Authenticated users can delete packages'
  ) then
    create policy "Authenticated users can delete packages"
      on public.packages for delete to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Authenticated users can read bookings'
  ) then
    create policy "Authenticated users can read bookings"
      on public.bookings for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Authenticated users can insert bookings'
  ) then
    create policy "Authenticated users can insert bookings"
      on public.bookings for insert to authenticated with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Authenticated users can update bookings'
  ) then
    create policy "Authenticated users can update bookings"
      on public.bookings for update to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Authenticated users can delete bookings'
  ) then
    create policy "Authenticated users can delete bookings"
      on public.bookings for delete to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_passengers' and policyname = 'Authenticated users can read booking passengers'
  ) then
    create policy "Authenticated users can read booking passengers"
      on public.booking_passengers for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_passengers' and policyname = 'Authenticated users can insert booking passengers'
  ) then
    create policy "Authenticated users can insert booking passengers"
      on public.booking_passengers for insert to authenticated with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_passengers' and policyname = 'Authenticated users can update booking passengers'
  ) then
    create policy "Authenticated users can update booking passengers"
      on public.booking_passengers for update to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_passengers' and policyname = 'Authenticated users can delete booking passengers'
  ) then
    create policy "Authenticated users can delete booking passengers"
      on public.booking_passengers for delete to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Authenticated users can read payments'
  ) then
    create policy "Authenticated users can read payments"
      on public.payments for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Authenticated users can insert payments'
  ) then
    create policy "Authenticated users can insert payments"
      on public.payments for insert to authenticated with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Authenticated users can update payments'
  ) then
    create policy "Authenticated users can update payments"
      on public.payments for update to authenticated using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Authenticated users can delete payments'
  ) then
    create policy "Authenticated users can delete payments"
      on public.payments for delete to authenticated using (true);
  end if;
end $$;
