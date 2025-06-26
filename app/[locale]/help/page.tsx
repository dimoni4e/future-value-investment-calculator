import { useTranslations } from 'next-intl'
import { Metadata } from 'next'
import {
  Calculator,
  TrendingUp,
  FileText,
  Share2,
  HelpCircle,
  BookOpen,
} from 'lucide-react'

interface HelpPageProps {
  params: { locale: string }
}

export async function generateMetadata({
  params: { locale },
}: HelpPageProps): Promise<Metadata> {
  return {
    title:
      locale === 'es'
        ? 'Ayuda - Calculadora de Valor Futuro'
        : locale === 'pl'
          ? 'Pomoc - Kalkulator Wartości Przyszłej'
          : 'Help - Future Value Calculator',
    description:
      locale === 'es'
        ? 'Obtén ayuda para usar la calculadora de valor futuro de inversiones'
        : locale === 'pl'
          ? 'Uzyskaj pomoc w korzystaniu z kalkulatora wartości przyszłej inwestycji'
          : 'Get help using the Future Value Investment Calculator',
  }
}

export default function HelpPage({ params: { locale } }: HelpPageProps) {
  const t = useTranslations('help')

  const faqItems = [
    {
      icon: Calculator,
      question:
        locale === 'es'
          ? '¿Cómo uso la calculadora?'
          : locale === 'pl'
            ? 'Jak korzystać z kalkulatora?'
            : 'How do I use the calculator?',
      answer:
        locale === 'es'
          ? 'Ingresa tu inversión inicial, contribución mensual, tasa de retorno anual esperada y horizonte temporal. La calculadora mostrará automáticamente el valor futuro de tu inversión.'
          : locale === 'pl'
            ? 'Wprowadź swoją początkową inwestycję, miesięczny wkład, oczekiwaną roczną stopę zwrotu i horyzont czasowy. Kalkulator automatycznie pokaże przyszłą wartość twojej inwestycji.'
            : "Enter your initial investment, monthly contribution, expected annual return rate, and time horizon. The calculator will automatically show your investment's future value.",
    },
    {
      icon: TrendingUp,
      question:
        locale === 'es'
          ? '¿Qué es el interés compuesto?'
          : locale === 'pl'
            ? 'Czym jest procent składany?'
            : 'What is compound interest?',
      answer:
        locale === 'es'
          ? 'El interés compuesto es cuando ganas retornos no solo sobre tu inversión original, sino también sobre los retornos anteriores. Es el poder de hacer que tu dinero crezca exponencialmente con el tiempo.'
          : locale === 'pl'
            ? 'Procent składany to sytuacja, gdy zarabiasz zwroty nie tylko z początkowej inwestycji, ale także z wcześniejszych zwrotów. To siła eksponencjalnego wzrostu pieniędzy w czasie.'
            : "Compound interest is when you earn returns not just on your original investment, but also on previous returns. It's the power of making your money grow exponentially over time.",
    },
    {
      icon: FileText,
      question:
        locale === 'es'
          ? '¿Puedo exportar mis resultados?'
          : locale === 'pl'
            ? 'Czy mogę eksportować moje wyniki?'
            : 'Can I export my results?',
      answer:
        locale === 'es'
          ? 'Sí, puedes exportar tus resultados de cálculo en formato CSV o PDF usando el botón de exportación después de ejecutar una simulación.'
          : locale === 'pl'
            ? 'Tak, możesz eksportować wyniki obliczeń w formacie CSV lub PDF używając przycisku eksportu po uruchomieniu symulacji.'
            : 'Yes, you can export your calculation results in CSV or PDF format using the export button after running a simulation.',
    },
    {
      icon: Share2,
      question:
        locale === 'es'
          ? '¿Cómo comparto mis cálculos?'
          : locale === 'pl'
            ? 'Jak udostępnić moje obliczenia?'
            : 'How do I share my calculations?',
      answer:
        locale === 'es'
          ? 'Usa los botones de compartir para enviar tus cálculos por redes sociales o copiar el enlace para compartir con otros.'
          : locale === 'pl'
            ? 'Użyj przycisków udostępniania, aby wysłać swoje obliczenia przez media społecznościowe lub skopiować link do udostępnienia innym.'
            : 'Use the share buttons to post your calculations on social media or copy the link to share with others.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {locale === 'es'
              ? 'Centro de Ayuda'
              : locale === 'pl'
                ? 'Centrum Pomocy'
                : 'Help Center'}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Encuentra respuestas a preguntas frecuentes sobre el uso de nuestra calculadora de valor futuro de inversiones.'
              : locale === 'pl'
                ? 'Znajdź odpowiedzi na często zadawane pytania dotyczące korzystania z naszego kalkulatora wartości przyszłej inwestycji.'
                : 'Find answers to frequently asked questions about using our Future Value Investment Calculator.'}
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {item.question}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {locale === 'es'
                ? '¿Necesitas más ayuda?'
                : locale === 'pl'
                  ? 'Potrzebujesz więcej pomocy?'
                  : 'Need more help?'}
            </h3>
            <p className="text-slate-600 mb-6">
              {locale === 'es'
                ? 'Visita nuestra página de escenarios para ver ejemplos prácticos de cálculos de inversión.'
                : locale === 'pl'
                  ? 'Odwiedź naszą stronę scenariuszy, aby zobaczyć praktyczne przykłady obliczeń inwestycyjnych.'
                  : 'Visit our scenarios page to see practical examples of investment calculations.'}
            </p>
            <a
              href={locale === 'en' ? '/scenario' : `/${locale}/scenario`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              {locale === 'es'
                ? 'Ver Escenarios'
                : locale === 'pl'
                  ? 'Zobacz Scenariusze'
                  : 'View Scenarios'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
