import { supabase } from '@/lib/supabase/client';
import type {
  BookingWithRelations,
  DashboardStats,
  ServiceResponse,
  TripWithPackage,
} from '@/types/database';

/** ดึงสถิติรวมหน้า Dashboard */
export async function getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
  const today = new Date().toISOString().slice(0, 10);

  const [customerCountRes, bookingCountRes, completedPaymentRes, upcomingTripCountRes] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'completed'),
    supabase.from('trips').select('id', { count: 'exact', head: true }).gte('date', today),
  ]);

  const firstError = [customerCountRes, bookingCountRes, completedPaymentRes, upcomingTripCountRes].find(
    (result) => Boolean(result.error)
  );
  if (firstError?.error) {
    return { data: null, error: firstError.error.message };
  }

  const totalRevenue = (completedPaymentRes.data ?? []).reduce((sum, row) => {
    const amount = Number((row as { amount: number }).amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    data: {
      totalCustomers: customerCountRes.count ?? 0,
      totalBookings: bookingCountRes.count ?? 0,
      totalRevenue,
      upcomingTrips: upcomingTripCountRes.count ?? 0,
      confirmedBookings: 0,
      pendingPayments: 0,
    },
    error: null,
  };
}

/** ดึงรายการ booking ล่าสุดพร้อม relations */
export async function getRecentBookings(
  limit = 10
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const safeLimit = Math.max(1, limit);
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .order('booking_date', { ascending: false })
    .limit(safeLimit);

  return {
    data: (data as BookingWithRelations[]) ?? [],
    error: error?.message ?? null,
  };
}

/** ดึงรายการทริปที่กำลังจะมาถึงพร้อมข้อมูลแพ็กเกจ */
export async function getUpcomingTrips(
  limit = 10
): Promise<ServiceResponse<TripWithPackage[]>> {
  const today = new Date().toISOString().slice(0, 10);
  const safeLimit = Math.max(1, limit);

  const { data, error } = await supabase
    .from('trips')
    .select('*, packages(*)')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(safeLimit);

  return {
    data: (data as TripWithPackage[]) ?? [],
    error: error?.message ?? null,
  };
}
