/**
 * Performance tests for scenarioUtils.ts
 * Testing speed and memory efficiency of slug generation and parsing
 */

import {
  generateScenarioSlug,
  parseSlugToScenario,
  detectInvestmentGoal,
  validateScenarioParams,
  CalculatorInputs,
} from '../lib/scenarioUtils'

// Performance test utilities
function measureExecutionTime(fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}

function generateTestParams(count: number): CalculatorInputs[] {
  const params: CalculatorInputs[] = []
  for (let i = 0; i < count; i++) {
    params.push({
      initialAmount: Math.floor(Math.random() * 100000),
      monthlyContribution: Math.floor(Math.random() * 5000),
      annualReturn: Math.random() * 15,
      timeHorizon: Math.floor(Math.random() * 40) + 1,
    })
  }
  return params
}

describe('scenarioUtils Performance Tests', () => {
  describe('Slug Generation Performance', () => {
    it('should generate 1000 slugs within reasonable time', () => {
      const testParams = generateTestParams(1000)

      const executionTime = measureExecutionTime(() => {
        testParams.forEach((params) => {
          generateScenarioSlug(params)
        })
      })

      // Should complete within 100ms for 1000 operations
      expect(executionTime).toBeLessThan(100)
      console.log(`Generated 1000 slugs in ${executionTime.toFixed(2)}ms`)
    })

    it('should maintain consistent performance across different input types', () => {
      const smallParams = {
        initialAmount: 100,
        monthlyContribution: 10,
        annualReturn: 5,
        timeHorizon: 5,
      }

      const largeParams = {
        initialAmount: 999999,
        monthlyContribution: 99999,
        annualReturn: 49.99,
        timeHorizon: 99,
      }

      const iterations = 1000

      const smallTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          generateScenarioSlug(smallParams)
        }
      })

      const largeTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          generateScenarioSlug(largeParams)
        }
      })

      // Performance should be similar regardless of input size
      const performanceRatio = largeTime / smallTime
      expect(performanceRatio).toBeLessThan(2) // No more than 2x slower

      console.log(
        `Small params: ${smallTime.toFixed(2)}ms, Large params: ${largeTime.toFixed(2)}ms`
      )
    })

    it('should handle batch processing efficiently', () => {
      const batchSizes = [100, 500, 1000, 2000]
      const timings: number[] = []

      batchSizes.forEach((size) => {
        const testParams = generateTestParams(size)

        const time = measureExecutionTime(() => {
          testParams.forEach((params) => {
            generateScenarioSlug(params)
          })
        })

        timings.push(time)
        console.log(`Batch size ${size}: ${time.toFixed(2)}ms`)
      })

      // Should scale linearly (not exponentially)
      for (let i = 1; i < timings.length; i++) {
        const prevTime = timings[i - 1]
        const currentTime = timings[i]
        const prevSize = batchSizes[i - 1]
        const currentSize = batchSizes[i]

        const expectedTime = (prevTime * currentSize) / prevSize
        const performanceRatio = currentTime / expectedTime

        // Should not be more than 50% slower than linear scaling
        expect(performanceRatio).toBeLessThan(1.5)
      }
    })
  })

  describe('Slug Parsing Performance', () => {
    it('should parse 1000 slugs within reasonable time', () => {
      // Generate test slugs first
      const testParams = generateTestParams(1000)
      const testSlugs = testParams.map((params) => generateScenarioSlug(params))

      const executionTime = measureExecutionTime(() => {
        testSlugs.forEach((slug) => {
          parseSlugToScenario(slug)
        })
      })

      // Should complete within 50ms for 1000 operations
      expect(executionTime).toBeLessThan(50)
      console.log(`Parsed 1000 slugs in ${executionTime.toFixed(2)}ms`)
    })

    it('should handle invalid slugs efficiently', () => {
      const invalidSlugs = [
        'invalid-format',
        'invest-abc-monthly-500-7percent-20years-retirement',
        'completely-wrong-format',
        'invest-10000-monthly-xyz-7percent-20years-retirement',
        '',
        'short',
      ]

      const iterations = 1000

      const executionTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          invalidSlugs.forEach((slug) => {
            parseSlugToScenario(slug)
          })
        }
      })

      // Should handle invalid slugs quickly
      expect(executionTime).toBeLessThan(100)
      console.log(
        `Processed ${iterations * invalidSlugs.length} invalid slugs in ${executionTime.toFixed(2)}ms`
      )
    })

    it('should maintain consistent parsing performance', () => {
      const shortSlug = 'invest-100-monthly-10-5percent-5years-starter'
      const longSlug =
        'invest-999999-monthly-99999-49.9percent-99years-wealth-building-complex-goal'

      const iterations = 1000

      const shortTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          parseSlugToScenario(shortSlug)
        }
      })

      const longTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          parseSlugToScenario(longSlug)
        }
      })

      // Performance should be similar
      const performanceRatio = longTime / shortTime
      expect(performanceRatio).toBeLessThan(2)

      console.log(
        `Short slug: ${shortTime.toFixed(2)}ms, Long slug: ${longTime.toFixed(2)}ms`
      )
    })
  })

  describe('Goal Detection Performance', () => {
    it('should detect goals for 1000 parameter sets quickly', () => {
      const testParams = generateTestParams(1000)

      const executionTime = measureExecutionTime(() => {
        testParams.forEach((params) => {
          detectInvestmentGoal(params)
        })
      })

      // Should complete within 50ms for 1000 operations
      expect(executionTime).toBeLessThan(50)
      console.log(`Detected 1000 goals in ${executionTime.toFixed(2)}ms`)
    })

    it('should maintain consistent goal detection performance', () => {
      const iterations = 2000

      const simpleParams = {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 7,
        timeHorizon: 10,
      }

      const complexParams = {
        initialAmount: 75000,
        monthlyContribution: 2500,
        annualReturn: 8.75,
        timeHorizon: 25,
      }

      const simpleTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          detectInvestmentGoal(simpleParams)
        }
      })

      const complexTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          detectInvestmentGoal(complexParams)
        }
      })

      // Performance should be consistent
      const performanceRatio = complexTime / simpleTime
      expect(performanceRatio).toBeLessThan(1.5)

      console.log(
        `Simple goal detection: ${simpleTime.toFixed(2)}ms, Complex: ${complexTime.toFixed(2)}ms`
      )
    })
  })

  describe('Validation Performance', () => {
    it('should validate 1000 parameter sets quickly', () => {
      const testParams = generateTestParams(1000)

      const executionTime = measureExecutionTime(() => {
        testParams.forEach((params) => {
          validateScenarioParams(params)
        })
      })

      // Should complete within 25ms for 1000 operations
      expect(executionTime).toBeLessThan(25)
      console.log(
        `Validated 1000 parameter sets in ${executionTime.toFixed(2)}ms`
      )
    })

    it('should handle edge cases efficiently', () => {
      const edgeCases = [
        {
          initialAmount: -1000,
          monthlyContribution: -500,
          annualReturn: -7,
          timeHorizon: -10,
        },
        {
          initialAmount: 99999999,
          monthlyContribution: 999999,
          annualReturn: 999,
          timeHorizon: 999,
        },
        {
          initialAmount: 0,
          monthlyContribution: 0,
          annualReturn: 0,
          timeHorizon: 0,
        },
      ]

      const iterations = 1000

      const executionTime = measureExecutionTime(() => {
        for (let i = 0; i < iterations; i++) {
          edgeCases.forEach((params) => {
            validateScenarioParams(params)
          })
        }
      })

      // Should handle edge cases quickly
      expect(executionTime).toBeLessThan(50)
      console.log(
        `Validated ${iterations * edgeCases.length} edge cases in ${executionTime.toFixed(2)}ms`
      )
    })
  })

  describe('Round-Trip Performance', () => {
    it('should perform 1000 complete round-trips efficiently', () => {
      const testParams = generateTestParams(1000)

      const executionTime = measureExecutionTime(() => {
        testParams.forEach((params) => {
          if (validateScenarioParams(params)) {
            const slug = generateScenarioSlug(params)
            const parsed = parseSlugToScenario(slug)
            if (parsed) {
              detectInvestmentGoal(parsed)
            }
          }
        })
      })

      // Complete round-trip should be under 200ms for 1000 operations
      expect(executionTime).toBeLessThan(200)
      console.log(`Completed 1000 round-trips in ${executionTime.toFixed(2)}ms`)
    })

    it('should maintain performance under heavy load', () => {
      const heavyLoadParams = generateTestParams(5000)

      const executionTime = measureExecutionTime(() => {
        heavyLoadParams.forEach((params) => {
          const slug = generateScenarioSlug(params)
          parseSlugToScenario(slug)
        })
      })

      // Should handle 5000 operations in under 500ms
      expect(executionTime).toBeLessThan(500)

      const avgTimePerOperation = executionTime / 5000
      expect(avgTimePerOperation).toBeLessThan(0.1) // Under 0.1ms per operation

      console.log(
        `Heavy load test: ${executionTime.toFixed(2)}ms for 5000 operations (${avgTimePerOperation.toFixed(4)}ms avg)`
      )
    })
  })

  describe('Memory Usage', () => {
    it('should not create excessive temporary objects', () => {
      const initialMemory = process.memoryUsage().heapUsed
      const testParams = generateTestParams(1000)

      // Perform operations
      testParams.forEach((params) => {
        const slug = generateScenarioSlug(params)
        parseSlugToScenario(slug)
        detectInvestmentGoal(params)
        validateScenarioParams(params)
      })

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB for 1000 operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB for 1000 operations`
      )
    })
  })
})
