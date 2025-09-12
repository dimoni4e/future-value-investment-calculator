import type { Metadata } from 'next'
import './globals.css'
import { headers } from 'next/headers'

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
        {/* Analytics removed: using only Sentry for error monitoring */}
      </body>
    </html>
  )
}
