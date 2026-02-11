import { supabase } from './client';
import type {
  DashboardStats,
  BookingWithRelations,
  TripWithPackage,
  ServiceResponse,
} from '@/types/database';

export async function getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
  const today = new Date().toISOString().split('T')[0];

  const [customersRes, bookingsRes, revenueRes, upcomingRes, confirmedRes, pendingPayRes] =
    await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed'),
      supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .gte('date', today)
        .in('status', ['scheduled', 'active']),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'confirmed'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('payment_status', ['unpaid', 'partial']),
    ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum, row) => sum + Number((row as { amount: number }).amount),
    0
  );

  const stats: DashboardStats = {
    totalCustomers: customersRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    totalRevenue,
    upcomingTrips: upcomingRes.count ?? 0,
    confirmedBookings: confirmedRes.count ?? 0,
    pendingPayments: pendingPayRes.count ?? 0,
  };

  const hasError = [customersRes, bookingsRes, revenueRes, upcomingRes, confirmedRes, pendingPayRes]
    .find((r) => r.error);

  return {
    data: stats,
    error: hasError ? hasError.error?.message ?? 'Failed to fetch stats' : null,
  };
}

export async function getRecentBookings(
  limit = 10
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .order('booking_date', { ascending: false })
    .limit(limit);

  return {
    data: (data as BookingWithRelations[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function getUpcomingTrips(
  limit = 10
): Promise<ServiceResponse<TripWithPackage[]>> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('trips')
    .select('*, packages(*)')
    .gte('date', today)
    .in('status', ['scheduled', 'active'])
    .order('date', { ascending: true })
    .limit(limit);

  return {
    data: (data as TripWithPackage[]) ?? null,
    error: error?.message ?? null,
  };
}
