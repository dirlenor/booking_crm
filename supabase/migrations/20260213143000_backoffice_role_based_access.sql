create or replace function public.current_backoffice_role()
returns text
language sql
stable
as $$
  select lower(
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'backoffice_role',
      auth.jwt() -> 'user_metadata' ->> 'role',
      'customer'
    )
  );
$$;

create or replace function public.is_backoffice_admin()
returns boolean
language sql
stable
as $$
  select public.current_backoffice_role() = 'admin';
$$;

create or replace function public.is_backoffice_editor()
returns boolean
language sql
stable
as $$
  select public.current_backoffice_role() = 'editor';
$$;

create or replace function public.can_manage_products()
returns boolean
language sql
stable
as $$
  select public.current_backoffice_role() in ('admin', 'editor');
$$;

grant execute on function public.current_backoffice_role() to anon, authenticated;
grant execute on function public.is_backoffice_admin() to anon, authenticated;
grant execute on function public.is_backoffice_editor() to anon, authenticated;
grant execute on function public.can_manage_products() to anon, authenticated;

drop policy if exists "Authenticated users can read customers" on public.customers;
drop policy if exists "Authenticated users can insert customers" on public.customers;
drop policy if exists "Authenticated users can update customers" on public.customers;
drop policy if exists "Authenticated users can delete customers" on public.customers;

drop policy if exists "Authenticated users can read bookings" on public.bookings;
drop policy if exists "Authenticated users can insert bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;
drop policy if exists "Authenticated users can delete bookings" on public.bookings;

drop policy if exists "Authenticated users can read booking passengers" on public.booking_passengers;
drop policy if exists "Authenticated users can insert booking passengers" on public.booking_passengers;
drop policy if exists "Authenticated users can update booking passengers" on public.booking_passengers;
drop policy if exists "Authenticated users can delete booking passengers" on public.booking_passengers;

drop policy if exists "Authenticated users can read payments" on public.payments;
drop policy if exists "Authenticated users can insert payments" on public.payments;
drop policy if exists "Authenticated users can update payments" on public.payments;
drop policy if exists "Authenticated users can delete payments" on public.payments;

drop policy if exists "Authenticated users can read packages" on public.packages;
drop policy if exists "Authenticated users can insert packages" on public.packages;
drop policy if exists "Authenticated users can update packages" on public.packages;
drop policy if exists "Authenticated users can delete packages" on public.packages;

drop policy if exists "Authenticated users can read package itinerary items" on public.package_itinerary_items;
drop policy if exists "Authenticated users can insert package itinerary items" on public.package_itinerary_items;
drop policy if exists "Authenticated users can update package itinerary items" on public.package_itinerary_items;
drop policy if exists "Authenticated users can delete package itinerary items" on public.package_itinerary_items;

drop policy if exists "Authenticated users can read trips" on public.trips;
drop policy if exists "Authenticated users can insert trips" on public.trips;
drop policy if exists "Authenticated users can update trips" on public.trips;
drop policy if exists "Authenticated users can delete trips" on public.trips;

drop policy if exists "Authenticated can manage categories" on public.categories;
drop policy if exists "Authenticated can manage tours" on public.tours;
drop policy if exists "Authenticated can manage schedules" on public.tour_schedules;
drop policy if exists "Authenticated can manage ticket types" on public.ticket_types;
drop policy if exists "Authenticated can manage pricing" on public.ticket_pricing;
drop policy if exists "Authenticated can manage itinerary" on public.tour_itinerary;
drop policy if exists "Authenticated can manage inclusions" on public.tour_inclusions;
drop policy if exists "Authenticated can manage add-ons" on public.tour_addons;
drop policy if exists "Authenticated can manage tour policies" on public.tour_policies;

create policy "Backoffice admin can read customers"
  on public.customers for select to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can insert customers"
  on public.customers for insert to authenticated
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can update customers"
  on public.customers for update to authenticated
  using (public.is_backoffice_admin())
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can delete customers"
  on public.customers for delete to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can read bookings"
  on public.bookings for select to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can insert bookings"
  on public.bookings for insert to authenticated
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can update bookings"
  on public.bookings for update to authenticated
  using (public.is_backoffice_admin())
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can delete bookings"
  on public.bookings for delete to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can read booking passengers"
  on public.booking_passengers for select to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can insert booking passengers"
  on public.booking_passengers for insert to authenticated
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can update booking passengers"
  on public.booking_passengers for update to authenticated
  using (public.is_backoffice_admin())
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can delete booking passengers"
  on public.booking_passengers for delete to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can read payments"
  on public.payments for select to authenticated
  using (public.is_backoffice_admin());

create policy "Backoffice admin can insert payments"
  on public.payments for insert to authenticated
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can update payments"
  on public.payments for update to authenticated
  using (public.is_backoffice_admin())
  with check (public.is_backoffice_admin());

create policy "Backoffice admin can delete payments"
  on public.payments for delete to authenticated
  using (public.is_backoffice_admin());

create policy "Authenticated can read categories"
  on public.categories for select to authenticated
  using (true);

create policy "Backoffice can insert categories"
  on public.categories for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update categories"
  on public.categories for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete categories"
  on public.categories for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tours"
  on public.tours for select to authenticated
  using (true);

create policy "Backoffice can insert tours"
  on public.tours for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tours"
  on public.tours for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tours"
  on public.tours for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tour schedules"
  on public.tour_schedules for select to authenticated
  using (true);

create policy "Backoffice can insert tour schedules"
  on public.tour_schedules for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tour schedules"
  on public.tour_schedules for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tour schedules"
  on public.tour_schedules for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read ticket types"
  on public.ticket_types for select to authenticated
  using (true);

create policy "Backoffice can insert ticket types"
  on public.ticket_types for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update ticket types"
  on public.ticket_types for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete ticket types"
  on public.ticket_types for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read ticket pricing"
  on public.ticket_pricing for select to authenticated
  using (true);

create policy "Backoffice can insert ticket pricing"
  on public.ticket_pricing for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update ticket pricing"
  on public.ticket_pricing for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete ticket pricing"
  on public.ticket_pricing for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tour itinerary"
  on public.tour_itinerary for select to authenticated
  using (true);

create policy "Backoffice can insert tour itinerary"
  on public.tour_itinerary for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tour itinerary"
  on public.tour_itinerary for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tour itinerary"
  on public.tour_itinerary for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tour inclusions"
  on public.tour_inclusions for select to authenticated
  using (true);

create policy "Backoffice can insert tour inclusions"
  on public.tour_inclusions for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tour inclusions"
  on public.tour_inclusions for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tour inclusions"
  on public.tour_inclusions for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tour add-ons"
  on public.tour_addons for select to authenticated
  using (true);

create policy "Backoffice can insert tour add-ons"
  on public.tour_addons for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tour add-ons"
  on public.tour_addons for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tour add-ons"
  on public.tour_addons for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read tour policies"
  on public.tour_policies for select to authenticated
  using (true);

create policy "Backoffice can insert tour policies"
  on public.tour_policies for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update tour policies"
  on public.tour_policies for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete tour policies"
  on public.tour_policies for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read packages"
  on public.packages for select to authenticated
  using (true);

create policy "Backoffice can insert packages"
  on public.packages for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update packages"
  on public.packages for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete packages"
  on public.packages for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read package itinerary items"
  on public.package_itinerary_items for select to authenticated
  using (true);

create policy "Backoffice can insert package itinerary items"
  on public.package_itinerary_items for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update package itinerary items"
  on public.package_itinerary_items for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete package itinerary items"
  on public.package_itinerary_items for delete to authenticated
  using (public.can_manage_products());

create policy "Authenticated can read trips"
  on public.trips for select to authenticated
  using (true);

create policy "Backoffice can insert trips"
  on public.trips for insert to authenticated
  with check (public.can_manage_products());

create policy "Backoffice can update trips"
  on public.trips for update to authenticated
  using (public.can_manage_products())
  with check (public.can_manage_products());

create policy "Backoffice can delete trips"
  on public.trips for delete to authenticated
  using (public.can_manage_products());
