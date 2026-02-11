'use client';

import * as React from 'react';

export function OAuthCallbackRedirect() {
  React.useEffect(() => {
    const { hash, search } = window.location;

    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const hasImplicitTokens =
      Boolean(hashParams.get('access_token')) && Boolean(hashParams.get('refresh_token'));

    const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
    const hasAuthCode = Boolean(searchParams.get('code'));
    const hasAuthError = Boolean(searchParams.get('error')) || Boolean(searchParams.get('error_description'));

    if (!hasImplicitTokens && !hasAuthCode && !hasAuthError) return;

    // Supabase sometimes falls back to Site URL (/) after OAuth.
    // Redirect to the dedicated callback route which finalizes the session.
    const callbackUrl = `/callback${search}${hash}`;
    window.location.replace(callbackUrl);
  }, []);

  return null;
}
