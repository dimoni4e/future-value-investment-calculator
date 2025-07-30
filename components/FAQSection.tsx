import { getHomeContent } from '@/lib/db/queries'

interface FAQSectionProps {
  locale: string
}

export async function FAQSection({ locale }: FAQSectionProps) {
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  if (!content.faq_title) {
    return null
  }

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50/30 via-white to-blue-50/20 border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50 mb-6 shadow-soft">
            <span>❓</span>
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            {content.faq_title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {content.faq_subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">Q</span>
                </div>
                {content.faq_q1_question}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-11">
                {content.faq_q1_answer}
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-200 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">Q</span>
                </div>
                {content.faq_q2_question}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-11">
                {content.faq_q2_answer}
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-200 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">Q</span>
                </div>
                {content.faq_q3_question}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-11">
                {content.faq_q3_answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
