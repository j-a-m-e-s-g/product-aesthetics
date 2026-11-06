# flubber

Smooth morphs between any two shapes. Most shape tweening needs both shapes to have the same number of points, so a star turning into a circle crumples on the way. flubber works out the best match itself, so the star melts cleanly into the circle, one icon into another, or an outline into a square. It can also split one shape into several and join several back into one, such as a circle breaking into three pieces and closing up again. What it gives you is a function: pass it progress from 0 to 1 and it returns an SVG path. That means it works with any animation library, a canvas, or frame-by-frame video.

<img src="preview.gif" width="600" alt="A blue star splits into a teal circle, a blue rounded square and a dark triangle. The three merge into one blue circle, which grows points back into the star. flubber 0.4.2">

| | |
|---|---|
| **By** | Noah Veltman |
| **Demo** | [Medley demo](https://veltman.github.io/flubber/demos/medley.html), and more linked from its README |
| **Source** | [veltman/flubber](https://github.com/veltman/flubber) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-11-06 at v0.4.2 |
| **Needs** | Any JavaScript. It draws nothing itself: put its paths in an SVG, on a canvas, or in an animation library |

## Install

```bash
npm install flubber      # or: pnpm add flubber
```

The browser build, `flubber/build/flubber.min.js`, is 54 KB (18 KB gzipped) with its few small dependencies included. TypeScript types are in `@types/flubber`.

## Use it as it comes

Shapes are SVG path strings or arrays of `[x, y]` points:

```js
import { interpolate, toCircle, separate, combine } from 'flubber';

const morph = interpolate(starPath, heartPath, { maxSegmentLength: 2 });   // lower = smoother, but slower to set up
path.setAttribute('d', morph(0.5));                                        // halfway

const melt = toCircle(starPath, 100, 100, 40);           // into a circle at (100, 100), radius 40

const split = separate(starPath, [circlePath, squarePath, trianglePath]);  // one → three: an array of functions
split.forEach((f, i) => pieces[i].setAttribute('d', f(p)));

const join = combine([circlePath, squarePath, trianglePath], bigCirclePath);  // three → one
```

| Function | What it does |
|---|---|
| `interpolate(from, to)` | one shape into another |
| `toCircle` · `fromCircle` · `toRect` · `fromRect` | to or from a circle or a rectangle you give by numbers |
| `separate(from, [to…])` | one shape into several (`{ single: true }` returns one combined path) |
| `combine([from…], to)` | several shapes into one |
| `interpolateAll([from…], [to…])` | several shapes into the same number of others, in pairs |
| `toPathString` · `splitPathString` | turn points into a path; break a path into its separate shapes |

**With an animation library.** Animate a number and draw the path from it. For example, with [anime.js](../animejs):

```js
import { animate } from 'animejs';

const state = { p: 0 };
animate(state, { p: 1, duration: 900, ease: 'inOutQuad', onUpdate: () => path.setAttribute('d', morph(state.p)) });
```

**Frame by frame, for video.** Build the morphs once, then draw each frame from its time:

```js
const ease = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const clamp = (x) => Math.min(1, Math.max(0, x));

function render(t) {                                 // t: seconds; this morph runs from 0.5 s to 1.3 s
  path.setAttribute('d', morph(ease(clamp((t - 0.5) / 0.8))));
}
```

## Use it in your brand

flubber only makes shapes, so there's nothing to map and no `pa add --brand` adapter. Colour comes from the path's `fill`, for example `fill: var(--primary)`. When one shape splits into several, give each piece its own brand colour and blend from the starting colour with the same progress as the shape. The preview does this with the cool example brand: primary, accent and foreground.

## Notes

- **Holes are dropped.** In its own words: "If your path string includes holes or multiple shapes in a single string, everything but the first outer shape will be ignored." Letters such as O, A and B lose their counters halfway through. Use shapes without holes, or break a shape into pieces with `splitPathString` and use `separate`/`combine`.
- **Set it up once, call it per frame.** Creating an interpolator does the hard work; calling it is cheap. `separate` and `combine` are the slow ones ("isn't terribly performant and has some quirks", says the README), so build them before the animation starts, never inside the frame loop.
- **Smoothness.** `maxSegmentLength` defaults to 10. For large shapes, or 1080p video, 2 to 4 avoids visible corners mid-morph.
- **Frame-exact for video.** The function returns the same path for the same progress, with no clock and no randomness. In the preview's test page, frame 30 drawn straight after a jump to frame 80 matched the in-order frame pixel for pixel.
- **Finished, not abandoned.** The last push was November 2022. It still has 162,000 npm downloads a week, and 113 packages depend on it directly ([deps.dev](https://deps.dev/npm/flubber)).
- **The preview.** Hand-written star, rounded-square, triangle and circle paths in the cool example brand's colours, with `separate`, `combine` and `interpolate` at `maxSegmentLength: 2`. It was stepped at 25 frames a second with a frame-stepped clock.
