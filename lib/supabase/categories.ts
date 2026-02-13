import { supabase } from './client';
import type {
  CategoryRow,
  CategoryInsert,
  CategoryUpdate,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetCategoriesParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getCategories(
  params: GetCategoriesParams = {}
): Promise<PaginatedResponse<CategoryRow>> {
  const { isActive, page = 1, limit = 50 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .range(from, to);

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const { data, error, count } = await query;

  return {
    data: (data as CategoryRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getCategoryById(
  id: string
): Promise<ServiceResponse<CategoryRow>> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return {
    data: data as CategoryRow | null,
    error: error?.message ?? null,
  };
}

export async function getCategoryBySlug(
  slug: string
): Promise<ServiceResponse<CategoryRow>> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  return {
    data: data as CategoryRow | null,
    error: error?.message ?? null,
  };
}

export async function createCategory(
  input: CategoryInsert
): Promise<ServiceResponse<CategoryRow>> {
  const { data, error } = await supabase
    .from('categories')
    .insert(input)
    .select()
    .single();

  return {
    data: data as CategoryRow | null,
    error: error?.message ?? null,
  };
}

export async function updateCategory(
  id: string,
  input: CategoryUpdate
): Promise<ServiceResponse<CategoryRow>> {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as CategoryRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteCategory(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}
