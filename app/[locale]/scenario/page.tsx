import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ScenarioExplorer from '@/components/ScenarioExplorer'
import {
  getScenariosWithFilters,
  getTrendingScenarios,
  getScenarioCategories,
} from '@/lib/db/queries'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('scenarios.explorer')

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      'investment scenarios, financial planning, retirement planning, wealth building, investment calculator, scenario explorer',
  }
}

export default async function ScenariosPage({ params }: Props) {
  const { locale } = params

  // Fetch initial data
  const [initialScenarios, trendingScenarios, categories] = await Promise.all([
    getScenariosWithFilters(locale, { limit: 12, sortBy: 'newest' }),
    getTrendingScenarios(locale, 6),
    getScenarioCategories(locale),
  ])

  return (
    <ScenarioExplorer
      locale={locale}
      initialScenarios={initialScenarios.scenarios}
      initialTotal={initialScenarios.total}
      categories={categories}
      trendingScenarios={trendingScenarios}
    />
  )
}
