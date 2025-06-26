import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Future Value Investment Calculator',
  description:
    'Plan your financial future with our advanced compound interest calculator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
