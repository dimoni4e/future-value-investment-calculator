import { useTranslations } from 'next-intl'
import CalculatorForm from '@/components/CalculatorForm'
import { getHomeContent } from '@/lib/db/queries'
import { RecentScenarios } from '@/components/RecentScenarios'
import { generateUrl } from '@/lib/utils'
import Link from 'next/link'

interface HomeContent {
  [key: string]: string
}

interface SEOHomePageProps {
  locale: string
  content: HomeContent
}

export async function SEOHomePage({ locale }: { locale: string }) {
  // Fetch all home content for this locale
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')

  // Convert to key-value object for easy access
  const content: HomeContent = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {content.hero_main_headline || 'Calculate Your Financial Future'}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-blue-100 sm:text-2xl">
              {content.hero_sub_headline ||
                'Plan your retirement and investment growth with precision'}
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="#calculator"
                className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 shadow-lg"
              >
                {content.hero_cta_primary ||
                  "Start Calculating Now - It's Free"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {content.trust_signals_title || 'Trusted by Investors Worldwide'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {content.trust_signals_users_count || '50,000+'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-2">
                  {content.trust_signals_users_label || 'Active Users'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {content.trust_signals_calculations_count || '1M+'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-2">
                  {content.trust_signals_calculations_label ||
                    'Calculations Performed'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {content.trust_signals_accuracy_rate || '99.9%'}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-2">
                  {content.trust_signals_accuracy_label ||
                    'Calculation Accuracy'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calculator Section */}
      <section id="calculator" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Investment Calculator
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Enter your investment details below to see your future wealth
              potential
            </p>
          </div>
          <CalculatorForm />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {content.benefits_title ||
                'Why Choose Our Investment Calculator?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 9V4a1 1 0 011-1h8a1 1 0 011 1v5M7 9h10l1 8H6l1-8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.benefits_benefit_1_title || 'Accurate Calculations'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.benefits_benefit_1_description ||
                  'Precise compound interest calculations for your investments'}
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.benefits_benefit_2_title || 'Multiple Scenarios'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.benefits_benefit_2_description ||
                  'Compare different investment strategies and scenarios'}
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.benefits_benefit_3_title || 'Visual Analytics'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.benefits_benefit_3_description ||
                  'Interactive charts and visual growth analysis'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {content.how_it_works_title ||
                'How Our Investment Calculator Works'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.how_it_works_step_1_title || 'Enter Your Details'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.how_it_works_step_1_description ||
                  'Input your investment parameters'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.how_it_works_step_2_title || 'View Calculations'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.how_it_works_step_2_description ||
                  'See instant compound interest results'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.how_it_works_step_3_title || 'Analyze & Plan'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.how_it_works_step_3_description ||
                  'Study charts and optimize your strategy'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Types Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {content.investment_types_title || 'Popular Investment Scenarios'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.investment_types_retirement_title ||
                  'Retirement Planning'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {content.investment_types_retirement_description ||
                  'Plan for your golden years with conservative strategies'}
              </p>
              <Link
                href={generateUrl('/scenario', locale)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Explore Retirement Scenarios →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.investment_types_growth_title || 'Growth Investing'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {content.investment_types_growth_description ||
                  'Maximize wealth with high-return strategies'}
              </p>
              <Link
                href={generateUrl('/scenario', locale)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                View Growth Scenarios →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {content.investment_types_emergency_title || 'Emergency Fund'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {content.investment_types_emergency_description ||
                  'Build a safety net with low-risk investments'}
              </p>
              <Link
                href={generateUrl('/scenario', locale)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Calculate Emergency Fund →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Scenarios */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Popular Investment Scenarios
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Explore pre-built scenarios or create your own custom calculations
            </p>
          </div>
          <RecentScenarios locale={locale} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {content.faq_title || 'Frequently Asked Questions'}
            </h2>
          </div>
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {content.faq_q1_question ||
                  'How accurate are the calculator results?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.faq_q1_answer ||
                  'Our calculator uses proven formulas for mathematically accurate projections'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {content.faq_q2_question || 'What is compound interest?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.faq_q2_answer ||
                  'Compound interest is earning interest on both principal and previously earned interest'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {content.faq_q3_question || 'Can I save my scenarios?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {content.faq_q3_answer ||
                  'Yes, you can create, save, and share custom investment scenarios'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
