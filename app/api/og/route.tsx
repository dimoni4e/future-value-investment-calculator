import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
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

    // Default values for when no parameters are provided
    let calculatorParams = {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      timeHorizon: 20,
    }

    let result = {
      futureValue: 455941,
      totalContributions: 130000,
      totalGrowth: 325941,
    }

    // If parameters are provided, decode and use them
    if (initial || monthly || returnRate || years) {
      try {
        const urlParamsString = searchParams.toString()
        const decodedParams = decodeParamsFromUrl(`?${urlParamsString}`)
        calculatorParams = validateParams(decodedParams)

        result = calculateFutureValue({
          initialAmount: calculatorParams.initialAmount,
          monthlyContribution: calculatorParams.monthlyContribution,
          annualReturnRate: calculatorParams.annualReturn / 100,
          timeHorizonYears: calculatorParams.timeHorizon,
        })
      } catch (error) {
        console.error('Error processing parameters:', error)
        // Use default values on error
      }
    }

    // Format numbers for display
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount)
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            background:
              'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <span
            style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}
          >
            📈
          </span>
          <span
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#e2e8f0',
              display: 'block',
              marginBottom: '32px',
            }}
          >
            Future Value Calculator
          </span>
          <span
            style={{
              fontSize: '24px',
              color: '#86efac',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Future Value
          </span>
          <span
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#22c55e',
              display: 'block',
              marginBottom: '20px',
            }}
          >
            {formatCurrency(result.futureValue)}
          </span>
          <span
            style={{ fontSize: '18px', color: '#94a3b8', display: 'block' }}
          >
            Initial: {formatCurrency(calculatorParams.initialAmount)} | Monthly:{' '}
            {formatCurrency(calculatorParams.monthlyContribution)} |{' '}
            {calculatorParams.annualReturn}% return over{' '}
            {calculatorParams.timeHorizon} years
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
          <div style={{ fontSize: '40px', fontWeight: '700' }}>
            Future Value Calculator
          </div>
          <div
            style={{ fontSize: '20px', marginTop: '20px', color: '#94a3b8' }}
          >
            Plan your financial future
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
