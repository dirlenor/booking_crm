import { supabase } from './client';
import type {
  PackageRow,
  PackageInsert,
  PackageUpdate,
  PackageWithItinerary,
  PackageItineraryItemRow,
  PackageItineraryItemInsert,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetPackagesParams {
  search?: string;
  status?: PackageRow['status'];
  category?: PackageRow['category'];
  page?: number;
  limit?: number;
}

export async function getPackages(
  params: GetPackagesParams = {}
): Promise<PaginatedResponse<PackageRow>> {
  const { search, status, category, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('packages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,destination.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error, count } = await query;

  return {
    data: (data as PackageRow[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getPackageById(
  id: string
): Promise<ServiceResponse<PackageWithItinerary>> {
  const { data, error } = await supabase
    .from('packages')
    .select('*, package_itinerary_items(*)' )
    .eq('id', id)
    .single();

  return {
    data: data as PackageWithItinerary | null,
    error: error?.message ?? null,
  };
}

export async function createPackage(
  input: PackageInsert
): Promise<ServiceResponse<PackageRow>> {
  const { data, error } = await supabase
    .from('packages')
    .insert(input)
    .select()
    .single();

  return {
    data: data as PackageRow | null,
    error: error?.message ?? null,
  };
}

export async function updatePackage(
  id: string,
  input: PackageUpdate
): Promise<ServiceResponse<PackageRow>> {
  const { data, error } = await supabase
    .from('packages')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as PackageRow | null,
    error: error?.message ?? null,
  };
}

export async function deletePackage(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function getPackageItinerary(
  packageId: string
): Promise<ServiceResponse<PackageItineraryItemRow[]>> {
  const { data, error } = await supabase
    .from('package_itinerary_items')
    .select('*')
    .eq('package_id', packageId)
    .order('sort_order')
    .order('day_number');

  return {
    data: (data as PackageItineraryItemRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function upsertPackageItinerary(
  packageId: string,
  items: Omit<PackageItineraryItemInsert, 'package_id'>[]
): Promise<ServiceResponse<PackageItineraryItemRow[]>> {
  const { error: deleteError } = await supabase
    .from('package_itinerary_items')
    .delete()
    .eq('package_id', packageId);

  if (deleteError) {
    return { data: null, error: deleteError.message };
  }

  if (items.length === 0) {
    return { data: [], error: null };
  }

  const rows = items.map((item) => ({
    ...item,
    package_id: packageId,
  }));

  const { data, error } = await supabase
    .from('package_itinerary_items')
    .insert(rows)
    .select();

  return {
    data: (data as PackageItineraryItemRow[]) ?? null,
    error: error?.message ?? null,
  };
}
