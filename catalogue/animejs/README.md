# anime.js

A small, fast JavaScript animation engine with tricks that are hard to find free anywhere else: drawing SVG lines, splitting text into lines, words and letters, morphing shapes, moving things along a path, scroll-linked playback and dragging. Everything can sit on one timeline that you play, reverse, loop or jump to an exact millisecond. Version 4 is a rewrite with modular imports, so you only ship what you use, and it works with any framework or none.

<img src="preview.gif" width="600" alt="The word Lines drawn in outline letter by letter, filled, underlined from the centre, then captioned letter by letter: rendered with anime.js 4.5.0">

| | |
|---|---|
| **By** | Julian Garnier |
| **Demo** | [animejs.com](https://animejs.com) |
| **Source** | [juliangarnier/anime](https://github.com/juliangarnier/anime) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-15 at v4.5.0. "100% free", paid for by sponsors: there's no paid tier |
| **Needs** | Any modern browser. No framework |

## Install

```bash
npm install animejs      # or: pnpm add animejs
```

## Use it as it comes

```js
import { animate, createTimeline, stagger, svg, splitText, utils } from 'animejs';

// Move anything: CSS, transforms, SVG attributes, CSS variables
animate('.card', { y: [24, 0], opacity: [0, 1], delay: stagger(60), ease: 'outExpo' });

// Draw SVG lines: any <path>, <line>, <circle>, <rect>…
animate(svg.createDrawable('.drawing path'), { draw: ['0 0', '0 1'], duration: 1200, delay: stagger(100), ease: 'inOutQuad' });

// Reveal a headline letter by letter, each rising out of a clip
const { chars } = splitText('h1', { chars: { wrap: 'clip' } });
animate(chars, { y: ['100%', '0%'], delay: stagger(15), ease: 'outExpo' });
```

Put steps on one timeline. The last number is where each step starts, in milliseconds:

```js
const { chars } = splitText('.caption', { chars: { wrap: 'clip' } });
utils.set(chars, { y: '100%' });   // hide them until their turn (see Notes)

const tl = createTimeline({ defaults: { ease: 'inOutQuad' } })
  .add(svg.createDrawable('.drawing path'), { draw: ['0 0', '0 1'], duration: 1000, delay: stagger(120) }, 0)
  .add(chars, { y: ['100%', '0%'], delay: stagger(13), ease: 'outExpo' }, 800);

tl.seek(1200);   // jump to an exact moment; also tl.pause(), tl.reverse(), tl.restart()
```

| Import | What it does |
|---|---|
| `animate` | tweens CSS, transforms, SVG attributes, CSS variables and plain JS objects |
| `createTimeline` | sequences and overlaps animations; play, reverse, loop or `seek()` |
| `stagger` | offsets each element in turn, from the first, the centre, the last or across a grid |
| `svg.createDrawable` · `svg.morphTo` · `svg.createMotionPath` | line drawing · shape morphing · moving along a path |
| `splitText` | lines, words and letters, each wrapped so it can slide out of a clip |
| `onScroll` | plays or scrubs any animation as the page scrolls |
| `createDraggable` | dragging with springy release and bounds |
| `createLayout` | animates elements between two layouts |
| `waapi.animate` | the same syntax on the browser's built-in engine, for a much smaller bundle |

**In React**, create animations inside a scope so they're cleaned up when the component goes:

```jsx
import { useEffect, useRef } from 'react';
import { animate, createScope } from 'animejs';

function Hero() {
  const root = useRef(null);
  useEffect(() => {
    const scope = createScope({ root }).add(() => {
      animate('.title', { y: [20, 0], opacity: [0, 1] });
    });
    return () => scope.revert();
  }, []);
  return <div ref={root}><h1 className="title">…</h1></div>;
}
```

**Reduced motion** isn't automatic. Pass `mediaQueries: { reduceMotion: '(prefers-reduced-motion)' }` to `createScope` and check `self.matches.reduceMotion` inside `.add(self => …)` to tone things down.

## Use it in your brand

anime.js has no look of its own. It moves what you've already styled, so colours and fonts come from your CSS, and there's no `pa add --brand` adapter because there's nothing to map.

- **Line drawings** take whatever stroke the SVG has. Give it `stroke="currentColor"` and it draws in the surrounding text colour, or set `stroke: var(--primary)` in CSS for your brand colour.
- **Split text** keeps the heading's own font, size and colour, because the letters are plain spans inside it.
- **CSS variables** can be animated directly, e.g. `animate('.card', { '--lift': '12px' })`, so a theme can stay in one place.

What a brand can own is the timing. Set house defaults once and every animation picks them up:

```js
import { engine } from 'animejs';

engine.defaults.ease = 'outExpo';
engine.defaults.duration = 600;
```

## Notes

- The whole package is MIT and free, with no paid tier or pro version. That includes `splitText` and `scrambleText`, which are paid extras in Motion+ (see [Motion](../motion)).
- Version 4 changed the API. `anime({ targets, … })` became `animate(targets, { … })`, and easing names lost their prefix (`'outExpo'`, not `'easeOutExpo'`). Most tutorials and CodePens online are version 3, so check the version before copying.
- Found while making the preview: a step that starts later in a timeline doesn't apply its starting value until its turn comes, so letters due to rise at 800 ms sit in their final place until then. Set the start state first with `utils.set()`, as in the timeline example above.
- The preview's letters are DM Serif Display (OFL) outlines turned into SVG paths, with a system-font caption, stepped frame by frame with `tl.seek()`. The fonts are ours; anime.js supplies the drawing and the reveal.
- It's listed in the Google Doc as "anime.js (version 4)".
