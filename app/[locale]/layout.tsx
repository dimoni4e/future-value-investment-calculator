import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Financial Growth Planner - Plan Your Financial Future',
  description:
    'Advanced financial growth planning platform with compound interest projections, scenario analysis, and interactive charts. Transform your investment strategy with data-driven insights.',
  keywords:
    'financial growth planner, investment projections, compound interest, financial planning, future value, investment returns, retirement planning, wealth building',
  authors: [{ name: 'Nature2Pixel Financial Tools' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://nature2pixel.com'
  ),
  openGraph: {
    title: 'Financial Growth Planner - Plan Your Financial Future',
    description:
      'Advanced financial growth planning platform with compound interest projections, scenario analysis, and interactive charts.',
    type: 'website',
    siteName: 'Nature2Pixel Financial Tools',
    url: '/',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Financial Growth Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial Growth Planner - Plan Your Financial Future',
    description:
      'Advanced financial growth planning platform with compound interest projections, scenario analysis, and interactive charts.',
    images: ['/api/og'],
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale}
      className={`h-full ${inter.variable} ${playfair.variable}`}
    >
      <body className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50 font-sans antialiased">
        <ServiceWorkerRegistration />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
