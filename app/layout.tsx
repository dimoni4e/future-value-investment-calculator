import type { Metadata } from 'next'
import './globals.css'
import { headers } from 'next/headers'
import Script from 'next/script'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Future Value Investment Calculator',
  description:
    'Plan your financial future with our advanced compound interest calculator',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Align <html lang> with the active locale from next-intl middleware
  const locale = headers().get('x-next-intl-locale') || 'en'
  return (
    <html lang={locale} className="h-full">
      <head />
      <body className="h-full antialiased">
        {children}
        {/* Google Analytics 4 */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID ?? 'G-M3N50VMKMJ'}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID ?? 'G-M3N50VMKMJ'}');
              `}
            </Script>
            <GoogleAnalytics
              gaId={process.env.NEXT_PUBLIC_GA_ID ?? 'G-M3N50VMKMJ'}
            />
          </>
        )}
      </body>
    </html>
  )
}
