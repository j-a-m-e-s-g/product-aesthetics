// Paper Shaders → your brand. Writes brand-shaders.js (+ .d.ts): colour-only
// presets for six shaders, light and dark. Every other prop falls back to the
// library's own Default preset.

import { readFile } from 'node:fs/promises';

const template = (name) => readFile(new URL(`./template/${name}`, import.meta.url), 'utf8');

/** @param {ReturnType<typeof import('../../lib/brand.mjs').resolveBrand>} brand */
export default async function adapt(brand, { colour }) {
  const presets = (s, dark) => {
    const { mix, rgb255 } = colour;
    // A partner for primary: your accent, or primary mixed toward the text
    // colour when the accent is primary itself (or too close to it to tell apart).
    const deep = deltaE(s.accent, s.primary, rgb255) >= 0.08 ? s.accent : mix(s.primary, s.foreground, 0.45);
    const tint = mix(s.primary, s.background, 0.55);
    return {
      meshGradient: { colors: [s.background, tint, s.primary, deep] },
      grainGradient: { colorBack: s.background, colors: [s.primary, deep, tint] },
      dithering: { colorBack: s.background, colorFront: s.primary },
      // Dots grow where the photo is dark. On a dark page the dots are light,
      // so the luminance is inverted to keep the photo reading the right way round.
      halftoneDots: { colorBack: s.background, colorFront: s.foreground, inverted: dark },
      // Three tones from the darkest part of the photo to the lightest.
      imageDithering: dark
        ? { colorBack: s.background, colorFront: s.primary, colorHighlight: s.foreground, inverted: false }
        : { colorBack: s.foreground, colorFront: s.primary, colorHighlight: s.background, inverted: false },
      paperTexture: { colorBack: s.muted, colorPaper: s.background, colorShadow: mix(s.background, s.foreground, dark ? 0.35 : 0.25) },
    };
  };
  const out = { ...presets(brand.light, false), dark: presets(brand.dark, true) };
  const js = (await template('brand-shaders.js')).replace(
    /\/\* brand:start \*\/[\s\S]*?\/\* brand:end \*\//,
    `/* brand:start */\n// ${brand.name}\nexport const brandShaders = ${pretty(out)};\n/* brand:end */`,
  );
  return {
    files: { 'brand-shaders.js': js, 'brand-shaders.d.ts': await template('brand-shaders.d.ts') },
    usage: `
import { MeshGradient, Dithering, HalftoneDots } from '@paper-design/shaders-react';
import { brandShaders } from '{{dir}}/brand-shaders';

<MeshGradient {...brandShaders.meshGradient} style={{ width: '100%', height: 480 }} />
<Dithering {...brandShaders.dark.dithering} style={{ width: 320, height: 320 }} />
<HalftoneDots {...brandShaders.halftoneDots} image="/photo.jpg" style={{ width: 400, height: 300 }} />

Presets: meshGradient, grainGradient, dithering, halftoneDots, imageDithering, paperTexture (and the same under .dark).`,
  };
}

// One preset per line, e.g.  dithering: { colorBack: '#f6f8fb', colorFront: '#2563eb' },
function pretty(out) {
  const line = (o) => `{ ${Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'").replaceAll(',', ', ')}`).join(', ')} }`;
  const block = (presets, pad) => Object.entries(presets).filter(([k]) => k !== 'dark').map(([k, v]) => `${pad}${k}: ${line(v)},`).join('\n');
  return `{\n${block(out, '  ')}\n  dark: {\n${block(out.dark, '    ')}\n  },\n}`;
}

// OKLab distance: hue counts as well as lightness, so a cyan accent next to a
// blue primary is distinct even at the same brightness.
function deltaE(a, b, rgb255) {
  const lab = (c) => {
    const [r, g, bl] = rgb255(c).map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bl);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * bl);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * bl);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const [p, q] = [lab(a), lab(b)];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
