import { supabase } from './client';
import type {
  TicketPricingRow,
  TicketPricingInsert,
  TicketPricingUpdate,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetPricingParams {
  scheduleId?: string;
  ticketTypeId?: string;
  validAt?: string;
  page?: number;
  limit?: number;
}

export async function getPricing(
  params: GetPricingParams = {}
): Promise<PaginatedResponse<TicketPricingRow>> {
  const { scheduleId, ticketTypeId, validAt, page = 1, limit = 50 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('ticket_pricing')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (scheduleId) {
    query = query.eq('schedule_id', scheduleId);
  }

  if (ticketTypeId) {
    query = query.eq('ticket_type_id', ticketTypeId);
  }

  if (validAt) {
    query = query
      .lte('valid_from', validAt)
      .gte('valid_until', validAt);
  }

  const { data, error, count } = await query;

  return {
    data: (data as TicketPricingRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getPricingBySchedule(
  scheduleId: string
): Promise<ServiceResponse<TicketPricingRow[]>> {
  const { data, error } = await supabase
    .from('ticket_pricing')
    .select('*, ticket_types(*)')
    .eq('schedule_id', scheduleId);

  return {
    data: (data as TicketPricingRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function getPricingById(
  id: string
): Promise<ServiceResponse<TicketPricingRow>> {
  const { data, error } = await supabase
    .from('ticket_pricing')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return {
    data: data as TicketPricingRow | null,
    error: error?.message ?? null,
  };
}

export async function createPricing(
  input: TicketPricingInsert
): Promise<ServiceResponse<TicketPricingRow>> {
  const { data, error } = await supabase
    .from('ticket_pricing')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TicketPricingRow | null,
    error: error?.message ?? null,
  };
}

export async function createPricingBulk(
  inputs: TicketPricingInsert[]
): Promise<ServiceResponse<TicketPricingRow[]>> {
  const { data, error } = await supabase
    .from('ticket_pricing')
    .insert(inputs)
    .select();

  return {
    data: (data as TicketPricingRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function updatePricing(
  id: string,
  input: TicketPricingUpdate
): Promise<ServiceResponse<TicketPricingRow>> {
  const { data, error } = await supabase
    .from('ticket_pricing')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TicketPricingRow | null,
    error: error?.message ?? null,
  };
}

export async function deletePricing(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('ticket_pricing')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function deletePricingBySchedule(
  scheduleId: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('ticket_pricing')
    .delete()
    .eq('schedule_id', scheduleId);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function setPricingForSchedule(
  scheduleId: string,
  pricing: Array<{
    ticket_type_id: string;
    base_price: number;
    sale_price?: number;
    quantity_available?: number;
  }>
): Promise<ServiceResponse<TicketPricingRow[]>> {
  const { data: existing } = await supabase
    .from('ticket_pricing')
    .select('id')
    .eq('schedule_id', scheduleId);

  if (existing && existing.length > 0) {
    await supabase
      .from('ticket_pricing')
      .delete()
      .eq('schedule_id', scheduleId);
  }

  const pricingData = pricing.map((p) => ({
    schedule_id: scheduleId,
    ticket_type_id: p.ticket_type_id,
    base_price: p.base_price,
    sale_price: p.sale_price ?? null,
    quantity_available: p.quantity_available ?? null,
    currency: 'THB' as const,
  }));

  const { data, error } = await supabase
    .from('ticket_pricing')
    .insert(pricingData)
    .select();

  return {
    data: (data as TicketPricingRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export function calculateTotalPrice(
  pricing: TicketPricingRow[],
  quantities: Record<string, number>
): {
  subtotal: number;
  discount: number;
  total: number;
  breakdown: Array<{
    ticket_type_id: string;
    quantity: number;
    unit_price: number;
    original_price: number;
    total: number;
  }>;
} {
  let subtotal = 0;
  let totalDiscount = 0;
  const breakdown = [];

  for (const price of pricing) {
    const quantity = quantities[price.ticket_type_id] ?? 0;
    if (quantity <= 0) continue;

    const unitPrice = price.sale_price ?? price.base_price;
    const originalPrice = price.base_price;
    const lineTotal = unitPrice * quantity;
    const lineOriginalTotal = originalPrice * quantity;

    subtotal += lineOriginalTotal;
    totalDiscount += lineOriginalTotal - lineTotal;

    breakdown.push({
      ticket_type_id: price.ticket_type_id,
      quantity,
      unit_price: unitPrice,
      original_price: originalPrice,
      total: lineTotal,
    });
  }

  return {
    subtotal,
    discount: totalDiscount,
    total: subtotal - totalDiscount,
    breakdown,
  };
}
