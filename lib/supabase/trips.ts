import { supabase } from './client';
import type {
  TripRow,
  TripInsert,
  TripUpdate,
  TripWithPackage,
  BookingWithRelations,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetTripsParams {
  packageId?: string;
  status?: TripRow['status'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function getTrips(
  params: GetTripsParams = {}
): Promise<PaginatedResponse<TripWithPackage>> {
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

  return {
    data: (data as TripWithPackage[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getTripById(
  id: string
): Promise<ServiceResponse<TripWithPackage>> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, packages(*)')
    .eq('id', id)
    .single();

  return {
    data: data as TripWithPackage | null,
    error: error?.message ?? null,
  };
}

export async function getTripBookings(
  tripId: string
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .eq('trip_id', tripId)
    .order('booking_date', { ascending: false });

  return {
    data: (data as BookingWithRelations[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function createTrip(
  input: TripInsert
): Promise<ServiceResponse<TripRow>> {
  const { data, error } = await supabase
    .from('trips')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TripRow | null,
    error: error?.message ?? null,
  };
}

export async function updateTrip(
  id: string,
  input: TripUpdate
): Promise<ServiceResponse<TripRow>> {
  const { data, error } = await supabase
    .from('trips')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TripRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteTrip(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}
