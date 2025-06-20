'use client'

import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateShareableUrl, type CalculatorParams } from '@/lib/urlState'
import { useTranslations } from 'next-intl'

interface ExportButtonProps {
  calculatorParams: CalculatorParams
  currency?: string
}

const ExportButton: React.FC<ExportButtonProps> = ({
  calculatorParams,
  currency = 'USD',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const t = useTranslations('export')

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    setIsOpen(false)

    try {
      // Generate URL parameters from current calculator state
      const urlParams = new URLSearchParams()
      urlParams.set('initial', calculatorParams.initialAmount.toString())
      urlParams.set('monthly', calculatorParams.monthlyContribution.toString())
      urlParams.set('return', calculatorParams.annualReturn.toString())
      urlParams.set('years', calculatorParams.timeHorizon.toString())
      urlParams.set('currency', currency)
      urlParams.set('format', format)

      // Create download URL
      const exportUrl = `/api/export?${urlParams.toString()}`

      // Trigger download by creating a temporary link
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = '' // Let the server set the filename via Content-Disposition
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      // You could add toast notification here
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        size="sm"
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? t('exporting') : t('export')}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
          <div className="p-1">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>{t('downloadCsv')}</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>{t('downloadPdf')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default ExportButton
