import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Enum for supported locales
export const localeEnum = pgEnum('locale', ['en', 'pl', 'es'])

// Home content table for dynamic homepage content with i18n support
export const homeContent = pgTable(
  'home_content',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    locale: localeEnum('locale').notNull(),
    section: varchar('section', { length: 50 }).notNull(), // 'hero', 'features', 'navigation', etc.
    key: varchar('key', { length: 100 }).notNull(), // 'title', 'subtitle', 'description', etc.
    value: text('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueContentKey: uniqueIndex('unique_content_key').on(
      table.locale,
      table.section,
      table.key
    ),
  })
)

// Pages table for static pages (about, contact, privacy, terms)
export const pages = pgTable(
  'pages',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: varchar('slug', { length: 100 }).notNull(), // 'about', 'contact', 'privacy', 'terms'
    locale: localeEnum('locale').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content').notNull(),
    metaDescription: varchar('meta_description', { length: 300 }),
    metaKeywords: text('meta_keywords'),
    published: boolean('published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniquePageLocale: uniqueIndex('unique_page_locale').on(
      table.slug,
      table.locale
    ),
  })
)

// Scenario table for investment scenarios (predefined and user-created)
export const scenario = pgTable(
  'scenario',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: varchar('slug', { length: 100 }).notNull(), // 'emergency-1k-200-4-5' or user-generated
    locale: localeEnum('locale').notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    initialAmount: decimal('initial_amount', {
      precision: 15,
      scale: 2,
    }).notNull(),
    monthlyContribution: decimal('monthly_contribution', {
      precision: 15,
      scale: 2,
    }).notNull(),
    annualReturn: decimal('annual_return', {
      precision: 5,
      scale: 2,
    }).notNull(), // Percentage
    timeHorizon: integer('time_horizon').notNull(), // Years
    tags: text('tags').array(), // Array of tags
    isPredefined: boolean('is_predefined').default(false).notNull(), // true for expert scenarios
    isPublic: boolean('is_public').default(false).notNull(), // true if user wants to share
    createdBy: varchar('created_by', { length: 100 })
      .default('system')
      .notNull(), // user ID or 'system'
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueScenarioLocale: uniqueIndex('unique_scenario_locale').on(
      table.slug,
      table.locale
    ),
  })
)

// Type exports for use in the application
export type HomeContent = typeof homeContent.$inferSelect
export type NewHomeContent = typeof homeContent.$inferInsert

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert

export type Scenario = typeof scenario.$inferSelect
export type NewScenario = typeof scenario.$inferInsert
