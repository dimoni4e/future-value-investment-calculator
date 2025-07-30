import { getHomeContent } from '@/lib/db/queries'

interface AdvancedFeaturesSectionProps {
  locale: string
}

export async function AdvancedFeaturesSection({
  locale,
}: AdvancedFeaturesSectionProps) {
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  if (!content.features_title) {
    return null
  }

  return (
    <section className="py-20 lg:py-32 bg-white border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-50/80 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-200/50 mb-6 shadow-soft">
            <span>⚡</span>
            <span>Advanced Features</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            {content.features_title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {content.features_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-blue-600"
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
            <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {content.features_feature_1_title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.features_feature_1_description}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
              {content.features_feature_2_title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.features_feature_2_description}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
              {content.features_feature_3_title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.features_feature_3_description}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
              {content.features_feature_4_title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.features_feature_4_description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
