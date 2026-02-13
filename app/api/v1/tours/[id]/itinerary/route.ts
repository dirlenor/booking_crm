import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { createItineraryBulk, deleteItineraryByTour, getItineraryByTour } from '@/lib/supabase/itinerary';
import { getTourById } from '@/lib/supabase/tours';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

type ItineraryPayloadItem = {
  day_number: number;
  title: string;
  description: string | null;
  meals: string[];
  accommodation_name: string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await getItineraryByTour(id);
  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess(data ?? []);
}

export async function PUT(
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
  const items = rawBody.items;

  if (!Array.isArray(items)) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'items', message: 'items must be an array', code: 'INVALID_TYPE' },
    ]);
  }

  const normalized: ItineraryPayloadItem[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (typeof item !== 'object' || item === null) {
      return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
        { field: `items[${index}]`, message: 'item must be object', code: 'INVALID_TYPE' },
      ]);
    }

    const row = item as Record<string, unknown>;
    const dayNumber = Number(row.day_number);
    const title = typeof row.title === 'string' ? row.title.trim() : '';
    const description = typeof row.description === 'string' ? row.description.trim() : null;
    const accommodationName = typeof row.accommodation_name === 'string' ? row.accommodation_name.trim() : null;
    const meals = row.meals;

    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
        { field: `items[${index}].day_number`, message: 'day_number must be integer >= 1', code: 'INVALID_VALUE' },
      ]);
    }

    if (!title) {
      return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
        { field: `items[${index}].title`, message: 'title is required', code: 'REQUIRED' },
      ]);
    }

    if (meals != null && !isStringArray(meals)) {
      return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
        { field: `items[${index}].meals`, message: 'meals must be string[]', code: 'INVALID_TYPE' },
      ]);
    }

    normalized.push({
      day_number: dayNumber,
      title,
      description,
      meals: (meals ?? []).map((meal) => meal.trim()).filter((meal) => meal.length > 0),
      accommodation_name: accommodationName,
    });
  }

  const sorted = normalized.sort((a, b) => a.day_number - b.day_number);

  const { error: deleteError } = await deleteItineraryByTour(id);
  if (deleteError) return apiError('INTERNAL_ERROR', deleteError, 500);

  if (sorted.length === 0) return apiSuccess([]);

  const { data, error } = await createItineraryBulk(
    sorted.map((item, index) => ({
      tour_id: id,
      day_number: item.day_number,
      title: item.title,
      description: item.description,
      activities: [],
      meals: item.meals,
      accommodation_name: item.accommodation_name,
      accommodation_description: null,
      sort_order: index,
    }))
  );

  if (error) return apiError('INTERNAL_ERROR', error, 500);
  return apiSuccess((data ?? []).sort((a, b) => a.day_number - b.day_number));
}
