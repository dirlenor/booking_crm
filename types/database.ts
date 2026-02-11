// ============================================================
// Database Types — 6CAT Booking CRM
// Generated from Supabase migration schemas
// ============================================================

import type { PackageOption } from './package-options';

// ---- Enums as union types ----

export type CustomerStatus = 'active' | 'inactive';
export type CustomerTier = 'Standard' | 'VIP' | 'Platinum';

export type PackageStatus = 'draft' | 'published' | 'archived';
export type PackageCategory = 'Adventure' | 'Cultural' | 'Relaxation' | 'City' | 'Nature' | 'Luxury';

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatusType = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type PassengerType = 'Adult' | 'Child' | 'Infant';

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'PromptPay';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

// ---- Row types (what you SELECT from DB) ----

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
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PackageInsert = Omit<PackageRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PackageItineraryItemInsert = Omit<PackageItineraryItemRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TripInsert = Omit<TripRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BookingInsert = Omit<BookingRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BookingPassengerInsert = Omit<BookingPassengerRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type PaymentInsert = Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ---- Update types (all optional except id) ----

export type CustomerUpdate = Partial<Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>>;
export type PackageUpdate = Partial<Omit<PackageRow, 'id' | 'created_at' | 'updated_at'>>;
export type PackageItineraryItemUpdate = Partial<Omit<PackageItineraryItemRow, 'id' | 'created_at' | 'updated_at'>>;
export type TripUpdate = Partial<Omit<TripRow, 'id' | 'created_at' | 'updated_at'>>;
export type BookingUpdate = Partial<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>;
export type BookingPassengerUpdate = Partial<Omit<BookingPassengerRow, 'id' | 'created_at'>>;
export type PaymentUpdate = Partial<Omit<PaymentRow, 'id' | 'created_at' | 'updated_at'>>;

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

// ---- Service response wrapper ----

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
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
