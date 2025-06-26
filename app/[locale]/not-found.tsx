import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Search, Home, Calculator, HelpCircle } from 'lucide-react'

interface Props {
  params: {
    locale: string
  }
}

export default async function NotFound({ params }: Props) {
  const { locale } = params

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-200 mb-4">404</div>
          <Search className="h-16 w-16 text-blue-400 mx-auto" />
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {locale === 'es'
            ? 'Página No Encontrada'
            : locale === 'pl'
              ? 'Strona Nie Znaleziona'
              : 'Page Not Found'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {locale === 'es'
            ? 'La página que buscas no existe o pudo haber sido movida.'
            : locale === 'pl'
              ? 'Strona, której szukasz, nie istnieje lub mogła zostać przeniesiona.'
              : "The page you're looking for doesn't exist or may have been moved."}
        </p>

        {/* Helpful Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href={locale === 'en' ? '/' : `/${locale}`}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Home className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-900">
              {locale === 'es' ? 'Inicio' : locale === 'pl' ? 'Główna' : 'Home'}
            </span>
            <span className="text-sm text-gray-500">
              {locale === 'es'
                ? 'Volver a la calculadora'
                : locale === 'pl'
                  ? 'Powrót do kalkulatora'
                  : 'Back to calculator'}
            </span>
          </Link>

          <Link
            href={locale === 'en' ? '/scenarios' : `/${locale}/scenarios`}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Calculator className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-900">
              {locale === 'es'
                ? 'Escenarios'
                : locale === 'pl'
                  ? 'Scenariusze'
                  : 'Scenarios'}
            </span>
            <span className="text-sm text-gray-500">
              {locale === 'es'
                ? 'Explorar ejemplos'
                : locale === 'pl'
                  ? 'Przeglądaj przykłady'
                  : 'Browse examples'}
            </span>
          </Link>

          <Link
            href={locale === 'en' ? '/help' : `/${locale}/help`}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
          >
            <HelpCircle className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-900">
              {locale === 'es' ? 'Ayuda' : locale === 'pl' ? 'Pomoc' : 'Help'}
            </span>
            <span className="text-sm text-gray-500">
              {locale === 'es'
                ? 'Obtener asistencia'
                : locale === 'pl'
                  ? 'Uzyskaj pomoc'
                  : 'Get assistance'}
            </span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {locale === 'es'
              ? '¿Buscas escenarios de inversión?'
              : locale === 'pl'
                ? 'Szukasz scenariuszy inwestycyjnych?'
                : 'Looking for investment scenarios?'}
          </h3>
          <p className="text-gray-600 mb-4">
            {locale === 'es'
              ? 'Tenemos escenarios de inversión predefinidos para ayudarte a comenzar con tu planificación financiera.'
              : locale === 'pl'
                ? 'Mamy predefiniowane scenariusze inwestycyjne, które pomogą Ci rozpocząć planowanie finansowe.'
                : 'We have predefined investment scenarios to help you get started with your financial planning.'}
          </p>
          <Link
            href={locale === 'en' ? '/scenarios' : `/${locale}/scenarios`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {locale === 'es'
              ? 'Explorar Escenarios'
              : locale === 'pl'
                ? 'Przeglądaj Scenariusze'
                : 'Explore Scenarios'}
          </Link>
        </div>
      </div>
    </div>
  )
}
