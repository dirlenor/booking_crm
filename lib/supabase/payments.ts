import { supabase } from './client';
import type {
  PaymentRow,
  PaymentInsert,
  PaymentUpdate,
  PaymentWithBooking,
  ServiceResponse,
  PaginatedResponse,
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

export async function getPayments(
  params: GetPaymentsParams = {}
): Promise<PaginatedResponse<PaymentWithBooking>> {
  const { search, status, method, bookingId, dateFrom, dateTo, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('payments')
    .select('*, bookings(*, customers(*), trips(*, packages(*)))', { count: 'exact' })
    .order('payment_date', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`note.ilike.%${search}%`);
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

  return {
    data: (data as PaymentWithBooking[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getPaymentById(
  id: string
): Promise<ServiceResponse<PaymentWithBooking>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, bookings(*, customers(*), trips(*, packages(*)))')
    .eq('id', id)
    .single();

  return {
    data: data as PaymentWithBooking | null,
    error: error?.message ?? null,
  };
}

export async function getPaymentsByBooking(
  bookingId: string
): Promise<ServiceResponse<PaymentRow[]>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('payment_date', { ascending: false });

  return {
    data: (data as PaymentRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function recordPayment(
  input: PaymentInsert
): Promise<ServiceResponse<PaymentRow>> {
  const { data: payment, error: payError } = await supabase
    .from('payments')
    .insert(input)
    .select()
    .single();

  if (payError || !payment) {
    return {
      data: null,
      error: payError?.message ?? 'Failed to record payment',
    };
  }

  await syncBookingPaymentStatus(input.booking_id);

  return {
    data: payment as PaymentRow,
    error: null,
  };
}

export async function updatePayment(
  id: string,
  input: PaymentUpdate
): Promise<ServiceResponse<PaymentRow>> {
  const { data: existing, error: fetchErr } = await supabase
    .from('payments')
    .select('booking_id')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) {
    return { data: null, error: fetchErr?.message ?? 'Payment not found' };
  }

  const { data, error } = await supabase
    .from('payments')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    await syncBookingPaymentStatus((existing as { booking_id: string }).booking_id);
  }

  return {
    data: data as PaymentRow | null,
    error: error?.message ?? null,
  };
}

export async function deletePayment(
  id: string
): Promise<ServiceResponse<null>> {
  const { data: existing, error: fetchErr } = await supabase
    .from('payments')
    .select('booking_id')
    .eq('id', id)
    .single();

  if (fetchErr || !existing) {
    return { data: null, error: fetchErr?.message ?? 'Payment not found' };
  }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (!error) {
    await syncBookingPaymentStatus((existing as { booking_id: string }).booking_id);
  }

  return {
    data: null,
    error: error?.message ?? null,
  };
}

async function syncBookingPaymentStatus(bookingId: string): Promise<void> {
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('booking_id', bookingId)
    .eq('status', 'completed');

  const totalPaid = (payments ?? []).reduce(
    (sum, p) => sum + Number((p as { amount: number }).amount),
    0
  );

  const { data: booking } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('id', bookingId)
    .single();

  if (!booking) return;

  const totalAmount = Number((booking as { total_amount: number }).total_amount);

  let paymentStatus: 'unpaid' | 'partial' | 'paid';
  if (totalPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  } else {
    paymentStatus = 'unpaid';
  }

  await supabase
    .from('bookings')
    .update({ payment_status: paymentStatus })
    .eq('id', bookingId);
}
