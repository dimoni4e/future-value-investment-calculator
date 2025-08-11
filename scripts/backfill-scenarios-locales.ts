import 'dotenv/config'
/*
  Backfill script: ensure each unique scenario slug exists for all supported locales (en, pl, es)
  and optionally re-localize existing rows.

  Usage examples:
    - Populate missing locales only:
        npm run db:backfill-locales
    - Force re-localization (rewrite name/description) for all locales:
        npm run db:backfill-locales -- --force
    - Limit to specific locales (comma-separated):
        npm run db:backfill-locales -- --locales=pl,es
    - Combine:
        npm run db:backfill-locales -- --force --locales=pl
*/
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { and, eq } from 'drizzle-orm'
import {
  generateLocalizedScenarioName,
  generateLocalizedScenarioDescription,
} from '../lib/scenarioUtils'

async function run() {
  // Load environment variables early (support .env, .env.local, .env.development)
  const candidates = [
    process.env.DOTENV_PATH,
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env.development'),
  ].filter(Boolean) as string[]

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p })
      break
    }
  }

  // Import DB-related modules after env is loaded
  const { db } = await import('../lib/db')
  const { scenario } = await import('../lib/db/schema')
  const { getSupportedLocales, createScenario } = await import(
    '../lib/db/queries'
  )
  // Parse CLI args
  const args = process.argv.slice(2)
  const force = args.includes('--force') || process.env.FORCE_UPDATE === '1'
  const localesArg = args.find((a) => a.startsWith('--locales='))
  const localesFilter = localesArg
    ? (localesArg.split('=')[1].split(',') as Array<'en' | 'pl' | 'es'>)
    : null

  const locales = (
    localesFilter || (getSupportedLocales() as Array<'en' | 'pl' | 'es'>)
  ).filter((lc) => ['en', 'pl', 'es'].includes(lc)) as Array<'en' | 'pl' | 'es'>

  // Get unique slugs from any locale
  const rows = await db
    .select({ slug: scenario.slug })
    .from(scenario)
    .groupBy(scenario.slug)

  for (const { slug } of rows) {
    // Fetch one row to get params
    const [base] = await db
      .select()
      .from(scenario)
      .where(eq(scenario.slug, slug))
      .limit(1)

    if (!base) continue

    const params = {
      initialAmount: Number(base.initialAmount),
      monthlyContribution: Number(base.monthlyContribution),
      annualReturn: Number(base.annualReturn), // percent
      timeHorizon: base.timeHorizon,
    }

    for (const lc of locales) {
      // When not forcing, skip rows that already exist
      if (!force) {
        const [exists] = await db
          .select({ id: scenario.id })
          .from(scenario)
          .where(and(eq(scenario.slug, slug), eq(scenario.locale, lc as any)))
          .limit(1)

        if (exists) continue
      }

      // Use createScenario upsert to insert or update with localized strings
      const updated = await createScenario({
        slug,
        locale: lc,
        name: generateLocalizedScenarioName(lc, params),
        description: generateLocalizedScenarioDescription(lc, params),
        initialAmount: params.initialAmount,
        monthlyContribution: params.monthlyContribution,
        annualReturn: params.annualReturn,
        timeHorizon: params.timeHorizon,
        tags: base.tags ?? [],
        isPredefined: base.isPredefined,
        isPublic: base.isPublic,
        createdBy: base.createdBy,
      })
      // eslint-disable-next-line no-console
      console.log(
        `[backfill] ${force ? 'upserted' : 'added'} ${slug} for ${lc} -> ${updated?.id ?? 'ok'}`
      )
    }
  }
  // eslint-disable-next-line no-console
  console.log(
    `Backfill complete${force ? ' (forced re-localization enabled)' : ''}`
  )
}

// Execute if invoked directly
run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Backfill failed:', err)
  process.exit(1)
})
