import { supabase } from '@/lib/supabase/client';
import type {
  BookingRow,
  PaginatedData,
  PaymentInsert,
  PaymentRow,
  PaymentUpdate,
  PaymentWithBooking,
  ServiceResponse,
} from '@/types/database';

interface GetPaymentsParams {
  search?: string;
  status?: PaymentRow['status'];
  method?: PaymentRow['method'];
  bookingId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/** ดึงรายการ payment พร้อม relation และ pagination */
export async function getPayments(
  params: GetPaymentsParams = {}
): Promise<ServiceResponse<PaginatedData<PaymentWithBooking>>> {
  const { search, status, method, bookingId, dateFrom, dateTo, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('payments')
    .select('*, bookings(*, customers(*), trips(*, packages(*)))', { count: 'exact' })
    .order('payment_date', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`note.ilike.%${search}%,bookings.booking_ref.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (method) {
    query = query.eq('method', method);
  }
  if (bookingId) {
    query = query.eq('booking_id', bookingId);
  }
  if (dateFrom) {
    query = query.gte('payment_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('payment_date', dateTo);
  }

  const { data, error, count } = await query;
  if (error) {
    return { data: null, error: error.message };
  }

  const total = count ?? 0;
  return {
    data: {
      items: (data as PaymentWithBooking[]) ?? [],
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

/** ดึง payment รายเดียว */
export async function getPaymentById(id: string): Promise<ServiceResponse<PaymentWithBooking>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, bookings(*, customers(*), trips(*, packages(*)))')
    .eq('id', id)
    .single();

  return {
    data: (data as PaymentWithBooking | null) ?? null,
    error: error?.message ?? null,
  };
}

/** ดึง payment ทั้งหมดตาม booking */
export async function getPaymentsByBooking(
  bookingId: string
): Promise<ServiceResponse<PaymentRow[]>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('payment_date', { ascending: false });

  return {
    data: (data as PaymentRow[]) ?? [],
    error: error?.message ?? null,
  };
}

/** บันทึก payment และ sync booking.payment_status อัตโนมัติ */
export async function recordPayment(input: PaymentInsert): Promise<ServiceResponse<PaymentRow>> {
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert(input)
    .select('*')
    .single();

  if (paymentError || !payment) {
    return { data: null, error: paymentError?.message ?? 'Failed to record payment' };
  }

  const { error: syncError } = await syncBookingPaymentStatus(input.booking_id);
  if (syncError) {
    return { data: null, error: syncError };
  }

  return {
    data: payment as PaymentRow,
    error: null,
  };
}

/** อัปเดต payment และ sync payment_status ของ booking */
export async function updatePayment(
  id: string,
  input: PaymentUpdate
): Promise<ServiceResponse<PaymentRow>> {
  const { data: existing, error: findError } = await supabase
    .from('payments')
    .select('booking_id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    return { data: null, error: findError?.message ?? 'Payment not found' };
  }

  const { data, error } = await supabase
    .from('payments')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const bookingId = (existing as Pick<PaymentRow, 'booking_id'>).booking_id;
  const { error: syncError } = await syncBookingPaymentStatus(bookingId);
  if (syncError) {
    return { data: null, error: syncError };
  }

  return {
    data: (data as PaymentRow | null) ?? null,
    error: null,
  };
}

/** ลบ payment และ sync payment_status ของ booking */
export async function deletePayment(id: string): Promise<ServiceResponse<null>> {
  const { data: existing, error: findError } = await supabase
    .from('payments')
    .select('booking_id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    return { data: null, error: findError?.message ?? 'Payment not found' };
  }

  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) {
    return { data: null, error: error.message };
  }

  const bookingId = (existing as Pick<PaymentRow, 'booking_id'>).booking_id;
  const { error: syncError } = await syncBookingPaymentStatus(bookingId);
  if (syncError) {
    return { data: null, error: syncError };
  }

  return { data: null, error: null };
}

async function syncBookingPaymentStatus(bookingId: string): Promise<ServiceResponse<null>> {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id,total_amount')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return { data: null, error: bookingError?.message ?? 'Booking not found' };
  }

  const { data: completedPayments, error: paymentError } = await supabase
    .from('payments')
    .select('amount')
    .eq('booking_id', bookingId)
    .eq('status', 'completed');

  if (paymentError) {
    return { data: null, error: paymentError.message };
  }

  const paidAmount = (completedPayments ?? []).reduce((sum, row) => {
    const amount = Number((row as Pick<PaymentRow, 'amount'>).amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const totalAmount = Number((booking as Pick<BookingRow, 'total_amount'>).total_amount);
  const normalizedTotal = Number.isFinite(totalAmount) && totalAmount > 0 ? totalAmount : 0;

  let paymentStatus: BookingRow['payment_status'] = 'unpaid';
  if (paidAmount >= normalizedTotal && normalizedTotal > 0) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partial';
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ payment_status: paymentStatus })
    .eq('id', bookingId);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return { data: null, error: null };
}
