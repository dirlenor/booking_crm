import type { User } from '@supabase/supabase-js';

export type BackofficeRole = 'admin' | 'editor' | 'customer';

export function getBackofficeRole(user: User | null | undefined): BackofficeRole {
  if (!user) return 'customer';

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawRole =
    (typeof meta.backoffice_role === 'string' && meta.backoffice_role) ||
    (typeof meta.role === 'string' && meta.role) ||
    '';

  const normalized = rawRole.trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'editor') return normalized;
  return 'customer';
}

export function canAccessBackoffice(role: BackofficeRole): boolean {
  return role === 'admin' || role === 'editor';
}

export function isEditor(role: BackofficeRole): boolean {
  return role === 'editor';
}

const EDITOR_ALLOWED_PATH_PREFIXES = ['/products', '/tours', '/tickets'];

export function canAccessBackofficePath(role: BackofficeRole, pathname: string): boolean {
  if (role === 'admin') return true;
  if (role !== 'editor') return false;

  return EDITOR_ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
