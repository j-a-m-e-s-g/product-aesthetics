# Iconify

Every open-source icon set behind one naming scheme, `prefix:name`, so `lucide:house`, `ph:train-duotone` and `material-symbols:park-outline-rounded` all work the same way. There are 227 sets and about 400,000 icons. [Icones](https://icones.js.org), Anthony Fu's search site built on Iconify, is the quickest way to find one: search, click, copy the name or the SVG. Bundle the icons you use into a site at build time, or fetch one as a ready-coloured SVG for a figure or slide.

<img src="preview.gif" width="600" alt="House, train, tree, building and map pin icons rolling through ten no-credit Iconify sets: lucide, tabler, Phosphor duotone, Material Symbols, MDI, Remix, Carbon, Iconoir, MingCute and Huge Icons">

| | |
|---|---|
| **By** | Vjacheslav Trushkin (Iconify) · Anthony Fu (Icones) |
| **Search** | [icones.js.org](https://icones.js.org) · [icon-sets.iconify.design](https://icon-sets.iconify.design) |
| **Source** | [iconify/iconify › components/react](https://github.com/iconify/iconify/tree/main/components/react) · [antfu/icones](https://github.com/antfu/icones) |
| **Licence** | The tools are MIT (keep notice): `@iconify/react`, `@iconify/utils`, `@iconify/tailwind4`, api.iconify.design and icones.js.org. Read on 2026-10-15 at `@iconify/react` v6.0.2. **The icons are not covered by that.** Each set has its own licence: 159 of the 227 visible sets need no credit (list below), the rest need credit or forbid commercial use |
| **Needs** | React 16+ for `@iconify/react`; Vue, Svelte, plain CSS and a web component are also available |

## Install

```bash
npm install @iconify/react                 # or: pnpm add @iconify/react
npm install -D @iconify-json/lucide @iconify-json/ph   # one package per set you use
```

Each `@iconify-json/<prefix>` package holds one set and carries that set's licence. `@iconify/json` holds all of them, but it's about 500 MB, so install per set. On a Tailwind v4 site, `npm install -D @iconify/tailwind4` is the lightest route (see below).

## Use it as it comes

**Bundle at build time.** Out of the box, `<Icon>` fetches icon data from the public Iconify API in each visitor's browser. Don't ship that: it's slower, and it leaks visits to a third party. Pick the icons out at build time instead, then render them with the offline component, which has no API code in it:

```js
// scripts/icons.mjs: run at build time; writes only the icons you name
import { writeFileSync } from 'node:fs';
import { getIcons } from '@iconify/utils';
import { icons as lucide } from '@iconify-json/lucide';
import { icons as ph } from '@iconify-json/ph';

writeFileSync('src/icons.json', JSON.stringify([
  getIcons(lucide, ['house', 'train-front', 'map-pin']),
  getIcons(ph, ['tree-duotone']),
]));
```

```tsx
import { Icon, addCollection } from '@iconify/react/offline';
import sets from './icons.json';
sets.forEach((s) => addCollection(s));

<Icon icon="lucide:house" />                    // 1em square, takes the text colour
<Icon icon="lucide:train-front" width={24} />
<Icon icon="ph:tree-duotone" className="text-primary" />
```

It renders a plain inline `<svg>`, server-side too. For a handful of icons you can skip the script and import a whole small set (`addCollection(lucide)`), but don't do that with `material-symbols` or `mdi`: they hold 15,700 and 7,400 icons.

**Tailwind v4.** Add `@plugin "@iconify/tailwind4";` under `@import "tailwindcss";`, install the `@iconify-json/<set>` packages you use, and write icons as classes: `<span class="icon-[lucide--train-front] size-6 text-primary"></span>`. Only the icons you use end up in the CSS, each as a mask, so they take the text colour.

**One-off SVGs for figures, slides and videos.** The API returns a finished SVG for any icon, so a script or an AI assistant can fetch one with `curl`:

```bash
curl -s "https://api.iconify.design/lucide/train-front.svg?color=%23e4572e&height=48" -o train.svg
```

`color` takes any CSS colour (URL-encode `#` as `%23`), `height` or `width` sets the size (`auto` keeps the set's own grid), and `rotate=90deg` or `flip=horizontal` turn it. That's fine for files we make. Live sites should bundle, as above.

**Sets worth reaching for** (all on the no-credit list):

| Set | Prefix | Why |
|---|---|---|
| Lucide | `lucide` | the shadcn/ui default; clean 2 px strokes, 1,890 icons |
| Phosphor | `ph` | six weights from `-thin` to `-fill`, plus `-duotone`; good for editorial pages |
| Tabler | `tabler` | 6,200 strokes on a 24 px grid; strong on buildings, transport and maps |
| Material Symbols | `material-symbols` | Google's 15,700, in outline, rounded and sharp; the `material-symbols-light` set is a lighter weight |
| Material Design Icons | `mdi` | 7,400 community icons; covers odd things nobody else has |
| Remix, Carbon, MingCute, Iconoir, Huge Icons | `ri` `carbon` `mingcute` `iconoir` `hugeicons` | other clean UI families; pick one and stay with it |
| Maki, Temaki, Osmic, Map Icons | `maki` `temaki` `osmic` `map` | map-legend symbols (Maki is Mapbox's own); CC0 or OFL |
| Health Icons, Meteocons | `healthicons` `meteocons` | public services, and weather for charts |
| Material Line Icons, SVG Spinners | `line-md` `svg-spinners` | animated: icons that draw themselves in, and loaders |
| Circle Flags, Flagpack | `circle-flags` `flagpack` | country flags for charts |

## Use it in your brand

Most icons are drawn in `currentColor`, so they take the colour of the text around them. Set the colour where you set text colour and the icons follow, light and dark:

```tsx
<Icon icon="lucide:map-pin" className="text-primary" />   // Tailwind / shadcn theme token
<span style={{ color: 'var(--primary)' }}><Icon icon="lucide:map-pin" /></span>
```

Duotone sets (`ph:*-duotone`, `icon-park-twotone`) draw their second tone as `currentColor` at reduced opacity, so they stay in one brand colour. Size follows the font (`1em`) unless you set `width`/`height`. For an SVG file, the API's `?color=` bakes the colour in; leave it off and the file keeps `currentColor`. Multicolour sets (`fluent-color`, `flat-color-icons`, emoji and flags) keep their own colours and won't follow your theme.

For a consistent look, use one set throughout a product and match its stroke weight to your type: `ph:*-light`, `ph:*-thin` or `material-symbols-light` sit well beside light and thin text weights, and `lucide` or `tabler` beside regular weights.

## Notes

- **Check the set, not the tool.** The MIT licence covers Iconify's code, not the icons. Before using a set, find its prefix below. Sets left off the list need credit (CC BY: for example `solar`, `streamline`, `gis`) or ban commercial use (CC BY-NC), and a few are GPL.
- **Brand-logo sets don't clear trademarks.** `simple-icons`, `logos`, `cib`, `bxl`, `nonicons`, `thesvg`, `thesvg-color`, `token`, `token-branded`, `cryptocurrency`, `cryptocurrency-color`, `devicon`, `devicon-plain` and `skill-icons` are free to copy, but using a company's logo is governed by that company's brand rules.
- MIT, ISC, Apache-2.0 and OFL sets need nothing on screen. Their licence travels inside the `@iconify-json/<set>` package in `node_modules`. CC0 and Unlicense sets need nothing at all.
- `@iconify/react/offline` never calls the API; the default `@iconify/react` export does, for any icon it hasn't been given. Use `/offline` on live sites.
- The counts above come from `https://api.iconify.design/collections` on 2026-10-15. Sets get added, so check a new prefix's licence there (`license.spdx`) before relying on it.

### The no-credit sets (159 of 227, read on 2026-10-15)

- **CC0-1.0 (10):** `cib`, `cif`, `cryptocurrency`, `cryptocurrency-color`, `logos`, `maki`, `osmic`, `pinhead`, `simple-icons`, `temaki`
- **Unlicense (1):** `system-uicons`
- **MIT (107):** `akar-icons`, `andrsrxn`, `ant-design`, `at-icons`, `bi`, `bitcoin-icons`, `boxicons`, `bx`, `bxl`, `bxs`, `bytesize`, `catppuccin`, `charm`, `circle-flags`, `clarity`, `codex`, `devicon`, `devicon-plain`, `dinkie-icons`, `duo-icons`, `ei`, `energy-icons`, `eos-icons`, `ep`, `eva`, `f7`, `famicons`, `fe`, `flag`, `flagpack`, `flat-color-icons`, `flowbite`, `fluent`, `fluent-color`, `fluent-emoji-flat`, `fluent-emoji-high-contrast`, `fluent-mdl2`, `fontisto`, `formkit`, `foundation`, `geo`, `gg`, `ginetex`, `glyphs`, `glyphs-poly`, `gravity-ui`, `griddy-icons`, `healthicons`, `heroicons`, `heroicons-outline`, `heroicons-solid`, `hugeicons`, `humbleicons`, `iconmind`, `iconoir`, `iconoven`, `icons8`, `ion`, `ix`, `jam`, `keyline-icons`, `line-md`, `lineicons`, `lsicon`, `majesticons`, `marketeq`, `material-icon-theme`, `matita`, `medical-icon`, `meteocons`, `meteor-icons`, `mi`, `mynaui`, `nimbus`, `nonicons`, `octicon`, `oi`, `ooui`, `pajamas`, `ph`, `pixelarticons`, `prime`, `proicons`, `qlementine-icons`, `quill`, `radix-icons`, `raphael`, `reicon`, `si`, `sidekickicons`, `simple-line-icons`, `skill-icons`, `stash`, `svg-spinners`, `tabler`, `tdesign`, `teenyicons`, `thesvg`, `thesvg-color`, `token`, `token-branded`, `uiw`, `vadivam`, `vscode-icons`, `weui`, `wpf`, `zondicons`
- **ISC (4):** `file-icons`, `lucide`, `lucide-extended`, `lucide-lab`
- **Apache-2.0 (30):** `carbon`, `cuida`, `fxemoji`, `garden`, `gcp`, `grommet-icons`, `ic`, `icon-park`, `icon-park-outline`, `icon-park-solid`, `icon-park-twotone`, `iwwa`, `k8s`, `la`, `mage`, `material-symbols`, `material-symbols-light`, `mdi`, `memory`, `mingcute`, `noto`, `noto-v1`, `oui`, `ri`, `uil`, `uim`, `uis`, `uit`, `unjs`, `vaadin`
- **OFL-1.1 (7):** `academicons`, `el`, `fa`, `map`, `mdi-light`, `picon`, `wi`
