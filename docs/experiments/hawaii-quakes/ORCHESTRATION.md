# ORCHESTRATION.md — hawaii-quakes

Started by the grow loop on 2026-09-24, finished by hand the same morning.

- The loop wrote the adapter, the parser, the band transform, the chart, the
  fixtures, and their tests, then died at `00:01:34` with `429 Too Many
  Requests` after 206,768 tokens. The tree was left with 16 uncommitted files.
- The 06:50 run skipped with `main has uncommitted changes`, which is the
  wrapper's dirty-tree rule. Two more skips would have spawned a heal session.
- The missing step was the wiring: a `microsites.ts` entry, a line in
  `PUBLISHED_MICROSITES`, and a branch in the `[category]/[slug]` page. Without
  those the chart existed and no page rendered it.

## What was checked before committing

- Unit tests, green before any edit: 35 in `usa-sources`, 17 in the three new
  `apps/web` test files.
- The numbers in the copy were re-read from the live catalogue rather than
  trusted from the fixture, and both agree on 264, the four bands, the
  strongest quake, and the deepest.
- The three reference URLs were fetched: `earthquake.usgs.gov` answers 200.
  `www.usgs.gov` answers 403 to scripted requests from this machine, the same
  way `www.bls.gov` does, so the story links to the catalogue host only.

## Note on the window

The 2025 window is closed, so the committed snapshot and a fresh call should
keep agreeing. If the story is ever repointed at a rolling window, the copy
and the fixture both need to move with it.
