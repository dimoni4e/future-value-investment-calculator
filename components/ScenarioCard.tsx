import Link from 'next/link'
import { formatCurrencyUSD } from '@/lib/format'
import { TrendingUp, Calendar, User } from 'lucide-react'

interface ScenarioCardLabels {
  initial: string
  monthly: string
  returnRate: string
  time: string
  userCreated?: string
}

interface ScenarioCardProps {
  id: string
  name: string
  description?: string
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
  tags?: string[]
  locale: string
  isUserCreated?: boolean
  createdAt?: string | Date
  slug?: string
  labels: ScenarioCardLabels
}

export function ScenarioCard({
  id,
  name,
  description,
  initialAmount,
  monthlyContribution,
  annualReturn,
  timeHorizon,
  tags,
  locale,
  isUserCreated,
  createdAt,
  slug,
  labels,
}: ScenarioCardProps) {
  const scenarioSlug = slug || id
  const href =
    locale === 'en'
      ? `/scenario/${scenarioSlug}`
      : `/${locale}/scenario/${scenarioSlug}`

  return (
    <Link href={href} className="group block h-full">
      <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              {isUserCreated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100/80 text-emerald-700 rounded-full text-xs font-medium">
                  <User className="w-3 h-3" />
                  <span>{labels.userCreated || 'User Created'}</span>
                </span>
              )}
              {createdAt && (
                <span className="flex items-center text-xs text-slate-400 ml-auto">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(createdAt).toLocaleDateString(locale)}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
              {name}
            </h3>

            {description && (
              <p className="text-slate-600 text-sm line-clamp-2 h-10">
                {description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div>
              <div className="text-lg font-bold text-indigo-600">
                {formatCurrencyUSD(initialAmount)}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {labels.initial}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">
                {formatCurrencyUSD(monthlyContribution)}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {labels.monthly}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {annualReturn}%
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {labels.returnRate}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {timeHorizon}y
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {labels.time}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium shadow-sm"
                >
                  {tag}
                </span>
              ))}
              {tags && tags.length > 2 && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                  +{tags.length - 2}
                </span>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
