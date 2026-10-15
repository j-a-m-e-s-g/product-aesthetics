// The catalogue: one folder per library under catalogue/, each holding
//   entry.json        the facts: licence, install, what the adapter maps
//   README.md         install and usage, written for a person
//   adapter.mjs       brand → files (only when `maps` isn't empty)
//   preview.gif|png   optional; shown in the root README

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CATALOGUE = path.join(ROOT, 'catalogue');

// The whole point of the repo: what you can ship without putting anyone's name on screen.
export const TIERS = {
  'no-strings': {
    licences: ['CC0-1.0', 'Unlicense', 'MIT-0', '0BSD', 'PDM'], // PDM: public domain mark (museum archives)
    means: 'Use it however you like. Nothing to keep, nothing to credit.',
  },
  'keep-notice': {
    licences: ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'OFL-1.1'],
    means: 'No visible credit. The licence text stays in your code, which npm does for you inside node_modules.',
  },
};

export const tierOf = (spdx) => Object.keys(TIERS).find((t) => TIERS[t].licences.includes(spdx)) ?? null;

// What an entry is. Code and assets ship inside our work, so their licence
// must be in TIERS. Tools are apps we run: any open-source licence is fine,
// because it covers the app, not what we make with it.
export const KINDS = ['code', 'asset', 'tool'];

const MAPS = ['colours', 'fonts', 'radius'];
const FIELDS = {
  name: 'string',
  tagline: 'string',
  category: 'string',
  author: 'string',
  github: 'string', // owner/repo
  licence: 'string', // SPDX id
  stack: 'array',
  install: 'string',
  verified: 'string', // YYYY-MM-DD: the day the licence was last read
  maps: 'array',
};
const OPTIONAL = {
  kind: 'string', // code (default) | asset | tool
  url: 'string', // the home page, for entries with no GitHub repo
  path: 'string',
  demo: 'string',
  npm: 'string',
  version: 'string',
  pick: 'string', // its name in the picks checklist, when different from `name`
  from_picks: 'boolean', // added because it was ticked in a picks checklist
};
// Code needs a repo and a stack; assets and tools may have neither.
const CODE_ONLY = ['github', 'stack', 'author'];

/** Every entry, sorted by category then name. */
export async function loadCatalogue() {
  const dirs = (await readdir(CATALOGUE, { withFileTypes: true })).filter((d) => d.isDirectory());
  const entries = await Promise.all(dirs.map((d) => loadEntry(d.name)));
  return entries.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export async function loadEntry(id) {
  const dir = path.join(CATALOGUE, id);
  const file = path.join(dir, 'entry.json');
  if (!existsSync(file)) throw new Error(`no catalogue entry "${id}" (looked for ${path.relative(ROOT, file)})`);
  const entry = JSON.parse(await readFile(file, 'utf8'));
  const preview = ['preview.gif', 'preview.webp', 'preview.png'].find((f) => existsSync(path.join(dir, f)));
  return {
    ...entry,
    id,
    dir,
    kind: entry.kind ?? 'code',
    tier: (entry.kind ?? 'code') === 'tool' ? 'tool' : tierOf(entry.licence),
    preview: preview ? `catalogue/${id}/${preview}` : null,
    adapter: existsSync(path.join(dir, 'adapter.mjs')) ? path.join(dir, 'adapter.mjs') : null,
  };
}

/** Offline checks. Returns [{ level: 'error' | 'warn', msg }]. */
export function validateEntry(e) {
  const out = [];
  const err = (msg) => out.push({ level: 'error', msg });
  const warn = (msg) => out.push({ level: 'warn', msg });

  for (const [k, type] of Object.entries({ ...FIELDS, ...OPTIONAL })) {
    const v = e[k];
    if (v === undefined) {
      if (k in FIELDS && !(e.kind !== 'code' && CODE_ONLY.includes(k))) err(`missing "${k}"`);
      continue;
    }
    if (type === 'array' ? !Array.isArray(v) : typeof v !== type) err(`"${k}" should be ${type === 'array' ? 'an array' : `a ${type}`}`);
  }
  if (!KINDS.includes(e.kind)) err(`"kind" should be one of ${KINDS.join(', ')}`);
  if (e.kind !== 'code' && !e.github && !e.url) err('needs "github" or "url"');
  if (e.licence && !e.tier) {
    err(`licence "${e.licence}" isn't allowed; allowed: ${Object.values(TIERS).flatMap((t) => t.licences).join(', ')}`);
  }
  if (e.github && !/^[\w.-]+\/[\w.-]+$/.test(e.github)) err(`"github" should be owner/repo, got "${e.github}"`);
  for (const m of e.maps ?? []) if (!MAPS.includes(m)) err(`"maps" has "${m}"; use ${MAPS.join(', ')}`);
  if (e.maps?.length && !e.adapter) err('"maps" is set but there is no adapter.mjs');
  if (!existsSync(path.join(e.dir, 'README.md'))) err('no README.md');
  if (e.verified) {
    const age = (Date.now() - Date.parse(e.verified)) / 864e5;
    if (Number.isNaN(age)) err(`"verified" should be YYYY-MM-DD, got "${e.verified}"`);
    else if (age > 365) warn(`licence last read ${e.verified}; re-read it (pa check --online)`);
  }
  return out;
}

// ── The table in the root README ───────────────────────────────────────────

/** "React, JavaScript", or the kind for entries with no stack (assets, tools). */
export const stackOf = (e) => [e.stack ?? []].flat().join(', ') || { asset: 'Asset library', tool: 'App' }[e.kind] || '';

export const START = '<!-- catalogue:start (pa check --fix writes this) -->';
export const END = '<!-- catalogue:end -->';

// A gallery: one grid, three cards a row, ordered by category then name.
// (One section per category left most rows two-thirds empty.)
export function catalogueMarkdown(entries) {
  const card = (e) => {
    const href = `catalogue/${e.id}`;
    const img = e.preview ? `<a href="${href}"><img src="${e.preview}" width="100%" alt="${e.name}"></a><br>` : '';
    const brand = e.maps?.length ? `maps ${e.maps.join(', ')}` : 'no brand mapping';
    const terms = { 'no-strings': 'no strings', 'keep-notice': 'keep notice', tool: 'app; what you make is yours' }[e.tier];
    return `<td width="33%" valign="top">${img}<sub>${e.category.toUpperCase()}</sub><br><b><a href="${href}">${e.name}</a></b><br>${e.tagline}<br><sub>${stackOf(e)} · ${e.licence} (${terms}) · ${brand}</sub></td>`;
  };
  const rows = [];
  for (let i = 0; i < entries.length; i += 3) {
    const cells = entries.slice(i, i + 3).map(card);
    while (cells.length < 3) cells.push('<td width="33%"></td>');
    rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
  }
  return [START, '', `<table>\n${rows.join('\n')}\n</table>`, '', END].join('\n');
}

/** README text with the catalogue section replaced. */
export function withCatalogue(readme, entries) {
  const a = readme.indexOf(START);
  const b = readme.indexOf(END);
  if (a < 0 || b < a) throw new Error(`README.md needs the markers ${START} … ${END}`);
  return readme.slice(0, a) + catalogueMarkdown(entries) + readme.slice(b + END.length);
}
