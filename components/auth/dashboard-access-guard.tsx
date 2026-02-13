'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { canAccessBackoffice, canAccessBackofficePath, getBackofficeRole } from '@/lib/auth/roles';

type GuardState = 'checking' | 'allowed';

export function DashboardAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = React.useState<GuardState>('checking');

  React.useEffect(() => {
    let mounted = true;

    const verifyAccess = async () => {
      const currentPath = pathname || '/dashboard';
      const loginPath = `/login?next=${encodeURIComponent(currentPath)}`;

      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const user = data.user;
      if (!user) {
        if (typeof window !== 'undefined') {
          const postLogoutHome = window.sessionStorage.getItem('6cat-post-logout-home');
          if (postLogoutHome === '1') {
            window.sessionStorage.removeItem('6cat-post-logout-home');
            router.replace('/');
            return;
          }
        }
        router.replace(loginPath);
        return;
      }

      const role = getBackofficeRole(user);
      if (!canAccessBackoffice(role)) {
        router.replace('/');
        return;
      }

      if (!canAccessBackofficePath(role, currentPath)) {
        router.replace('/products');
        return;
      }

      setState('allowed');
    };

    void verifyAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setState('checking');
      void verifyAccess();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (state !== 'allowed') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
