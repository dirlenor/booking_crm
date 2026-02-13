-- Migration: Phase 1 - Tour Management Architecture
-- Purpose: Scalable tour booking platform core tables
-- Date: 2026-02-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================
-- 2. TOURS (Enhanced packages)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  
  -- Media
  featured_image_url text,
  gallery_image_urls text[] DEFAULT '{}',
  video_url text,
  
  -- Categorization
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  
  -- Location
  destination text NOT NULL,
  meeting_point text,
  meeting_point_map_url text,
  
  -- Duration
  duration_days integer DEFAULT 1 CHECK (duration_days >= 1),
  duration_hours integer CHECK (duration_hours >= 0),
  duration_text text,
  
  -- Status Workflow (includes deleted for soft delete)
  status text NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending_review', 'published', 'archived', 'deleted')),
  
  -- Settings
  min_pax integer DEFAULT 1 CHECK (min_pax >= 1),
  max_pax integer CHECK (max_pax >= 1),
  is_private_tour boolean DEFAULT false,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Audit
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tours_status ON public.tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_category ON public.tours(category_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON public.tours(destination);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON public.tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_published ON public.tours(status, published_at) 
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_tours_active ON public.tours(status) 
  WHERE status != 'deleted';

-- ============================================
-- 3. TOUR SCHEDULES
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  -- Schedule Details
  start_date date NOT NULL,
  start_time time NOT NULL DEFAULT '08:00:00',
  end_date date,
  end_time time,
  
  -- Capacity
  total_capacity integer NOT NULL CHECK (total_capacity >= 0),
  available_capacity integer NOT NULL CHECK (available_capacity >= 0),
  
  -- Status
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closing_soon', 'full', 'closed', 'cancelled')),
  
  -- Special Pricing
  has_special_price boolean DEFAULT false,
  special_price_note text,
  
  -- Cutoff
  booking_cutoff_hours integer DEFAULT 24 CHECK (booking_cutoff_hours >= 0),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_tour_schedule UNIQUE (tour_id, start_date, start_time),
  CONSTRAINT check_capacity CHECK (available_capacity <= total_capacity)
);

CREATE INDEX IF NOT EXISTS idx_schedules_tour ON public.tour_schedules(tour_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.tour_schedules(start_date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.tour_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_available ON public.tour_schedules(tour_id, start_date) 
  WHERE status IN ('open', 'closing_soon') AND available_capacity > 0;
CREATE INDEX IF NOT EXISTS idx_schedules_date_range ON public.tour_schedules(start_date, start_time);

-- ============================================
-- 4. TICKET TYPES
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  -- Basic Info
  name text NOT NULL,
  code text NOT NULL,
  description text,
  
  -- Display Order
  sort_order integer DEFAULT 0,
  
  -- Restrictions
  min_age integer CHECK (min_age >= 0),
  max_age integer CHECK (max_age >= min_age),
  requires_id_proof boolean DEFAULT false,
  
  -- Capacity
  max_quantity_per_booking integer CHECK (max_quantity_per_booking >= 1),
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_ticket_type_code UNIQUE (tour_id, code)
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_tour ON public.ticket_types(tour_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_active ON public.ticket_types(tour_id, is_active) 
  WHERE is_active = true;

-- ============================================
-- 5. TICKET PRICING
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.tour_schedules(id) ON DELETE CASCADE,
  ticket_type_id uuid NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  
  -- Pricing
  base_price numeric(12,2) NOT NULL CHECK (base_price >= 0),
  sale_price numeric(12,2) CHECK (sale_price >= 0 AND sale_price <= base_price),
  
  -- Currency
  currency text NOT NULL DEFAULT 'THB' CHECK (currency IN ('THB', 'USD', 'EUR', 'JPY')),
  
  -- Availability per ticket type
  quantity_available integer CHECK (quantity_available >= 0),
  
  -- Validity
  valid_from timestamptz,
  valid_until timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_pricing UNIQUE (schedule_id, ticket_type_id)
);

CREATE INDEX IF NOT EXISTS idx_pricing_schedule ON public.ticket_pricing(schedule_id);
CREATE INDEX IF NOT EXISTS idx_pricing_type ON public.ticket_pricing(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_pricing_valid ON public.ticket_pricing(valid_from, valid_until);

-- ============================================
-- 6. TOUR ITINERARY
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  day_number integer NOT NULL CHECK (day_number >= 1),
  title text NOT NULL,
  description text,
  
  -- Activities: [{ "time": "09:00", "activity": "...", "location": "..." }]
  activities jsonb DEFAULT '[]'::jsonb,
  
  -- Meals
  meals text[] DEFAULT '{}',
  
  -- Accommodation
  accommodation_name text,
  accommodation_description text,
  
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_itinerary_day UNIQUE (tour_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_tour ON public.tour_itinerary(tour_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_day ON public.tour_itinerary(tour_id, day_number);

-- ============================================
-- 7. TOUR INCLUSIONS/EXCLUSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  item text NOT NULL,
  is_included boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inclusions_tour ON public.tour_inclusions(tour_id);

-- ============================================
-- 8. TOUR ADD-ONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  
  is_per_person boolean DEFAULT true,
  max_quantity integer CHECK (max_quantity >= 1),
  
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addons_tour ON public.tour_addons(tour_id);

-- ============================================
-- 9. TOUR POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  policy_type text NOT NULL CHECK (policy_type IN ('cancellation', 'refund', 'child', 'weather', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  
  hours_before integer,
  refund_percentage integer CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policies_tour ON public.tour_policies(tour_id);
CREATE INDEX IF NOT EXISTS idx_policies_type ON public.tour_policies(tour_id, policy_type);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- Tours trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_tours_updated_at') THEN
    CREATE TRIGGER tr_tours_updated_at BEFORE UPDATE ON public.tours
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Categories trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_categories_updated_at') THEN
    CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Schedules trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_tour_schedules_updated_at') THEN
    CREATE TRIGGER tr_tour_schedules_updated_at BEFORE UPDATE ON public.tour_schedules
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Ticket types trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_ticket_types_updated_at') THEN
    CREATE TRIGGER tr_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Pricing trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_ticket_pricing_updated_at') THEN
    CREATE TRIGGER tr_ticket_pricing_updated_at BEFORE UPDATE ON public.ticket_pricing
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Itinerary trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_tour_itinerary_updated_at') THEN
    CREATE TRIGGER tr_tour_itinerary_updated_at BEFORE UPDATE ON public.tour_itinerary
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- Add-ons trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_tour_addons_updated_at') THEN
    CREATE TRIGGER tr_tour_addons_updated_at BEFORE UPDATE ON public.tour_addons
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_policies ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, authenticated manage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read categories') THEN
    CREATE POLICY "Public can read categories"
      ON public.categories FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage categories') THEN
    CREATE POLICY "Authenticated can manage categories"
      ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Tours: Public read published only, authenticated full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published tours') THEN
    CREATE POLICY "Public can view published tours"
      ON public.tours FOR SELECT TO anon USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage tours') THEN
    CREATE POLICY "Authenticated can manage tours"
      ON public.tours FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Schedules: Public read for published tours, authenticated full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view schedules') THEN
    CREATE POLICY "Public can view schedules"
      ON public.tour_schedules FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage schedules') THEN
    CREATE POLICY "Authenticated can manage schedules"
      ON public.tour_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Ticket Types: Same pattern
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view ticket types') THEN
    CREATE POLICY "Public can view ticket types"
      ON public.ticket_types FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published') AND is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage ticket types') THEN
    CREATE POLICY "Authenticated can manage ticket types"
      ON public.ticket_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Pricing: Same pattern
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view pricing') THEN
    CREATE POLICY "Public can view pricing"
      ON public.ticket_pricing FOR SELECT TO anon 
      USING (EXISTS (
        SELECT 1 FROM public.tour_schedules s 
        JOIN public.tours t ON t.id = s.tour_id 
        WHERE s.id = schedule_id AND t.status = 'published'
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage pricing') THEN
    CREATE POLICY "Authenticated can manage pricing"
      ON public.ticket_pricing FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Itinerary, Inclusions, Add-ons, Policies: Same pattern
DO $$
BEGIN
  -- Itinerary
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view itinerary') THEN
    CREATE POLICY "Public can view itinerary"
      ON public.tour_itinerary FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage itinerary') THEN
    CREATE POLICY "Authenticated can manage itinerary"
      ON public.tour_itinerary FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  -- Inclusions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view inclusions') THEN
    CREATE POLICY "Public can view inclusions"
      ON public.tour_inclusions FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage inclusions') THEN
    CREATE POLICY "Authenticated can manage inclusions"
      ON public.tour_inclusions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  -- Add-ons
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view add-ons') THEN
    CREATE POLICY "Public can view add-ons"
      ON public.tour_addons FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published') AND is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage add-ons') THEN
    CREATE POLICY "Authenticated can manage add-ons"
      ON public.tour_addons FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  -- Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view tour policies') THEN
    CREATE POLICY "Public can view tour policies"
      ON public.tour_policies FOR SELECT TO anon 
      USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_id AND t.status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage tour policies') THEN
    CREATE POLICY "Authenticated can manage tour policies"
      ON public.tour_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update tour slug on name change
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  slug := lower(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to check if tour can be published
CREATE OR REPLACE FUNCTION public.can_publish_tour(tour_id uuid)
RETURNS boolean AS $$
DECLARE
  has_schedule boolean;
  has_ticket_type boolean;
  has_pricing boolean;
BEGIN
  -- Check for schedules
  SELECT EXISTS (
    SELECT 1 FROM public.tour_schedules 
    WHERE tour_schedules.tour_id = can_publish_tour.tour_id
  ) INTO has_schedule;
  
  -- Check for ticket types
  SELECT EXISTS (
    SELECT 1 FROM public.ticket_types 
    WHERE ticket_types.tour_id = can_publish_tour.tour_id AND is_active = true
  ) INTO has_ticket_type;
  
  -- Check for pricing
  SELECT EXISTS (
    SELECT 1 FROM public.ticket_pricing tp
    JOIN public.tour_schedules ts ON ts.id = tp.schedule_id
    WHERE ts.tour_id = can_publish_tour.tour_id
  ) INTO has_pricing;
  
  RETURN has_schedule AND has_ticket_type AND has_pricing;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, color, sort_order) VALUES
  ('Adventure', 'adventure', 'mountain', '#f97316', 1),
  ('Cultural', 'cultural', 'landmark', '#8b5cf6', 2),
  ('Relaxation', 'relaxation', 'umbrella', '#10b981', 3),
  ('City Tours', 'city-tours', 'building', '#3b82f6', 4),
  ('Nature', 'nature', 'tree', '#22c55e', 5),
  ('Luxury', 'luxury', 'crown', '#f59e0b', 6)
ON CONFLICT (slug) DO NOTHING;
