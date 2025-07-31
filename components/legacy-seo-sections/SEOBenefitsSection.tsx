import { getHomeContent } from '@/lib/db/queries'

interface SEOBenefitsSectionProps {
  locale: string
}

export async function SEOBenefitsSection({ locale }: SEOBenefitsSectionProps) {
  // Get SEO content from database
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  // Don't render if no content available
  if (!content.benefits_title) {
    return null
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            {content.benefits_title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Discover why thousands of investors trust our calculator for their
            financial planning needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Benefit 1 */}
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-10 h-10 text-blue-600"
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
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.benefits_benefit_1_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.benefits_benefit_1_description}
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-10 h-10 text-emerald-600"
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
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.benefits_benefit_2_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.benefits_benefit_2_description}
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-10 h-10 text-purple-600"
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
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.benefits_benefit_3_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.benefits_benefit_3_description}
            </p>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 pt-16 border-t border-slate-200/50">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {content.trust_signals_title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {content.trust_signals_users_count}
              </div>
              <div className="text-slate-600">
                {content.trust_signals_users_label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {content.trust_signals_calculations_count}
              </div>
              <div className="text-slate-600">
                {content.trust_signals_calculations_label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {content.trust_signals_accuracy_rate}
              </div>
              <div className="text-slate-600">
                {content.trust_signals_accuracy_label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
