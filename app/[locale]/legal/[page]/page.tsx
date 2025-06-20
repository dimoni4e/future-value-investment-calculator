import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

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

  const t = await getTranslations('legal')

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
