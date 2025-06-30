'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react'

interface GrowthChartProps {
  data: Array<{
    year: number
    totalValue: number
    contributions: number
    growth: number
  }>
  showArea?: boolean
}

type ChartType = 'line' | 'area' | 'bar' | 'pie'

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const t = useTranslations('chart')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleChartTypeChange = (newType: ChartType) => {
    if (newType === chartType) return

    setIsAnimating(true)
    setTimeout(() => {
      setChartType(newType)
      setIsAnimating(false)
    }, 150)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number, total: number) => {
    return `${Math.round((value / total) * 100)}%`
  }

  // Chart color themes
  const chartColors = {
    contributions: '#3b82f6', // Blue
    growth: '#10b981', // Emerald
    totalValue: '#8b5cf6', // Purple
  }

  // Enhanced tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-200 rounded-xl shadow-2xl min-w-[250px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-slate-900 text-lg">
              {chartType === 'pie' ? 'Final Values' : `Year ${label}`}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  // Chart type selector
  const ChartTypeSelector = () => {
    const chartTypes = [
      { type: 'area' as ChartType, icon: Activity, label: 'Area' },
      { type: 'line' as ChartType, icon: TrendingUp, label: 'Line' },
      { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
      { type: 'pie' as ChartType, icon: PieChartIcon, label: 'Pie' },
    ]

    return (
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {chartTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleChartTypeChange(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === type
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title={`${label} Chart`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient
                id="contributionsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartColors.contributions}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.contributions}
                  stopOpacity={0.3}
                />
              </linearGradient>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.growth}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.growth}
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={formatCurrency}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke={chartColors.contributions}
              fill="url(#contributionsGradient)"
              name={t('totalContributions')}
              animationDuration={1000}
              animationBegin={0}
            />
            <Area
              type="monotone"
              dataKey="growth"
              stackId="1"
              stroke={chartColors.growth}
              fill="url(#growthGradient)"
              name={t('investmentGrowth')}
              animationDuration={1000}
              animationBegin={200}
            />
          </AreaChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={formatCurrency}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke={chartColors.totalValue}
              strokeWidth={3}
              dot={{ fill: chartColors.totalValue, strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: chartColors.totalValue,
                strokeWidth: 2,
              }}
              name={t('totalValue')}
              animationDuration={1500}
              animationBegin={0}
            />
            <Line
              type="monotone"
              dataKey="contributions"
              stroke={chartColors.contributions}
              strokeWidth={2}
              dot={{ fill: chartColors.contributions, strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
              name={t('totalContributions')}
              animationDuration={1500}
              animationBegin={300}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={formatCurrency}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="contributions"
              stackId="a"
              fill={chartColors.contributions}
              name={t('totalContributions')}
              animationDuration={1000}
              animationBegin={0}
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="growth"
              stackId="a"
              fill={chartColors.growth}
              name={t('investmentGrowth')}
              animationDuration={1000}
              animationBegin={200}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case 'pie':
        const finalYear = data[data.length - 1]
        const pieData = [
          {
            name: t('totalContributions'),
            value: finalYear.contributions,
            color: chartColors.contributions,
          },
          {
            name: t('investmentGrowth'),
            value: finalYear.growth,
            color: chartColors.growth,
          },
        ]

        return (
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {/* Chart Header with Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 font-playfair mb-1">
            {t('title')}
          </h3>
          <p className="text-sm text-slate-600">
            {chartType === 'pie'
              ? 'Final composition breakdown'
              : 'Investment growth over time'}
          </p>
        </div>
        <ChartTypeSelector />
      </div>

      {/* Chart Container */}
      <div
        className={`w-full h-96 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-6 transition-all duration-300 ${
          isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
        data-testid="growth-chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Stats for Pie Chart */}
      {chartType === 'pie' && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">
                Contributions
              </span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatPercentage(
                data[data.length - 1].contributions,
                data[data.length - 1].totalValue
              )}
            </p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Growth</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {formatPercentage(
                data[data.length - 1].growth,
                data[data.length - 1].totalValue
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GrowthChart
