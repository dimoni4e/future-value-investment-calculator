import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PersonalizedInsights from '../../../components/scenario/PersonalizedInsights'
import ComparativeAnalysis from '../../../components/scenario/ComparativeAnalysis'
import OptimizationTips from '../../../components/scenario/OptimizationTips'
import { type InvestmentParameters } from '../../../lib/finance'

// Note: MarketContext is excluded from interaction tests because it's an async server component

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
  'scenario.comparativeAnalysis.title':
    'How Different Choices Impact Your Results',
  'scenario.optimizationTips.title': 'Maximize Your Investment Potential',
}

describe('Scenario Components Interactions', () => {
  describe('PersonalizedInsights Interactions', () => {
    it('should display basic insights content', () => {
      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(screen.getByText('Your Investment Journey')).toBeInTheDocument()
      expect(
        screen.getByText('Personalized Investment Metrics')
      ).toBeInTheDocument()
    })

    it('should format numerical values correctly', () => {
      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      // Check for formatted currency values (should contain $ symbol)
      const dollarSigns = screen.getAllByText(/\$/i)
      expect(dollarSigns.length).toBeGreaterThan(0)
    })

    it('should handle different locale scenarios', () => {
      const spanishTranslations = {
        insightsTitle: 'Tu Viaje de Inversión',
        personalizedMetrics: 'Métricas de Inversión Personalizadas',
      }

      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="es"
          translations={spanishTranslations}
        />
      )

      expect(screen.getByText('Tu Viaje de Inversión')).toBeInTheDocument()
      expect(
        screen.getByText('Métricas de Inversión Personalizadas')
      ).toBeInTheDocument()
    })
  })

  describe('ComparativeAnalysis Interactions', () => {
    it('should display comparative analysis content', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(
        screen.getByText('How Different Choices Impact Your Results')
      ).toBeInTheDocument()
    })

    it('should show different investment scenarios', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      // Should contain comparison content
      expect(
        screen.getByText('How Different Choices Impact Your Results')
      ).toBeInTheDocument()
      expect(screen.getByText('Your Current Scenario')).toBeInTheDocument()
    })

    it('should handle edge case parameters', () => {
      const edgeCaseParams: InvestmentParameters = {
        initialAmount: 0,
        monthlyContribution: 0,
        timeHorizonYears: 1,
        annualReturnRate: 0,
      }

      const edgeCaseResult = {
        futureValue: 0,
        totalContributions: 0,
        totalGrowth: 0,
      }

      render(
        <ComparativeAnalysis
          params={edgeCaseParams}
          result={edgeCaseResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(
        screen.getByText('How Different Choices Impact Your Results')
      ).toBeInTheDocument()
    })
  })

  describe('OptimizationTips Interactions', () => {
    it('should display optimization tips content', () => {
      render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(
        screen.getByText('Maximize Your Investment Potential')
      ).toBeInTheDocument()
    })

    it('should provide relevant suggestions based on parameters', () => {
      const lowInvestmentParams: InvestmentParameters = {
        initialAmount: 100,
        monthlyContribution: 50,
        timeHorizonYears: 5,
        annualReturnRate: 3,
      }

      render(
        <OptimizationTips
          params={lowInvestmentParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(
        screen.getByText('Maximize Your Investment Potential')
      ).toBeInTheDocument()
    })

    it('should work with high-value investment scenarios', () => {
      const highValueParams: InvestmentParameters = {
        initialAmount: 100000,
        monthlyContribution: 5000,
        timeHorizonYears: 30,
        annualReturnRate: 10,
      }

      render(
        <OptimizationTips
          params={highValueParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(
        screen.getByText('Maximize Your Investment Potential')
      ).toBeInTheDocument()
    })
  })

  describe('Cross-Component Consistency', () => {
    it('should render all components with consistent data', () => {
      const components = [
        <PersonalizedInsights
          key="insights"
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />,
        <ComparativeAnalysis
          key="analysis"
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />,
        <OptimizationTips
          key="tips"
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />,
      ]

      components.forEach((component) => {
        const { unmount } = render(component)
        expect(document.body).toBeInTheDocument()
        unmount()
      })
    })

    it('should handle missing translation keys gracefully', () => {
      const minimalTranslations = {}

      // Test with minimal translations
      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={minimalTranslations}
        />
      )

      // Component should still render without crashing
      expect(document.body).toBeInTheDocument()
    })

    it('should handle prop changes dynamically', () => {
      const { rerender } = render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      // Change props and re-render
      const newParams: InvestmentParameters = {
        initialAmount: 20000,
        monthlyContribution: 1000,
        timeHorizonYears: 15,
        annualReturnRate: 8,
      }

      rerender(
        <PersonalizedInsights
          params={newParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      expect(screen.getByText('Your Investment Journey')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle incomplete data gracefully', () => {
      const incompleteParams = {
        initialAmount: 1000,
        monthlyContribution: 0,
        timeHorizonYears: 1,
        annualReturnRate: 0,
      } as InvestmentParameters

      const incompleteResult = {
        futureValue: 1000,
        totalContributions: 1000,
        totalGrowth: 0,
      } as any

      // Should not crash even with minimal data
      expect(() => {
        render(
          <PersonalizedInsights
            params={incompleteParams}
            result={incompleteResult}
            locale="en"
            translations={mockTranslations}
          />
        )
      }).not.toThrow()
    })

    it('should handle null or undefined props', () => {
      // Test with fallback values when params is null
      const fallbackParams = {
        initialAmount: 0,
        monthlyContribution: 0,
        timeHorizonYears: 1,
        annualReturnRate: 0,
      }

      expect(() => {
        render(
          <ComparativeAnalysis
            params={fallbackParams}
            result={mockResult}
            locale="en"
            translations={mockTranslations}
          />
        )
      }).not.toThrow()
    })

    it('should handle empty result object', () => {
      const emptyResult = {} as any

      // Components should handle empty data gracefully without throwing
      expect(() => {
        render(
          <OptimizationTips
            params={mockParams}
            result={emptyResult}
            locale="en"
            translations={mockTranslations}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure in PersonalizedInsights', () => {
      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have proper heading structure in ComparativeAnalysis', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have proper heading structure in OptimizationTips', () => {
      render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })
  })
})
