import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getTranslations, getMessages } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'
import { PREDEFINED_SCENARIOS, PREDEFINED_SCENARIOS_MAP } from '@/lib/scenarios'
import { generateSEO } from '@/lib/seo'
import {
  parseSlugToScenario,
  generateLocalizedScenarioName,
  generateLocalizedScenarioDescription,
  generateScenarioHeadline,
  generateScenarioPageTitle,
} from '@/lib/scenarioUtils'
import { encodeParamsToUrl } from '@/lib/urlState'
import { createScenario, getScenarioBySlug } from '@/lib/db/queries'
import { getSupportedLocales } from '@/lib/db/queries'
import LazyContentSection from '@/components/scenario/LazyContentSection'
import PersonalizedInsights from '@/components/scenario/PersonalizedInsights'
import MarketContext from '@/components/scenario/MarketContext'
import ComparativeAnalysis from '@/components/scenario/ComparativeAnalysis'
import OptimizationTips from '@/components/scenario/OptimizationTips'
import StructuredData from '@/components/scenario/StructuredData'
import ScenarioSEOSection from '@/components/scenario/ScenarioSEOSection'
import Link from 'next/link'
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  ArrowRight,
  Settings2,
  ChevronRight,
  Home,
} from 'lucide-react'
import RelatedScenarios from '@/components/scenario/RelatedScenarios'
import { formatPercent, formatCurrencyUSD } from '@/lib/format'

// Enable ISR to reduce DB hits and Neon compute; pages revalidate every 24h
export const revalidate = 86400
// For predefined scenarios we want to rely on static generation only
export const dynamicParams = true
// For common predefined scenarios we can force static rendering by returning them in generateStaticParams below

// Get scenario data from predefined scenarios with fallback to slug parsing
async function getScenarioData(slug: string, locale: string) {
  // Fast path: predefined scenario – no DB / parsing needed
  if (PREDEFINED_SCENARIOS_MAP[slug]) {
    const ps = PREDEFINED_SCENARIOS_MAP[slug]
    return {
      scenario: {
        id: ps.id,
        name: ps.name,
        description: ps.description,
        params: ps.params,
        tags: ps.tags,
      },
      source: 'predefined' as const,
      isUserGenerated: false,
    }
  }

  const getCached = unstable_cache(
    async () => {
      // First: Check database for user-generated scenarios
      try {
        const dbScenario = await getScenarioBySlug(slug, locale)
        if (dbScenario) {
          return {
            scenario: {
              id: dbScenario.slug,
              name: dbScenario.name,
              description: dbScenario.description || '',
              params: {
                initialAmount: parseInt(dbScenario.initialAmount),
                monthlyContribution: parseInt(dbScenario.monthlyContribution),
                annualReturn: parseFloat(dbScenario.annualReturn) / 100, // Convert percentage to decimal
                timeHorizon: dbScenario.timeHorizon,
              },
              tags: dbScenario.tags,
            },
            source: 'database' as const,
            isUserGenerated: true,
          }
        }
      } catch (error) {
        console.error('Error checking database for scenario:', error)
      }

      // Second: Check predefined scenarios
      const predefinedScenario = PREDEFINED_SCENARIOS.find((s) => s.id === slug)
      if (predefinedScenario) {
        return {
          scenario: {
            id: predefinedScenario.id,
            name: predefinedScenario.name,
            description: predefinedScenario.description,
            params: predefinedScenario.params,
            tags: predefinedScenario.tags,
          },
          source: 'predefined' as const,
          isUserGenerated: false,
        }
      }

      // Third: Try to parse the slug and save to database
      try {
        const parsedScenario = parseSlugToScenario(slug)
        if (parsedScenario) {
          const scenario = {
            id: slug,
            name: `Investment Plan: $${parsedScenario.initialAmount.toLocaleString()} + $${parsedScenario.monthlyContribution}/month`,
            description: `Calculate investing $${parsedScenario.initialAmount.toLocaleString()} initially with $${parsedScenario.monthlyContribution} monthly contributions at ${parsedScenario.annualReturn}% annual return over ${parsedScenario.timeHorizon} years.`,
            params: {
              initialAmount: parsedScenario.initialAmount,
              monthlyContribution: parsedScenario.monthlyContribution,
              annualReturn: parsedScenario.annualReturn / 100, // Convert percentage to decimal
              timeHorizon: parsedScenario.timeHorizon,
            },
            tags: [parsedScenario.goal],
          }

          // Save the parsed scenario to the database for future use (current locale by default)
          try {
            const persistAllLocales =
              process.env.PERSIST_ALL_SCENARIO_LOCALES === 'true'
            console.log('🔄 Attempting to save scenario to database:', slug)
            console.log('📝 Scenario data:', {
              slug: slug,
              name: scenario.name,
              description: scenario.description,
              initialAmount: scenario.params.initialAmount,
              monthlyContribution: scenario.params.monthlyContribution,
              annualReturn: scenario.params.annualReturn * 100,
              timeHorizon: scenario.params.timeHorizon,
              tags: scenario.tags,
              locale: locale,
            })

            if (persistAllLocales) {
              const localesToCreate = getSupportedLocales()
              for (const lc of localesToCreate) {
                await createScenario({
                  slug,
                  name: generateLocalizedScenarioName(
                    lc as 'en' | 'pl' | 'es',
                    {
                      initialAmount: scenario.params.initialAmount,
                      monthlyContribution: scenario.params.monthlyContribution,
                      annualReturn: scenario.params.annualReturn * 100, // back to percent for name/desc generator
                      timeHorizon: scenario.params.timeHorizon,
                    }
                  ),
                  description: generateLocalizedScenarioDescription(
                    lc as 'en' | 'pl' | 'es',
                    {
                      initialAmount: scenario.params.initialAmount,
                      monthlyContribution: scenario.params.monthlyContribution,
                      annualReturn: scenario.params.annualReturn * 100, // percent
                      timeHorizon: scenario.params.timeHorizon,
                    }
                  ),
                  initialAmount: scenario.params.initialAmount,
                  monthlyContribution: scenario.params.monthlyContribution,
                  annualReturn: scenario.params.annualReturn * 100, // Convert back to percentage for storage
                  timeHorizon: scenario.params.timeHorizon,
                  tags: scenario.tags,
                  locale: lc,
                })
              }
            } else {
              await createScenario({
                slug,
                name: generateLocalizedScenarioName(
                  locale as 'en' | 'pl' | 'es',
                  {
                    initialAmount: scenario.params.initialAmount,
                    monthlyContribution: scenario.params.monthlyContribution,
                    annualReturn: scenario.params.annualReturn * 100,
                    timeHorizon: scenario.params.timeHorizon,
                  }
                ),
                description: generateLocalizedScenarioDescription(
                  locale as 'en' | 'pl' | 'es',
                  {
                    initialAmount: scenario.params.initialAmount,
                    monthlyContribution: scenario.params.monthlyContribution,
                    annualReturn: scenario.params.annualReturn * 100,
                    timeHorizon: scenario.params.timeHorizon,
                  }
                ),
                initialAmount: scenario.params.initialAmount,
                monthlyContribution: scenario.params.monthlyContribution,
                annualReturn: scenario.params.annualReturn * 100,
                timeHorizon: scenario.params.timeHorizon,
                tags: scenario.tags,
                locale,
              })
            }
            console.log('✅ Saved parsed scenario to database:', slug)
          } catch (dbError) {
            console.error(
              '❌ Error saving parsed scenario to database:',
              dbError
            )
            console.error('❌ Error details:', {
              name: (dbError as any)?.name || 'unknown',
              message: (dbError as any)?.message || 'no message',
              code: (dbError as any)?.code || 'no code',
              detail: (dbError as any)?.detail || 'no detail',
              constraint: (dbError as any)?.constraint || 'no constraint',
              stack: (dbError as any)?.stack || 'no stack',
            })
            // Continue anyway, scenario will still work without being saved
          }

          return {
            scenario,
            source: 'slug' as const,
            isUserGenerated: true,
          }
        }
      } catch (error) {
        console.error('Error parsing scenario from slug:', error)
      }

      // Fourth: Fallback to legacy API for user-generated scenarios (if any exist)
      try {
        const response = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scenarios?slug=${slug}`,
          {
            next: { revalidate: 3600 }, // Revalidate every hour
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.scenario) {
            return {
              scenario: {
                id: data.scenario.id,
                name: data.scenario.name,
                description: data.scenario.description || '',
                params: {
                  initialAmount: data.scenario.params.initialAmount,
                  monthlyContribution: data.scenario.params.monthlyContribution,
                  annualReturn: data.scenario.params.annualReturn / 100, // Convert percentage to decimal
                  timeHorizon: data.scenario.params.timeHorizon,
                },
                tags: data.scenario.tags,
              },
              source: 'api' as const,
              isUserGenerated: true,
            }
          }
        }
      } catch (error) {
        console.error('Error fetching scenario from API:', error)
      }

      return null
    },
    ['scenario-data', slug, locale],
    { revalidate: 86400, tags: [`scenario:${slug}:${locale}`] }
  )

  return getCached()
}

interface Props {
  params: {
    locale: string
    slug: string
  }
}

// Generate static paths for all predefined scenarios
export async function generateStaticParams() {
  const paths: Array<{ locale: string; slug: string }> = []

  // Use predefined scenarios for each locale
  for (const locale of locales) {
    PREDEFINED_SCENARIOS.forEach((scenario) => {
      paths.push({
        locale,
        slug: scenario.id,
      })
    })
  }

  return paths
}

// Prevent dynamic fallback for predefined slugs by allowing Next to serve 404 if build missed one.
// (Dynamic user-generated slugs still handled at runtime.)

// Generate dynamic metadata for SEO optimization
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params

  // Fetch localized messages and scenario data (DB-first)
  const messages = (await getMessages({ locale })) as any
  const scenarioData = await getScenarioData(slug, locale)

  // Pull SEO templates (fallback to English wording if missing)
  const seoMsgs = messages?.content?.seo || {}

  let title: string
  let description: string
  // Start with i18n-provided keywords (comma-separated) and normalize to an array
  let keywordList: string[] = (
    seoMsgs.keywords
      ? String(seoMsgs.keywords)
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
      : 'investment calculator, future value, compound interest, financial planning, investment growth'
          .split(',')
          .map((k) => k.trim())
  ) as string[]

  if (scenarioData?.scenario) {
    // Prefer localized scenario name/description
    const s = scenarioData.scenario
    const annualPctValue =
      s.params.annualReturn <= 1
        ? s.params.annualReturn * 100
        : s.params.annualReturn
    const annualPct = annualPctValue.toFixed(0)
    const initialStr = `${formatCurrencyUSD(s.params.initialAmount)}`
    const monthlyStr = `${formatCurrencyUSD(s.params.monthlyContribution)}`
    const timeStr = `${s.params.timeHorizon}`

    // If predefined, try localized name/desc from messages; else use DB (already localized per-locale)
    const predefined = messages?.scenarios?.predefinedScenarios?.[s.id]
    const scenarioName =
      generateScenarioHeadline(locale as any, {
        initialAmount: s.params.initialAmount,
        monthlyContribution: s.params.monthlyContribution,
        annualReturn: annualPctValue,
        timeHorizon: s.params.timeHorizon,
      }) ||
      predefined?.name ||
      s.name

    title = generateScenarioPageTitle(locale as any, {
      initialAmount: s.params.initialAmount,
      monthlyContribution: s.params.monthlyContribution,
      annualReturn: annualPctValue,
      timeHorizon: s.params.timeHorizon,
    })

    description = (
      seoMsgs.scenarioDescription ||
      'Explore the {scenarioName} investment strategy: {initialAmount} initial investment, {monthlyContribution} monthly contributions over {timeHorizon} years targeting {annualReturn}% annual return.'
    )
      .replace('{scenarioName}', scenarioName)
      .replace('{initialAmount}', initialStr)
      .replace('{monthlyContribution}', monthlyStr)
      .replace('{timeHorizon}', timeStr)
      .replace('{annualReturn}', annualPct)

    // Enrich keywords programmatically based on scenario parameters
    try {
      const programmatic = generateSEO(
        {
          initialAmount: s.params.initialAmount,
          monthlyContribution: s.params.monthlyContribution,
          annualReturn: annualPctValue,
          timeHorizon: s.params.timeHorizon,
        },
        undefined,
        undefined,
        locale
      )
      if (programmatic?.keywords?.length) {
        keywordList = Array.from(
          new Set([...keywordList, ...programmatic.keywords])
        )
      }
    } catch (e) {
      // noop – fall back to i18n keywords
    }
  } else {
    // Fallback: parse slug to build localized meta
    const parsed = parseSlugToScenario(slug)
    if (parsed) {
      const annualPct = parsed.annualReturn.toFixed(0)
      const initialStr = `${formatCurrencyUSD(parsed.initialAmount)}`
      const monthlyStr = `${formatCurrencyUSD(parsed.monthlyContribution)}`
      const timeStr = `${parsed.timeHorizon}`

      // Build a localized scenarioName using our helper
      const scenarioName = generateScenarioHeadline(locale as any, {
        initialAmount: parsed.initialAmount,
        monthlyContribution: parsed.monthlyContribution,
        annualReturn: parsed.annualReturn,
        timeHorizon: parsed.timeHorizon,
      })

      title = generateScenarioPageTitle(locale as any, {
        initialAmount: parsed.initialAmount,
        monthlyContribution: parsed.monthlyContribution,
        annualReturn: parsed.annualReturn,
        timeHorizon: parsed.timeHorizon,
      })

      description = (
        seoMsgs.scenarioDescription ||
        'Explore the {scenarioName} investment strategy: {initialAmount} initial investment, {monthlyContribution} monthly contributions over {timeHorizon} years targeting {annualReturn}% annual return.'
      )
        .replace('{scenarioName}', scenarioName)
        .replace('{initialAmount}', initialStr)
        .replace('{monthlyContribution}', monthlyStr)
        .replace('{timeHorizon}', timeStr)
        .replace('{annualReturn}', annualPct)

      // Add programmatic keywords for parsed scenarios as well
      try {
        const programmatic = generateSEO(
          {
            initialAmount: parsed.initialAmount,
            monthlyContribution: parsed.monthlyContribution,
            annualReturn: parsed.annualReturn,
            timeHorizon: parsed.timeHorizon,
          },
          undefined,
          undefined,
          locale
        )
        if (programmatic?.keywords?.length) {
          keywordList = Array.from(
            new Set([...keywordList, ...programmatic.keywords])
          )
        }
      } catch (e) {
        // noop
      }
    } else {
      title =
        seoMsgs.defaultTitle ||
        'Future Value Investment Calculator - Plan Your Financial Growth'
      description =
        seoMsgs.defaultDescription ||
        "Calculate your investment's future value with our advanced compound interest calculator."
    }
  }

  // Trim to SEO-friendly lengths
  // if (title.length > 60) title = title.substring(0, 57) + '...'
  // if (description.length > 160)
  //   description = description.substring(0, 157) + '...'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fvinvestcalc.com'
  const pageUrl =
    locale === 'en'
      ? `${baseUrl}/scenario/${slug}`
      : `${baseUrl}/${locale}/scenario/${slug}`

  return {
    title,
    description,
    keywords: keywordList,
    alternates: {
      canonical:
        locale === 'en'
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/scenario/${slug}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/scenario/${slug}`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_BASE_URL}/scenario/${slug}`,
        es: `${process.env.NEXT_PUBLIC_BASE_URL}/es/scenario/${slug}`,
        pl: `${process.env.NEXT_PUBLIC_BASE_URL}/pl/scenario/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale,
      siteName: 'fvinvestcalc',
      url: pageUrl,
      images: [{ url: '/api/og', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og'],
      site: '@fvinvestcalc',
      creator: '@fvinvestcalc',
    },
  }
}

export default async function ScenarioPage({ params }: Props) {
  // Get scenario from database, static data, or API
  const scenarioData = await getScenarioData(params.slug, params.locale)

  if (!scenarioData) {
    notFound()
  }

  const { scenario, source, isUserGenerated } = scenarioData

  // Get messages directly instead of using translation hooks
  const messages = await getMessages({ locale: params.locale })
  const scenarios = messages?.scenarios as any
  const scenarioPage = scenarios?.scenarioPage || {}
  const predefinedScenarios = scenarios?.predefinedScenarios || {}

  // (Removed verbose scenario source logging to reduce noise in production)

  // Get translated scenario name and description for predefined scenarios
  const getScenarioTranslation = (scenario: any) => {
    if (isUserGenerated || source === 'database') {
      // For user-generated or database scenarios, use the scenario data directly
      return {
        name: scenario.name,
        description: scenario.description || '',
      }
    }

    // For static predefined scenarios, use direct message access
    try {
      const translatedName = predefinedScenarios?.[scenario.id]?.name
      const translatedDescription =
        predefinedScenarios?.[scenario.id]?.description

      return {
        name: translatedName || scenario.name,
        description: translatedDescription || scenario.description,
      }
    } catch (error) {
      // Silently fallback if translation missing
      return {
        name: scenario.name,
        description: scenario.description,
      }
    }
  }

  // Normalize annual return so that downstream calculations always receive a percentage (e.g., 8 for 8%).
  // Some sources (DB/slug parsing) may express return as decimal (0.08) while predefined scenarios already use 8.
  const normalizedAnnualReturnPct =
    scenario.params.annualReturn <= 1
      ? scenario.params.annualReturn * 100
      : scenario.params.annualReturn

  const translationFallback = getScenarioTranslation(scenario)

  let scenarioDescription = translationFallback.description || ''
  if (isUserGenerated) {
    try {
      scenarioDescription = generateLocalizedScenarioDescription(
        params.locale as any,
        {
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturn: normalizedAnnualReturnPct,
          timeHorizon: scenario.params.timeHorizon,
        }
      )
    } catch {
      // fall back to translation fallback description
    }
  }

  const scenarioHeadline =
    generateScenarioHeadline(params.locale as any, {
      initialAmount: scenario.params.initialAmount,
      monthlyContribution: scenario.params.monthlyContribution,
      annualReturn: normalizedAnnualReturnPct,
      timeHorizon: scenario.params.timeHorizon,
    }) || translationFallback.name

  const translatedScenario = {
    name: scenarioHeadline,
    description: scenarioDescription,
  }

  const investmentParams: InvestmentParameters = {
    initialAmount: scenario.params.initialAmount,
    monthlyContribution: scenario.params.monthlyContribution,
    annualReturnRate: normalizedAnnualReturnPct, // always a percentage for finance utils
    timeHorizonYears: scenario.params.timeHorizon,
  }

  const result = calculateFutureValue(investmentParams)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Structured Data for SEO (SSR) */}
      <StructuredData
        scenario={{
          id: scenario.id,
          name: translatedScenario.name,
          description: translatedScenario.description,
          params: {
            initialAmount: scenario.params.initialAmount,
            monthlyContribution: scenario.params.monthlyContribution,
            annualReturnRate: normalizedAnnualReturnPct,
            timeHorizonYears: scenario.params.timeHorizon,
          },
          tags: scenario.tags,
        }}
        result={result}
        locale={params.locale}
      />

      {/* Hero Section with Scenario Info */}
      <section className="relative py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumbs */}
            <nav className="flex justify-center mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
                <li>
                  <Link
                    href={params.locale === 'en' ? '/' : `/${params.locale}`}
                    className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{(messages as any)?.navigation?.home || 'Home'}</span>
                  </Link>
                </li>
                <li className="flex items-center text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </li>
                <li>
                  <Link
                    href={
                      params.locale === 'en'
                        ? '/scenario'
                        : `/${params.locale}/scenario`
                    }
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {(messages as any)?.scenarios?.title || 'Scenarios'}
                  </Link>
                </li>
                <li className="flex items-center text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </li>
                <li
                  className="text-slate-900 font-medium max-w-[150px] sm:max-w-xs md:max-w-sm truncate"
                  title={translatedScenario.name}
                >
                  {translatedScenario.name}
                </li>
              </ol>
            </nav>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
              {translatedScenario.name}
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {translatedScenario.description}
            </p>

            {/* Unified Scenario Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Input Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100/50">
                <div className="bg-white/60 p-6 flex flex-col items-center justify-center group hover:bg-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatCurrencyUSD(scenario.params.initialAmount)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    {scenarioPage?.initialInvestment || 'Initial'}
                  </div>
                </div>

                <div className="bg-white/60 p-6 flex flex-col items-center justify-center group hover:bg-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatCurrencyUSD(scenario.params.monthlyContribution)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    {scenarioPage?.monthlyContribution || 'Monthly'}
                  </div>
                </div>

                <div className="bg-white/60 p-6 flex flex-col items-center justify-center group hover:bg-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatPercent(normalizedAnnualReturnPct, 1)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    {scenarioPage?.annualReturn || 'Return'}
                  </div>
                </div>

                <div className="bg-white/60 p-6 flex flex-col items-center justify-center group hover:bg-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">
                    {scenario.params.timeHorizon}{' '}
                    {scenarioPage?.years || 'years'}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    {scenarioPage?.timeHorizon || 'Duration'}
                  </div>
                </div>
              </div>

              {/* Result & CTA Section */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-10 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-center lg:text-left">
                    <div className="text-slate-400 font-medium mb-2 flex items-center justify-center lg:justify-start gap-2">
                      {scenarioPage?.projectedResult ||
                        'Projected Future Value'}
                    </div>
                    <div className="text-5xl lg:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                      {formatCurrencyUSD(result.futureValue)}
                    </div>
                    <div className="text-emerald-400 font-medium flex items-center justify-center lg:justify-start gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        +{formatCurrencyUSD(result.totalGrowth)} (
                        {(
                          (result.totalGrowth / result.totalContributions) *
                          100
                        ).toFixed(0)}
                        % growth)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <a
                      href={`${params.locale === 'en' ? '/' : `/${params.locale}`}${encodeParamsToUrl(
                        {
                          initialAmount: scenario.params.initialAmount,
                          monthlyContribution:
                            scenario.params.monthlyContribution,
                          annualReturn: normalizedAnnualReturnPct,
                          timeHorizon: scenario.params.timeHorizon,
                        }
                      )}#calculator`}
                      className="group flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                    >
                      <Settings2 className="w-5 h-5 text-indigo-600 group-hover:rotate-90 transition-transform duration-500" />
                      <span>{scenarioPage?.customizeTitle || 'Customize'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Investment Metrics (moved from main page statistics) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <PersonalizedInsights
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Market Context & Analysis (moved from main page context) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <MarketContext
          params={investmentParams}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Comparative Analysis (moved from main page expert scenarios) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <ComparativeAnalysis
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Optimization Tips (moved from main page CTA section) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <OptimizationTips
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Related Scenarios - Internal Linking Strategy */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <RelatedScenarios
          currentScenario={{
            id: scenario.id,
            name: translatedScenario.name,
            params: {
              initialAmount: scenario.params.initialAmount,
              monthlyContribution: scenario.params.monthlyContribution,
              annualReturnRate: normalizedAnnualReturnPct,
              timeHorizonYears: scenario.params.timeHorizon,
            },
          }}
          locale={params.locale}
          maxResults={6}
        />
      </LazyContentSection>
    </div>
  )
}
