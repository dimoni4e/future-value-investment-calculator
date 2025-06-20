'use client'

import Link from 'next/link'
import { TrendingUp, Mail, Github, Twitter, Linkedin } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const tLayout = useTranslations('layout')
  const tFooter = useTranslations('footer')

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg font-playfair text-white">
                  Nature2Pixel
                </div>
                <div className="text-xs text-slate-400 -mt-1">
                  {tLayout('description')}
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {tFooter('description')}
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {tFooter('tools')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('investmentCalculator')}
                </Link>
              </li>
              <li>
                <Link
                  href="/compound-interest"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('compoundInterest')}
                </Link>
              </li>
              <li>
                <Link
                  href="/scenarios"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('scenarioPlanning')}
                </Link>
              </li>
              <li>
                <Link
                  href="/charts"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('growthCharts')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {tFooter('resources')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('helpFaq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('financialBlog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {tFooter('contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} FutureValue Investment Calculator.{' '}
            {tFooter('rights')}
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm">
            <Link
              href="/legal/privacy"
              className="text-slate-400 hover:text-white transition-colors"
            >
              {tFooter('privacyPolicy')}
            </Link>
            <Link
              href="/legal/terms"
              className="text-slate-400 hover:text-white transition-colors"
            >
              {tFooter('termsOfService')}
            </Link>
            <Link
              href="/legal/cookies"
              className="text-slate-400 hover:text-white transition-colors"
            >
              {tFooter('cookiePolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
