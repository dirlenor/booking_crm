import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getSchedules, createSchedule } from '@/lib/supabase/schedules';
import { getTourById } from '@/lib/supabase/tours';
import { parsePagination, validateScheduleCreateBody } from '@/lib/validations/tour-management';
import type { ScheduleStatus } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const status = (searchParams.get('status') as ScheduleStatus | null) ?? undefined;
  const dateFrom = searchParams.get('date_from') ?? undefined;
  const dateTo = searchParams.get('date_to') ?? undefined;

  const { data, error, count, totalPages } = await getSchedules({
    tourId: id,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: tour, error: tourError } = await getTourById(id);
  if (tourError) return apiError('INTERNAL_ERROR', tourError, 500);
  if (!tour) return apiError('NOT_FOUND', 'Tour not found', 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  const rawBody = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const { value, errors } = validateScheduleCreateBody({
    ...rawBody,
    tour_id: id,
  });
  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const { data, error } = await createSchedule(value);
  if (error) {
    if (error.toLowerCase().includes('unique_tour_schedule')) {
      return apiError('CONFLICT', 'Schedule already exists for this date/time', 409, [
        { field: 'start_date', message: 'Duplicate schedule datetime', code: 'DUPLICATE' },
      ]);
    }
    return apiError('INTERNAL_ERROR', error, 500);
  }

  return apiSuccess(data, 201);
}
