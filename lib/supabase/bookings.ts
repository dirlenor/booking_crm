import { supabase } from './client';
import type {
  BookingRow,
  BookingInsert,
  BookingUpdate,
  BookingWithRelations,
  BookingDetail,
  BookingPassengerRow,
  BookingPassengerInsert,
  BookingStatus,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetBookingsParams {
  search?: string;
  status?: BookingStatus;
  paymentStatus?: BookingRow['payment_status'];
  customerId?: string;
  tripId?: string;
  page?: number;
  limit?: number;
}

export async function getBookings(
  params: GetBookingsParams = {}
): Promise<PaginatedResponse<BookingWithRelations>> {
  const { search, status, paymentStatus, customerId, tripId, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))', { count: 'exact' })
    .order('booking_date', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`booking_ref.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (paymentStatus) {
    query = query.eq('payment_status', paymentStatus);
  }
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error, count } = await query;

  return {
    data: (data as BookingWithRelations[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getBookingById(
  id: string
): Promise<ServiceResponse<BookingDetail>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*)), booking_passengers(*), payments(*)')
    .eq('id', id)
    .single();

  return {
    data: data as BookingDetail | null,
    error: error?.message ?? null,
  };
}

export async function generateBookingRef(): Promise<string> {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref: string;
  let exists = true;

  do {
    const random = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    ref = `BK-${year}-${random}`;

    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_ref', ref)
      .maybeSingle();

    exists = data !== null;
  } while (exists);

  return ref!;
}

export async function createBooking(
  input: Omit<BookingInsert, 'booking_ref'>,
  passengers?: Omit<BookingPassengerInsert, 'booking_id'>[]
): Promise<ServiceResponse<BookingRow>> {
  const bookingRef = await generateBookingRef();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({ ...input, booking_ref: bookingRef })
    .select()
    .single();

  if (bookingError || !booking) {
    return {
      data: null,
      error: bookingError?.message ?? 'Failed to create booking',
    };
  }

  if (passengers && passengers.length > 0) {
    const passengerRows = passengers.map((p) => ({
      ...p,
      booking_id: (booking as BookingRow).id,
    }));

    const { error: passError } = await supabase
      .from('booking_passengers')
      .insert(passengerRows);

    if (passError) {
      return {
        data: booking as BookingRow,
        error: `Booking created but passengers failed: ${passError.message}`,
      };
    }
  }

  return {
    data: booking as BookingRow,
    error: null,
  };
}

export async function updateBooking(
  id: string,
  input: BookingUpdate
): Promise<ServiceResponse<BookingRow>> {
  const { data, error } = await supabase
    .from('bookings')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as BookingRow | null,
    error: error?.message ?? null,
  };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<ServiceResponse<BookingRow>> {
  return updateBooking(id, { status });
}

export async function deleteBooking(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function getBookingPassengers(
  bookingId: string
): Promise<ServiceResponse<BookingPassengerRow[]>> {
  const { data, error } = await supabase
    .from('booking_passengers')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at');

  return {
    data: (data as BookingPassengerRow[]) ?? null,
    error: error?.message ?? null,
  };
}
