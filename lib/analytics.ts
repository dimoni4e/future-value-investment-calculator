/**
 * Task 6.3: Analytics & Monitoring
 * Track scenario generation, parameter patterns, user engagement, and SEO performance
 */

export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
}

export interface ScenarioGenerationEvent {
  scenarioSlug: string
  parameters: {
    initialAmount: number
    monthlyContribution: number
    annualReturn: number
    timeHorizon: number
  }
  goal: string
  locale: string
  source: 'calculator' | 'direct-link' | 'internal-link'
  generationTime: number
  cached: boolean
}

export interface UserEngagementEvent {
  contentSection: string
  action: 'view' | 'click' | 'scroll' | 'time-spent'
  value?: number
  scenarioSlug?: string
  locale: string
}

export interface SEOPerformanceMetrics {
  pageViews: number
  organicTraffic: number
  averageSessionDuration: number
  bounceRate: number
  rankingKeywords: string[]
  backlinks: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
}

export interface ParameterPopularityMetrics {
  initialAmountRanges: Record<string, number>
  monthlyContributionRanges: Record<string, number>
  timeHorizonRanges: Record<string, number>
  annualReturnRanges: Record<string, number>
  popularGoals: Record<string, number>
  combinationFrequency: Array<{
    parameters: string
    count: number
    lastUsed: Date
  }>
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = []
  private isProduction: boolean
  private apiEndpoint: string = '/api/analytics'

  constructor(options?: { isProduction?: boolean }) {
    this.isProduction =
      options?.isProduction ?? process.env.NODE_ENV === 'production'

    // Initialize session ID for client-side tracking
    if (typeof window !== 'undefined') {
      this.initializeSession()
    }
  }

  private initializeSession(): void {
    if (!sessionStorage.getItem('analytics_session_id')) {
      sessionStorage.setItem('analytics_session_id', this.generateSessionId())
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    return (
      sessionStorage.getItem('analytics_session_id') || this.generateSessionId()
    )
  }

  /**
   * Track scenario generation frequency and parameters
   */
  async trackScenarioGeneration(event: ScenarioGenerationEvent): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: 'scenario_generation',
      properties: {
        ...event,
        category: 'scenario',
        performance: {
          generationTime: event.generationTime,
          cached: event.cached,
        },
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    }

    await this.track(analyticsEvent)
  }

  /**
   * Track popular parameter combinations
   */
  async trackParameterUsage(
    parameters: ScenarioGenerationEvent['parameters'],
    goal: string,
    locale: string
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: 'parameter_usage',
      properties: {
        initialAmountRange: this.categorizeAmount(parameters.initialAmount),
        monthlyContributionRange: this.categorizeMonthly(
          parameters.monthlyContribution
        ),
        timeHorizonRange: this.categorizeTimeHorizon(parameters.timeHorizon),
        annualReturnRange: this.categorizeReturn(parameters.annualReturn),
        goal,
        locale,
        category: 'parameters',
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    }

    await this.track(analyticsEvent)
  }

  /**
   * Track user engagement with content sections
   */
  async trackUserEngagement(event: UserEngagementEvent): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: 'user_engagement',
      properties: {
        ...event,
        category: 'engagement',
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    }

    await this.track(analyticsEvent)
  }

  /**
   * Track SEO performance metrics
   */
  async trackSEOMetrics(
    metrics: SEOPerformanceMetrics,
    page: string
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: 'seo_performance',
      properties: {
        ...metrics,
        page,
        category: 'seo',
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    }

    await this.track(analyticsEvent)
  }

  /**
   * Track performance metrics
   */
  async trackPerformanceMetrics(
    metrics: {
      pageLoadTime: number
      timeToInteractive: number
      totalBlockingTime: number
      cumulativeLayoutShift: number
      largestContentfulPaint: number
      firstInputDelay: number
    },
    page: string
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: 'performance_metrics',
      properties: {
        ...metrics,
        page,
        category: 'performance',
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
    }

    await this.track(analyticsEvent)
  }

  /**
   * Get parameter popularity metrics
   */
  async getParameterPopularity(): Promise<ParameterPopularityMetrics> {
    try {
      const response = await fetch(`${this.apiEndpoint}/parameter-popularity`)
      if (!response.ok) throw new Error('Failed to fetch parameter popularity')
      return await response.json()
    } catch (error) {
      console.error('Error fetching parameter popularity:', error)
      return this.getDefaultParameterMetrics()
    }
  }

  /**
   * Get SEO performance data
   */
  async getSEOPerformance(
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<SEOPerformanceMetrics[]> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/seo-performance?range=${timeRange}`
      )
      if (!response.ok) throw new Error('Failed to fetch SEO performance')
      return await response.json()
    } catch (error) {
      console.error('Error fetching SEO performance:', error)
      return []
    }
  }

  /**
   * Core tracking method
   */
  private async track(event: AnalyticsEvent): Promise<void> {
    // Store event locally
    this.events.push(event)

    // In production, send to analytics endpoint
    if (this.isProduction) {
      try {
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })
      } catch (error) {
        console.error('Analytics tracking error:', error)
        // Store in local storage as fallback
        this.storeEventLocally(event)
      }
    } else {
      // In development, just log
      console.log('Analytics Event:', event)
    }
  }

  private storeEventLocally(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('analytics_events') || '[]'
      const events = JSON.parse(stored)
      events.push(event)

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }

      localStorage.setItem('analytics_events', JSON.stringify(events))
    } catch (error) {
      console.error('Error storing analytics event locally:', error)
    }
  }

  private categorizeAmount(amount: number): string {
    if (amount < 1000) return '0-1K'
    if (amount < 5000) return '1K-5K'
    if (amount < 10000) return '5K-10K'
    if (amount < 25000) return '10K-25K'
    if (amount < 50000) return '25K-50K'
    if (amount < 100000) return '50K-100K'
    return '100K+'
  }

  private categorizeMonthly(monthly: number): string {
    if (monthly < 100) return '0-100'
    if (monthly < 250) return '100-250'
    if (monthly < 500) return '250-500'
    if (monthly < 1000) return '500-1K'
    if (monthly < 2000) return '1K-2K'
    if (monthly < 5000) return '2K-5K'
    return '5K+'
  }

  private categorizeTimeHorizon(years: number): string {
    if (years <= 5) return '1-5 years'
    if (years <= 10) return '6-10 years'
    if (years <= 15) return '11-15 years'
    if (years <= 20) return '16-20 years'
    if (years <= 25) return '21-25 years'
    if (years <= 30) return '26-30 years'
    return '30+ years'
  }

  private categorizeReturn(rate: number): string {
    if (rate < 4) return '0-4%'
    if (rate < 6) return '4-6%'
    if (rate < 8) return '6-8%'
    if (rate < 10) return '8-10%'
    if (rate < 12) return '10-12%'
    return '12%+'
  }

  private getDefaultParameterMetrics(): ParameterPopularityMetrics {
    return {
      initialAmountRanges: {},
      monthlyContributionRanges: {},
      timeHorizonRanges: {},
      annualReturnRanges: {},
      popularGoals: {},
      combinationFrequency: [],
    }
  }

  /**
   * Flush stored events (useful for testing)
   */
  flushEvents(): AnalyticsEvent[] {
    const events = [...this.events]
    this.events = []
    return events
  }

  /**
   * Get stored events (useful for testing)
   */
  getStoredEvents(): AnalyticsEvent[] {
    return [...this.events]
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager()

// Export utilities for testing
export { AnalyticsManager }
