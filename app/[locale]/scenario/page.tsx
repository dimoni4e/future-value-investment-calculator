import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ScenarioExplorer from '@/components/ScenarioExplorer'
import {
  getScenariosWithFilters,
  getTrendingScenarios,
  getScenarioCategories,
} from '@/lib/db/queries'
import { unstable_cache } from 'next/cache'

interface Props {
  params: {
    locale: string
  }
}

// Revalidate the static scenario explorer shell every 10 minutes; data inside uses its own tagged caches.
export const revalidate = 600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Use explicit locale to avoid any fallback to default during metadata generation
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'scenarios.explorer',
  })
  const baseUrl = 'https://nature2pixel.com'
  const canonical =
    params.locale === 'en'
      ? `${baseUrl}/scenario`
      : `${baseUrl}/${params.locale}/scenario`

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      'investment scenarios, financial planning, retirement planning, wealth building, investment calculator, scenario explorer',
    alternates: {
      canonical,
      languages: {
        'x-default': `${baseUrl}/scenario`,
        en: `${baseUrl}/scenario`,
        es: `${baseUrl}/es/scenario`,
        pl: `${baseUrl}/pl/scenario`,
      },
    },
  }
}

export default async function ScenariosPage({ params }: Props) {
  const { locale } = params

  // Fetch initial data
  const getCachedInitial = unstable_cache(
    () => getScenariosWithFilters(locale, { limit: 12, sortBy: 'newest' }),
    ['scenarios:initial', locale],
    { revalidate: 600, tags: [`scenarios:search:${locale}`] }
  )

  const getCachedTrending = unstable_cache(
    () => getTrendingScenarios(locale, 6),
    ['scenarios:trending', locale],
    { revalidate: 600, tags: [`scenarios:trending:${locale}`] }
  )

  const getCachedCategories = unstable_cache(
    () => getScenarioCategories(locale),
    ['scenarios:categories', locale],
    { revalidate: 3600, tags: [`scenarios:categories:${locale}`] }
  )

  const [initialScenarios, trendingScenarios, categories] = await Promise.all([
    getCachedInitial(),
    getCachedTrending(),
    getCachedCategories(),
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
