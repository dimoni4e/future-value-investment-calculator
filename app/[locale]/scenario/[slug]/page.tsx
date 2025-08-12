import { notFound } from 'next/navigation'
import { getTranslations, getMessages } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import { generateSEO } from '@/lib/seo'
import {
  parseSlugToScenario,
  detectInvestmentGoal,
  generateLocalizedScenarioName,
  generateLocalizedScenarioDescription,
} from '@/lib/scenarioUtils'
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
import RelatedScenarios from '@/components/scenario/RelatedScenarios'

// Force dynamic rendering to test if SSG is causing translation issues
export const dynamic = 'force-dynamic'

// Get scenario data from predefined scenarios with fallback to slug parsing
async function getScenarioData(slug: string, locale: string) {
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
        source: 'database',
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
      source: 'predefined',
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

      // Save the parsed scenario to the database for future use
      try {
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

        // Insert for all supported locales so pages are available cross-locale immediately
        const localesToCreate = getSupportedLocales()
        for (const lc of localesToCreate) {
          await createScenario({
            slug,
            name: generateLocalizedScenarioName(lc as 'en' | 'pl' | 'es', {
              initialAmount: scenario.params.initialAmount,
              monthlyContribution: scenario.params.monthlyContribution,
              annualReturn: scenario.params.annualReturn * 100, // back to percent for name/desc generator
              timeHorizon: scenario.params.timeHorizon,
            }),
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
        console.log('✅ Saved parsed scenario to database:', slug)
      } catch (dbError) {
        console.error('❌ Error saving parsed scenario to database:', dbError)
        console.error('❌ Error details:', {
          name: dbError?.name || 'unknown',
          message: dbError?.message || 'no message',
          code: dbError?.code || 'no code',
          detail: dbError?.detail || 'no detail',
          constraint: dbError?.constraint || 'no constraint',
          stack: dbError?.stack || 'no stack',
        })
        // Continue anyway, scenario will still work without being saved
      }

      return {
        scenario,
        source: 'slug',
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
          source: 'api',
          isUserGenerated: true,
        }
      }
    }
  } catch (error) {
    console.error('Error fetching scenario from API:', error)
  }

  return null
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
    const annualPct = (s.params.annualReturn * 100).toFixed(0)
    const initialStr = `$${s.params.initialAmount.toLocaleString()}`
    const monthlyStr = `$${s.params.monthlyContribution}`
    const timeStr = `${s.params.timeHorizon}`

    // If predefined, try localized name/desc from messages; else use DB (already localized per-locale)
    const predefined = messages?.scenarios?.predefinedScenarios?.[s.id]
    const scenarioName = predefined?.name || s.name

    title = (
      seoMsgs.scenarioTitle || 'Investment Scenario: {scenarioName}'
    ).replace('{scenarioName}', scenarioName)

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
          annualReturn: Number(annualPct), // percent
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
      const initialStr = `$${parsed.initialAmount.toLocaleString()}`
      const monthlyStr = `$${parsed.monthlyContribution}`
      const timeStr = `${parsed.timeHorizon}`

      // Build a localized scenarioName using our helper
      const scenarioName = generateLocalizedScenarioName(locale as any, {
        initialAmount: parsed.initialAmount,
        monthlyContribution: parsed.monthlyContribution,
        annualReturn: parsed.annualReturn,
        timeHorizon: parsed.timeHorizon,
      })

      title = (
        seoMsgs.scenarioTitle || 'Investment Scenario: {scenarioName}'
      ).replace('{scenarioName}', scenarioName)

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
            annualReturn: Number(annualPct),
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
  if (title.length > 60) title = title.substring(0, 57) + '...'
  if (description.length > 160)
    description = description.substring(0, 157) + '...'

  return {
    title,
    description,
    keywords: keywordList,
    alternates: {
      canonical:
        locale === 'en'
          ? `https://nature2pixel.com/scenario/${slug}`
          : `https://nature2pixel.com/${locale}/scenario/${slug}`,
      languages: {
        en: `https://nature2pixel.com/scenario/${slug}`,
        es: `https://nature2pixel.com/es/scenario/${slug}`,
        pl: `https://nature2pixel.com/pl/scenario/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

  console.log('Scenario data source:', source, {
    locale: params.locale,
    slug: params.slug,
    scenarioName: scenario.name,
    isUserGenerated,
  })

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
      console.log('Translation error:', error)
      // Fallback to original if translation not found
      return {
        name: scenario.name,
        description: scenario.description,
      }
    }
  }

  // Prefer localized name/description for user-generated or parsed scenarios
  const translatedScenario = (() => {
    if (isUserGenerated) {
      // For DB-backed, use already-localized strings if present; otherwise generate on the fly
      try {
        const name = generateLocalizedScenarioName(params.locale as any, {
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturn: scenario.params.annualReturn * 100,
          timeHorizon: scenario.params.timeHorizon,
        })
        const description = generateLocalizedScenarioDescription(
          params.locale as any,
          {
            initialAmount: scenario.params.initialAmount,
            monthlyContribution: scenario.params.monthlyContribution,
            annualReturn: scenario.params.annualReturn * 100,
            timeHorizon: scenario.params.timeHorizon,
          }
        )
        return { name, description }
      } catch {
        return getScenarioTranslation(scenario)
      }
    }
    return getScenarioTranslation(scenario)
  })()

  // Pre-calculate results for static generation
  const investmentParams: InvestmentParameters = {
    initialAmount: scenario.params.initialAmount,
    monthlyContribution: scenario.params.monthlyContribution,
    annualReturnRate: scenario.params.annualReturn,
    timeHorizonYears: scenario.params.timeHorizon,
  }

  // calculateFutureValue expects annualReturnRate as a percentage (e.g., 7 for 7%),
  // while our app-wide params use decimal (e.g., 0.07). Convert here for accuracy.
  const result = calculateFutureValue({
    ...investmentParams,
    annualReturnRate: investmentParams.annualReturnRate * 100,
  })

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
            annualReturnRate: scenario.params.annualReturn,
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
            <nav
              className="text-sm text-slate-500 mb-4"
              aria-label="Breadcrumb"
            >
              <ol className="inline-flex items-center space-x-1">
                <li>
                  <Link
                    href={params.locale === 'en' ? '/' : `/${params.locale}`}
                    className="hover:text-slate-700"
                  >
                    {(messages as any)?.navigation?.home || 'Home'}
                  </Link>
                </li>
                <li>
                  <span className="px-1">/</span>
                  <Link
                    href={
                      params.locale === 'en'
                        ? '/scenario'
                        : `/${params.locale}/scenario`
                    }
                    className="hover:text-slate-700"
                  >
                    {(messages as any)?.scenarios?.title || 'Scenarios'}
                  </Link>
                </li>
                <li>
                  <span className="px-1">/</span>
                  <span className="text-slate-700">
                    {translatedScenario.name}
                  </span>
                </li>
              </ol>
            </nav>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <span>📊</span>
              <span>
                {source === 'database' && !isUserGenerated
                  ? scenarioPage?.databaseScenario || 'Database Scenario'
                  : isUserGenerated
                    ? scenarioPage?.userScenario || 'User Scenario'
                    : scenarioPage?.predefinedScenario || 'Scenario'}
              </span>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {source === 'database'
                  ? 'DB'
                  : source === 'api'
                    ? 'API'
                    : 'SYS'}
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {translatedScenario.name}
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
              {translatedScenario.description}
            </p>

            {/* Scenario Stats */}
            <h2 className="sr-only">Investment Metrics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-indigo-600">
                  ${scenario.params.initialAmount.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.initialInvestment || 'Initial Investment'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-emerald-600">
                  ${scenario.params.monthlyContribution.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.monthlyContribution || 'Monthly Contribution'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-purple-600">
                  {(scenario.params.annualReturn * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.annualReturn || 'Annual Return'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-cyan-600">
                  {scenario.params.timeHorizon} {scenarioPage?.years || 'years'}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.timeHorizon || 'Time Horizon'}
                </div>
              </div>
            </div>

            {/* Result Preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-3xl p-8 mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {scenarioPage?.projectedResult || 'Projected Result'}
              </h2>
              <div className="text-5xl font-bold mb-2">
                ${result.futureValue.toLocaleString()}
              </div>
              <div className="text-emerald-100">
                {scenarioPage?.totalGrowth || 'Total Growth'}: $
                {result.totalGrowth.toLocaleString()} (
                {(
                  (result.totalGrowth / result.totalContributions) *
                  100
                ).toFixed(1)}
                %)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {scenarioPage?.customizeTitle || 'Customize This Scenario'}
            </h2>

            <div className="text-center">
              <p className="text-lg text-slate-600 mb-6">
                {scenarioPage?.customizeDescription ||
                  'Visit the main calculator to customize these parameters and explore different scenarios.'}
              </p>
              <a
                href={`${params.locale === 'en' ? '/' : `/${params.locale}`}#calculator`}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>
                  {scenarioPage?.openCalculator ||
                    'Open Interactive Calculator'}
                </span>
              </a>
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
              annualReturnRate: scenario.params.annualReturn,
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
