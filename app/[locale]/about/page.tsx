import { getTranslations } from 'next-intl/server'
import { getPageBySlug } from '@/lib/db/queries'
import {
  Calculator,
  TrendingUp,
  Shield,
  Globe,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  HeartHandshake,
} from 'lucide-react'

interface AboutPageProps {
  params: {
    locale: string
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = params

  // Try to get page content from database first
  let dbPage = null
  try {
    dbPage = await getPageBySlug('about', locale)
  } catch (error) {
    console.error('Error fetching about page from database:', error)
  }

  // Fallback to static translations
  const t = await getTranslations({ locale, namespace: 'about' })

  // Use database content if available, otherwise use static translations
  const getContent = (key: string, fallback: string) => {
    if (dbPage) {
      // For database content, we could parse sections or use a content mapping
      // For now, we'll use the main content and title from database
      if (key === 'hero.title') return dbPage.title
      if (key === 'hero.description' && dbPage.metaDescription)
        return dbPage.metaDescription
    }
    return fallback
  }

  console.log('About page data source:', dbPage ? 'database' : 'static', {
    locale,
    hasDbPage: !!dbPage,
    dbTitle: dbPage?.title,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-600">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {getContent('hero.title', t('hero.title'))}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
              {getContent('hero.description', t('hero.description'))}
            </p>
            {dbPage && (
              <div className="mt-4">
                <span className="inline-flex items-center space-x-2 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  <span>📄</span>
                  <span>Database Content</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                {t('mission.title')}
              </h2>
              <p className="mb-6 text-lg text-gray-600 leading-relaxed">
                {t('mission.description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">{t('mission.secure')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  <span className="text-gray-700">{t('mission.global')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">
                    {t('mission.accessible')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">{t('mission.accurate')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-6">
                    <Calculator className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">
                      {t('features.calculator')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('features.calculatorDesc')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-6">
                    <BarChart3 className="h-8 w-8 text-emerald-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">
                      {t('features.charts')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('features.chartsDesc')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-lg bg-purple-50 p-6">
                    <Lightbulb className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">
                      {t('features.insights')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('features.insightsDesc')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-6">
                    <HeartHandshake className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">
                      {t('features.trust')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('features.trustDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              {t('values.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {t('values.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {t('values.privacy.title')}
              </h3>
              <p className="text-gray-600">{t('values.privacy.description')}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {t('values.accuracy.title')}
              </h3>
              <p className="text-gray-600">
                {t('values.accuracy.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {t('values.accessibility.title')}
              </h3>
              <p className="text-gray-600">
                {t('values.accessibility.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              {t('technology.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {t('technology.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <span className="text-sm font-bold text-blue-600">Next.js</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t('technology.nextjs')}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                <span className="text-sm font-bold text-emerald-600">
                  React
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t('technology.react')}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <span className="text-sm font-bold text-purple-600">TS</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t('technology.typescript')}
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                <span className="text-sm font-bold text-orange-600">TW</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {t('technology.tailwind')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            {t('contact.title')}
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            {t('contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={locale === 'en' ? '/help' : `/${locale}/help`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {t('contact.email')}
            </a>
            <a
              href={
                locale === 'en' ? '/legal/privacy' : `/${locale}/legal/privacy`
              }
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {t('contact.privacy')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'about' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fvinvestcalc.com'
  const url =
    locale === 'en' ? `${baseUrl}/about` : `${baseUrl}/${locale}/about`

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
      siteName: 'fvinvestcalc',
      url,
      locale,
      images: [
        {
          url: '/api/og',
          width: 1200,
          height: 630,
          alt: 'About - Future Value Investment Calculator',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
      images: ['/api/og'],
      site: '@fvinvestcalc',
      creator: '@fvinvestcalc',
    },
  }
}
