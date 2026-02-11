create table if not exists public.package_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  day_number integer not null default 1,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_itinerary_items_day_positive check (day_number >= 1),
  constraint package_itinerary_items_sort_non_negative check (sort_order >= 0)
);

create index if not exists package_itinerary_items_package_id_idx
  on public.package_itinerary_items (package_id);

create index if not exists package_itinerary_items_package_sort_idx
  on public.package_itinerary_items (package_id, sort_order, day_number);

create or replace function public.set_package_itinerary_updated_at()
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
    select 1 from pg_trigger where tgname = 'package_itinerary_items_set_updated_at'
  ) then
    create trigger package_itinerary_items_set_updated_at
    before update on public.package_itinerary_items
    for each row
    execute function public.set_package_itinerary_updated_at();
  end if;
end $$;

alter table public.package_itinerary_items enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'package_itinerary_items'
      and policyname = 'Authenticated users can read package itinerary items'
  ) then
    create policy "Authenticated users can read package itinerary items"
      on public.package_itinerary_items
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'package_itinerary_items'
      and policyname = 'Authenticated users can insert package itinerary items'
  ) then
    create policy "Authenticated users can insert package itinerary items"
      on public.package_itinerary_items
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'package_itinerary_items'
      and policyname = 'Authenticated users can update package itinerary items'
  ) then
    create policy "Authenticated users can update package itinerary items"
      on public.package_itinerary_items
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'package_itinerary_items'
      and policyname = 'Authenticated users can delete package itinerary items'
  ) then
    create policy "Authenticated users can delete package itinerary items"
      on public.package_itinerary_items
      for delete
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'package_itinerary_items'
      and policyname = 'Public can read itinerary of published packages'
  ) then
    create policy "Public can read itinerary of published packages"
      on public.package_itinerary_items
      for select
      to anon
      using (
        exists (
          select 1
          from public.packages p
          where p.id = package_itinerary_items.package_id
            and p.status = 'published'
        )
      );
  end if;
end $$;
