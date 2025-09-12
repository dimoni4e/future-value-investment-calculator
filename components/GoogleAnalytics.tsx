'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface GoogleAnalyticsProps {
  gaId: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId) return
    if (typeof window === 'undefined' || typeof window.gtag !== 'function')
      return

    const search = searchParams?.toString()
    const page_path = `${pathname}${search ? `?${search}` : ''}`

    // Track SPA route changes
    window.gtag('config', gaId, { page_path })
  }, [gaId, pathname, searchParams])

  return null
}
