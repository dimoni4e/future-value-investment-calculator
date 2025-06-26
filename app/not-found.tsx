import Link from 'next/link'
import { Search, Home, Calculator } from 'lucide-react'

export default function NotFound() {
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
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        {/* Helpful Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/"
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Home className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-900">Home</span>
            <span className="text-sm text-gray-500">Back to calculator</span>
          </Link>

          <Link
            href="/scenario"
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
          >
            <Calculator className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-900">Scenarios</span>
            <span className="text-sm text-gray-500">Browse examples</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Looking for investment scenarios?
          </h3>
          <p className="text-gray-600 mb-4">
            We have predefined investment scenarios to help you get started with
            your financial planning.
          </p>
          <Link
            href="/scenario"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Scenarios
          </Link>
        </div>
      </div>
    </div>
  )
}
