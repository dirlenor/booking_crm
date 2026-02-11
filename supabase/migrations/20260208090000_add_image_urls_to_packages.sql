alter table public.packages
add column if not exists image_urls text[] not null default '{}'::text[];

update public.packages
set image_urls = array[image_url]
where image_url is not null
  and coalesce(cardinality(image_urls), 0) = 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'packages_image_urls_max_6'
  ) then
    alter table public.packages
    add constraint packages_image_urls_max_6
    check (cardinality(image_urls) <= 6);
  end if;
end $$;
