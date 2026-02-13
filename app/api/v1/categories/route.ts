import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import {
  createCategory,
  generateCategorySlug,
  getCategories,
  getCategoryBySlug,
} from '@/lib/supabase/categories';

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageRaw = Number(searchParams.get('page') ?? 1);
  const limitRaw = Number(searchParams.get('limit') ?? 200);
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 500) : 200;

  const { data, error, count, totalPages } = await getCategories({
    page,
    limit,
    isActive: true,
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

  const raw = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null;
  if (!raw) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' },
    ]);
  }

  const name = asNonEmptyString(raw.name);
  if (!name) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'name', message: 'name is required', code: 'REQUIRED' },
    ]);
  }

  const slug = generateCategorySlug(name);
  if (!slug) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'name', message: 'name is invalid', code: 'INVALID_FORMAT' },
    ]);
  }

  const existing = await getCategoryBySlug(slug);
  if (existing.error) {
    return apiError('INTERNAL_ERROR', existing.error, 500);
  }
  if (existing.data) {
    return apiSuccess(existing.data);
  }

  const categoriesRes = await getCategories({ limit: 500 });
  if (categoriesRes.error) {
    return apiError('INTERNAL_ERROR', categoriesRes.error, 500);
  }

  const nextSortOrder =
    categoriesRes.data.length > 0
      ? Math.max(...categoriesRes.data.map((item) => item.sort_order ?? 0)) + 1
      : 1;

  const created = await createCategory({
    name,
    slug,
    description: null,
    icon: null,
    color: null,
    sort_order: nextSortOrder,
    is_active: true,
  });

  if (created.error) {
    return apiError('INTERNAL_ERROR', created.error, 500);
  }

  return apiSuccess(created.data, 201);
}
