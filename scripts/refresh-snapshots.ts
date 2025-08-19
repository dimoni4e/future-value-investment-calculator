import { db } from '@/lib/db'
import {
  scenario,
  scenarioTrendingSnapshot,
  scenarioCategoryCounts,
} from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * Small utility to time async operations and log duration.
 */
async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const ms = Date.now() - start
    console.log(`[snapshots] ${label} completed in ${ms}ms`)
    return result
  } catch (err) {
    const ms = Date.now() - start
    console.error(`[snapshots] ${label} failed after ${ms}ms`, err)
    throw err
  }
}

/**
 * Refresh snapshot tables for trending scenarios and category counts.
 * Designed to be invoked by a cron (e.g., GitHub Action, Vercel cron, external scheduler).
 */
async function refreshTrending(limitPerLocale = 50) {
  const locales = ['en', 'pl', 'es']
  for (const locale of locales) {
    await time(`trending:${locale}:delete`, async () => {
      await db
        .delete(scenarioTrendingSnapshot)
        .where(eq(scenarioTrendingSnapshot.locale, locale as any))
    })

    await time(`trending:${locale}:insert`, async () => {
      await db.execute(sql`
        INSERT INTO scenario_trending_snapshot(locale, slug, rank, view_count)
        SELECT locale, slug, rn, view_count FROM (
          SELECT ${scenario.locale} as locale,
                 ${scenario.slug} as slug,
                 ${scenario.viewCount} as view_count,
                 row_number() OVER (PARTITION BY ${scenario.locale} ORDER BY ${scenario.viewCount} DESC) AS rn
          FROM ${scenario}
          WHERE ${scenario.isPublic} = true AND ${scenario.updatedAt} > NOW() - INTERVAL '7 days'
        ) s WHERE rn <= ${limitPerLocale};
      `)
    })
  }
}

async function refreshCategories() {
  const locales = ['en', 'pl', 'es']
  for (const locale of locales) {
    await time(`categories:${locale}:delete`, async () => {
      await db
        .delete(scenarioCategoryCounts)
        .where(eq(scenarioCategoryCounts.locale, locale as any))
    })

    // Coalesce NULL tag arrays to an empty array to avoid unnest on NULL issues
    await time(`categories:${locale}:insert`, async () => {
      await db.execute(sql`
        INSERT INTO scenario_category_counts(locale, category, count)
        SELECT locale, category, count(*) FROM (
          SELECT ${scenario.locale} as locale,
                 unnest(coalesce(${scenario.tags}, ARRAY[]::text[])) as category
          FROM ${scenario}
          WHERE ${scenario.isPublic} = true
        ) t
        WHERE locale = ${locale}
        GROUP BY locale, category;
      `)
    })
  }
}

export async function refreshSnapshots() {
  console.log('[snapshots] Starting refresh ...')
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set (required by refreshSnapshots)')
  }
  const started = Date.now()
  await refreshTrending()
  await refreshCategories()
  const ms = Date.now() - started
  console.log(`[snapshots] All snapshots refreshed in ${ms}ms`)
}

if (require.main === module) {
  refreshSnapshots()
    .then(() => {
      console.log('[snapshots] Done')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[snapshots] Failed', err)
      process.exit(1)
    })
}
