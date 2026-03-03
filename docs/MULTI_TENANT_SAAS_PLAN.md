# Multi-Tenant SaaS Transformation Plan

## Context

ปัจจุบัน 6CAT Booking CRM เป็นระบบ **single-tenant** — ข้อมูลทุกอย่างอยู่ใน DB เดียวโดยไม่แยก tenant, branding hardcoded เป็น "6CATRIP/NovaTrip", ไม่มี middleware, RLS policies เป็น role-based อย่างเดียว (admin/editor/customer)

**เป้าหมาย:** แปลงเป็น Multi-Tenant SaaS เพื่อให้ลูกค้าหลายรายใช้ระบบ CRM เดียวกันได้ แต่ละรายมีหน้าบ้าน (subdomain) และข้อมูลแยกกัน

**แนวทาง:**
- Shared DB + Row-Level Security (org_id column ทุกตาราง)
- Subdomain-based frontend (client1.6catrip.com)
- Basic Subscription Plan system (Free/Pro/Enterprise)
- Super Admin Dashboard สำหรับจัดการ tenants ทั้งหมด

**Tech Stack:** Next.js 16 + React 19 + Supabase + Tailwind CSS 4

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   DNS / Hosting                  │
│  client1.6catrip.com  client2.6catrip.com       │
│  admin.6catrip.com    6catrip.com (main)        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Next.js Middleware                   │
│  - Extract subdomain → tenant slug               │
│  - Set x-tenant-slug header                      │
│  - admin.* → rewrite to /super-admin/            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Application Layer                    │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │  (public)   │ │ (dashboard)  │ │(super-    │ │
│  │  Tenant     │ │ Tenant CRM   │ │ admin)    │ │
│  │  Storefront │ │ Backoffice   │ │ Platform  │ │
│  └──────┬──────┘ └──────┬───────┘ └─────┬─────┘ │
│         │               │               │        │
│  ┌──────▼───────────────▼───────────────▼──────┐ │
│  │           API Routes (tenant-aware)          │ │
│  │  getRequestContext() → { orgId, role }       │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│                Supabase (Shared DB)               │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ RLS:     │  │ Tables:    │  │ Auth:        │  │
│  │ org_id = │  │ org_id on  │  │ app_metadata │  │
│  │ current_ │  │ every      │  │ .org_id      │  │
│  │ org_id() │  │ table      │  │              │  │
│  └──────────┘  └────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Sprint 1: Database Foundation (สัปดาห์ 1-2)

### 1.1 สร้างตารางใหม่

**Migration:** `supabase/migrations/20260217000000_multi_tenant_foundation.sql`

#### organizations
```sql
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,              -- ใช้เป็น subdomain: slug.6catrip.com
  logo_url text,
  primary_color text DEFAULT '#1e3a5f',   -- Midnight Blue
  accent_color text DEFAULT '#f97316',    -- Cat Orange
  currency text NOT NULL DEFAULT 'THB',
  timezone text NOT NULL DEFAULT 'Asia/Bangkok',
  custom_domain text UNIQUE,              -- optional custom domain
  booking_ref_prefix text NOT NULL DEFAULT 'BK',
  contact_email text,
  contact_phone text,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_orgs_slug ON public.organizations(slug);
CREATE INDEX idx_orgs_active ON public.organizations(is_active) WHERE is_active = true;
```

#### organization_members
```sql
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'org_editor'
    CHECK (role IN ('org_admin', 'org_editor', 'customer')),
  is_active boolean NOT NULL DEFAULT true,
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_org_member UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(org_id);
```

#### subscription_plans
```sql
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  max_tours integer,                  -- NULL = unlimited
  max_bookings_per_month integer,     -- NULL = unlimited
  max_team_members integer,           -- NULL = unlimited
  max_customers integer,              -- NULL = unlimited
  features jsonb NOT NULL DEFAULT '[]',
  price_monthly numeric(12,2) NOT NULL DEFAULT 0,
  price_yearly numeric(12,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default plans
INSERT INTO public.subscription_plans
  (name, slug, max_tours, max_bookings_per_month, max_team_members, max_customers, price_monthly, price_yearly, sort_order)
VALUES
  ('Free',       'free',       5,    50,   2,    100,  0,      0,      1),
  ('Pro',        'pro',        50,   500,  10,   5000, 990,    9900,   2),
  ('Enterprise', 'enterprise', NULL, NULL, NULL, NULL, 2990,   29900,  3);
```

#### organization_subscriptions
```sql
CREATE TABLE public.organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_org_subscription UNIQUE (org_id)
);
```

#### super_admins
```sql
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

### 1.2 เพิ่ม `org_id` ทุกตารางเดิม

**Migration:** `supabase/migrations/20260217010000_add_org_id_to_all_tables.sql`

เพิ่ม `org_id UUID REFERENCES organizations(id)` ใน **ทุก** 16 ตาราง:

| กลุ่ม | ตาราง |
|-------|-------|
| Core | customers, packages, tours, categories |
| Booking | trips, bookings, booking_passengers, payments |
| Tour Detail | tour_schedules, ticket_types, ticket_pricing |
| Content | tour_itinerary, tour_inclusions, tour_addons, tour_policies |
| Legacy | package_itinerary_items |

```sql
-- ตัวอย่าง (ทำซ้ำกับทุกตาราง)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id);

-- ... (ทำกับทุก 16 ตาราง)
```

**Indexes:**
```sql
CREATE INDEX idx_customers_org ON public.customers(org_id);
CREATE INDEX idx_tours_org ON public.tours(org_id);
CREATE INDEX idx_bookings_org ON public.bookings(org_id);
CREATE INDEX idx_payments_org ON public.payments(org_id);
CREATE INDEX idx_categories_org ON public.categories(org_id);
CREATE INDEX idx_trips_org ON public.trips(org_id);
CREATE INDEX idx_packages_org ON public.packages(org_id);

-- Compound indexes สำหรับ query ที่ใช้บ่อย
CREATE INDEX idx_bookings_org_status ON public.bookings(org_id, status);
CREATE INDEX idx_tours_org_status ON public.tours(org_id, status);
CREATE INDEX idx_customers_org_email ON public.customers(org_id, email);
```

**เปลี่ยน Unique Constraints:**
```sql
-- email ต้อง unique ภายใน org เดียวกัน (ไม่ใช่ globally unique)
DROP INDEX IF EXISTS customers_email_unique_idx;
CREATE UNIQUE INDEX customers_email_org_unique_idx ON public.customers(org_id, email);
```

---

### 1.3 Migrate ข้อมูลเดิม

```sql
-- สร้าง default org สำหรับข้อมูลเดิม
INSERT INTO public.organizations (id, name, slug, booking_ref_prefix)
VALUES ('00000000-0000-0000-0000-000000000001', '6CATRIP', '6catrip', 'BK-6CAT');

-- ผูก Free plan
INSERT INTO public.organization_subscriptions (org_id, plan_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM public.subscription_plans WHERE slug = 'free';

-- Backfill org_id ทุก row
UPDATE public.customers SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.packages SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tours SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.categories SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.trips SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.bookings SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.payments SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.booking_passengers SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.package_itinerary_items SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tour_schedules SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.ticket_types SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.ticket_pricing SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tour_itinerary SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tour_inclusions SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tour_addons SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.tour_policies SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;

-- ตั้ง NOT NULL หลัง backfill เสร็จ
ALTER TABLE public.customers ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.tours ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN org_id SET NOT NULL;
-- ... (ทำกับทุกตาราง)
```

---

### 1.4 RLS Policies ใหม่ (tenant-aware)

**Migration:** `supabase/migrations/20260217020000_tenant_aware_rls.sql`

#### Helper Functions
```sql
-- ดึง org_id จาก JWT app_metadata
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid;
$$;

-- เช็คว่าเป็น super admin หรือไม่
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()
  );
$$;

-- ดึง role ภายใน org ปัจจุบัน
CREATE OR REPLACE FUNCTION public.current_org_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = auth.uid()
    AND org_id = public.current_org_id()
    AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.current_org_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_role() TO authenticated;
```

#### Policy Pattern (ใช้กับทุกตาราง)
```sql
-- ตัวอย่าง: customers table (ทำซ้ำกับทุกตาราง)

-- ลบ policies เดิม
DROP POLICY IF EXISTS "Backoffice admin can read customers" ON public.customers;
DROP POLICY IF EXISTS "Backoffice admin can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Backoffice admin can update customers" ON public.customers;
DROP POLICY IF EXISTS "Backoffice admin can delete customers" ON public.customers;

-- SELECT: เห็นเฉพาะข้อมูล org ตัวเอง (หรือ super admin เห็นทั้งหมด)
CREATE POLICY "tenant_read_customers" ON public.customers
  FOR SELECT TO authenticated
  USING (org_id = public.current_org_id() OR public.is_super_admin());

-- INSERT: ต้องเป็น org_admin หรือ org_editor ของ org เดียวกัน
CREATE POLICY "tenant_insert_customers" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.current_org_id()
    AND public.current_org_role() IN ('org_admin', 'org_editor')
  );

-- UPDATE: ต้องเป็น org เดียวกัน + มี role ที่เหมาะสม
CREATE POLICY "tenant_update_customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (org_id = public.current_org_id() AND public.current_org_role() IN ('org_admin', 'org_editor'))
  WITH CHECK (org_id = public.current_org_id());

-- DELETE: เฉพาะ org_admin ของ org เดียวกัน
CREATE POLICY "tenant_delete_customers" ON public.customers
  FOR DELETE TO authenticated
  USING (org_id = public.current_org_id() AND public.current_org_role() = 'org_admin');
```

#### Public Tours (anon users)
```sql
-- Anon สามารถดู published tours ได้ (filter org ผ่าน application layer)
CREATE POLICY "anon_read_published_tours" ON public.tours
  FOR SELECT TO anon
  USING (status = 'published');
```

---

### 1.5 อัพเดท TypeScript Types

**ไฟล์:** `types/database.ts`

```typescript
// ===== ตาราง Multi-Tenant ใหม่ =====

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  currency: string;
  timezone: string;
  custom_domain: string | null;
  booking_ref_prefix: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMemberRow {
  id: string;
  org_id: string;
  user_id: string;
  role: 'org_admin' | 'org_editor' | 'customer';
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanRow {
  id: string;
  name: string;
  slug: string;
  max_tours: number | null;
  max_bookings_per_month: number | null;
  max_team_members: number | null;
  max_customers: number | null;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrgSubscriptionRow {
  id: string;
  org_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===== เพิ่ม org_id ใน Row types ทุกตัว =====
// เพิ่มใน CustomerRow, TourRow, BookingRow, PaymentRow, etc.:
//   org_id: string;
```

---

## Sprint 2: Auth + Client Refactor (สัปดาห์ 3-4)

### 2.1 Middleware สำหรับ Subdomain Detection

**สร้างไฟล์ใหม่:** `middleware.ts` (project root)

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_DOMAIN = '6catrip.com';
const SUPER_ADMIN_SUBDOMAIN = 'admin';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  // Extract subdomain
  const subdomain = extractSubdomain(hostname, PLATFORM_DOMAIN);

  // Super admin routes
  if (subdomain === SUPER_ADMIN_SUBDOMAIN) {
    const url = request.nextUrl.clone();
    url.pathname = `/super-admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Tenant subdomain detected
  if (subdomain && subdomain !== 'www') {
    const response = NextResponse.next();
    response.headers.set('x-tenant-slug', subdomain);
    return response;
  }

  return NextResponse.next();
}

function extractSubdomain(hostname: string, platformDomain: string): string | null {
  if (hostname.includes('localhost')) {
    return null; // dev: ใช้ query param ?tenant=slug
  }
  if (hostname.endsWith(platformDomain)) {
    const parts = hostname.replace(`.${platformDomain}`, '').split('.');
    return parts[0] || null;
  }
  return null;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

### 2.2 Tenant Context System

**สร้างไฟล์ใหม่:**

#### `lib/tenant/context.ts`
```typescript
export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  currency: string;
  timezone: string;
  bookingRefPrefix: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

// Server-side: resolve tenant จาก headers (set โดย middleware)
export async function resolveTenantFromHeaders(
  headers: Headers
): Promise<TenantConfig | null> {
  const slug = headers.get('x-tenant-slug');
  if (!slug) return null;
  return getTenantBySlug(slug);
}

export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  // Query organizations table, cache 5 นาที
}
```

#### `lib/tenant/tenant-provider.tsx`
```typescript
'use client';
import { createContext, useContext } from 'react';
import type { TenantConfig } from './context';

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({ tenant, children }: {
  tenant: TenantConfig;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
```

### 2.3 อัพเดท Role System

**แก้ไข:** `lib/auth/roles.ts`

```typescript
// Role hierarchy ใหม่
export type PlatformRole = 'super_admin';
export type OrgRole = 'org_admin' | 'org_editor' | 'customer';
export type EffectiveRole = PlatformRole | OrgRole;

// ดึง role จาก app_metadata (ไม่ใช่ user_metadata)
export function getEffectiveRole(user: User): EffectiveRole { ... }

// เช็ค super admin
export function isSuperAdmin(user: User): boolean { ... }

// เช็คสิทธิ์ภายใน org
export function canManageOrg(role: OrgRole): boolean {
  return role === 'org_admin' || role === 'org_editor';
}
```

### 2.4 Refactor Supabase Client

**แก้ไข:** `lib/supabase/client.ts`

```typescript
// Factory pattern แทน global singleton
export function createBrowserClient(): SupabaseClient { ... }
export function createServiceClient(): SupabaseClient { ... }

// Backward compat (ลบทีหลัง)
export const supabase = createClient(...);
```

### 2.5 Refactor Query Files (13 ไฟล์)

**แก้ไข:** ทุกไฟล์ใน `lib/supabase/`

Pattern เปลี่ยน:
```typescript
// ก่อน
export async function getBookings(params = {}) {
  let query = supabase.from('bookings').select('*');
  // ...
}

// หลัง
export async function getBookings(orgId: string, params = {}) {
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('org_id', orgId);  // <-- เพิ่มทุก query
  // ...
}
```

ไฟล์ที่ต้องแก้:
1. `lib/supabase/bookings.ts`
2. `lib/supabase/customers.ts`
3. `lib/supabase/tours.ts`
4. `lib/supabase/categories.ts`
5. `lib/supabase/dashboard.ts`
6. `lib/supabase/packages.ts`
7. `lib/supabase/payments.ts`
8. `lib/supabase/trips.ts`
9. `lib/supabase/schedules.ts`
10. `lib/supabase/pricing.ts`
11. `lib/supabase/ticket-types.ts`
12. `lib/supabase/itinerary.ts`

---

## Sprint 3: API Layer (สัปดาห์ 5-6)

### 3.1 Request Context Helper

**สร้างไฟล์ใหม่:** `lib/api/tenant.ts`

```typescript
export interface RequestContext {
  orgId: string;
  userId: string;
  orgRole: OrgRole;
  isSuperAdmin: boolean;
}

export async function getRequestContext(
  request: NextRequest
): Promise<RequestContext | null> {
  // 1. Validate JWT จาก Authorization header
  // 2. Extract org_id จาก app_metadata
  // 3. Check organization_members สำหรับ role
  // 4. Return context
}
```

### 3.2 อัพเดท API Routes ทั้งหมด (18 routes)

ทุก route ต้อง:
1. เรียก `getRequestContext(request)`
2. ส่ง `orgId` ไปยัง query functions
3. Return 401 ถ้า context เป็น null

```typescript
// ตัวอย่าง: app/api/v1/tours/route.ts
export async function GET(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) return apiError('UNAUTHORIZED', 'Not authenticated', 401);

  const result = await getTours(ctx.orgId, { page, limit, search, ... });
  return apiSuccess(result);
}
```

### 3.3 Super Admin API Routes

**สร้างใหม่:** `app/api/super-admin/`

| Route | Methods | จุดประสงค์ |
|-------|---------|-----------|
| `organizations/route.ts` | GET, POST | List/Create orgs |
| `organizations/[id]/route.ts` | GET, PATCH, DELETE | Org detail/update |
| `organizations/[id]/members/route.ts` | GET, POST, DELETE | Manage members |
| `subscriptions/route.ts` | GET, PATCH | Manage subscriptions |
| `plans/route.ts` | GET, POST, PATCH | Manage plans |
| `stats/route.ts` | GET | Platform-wide stats |

---

## Sprint 4: Frontend Multi-Tenant (สัปดาห์ 7-8)

### 4.1 Next.js Config

**แก้ไข:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'admin.6catrip.com' }],
          destination: '/super-admin/:path*',
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};
```

### 4.2 แทนที่ Hardcoded Branding (20+ จุด)

| ค่าเดิม | ไฟล์ที่ต้องแก้ | แทนที่ด้วย |
|---------|---------------|-----------|
| `"6CATRIP"` / `"NovaTrip"` | `landing-header.tsx`, `landing-footer.tsx`, `about/page.tsx`, `testimonials.tsx`, `our-stories.tsx` | `tenant.name` |
| `"6CAT Booking CRM"` | `app/layout.tsx`, `app/(auth)/layout.tsx` | `${tenant.name} Booking` |
| `"BK-6CAT-"` | `checkout/page.tsx`, `payment/page.tsx`, `thank-you/page.tsx` | `tenant.bookingRefPrefix` |
| `"6CAT100"`, `"6CAT10"` | `checkout/page.tsx` | ย้ายไป `promo_codes` table per-org |
| `"6cat_cart_v1"` | `lib/cart/local-cart.ts` | `${tenant.slug}_cart_v1` |
| `"6cat_bookings_v1"` | `lib/bookings/local-bookings.ts` | `${tenant.slug}_bookings_v1` |
| Logo image imports | `landing-header.tsx` | `tenant.logoUrl` with `<Image>` fallback |
| `"THB"` hardcoded | `landing-header.tsx` | `tenant.currency` |
| `"hello@6catrip.com"` | `landing-footer.tsx` | `tenant.contactEmail` |
| `"123 Travel Street, Bangkok"` | `landing-footer.tsx` | `tenant.address` |

### 4.3 Tenant-Aware Layouts

```typescript
// app/(public)/layout.tsx
export default async function PublicLayout({ children }) {
  const headersList = await headers();
  const tenant = await resolveTenantFromHeaders(headersList);

  return (
    <TenantProvider tenant={tenant ?? DEFAULT_TENANT_CONFIG}>
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </TenantProvider>
  );
}
```

---

## Sprint 5: Super Admin Dashboard (สัปดาห์ 9-10)

### 5.1 Route Structure

```
app/(super-admin)/
├── layout.tsx                      ← SuperAdminGuard wrapper
├── dashboard/page.tsx              ← Platform overview stats
├── tenants/
│   ├── page.tsx                    ← Organization list
│   ├── create/page.tsx             ← Create new org
│   └── [id]/
│       ├── page.tsx                ← Org detail + usage metrics
│       └── members/page.tsx        ← Manage org members
├── plans/page.tsx                  ← Manage plan definitions
└── subscriptions/page.tsx          ← All subscriptions overview
```

### 5.2 Key Features

**Tenant List Page:**
- Organization name, slug, subdomain URL
- Current plan, subscription status
- Member count, tour count, booking count (this month)
- Created date, last activity
- Quick actions: view, edit, deactivate

**Tenant Detail Page:**
- Organization settings (editable: name, logo, colors, currency)
- Usage metrics vs plan limits (bar charts)
- Member list with roles
- Change plan / Cancel subscription
- Activity log

**Platform Stats Dashboard:**
- Total organizations, total users
- Total bookings this month (all orgs)
- Total revenue (all orgs)
- Top orgs by booking volume
- Growth charts

### 5.3 Components

**สร้างใหม่:** `components/features/super-admin/`
- `tenant-list-table.tsx` — ตาราง organizations
- `tenant-detail-card.tsx` — แสดงรายละเอียด org
- `tenant-form.tsx` — ฟอร์มสร้าง/แก้ org
- `plan-management.tsx` — จัดการ plans
- `usage-stats-card.tsx` — แสดง usage vs limits
- `platform-stats.tsx` — stats รวมทั้ง platform

---

## Sprint 6: Quota System + Polish (สัปดาห์ 11-12)

### 6.1 Quota Enforcement

**สร้างไฟล์ใหม่:** `lib/tenant/quota.ts`

```typescript
export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number | null; // null = unlimited
}

export async function checkTourQuota(orgId: string): Promise<QuotaCheckResult> {
  // 1. Get org subscription → plan
  // 2. Count active tours
  // 3. Compare vs plan.max_tours
}

export async function checkBookingQuota(orgId: string): Promise<QuotaCheckResult> {
  // Count bookings this month vs plan.max_bookings_per_month
}

export async function checkMemberQuota(orgId: string): Promise<QuotaCheckResult> {
  // Count active members vs plan.max_team_members
}
```

**Enforcement Points:**
- `POST /api/v1/tours` → `checkTourQuota()`
- `POST /api/bookings` → `checkBookingQuota()`
- `POST /api/super-admin/organizations/[id]/members` → `checkMemberQuota()`

```typescript
// Return 403 เมื่อเกิน limit
if (!quotaCheck.allowed) {
  return apiError('BUSINESS_RULE_VIOLATION',
    `Plan limit reached: ${quotaCheck.reason}`,
    403
  );
}
```

### 6.2 Testing Checklist

- [ ] Tenant isolation: user org A query ข้อมูลต้องไม่เห็น org B
- [ ] Subdomain routing: client1.6catrip.com เห็น data org1 เท่านั้น
- [ ] Super admin: เห็นทุก org, CRUD tenants ได้
- [ ] Role enforcement: org_editor สร้าง/แก้ได้ แต่ลบไม่ได้
- [ ] Quota: สร้าง tour เกิน limit ของ Free plan ต้อง reject
- [ ] RLS: ใช้ anon key query ต้องเห็นเฉพาะ published tours
- [ ] Existing data: ข้อมูลเดิมทั้งหมดผูกกับ default org "6CATRIP"
- [ ] localStorage: cart ของ tenant A แยกจาก tenant B

---

## Key Risks & Mitigations

| Risk | ผลกระทบ | วิธีป้องกัน |
|------|---------|------------|
| Data leak ข้าม tenant | ลูกค้าเห็นข้อมูลกัน | Defense-in-depth: RLS + app-level filter |
| service_role bypass RLS | ข้อมูลหลุด | ใช้ service_role เฉพาะ super admin routes |
| Anon users ไม่มี JWT | ไม่มี org context | Public routes filter จาก subdomain slug |
| Email unique constraint | สร้าง customer ซ้ำ cross-org | เปลี่ยนเป็น `UNIQUE(org_id, email)` |
| Performance hit จาก RLS | Query ช้า | Index on org_id + compound indexes |
| Tenant switching | User อยู่หลาย org | Store active org ใน app_metadata, switch via API |

---

## Critical Files Reference

| ไฟล์ | ต้องทำอะไร |
|------|-----------|
| `lib/supabase/client.ts` | Refactor singleton → factory |
| `supabase/migrations/` | สร้าง 3 migration files ใหม่ |
| `lib/auth/roles.ts` | ขยาย role system (4 roles) |
| `lib/supabase/*.ts` (13 files) | เพิ่ม org_id ทุก query |
| `app/api/**` (18 routes) | เพิ่ม tenant context validation |
| `types/database.ts` | เพิ่ม types ใหม่ + org_id fields |
| `next.config.ts` | Subdomain rewrites |
| `middleware.ts` | สร้างใหม่ (subdomain detection) |
| `lib/tenant/` | สร้างใหม่ (context, provider, quota) |
| `lib/api/tenant.ts` | สร้างใหม่ (request context helper) |
| `app/(super-admin)/` | สร้างใหม่ (super admin pages) |
| `components/features/super-admin/` | สร้างใหม่ (super admin components) |
| Landing components (10+ files) | แทนที่ hardcoded branding |
| `lib/cart/local-cart.ts` | Tenant-scoped localStorage key |
| `lib/bookings/local-bookings.ts` | Tenant-scoped localStorage key |
