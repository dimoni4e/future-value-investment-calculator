'use client'

import { useEffect } from 'react'
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
  source?: string
  isUserGenerated?: boolean
}

interface FinancialProductSchema {
  '@context': 'https://schema.org'
  '@type': 'FinancialProduct'
  name: string
  description: string
  category: 'InvestmentFund' | 'Investment'
  provider: {
    '@type': 'Organization'
    name: string
    url: string
  }
  feesAndCommissionsSpecification?: string
  interestRate?: {
    '@type': 'QuantitativeValue'
    value: number
    unitText: 'percent per year'
  }
  termDuration?: string
  url: string
}

interface InvestActionSchema {
  '@context': 'https://schema.org'
  '@type': 'InvestAction'
  agent: {
    '@type': 'Person'
    name: string
  }
  object: {
    '@type': 'MonetaryAmount'
    currency: 'USD'
    value: number
  }
  result: {
    '@type': 'MonetaryAmount'
    currency: 'USD'
    value: number
  }
  startTime: string
  endTime: string
  description: string
}

interface DatasetSchema {
  '@context': 'https://schema.org'
  '@type': 'Dataset'
  name: string
  description: string
  creator: {
    '@type': 'Organization'
    name: string
    url: string
  }
  dateCreated: string
  dateModified: string
  keywords: string[]
  distribution: {
    '@type': 'DataDownload'
    encodingFormat: 'application/json'
    contentUrl: string
  }[]
  variableMeasured: {
    '@type': 'PropertyValue'
    name: string
    description: string
    unitText?: string
  }[]
}

export default function StructuredData({
  scenario,
  result,
  locale,
  source = 'predefined',
  isUserGenerated = false,
}: StructuredDataProps) {
  useEffect(() => {
    // Create structured data schemas
    const currentDate = new Date().toISOString()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const scenarioUrl = `${baseUrl}/${locale}/scenario/${scenario.id}`

    // Safely handle parameters - ensure they're valid numbers
    const timeHorizon = scenario.params.timeHorizonYears || 0
    const annualReturn = scenario.params.annualReturnRate || 0

    // 1. FinancialProduct Schema
    const financialProduct: FinancialProductSchema = {
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

    // 2. InvestAction Schema
    const startDate = new Date()
    const endDate = new Date()

    if (timeHorizon > 0 && timeHorizon <= 100) {
      endDate.setFullYear(startDate.getFullYear() + timeHorizon)
    } else {
      // Fallback to 10 years if invalid
      endDate.setFullYear(startDate.getFullYear() + 10)
    }

    const investAction: InvestActionSchema = {
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
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      description: `Investment scenario projecting ${timeHorizon} years of contributions with ${annualReturn}% annual return`,
    }

    // 3. Dataset Schema (for scenario data and projections)
    const dataset: DatasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${scenario.name} - Investment Projection Data`,
      description: `Financial projection dataset for ${scenario.name} investment scenario including year-by-year breakdown`,
      creator: {
        '@type': 'Organization',
        name: 'Future Value Investment Calculator',
        url: baseUrl,
      },
      dateCreated: currentDate,
      dateModified: currentDate,
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
          description: 'Regular monthly investment amount',
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
          description: 'Projected total value at end of investment period',
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

    // Inject structured data into the page
    const structuredDataScripts = [
      {
        id: 'structured-data-financial-product',
        data: financialProduct,
      },
      {
        id: 'structured-data-invest-action',
        data: investAction,
      },
      {
        id: 'structured-data-dataset',
        data: dataset,
      },
    ]

    structuredDataScripts.forEach(({ id, data }) => {
      // Remove existing script if it exists
      const existingScript = document.getElementById(id)
      if (existingScript) {
        existingScript.remove()
      }

      // Create new script element
      const script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(data, null, 2)
      document.head.appendChild(script)
    })

    // Cleanup function to remove scripts when component unmounts
    return () => {
      structuredDataScripts.forEach(({ id }) => {
        const script = document.getElementById(id)
        if (script) {
          script.remove()
        }
      })
    }
  }, [scenario, result, locale, source, isUserGenerated])

  // This component doesn't render anything visible
  return null
}
