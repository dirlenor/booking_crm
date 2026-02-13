import { supabase } from '@/lib/supabase/client';
import type {
  BookingWithRelations,
  CustomerInsert,
  CustomerRow,
  CustomerUpdate,
  PaginatedData,
  ServiceResponse,
} from '@/types/database';

interface GetCustomersParams {
  search?: string;
  status?: CustomerRow['status'];
  tier?: CustomerRow['tier'];
  page?: number;
  limit?: number;
}

/** ดึงรายการลูกค้าพร้อม pagination และ filter */
export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<ServiceResponse<PaginatedData<CustomerRow>>> {
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
  if (error) {
    return { data: null, error: error.message };
  }

  const total = count ?? 0;
  return {
    data: {
      items: (data as CustomerRow[]) ?? [],
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

/** ดึงข้อมูลลูกค้ารายเดียวจาก id */
export async function getCustomerById(id: string): Promise<ServiceResponse<CustomerRow>> {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

  return {
    data: (data as CustomerRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** ดึงประวัติการจองของลูกค้า */
export async function getCustomerBookings(
  customerId: string
): Promise<ServiceResponse<BookingWithRelations[]>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(*), trips(*, packages(*))')
    .eq('customer_id', customerId)
    .order('booking_date', { ascending: false });

  return {
    data: (data as BookingWithRelations[]) ?? [],
    error: error?.message ?? null,
  };
}

/** สร้างลูกค้าใหม่ */
export async function createCustomer(data: CustomerInsert): Promise<ServiceResponse<CustomerRow>> {
  const { data: created, error } = await supabase
    .from('customers')
    .insert(data)
    .select('*')
    .single();

  return {
    data: (created as CustomerRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** อัปเดตข้อมูลลูกค้า */
export async function updateCustomer(
  id: string,
  data: CustomerUpdate
): Promise<ServiceResponse<CustomerRow>> {
  const { data: updated, error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  return {
    data: (updated as CustomerRow | null) ?? null,
    error: error?.message ?? null,
  };
}

/** ลบลูกค้าตาม id */
export async function deleteCustomer(id: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  return { data: null, error: error?.message ?? null };
}
