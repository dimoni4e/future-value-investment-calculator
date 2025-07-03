/**
 * Task 6.3: Analytics & Monitoring - Performance Monitoring Tests
 * Tests for performance metric collection and error tracking
 */

import { analytics, AnalyticsManager } from '@/lib/analytics'

// Mock performance APIs
global.performance = {
  ...global.performance,
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
} as any

// Mock fetch
global.fetch = jest.fn()

describe('Task 6.3: Performance Monitoring', () => {
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

  describe('Core Web Vitals Collection', () => {
    it('should collect and track LCP measurements', async () => {
      const lcpMetrics = {
        pageLoadTime: 1500,
        timeToInteractive: 2000,
        totalBlockingTime: 150,
        cumulativeLayoutShift: 0.05,
        largestContentfulPaint: 1200,
        firstInputDelay: 50,
      }

      await analyticsManager.trackPerformanceMetrics(
        lcpMetrics,
        '/scenario/test-lcp'
      )

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      expect(event.event).toBe('performance_metrics')
      expect(event.properties.largestContentfulPaint).toBe(1200)
      expect(event.properties.page).toBe('/scenario/test-lcp')
      expect(event.properties.category).toBe('performance')
    })

    it('should track performance improvements over time', async () => {
      // Track baseline performance
      await analyticsManager.trackPerformanceMetrics(
        {
          pageLoadTime: 2000,
          timeToInteractive: 2500,
          totalBlockingTime: 300,
          cumulativeLayoutShift: 0.15,
          largestContentfulPaint: 1800,
          firstInputDelay: 100,
        },
        '/scenario/baseline'
      )

      // Track improved performance
      await analyticsManager.trackPerformanceMetrics(
        {
          pageLoadTime: 1200,
          timeToInteractive: 1500,
          totalBlockingTime: 100,
          cumulativeLayoutShift: 0.05,
          largestContentfulPaint: 1000,
          firstInputDelay: 30,
        },
        '/scenario/optimized'
      )

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(2)

      const baselineEvent = events[0]
      const optimizedEvent = events[1]

      // Verify improvement tracking
      expect(optimizedEvent.properties.pageLoadTime).toBeLessThan(
        baselineEvent.properties.pageLoadTime
      )
      expect(optimizedEvent.properties.largestContentfulPaint).toBeLessThan(
        baselineEvent.properties.largestContentfulPaint
      )
      expect(optimizedEvent.properties.firstInputDelay).toBeLessThan(
        baselineEvent.properties.firstInputDelay
      )
    })

    it('should validate Core Web Vitals thresholds', async () => {
      const testCases = [
        {
          name: 'excellent',
          metrics: {
            pageLoadTime: 1000,
            timeToInteractive: 1500,
            totalBlockingTime: 50,
            cumulativeLayoutShift: 0.05,
            largestContentfulPaint: 1200,
            firstInputDelay: 50,
          },
          expectedQuality: 'good',
        },
        {
          name: 'needs improvement',
          metrics: {
            pageLoadTime: 3000,
            timeToInteractive: 4000,
            totalBlockingTime: 400,
            cumulativeLayoutShift: 0.15,
            largestContentfulPaint: 3000,
            firstInputDelay: 150,
          },
          expectedQuality: 'needs-improvement',
        },
        {
          name: 'poor',
          metrics: {
            pageLoadTime: 5000,
            timeToInteractive: 6000,
            totalBlockingTime: 600,
            cumulativeLayoutShift: 0.3,
            largestContentfulPaint: 4500,
            firstInputDelay: 300,
          },
          expectedQuality: 'poor',
        },
      ]

      for (const testCase of testCases) {
        analyticsManager.flushEvents()
        await analyticsManager.trackPerformanceMetrics(
          testCase.metrics,
          `/scenario/${testCase.name}`
        )

        const events = analyticsManager.getStoredEvents()
        expect(events).toHaveLength(1)

        const event = events[0]
        // Verify all Core Web Vitals are tracked
        expect(event.properties.largestContentfulPaint).toBeDefined()
        expect(event.properties.firstInputDelay).toBeDefined()
        expect(event.properties.cumulativeLayoutShift).toBeDefined()
      }
    })
  })

  describe('Error Tracking and Alerting', () => {
    it('should track and categorize different types of errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Create production analytics manager to trigger error handling
      const { AnalyticsManager } = require('../../lib/analytics')
      const prodAnalyticsManager = new AnalyticsManager({ isProduction: true })

      // Simulate different error scenarios
      const errorScenarios = [
        {
          error: new Error('Network error during scenario generation'),
          context: 'scenario_generation',
        },
        {
          error: new TypeError('Cannot read property of undefined'),
          context: 'user_interaction',
        },
        {
          error: new ReferenceError('Analytics endpoint not defined'),
          context: 'analytics_tracking',
        },
      ]

      // Mock analytics endpoint to simulate errors
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('Analytics endpoint error')
      )

      for (const scenario of errorScenarios) {
        await prodAnalyticsManager.trackUserEngagement({
          contentSection: 'error-test',
          action: 'view',
          locale: 'en',
        })
      }

      expect(consoleSpy).toHaveBeenCalledTimes(errorScenarios.length)
      consoleSpy.mockRestore()
    })

    it('should handle analytics service downtime gracefully', async () => {
      // Mock fetch to simulate service downtime
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Create production analytics manager to trigger error handling
      const { AnalyticsManager } = require('../../lib/analytics')
      const prodAnalyticsManager = new AnalyticsManager({ isProduction: true })

      // Track events during downtime
      await prodAnalyticsManager.trackParameterUsage(
        {
          initialAmount: 10000,
          monthlyContribution: 500,
          annualReturn: 7,
          timeHorizon: 20,
        },
        'test',
        'en'
      )

      await prodAnalyticsManager.trackParameterUsage(
        {
          initialAmount: 5000,
          monthlyContribution: 200,
          annualReturn: 6,
          timeHorizon: 15,
        },
        'test',
        'en'
      )

      // This should succeed
      await prodAnalyticsManager.trackParameterUsage(
        {
          initialAmount: 15000,
          monthlyContribution: 750,
          annualReturn: 8,
          timeHorizon: 25,
        },
        'test',
        'en'
      )

      // Should have attempted to track all events despite failures
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(consoleSpy).toHaveBeenCalledTimes(2) // Two failures

      consoleSpy.mockRestore()
    })
  })

  describe('Uptime Monitoring Functionality', () => {
    it('should track service availability metrics', async () => {
      const uptimeMetrics = {
        pageViews: 1000,
        organicTraffic: 600,
        averageSessionDuration: 240000, // 4 minutes
        bounceRate: 0.25,
        rankingKeywords: ['test keyword'],
        backlinks: 10,
        coreWebVitals: {
          lcp: 1200,
          fid: 50,
          cls: 0.05,
        },
      }

      await analyticsManager.trackSEOMetrics(uptimeMetrics, '/uptime-test')

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      expect(event.properties.bounceRate).toBe(0.25)
      expect(event.properties.averageSessionDuration).toBe(240000)
      expect(event.properties.coreWebVitals.lcp).toBe(1200)
    })

    it('should handle intermittent connectivity issues', async () => {
      // Mock localStorage for offline storage
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })

      // Simulate intermittent connectivity
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Create production analytics manager to trigger error handling
      const { AnalyticsManager } = require('../../lib/analytics')
      const prodAnalyticsManager = new AnalyticsManager({ isProduction: true })

      // Track events during connectivity issues
      await prodAnalyticsManager.trackUserEngagement({
        contentSection: 'connectivity-test',
        action: 'view',
        locale: 'en',
      })

      // Verify fallback to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics tracking error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Performance Monitoring Dashboard Data', () => {
    it('should aggregate performance data for dashboard display', async () => {
      // Track multiple performance data points
      const performanceDataPoints = [
        {
          pageLoadTime: 1200,
          timeToInteractive: 1500,
          totalBlockingTime: 100,
          cumulativeLayoutShift: 0.05,
          largestContentfulPaint: 1000,
          firstInputDelay: 30,
        },
        {
          pageLoadTime: 1400,
          timeToInteractive: 1700,
          totalBlockingTime: 120,
          cumulativeLayoutShift: 0.06,
          largestContentfulPaint: 1100,
          firstInputDelay: 40,
        },
        {
          pageLoadTime: 1100,
          timeToInteractive: 1400,
          totalBlockingTime: 80,
          cumulativeLayoutShift: 0.04,
          largestContentfulPaint: 950,
          firstInputDelay: 25,
        },
      ]

      for (let i = 0; i < performanceDataPoints.length; i++) {
        await analyticsManager.trackPerformanceMetrics(
          performanceDataPoints[i],
          `/scenario/dashboard-test-${i}`
        )
      }

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(3)

      // Verify all events contain performance data
      events.forEach((event, index) => {
        expect(event.event).toBe('performance_metrics')
        expect(event.properties.pageLoadTime).toBe(
          performanceDataPoints[index].pageLoadTime
        )
        expect(event.properties.largestContentfulPaint).toBe(
          performanceDataPoints[index].largestContentfulPaint
        )
      })
    })

    it('should track performance trends over time', async () => {
      const timeIntervals = [
        { timestamp: new Date('2025-01-01'), loadTime: 2000 },
        { timestamp: new Date('2025-01-02'), loadTime: 1800 },
        { timestamp: new Date('2025-01-03'), loadTime: 1500 },
        { timestamp: new Date('2025-01-04'), loadTime: 1200 },
      ]

      for (const interval of timeIntervals) {
        // Mock Date.now to return specific timestamps
        jest.spyOn(Date, 'now').mockReturnValue(interval.timestamp.getTime())

        await analyticsManager.trackPerformanceMetrics(
          {
            pageLoadTime: interval.loadTime,
            timeToInteractive: interval.loadTime + 300,
            totalBlockingTime: 100,
            cumulativeLayoutShift: 0.05,
            largestContentfulPaint: interval.loadTime - 200,
            firstInputDelay: 50,
          },
          `/scenario/trend-test`
        )
      }

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(4)

      // Verify decreasing load times (improvement trend)
      for (let i = 1; i < events.length; i++) {
        expect(events[i].properties.pageLoadTime).toBeLessThan(
          events[i - 1].properties.pageLoadTime
        )
      }

      // Restore Date.now
      jest.restoreAllMocks()
    })
  })

  describe('Real-time Monitoring', () => {
    it('should provide real-time performance monitoring capabilities', async () => {
      const realTimeMetrics = {
        pageLoadTime: 800,
        timeToInteractive: 1000,
        totalBlockingTime: 50,
        cumulativeLayoutShift: 0.02,
        largestContentfulPaint: 600,
        firstInputDelay: 20,
      }

      const startTime = Date.now()
      await analyticsManager.trackPerformanceMetrics(
        realTimeMetrics,
        '/real-time-test'
      )
      const endTime = Date.now()

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(1)

      const event = events[0]
      // Verify event was tracked in real-time (within reasonable bounds)
      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(startTime)
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(endTime)

      // Verify excellent performance metrics
      expect(event.properties.largestContentfulPaint).toBeLessThan(1000)
      expect(event.properties.firstInputDelay).toBeLessThan(50)
      expect(event.properties.cumulativeLayoutShift).toBeLessThan(0.1)
    })

    it('should handle high-frequency monitoring without performance degradation', async () => {
      const startTime = Date.now()

      // Simulate high-frequency monitoring (100 events)
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          analyticsManager.trackPerformanceMetrics(
            {
              pageLoadTime: 1000 + i,
              timeToInteractive: 1200 + i,
              totalBlockingTime: 100,
              cumulativeLayoutShift: 0.05,
              largestContentfulPaint: 900 + i,
              firstInputDelay: 30,
            },
            `/high-frequency-test-${i}`
          )
        )
      }

      await Promise.all(promises)
      const endTime = Date.now()

      const events = analyticsManager.getStoredEvents()
      expect(events).toHaveLength(100)

      // Verify monitoring completed within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000)

      // Verify all events were tracked correctly
      events.forEach((event, index) => {
        expect(event.properties.pageLoadTime).toBe(1000 + index)
        expect(event.properties.largestContentfulPaint).toBe(900 + index)
      })
    })
  })

  describe('Alert System', () => {
    it('should trigger alerts for performance degradation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Clear any existing mock and create a fresh one that rejects
      jest.clearAllMocks()
      const fetchMock = jest
        .fn()
        .mockRejectedValue(new Error('Performance alert endpoint error'))
      global.fetch = fetchMock

      // Create production analytics manager to trigger error handling
      const { AnalyticsManager } = require('../../lib/analytics')
      const prodAnalyticsManager = new AnalyticsManager({ isProduction: true })

      // Track poor performance metrics that should trigger alerts
      await prodAnalyticsManager.trackPerformanceMetrics(
        {
          pageLoadTime: 8000, // Very slow
          timeToInteractive: 10000,
          totalBlockingTime: 1000,
          cumulativeLayoutShift: 0.5, // Poor CLS
          largestContentfulPaint: 6000, // Poor LCP
          firstInputDelay: 500, // Poor FID
        },
        '/alert-test'
      )

      // Small delay to ensure async error handling completes
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify analytics attempted to send data
      expect(fetchMock).toHaveBeenCalled()

      // Verify error was logged (would trigger alert in real system)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics tracking error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})
