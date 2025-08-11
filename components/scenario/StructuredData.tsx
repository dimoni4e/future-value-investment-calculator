import { InvestmentParameters, InvestmentResult } from '@/lib/finance'

interface StructuredDataProps {
  scenario: {
    id: string
    name: string
    description: string
    params: InvestmentParameters
    tags?: string[]
  }
  result: InvestmentResult
  locale: string
}

const json = (obj: unknown) => JSON.stringify(obj, null, 2)

export default function StructuredData({
  scenario,
  result,
  locale,
}: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nature2pixel.com'
  const scenarioUrl =
    locale === 'en'
      ? `${baseUrl}/scenario/${scenario.id}`
      : `${baseUrl}/${locale}/scenario/${scenario.id}`

  const timeHorizon = scenario.params.timeHorizonYears || 0
  const annualReturn =
    Math.round((scenario.params.annualReturnRate || 0) * 100) / 100

  const financialProduct = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: scenario.name,
    description: scenario.description,
    category: 'Investment',
    provider: {
      '@type': 'Organization',
      name: 'Future Value Investment Calculator',
      url: baseUrl,
    },
    interestRate: {
      '@type': 'QuantitativeValue',
      value: annualReturn,
      unitText: 'percent per year',
    },
    termDuration: `P${timeHorizon}Y`,
    url: scenarioUrl,
  }

  const now = new Date()
  const end = new Date(now)
  end.setFullYear(now.getFullYear() + (timeHorizon > 0 ? timeHorizon : 10))

  const investAction = {
    '@context': 'https://schema.org',
    '@type': 'InvestAction',
    agent: {
      '@type': 'Person',
      name: 'Investment Calculator User',
    },
    object: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: result.totalContributions,
    },
    result: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: result.futureValue,
    },
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    description: `Investment scenario projecting ${timeHorizon} years with ${annualReturn}% annual return`,
  }

  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${scenario.name} - Investment Projection Data`,
    description: `Financial projection dataset for ${scenario.name} scenario including year-by-year breakdown`,
    creator: {
      '@type': 'Organization',
      name: 'Future Value Investment Calculator',
      url: baseUrl,
    },
    dateCreated: now.toISOString(),
    dateModified: now.toISOString(),
    keywords: [
      'investment projection',
      'compound interest',
      'financial planning',
      'future value',
      ...(scenario.tags || []),
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${scenarioUrl}/data.json`,
      },
    ],
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Initial Investment',
        description: 'Starting investment amount',
        unitText: 'USD',
      },
      {
        '@type': 'PropertyValue',
        name: 'Monthly Contribution',
        description: 'Monthly investment amount',
        unitText: 'USD',
      },
      {
        '@type': 'PropertyValue',
        name: 'Annual Return Rate',
        description: 'Expected annual rate of return',
        unitText: 'percent',
      },
      {
        '@type': 'PropertyValue',
        name: 'Time Horizon',
        description: 'Investment duration in years',
        unitText: 'years',
      },
      {
        '@type': 'PropertyValue',
        name: 'Future Value',
        description: 'Projected total value at end of period',
        unitText: 'USD',
      },
      {
        '@type': 'PropertyValue',
        name: 'Total Growth',
        description: 'Total growth from compound interest',
        unitText: 'USD',
      },
    ],
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Scenarios',
        item:
          locale === 'en'
            ? `${baseUrl}/scenario`
            : `${baseUrl}/${locale}/scenario`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: scenario.name,
        item: scenarioUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json(financialProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json(investAction) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json(dataset) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json(breadcrumbs) }}
      />
    </>
  )
}
