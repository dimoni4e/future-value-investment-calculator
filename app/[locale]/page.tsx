import CalculatorForm from '@/components/CalculatorForm'
import {
  getHomeContentData,
  getContentWithFallback,
} from '@/lib/content-provider'
import { TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { type Metadata } from 'next'
import { generateSEO, getDefaultSEO } from '@/lib/seo'
import { decodeParamsFromUrl, validateParams } from '@/lib/urlState'
import { calculateFutureValue } from '@/lib/finance'

type Props = {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({
  params: { locale },
  searchParams,
}: Props): Promise<Metadata> {
  // Convert searchParams to URLSearchParams format
  const urlParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlParams.set(key, value)
    }
  })

  // Decode and validate parameters from URL
  const decodedParams = decodeParamsFromUrl(urlParams.toString())
  const validatedParams = validateParams(decodedParams)

  // Calculate future value if we have parameters
  let futureValue: number | undefined
  if (
    searchParams.initial ||
    searchParams.monthly ||
    searchParams.return ||
    searchParams.years
  ) {
    const result = calculateFutureValue({
      initialAmount: validatedParams.initialAmount,
      monthlyContribution: validatedParams.monthlyContribution,
      annualReturnRate: validatedParams.annualReturn / 100,
      timeHorizonYears: validatedParams.timeHorizon,
    })
    futureValue = result.futureValue
  }

  // Generate dynamic SEO data
  const seoData =
    searchParams.initial ||
    searchParams.monthly ||
    searchParams.return ||
    searchParams.years
      ? generateSEO(validatedParams, undefined, futureValue, locale)
      : getDefaultSEO(locale)

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    openGraph: {
      title: seoData.openGraph.title,
      description: seoData.openGraph.description,
      type: 'website',
      locale: locale,
      siteName: 'Nature2Pixel Financial Tools',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.twitter.title,
      description: seoData.twitter.description,
    },
  }
}

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'calculator' })
  const tLayout = await getTranslations({ locale, namespace: 'layout' })
  const tHero = await getTranslations({ locale, namespace: 'hero' })

  // Get content from database with fallback to static translations
  const dbContent = await getHomeContentData(locale)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50 py-12 lg:py-16">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))] opacity-20"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-indigo-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Compact Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100 mb-6">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <TrendingUp className="w-3.5 h-3.5" />
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

            {/* Focused Heading - More concise */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-playfair text-slate-900 leading-tight mb-4">
              {getContentWithFallback(
                dbContent,
                'layout',
                'title',
                tLayout('title'),
                locale
              )}
              <span className="block text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-2 font-semibold">
                {getContentWithFallback(
                  dbContent,
                  'layout',
                  'description',
                  tLayout('description'),
                  locale
                )}
              </span>
            </h1>

            {/* Concise description */}
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
              {getContentWithFallback(
                dbContent,
                'hero',
                'subtitle',
                tHero('subtitle'),
                locale
              )}
            </p>

            {/* Streamlined Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                {tHero('compoundInterest')}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {tHero('interactiveCharts')}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {tHero('scenarioPlanning')}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                {tHero('exportResults')}
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <TrendingUp className="w-4 h-4" />
                Start Calculating
              </a>
              <span className="text-sm text-slate-500">
                Free • No signup required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 lg:py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold font-playfair text-slate-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-slate-200/50 ring-1 ring-slate-900/5"
              id="calculator"
            >
              <CalculatorForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
