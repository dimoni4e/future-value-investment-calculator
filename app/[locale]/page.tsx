import CalculatorForm from '@/components/CalculatorForm'
import {
  getHomeContentData,
  getContentWithFallback,
} from '@/lib/content-provider'
import { TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { generateSEO, getDefaultSEO } from '@/lib/seo'
import { decodeParamsFromUrl, validateParams } from '@/lib/urlState'
import { calculateFutureValue } from '@/lib/finance'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import { getRecentScenarios, getHomeContent } from '@/lib/db/queries'
import { SEOContentSection } from '@/components/SEOContentSection'
import Link from 'next/link'
import { formatCurrencyUSD } from '@/lib/format'

type Props = {
  params: { locale: string }
  // Removed searchParams for clean URLs
}

// Force revalidation on every request for the homepage to show the latest scenarios
export const revalidate = 0

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  try {
    // Get enhanced SEO content from database
    const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
    const seoContent: { [key: string]: string } = {}
    homeContentData.forEach((item) => {
      const key = `${item.section}_${item.key}`
      seoContent[key] = item.value
    })

    // Use database content with fallbacks
    const seoData = getDefaultSEO(locale)

    // Enhanced metadata with more comprehensive SEO
    // Derive base URL from incoming request headers when available; fallback to env/default
    const headerValues = (() => {
      try {
        return headers()
      } catch {
        return null
      }
    })()
    const proto = headerValues?.get('x-forwarded-proto') || 'https'
    const hostFromHeaders =
      headerValues?.get('x-forwarded-host') || headerValues?.get('host') || ''
    const envBase =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://fvinvestcalc.com'
    const envOrigin = (() => {
      try {
        return new URL(envBase).origin
      } catch {
        return 'https://fvinvestcalc.com'
      }
    })()
    const baseUrl = (
      hostFromHeaders ? `${proto}://${hostFromHeaders}` : envOrigin
    ).replace(/\/$/, '')
    const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`
    return {
      title: seoContent.seo_meta_title || seoData.title,
      description: seoContent.seo_meta_description || seoData.description,
      keywords: seoContent.seo_keywords || seoData.keywords.join(', '),
      authors: [{ name: 'fvinvestcalc' }],
      creator: 'fvinvestcalc',
      publisher: 'fvinvestcalc',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      category: 'Finance',
      classification: 'Financial Tools',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'x-default': baseUrl,
          en: baseUrl,
          es: `${baseUrl}/es`,
          pl: `${baseUrl}/pl`,
        },
      },
      openGraph: {
        title: seoContent.seo_meta_title || seoData.openGraph.title,
        description:
          seoContent.seo_meta_description || seoData.openGraph.description,
        type: 'website',
        locale: locale,
        siteName: 'fvinvestcalc',
        url: canonicalUrl,
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Investment Calculator - Future Value & Compound Interest Calculator',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@fvinvestcalc',
        creator: '@fvinvestcalc',
        title: seoContent.seo_meta_title || seoData.twitter.title,
        description:
          seoContent.seo_meta_description || seoData.twitter.description,
        images: ['/og-image.png'],
      },
      other: {
        'application-name': 'Investment Calculator',
        'apple-mobile-web-app-title': 'Investment Calculator',
        'theme-color': '#3B82F6',
        'color-scheme': 'light',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    // Fallback to default SEO if database fails
    const seoData = getDefaultSEO(locale)
    const envBase =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://fvinvestcalc.com'
    const baseUrl = (() => {
      try {
        return new URL(envBase).origin.replace(/\/$/, '')
      } catch {
        return 'https://fvinvestcalc.com'
      }
    })()
    const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords.join(', '),
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'x-default': baseUrl,
          en: baseUrl,
          es: `${baseUrl}/es`,
          pl: `${baseUrl}/pl`,
        },
      },
      openGraph: {
        title: seoData.openGraph.title,
        description: seoData.openGraph.description,
        type: 'website',
        locale: locale,
        siteName: 'fvinvestcalc',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoData.twitter.title,
        description: seoData.twitter.description,
      },
    }
  }
}

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'calculator' })
  const tLayout = await getTranslations({ locale, namespace: 'layout' })
  const tHero = await getTranslations({ locale, namespace: 'hero' })
  const tScenarios = await getTranslations({ locale, namespace: 'scenarios' })

  // Get content from database with fallback to static translations
  const dbContent = await getHomeContentData(locale)

  // Get SEO content for badges
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const seoContent: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    seoContent[key] = item.value
  })

  // Get recent user-generated scenarios
  let recentScenarios = []
  try {
    recentScenarios = await getRecentScenarios(locale, 36) // Increased from 6 to 36 to show more scenarios
  } catch (error) {
    console.error('Error fetching recent scenarios:', error)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-modern py-20 lg:py-32">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-20"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-1/3 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl animate-pulse-soft"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-3 bg-indigo-50/80 text-indigo-700 px-6 py-3 rounded-full text-sm font-medium border border-indigo-200/50 mb-8 shadow-soft hover:shadow-medium transition-all duration-300 glass animate-slide-in-up">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <TrendingUp className="w-4 h-4" />
              <span>
                {getContentWithFallback(
                  dbContent,
                  'hero',
                  'badge',
                  tHero('badge'),
                  locale
                )}
              </span>
            </div>

            {/* Enhanced Heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-playfair text-slate-900 leading-tight mb-2 animate-slide-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {getContentWithFallback(
                dbContent,
                'layout',
                'title',
                tLayout('title'),
                locale
              )}
            </h1>
            <div
              className="text-3xl sm:text-4xl lg:text-5xl text-gradient mt-3 font-semibold mb-6 animate-slide-in-up"
              style={{ animationDelay: '0.12s' }}
            >
              {getContentWithFallback(
                dbContent,
                'layout',
                'description',
                tLayout('description'),
                locale
              )}
            </div>

            {/* Enhanced description */}
            <p
              className="text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10 animate-slide-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {getContentWithFallback(
                dbContent,
                'hero',
                'subtitle',
                tHero('subtitle'),
                locale
              )}
            </p>

            {/* Enhanced Feature Pills */}
            <div
              className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="group inline-flex items-center gap-3 px-6 py-3 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 glass">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform"></div>
                {tHero('compoundInterest')}
              </div>
              <div className="group inline-flex items-center gap-3 px-6 py-3 bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 glass">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                {tHero('interactiveCharts')}
              </div>
              <div className="group inline-flex items-center gap-3 px-6 py-3 bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 rounded-full text-sm font-medium border border-purple-200/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 glass">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
                {tHero('scenarioPlanning')}
              </div>
              <div className="group inline-flex items-center gap-3 px-6 py-3 bg-orange-50/80 hover:bg-orange-100/80 text-orange-700 rounded-full text-sm font-medium border border-orange-200/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 glass">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full group-hover:scale-125 transition-transform"></div>
                {tHero('exportResults')}
              </div>
            </div>

            {/* Enhanced Call to Action */}
            <div
              className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-slide-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <a
                href="#calculator"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-large hover:shadow-elegant hover:scale-105 transform-gpu overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                <TrendingUp className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">
                  {tHero('startCalculating')}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
              </a>
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    {tHero('freeNoSignup')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>{tHero('instantResults')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{tHero('privacyFocused')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{tHero('exportReady')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Calculator Section */}
      <section className="py-20 lg:py-32 bg-white border-t border-slate-200/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-16 animate-slide-in-up">
            <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50 mb-6 shadow-soft">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {seoContent.badges_investment_calculator ||
                'Investment Calculator'}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
              {t('title')}
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div
              className="bg-white/90 rounded-3xl p-8 lg:p-12 shadow-elegant border border-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 animate-scale-in"
              id="calculator"
            >
              <CalculatorForm content={seoContent} />
            </div>
          </div>
        </div>
      </section>

      {/* Predefined Scenarios Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 border-t border-slate-200/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-slide-in-up">
            <div className="inline-flex items-center gap-2 bg-indigo-50/80 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200/50 mb-6 shadow-soft">
              <span>🎯</span>
              <span>Investment Scenarios</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
              {getContentWithFallback(
                dbContent,
                'scenarios',
                'expert_title',
                'Expert-Curated Investment Plans',
                locale
              )}
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {getContentWithFallback(
                dbContent,
                'scenarios',
                'expert_subtitle',
                'Explore proven investment strategies tailored for different financial goals and time horizons',
                locale
              )}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PREDEFINED_SCENARIOS.slice(0, 6).map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/${locale}/scenario/${scenario.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                        {scenario.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {scenario.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrencyUSD(scenario.params.initialAmount)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getContentWithFallback(
                            dbContent,
                            'scenarios',
                            'initial_label',
                            'Initial',
                            locale
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrencyUSD(
                            scenario.params.monthlyContribution
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getContentWithFallback(
                            dbContent,
                            'scenarios',
                            'monthly_label',
                            'Monthly',
                            locale
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {scenario.params.annualReturn}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {getContentWithFallback(
                            dbContent,
                            'scenarios',
                            'return_label',
                            'Return',
                            locale
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {scenario.params.timeHorizon}y
                        </div>
                        <div className="text-xs text-slate-500">
                          {getContentWithFallback(
                            dbContent,
                            'scenarios',
                            'timeline_label',
                            'Timeline',
                            locale
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {scenario.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href={locale === 'en' ? '/scenario' : `/${locale}/scenario`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-large hover:shadow-elegant hover:scale-105"
              >
                <span>
                  {getContentWithFallback(
                    dbContent,
                    'scenarios',
                    'view_all_scenarios',
                    'View All Scenarios',
                    locale
                  )}
                </span>
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent User-Generated Scenarios Section */}
      {recentScenarios.length > 0 && (
        <section className="py-20 lg:py-32 bg-white border-t border-slate-200/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 animate-slide-in-up">
              <div className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 mb-6 shadow-soft">
                <span>🌟</span>
                <span>
                  {seoContent.badges_recently_created || 'Recently Created'}
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {getContentWithFallback(
                  dbContent,
                  'scenarios',
                  'latest_title',
                  'Latest Investment Scenarios',
                  locale
                )}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {getContentWithFallback(
                  dbContent,
                  'scenarios',
                  'latest_section_subtitle',
                  'Discover investment plans recently created by our community',
                  locale
                )}
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentScenarios.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={
                      locale === 'en'
                        ? `/scenario/${scenario.slug}`
                        : `/${locale}/scenario/${scenario.slug}`
                    }
                    className="group block"
                  >
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            {getContentWithFallback(
                              dbContent,
                              'scenarios',
                              'user_created_label',
                              'User Created',
                              locale
                            )}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(scenario.createdAt).toLocaleDateString(
                              locale
                            )}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                          {scenario.name}
                        </h3>
                        {scenario.description && (
                          <p className="text-slate-600 text-sm line-clamp-2">
                            {scenario.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {formatCurrencyUSD(
                              parseInt(scenario.initialAmount)
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {getContentWithFallback(
                              dbContent,
                              'scenarios',
                              'initial_label',
                              'Initial',
                              locale
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrencyUSD(
                              parseInt(scenario.monthlyContribution)
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {getContentWithFallback(
                              dbContent,
                              'scenarios',
                              'monthly_label',
                              'Monthly',
                              locale
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {parseFloat(scenario.annualReturn)}%
                          </div>
                          <div className="text-xs text-slate-500">
                            {getContentWithFallback(
                              dbContent,
                              'scenarios',
                              'return_label',
                              'Return',
                              locale
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {scenario.timeHorizon}y
                          </div>
                          <div className="text-xs text-slate-500">
                            {getContentWithFallback(
                              dbContent,
                              'scenarios',
                              'timeline_label',
                              'Timeline',
                              locale
                            )}
                          </div>
                        </div>
                      </div>

                      {scenario.tags && scenario.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {scenario.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Optimized SEO Content Sections */}
      <SEOContentSection locale={locale} />
    </div>
  )
}
