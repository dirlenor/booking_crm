create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'scheduled',
  max_participants integer not null default 1,
  guide_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_status_valid check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  constraint trips_max_participants_positive check (max_participants >= 1)
);

alter table public.trips add column if not exists package_id uuid;
alter table public.trips add column if not exists date date;
alter table public.trips add column if not exists time time;
alter table public.trips add column if not exists status text;
alter table public.trips add column if not exists max_participants integer;
alter table public.trips add column if not exists guide_name text;
alter table public.trips add column if not exists created_at timestamptz;
alter table public.trips add column if not exists updated_at timestamptz;

update public.trips set status = 'scheduled' where status is null;
update public.trips set max_participants = 1 where max_participants is null or max_participants < 1;
update public.trips set created_at = now() where created_at is null;
update public.trips set updated_at = now() where updated_at is null;

alter table public.trips alter column package_id set not null;
alter table public.trips alter column date set not null;
alter table public.trips alter column time set not null;
alter table public.trips alter column status set default 'scheduled';
alter table public.trips alter column status set not null;
alter table public.trips alter column max_participants set default 1;
alter table public.trips alter column max_participants set not null;
alter table public.trips alter column created_at set default now();
alter table public.trips alter column created_at set not null;
alter table public.trips alter column updated_at set default now();
alter table public.trips alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trips_package_id_fkey'
  ) then
    alter table public.trips
      add constraint trips_package_id_fkey
      foreign key (package_id)
      references public.packages(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trips_status_valid'
  ) then
    alter table public.trips
      add constraint trips_status_valid
      check (status::text in ('scheduled', 'active', 'in-progress', 'completed', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trips_max_participants_positive'
  ) then
    alter table public.trips
      add constraint trips_max_participants_positive
      check (max_participants >= 1);
  end if;
end $$;

create index if not exists trips_package_id_idx on public.trips (package_id);
create index if not exists trips_date_idx on public.trips (date);
create index if not exists trips_status_idx on public.trips (status);

alter table public.trips enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trips' and policyname = 'Authenticated users can read trips'
  ) then
    create policy "Authenticated users can read trips"
    on public.trips
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trips' and policyname = 'Authenticated users can insert trips'
  ) then
    create policy "Authenticated users can insert trips"
    on public.trips
    for insert
    to authenticated
    with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trips' and policyname = 'Authenticated users can update trips'
  ) then
    create policy "Authenticated users can update trips"
    on public.trips
    for update
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trips' and policyname = 'Authenticated users can delete trips'
  ) then
    create policy "Authenticated users can delete trips"
    on public.trips
    for delete
    to authenticated
    using (true);
  end if;
end $$;

create or replace function public.set_trips_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trips_set_updated_at'
  ) then
    create trigger trips_set_updated_at
    before update on public.trips
    for each row
    execute function public.set_trips_updated_at();
  end if;
end $$;
