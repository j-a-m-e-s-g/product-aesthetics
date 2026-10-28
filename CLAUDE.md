# product-aesthetics

A catalogue of beautiful open-source UI that anyone can ship in a product with no visible credit. Each library gets a folder with install steps, and an optional adapter maps it onto a user's brand. The README explains the repo for people; this file holds the rules for adding to it.

## The bar: all three, or it stays out

1. **Exceptional craft.** Ask whether a designer would stop scrolling for it. If it's merely competent, leave it out.
2. **Licence.** Only the tiers in `lib/catalogue.mjs` count (`no-strings`: CC0, Unlicense, MIT-0, 0BSD, public domain mark; `keep-notice`: MIT, ISC, BSD, Apache-2.0, OFL). The exception is apps we run (`"kind": "tool"`): any open-source licence, since it covers the app and not what we make.
3. **Alive.** Not archived. Flag anything with no push in 18 months. If it's finished rather than abandoned (heavy downloads, big projects depend on it), say why in the entry's `settled` field and the check stops flagging it; otherwise it goes.

## Adding an entry

1. **Read the licence; never trust a badge or memory.**
   - `gh api repos/OWNER/REPO --jq '{spdx:.license.spdx_id, archived, pushed:.pushed_at}'`
   - Then read the LICENSE file itself and the README's licence section. Look for Commons Clause riders, "credit required", "free for personal use", and pro-tier carve-outs.
   - For npm packages, check `npm view PKG name version license`.
   - If any of these fail, don't add it. Tell the user the exact clause that rules it out.
2. **Create `catalogue/<id>/`.** The id is the npm name or a short kebab-case name. Copy the shape of `catalogue/thinking-orbs/`:
   - `entry.json`: every field in the README's example. `version` and `verified` record what you read and when. For anything installed from npm or pip, set `npm` or `pypi` and write `version` exactly as the registry does, so the online check can track releases and security advisories.
     - `tagline` is written for someone who has never coded: one or two plain sentences on what it does for them. No jargon (WebGL, SVG, API, CPU, React, HDRI, choropleth); the entry README holds the technical detail. It's the description on the README card.
     - `category` is one of the sections in `CATEGORIES` in `lib/catalogue.mjs`. Add a section there only when nothing fits, with a plain one-line intro.
   - `README.md`: same sections as thinking-orbs: a one-paragraph pitch, the visual, the facts table, Install, Use it as it comes, Use it in your brand, Notes. Write the real install command for each package manager that differs.
   - `preview.gif`: a 600 × 300 px tile (300 × 150 CSS px at 2x) under 500 KB, showing the library as it ships. Render it from the real package; never draw an imitation. An optional `sheet.gif` (≤ 1.5 MB) can show more inside the entry's README.
   - `adapter.mjs`: only if the library takes colours, fonts or radius. Set `maps` to match.
3. **Prove it in a scratch project** (never in this repo). Run `npm init -y`, then `pa add <id> --brand <repo>/brands/example-cool.json` (and `example.json`), then bundle a test page with esbuild, render it in headless Chrome (install `puppeteer` in the scratch project, or point `puppeteer-core` at an installed Chrome) and **look at the screenshot**. For animated previews, stub `performance.now` and `requestAnimationFrame` with a frame-stepped clock so every frame is exact, then encode with ffmpeg (`palettegen` + `paletteuse`, `diff_mode=rectangle`). If the generated code ships types, type-check them with `tsc --strict`.
4. **Finish with `npm test` and `node bin/pa.mjs check --online --fix`.** Both must exit 0. The check rewrites the README gallery; never edit the gallery by hand. A known security advisory (from osv.dev) on the listed or the latest version fails the check. Tools with neither `npm` nor `pypi` (FFmpeg, Blender) aren't covered: when you touch one, list its newest release that carries the security fixes (FFmpeg names them at ffmpeg.org/security.html).

## The README

It's written for a non-technical reader first: what this is, how to use it, the catalogue, whether it's really free. Everything for coders sits under "For developers" in collapsed sections. Keep it that way. `assets/cover.png` is a collage of ten previews (frame 0 of each, except perfect-freehand's finished circle) laid out in a grid and rendered in Chrome at 2x on a transparent background, so it works in light and dark mode. Remake it when the line-up changes a lot.

## Picks: when the user says "update the gh"

Users can keep a checklist of candidate resources, usually a Google Doc with one checklist line per resource and a table of names and links (the shape the "Tick what you want" tab uses), or any Markdown file. Ticks there are the only record of their picks, so read them every time and never ask them to re-tick. The checklist's location is personal, so it isn't stored in this repo: ask for its link the first time, and remember it outside the repo.

1. Get it as Markdown. For a Google Doc, use the Google Drive connector's `download_file_content` with `exportMimeType: "text/markdown"`. The result is saved as JSON with a base64 `content` field; decode it to a scratch `.md` file. Checkboxes inside tables don't survive this export, so the picks must be checklist lines, not a table column. Ticked lines come through as `- [x] ~~…~~`.
2. Run `node bin/pa.mjs picks <file>`. It lists ticked items not yet in the catalogue (**To add**), ticked items already here, and earlier picks since unticked.
3. Add each **To add** item using the checklist above. Re-read its licence. Set `"from_picks": true`, and set `"pick": "<name in the checklist>"` if the entry's `name` differs. Apps get `"kind": "tool"` (any open-source licence, since what we make is ours). Fonts, icon sets, image and 3D archives get `"kind": "asset"`. Both kinds can use `url` instead of `github`.
4. Never remove an unticked entry without asking first.
5. Run `pa check --online --fix`, then commit and push. "Update the gh" is the go-ahead to push.
6. Report what went in, what couldn't and why, and anything waiting on a decision.

## Adapter rules

- One default export: `(brand, { ts, colour }) → { files, usage }`. Write `{{dir}}` in `usage` wherever the output folder belongs.
- Map **roles**, not raw values: `foreground` for ink and text, `primary` for the brand colour, `background` for surfaces, `brand.dark.*` for dark pages. Never change a colour the user gave. If a mapping reads badly, say so in the entry README instead.
- Keep the library's own behaviour (sizes, motion, accessibility). Wrap or theme it; don't fork it.
- Prefer the library's public theming surface (props, CSS variables) over its internals. If you have to use internals, name them in the entry README's Notes so an upgrade can be re-checked.
- Generated files should work in JS and TS projects alike, e.g. a `.js` file plus a `.d.ts`. Put `'use client'` at the top of React components that use hooks.

## Don'ts

- Don't vendor upstream source. Entries point at the package.
- Keep the repo brand-neutral. No organisation's brand, copy or in-jokes go in entries, previews or examples; the only brands here are the two neutral examples in `brands/`. A user's real style guide lives in their own project and reaches the adapters through `--brand`.
- Preview copy is neutral too: product-style headlines and figures, never one cause or company.
- Don't commit or push unless the user asks in that turn.
