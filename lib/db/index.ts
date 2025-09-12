import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

/**
 * Dual driver selection:
 *  - Neon serverless (hostname contains 'neon.tech') via HTTP driver
 *  - Standard/self‑hosted Postgres via node-postgres Pool
 */
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

let db: ReturnType<typeof drizzleNeon | typeof drizzlePg>

try {
  const host = new URL(databaseUrl).hostname
  if (host.includes('neon.tech')) {
    const sql = neon(databaseUrl)
    db = drizzleNeon(sql, { schema })
  } else {
    const useSSL = (process.env.DATABASE_SSL || '').toLowerCase() === 'true'
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    })
    db = drizzlePg(pool, { schema })
  }
} catch (err) {
  throw new Error(
    'Failed to initialize database driver: ' + (err as Error).message
  )
}

export { db }
