'use client'

import React, { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import GrowthChart from './GrowthChart'
import ScenarioSlider from './ScenarioSlider'
import ShareButtons from './ShareButtons'
import ExportButton from './ExportButton'
import CurrencySelector from './CurrencySelector'
import { ChevronDown, Save } from 'lucide-react'
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

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatCurrency = (amount: number) => {
    return formatDisplayCurrency(amount)
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
          {/* Save as Scenario Button */}
          <button
            onClick={handleSaveScenario}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save as Scenario
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
              className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md text-xs transition-colors"
            >
              Test Sentry
            </button>
          )}
        </div>
      )}

      {/* Save Scenario Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Save as Scenario</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., My Retirement Plan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                  placeholder="Brief description of this investment scenario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <h4 className="font-medium mb-2">Current Parameters:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    Initial Amount: {formatCurrency(inputs.initialAmount)}
                  </li>
                  <li>
                    Monthly Contribution:{' '}
                    {formatCurrency(inputs.monthlyContribution)}
                  </li>
                  <li>Annual Return: {inputs.annualReturn}%</li>
                  <li>Time Horizon: {inputs.timeHorizon} years</li>
                  <li>Future Value: {formatCurrency(results!.futureValue)}</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setScenarioName('')
                  setScenarioDescription('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSavingScenario}
              >
                Cancel
              </button>
              <button
                onClick={saveAsScenario}
                disabled={isSavingScenario || !scenarioName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingScenario ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalculatorForm
