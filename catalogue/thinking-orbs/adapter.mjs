// thinking-orbs → your brand. Writes brand-orb.js (+ .d.ts): the stock orb's
// states and behaviour, painted in your text colour and primary.

import { readFile } from 'node:fs/promises';

const template = (name) => readFile(new URL(`./template/${name}`, import.meta.url), 'utf8');

/** @param {ReturnType<typeof import('../../lib/brand.mjs').resolveBrand>} brand */
export default async function adapt(brand) {
  const colours = {
    name: brand.name,
    light: { ink: brand.light.foreground, body: brand.light.primary },
    dark: { body: brand.dark.primary },
    // A brand with no dark scheme probably has no dark pages, so don't let the OS flip it.
    theme: brand.hasDark ? 'auto' : 'light',
  };
  const js = (await template('brand-orb.js')).replace(
    /\/\* brand:start \*\/[\s\S]*?\/\* brand:end \*\//,
    () => `/* brand:start */\nexport const BRAND = ${JSON.stringify(colours)};\n/* brand:end */`,
  );
  return {
    files: { 'brand-orb.js': js, 'brand-orb.d.ts': await template('brand-orb.d.ts') },
    usage: `
import { BrandOrb } from '{{dir}}/brand-orb';

<BrandOrb state="searching" />            // 64 px, chat-avatar scale
<BrandOrb state="working" size={20} />    // inline with text
<BrandOrb state="listening" theme="dark" />

States: working, searching, solving, listening, connecting, weaving, composing, breathing, shaping.`,
  };
}
