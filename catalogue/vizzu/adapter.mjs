// Vizzu → your brand. Writes brand-vizzu.js (+ .d.ts): a light and a dark Vizzu
// style (fonts, series palette, axes, legend, titles) and brandChart(), which
// applies one and switches off the Vizzu logo.

import { readFile } from 'node:fs/promises';

const template = (name) => readFile(new URL(`./template/${name}`, import.meta.url), 'utf8');

/** @param {ReturnType<typeof import('../../lib/brand.mjs').resolveBrand>} brand */
export default async function adapt(brand, { colour }) {
  const { mix, deltaE } = colour;
  const style = (s) => {
    // Series colours: primary, then accent (or a deeper primary when the accent is primary
    // itself, or too close to it to tell apart), then lighter and darker steps of both,
    // then the muted text colour.
    const second = deltaE(s.accent, s.primary) >= 0.08 ? s.accent : mix(s.primary, s.foreground, 0.45);
    const palette = [s.primary, second, mix(s.primary, s.background, 0.5), mix(second, s.foreground, 0.35), mix(second, s.background, 0.5), s.mutedForeground];
    const text = { color: s.foreground };
    const quiet = { color: s.mutedForeground };
    const axis = { color: s.border, label: quiet, title: quiet, ticks: { color: s.border }, interlacing: { color: mix(s.background, s.muted, 0.6) } };
    return {
      fontFamily: brand.fonts.sans,
      backgroundColor: s.background,
      // A separate display face is set at its own weight; a sans title is set semibold.
      title: { ...text, fontFamily: brand.fonts.display, fontWeight: brand.fonts.display === brand.fonts.sans ? 600 : 'normal' },
      subtitle: quiet,
      caption: quiet,
      legend: { title: quiet, label: text, marker: { type: 'square' } },
      plot: {
        marker: {
          colorPalette: palette.join(' '),
          // For a measure on the colour channel: background tint → primary → deep primary.
          colorGradient: `${mix(s.primary, s.background, 0.8)} 0,${s.primary} 0.5,${mix(s.primary, s.foreground, 0.5)} 1`,
          label: text,
          guides: { color: s.border },
        },
        xAxis: axis,
        yAxis: axis,
      },
      tooltip: { backgroundColor: s.foreground, color: s.background, fontFamily: brand.fonts.sans },
    };
  };
  const out = { light: style(brand.light), dark: style(brand.dark) };
  const js = (await template('brand-vizzu.js')).replace(
    /\/\* brand:start \*\/[\s\S]*?\/\* brand:end \*\//,
    () => `/* brand:start */\n// ${brand.name}\nexport const brandStyle = ${JSON.stringify(out, null, 2)};\n/* brand:end */`,
  );
  return {
    files: { 'brand-vizzu.js': js, 'brand-vizzu.d.ts': await template('brand-vizzu.d.ts') },
    usage: `
import Vizzu from 'vizzu';
import { brandChart } from '{{dir}}/brand-vizzu';

const chart = new Vizzu('chart', { data });
await chart.initializing;
await brandChart(chart);                      // or brandChart(chart, 'dark')
await chart.animate({ config: { x: 'Year', y: 'Revenue', color: 'Channel' } });
await chart.animate({ config: { coordSystem: 'polar' } });   // the bars bend into a pie`,
  };
}
