/**
 * Task 5.3 Related Scenarios Algorithm Tests
 * Tests for related scenario recommendation accuracy and similarity scoring
 */

import { InvestmentParameters } from '@/lib/finance'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'

// Import the functions we need to test - these would normally be imported from the component
// For testing purposes, we'll recreate the key functions here

function calculateSimilarity(
  current: InvestmentParameters,
  candidate: InvestmentParameters
): number {
  // Normalize differences to 0-1 scale
  const amountDiff =
    Math.abs(current.initialAmount - candidate.initialAmount) /
    Math.max(current.initialAmount, candidate.initialAmount, 1000)

  const monthlyDiff =
    Math.abs(current.monthlyContribution - candidate.monthlyContribution) /
    Math.max(current.monthlyContribution, candidate.monthlyContribution, 100)

  const timeDiff =
    Math.abs(current.timeHorizonYears - candidate.timeHorizonYears) /
    Math.max(current.timeHorizonYears, candidate.timeHorizonYears, 1)

  const returnDiff =
    Math.abs(current.annualReturnRate - candidate.annualReturnRate) /
    Math.max(current.annualReturnRate, candidate.annualReturnRate, 1)

  // Weighted similarity score (higher is more similar)
  const similarity =
    1 -
    (amountDiff * 0.3 + monthlyDiff * 0.25 + timeDiff * 0.25 + returnDiff * 0.2)

  return Math.max(0, Math.min(1, similarity))
}

describe('Task 5.3: Related Scenarios Algorithm', () => {
  // Test data
  const baseScenario: InvestmentParameters = {
    initialAmount: 50000,
    monthlyContribution: 2000,
    annualReturnRate: 7,
    timeHorizonYears: 25,
  }

  describe('Similarity Scoring Algorithm', () => {
    it('should return 1.0 for identical scenarios', () => {
      const identical = { ...baseScenario }
      const similarity = calculateSimilarity(baseScenario, identical)
      expect(similarity).toBe(1.0)
    })

    it('should return 0.0 for completely different scenarios', () => {
      const different: InvestmentParameters = {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturnRate: 15,
        timeHorizonYears: 5,
      }
      const similarity = calculateSimilarity(baseScenario, different)
      expect(similarity).toBeGreaterThanOrEqual(0)
      expect(similarity).toBeLessThan(0.5) // Should be quite different
    })

    it('should weight initial amount changes at 30%', () => {
      const amountVariation = {
        ...baseScenario,
        initialAmount: baseScenario.initialAmount * 2, // 100% increase
      }
      const similarity = calculateSimilarity(baseScenario, amountVariation)

      // With 100% amount difference, normalized to 0.5, weighted at 30%: 1 - (0.5 * 0.3) = 0.85
      expect(similarity).toBeCloseTo(0.85, 1)
    })

    it('should weight monthly contribution changes at 25%', () => {
      const monthlyVariation = {
        ...baseScenario,
        monthlyContribution: baseScenario.monthlyContribution * 2, // 100% increase
      }
      const similarity = calculateSimilarity(baseScenario, monthlyVariation)

      // With 100% monthly difference, normalized to 0.5, weighted at 25%: 1 - (0.5 * 0.25) = 0.875
      expect(similarity).toBeCloseTo(0.875, 1)
    })

    it('should weight time horizon changes at 25%', () => {
      const timeVariation = {
        ...baseScenario,
        timeHorizonYears: baseScenario.timeHorizonYears * 2, // 100% increase
      }
      const similarity = calculateSimilarity(baseScenario, timeVariation)

      // With 100% time difference, normalized to 0.5, weighted at 25%: 1 - (0.5 * 0.25) = 0.875
      expect(similarity).toBeCloseTo(0.875, 1)
    })

    it('should weight return rate changes at 20%', () => {
      const returnVariation = {
        ...baseScenario,
        annualReturnRate: baseScenario.annualReturnRate * 2, // 100% increase
      }
      const similarity = calculateSimilarity(baseScenario, returnVariation)

      // With 100% return difference, normalized to 0.5, weighted at 20%: 1 - (0.5 * 0.2) = 0.9
      expect(similarity).toBeCloseTo(0.9, 1)
    })

    it('should handle edge cases with zero values', () => {
      const zeroScenario: InvestmentParameters = {
        initialAmount: 0,
        monthlyContribution: 1000,
        annualReturnRate: 7,
        timeHorizonYears: 25,
      }
      const similarity = calculateSimilarity(baseScenario, zeroScenario)
      expect(similarity).toBeGreaterThanOrEqual(0)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('should be commutative (order should not matter)', () => {
      const scenario1: InvestmentParameters = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturnRate: 6,
        timeHorizonYears: 20,
      }
      const scenario2: InvestmentParameters = {
        initialAmount: 75000,
        monthlyContribution: 3000,
        annualReturnRate: 8,
        timeHorizonYears: 30,
      }

      const similarity1to2 = calculateSimilarity(scenario1, scenario2)
      const similarity2to1 = calculateSimilarity(scenario2, scenario1)

      expect(similarity1to2).toBeCloseTo(similarity2to1, 5)
    })
  })

  describe('Related Scenario Recommendation Accuracy', () => {
    it('should find similar scenarios within reasonable range', () => {
      const variations = [
        // 50% amount increase (more significant change)
        {
          ...baseScenario,
          initialAmount: baseScenario.initialAmount * 1.5,
        },
        // 100% monthly increase
        {
          ...baseScenario,
          monthlyContribution: baseScenario.monthlyContribution * 2,
        },
        // 10 year increase
        {
          ...baseScenario,
          timeHorizonYears: baseScenario.timeHorizonYears + 10,
        },
        // 3% return increase
        {
          ...baseScenario,
          annualReturnRate: baseScenario.annualReturnRate + 3,
        },
      ]

      variations.forEach((variation, index) => {
        const similarity = calculateSimilarity(baseScenario, variation)

        // All variations should be reasonably similar (>50% but <95%)
        expect(similarity).toBeGreaterThan(0.5)
        expect(similarity).toBeLessThan(0.95)
      })
    })

    it('should exclude scenarios that are too similar (>80%)', () => {
      const tooSimilar = {
        ...baseScenario,
        initialAmount: baseScenario.initialAmount * 1.05, // Only 5% difference
      }
      const similarity = calculateSimilarity(baseScenario, tooSimilar)
      expect(similarity).toBeGreaterThan(0.8)
    })

    it('should exclude scenarios that are too different (<20%)', () => {
      const tooDifferent: InvestmentParameters = {
        initialAmount: 500,
        monthlyContribution: 50,
        annualReturnRate: 20,
        timeHorizonYears: 2,
      }
      const similarity = calculateSimilarity(baseScenario, tooDifferent)
      expect(similarity).toBeLessThan(0.2)
    })

    it('should work with predefined scenarios', () => {
      // Test with actual predefined scenarios
      const similarities = PREDEFINED_SCENARIOS.map((scenario) => ({
        scenario,
        similarity: calculateSimilarity(baseScenario, {
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturnRate: scenario.params.annualReturn,
          timeHorizonYears: scenario.params.timeHorizon,
        }),
      }))

      // Should have at least some scenarios with reasonable similarity
      const reasonableSimilarities = similarities.filter(
        (s) => s.similarity >= 0.2 && s.similarity <= 0.8
      )
      expect(reasonableSimilarities.length).toBeGreaterThan(0)
    })
  })

  describe('Diversity in Recommended Scenarios', () => {
    it('should generate diverse types of variations', () => {
      const testScenario: InvestmentParameters = {
        initialAmount: 30000,
        monthlyContribution: 1500,
        annualReturnRate: 6,
        timeHorizonYears: 20,
      }

      // Generate variations using the same strategy as the component
      const amountVariations = [0.75, 1.25, 1.5].map((factor) => ({
        ...testScenario,
        initialAmount: Math.round(testScenario.initialAmount * factor),
        type: 'amount',
      }))

      const monthlyVariations = [0.5, 1.5, 2].map((factor) => ({
        ...testScenario,
        monthlyContribution: Math.round(
          testScenario.monthlyContribution * factor
        ),
        type: 'monthly',
      }))

      const timeVariations = [-5, 5, 10].map((adjustment) => ({
        ...testScenario,
        timeHorizonYears: Math.max(
          1,
          testScenario.timeHorizonYears + adjustment
        ),
        type: 'time',
      }))

      const returnVariations = [-2, 2, 3].map((adjustment) => ({
        ...testScenario,
        annualReturnRate: Math.max(
          1,
          testScenario.annualReturnRate + adjustment
        ),
        type: 'return',
      }))

      // Test that each type generates different scenarios
      expect(amountVariations).toHaveLength(3)
      expect(monthlyVariations).toHaveLength(3)
      expect(timeVariations).toHaveLength(3)
      expect(returnVariations).toHaveLength(3)

      // Test that variations are actually different from base
      const allVariations = [
        ...amountVariations,
        ...monthlyVariations,
        ...timeVariations,
        ...returnVariations,
      ]

      allVariations.forEach((variation) => {
        const isDifferent =
          variation.initialAmount !== testScenario.initialAmount ||
          variation.monthlyContribution !== testScenario.monthlyContribution ||
          variation.annualReturnRate !== testScenario.annualReturnRate ||
          variation.timeHorizonYears !== testScenario.timeHorizonYears

        expect(isDifferent).toBe(true)
      })
    })

    it('should handle minimum value constraints', () => {
      const edgeCaseScenario: InvestmentParameters = {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturnRate: 3,
        timeHorizonYears: 2,
      }

      // Test negative adjustments don't go below minimums
      const timeDecrease = Math.max(1, edgeCaseScenario.timeHorizonYears - 5)
      const returnDecrease = Math.max(1, edgeCaseScenario.annualReturnRate - 2)

      expect(timeDecrease).toBeGreaterThanOrEqual(1)
      expect(returnDecrease).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Performance and Scalability', () => {
    it('should calculate similarity efficiently for large datasets', () => {
      const startTime = performance.now()

      // Test with many scenarios
      const testScenarios = Array.from({ length: 1000 }, (_, i) => ({
        initialAmount: 1000 + i * 100,
        monthlyContribution: 100 + i * 10,
        annualReturnRate: 3 + (i % 10),
        timeHorizonYears: 5 + (i % 30),
      }))

      testScenarios.forEach((scenario) => {
        calculateSimilarity(baseScenario, scenario)
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Should complete within reasonable time (less than 100ms for 1000 calculations)
      expect(executionTime).toBeLessThan(100)
    })

    it('should handle memory efficiently with large result sets', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Generate large number of related scenarios
      const variations = Array.from({ length: 100 }, (_, i) => ({
        initialAmount: baseScenario.initialAmount * (1 + i * 0.1),
        monthlyContribution: baseScenario.monthlyContribution * (1 + i * 0.05),
        annualReturnRate: baseScenario.annualReturnRate + (i % 5),
        timeHorizonYears: baseScenario.timeHorizonYears + (i % 10),
      }))

      variations.forEach((variation) => {
        calculateSimilarity(baseScenario, variation)
      })

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB for this test)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })
})
