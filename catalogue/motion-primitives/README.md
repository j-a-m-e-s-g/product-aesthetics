# Motion Primitives

Small, restrained motion components for React and Tailwind: headlines that blur in word by word, a shimmer that sweeps a status line, text that scrambles into place, numbers that roll, a light that runs round a card's border, dialogs that grow out of the card you clicked. It's copy-and-paste, like shadcn/ui: a command drops the component's source into your project, and from then on it's your code, built on the free `motion` package.

<img src="preview.gif" width="600" alt="TextShimmer sweeping a grey status line while TextEffect blurs a two-line serif headline in word by word, then out again">

| | |
|---|---|
| **By** | Julien Thibeaut (ibelick) |
| **Demo** | [motion-primitives.com/docs](https://motion-primitives.com/docs) |
| **Source** | [ibelick/motion-primitives › components/core](https://github.com/ibelick/motion-primitives/tree/main/components/core) |
| **Licence** | MIT (keep notice): no visible credit, but copied files must keep the MIT notice as a comment (see Install). Free components only. **Motion-Primitives Pro** ([pro.motion-primitives.com](https://pro.motion-primitives.com)) is a separate paid product and isn't covered. Read on 2026-10-15 at commit `120f64f` |
| **Needs** | React 18+, Tailwind CSS, the `motion` package (both CLIs install v14), and a `cn()` helper in `@/lib/utils` |

## Install

In a shadcn/ui project, install through the shadcn CLI. It puts the component in `components/ui/`, puts any hook in `hooks/`, rewrites the `@/` imports to your aliases and installs `motion`:

```bash
npx shadcn@latest add https://motion-primitives.com/c/text-shimmer.json
```

Elsewhere, use the project's own CLI. It writes to `components/motion-primitives/` and installs `motion`:

```bash
npx motion-primitives@latest add text-shimmer     # one component; `list` shows them all
```

Either way you need Tailwind and a `cn()` helper. shadcn projects already have both; otherwise:

```bash
npm install motion clsx tailwind-merge            # or: pnpm add motion clsx tailwind-merge
```

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

**Keep the MIT notice.** Neither CLI adds one, so put this at the top of each copied file, and save the licence once next to them:

```tsx
// Based on Motion-Primitives by ibelick (https://motion-primitives.com)
// Copyright (c) 2024 ibelick. MIT licence; full text in ./LICENCE.md
```

```bash
curl -sL https://raw.githubusercontent.com/ibelick/motion-primitives/main/LICENCE.md -o components/motion-primitives/LICENCE.md
```

## Use it as it comes

```tsx
import { TextEffect } from '@/components/ui/text-effect';
import { TextShimmer } from '@/components/ui/text-shimmer';

<TextEffect per="word" preset="fade-in-blur" as="h1">Ideas, in motion.</TextEffect>
<TextShimmer duration={1.5}>Generating your report…</TextShimmer>
```

The preview above is these two components unedited, set in Instrument Serif and Inter, with `speedReveal={0.7}` and `speedSegment={0.75}` on the headline and `trigger` switched off after about two seconds to play the exit. The headline is two `TextEffect`s, one per line, with their `delay` and `trigger` offset by one word's stagger so they read as one. `TextEffect` splits on spaces, so a `\n` inside one won't break the line.

**The best free components:**

| Component | What it does | Good for |
|---|---|---|
| `text-effect` | per word, character or line reveal; presets `blur`, `fade-in-blur`, `scale`, `fade`, `slide`; `trigger` plays it out again | hero headlines, section titles |
| `text-shimmer` | a highlight sweeps across grey text | "loading…" and status lines |
| `text-scramble` | random characters resolve into the text | a code, figure or name reveal |
| `sliding-number` | each digit rolls to its new value | sign-up counters, live totals |
| `animated-number` | a spring-animated count | big figures on a landing page |
| `in-view` | runs a variant when the element scrolls into view | scroll-in reveals for "how it works" steps |
| `progressive-blur` | a stacked backdrop blur that fades along an edge | captions over photos, scroll edges |
| `border-trail` | a light runs round a card's border | the one card you want clicked |
| `morphing-dialog` | a card expands into a dialog, then shrinks back | case studies, product details |
| `infinite-slider` | a smooth endless strip | a press-logos row |
| `text-loop` | cycles through phrases in one spot | "Built for designers / developers / teams" |

`cursor` and `carousel` here are Motion Primitives' own free components, built on free `motion`. They're not the paid Motion+ `Cursor` and `Carousel`, which this entry doesn't cover.

## Use it in your brand

The components don't bring their own palette. They style with Tailwind classes, so in a shadcn/Tailwind project they pick up your theme tokens (`bg-primary`, `text-foreground`, `border-border`, `text-muted-foreground`) and your font from whatever wraps them. `text-effect`, `text-scramble`, `sliding-number` and `animated-number` have no colours of their own: they take the text colour and font of their parent or `className`.

A few hard-code Tailwind's zinc greys. The files are yours, so swap those for token classes once:

| Component | Hard-coded | Swap for |
|---|---|---|
| `text-shimmer`, `text-shimmer-wave` | `[--base-color:#a1a1aa] [--base-gradient-color:#000]`, and a `dark:` line with `#71717a` / `#ffffff` | `[--base-color:var(--muted-foreground)] [--base-gradient-color:var(--foreground)]`; delete the `dark:` line, because your variables already switch in `.dark`. Use `var(--primary)` for the sweep if you want it in brand colour |
| `border-trail` | `bg-zinc-500` | pass `className="bg-primary"` (`cn()` swaps it), no edit needed |
| `dialog`, `morphing-popover`, `toolbar-dynamic`, `carousel`, `dock`, `spotlight` | `bg-white`, `bg-zinc-*`, `text-zinc-*`, `border-zinc-*`, `gray-*`/`neutral-*` | `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border` |
| `glow-effect` | four rainbow hex colours | pass your own: `colors={['#2563EB', '#0891B2']}`. Use hex values, because the colours are animated inside a gradient string |

For `text-shimmer`, passing the colours through `className` works in light mode only: the component's `dark:` values still win on dark pages. That's why the table says to edit the file. Tested on 2026-10-15 with the `example-cool` brand from this repo as shadcn tokens (sweep set to `var(--primary)`): the blue sweep and the blue border trail rendered correctly on both its light and its dark scheme.

## Notes

- **Avoid Pro and the demo images.** Use only the free components in the repo's `components/core/` (the ones the CLI lists). Don't copy the photos and artwork from the docs demos; bring your own.
- **The project CLI misplaces hooks.** `dialog`, `morphing-dialog`, `morphing-popover`, `toolbar-dynamic` and `toolbar-expandable` import from `@/hooks/…`, but `npx motion-primitives add` writes the hook into `components/motion-primitives/`. Move it to `hooks/`, or use the shadcn route, which puts it in the right place. The project CLI also always writes to `components/` at the project root, even in a `src/` project.
- `infinite-slider`, `sliding-number` and `toolbar-expandable` also need `react-use-measure` (both CLIs install it). A few components import icons from `lucide-react`.
- Every component starts with `'use client'`, so it works in Next.js App Router pages.
- The project calls itself beta. Because you own the copied files, an upstream change never breaks your site; re-copy a component only when you want a fix.
- `motion` itself is MIT. Its paid Motion+ extras (AnimateNumber, Carousel, Cursor, Ticker, Typewriter, ScrambleText, splitText, Curtains, Gallery, AnimateActivity, Motion UI) aren't used by these components.
