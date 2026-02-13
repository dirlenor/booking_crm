import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { deletePricing, getPricingById, updatePricing } from '@/lib/supabase/pricing';
import { validatePricingUpdateBody } from '@/lib/validations/tour-management';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await getPricingById(id);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  if (!data) return apiError('NOT_FOUND', 'Pricing not found', 404);
  return apiSuccess(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  const { value, errors } = validatePricingUpdateBody(body);

  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const { data, error } = await updatePricing(id, value);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  if (!data) return apiError('NOT_FOUND', 'Pricing not found', 404);
  return apiSuccess(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await deletePricing(id);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess({ id, deleted: true });
}
