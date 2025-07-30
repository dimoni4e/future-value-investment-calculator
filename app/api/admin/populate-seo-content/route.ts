import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { homeContent } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

/**
 * SEO Content Population API
 * This endpoint populates the homeContent table with comprehensive SEO content
 */
export async function POST() {
  try {
    console.log('🚀 Starting SEO content insertion...')

    const seoContent = [
      // Hero Section Enhancement
      {
        section: 'hero',
        items: [
          {
            key: 'main_headline',
            en: 'Calculate Your Financial Future with Precision - Free Investment Calculator',
            pl: 'Oblicz Swoją Finansową Przyszłość z Precyzją - Darmowy Kalkulator Inwestycji',
            es: 'Calcula Tu Futuro Financiero con Precisión - Calculadora de Inversión Gratuita',
          },
          {
            key: 'sub_headline',
            en: 'Plan your retirement, track compound interest growth, and make informed investment decisions with our advanced future value calculator. Trusted by over 50,000 investors worldwide.',
            pl: 'Planuj swoją emeryturę, śledź wzrost składanych odsetek i podejmuj świadome decyzje inwestycyjne dzięki naszemu zaawansowanemu kalkulatorowi wartości przyszłej. Zaufało nam ponad 50 000 inwestorów na całym świecie.',
            es: 'Planifica tu jubilación, rastrea el crecimiento del interés compuesto y toma decisiones de inversión informadas con nuestra calculadora avanzada de valor futuro. Confiado por más de 50,000 inversores en todo el mundo.',
          },
          {
            key: 'cta_primary',
            en: 'Start Calculating Now - Its Free',
            pl: 'Zacznij Liczyć Teraz - To Bezpłatne',
            es: 'Comenzar a Calcular Ahora - Es Gratis',
          },
        ],
      },
      // Benefits Section
      {
        section: 'benefits',
        items: [
          {
            key: 'title',
            en: 'Why Choose Our Investment Calculator?',
            pl: 'Dlaczego Wybrać Nasz Kalkulator Inwestycji?',
            es: '¿Por Qué Elegir Nuestra Calculadora de Inversión?',
          },
          {
            key: 'benefit_1_title',
            en: 'Accurate Compound Interest Calculations',
            pl: 'Dokładne Obliczenia Składanych Odsetek',
            es: 'Cálculos Precisos de Interés Compuesto',
          },
          {
            key: 'benefit_1_description',
            en: 'Our advanced algorithm considers monthly contributions, annual returns, and time horizons to provide precise future value projections for your investments.',
            pl: 'Nasz zaawansowany algorytm uwzględnia miesięczne składki, roczne zwroty i horyzonty czasowe, aby zapewnić precyzyjne prognozy wartości przyszłej Twoich inwestycji.',
            es: 'Nuestro algoritmo avanzado considera contribuciones mensuales, rendimientos anuales y horizontes temporales para proporcionar proyecciones precisas del valor futuro de tus inversiones.',
          },
          {
            key: 'benefit_2_title',
            en: 'Multiple Investment Scenarios',
            pl: 'Wielokrotne Scenariusze Inwestycyjne',
            es: 'Múltiples Escenarios de Inversión',
          },
          {
            key: 'benefit_2_description',
            en: 'Compare different investment strategies including conservative retirement planning, aggressive growth investing, and balanced portfolio approaches.',
            pl: 'Porównaj różne strategie inwestycyjne, w tym konserwatywne planowanie emerytalne, agresywne inwestowanie wzrostowe i zrównoważone podejścia portfelowe.',
            es: 'Compara diferentes estrategias de inversión incluyendo planificación conservadora de jubilación, inversión agresiva de crecimiento y enfoques de cartera equilibrada.',
          },
          {
            key: 'benefit_3_title',
            en: 'Visual Growth Charts & Analytics',
            pl: 'Wizualne Wykresy Wzrostu i Analityka',
            es: 'Gráficos de Crecimiento Visual y Análisis',
          },
          {
            key: 'benefit_3_description',
            en: 'Interactive charts show your investment growth over time, helping you understand the power of compound interest and make data-driven financial decisions.',
            pl: 'Interaktywne wykresy pokazują wzrost Twoich inwestycji w czasie, pomagając zrozumieć siłę składanych odsetek i podejmować finansowe decyzje oparte na danych.',
            es: 'Los gráficos interactivos muestran el crecimiento de tu inversión a lo largo del tiempo, ayudándote a entender el poder del interés compuesto y tomar decisiones financieras basadas en datos.',
          },
        ],
      },
      // Trust Signals
      {
        section: 'trust_signals',
        items: [
          {
            key: 'title',
            en: 'Trusted by Investors Worldwide',
            pl: 'Zaufany przez Inwestorów na Całym Świecie',
            es: 'Confiado por Inversores en Todo el Mundo',
          },
          {
            key: 'users_count',
            en: '50,000+',
            pl: '50,000+',
            es: '50,000+',
          },
          {
            key: 'users_label',
            en: 'Active Users',
            pl: 'Aktywni Użytkownicy',
            es: 'Usuarios Activos',
          },
          {
            key: 'calculations_count',
            en: '1M+',
            pl: '1M+',
            es: '1M+',
          },
          {
            key: 'calculations_label',
            en: 'Calculations Performed',
            pl: 'Wykonanych Obliczeń',
            es: 'Cálculos Realizados',
          },
          {
            key: 'accuracy_rate',
            en: '99.9%',
            pl: '99.9%',
            es: '99.9%',
          },
          {
            key: 'accuracy_label',
            en: 'Calculation Accuracy',
            pl: 'Dokładność Obliczeń',
            es: 'Precisión de Cálculo',
          },
        ],
      },
      // SEO Meta Content
      {
        section: 'seo',
        items: [
          {
            key: 'meta_title',
            en: 'Investment Calculator - Future Value & Compound Interest Calculator | Free Tool',
            pl: 'Kalkulator Inwestycji - Kalkulator Wartości Przyszłej i Składanych Odsetek | Darmowe Narzędzie',
            es: 'Calculadora de Inversión - Calculadora de Valor Futuro e Interés Compuesto | Herramienta Gratuita',
          },
          {
            key: 'meta_description',
            en: 'Free investment calculator for future value projections. Calculate compound interest, retirement savings, and investment growth with our advanced financial planning tool. Start planning your financial future today!',
            pl: 'Darmowy kalkulator inwestycji do prognozowania wartości przyszłej. Oblicz składane odsetki, oszczędności emerytalne i wzrost inwestycji za pomocą naszego zaawansowanego narzędzia planowania finansowego. Zacznij planować swoją finansową przyszłość już dziś!',
            es: 'Calculadora de inversión gratuita para proyecciones de valor futuro. Calcula interés compuesto, ahorros de jubilación y crecimiento de inversión con nuestra herramienta avanzada de planificación financiera. ¡Comienza a planificar tu futuro financiero hoy!',
          },
          {
            key: 'keywords',
            en: 'investment calculator, compound interest calculator, future value calculator, retirement planning, financial calculator, investment growth, savings calculator, wealth building, financial planning tool, investment projections',
            pl: 'kalkulator inwestycji, kalkulator składanych odsetek, kalkulator wartości przyszłej, planowanie emerytury, kalkulator finansowy, wzrost inwestycji, kalkulator oszczędności, budowanie bogactwa, narzędzie planowania finansowego, prognozy inwestycyjne',
            es: 'calculadora de inversión, calculadora de interés compuesto, calculadora de valor futuro, planificación de jubilación, calculadora financiera, crecimiento de inversión, calculadora de ahorros, construcción de riqueza, herramienta de planificación financiera, proyecciones de inversión',
          },
        ],
      },
    ]

    let insertedCount = 0
    let updatedCount = 0

    for (const sectionData of seoContent) {
      for (const item of sectionData.items) {
        for (const locale of ['en', 'pl', 'es'] as const) {
          try {
            // Check if record exists
            const existing = await db
              .select()
              .from(homeContent)
              .where(
                sql`${homeContent.locale} = ${locale} AND ${homeContent.section} = ${sectionData.section} AND ${homeContent.key} = ${item.key}`
              )
              .limit(1)

            if (existing.length > 0) {
              // Update existing
              await db
                .update(homeContent)
                .set({
                  value: item[locale],
                  updatedAt: new Date(),
                })
                .where(
                  sql`${homeContent.locale} = ${locale} AND ${homeContent.section} = ${sectionData.section} AND ${homeContent.key} = ${item.key}`
                )
              updatedCount++
              console.log(
                `✅ Updated: ${locale} | ${sectionData.section} | ${item.key}`
              )
            } else {
              // Insert new
              await db.insert(homeContent).values({
                locale,
                section: sectionData.section,
                key: item.key,
                value: item[locale],
              })
              insertedCount++
              console.log(
                `✅ Inserted: ${locale} | ${sectionData.section} | ${item.key}`
              )
            }
          } catch (error) {
            console.error(
              `❌ Error with ${locale} | ${sectionData.section} | ${item.key}:`,
              error
            )
          }
        }
      }
    }

    console.log('🎉 SEO content population completed!')

    return NextResponse.json({
      success: true,
      message: 'SEO content populated successfully',
      statistics: {
        inserted: insertedCount,
        updated: updatedCount,
        total: insertedCount + updatedCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ SEO content population failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
