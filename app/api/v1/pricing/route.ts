import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { createPricing, getPricing } from '@/lib/supabase/pricing';
import { parsePagination, validatePricingCreateBody } from '@/lib/validations/tour-management';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const scheduleId = searchParams.get('schedule_id') ?? undefined;
  const ticketTypeId = searchParams.get('ticket_type_id') ?? undefined;
  const validAt = searchParams.get('valid_at') ?? undefined;

  const { data, error, count, totalPages } = await getPricing({
    scheduleId,
    ticketTypeId,
    validAt,
    page,
    limit,
  });

  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess({
    items: data,
    pagination: { page, limit, count, totalPages },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  const { value, errors } = validatePricingCreateBody(body);
  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const { data, error } = await createPricing(value);
  if (error) {
    if (error.toLowerCase().includes('unique_pricing')) {
      return apiError('CONFLICT', 'Pricing already exists for schedule + ticket type', 409, [
        {
          field: 'schedule_id,ticket_type_id',
          message: 'pricing must be unique per schedule + ticket type',
          code: 'DUPLICATE',
        },
      ]);
    }
    return apiError('INTERNAL_ERROR', error, 500);
  }

  return apiSuccess(data, 201);
}
