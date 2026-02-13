import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { getPricingBySchedule, setPricingForSchedule } from '@/lib/supabase/pricing';
import { getScheduleById } from '@/lib/supabase/schedules';
import { validatePricingCreateBody } from '@/lib/validations/tour-management';

interface BulkPricingBody {
  pricing: Array<Record<string, unknown>>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await getPricingBySchedule(id);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: schedule, error: scheduleError } = await getScheduleById(id);
  if (scheduleError) return apiError('INTERNAL_ERROR', scheduleError, 500);
  if (!schedule) return apiError('NOT_FOUND', 'Schedule not found', 404);

  let body: BulkPricingBody;
  try {
    body = (await request.json()) as BulkPricingBody;
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  if (!Array.isArray(body.pricing) || body.pricing.length === 0) {
    return apiError('VALIDATION_ERROR', 'pricing must be a non-empty array', 400, [
      { field: 'pricing', message: 'pricing is required', code: 'REQUIRED' },
    ]);
  }

  const validationErrors = [] as ReturnType<typeof validatePricingCreateBody>['errors'];
  const items: Array<{
    ticket_type_id: string;
    base_price: number;
    sale_price?: number;
    quantity_available?: number;
  }> = [];

  for (const rawItem of body.pricing) {
    const { value, errors } = validatePricingCreateBody({
      ...rawItem,
      schedule_id: id,
    });
    if (!value) {
      validationErrors.push(...errors);
      continue;
    }

    items.push({
      ticket_type_id: value.ticket_type_id,
      base_price: value.base_price,
      sale_price: value.sale_price ?? undefined,
      quantity_available: value.quantity_available ?? undefined,
    });
  }

  if (validationErrors.length > 0) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, validationErrors);
  }

  const { data, error } = await setPricingForSchedule(id, items);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess(data, 201);
}
