import { supabase } from '@/lib/supabase/client';
import type {
  BookingDetail,
  BookingInsert,
  BookingPassengerInsert,
  BookingPassengerRow,
  BookingRow,
  BookingStatus,
  BookingUpdate,
  BookingWithRelations,
  PaginatedData,
  ServiceResponse,
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

interface CreateBookingInput {
  booking: Omit<BookingInsert, 'booking_ref'>;
  passengers?: Omit<BookingPassengerInsert, 'booking_id'>[];
}

const BOOKING_REF_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BOOKING_REF_LENGTH = 6;
const MAX_REF_RETRY = 25;

/** ดึงรายการ booking พร้อม relation และ pagination */
export async function getBookings(
  params: GetBookingsParams = {}
): Promise<ServiceResponse<PaginatedData<BookingWithRelations>>> {
  const {
    search,
    status,
    paymentStatus,
    customerId,
    tripId,
    page = 1,
    limit = 20,
  } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))', { count: 'exact' })
    .order('booking_date', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `booking_ref.ilike.%${search}%,customers.name.ilike.%${search}%,customers.email.ilike.%${search}%`
    );
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
  if (error) {
    return { data: null, error: error.message };
  }

  const total = count ?? 0;
  return {
    data: {
      items: (data as BookingWithRelations[]) ?? [],
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

/** ดึง booking รายเดียวพร้อม customer/trip/package/passengers/payments */
export async function getBookingById(id: string): Promise<ServiceResponse<BookingDetail>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*)), booking_passengers(*), payments(*)')
    .eq('id', id)
    .single();

  return {
    data: (data as BookingDetail | null) ?? null,
    error: error?.message ?? null,
  };
}

/** สร้างเลข booking reference แบบ BK-{YYYY}-{6ALNUM} และเช็กไม่ซ้ำ */
export async function generateBookingRef(): Promise<ServiceResponse<string>> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < MAX_REF_RETRY; attempt += 1) {
    const random = Array.from({ length: BOOKING_REF_LENGTH }, () => {
      const index = Math.floor(Math.random() * BOOKING_REF_CHARSET.length);
      return BOOKING_REF_CHARSET[index];
    }).join('');
    const bookingRef = `BK-${year}-${random}`;

    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_ref', bookingRef)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }
    if (!data) {
      return { data: bookingRef, error: null };
    }
  }

  return { data: null, error: 'Unable to generate unique booking reference' };
}

/** สร้าง booking พร้อม passenger rows โดยพยายาม rollback หาก insert ผู้โดยสารล้มเหลว */
export async function createBooking(input: CreateBookingInput): Promise<ServiceResponse<BookingRow>> {
  const { data: bookingRef, error: bookingRefError } = await generateBookingRef();
  if (bookingRefError || !bookingRef) {
    return { data: null, error: bookingRefError ?? 'Failed to generate booking reference' };
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({ ...input.booking, booking_ref: bookingRef })
    .select('*')
    .single();

  if (bookingError || !booking) {
    return { data: null, error: bookingError?.message ?? 'Failed to create booking' };
  }

  const passengers = input.passengers ?? [];
  if (passengers.length > 0) {
    const passengerRows: BookingPassengerInsert[] = passengers.map((passenger) => ({
      ...passenger,
      booking_id: (booking as BookingRow).id,
    }));

    const { error: passengerError } = await supabase.from('booking_passengers').insert(passengerRows);
    if (passengerError) {
      await supabase.from('bookings').delete().eq('id', (booking as BookingRow).id);
      return { data: null, error: `Failed to create passengers: ${passengerError.message}` };
    }
  }

  return {
    data: booking as BookingRow,
    error: null,
  };
}

/** อัปเดต booking */
export async function updateBooking(
  id: string,
  input: BookingUpdate
): Promise<ServiceResponse<BookingRow>> {
  const { data, error } = await supabase
    .from('bookings')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  return {
    data: (data as BookingRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** อัปเดตเฉพาะสถานะ booking */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<ServiceResponse<BookingRow>> {
  return updateBooking(id, { status });
}

/** ลบ booking ตาม id */
export async function deleteBooking(id: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  return {
    data: null,
    error: error?.message ?? null,
  };
}

/** ดึงผู้โดยสารทั้งหมดใน booking */
export async function getBookingPassengers(
  bookingId: string
): Promise<ServiceResponse<BookingPassengerRow[]>> {
  const { data, error } = await supabase
    .from('booking_passengers')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  return {
    data: (data as BookingPassengerRow[]) ?? [],
    error: error?.message ?? null,
  };
}
