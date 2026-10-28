#!/usr/bin/env node
// pa: the product-aesthetics CLI. No dependencies; Node 22+.
//
//   pa list [--json]                        what's in the catalogue (--json: every entry, for other tools)
//   pa add <id> [--brand <file>] [--out <dir>] [--no-install] [--force]
//                                           install a library into this project,
//                                           and with --brand, generate it in your brand
//   pa brand <file>                         show what a brand file (or your CSS) resolves to
//   pa check [--online] [--fix]             validate the catalogue; --online re-reads
//                                           licences upstream; --fix rewrites the README table
//   pa picks <export.md> [--json]           what's ticked in a picks checklist vs the catalogue

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { loadBrand, ROLES } from '../lib/brand.mjs';
import * as colour from '../lib/colour.mjs';
import { CATALOGUE, ROOT, TIERS, loadCatalogue, loadEntry, stackOf, validateEntry, withCatalogue } from '../lib/catalogue.mjs';
import { diffPicks, parsePicks } from '../lib/picks.mjs';

const tty = process.stdout.isTTY;
process.stdout.on('error', (e) => e.code === 'EPIPE' && process.exit(0)); // piped into head
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = paint(1);
const dim = paint(2);
const red = paint(31);
const yellow = paint(33);
const green = paint(32);
const swatch = (hex) => {
  if (!tty) return '';
  const [r, g, b] = colour.rgb255(hex);
  return `\x1b[48;2;${r};${g};${b}m    \x1b[0m `;
};

const usage = async () => {
  const lines = (await readFile(new URL(import.meta.url), 'utf8')).split('\n').slice(1, 12);
  return lines.map((l) => l.replace(/^\/\/ ?/, '')).join('\n');
};

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      brand: { type: 'string' },
      out: { type: 'string' },
      'no-install': { type: 'boolean' },
      force: { type: 'boolean' },
      online: { type: 'boolean' },
      fix: { type: 'boolean' },
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
} catch (e) {
  console.error(`${red(`pa: ${e.message}`)}\n${await usage()}`);
  process.exit(1);
}
const { positionals, values: flags } = parsed;
const [command, ...args] = positionals;
const commands = { list, add, brand, check, picks };

if (!command || flags.help || !Object.hasOwn(commands, command)) {
  console.log(await usage());
  process.exit(command && !flags.help ? 1 : 0);
}
try {
  process.exitCode = (await commands[command](...args)) ?? 0;
} catch (e) {
  console.error(red(`pa ${command}: ${e.message}`));
  process.exitCode = 1;
}

// ── list ───────────────────────────────────────────────────────────────────

async function list() {
  const entries = await loadCatalogue();
  if (flags.json) {
    // Machine-readable, and the same on every machine: no absolute paths.
    const rel = (p) => (p ? path.relative(ROOT, p) : null);
    console.log(JSON.stringify(entries.map(({ dir, adapter, preview, ...e }) => ({ ...e, adapter: Boolean(adapter), preview: rel(preview) })), null, 1));
    return;
  }
  let category;
  for (const e of entries) {
    if (e.category !== category) console.log(`\n${bold((category = e.category))}`);
    const brand = e.maps?.length ? green(`maps ${e.maps.join(', ')}`) : dim('no brand mapping');
    console.log(`  ${bold(e.id.padEnd(22))} ${e.tagline}`);
    console.log(`  ${''.padEnd(22)} ${dim(`${e.licence} · ${stackOf(e)} ·`)} ${brand}`);
  }
  console.log(dim(`\n${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}. Details: catalogue/<id>/README.md · Use one: pa add <id> --brand <file>`));
}

// ── add ────────────────────────────────────────────────────────────────────

async function add(id) {
  if (!id) throw new Error('which one? pa add <id>; see pa list');
  if (!existsSync(path.join(CATALOGUE, id, 'entry.json'))) {
    const ids = (await readdir(CATALOGUE, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
    throw new Error(`no entry "${id}". Try: ${ids.filter((x) => x.includes(id.slice(0, 3))).join(', ') || ids.join(', ')}`);
  }
  const entry = await loadEntry(id);
  const cwd = process.cwd();
  console.log(`${bold(entry.name)} ${dim(`· ${entry.licence} (${TIERS[entry.tier]?.means ?? 'an app: what you make with it is yours'})`)}`);

  // Read the brand before installing anything, so a bad --brand fails fast.
  const b = flags.brand && entry.adapter ? await loadBrand(path.resolve(cwd, flags.brand)) : null;

  // 1. Install
  if (entry.npm && !flags['no-install']) {
    if (!existsSync(path.join(cwd, 'package.json'))) {
      console.log(yellow(`No package.json here, so nothing installed. In your project run: ${entry.install}`));
    } else {
      const [bin, verb] = packageManager(cwd);
      console.log(dim(`$ ${bin} ${verb} ${entry.npm}`));
      const r = spawnSync(bin, [verb, entry.npm], { cwd, stdio: 'inherit' });
      if (r.status !== 0) throw new Error(`${bin} ${verb} ${entry.npm} failed`);
    }
  } else if (!entry.npm) {
    console.log(`Install: ${entry.install}`);
  }

  // 2. Map onto the brand
  if (!flags.brand) {
    console.log(`\nUsage: ${path.join(entry.dir, 'README.md')}`);
    if (entry.maps?.length) console.log(dim(`Add --brand <brand.json | your globals.css> to generate it in your colours.`));
    return;
  }
  if (!entry.adapter) {
    console.log(yellow(`\n${entry.name} has no brand adapter; see its README for how it takes colours.`));
    return;
  }
  printBrand(b);
  const adapt = (await import(pathToFileURL(entry.adapter))).default;
  const result = await adapt(b, { ts: existsSync(path.join(cwd, 'tsconfig.json')), colour });
  const outDir = path.resolve(cwd, flags.out ?? (existsSync(path.join(cwd, 'src')) ? 'src/components' : 'components'));
  const clashes = Object.keys(result.files).filter((f) => existsSync(path.join(outDir, f)));
  if (clashes.length && !flags.force) {
    throw new Error(`would overwrite ${clashes.map((f) => shortPath(path.join(outDir, f))).join(', ')}; add --force`);
  }
  await mkdir(outDir, { recursive: true });
  for (const [name, text] of Object.entries(result.files)) {
    await writeFile(path.join(outDir, name), text);
    console.log(green(`wrote ${shortPath(path.join(outDir, name))}`));
  }
  // An import path: forward slashes, starting with . or ..
  const rel = path.relative(cwd, outDir).split(path.sep).join('/') || '.';
  const dir = /^\.\.?(\/|$)/.test(rel) || path.isAbsolute(rel) ? rel : `./${rel}`;
  if (result.usage) console.log(`\n${result.usage.trim().replaceAll('{{dir}}', dir)}`);
}

// Relative when it's inside the current folder, ~/… otherwise.
function shortPath(p) {
  const rel = path.relative(process.cwd(), p);
  return rel && !rel.startsWith('..') ? rel : p.replace(homedir(), '~');
}

function packageManager(dir) {
  const has = (f) => existsSync(path.join(dir, f));
  if (has('pnpm-lock.yaml')) return ['pnpm', 'add'];
  if (has('bun.lock') || has('bun.lockb')) return ['bun', 'add'];
  if (has('yarn.lock')) return ['yarn', 'add'];
  return ['npm', 'install'];
}

// ── brand ──────────────────────────────────────────────────────────────────

async function brand(file) {
  if (!file) throw new Error('pa brand <brand.json | globals.css>');
  printBrand(await loadBrand(path.resolve(file)));
}

function printBrand(b) {
  console.log(`\n${bold(b.name)} ${dim(`from ${shortPath(b.source)}${b.hasDark ? '' : ' · dark scheme derived'}`)}`);
  for (const role of ROLES) {
    console.log(`  ${role.padEnd(18)} ${swatch(b.light[role])}${b.light[role].padEnd(10)} ${swatch(b.dark[role])}${dim(b.dark[role])}`);
  }
  console.log(`  ${'fonts'.padEnd(18)} ${b.fonts.sans}${b.fonts.display !== b.fonts.sans ? ` · display ${b.fonts.display}` : ''} · mono ${b.fonts.mono}`);
  console.log(`  ${'radius'.padEnd(18)} ${b.radius}`);
  for (const w of b.warnings) console.log(yellow(`  ! ${w}`));
  console.log();
}

// ── check ──────────────────────────────────────────────────────────────────

async function check() {
  const entries = await loadCatalogue();
  // One example brand with a dark scheme, one without.
  const samples = await Promise.all(['example.json', 'example-cool.json'].map((f) => loadBrand(path.join(ROOT, 'brands', f))));
  let errors = 0;
  let warnings = 0;

  for (const e of entries) {
    const problems = validateEntry(e);
    // Every adapter has to run cleanly against both example brands.
    if (e.adapter) {
      try {
        const adapt = (await import(pathToFileURL(e.adapter))).default;
        for (const sample of samples) {
          try {
            const out = await adapt(sample, { ts: true, colour });
            if (!out?.files || !Object.keys(out.files).length) problems.push({ level: 'error', msg: `adapter returned no files for ${sample.name}` });
          } catch (err) {
            problems.push({ level: 'error', msg: `adapter threw for ${sample.name}: ${err.message}` });
          }
        }
      } catch (err) {
        problems.push({ level: 'error', msg: `adapter.mjs won't load: ${err.message}` });
      }
    }
    if (flags.online) problems.push(...(await upstream(e)));
    for (const p of problems) {
      p.level === 'error' ? errors++ : warnings++;
      console.log(`${p.level === 'error' ? red('✗') : yellow('!')} ${bold(e.id)}: ${p.msg}`);
    }
  }

  const readmePath = path.join(ROOT, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  const fresh = withCatalogue(readme, entries);
  if (fresh !== readme) {
    if (flags.fix) {
      await writeFile(readmePath, fresh);
      console.log(green('README catalogue table rewritten'));
    } else {
      errors++;
      console.log(`${red('✗')} README catalogue table is out of date; run pa check --fix`);
    }
  }

  const summary = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · ${errors} errors · ${warnings} warnings${flags.online ? '' : ' (offline; add --online to re-read licences)'}`;
  console.log(errors ? red(summary) : green(summary));
  return errors ? 1 : 0;
}

// Re-read the licence where it lives, and ask osv.dev about security
// advisories. A licence change or a known advisory is an error, a newer
// version is just a nudge to re-verify.
async function upstream(e) {
  const out = [];
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  // Tools and assets may give their repo as a url: check it's alive, but read its licence by hand.
  const repoName = e.github ?? e.url?.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)\/?$/)?.[1];
  if (repoName) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repoName}`, {
        headers: { accept: 'application/vnd.github+json', ...(token && { authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const repo = await res.json();
      const spdx = repo.license?.spdx_id;
      if (repo.archived) out.push({ level: 'error', msg: `${repoName} is archived` });
      if (e.github && !e.path && spdx !== e.licence) {
        out.push({ level: 'error', msg: `GitHub says ${spdx ?? 'no licence'}, entry says ${e.licence}; read the LICENSE by hand` });
      }
      const idle = (Date.now() - Date.parse(repo.pushed_at)) / 864e5 / 30;
      if (idle > 18 && !e.settled) out.push({ level: 'warn', msg: `no push for ${Math.round(idle)} months; if it's finished, say why in "settled"` });
    } catch (err) {
      out.push({ level: 'warn', msg: `couldn't reach GitHub: ${err.message}` });
    }
  }
  const registries = [
    e.npm && { where: 'npm', osv: 'npm', name: e.npm, url: `https://registry.npmjs.org/${e.npm.replace('/', '%2f')}/latest`, latest: (j) => j },
    e.pypi && { where: 'PyPI', osv: 'PyPI', name: e.pypi, url: `https://pypi.org/pypi/${e.pypi}/json`, latest: (j) => j.info },
  ].filter(Boolean);
  for (const r of registries) {
    let pkg;
    try {
      const res = await fetch(r.url);
      if (!res.ok) throw new Error(`${r.where} ${res.status}`);
      pkg = r.latest(await res.json());
    } catch (err) {
      out.push({ level: 'warn', msg: `couldn't reach ${r.where}: ${err.message}` });
      continue;
    }
    // PyPI licence metadata is too loose to compare, and pip installs are tools (any open-source licence).
    if (r.where === 'npm' && pkg.license !== e.licence) out.push({ level: 'error', msg: `npm says ${pkg.license}, entry says ${e.licence}` });
    try {
      const listed = e.version ? await advisories(r.osv, r.name, e.version) : [];
      const latest = pkg.version === e.version ? listed : await advisories(r.osv, r.name, pkg.version);
      if (latest.length) {
        out.push({ level: 'error', msg: `${r.name} ${pkg.version}, the latest, has ${latest.length} known security advisories (${brief(latest)}); decide whether it stays` });
        continue;
      }
      if (listed.length) {
        out.push({ level: 'error', msg: `${r.name} ${e.version} has ${listed.length} known security advisories (${brief(listed)}); ${pkg.version} has none: re-check it, then update version + verified` });
        continue;
      }
    } catch (err) {
      out.push({ level: 'warn', msg: `couldn't reach osv.dev: ${err.message}` });
    }
    if (e.version && pkg.version !== e.version) {
      out.push({ level: 'warn', msg: `${r.where} is at ${pkg.version}, entry verified ${e.version}; check the adapter still fits, then update version + verified` });
    }
  }
  return out;
}

// Known advisories (including malicious-package reports) for one exact version,
// one id per vulnerability: OSV lists the PyPI and GitHub records of a bug separately.
async function advisories(ecosystem, name, version) {
  const res = await fetch('https://api.osv.dev/v1/query', { method: 'POST', body: JSON.stringify({ package: { ecosystem, name }, version }) });
  if (!res.ok) throw new Error(`osv.dev ${res.status}`);
  const seen = new Set();
  const ids = [];
  for (const v of (await res.json()).vulns ?? []) {
    const names = [v.id, ...(v.aliases ?? [])];
    if (!names.some((n) => seen.has(n))) ids.push(v.id);
    names.forEach((n) => seen.add(n));
  }
  return ids;
}

function brief(ids) {
  return ids.slice(0, 3).join(', ') + (ids.length > 3 ? ', …' : '');
}

// ── picks ──────────────────────────────────────────────────────────────────

async function picks(file) {
  if (!file) throw new Error('pa picks <export.md>  (the Google Doc exported as Markdown; see CLAUDE.md)');
  const { picks: all, unmatched } = parsePicks(await readFile(path.resolve(file), 'utf8'));
  if (!all.length) throw new Error(`no checklist lines found in ${file}; is it the Markdown export of the doc?`);
  const diff = diffPicks(all, await loadCatalogue());
  if (flags.json) {
    console.log(JSON.stringify({ ticked: all.filter((p) => p.ticked).length, total: all.length, ...diff, unmatched }, null, 2));
    return unmatched.length ? 1 : 0;
  }
  const row = (p) => `  ${p.rank ? dim(String(p.rank).padStart(3)) + ' ' : '    '}${p.name}${p.url ? dim(`  ${p.url}`) : ''}`;
  console.log(`${bold(`${all.filter((p) => p.ticked).length} ticked`)} of ${all.length} in the doc\n`);
  console.log(green(`To add (${diff.add.length})`));
  diff.add.forEach((p) => console.log(row(p)));
  console.log(`\nAlready in the repo (${diff.have.length})`);
  diff.have.forEach((p) => console.log(row(p)));
  if (diff.unticked.length) {
    console.log(yellow(`\nIn the repo from an earlier pick, now unticked (${diff.unticked.length}); ask before removing`));
    diff.unticked.forEach((p) => console.log(row(p)));
  }
  if (unmatched.length) {
    console.log(red(`\nCouldn't match ${unmatched.length} checklist line(s) to a resource:`));
    unmatched.forEach((t) => console.log(`  ${t}`));
  }
  return unmatched.length ? 1 : 0;
}
