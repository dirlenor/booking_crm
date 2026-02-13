'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getSafeNextPath } from '@/lib/auth/redirect'
import { Loader2 } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const nextPath = React.useMemo(
    () => getSafeNextPath(searchParams.get('next'), '/'),
    [searchParams]
  )
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            setError(error.message)
            return
          }

          router.replace(nextPath)
          router.refresh()
          return
        }

        const { data } = await supabase.auth.getSession()
        if (data.session) {
          router.replace(nextPath)
          router.refresh()
        } else {
          router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
        }
        return
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          throw error
        }
        router.replace(nextPath)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify authentication')
      }
    }

    handleCallback()
  }, [code, nextPath, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-destructive font-medium">Authentication Error</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button 
          onClick={() => router.push(`/login?next=${encodeURIComponent(nextPath)}`)}
          className="text-primary hover:underline text-sm"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Verifying authentication...</p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CallbackContent />
    </React.Suspense>
  )
}
