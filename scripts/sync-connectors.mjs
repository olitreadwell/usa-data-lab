#!/usr/bin/env node
// Syncs the vendored packages/usa-sources from a checkout of
// https://github.com/olitreadwell/usa-open-data-connectors.
//
// This site is an example of using the connectors repo. npm git dependencies
// cannot target a subpackage inside a workspace monorepo, so the single
// package the site uses is vendored here and kept in sync with this script.
//
// The connectors repo publishes under the @nzlab npm scope. This workspace
// uses @uslab for its own packages, so the copy is renamed on the way in.
// That rename is part of this script on purpose: a hand-edited vendored copy
// would drift from the source repo on the next sync.
//
// Usage:
//   node scripts/sync-connectors.mjs                      uses ../usa-open-data-connectors
//   node scripts/sync-connectors.mjs --from /path/to/repo
//   node scripts/sync-connectors.mjs --help
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const CONNECTORS_PACKAGE_DIR = 'packages/usa-sources';
const DEFAULT_FROM = resolve(REPO_ROOT, '..', 'usa-open-data-connectors');
const SOURCE_PACKAGE_NAME = '@nzlab/usa-sources';
const LOCAL_PACKAGE_NAME = '@uslab/usa-sources';
const SYNCED_FILES = [
  'README.md',
  'eslint.config.mjs',
  'package.json',
  'tsconfig.json',
  'vitest.config.ts',
  'src',
];
// The connectors package ships as compiled JavaScript from ./dist. This site
// is a Next.js app that compiles workspace packages from source, so the
// vendored copy points its entry points at src/ and drops the build step.
// Doing it here rather than by hand keeps the copy reproducible.
const LOCAL_ENTRY_POINT = './src/index.ts';
const DROPPED_SCRIPTS = ['build', 'prepublishOnly'];
const TEXT_FILE_PATTERN = /\.(json|mjs|ts)$/;

function usage() {
  console.log('Usage: node scripts/sync-connectors.mjs [--from <connectors-checkout>]');
}

function parseArgs(argv) {
  const args = { from: DEFAULT_FROM };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--help') {
      usage();
      process.exit(0);
    }
    if (argv[index] === '--from') {
      args.from = resolve(argv[index + 1]);
      index += 1;
    }
  }
  return args;
}

function readPackageName(packageJsonPath) {
  return JSON.parse(readFileSync(packageJsonPath, 'utf8')).name;
}

function listFiles(directory) {
  const found = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      found.push(...listFiles(fullPath));
    } else {
      found.push(fullPath);
    }
  }
  return found;
}

// Strips the .js extension from relative imports. The connectors package is
// compiled with NodeNext, so its source writes './thing.js' where the file on
// disk is './thing.ts'. Next.js bundles the source directly and cannot follow
// that, so the copy drops the extension.
const RELATIVE_IMPORT_WITH_JS = /(from\s+['"])(\.\.?\/[^'"]+)\.js(['"])/g;

function stripTsImportExtensions(packageRoot) {
  const rewritten = [];
  for (const filePath of listFiles(join(packageRoot, 'src'))) {
    if (!filePath.endsWith('.ts')) {
      continue;
    }
    const before = readFileSync(filePath, 'utf8');
    const after = before.replace(RELATIVE_IMPORT_WITH_JS, '$1$2$3');
    if (after !== before) {
      writeFileSync(filePath, after);
      rewritten.push(filePath);
    }
  }
  return rewritten;
}

// Rewrites the @nzlab scope to @uslab in the copied package, so the vendored
// name matches this workspace.
function renameScopeInCopy(packageRoot) {
  const renamed = [];
  for (const filePath of listFiles(packageRoot)) {
    if (!TEXT_FILE_PATTERN.test(filePath)) {
      continue;
    }
    const before = readFileSync(filePath, 'utf8');
    const after = before.replaceAll('@nzlab/', '@uslab/');
    if (after !== before) {
      writeFileSync(filePath, after);
      renamed.push(filePath);
    }
  }
  return renamed;
}

// Rewrites the vendored manifest so the site can import the package source.
function adaptManifestForWorkspace(packageRoot) {
  const manifestPath = join(packageRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.name = LOCAL_PACKAGE_NAME;
  manifest.main = LOCAL_ENTRY_POINT;
  manifest.types = LOCAL_ENTRY_POINT;
  manifest.exports = { '.': LOCAL_ENTRY_POINT };
  manifest.files = ['src/**'];
  for (const script of DROPPED_SCRIPTS) {
    delete manifest.scripts[script];
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const args = parseArgs(process.argv.slice(2));
const connectorsRoot = args.from;
const connectorsPackage = join(connectorsRoot, CONNECTORS_PACKAGE_DIR);

if (!existsSync(join(connectorsPackage, 'package.json'))) {
  console.error(`No ${CONNECTORS_PACKAGE_DIR}/package.json found at ${connectorsRoot}.`);
  usage();
  process.exit(1);
}

if (readPackageName(join(connectorsPackage, 'package.json')) !== SOURCE_PACKAGE_NAME) {
  console.error(`${connectorsPackage} is not the ${SOURCE_PACKAGE_NAME} package.`);
  process.exit(1);
}

for (const entry of SYNCED_FILES) {
  const source = join(connectorsPackage, entry);
  if (!existsSync(source)) {
    console.error(`Missing ${source} in the connectors checkout.`);
    process.exit(1);
  }
  cpSync(source, join(REPO_ROOT, CONNECTORS_PACKAGE_DIR, entry), { recursive: true });
}

const renamed = renameScopeInCopy(join(REPO_ROOT, CONNECTORS_PACKAGE_DIR));
const rewired = stripTsImportExtensions(join(REPO_ROOT, CONNECTORS_PACKAGE_DIR));
adaptManifestForWorkspace(join(REPO_ROOT, CONNECTORS_PACKAGE_DIR));

if (
  readPackageName(join(REPO_ROOT, CONNECTORS_PACKAGE_DIR, 'package.json')) !== LOCAL_PACKAGE_NAME
) {
  console.error(`The synced copy is not named ${LOCAL_PACKAGE_NAME} after the scope rename.`);
  process.exit(1);
}

console.log(`Synced ${CONNECTORS_PACKAGE_DIR} from ${connectorsRoot}.`);
console.log(`Renamed the @nzlab scope in ${renamed.length} copied file(s).`);
console.log(`Dropped the .js extension from relative imports in ${rewired.length} file(s).`);

// The rewrites above change line lengths, so re-format the copy with the
// repo's own Prettier config before it lands in a commit.
execFileSync('npx', ['prettier', '--write', 'src/**/*.{ts,json}', 'package.json'], {
  cwd: join(REPO_ROOT, CONNECTORS_PACKAGE_DIR),
  stdio: 'inherit',
});
console.log('Review the diff, then run npm run check.');
