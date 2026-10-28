// Run with `npm test` (node --test). No dependencies.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { fromCss, loadBrand, resolveBrand } from '../lib/brand.mjs';
import { catalogueMarkdown, loadCatalogue, ROOT, validateEntry } from '../lib/catalogue.mjs';
import * as colour from '../lib/colour.mjs';
import { diffPicks, parsePicks } from '../lib/picks.mjs';

const base = { background: '#ffffff', foreground: '#111111', primary: '#2563eb' };

test('colour: hues wrap and take CSS units', () => {
  assert.equal(colour.hex('hsl(-120 100% 50%)'), '#0000ff');
  assert.equal(colour.hex('hsl(600 100% 50%)'), '#0000ff');
  assert.equal(colour.hex('hsl(0.5turn 100% 50%)'), '#00ffff');
  assert.equal(colour.hex('hsl(120 50 50)'), colour.hex('hsl(120 50% 50%)'));
  assert.equal(colour.hex('oklch(0.7 0.1 1rad)'), colour.hex(`oklch(0.7 0.1 ${180 / Math.PI}deg)`));
  assert.equal(colour.hex('222.2 47.4% 11.2%'), colour.hex('hsl(222.2 47.4% 11.2%)'));
  assert.equal(colour.hex('hsl(0 200% 75%)'), '#ff8080'); // saturation clamps to 100%
});

test('colour: malformed numbers are rejected, not half-read', () => {
  for (const bad of ['hsl(10furlong 50% 50%)', 'hsl(12.3.4 50% 50%)', 'rgb(255 0 0 / nope)', 'rgb(10px 0 0)', 'brand-blue']) {
    assert.equal(colour.parse(bad), null, bad);
  }
});

test('colour: a translucent colour is scored as it shows on the background', () => {
  assert.equal(colour.contrast('#00000000', '#ffffff'), 1);
  assert.equal(colour.contrast('#000000', '#ffffff'), 21);
  const shown = colour.contrast('rgb(0 0 0 / 50%)', '#ffffff');
  assert.ok(Math.abs(shown - colour.contrast('#808080', '#ffffff')) < 0.05, String(shown));
});

test('colour: deltaE is zero for a colour and itself, and grows with distance', () => {
  assert.equal(colour.deltaE('#2563eb', '#2563eb'), 0);
  assert.ok(colour.deltaE('#2563eb', '#2a66ee') < 0.08);
  assert.ok(colour.deltaE('#2563eb', '#0891b2') >= 0.08);
});

test('brand: role keys in any case keep the colour given', () => {
  for (const key of ['primaryForeground', 'primary-foreground', 'Primary Foreground', 'primary_foreground', '--color-primary-foreground']) {
    assert.equal(resolveBrand({ colors: { ...base, [key]: '#ff0000' } }).light.primaryForeground, '#ff0000', key);
  }
});

test('brand: an unreadable required colour says which one', () => {
  assert.throws(() => resolveBrand({ colors: { ...base, primary: 'brand-blue' } }, 'x.json'), /can't read primary "brand-blue"/);
  assert.throws(() => resolveBrand({ colors: { background: '#fff' } }, 'x.json'), /needs foreground, primary/);
});

test('brand: the name is one line, so it is safe in code comments', () => {
  assert.equal(resolveBrand({ name: 'Acme\n  Co', colors: base }).name, 'Acme Co');
  assert.equal(resolveBrand({ colors: base }, '/a/b/globals.css').name, 'globals.css');
});

test('brand: a missing dark scheme is derived and reported', async () => {
  const b = await loadBrand(path.join(ROOT, 'brands/example.json'));
  assert.equal(b.hasDark, false);
  assert.equal(b.dark.background, b.light.foreground);
});

test('css: :root:not(.dark) is the light scheme', () => {
  const css = ':root:not(.dark) { --background: #fff; --foreground: #000; --primary: #f00; }\n.dark { --primary: #0f0; }';
  const { colors, dark } = fromCss(css);
  assert.deepEqual(colors, { background: '#fff', foreground: '#000', primary: '#f00' });
  assert.deepEqual(dark, { primary: '#0f0' });
});

test('css: var() falls back when the variable is missing or unresolvable; dark reads :root', () => {
  const css = `:root { --background: #fff; --foreground: #000; --primary: var(--brand, #f00); --brand: var(--nowhere); --blue: #00f; }
    @theme inline { --color-accent: var(--blue); --font-sans: var(--font-geist-sans); }
    @media (prefers-color-scheme: dark) { :root { --primary: var(--blue); } }`;
  const raw = fromCss(css);
  assert.equal(raw.colors.primary, '#f00');
  assert.equal(raw.colors.accent, '#00f');
  assert.equal(raw.dark.primary, '#00f');
  assert.equal(raw.fonts.sans, 'var(--font-geist-sans)');
});

test('css: a variable cycle is invalid, so the fallback outside it is used', () => {
  const css = `:root { --background: #fff; --foreground: #000; --a: var(--a, #f00); --primary: var(--a, #00f);
      --b: var(--c, #f00); --c: var(--b); --accent: var(--b, #0f0); --border: var(--border); }
    @theme inline { --font-sans: var(--font-sans); }`;
  const raw = fromCss(css);
  assert.equal(raw.colors.primary, '#00f'); // direct cycle
  assert.equal(raw.colors.accent, '#0f0'); // indirect cycle: --b's own fallback is inside it
  assert.equal(raw.colors.border, undefined);
  assert.equal(raw.fonts.sans, 'var(--font-sans)'); // fonts leave it for the browser (next/font)
});

test('brand: text on a see-through primary is chosen for how primary shows on the page', () => {
  const b = resolveBrand({ colors: { background: '#ffffff', foreground: '#000000', primary: '#0000001a' } });
  assert.equal(b.light.primaryForeground, '#000000');
  const glass = resolveBrand({ colors: { background: '#ffffff80', foreground: '#000000', primary: '#2563eb' } });
  assert.ok(glass.warnings.some((w) => /see-through/.test(w)), glass.warnings.join('; '));
});

test('adapters: every one runs on both example brands and writes valid JavaScript', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pa-test-'));
  try {
    const brands = await Promise.all(['example.json', 'example-cool.json'].map((f) => loadBrand(path.join(ROOT, 'brands', f))));
    // A name that would break naive templating: a comment end, and replace() patterns.
    brands.push(resolveBrand({ name: "Odd */ $' $& $` name", colors: base }));
    for (const e of (await loadCatalogue()).filter((x) => x.adapter)) {
      const adapt = (await import(pathToFileURL(e.adapter))).default;
      for (const b of brands) {
        const { files, usage } = await adapt(b, { ts: true, colour });
        assert.ok(Object.keys(files).length, `${e.id}: no files`);
        assert.match(usage, /\{\{dir\}\}/, `${e.id}: usage has no {{dir}}`);
        for (const [name, text] of Object.entries(files)) {
          // With every comment taken out, no stray comment end is left behind.
          if (name.endsWith('.css')) assert.ok(!text.replace(/\/\*[\s\S]*?\*\//g, '').includes('*/'), `${e.id}/${name}: comments`);
          if (!name.endsWith('.js')) continue;
          const file = path.join(dir, `${e.id}-${name.replace(/\.js$/, '.mjs')}`);
          writeFileSync(file, text);
          const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
          assert.equal(r.status, 0, `${e.id}/${name} for ${b.name}: ${r.stderr}`);
        }
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('vizzu: brandChart hides the logo once per chart, however often it is called', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pa-test-'));
  try {
    const adapt = (await import(pathToFileURL(path.join(ROOT, 'catalogue/vizzu/adapter.mjs')))).default;
    const { files } = await adapt(await loadBrand(path.join(ROOT, 'brands/example-cool.json')), { ts: true, colour });
    const file = path.join(dir, 'brand-vizzu.mjs'); // plain data and functions, no imports
    writeFileSync(file, files['brand-vizzu.js']);
    const { brandChart, brandStyle } = await import(pathToFileURL(file));
    const handlers = [];
    const styles = [];
    const chart = { on: (event, fn) => handlers.push(event), animate: ({ style }) => styles.push(style) };
    brandChart(chart);
    brandChart(chart, 'dark');
    assert.deepEqual(handlers, ['logo-draw']);
    assert.deepEqual(styles, [brandStyle.light, brandStyle.dark]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('cli: a bad flag or command gets usage and exit 1, not a stack trace', () => {
  for (const args of [['add', 'cobe', '--bogus'], ['toString'], ['frob']]) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'bin/pa.mjs'), ...args], { encoding: 'utf8' });
    assert.equal(r.status, 1, args.join(' '));
    assert.match(r.stdout + r.stderr, /pa list/, args.join(' '));
    assert.doesNotMatch(r.stderr, /\n\s+at /, args.join(' '));
  }
});

test('picks: ticks, ranks, strike-through and names with colons', () => {
  const md = [
    '- [x] ~~1 Paper Shaders: shaders~~',
    '- [ ] 2 Satori: Vercel: renders',
    '- [X] 3 Mystery',
    '| [**Paper Shaders**](https://shaders.paper.design) | [**Satori: Vercel**](https://github.com/vercel/satori) |',
  ].join('\n');
  const { picks, unmatched } = parsePicks(md);
  assert.deepEqual(picks, [
    { name: 'Paper Shaders', url: 'https://shaders.paper.design', ticked: true, rank: 1 },
    { name: 'Satori: Vercel', url: 'https://github.com/vercel/satori', ticked: false, rank: 2 },
  ]);
  assert.deepEqual(unmatched, ['Mystery']);
  const diff = diffPicks(picks, [{ id: 'paper-shaders', name: 'Paper Shaders' }, { id: 'satori', name: 'Satori', pick: 'Satori: Vercel', from_picks: true }]);
  assert.deepEqual(diff.have.map((p) => p.id), ['paper-shaders']);
  assert.deepEqual(diff.unticked.map((p) => p.id), ['satori']);
});

test('gallery: names and taglines are escaped', () => {
  const md = catalogueMarkdown([{ id: 'x', name: 'A "B" <C>', tagline: 'Fast & < 5 KB', category: 'Animation', kind: 'code', maps: [], preview: 'p.gif' }]);
  assert.match(md, /alt="A &quot;B&quot; &lt;C&gt; preview"/);
  assert.match(md, /Fast &amp; &lt; 5 KB/);
});

test('validation: malformed fields are reported, not thrown', () => {
  const e = { id: 'x', dir: ROOT, kind: 'code', name: 'X', category: 'Animation', maps: {}, verified: 'soon' };
  const msgs = validateEntry(e).map((p) => p.msg);
  assert.ok(msgs.includes('"maps" should be an array'), msgs.join('; '));
  assert.ok(msgs.includes('missing "tagline"'), msgs.join('; '));
  assert.doesNotThrow(() => catalogueMarkdown([e]));
});
