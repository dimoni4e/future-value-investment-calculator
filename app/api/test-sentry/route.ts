import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Simulate an error for testing Sentry integration
    throw new Error('This is a test error for Sentry integration')
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'This error has been logged to Sentry',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
