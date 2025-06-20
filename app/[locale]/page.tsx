import CalculatorForm from '@/components/CalculatorForm'
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-25"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm text-indigo-700 px-6 py-3 rounded-full text-sm font-semibold border border-indigo-100 shadow-lg mb-8">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse"></div>
              <TrendingUp className="w-4 h-4" />
              <span>{tHero('badge')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-playfair text-slate-900 leading-tight tracking-tight mb-8">
              {tLayout('title')}
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-4">
                {tLayout('description')}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed font-light mb-12 max-w-3xl mx-auto">
              {tHero('subtitle')}
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
              <div className="group flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-slate-700 font-semibold text-sm lg:text-base">
                  {tHero('compoundInterest')}
                </span>
              </div>
              <div className="group flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-slate-700 font-semibold text-sm lg:text-base">
                  {tHero('interactiveCharts')}
                </span>
              </div>
              <div className="group flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-slate-700 font-semibold text-sm lg:text-base">
                  {tHero('scenarioPlanning')}
                </span>
              </div>
              <div className="group flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-slate-700 font-semibold text-sm lg:text-base">
                  {tHero('exportResults')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-playfair text-slate-900 mb-6">
              {t('title')}
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 font-light max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div
              className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-8 lg:p-12 shadow-2xl border border-slate-200/50 backdrop-blur-sm"
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
