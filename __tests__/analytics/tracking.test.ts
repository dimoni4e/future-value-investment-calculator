/**
 * Task 6.3: Analytics & Monitoring - Tracking Tests
 * Tests for event tracking accuracy and completeness
 */

import { analytics, AnalyticsManager } from '@/lib/analytics'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Task 6.3: Analytics Tracking', () => {
  let analyticsManager: AnalyticsManager

  beforeEach(() => {
    analyticsManager = new AnalyticsManager()
    jest.clearAllMocks()

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
    })
  })

  describe('Scenario Generation Tracking', () => {
    it('should track scenario generation with correct event structure', async () => {
      const event = {
        scenarioSlug: 'invest-10000-monthly-500-7percent-20years-retirement',
        parameters: {
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: 20,
        },
        goal: 'retirement',
        locale: 'en',
        source: 'calculator' as const,
        generationTime: 150,
        cached: false,
      }

      await analyticsManager.trackScenarioGeneration(event)

      const storedEvents = analyticsManager.getStoredEvents()
      expect(storedEvents).toHaveLength(1)

      const trackedEvent = storedEvents[0]
      expect(trackedEvent.event).toBe('scenario_generation')
      expect(trackedEvent.properties).toMatchObject({
        scenarioSlug: event.scenarioSlug,
        parameters: event.parameters,
        goal: event.goal,
        locale: event.locale,
        source: event.source,
        category: 'scenario',
        performance: {
          generationTime: event.generationTime,
          cached: event.cached,
        },
      })
      expect(trackedEvent.timestamp).toBeInstanceOf(Date)
      expect(trackedEvent.sessionId).toBeDefined()
    })

    it('should track cached vs non-cached generation performance', async () => {
      const baseEvent = {
        scenarioSlug: 'test-scenario',
        parameters: {
          initialAmount: 5000,
          monthlyContribution: 200,
          annualReturn: 6,
          timeHorizon: 15,
        },
        goal: 'house',
        locale: 'en',
        source: 'calculator' as const,
      }

      // Track non-cached generation
      await analyticsManager.trackScenarioGeneration({
        ...baseEvent,
        generationTime: 300,
        cached: false,
      })

      // Track cached generation
      await analyticsManager.trackScenarioGeneration({
        ...baseEvent,
        generationTime: 50,
        cached: true,
      })

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(2)

      const nonCachedEvent = events[0]
      const cachedEvent = events[1]

      expect(nonCachedEvent.properties.performance.cached).toBe(false)
      expect(nonCachedEvent.properties.performance.generationTime).toBe(300)

      expect(cachedEvent.properties.performance.cached).toBe(true)
      expect(cachedEvent.properties.performance.generationTime).toBe(50)
    })
  })

  describe('Parameter Usage Tracking', () => {
    it('should categorize parameters correctly', async () => {
      const parameters = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 8,
        timeHorizon: 25,
      }

      await analyticsManager.trackParameterUsage(parameters, 'retirement', 'en')

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      expect(event.properties).toMatchObject({
        initialAmountRange: '25K-50K',
        monthlyContributionRange: '1K-2K',
        timeHorizonRange: '21-25 years',
        annualReturnRange: '8-10%',
        goal: 'retirement',
        locale: 'en',
        category: 'parameters',
      })
    })

    it('should handle edge case parameter values', async () => {
      const testCases = [
        {
          parameters: {
            initialAmount: 0,
            monthlyContribution: 50,
            annualReturn: 2,
            timeHorizon: 1,
          },
          expected: {
            initialAmountRange: '0-1K',
            monthlyContributionRange: '0-100',
            annualReturnRange: '0-4%',
            timeHorizonRange: '1-5 years',
          },
        },
        {
          parameters: {
            initialAmount: 150000,
            monthlyContribution: 8000,
            annualReturn: 15,
            timeHorizon: 40,
          },
          expected: {
            initialAmountRange: '100K+',
            monthlyContributionRange: '5K+',
            annualReturnRange: '12%+',
            timeHorizonRange: '30+ years',
          },
        },
      ]

      for (const testCase of testCases) {
        analyticsManager.flushEvents() // Clear previous events
        await analyticsManager.trackParameterUsage(
          testCase.parameters,
          'test',
          'en'
        )

        const events = analyticsManager.getStoredEvents()
        expect(events).toHaveLength(1)
        expect(events[0].properties).toMatchObject(testCase.expected)
      }
    })
  })

  describe('User Engagement Tracking', () => {
    it('should track content section interactions', async () => {
      const engagementEvents = [
        {
          contentSection: 'investment_overview',
          action: 'view' as const,
          scenarioSlug: 'test-scenario',
          locale: 'en',
        },
        {
          contentSection: 'growth_projection',
          action: 'click' as const,
          value: 1,
          scenarioSlug: 'test-scenario',
          locale: 'en',
        },
        {
          contentSection: 'optimization_tips',
          action: 'time-spent' as const,
          value: 45000, // 45 seconds
          scenarioSlug: 'test-scenario',
          locale: 'en',
        },
      ]

      for (const event of engagementEvents) {
        await analyticsManager.trackUserEngagement(event)
      }

      const storedEvents = analyticsManager.getStoredEvents()
      expect(storedEvents).toHaveLength(3)

      storedEvents.forEach((storedEvent, index) => {
        expect(storedEvent.event).toBe('user_engagement')
        expect(storedEvent.properties).toMatchObject({
          ...engagementEvents[index],
          category: 'engagement',
        })
      })
    })

    it('should track scroll behavior on content sections', async () => {
      await analyticsManager.trackUserEngagement({
        contentSection: 'comparative_analysis',
        action: 'scroll',
        value: 75, // 75% scrolled
        scenarioSlug: 'compare-scenario',
        locale: 'es',
      })

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)
      expect(events[0].properties.action).toBe('scroll')
      expect(events[0].properties.value).toBe(75)
    })
  })

  describe('SEO Performance Tracking', () => {
    it('should track SEO metrics with correct structure', async () => {
      const seoMetrics = {
        pageViews: 1250,
        organicTraffic: 800,
        averageSessionDuration: 180000, // 3 minutes
        bounceRate: 0.35,
        rankingKeywords: ['invest 10000', 'retirement calculator', '7% return'],
        backlinks: 15,
        coreWebVitals: {
          lcp: 1200,
          fid: 50,
          cls: 0.05,
        },
      }

      await analyticsManager.trackSEOMetrics(
        seoMetrics,
        '/scenario/test-scenario'
      )

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      expect(event.event).toBe('seo_performance')
      expect(event.properties).toMatchObject({
        ...seoMetrics,
        page: '/scenario/test-scenario',
        category: 'seo',
      })
    })
  })

  describe('Performance Metrics Tracking', () => {
    it('should track Core Web Vitals and performance metrics', async () => {
      const performanceMetrics = {
        pageLoadTime: 1500,
        timeToInteractive: 2000,
        totalBlockingTime: 150,
        cumulativeLayoutShift: 0.05,
        largestContentfulPaint: 1200,
        firstInputDelay: 50,
      }

      await analyticsManager.trackPerformanceMetrics(
        performanceMetrics,
        '/scenario/performance-test'
      )

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      expect(event.event).toBe('performance_metrics')
      expect(event.properties).toMatchObject({
        ...performanceMetrics,
        page: '/scenario/performance-test',
        category: 'performance',
      })
    })
  })

  describe('Data Collection and Formatting', () => {
    it('should maintain consistent session IDs across events', async () => {
      // Mock sessionStorage to return consistent session ID
      ;(window.sessionStorage.getItem as jest.Mock).mockReturnValue(
        'test-session-123'
      )

      await analyticsManager.trackScenarioGeneration({
        scenarioSlug: 'test',
        parameters: {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 5,
          timeHorizon: 10,
        },
        goal: 'test',
        locale: 'en',
        source: 'calculator',
        generationTime: 100,
        cached: false,
      })

      await analyticsManager.trackUserEngagement({
        contentSection: 'test',
        action: 'view',
        locale: 'en',
      })

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(2)
      expect(events[0].sessionId).toBe('test-session-123')
      expect(events[1].sessionId).toBe('test-session-123')
    })

    it('should include timestamp in all events', async () => {
      const beforeTime = new Date()

      await analyticsManager.trackParameterUsage(
        {
          initialAmount: 5000,
          monthlyContribution: 200,
          annualReturn: 6,
          timeHorizon: 15,
        },
        'house',
        'pl'
      )

      const afterTime = new Date()
      const events = analyticsManager.getStoredEvents()

      expect(events).toHaveLength(1)
      expect(events[0].timestamp).toBeInstanceOf(Date)
      expect(events[0].timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      )
      expect(events[0].timestamp.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      )
    })
  })

  describe('Privacy Compliance', () => {
    it('should not include personally identifiable information', async () => {
      await analyticsManager.trackScenarioGeneration({
        scenarioSlug: 'privacy-test',
        parameters: {
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: 20,
        },
        goal: 'retirement',
        locale: 'en',
        source: 'calculator',
        generationTime: 120,
        cached: false,
      })

      const events = analyticsManager.getStoredEvents()
      const event = events[0]

      // Should not contain any PII
      expect(event.userId).toBeUndefined()
      expect(JSON.stringify(event)).not.toMatch(/email|name|phone|address/i)
    })

    it('should generate anonymous session IDs', async () => {
      ;(window.sessionStorage.getItem as jest.Mock).mockReturnValue(null)

      const manager = new AnalyticsManager()
      await manager.trackParameterUsage(
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 5,
          timeHorizon: 10,
        },
        'test',
        'en'
      )

      const events = manager.getStoredEvents()
      expect(events[0].sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })
  })

  describe('Error Handling and Fallbacks', () => {
    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to reject
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      // Mock localStorage for fallback
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Create a new analytics manager instance for production mode
      const { AnalyticsManager } = require('../../lib/analytics')
      const prodAnalyticsManager = new AnalyticsManager({ isProduction: true })

      await prodAnalyticsManager.trackParameterUsage(
        {
          initialAmount: 5000,
          monthlyContribution: 200,
          annualReturn: 6,
          timeHorizon: 15,
        },
        'house',
        'en'
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Analytics tracking error:',
        expect.any(Error)
      )
      expect(localStorageMock.setItem).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw
      const localStorageMock = {
        getItem: jest.fn().mockImplementation(() => {
          throw new Error('LocalStorage error')
        }),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('LocalStorage error')
        }),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Should not throw even if localStorage fails
      await expect(
        analyticsManager.trackUserEngagement({
          contentSection: 'test',
          action: 'view',
          locale: 'en',
        })
      ).resolves.not.toThrow()

      consoleErrorSpy.mockRestore()
    })
  })
})
