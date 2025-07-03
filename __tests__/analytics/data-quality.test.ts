/**
 * Task 6.3: Analytics & Monitoring - Data Quality Tests
 * Tests for analytics data accuracy and consistency
 */

import { analytics, AnalyticsManager } from '@/lib/analytics'

// Mock fetch
global.fetch = jest.fn()

describe('Task 6.3: Analytics Data Quality', () => {
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

  describe('Data Accuracy and Consistency', () => {
    it('should maintain data integrity across multiple tracking events', async () => {
      const baseParameters = {
        initialAmount: 15000,
        monthlyContribution: 750,
        annualReturn: 8.5,
        timeHorizon: 22,
      }

      // Track multiple related events for the same scenario
      await analyticsManager.trackScenarioGeneration({
        scenarioSlug: 'integrity-test-scenario',
        parameters: baseParameters,
        goal: 'retirement',
        locale: 'en',
        source: 'calculator',
        generationTime: 180,
        cached: false,
      })

      await analyticsManager.trackParameterUsage(
        baseParameters,
        'retirement',
        'en'
      )

      await analyticsManager.trackUserEngagement({
        contentSection: 'investment_overview',
        action: 'view',
        scenarioSlug: 'integrity-test-scenario',
        locale: 'en',
      })

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(3)

      // Verify data consistency across events
      const scenarioEvent = events.find(
        (e) => e.event === 'scenario_generation'
      )
      const parameterEvent = events.find((e) => e.event === 'parameter_usage')
      const engagementEvent = events.find((e) => e.event === 'user_engagement')

      expect(scenarioEvent?.properties.parameters).toEqual(baseParameters)
      expect(parameterEvent?.properties.initialAmountRange).toBe('10K-25K')
      expect(engagementEvent?.properties.scenarioSlug).toBe(
        'integrity-test-scenario'
      )

      // All events should have the same session ID
      const sessionIds = events.map((e) => e.sessionId)
      expect(new Set(sessionIds).size).toBe(1)
    })

    it('should validate parameter categorization accuracy', async () => {
      const testCases = [
        {
          input: {
            initialAmount: 999,
            monthlyContribution: 99,
            annualReturn: 3.9,
            timeHorizon: 5,
          },
          expected: {
            initialAmountRange: '0-1K',
            monthlyContributionRange: '0-100',
            annualReturnRange: '0-4%',
            timeHorizonRange: '1-5 years',
          },
        },
        {
          input: {
            initialAmount: 1000,
            monthlyContribution: 100,
            annualReturn: 4,
            timeHorizon: 6,
          },
          expected: {
            initialAmountRange: '1K-5K',
            monthlyContributionRange: '100-250',
            annualReturnRange: '4-6%',
            timeHorizonRange: '6-10 years',
          },
        },
        {
          input: {
            initialAmount: 50000,
            monthlyContribution: 2500,
            annualReturn: 10,
            timeHorizon: 30,
          },
          expected: {
            initialAmountRange: '25K-50K',
            monthlyContributionRange: '2K-5K',
            annualReturnRange: '8-10%',
            timeHorizonRange: '26-30 years',
          },
        },
        {
          input: {
            initialAmount: 100000,
            monthlyContribution: 5000,
            annualReturn: 12,
            timeHorizon: 31,
          },
          expected: {
            initialAmountRange: '50K-100K',
            monthlyContributionRange: '5K+',
            annualReturnRange: '10-12%',
            timeHorizonRange: '30+ years',
          },
        },
      ]

      for (const testCase of testCases) {
        analyticsManager.flushEvents()
        await analyticsManager.trackParameterUsage(
          testCase.input,
          'test-goal',
          'en'
        )

        const events = analyticsManager.getStoredEvents()
        expect(events).toHaveLength(1)

        const event = events[0]
        Object.entries(testCase.expected).forEach(([key, expectedValue]) => {
          expect(event.properties[key]).toBe(expectedValue)
        })
      }
    })

    it('should handle edge cases in parameter values', async () => {
      const edgeCases = [
        {
          name: 'zero values',
          parameters: {
            initialAmount: 0,
            monthlyContribution: 0,
            annualReturn: 0,
            timeHorizon: 1,
          },
        },
        {
          name: 'decimal values',
          parameters: {
            initialAmount: 1234.56,
            monthlyContribution: 123.45,
            annualReturn: 7.25,
            timeHorizon: 15,
          },
        },
        {
          name: 'very large values',
          parameters: {
            initialAmount: 1000000,
            monthlyContribution: 50000,
            annualReturn: 25,
            timeHorizon: 50,
          },
        },
      ]

      for (const edgeCase of edgeCases) {
        analyticsManager.flushEvents()
        await analyticsManager.trackParameterUsage(
          edgeCase.parameters,
          'edge-case-test',
          'en'
        )

        const events = analyticsManager.getStoredEvents()
        expect(events).toHaveLength(1)

        const event = events[0]
        // Should not throw errors and should categorize appropriately
        expect(event.properties.initialAmountRange).toBeDefined()
        expect(event.properties.monthlyContributionRange).toBeDefined()
        expect(event.properties.annualReturnRange).toBeDefined()
        expect(event.properties.timeHorizonRange).toBeDefined()
      }
    })
  })

  describe('Data Retention and Cleanup Processes', () => {
    it('should limit local storage to prevent memory bloat', async () => {
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      // Mock fetch to fail so events go to localStorage
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Track 150 events (should exceed the 100 event limit)
      for (let i = 0; i < 150; i++) {
        await analyticsManager.trackUserEngagement({
          contentSection: `test-section-${i}`,
          action: 'view',
          locale: 'en',
        })
      }

      // Verify localStorage.setItem was called for each event
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(150)

      // The last call should contain only 100 events (cleanup occurred)
      const lastCall = localStorageMock.setItem.mock.calls[149]
      const storedEvents = JSON.parse(lastCall[1])
      expect(storedEvents.length).toBeLessThanOrEqual(100)

      consoleSpy.mockRestore()
    })

    it('should handle localStorage quota exceeded errors', async () => {
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('QuotaExceededError')
        }),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Should not throw even if localStorage fails
      await expect(
        analyticsManager.trackParameterUsage(
          {
            initialAmount: 10000,
            monthlyContribution: 500,
            annualReturn: 7,
            timeHorizon: 20,
          },
          'storage-test',
          'en'
        )
      ).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error storing analytics event locally:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Analytics Dashboard Data Integrity', () => {
    it('should provide consistent data for dashboard consumption', async () => {
      // Track a variety of events that would be used in analytics dashboard
      const dashboardTestEvents = [
        {
          type: 'scenario_generation',
          data: {
            scenarioSlug: 'dashboard-scenario-1',
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
          },
        },
        {
          type: 'user_engagement',
          data: {
            contentSection: 'investment_overview',
            action: 'view' as const,
            scenarioSlug: 'dashboard-scenario-1',
            locale: 'en',
          },
        },
        {
          type: 'seo_metrics',
          data: {
            metrics: {
              pageViews: 500,
              organicTraffic: 300,
              averageSessionDuration: 180000,
              bounceRate: 0.4,
              rankingKeywords: ['retirement planning'],
              backlinks: 5,
              coreWebVitals: { lcp: 1200, fid: 50, cls: 0.05 },
            },
            page: '/scenario/dashboard-scenario-1',
          },
        },
      ]

      for (const testEvent of dashboardTestEvents) {
        switch (testEvent.type) {
          case 'scenario_generation':
            await analyticsManager.trackScenarioGeneration(
              testEvent.data as any
            )
            break
          case 'user_engagement':
            await analyticsManager.trackUserEngagement(testEvent.data as any)
            break
          case 'seo_metrics':
            await analyticsManager.trackSEOMetrics(
              (testEvent.data as any).metrics,
              (testEvent.data as any).page
            )
            break
        }
      }

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(3)

      // Verify data structure consistency for dashboard
      events.forEach((event) => {
        expect(event.event).toBeDefined()
        expect(event.properties).toBeDefined()
        expect(event.timestamp).toBeInstanceOf(Date)
        expect(event.sessionId).toBeDefined()
        expect(event.properties.category).toBeDefined()
      })

      // Verify specific data integrity
      const scenarioEvent = events.find(
        (e) => e.event === 'scenario_generation'
      )
      const engagementEvent = events.find((e) => e.event === 'user_engagement')
      const seoEvent = events.find((e) => e.event === 'seo_performance')

      expect(scenarioEvent?.properties.scenarioSlug).toBe(
        'dashboard-scenario-1'
      )
      expect(engagementEvent?.properties.scenarioSlug).toBe(
        'dashboard-scenario-1'
      )
      expect(seoEvent?.properties.page).toBe('/scenario/dashboard-scenario-1')
    })

    it('should validate metric calculations and aggregations', async () => {
      // Track performance metrics that would be aggregated in dashboard
      const performanceMetrics = [
        {
          pageLoadTime: 1000,
          largestContentfulPaint: 800,
          firstInputDelay: 30,
        },
        {
          pageLoadTime: 1200,
          largestContentfulPaint: 900,
          firstInputDelay: 40,
        },
        {
          pageLoadTime: 1100,
          largestContentfulPaint: 850,
          firstInputDelay: 35,
        },
        {
          pageLoadTime: 1300,
          largestContentfulPaint: 950,
          firstInputDelay: 45,
        },
        {
          pageLoadTime: 1050,
          largestContentfulPaint: 820,
          firstInputDelay: 32,
        },
      ]

      for (let i = 0; i < performanceMetrics.length; i++) {
        await analyticsManager.trackPerformanceMetrics(
          {
            ...performanceMetrics[i],
            timeToInteractive: performanceMetrics[i].pageLoadTime + 200,
            totalBlockingTime: 100,
            cumulativeLayoutShift: 0.05,
          },
          `/scenario/metrics-test-${i}`
        )
      }

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(5)

      // Calculate aggregations that would be used in dashboard
      const pageLoadTimes = events.map((e) => e.properties.pageLoadTime)
      const lcpTimes = events.map((e) => e.properties.largestContentfulPaint)
      const fidTimes = events.map((e) => e.properties.firstInputDelay)

      const avgPageLoadTime =
        pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length
      const avgLCP = lcpTimes.reduce((a, b) => a + b, 0) / lcpTimes.length
      const avgFID = fidTimes.reduce((a, b) => a + b, 0) / fidTimes.length

      // Verify calculated averages match expected values
      expect(avgPageLoadTime).toBe(1130) // (1000+1200+1100+1300+1050)/5
      expect(avgLCP).toBe(864) // (800+900+850+950+820)/5
      expect(avgFID).toBe(36.4) // (30+40+35+45+32)/5
    })
  })

  describe('Multi-language Data Consistency', () => {
    it('should maintain data consistency across different locales', async () => {
      const testParameters = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 8,
        timeHorizon: 25,
      }

      const locales = ['en', 'es', 'pl']

      for (const locale of locales) {
        await analyticsManager.trackParameterUsage(
          testParameters,
          'multi-language-test',
          locale
        )

        await analyticsManager.trackUserEngagement({
          contentSection: 'investment_overview',
          action: 'view',
          locale,
        })
      }

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(6) // 3 locales × 2 events each

      // Group events by locale
      const eventsByLocale = events.reduce(
        (acc, event) => {
          const locale = event.properties.locale
          if (!acc[locale]) acc[locale] = []
          acc[locale].push(event)
          return acc
        },
        {} as Record<string, any[]>
      )

      // Verify each locale has the same data structure
      locales.forEach((locale) => {
        expect(eventsByLocale[locale]).toHaveLength(2)

        const parameterEvent = eventsByLocale[locale].find(
          (e) => e.event === 'parameter_usage'
        )
        const engagementEvent = eventsByLocale[locale].find(
          (e) => e.event === 'user_engagement'
        )

        // Parameter categorization should be the same regardless of locale
        expect(parameterEvent.properties.initialAmountRange).toBe('10K-25K')
        expect(parameterEvent.properties.monthlyContributionRange).toBe(
          '500-1K'
        )
        expect(parameterEvent.properties.timeHorizonRange).toBe('21-25 years')

        // Locale should be correctly set
        expect(parameterEvent.properties.locale).toBe(locale)
        expect(engagementEvent.properties.locale).toBe(locale)
      })
    })
  })

  describe('Data Validation and Sanitization', () => {
    it('should sanitize and validate input data', async () => {
      // Test with potentially problematic data
      const problematicData = {
        parameters: {
          initialAmount: -1000, // Negative value
          monthlyContribution: Infinity, // Invalid number
          annualReturn: NaN, // Not a number
          timeHorizon: 'invalid' as any, // Wrong type
        },
        goal: '<script>alert("xss")</script>', // Potential XSS
        locale: 'en',
      }

      // Should not throw and should handle gracefully
      await expect(
        analyticsManager.trackParameterUsage(
          problematicData.parameters,
          problematicData.goal,
          problematicData.locale
        )
      ).resolves.not.toThrow()

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      // Data should be sanitized or handled appropriately
      const event = events[0]
      expect(event.properties.goal).not.toContain('<script>')
    })

    it('should enforce required field validation', async () => {
      // Test with missing required fields
      const incompleteData = {
        contentSection: '', // Empty required field
        action: 'view' as const,
        locale: '', // Empty required field
      }

      await analyticsManager.trackUserEngagement(incompleteData)

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      // Event should still be tracked but with handled empty values
      const event = events[0]
      expect(event.properties.contentSection).toBeDefined()
      expect(event.properties.locale).toBeDefined()
    })
  })
})
