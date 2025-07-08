import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('scenarios')

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      'investment scenarios, financial planning, retirement planning, wealth building, investment calculator',
  }
}

export default async function ScenariosPage({ params }: Props) {
  // Redirect to the homepage which now contains the scenario explorer
  redirect(`/${params.locale}`)
}
