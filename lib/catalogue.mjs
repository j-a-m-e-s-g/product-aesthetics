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

// The README's sections, in reading order: still things first, then movement
// and sound. Every entry's `category` is one of these names. The intros are
// for someone who has never written code.
export const CATEGORIES = [
  { name: 'Type and icons', intro: 'The letters and symbols everything else is built from.' },
  { name: 'Photos and pictures', intro: 'Real art and photography, AI images, and tools that edit pictures in bulk.' },
  { name: 'Hand-drawn', intro: 'A human touch: shapes that look sketched and strokes that look inked.' },
  { name: 'Charts and maps', intro: 'For making numbers and places easy to see at a glance.' },
  { name: 'Backgrounds, textures and 3D', intro: 'Surfaces, light and depth, from a slow-moving colour wash to a 3D scene that looks like a photo.' },
  { name: 'Animation', intro: 'Movement for websites and apps, from quiet polish to headlines that grab attention.' },
  { name: 'Video', intro: 'The machinery that turns a design into a finished video.' },
  { name: 'Sound and voice', intro: 'Everything a video needs to sound professional: sound effects, a voiceover, a clean recording and captions in time.' },
];
const ORDER = new Map(CATEGORIES.map((c, i) => [c.name, i]));

// How someone gets each kind of entry, in plain words for the README cards.
const HOW = { asset: 'Download and use', tool: 'Runs on your computer', code: 'For websites and apps' };
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
  settled: 'string', // why a repo with no recent push is finished, not abandoned
};
// Code needs a repo and a stack; assets and tools may have neither.
const CODE_ONLY = ['github', 'stack', 'author'];

/** Every entry, by section (CATEGORIES order), then what anyone can download first, then name. */
export async function loadCatalogue() {
  const dirs = (await readdir(CATALOGUE, { withFileTypes: true })).filter((d) => d.isDirectory());
  const entries = await Promise.all(dirs.map((d) => loadEntry(d.name)));
  const rank = (e) => ORDER.get(e.category) ?? CATEGORIES.length;
  const ease = (e) => ['asset', 'tool', 'code'].indexOf(e.kind);
  return entries.sort((a, b) => rank(a) - rank(b) || ease(a) - ease(b) || a.name.localeCompare(b.name));
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
  if (e.category && !ORDER.has(e.category)) err(`"category" should be one of: ${CATEGORIES.map((c) => c.name).join(', ')}`);
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

// A gallery for people who don't code: one section per category, two big
// cards a row, each with its plain-English tagline and how you get it.
export function catalogueMarkdown(entries) {
  const slug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const card = (e) => {
    const href = `catalogue/${e.id}`;
    const img = e.preview ? `<a href="${href}"><img src="${e.preview}" width="100%" alt="${e.name} preview"></a><br>` : '';
    const label = [HOW[e.kind], e.maps?.length && 'Matches your brand'].filter(Boolean).join(' · ');
    return `<td width="50%" valign="top">${img}<b><a href="${href}">${e.name}</a></b><br>${e.tagline}<br><sub>${label.toUpperCase()}</sub></td>`;
  };
  const sections = CATEGORIES.map((c) => ({ ...c, entries: entries.filter((e) => e.category === c.name) })).filter((c) => c.entries.length);
  const jump = sections.map((c) => `[${c.name}](#${slug(c.name)})`).join(' · ');
  const out = [START, '', `${entries.length} picks in ${sections.length} sections. Click any picture to open its page.`, '', `**Jump to:** ${jump}`];
  for (const c of sections) {
    const rows = [];
    for (let i = 0; i < c.entries.length; i += 2) {
      const cells = c.entries.slice(i, i + 2).map(card);
      while (cells.length < 2) cells.push('<td width="50%"></td>');
      rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
    }
    out.push('', `### ${c.name}`, '', c.intro, '', `<table>\n${rows.join('\n')}\n</table>`);
  }
  return [...out, '', END].join('\n');
}

/** README text with the catalogue section replaced. */
export function withCatalogue(readme, entries) {
  const a = readme.indexOf(START);
  const b = readme.indexOf(END);
  if (a < 0 || b < a) throw new Error(`README.md needs the markers ${START} … ${END}`);
  return readme.slice(0, a) + catalogueMarkdown(entries) + readme.slice(b + END.length);
}
