# USA Data Lab (scaffold)

Derived from nz-data-lab. Source adapters, front-page visualisations, and the 30-minute ship loop are being ported to USA public data.

# nz-data-lab

Example site for
[nz-open-data-connectors](https://github.com/olitreadwell/nz-open-data-connectors).
One microsite, the sheep index, showing the full pipeline from a New Zealand
public-data connector to a deployed static chart.

## The microsite

- **The sheep index**: New Zealand's national flock has nearly halved since
  1994, from 49.5 million sheep to 23.3 million. Data from the Stats NZ
  Aotearoa Data Explorer, fetched at deploy time.

## What this example shows

- `apps/web/src/lib/sheep-data.ts` calls `createStatsNzClient` from
  `@nzlab/stats-nz` to pull table AGR_AGR_003 (Livestock Numbers by Regional
  Council) at build time.
- The build falls back to a committed CSV fixture when the Stats NZ gateway
  blocks the build runner, so the static export always succeeds.
- `SheepChart` renders the series with Recharts; the page and chart have unit
  tests, and the e2e suite asserts a plausible live sheep count.

## Connectors wiring

The site uses one package from the connectors repo, `@nzlab/stats-nz`,
vendored under `packages/stats-nz`. npm git dependencies cannot target a
subpackage inside a workspace monorepo, so the package is copied here and kept
in sync with a script:

```bash
node scripts/sync-connectors.mjs                     # uses ../nz-open-data-connectors
node scripts/sync-connectors.mjs --from /path/to/repo
```

Edit `packages/stats-nz` only by syncing from the connectors repo.

## Stack

- Next.js 16, React 19.2, TypeScript
- Tailwind CSS 4 + SCSS hybrid, shadcn/ui (Base UI primitives)
- Vitest + Testing Library + jest-axe (unit/a11y), Playwright + `@axe-core/playwright`
- Monorepo: Turborepo, npm workspaces

## Quick start

```bash
npm install
npm run dev
```

## Checks

```bash
npm run type-check
npm test
npm run lint
npm run build
```
