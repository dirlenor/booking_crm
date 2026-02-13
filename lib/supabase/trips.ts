import { supabase } from '@/lib/supabase/client';
import type {
  BookingWithRelations,
  PaginatedData,
  ServiceResponse,
  TripInsert,
  TripRow,
  TripUpdate,
  TripWithPackage,
} from '@/types/database';

interface GetTripsParams {
  packageId?: string;
  status?: TripRow['status'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/** ดึงรายการทริปพร้อม pagination และ filter */
export async function getTrips(
  params: GetTripsParams = {}
): Promise<ServiceResponse<PaginatedData<TripWithPackage>>> {
  const { packageId, status, dateFrom, dateTo, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('trips')
    .select('*, packages(*)', { count: 'exact' })
    .order('date', { ascending: true })
    .range(from, to);

  if (packageId) {
    query = query.eq('package_id', packageId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('date', dateTo);
  }

  const { data, error, count } = await query;
  if (error) {
    return { data: null, error: error.message };
  }

  const total = count ?? 0;
  return {
    data: {
      items: (data as TripWithPackage[]) ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
    error: null,
  };
}

/** ดึงข้อมูลทริปรายเดียวพร้อมข้อมูลแพ็กเกจ */
export async function getTripById(id: string): Promise<ServiceResponse<TripWithPackage>> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, packages(*)')
    .eq('id', id)
    .single();

  return {
    data: (data as TripWithPackage | null) ?? null,
    error: error?.message ?? null,
  };
}

/** ดึงรายการ bookings ของทริป */
export async function getTripBookings(
  tripId: string
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .eq('trip_id', tripId)
    .order('booking_date', { ascending: false });

  return {
    data: (data as BookingWithRelations[]) ?? [],
    error: error?.message ?? null,
  };
}

/** สร้างทริปใหม่ */
export async function createTrip(input: TripInsert): Promise<ServiceResponse<TripRow>> {
  const { data, error } = await supabase.from('trips').insert(input).select('*').single();

  return {
    data: (data as TripRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** อัปเดตทริปตาม id */
export async function updateTrip(id: string, input: TripUpdate): Promise<ServiceResponse<TripRow>> {
  const { data, error } = await supabase
    .from('trips')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  return {
    data: (data as TripRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** ลบทริปตาม id */
export async function deleteTrip(id: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  return { data: null, error: error?.message ?? null };
}
