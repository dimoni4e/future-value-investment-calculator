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
      {/* Full-Width Calculator Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 min-h-screen">
        {/* Enhanced Background Pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        {/* Large Gradient Orbs */}
        <div className="absolute -top-32 -right-32 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-400/8 to-blue-400/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>

        <div className="relative min-h-screen flex items-center">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
            {/* Header Section */}
            <div className="text-center mb-12 max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100/50 shadow-lg backdrop-blur-sm mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse"></div>
                <TrendingUp className="w-4 h-4" />
                <span>{tHero('badge')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-playfair text-slate-900 leading-tight tracking-tight mb-6">
                {tLayout('title')}
                <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent mt-3">
                  {tLayout('description')}
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-light mb-10">
                {tHero('subtitle')}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12">
                <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <span className="text-slate-700 font-medium text-xs lg:text-sm">
                    {tHero('compoundInterest')}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <span className="text-slate-700 font-medium text-xs lg:text-sm">
                    {tHero('interactiveCharts')}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <span className="text-slate-700 font-medium text-xs lg:text-sm">
                    {tHero('scenarioPlanning')}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <span className="text-slate-700 font-medium text-xs lg:text-sm">
                    {tHero('exportResults')}
                  </span>
                </div>
              </div>
            </div>

            {/* Full-Width Calculator */}
            <div className="max-w-7xl mx-auto" id="calculator">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold font-playfair text-slate-900 mb-3">
                  {t('title')}
                </h2>
                <p className="text-base lg:text-lg text-slate-600 font-light">
                  {t('subtitle')}
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl mx-auto">
                <CalculatorForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
