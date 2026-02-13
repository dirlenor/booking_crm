import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getSchedules } from '@/lib/supabase/schedules';
import { parsePagination } from '@/lib/validations/tour-management';
import type { ScheduleStatus } from '@/types/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const tourId = searchParams.get('tour_id') ?? undefined;
  const status = (searchParams.get('status') as ScheduleStatus | null) ?? undefined;
  const dateFrom = searchParams.get('date_from') ?? undefined;
  const dateTo = searchParams.get('date_to') ?? undefined;

  const { data, error, count, totalPages } = await getSchedules({
    tourId,
    status,
    dateFrom,
    dateTo,
    page,
    limit,
  });

  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess({
    items: data,
    pagination: { page, limit, count, totalPages },
  });
}
