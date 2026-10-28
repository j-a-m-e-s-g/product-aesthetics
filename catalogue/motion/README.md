# Motion

The animation library that used to be called Framer Motion. Things move on springs that settle like real objects, appear and leave with their own animations, and respond to hover, press, drag and scroll. Its party trick is layout animation: change an element's size or position, or swap it for another element with the same `layoutId`, and Motion animates smoothly between the two. It draws nothing itself, so it moves your own design. One package covers React and plain JavaScript.

<img src="preview.gif" width="600" alt="Three cards spring in, the black one morphs into a full-width card with a headline and back, then all three leave: rendered with motion/react 14.2.0">

| | |
|---|---|
| **By** | Matt Perry and the Motion team (Motion B.V.) |
| **Demo** | [motion.dev](https://motion.dev) |
| **Source** | [motiondivision/motion](https://github.com/motiondivision/motion) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-28 at v14.7.1. The paid Motion+ extras are a separate product and are not covered (see Notes) |
| **Needs** | React 18+ for `motion/react`; nothing for plain JavaScript |

## Install

```bash
npm install motion      # or: pnpm add motion
```

## Use it as it comes

In React, swap a tag for its `motion.` version and say where it should end up:

```tsx
import { motion, AnimatePresence } from 'motion/react';

// Animate in when it appears, on a spring
<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }} />

// Animate out when it's removed
<AnimatePresence>
  {open && <motion.div key="panel" exit={{ opacity: 0, scale: 0.95 }} />}
</AnimatePresence>

// Hover and press
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} />

// Any change to its size or position animates
<motion.div layout />

// The same layoutId in two places: one morphs into the other (the preview above)
{expanded ? <motion.div layoutId="card" className="card-big" /> : <motion.div layoutId="card" className="card-small" />}
```

Without React:

```js
import { animate, stagger, scroll } from 'motion';

animate('li', { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.05), type: 'spring', bounce: 0.25 });
scroll(animate('.progress', { scaleX: [0, 1] }));   // a reading-progress bar tied to scroll
```

| Tool | What it does |
|---|---|
| `initial` / `animate` / `exit` | where it starts, where it goes, how it leaves (`exit` needs `<AnimatePresence>` around it) |
| `layout` | animates any change in size or position, including reflow caused by other elements |
| `layoutId` | morphs one element into another: a card into a modal, a tab underline from tab to tab |
| `whileHover`, `whileTap`, `whileInView`, `drag` | gestures, with spring-back |
| `stagger()` | offsets a list so items arrive one after another |
| `useScroll`, `scroll()` | link any animation to scroll position |
| `<MotionConfig>` | one default transition and reduced-motion rule for everything inside it |

**Reduced motion.** Wrap the app in `<MotionConfig reducedMotion="user">` and people who've asked their device for less motion get no movement or layout animation; fades and colour changes still run.

## Use it in your brand

Motion has no colours, fonts or corners of its own. It moves elements you've already styled, so they keep your Tailwind classes, CSS variables and fonts while they move. That's why there's no `pa add --brand` adapter: there's nothing to map.

It can animate to your CSS variables, so brand colours stay in one place:

```tsx
<motion.div whileHover={{ backgroundColor: 'var(--primary)' }} />
```

What a brand can own is the *feel*. Set one house spring at the top of the app and every component inherits it, the same way colours come from one theme file:

```tsx
import { MotionConfig } from 'motion/react';

<MotionConfig transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }} reducedMotion="user">
  <App />
</MotionConfig>
```

A low `bounce` (0 to 0.2) reads calm and editorial; 0.3 or more reads playful. `visualDuration` is roughly how long the movement takes to look finished.

## Notes

- **Don't use the paid Motion+ items:** AnimateNumber, Carousel, Cursor, Ticker, Typewriter, ScrambleText, splitText, Curtains, Gallery, AnimateActivity and Motion UI. They aren't in the free `motion` package (14.7.1 doesn't export `AnimateNumber` or `splitText`), so they can't arrive by accident. But many of the 450+ examples on motion.dev are Motion+ only, so check an example is free before copying it. Free stand-ins in this catalogue: [NumberFlow](../number-flow) for rolling numbers, and [anime.js](../animejs) for split text and scrambled text.
- `framer-motion` is the same library under its old name. New code should import from `motion/react`.
- Vue has its own package, `motion-v`, which this entry doesn't cover.
- If you build through Claude Code, `npx motion-ai` adds Motion's free docs skill and MCP server (MIT). It labels the Motion+ pages as paid.
- The preview uses only free APIs (`motion.div`, `layoutId`, `AnimatePresence`, `LayoutGroup`) and two springs set in code, rendered frame by frame from motion 14.2.0. The cards and type are ours: Motion supplies the movement, not the look.
