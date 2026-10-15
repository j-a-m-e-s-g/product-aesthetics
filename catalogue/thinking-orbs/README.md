# Thinking Orbs

Dotted orbs that show what an AI agent is doing. There are nine animated states, each hand-tuned at two sizes, all drawn on a plain 2D canvas: no WebGL and no filters, so every browser shows the same pixels.

<img src="sheet.gif" width="880" alt="The nine orb states in stock grey, then mapped onto two example brands on light and dark pages">

| | |
|---|---|
| **By** | Jakub Antalik |
| **Demo** | [libraries.dev/orbs](https://libraries.dev/orbs) |
| **Source** | [Jakubantalik/Libraries.dev › packages/thinking-orbs](https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/thinking-orbs) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-15 at v0.3.2 |
| **Needs** | React 18+ |

## Install

```bash
npm install thinking-orbs      # or: pnpm add thinking-orbs
```

## Use it as it comes

```tsx
import { ThinkingOrb } from 'thinking-orbs';

<ThinkingOrb state="searching" />               // 64 px, grey, follows the page theme
<ThinkingOrb state="working" size={20} />       // inline with text
<ThinkingOrb state="solving" color="#E4572E" /> // one-colour tint, keeps the depth shading
```

| State | What it does |
|---|---|
| `working` | particles on tilted orbits |
| `searching` | a scan line sweeps a dotted globe |
| `solving` | bands scramble, then click back solved |
| `listening` | a waveform rolls through the rings |
| `connecting` | a constellation wires itself up |
| `weaving` | three strands plait around the sphere |
| `composing` | an undulating multi-band sash |
| `breathing` | a ring slowly morphing |
| `shaping` | a dotted outline: circle → triangle → square |

**Sizes.** `64` (chat avatar) and `20` (inline text) are separate designs, not one design scaled. `32` is interpolated between them.

**Theme.** `theme="auto"` (the default) follows an ancestor's `data-theme` or `.dark` class, then the OS setting. `"light"` and `"dark"` pin it.

**Other props.** `speed` (multiplier), `paused`, `dots` (density), `dotSize`, `aria-label`, and anything a `<canvas>` takes. Reduced-motion users get a still frame, and orbs pause when they're off screen or the tab is hidden.

## Use it in your brand

The stock `color` prop gives a one-colour tint. The brand version uses two colours, the way a designer would: the dots nearest you take your text colour, the body takes your primary, and the far side fades out. On dark pages it uses your dark-scheme primary.

```bash
cd your-project
pa add thinking-orbs --brand brand.json
# or read the colours straight from your shadcn / Tailwind CSS:
pa add thinking-orbs --brand src/app/globals.css
```

This installs `thinking-orbs` and writes `components/brand-orb.js` plus `brand-orb.d.ts`, with your colours baked in:

```tsx
import { BrandOrb } from '@/components/brand-orb';

<BrandOrb state="searching" />
<BrandOrb state="working" size={20} />
```

`<BrandOrb>` takes the same props as `<ThinkingOrb>` except `color`, `frame` and `gravity`. Its `theme` defaults to `auto` if your brand has a dark scheme and `light` if it doesn't, so a light-only site doesn't flip when someone's OS is in dark mode. Run the command again with `--force` after a brand change.

## Notes

- The brand version is built on the package's public exports (`MODE_FRAMES`, `resolvePreset`, `scaleCounts`, `scaleRadii`). If an upgrade renames them, `pa check --online` will flag the new version so the adapter can be re-checked.
- The upstream repo also has iOS and React Native ports, which this entry doesn't cover.
- Jakub's other packages sit in the same repo (`border-beam`, `voice-glow`, `liquid-gooey`, `metal-fx`, `img-fx`, `bot-avatars`).
