import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/db/queries'

const LEGAL_PAGES = ['privacy', 'terms', 'cookies'] as const
type LegalPage = (typeof LEGAL_PAGES)[number]

interface LegalPageProps {
  params: {
    locale: string
    page: string
  }
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale, page } = params

  if (!LEGAL_PAGES.includes(page as LegalPage)) {
    notFound()
  }

  // Try to get page content from database first
  let dbPage = null
  try {
    dbPage = await getPageBySlug(page, locale)
  } catch (error) {
    console.error('Error fetching legal page from database:', error)
  }

  const t = await getTranslations('legal')

  // If we have database content, use it
  if (dbPage) {
    console.log('Legal page data source: database', {
      locale,
      page,
      title: dbPage.title,
    })

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mb-4">
            <span>📄</span>
            <span>Database Content</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{dbPage.title}</h1>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: dbPage.content }} />
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            {t('lastUpdated')}: {dbPage.updatedAt.toLocaleDateString(locale)}
          </p>
        </div>
      </div>
    )
  }

  // Fallback to MDX content
  console.log('Legal page data source: static MDX', { locale, page })

  // Dynamic import of the MDX content based on locale and page
  let Content
  try {
    Content = (await import(`./content/${locale}/${page}.mdx`)).default
  } catch {
    // Fallback to English if locale content doesn't exist
    try {
      Content = (await import(`./content/en/${page}.mdx`)).default
    } catch {
      notFound()
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <Content />
      </div>
      <div className="mt-8 border-t pt-6">
        <p className="text-sm text-muted-foreground">
          {t('lastUpdated')}: {new Date().toLocaleDateString(locale)}
        </p>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  const locales = ['en', 'es', 'pl']
  const pages = LEGAL_PAGES

  return locales.flatMap((locale) =>
    pages.map((page) => ({
      locale,
      page,
    }))
  )
}

export async function generateMetadata({ params }: LegalPageProps) {
  const { locale, page } = params
  const t = await getTranslations('legal')

  const titles: Record<string, string> = {
    privacy: t('privacy.title'),
    terms: t('terms.title'),
    cookies: t('cookies.title'),
  }

  return {
    title: titles[page] || t('title'),
    description: t(`${page}.description`),
  }
}
