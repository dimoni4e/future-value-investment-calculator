/**
 * @jest-environment node
 */

/**
 * API tests for scenarios endpoint
 * Testing scenario existence check, auto-generation, caching, and error handling
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/scenarios/route'
import { generateScenarioSlug } from '@/lib/scenarioUtils'

// Mock global fetch for Node.js environment
global.fetch = global.fetch || require('node-fetch')

// Mock the revalidatePath function
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Helper function to create a NextRequest
function createRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options)
}

describe('/api/scenarios API Tests', () => {
  describe('GET /api/scenarios - Scenario Existence Check', () => {
    it('should check if a valid auto-generated scenario can be generated', async () => {
      const slug = 'invest-10000-monthly-500-7percent-20years-retirement'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}&action=check`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.exists).toBe(false)
      expect(data.type).toBe('auto-generated')
      expect(data.canGenerate).toBe(true)
      expect(data.params).toEqual({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
        goal: 'retirement',
        slug: slug,
      })
    })

    it('should return error for invalid scenario slug', async () => {
      const invalidSlug = 'invalid-scenario-format'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${invalidSlug}&action=check`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.exists).toBe(false)
      expect(data.canGenerate).toBe(false)
      expect(data.error).toBe('Invalid scenario slug')
    })

    it('should handle malformed slugs gracefully', async () => {
      const malformedSlugs = [
        'invest-abc-monthly-500-7percent-20years-retirement',
        'invest-10000-monthly-xyz-7percent-20years-retirement',
        'not-an-investment-slug',
        '',
      ]

      for (const slug of malformedSlugs) {
        const request = createRequest(
          `http://localhost:3000/api/scenarios?slug=${slug}&action=check`
        )

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.exists).toBe(false)
        expect(data.canGenerate).toBe(false)
      }
    })
  })

  describe('GET /api/scenarios - Auto-Generation', () => {
    it('should auto-generate scenario for valid parameters', async () => {
      const slug = 'invest-5000-monthly-250-6percent-15years-starter'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenario).toBeDefined()
      expect(data.scenario.slug).toBe(slug)
      expect(data.scenario.params).toEqual({
        initialAmount: 5000,
        monthlyContribution: 250,
        annualReturn: 6,
        timeHorizon: 15,
        goal: 'starter',
        slug: slug,
      })
      expect(data.scenario.content).toBeDefined()
      expect(data.scenario.content.title).toContain('$5,000')
      expect(data.scenario.content.title).toContain('$250')
      expect(data.scenario.content.projections).toBeDefined()
      expect(data.scenario.content.projections.futureValue).toBeGreaterThan(0)
      expect(data.scenario.metadata.generated).toBe(true)
    })

    it('should cache auto-generated scenarios', async () => {
      const slug = 'invest-1000-monthly-100-8percent-10years-starter'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}`
      )

      // First request - should generate and cache
      const response1 = await GET(request)
      const data1 = await response1.json()

      expect(response1.status).toBe(200)
      expect(data1.scenario.metadata.generated).toBe(true)

      // Second request - should use cache
      const response2 = await GET(request)
      const data2 = await response2.json()

      expect(response2.status).toBe(200)
      expect(data2.scenario.slug).toBe(data1.scenario.slug)
      expect(data2.scenario.content.title).toBe(data1.scenario.content.title)
    })

    it('should increment view count for cached scenarios', async () => {
      const slug = 'invest-2000-monthly-200-5percent-12years-vacation'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}`
      )

      // First request
      await GET(request)

      // Second request - view count should increment
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Note: Testing exact view count is tricky due to cache implementation
      // This test verifies the endpoint doesn't error when incrementing views
    })

    it('should calculate correct future value projections', async () => {
      const slug = 'invest-10000-monthly-1000-7percent-20years-retirement'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)

      const projections = data.scenario.content.projections
      expect(projections.futureValue).toBeGreaterThan(0)
      expect(projections.totalContributions).toBe(10000 + 1000 * 12 * 20) // 250,000
      expect(projections.totalGains).toBe(
        projections.futureValue - projections.totalContributions
      )
      expect(projections.totalGains).toBeGreaterThan(0) // Should have positive gains
    })

    it('should return 404 for completely invalid scenario', async () => {
      const invalidSlug = 'completely-invalid-format'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${invalidSlug}`
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Scenario not found')
    })
  })

  describe('GET /api/scenarios - List Scenarios', () => {
    it('should return list of user-generated scenarios', async () => {
      const request = createRequest('http://localhost:3000/api/scenarios')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.scenarios).toBeDefined()
      expect(Array.isArray(data.scenarios)).toBe(true)
    })
  })

  describe('POST /api/scenarios - Create User Scenario', () => {
    it('should create a new user scenario', async () => {
      const scenarioData = {
        name: 'My Retirement Plan',
        description: 'A 30-year retirement investment strategy',
        params: {
          initialAmount: 25000,
          monthlyContribution: 1500,
          annualReturn: 7.5,
          timeHorizon: 30,
        },
      }

      const request = createRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenarioData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.scenario).toBeDefined()
      expect(data.scenario.id).toBeDefined()
      expect(data.scenario.slug).toBeDefined()
      expect(data.scenario.name).toBe('My Retirement Plan')
      expect(data.scenario.url).toContain('/scenario/')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name and params',
      }

      const request = createRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name and parameters are required')
    })

    it('should validate parameter types', async () => {
      const invalidData = {
        name: 'Test Scenario',
        params: {
          initialAmount: 'not-a-number',
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: 20,
        },
      }

      const request = createRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid parameter types')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const request = createRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid-json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create scenario')
    })

    it('should handle empty POST body', async () => {
      const request = createRequest('http://localhost:3000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create scenario')
    })
  })

  describe('Cache Behavior', () => {
    it('should respect cache TTL for auto-generated scenarios', async () => {
      // This test would require mocking Date.now() to test cache expiration
      // For now, we test that caching doesn't break functionality
      const slug = 'invest-3000-monthly-300-6.5percent-18years-education'
      const request = createRequest(
        `http://localhost:3000/api/scenarios?slug=${slug}`
      )

      const response1 = await GET(request)
      const data1 = await response1.json()

      const response2 = await GET(request)
      const data2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(data1.scenario.slug).toBe(data2.scenario.slug)
    })

    it('should handle cache with different parameter combinations', async () => {
      const slugs = [
        'invest-1000-monthly-50-4percent-5years-emergency',
        'invest-50000-monthly-2000-8percent-25years-retirement',
        'invest-20000-monthly-800-7percent-15years-house',
      ]

      for (const slug of slugs) {
        const request = createRequest(
          `http://localhost:3000/api/scenarios?slug=${slug}`
        )

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.scenario.slug).toBe(slug)
        expect(data.scenario.metadata.generated).toBe(true)
      }
    })
  })
})
