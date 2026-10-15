# NumberFlow

An animated number. When the value changes, each digit spins to its new value, commas and decimal points slide into place and the width eases to fit, so a counter, price or statistic feels alive instead of swapped. Formatting comes from the browser's own `Intl.NumberFormat`, so currencies, percentages, compact numbers and British formats all work. There are packages for React, Vue and Svelte, and a web component for anything else.

<img src="preview.gif" width="600" alt="A large number rolls from 1,204 to 48,930 to 9,317 and back, with a small percentage pill rolling underneath: rendered with @number-flow/react 0.6.2">

| | |
|---|---|
| **By** | Maxwell Barvian |
| **Demo** | [number-flow.barvian.me](https://number-flow.barvian.me) |
| **Source** | [barvian/number-flow](https://github.com/barvian/number-flow) |
| **Licence** | MIT (keep notice): no visible credit; the licence stays inside `node_modules`. Read on 2026-10-15 at v0.6.2 (`@number-flow/react` and `number-flow`) |
| **Needs** | React 18+, Vue, Svelte, or nothing for the web component. Animates in current browsers; one that lacks the features it needs shows the new number without the animation |

## Install

```bash
npm install @number-flow/react    # React    (or: pnpm add @number-flow/react)
npm install @number-flow/vue      # Vue
npm install @number-flow/svelte   # Svelte
npm install number-flow           # web component, for any framework or none
```

## Use it as it comes

```tsx
import NumberFlow from '@number-flow/react';

<NumberFlow value={48930} />                                                    // 48,930
<NumberFlow value={0.128} format={{ style: 'percent', maximumFractionDigits: 1, signDisplay: 'always' }} />   // +12.8%
<NumberFlow value={1250} locales="en-GB" format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} />  // £1,250
<NumberFlow value={2400000} locales="en-GB" format={{ notation: 'compact' }} />  // 2.4m
<NumberFlow value={42} prefix="~" suffix=" items" />                            // ~42 items
```

Change `value` and it animates. Nothing else to wire up.

| Prop | What it does |
|---|---|
| `value` | the number |
| `format`, `locales` | passed to `Intl.NumberFormat` (any option except scientific and engineering notation) |
| `prefix`, `suffix` | text either side, which moves with the number |
| `trend` | which way digits spin. By default they spin up when the number rises and down when it falls |
| `animated` | `false` switches the animation off |
| `respectMotionPreference` | on by default: people who've asked their device for less motion get no animation |
| `transformTiming`, `spinTiming`, `opacityTiming` | duration and easing, as Web Animations timing objects |
| `digits` | e.g. `{ 1: { max: 5 } }` so the tens digit wraps at 5, for minutes and seconds |
| `plugins={[continuous]}` | makes the change look like it passes through every number in between |
| `<NumberFlowGroup>` | wrap several numbers that sit side by side so they animate together |

Without a framework:

```html
<number-flow></number-flow>

<script type="module">
  import 'number-flow';
  const flow = document.querySelector('number-flow');
  flow.locales = 'en-GB';
  flow.format = { style: 'currency', currency: 'GBP' };
  flow.update(48930);   // £48,930.00, rolling
</script>
```

## Use it in your brand

NumberFlow is text, so it takes your font, size, weight and colour from its parent or a class. There's no `pa add --brand` adapter because there's nothing to map:

```tsx
<NumberFlow value={n} className="text-5xl font-semibold tabular-nums text-primary" />
```

or in plain CSS, `color: var(--primary); font-family: var(--font-display);`. Turning on tabular figures (`font-variant-numeric: tabular-nums`, Tailwind's `tabular-nums`) keeps every digit the same width, so the number doesn't shuffle sideways while it spins.

For finer control, its pieces are exposed as CSS parts. The React element is `number-flow-react` (the web component is `number-flow`):

```css
number-flow-react::part(symbol) { color: var(--muted-foreground); }   /* commas, %, £ */
number-flow-react::part(fraction) { opacity: 0.6; }                     /* the pence */
```

The top and bottom edges fade while digits spin; `--number-flow-mask-height` and `--number-flow-mask-width` set how far the fade reaches.

## Notes

- MIT throughout, with no paid tier. It's the free stand-in for Motion+'s paid `AnimateNumber` (see [Motion](../motion)).
- The Vue (`@number-flow/vue` 0.5.2) and Svelte (`@number-flow/svelte` 0.4.2) packages are versioned separately. Both are MIT on npm and come from the same repo and licence.
- While digits spin they pass above and below the line, into the fade. Leave a little room above and below a big number so the spin doesn't run into a label.
- It renders on the server too (as declarative shadow DOM), so the number is in the page's HTML before JavaScript loads.
- The preview is the React component with its stock timing and the system font, stepped frame by frame through the Web Animations it creates.
