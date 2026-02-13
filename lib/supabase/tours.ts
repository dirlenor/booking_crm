import { supabase } from './client';
import type {
  TourRow,
  TourInsert,
  TourUpdate,
  TourWithCategory,
  TourComplete,
  TourInclusionRow,
  TourPolicyRow,
  ServiceResponse,
  PaginatedResponse,
} from '@/types/database';

interface GetToursParams {
  search?: string;
  status?: TourRow['status'];
  categoryId?: string;
  destination?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export async function getTours(
  params: GetToursParams = {}
): Promise<PaginatedResponse<TourWithCategory>> {
  const {
    search,
    status,
    categoryId,
    destination,
    includeDeleted = false,
    page = 1,
    limit = 20,
  } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('tours')
    .select('*, categories(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (!includeDeleted) {
    query = query.neq('status', 'deleted');
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,destination.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (destination) {
    query = query.ilike('destination', `%${destination}%`);
  }

  const { data, error, count } = await query;

  return {
    data: (data as TourWithCategory[]) ?? [],
    error: error?.message ?? null,
    count: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getTourById(
  id: string
): Promise<ServiceResponse<TourComplete>> {
  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      categories(*),
      tour_schedules(*),
      tour_itinerary(*),
      tour_inclusions(*),
      tour_addons(*),
      tour_policies(*)
    `)
    .eq('id', id)
    .maybeSingle();

  return {
    data: data as TourComplete | null,
    error: error?.message ?? null,
  };
}

export async function getTourBySlug(
  slug: string
): Promise<ServiceResponse<TourComplete>> {
  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      categories(*),
      tour_schedules(*),
      tour_itinerary(*),
      tour_inclusions(*),
      tour_addons(*),
      tour_policies(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  return {
    data: data as TourComplete | null,
    error: error?.message ?? null,
  };
}

export async function createTour(
  input: TourInsert
): Promise<ServiceResponse<TourRow>> {
  const { data, error } = await supabase
    .from('tours')
    .insert(input)
    .select()
    .single();

  return {
    data: data as TourRow | null,
    error: error?.message ?? null,
  };
}

export async function updateTour(
  id: string,
  input: TourUpdate
): Promise<ServiceResponse<TourRow>> {
  const { data, error } = await supabase
    .from('tours')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TourRow | null,
    error: error?.message ?? null,
  };
}

export async function deleteTour(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tours')
    .delete()
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function softDeleteTour(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('tours')
    .update({ status: 'deleted' })
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function restoreTour(
  id: string
): Promise<ServiceResponse<TourRow>> {
  const { data, error } = await supabase
    .from('tours')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TourRow | null,
    error: error?.message ?? null,
  };
}

export async function publishTour(
  id: string
): Promise<ServiceResponse<TourRow>> {
  const { data, error } = await supabase
    .from('tours')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as TourRow | null,
    error: error?.message ?? null,
  };
}

export async function replaceTourInclusions(
  tourId: string,
  includedItems: string[],
  excludedItems: string[]
): Promise<ServiceResponse<TourInclusionRow[]>> {
  const rows = [
    ...includedItems.map((item, index) => ({
      tour_id: tourId,
      item,
      is_included: true,
      sort_order: index,
    })),
    ...excludedItems.map((item, index) => ({
      tour_id: tourId,
      item,
      is_included: false,
      sort_order: includedItems.length + index,
    })),
  ];

  await supabase
    .from('tour_inclusions')
    .delete()
    .eq('tour_id', tourId);

  if (rows.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('tour_inclusions')
    .insert(rows)
    .select('*');

  return {
    data: (data as TourInclusionRow[]) ?? null,
    error: error?.message ?? null,
  };
}

interface ManagedTourPoliciesInput {
  requirements: string | null;
  cancellationPolicy: string | null;
  refundPolicy: string | null;
  pickupAvailable: boolean;
}

export async function setManagedTourPolicies(
  tourId: string,
  input: ManagedTourPoliciesInput
): Promise<ServiceResponse<TourPolicyRow[]>> {
  const managedKeys = new Set([
    'other::Requirements',
    'cancellation::Cancellation Policy',
    'refund::Refund Policy',
    'other::Pickup Available',
  ]);

  const { data: existingPolicies, error: existingError } = await supabase
    .from('tour_policies')
    .select('*')
    .eq('tour_id', tourId);

  if (existingError) {
    return { data: null, error: existingError.message };
  }

  const preservedPolicies = (existingPolicies ?? [])
    .filter((policy) => !managedKeys.has(`${policy.policy_type}::${policy.title}`))
    .map((policy) => ({
      tour_id: tourId,
      policy_type: policy.policy_type,
      title: policy.title,
      description: policy.description,
      hours_before: policy.hours_before,
      refund_percentage: policy.refund_percentage,
      sort_order: policy.sort_order,
    }));

  const managedPolicies = [
    {
      tour_id: tourId,
      policy_type: 'other' as const,
      title: 'Requirements',
      description: input.requirements?.trim() || 'No special requirements.',
      hours_before: null,
      refund_percentage: null,
      sort_order: 10,
    },
    {
      tour_id: tourId,
      policy_type: 'cancellation' as const,
      title: 'Cancellation Policy',
      description: input.cancellationPolicy?.trim() || 'Cancellation policy not specified.',
      hours_before: null,
      refund_percentage: null,
      sort_order: 11,
    },
    {
      tour_id: tourId,
      policy_type: 'refund' as const,
      title: 'Refund Policy',
      description: input.refundPolicy?.trim() || 'Refund policy not specified.',
      hours_before: null,
      refund_percentage: null,
      sort_order: 12,
    },
    {
      tour_id: tourId,
      policy_type: 'other' as const,
      title: 'Pickup Available',
      description: input.pickupAvailable ? 'Supported' : 'Not supported',
      hours_before: null,
      refund_percentage: null,
      sort_order: 13,
    },
  ];

  const rows = [...preservedPolicies, ...managedPolicies];

  await supabase
    .from('tour_policies')
    .delete()
    .eq('tour_id', tourId);

  const { data, error } = await supabase
    .from('tour_policies')
    .insert(rows)
    .select('*');

  return {
    data: (data as TourPolicyRow[]) ?? null,
    error: error?.message ?? null,
  };
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from('tours')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function checkCanPublish(tourId: string): Promise<{
  canPublish: boolean;
  missing: string[];
}> {
  const missing: string[] = [];

  const { data: scheduleData } = await supabase
    .from('tour_schedules')
    .select('id')
    .eq('tour_id', tourId)
    .limit(1);

  if (!scheduleData || scheduleData.length === 0) {
    missing.push('at least one schedule');
  }

  const { data: ticketTypeData } = await supabase
    .from('ticket_types')
    .select('id')
    .eq('tour_id', tourId)
    .eq('is_active', true)
    .limit(1);

  if (!ticketTypeData || ticketTypeData.length === 0) {
    missing.push('at least one active ticket type');
  }

  const { data: scheduleIds } = await supabase
    .from('tour_schedules')
    .select('id')
    .eq('tour_id', tourId);

  const scheduleIdList = scheduleIds?.map(s => s.id) ?? [];

  const { data: pricingData } = scheduleIdList.length > 0
    ? await supabase
        .from('ticket_pricing')
        .select('id')
        .in('schedule_id', scheduleIdList)
        .limit(1)
    : { data: [] };

  if (!pricingData || pricingData.length === 0) {
    missing.push('pricing for at least one schedule');
  }

  return {
    canPublish: missing.length === 0,
    missing,
  };
}
