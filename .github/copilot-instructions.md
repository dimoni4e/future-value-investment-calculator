# Copilot agent guide for this repo

Purpose: Equip AI coding agents to work productively in this Next.js (App Router) app with i18n, database-backed scenarios, SEO, and client performance patterns.

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.
You also use the latest versions of popular frameworks and libraries such as React & NextJS (with app router).
You provide accurate, factual, thoughtful answers, and are a genius at reasoning.

## Approach

- This project uses Next.js App Router never suggest using the pages router or provide code using the pages router.
- Follow the user's requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, up to date, bug free, fully functional and working, secure, performant and efficient code.

## Key Principles

- Focus on readability over being performant.
- Fully implement all requested functionality.
- Leave NO todo's, placeholders or missing pieces.
- Be sure to reference file names.
- Be concise. Minimize any other prose.
- If you think there might not be a correct answer, you say so. If you do not know the answer, say so instead of guessing.
- Only write code that is necessary to complete the task.
- Rewrite the complete code only if necessary.
- Update relevant tests or create new tests if necessary.

## Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

## TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

## UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

## Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

## Big picture

- Framework: Next.js 14 App Router with MDX and next-intl. Server components in `app/**`, client components use `'use client'`.
- Localization: Localized routing under `app/[locale]` with supported locales `en`, `pl`, `es` (`i18n/request.ts`). English is default without URL prefix.
- Domain: Investment calculations in `lib/finance.ts` (single source of truth). Scenario SEO helpers in `lib/scenarioUtils.ts`.
- Data: Neon Postgres via Drizzle ORM (`lib/db/**`, `drizzle.config.ts`). Queries are centralized in `lib/db/queries.ts`.
- API layer: Route handlers in `app/api/**` (e.g., `/api/scenarios/search`) call Drizzle queries. Client components fetch these endpoints.
- UX/perf: Heavy UI is lazy-loaded (IntersectionObserver + React.Suspense) via `components/scenario/LazyContentSection.tsx`. Charts are lazily imported from Recharts (`components/OptimizedGrowthChart.tsx`).
- SEO: Dynamic metadata and Open Graph via server pages; structured data component under `components/scenario/StructuredData.tsx`. OG image at `app/api/og/route.tsx`.
- Analytics: Sentry for error monitoring.

## Conventions and gotchas

- Use `lib/finance.ts` for any financial math. Don’t duplicate formulas in components.
- Scenario slugs: Generate with `generateScenarioSlug()` and parse with `parseSlugToScenario()` from `lib/scenarioUtils.ts`. Example: `invest-10000-monthly-500-7percent-10years-retirement`.
- DB decimals: In Drizzle schema, monetary/percent fields are `decimal` and represented as strings in results. Convert with `parseFloat` on read and `.toString()` on insert/update (see `lib/db/queries.ts`).
- i18n: Server pages use `getMessages`/`getTranslations` (no client hooks). Client components use `useTranslations`. Add messages in `i18n/messages/{en,pl,es}.json`.
- Locale-aware links: For English, no locale prefix. Use helpers similar to `ScenarioExplorer.generateUrl()` when building paths.
- URL state: Use `lib/urlState.ts` to validate and encode calculator params for share links. The main `CalculatorForm` currently redirects to scenario pages instead of rendering inline results.
- Currency: Use `lib/currency.ts` for rates, conversion, and formatting. Rates cache in localStorage; external API is `https://api.exchangerate-api.com/v4/latest/USD`.
- Lazy sections: Wrap heavy sections with `LazyContentSection` to load on viewport. See tests in `__tests__/components/lazy-loading.test.tsx` for IntersectionObserver mocking.

## Content generation pipeline

- Source of truth: `lib/contentGenerator.ts` + `lib/contentTemplates.ts` generate parameterized sections for scenarios. Public API: `generatePersonalizedContent(params, locale)` returns an object of HTML strings keyed by section.
- Templates: Defined per-locale with `{{placeholder}}` tokens; supported locales: `en`, `pl`, `es` via `getContentTemplates(locale)`. When adding placeholders, also ensure values are computed in the generator.
- Inputs: Calculator-like fields (initialAmount, monthlyContribution, annualReturn, timeHorizon, goal). The generator derives extra metrics (e.g., fiveYearValue, higherContributionValue) for richer sections; prefer using helpers from `lib/finance.ts` for consistency.
- Formatting: The generator formats money, percents, and time ranges for display. Avoid duplicating formatting logic in components.
- DB-driven SEO sections: Homepage/landing SEO content pulls from DB via `components/SEOContentSection.tsx` and `lib/db/queries.getHomeContent()`. To change copy without code changes, edit `home_content` table rows (see `database/README.md`).

How to add a new content section safely:

- Add a template string in `lib/contentTemplates.ts` for all locales.
- Compute and expose any new placeholders in `lib/contentGenerator.ts` so `populateTemplate()` can replace them.
- Render the new section in the relevant page/component, keeping heavy blocks lazy with `LazyContentSection`.

## SEO strategy

- Dynamic metadata: Scenario page `app/[locale]/scenario/[slug]/page.tsx` implements `generateMetadata()` using parsed/DB scenario inputs and `detectInvestmentGoal()`. It trims title (<60 chars) and description (<160 chars) and fills Open Graph and Twitter fields.
- Utilities: `lib/seo.ts` can generate titles/descriptions/keywords and structured data from `CalculatorParams`. Use it for consistent, shareable metadata.
- Programmatic SEO: `lib/seo-strategy.ts` documents URL patterns, keyword sets, and sitemap priorities for predefined/user-generated/category pages. Prefer reusing these patterns when adding landing pages.
- Structured data: `components/scenario/StructuredData.tsx` emits JSON-LD for scenarios. Keep it in sync with the metadata and scenario params. OG image endpoint lives at `app/api/og/route.tsx`.
- Sitemap/robots: `app/sitemap.ts` and `app/robots.ts` handle discoverability. Ensure new routes are linkable and, if applicable, included in sitemap generation.
- Internal linking: Use `RelatedScenarios` and category/tag pages to strengthen crawl paths; build links with locale-aware helpers and canonical slugs from `lib/scenarioUtils.ts`.

## Neon Postgres specifics

- Connection: Serverless Neon via Drizzle in `lib/db/index.ts` (neon-http driver). `DATABASE_URL` is required at runtime; the app throws if missing.
- Decimals as strings: Monetary/percent fields use `decimal` in Drizzle (`lib/db/schema.ts`) and are returned as strings. On read, convert with `parseFloat`/`Number`; on write, call `.toString()` (see `lib/db/queries.ts`). Filter queries use SQL `CAST` when needed.
- Centralized queries: Use `lib/db/queries.ts` for CRUD and filtering (e.g., `getScenariosWithFilters`, `createScenario`, `getScenarioBySlug`). Don’t query the DB directly from components; call API routes under `app/api/**` where needed.
- Migrations/seed: Use scripts from `package.json` (`npm run db:generate|migrate|push|setup|studio`) and SQL seeds in `database/`.
- Local dev: Point `DATABASE_URL` to a Neon database or a compatible Postgres instance. In CI/preview, set the env var in your platform settings.

## Key flows

- Calculator to Scenario page: `components/CalculatorForm.tsx` validates inputs, builds slug via `generateScenarioSlug`, and redirects to `/[locale]/scenario/[slug]`.
- Scenario page data sourcing order: DB (`getScenarioBySlug`) → predefined (`lib/scenarios.ts`) → parse slug and auto-persist via `createScenario()` → legacy API fallback. See `app/[locale]/scenario/[slug]/page.tsx`.
- Scenario search/filtering: Client `components/ScenarioExplorer.tsx` builds querystring and calls `/api/scenarios/search`. Handler maps query params to Drizzle filters (`app/api/scenarios/search/route.ts` → `lib/db/queries.getScenariosWithFilters`).

## Build, run, test

- Dev: `npm run dev` (Playwright config will reuse an existing server).
- Typecheck/build: `npm run build`. ESLint: `npm run lint` (fix: `npm run lint:fix`).
- Unit tests: `npm test` (Jest + Testing Library). JSDOM environment; see `jest.config.ts` and `jest.setup.js`.
- E2E: `npm run test:e2e` (tests in `tests/**/*.spec.ts`, server auto-started). HTML report at `playwright-report/`.
- Database: set `DATABASE_URL` (required at runtime by `lib/db/index.ts`). Common scripts: `npm run db:generate|migrate|push|studio|setup`. See `database/README.md`.

## Integration examples

- Adding a new scenario filter:
  1. Extend query parsing in `app/api/scenarios/search/route.ts`.
  2. Add filter condition in `lib/db/queries.getScenariosWithFilters` (prefer SQL helpers like `and`, `sql`).
  3. Wire UI in `components/ScenarioExplorer.tsx` to include the new param in `URLSearchParams` and controls.
- Creating a server-rendered, localized page:
  - Place under `app/[locale]/<path>/page.tsx`, validate locale via `locales` from `i18n/request.ts`, and fetch translations with `getMessages`.
- Using finance utilities on the server:
  - Example in `app/[locale]/scenario/[slug]/page.tsx`: build `InvestmentParameters` and call `calculateFutureValue()` to render projections.

## Environment and deployment

- Required env for local dev: `DATABASE_URL`. Optional/used in CI/production: `NEXT_PUBLIC_BASE_URL`, Sentry vars (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`).
- Deployment: Coolify is used for production. Configure env vars and build/start commands in Coolify. CI (`.github/workflows/ci.yml`) runs lint + build on PRs/`main`. Playwright job is present but commented.

Prefer edits that: (a) centralize logic in `lib/**`, (b) respect i18n and lazy-loading patterns, (c) reuse Drizzle queries and types, and (d) keep English routes unprefixed while supporting `pl`/`es` prefixes.
