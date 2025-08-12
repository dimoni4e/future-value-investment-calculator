# Database Documentation

This document covers the Neon Postgres database setup for the Future Value Investment Calculator.

## Overview

The application uses **Neon Postgres v17** with **Drizzle ORM** for type-safe database operations. The database supports:

- 🌍 **Multi-language content** (English, Polish, Spanish)
- 📊 **Investment scenarios** (predefined and user-created)
- 📄 **Static pages** (About, Contact, Privacy, etc.)
- 🏠 **Dynamic home page content**

## Database Schema

### Tables

1. **`home_content`** - Dynamic homepage content with i18n support
2. **`pages`** - Static pages (about, contact, privacy, terms)
3. **`scenarios`** - Investment scenarios (predefined and user-created)

### Schema Features

- 🔐 **UUID primary keys** for security
- 🌐 **Locale enum** (`en`, `pl`, `es`) for internationalization
- 📈 **Decimal precision** for financial calculations
- 🏷️ **Tag arrays** for scenario categorization
- ⏰ **Automatic timestamps** with triggers
- 🔍 **Optimized indexes** for performance
- ✅ **Data validation** with constraints

## Quick Setup

### 1. Environment Configuration

Add your Neon database connection string to `.env.local`:

```bash
DATABASE_URL="postgresql://username:password@ep-example-123456.region.neon.tech/future_value_calculator?sslmode=require"
```

### 2. Database Setup

Run the automated setup script:

```bash
npm run db:setup
```

Or manually:

```bash
# Apply schema
psql $DATABASE_URL -f database/schema.sql

# Insert seed data
psql $DATABASE_URL -f database/seed.sql
```

### 3. Verify Setup

Start the development server:

```bash
npm run dev
```

## Available NPM Scripts

```bash
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes directly
npm run db:studio      # Open Drizzle Studio (database GUI)
npm run db:setup       # Complete database setup with schema + seed
```

## Database Queries

The application includes pre-built query functions in `/lib/db/queries.ts`:

### Home Content

- `getHomeContent(locale)` - Get all home content for a locale
- `getHomeContentBySection(locale, section)` - Get content by section
- `getHomeContentValue(locale, section, key)` - Get specific content value

### Pages

- `getPages(locale)` - Get all published pages
- `getPageBySlug(slug, locale)` - Get specific page

### Scenarios

- `getPredefinedScenarios(locale)` - Get predefined scenarios
- `getScenarioBySlug(slug, locale)` - Get specific scenario
- `getPopularScenarios(locale, limit)` - Get popular scenarios
- `incrementScenarioViews(scenarioId)` - Increment view count

### Utilities

- `transformHomeContent(content)` - Transform content to nested object
- `getSupportedLocales()` - Get supported locale list

## Seed Data

The database is pre-populated with:

### Home Content (3 languages)

- Layout: title, description
- Navigation: home, about, contact
- Hero: badge, subtitle, buttons, features
- Features: titles, descriptions

### Predefined Scenarios (3 languages × 7 scenarios)

1. **Beginner Investor** - Conservative start ($10K + $500/month, 7%, 10 years)
2. **Retirement Planning** - Long-term strategy ($50K + $2K/month, 6%, 30 years)
3. **Growth Investor** - Higher risk/reward ($25K + $1K/month, 12%, 20 years)
4. **Young Professional** - Early start ($5K + $300/month, 8%, 15 years)
5. **Wealth Building** - High-value accumulation ($100K + $5K/month, 10%, 25 years)
6. **Emergency Fund** - Safety net building ($1K + $200/month, 4%, 5 years)
7. **Down Payment Savings** - House savings ($5K + $1.5K/month, 5%, 7 years)

### Static Pages (3 languages)

- **About** - Mission and purpose
- **Contact** - Contact information and email

## Next Steps

1. **Update your DATABASE_URL** in `.env.local` with actual Neon credentials
2. **Run the setup script**: `npm run db:setup`
3. **Integrate database queries** into your Next.js pages
4. **Replace static content** with dynamic database content
5. **Add user authentication** for user-created scenarios (optional)
6. **Create admin interface** for content management (optional)

## Files Structure

```
database/
├── schema.sql          # Complete SQL schema
├── seed.sql           # Seed data in all languages
└── setup.sh           # Automated setup script

lib/db/
├── index.ts           # Drizzle connection setup
├── schema.ts          # Drizzle ORM schema definitions
└── queries.ts         # Ready-to-use query functions

drizzle.config.ts      # Drizzle Kit configuration
```

## Development Workflow

1. Make schema changes in `lib/db/schema.ts`
2. Generate migrations: `npm run db:generate`
3. Apply migrations: `npm run db:migrate`
4. Update queries in `lib/db/queries.ts` as needed
5. Use Drizzle Studio for database inspection: `npm run db:studio`

Your database is now ready for integration with the Next.js application! 🚀
