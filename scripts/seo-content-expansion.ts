import { db } from '../lib/db'
import { homeContent } from '../lib/db/schema'

/**
 * SEO Content Expansion Script
 * Adds comprehensive content to homeContent table for main page optimization
 */

const seoSections = [
  // Hero Section Enhancement
  {
    section: 'hero',
    key: 'main_headline',
    content: {
      en: 'Calculate Your Financial Future with Precision - Free Investment Calculator',
      pl: 'Oblicz Swoją Finansową Przyszłość z Precyzją - Darmowy Kalkulator Inwestycji',
      es: 'Calcula Tu Futuro Financiero con Precisión - Calculadora de Inversión Gratuita',
    },
  },
  {
    section: 'hero',
    key: 'sub_headline',
    content: {
      en: 'Plan your retirement, track compound interest growth, and make informed investment decisions with our advanced future value calculator. Trusted by over 50,000 investors worldwide.',
      pl: 'Planuj swoją emeryturę, śledź wzrost składanych odsetek i podejmuj świadome decyzje inwestycyjne dzięki naszemu zaawansowanemu kalkulatorowi wartości przyszłej. Zaufało nam ponad 50 000 inwestorów na całym świecie.',
      es: 'Planifica tu jubilación, rastrea el crecimiento del interés compuesto y toma decisiones de inversión informadas con nuestra calculadora avanzada de valor futuro. Confiado por más de 50,000 inversores en todo el mundo.',
    },
  },
  {
    section: 'hero',
    key: 'cta_primary',
    content: {
      en: "Start Calculating Now - It's Free",
      pl: 'Zacznij Liczyć Teraz - To Bezpłatne',
      es: 'Comenzar a Calcular Ahora - Es Gratis',
    },
  },

  // Benefits Section (New)
  {
    section: 'benefits',
    key: 'title',
    content: {
      en: 'Why Choose Our Investment Calculator?',
      pl: 'Dlaczego Wybrać Nasz Kalkulator Inwestycji?',
      es: '¿Por Qué Elegir Nuestra Calculadora de Inversión?',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_1_title',
    content: {
      en: 'Accurate Compound Interest Calculations',
      pl: 'Dokładne Obliczenia Składanych Odsetek',
      es: 'Cálculos Precisos de Interés Compuesto',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_1_description',
    content: {
      en: 'Our advanced algorithm considers monthly contributions, annual returns, and time horizons to provide precise future value projections for your investments.',
      pl: 'Nasz zaawansowany algorytm uwzględnia miesięczne składki, roczne zwroty i horyzonty czasowe, aby zapewnić precyzyjne prognozy wartości przyszłej Twoich inwestycji.',
      es: 'Nuestro algoritmo avanzado considera contribuciones mensuales, rendimientos anuales y horizontes temporales para proporcionar proyecciones precisas del valor futuro de tus inversiones.',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_2_title',
    content: {
      en: 'Multiple Investment Scenarios',
      pl: 'Wielokrotne Scenariusze Inwestycyjne',
      es: 'Múltiples Escenarios de Inversión',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_2_description',
    content: {
      en: 'Compare different investment strategies including conservative retirement planning, aggressive growth investing, and balanced portfolio approaches.',
      pl: 'Porównaj różne strategie inwestycyjne, w tym konserwatywne planowanie emerytalne, agresywne inwestowanie wzrostowe i zrównoważone podejścia portfelowe.',
      es: 'Compara diferentes estrategias de inversión incluyendo planificación conservadora de jubilación, inversión agresiva de crecimiento y enfoques de cartera equilibrada.',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_3_title',
    content: {
      en: 'Visual Growth Charts & Analytics',
      pl: 'Wizualne Wykresy Wzrostu i Analityka',
      es: 'Gráficos de Crecimiento Visual y Análisis',
    },
  },
  {
    section: 'benefits',
    key: 'benefit_3_description',
    content: {
      en: 'Interactive charts show your investment growth over time, helping you understand the power of compound interest and make data-driven financial decisions.',
      pl: 'Interaktywne wykresy pokazują wzrost Twoich inwestycji w czasie, pomagając zrozumieć siłę składanych odsetek i podejmować finansowe decyzje oparte na danych.',
      es: 'Los gráficos interactivos muestran el crecimiento de tu inversión a lo largo del tiempo, ayudándote a entender el poder del interés compuesto y tomar decisiones financieras basadas en datos.',
    },
  },

  // How It Works Section (New)
  {
    section: 'how_it_works',
    key: 'title',
    content: {
      en: 'How Our Investment Calculator Works',
      pl: 'Jak Działa Nasz Kalkulator Inwestycji',
      es: 'Cómo Funciona Nuestra Calculadora de Inversión',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_1_title',
    content: {
      en: '1. Enter Your Investment Details',
      pl: '1. Wprowadź Szczegóły Swojej Inwestycji',
      es: '1. Ingresa los Detalles de Tu Inversión',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_1_description',
    content: {
      en: 'Input your initial investment amount, monthly contributions, expected annual return rate, and investment time horizon.',
      pl: 'Wprowadź kwotę początkowej inwestycji, miesięczne składki, oczekiwaną roczną stopę zwrotu i horyzont inwestycyjny.',
      es: 'Ingresa tu monto de inversión inicial, contribuciones mensuales, tasa de rendimiento anual esperada y horizonte temporal de inversión.',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_2_title',
    content: {
      en: '2. View Instant Calculations',
      pl: '2. Zobacz Natychmiastowe Obliczenia',
      es: '2. Ver Cálculos Instantáneos',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_2_description',
    content: {
      en: 'Our calculator instantly computes your future value using compound interest formulas, showing total contributions vs. investment growth.',
      pl: 'Nasz kalkulator natychmiast oblicza Twoją wartość przyszłą za pomocą wzorów składanych odsetek, pokazując całkowite składki w porównaniu z wzrostem inwestycji.',
      es: 'Nuestra calculadora computa instantáneamente tu valor futuro usando fórmulas de interés compuesto, mostrando contribuciones totales vs. crecimiento de inversión.',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_3_title',
    content: {
      en: '3. Analyze & Plan',
      pl: '3. Analizuj i Planuj',
      es: '3. Analizar y Planificar',
    },
  },
  {
    section: 'how_it_works',
    key: 'step_3_description',
    content: {
      en: 'Study the interactive growth chart, compare different scenarios, and adjust your investment strategy for optimal results.',
      pl: 'Przestudiuj interaktywny wykres wzrostu, porównaj różne scenariusze i dostosuj swoją strategię inwestycyjną dla optymalnych rezultatów.',
      es: 'Estudia el gráfico de crecimiento interactivo, compara diferentes escenarios y ajusta tu estrategia de inversión para resultados óptimos.',
    },
  },

  // Investment Types Section (New)
  {
    section: 'investment_types',
    key: 'title',
    content: {
      en: 'Popular Investment Scenarios to Calculate',
      pl: 'Popularne Scenariusze Inwestycyjne do Obliczenia',
      es: 'Escenarios de Inversión Populares para Calcular',
    },
  },
  {
    section: 'investment_types',
    key: 'retirement_title',
    content: {
      en: 'Retirement Planning Calculator',
      pl: 'Kalkulator Planowania Emerytury',
      es: 'Calculadora de Planificación de Jubilación',
    },
  },
  {
    section: 'investment_types',
    key: 'retirement_description',
    content: {
      en: 'Plan for your golden years with conservative, long-term investment strategies. Calculate how much you need to save monthly for a comfortable retirement.',
      pl: 'Planuj swoje złote lata za pomocą konserwatywnych, długoterminowych strategii inwestycyjnych. Oblicz, ile musisz oszczędzać miesięcznie na wygodną emeryturę.',
      es: 'Planifica tus años dorados con estrategias de inversión conservadoras a largo plazo. Calcula cuánto necesitas ahorrar mensualmente para una jubilación cómoda.',
    },
  },
  {
    section: 'investment_types',
    key: 'growth_title',
    content: {
      en: 'Aggressive Growth Investment Calculator',
      pl: 'Kalkulator Agresywnych Inwestycji Wzrostowych',
      es: 'Calculadora de Inversión de Crecimiento Agresivo',
    },
  },
  {
    section: 'investment_types',
    key: 'growth_description',
    content: {
      en: 'Maximize your wealth with high-return investment strategies. Perfect for young investors with longer time horizons and higher risk tolerance.',
      pl: 'Maksymalizuj swoje bogactwo dzięki strategiom inwestycyjnym o wysokich zwrotach. Idealne dla młodych inwestorów z dłuższymi horyzontami czasowymi i wyższą tolerancją ryzyka.',
      es: 'Maximiza tu riqueza con estrategias de inversión de alto rendimiento. Perfecto para inversores jóvenes con horizontes temporales más largos y mayor tolerancia al riesgo.',
    },
  },
  {
    section: 'investment_types',
    key: 'emergency_title',
    content: {
      en: 'Emergency Fund Calculator',
      pl: 'Kalkulator Funduszu Awaryjnego',
      es: 'Calculadora de Fondo de Emergencia',
    },
  },
  {
    section: 'investment_types',
    key: 'emergency_description',
    content: {
      en: 'Build a safety net with low-risk, liquid investments. Calculate how to grow your emergency fund while maintaining accessibility.',
      pl: 'Zbuduj sieć bezpieczeństwa dzięki inwestycjom o niskim ryzyku i wysokiej płynności. Oblicz, jak zwiększyć swój fundusz awaryjny, zachowując dostępność.',
      es: 'Construye una red de seguridad con inversiones de bajo riesgo y líquidas. Calcula cómo hacer crecer tu fondo de emergencia manteniendo la accesibilidad.',
    },
  },

  // FAQ Section (New)
  {
    section: 'faq',
    key: 'title',
    content: {
      en: 'Frequently Asked Questions About Investment Calculations',
      pl: 'Często Zadawane Pytania o Obliczenia Inwestycyjne',
      es: 'Preguntas Frecuentes Sobre Cálculos de Inversión',
    },
  },
  {
    section: 'faq',
    key: 'q1_question',
    content: {
      en: 'How accurate are the investment calculator results?',
      pl: 'Jak dokładne są wyniki kalkulatora inwestycji?',
      es: '¿Qué tan precisos son los resultados de la calculadora de inversión?',
    },
  },
  {
    section: 'faq',
    key: 'q1_answer',
    content: {
      en: 'Our calculator uses proven compound interest formulas and provides mathematically accurate projections based on your inputs. However, actual investment returns may vary due to market conditions, fees, and other factors.',
      pl: 'Nasz kalkulator używa sprawdzonych wzorów składanych odsetek i zapewnia matematycznie dokładne prognozy oparte na Twoich danych. Jednak rzeczywiste zwroty z inwestycji mogą się różnić ze względu na warunki rynkowe, opłaty i inne czynniki.',
      es: 'Nuestra calculadora utiliza fórmulas probadas de interés compuesto y proporciona proyecciones matemáticamente precisas basadas en tus entradas. Sin embargo, los rendimientos reales de inversión pueden variar debido a condiciones del mercado, tarifas y otros factores.',
    },
  },
  {
    section: 'faq',
    key: 'q2_question',
    content: {
      en: 'What is compound interest and why is it important?',
      pl: 'Co to są składane odsetki i dlaczego są ważne?',
      es: '¿Qué es el interés compuesto y por qué es importante?',
    },
  },
  {
    section: 'faq',
    key: 'q2_answer',
    content: {
      en: 'Compound interest is earning interest on both your original investment and previously earned interest. It\'s often called the "eighth wonder of the world" because it can dramatically accelerate wealth building over time.',
      pl: 'Składane odsetki to zarabianie odsetek zarówno od pierwotnej inwestycji, jak i od wcześniej zarobionych odsetek. Często nazywane są "ósmym cudem świata", ponieważ mogą dramatycznie przyspieszyć budowanie bogactwa w czasie.',
      es: 'El interés compuesto es ganar interés tanto en tu inversión original como en el interés previamente ganado. A menudo se le llama la "octava maravilla del mundo" porque puede acelerar dramáticamente la construcción de riqueza a lo largo del tiempo.',
    },
  },
  {
    section: 'faq',
    key: 'q3_question',
    content: {
      en: 'Can I save and share my investment scenarios?',
      pl: 'Czy mogę zapisać i udostępnić swoje scenariusze inwestycyjne?',
      es: '¿Puedo guardar y compartir mis escenarios de inversión?',
    },
  },
  {
    section: 'faq',
    key: 'q3_answer',
    content: {
      en: 'Yes! You can create custom investment scenarios, save them for future reference, and share them with others. Our platform also includes pre-built scenarios for common investment goals.',
      pl: 'Tak! Możesz tworzyć niestandardowe scenariusze inwestycyjne, zapisywać je na przyszłość i udostępniać innym. Nasza platforma zawiera również gotowe scenariusze dla typowych celów inwestycyjnych.',
      es: '¡Sí! Puedes crear escenarios de inversión personalizados, guardarlos para referencia futura y compartirlos con otros. Nuestra plataforma también incluye escenarios predefinidos para objetivos de inversión comunes.',
    },
  },

  // Trust Signals Section (New)
  {
    section: 'trust_signals',
    key: 'title',
    content: {
      en: 'Trusted by Investors Worldwide',
      pl: 'Zaufany przez Inwestorów na Całym Świecie',
      es: 'Confiado por Inversores en Todo el Mundo',
    },
  },
  {
    section: 'trust_signals',
    key: 'users_count',
    content: {
      en: '50,000+',
      pl: '50,000+',
      es: '50,000+',
    },
  },
  {
    section: 'trust_signals',
    key: 'users_label',
    content: {
      en: 'Active Users',
      pl: 'Aktywni Użytkownicy',
      es: 'Usuarios Activos',
    },
  },
  {
    section: 'trust_signals',
    key: 'calculations_count',
    content: {
      en: '1M+',
      pl: '1M+',
      es: '1M+',
    },
  },
  {
    section: 'trust_signals',
    key: 'calculations_label',
    content: {
      en: 'Calculations Performed',
      pl: 'Wykonanych Obliczeń',
      es: 'Cálculos Realizados',
    },
  },
  {
    section: 'trust_signals',
    key: 'accuracy_rate',
    content: {
      en: '99.9%',
      pl: '99.9%',
      es: '99.9%',
    },
  },
  {
    section: 'trust_signals',
    key: 'accuracy_label',
    content: {
      en: 'Calculation Accuracy',
      pl: 'Dokładność Obliczeń',
      es: 'Precisión de Cálculo',
    },
  },

  // SEO Meta Content
  {
    section: 'seo',
    key: 'meta_title',
    content: {
      en: 'Investment Calculator - Future Value & Compound Interest Calculator | Free Tool',
      pl: 'Kalkulator Inwestycji - Kalkulator Wartości Przyszłej i Składanych Odsetek | Darmowe Narzędzie',
      es: 'Calculadora de Inversión - Calculadora de Valor Futuro e Interés Compuesto | Herramienta Gratuita',
    },
  },
  {
    section: 'seo',
    key: 'meta_description',
    content: {
      en: 'Free investment calculator for future value projections. Calculate compound interest, retirement savings, and investment growth with our advanced financial planning tool. Start planning your financial future today!',
      pl: 'Darmowy kalkulator inwestycji do prognozowania wartości przyszłej. Oblicz składane odsetki, oszczędności emerytalne i wzrost inwestycji za pomocą naszego zaawansowanego narzędzia planowania finansowego. Zacznij planować swoją finansową przyszłość już dziś!',
      es: 'Calculadora de inversión gratuita para proyecciones de valor futuro. Calcula interés compuesto, ahorros de jubilación y crecimiento de inversión con nuestra herramienta avanzada de planificación financiera. ¡Comienza a planificar tu futuro financiero hoy!',
    },
  },
  {
    section: 'seo',
    key: 'keywords',
    content: {
      en: 'investment calculator, compound interest calculator, future value calculator, retirement planning, financial calculator, investment growth, savings calculator, wealth building, financial planning tool, investment projections',
      pl: 'kalkulator inwestycji, kalkulator składanych odsetek, kalkulator wartości przyszłej, planowanie emerytury, kalkulator finansowy, wzrost inwestycji, kalkulator oszczędności, budowanie bogactwa, narzędzie planowania finansowego, prognozy inwestycyjne',
      es: 'calculadora de inversión, calculadora de interés compuesto, calculadora de valor futuro, planificación de jubilación, calculadora financiera, crecimiento de inversión, calculadora de ahorros, construcción de riqueza, herramienta de planificación financiera, proyecciones de inversión',
    },
  },
]

async function insertSEOContent() {
  console.log('🚀 Starting SEO content insertion...')

  for (const sectionData of seoSections) {
    for (const [locale, value] of Object.entries(sectionData.content)) {
      try {
        await db
          .insert(homeContent)
          .values({
            locale: locale as 'en' | 'pl' | 'es',
            section: sectionData.section,
            key: sectionData.key,
            value: value,
          })
          .onConflictDoUpdate({
            target: [homeContent.locale, homeContent.section, homeContent.key],
            set: {
              value: value,
              updatedAt: new Date(),
            },
          })

        console.log(
          `✅ Inserted/Updated: ${locale} | ${sectionData.section} | ${sectionData.key}`
        )
      } catch (error) {
        console.error(
          `❌ Error inserting ${locale} | ${sectionData.section} | ${sectionData.key}:`,
          error
        )
      }
    }
  }

  console.log('🎉 SEO content insertion completed!')
}

export { insertSEOContent, seoSections }
