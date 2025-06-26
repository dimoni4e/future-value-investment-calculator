import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales } from './i18n/request'

// Custom middleware to handle redirects before intl middleware
function handleRedirects(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Redirect all /scenarios/* URLs to /scenario
  if (pathname.includes('/scenarios')) {
    // Extract locale if present, otherwise default to English
    const locale = pathname.startsWith('/pl/')
      ? 'pl'
      : pathname.startsWith('/es/')
        ? 'es'
        : 'en'
    const redirectUrl = locale === 'en' ? '/scenario' : `/${locale}/scenario`

    const url = request.nextUrl.clone()
    url.pathname = redirectUrl
    return NextResponse.redirect(url, 301) // Permanent redirect
  }

  // Redirect specific scenario attempts to correct URLs
  const scenarioRedirects: Record<string, string> = {
    // English redirects
    '/scenario/retirement': '/scenario/retirement-50k-2k-6-30',
    '/scenario/aggressive': '/scenario/aggressive-25k-1k-12-20',
    '/scenario/wealth': '/scenario/wealth-100k-5k-10-25',
    '/scenario/emergency': '/scenario/emergency-1k-200-4-5',
    '/scenario/house': '/scenario/house-5k-1500-5-7',
    '/scenario/young': '/scenario/young-5k-300-8-15',
    '/scenario/starter': '/scenario/starter-10k-500-7-10',

    // Polish redirects
    '/pl/scenario/retirement': '/pl/scenario/retirement-50k-2k-6-30',
    '/pl/scenario/aggressive': '/pl/scenario/aggressive-25k-1k-12-20',
    '/pl/scenario/wealth': '/pl/scenario/wealth-100k-5k-10-25',
    '/pl/scenario/emergency': '/pl/scenario/emergency-1k-200-4-5',
    '/pl/scenario/house': '/pl/scenario/house-5k-1500-5-7',
    '/pl/scenario/young': '/pl/scenario/young-5k-300-8-15',
    '/pl/scenario/starter': '/pl/scenario/starter-10k-500-7-10',

    // Spanish redirects
    '/es/scenario/retirement': '/es/scenario/retirement-50k-2k-6-30',
    '/es/scenario/aggressive': '/es/scenario/aggressive-25k-1k-12-20',
    '/es/scenario/wealth': '/es/scenario/wealth-100k-5k-10-25',
    '/es/scenario/emergency': '/es/scenario/emergency-1k-200-4-5',
    '/es/scenario/house': '/es/scenario/house-5k-1500-5-7',
    '/es/scenario/young': '/es/scenario/young-5k-300-8-15',
    '/es/scenario/starter': '/es/scenario/starter-10k-500-7-10',
  }

  if (scenarioRedirects[pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = scenarioRedirects[pathname]
    return NextResponse.redirect(url, 301) // Permanent redirect
  }

  return null // No redirect needed
}

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false, // Disable automatic locale detection
})

export default function middleware(request: NextRequest) {
  // First check for custom redirects
  const redirectResponse = handleRedirects(request)
  if (redirectResponse) {
    return redirectResponse
  }

  // If no redirect, proceed with intl middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(pl|es)/:path*',
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
