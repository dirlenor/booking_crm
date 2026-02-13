import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getTicketTypes, createTicketType } from '@/lib/supabase/ticket-types';
import { getTourById } from '@/lib/supabase/tours';
import { parsePagination, validateTicketTypeCreateBody } from '@/lib/validations/tour-management';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const isActiveRaw = searchParams.get('is_active');
  const isActive = isActiveRaw == null ? undefined : isActiveRaw === 'true';

  const { data, error, count, totalPages } = await getTicketTypes({
    tourId: id,
    isActive,
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
  const { value, errors } = validateTicketTypeCreateBody({
    ...rawBody,
    tour_id: id,
  });
  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const { data, error } = await createTicketType(value);
  if (error) {
    if (error.toLowerCase().includes('unique_ticket_type_code')) {
      return apiError('CONFLICT', 'Ticket type code already exists in this tour', 409, [
        { field: 'code', message: 'code must be unique per tour', code: 'DUPLICATE' },
      ]);
    }
    return apiError('INTERNAL_ERROR', error, 500);
  }

  return apiSuccess(data, 201);
}
