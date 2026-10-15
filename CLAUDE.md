# product-aesthetics

A private catalogue of beautiful open-source UI that can ship in a product with no visible credit. Each library gets a folder with install steps, and an optional adapter maps it onto a user's brand. The README explains the repo for people; this file holds the rules for adding to it.

## The bar: all three, or it stays out

1. **Exceptional craft.** Ask whether a designer would stop scrolling for it. If it's merely competent, leave it out.
2. **Licence.** Only the tiers in `lib/catalogue.mjs` count (`no-strings`: CC0, Unlicense, MIT-0, 0BSD, public domain mark; `keep-notice`: MIT, ISC, BSD, Apache-2.0, OFL). The exception is apps we run (`"kind": "tool"`): any open-source licence, since it covers the app and not what we make.
3. **Alive.** Not archived. Flag anything with no push in 18 months.

## Adding an entry

1. **Read the licence; never trust a badge or memory.**
   - `gh api repos/OWNER/REPO --jq '{spdx:.license.spdx_id, archived, pushed:.pushed_at}'`
   - Then read the LICENSE file itself and the README's licence section. Look for Commons Clause riders, "credit required", "free for personal use", and pro-tier carve-outs.
   - For npm packages, check `npm view PKG name version license`.
   - If any of these fail, don't add it. Tell James the exact clause that rules it out.
2. **Create `catalogue/<id>/`.** The id is the npm name or a short kebab-case name. Copy the shape of `catalogue/thinking-orbs/`:
   - `entry.json`: every field in the README's example. `version` and `verified` record what you read and when.
   - `README.md`: same sections as thinking-orbs: a one-paragraph pitch, the visual, the facts table, Install, Use it as it comes, Use it in your brand, Notes. Write the real install command for each package manager that differs.
   - `preview.gif`: a 600 × 300 px tile (300 × 150 CSS px at 2x) under 500 KB, showing the library as it ships. Render it from the real package; never draw an imitation. An optional `sheet.gif` (≤ 1.5 MB) can show more inside the entry's README.
   - `adapter.mjs`: only if the library takes colours, fonts or radius. Set `maps` to match.
3. **Prove it in a scratch project** (never in this repo). Run `npm init -y`, then `pa add <id> --brand <repo>/brands/yimby-alliance.json`, then bundle a test page with esbuild, render it in headless Chrome (puppeteer-core lives in `~/projects/YA/public-mapping/node_modules`) and **look at the screenshot**. For animated previews, stub `performance.now` and `requestAnimationFrame` with a frame-stepped clock so every frame is exact, then encode with ffmpeg (`palettegen` + `paletteuse`, `diff_mode=rectangle`). If the generated code ships types, type-check them with `tsc --strict`.
4. **Finish with `node bin/pa.mjs check --online --fix`.** It must exit 0. It rewrites the README gallery; never edit the gallery by hand.

## Picks: when James says "update the gh"

James ticks what he wants in the Google Doc *Product aesthetics: free design resources you can use without credit* (Drive id `14wSzjGfBSltsrHQNWGjgku4xgKjyxkdit71r7X70WbQ`), tab **Tick what you want**. That tab is the only record of his picks, so read it every time and never ask him to re-tick.

1. Export the doc as Markdown with the Google Drive connector: `download_file_content`, `exportMimeType: "text/markdown"`. The result is saved as JSON with a base64 `content` field; decode it to a scratch `.md` file. Checkboxes inside tables don't survive this export, which is why the picks are a checklist and not a table column.
2. Run `node bin/pa.mjs picks <file>`. It lists ticked items not yet in the catalogue (**To add**), ticked items already here, and earlier picks he has since unticked.
3. Add each **To add** item using the checklist above. Re-read its licence; the doc's check is from 15 October 2026. Set `"from_picks": true`, and set `"pick": "<doc name>"` if the entry's `name` differs from the doc's. Apps get `"kind": "tool"` (any open-source licence, since what we make is ours). Fonts, icon sets, image and 3D archives get `"kind": "asset"`. Both kinds can use `url` instead of `github`.
4. Never remove an unticked entry without asking him first.
5. Run `pa check --online --fix`, then commit and push. "Update the gh" is the go-ahead to push.
6. Tell him what went in, what couldn't and why, and anything waiting on his decision.

## Adapter rules

- One default export: `(brand, { ts, colour }) → { files, usage }`. Write `{{dir}}` in `usage` wherever the output folder belongs.
- Map **roles**, not raw values: `foreground` for ink and text, `primary` for the brand colour, `background` for surfaces, `brand.dark.*` for dark pages. Never change a colour the user gave. If a mapping reads badly, say so in the entry README instead.
- Keep the library's own behaviour (sizes, motion, accessibility). Wrap or theme it; don't fork it.
- Prefer the library's public theming surface (props, CSS variables) over its internals. If you have to use internals, name them in the entry README's Notes so an upgrade can be re-checked.
- Generated files should work in JS and TS projects alike, e.g. a `.js` file plus a `.d.ts`. Put `'use client'` at the top of React components that use hooks.

## Don'ts

- Don't vendor upstream source. Entries point at the package.
- Don't add brand files for organisations James hasn't asked for.
- Don't commit or push unless James asks in that turn.
