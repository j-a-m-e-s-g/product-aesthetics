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
    licences: ['CC0-1.0', 'Unlicense', 'MIT-0', '0BSD'],
    means: 'Use it however you like. Nothing to keep, nothing to credit.',
  },
  'keep-notice': {
    licences: ['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'OFL-1.1'],
    means: 'No visible credit. The licence text stays in your code, which npm does for you inside node_modules.',
  },
};

export const tierOf = (spdx) => Object.keys(TIERS).find((t) => TIERS[t].licences.includes(spdx)) ?? null;

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
const OPTIONAL = { path: 'string', demo: 'string', npm: 'string', version: 'string' };

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
    tier: tierOf(entry.licence),
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
      if (k in FIELDS) err(`missing "${k}"`);
      continue;
    }
    if (type === 'array' ? !Array.isArray(v) : typeof v !== type) err(`"${k}" should be ${type === 'array' ? 'an array' : `a ${type}`}`);
  }
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

export const START = '<!-- catalogue:start (pa check --fix writes this) -->';
export const END = '<!-- catalogue:end -->';

// A gallery: three cards a row, one section per category.
export function catalogueMarkdown(entries) {
  const card = (e) => {
    const href = `catalogue/${e.id}`;
    const img = e.preview ? `<a href="${href}"><img src="${e.preview}" width="100%" alt="${e.name}"></a><br>` : '';
    const brand = e.maps?.length ? `maps ${e.maps.join(', ')}` : 'no brand mapping';
    const terms = e.tier === 'no-strings' ? 'no strings' : 'keep notice';
    return `<td width="33%" valign="top">${img}<b><a href="${href}">${e.name}</a></b><br>${e.tagline}<br><sub>${[e.stack].flat().join(', ')} · ${e.licence} (${terms}) · ${brand}</sub></td>`;
  };
  const blocks = [];
  for (const [category, list] of Map.groupBy(entries, (e) => e.category)) {
    const rows = [];
    for (let i = 0; i < list.length; i += 3) {
      const cells = list.slice(i, i + 3).map(card);
      while (cells.length < 3) cells.push('<td width="33%"></td>');
      rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
    }
    blocks.push(`### ${category}\n\n<table>\n${rows.join('\n')}\n</table>`);
  }
  return [START, '', ...blocks.flatMap((b) => [b, '']), END].join('\n');
}

/** README text with the catalogue section replaced. */
export function withCatalogue(readme, entries) {
  const a = readme.indexOf(START);
  const b = readme.indexOf(END);
  if (a < 0 || b < a) throw new Error(`README.md needs the markers ${START} … ${END}`);
  return readme.slice(0, a) + catalogueMarkdown(entries) + readme.slice(b + END.length);
}
