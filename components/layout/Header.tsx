'use client'

import Link from 'next/link'
import { TrendingUp, Calculator, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('navigation')
  const tLayout = useTranslations('layout')
  const locale = useLocale()

  const withLocale = (path: string) =>
    locale === 'en' ? path : `/${locale}${path}`

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href={locale === 'en' ? '/' : `/${locale}`}
            className="flex items-center space-x-3 text-slate-900 hover:text-indigo-600 transition-all duration-300 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-indigo-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-xl font-playfair bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                fvinvestcalc
              </div>
              <div className="text-xs text-slate-500 -mt-1 font-medium">
                {tLayout('description')}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href={locale === 'en' ? '/' : `/${locale}`}>
              <button className="flex items-center space-x-2 px-4 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium">
                <Calculator className="w-4 h-4" />
                <span>{t('home')}</span>
              </button>
            </Link>
            <Link href={withLocale('/about')}>
              <button className="px-4 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium">
                {t('about')}
              </button>
            </Link>
            <Link href={withLocale('/help')}>
              <button className="px-4 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium">
                {t('contact')}
              </button>
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-3"></div>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-200/50 bg-white/90 backdrop-blur-lg">
            <div className="flex flex-col space-y-3">
              <Link
                href={locale === 'en' ? '/' : `/${locale}`}
                className="flex items-center space-x-3 text-slate-600 hover:text-indigo-600 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-medium"
              >
                <Calculator className="w-5 h-5" />
                <span>{t('home')}</span>
              </Link>
              <Link
                href={withLocale('/about')}
                className="text-slate-600 hover:text-indigo-600 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-medium"
              >
                {t('about')}
              </Link>
              <Link
                href={withLocale('/help')}
                className="text-slate-600 hover:text-indigo-600 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-medium"
              >
                {t('contact')}
              </Link>
              <div className="pt-2 px-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
