import { supabase } from '@/lib/supabase/client';
import type {
  PaginatedData,
  PackageRow,
  PackageInsert,
  PackageUpdate,
  PackageWithItinerary,
  PackageItineraryItemRow,
  PackageItineraryItemInsert,
  ServiceResponse,
} from '@/types/database';
import type { PackageOption } from '@/types/package-options';

interface GetPackagesParams {
  search?: string;
  status?: PackageRow['status'];
  category?: PackageRow['category'];
  page?: number;
  limit?: number;
}

/** ดึงรายการแพ็กเกจพร้อม pagination และ filter */
export async function getPackages(
  params: GetPackagesParams = {}
): Promise<ServiceResponse<PaginatedData<PackageRow>>> {
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
  if (error) {
    return { data: null, error: error.message };
  }

  const total = count ?? 0;

  return {
    data: {
      items: (data as PackageRow[]) ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
    error: null,
  };
}

/** ดึงแพ็กเกจรายเดียวพร้อม itinerary */
export async function getPackageById(
  id: string
): Promise<ServiceResponse<PackageWithItinerary>> {
  const { data: pkg, error } = await supabase.from('packages').select('*').eq('id', id).single();
  if (error) {
    return { data: null, error: error.message };
  }

  const itineraryRes = await getPackageItinerary(id);
  if (itineraryRes.error) {
    return { data: null, error: itineraryRes.error };
  }

  return {
    data: {
      ...(pkg as PackageRow),
      package_itinerary_items: itineraryRes.data ?? [],
    },
    error: null,
  };
}

/** สร้างแพ็กเกจใหม่ */
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

/** อัปเดตข้อมูลแพ็กเกจ */
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

/** ลบแพ็กเกจตาม id */
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

export async function softDeletePackage(
  id: string
): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('packages')
    .update({ status: 'deleted' })
    .eq('id', id);

  return {
    data: null,
    error: error?.message ?? null,
  };
}

export async function restorePackage(
  id: string
): Promise<ServiceResponse<PackageRow>> {
  const { data, error } = await supabase
    .from('packages')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as PackageRow | null,
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
    data: (data as PackageItineraryItemRow[]) ?? [],
    error: error?.message ?? null,
  };
}

/** แทนที่ itinerary ทั้งชุดของแพ็กเกจ */
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
    data: (data as PackageItineraryItemRow[]) ?? [],
    error: error?.message ?? null,
  };
}

function normalizeDestinationKey(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/\btoyko\b/g, 'tokyo')
    .replace(', japan', '')
    .replace(', thailand', '')
    .trim();
}

function prioritizeStorageImages(urls: string[]): string[] {
  const isStorage = (url: string) => url.includes('/storage/v1/object/public/package-images/');
  const storage = urls.filter(isStorage);
  const rest = urls.filter((url) => !isStorage(url));
  return [...storage, ...rest];
}

interface SyncPackageMediaInput {
  destination: string;
  featuredImageUrl: string | null;
  galleryImageUrls: string[];
}

interface PackageSlotRuleInput {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  time: string;
  max_pax: number;
}

function sanitizePackageOptions(input: unknown): PackageOption[] {
  if (!Array.isArray(input)) return [];

  const options: PackageOption[] = [];
  input.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const value = item as {
      id?: unknown;
      name?: unknown;
      description?: unknown;
      groupType?: unknown;
      quota?: unknown;
      perks?: unknown;
      times?: unknown;
      slotRules?: unknown;
      adultPrice?: unknown;
      childPrice?: unknown;
      infantPrice?: unknown;
      isFlatRate?: unknown;
      flatRatePrice?: unknown;
      pricingTiers?: unknown;
    };

    const id = typeof value.id === 'string' && value.id.trim().length > 0 ? value.id.trim() : `option-${index + 1}`;
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    if (!name || name === '__meta__') return;

    const description = typeof value.description === 'string' ? value.description.trim() : '';
    const groupType = value.groupType === 'private' || value.groupType === 'join'
      ? value.groupType
      : undefined;
    const quotaRaw = Number(value.quota ?? 0);
    const quota = Number.isFinite(quotaRaw) && quotaRaw > 0 ? Math.floor(quotaRaw) : 1;

    const perks = Array.isArray(value.perks)
      ? value.perks
          .map((perk) => String(perk ?? '').trim())
          .filter((perk) => perk.length > 0)
      : [];

    const times = Array.isArray(value.times)
      ? value.times
          .map((time) => String(time ?? '').trim())
          .filter((time) => time.length > 0)
      : [];

    const slotRules = Array.isArray(value.slotRules)
      ? value.slotRules
          .map((rule) => {
            if (!rule || typeof rule !== 'object') return null;
            const r = rule as { day?: unknown; time?: unknown };
            const day = typeof r.day === 'string' ? r.day.trim() : '';
            const time = typeof r.time === 'string' ? r.time.trim() : '';
            if (!['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(day)) return null;
            if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) return null;
            return {
              day: day as 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat',
              time: time.length === 5 ? `${time}:00` : time,
            };
          })
          .filter((rule): rule is NonNullable<PackageOption['slotRules']>[number] => rule !== null)
      : [];

    const adultPriceRaw = Number(value.adultPrice ?? 0);
    const childPriceRaw = Number(value.childPrice ?? 0);
    const infantPriceRaw = Number(value.infantPrice ?? 0);
    const adultPrice = Number.isFinite(adultPriceRaw) && adultPriceRaw >= 0 ? adultPriceRaw : undefined;
    const childPrice = Number.isFinite(childPriceRaw) && childPriceRaw >= 0 ? childPriceRaw : undefined;
    const infantPrice = Number.isFinite(infantPriceRaw) && infantPriceRaw >= 0 ? infantPriceRaw : undefined;

    const isFlatRate = value.isFlatRate === true;
    const flatRatePriceRaw = Number(value.flatRatePrice ?? 0);
    const flatRatePrice = Number.isFinite(flatRatePriceRaw) && flatRatePriceRaw > 0 ? flatRatePriceRaw : undefined;

    const pricingTiers = Array.isArray(value.pricingTiers)
      ? value.pricingTiers
          .map((tier, tierIndex) => {
            if (!tier || typeof tier !== 'object') return null;
            const t = tier as { id?: unknown; minPax?: unknown; maxPax?: unknown; pricePerPerson?: unknown };
            const minPax = Math.max(1, Math.floor(Number(t.minPax ?? 1)));
            const maxPaxRaw = Number(t.maxPax);
            const maxPax = Number.isFinite(maxPaxRaw) && maxPaxRaw > 0 ? Math.floor(maxPaxRaw) : null;
            const pricePerPersonRaw = Number(t.pricePerPerson ?? 0);
            const pricePerPerson = Number.isFinite(pricePerPersonRaw) && pricePerPersonRaw >= 0 ? pricePerPersonRaw : 0;
            return {
              id: typeof t.id === 'string' && t.id.trim().length > 0 ? t.id.trim() : `${id}-tier-${tierIndex + 1}`,
              minPax,
              maxPax,
              pricePerPerson,
            };
          })
          .filter((tier): tier is PackageOption['pricingTiers'][number] => tier !== null)
      : [];

    options.push({
      id,
      name,
      description,
      groupType,
      quota,
      perks,
      times,
      slotRules,
      adultPrice,
      childPrice,
      infantPrice,
      isFlatRate,
      flatRatePrice,
      pricingTiers,
    });
  });

  return options;
}

export interface PackageFaqItem {
  question: string;
  answer: string;
}

export interface PackageReviewItem {
  id: string;
  user: string;
  date: string;
  rating: number;
  content: string;
  avatar: string;
}

export interface PackageContentMeta {
  rating?: number;
  reviews_count?: number;
  available_from?: string;
  available_to?: string;
  policy_text?: string;
  cancellation_policy?: string;
  refund_policy?: string;
  included_items?: string[];
  excluded_items?: string[];
  duration_text?: string;
  group_size_text?: string;
  age_range?: string;
  languages?: string[];
  badge_text?: string;
  badge_variant?: string;
  faq?: PackageFaqItem[];
  reviews?: PackageReviewItem[];
}

export async function getPackageOptionsByDestination(
  destination: string
): Promise<ServiceResponse<{ options: PackageOption[]; packageIds: string[] }>> {
  const destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) return { data: { options: [], packageIds: [] }, error: null };

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination, options')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );

  const firstMatched = matched[0];
  const sanitizedOptions = sanitizePackageOptions(firstMatched?.options);

  return {
    data: {
      options: sanitizedOptions,
      packageIds: matched.map((pkg) => pkg.id),
    },
    error: null,
  };
}

function extractPackageContentMeta(options: unknown): PackageContentMeta | null {
  if (!Array.isArray(options)) return null;
  const metaOption = options.find((item) => {
    if (!item || typeof item !== 'object') return false;
    const value = item as { id?: unknown; name?: unknown };
    return value.id === '__meta__' || value.name === '__meta__';
  });
  if (!metaOption || typeof metaOption !== 'object') return null;
  const meta = (metaOption as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return null;
  return meta as PackageContentMeta;
}

function sanitizeContentMeta(input: PackageContentMeta): PackageContentMeta {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const rating = Number(input.rating ?? 0);
  const reviewsCount = Number(input.reviews_count ?? 0);
  const faq = Array.isArray(input.faq)
    ? input.faq
        .map((item) => ({
          question: String(item.question ?? '').trim(),
          answer: String(item.answer ?? '').trim(),
        }))
        .filter((item) => item.question.length > 0 && item.answer.length > 0)
    : [];
  const reviews = Array.isArray(input.reviews)
    ? input.reviews
        .map((item, index) => {
          const user = String(item.user ?? '').trim();
          const content = String(item.content ?? '').trim();
          const ratingValue = Math.max(1, Math.min(5, Math.round(Number(item.rating ?? 5))));
          const avatar = String(item.avatar ?? '')
            .trim()
            .slice(0, 2)
            .toUpperCase();
          const id = String(item.id ?? '').trim() || `review-${index + 1}`;
          const date = String(item.date ?? '').trim() || new Date().toLocaleDateString('en-US');
          return { id, user, date, rating: ratingValue, content, avatar: avatar || user.slice(0, 2).toUpperCase() || 'TR' };
        })
        .filter((item) => item.user.length > 0 && item.content.length > 0)
    : [];

  return {
    ...input,
    rating: Number.isFinite(rating) && rating > 0 ? Math.min(5, Math.max(1, rating)) : undefined,
    reviews_count: Number.isFinite(reviewsCount) && reviewsCount >= 0 ? Math.floor(reviewsCount) : reviews.length,
    available_from:
      typeof input.available_from === 'string' && dateRegex.test(input.available_from.trim())
        ? input.available_from.trim()
        : undefined,
    available_to:
      typeof input.available_to === 'string' && dateRegex.test(input.available_to.trim())
        ? input.available_to.trim()
        : undefined,
    policy_text: input.policy_text?.trim() || undefined,
    cancellation_policy: input.cancellation_policy?.trim() || undefined,
    refund_policy: input.refund_policy?.trim() || undefined,
    included_items: Array.isArray(input.included_items)
      ? input.included_items
          .map((item) => String(item ?? '').trim())
          .filter((item) => item.length > 0)
      : undefined,
    excluded_items: Array.isArray(input.excluded_items)
      ? input.excluded_items
          .map((item) => String(item ?? '').trim())
          .filter((item) => item.length > 0)
      : undefined,
    duration_text: input.duration_text?.trim() || undefined,
    group_size_text: input.group_size_text?.trim() || undefined,
    age_range: input.age_range?.trim() || undefined,
    languages: Array.isArray(input.languages) ? input.languages.map((lang) => String(lang).trim()).filter((lang) => lang.length > 0) : undefined,
    badge_text: input.badge_text?.trim() || undefined,
    badge_variant: input.badge_variant?.trim() || undefined,
    faq,
    reviews,
  };
}

export async function getPackageContentMetaByDestination(
  destination: string
): Promise<ServiceResponse<{ meta: PackageContentMeta | null; packageIds: string[] }>> {
  const destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) return { data: { meta: null, packageIds: [] }, error: null };

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination, options')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );

  const meta = matched.length > 0 ? extractPackageContentMeta(matched[0]?.options) : null;
  return {
    data: {
      meta,
      packageIds: matched.map((pkg) => pkg.id),
    },
    error: null,
  };
}

export async function setPackageContentMetaByDestination(
  destination: string,
  input: PackageContentMeta
): Promise<ServiceResponse<number>> {
  const destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) return { data: 0, error: null };

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination, options')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );
  let updatedCount = 0;
  for (const pkg of matched) {
    const options = Array.isArray(pkg.options) ? pkg.options : [];
    const existingMeta = extractPackageContentMeta(options) ?? {};
    const sanitizedMeta = sanitizeContentMeta({
      ...existingMeta,
      ...input,
      faq: input.faq ?? existingMeta.faq,
      reviews: input.reviews ?? existingMeta.reviews,
    });
    const nonMeta = options.filter((item) => {
      if (!item || typeof item !== 'object') return true;
      const value = item as { id?: unknown; name?: unknown };
      return value.id !== '__meta__' && value.name !== '__meta__';
    });

    const nextOptions = [
      ...nonMeta,
      {
        id: '__meta__',
        name: '__meta__',
        description: 'internal content metadata',
        quota: 0,
        isFlatRate: false,
        pricingTiers: [],
        meta: sanitizedMeta,
      },
    ];

    const { error: updateError } = await supabase
      .from('packages')
      .update({ options: nextOptions })
      .eq('id', pkg.id);

    if (updateError) {
      return { data: null, error: updateError.message };
    }
    updatedCount += 1;
  }

  return { data: updatedCount, error: null };
}

export async function setPackageOptionsByDestination(
  destination: string,
  input: unknown
): Promise<ServiceResponse<number>> {
  const destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) return { data: 0, error: null };

  const sanitizedOptions = sanitizePackageOptions(input);

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination, options')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );

  let updatedCount = 0;
  for (const pkg of matched) {
    const existingMeta = extractPackageContentMeta(pkg.options);
    const nextOptions = existingMeta
      ? [
          ...sanitizedOptions,
          {
            id: '__meta__',
            name: '__meta__',
            description: 'internal content metadata',
            quota: 0,
            isFlatRate: false,
            pricingTiers: [],
            meta: existingMeta,
          },
        ]
      : sanitizedOptions;

    const { error: updateError } = await supabase
      .from('packages')
      .update({ options: nextOptions })
      .eq('id', pkg.id);

    if (updateError) {
      return { data: null, error: updateError.message };
    }
    updatedCount += 1;
  }

  return { data: updatedCount, error: null };
}

export async function syncPackageMediaFromTour(
  input: SyncPackageMediaInput
): Promise<ServiceResponse<number>> {
  const destinationKey = normalizeDestinationKey(input.destination);
  if (!destinationKey) return { data: 0, error: null };

  const { data: packages, error: packageError } = await supabase
    .from('packages')
    .select('id, destination')
    .ilike('destination', `%${destinationKey}%`);

  if (packageError) {
    return { data: null, error: packageError.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );

  const normalizedGallery = prioritizeStorageImages(
    (input.galleryImageUrls ?? []).filter((url) => typeof url === 'string' && url.trim().length > 0)
  );

  const featured = input.featuredImageUrl?.trim() || null;
  const imageUrl = featured ?? normalizedGallery[0] ?? null;
  const imageUrls = imageUrl
    ? [
        imageUrl,
        ...normalizedGallery.filter((url) => url !== imageUrl),
      ]
    : [];

  let updatedCount = 0;
  for (const pkg of matched) {
    const { error } = await supabase
      .from('packages')
      .update({ image_url: imageUrl, image_urls: imageUrls })
      .eq('id', pkg.id);
    if (error) {
      return { data: null, error: error.message };
    }
    updatedCount += 1;
  }

  return { data: updatedCount, error: null };
}

export async function archivePackagesByDestination(
  destination: string
): Promise<ServiceResponse<number>> {
  return setPackagesStatusByDestination(destination, 'archived');
}

export async function setPackagesStatusByDestination(
  destination: string,
  status: PackageRow['status']
): Promise<ServiceResponse<number>> {
  const destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) return { data: 0, error: null };

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination, status')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const targetIds = (packages ?? [])
    .filter((pkg) => normalizeDestinationKey(pkg.destination) === destinationKey)
    .map((pkg) => pkg.id);

  if (targetIds.length === 0) {
    return { data: 0, error: null };
  }

  const { error: updateError } = await supabase
    .from('packages')
    .update({ status })
    .in('id', targetIds);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return { data: targetIds.length, error: null };
}

function toDateOnly(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function normalizeTimeForPg(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

export async function syncTripsByDestinationSlotRules(input: {
  destination: string;
  available_from: string;
  available_to: string;
  slot_rules: PackageSlotRuleInput[];
}): Promise<ServiceResponse<{ affectedPackages: number; generatedTrips: number }>> {
  const destinationKey = normalizeDestinationKey(input.destination);
  const availableFrom = toDateOnly(input.available_from);
  const availableTo = toDateOnly(input.available_to);

  if (!destinationKey || !availableFrom || !availableTo || availableFrom > availableTo) {
    return { data: { affectedPackages: 0, generatedTrips: 0 }, error: null };
  }

  const { data: packages, error } = await supabase
    .from('packages')
    .select('id, destination')
    .ilike('destination', `%${destinationKey}%`);

  if (error) {
    return { data: null, error: error.message };
  }

  const matched = (packages ?? []).filter(
    (pkg) => normalizeDestinationKey(pkg.destination) === destinationKey
  );

  const weekdayMap: Record<PackageSlotRuleInput['day'], number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const validRules = input.slot_rules
    .map((rule) => {
      const day = rule.day;
      const weekday = weekdayMap[day];
      const time = normalizeTimeForPg(rule.time);
      const maxParticipants = Math.max(1, Math.floor(Number(rule.max_pax ?? 1)));
      if (weekday == null || !time) return null;
      return { weekday, time, maxParticipants };
    })
    .filter((rule): rule is { weekday: number; time: string; maxParticipants: number } => rule !== null);

  const start = new Date(`${availableFrom}T00:00:00.000Z`);
  const end = new Date(`${availableTo}T00:00:00.000Z`);
  const templateMap = new Map<string, { date: string; time: string; max_participants: number }>();

  for (let cursor = new Date(start.getTime()); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const weekday = cursor.getUTCDay();
    const iso = cursor.toISOString().slice(0, 10);
    validRules.forEach((rule) => {
      if (rule.weekday !== weekday) return;
      const key = `${iso}|${rule.time}`;
      const existing = templateMap.get(key);
      if (!existing || rule.maxParticipants > existing.max_participants) {
        templateMap.set(key, {
          date: iso,
          time: rule.time,
          max_participants: rule.maxParticipants,
        });
      }
    });
  }

  const templates = Array.from(templateMap.values());
  let generatedTrips = 0;

  for (const pkg of matched) {
    const { error: deleteError } = await supabase
      .from('trips')
      .delete()
      .eq('package_id', pkg.id)
      .eq('status', 'scheduled')
      .gte('date', availableFrom)
      .lte('date', availableTo);

    if (deleteError) {
      return { data: null, error: deleteError.message };
    }

    if (templates.length === 0) continue;

    const rows = templates.map((item) => ({
      package_id: pkg.id,
      date: item.date,
      time: item.time,
      status: 'scheduled' as const,
      max_participants: item.max_participants,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('trips')
      .insert(rows)
      .select('id');

    if (insertError) {
      return { data: null, error: insertError.message };
    }

    generatedTrips += inserted?.length ?? 0;
  }

  return {
    data: {
      affectedPackages: matched.length,
      generatedTrips,
    },
    error: null,
  };
}
