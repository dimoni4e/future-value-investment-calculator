/**
 * Database integration tests for scenarios
 * Testing scenario creation, retrieval, duplicate handling, and data integrity
 */

import {
  generateScenarioSlug,
  parseSlugToScenario,
  validateScenarioParams,
  CalculatorInputs,
} from '@/lib/scenarioUtils'

// Mock database operations for testing
interface MockScenario {
  id: string
  slug: string
  params: CalculatorInputs
  content: any
  metadata: {
    generated: boolean
    createdAt: string
    lastAccessed: string
  }
  views: number
}

class MockDatabase {
  private scenarios: Map<string, MockScenario> = new Map()
  private autoIncrement = 1

  async create(scenario: Omit<MockScenario, 'id'>): Promise<MockScenario> {
    const id = `scenario_${this.autoIncrement++}`
    const newScenario = { ...scenario, id }
    this.scenarios.set(scenario.slug, newScenario)
    return newScenario
  }

  async findBySlug(slug: string): Promise<MockScenario | null> {
    return this.scenarios.get(slug) || null
  }

  async update(
    slug: string,
    updates: Partial<MockScenario>
  ): Promise<MockScenario | null> {
    const existing = this.scenarios.get(slug)
    if (!existing) return null

    const updated = { ...existing, ...updates }
    this.scenarios.set(slug, updated)
    return updated
  }

  async delete(slug: string): Promise<boolean> {
    return this.scenarios.delete(slug)
  }

  async list(limit = 20): Promise<MockScenario[]> {
    return Array.from(this.scenarios.values())
      .sort(
        (a, b) =>
          new Date(b.metadata.createdAt).getTime() -
          new Date(a.metadata.createdAt).getTime()
      )
      .slice(0, limit)
  }

  async clear(): Promise<void> {
    this.scenarios.clear()
    this.autoIncrement = 1
  }

  get size(): number {
    return this.scenarios.size
  }
}

describe('Database Integration Tests for Scenarios', () => {
  let mockDb: MockDatabase

  beforeEach(() => {
    mockDb = new MockDatabase()
  })

  afterEach(async () => {
    await mockDb.clear()
  })

  describe('Scenario Creation and Retrieval', () => {
    it('should create and retrieve a scenario', async () => {
      const params: CalculatorInputs = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
      }

      const slug = generateScenarioSlug(params)
      const scenario = {
        slug,
        params,
        content: {
          title: 'Test Investment Plan',
          description: 'A test scenario',
          projections: {
            futureValue: 100000,
            totalContributions: 50000,
            totalGains: 50000,
          },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      }

      const created = await mockDb.create(scenario)
      expect(created.id).toBeDefined()
      expect(created.slug).toBe(slug)

      const retrieved = await mockDb.findBySlug(slug)
      expect(retrieved).not.toBeNull()
      expect(retrieved!.slug).toBe(slug)
      expect(retrieved!.params).toEqual(params)
    })

    it('should handle scenario not found', async () => {
      const nonExistentSlug =
        'invest-99999-monthly-9999-99percent-99years-nonexistent'
      const result = await mockDb.findBySlug(nonExistentSlug)
      expect(result).toBeNull()
    })

    it('should create multiple unique scenarios', async () => {
      const scenarios = [
        {
          initialAmount: 5000,
          monthlyContribution: 250,
          annualReturn: 6,
          timeHorizon: 15,
        },
        {
          initialAmount: 15000,
          monthlyContribution: 750,
          annualReturn: 8,
          timeHorizon: 25,
        },
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 5,
          timeHorizon: 10,
        },
      ]

      for (const params of scenarios) {
        const slug = generateScenarioSlug(params)
        await mockDb.create({
          slug,
          params,
          content: { title: `Plan for ${params.initialAmount}` },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
          },
          views: 0,
        })
      }

      expect(mockDb.size).toBe(3)

      // Verify each scenario can be retrieved
      for (const params of scenarios) {
        const slug = generateScenarioSlug(params)
        const retrieved = await mockDb.findBySlug(slug)
        expect(retrieved).not.toBeNull()
        expect(retrieved!.params).toEqual(params)
      }
    })
  })

  describe('Duplicate Scenario Handling', () => {
    it('should overwrite scenario with same slug', async () => {
      const params: CalculatorInputs = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
      }

      const slug = generateScenarioSlug(params)

      // Create first scenario
      const scenario1 = {
        slug,
        params,
        content: { title: 'First Version' },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 5,
      }

      await mockDb.create(scenario1)

      // Create second scenario with same slug
      const scenario2 = {
        slug,
        params,
        content: { title: 'Second Version' },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      }

      await mockDb.create(scenario2)

      expect(mockDb.size).toBe(1) // Only one scenario should exist

      const retrieved = await mockDb.findBySlug(slug)
      expect(retrieved!.content.title).toBe('Second Version')
    })

    it('should handle parameters that generate the same slug', async () => {
      // These should generate the same slug due to rounding
      const params1: CalculatorInputs = {
        initialAmount: 10000.2,
        monthlyContribution: 500.2,
        annualReturn: 7.02,
        timeHorizon: 20.2,
      }

      const params2: CalculatorInputs = {
        initialAmount: 10000.4,
        monthlyContribution: 500.3,
        annualReturn: 7.04,
        timeHorizon: 19.8,
      }

      const slug1 = generateScenarioSlug(params1)
      const slug2 = generateScenarioSlug(params2)

      expect(slug1).toBe(slug2) // Should be the same due to rounding

      await mockDb.create({
        slug: slug1,
        params: params1,
        content: { title: 'First Scenario' },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      })

      await mockDb.create({
        slug: slug2,
        params: params2,
        content: { title: 'Second Scenario' },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      })

      expect(mockDb.size).toBe(1)
    })
  })

  describe('Data Integrity and Constraints', () => {
    it('should validate scenario parameters before storage', async () => {
      const validParams: CalculatorInputs = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
      }

      const invalidParams = [
        { ...validParams, initialAmount: -1000 },
        { ...validParams, monthlyContribution: -100 },
        { ...validParams, annualReturn: -5 },
        { ...validParams, timeHorizon: 0 },
        { ...validParams, initialAmount: 20000000 }, // Too high
      ]

      // Valid params should work
      expect(validateScenarioParams(validParams)).toBe(true)

      // Invalid params should fail validation
      for (const params of invalidParams) {
        expect(validateScenarioParams(params)).toBe(false)
      }
    })

    it('should maintain data integrity for scenario content', async () => {
      const params: CalculatorInputs = {
        initialAmount: 15000,
        monthlyContribution: 800,
        annualReturn: 6.5,
        timeHorizon: 18,
      }

      const slug = generateScenarioSlug(params)

      // Test round-trip integrity
      const parsedParams = parseSlugToScenario(slug)
      expect(parsedParams).not.toBeNull()
      expect(parsedParams!.initialAmount).toBe(15000)
      expect(parsedParams!.monthlyContribution).toBe(800)
      expect(parsedParams!.timeHorizon).toBe(18)
      expect(Math.abs(parsedParams!.annualReturn - 6.5)).toBeLessThan(0.1)

      const scenario = {
        slug,
        params,
        content: {
          title: 'Investment Plan',
          projections: {
            futureValue: 50000,
            totalContributions: 15000 + 800 * 12 * 18,
            totalGains: 0,
          },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      }

      // Calculate total gains
      scenario.content.projections.totalGains =
        scenario.content.projections.futureValue -
        scenario.content.projections.totalContributions

      const created = await mockDb.create(scenario)
      const retrieved = await mockDb.findBySlug(slug)

      expect(retrieved!.content.projections.totalGains).toBe(
        retrieved!.content.projections.futureValue -
          retrieved!.content.projections.totalContributions
      )
    })

    it('should handle edge case parameter values', async () => {
      const edgeCases = [
        {
          initialAmount: 0,
          monthlyContribution: 1,
          annualReturn: 0.1,
          timeHorizon: 1,
        },
        {
          initialAmount: 1000000,
          monthlyContribution: 10000,
          annualReturn: 15,
          timeHorizon: 50,
        },
        {
          initialAmount: 100,
          monthlyContribution: 0,
          annualReturn: 12.5,
          timeHorizon: 5,
        },
      ]

      for (const params of edgeCases) {
        if (validateScenarioParams(params)) {
          const slug = generateScenarioSlug(params)
          const scenario = {
            slug,
            params,
            content: { title: `Edge case: ${params.initialAmount}` },
            metadata: {
              generated: true,
              createdAt: new Date().toISOString(),
              lastAccessed: new Date().toISOString(),
            },
            views: 0,
          }

          const created = await mockDb.create(scenario)
          expect(created.slug).toBe(slug)

          const retrieved = await mockDb.findBySlug(slug)
          expect(retrieved).not.toBeNull()
          expect(retrieved!.params).toEqual(params)
        }
      }
    })
  })

  describe('Scenario Updates and Views', () => {
    it('should update scenario view count', async () => {
      const params: CalculatorInputs = {
        initialAmount: 5000,
        monthlyContribution: 200,
        annualReturn: 6,
        timeHorizon: 12,
      }

      const slug = generateScenarioSlug(params)
      const scenario = {
        slug,
        params,
        content: { title: 'View Count Test' },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        },
        views: 0,
      }

      await mockDb.create(scenario)

      // Simulate multiple views
      for (let i = 1; i <= 5; i++) {
        const updated = await mockDb.update(slug, {
          views: i,
          metadata: {
            ...scenario.metadata,
            lastAccessed: new Date().toISOString(),
          },
        })
        expect(updated!.views).toBe(i)
      }

      const final = await mockDb.findBySlug(slug)
      expect(final!.views).toBe(5)
    })

    it('should update last accessed timestamp', async () => {
      const params: CalculatorInputs = {
        initialAmount: 8000,
        monthlyContribution: 400,
        annualReturn: 7.5,
        timeHorizon: 15,
      }

      const slug = generateScenarioSlug(params)
      const initialTime = new Date().toISOString()

      const scenario = {
        slug,
        params,
        content: { title: 'Timestamp Test' },
        metadata: {
          generated: true,
          createdAt: initialTime,
          lastAccessed: initialTime,
        },
        views: 0,
      }

      await mockDb.create(scenario)

      // Wait a moment and update
      await new Promise((resolve) => setTimeout(resolve, 10))
      const newTime = new Date().toISOString()

      await mockDb.update(slug, {
        metadata: {
          ...scenario.metadata,
          lastAccessed: newTime,
        },
      })

      const updated = await mockDb.findBySlug(slug)
      expect(updated!.metadata.lastAccessed).toBe(newTime)
      expect(updated!.metadata.createdAt).toBe(initialTime)
    })
  })

  describe('Scenario Listing and Sorting', () => {
    it('should list scenarios sorted by creation date', async () => {
      const scenarios = []

      // Create scenarios with different timestamps
      for (let i = 0; i < 5; i++) {
        const params: CalculatorInputs = {
          initialAmount: 1000 * (i + 1),
          monthlyContribution: 100 * (i + 1),
          annualReturn: 5 + i,
          timeHorizon: 10 + i,
        }

        const slug = generateScenarioSlug(params)
        const timestamp = new Date(Date.now() + i * 1000).toISOString()

        const scenario = {
          slug,
          params,
          content: { title: `Scenario ${i + 1}` },
          metadata: {
            generated: true,
            createdAt: timestamp,
            lastAccessed: timestamp,
          },
          views: 0,
        }

        scenarios.push(scenario)
        await mockDb.create(scenario)

        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 1))
      }

      const listed = await mockDb.list()
      expect(listed.length).toBe(5)

      // Should be sorted by creation date (newest first)
      for (let i = 0; i < listed.length - 1; i++) {
        const current = new Date(listed[i].metadata.createdAt)
        const next = new Date(listed[i + 1].metadata.createdAt)
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
      }
    })

    it('should respect list limit', async () => {
      // Create more scenarios than the default limit
      for (let i = 0; i < 25; i++) {
        const params: CalculatorInputs = {
          initialAmount: 1000 + i * 100,
          monthlyContribution: 100 + i * 10,
          annualReturn: 5 + (i % 10),
          timeHorizon: 10 + (i % 20),
        }

        const slug = generateScenarioSlug(params)
        await mockDb.create({
          slug,
          params,
          content: { title: `Scenario ${i + 1}` },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
          },
          views: 0,
        })
      }

      expect(mockDb.size).toBe(25)

      const defaultList = await mockDb.list() // Default limit is 20
      expect(defaultList.length).toBe(20)

      const limitedList = await mockDb.list(10)
      expect(limitedList.length).toBe(10)

      const unlimitedList = await mockDb.list(100)
      expect(unlimitedList.length).toBe(25)
    })
  })
})
