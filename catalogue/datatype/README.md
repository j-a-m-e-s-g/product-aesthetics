# Datatype

A variable font that turns text into charts. Type `{l:20,45,60,55,80,95}` in Datatype and the browser draws a sparkline in its place; `{b:30,70,50,90}` gives a bar chart and `{p:62}` a pie. It's done with OpenType ligatures, so there's no JavaScript and no SVG: the chart is text. It sits on the baseline next to the number it explains, takes the text colour, and can be copied, searched and set at any size. Change the numbers and the chart changes, which is all an animation needs.

<img src="preview.gif" width="600" alt="A stat card reading 'Weekly active users 48,210' with a sparkline drawing itself to the right of the figure, bars growing after 'Sign-ups by month' and a pie filling to two thirds after 'On mobile'">

| | |
|---|---|
| **By** | Frank Tisellano |
| **Demo** | [franktisellano.github.io/datatype](https://franktisellano.github.io/datatype/) |
| **Source** | [franktisellano/datatype](https://github.com/franktisellano/datatype) |
| **Licence** | SIL Open Font Licence 1.1 (keep notice): use it anywhere, in print, web, video and apps, with no credit; just don't sell the font files on their own. Its letters come from IBM Plex Mono, also OFL, whose reserved name means a modified copy can't be called "Plex". The repo's GitHub badge says "Other" because GitHub doesn't read `OFL.txt`; the file itself is the plain OFL. Read on 2026-10-15 (upstream v1.2.2; Fontsource package 5.3.0) |
| **Needs** | Anything that applies OpenType ligatures: every current browser does; check other apps (see Notes) |

## Install

For a website, the Fontsource package self-hosts it:

```bash
npm install @fontsource-variable/datatype      # or: pnpm add @fontsource-variable/datatype
```

```js
import '@fontsource-variable/datatype/standard.css';   // both axes, weight and width
```

The family is then `'Datatype Variable'`. For desktop apps, download the TTFs from the [repo's `fonts/` folder](https://github.com/franktisellano/datatype/tree/main/fonts) or from Google Fonts, where it's listed as Datatype.

## Use it as it comes

```html
<p>Weekly active users 48,210 <span class="chart">{l:8,30,18,46,34,62,50,78,66,96}</span></p>
```

```css
.chart { font-family: 'Datatype Variable', monospace; letter-spacing: 0; }
```

| Write | Get | Limits |
|---|---|---|
| `{l:2,5,3,8,1,6,4}` | a sparkline | up to 20 points, each 0–100 |
| `{b:15,45,80,30,60}` | a bar chart | up to 20 bars, each 0–100 |
| `{p:62}` | a pie, filled to that percentage | one value, 0–100 |

The font has two axes. Weight (`wght` 100–900, or `font-weight`) thickens the lines and bars. Width (`wdth` 50–150, or `font-stretch`) spaces the points out or packs them in. The preview's sparkline is `font-weight: 600` at `'wdth' 80`.

**Animating.** The chart is whatever the text says, so set `textContent` each frame. The preview grows its sparkline by adding a point at a time, grows each bar from 0 to its value, and counts the pie up, all from one `requestAnimationFrame` loop. It works the same in a frame-by-frame renderer, because nothing depends on the clock.

## Use it in your brand

There's no adapter: it's a font, so it takes your brand the way text does. The charts are drawn in the text colour (`color: var(--primary)` for a chart in brand colour), at the weight you set, and at your type size. Set the words around it in your own fonts and keep Datatype for the chart spans, because its letters are IBM Plex Mono's and won't match your text face.

## Notes

- **Letter-spacing breaks it.** Browsers switch off ligatures in text with any letter-spacing, and without ligatures the chart falls back to the raw `{l:…}` code. A parent with `letter-spacing: -0.02em` (common on big headings) is enough, so set `letter-spacing: 0` on the chart itself.
- Keep the code tight: a space after the colon breaks it into stray text. Values over 100 don't fall back to text, they just draw the wrong shape, so scale your data to 0–100 first.
- Outside the browser, the app has to apply ligatures. Datatype's README says to turn on Ligatures in the OpenType panel in Adobe apps. Only Chrome was tested here, so try your app before relying on it.
- The charts are the size of text: from 0 to 100 a sparkline rises exactly the height of a capital letter. Use them beside a figure or in a sentence, not as a chart in their own right.
