// A brand is the slice of a style guide the adapters need: eight colour roles
// for a light and a dark page, three font stacks and a corner radius.
//
// It loads from either
//   - a brand JSON file (see brands/; DTCG-style {"$value": …} wrappers are fine), or
//   - the project's own CSS: shadcn / Tailwind v4 variables (--background,
//     --primary, --color-primary, --font-sans, --radius…) in :root, @theme and .dark.
//
// Only background, foreground and primary are required. Everything else is
// derived from them, and a missing dark scheme is derived from the light one.

import { readFile } from 'node:fs/promises';
import { contrast, ensureContrast, hex, luminance, mix, parse } from './colour.mjs';

export const ROLES = ['background', 'foreground', 'primary', 'primaryForeground', 'accent', 'muted', 'mutedForeground', 'border'];
const REQUIRED = ['background', 'foreground', 'primary'];

const FALLBACK = {
  sans: 'system-ui, sans-serif',
  display: null, // follows sans
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

/** @param {string} file absolute path to a .json or .css file */
export async function loadBrand(file) {
  const text = await readFile(file, 'utf8');
  const raw = file.endsWith('.css') ? fromCss(text) : unwrap(JSON.parse(text));
  return resolveBrand(raw, file);
}

/** Turn a loose brand description into the full, checked brand the adapters get. */
export function resolveBrand(raw, source = 'inline') {
  const warnings = [];
  const given = normalise(raw.colors ?? raw.colours ?? {});
  const missing = REQUIRED.filter((r) => !given[r]);
  if (missing.length) {
    throw new Error(`${source}: needs ${missing.join(', ')} colours (got ${Object.keys(given).join(', ') || 'none'})`);
  }
  const light = scheme(given, null, warnings, 'light');
  const darkGiven = normalise(raw.dark?.colors ?? raw.dark?.colours ?? raw.dark ?? {});
  const dark = scheme(darkGiven, light, warnings, 'dark');

  const fonts = {};
  for (const key of ['sans', 'display', 'mono']) {
    const v = raw.fonts?.[key] ?? (key === 'display' ? raw.fonts?.heading : undefined);
    fonts[key] = v ? fontStack(v, key) : FALLBACK[key];
  }
  fonts.display ??= fonts.sans;

  let radius = raw.radius ?? '0.5rem';
  if (typeof radius === 'number') radius = `${radius}px`;

  return {
    name: raw.name ?? source.split('/').pop(),
    source,
    hasDark: Object.keys(darkGiven).length > 0,
    light,
    dark,
    fonts,
    radius,
    warnings,
  };
}

function scheme(given, light, warnings, label) {
  const out = {};
  for (const [role, value] of Object.entries(given)) {
    if (!ROLES.includes(role)) continue;
    if (!parse(value)) {
      warnings.push(`${label}.${role}: can't read "${value}" as a colour, deriving it instead`);
      continue;
    }
    out[role] = hex(value);
  }

  if (light) {
    // Dark scheme: what's given wins; the rest is the light scheme turned over.
    out.background ??= luminance(light.foreground) < 0.08 ? light.foreground : mix(light.foreground, '#000000', 0.55);
    out.foreground ??= luminance(light.background) > 0.7 ? light.background : '#ffffff';
    out.primary ??= ensureContrast(light.primary, out.background, 3);
    if (light.accent !== light.primary) out.accent ??= ensureContrast(light.accent, out.background, 3);
  }
  const { background: bg, foreground: fg } = out;
  out.accent ??= out.primary;
  out.primaryForeground ??= contrast(bg, out.primary) >= contrast(fg, out.primary) ? bg : fg;
  out.muted ??= mix(bg, fg, 0.06);
  out.mutedForeground ??= ensureContrast(mix(fg, bg, 0.38), bg, 4.5);
  out.border ??= mix(bg, fg, 0.13);

  const pc = contrast(out.primary, bg);
  if (pc < 3) warnings.push(`${label}: primary ${out.primary} is ${pc.toFixed(1)}:1 on ${bg}; graphics want 3:1 to read clearly`);
  const tc = contrast(fg, bg);
  if (tc < 4.5) warnings.push(`${label}: text ${fg} is ${tc.toFixed(1)}:1 on ${bg}; body text wants 4.5:1`);
  return Object.fromEntries(ROLES.map((r) => [r, out[r]]));
}

// "primary-foreground", "--color-primary", "Primary Foreground" → "primaryForeground"
function normalise(colours) {
  const out = {};
  for (const [k, v] of Object.entries(colours)) {
    if (typeof v !== 'string') continue;
    const key = k
      .replace(/^--/, '')
      .replace(/^colou?r-/, '')
      .toLowerCase()
      .replace(/[-_\s]+(\w)/g, (_, c) => c.toUpperCase());
    out[key] = v;
  }
  return out;
}

// DTCG files wrap every value as {"$value": …, "$type": …}.
function unwrap(node) {
  if (Array.isArray(node)) return node.map(unwrap);
  if (node && typeof node === 'object') {
    if ('$value' in node) return unwrap(node.$value);
    return Object.fromEntries(Object.entries(node).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, unwrap(v)]));
  }
  return node;
}

// "Lato" → '"Lato", system-ui, sans-serif'. A full stack or a var() passes through.
function fontStack(value, key) {
  const v = Array.isArray(value) ? value.join(', ') : String(value).trim();
  if (v.includes(',') || v.startsWith('var(')) return v;
  const family = /^["']/.test(v) ? v : `"${v}"`;
  const fallback = key === 'mono' ? FALLBACK.mono : /serif/i.test(v) && !/sans/i.test(v) ? 'Georgia, serif' : FALLBACK.sans;
  return `${family}, ${fallback}`;
}

// ── Reading a project's CSS ────────────────────────────────────────────────

const ROOTISH = /(^|[\s,(]):root\b|^@theme\b|(^|[\s,])html\b|(^|[\s,])body\b|data-theme=["']?light|(^|[\s,])\.light\b/;
const DARKISH = /\.dark\b|data-theme=["']?dark|prefers-color-scheme:\s*dark/;

/** Pull brand roles out of shadcn / Tailwind-style custom properties. */
export function fromCss(text) {
  const { light, dark } = customProps(text);
  const roles = (vars, outer) => {
    const picked = {};
    // --color-primary first, so a plain --primary (shadcn's source of truth) wins.
    const names = Object.keys(vars).sort((a, b) => b.startsWith('--color-') - a.startsWith('--color-'));
    for (const name of names) {
      const value = resolveVars(vars[name], vars, outer);
      if (!value || !parse(value)) continue;
      const [role] = Object.keys(normalise({ [name]: value }));
      if (ROLES.includes(role)) picked[role] = value;
    }
    return picked;
  };
  const font = (key) => light[`--font-${key}`] && resolveVars(light[`--font-${key}`], light, {}, true);
  return {
    colors: roles(light, {}),
    dark: roles(dark, light),
    fonts: { sans: font('sans'), display: font('display') ?? font('heading'), mono: font('mono') },
    radius: light['--radius'],
  };
}

// Walk the CSS once, remembering which block each custom property sits in.
function customProps(text) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const light = {};
  const dark = {};
  const stack = [];
  let buf = '';
  const flush = () => {
    const m = buf.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
    buf = '';
    if (!m) return;
    if (stack.some((p) => DARKISH.test(p))) dark[m[1]] = m[2].trim();
    else if (stack.some((p) => ROOTISH.test(p))) light[m[1]] = m[2].trim();
  };
  for (const ch of src) {
    if (ch === '{') {
      stack.push(buf.trim());
      buf = '';
    } else if (ch === '}') {
      flush();
      stack.pop();
    } else if (ch === ';') flush();
    else buf += ch;
  }
  return { light, dark };
}

// Replace var(--x, fallback) with its value, looking in `vars` then `outer`.
// Fonts keep a var() that can't be resolved (next/font sets those at runtime);
// colours drop it.
function resolveVars(value, vars, outer, keepUnknown = false, depth = 0) {
  if (depth > 8) return null;
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at < 0) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, at);
    let level = 0;
    let end = at + 3;
    for (; end < value.length; end++) {
      if (value[end] === '(') level++;
      else if (value[end] === ')' && --level === 0) break;
    }
    const inner = value.slice(at + 4, end);
    const comma = inner.indexOf(',');
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    const found = vars[name] ?? outer[name] ?? fallback;
    const resolved = found == null ? null : resolveVars(found, vars, outer, keepUnknown, depth + 1);
    if (resolved == null) {
      if (!keepUnknown) return null;
      out += value.slice(at, end + 1);
    } else out += resolved;
    i = end + 1;
  }
  return out.trim();
}
