import { supabase } from './client';
import type {
  CustomerRow,
  CustomerInsert,
  CustomerUpdate,
  ServiceResponse,
  PaginatedResponse,
  BookingWithRelations,
} from '@/types/database';

interface GetCustomersParams {
  search?: string;
  status?: CustomerRow['status'];
  tier?: CustomerRow['tier'];
  page?: number;
  limit?: number;
}

export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<PaginatedResponse<CustomerRow>> {
  const { search, status, tier, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (tier) {
    query = query.eq('tier', tier);
  }

  const { data, error, count } = await query;

  return {
    data: (data as CustomerRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getCustomerById(
  id: string
): Promise<ServiceResponse<CustomerRow>> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  return {
    data: data as CustomerRow | null,
    error: error?.message ?? null,
  };
}

export async function getCustomerBookings(
  customerId: string
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .eq('customer_id', customerId)
    .order('booking_date', { ascending: false });

  return {
    data: (data as BookingWithRelations[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function createCustomer(
  input: Omit<CustomerInsert, 'auth_user_id'>
): Promise<ServiceResponse<CustomerRow>> {
  const { data, error } = await supabase
    .from('customers')
    .insert(input)
    .select()
    .single();

  return {
    data: data as CustomerRow | null,
    error: error?.message ?? null,
  };
}

export async function updateCustomer(
  id: string,
  input: CustomerUpdate
): Promise<ServiceResponse<CustomerRow>> {
  const { data, error } = await supabase
    .from('customers')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as CustomerRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteCustomer(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}
