## System Architecture

### Repo Structure
future-value-app/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ legal/
│  ├─ about/
│  ├─ api/
│  │  └─ share/route.ts
│  └─ sitemap.xml/route.ts
├─ components/
│  ├─ CalculatorForm.tsx
│  ├─ GrowthChart.tsx
│  ├─ ScenarioSlider.tsx
│  ├─ ShareButtons.tsx
│  ├─ LanguageSwitcher.tsx
│  └─ ui/
├─ lib/
│  ├─ finance.ts
│  ├─ i18n.ts
│  └─ seo.ts
├─ hooks/
│  └─ useFutureValue.ts
├─ public/
│  └─ og-template.png
├─ scripts/
│  └─ generate-sitemap.ts
├─ .env.local
├─ next.config.mjs
├─ tailwind.config.cjs
└─ README.md

### Layer Roles
| Layer | Duties | Where State Lives |
|-------|--------|-------------------|
| **Client** | Forms, sliders, chart, i18n | React local state + URL |
| **Server Components / Actions** | SSR/SSG, generate OG meta & images | Stateless |
| **API Routes (Edge)** | Render chart→PNG, PDF/CSV export | Ephemeral |
| **External APIs** | exchangerate.host for FX, Mapbox for map | — |

### State Flow
1. User edits inputs → React state updates, URL query reflects values.  
2. FV computed instantly in browser (`finance.ts`).  
3. “Share” copies permalink; social crawler hits `/api/share` which recomputes and returns proper Open Graph tags.

### Services Diagram
Browser ─▶ Next.js (Edge) ─▶ exchangerate.host


### CI / DevOps
- GitHub → Vercel Preview for every PR.
- Husky + lint-staged (ESLint, Prettier).
- Playwright e2e in CI.
- Sentry for errors, Vercel Analytics for Core Web Vitals.