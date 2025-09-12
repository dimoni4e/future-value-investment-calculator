/**
 * Task 6.2: Optimized Chart Component with Performance Enhancements
 * Implements lazy loading, memoization, and reduced bundle size
 */

'use client'

import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { formatCurrencyUSD } from '@/lib/format'
import { useTranslations } from 'next-intl'
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react'
// Import Recharts components directly for reliability
import {
  AreaChart,
  LineChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface OptimizedGrowthChartProps {
  data: Array<{
    year: number
    totalValue: number
    contributions: number
    growth: number
  }>
  showArea?: boolean
  height?: number
  enableAnimations?: boolean
}

type ChartType = 'line' | 'area' | 'bar' | 'pie'

// Chart loading skeleton component
const ChartSkeleton = memo(() => (
  <div
    data-testid="chart-skeleton"
    className="w-full h-80 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse rounded-xl relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    <div className="p-6 h-full flex flex-col justify-center items-center">
      <div className="w-16 h-16 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-slate-500 text-sm">Loading chart...</div>
    </div>
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

// Memoized chart type selector for performance
const ChartTypeSelector = memo<{
  currentType: ChartType
  onTypeChange: (type: ChartType) => void
  isLoading: boolean
}>(({ currentType, onTypeChange, isLoading }) => {
  const t = useTranslations('chart')

  const chartTypes = useMemo(
    () => [
      {
        type: 'area' as ChartType,
        icon: TrendingUp,
        label: t('types.area') || 'Area',
      },
      {
        type: 'line' as ChartType,
        icon: Activity,
        label: t('types.line') || 'Line',
      },
      {
        type: 'bar' as ChartType,
        icon: BarChart3,
        label: t('types.bar') || 'Bar',
      },
      {
        type: 'pie' as ChartType,
        icon: PieChartIcon,
        label: t('types.pie') || 'Pie',
      },
    ],
    [t]
  )

  return (
    <div className="flex space-x-2 mb-6 p-1 bg-slate-100 rounded-lg">
      {chartTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => !isLoading && onTypeChange(type)}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            currentType === type
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          aria-label={`Switch to ${label} chart`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
})

ChartTypeSelector.displayName = 'ChartTypeSelector'

// Optimized chart component with performance enhancements
const OptimizedGrowthChart: React.FC<OptimizedGrowthChartProps> = memo(
  ({ data, height = 320, enableAnimations = true }) => {
    const t = useTranslations('chart')
    const [chartType, setChartType] = useState<ChartType>('area')
    const [isLoading, setIsLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>(0)

    // Observe container size to provide an explicit width to Recharts
    useEffect(() => {
      if (!containerRef.current) return
      const el = containerRef.current
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect
          setContainerWidth(Math.max(0, Math.floor(cr.width)))
        }
      })
      ro.observe(el)
      // Initialize width immediately
      setContainerWidth(
        Math.max(0, Math.floor(el.getBoundingClientRect().width))
      )
      return () => ro.disconnect()
    }, [])

    // Memoize processed chart data to avoid recalculations
    const processedData = useMemo(() => {
      if (!data || data.length === 0) return []

      return data.map((item) => ({
        ...item,
        formattedTotalValue: formatCurrencyUSD(item.totalValue),
        formattedContributions: formatCurrencyUSD(item.contributions),
        formattedGrowth: formatCurrencyUSD(item.growth),
      }))
    }, [data])

    // Memoize pie chart data transformation
    const pieData = useMemo(() => {
      if (!processedData.length) return []

      const lastDataPoint = processedData[processedData.length - 1]
      return [
        {
          name: t('contributions') || 'Contributions',
          value: lastDataPoint.contributions,
          color: '#10b981',
        },
        {
          name: t('growth') || 'Growth',
          value: lastDataPoint.growth,
          color: '#6366f1',
        },
      ]
    }, [processedData, t])

    // Memoize color scheme
    const colors = useMemo(
      () => ({
        primary: '#6366f1',
        secondary: '#10b981',
        accent: '#f59e0b',
        gradient: ['#6366f1', '#8b5cf6', '#a855f7'],
      }),
      []
    )

    // Optimized chart type change handler
    const handleChartTypeChange = useCallback(
      (newType: ChartType) => {
        if (newType === chartType || isLoading) return

        setIsLoading(true)
        setTimeout(() => {
          setChartType(newType)
          setIsLoading(false)
        }, 150) // Short delay for smooth transition
      },
      [chartType, isLoading]
    )

    // Memoized custom tooltip component
    const CustomTooltip = useMemo(() => {
      const TooltipComponent = memo<any>(({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null

        return (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
            <p className="font-semibold text-slate-900">
              {t('year')} {label}
            </p>
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}:{' '}
                {typeof entry.value === 'number'
                  ? formatCurrencyUSD(entry.value)
                  : entry.value}
              </p>
            ))}
          </div>
        )
      })
      TooltipComponent.displayName = 'CustomTooltip'
      return TooltipComponent
    }, [t])

    // Render chart based on type with lazy loading
    const renderChart = useCallback(() => {
      // Avoid rendering the chart until we know container width,
      // but keep the wrapper rendered so ResizeObserver can measure it.
      if (containerWidth === 0) {
        return <ChartSkeleton />
      }
      const commonProps = {
        data: processedData,
        margin: { top: 5, right: 30, left: 20, bottom: 5 },
      }

      const widthPx = containerWidth > 0 ? containerWidth : undefined

      switch (chartType) {
        case 'area':
          return (
            <ResponsiveContainer width={widthPx || '100%'} height={height}>
              <AreaChart {...commonProps}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={colors.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.primary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="contributions"
                  stackId="1"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  name={t('contributions') || 'Contributions'}
                  animationDuration={enableAnimations ? 1000 : 0}
                />
                <Area
                  type="monotone"
                  dataKey="growth"
                  stackId="1"
                  stroke={colors.primary}
                  fill="url(#colorGrowth)"
                  name={t('growth') || 'Growth'}
                  animationDuration={enableAnimations ? 1200 : 0}
                />
              </AreaChart>
            </ResponsiveContainer>
          )

        case 'line':
          return (
            <ResponsiveContainer width={widthPx || '100%'} height={height}>
              <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalValue"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                  name={t('totalValue') || 'Total Value'}
                  animationDuration={enableAnimations ? 1000 : 0}
                />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  dot={{ fill: colors.secondary, strokeWidth: 2, r: 3 }}
                  name={t('contributions') || 'Contributions'}
                  animationDuration={enableAnimations ? 1200 : 0}
                />
              </LineChart>
            </ResponsiveContainer>
          )

        case 'bar':
          return (
            <ResponsiveContainer width={widthPx || '100%'} height={height}>
              <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="contributions"
                  fill={colors.secondary}
                  name={t('contributions') || 'Contributions'}
                  animationDuration={enableAnimations ? 800 : 0}
                />
                <Bar
                  dataKey="growth"
                  fill={colors.primary}
                  name={t('growth') || 'Growth'}
                  animationDuration={enableAnimations ? 1000 : 0}
                />
              </BarChart>
            </ResponsiveContainer>
          )

        case 'pie':
          return (
            <ResponsiveContainer width={widthPx || '100%'} height={height}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(height * 0.35, 120)}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={enableAnimations ? 1000 : 0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )

        default:
          return <ChartSkeleton />
      }
    }, [
      chartType,
      processedData,
      pieData,
      height,
      colors,
      enableAnimations,
      CustomTooltip,
      containerWidth,
      t,
    ])

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 bg-slate-50 rounded-xl">
          <p className="text-slate-500">{t('noData') || 'No data available'}</p>
        </div>
      )
    }

    return (
      <div className="w-full" ref={containerRef}>
        <ChartTypeSelector
          currentType={chartType}
          onTypeChange={handleChartTypeChange}
          isLoading={isLoading}
        />
        <div
          className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          role="img"
          aria-label={`${chartType} chart showing investment growth over time`}
        >
          {renderChart()}
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 text-xs text-slate-400">{`points: ${data.length}, width: ${containerWidth}px`}</div>
        )}
      </div>
    )
  }
)

OptimizedGrowthChart.displayName = 'OptimizedGrowthChart'

export default OptimizedGrowthChart
