### MVP Build Plan — granular, one-concern tasks

> Follow in order. Run tests after each task.

| #   | Task                                         | Start when            | Done when                              | Test hint                    |
| --- | -------------------------------------------- | --------------------- | -------------------------------------- | ---------------------------- |
| 1   | **Init repo**                                | new folder created    | Git repo with first commit             | `git status` clean           |
| 2   | **Add MIT license + README skeleton**        | repo exists           | files pushed                           | check files render on GitHub |
| 3   | **Create Next.js 14 app (`app/` router)**    | repo set              | `npm run dev` shows default page       | open localhost               |
| 4   | **Install Tailwind + shadcn/ui**             | Next app runs         | Tailwind styles render                 | test with a red div          |
| 5   | **Configure ESLint + Prettier**              | packages installed    | `npm run lint` passes                  | run lint                     |
| 6   | **Add Husky pre-commit hook**                | ESLint ready          | commit is blocked by lint error        | try bad code                 |
| 7   | **Set up Playwright**                        | Next app runs         | `npx playwright test` green            | scaffold auto test           |
| 8   | **Create global `<layout.tsx>`**             | Tailwind ready        | site shows header + footer placeholder | snapshot test                |
| 9   | **Implement dark/light autoswitch**          | layout exists         | toggle works, persists in localStorage | click test                   |
| 10  | **Add i18n config (next-intl)**              | layout exists         | `/pl` renders Polish static text       | e2e locale test              |
| 11  | **Make `LanguageSwitcher` component**        | i18n ready            | dropdown swaps locale                  | e2e switch test              |
| 12  | **Scaffold `finance.ts` helper**             | none                  | function returns FV for static case    | jest unit test               |
| 13  | **Cover `finance.ts` edge cases**            | helper exists         | 100 % unit coverage                    | run `npm test -- --coverage` |
| 14  | **Create `CalculatorForm` with inputs**      | layout done           | values update React state              | React Testing Library        |
| 15  | **Add real-time FV number display**          | form exists           | number updates on typing               | RTL test                     |
| 16  | **Build `GrowthChart` (Recharts)**           | FV state exists       | chart line appears                     | visual e2e                   |
| 17  | **Create `ScenarioSlider` (years)**          | FV state exists       | drag slider updates chart              | e2e drag test                |
| 18  | **Build `ShareButtons` (copy URL)**          | FV in URL             | copied link matches current state      | clipboard assert             |
| 19  | **Encode state into query string**           | FV state exists       | refresh keeps same result              | reload test                  |
| 20  | **Add currency selector with FX fetch**      | form ready            | EUR→USD changes output                 | mock fetch test              |
| 21  | **Cache FX rates in `localStorage`**         | FX fetch done         | reload within 1 h skips API            | inspect devtools             |
| 22  | **Add SEO helper (`seo.ts`)**                | pages exist           | dynamic `<title>` reflects input       | view source                  |
| 23  | **Create `/api/share` edge route (OG tags)** | seo helper exists     | cURL shows correct meta                | assert HTML                  |
| 24  | **Generate OG image via @vercel/og**         | edge route stub       | social preview shows chart             | manual tweet test            |
| 25  | **Implement `robots.txt` & dynamic sitemap** | pages live            | `https://site/robots.txt` valid        | open file                    |
| 26  | **Add legal pages (`/legal/...`)**           | pages folder          | static MDX renders                     | snapshot test                |
| 27  | **Add About page**                           |                       |                                        |                              |
| 28  | **Create PDF/CSV export edge route (stub)**  | none                  | hitting route downloads file           | download test                |
| 29  | **Wire export button in UI**                 | route ready           | click downloads CSV                    | file exists                  |
| 30  | **Integrate Sentry (browser + edge)**        | env var ready         | test error appears in Sentry           | throw error                  |
| 31  | **Configure Vercel CI preview deploy**       | repo on GitHub        | PR deploy URL auto-comments            | open preview                 |
| 32  | **Add Core Web Vitals report in Vercel**     | deploy ready          | dashboard shows metrics                | view Vercel analytics        |
| 33  | **Write Playwright e2e for happy path**      | app stable            | test passes on CI                      | `npm run test:e2e`           |
| 34  | **Smoke-test all locales**                   | i18n done             | Playwright loop locales                | CI green                     |
| 35  | **Final accessibility audit (axe)**          | UI frozen             | no critical issues                     | run axe-ci                   |
| 36  | **Tag v0.1.0, create rel-notes**             | tests green           | Git tag pushed                         | view releases page           |
| 37  | **Launch to production domain**              | Vercel prod connected | live site accessible                   | manual check                 |
| 38  | **Post-launch monitoring dash**              | Sentry + Vitals live  | dashboard URLs shared with team        | open links                   |

Ready to feed one task at a time!
