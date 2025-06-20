'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { PlusCircle, Sparkles } from 'lucide-react'

interface CreateScenarioProps {
  initialParams?: {
    initialAmount: number
    monthlyContribution: number
    annualReturn: number
    timeHorizon: number
  }
}

export default function CreateScenarioForm({
  initialParams,
}: CreateScenarioProps) {
  const router = useRouter()
  const locale = useLocale()
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ...initialParams,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          params: {
            initialAmount: formData.initialAmount,
            monthlyContribution: formData.monthlyContribution,
            annualReturn: formData.annualReturn,
            timeHorizon: formData.timeHorizon,
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Navigate to the new scenario page
        router.push(`/${locale}/scenario/${result.scenario.slug}`)
      } else {
        console.error('Failed to create scenario')
        alert('Failed to create scenario. Please try again.')
      }
    } catch (error) {
      console.error('Error creating scenario:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (!showForm) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 mr-2" />
          <h3 className="text-2xl font-bold">Create Your Own Scenario</h3>
        </div>
        <p className="text-purple-100 mb-6">
          Save your current calculation as a permanent, shareable scenario that
          others can discover!
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center space-x-2 mx-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Scenario</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
        Create New Scenario
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Scenario Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., My Retirement Plan, College Fund, House Down Payment"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your investment strategy or goals..."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Initial Amount ($)
            </label>
            <input
              type="number"
              value={formData.initialAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  initialAmount: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Monthly Contribution ($)
            </label>
            <input
              type="number"
              value={formData.monthlyContribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyContribution: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual Return (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.annualReturn}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  annualReturn: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Horizon (years)
            </label>
            <input
              type="number"
              value={formData.timeHorizon}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeHorizon: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || !formData.name}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isCreating ? 'Creating...' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </div>
  )
}
