import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import {
  deleteTour,
  getTourById,
  replaceTourInclusions,
  setManagedTourPolicies,
  softDeleteTour,
  updateTour,
} from '@/lib/supabase/tours';
import {
  archivePackagesByDestination,
  setPackageOptionsByDestination,
  setPackageContentMetaByDestination,
  syncTripsByDestinationSlotRules,
  syncPackageMediaFromTour,
} from '@/lib/supabase/packages';
import { validateTourUpdateBody } from '@/lib/validations/tour-management';

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === 'string')) return null;
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}

function parseContentMeta(value: unknown): {
  faq: Array<{ question: string; answer: string }>;
  reviews: Array<{ id: string; user: string; date: string; rating: number; content: string; avatar: string }>;
  reviews_count?: number;
  rating?: number;
  available_from?: string;
  available_to?: string;
  policy_text?: string;
  cancellation_policy?: string;
  refund_policy?: string;
  included_items?: string[];
  excluded_items?: string[];
} | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as {
    faq?: unknown;
    reviews?: unknown;
    reviews_count?: unknown;
    rating?: unknown;
    available_from?: unknown;
    available_to?: unknown;
    policy_text?: unknown;
    cancellation_policy?: unknown;
    refund_policy?: unknown;
    included_items?: unknown;
    excluded_items?: unknown;
  };

  const faq = Array.isArray(source.faq)
    ? source.faq
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as { question?: unknown; answer?: unknown };
          const question = typeof row.question === 'string' ? row.question.trim() : '';
          const answer = typeof row.answer === 'string' ? row.answer.trim() : '';
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is { question: string; answer: string } => item !== null)
    : [];

  const reviews = Array.isArray(source.reviews)
    ? source.reviews
        .map((item, index) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as {
            id?: unknown;
            user?: unknown;
            date?: unknown;
            rating?: unknown;
            content?: unknown;
            avatar?: unknown;
          };
          const user = typeof row.user === 'string' ? row.user.trim() : '';
          const content = typeof row.content === 'string' ? row.content.trim() : '';
          if (!user || !content) return null;
          const date = typeof row.date === 'string' ? row.date.trim() : '';
          const rating = Math.max(1, Math.min(5, Math.round(Number(row.rating ?? 5))));
          const avatarRaw = typeof row.avatar === 'string' ? row.avatar.trim().toUpperCase().slice(0, 2) : '';
          const avatar = avatarRaw || user.slice(0, 2).toUpperCase() || 'TR';
          const id = typeof row.id === 'string' && row.id.trim().length > 0 ? row.id.trim() : `review-${index + 1}`;
          return {
            id,
            user,
            date: date || new Date().toLocaleDateString('en-US'),
            rating,
            content,
            avatar,
          };
        })
        .filter(
          (
            item
          ): item is { id: string; user: string; date: string; rating: number; content: string; avatar: string } =>
            item !== null
        )
    : [];

  const reviewsCount = typeof source.reviews_count === 'number' && source.reviews_count >= 0
    ? Math.floor(source.reviews_count)
    : undefined;
  const rating = typeof source.rating === 'number' && source.rating > 0
    ? Math.max(1, Math.min(5, source.rating))
    : undefined;

  const isIsoDate = (input: unknown): input is string =>
    typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim());

  const availableFrom = isIsoDate(source.available_from) ? source.available_from.trim() : undefined;
  const availableTo = isIsoDate(source.available_to) ? source.available_to.trim() : undefined;
  const policyText = typeof source.policy_text === 'string' ? source.policy_text.trim() : undefined;
  const cancellationPolicy =
    typeof source.cancellation_policy === 'string' ? source.cancellation_policy.trim() : undefined;
  const refundPolicy = typeof source.refund_policy === 'string' ? source.refund_policy.trim() : undefined;
  const includedItems = Array.isArray(source.included_items)
    ? source.included_items
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length > 0)
    : undefined;
  const excludedItems = Array.isArray(source.excluded_items)
    ? source.excluded_items
        .map((item) => String(item ?? '').trim())
        .filter((item) => item.length > 0)
    : undefined;

  return {
    faq,
    reviews,
    reviews_count: reviewsCount,
    rating,
    available_from: availableFrom,
    available_to: availableTo,
    policy_text: policyText || undefined,
    cancellation_policy: cancellationPolicy || undefined,
    refund_policy: refundPolicy || undefined,
    included_items: includedItems,
    excluded_items: excludedItems,
  };
}

function parsePackageOptions(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null;
  return value;
}

type PackageSlotRule = {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  time: string;
  max_pax: number;
};

function parsePackageSlotRules(value: unknown): PackageSlotRule[] | null {
  if (!Array.isArray(value)) return null;

  const daySet = new Set(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const rows: PackageSlotRule[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const row = item as { day?: unknown; time?: unknown; max_pax?: unknown };
    if (typeof row.day !== 'string' || !daySet.has(row.day)) return null;
    if (typeof row.time !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(row.time.trim())) return null;
    const maxPax = Math.max(1, Math.floor(Number(row.max_pax ?? 1)));

    rows.push({
      day: row.day as PackageSlotRule['day'],
      time: row.time.trim(),
      max_pax: maxPax,
    });
  }

  return rows;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await getTourById(id);

  if (error) {
    return apiError('INTERNAL_ERROR', error, 500);
  }
  if (!data) {
    return apiError('NOT_FOUND', 'Tour not found', 404);
  }

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

  const rawBody = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

  const includedItems = rawBody.included_items == null ? [] : parseStringArray(rawBody.included_items);
  const excludedItems = rawBody.excluded_items == null ? [] : parseStringArray(rawBody.excluded_items);

  if (includedItems == null) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'included_items', message: 'included_items must be string[]', code: 'INVALID_TYPE' },
    ]);
  }

  if (excludedItems == null) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'excluded_items', message: 'excluded_items must be string[]', code: 'INVALID_TYPE' },
    ]);
  }

  const requirements = typeof rawBody.requirements === 'string' ? rawBody.requirements : '';
  const cancellationPolicy = typeof rawBody.cancellation_policy === 'string' ? rawBody.cancellation_policy : '';
  const refundPolicy = typeof rawBody.refund_policy === 'string' ? rawBody.refund_policy : '';
  const contentMeta = parseContentMeta(rawBody.content_meta);
  const packageOptions = rawBody.package_options == null ? null : parsePackageOptions(rawBody.package_options);
  const packageSlotRules =
    rawBody.package_slot_rules == null ? null : parsePackageSlotRules(rawBody.package_slot_rules);

  if (
    contentMeta?.available_from &&
    contentMeta?.available_to &&
    contentMeta.available_from > contentMeta.available_to
  ) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'content_meta.available_to', message: 'available_to must be same or after available_from', code: 'INVALID_RANGE' },
    ]);
  }

  if ('package_options' in rawBody && packageOptions == null) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'package_options', message: 'package_options must be array', code: 'INVALID_TYPE' },
    ]);
  }

  if ('package_slot_rules' in rawBody && packageSlotRules == null) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'package_slot_rules', message: 'package_slot_rules must be array', code: 'INVALID_TYPE' },
    ]);
  }

  if ('pickup_available' in rawBody && typeof rawBody.pickup_available !== 'boolean') {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, [
      { field: 'pickup_available', message: 'pickup_available must be boolean', code: 'INVALID_TYPE' },
    ]);
  }
  const pickupAvailable = typeof rawBody.pickup_available === 'boolean' ? rawBody.pickup_available : false;

  const hasManagedProfilePayload =
    'included_items' in rawBody ||
    'excluded_items' in rawBody ||
    'requirements' in rawBody ||
    'cancellation_policy' in rawBody ||
    'refund_policy' in rawBody ||
    'pickup_available' in rawBody;

  const { value, errors } = validateTourUpdateBody(body);
  if (!value) {
    return apiError('VALIDATION_ERROR', 'Request validation failed', 400, errors);
  }

  const { data, error } = await updateTour(id, value);

  if (error) {
    return apiError('INTERNAL_ERROR', error, 500);
  }
  if (!data) {
    return apiError('NOT_FOUND', 'Tour not found', 404);
  }

  let nextInclusions = null;
  let nextPolicies = null;
  if (hasManagedProfilePayload) {
    const inclusionRes = await replaceTourInclusions(id, includedItems, excludedItems);
    if (inclusionRes.error) {
      return apiError('INTERNAL_ERROR', inclusionRes.error, 500);
    }
    nextInclusions = inclusionRes.data ?? [];

    const policyRes = await setManagedTourPolicies(id, {
      requirements,
      cancellationPolicy,
      refundPolicy,
      pickupAvailable,
    });
    if (policyRes.error) {
      return apiError('INTERNAL_ERROR', policyRes.error, 500);
    }
    nextPolicies = policyRes.data ?? [];
  }

  if ('featured_image_url' in rawBody || 'gallery_image_urls' in rawBody || 'destination' in rawBody) {
    await syncPackageMediaFromTour({
      destination: data.destination,
      featuredImageUrl: data.featured_image_url,
      galleryImageUrls: data.gallery_image_urls ?? [],
    });
  }

  if (packageOptions) {
    const optionRes = await setPackageOptionsByDestination(data.destination, packageOptions);
    if (optionRes.error) {
      return apiError('INTERNAL_ERROR', optionRes.error, 500);
    }
  }

  if (contentMeta) {
    const contentRes = await setPackageContentMetaByDestination(data.destination, {
      ...contentMeta,
      reviews_count: contentMeta.reviews_count ?? contentMeta.reviews.length,
      rating:
        contentMeta.rating ??
        (contentMeta.reviews.length > 0
          ? Number(
              (
                contentMeta.reviews.reduce((sum, row) => sum + row.rating, 0) / contentMeta.reviews.length
              ).toFixed(1)
            )
          : undefined),
    });
    if (contentRes.error) {
      return apiError('INTERNAL_ERROR', contentRes.error, 500);
    }

    if (packageSlotRules && contentMeta.available_from && contentMeta.available_to) {
      const syncTripsRes = await syncTripsByDestinationSlotRules({
        destination: data.destination,
        available_from: contentMeta.available_from,
        available_to: contentMeta.available_to,
        slot_rules: packageSlotRules,
      });

      if (syncTripsRes.error) {
        return apiError('INTERNAL_ERROR', syncTripsRes.error, 500);
      }
    }
  }

  return apiSuccess({
    ...data,
    tour_inclusions: nextInclusions ?? undefined,
    tour_policies: nextPolicies ?? undefined,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hardDelete = new URL(request.url).searchParams.get('hard') === 'true';

  const existingTour = await getTourById(id);
  if (existingTour.error) {
    return apiError('INTERNAL_ERROR', existingTour.error, 500);
  }
  if (!existingTour.data) {
    return apiError('NOT_FOUND', 'Tour not found', 404);
  }

  const { error } = hardDelete ? await deleteTour(id) : await softDeleteTour(id);

  if (error) {
    return apiError('INTERNAL_ERROR', error, 500);
  }

  const packageSync = await archivePackagesByDestination(existingTour.data.destination);
  if (packageSync.error) {
    return apiError('INTERNAL_ERROR', packageSync.error, 500);
  }

  return apiSuccess({
    id,
    deleted: true,
    hardDelete,
    archivedPackages: packageSync.data ?? 0,
  });
}
