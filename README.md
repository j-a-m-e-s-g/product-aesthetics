# product-aesthetics

**Beautiful open-source UI you can ship in your own product, with nobody's name on screen.**

Every library here has three things checked: it looks exceptional, it's free and open source under a licence that needs no visible credit, and it's still maintained. Each one has its own folder with install steps, and one command puts it into your colours and fonts.

<img src="catalogue/thinking-orbs/sheet.gif" width="880" alt="Thinking Orbs as they ship, then mapped onto the YIMBY Alliance brand and an example brand">

<sub>Thinking Orbs as they ship (top row), then mapped onto two brands by <code>pa add thinking-orbs --brand …</code>.</sub>

## Catalogue

<!-- catalogue:start (pa check --fix writes this) -->

### Loaders & indicators

<table>
<tr>
<td width="33%" valign="top"><a href="catalogue/thinking-orbs"><img src="catalogue/thinking-orbs/preview.gif" width="100%" alt="Thinking Orbs"></a><br><b><a href="catalogue/thinking-orbs">Thinking Orbs</a></b><br>Dotted orbs that animate what an AI agent is doing: nine states, plain 2D canvas, no WebGL.<br><sub>React · MIT (keep notice) · maps colours</sub></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

<!-- catalogue:end -->

## Use one

You need Node 22 or later.

```bash
git clone https://github.com/j-a-m-e-s-g/product-aesthetics.git ~/projects/product-aesthetics
cd ~/projects/product-aesthetics && npm link       # optional: puts `pa` on your PATH

cd ~/your-app
pa list                                            # what's in the catalogue
pa add thinking-orbs                               # install it as it comes
pa add thinking-orbs --brand src/app/globals.css   # …or generated in your brand
```

Without `npm link`, run `node ~/projects/product-aesthetics/bin/pa.mjs` in place of `pa`.

`pa add` installs with your project's package manager (pnpm, bun, yarn or npm, picked from the lockfile). With `--brand` it also writes a ready-made component into `src/components/` (or `--out <dir>`), and prints how to use it. It won't overwrite a file unless you add `--force`. Every library's own folder has the full install and usage steps if you'd rather do it by hand.

## Map it onto your style guide

The adapters work from eight colour roles, three font stacks and a radius. Point `--brand` at either of these:

**Your app's CSS.** If the project uses shadcn/ui or Tailwind v4, its `globals.css` already holds a style guide. `pa` reads `--background`, `--foreground`, `--primary`, `--color-*`, `--font-sans`, `--radius` and the rest from `:root`, `@theme` and `.dark`. It handles hex, `rgb()`, `hsl()`, `oklch()` and shadcn's bare HSL values, and it follows `var()` references.

**A brand file.** Use a small JSON file like [`brands/yimby-alliance.json`](brands/yimby-alliance.json):

```json
{
  "name": "YIMBY Alliance",
  "colors": { "background": "#FFFFFF", "foreground": "#353741", "primary": "#73AB96" },
  "dark":   { "background": "#353741", "foreground": "#FFFFFF" },
  "fonts":  { "sans": "Lato" },
  "radius": "6px"
}
```

Only `background`, `foreground` and `primary` are required. `pa` works out the rest and doesn't change any colour you give it:

| Role | If you leave it out |
|---|---|
| `primaryForeground` | whichever of background or foreground reads better on primary |
| `accent` | primary |
| `muted`, `border` | the background tinted 6% and 13% toward the foreground (mixed in OKLab, so tints stay clean) |
| `mutedForeground` | foreground eased 38% toward the background, but never under 4.5:1 contrast |
| the whole `dark` scheme | background and foreground swapped; primary lightened only if it falls under 3:1 on the dark background |
| `fonts` | `"Lato"` becomes `"Lato", system-ui, sans-serif`; display follows sans; mono falls back to the system mono |

Design-token files in the W3C format (`{"$value": …}`) load as they are, and keys can be `primary-foreground` or `primaryForeground`.

`pa brand <file>` prints what a brand resolves to, with colour swatches, and warns when contrast is weak:

```text
$ pa brand brands/yimby-alliance.json
YIMBY Alliance from brands/yimby-alliance.json
  background         #ffffff    #353741
  foreground         #353741    #ffffff
  primary            #73ab96    #73ab96
  …
  ! light: primary #73ab96 is 2.6:1 on #ffffff; graphics want 3:1 to read clearly
```

## What gets in

1. **It looks exceptional.** It should feel crafted on sight, not just competent.
2. **The licence needs no visible credit.** `pa check` enforces this:

   | Terms | Licences | What you owe |
   |---|---|---|
   | **no strings** | CC0-1.0, Unlicense, MIT-0, 0BSD | nothing |
   | **keep notice** | MIT, ISC, BSD-2/3-Clause, Apache-2.0, OFL-1.1 | nothing on screen; the licence text stays with the code. npm keeps it in `node_modules` for you, and copy-pasted files keep their header comment |

   **Kept out:** GPL, LGPL and AGPL (copyleft); any CC-BY (visible credit) or non-commercial licence; MIT plus Commons Clause; BSL, PolyForm and other source-available licences; "free with attribution"; and anything that's free only as a teaser for a paid tier.
3. **It's alive.** Archived repos are rejected. A repo with no push for 18 months gets flagged.

A project can change its licence for future versions, but the version you installed keeps the licence it shipped under. That's why each entry records the version and the date its licence was read. `pa check --online` re-reads every licence on GitHub and npm and fails if one has changed.

## Add a library

The quickest way is to ask Claude: *"add `<repo url>` to product-aesthetics"*. [`CLAUDE.md`](CLAUDE.md) holds the checklist it follows. To do it by hand:

1. Read the licence yourself, including the LICENSE file and the README's small print. Don't go by the badge.
2. Create `catalogue/<id>/` with:
   - `entry.json`: the facts (see below)
   - `README.md`: install, usage and how it takes your brand ([thinking-orbs](catalogue/thinking-orbs/README.md) is the model)
   - `preview.gif`: a 600 × 300 tile rendered from the real library, under 500 KB
   - `adapter.mjs`, if it takes colours, fonts or radius
3. Run `node bin/pa.mjs check --online --fix`. This validates the entry, runs its adapter against a sample brand, re-reads the licence upstream and rewrites the gallery above.

```jsonc
{
  "name": "Thinking Orbs",
  "tagline": "One line about what it looks like.",
  "category": "Loaders & indicators",
  "author": "Jakub Antalik",
  "github": "Jakubantalik/Libraries.dev",   // owner/repo
  "path": "packages/thinking-orbs",         // optional: a monorepo package
  "demo": "https://libraries.dev/orbs",     // optional
  "licence": "MIT",                         // SPDX id, from the list above
  "stack": ["React"],
  "install": "npm install thinking-orbs",   // shown to people; any command or download step
  "npm": "thinking-orbs",                   // optional: lets pa install it and track versions
  "version": "0.3.2",                       // the version the licence was read at
  "verified": "2026-10-15",                 // the day it was read
  "maps": ["colours"]                       // what the adapter maps: colours, fonts, radius
}
```

An adapter is one function. It takes the resolved brand and returns the files to write:

```js
export default async function adapt(brand, { ts, colour }) {
  // brand.light / brand.dark: background, foreground, primary, primaryForeground,
  //   accent, muted, mutedForeground, border (all hex)
  // brand.fonts: sans, display, mono · brand.radius · brand.hasDark
  // colour: mix, rgba, hex, contrast, ensureContrast · ts: the project uses TypeScript
  return {
    files: { 'brand-orb.js': '…', 'brand-orb.d.ts': '…' },
    usage: "import { BrandOrb } from '{{dir}}/brand-orb';",
  };
}
```

## Layout

```text
bin/pa.mjs            the CLI (no dependencies)
lib/brand.mjs         reads brand files and CSS, derives the missing roles
lib/colour.mjs        colour parsing, OKLab mixing, WCAG contrast
lib/catalogue.mjs     loads and validates entries; writes the gallery above
brands/               brand files: yimby-alliance.json, example.json
catalogue/<id>/       one folder per library: entry.json, README.md, preview, adapter
```
