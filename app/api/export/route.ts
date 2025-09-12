import { NextRequest, NextResponse } from 'next/server'
import { decodeParamsFromUrl, validateParams } from '@/lib/urlState'
import { calculateFutureValue } from '@/lib/finance'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract parameters from query string
    const initial = searchParams.get('initial')
    const monthly = searchParams.get('monthly')
    const returnRate = searchParams.get('return')
    const years = searchParams.get('years')
    const format = searchParams.get('format') || 'csv' // Default to CSV
    const currency = searchParams.get('currency') || 'USD'

    // Validate format
    if (!['csv', 'pdf'].includes(format.toLowerCase())) {
      return new NextResponse('Invalid format. Use csv or pdf.', {
        status: 400,
      })
    }

    // Use default values if no parameters provided
    let calculatorParams = {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      timeHorizon: 20,
    }

    // If parameters are provided, decode and validate them
    if (initial || monthly || returnRate || years) {
      const urlParamsString = searchParams.toString()
      const decodedParams = decodeParamsFromUrl(`?${urlParamsString}`)
      calculatorParams = validateParams(decodedParams)
    }

    // Calculate future value and year-by-year breakdown
    const result = calculateFutureValue({
      initialAmount: calculatorParams.initialAmount,
      monthlyContribution: calculatorParams.monthlyContribution,
      annualReturnRate: calculatorParams.annualReturn / 100,
      timeHorizonYears: calculatorParams.timeHorizon,
    })

    // Generate year-by-year data for export
    const yearlyData = []
    let currentValue = calculatorParams.initialAmount
    const monthlyRate = calculatorParams.annualReturn / 100 / 12

    for (let year = 0; year <= calculatorParams.timeHorizon; year++) {
      const yearStartValue =
        year === 0 ? calculatorParams.initialAmount : currentValue

      // Calculate value at end of year
      if (year > 0) {
        // Add monthly contributions and compound for 12 months
        for (let month = 1; month <= 12; month++) {
          currentValue =
            (currentValue + calculatorParams.monthlyContribution) *
            (1 + monthlyRate)
        }
      }

      const totalContributions =
        calculatorParams.initialAmount +
        year * 12 * calculatorParams.monthlyContribution
      const totalGrowth = currentValue - totalContributions

      yearlyData.push({
        year,
        startValue: Math.round(yearStartValue),
        endValue: Math.round(currentValue),
        totalContributions: Math.round(totalContributions),
        totalGrowth: Math.round(totalGrowth),
        annualGrowth:
          year === 0 ? 0 : Math.round(currentValue - yearStartValue),
      })
    }

    if (format.toLowerCase() === 'csv') {
      return generateCSVResponse(calculatorParams, result, yearlyData, currency)
    } else {
      return generatePDFResponse(calculatorParams, result, yearlyData, currency)
    }
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function generateCSVResponse(
  params: any,
  result: any,
  yearlyData: any[],
  currency: string
) {
  // CSV Header with summary
  const csvContent = [
    '# Future Value Investment Calculator Export',
    `# Generated on: ${new Date().toISOString()}`,
    `# Currency: ${currency}`,
    '',
    '# Input Parameters',
    `Initial Investment,${params.initialAmount}`,
    `Monthly Contribution,${params.monthlyContribution}`,
    `Annual Return Rate,%,${params.annualReturn}`,
    `Time Horizon (Years),${params.timeHorizon}`,
    '',
    '# Summary Results',
    `Final Future Value,${result.futureValue}`,
    `Total Contributions,${result.totalContributions}`,
    `Total Growth,${result.totalGrowth}`,
    `Return on Investment,%,${((result.totalGrowth / result.totalContributions) * 100).toFixed(2)}`,
    '',
    '# Year-by-Year Breakdown',
    'Year,Start Value,End Value,Total Contributions,Total Growth,Annual Growth',
    ...yearlyData.map(
      (data) =>
        `${data.year},${data.startValue},${data.endValue},${data.totalContributions},${data.totalGrowth},${data.annualGrowth}`
    ),
  ].join('\n')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `future-value-calculation-${timestamp}.csv`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}

function generatePDFResponse(
  params: any,
  result: any,
  yearlyData: any[],
  currency: string
) {
  // For this stub implementation, we'll generate a simple text-based PDF content
  // In a full implementation, you'd use a library like @react-pdf/renderer or puppeteer

  const pdfContent = [
    'Future Value Investment Calculator Report',
    '='.repeat(50),
    '',
    `Generated on: ${new Date().toLocaleString()}`,
    `Currency: ${currency}`,
    '',
    'INPUT PARAMETERS',
    '-'.repeat(20),
    `Initial Investment: ${currency} ${params.initialAmount.toLocaleString()}`,
    `Monthly Contribution: ${currency} ${params.monthlyContribution.toLocaleString()}`,
    `Annual Return Rate: ${params.annualReturn}%`,
    `Time Horizon: ${params.timeHorizon} years`,
    '',
    'SUMMARY RESULTS',
    '-'.repeat(20),
    `Final Future Value: ${currency} ${result.futureValue.toLocaleString()}`,
    `Total Contributions: ${currency} ${result.totalContributions.toLocaleString()}`,
    `Total Growth: ${currency} ${result.totalGrowth.toLocaleString()}`,
    `Return on Investment: ${((result.totalGrowth / result.totalContributions) * 100).toFixed(2)}%`,
    '',
    'YEAR-BY-YEAR BREAKDOWN',
    '-'.repeat(30),
    'Year | End Value      | Total Contributions | Total Growth',
    '-'.repeat(60),
    ...yearlyData.map(
      (data) =>
        `${data.year.toString().padStart(4)} | ${currency} ${data.endValue.toLocaleString().padStart(10)} | ${currency} ${data.totalContributions.toLocaleString().padStart(15)} | ${currency} ${data.totalGrowth.toLocaleString().padStart(10)}`
    ),
    '',
    'Note: This is a simplified PDF export. For a full PDF with charts and formatting,',
    'please use the CSV export and import into your preferred spreadsheet application.',
    '',
    'Generated by fvinvestcalc',
    process.env.NEXT_PUBLIC_BASE_URL || 'https://fvinvestcalc.com',
  ].join('\n')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `future-value-calculation-${timestamp}.pdf`

  // For this stub, we'll return plain text with PDF mime type
  // In production, you'd generate actual PDF binary content
  return new NextResponse(pdfContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}
