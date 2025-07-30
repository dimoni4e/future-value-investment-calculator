import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { homeContent } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    // Enhanced SEO content for multiple new sections
    const enhancedSEOContent = [
      // How It Works Section
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'title',
        value: 'How Our Investment Calculator Works',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'subtitle',
        value:
          'Simple steps to calculate your investment growth and build wealth',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_1_title',
        value: 'Enter Your Investment Details',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_1_description',
        value:
          'Input your initial investment amount, monthly contributions, expected annual return, and investment timeline to get started.',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_2_title',
        value: 'Calculate Compound Interest',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_2_description',
        value:
          'Our advanced algorithm calculates your future value using compound interest formulas, showing you the power of long-term investing.',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_3_title',
        value: 'Visualize Your Growth',
      },
      {
        locale: 'en',
        section: 'how_it_works',
        key: 'step_3_description',
        value:
          'View interactive charts and detailed breakdowns of your investment growth, including principal vs. interest earned over time.',
      },

      // Investment Strategies Section
      {
        locale: 'en',
        section: 'strategies',
        key: 'title',
        value: 'Investment Strategies & Financial Planning',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'subtitle',
        value:
          'Learn proven investment strategies to maximize your wealth building potential',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_1_title',
        value: 'Dollar-Cost Averaging',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_1_description',
        value:
          'Invest a fixed amount regularly regardless of market conditions. This strategy reduces the impact of market volatility and builds disciplined investing habits.',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_2_title',
        value: 'Long-Term Compound Growth',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_2_description',
        value:
          'Harness the power of compound interest by staying invested for longer periods. Time is your greatest asset in wealth building.',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_3_title',
        value: 'Diversified Portfolio Planning',
      },
      {
        locale: 'en',
        section: 'strategies',
        key: 'strategy_3_description',
        value:
          'Spread risk across different asset classes and investment vehicles to optimize returns while managing risk effectively.',
      },

      // FAQ Section
      {
        locale: 'en',
        section: 'faq',
        key: 'title',
        value: 'Frequently Asked Questions',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'subtitle',
        value:
          'Get answers to common questions about investment calculators and financial planning',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q1_question',
        value: 'How accurate is the investment calculator?',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q1_answer',
        value:
          'Our calculator uses proven compound interest formulas and is 99.9% accurate for projections. However, actual investment returns may vary due to market volatility and other factors.',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q2_question',
        value: 'What is compound interest and why is it important?',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q2_answer',
        value:
          'Compound interest is earning interest on both your principal and previously earned interest. It accelerates wealth building over time, making it crucial for long-term financial success.',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q3_question',
        value: 'Can I use this for retirement planning?',
      },
      {
        locale: 'en',
        section: 'faq',
        key: 'q3_answer',
        value:
          'Absolutely! Our calculator is perfect for retirement planning, helping you determine how much to save monthly to reach your retirement goals.',
      },

      // Features Section
      {
        locale: 'en',
        section: 'features',
        key: 'title',
        value: 'Advanced Calculator Features',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'subtitle',
        value:
          'Powerful tools to optimize your investment planning and decision making',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_1_title',
        value: 'Interactive Growth Charts',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_1_description',
        value:
          'Visualize your investment growth with beautiful, interactive charts that show principal vs. interest over time.',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_2_title',
        value: 'Scenario Comparison',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_2_description',
        value:
          'Compare multiple investment scenarios side-by-side to find the optimal strategy for your financial goals.',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_3_title',
        value: 'Export & Share Results',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_3_description',
        value:
          'Export your calculations as PDF or share custom URLs with financial advisors and family members.',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_4_title',
        value: 'Mobile-Optimized',
      },
      {
        locale: 'en',
        section: 'features',
        key: 'feature_4_description',
        value:
          'Calculate investments anywhere with our fully responsive design that works perfectly on all devices.',
      },

      // Spanish translations
      {
        locale: 'es',
        section: 'how_it_works',
        key: 'title',
        value: 'Cómo Funciona Nuestra Calculadora de Inversión',
      },
      {
        locale: 'es',
        section: 'how_it_works',
        key: 'subtitle',
        value:
          'Pasos simples para calcular el crecimiento de tu inversión y construir riqueza',
      },
      {
        locale: 'es',
        section: 'how_it_works',
        key: 'step_1_title',
        value: 'Ingresa los Detalles de tu Inversión',
      },
      {
        locale: 'es',
        section: 'how_it_works',
        key: 'step_1_description',
        value:
          'Introduce tu monto inicial de inversión, contribuciones mensuales, rendimiento anual esperado y horizonte temporal para comenzar.',
      },
      {
        locale: 'es',
        section: 'strategies',
        key: 'title',
        value: 'Estrategias de Inversión y Planificación Financiera',
      },
      {
        locale: 'es',
        section: 'faq',
        key: 'title',
        value: 'Preguntas Frecuentes',
      },
      {
        locale: 'es',
        section: 'features',
        key: 'title',
        value: 'Características Avanzadas de la Calculadora',
      },

      // Polish translations
      {
        locale: 'pl',
        section: 'how_it_works',
        key: 'title',
        value: 'Jak Działa Nasz Kalkulator Inwestycji',
      },
      {
        locale: 'pl',
        section: 'how_it_works',
        key: 'subtitle',
        value:
          'Proste kroki do obliczenia wzrostu inwestycji i budowania bogactwa',
      },
      {
        locale: 'pl',
        section: 'how_it_works',
        key: 'step_1_title',
        value: 'Wprowadź Szczegóły Swojej Inwestycji',
      },
      {
        locale: 'pl',
        section: 'how_it_works',
        key: 'step_1_description',
        value:
          'Podaj początkową kwotę inwestycji, miesięczne wpłaty, oczekiwany roczny zwrot i horyzont czasowy, aby rozpocząć.',
      },
      {
        locale: 'pl',
        section: 'strategies',
        key: 'title',
        value: 'Strategie Inwestycyjne i Planowanie Finansowe',
      },
      {
        locale: 'pl',
        section: 'faq',
        key: 'title',
        value: 'Często Zadawane Pytania',
      },
      {
        locale: 'pl',
        section: 'features',
        key: 'title',
        value: 'Zaawansowane Funkcje Kalkulatora',
      },
    ]

    // Insert all enhanced content
    for (const item of enhancedSEOContent) {
      await db
        .insert(homeContent)
        .values({
          locale: item.locale as 'en' | 'pl' | 'es',
          section: item.section,
          key: item.key,
          value: item.value,
        })
        .onConflictDoUpdate({
          target: [homeContent.locale, homeContent.section, homeContent.key],
          set: {
            value: item.value,
            updatedAt: new Date(),
          },
        })
    }

    return NextResponse.json({
      success: true,
      message: `Enhanced SEO content populated successfully. Added ${enhancedSEOContent.length} content items.`,
      itemsAdded: enhancedSEOContent.length,
    })
  } catch (error) {
    console.error('Error populating enhanced SEO content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to populate enhanced SEO content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
