// Observable Plot → your brand. Writes brand-plot.js (+ .d.ts): brandPlot(),
// a wrapper round Plot.plot with your font, text colour, grid and colour
// scales as defaults, and brandColors, the palettes it uses.

import { readFile } from 'node:fs/promises';

const template = (name) => readFile(new URL(`./template/${name}`, import.meta.url), 'utf8');

const VISIBLE = 3; // every mixed colour reaches 3:1 on the background (WCAG for graphics)
const DISTINCT = 0.07; // and sits at least this far (OKLab ΔE) from the rest
const MAX = 8;

/** @param {ReturnType<typeof import('../../lib/brand.mjs').resolveBrand>} brand */
export default async function adapt(brand, { colour }) {
  const scheme = (s, dark) => ({
    background: s.background,
    foreground: s.foreground,
    primary: s.primary,
    accent: s.accent,
    muted: s.muted,
    mutedForeground: s.mutedForeground,
    border: s.border,
    categorical: categorical(s, colour),
    sequential: sequential(s, colour, dark),
  });
  const colours = { name: brand.name, font: brand.fonts.sans, ...scheme(brand.light, false), dark: scheme(brand.dark, true) };
  const js = (await template('brand-plot.js')).replace(
    /\/\* brand:start \*\/[\s\S]*?\/\* brand:end \*\//,
    () => `/* brand:start */\nexport const brandColors = ${pretty(colours)};\n/* brand:end */`,
  );
  return {
    files: { 'brand-plot.js': js, 'brand-plot.d.ts': await template('brand-plot.d.ts') },
    usage: `
import * as Plot from '@observablehq/plot';
import { brandPlot, brandColors } from '{{dir}}/brand-plot';

const chart = brandPlot({
  grid: true,                       // grid lines in your border colour
  marks: [Plot.lineY(data, { x: 'date', y: 'value', stroke: 'series' })],  // series take brandColors.categorical
});
container.append(chart);

brandPlot(options, { theme: 'dark' })     // your dark scheme
Plot.barY(data, { x: 'k', y: 'v', fill: brandColors.primary })   // one colour, by hand`,
  };
}

/**
 * Categories: primary, accent and foreground as given, then mixes of them
 * (and of the background) picked farthest-first, so the first few are the
 * most distinct. Mixed colours are nudged to stay visible on the background.
 */
function categorical(s, { mix, contrast, ensureContrast, deltaE }) {
  const out = [];
  const gap = (c) => Math.min(...out.map((o) => deltaE(o, c)));
  for (const c of [s.primary, s.accent, s.foreground]) if (!out.length || gap(c) >= DISTINCT) out.push(c);

  const keys = [s.primary, s.accent, s.foreground, s.background];
  const pool = new Set();
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      for (const t of [0.25, 0.4, 0.5, 0.6, 0.75]) {
        const c = ensureContrast(mix(keys[i], keys[j], t), s.background, VISIBLE);
        if (contrast(c, s.background) >= VISIBLE) pool.add(c);
      }
    }
  }
  while (out.length < MAX) {
    let best = null;
    let bestGap = 0;
    for (const c of pool) {
      const g = gap(c);
      if (g > bestGap) (best = c), (bestGap = g);
    }
    if (!best || bestGap < DISTINCT) break;
    out.push(best);
  }
  return out;
}

/** Numbers: eleven stops from near the background, through primary, to a deep shade toward the text colour. */
function sequential(s, { mix }, dark) {
  const start = mix(s.primary, s.background, dark ? 0.75 : 0.88);
  const end = mix(s.primary, s.foreground, dark ? 0.7 : 0.65);
  const MID = 0.55; // where primary itself sits on the ramp
  return Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return t <= MID ? mix(start, s.primary, t / MID) : mix(s.primary, end, (t - MID) / (1 - MID));
  });
}

// JSON with each palette on one line.
const pretty = (o) => JSON.stringify(o, null, 2).replace(/\[\s+([^\]]*?)\s+\]/g, (_, list) => `[${list.split(/,\s+/).join(', ')}]`);
