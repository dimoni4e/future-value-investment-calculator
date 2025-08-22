// Simple Neon Postgres connectivity & schema sanity check.
// Run with: `npm run db:health` (ensure DATABASE_URL is set in .env.local or shell)
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

// Health check: verifies connectivity, basic schema presence, and simple latency.
async function main() {
  const start = Date.now()
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error(
      '❌ DATABASE_URL is not set. Create a .env.local with DATABASE_URL=...'
    )
    process.exit(1)
  }

  const masked = url.replace(/:[^:@/]+@/, ':*****@')
  console.log('🔌 Connecting to database:', masked)

  try {
    const sql = neon(url)
    const [{ now, version }] = (await sql`SELECT now(), version()`) as any
    console.log('✅ Connected. Server time:', now, '| Version:', version)

    let scenarioCount: number | null = null
    let pagesCount: number | null = null
    try {
      const rows =
        (await sql`SELECT count(*)::int AS count FROM scenario`) as any
      scenarioCount = rows?.[0]?.count ?? null
    } catch {
      console.warn('⚠️  scenario table not found (might be before migrations).')
    }
    try {
      const rows = (await sql`SELECT count(*)::int AS count FROM pages`) as any
      pagesCount = rows?.[0]?.count ?? null
    } catch {
      // ignore missing pages table
    }

    console.log('📊 Counts:', { scenario: scenarioCount, pages: pagesCount })

    const probes: number[] = []
    for (let i = 0; i < 3; i++) {
      const pStart = performance.now()
      await sql`SELECT 1`
      probes.push(Number((performance.now() - pStart).toFixed(2)))
    }
    console.log('⏱  Latency ms (SELECT 1 x3):', probes)
    console.log(`🏁 Done in ${(Date.now() - start).toFixed(0)}ms`)
  } catch (err: any) {
    console.error('❌ Connection / query failed:', err?.message || err)
    if (err?.response?.status) {
      console.error('HTTP status:', err.response.status)
    }
    process.exit(2)
  }
}

main()
