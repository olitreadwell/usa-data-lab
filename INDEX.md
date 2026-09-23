# Index

A map of this repo for anyone (or any agent) arriving cold.

## The site

`usa-data-lab` is a static Next.js export of small experiments on US public
data. One microsite is published: the jobless rate, a monthly chart of the
national unemployment rate. The home page is
(`apps/web/src/app/page.tsx`), and each story lives at
`/<category-slug>/<slug>/`.

- [jobless-rate](docs/experiments/jobless-rate) (alive) The national
  unemployment rate month by month since January 2006, from the Bureau of
  Labor Statistics public data API.

## Where things are

- `apps/web/src/lib/microsites.ts` - the story corpus. Copy, categories, and
  source citations for every microsite, published or not.
- `apps/web/src/lib/jobless-data.ts` - the fetch and transform layer for the
  jobless-rate story. Live read at build time, committed snapshot as fallback.
- `apps/web/src/components/` - chart and page components, each with unit tests.
- `packages/usa-sources/` - the vendored connectors package. Never edit by
  hand; run `node scripts/sync-connectors.mjs`.
- `docs/experiments/<slug>/` - one folder per experiment: the pitch, the data
  source, and a verdict on whether it worked.
- `skills/` - the loop skills this repo runs.

## Checks

`npm run check` runs format, lint, type-check, tests with coverage, build,
smoke, e2e, and the internal link check.
