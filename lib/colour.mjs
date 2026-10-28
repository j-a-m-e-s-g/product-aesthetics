// Colour maths for brand mapping. Parses the colour formats a style guide is
// likely to hold (hex, rgb, hsl, oklch, oklab, shadcn's bare HSL triplets),
// mixes in OKLab so tints stay clean instead of going muddy, and scores
// contrast the WCAG way. Colours travel as [r, g, b, a] with 0–1 channels.

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

const NAMED = { white: '#ffffff', black: '#000000', transparent: '#00000000' };

/** Parse a CSS colour string. Returns [r, g, b, a] (0–1) or null. */
export function parse(input) {
  const s = String(input).trim().toLowerCase();
  if (NAMED[s]) return parse(NAMED[s]);
  if (s.startsWith('#')) return parseHex(s);
  const fn = s.match(/^(rgba?|hsla?|oklch|oklab)\((.*)\)$/);
  if (fn) return parseFn(fn[1], fn[2]);
  // shadcn v3 keeps bare HSL triplets in its variables: "222.2 47.4% 11.2%"
  if (/^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(s)) return parseFn('hsl', s);
  return null;
}

function parseHex(s) {
  let h = s.slice(1);
  if (!/^([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(h)) return null;
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
}

// A CSS number with an optional unit: "12", "-.5", "1e3", "40%", "0.5turn".
const NUMBER = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/;

// A hue in degrees, 0–360. CSS allows deg (the default), grad, rad and turn.
const TO_DEG = { '': 1, deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };
function hue(v) {
  if (v === 'none') return 0;
  const m = v.match(NUMBER);
  if (!m || !(m[2] in TO_DEG)) return NaN;
  return (((parseFloat(m[1]) * TO_DEG[m[2]]) % 360) + 360) % 360;
}

function parseFn(name, body) {
  let [main, alphaPart] = body.split('/');
  const args = main.split(/[\s,]+/).filter(Boolean);
  if (alphaPart === undefined && args.length === 4) alphaPart = args.pop(); // legacy rgba(r, g, b, a)
  if (args.length !== 3) return null;
  // A number or percentage; anything else (a typo, a stray unit) is NaN, so the colour is rejected.
  const num = (v, pctScale = 1) => {
    if (v === 'none') return 0;
    const m = v.match(NUMBER);
    if (!m || (m[2] !== '' && m[2] !== '%')) return NaN;
    return m[2] === '%' ? (parseFloat(m[1]) / 100) * pctScale : parseFloat(m[1]);
  };
  const alpha = alphaPart === undefined ? 1 : clamp(num(alphaPart.trim()));
  let rgb;
  if (name.startsWith('rgb')) {
    rgb = args.map((v) => (v.endsWith('%') ? num(v) : num(v) / 255));
  } else if (name.startsWith('hsl')) {
    // Saturation and lightness are percentages, with or without the % sign, clamped to 0–100%.
    const pct = (v) => clamp(v.endsWith('%') ? num(v) : num(v) / 100);
    rgb = hslToRgb(hue(args[0]), pct(args[1]), pct(args[2]));
  } else if (name === 'oklch') {
    const [L, C, H] = [num(args[0]), num(args[1], 0.4), (hue(args[2]) * Math.PI) / 180];
    rgb = oklabToRgb([L, C * Math.cos(H), C * Math.sin(H)]);
  } else {
    rgb = oklabToRgb([num(args[0]), num(args[1], 0.4), num(args[2], 0.4)]);
  }
  if ([...rgb, alpha].some(Number.isNaN)) return null;
  return [...rgb.map((c) => clamp(c)), alpha];
}

function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// Björn Ottosson's OKLab matrices.
function rgbToOklab([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => clamp(fromLinear(c)));
}

const must = (c) => {
  const p = typeof c === 'string' ? parse(c) : c;
  if (!p) throw new Error(`not a colour: ${c}`);
  return p;
};

/** '#rrggbb', or '#rrggbbaa' when not opaque. */
export function hex(c) {
  const [r, g, b, a] = must(c);
  const h = (x) => Math.round(clamp(x) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a) : ''}`;
}

/** [r, g, b] as 0–255 integers. */
export function rgb255(c) {
  return must(c).slice(0, 3).map((x) => Math.round(x * 255));
}

/** 'rgba(r, g, b, a)' for canvas and inline styles. */
export function rgba(c, alpha = 1) {
  const [r, g, b] = rgb255(c);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Perceptual mix: t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
  const [pa, pb] = [must(a), must(b)];
  const [la, lb] = [rgbToOklab(pa), rgbToOklab(pb)];
  const lab = la.map((v, i) => v + (lb[i] - v) * t);
  return hex([...oklabToRgb(lab), pa[3] + (pb[3] - pa[3]) * t]);
}

/**
 * Perceptual distance in OKLab. Hue counts as well as lightness, so a cyan
 * next to a blue is distinct even at the same brightness; under ~0.08 two
 * colours read as one.
 */
export function deltaE(a, b) {
  const [p, q] = [rgbToOklab(must(a)), rgbToOklab(must(b))];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(c) {
  const [r, g, b] = must(c).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// [r, g, b, a] blended over [r, g, b, a] by a's alpha; b counts as opaque.
const blend = (pa, pb) => [...pa.slice(0, 3).map((c, i) => c * pa[3] + pb[i] * (1 - pa[3])), 1];

/** `a` as it shows over `b`, which counts as opaque. */
export function over(a, b) {
  return hex(blend(must(a), must(b)));
}

/**
 * WCAG contrast ratio, 1 to 21, of `a` drawn on `b`. A translucent `a` is
 * scored as it shows, blended over `b`. `b` counts as opaque, since what's
 * behind it is unknown: blend it over its own backdrop first with over().
 */
export function contrast(a, b) {
  const [pa, pb] = [must(a), must(b)];
  const [x, y] = [luminance(blend(pa, pb)), luminance(pb)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Step fg toward black or white (whichever is away from bg) until it reaches `min` contrast. */
export function ensureContrast(fg, bg, min) {
  if (contrast(fg, bg) >= min) return hex(fg);
  const target = luminance(bg) > 0.18 ? '#000000' : '#ffffff';
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}
