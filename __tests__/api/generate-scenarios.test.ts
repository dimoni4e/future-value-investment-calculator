/**
 * Tests for API endpoint: /api/scenarios/generate
 * Tests scenario generation endpoint functionality, content quality, and database operations
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Mock Next.js Request and Response before importing
global.Request = class MockRequest {
  constructor(input: any, init?: any) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init?.method || 'GET'
    this.headers = new Map(Object.entries(init?.headers || {}))
    this._body = init?.body
  }

  url: string
  method: string
  headers: Map<string, string>
  _body: any

  async json() {
    return this._body ? JSON.parse(this._body) : {}
  }

  async text() {
    return this._body || ''
  }
}

global.Response = class MockResponse {
  constructor(body?: any, init?: any) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Map(Object.entries(init?.headers || {}))
  }

  body: any
  status: number
  statusText: string
  headers: Map<string, string>

  static json(data: any, init?: any) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
  }

  async json() {
    return JSON.parse(this.body)
  }

  async text() {
    return this.body
  }
}

import { POST, GET, PUT } from '../../../app/api/scenarios/generate/route'

// Mock the dependencies
jest.mock('@/lib/contentGenerator', () => ({
  generatePersonalizedContent: jest.fn(() => ({
    investment_overview: 'Mock investment overview content...',
    growth_projection: 'Mock growth projection content...',
    investment_insights: 'Mock investment insights content...',
    strategy_analysis: 'Mock strategy analysis content...',
    comparative_scenarios: 'Mock comparative scenarios content...',
    community_insights: 'Mock community insights content...',
    optimization_tips: 'Mock optimization tips content...',
    market_context: 'Mock market context content...',
  })),
}))

jest.mock('@/lib/scenarioUtils', () => ({
  generateScenarioSlug: jest.fn(
    () => 'invest-10000-monthly-500-7percent-10years-retirement'
  ),
  parseSlugToScenario: jest.fn((slug: string) => {
    if (slug === 'invest-10000-monthly-500-7percent-10years-retirement') {
      return {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
        slug: 'invest-10000-monthly-500-7percent-10years-retirement',
      }
    }
    return null
  }),
  validateScenarioParams: jest.fn(() => true),
  detectInvestmentGoal: jest.fn(() => 'retirement'),
}))

jest.mock('@/lib/user-scenarios', () => ({
  createUserScenario: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('API: /api/scenarios/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST - Generate new scenario content', () => {
    it('should generate scenario content successfully', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.scenario).toBeDefined()
      expect(data.scenario.slug).toBe(
        'invest-10000-monthly-500-7percent-10years-retirement'
      )
      expect(data.scenario.content).toBeDefined()
      expect(data.scenario.metadata).toBeDefined()
    })

    it('should calculate financial projections correctly', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenario.content.projections).toBeDefined()
      expect(data.scenario.content.projections.futureValue).toBeGreaterThan(0)
      expect(
        data.scenario.content.projections.totalContributions
      ).toBeGreaterThan(0)
      expect(data.scenario.content.projections.totalGains).toBeGreaterThan(0)
    })

    it('should auto-detect investment goal when not provided', async () => {
      const validParams = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 7,
        timeHorizon: 20,
        // goal not provided
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenario.content).toBeDefined()
    })

    it('should return error for missing parameters', async () => {
      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            locale: 'en',
            // params missing
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Parameters are required')
    })

    it('should return error for invalid parameters', async () => {
      // Mock validateScenarioParams to return false for this test
      const { validateScenarioParams } = require('@/lib/scenarioUtils')
      validateScenarioParams.mockReturnValueOnce(false)

      const invalidParams = {
        initialAmount: -1000, // invalid negative amount
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: invalidParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid parameter values')
    })

    it('should include comprehensive content sections', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenario.content.sections).toBeDefined()
      expect(data.scenario.content.sections.investment_overview).toBeDefined()
      expect(data.scenario.content.sections.growth_projection).toBeDefined()
      expect(data.scenario.content.sections.investment_insights).toBeDefined()
      expect(data.scenario.content.sections.strategy_analysis).toBeDefined()
      expect(data.scenario.content.sections.comparative_scenarios).toBeDefined()
      expect(data.scenario.content.sections.community_insights).toBeDefined()
      expect(data.scenario.content.sections.optimization_tips).toBeDefined()
      expect(data.scenario.content.sections.market_context).toBeDefined()
    })

    it('should include SEO metadata', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenario.content.seo).toBeDefined()
      expect(data.scenario.content.seo.title).toBeDefined()
      expect(data.scenario.content.seo.description).toBeDefined()
      expect(data.scenario.content.seo.keywords).toBeDefined()
      expect(data.scenario.content.seo.title.length).toBeLessThanOrEqual(60)
      expect(data.scenario.content.seo.description.length).toBeLessThanOrEqual(
        160
      )
    })
  })

  describe('GET - Retrieve generated scenario', () => {
    it('should return existing scenario if found', async () => {
      // First generate a scenario
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const postRequest = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      await POST(postRequest)

      // Now retrieve it
      const getRequest = new NextRequest(
        'http://localhost/api/scenarios/generate?slug=invest-10000-monthly-500-7percent-10years-retirement&locale=en'
      )

      const response = await GET(getRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.exists).toBe(true)
      expect(data.scenario).toBeDefined()
      expect(data.scenario.metadata.views).toBeGreaterThan(0)
    })

    it('should generate scenario on-demand for valid slug', async () => {
      const getRequest = new NextRequest(
        'http://localhost/api/scenarios/generate?slug=invest-10000-monthly-500-7percent-10years-retirement&locale=en'
      )

      const response = await GET(getRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.exists).toBe(false)
      expect(data.generated).toBe(true)
      expect(data.scenario).toBeDefined()
    })

    it('should return error for invalid slug', async () => {
      // Mock parseSlugToScenario to return null for invalid slug
      const { parseSlugToScenario } = require('@/lib/scenarioUtils')
      parseSlugToScenario.mockReturnValueOnce(null)

      const getRequest = new NextRequest(
        'http://localhost/api/scenarios/generate?slug=invalid-slug&locale=en'
      )

      const response = await GET(getRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid scenario slug')
    })

    it('should return error for missing slug', async () => {
      const getRequest = new NextRequest(
        'http://localhost/api/scenarios/generate?locale=en'
      )

      const response = await GET(getRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Scenario slug is required')
    })
  })

  describe('PUT - Update scenario metadata', () => {
    it('should update view count successfully', async () => {
      // First generate a scenario
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const postRequest = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      await POST(postRequest)

      // Now update view count
      const putRequest = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'PUT',
          body: JSON.stringify({
            slug: 'invest-10000-monthly-500-7percent-10years-retirement',
          }),
        }
      )

      const response = await PUT(putRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.views).toBeGreaterThan(1)
    })

    it('should return error for non-existent scenario', async () => {
      const putRequest = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'PUT',
          body: JSON.stringify({
            slug: 'non-existent-scenario',
          }),
        }
      )

      const response = await PUT(putRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Scenario not found')
    })

    it('should return error for missing slug', async () => {
      const putRequest = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'PUT',
          body: JSON.stringify({}),
        }
      )

      const response = await PUT(putRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Scenario slug is required')
    })
  })

  describe('Content Quality and Completeness', () => {
    it('should generate content with required word count', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)

      const sections = data.scenario.content.sections

      // Each section should have substantial content
      Object.values(sections).forEach((content: any) => {
        expect(typeof content).toBe('string')
        expect(content.length).toBeGreaterThan(10) // Minimum content check
      })
    })

    it('should include accurate financial calculations', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)

      const projections = data.scenario.content.projections

      // Verify basic financial math
      expect(projections.totalContributions).toBe(
        validParams.initialAmount +
          validParams.monthlyContribution * 12 * validParams.timeHorizon
      )
      expect(projections.totalGains).toBe(
        projections.futureValue - projections.totalContributions
      )
      expect(projections.futureValue).toBeGreaterThan(
        projections.totalContributions
      )
    })
  })

  describe('Caching and Performance', () => {
    it('should cache generated scenarios', async () => {
      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      // Generate scenario first time
      const request1 = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      // Retrieve scenario second time (should hit cache)
      const request2 = new NextRequest(
        'http://localhost/api/scenarios/generate?slug=invest-10000-monthly-500-7percent-10years-retirement&locale=en'
      )

      const response2 = await GET(request2)
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.exists).toBe(true) // Should exist from previous generation
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: 'invalid json',
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(500)
    })

    it('should handle network errors gracefully', async () => {
      // Mock an error in content generation
      const { generatePersonalizedContent } = require('@/lib/contentGenerator')
      generatePersonalizedContent.mockImplementationOnce(() => {
        throw new Error('Content generation failed')
      })

      const validParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        goal: 'retirement',
      }

      const request = new NextRequest(
        'http://localhost/api/scenarios/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            params: validParams,
            locale: 'en',
          }),
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
})
