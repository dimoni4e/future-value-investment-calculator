import { getHomeContent } from '@/lib/db/queries'

interface HowItWorksSectionProps {
  locale: string
}

export async function HowItWorksSection({ locale }: HowItWorksSectionProps) {
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  if (!content.how_it_works_title) {
    return null
  }

  return (
    <section className="py-20 lg:py-32 bg-white border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 mb-6 shadow-soft">
            <span>🎯</span>
            <span>How It Works</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            {content.how_it_works_title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {content.how_it_works_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center opacity-90">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.how_it_works_step_1_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.how_it_works_step_1_description}
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center opacity-90">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.how_it_works_step_2_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.how_it_works_step_2_description}
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mx-auto group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center opacity-90">
                <svg
                  className="w-4 h-4 text-white"
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
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {content.how_it_works_step_3_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.how_it_works_step_3_description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
