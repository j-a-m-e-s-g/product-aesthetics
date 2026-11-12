// sonner → your brand. Writes brand-theme.css (the shared shadcn/ui theme variables, see
// lib/adapters/shadcn-theme.mjs) and brand-toaster.js (+ .d.ts): Sonner's <Toaster> with its
// public CSS variables pointed at that theme, the way shadcn/ui's own Sonner wrapper does it,
// plus your sans font. Toast surface = popover (your background), text = foreground,
// hairline = border, corners = radius. Sonner's motion, sizes and rich colours are untouched.

import shadcnTheme from '../../lib/adapters/shadcn-theme.mjs';

const js = `'use client';
// Sonner's <Toaster> in your brand: it reads the variables in brand-theme.css (light and .dark).
// Made by product-aesthetics (pa add sonner --brand). Takes every <Toaster> prop.
import { createElement } from 'react';
import { Toaster } from 'sonner';

const BRAND = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--border-radius': 'var(--radius)',
  fontFamily: 'var(--font-sans)',
};

export function BrandToaster({ style, ...props }) {
  return createElement(Toaster, { ...props, style: { ...BRAND, ...style } });
}
`;

const dts = `import type { ReactElement } from 'react';
import type { ToasterProps } from 'sonner';

/** Sonner's <Toaster> in your brand's surface, text, border, corner radius and font. Takes every Toaster prop. */
export declare function BrandToaster(props: ToasterProps): ReactElement;
`;

/** @param {ReturnType<typeof import('../../lib/brand.mjs').resolveBrand>} brand */
export default async function adapt(brand, opts) {
  const theme = await shadcnTheme(brand, opts);
  return {
    files: { ...theme.files, 'brand-toaster.js': js, 'brand-toaster.d.ts': dts },
    usage: `
1. Load your brand variables once, globally (skip this if your shadcn/ui globals.css already has your theme):
   @import "{{dir}}/brand-theme.css";

2. Use <BrandToaster> where you'd put <Toaster>, and call toast() from 'sonner' as usual:
   import { BrandToaster } from '{{dir}}/brand-toaster';
   import { toast } from 'sonner';

   <BrandToaster theme="system" />     // match theme to your page: light, dark or system
   toast('Event created', { description: 'Monday at 10:00' });

Dark pages: brand-theme.css switches on a .dark class on <html>; set theme="dark" (or "system") to match.`,
  };
}
