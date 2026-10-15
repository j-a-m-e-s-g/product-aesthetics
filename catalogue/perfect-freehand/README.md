# perfect-freehand

Turns a list of pointer positions into the outline of a pressure-sensitive ink stroke. Strokes thicken where the pen presses and thin where it lifts, taper at the ends and smooth out the wobble of a mouse, so a circle round a word or a scribbled underline looks drawn by hand rather than by a computer. It's one small function with no dependencies, by Steve Ruiz, who later built tldraw on it.

<img src="preview.gif" width="600" alt="A red pen stroke rings the figure '38%' in the headline 'Revenue is up 38%', thick on the left-hand downstroke and thin over the top, then fades and draws again">

| | |
|---|---|
| **By** | Steve Ruiz |
| **Demo** | [perfectfreehand.com](https://perfectfreehand.com) |
| **Source** | [steveruizok/perfect-freehand](https://github.com/steveruizok/perfect-freehand) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-15 at v1.2.3. This is the free stroke library only, not tldraw, which has a paid licence |
| **Needs** | Any JavaScript project. It returns points; you draw them with SVG or canvas |

## Install

```bash
npm install perfect-freehand      # or: pnpm add perfect-freehand
```

## Use it as it comes

`getStroke` takes points as `[x, y, pressure]` and returns the outline of the stroke as a polygon. Turn that into an SVG path with the helper from the library's README, then fill it:

```js
import { getStroke } from 'perfect-freehand';

const outline = getStroke(points, {
  size: 8,              // diameter at full pressure
  thinning: 0.5,        // how much pressure changes the width (0 = even line, negative = thinner when pressed)
  smoothing: 0.5,       // softens the edges
  streamline: 0.5,      // irons out a shaky hand
  simulatePressure: true, // fakes pressure from speed when the input has none (mouse, touch)
  start: { taper: 0 },  // taper length in px at each end
  end: { taper: 0 },
  last: true,           // false while the pen is still down
});
path.setAttribute('d', getSvgPathFromStroke(outline));
```

```js
// getSvgPathFromStroke, from the perfect-freehand README (MIT, Steve Ruiz)
const average = (a, b) => (a + b) / 2;
function getSvgPathFromStroke(points, closed = true) {
  const len = points.length;
  if (len < 4) return '';
  let a = points[0], b = points[1];
  const c = points[2];
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]; b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }
  return closed ? result + 'Z' : result;
}
```

**Drawing with a pen or finger.** Collect `[e.offsetX, e.offsetY, e.pressure]` on `pointerdown` and `pointermove`, and re-run `getStroke` on every move with `last: false`. Real stylus pressure comes through `e.pressure`; for a mouse, leave `simulatePressure` on.

**A stroke that draws itself** (the preview), for a key figure in a video or an animated social graphic. Generate or record the points once, then on each animation frame pass the first *n* of them: `getStroke(points.slice(0, n), { ...options, last: n === points.length })`. The preview uses 65 points round an ellipse with a little wobble, its own pressure curve (`simulatePressure: false`), `size: 8`, `thinning: 0.82`, `smoothing: 0.6`, `streamline: 0.35` and tapers of 14 px and 46 px.

**Other exports.** `getStrokePoints` and `getStrokeOutlinePoints` are the two halves of `getStroke`, for when you want the smoothed centre line, or its running length, to time an animation.

## Use it in your brand

There's no adapter, because the library draws nothing itself: it hands back a shape and you choose the fill. Brand it where you render it:

- **Colour.** Give the path `fill="currentColor"` and it takes the text colour around it, or use a CSS variable such as `fill: var(--primary)` (shadcn) or a Tailwind class such as `fill-primary`. For a highlighter, use a translucent fill (`fill-opacity: 0.35`) behind the text.
- **Weight.** Set `size` from your type scale. About 15–20% of the font size suits a circle or underline, and `thinning` between 0.5 and 0.8 keeps the pressure visible.
- **Fonts.** None; the strokes sit on whatever type you set.

If your primary is pale against your background (under 3:1; `pa brand` tells you), keep the stroke chunky (`size` 8 or more at headline sizes) or draw it in your accent or text colour.

## Notes

- The preview's headline type is Fraunces and the ink is a plain red fill. Both are page styling; the stroke shape comes from the real `getStroke`. The headline is demo copy, not a real figure.
- The README asks commercial users to consider sponsoring Steve Ruiz on GitHub. That's a request, not a licence condition.
- `getSvgPathFromStroke` isn't exported by the package; copy it from the README as above. It's MIT like the rest, so keep the credit comment.
