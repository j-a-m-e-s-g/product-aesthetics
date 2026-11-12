// The shared adapter for everything built on shadcn/ui's theme variables
// (shadcn/ui itself, and the registries and kits that read the same names).
// Writes brand-theme.css: the :root and .dark variable blocks of a shadcn
// globals.css, in the brand's colours, fonts and corner radius.
//
// An entry uses it by re-exporting it from its own adapter.mjs:
//   export { default } from '../../lib/adapters/shadcn-theme.mjs';
//
// Roles map one to one where shadcn has the same idea (background, foreground,
// primary, muted, border). Where shadcn means something else by the name:
//   - shadcn's --accent is a quiet hover surface, not a brand accent. A brand
//     accent that reads as a surface (under 1.5:1 on the background) is kept
//     there; a strong one goes to the charts instead, and --accent gets muted.
//   - --destructive isn't a brand colour; it's a red held to 4.5:1 on the page.

import { contrast, ensureContrast, mix } from '../colour.mjs';

const RED = { light: '#c62828', dark: '#f26b5b' };

function scheme(s, label) {
  const surfaceAccent = contrast(s.accent, s.background) < 1.5;
  const card = s.background;
  const destructive = ensureContrast(RED[label], s.background, 4.5);
  const charts = [
    s.primary,
    surfaceAccent ? mix(s.primary, s.foreground, 0.45) : s.accent,
    s.mutedForeground,
    mix(s.primary, s.background, 0.45),
    mix(s.foreground, s.background, 0.25),
  ];
  return {
    background: s.background,
    foreground: s.foreground,
    card,
    'card-foreground': s.foreground,
    popover: card,
    'popover-foreground': s.foreground,
    primary: s.primary,
    'primary-foreground': s.primaryForeground,
    secondary: s.muted,
    'secondary-foreground': s.foreground,
    muted: s.muted,
    'muted-foreground': s.mutedForeground,
    accent: surfaceAccent ? s.accent : s.muted,
    'accent-foreground': s.foreground,
    destructive,
    border: s.border,
    input: s.border,
    ring: s.primary,
    ...Object.fromEntries(charts.map((c, i) => [`chart-${i + 1}`, c])),
    sidebar: mix(s.background, s.foreground, 0.03),
    'sidebar-foreground': s.foreground,
    'sidebar-primary': s.primary,
    'sidebar-primary-foreground': s.primaryForeground,
    'sidebar-accent': s.muted,
    'sidebar-accent-foreground': s.foreground,
    'sidebar-border': s.border,
    'sidebar-ring': s.primary,
  };
}

const block = (selector, vars) =>
  `${selector} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}`;

/** @param {ReturnType<typeof import('../brand.mjs').resolveBrand>} brand */
export default async function adapt(brand) {
  const root = {
    radius: brand.radius,
    'font-sans': brand.fonts.sans,
    'font-heading': brand.fonts.display,
    'font-mono': brand.fonts.mono,
    ...scheme(brand.light, 'light'),
  };
  const css = [
    `/* ${brand.name.replaceAll('*/', '* /')} for shadcn/ui, made by product-aesthetics (pa add … --brand).`,
    `   Replace the :root and .dark blocks in your globals.css with these, or import this file after it.`,
    `   --accent is shadcn's hover surface; a strong brand accent is used in the charts instead. */`,
    '',
    block(':root', root),
    '',
    block('.dark', scheme(brand.dark, 'dark')),
    '',
  ].join('\n');
  return {
    files: { 'brand-theme.css': css },
    usage: `
Your shadcn theme is in {{dir}}/brand-theme.css.

Either paste its :root and .dark blocks over the ones in your globals.css, or import it after globals.css:
  @import "{{dir}}/brand-theme.css";

The fonts are set as --font-sans, --font-heading and --font-mono. A stock shadcn install writes its own font names
into the @theme inline block in globals.css, which wins over this file; replace those two lines with:
  --font-sans: var(--font-sans);
  --font-heading: var(--font-heading);
Components added afterwards with the shadcn CLI pick the theme up.`,
  };
}
