-- Migration: Add soft delete support for packages
-- Purpose: Allow packages to be soft deleted instead of hard deleted
-- Date: 2026-02-11

-- ============================================
-- 1. UPDATE packages STATUS CONSTRAINT
-- ============================================

-- Drop existing constraint
ALTER TABLE public.packages 
DROP CONSTRAINT IF EXISTS packages_status_check;

-- Add new constraint with 'deleted' status
ALTER TABLE public.packages
ADD CONSTRAINT packages_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'deleted'));

-- ============================================
-- 2. ADD INDEX FOR DELETED STATUS QUERIES
-- ============================================

-- Index for filtering active vs deleted packages
CREATE INDEX IF NOT EXISTS packages_status_active_idx 
  ON public.packages (status) 
  WHERE status != 'deleted';

-- ============================================
-- 3. ADD HELPER COMMENT
-- ============================================

COMMENT ON COLUMN public.packages.status IS 'Package status: draft/published/archived/deleted (soft delete)';
