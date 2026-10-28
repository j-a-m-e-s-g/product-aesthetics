# Rough.js

A small library that draws like a person with a pen. Lines wobble a little, shapes don't quite close, and fills are hatched, zigzagged, cross-hatched or dotted, the way you'd shade on paper. It's what gives Excalidraw its look, and with 21,000 GitHub stars it's the standard for a sketched style. Use it for hand-drawn charts, circles round the number that matters, diagram boxes, or pencil accents over a clean design.

<img src="preview.png" width="600" alt="Four hand-drawn circles filled with hatching, zigzags, cross-hatching and dots, beside a hand-drawn bar chart for Monday to Friday whose tallest bar, Friday, is hatched in blue and circled in red">

| | |
|---|---|
| **By** | Preet Shihn |
| **Demo** | [roughjs.com](https://roughjs.com) |
| **Source** | [rough-stuff/rough](https://github.com/rough-stuff/rough) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`, or keep its header if you copy the file. Read on 2026-10-16 at 4.6.6 |
| **Needs** | Any JavaScript project. Draws into an `<svg>` or a `<canvas>` |

## Install

```bash
npm install roughjs      # or: pnpm add roughjs
```

## Use it as it comes

```js
import rough from 'roughjs';

const rc = rough.svg(svgElement);           // or rough.canvas(canvasElement)
svgElement.appendChild(rc.rectangle(300, 120, 44, 130, {
  fill: '#2563eb', fillStyle: 'hachure', hachureGap: 5, stroke: '#1f2937', roughness: 1.4, seed: 14 }));
svgElement.appendChild(rc.ellipse(322, 116, 86, 40, { stroke: '#dc2626', strokeWidth: 2, seed: 21 }));
```

`roughness` sets how wobbly (0 is ruler-straight, 1 the default, 2 and up loose). `fillStyle` is `hachure`, `solid`, `zigzag`, `cross-hatch`, `dots`, `dashed` or `zigzag-line`. **Always pass a `seed`**: without one the wobble is random on every draw, so a shape jitters from frame to frame in a video and changes on every page load.

## Use it in your brand

There's no adapter: pass your colours as `stroke` and `fill`. Keep `roughness` and stroke width the same across a piece so the hand looks consistent, and set the wobble low (0.5 to 1) for a neater, more editorial line.

## Notes

- The last commit was in July 2024. The library is complete and stable, and nothing in it depends on fast-moving browser APIs.
- For strokes with real pen pressure (thick and thin), use [perfect-freehand](../perfect-freehand); for hand-drawn type, a handwriting font such as Caveat in the [open fonts kit](../open-fonts).
- Hand-drawn wobble suits notes, annotations and playful charts. On precise drawings such as architecture, plans and maps, it can read as careless; use crisp lines there.
