'use client'

import React, { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import GrowthChart from './GrowthChart'
import ScenarioSlider from './ScenarioSlider'
import ShareButtons from './ShareButtons'
import ExportButton from './ExportButton'
import CurrencySelector from './CurrencySelector'
import {
  ChevronDown,
  Save,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  Calculator,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import {
  calculateFutureValue as calculateInvestmentFV,
  type InvestmentParameters,
} from '@/lib/finance'
import {
  decodeParamsFromUrl,
  updateUrl,
  validateParams,
  DEFAULT_PARAMS,
  type CalculatorParams,
} from '@/lib/urlState'
import {
  useExchangeRates,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
  SUPPORTED_CURRENCIES,
  type Currency,
} from '@/lib/currency'

interface CalculatorInputs {
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
}

interface ValidationState {
  initialAmount: 'valid' | 'warning' | 'error' | 'neutral'
  monthlyContribution: 'valid' | 'warning' | 'error' | 'neutral'
  annualReturn: 'valid' | 'warning' | 'error' | 'neutral'
  timeHorizon: 'valid' | 'warning' | 'error' | 'neutral'
}

interface HelperTexts {
  initialAmount: string
  monthlyContribution: string
  annualReturn: string
  timeHorizon: string
}

interface CalculatorResults {
  futureValue: number
  totalContributions: number
  totalGrowth: number
  chartData: Array<{
    year: number
    totalValue: number
    contributions: number
    growth: number
  }>
}

const CalculatorForm = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_PARAMS)
  const [results, setResults] = useState<CalculatorResults | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES[0]
  ) // USD default

  const [validation, setValidation] = useState<ValidationState>({
    initialAmount: 'neutral',
    monthlyContribution: 'neutral',
    annualReturn: 'neutral',
    timeHorizon: 'neutral',
  })

  const [helperTexts, setHelperTexts] = useState<HelperTexts>({
    initialAmount: '',
    monthlyContribution: '',
    annualReturn: '',
    timeHorizon: '',
  })
  const t = useTranslations('calculator')
  const tChart = useTranslations('chart')
  const router = useRouter()
  const pathname = usePathname()

  // State for saving scenarios
  const [isSavingScenario, setIsSavingScenario] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioDescription, setScenarioDescription] = useState('')

  const { rates, loading: ratesLoading } = useExchangeRates()

  // Currency conversion helper
  const convertToDisplayCurrency = (usdAmount: number): number => {
    if (!rates || Object.keys(rates).length === 0) return usdAmount
    return convertCurrency(usdAmount, 'USD', selectedCurrency.code, rates)
  }

  // Currency formatting helper
  const formatDisplayCurrency = (amount: number): string => {
    const convertedAmount = convertToDisplayCurrency(amount)
    return formatCurrencyUtil(convertedAmount, selectedCurrency)
  }

  // Initialize state with default values (no URL parsing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use default parameters only
      const validatedParams = validateParams(DEFAULT_PARAMS)
      setInputs(validatedParams)
      setIsInitialized(true)
    }
  }, [])

  // Initialize validation on mount
  useEffect(() => {
    if (isInitialized) {
      validateInput('initialAmount', inputs.initialAmount)
      validateInput('monthlyContribution', inputs.monthlyContribution)
      validateInput('annualReturn', inputs.annualReturn)
      validateInput('timeHorizon', inputs.timeHorizon)
    }
  }, [
    isInitialized,
    inputs.initialAmount,
    inputs.monthlyContribution,
    inputs.annualReturn,
    inputs.timeHorizon,
  ])

  // Remove URL updating (clean URLs without parameters)
  // useEffect(() => {
  //   if (isInitialized && typeof window !== 'undefined') {
  //     updateUrl(inputs)
  //   }
  // }, [inputs, isInitialized])

  useEffect(() => {
    const params: InvestmentParameters = {
      initialAmount: inputs.initialAmount,
      monthlyContribution: inputs.monthlyContribution,
      annualReturnRate: inputs.annualReturn / 100,
      timeHorizonYears: inputs.timeHorizon,
    }

    const result = calculateInvestmentFV(params)

    // Generate chart data
    const chartData = []
    for (let year = 0; year <= inputs.timeHorizon; year++) {
      const yearParams = { ...params, timeHorizonYears: year }
      const yearResult = calculateInvestmentFV(yearParams)
      chartData.push({
        year,
        totalValue: yearResult.futureValue,
        contributions: yearResult.totalContributions,
        growth: yearResult.totalGrowth,
      })
    }

    setResults({
      futureValue: result.futureValue,
      totalContributions: result.totalContributions,
      totalGrowth: result.totalGrowth,
      chartData,
    })
  }, [inputs])

  const calculateFutureValue = (e: React.FormEvent) => {
    e.preventDefault()
    // The calculation is already done in useEffect, so this just prevents form submission
  }

  const validateInput = (field: keyof CalculatorInputs, value: number) => {
    let validationState: 'valid' | 'warning' | 'error' | 'neutral' = 'neutral'
    let helperText = ''

    switch (field) {
      case 'initialAmount':
        if (value < 0) {
          validationState = 'error'
          helperText = 'Amount cannot be negative'
        } else if (value === 0) {
          validationState = 'warning'
          helperText = 'Consider adding an initial investment to see growth'
        } else if (value >= 100) {
          validationState = 'valid'
          helperText = 'Good starting amount!'
        } else {
          validationState = 'neutral'
          helperText = 'Enter your initial investment amount'
        }
        break

      case 'monthlyContribution':
        if (value < 0) {
          validationState = 'error'
          helperText = 'Monthly contribution cannot be negative'
        } else if (value === 0) {
          validationState = 'warning'
          helperText = 'Regular contributions accelerate growth'
        } else if (value >= 50) {
          validationState = 'valid'
          helperText = 'Excellent! Regular investing builds wealth'
        } else {
          validationState = 'neutral'
          helperText = 'Enter your monthly contribution'
        }
        break

      case 'annualReturn':
        if (value < 0) {
          validationState = 'error'
          helperText = 'Return rate cannot be negative'
        } else if (value > 20) {
          validationState = 'warning'
          helperText = 'Very high return rates are risky'
        } else if (value >= 5 && value <= 15) {
          validationState = 'valid'
          helperText = 'Realistic return rate for long-term investing'
        } else {
          validationState = 'neutral'
          helperText = 'Expected annual return percentage'
        }
        break

      case 'timeHorizon':
        if (value < 1) {
          validationState = 'error'
          helperText = 'Time horizon must be at least 1 year'
        } else if (value < 5) {
          validationState = 'warning'
          helperText = 'Longer time horizons benefit from compound growth'
        } else if (value >= 10) {
          validationState = 'valid'
          helperText = 'Great! Time is your best friend in investing'
        } else {
          validationState = 'neutral'
          helperText = 'Investment time horizon in years'
        }
        break
    }

    setValidation((prev) => ({ ...prev, [field]: validationState }))
    setHelperTexts((prev) => ({ ...prev, [field]: helperText }))
  }

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
    validateInput(field, value)
  }

  const formatCurrency = (amount: number) => {
    return formatDisplayCurrency(amount)
  }

  // Enhanced Input Component
  const EnhancedInput = ({
    label,
    value,
    onChange,
    type = 'number',
    min,
    max,
    step,
    prefix,
    suffix,
    icon: Icon,
    field,
    placeholder,
    helpText,
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    type?: string
    min?: number
    max?: number
    step?: number
    prefix?: string
    suffix?: string
    icon?: React.ComponentType<{ className?: string }>
    field: keyof CalculatorInputs
    placeholder?: string
    helpText?: string
  }) => {
    const validationState = validation[field]
    const helperText = helperTexts[field] || helpText || ''

    const getValidationStyles = () => {
      switch (validationState) {
        case 'valid':
          return 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30'
        case 'warning':
          return 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/30'
        case 'error':
          return 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30'
        default:
          return 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/30'
      }
    }

    const getValidationIcon = () => {
      switch (validationState) {
        case 'valid':
          return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        case 'warning':
          return <AlertCircle className="w-5 h-5 text-amber-500" />
        case 'error':
          return <AlertCircle className="w-5 h-5 text-red-500" />
        default:
          return null
      }
    }

    const getHelperTextColor = () => {
      switch (validationState) {
        case 'valid':
          return 'text-emerald-600'
        case 'warning':
          return 'text-amber-600'
        case 'error':
          return 'text-red-600'
        default:
          return 'text-slate-500'
      }
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {Icon && <Icon className="w-4 h-4 text-slate-600" />}
          {label}
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium z-10">
              {prefix}
            </span>
          )}
          <input
            type={type}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            className={`w-full ${prefix ? 'pl-10' : 'pl-4'} ${
              suffix ? 'pr-16' : 'pr-4'
            } py-4 border rounded-xl focus:ring-2 transition-all duration-200 hover:bg-white focus:bg-white text-lg font-medium shadow-sm hover:shadow-lg focus:shadow-lg ${getValidationStyles()}`}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
              {suffix}
            </span>
          )}
          {validationState !== 'neutral' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={`text-sm ${getHelperTextColor()} flex items-center gap-1`}
          >
            <Info className="w-3 h-3" />
            {helperText}
          </p>
        )}
      </div>
    )
  }

  // Function to save current calculation as a scenario
  const saveAsScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name')
      return
    }

    setIsSavingScenario(true)
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName.trim(),
          description: scenarioDescription.trim() || undefined,
          params: {
            initialAmount: inputs.initialAmount,
            monthlyContribution: inputs.monthlyContribution,
            annualReturn: inputs.annualReturn,
            timeHorizon: inputs.timeHorizon,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const locale = pathname.split('/')[1] || 'en'
        const scenarioUrl = `/${locale}/scenario/${data.scenario.slug}`

        // Show success message and redirect
        alert(
          `Scenario saved successfully! Redirecting to your scenario page...`
        )
        router.push(scenarioUrl)
      } else {
        const error = await response.json()
        alert(`Error saving scenario: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving scenario:', error)
      alert('Error saving scenario. Please try again.')
    } finally {
      setIsSavingScenario(false)
      setShowSaveDialog(false)
      setScenarioName('')
      setScenarioDescription('')
    }
  }

  const handleSaveScenario = () => {
    if (!results) {
      alert('Please calculate results first before saving as scenario')
      return
    }
    setShowSaveDialog(true)
  }

  return (
    <div
      className="bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-xl border border-slate-200/30 shadow-2xl shadow-slate-200/20 hover:shadow-3xl hover:shadow-slate-200/30 transition-all duration-500 rounded-2xl p-6 lg:p-8"
      data-testid="calculator-form"
    >
      {/* Currency Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('currency')}
        </label>
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          disabled={ratesLoading}
          loading={ratesLoading}
          error={null}
        />
      </div>

      <form onSubmit={calculateFutureValue} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Initial Amount */}
          <EnhancedInput
            label={t('initialAmount')}
            value={inputs.initialAmount}
            onChange={(value) => handleInputChange('initialAmount', value)}
            min={0}
            step={100}
            prefix={selectedCurrency.symbol}
            icon={DollarSign}
            field="initialAmount"
            placeholder="10000"
          />

          {/* Monthly Contribution */}
          <EnhancedInput
            label={t('monthlyContribution')}
            value={inputs.monthlyContribution}
            onChange={(value) =>
              handleInputChange('monthlyContribution', value)
            }
            min={0}
            step={50}
            prefix={selectedCurrency.symbol}
            icon={Calendar}
            field="monthlyContribution"
            placeholder="500"
          />

          {/* Annual Return */}
          <EnhancedInput
            label={t('annualReturn')}
            value={inputs.annualReturn}
            onChange={(value) => handleInputChange('annualReturn', value)}
            min={0}
            max={30}
            step={0.1}
            suffix="%"
            icon={TrendingUp}
            field="annualReturn"
            placeholder="7.0"
          />

          {/* Time Horizon */}
          <EnhancedInput
            label={t('timeHorizon')}
            value={inputs.timeHorizon}
            onChange={(value) => handleInputChange('timeHorizon', value)}
            min={1}
            max={50}
            suffix="years"
            icon={Target}
            field="timeHorizon"
            placeholder="20"
          />
        </div>

        <button
          type="submit"
          className="group relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-large hover:shadow-elegant transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 font-semibold py-6 px-8 rounded-2xl flex items-center justify-center text-xl gap-3 overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>

          {/* Button content */}
          <Calculator className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10" />
          <span className="relative z-10">{t('calculate')}</span>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
        </button>
      </form>

      {/* Enhanced Scenario Slider */}
      <div className="mt-8 p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/40 rounded-2xl border border-slate-200/50 shadow-soft hover:shadow-medium transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 font-playfair">
              {t('adjustTimeHorizon')}
            </h3>
            <p className="text-sm text-slate-600">{t('sliderDescription')}</p>
          </div>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-white/50">
          <ScenarioSlider
            value={inputs.timeHorizon}
            onChange={(value) => handleInputChange('timeHorizon', value)}
            min={1}
            max={50}
          />
        </div>
      </div>

      {/* Enhanced Results */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Main Result Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-4 right-4 opacity-20">
              <TrendingUp className="w-16 h-16" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-playfair">
                    {t('projectionResults')}
                  </h3>
                  <p className="text-white/80 text-sm">
                    Your investment projection
                  </p>
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-white/90 text-sm mb-2 uppercase tracking-wide font-medium">
                  {t('futureValue')}
                </p>
                <p
                  className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight"
                  data-testid="future-value"
                >
                  {formatCurrency(results.futureValue)}
                </p>
                <p className="text-white/70 text-sm">
                  After {inputs.timeHorizon} years of investing
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {(
                      (results.futureValue / results.totalContributions - 1) *
                      100
                    ).toFixed(1)}
                    % total return
                  </span>
                </div>
              </div>

              {/* Enhanced Progress Visualization */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Your Contributions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Investment Growth</span>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  </div>
                </div>

                {/* Stacked Progress Bar */}
                <div className="relative h-6 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${(results.totalContributions / results.futureValue) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${(results.totalGrowth / results.futureValue) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-white/90">
                  <div className="text-center">
                    <div className="font-semibold">
                      {Math.round(
                        (results.totalContributions / results.futureValue) * 100
                      )}
                      %
                    </div>
                    <div className="text-white/70">Contributions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {Math.round(
                        (results.totalGrowth / results.futureValue) * 100
                      )}
                      %
                    </div>
                    <div className="text-white/70">Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Contributions Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-600">
                    {t('totalContributions')}
                  </h4>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {Math.round(
                    (results.totalContributions / results.futureValue) * 100
                  )}
                  %
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {formatCurrency(results.totalContributions)}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Your total investment</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Initial: {formatCurrency(inputs.initialAmount)}</span>
                  <span>
                    Monthly: {formatCurrency(inputs.monthlyContribution)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Growth Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-600">
                    {t('totalGrowth')}
                  </h4>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {Math.round(
                    (results.totalGrowth / results.futureValue) * 100
                  )}
                  %
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-2">
                {formatCurrency(results.totalGrowth)}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">From compound growth</p>
                <div className="text-xs text-slate-400">
                  At {inputs.annualReturn}% annual return
                </div>
              </div>
            </div>

            {/* ROI Summary Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 rounded-xl group md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-600">
                  Investment Summary
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total ROI</span>
                  <span className="text-lg font-bold text-purple-600">
                    {(
                      (results.futureValue / results.totalContributions - 1) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Years to goal</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {inputs.timeHorizon}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Monthly growth</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      results.totalGrowth / (inputs.timeHorizon * 12)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chart */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 font-playfair">
                    {tChart('title')}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Growth projection over time
                  </p>
                </div>
              </div>

              {/* Quick Stats for Mobile */}
              <div className="flex sm:hidden gap-4 text-center">
                <div>
                  <div className="text-sm font-semibold text-blue-600">
                    {inputs.annualReturn}%
                  </div>
                  <div className="text-xs text-slate-500">Annual Return</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-600">
                    {inputs.timeHorizon}y
                  </div>
                  <div className="text-xs text-slate-500">Time Horizon</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-100">
              <GrowthChart data={results.chartData} />
            </div>
          </div>

          {/* Comparison and Insights Section */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/50 shadow-lg p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 font-playfair">
                  {t('investmentInsights')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('insightsSubtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Value Comparison */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {t('timeValueImpact')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-slate-600">
                      {t('withoutInvesting')}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(results.totalContributions)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-100/60 rounded-lg">
                    <span className="text-sm text-slate-600">
                      {t('withInvesting')}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(results.futureValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">
                      {t('extraWealth')}
                    </span>
                    <span className="font-bold text-purple-700">
                      {formatCurrency(results.totalGrowth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Growth Statistics */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {t('growthStatistics')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-slate-600">
                      {t('monthlyGrowthAvg')}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(
                        results.totalGrowth / (inputs.timeHorizon * 12)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-slate-600">
                      {t('annualGrowth')}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(results.totalGrowth / inputs.timeHorizon)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">
                      {t('totalROI')}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {(
                        (results.futureValue / results.totalContributions - 1) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Share and Export Buttons */}
      {results && (
        <div className="mt-8 flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1">
            <ShareButtons calculatorParams={inputs} />
          </div>
          <div className="flex-1">
            <ExportButton
              calculatorParams={inputs}
              currency={selectedCurrency.code}
            />
          </div>
          {/* Enhanced Save as Scenario Button */}
          <button
            onClick={handleSaveScenario}
            className="group relative flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-medium hover:shadow-large font-medium overflow-hidden flex-1 lg:flex-initial"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Save as Scenario</span>
          </button>
          {/* Sentry Test Button - Development only */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                try {
                  throw new Error('Client-side test error for Sentry')
                } catch (error) {
                  Sentry.captureException(error)
                  alert('Error sent to Sentry (check console)')
                }
              }}
              className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-sm transition-all duration-200 hover:shadow-soft"
            >
              Test Sentry
            </button>
          )}
        </div>
      )}

      {/* Enhanced Save Scenario Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-elegant border border-slate-200/50 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Save className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 font-playfair">
                Save as Scenario
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., My Retirement Plan"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-soft hover:shadow-medium"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                  placeholder="Brief description of this investment scenario..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-soft hover:shadow-medium resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 rounded-xl border border-slate-200/50">
                <h4 className="font-semibold mb-4 text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  Current Parameters
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-slate-600">Initial Amount</div>
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(inputs.initialAmount)}
                    </div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-slate-600">Monthly</div>
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(inputs.monthlyContribution)}
                    </div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-slate-600">Annual Return</div>
                    <div className="font-semibold text-slate-900">
                      {inputs.annualReturn}%
                    </div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <div className="text-slate-600">Time Horizon</div>
                    <div className="font-semibold text-slate-900">
                      {inputs.timeHorizon} years
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
                  <div className="text-sm text-slate-600">Future Value</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(results!.futureValue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setScenarioName('')
                  setScenarioDescription('')
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium shadow-soft hover:shadow-medium"
                disabled={isSavingScenario}
              >
                Cancel
              </button>
              <button
                onClick={saveAsScenario}
                disabled={isSavingScenario || !scenarioName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-medium hover:shadow-large"
              >
                {isSavingScenario ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Scenario'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalculatorForm
