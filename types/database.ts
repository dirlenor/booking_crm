// ============================================================
// Database Types — 6CAT Booking CRM
// Generated from Supabase migration schemas
// ============================================================

import type { PackageOption } from './package-options';

// ---- Enums as union types ----

export type CustomerStatus = 'active' | 'inactive';
export type CustomerTier = 'Standard' | 'VIP' | 'Platinum';

// Legacy types (keeping for backward compatibility)
export type PackageStatus = 'draft' | 'published' | 'archived';
export type PackageCategory = 'Adventure' | 'Cultural' | 'Relaxation' | 'City' | 'Nature' | 'Luxury';

// Phase 1: New Tour Management Types
export type TourStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'deleted';
export type ScheduleStatus = 'open' | 'closing_soon' | 'full' | 'closed' | 'cancelled';
export type PolicyType = 'cancellation' | 'refund' | 'child' | 'weather' | 'other';
export type Currency = 'THB' | 'USD' | 'EUR' | 'JPY';

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatusType = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type PassengerType = 'Adult' | 'Child' | 'Infant';

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'PromptPay';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

// ============================================
// PHASE 1: TOUR MANAGEMENT ROW TYPES
// ============================================

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  featured_image_url: string | null;
  gallery_image_urls: string[];
  video_url: string | null;
  category_id: string | null;
  tags: string[];
  destination: string;
  meeting_point: string | null;
  meeting_point_map_url: string | null;
  duration_days: number;
  duration_hours: number | null;
  duration_text: string | null;
  status: TourStatus;
  min_pax: number;
  max_pax: number | null;
  is_private_tour: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface TourScheduleRow {
  id: string;
  tour_id: string;
  start_date: string;
  start_time: string;
  end_date: string | null;
  end_time: string | null;
  total_capacity: number;
  available_capacity: number;
  status: ScheduleStatus;
  has_special_price: boolean;
  special_price_note: string | null;
  booking_cutoff_hours: number;
  created_at: string;
  updated_at: string;
}

export interface TicketTypeRow {
  id: string;
  tour_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  min_age: number | null;
  max_age: number | null;
  requires_id_proof: boolean;
  max_quantity_per_booking: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketPricingRow {
  id: string;
  schedule_id: string;
  ticket_type_id: string;
  base_price: number;
  sale_price: number | null;
  currency: Currency;
  quantity_available: number | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourItineraryRow {
  id: string;
  tour_id: string;
  day_number: number;
  title: string;
  description: string | null;
  activities: Array<{
    time: string;
    activity: string;
    location?: string;
    duration?: string;
  }>;
  meals: string[];
  accommodation_name: string | null;
  accommodation_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TourInclusionRow {
  id: string;
  tour_id: string;
  item: string;
  is_included: boolean;
  sort_order: number;
  created_at: string;
}

export interface TourAddonRow {
  id: string;
  tour_id: string;
  name: string;
  description: string | null;
  price: number;
  is_per_person: boolean;
  max_quantity: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TourPolicyRow {
  id: string;
  tour_id: string;
  policy_type: PolicyType;
  title: string;
  description: string;
  hours_before: number | null;
  refund_percentage: number | null;
  sort_order: number;
  created_at: string;
}

// ============================================
// EXISTING ROW TYPES
// ============================================

export interface CustomerRow {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: CustomerStatus;
  tier: CustomerTier;
  created_at: string;
  updated_at: string;
}

export interface PackageRow {
  id: string;
  name: string;
  description: string | null;
  destination: string | null;
  duration: string | null;
  base_price: number;
  max_pax: number;
  status: PackageStatus;
  category: PackageCategory;
  image_url: string | null;
  image_urls: string[];
  highlights: string[];
  options: PackageOption[];
  created_at: string;
  updated_at: string;
}

export interface PackageItineraryItemRow {
  id: string;
  package_id: string;
  day_number: number;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TripRow {
  id: string;
  package_id: string;
  date: string;
  time: string;
  status: TripStatus;
  max_participants: number;
  guide_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  booking_ref: string;
  customer_id: string;
  trip_id: string;
  pax: number;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatusType;
  booking_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPassengerRow {
  id: string;
  booking_id: string;
  name: string;
  type: PassengerType;
  age: number | null;
  passport_number: string | null;
  special_requests: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  note: string | null;
  slip_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Insert types (omit auto-generated fields) ----

export type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'> & {
  status?: CustomerStatus;
  tier?: CustomerTier;
};

export type PackageInsert = Omit<PackageRow, 'id' | 'created_at' | 'updated_at'> & {
  base_price?: number;
  max_pax?: number;
  status?: PackageStatus;
  category?: PackageCategory;
  image_urls?: string[];
  highlights?: string[];
  options?: PackageOption[];
};

export type PackageItineraryItemInsert = Omit<PackageItineraryItemRow, 'id' | 'created_at' | 'updated_at'> & {
  description?: string;
  sort_order?: number;
};

export type TripInsert = Omit<TripRow, 'id' | 'created_at' | 'updated_at'> & {
  status?: TripStatus;
  max_participants?: number;
};

export type BookingInsert = Omit<BookingRow, 'id' | 'created_at' | 'updated_at'> & {
  booking_date?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatusType;
  total_amount?: number;
};

export type BookingPassengerInsert = Omit<BookingPassengerRow, 'id' | 'created_at'>;

export type PaymentInsert = Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'> & {
  payment_date?: string;
  status?: PaymentStatus;
};

// Phase 1: Insert types
export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourInsert = Omit<TourRow, 'id' | 'created_at' | 'updated_at' | 'published_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
};

export type TourScheduleInsert = Omit<TourScheduleRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TicketTypeInsert = Omit<TicketTypeRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TicketPricingInsert = Omit<TicketPricingRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourItineraryInsert = Omit<TourItineraryRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourInclusionInsert = Omit<TourInclusionRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type TourAddonInsert = Omit<TourAddonRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourPolicyInsert = Omit<TourPolicyRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ---- Update types (all optional except id) ----

export type CustomerUpdate = Partial<Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>>;
export type PackageUpdate = Partial<Omit<PackageRow, 'id' | 'created_at' | 'updated_at'>>;
export type PackageItineraryItemUpdate = Partial<Omit<PackageItineraryItemRow, 'id' | 'created_at' | 'updated_at'>>;
export type TripUpdate = Partial<Omit<TripRow, 'id' | 'created_at' | 'updated_at'>>;
export type BookingUpdate = Partial<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>;
export type BookingPassengerUpdate = Partial<Omit<BookingPassengerRow, 'id' | 'created_at'>>;
export type PaymentUpdate = Partial<Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'>>;

// Phase 1: Update types
export type CategoryUpdate = Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>>;
export type TourUpdate = Partial<Omit<TourRow, 'id' | 'created_at' | 'updated_at' | 'published_at'>>;
export type TourScheduleUpdate = Partial<Omit<TourScheduleRow, 'id' | 'created_at' | 'updated_at'>>;
export type TicketTypeUpdate = Partial<Omit<TicketTypeRow, 'id' | 'created_at' | 'updated_at'>>;
export type TicketPricingUpdate = Partial<Omit<TicketPricingRow, 'id' | 'created_at' | 'updated_at'>>;
export type TourItineraryUpdate = Partial<Omit<TourItineraryRow, 'id' | 'created_at' | 'updated_at'>>;
export type TourInclusionUpdate = Partial<Omit<TourInclusionRow, 'id' | 'created_at'>>;
export type TourAddonUpdate = Partial<Omit<TourAddonRow, 'id' | 'created_at' | 'updated_at'>>;
export type TourPolicyUpdate = Partial<Omit<TourPolicyRow, 'id' | 'created_at'>>;

// ---- Joined / Enriched types ----

export interface TripWithPackage extends TripRow {
  packages: PackageRow;
}

export interface BookingWithRelations extends BookingRow {
  customers: CustomerRow;
  trips: TripWithPackage;
}

export interface BookingDetail extends BookingRow {
  customers: CustomerRow;
  trips: TripWithPackage;
  booking_passengers: BookingPassengerRow[];
  payments: PaymentRow[];
}

export interface PaymentWithBooking extends PaymentRow {
  bookings: BookingWithRelations;
}

export interface PackageWithItinerary extends PackageRow {
  package_itinerary_items: PackageItineraryItemRow[];
}

// Phase 1: Joined types
export interface TourWithCategory extends TourRow {
  categories: CategoryRow | null;
}

export interface TourWithSchedule extends TourRow {
  tour_schedules: TourScheduleRow[];
}

export interface TourWithItinerary extends TourRow {
  tour_itinerary: TourItineraryRow[];
}

export interface TourWithInclusions extends TourRow {
  tour_inclusions: TourInclusionRow[];
}

export interface TourWithAddons extends TourRow {
  tour_addons: TourAddonRow[];
}

export interface TourWithPolicies extends TourRow {
  tour_policies: TourPolicyRow[];
}

export interface TourComplete extends TourRow {
  categories: CategoryRow | null;
  tour_schedules: TourScheduleRow[];
  tour_itinerary: TourItineraryRow[];
  tour_inclusions: TourInclusionRow[];
  tour_addons: TourAddonRow[];
  tour_policies: TourPolicyRow[];
}

export interface ScheduleWithPricing extends TourScheduleRow {
  ticket_pricing: (TicketPricingRow & { ticket_types: TicketTypeRow })[];
}

export interface TourWithSchedulesAndPricing extends TourRow {
  tour_schedules: ScheduleWithPricing[];
}

// ---- Service response wrapper ----

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  error: string | null;
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Dashboard types ----

export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  upcomingTrips: number;
  confirmedBookings: number;
  pendingPayments: number;
}
