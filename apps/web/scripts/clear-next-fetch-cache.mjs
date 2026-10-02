#!/usr/bin/env node
/* global process */
// Clears Next's persistent fetch cache before a build.
//
// Every story on this site reads its data at build time and the static export
// renders from what came back, so a build that reuses a cached response
// publishes whatever figure was cached by an earlier build. Next keeps those
// responses in `.next/cache/fetch-cache` between builds, and a build platform
// that restores `.next/cache` carries them across deployments. Clearing the
// directory before `next build` forces every source to be read fresh, which is
// what the freshness line on each page promises. It costs only the requests a
// build makes anyway.
import { rmSync } from 'node:fs';
import path from 'node:path';

const fetchCacheDir = path.join(process.cwd(), '.next', 'cache', 'fetch-cache');
rmSync(fetchCacheDir, { recursive: true, force: true });
process.stdout.write(`Cleared ${path.relative(process.cwd(), fetchCacheDir)} before the build.\n`);
