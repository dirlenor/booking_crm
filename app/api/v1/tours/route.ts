import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { createTour, generateUniqueSlug, getTours } from '@/lib/supabase/tours';
import { parsePagination, validateTourCreateBody } from '@/lib/validations/tour-management';
import type { TourStatus } from '@/types/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const search = searchParams.get('search') ?? undefined;
  const status = (searchParams.get('status') as TourStatus | null) ?? undefined;
  const categoryId = searchParams.get('category_id') ?? undefined;
  const destination = searchParams.get('destination') ?? undefined;
  const includeDeleted = searchParams.get('include_deleted') === 'true';

  const { data, error, count, totalPages } = await getTours({
    page,
    limit,
    search,
    status,
    categoryId,
    destination,
    includeDeleted,
  });

  if (error) {
    return apiError('INTERNAL_ERROR', error, 500);
  }

  return apiSuccess({
    items: data,
    pagination: {
      page,
      limit,
      count,
      totalPages,
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Invalid request body', 400);
  }

  const { value, errors } = validateTourCreateBody(body);
  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const slug = value.slug || (await generateUniqueSlug(value.name));

  const { data, error } = await createTour({
    ...value,
    slug,
  });

  if (error) {
    if (error.toLowerCase().includes('duplicate') || error.toLowerCase().includes('unique')) {
      return apiError('CONFLICT', 'Tour slug already exists', 409, [
        { field: 'slug', message: 'slug must be unique', code: 'DUPLICATE' },
      ]);
    }
    return apiError('INTERNAL_ERROR', error, 500);
  }

  return apiSuccess(data, 201);
}
