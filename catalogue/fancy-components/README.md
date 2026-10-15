# Fancy Components

React components with an editorial eye, by Daniel Petho: a headline whose letters cut up into place, a word that rotates inside a pill, a highlighter that sweeps behind a phrase, type that runs along an SVG path, a picture that opens up between two words, and headlines whose letters fall and pile up under real physics. Where most animation kits make interfaces feel smooth, this one makes type feel designed. Like shadcn/ui it's copy-and-paste: a command drops the component's source into your project, and from then on it's your code, built on the free `motion` package.

<img src="preview.gif" width="600" alt="A serif headline, 'Ship the story.', cuts up into place letter by letter; a blue pill below rotates through 'launches', 'explainers' and 'reels'; a yellow highlighter sweeps behind 'rendered from code'">

| | |
|---|---|
| **By** | Daniel Petho |
| **Demo** | [fancycomponents.dev](https://www.fancycomponents.dev) |
| **Source** | [danielpetho/fancy › src/fancy/components](https://github.com/danielpetho/fancy/tree/main/src/fancy/components) |
| **Licence** | MIT (keep notice): no visible credit, but copied files must keep the MIT notice as a comment (see Install). There's no paid tier. Read on 2026-10-15 at commit `f9f62c6` |
| **Needs** | React 18+, Tailwind CSS, the `motion` package, and a `cn()` helper in `@/lib/utils`. The physics components also need `matter-js` |

## Install

Each component is a shadcn registry item. The shadcn CLI writes it to `components/fancy/<group>/`, installs its packages and rewrites the `@/` imports to your aliases:

```bash
npx shadcn@latest add "https://fancycomponents.dev/r/vertical-cut-reveal.json"
npx shadcn@latest add "https://fancycomponents.dev/r/text-rotate.json"
```

Outside a shadcn project you need Tailwind and a `cn()` helper first:

```bash
npm install motion clsx tailwind-merge            # or: pnpm add motion clsx tailwind-merge
```

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

`gravity` also installs `matter-js`, `poly-decomp`, `svg-path-commander` and `lodash`, plus two small helper files from the same registry.

**Keep the MIT notice.** The CLI doesn't add one, so put this at the top of each copied file, and save the licence once next to them:

```tsx
// Based on Fancy Components by Daniel Petho (https://www.fancycomponents.dev)
// Copyright (c) 2024 Daniel Petho. MIT licence; full text in ./LICENSE
```

```bash
curl -sL https://raw.githubusercontent.com/danielpetho/fancy/main/LICENSE -o components/fancy/LICENSE
```

## Use it as it comes

```tsx
import VerticalCutReveal from '@/components/fancy/text/vertical-cut-reveal';
import TextRotate from '@/components/fancy/text/text-rotate';
import TextHighlighter from '@/components/fancy/text/text-highlighter';

<VerticalCutReveal splitBy="characters" staggerDuration={0.025}
  transition={{ type: 'spring', stiffness: 200, damping: 21 }}>
  Ship the story.
</VerticalCutReveal>

<TextRotate texts={['launches', 'explainers', 'reels']}
  mainClassName="bg-primary text-primary-foreground px-3 rounded-lg overflow-hidden"
  splitLevelClassName="overflow-hidden pb-0.5" staggerFrom="last" staggerDuration={0.025}
  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-120%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
  rotationInterval={1600} animatePresenceMode="popLayout" />

<TextHighlighter triggerType="auto" highlightColor="var(--accent)">rendered from code</TextHighlighter>
```

The preview is exactly these three, set in Instrument Serif and Inter, with a blue pill and a pale yellow highlighter (`#FDE68A`) standing in for brand tokens, with a 280 ms fade added at the end so the loop restarts cleanly. `animatePresenceMode="popLayout"` lets the new word rise while the old one leaves; the default, `"wait"`, empties the pill for a beat between words.

**The best components for type and layout:**

| Component | What it does | Good for |
|---|---|---|
| `vertical-cut-reveal` | letters or words rise out of a cut line, staggered, on a spring | hero headlines, title cards, the first second of a video |
| `text-rotate` | one slot cycles through words, letter by letter | "Made for X / Y / Z" lines |
| `letter-3d-swap` | each letter turns over in 3D, like the face of a cube, to show the new text | button labels, section titles |
| `text-highlighter` | a marker stroke sweeps behind a phrase, in any direction | the key phrase in a paragraph or caption |
| `underline-to-background`, `underline-center` | underlines that grow, swap ends or fill the word | links and emphasised words |
| `scramble-in`, `typewriter` | text resolves from random characters, or types itself | codes, names, terminal-style lines |
| `text-along-path`, `marquee-along-svg-path` | type that runs along any SVG path, and can loop | curved headlines, badges, decorative bands |
| `media-between-text` | a picture or video opens up in the gap between two words | editorial heroes |
| `gravity` | elements fall, bounce and pile up under physics (matter-js); drag them about | playful headers, tag clouds, an end card |
| `stacking-cards`, `box-carousel` | cards that stack as you scroll; a 3D rotating box of images | case studies, galleries |
| `variable-font-*` | a variable font's weight or width follows the cursor | type specimens, interactive headlines |

Several of the rest (pixel trails, image trails, cursor attractors) only do something with a mouse, so they suit a website more than a video or a still.

## Use it in your brand

There's no adapter, because the components bring almost no styling of their own. They take Tailwind classes through props (`mainClassName`, `elementLevelClassName`, `className`…), and type inherits from whatever wraps them, so in a shadcn/Tailwind project you style them with your theme tokens: `bg-primary`, `text-primary-foreground`, `text-foreground`, `font-display`.

Two components set a colour of their own:

| Component | Default | Brand it with |
|---|---|---|
| `text-highlighter` | `highlightColor="hsl(25, 90%, 80%)"`, a peach marker | `highlightColor="var(--primary)"` at reduced opacity, or a dedicated highlight token. Any CSS colour works |
| `underline-to-background` | `targetTextColor="#fef"` | `targetTextColor="var(--primary-foreground)"`, and the underline's own class `bg-primary` |

`gravity` draws nothing of its own (its fills are transparent unless `debug` is on), so the falling pieces are whatever elements you put in it.

## Notes

- **Rendering to video.** These run on Motion's springs, which read `performance.now()` and `requestAnimationFrame`, and some of them run as Web Animations. To capture exact frames, stub both clocks and also take over every Web Animation: pause it when it's created, and catch `play()` and writes to `startTime`, which Motion uses to start it. If you only stub the clocks, headlines finish in real time before the first frame.
- Every component starts with `'use client'`, so it works in Next.js App Router pages.
- Don't copy the photos and artwork from the docs demos; bring your own.
- The repo was last pushed in March 2026. Because you own the copied files, an upstream change never breaks your site.
