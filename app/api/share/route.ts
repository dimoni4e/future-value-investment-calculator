import { NextRequest, NextResponse } from 'next/server'
import { generateSEO } from '@/lib/seo'
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

    // If no parameters, return basic meta tags
    if (!initial && !monthly && !returnRate && !years) {
      return generateBasicMetaTags()
    }

    // Decode and validate parameters
    const urlParamsString = searchParams.toString()
    const decodedParams = decodeParamsFromUrl(`?${urlParamsString}`)
    const validatedParams = validateParams(decodedParams)

    // Calculate future value
    const result = calculateFutureValue({
      initialAmount: validatedParams.initialAmount,
      monthlyContribution: validatedParams.monthlyContribution,
      annualReturnRate: validatedParams.annualReturn / 100,
      timeHorizonYears: validatedParams.timeHorizon,
    })

    // Generate SEO data
    const seoData = generateSEO(
      validatedParams,
      undefined, // Use default currency
      result.futureValue,
      'en'
    )

    // Get base URL for absolute URLs
    const baseUrl = new URL(request.url).origin
    const shareUrl = `${baseUrl}/?${urlParamsString}`

    // Generate HTML response with meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}">
    <meta name="keywords" content="${seoData.keywords.join(', ')}">
    
    <!-- Open Graph Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${seoData.openGraph.title}">
    <meta property="og:description" content="${seoData.openGraph.description}">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:site_name" content="Future Value Calculator">
    <meta property="og:locale" content="en_US">
    <meta property="og:image" content="${baseUrl}/api/og?${urlParamsString}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${seoData.openGraph.title}">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoData.twitter.title}">
    <meta name="twitter:description" content="${seoData.twitter.description}">
    <meta name="twitter:site" content="@futurevaluecalc">
    <meta name="twitter:creator" content="@futurevaluecalc">
    <meta name="twitter:image" content="${baseUrl}/api/og?${urlParamsString}">
    <meta name="twitter:image:alt" content="${seoData.twitter.title}">
    
    <!-- Additional Meta Tags -->
    <meta name="author" content="Future Value Calculator">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#3B82F6">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${shareUrl}">
    
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Future Value Investment Calculator",
        "description": "${seoData.description.replace(/"/g, '\\"')}",
        "url": "${shareUrl}",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Compound interest calculations",
            "Interactive investment charts",
            "Multiple currency support",
            "Scenario planning",
            "Share investment plans"
        ],
        "provider": {
            "@type": "Organization",
            "name": "Future Value Calculator"
        }
    }
    </script>
    
    <!-- Auto-redirect to main app -->
    <script>
        // Redirect to main app after a short delay to allow crawlers to read meta tags
        setTimeout(function() {
            window.location.href = '${shareUrl}';
        }, 100);
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 2rem;
        }
        .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .loading {
            margin-top: 2rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📈 Future Value Calculator</div>
        <h1>${seoData.openGraph.title}</h1>
        <p>${seoData.openGraph.description}</p>
        <div class="loading">Redirecting to calculator...</div>
    </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error in /api/share:', error)
    return generateErrorResponse()
  }
}

function generateBasicMetaTags() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Growth Planner - Plan Your Financial Future</title>
    <meta name="description" content="Advanced financial growth planning platform with compound interest projections, scenario analysis, and interactive charts.">
    
    <!-- Open Graph Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Financial Growth Planner">
    <meta property="og:description" content="Plan your financial future with advanced compound interest calculations and interactive charts.">
    <meta property="og:site_name" content="Future Value Calculator">
    <meta property="og:locale" content="en_US">
    <meta property="og:image" content="/api/og">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Financial Growth Planner">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Financial Growth Planner">
    <meta name="twitter:description" content="Plan your financial future with compound interest projections.">
    <meta name="twitter:image" content="/api/og">
    <meta name="twitter:image:alt" content="Financial Growth Planner">>
    
    <script>
        setTimeout(function() {
            window.location.href = '/';
        }, 100);
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
    </style>
</head>
<body>
    <div>
        <h1>📈 Financial Growth Planner</h1>
        <p>Loading calculator...</p>
    </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}

function generateErrorResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Future Value Calculator</title>
    <meta name="description" content="An error occurred while generating the share preview.">
    
    <script>
        setTimeout(function() {
            window.location.href = '/';
        }, 2000);
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #ef4444;
            color: white;
            text-align: center;
        }
    </style>
</head>
<body>
    <div>
        <h1>⚠️ Error</h1>
        <p>Unable to generate share preview. Redirecting to main calculator...</p>
    </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 500,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
