import { supabase } from './client';
import type {
  TourScheduleRow,
  TourScheduleInsert,
  TourScheduleUpdate,
  ScheduleWithPricing,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetSchedulesParams {
  tourId?: string;
  status?: TourScheduleRow['status'];
  dateFrom?: string;
  dateTo?: string;
  includePricing?: boolean;
  page?: number;
  limit?: number;
}

export async function getSchedules(
  params: GetSchedulesParams = {}
): Promise<PaginatedResponse<TourScheduleRow>> {
  const {
    tourId,
    status,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
  } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('tour_schedules')
    .select('*', { count: 'exact' })
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true })
    .range(from, to);

  if (tourId) {
    query = query.eq('tour_id', tourId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (dateFrom) {
    query = query.gte('start_date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('start_date', dateTo);
  }

  const { data, error, count } = await query;

  return {
    data: (data as TourScheduleRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getSchedulesWithPricing(
  tourId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ServiceResponse<ScheduleWithPricing[]>> {
  let query = supabase
    .from('tour_schedules')
    .select(`
      *,
      ticket_pricing(
        *,
        ticket_types(*)
      )
    `)
    .eq('tour_id', tourId)
    .order('start_date', { ascending: true });

  if (dateFrom) {
    query = query.gte('start_date', dateFrom);
  }

  if (dateTo) {
    query = query.lte('start_date', dateTo);
  }

  const { data, error } = await query;

  return {
    data: (data as ScheduleWithPricing[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function getScheduleById(
  id: string
): Promise<ServiceResponse<ScheduleWithPricing>> {
  const { data, error } = await supabase
    .from('tour_schedules')
    .select(`
      *,
      ticket_pricing(
        *,
        ticket_types(*)
      )
    `)
    .eq('id', id)
    .maybeSingle();

  return {
    data: data as ScheduleWithPricing | null,
    error: error?.message ?? null,
  };
}

export async function createSchedule(
  input: TourScheduleInsert
): Promise<ServiceResponse<TourScheduleRow>> {
  const { data, error } = await supabase
    .from('tour_schedules')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TourScheduleRow | null,
    error: error?.message ?? null,
  };
}

export async function createSchedulesBulk(
  inputs: TourScheduleInsert[]
): Promise<ServiceResponse<TourScheduleRow[]>> {
  const { data, error } = await supabase
    .from('tour_schedules')
    .insert(inputs)
    .select();

  return {
    data: (data as TourScheduleRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function updateSchedule(
  id: string,
  input: TourScheduleUpdate
): Promise<ServiceResponse<TourScheduleRow>> {
  const { data, error } = await supabase
    .from('tour_schedules')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TourScheduleRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteSchedule(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tour_schedules')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function deleteSchedulesByTour(
  tourId: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tour_schedules')
    .delete()
    .eq('tour_id', tourId);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function updateAvailableCapacity(
  scheduleId: string,
  delta: number
): Promise<ServiceResponse<TourScheduleRow>> {
  const { data: current } = await supabase
    .from('tour_schedules')
    .select('available_capacity')
    .eq('id', scheduleId)
    .single();

  const newCapacity = (current?.available_capacity ?? 0) + delta;

  const { data, error } = await supabase
    .from('tour_schedules')
    .update({
      available_capacity: Math.max(0, newCapacity),
      status: newCapacity <= 0 ? 'full' : undefined,
    })
    .eq('id', scheduleId)
    .select()
    .single();

  return {
    data: data as TourScheduleRow | null,
    error: error?.message ?? null,
  };
}

export async function checkScheduleAvailability(
  scheduleId: string,
  requestedQuantity: number
): Promise<{
  available: boolean;
  availableCapacity: number;
  message?: string;
}> {
  const { data, error } = await supabase
    .from('tour_schedules')
    .select('available_capacity, status, start_date, booking_cutoff_hours')
    .eq('id', scheduleId)
    .single();

  if (error || !data) {
    return {
      available: false,
      availableCapacity: 0,
      message: 'Schedule not found',
    };
  }

  if (data.status === 'full' || data.status === 'closed' || data.status === 'cancelled') {
    return {
      available: false,
      availableCapacity: 0,
      message: `Schedule is ${data.status}`,
    };
  }

  const cutoffTime = new Date(data.start_date);
  cutoffTime.setHours(cutoffTime.getHours() - data.booking_cutoff_hours);
  if (new Date() > cutoffTime) {
    return {
      available: false,
      availableCapacity: 0,
      message: 'Booking cutoff time has passed',
    };
  }

  if (data.available_capacity < requestedQuantity) {
    return {
      available: false,
      availableCapacity: data.available_capacity,
      message: `Only ${data.available_capacity} seats available`,
    };
  }

  return {
    available: true,
    availableCapacity: data.available_capacity,
  };
}
