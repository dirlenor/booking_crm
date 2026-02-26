import React from 'react';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { OAuthCallbackRedirect } from '@/components/auth/oauth-callback-redirect';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <OAuthCallbackRedirect />
      <LandingHeader />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <LandingFooter />
    </div>
  );
}
