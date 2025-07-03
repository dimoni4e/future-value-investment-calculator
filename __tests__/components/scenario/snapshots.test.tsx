import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PersonalizedInsights from '../../../components/scenario/PersonalizedInsights'
import ComparativeAnalysis from '../../../components/scenario/ComparativeAnalysis'
import OptimizationTips from '../../../components/scenario/OptimizationTips'
import { type InvestmentParameters } from '../../../lib/finance'

// Note: MarketContext is excluded from snapshot tests because it's an async server component

// Mock data for consistent snapshots
const mockParams: InvestmentParameters = {
  initialAmount: 10000,
  monthlyContribution: 500,
  timeHorizonYears: 10,
  annualReturnRate: 7,
}

const mockResult = {
  futureValue: 100000,
  totalContributions: 70000,
  totalGrowth: 30000,
}

const mockTranslations = {
  'scenario.personalizedInsights.title': 'Your Investment Journey',
  'scenario.personalizedInsights.subtitle': 'Personalized Investment Metrics',
  'scenario.marketContext.title': 'Market Context & Analysis',
  'scenario.marketContext.subtitle': 'Market Environment for Your Investment',
  'scenario.comparativeAnalysis.title':
    'How Different Choices Impact Your Results',
  'scenario.optimizationTips.title': 'Maximize Your Investment Potential',
}

describe('Scenario Components Snapshots', () => {
  describe('PersonalizedInsights', () => {
    it('should match snapshot with standard parameters', () => {
      const { container } = render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with high-value parameters', () => {
      const highValueParams: InvestmentParameters = {
        initialAmount: 100000,
        monthlyContribution: 5000,
        timeHorizonYears: 25,
        annualReturnRate: 12,
      }
      const highValueResult = {
        futureValue: 2500000,
        totalContributions: 1600000,
        totalGrowth: 900000,
      }

      const { container } = render(
        <PersonalizedInsights
          params={highValueParams}
          result={highValueResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with conservative parameters', () => {
      const conservativeParams: InvestmentParameters = {
        initialAmount: 1000,
        monthlyContribution: 100,
        timeHorizonYears: 5,
        annualReturnRate: 4,
      }
      const conservativeResult = {
        futureValue: 7500,
        totalContributions: 7000,
        totalGrowth: 500,
      }

      const { container } = render(
        <PersonalizedInsights
          params={conservativeParams}
          result={conservativeResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('ComparativeAnalysis', () => {
    it('should match snapshot with baseline scenario', () => {
      const { container } = render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with short-term scenario', () => {
      const shortTermParams: InvestmentParameters = {
        ...mockParams,
        timeHorizonYears: 5,
      }
      const { container } = render(
        <ComparativeAnalysis
          params={shortTermParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with long-term scenario', () => {
      const longTermParams: InvestmentParameters = {
        ...mockParams,
        timeHorizonYears: 30,
      }
      const { container } = render(
        <ComparativeAnalysis
          params={longTermParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('OptimizationTips', () => {
    it('should match snapshot with standard optimization', () => {
      const { container } = render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()

      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    it('should match snapshot with different locales', () => {
      const spanishTranslations = {
        'scenario.optimizationTips.title': 'Maximiza tu Potencial de Inversión',
        'scenario.optimizationTips.subtitle':
          'Estrategias personalizadas para mejores resultados',
      }

      const { container } = render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="es"
          translations={spanishTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Responsive Breakpoint Variations', () => {
    beforeEach(() => {
      // Reset any viewport changes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    it('should match snapshot at mobile breakpoint (375px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot at tablet breakpoint (768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { container } = render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot at desktop breakpoint (1200px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      const { container } = render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
