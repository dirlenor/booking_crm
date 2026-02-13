# Tour Booking Platform - Phase 1 Architecture Design

## Executive Summary

Production-ready architecture for Phase 1 (Tour Creation, Ticket Types, Ticket Details) with future-proofing for Phase 2 (Booking & Payment).

---

## 1. Database Schema

### Core Tables

```sql
-- ============================================
-- 1. TOURS (Replaces/Enhances existing packages)
-- ============================================
CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly identifier
  description text,
  short_description text, -- For cards/previews
  
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
  duration_text text, -- e.g., "3 Days 2 Nights"
  
  -- Status Workflow
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
CREATE INDEX idx_tours_status ON public.tours(status);
CREATE INDEX idx_tours_category ON public.tours(category_id);
CREATE INDEX idx_tours_destination ON public.tours(destination);
CREATE INDEX idx_tours_slug ON public.tours(slug);
CREATE INDEX idx_tours_published ON public.tours(status, published_at) 
  WHERE status = 'published';
CREATE INDEX idx_tours_search ON public.tours 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE public.categories (
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

CREATE INDEX idx_categories_active ON public.categories(is_active, sort_order);

-- ============================================
-- 3. TOUR SCHEDULES (Tour dates/times)
-- ============================================
CREATE TABLE public.tour_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  -- Schedule Details
  start_date date NOT NULL,
  start_time time NOT NULL DEFAULT '08:00:00',
  end_date date, -- Calculated from start_date + duration
  end_time time,
  
  -- Capacity
  total_capacity integer NOT NULL CHECK (total_capacity >= 0),
  available_capacity integer NOT NULL CHECK (available_capacity >= 0),
  
  -- Status
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closing_soon', 'full', 'closed', 'cancelled')),
  
  -- Pricing Override (optional)
  has_special_price boolean DEFAULT false,
  special_price_note text,
  
  -- Cutoff
  booking_cutoff_hours integer DEFAULT 24 CHECK (booking_cutoff_hours >= 0),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure no duplicate schedules for same tour on same datetime
  CONSTRAINT unique_tour_schedule UNIQUE (tour_id, start_date, start_time)
);

CREATE INDEX idx_schedules_tour ON public.tour_schedules(tour_id);
CREATE INDEX idx_schedules_date ON public.tour_schedules(start_date);
CREATE INDEX idx_schedules_status ON public.tour_schedules(status);
CREATE INDEX idx_schedules_available ON public.tour_schedules(tour_id, start_date) 
  WHERE status IN ('open', 'closing_soon') AND available_capacity > 0;

-- ============================================
-- 4. TICKET TYPES (Adult, Child, Infant, VIP, etc.)
-- ============================================
CREATE TABLE public.ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  -- Basic Info
  name text NOT NULL, -- e.g., "Adult", "Child (3-12)", "VIP Package"
  code text, -- Short code: ADT, CHD, INF, VIP
  description text,
  
  -- Display Order
  sort_order integer DEFAULT 0,
  
  -- Restrictions
  min_age integer CHECK (min_age >= 0),
  max_age integer CHECK (max_age >= min_age),
  requires_id_proof boolean DEFAULT false,
  
  -- Capacity (optional per-ticket limit)
  max_quantity_per_booking integer CHECK (max_quantity_per_booking >= 1),
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_ticket_type_code UNIQUE (tour_id, code)
);

CREATE INDEX idx_ticket_types_tour ON public.ticket_types(tour_id);
CREATE INDEX idx_ticket_types_active ON public.ticket_types(tour_id, is_active) 
  WHERE is_active = true;

-- ============================================
-- 5. TICKET PRICING (Price per ticket type per schedule)
-- ============================================
CREATE TABLE public.ticket_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.tour_schedules(id) ON DELETE CASCADE,
  ticket_type_id uuid NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  
  -- Pricing
  base_price numeric(12,2) NOT NULL CHECK (base_price >= 0),
  sale_price numeric(12,2) CHECK (sale_price >= 0 AND sale_price <= base_price),
  
  -- Currency
  currency text NOT NULL DEFAULT 'THB' CHECK (currency IN ('THB', 'USD', 'EUR', 'JPY')),
  
  -- Availability
  quantity_available integer CHECK (quantity_available >= 0),
  
  -- Validity
  valid_from timestamptz,
  valid_until timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_pricing UNIQUE (schedule_id, ticket_type_id)
);

CREATE INDEX idx_pricing_schedule ON public.ticket_pricing(schedule_id);
CREATE INDEX idx_pricing_type ON public.ticket_pricing(ticket_type_id);
CREATE INDEX idx_pricing_valid ON public.ticket_pricing(valid_from, valid_until);

-- ============================================
-- 6. TOUR ITINERARY (Day-by-day details)
-- ============================================
CREATE TABLE public.tour_itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  day_number integer NOT NULL CHECK (day_number >= 1),
  title text NOT NULL,
  description text,
  
  -- Activities for this day
  activities jsonb DEFAULT '[]'::jsonb,
  -- [{ "time": "09:00", "activity": "Hotel pickup", "location": "...", "duration": "30min" }]
  
  -- Meals
  meals text[] DEFAULT '{}', -- ['breakfast', 'lunch', 'dinner']
  
  -- Accommodation
  accommodation_name text,
  accommodation_description text,
  
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_itinerary_day UNIQUE (tour_id, day_number)
);

CREATE INDEX idx_itinerary_tour ON public.tour_itinerary(tour_id);
CREATE INDEX idx_itinerary_day ON public.tour_itinerary(tour_id, day_number);

-- ============================================
-- 7. TOUR INCLUSIONS/EXCLUSIONS
-- ============================================
CREATE TABLE public.tour_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  item text NOT NULL,
  is_included boolean DEFAULT true, -- true = included, false = excluded
  sort_order integer DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inclusions_tour ON public.tour_inclusions(tour_id);

-- ============================================
-- 8. TOUR ADD-ONS (Optional extras)
-- ============================================
CREATE TABLE public.tour_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  
  is_per_person boolean DEFAULT true, -- false = per booking
  max_quantity integer CHECK (max_quantity >= 1),
  
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addons_tour ON public.tour_addons(tour_id);

-- ============================================
-- 9. TOUR POLICIES (Cancellation, refund, etc.)
-- ============================================
CREATE TABLE public.tour_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  
  policy_type text NOT NULL CHECK (policy_type IN ('cancellation', 'refund', 'child', 'weather', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  
  -- For cancellation: hours_before -> refund_percentage
  hours_before integer,
  refund_percentage integer CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_policies_tour ON public.tour_policies(tour_id);
CREATE INDEX idx_policies_type ON public.tour_policies(tour_id, policy_type);

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

CREATE TRIGGER tr_tours_updated_at BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tour_schedules_updated_at BEFORE UPDATE ON public.tour_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_ticket_pricing_updated_at BEFORE UPDATE ON public.ticket_pricing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tour_itinerary_updated_at BEFORE UPDATE ON public.tour_itinerary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tour_addons_updated_at BEFORE UPDATE ON public.tour_addons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_pricing ENABLE ROW LEVEL SECURITY;

-- Public can view published tours
CREATE POLICY "Public can view published tours"
  ON public.tours FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated users can view all tours (for admin)
CREATE POLICY "Authenticated can view all tours"
  ON public.tours FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage tours"
  ON public.tours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Similar policies for other tables...
```

---

## 2. ER Diagram Explanation

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   categories    │     │      tours       │     │ tour_itinerary   │
├─────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)         │────<│ category_id (FK) │     │ tour_id (FK)     │
│ name            │     │ id (PK)          │>────│ id (PK)          │
│ slug            │     │ name             │     │ day_number       │
└─────────────────┘     │ slug             │     │ activities       │
                        │ status           │     └──────────────────┘
┌─────────────────┐     │ min/max_pax      │
│  tour_policies  │     └──────────────────┘
├─────────────────┤              │
│ tour_id (FK)    │              │
│ policy_type     │              ▼
└─────────────────┘     ┌──────────────────┐
                        │  tour_schedules  │
                        ├──────────────────┤
                        │ id (PK)          │
                        │ tour_id (FK)     │
                        │ start_date/time  │
                        │ capacity         │
                        │ status           │
                        └──────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  ticket_types    │  │ ticket_pricing   │  │   tour_addons    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ schedule_id (FK) │  │ tour_id (FK)     │
│ tour_id (FK)     │  │ ticket_type_id   │  │ name             │
│ name             │  │ base_price       │  │ price            │
│ min/max_age      │  │ sale_price       │  └──────────────────┘
└──────────────────┘  └──────────────────┘
```

**Relationships:**
- **Tour** has many **Schedules** (1:N)
- **Tour** has many **Ticket Types** (1:N)
- **Schedule** has many **Ticket Pricings** (1:N)
- **Ticket Type** has many **Ticket Pricings** (1:N)
- **Tour** has many **Itinerary Days** (1:N)
- **Tour** has many **Add-ons** (1:N)
- **Tour** has many **Policies** (1:N)

---

## 3. REST API Design

### Base URL: `/api/v1`

### Tours Endpoints

```
GET    /tours                    # List tours (with filters)
POST   /tours                    # Create tour
GET    /tours/:id                # Get tour detail
PUT    /tours/:id                # Update tour
PATCH  /tours/:id/status         # Update status only
DELETE /tours/:id                # Soft delete

GET    /tours/:id/schedules      # List schedules for tour
POST   /tours/:id/schedules      # Create schedule
PUT    /tours/:id/schedules/:sid # Update schedule

GET    /tours/:id/ticket-types   # List ticket types
POST   /tours/:id/ticket-types   # Create ticket type
PUT    /tours/:id/ticket-types/:tid

GET    /tours/:id/itinerary      # Get itinerary
POST   /tours/:id/itinerary      # Bulk create itinerary
PUT    /tours/:id/itinerary/:iid # Update day
```

### Categories

```
GET    /categories               # List categories
POST   /categories               # Create category
PUT    /categories/:id           # Update category
```

### Availability & Pricing

```
GET    /availability             # Check availability
       ?tour_id=&date_from=&date_to=
       
GET    /pricing                  # Get pricing for schedule
       ?schedule_id=&ticket_type_ids=
```

---

## 4. Validation Rules

### Tour Validation

```typescript
const tourValidation = {
  name: {
    required: true,
    minLength: 5,
    maxLength: 200,
    pattern: /^[\w\s\-\'\(\)]+$/
  },
  slug: {
    required: true,
    unique: true,
    pattern: /^[a-z0-9-]+$/,
    maxLength: 100
  },
  destination: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  duration_days: {
    required: true,
    min: 1,
    max: 30
  },
  min_pax: {
    min: 1,
    max: 50,
    validate: (val, tour) => val <= tour.max_pax
  },
  max_pax: {
    min: 1,
    max: 1000
  },
  status: {
    allowed: ['draft', 'pending_review', 'published', 'archived'],
    transitions: {
      draft: ['pending_review', 'published'],
      pending_review: ['draft', 'published', 'archived'],
      published: ['archived'],
      archived: ['draft']
    }
  }
};
```

### Schedule Validation

```typescript
const scheduleValidation = {
  start_date: {
    required: true,
    futureDate: true, // Must be >= today
    validate: (val, schedule) => {
      if (schedule.end_date) {
        return val <= schedule.end_date;
      }
      return true;
    }
  },
  total_capacity: {
    required: true,
    min: 1,
    max: 1000
  },
  available_capacity: {
    min: 0,
    max: (val, schedule) => schedule.total_capacity
  },
  booking_cutoff_hours: {
    min: 0,
    max: 168 // 1 week
  }
};
```

### Ticket Type Validation

```typescript
const ticketTypeValidation = {
  name: {
    required: true,
    maxLength: 100
  },
  code: {
    required: true,
    pattern: /^[A-Z]{2,5}$/, // ADT, CHD, INF, VIP
    uniquePerTour: true
  },
  min_age: {
    min: 0,
    max: 120
  },
  max_age: {
    min: (val, type) => type.min_age || 0,
    max: 120
  }
};
```

### Pricing Validation

```typescript
const pricingValidation = {
  base_price: {
    required: true,
    min: 0,
    max: 999999.99
  },
  sale_price: {
    min: 0,
    max: (val, pricing) => pricing.base_price,
    validate: (val) => val === null || val < pricing.base_price
  }
};
```

---

## 5. Business Constraints

### Status Workflow

```
draft → pending_review → published → archived
  ↑         ↓               ↓
  └─────────┴───────────────┘
```

**Rules:**
- Cannot publish without:
  - At least 1 schedule
  - At least 1 ticket type
  - Base price set
  - Valid itinerary (matches duration)
- Cannot delete published tour with future bookings
- Archived tours don't show in public API

### Schedule Constraints

- No overlapping schedules for same tour
- `available_capacity` auto-calculated from bookings
- `status` auto-updates:
  - `full` when available_capacity = 0
  - `closing_soon` when < 10% capacity or < cutoff time
  - `closed` when past start_date

### Pricing Constraints

- Price must be set for all ticket types in a schedule
- Cannot change price after bookings exist
- Can create "special price" for specific dates

### Capacity Constraints

- Total bookings per schedule ≤ total_capacity
- Per-ticket-type limit enforced
- Overbooking not allowed (strict check)

---

## 6. Edge Cases & Handling

### Concurrent Bookings

```sql
-- Use SELECT FOR UPDATE to prevent race conditions
BEGIN;
SELECT available_capacity 
FROM tour_schedules 
WHERE id = ? 
FOR UPDATE;

-- Check capacity
-- Create booking
-- Update available_capacity
COMMIT;
```

### Price Changes

```typescript
// Strategy: Lock pricing once bookings exist
if (scheduleHasBookings(scheduleId)) {
  throw new Error('Cannot modify pricing after bookings exist');
}

// Alternative: Create new pricing version
// Keep history in ticket_pricing_history table
```

### Tour Cancellation

```typescript
enum CancellationReason {
  WEATHER = 'weather',
  INSUFFICIENT_PAX = 'insufficient_pax',
  FORCE_MAJEURE = 'force_majeure',
  OPERATIONAL = 'operational'
}

// Auto-notify customers
// Full refund regardless of policy
// Mark schedule as 'cancelled'
```

### Timezone Handling

- Store all dates in UTC
- Display in user's timezone (frontend)
- Cutoff times calculated in tour's local timezone

### Inventory Sync

```typescript
// When booking created
await updateAvailableCapacity(scheduleId, -quantity);

// When booking cancelled
await updateAvailableCapacity(scheduleId, +quantity);

// Cron job to fix drift
await syncCapacityFromBookings();
```

---

## 7. Folder Structure

```
6cat-booking-crm/
├── app/
│   ├── (dashboard)/
│   │   ├── tours/
│   │   │   ├── page.tsx                 # Tour list
│   │   │   ├── create/
│   │   │   │   └── page.tsx             # Create tour
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx             # Tour detail
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx         # Edit tour
│   │   │   └── trash/
│   │   │       └── page.tsx             # Deleted tours
│   │   ├── schedules/
│   │   │   └── page.tsx                 # Schedule management
│   │   └── categories/
│   │       └── page.tsx
│   └── api/
│       └── v1/
│           ├── tours/
│           │   ├── route.ts             # GET, POST
│           │   └── [id]/
│           │       ├── route.ts         # GET, PUT, DELETE
│           │       ├── schedules/
│           │       │   └── route.ts
│           │       ├── ticket-types/
│           │       │   └── route.ts
│           │       └── itinerary/
│           │           └── route.ts
│           ├── categories/
│           │   └── route.ts
│           └── availability/
│               └── route.ts
├── components/
│   └── features/
│       └── tours/
│           ├── tour-list/
│           ├── tour-form/
│           ├── schedule-manager/
│           ├── ticket-type-editor/
│           ├── pricing-calendar/
│           └── itinerary-builder/
├── lib/
│   ├── supabase/
│   │   ├── tours.ts                     # Tour service
│   │   ├── schedules.ts                 # Schedule service
│   │   ├── ticket-types.ts              # Ticket service
│   │   └── pricing.ts                   # Pricing service
│   ├── validations/
│   │   ├── tour.schema.ts               # Zod schemas
│   │   ├── schedule.schema.ts
│   │   └── ticket.schema.ts
│   └── utils/
│       ├── slug.ts                      # Slug generator
│       └── capacity.ts                  # Capacity calculator
├── types/
│   └── database.ts                      # All TypeScript types
└── supabase/
    └── migrations/
        ├── 001_create_tours.sql
        ├── 002_create_schedules.sql
        ├── 003_create_ticket_types.sql
        └── 004_create_pricing.sql
```

---

## 8. Example API Payloads

### Create Tour

```json
// POST /api/v1/tours
{
  "name": "Bangkok Temples & Food Tour",
  "slug": "bangkok-temples-food-tour",
  "description": "Explore the best temples and street food...",
  "short_description": "A full day of temples and authentic Thai food",
  "destination": "Bangkok",
  "duration_days": 1,
  "duration_hours": 8,
  "min_pax": 2,
  "max_pax": 12,
  "category_id": "uuid",
  "featured_image_url": "https://...",
  "meeting_point": "Siam BTS Station Exit 3",
  "tags": ["culture", "food", "temples"]
}

// Response 201
{
  "id": "uuid",
  "name": "Bangkok Temples & Food Tour",
  "status": "draft",
  "created_at": "2026-02-11T12:00:00Z",
  "updated_at": "2026-02-11T12:00:00Z"
}
```

### Create Schedule

```json
// POST /api/v1/tours/:id/schedules
{
  "start_date": "2026-03-15",
  "start_time": "08:00",
  "total_capacity": 20,
  "booking_cutoff_hours": 24
}

// Response 201
{
  "id": "uuid",
  "tour_id": "tour-uuid",
  "start_date": "2026-03-15",
  "start_time": "08:00:00",
  "end_date": "2026-03-15",
  "end_time": "16:00:00",
  "total_capacity": 20,
  "available_capacity": 20,
  "status": "open"
}
```

### Create Ticket Type

```json
// POST /api/v1/tours/:id/ticket-types
{
  "name": "Adult",
  "code": "ADT",
  "description": "Ages 13-59",
  "min_age": 13,
  "max_age": 59,
  "max_quantity_per_booking": 10
}

// Response 201
{
  "id": "uuid",
  "name": "Adult",
  "code": "ADT",
  "is_active": true
}
```

### Set Pricing

```json
// POST /api/v1/pricing/bulk
{
  "schedule_id": "schedule-uuid",
  "pricing": [
    {
      "ticket_type_id": "adult-uuid",
      "base_price": 2500.00,
      "sale_price": 2200.00,
      "quantity_available": 15
    },
    {
      "ticket_type_id": "child-uuid",
      "base_price": 1500.00,
      "quantity_available": 5
    }
  ]
}
```

### Check Availability

```json
// GET /api/v1/availability?tour_id=xxx&date_from=2026-03-01&date_to=2026-03-31

// Response 200
{
  "tour_id": "uuid",
  "date_from": "2026-03-01",
  "date_to": "2026-03-31",
  "schedules": [
    {
      "id": "schedule-uuid",
      "date": "2026-03-15",
      "time": "08:00",
      "status": "open",
      "available_capacity": 12,
      "pricing": [
        {
          "ticket_type_id": "adult-uuid",
          "name": "Adult",
          "base_price": 2500,
          "sale_price": 2200,
          "available": 8
        }
      ]
    }
  ]
}
```

---

## 9. Error Response Standard

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;           // Machine-readable code
    message: string;        // Human-readable message
    details?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    requestId: string;      // For debugging
  };
}

// Example: Validation Error (400)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 5 characters",
        "code": "MIN_LENGTH"
      },
      {
        "field": "slug",
        "message": "Slug already exists",
        "code": "DUPLICATE"
      }
    ],
    "requestId": "req_abc123"
  }
}

// Example: Not Found (404)
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Tour not found",
    "requestId": "req_def456"
  }
}

// Example: Business Logic (422)
{
  "success": false,
  "error": {
    "code": "CANNOT_PUBLISH",
    "message": "Cannot publish tour without schedules",
    "requestId": "req_ghi789"
  }
}

// Example: Conflict (409)
{
  "success": false,
  "error": {
    "code": "SCHEDULE_OVERLAP",
    "message": "Schedule overlaps with existing schedule",
    "details": [
      {
        "field": "start_date",
        "message": "Overlaps with schedule ID: xxx",
        "code": "OVERLAP"
      }
    ],
    "requestId": "req_jkl012"
  }
}
```

### Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_JSON` | 400 | Malformed request body |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `CANNOT_PUBLISH` | 422 | Business rule violation |
| `INSUFFICIENT_CAPACITY` | 422 | No seats available |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 10. Future-Proof Design (Phase 2)

### Booking Integration Points

```typescript
// booking_tickets table will reference:
// - tour_schedules.id (which tour/date)
// - ticket_pricing.id (what price was paid)
// - ticket_types.id (what ticket type)

// Pre-built for:
interface Booking {
  schedule_id: uuid;      // Links to tour_schedules
  tickets: Array<{
    ticket_type_id: uuid;
    pricing_id: uuid;     // Snapshot of pricing
    quantity: number;
    unit_price: number;   // Price at booking time
  }>;
  addons: Array<{
    addon_id: uuid;
    quantity: number;
  }>;
}
```

### Payment Integration

```typescript
// Payment splits by ticket type for reporting
interface Payment {
  booking_id: uuid;
  schedule_id: uuid;      // For tour revenue reports
  items: Array<{
    type: 'ticket' | 'addon';
    item_id: uuid;
    amount: number;
  }>;
}
```

### Reporting Schema

```sql
-- Pre-aggregated views for performance
CREATE VIEW tour_revenue_summary AS
SELECT 
  t.id as tour_id,
  t.name,
  COUNT(DISTINCT s.id) as total_schedules,
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(b.total_amount) as total_revenue
FROM tours t
LEFT JOIN tour_schedules s ON s.tour_id = t.id
LEFT JOIN bookings b ON b.schedule_id = s.id
GROUP BY t.id, t.name;
```

### Extensibility Features

1. **Multi-language Support**: Add `tour_translations` table
2. **Dynamic Pricing**: Add `pricing_rules` table for automated discounts
3. **Promo Codes**: Add `promotions` table linking to tours
4. **Reviews**: Add `tour_reviews` table
5. **Supplier Management**: Add `suppliers` and `tour_suppliers` tables
6. **Commission Tracking**: Add `commissions` table per booking

---

## Implementation Priority

### Week 1: Foundation
- [ ] Database schema migration
- [ ] Basic CRUD API for tours
- [ ] Slug generation & validation

### Week 2: Core Features
- [ ] Schedule management
- [ ] Ticket types
- [ ] Basic pricing

### Week 3: Advanced
- [ ] Itinerary builder
- [ ] Availability checking
- [ ] Soft delete & trash

### Week 4: Polish
- [ ] Validation & error handling
- [ ] Search & filtering
- [ ] Performance optimization

---

**Ready for production!** 🚀

Need me to implement any specific part of this architecture?