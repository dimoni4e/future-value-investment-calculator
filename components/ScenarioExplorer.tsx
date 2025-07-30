'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Users,
  Star,
  ChevronDown,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { calculateFutureValue } from '@/lib/finance'
import type { Scenario } from '@/lib/db/schema'

interface ScenarioExplorerProps {
  locale: string
  initialScenarios: Scenario[]
  initialTotal: number
  categories: Array<{ category: string; count: number }>
  trendingScenarios: Scenario[]
}

interface Filters {
  search: string
  category: string[]
  scenarioType: 'all' | 'predefined' | 'user'
  minAmount: string
  maxAmount: string
  minTimeHorizon: string
  maxTimeHorizon: string
  minReturn: string
  maxReturn: string
  sortBy: 'newest' | 'popular' | 'return' | 'amount'
}

const INITIAL_FILTERS: Filters = {
  search: '',
  category: [],
  scenarioType: 'all',
  minAmount: '',
  maxAmount: '',
  minTimeHorizon: '',
  maxTimeHorizon: '',
  minReturn: '',
  maxReturn: '',
  sortBy: 'newest',
}

const ITEMS_PER_PAGE = 12

export default function ScenarioExplorer({
  locale,
  initialScenarios,
  initialTotal,
  categories,
  trendingScenarios,
}: ScenarioExplorerProps) {
  const t = useTranslations('scenarios.explorer')
  const tCard = useTranslations('scenarios.scenarioCard')

  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios)
  const [total, setTotal] = useState(initialTotal)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Quick filter categories
  const quickFilters = [
    { key: 'retirement', label: t('quickFilters.retirement') },
    { key: 'emergency', label: t('quickFilters.emergency') },
    { key: 'house', label: t('quickFilters.house') },
    { key: 'education', label: t('quickFilters.education') },
    { key: 'wealth', label: t('quickFilters.wealth') },
  ]

  // Fetch scenarios with filters
  const fetchScenarios = async (newFilters: Filters, page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        locale,
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(newFilters.search && { search: newFilters.search }),
        ...(newFilters.category.length > 0 && {
          category: newFilters.category.join(','),
        }),
        ...(newFilters.scenarioType !== 'all' && {
          isPredefined: (newFilters.scenarioType === 'predefined').toString(),
        }),
        ...(newFilters.minAmount && { minAmount: newFilters.minAmount }),
        ...(newFilters.maxAmount && { maxAmount: newFilters.maxAmount }),
        ...(newFilters.minTimeHorizon && {
          minTimeHorizon: newFilters.minTimeHorizon,
        }),
        ...(newFilters.maxTimeHorizon && {
          maxTimeHorizon: newFilters.maxTimeHorizon,
        }),
        ...(newFilters.minReturn && { minReturn: newFilters.minReturn }),
        ...(newFilters.maxReturn && { maxReturn: newFilters.maxReturn }),
        sortBy: newFilters.sortBy,
      })

      const response = await fetch(`/api/scenarios/search?${params}`)
      const data = await response.json()

      if (page === 1) {
        setScenarios(data.scenarios || [])
      } else {
        setScenarios((prev) => [...prev, ...(data.scenarios || [])])
      }
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    fetchScenarios(newFilters, 1)
  }

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = { ...INITIAL_FILTERS }
    setFilters(clearedFilters)
    setCurrentPage(1)
    fetchScenarios(clearedFilters, 1)
  }

  // Load more scenarios
  const loadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchScenarios(filters, nextPage)
  }

  // Handle quick filter click
  const handleQuickFilter = (category: string) => {
    const newFilters = {
      ...filters,
      category: filters.category.includes(category)
        ? filters.category.filter((c) => c !== category)
        : [...filters.category, category],
    }
    applyFilters(newFilters)
  }

  // Calculate scenario value for display
  const calculateScenarioValue = (scenario: Scenario) => {
    const result = calculateFutureValue({
      initialAmount: parseFloat(scenario.initialAmount),
      monthlyContribution: parseFloat(scenario.monthlyContribution),
      annualReturnRate: parseFloat(scenario.annualReturn),
      timeHorizonYears: scenario.timeHorizon,
    })
    return result.futureValue
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generate URL path with proper locale handling
  const generateUrl = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`
  }

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.category.length > 0 ||
      filters.scenarioType !== 'all' ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.minTimeHorizon ||
      filters.maxTimeHorizon ||
      filters.minReturn ||
      filters.maxReturn ||
      filters.sortBy !== 'newest'
    )
  }, [filters])

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50 min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              <span>{t('title')}</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {t('subtitle')}
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingScenarios.length > 0 && (
        <section className="py-12 bg-white/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                {t('trending.title')}
              </h2>
            </div>
            <p className="text-slate-600 mb-8">{t('trending.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {trendingScenarios.slice(0, 6).map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  locale={locale}
                  formatCurrency={formatCurrency}
                  calculateScenarioValue={calculateScenarioValue}
                  tCard={tCard}
                  generateUrl={generateUrl}
                  isTrending
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters(filters)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>{t('filters.title')}</span>
              {hasActiveFilters && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                applyFilters({
                  ...filters,
                  sortBy: e.target.value as Filters['sortBy'],
                })
              }
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">{t('sorting.newest')}</option>
              <option value="popular">{t('sorting.popular')}</option>
              <option value="return">{t('sorting.highestReturn')}</option>
              <option value="amount">{t('sorting.highestAmount')}</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {t('quickFilters.title')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleQuickFilter(filter.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.category.includes(filter.key)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('filters.title')}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {t('filters.clear')}
                </button>
              </div>

              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                t={t}
              />

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => applyFilters(filters)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t('filters.apply')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-slate-600">
              {t('resultsCount', { count: total })}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <X className="w-4 h-4" />
                <span>{t('filters.clear')}</span>
              </button>
            )}
          </div>

          {/* Scenario Grid */}
          {scenarios.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {scenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    locale={locale}
                    formatCurrency={formatCurrency}
                    calculateScenarioValue={calculateScenarioValue}
                    tCard={tCard}
                    generateUrl={generateUrl}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {scenarios.length < total && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Loading...' : t('loadMore')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {t('noResults')}
              </h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {t('filters.clear')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// Filter Panel Component
function FilterPanel({
  filters,
  setFilters,
  categories,
  t,
}: {
  filters: Filters
  setFilters: (filters: Filters) => void
  categories: Array<{ category: string; count: number }>
  t: any
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Scenario Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('filters.scenarioType')}
        </label>
        <select
          value={filters.scenarioType}
          onChange={(e) =>
            setFilters({
              ...filters,
              scenarioType: e.target.value as Filters['scenarioType'],
            })
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="all">{t('filters.allTypes')}</option>
          <option value="predefined">{t('filters.expertCurated')}</option>
          <option value="user">{t('filters.userCreated')}</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('filters.categories')}
        </label>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {categories.slice(0, 10).map((category) => (
            <label
              key={category.category}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={filters.category.includes(category.category)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...filters.category, category.category]
                    : filters.category.filter((c) => c !== category.category)
                  setFilters({ ...filters, category: newCategories })
                }}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-600">
                {category.category} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Investment Amount Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('filters.investmentAmount')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t('filters.minAmount')}
            value={filters.minAmount}
            onChange={(e) =>
              setFilters({ ...filters, minAmount: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder={t('filters.maxAmount')}
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters({ ...filters, maxAmount: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Time Horizon Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('filters.timeHorizon')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t('filters.minYears')}
            value={filters.minTimeHorizon}
            onChange={(e) =>
              setFilters({ ...filters, minTimeHorizon: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder={t('filters.maxYears')}
            value={filters.maxTimeHorizon}
            onChange={(e) =>
              setFilters({ ...filters, maxTimeHorizon: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Expected Return Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('filters.expectedReturn')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t('filters.minReturn')}
            value={filters.minReturn}
            onChange={(e) =>
              setFilters({ ...filters, minReturn: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder={t('filters.maxReturn')}
            value={filters.maxReturn}
            onChange={(e) =>
              setFilters({ ...filters, maxReturn: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// Scenario Card Component
function ScenarioCard({
  scenario,
  locale,
  formatCurrency,
  calculateScenarioValue,
  tCard,
  generateUrl,
  isTrending = false,
}: {
  scenario: Scenario
  locale: string
  formatCurrency: (amount: number) => string
  calculateScenarioValue: (scenario: Scenario) => number
  tCard: any
  generateUrl: (path: string) => string
  isTrending?: boolean
}) {
  const projectedValue = calculateScenarioValue(scenario)

  return (
    <Link
      href={generateUrl(`/scenario/${scenario.slug}`)}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200 hover:border-indigo-200 overflow-hidden group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {scenario.name}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">
              {scenario.description}
            </p>
          </div>
          {isTrending && (
            <div className="ml-2 flex items-center space-x-1 text-orange-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Trending</span>
            </div>
          )}
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-slate-500">{tCard('initial')}:</span>
            <div className="font-medium">
              {formatCurrency(parseFloat(scenario.initialAmount))}
            </div>
          </div>
          <div>
            <span className="text-slate-500">{tCard('monthly')}:</span>
            <div className="font-medium">
              {formatCurrency(parseFloat(scenario.monthlyContribution))}
            </div>
          </div>
          <div>
            <span className="text-slate-500">{tCard('return')}:</span>
            <div className="font-medium">{scenario.annualReturn}%</div>
          </div>
          <div>
            <span className="text-slate-500">{tCard('years')}:</span>
            <div className="font-medium">{scenario.timeHorizon}</div>
          </div>
        </div>

        {/* Projected Result */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {tCard('projectedResult')}:
            </span>
            <div className="text-lg font-bold text-emerald-600">
              {formatCurrency(projectedValue)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {scenario.tags && scenario.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {scenario.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {scenario.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{scenario.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {scenario.isPredefined ? (
              <Star className="w-3 h-3 text-yellow-500" />
            ) : (
              <Users className="w-3 h-3" />
            )}
            <span>
              {scenario.isPredefined ? 'Expert Curated' : 'User Created'}
            </span>
          </div>
          {scenario.viewCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{scenario.viewCount} views</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
