/**
 * Property-based tests for scenarioUtils.ts
 * Testing that functions maintain consistency and deterministic behavior
 */

import {
  generateScenarioSlug,
  parseSlugToScenario,
  detectInvestmentGoal,
  validateScenarioParams,
  CalculatorInputs,
} from '../lib/scenarioUtils'

// Simple property-based testing utilities
function generateRandomParams(seed: number = Math.random()): CalculatorInputs {
  // Use seed for reproducible tests
  const random = (min: number, max: number) =>
    Math.floor(seed * (max - min) + min)

  return {
    initialAmount: random(0, 100000),
    monthlyContribution: random(0, 10000),
    annualReturn: random(0, 20),
    timeHorizon: random(1, 50),
  }
}

function generateValidParams(seed: number = Math.random()): CalculatorInputs {
  const random = (min: number, max: number) =>
    Math.floor(seed * (max - min) + min)

  return {
    initialAmount: random(0, 1000000),
    monthlyContribution: random(0, 50000),
    annualReturn: random(0, 30),
    timeHorizon: random(1, 80),
  }
}

describe('scenarioUtils Property-Based Tests', () => {
  describe('Slug Generation and Parsing Round-Trip', () => {
    it('should maintain data integrity through multiple round trips', () => {
      // Generate 100 test cases with different seeds
      for (let i = 0; i < 100; i++) {
        const seed = i / 100
        const params = generateValidParams(seed)

        if (!validateScenarioParams(params)) {
          continue // Skip invalid params
        }

        const slug = generateScenarioSlug(params)
        const parsed = parseSlugToScenario(slug)

        expect(parsed).not.toBeNull()
        if (parsed) {
          // Check that rounded values match
          expect(parsed.initialAmount).toBe(Math.round(params.initialAmount))
          expect(parsed.monthlyContribution).toBe(
            Math.round(params.monthlyContribution)
          )
          expect(parsed.timeHorizon).toBe(Math.round(params.timeHorizon))

          // Check annual return with rounding tolerance
          const expectedRate = Math.round(params.annualReturn * 10) / 10
          expect(Math.abs(parsed.annualReturn - expectedRate)).toBeLessThan(
            0.01
          )

          // Check that slug matches
          expect(parsed.slug).toBe(slug)

          // Verify goal detection is consistent
          const originalGoal = detectInvestmentGoal(params)
          const parsedGoal = detectInvestmentGoal(parsed)
          expect(parsedGoal).toBe(originalGoal)
        }
      }
    })

    it('should generate consistent slugs for identical inputs', () => {
      const testParams = [
        {
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn: 7.5,
          timeHorizon: 20,
        },
        {
          initialAmount: 0,
          monthlyContribution: 1000,
          annualReturn: 5.0,
          timeHorizon: 10,
        },
        {
          initialAmount: 50000,
          monthlyContribution: 0,
          annualReturn: 8.25,
          timeHorizon: 15,
        },
      ]

      testParams.forEach((params) => {
        const slug1 = generateScenarioSlug(params)
        const slug2 = generateScenarioSlug(params)
        expect(slug1).toBe(slug2)

        // Test multiple times to ensure deterministic behavior
        for (let i = 0; i < 10; i++) {
          const slugN = generateScenarioSlug(params)
          expect(slugN).toBe(slug1)
        }
      })
    })

    it('should produce unique slugs for different parameter combinations', () => {
      const slugSet = new Set<string>()
      const paramsList: CalculatorInputs[] = []

      // Generate diverse parameter combinations
      for (let i = 0; i < 200; i++) {
        const seed = i / 200
        const params = generateValidParams(seed)

        if (validateScenarioParams(params)) {
          paramsList.push(params)
          const slug = generateScenarioSlug(params)
          slugSet.add(slug)
        }
      }

      // Should have high uniqueness (allowing for some collisions due to rounding)
      const uniquenessRatio = slugSet.size / paramsList.length
      expect(uniquenessRatio).toBeGreaterThan(0.8) // At least 80% unique
    })
  })

  describe('Goal Detection Consistency', () => {
    it('should produce deterministic goal detection', () => {
      for (let i = 0; i < 50; i++) {
        const seed = i / 50
        const params = generateValidParams(seed)

        const goal1 = detectInvestmentGoal(params)
        const goal2 = detectInvestmentGoal(params)
        expect(goal1).toBe(goal2)

        // Test with multiple calls
        for (let j = 0; j < 5; j++) {
          const goalN = detectInvestmentGoal(params)
          expect(goalN).toBe(goal1)
        }
      }
    })

    it('should return valid goal types for all inputs', () => {
      const validGoals = [
        'retirement',
        'emergency',
        'house',
        'education',
        'wealth',
        'vacation',
        'starter',
        'investment',
      ]

      for (let i = 0; i < 100; i++) {
        const seed = i / 100
        const params = generateValidParams(seed)

        const goal = detectInvestmentGoal(params)
        expect(validGoals).toContain(goal)
      }
    })

    it('should handle edge cases consistently', () => {
      const edgeCases = [
        {
          initialAmount: 0,
          monthlyContribution: 0,
          annualReturn: 0,
          timeHorizon: 1,
        },
        {
          initialAmount: 1000000,
          monthlyContribution: 50000,
          annualReturn: 30,
          timeHorizon: 80,
        },
        {
          initialAmount: 1,
          monthlyContribution: 1,
          annualReturn: 0.1,
          timeHorizon: 1,
        },
      ]

      edgeCases.forEach((params) => {
        const goal1 = detectInvestmentGoal(params)
        const goal2 = detectInvestmentGoal(params)
        expect(goal1).toBe(goal2)
        expect(typeof goal1).toBe('string')
      })
    })
  })

  describe('Validation Consistency', () => {
    it('should maintain consistent validation results', () => {
      for (let i = 0; i < 50; i++) {
        const seed = i / 50
        const params = generateRandomParams(seed)

        const isValid1 = validateScenarioParams(params)
        const isValid2 = validateScenarioParams(params)
        expect(isValid1).toBe(isValid2)

        // Test multiple times
        for (let j = 0; j < 3; j++) {
          const isValidN = validateScenarioParams(params)
          expect(isValidN).toBe(isValid1)
        }
      }
    })

    it('should reject all negative values consistently', () => {
      const negativeTestCases = [
        {
          initialAmount: -1000,
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: 10,
        },
        {
          initialAmount: 1000,
          monthlyContribution: -500,
          annualReturn: 7,
          timeHorizon: 10,
        },
        {
          initialAmount: 1000,
          monthlyContribution: 500,
          annualReturn: -7,
          timeHorizon: 10,
        },
        {
          initialAmount: 1000,
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: -10,
        },
      ]

      negativeTestCases.forEach((params) => {
        expect(validateScenarioParams(params)).toBe(false)
      })
    })

    it('should accept boundary values consistently', () => {
      const boundaryTestCases = [
        {
          initialAmount: 0,
          monthlyContribution: 0,
          annualReturn: 0,
          timeHorizon: 1,
        },
        {
          initialAmount: 10000000,
          monthlyContribution: 100000,
          annualReturn: 50,
          timeHorizon: 100,
        },
      ]

      boundaryTestCases.forEach((params) => {
        expect(validateScenarioParams(params)).toBe(true)
      })
    })
  })

  describe('Slug Format Consistency', () => {
    it('should always generate slugs in expected format', () => {
      const slugPattern =
        /^invest-\d+-monthly-\d+-\d+(\.\d+)?percent-\d+years-.+$/

      for (let i = 0; i < 50; i++) {
        const seed = i / 50
        const params = generateValidParams(seed)

        if (validateScenarioParams(params)) {
          const slug = generateScenarioSlug(params)
          expect(slug).toMatch(slugPattern)
        }
      }
    })

    it('should generate parseable slugs for all valid inputs', () => {
      for (let i = 0; i < 30; i++) {
        const seed = i / 30
        const params = generateValidParams(seed)

        if (validateScenarioParams(params)) {
          const slug = generateScenarioSlug(params)
          const parsed = parseSlugToScenario(slug)
          expect(parsed).not.toBeNull()
        }
      }
    })
  })

  describe('Mathematical Properties', () => {
    it('should maintain mathematical relationships after round-trip', () => {
      for (let i = 0; i < 20; i++) {
        const seed = i / 20
        const params = generateValidParams(seed)

        if (validateScenarioParams(params)) {
          const slug = generateScenarioSlug(params)
          const parsed = parseSlugToScenario(slug)

          if (parsed) {
            // Relationships that should be preserved
            if (params.initialAmount > params.monthlyContribution) {
              expect(parsed.initialAmount >= parsed.monthlyContribution).toBe(
                true
              )
            }

            // Time horizon should be positive
            expect(parsed.timeHorizon).toBeGreaterThan(0)

            // Annual return should be non-negative
            expect(parsed.annualReturn).toBeGreaterThanOrEqual(0)
          }
        }
      }
    })
  })
})
