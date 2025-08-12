'use client'

import Link from 'next/link'
import {
  TrendingUp,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Heart,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

export function Footer() {
  const tLayout = useTranslations('layout')
  const tFooter = useTranslations('footer')
  const locale = useLocale()

  const withLocale = (path: string) =>
    locale === 'en' ? path : `/${locale}${path}`

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl font-playfair bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Nature2Pixel
                </div>
                <div className="text-sm text-indigo-400 -mt-1 font-medium">
                  {tLayout('description')}
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
              {tFooter('description')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-4">
              {tFooter('navigation')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={locale === 'en' ? '/' : `/${locale}`}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('home') || 'Home'}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocale('/about')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocale('/scenario')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('scenarioPlanning')}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocale('/help')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('helpFaq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-4">
              {tFooter('legal')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={withLocale('/legal/privacy')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocale('/legal/terms')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocale('/legal/cookies')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>
              © {new Date().getFullYear()} Nature2Pixel Financial Tools.
            </span>
            <span>{tFooter('allRightsReserved')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400 mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for better financial planning</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
