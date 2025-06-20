'use client'

import Link from 'next/link'
import { TrendingUp, Calculator, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('navigation')
  const tLayout = useTranslations('layout')

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 text-slate-900 hover:text-blue-600 transition-colors group"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg font-playfair">
                Nature2Pixel
              </div>
              <div className="text-xs text-slate-500 -mt-1">
                {tLayout('description')}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {t('home')}
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900"
              >
                {t('about')}
              </Button>
            </Link>
            <Link href="/help">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900"
              >
                {t('contact')}
              </Button>
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <LanguageSwitcher />
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium">
              {t('getStarted')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t('home')}
              </Link>
              <Link
                href="/about"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t('about')}
              </Link>
              <Link
                href="/help"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t('contact')}
              </Link>
              <div className="pt-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">
                  {t('getStarted')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
