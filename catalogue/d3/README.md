# D3

The library behind most of the data graphics people remember, with 114,000 GitHub stars. It doesn't draw charts for you. It gives you the parts: scales that turn data into positions and colours, generators for lines, areas, arcs and stacks, map projections (a dozen built in, about a hundred more in the companion `d3-geo-projection`), force-directed layouts, hierarchies (treemaps, packs, trees) and smooth transitions. You draw the result as SVG or on a canvas. That's why it can make the chart nobody has made before. For a standard chart, [Observable Plot](../observable-plot) (same team, built on D3) gets there in a few lines; reach for D3 when Plot can't.

<img src="preview.gif" width="600" alt="A world map morphing from the Equal Earth projection into Mercator and back: Greenland and the far north swell to several times their true size, then shrink again">

| | |
|---|---|
| **By** | Mike Bostock and Observable, with many contributors |
| **Demo** | [the D3 gallery](https://observablehq.com/@d3/gallery) on Observable |
| **Source** | [d3/d3](https://github.com/d3/d3) |
| **Licence** | ISC (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-15 at v7.9.0 |
| **Needs** | Any JavaScript project. SVG or canvas to draw into |

## Install

```bash
npm install d3      # or: pnpm add d3
```

Or import just the modules you use (`d3-scale`, `d3-shape`, `d3-geo`, `d3-force`…) to keep the bundle small.

## Use it as it comes

The preview is a projection morph. Every D3 projection is built on a "raw" function from longitude and latitude to x and y, so blending two raw functions gives a projection partway between them:

```js
import * as d3 from 'd3';

const blend = (a, b, t) => (λ, φ) => {
  const p = a(λ, φ), q = b(λ, φ);
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
};
const projection = d3.geoProjection(blend(d3.geoMercatorRaw, d3.geoEqualEarthRaw, t))
  .fitSize([width, height], { type: 'Sphere' });
path.attr('d', d3.geoPath(projection)(land));     // land: GeoJSON, e.g. Natural Earth
```

The parts most worth knowing:

| Module | What it gives you | Good for |
|---|---|---|
| `d3-scale`, `d3-scale-chromatic` | data → pixels, data → colour, nice ticks | every chart; colour ramps for maps |
| `d3-shape` | lines, areas, arcs, pies, stacks, curves | bespoke line and area charts, donuts, streamgraphs |
| `d3-geo` | projections, map paths, graticules, area and distance | choropleths, locator maps, globes, projection morphs |
| `d3-force` | particles pushed and pulled into place | bubble clusters, beeswarms, network diagrams |
| `d3-hierarchy` | treemaps, circle packing, trees, partitions | part-to-whole, org charts, budgets |
| `d3-transition`, `d3-ease`, `d3-interpolate` | tweening anything over time | animated charts, and frame-exact video renders |

**For video.** Everything above is a pure function of the data and a `t` between 0 and 1, so a renderer can compute any frame exactly; nothing depends on the clock unless you use `d3-transition`.

## Use it in your brand

There's no adapter, because D3 has no look of its own: every colour, font and stroke is one you set. Read your brand from CSS so charts follow your theme:

```js
const css = getComputedStyle(document.documentElement);
const ink = css.getPropertyValue('--foreground').trim();
const accent = css.getPropertyValue('--primary').trim();
const colour = d3.scaleOrdinal([accent, css.getPropertyValue('--accent').trim(), ink]);
```

For Plot-style defaults already mapped to your brand, use [Observable Plot](../observable-plot)'s adapter in this catalogue.

## Notes

- The map data in the preview is [Natural Earth](https://www.naturalearthdata.com) (public domain), read from the `world-atlas` package. That repository is archived, but its files are fine; for anything new, download Natural Earth directly.
- D3 7 is ESM-only. With an old bundler or plain `<script>` tags, use the UMD build from a CDN.
- It's a steep library. Most of its power is in combining a few modules, and the [D3 gallery](https://observablehq.com/@d3/gallery) is the fastest way to find a starting point to adapt.
