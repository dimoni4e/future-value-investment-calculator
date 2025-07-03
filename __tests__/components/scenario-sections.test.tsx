/**
 * Component tests for migrated scenario sections
 * Tests that each migrated section renders correctly with personalized content
 */

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PersonalizedInsights from '@/components/scenario/PersonalizedInsights'
import MarketContext from '@/components/scenario/MarketContext'
import ComparativeAnalysis from '@/components/scenario/ComparativeAnalysis'
import OptimizationTips from '@/components/scenario/OptimizationTips'
import { type InvestmentParameters } from '@/lib/finance'

const mockParams: InvestmentParameters = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  timeHorizonYears: 10,
}

const mockResult = {
  futureValue: 100000,
  totalContributions: 70000,
  totalGrowth: 30000,
}

const mockTranslations = {
  personalizedMetrics: 'Personalized Investment Metrics',
  insightsTitle: 'Your Investment Journey',
  insightsDescription: 'Detailed breakdown of your investment performance',
  years: 'years',
  milestones: 'Investment Milestones',
  totalGrowthRate: 'Total Growth Rate',
  avgMonthlyGrowth: 'Avg Monthly Growth',
  compoundMultiplier: 'Compound Multiplier',
  avgMonthlyValue: 'Avg Monthly Value',
  firstMilestone: 'First Quarter Milestone',
  midpointMilestone: 'Halfway Milestone',
  finalGoal: 'Final Goal',
}

describe('Scenario Sections Components', () => {
  describe('PersonalizedInsights', () => {
    test('should render with correct props', () => {
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
      expect(screen.getByText('Investment Milestones')).toBeInTheDocument()
    })

    test('should display calculated metrics', () => {
      render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      // Should show growth rate
      expect(screen.getByText('Total Growth Rate')).toBeInTheDocument()

      // Should show compound multiplier
      expect(screen.getByText('Compound Multiplier')).toBeInTheDocument()

      // Should show milestone values
      expect(screen.getByText('First Quarter Milestone')).toBeInTheDocument()
      expect(screen.getByText('Halfway Milestone')).toBeInTheDocument()
      expect(screen.getByText('Final Goal')).toBeInTheDocument()
    })

    test('should be responsive across screen sizes', () => {
      const { container } = render(
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      )

      // Check for responsive grid classes
      expect(container.querySelector('.grid')).toBeInTheDocument()
      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()
      expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument()
    })
  })

  describe('MarketContext', () => {
    test('should render market analysis content', async () => {
      const MarketContextComponent = await MarketContext({
        params: mockParams,
        locale: 'en',
        translations: {
          marketContext: 'Market Context & Analysis',
          marketTitle: 'Market Environment for Your Investment',
          currentMarket: 'Current Market Analysis',
          riskLevel: 'Risk Assessment',
          economicIndicators: 'Economic Indicators',
        },
      })

      render(MarketContextComponent)

      expect(screen.getByText('Market Context & Analysis')).toBeInTheDocument()
      expect(
        screen.getByText('Market Environment for Your Investment')
      ).toBeInTheDocument()
    })

    test('should display risk assessment based on return rate', async () => {
      const conservativeParams = { ...mockParams, annualReturnRate: 3 }
      const aggressiveParams = { ...mockParams, annualReturnRate: 12 }

      const ConservativeComponent = await MarketContext({
        params: conservativeParams,
        locale: 'en',
        translations: { riskLevel: 'Risk Assessment' },
      })

      const AggressiveComponent = await MarketContext({
        params: aggressiveParams,
        locale: 'en',
        translations: { riskLevel: 'Risk Assessment' },
      })

      const { rerender } = render(ConservativeComponent)
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument()

      rerender(AggressiveComponent)
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument()
    })

    test('should show economic indicators', async () => {
      const MarketContextComponent = await MarketContext({
        params: mockParams,
        locale: 'en',
        translations: {
          economicIndicators: 'Economic Indicators',
          currentInflation: 'Current Inflation',
          interestRates: 'Interest Rates',
          marketVolatility: 'Market Volatility',
        },
      })

      render(MarketContextComponent)

      expect(screen.getByText('Economic Indicators')).toBeInTheDocument()
      expect(screen.getByText('Current Inflation')).toBeInTheDocument()
      expect(screen.getByText('Interest Rates')).toBeInTheDocument()
      expect(screen.getByText('Market Volatility')).toBeInTheDocument()
    })
  })

  describe('ComparativeAnalysis', () => {
    test('should render comparative scenarios', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={{
            comparativeAnalysis: 'Comparative Analysis',
            compareTitle: 'How Different Choices Impact Your Results',
            currentScenario: 'Your Current Scenario',
            higherContribution: 'Higher Monthly Contribution',
            longerTimeframe: 'Extended Time Horizon',
            higherReturn: 'Higher Expected Return',
            doubleInitial: 'Double Initial Investment',
          }}
        />
      )

      expect(screen.getByText('Comparative Analysis')).toBeInTheDocument()
      expect(
        screen.getByText('How Different Choices Impact Your Results')
      ).toBeInTheDocument()
      expect(screen.getByText('Your Current Scenario')).toBeInTheDocument()
    })

    test('should display baseline scenario parameters', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={{
            initial: 'Initial',
            monthly: 'Monthly',
            return: 'Return',
            years: 'years',
            projectedValue: 'Projected Final Value',
          }}
        />
      )

      expect(screen.getByText('$10,000')).toBeInTheDocument()
      expect(screen.getByText('$500')).toBeInTheDocument()
      expect(screen.getByText('7%')).toBeInTheDocument()
      expect(screen.getByText('10 years')).toBeInTheDocument()
    })

    test('should show improvement calculations', () => {
      render(
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={{
            newValue: 'New Value',
            improvement: 'Improvement',
            additionalGrowth: 'Additional Growth',
          }}
        />
      )

      // Check for improvement calculations
      expect(screen.getAllByText('New Value')).toHaveLength(4)
      expect(screen.getAllByText('Improvement')).toHaveLength(4)
      expect(screen.getAllByText('Additional Growth')).toHaveLength(4)
    })
  })

  describe('OptimizationTips', () => {
    test('should render optimization suggestions', () => {
      render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={{
            optimizationTips: 'Optimization Tips',
            optimizeTitle: 'Maximize Your Investment Potential',
            potentialImpact: 'Potential Impact',
            readyToOptimize: 'Ready to Optimize?',
          }}
        />
      )

      expect(screen.getByText('Optimization Tips')).toBeInTheDocument()
      expect(
        screen.getByText('Maximize Your Investment Potential')
      ).toBeInTheDocument()
      expect(screen.getByText('Ready to Optimize?')).toBeInTheDocument()
    })

    test('should generate personalized tips based on parameters', () => {
      const lowContributionParams = { ...mockParams, monthlyContribution: 100 }
      const shortTimeParams = { ...mockParams, timeHorizonYears: 5 }

      const { rerender } = render(
        <OptimizationTips
          params={lowContributionParams}
          result={mockResult}
          locale="en"
          translations={{
            increaseContributions: 'Increase Monthly Contributions',
          }}
        />
      )

      expect(
        screen.getByText('Increase Monthly Contributions')
      ).toBeInTheDocument()

      rerender(
        <OptimizationTips
          params={shortTimeParams}
          result={mockResult}
          locale="en"
          translations={{
            extendTimeframe: 'Extend Investment Timeframe',
          }}
        />
      )

      expect(
        screen.getByText('Extend Investment Timeframe')
      ).toBeInTheDocument()
    })

    test('should display potential impact values', () => {
      render(
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={{
            potentialImpact: 'Potential Impact',
          }}
        />
      )

      // Check for potential impact sections (there are multiple tips, so multiple impacts)
      expect(screen.getAllByText('Potential Impact')).toHaveLength(4)
    })
  })
})

describe('Scenario Sections Integration', () => {
  test('should work together with consistent parameter flow', () => {
    const { container } = render(
      <div>
        <PersonalizedInsights
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
        <ComparativeAnalysis
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
        <OptimizationTips
          params={mockParams}
          result={mockResult}
          locale="en"
          translations={mockTranslations}
        />
      </div>
    )

    // Should render all components without conflicts
    expect(container.children).toHaveLength(1)
    expect((container.firstChild as HTMLElement)?.children).toHaveLength(3)
  })

  test('should handle different parameter combinations', () => {
    const edgeParams: InvestmentParameters = {
      initialAmount: 0,
      monthlyContribution: 5000,
      annualReturnRate: 15,
      timeHorizonYears: 50,
    }

    const edgeResult = {
      futureValue: 5000000,
      totalContributions: 3000000,
      totalGrowth: 2000000,
    }

    render(
      <div>
        <PersonalizedInsights
          params={edgeParams}
          result={edgeResult}
          locale="en"
          translations={mockTranslations}
        />
        <ComparativeAnalysis
          params={edgeParams}
          result={edgeResult}
          locale="en"
          translations={mockTranslations}
        />
        <OptimizationTips
          params={edgeParams}
          result={edgeResult}
          locale="en"
          translations={mockTranslations}
        />
      </div>
    )

    // Should handle edge case parameters without errors
    expect(screen.getByText('Your Investment Journey')).toBeInTheDocument()
  })
})
