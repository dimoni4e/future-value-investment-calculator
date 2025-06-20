'use client'

import React, { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import GrowthChart from './GrowthChart'
import ScenarioSlider from './ScenarioSlider'
import ShareButtons from './ShareButtons'
import ExportButton from './ExportButton'
import CurrencySelector from './CurrencySelector'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('calculator')
  const tChart = useTranslations('chart')
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

  // Initialize state from URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = decodeParamsFromUrl(window.location.search)
      const validatedParams = validateParams(urlParams)
      setInputs(validatedParams)
      setIsInitialized(true)
    }
  }, [])

  // Update URL when inputs change (but not during initial load)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      updateUrl(inputs)
    }
  }, [inputs, isInitialized])

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

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatCurrency = (amount: number) => {
    return formatDisplayCurrency(amount)
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
          <div>
            <label
              htmlFor="initialAmount"
              className="block text-sm font-semibold text-slate-700 mb-3"
            >
              {t('initialAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                {selectedCurrency.symbol}
              </span>
              <input
                type="number"
                id="initialAmount"
                min="0"
                step="100"
                value={inputs.initialAmount}
                onChange={(e) =>
                  handleInputChange('initialAmount', Number(e.target.value))
                }
                className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/30 hover:bg-white focus:bg-white text-lg font-medium shadow-sm hover:shadow-lg focus:shadow-lg"
                required
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <label
              htmlFor="monthlyContribution"
              className="block text-sm font-semibold text-slate-700 mb-3"
            >
              {t('monthlyContribution')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                {selectedCurrency.symbol}
              </span>
              <input
                type="number"
                id="monthlyContribution"
                min="0"
                step="50"
                value={inputs.monthlyContribution}
                onChange={(e) =>
                  handleInputChange(
                    'monthlyContribution',
                    Number(e.target.value)
                  )
                }
                className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/30 hover:bg-white focus:bg-white text-lg font-medium shadow-sm hover:shadow-lg focus:shadow-lg"
                required
              />
            </div>
          </div>

          {/* Annual Return */}
          <div>
            <label
              htmlFor="annualReturn"
              className="block text-sm font-semibold text-slate-700 mb-3"
            >
              {t('annualReturn')}
            </label>
            <div className="relative">
              <input
                type="number"
                id="annualReturn"
                min="0"
                max="30"
                step="0.1"
                value={inputs.annualReturn}
                onChange={(e) =>
                  handleInputChange('annualReturn', Number(e.target.value))
                }
                className="w-full pr-10 pl-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/30 hover:bg-white focus:bg-white text-lg font-medium shadow-sm hover:shadow-lg focus:shadow-lg"
                required
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                %
              </span>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <label
              htmlFor="timeHorizon"
              className="block text-sm font-semibold text-slate-700 mb-3"
            >
              {t('timeHorizon')}
            </label>
            <input
              type="number"
              id="timeHorizon"
              min="1"
              max="50"
              value={inputs.timeHorizon}
              onChange={(e) =>
                handleInputChange('timeHorizon', Number(e.target.value))
              }
              className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/30 hover:bg-white focus:bg-white text-lg font-medium shadow-sm hover:shadow-lg focus:shadow-lg"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 font-semibold py-6 px-8 rounded-2xl flex items-center justify-center text-xl"
        >
          {t('calculate')}
        </button>
      </form>

      {/* Scenario Slider */}
      <div className="mt-6 p-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
        <h3 className="text-base font-semibold text-slate-900 mb-2 font-playfair">
          {t('adjustTimeHorizon')}
        </h3>
        <p className="text-xs text-slate-600 mb-3">{t('sliderDescription')}</p>
        <ScenarioSlider
          value={inputs.timeHorizon}
          onChange={(value) => handleInputChange('timeHorizon', value)}
          min={1}
          max={50}
        />
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-blue-50/50 to-purple-50/70 rounded-lg border border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-playfair">
              {t('projectionResults')}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">
                  {t('futureValue')}
                </p>
                <p
                  className="text-xl font-bold text-emerald-600"
                  data-testid="future-value"
                >
                  {formatCurrency(results.futureValue)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">
                  {t('totalContributions')}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(results.totalContributions)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">
                  {t('totalGrowth')}
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(results.totalGrowth)}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-3 font-playfair">
              {tChart('title')}
            </h3>
            <GrowthChart data={results.chartData} />
          </div>
        </div>
      )}

      {/* Share and Export Buttons - Always visible once there are results */}
      {results && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start">
          <ShareButtons calculatorParams={inputs} />
          <ExportButton
            calculatorParams={inputs}
            currency={selectedCurrency.code}
          />
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
              className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md text-xs transition-colors"
            >
              Test Sentry
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CalculatorForm
