import type {
  ApiErrorDetail,
} from '@/lib/api/response';
import type {
  TicketPricingInsert,
  TicketPricingUpdate,
  TicketTypeInsert,
  TicketTypeUpdate,
  TourInsert,
  TourScheduleInsert,
  TourScheduleUpdate,
  TourStatus,
} from '@/types/database';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  return value.trim();
}

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return value;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value !== 'boolean') return null;
  return value;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === 'string')) return null;
  return value;
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeString(value: string): boolean {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

export function parsePagination(query: URLSearchParams): { page: number; limit: number } {
  const pageRaw = Number(query.get('page') ?? 1);
  const limitRaw = Number(query.get('limit') ?? 20);
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 200 ? limitRaw : 20;
  return { page, limit };
}

export function validateTourCreateBody(body: unknown): {
  value: TourInsert | null;
  errors: ApiErrorDetail[];
} {
  const errors: ApiErrorDetail[] = [];
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const name = asString(body.name);
  const destination = asString(body.destination);
  const durationDays = asNumber(body.duration_days);

  if (!name) {
    errors.push({ field: 'name', message: 'name is required', code: 'REQUIRED' });
  } else if (name.length < 5 || name.length > 200) {
    errors.push({ field: 'name', message: 'name must be 5-200 characters', code: 'INVALID_LENGTH' });
  }

  if (!destination) {
    errors.push({ field: 'destination', message: 'destination is required', code: 'REQUIRED' });
  }

  if (durationDays == null) {
    errors.push({ field: 'duration_days', message: 'duration_days is required', code: 'REQUIRED' });
  } else if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
    errors.push({ field: 'duration_days', message: 'duration_days must be 1-30', code: 'INVALID_RANGE' });
  }

  const minPax = asNumber(body.min_pax);
  const maxPax = asNumber(body.max_pax);
  if (minPax != null && (!Number.isInteger(minPax) || minPax < 1)) {
    errors.push({ field: 'min_pax', message: 'min_pax must be integer >= 1', code: 'INVALID_RANGE' });
  }
  if (maxPax != null && (!Number.isInteger(maxPax) || maxPax < 1)) {
    errors.push({ field: 'max_pax', message: 'max_pax must be integer >= 1', code: 'INVALID_RANGE' });
  }
  if (minPax != null && maxPax != null && minPax > maxPax) {
    errors.push({ field: 'max_pax', message: 'max_pax must be >= min_pax', code: 'INVALID_RANGE' });
  }

  if (errors.length > 0) {
    return { value: null, errors };
  }

  const tags = asStringArray(body.tags) ?? [];
  const galleryImageUrls = asStringArray(body.gallery_image_urls) ?? [];

  const value: TourInsert = {
    name: name!,
    slug: asString(body.slug) ?? '',
    description: asOptionalString(body.description),
    short_description: asOptionalString(body.short_description),
    featured_image_url: asOptionalString(body.featured_image_url),
    gallery_image_urls: galleryImageUrls,
    video_url: asOptionalString(body.video_url),
    category_id: asOptionalString(body.category_id),
    tags,
    destination: destination!,
    meeting_point: asOptionalString(body.meeting_point),
    meeting_point_map_url: asOptionalString(body.meeting_point_map_url),
    duration_days: durationDays!,
    duration_hours: asNumber(body.duration_hours),
    duration_text: asOptionalString(body.duration_text),
    status: (asOptionalString(body.status) as TourStatus | null) ?? 'draft',
    min_pax: minPax ?? 1,
    max_pax: maxPax,
    is_private_tour: asBoolean(body.is_private_tour) ?? false,
    meta_title: asOptionalString(body.meta_title),
    meta_description: asOptionalString(body.meta_description),
    created_by: asOptionalString(body.created_by),
  };

  return { value, errors: [] };
}

export function validateTourUpdateBody(body: unknown): {
  value: Partial<TourInsert> | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const value: Partial<TourInsert> = {};

  if ('name' in body) {
    const name = asString(body.name);
    if (!name) errors.push({ field: 'name', message: 'name cannot be empty', code: 'REQUIRED' });
    else value.name = name;
  }

  if ('destination' in body) {
    const destination = asString(body.destination);
    if (!destination) errors.push({ field: 'destination', message: 'destination cannot be empty', code: 'REQUIRED' });
    else value.destination = destination;
  }

  if ('status' in body) {
    const status = asOptionalString(body.status);
    if (!status || !['draft', 'pending_review', 'published', 'archived', 'deleted'].includes(status)) {
      errors.push({ field: 'status', message: 'invalid status', code: 'INVALID_ENUM' });
    } else {
      value.status = status as TourStatus;
    }
  }

  if ('duration_days' in body) {
    const durationDays = asNumber(body.duration_days);
    if (durationDays == null || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
      errors.push({ field: 'duration_days', message: 'duration_days must be 1-30', code: 'INVALID_RANGE' });
    } else {
      value.duration_days = durationDays;
    }
  }

  if ('min_pax' in body) {
    const minPax = asNumber(body.min_pax);
    if (minPax == null || !Number.isInteger(minPax) || minPax < 1) {
      errors.push({ field: 'min_pax', message: 'min_pax must be integer >= 1', code: 'INVALID_RANGE' });
    } else {
      value.min_pax = minPax;
    }
  }

  if ('max_pax' in body) {
    const maxPax = asNumber(body.max_pax);
    if (maxPax == null || !Number.isInteger(maxPax) || maxPax < 1) {
      errors.push({ field: 'max_pax', message: 'max_pax must be integer >= 1', code: 'INVALID_RANGE' });
    } else {
      value.max_pax = maxPax;
    }
  }

  if ('description' in body) value.description = asOptionalString(body.description);
  if ('short_description' in body) value.short_description = asOptionalString(body.short_description);
  if ('featured_image_url' in body) value.featured_image_url = asOptionalString(body.featured_image_url);
  if ('gallery_image_urls' in body) {
    const galleryImageUrls = asStringArray(body.gallery_image_urls);
    if (!galleryImageUrls) {
      errors.push({ field: 'gallery_image_urls', message: 'gallery_image_urls must be string[]', code: 'INVALID_TYPE' });
    } else {
      value.gallery_image_urls = galleryImageUrls;
    }
  }
  if ('video_url' in body) value.video_url = asOptionalString(body.video_url);
  if ('category_id' in body) value.category_id = asOptionalString(body.category_id);
  if ('tags' in body) {
    const tags = asStringArray(body.tags);
    if (!tags) errors.push({ field: 'tags', message: 'tags must be string[]', code: 'INVALID_TYPE' });
    else value.tags = tags;
  }
  if ('meeting_point' in body) value.meeting_point = asOptionalString(body.meeting_point);
  if ('meeting_point_map_url' in body) value.meeting_point_map_url = asOptionalString(body.meeting_point_map_url);
  if ('duration_hours' in body) value.duration_hours = asNumber(body.duration_hours);
  if ('duration_text' in body) value.duration_text = asOptionalString(body.duration_text);
  if ('meta_title' in body) value.meta_title = asOptionalString(body.meta_title);
  if ('meta_description' in body) value.meta_description = asOptionalString(body.meta_description);
  if ('is_private_tour' in body) {
    const isPrivateTour = asBoolean(body.is_private_tour);
    if (isPrivateTour == null) errors.push({ field: 'is_private_tour', message: 'is_private_tour must be boolean', code: 'INVALID_TYPE' });
    else value.is_private_tour = isPrivateTour;
  }

  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}

export function validateScheduleCreateBody(body: unknown): {
  value: TourScheduleInsert | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const tourId = asString(body.tour_id);
  const startDate = asString(body.start_date);
  const startTime = asString(body.start_time);
  const totalCapacity = asNumber(body.total_capacity);
  const availableCapacity = asNumber(body.available_capacity);

  if (!tourId) errors.push({ field: 'tour_id', message: 'tour_id is required', code: 'REQUIRED' });
  if (!startDate || !isDateString(startDate)) {
    errors.push({ field: 'start_date', message: 'start_date must be YYYY-MM-DD', code: 'INVALID_FORMAT' });
  }
  if (!startTime || !isTimeString(startTime)) {
    errors.push({ field: 'start_time', message: 'start_time must be HH:MM or HH:MM:SS', code: 'INVALID_FORMAT' });
  }
  if (totalCapacity == null || !Number.isInteger(totalCapacity) || totalCapacity < 0) {
    errors.push({ field: 'total_capacity', message: 'total_capacity must be integer >= 0', code: 'INVALID_RANGE' });
  }

  if (availableCapacity != null && totalCapacity != null && availableCapacity > totalCapacity) {
    errors.push({ field: 'available_capacity', message: 'available_capacity cannot exceed total_capacity', code: 'INVALID_RANGE' });
  }

  if (errors.length > 0) return { value: null, errors };

  const value: TourScheduleInsert = {
    tour_id: tourId!,
    start_date: startDate!,
    start_time: startTime!,
    end_date: asOptionalString(body.end_date),
    end_time: asOptionalString(body.end_time),
    total_capacity: totalCapacity!,
    available_capacity: availableCapacity ?? totalCapacity!,
    status: (asOptionalString(body.status) as TourScheduleInsert['status']) ?? 'open',
    has_special_price: asBoolean(body.has_special_price) ?? false,
    special_price_note: asOptionalString(body.special_price_note),
    booking_cutoff_hours: asNumber(body.booking_cutoff_hours) ?? 24,
  };

  return { value, errors: [] };
}

export function validateScheduleUpdateBody(body: unknown): {
  value: TourScheduleUpdate | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const value: TourScheduleUpdate = {};

  if ('start_date' in body) {
    const startDate = asString(body.start_date);
    if (!startDate || !isDateString(startDate)) {
      errors.push({ field: 'start_date', message: 'start_date must be YYYY-MM-DD', code: 'INVALID_FORMAT' });
    } else {
      value.start_date = startDate;
    }
  }

  if ('start_time' in body) {
    const startTime = asString(body.start_time);
    if (!startTime || !isTimeString(startTime)) {
      errors.push({ field: 'start_time', message: 'start_time must be HH:MM or HH:MM:SS', code: 'INVALID_FORMAT' });
    } else {
      value.start_time = startTime;
    }
  }

  if ('total_capacity' in body) {
    const totalCapacity = asNumber(body.total_capacity);
    if (totalCapacity == null || !Number.isInteger(totalCapacity) || totalCapacity < 0) {
      errors.push({ field: 'total_capacity', message: 'total_capacity must be integer >= 0', code: 'INVALID_RANGE' });
    } else {
      value.total_capacity = totalCapacity;
    }
  }

  if ('available_capacity' in body) {
    const availableCapacity = asNumber(body.available_capacity);
    if (availableCapacity == null || !Number.isInteger(availableCapacity) || availableCapacity < 0) {
      errors.push({ field: 'available_capacity', message: 'available_capacity must be integer >= 0', code: 'INVALID_RANGE' });
    } else {
      value.available_capacity = availableCapacity;
    }
  }

  if ('status' in body) {
    const status = asOptionalString(body.status);
    if (!status || !['open', 'closing_soon', 'full', 'closed', 'cancelled'].includes(status)) {
      errors.push({ field: 'status', message: 'invalid status', code: 'INVALID_ENUM' });
    } else {
      value.status = status as TourScheduleUpdate['status'];
    }
  }

  if ('end_date' in body) value.end_date = asOptionalString(body.end_date);
  if ('end_time' in body) value.end_time = asOptionalString(body.end_time);
  if ('has_special_price' in body) {
    const hasSpecialPrice = asBoolean(body.has_special_price);
    if (hasSpecialPrice == null) errors.push({ field: 'has_special_price', message: 'must be boolean', code: 'INVALID_TYPE' });
    else value.has_special_price = hasSpecialPrice;
  }
  if ('special_price_note' in body) value.special_price_note = asOptionalString(body.special_price_note);
  if ('booking_cutoff_hours' in body) {
    const bookingCutoffHours = asNumber(body.booking_cutoff_hours);
    if (bookingCutoffHours == null || bookingCutoffHours < 0) {
      errors.push({ field: 'booking_cutoff_hours', message: 'must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.booking_cutoff_hours = bookingCutoffHours;
    }
  }

  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}

export function validateTicketTypeCreateBody(body: unknown): {
  value: TicketTypeInsert | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const tourId = asString(body.tour_id);
  const name = asString(body.name);
  const code = asString(body.code);

  if (!tourId) errors.push({ field: 'tour_id', message: 'tour_id is required', code: 'REQUIRED' });
  if (!name) errors.push({ field: 'name', message: 'name is required', code: 'REQUIRED' });
  if (!code) {
    errors.push({ field: 'code', message: 'code is required', code: 'REQUIRED' });
  } else if (!/^[A-Z]{2,5}$/.test(code)) {
    errors.push({ field: 'code', message: 'code must be 2-5 uppercase letters', code: 'INVALID_FORMAT' });
  }

  const minAge = asNumber(body.min_age);
  const maxAge = asNumber(body.max_age);
  if (minAge != null && maxAge != null && minAge > maxAge) {
    errors.push({ field: 'max_age', message: 'max_age must be >= min_age', code: 'INVALID_RANGE' });
  }

  if (errors.length > 0) return { value: null, errors };

  const value: TicketTypeInsert = {
    tour_id: tourId!,
    name: name!,
    code: code!,
    description: asOptionalString(body.description),
    sort_order: asNumber(body.sort_order) ?? 0,
    min_age: minAge,
    max_age: maxAge,
    requires_id_proof: asBoolean(body.requires_id_proof) ?? false,
    max_quantity_per_booking: asNumber(body.max_quantity_per_booking),
    is_active: asBoolean(body.is_active) ?? true,
  };

  return { value, errors: [] };
}

export function validateTicketTypeUpdateBody(body: unknown): {
  value: TicketTypeUpdate | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const value: TicketTypeUpdate = {};

  if ('name' in body) {
    const name = asString(body.name);
    if (!name) errors.push({ field: 'name', message: 'name cannot be empty', code: 'REQUIRED' });
    else value.name = name;
  }

  if ('code' in body) {
    const code = asString(body.code);
    if (!code || !/^[A-Z]{2,5}$/.test(code)) {
      errors.push({ field: 'code', message: 'code must be 2-5 uppercase letters', code: 'INVALID_FORMAT' });
    } else {
      value.code = code;
    }
  }

  if ('min_age' in body) {
    const minAge = asNumber(body.min_age);
    if (minAge == null || minAge < 0) {
      errors.push({ field: 'min_age', message: 'min_age must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.min_age = minAge;
    }
  }

  if ('max_age' in body) {
    const maxAge = asNumber(body.max_age);
    if (maxAge == null || maxAge < 0) {
      errors.push({ field: 'max_age', message: 'max_age must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.max_age = maxAge;
    }
  }

  if ('description' in body) value.description = asOptionalString(body.description);
  if ('sort_order' in body) value.sort_order = asNumber(body.sort_order) ?? 0;
  if ('requires_id_proof' in body) {
    const requiresIdProof = asBoolean(body.requires_id_proof);
    if (requiresIdProof == null) errors.push({ field: 'requires_id_proof', message: 'must be boolean', code: 'INVALID_TYPE' });
    else value.requires_id_proof = requiresIdProof;
  }
  if ('max_quantity_per_booking' in body) value.max_quantity_per_booking = asNumber(body.max_quantity_per_booking);
  if ('is_active' in body) {
    const isActive = asBoolean(body.is_active);
    if (isActive == null) errors.push({ field: 'is_active', message: 'must be boolean', code: 'INVALID_TYPE' });
    else value.is_active = isActive;
  }

  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}

export function validatePricingCreateBody(body: unknown): {
  value: TicketPricingInsert | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const scheduleId = asString(body.schedule_id);
  const ticketTypeId = asString(body.ticket_type_id);
  const basePrice = asNumber(body.base_price);
  const salePrice = asNumber(body.sale_price);

  if (!scheduleId) errors.push({ field: 'schedule_id', message: 'schedule_id is required', code: 'REQUIRED' });
  if (!ticketTypeId) errors.push({ field: 'ticket_type_id', message: 'ticket_type_id is required', code: 'REQUIRED' });
  if (basePrice == null || basePrice < 0) {
    errors.push({ field: 'base_price', message: 'base_price must be >= 0', code: 'INVALID_RANGE' });
  }
  if (salePrice != null && basePrice != null && (salePrice < 0 || salePrice > basePrice)) {
    errors.push({ field: 'sale_price', message: 'sale_price must be >= 0 and <= base_price', code: 'INVALID_RANGE' });
  }

  if (errors.length > 0) return { value: null, errors };

  const value: TicketPricingInsert = {
    schedule_id: scheduleId!,
    ticket_type_id: ticketTypeId!,
    base_price: basePrice!,
    sale_price: salePrice,
    currency: (asOptionalString(body.currency) as TicketPricingInsert['currency']) ?? 'THB',
    quantity_available: asNumber(body.quantity_available),
    valid_from: asOptionalString(body.valid_from),
    valid_until: asOptionalString(body.valid_until),
  };

  return { value, errors: [] };
}

export function validatePricingUpdateBody(body: unknown): {
  value: TicketPricingUpdate | null;
  errors: ApiErrorDetail[];
} {
  if (!isRecord(body)) {
    return {
      value: null,
      errors: [{ field: 'body', message: 'Body must be an object', code: 'INVALID_TYPE' }],
    };
  }

  const errors: ApiErrorDetail[] = [];
  const value: TicketPricingUpdate = {};

  if ('base_price' in body) {
    const basePrice = asNumber(body.base_price);
    if (basePrice == null || basePrice < 0) {
      errors.push({ field: 'base_price', message: 'base_price must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.base_price = basePrice;
    }
  }

  if ('sale_price' in body) {
    const salePrice = asNumber(body.sale_price);
    if (salePrice != null && salePrice < 0) {
      errors.push({ field: 'sale_price', message: 'sale_price must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.sale_price = salePrice;
    }
  }

  if ('currency' in body) {
    const currency = asOptionalString(body.currency);
    if (!currency || !['THB', 'USD', 'EUR', 'JPY'].includes(currency)) {
      errors.push({ field: 'currency', message: 'invalid currency', code: 'INVALID_ENUM' });
    } else {
      value.currency = currency as TicketPricingUpdate['currency'];
    }
  }

  if ('quantity_available' in body) {
    const quantityAvailable = asNumber(body.quantity_available);
    if (quantityAvailable == null || quantityAvailable < 0) {
      errors.push({ field: 'quantity_available', message: 'quantity_available must be >= 0', code: 'INVALID_RANGE' });
    } else {
      value.quantity_available = quantityAvailable;
    }
  }

  if ('valid_from' in body) value.valid_from = asOptionalString(body.valid_from);
  if ('valid_until' in body) value.valid_until = asOptionalString(body.valid_until);
  if ('ticket_type_id' in body) {
    const ticketTypeId = asString(body.ticket_type_id);
    if (!ticketTypeId) {
      errors.push({ field: 'ticket_type_id', message: 'ticket_type_id cannot be empty', code: 'REQUIRED' });
    } else {
      value.ticket_type_id = ticketTypeId;
    }
  }

  if ('schedule_id' in body) {
    const scheduleId = asString(body.schedule_id);
    if (!scheduleId) {
      errors.push({ field: 'schedule_id', message: 'schedule_id cannot be empty', code: 'REQUIRED' });
    } else {
      value.schedule_id = scheduleId;
    }
  }

  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}
