import { supabase } from './client';
import type {
  TicketTypeRow,
  TicketTypeInsert,
  TicketTypeUpdate,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetTicketTypesParams {
  tourId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getTicketTypes(
  params: GetTicketTypesParams = {}
): Promise<PaginatedResponse<TicketTypeRow>> {
  const { tourId, isActive, page = 1, limit = 50 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('ticket_types')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .range(from, to);

  if (tourId) {
    query = query.eq('tour_id', tourId);
  }

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const { data, error, count } = await query;

  return {
    data: (data as TicketTypeRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getLatestTicketTypes(
  limit = 5
): Promise<ServiceResponse<TicketTypeRow[]>> {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return {
    data: (data as TicketTypeRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function getTicketTypeById(
  id: string
): Promise<ServiceResponse<TicketTypeRow>> {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return {
    data: data as TicketTypeRow | null,
    error: error?.message ?? null,
  };
}

export async function createTicketType(
  input: TicketTypeInsert
): Promise<ServiceResponse<TicketTypeRow>> {
  const { data, error } = await supabase
    .from('ticket_types')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TicketTypeRow | null,
    error: error?.message ?? null,
  };
}

export async function createTicketTypesBulk(
  inputs: TicketTypeInsert[]
): Promise<ServiceResponse<TicketTypeRow[]>> {
  const { data, error } = await supabase
    .from('ticket_types')
    .insert(inputs)
    .select();

  return {
    data: (data as TicketTypeRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateTicketType(
  id: string,
  input: TicketTypeUpdate
): Promise<ServiceResponse<TicketTypeRow>> {
  const { data, error } = await supabase
    .from('ticket_types')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TicketTypeRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteTicketType(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('ticket_types')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function deleteTicketTypesByTour(
  tourId: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('ticket_types')
    .delete()
    .eq('tour_id', tourId);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export function validateTicketTypeCode(code: string): boolean {
  return /^[A-Z]{2,5}$/.test(code);
}

export function getDefaultTicketTypes(tourId: string): TicketTypeInsert[] {
  return [
    {
      tour_id: tourId,
      name: 'Adult',
      code: 'ADT',
      description: 'Ages 13-59',
      min_age: 13,
      max_age: 59,
      sort_order: 1,
      is_active: true,
      requires_id_proof: false,
      max_quantity_per_booking: null,
    },
    {
      tour_id: tourId,
      name: 'Child',
      code: 'CHD',
      description: 'Ages 3-12',
      min_age: 3,
      max_age: 12,
      sort_order: 2,
      is_active: true,
      requires_id_proof: false,
      max_quantity_per_booking: null,
    },
    {
      tour_id: tourId,
      name: 'Infant',
      code: 'INF',
      description: 'Ages 0-2',
      min_age: 0,
      max_age: 2,
      sort_order: 3,
      is_active: true,
      requires_id_proof: false,
      max_quantity_per_booking: null,
    },
  ];
}
