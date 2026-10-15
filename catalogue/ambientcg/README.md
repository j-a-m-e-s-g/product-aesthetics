# ambientCG

About 2,900 public-domain surfaces for 3D work: 2,020 PBR materials, 433 HDRIs and a handful of models, made by one person, Lennart Demes. Most materials are procedural; the best few hundred are photo scans of real walls and floors. It fills the London gaps in Poly Haven, which the studio already uses: yellow stock brick, slate courses, grey paving flags, board-marked concrete, white stucco and paper grain. Claude can search it and download it with plain `curl`, with no account or key.

<img src="preview.png" width="600" alt="Six ambientCG materials as they ship: slate, London stock brick, paving flags, board-marked concrete, parquet and paper">

| | |
|---|---|
| **By** | Lennart Demes |
| **Site** | [ambientcg.com](https://ambientcg.com) · [API docs](https://docs.ambientcg.com/api/v3/assets/) |
| **Licence** | CC0 1.0 (no strings): "You don't need to give credit", and commercial use is allowed. The CC0 covers the downloads *and* the preview renders on the site. Read on 2026-10-15 |
| **Needs** | Nothing for the maps, which work in any 3D tool. Blender for the ready-made `.blend` in each zip |

## Install

Nothing to install. Browse [ambientcg.com/list](https://ambientcg.com/list), or have Claude fetch by API. The API is open and needs no key:

```bash
# 1. Search: id, name and real-world size (cm) of the five most popular slate materials
curl -s "https://ambientcg.com/api/v3/assets?type=material&q=slate&sort=popular&limit=5&include=title,dimensions" \
  | jq -r '.assets[] | "\(.id)\t\(.title)\t\(.dimensions.width)x\(.dimensions.height) cm"'

# 2. List the downloads for one material (1K to 8K, JPG or PNG)
curl -s "https://ambientcg.com/api/v3/assets?id=Bricks105&include=downloads" \
  | jq -r '.assets[0].downloads[] | "\(.attributes)\t\(.size/1e6|floor) MB\t\(.url)"'
#   1K-JPG  4 MB    https://ambientcg.com/get?file=Bricks105_1K-JPG.zip
#   2K-JPG  14 MB   https://ambientcg.com/get?file=Bricks105_2K-JPG.zip  …up to 8K-PNG at 540 MB

# 3. Download a zip at the resolution you want (curl -L follows the redirect)
curl -L -o Bricks105_2K-JPG.zip "https://ambientcg.com/get?file=Bricks105_2K-JPG.zip"
```

Every material zip holds the maps (`_Color`, `_NormalGL`, `_NormalDX`, `_Roughness`, `_Displacement`, `_AmbientOcclusion`), a ready-made `.blend`, a MaterialX `.mtlx`, a USD `.usdc`, a Godot `.tres` and the sphere preview `.png`. 2K-JPG is plenty for a whole façade in a render; use 4K for close-ups.

Useful search parameters: `type` (`material`, `hdri`, `3d-model`, `decal`…), `q` (keywords, ANDed), `sort` (`popular`, `latest`, `downloads`, `alphabet`), `id` (comma-separated), `limit` (up to 500) and `include` (`title`, `tags`, `colors`, `dimensions`, `downloads`, `thumbnails`, `previews`, `maps`). Version 2 of the API (`/api/v2/full_json`) still answers, but it no longer gets updates.

## Use it as it comes

**In the studio's Blender scenes.** The studio builds materials with `mat_pbr()` in `~/projects/studio/design/blender/svkit.py`. It reads four files from `design/blender/assets/tex/<name>/` (`diff.jpg`, `rough.jpg`, `nor.jpg`, `disp.jpg`), and its `size` argument is the real width of one repeat in metres. An ambientCG zip drops straight in with four renames:

```bash
id=Bricks105; res=2K-JPG
dest=~/projects/studio/design/blender/assets/tex/$id     # gitignored, like the Poly Haven sets
mkdir -p "$dest" && curl -sL "https://ambientcg.com/get?file=${id}_${res}.zip" -o "/tmp/$id.zip"
unzip -o -q -j "/tmp/$id.zip" "*_Color.jpg" "*_Roughness.jpg" "*_NormalGL.jpg" "*_Displacement.jpg" -d "$dest"
cd "$dest" && mv ./*_Color.jpg diff.jpg && mv ./*_Roughness.jpg rough.jpg && mv ./*_NormalGL.jpg nor.jpg && mv ./*_Displacement.jpg disp.jpg
```

```python
M["stock"] = mat_pbr("stock", "Bricks105", 2.4, grime=0.3)   # Bricks105 is 240 cm wide
```

Use `_NormalGL`, not `_NormalDX`: Blender reads OpenGL normals, and DX ones light every bump from the wrong side. The API's `dimensions` field gives the size in centimetres (divide by 100 for `size`). Where it's 0, judge the scale from a known module, such as a 215 mm brick or a 600 mm paving flag.

**Anywhere else in Blender**, open the `.blend` from the zip and append its material (File › Append › Material), or point a Principled BSDF at the maps by hand.

**Good starting materials for London housing scenes** (all checked on 2026-10-15):

| For | Asset id | What it is | Size or shape |
|---|---|---|---|
| London stock brick | [`Bricks105`](https://ambientcg.com/a/Bricks105) | yellow-buff stock, rough, running bond | 240 × 120 cm |
| | [`Bricks053`](https://ambientcg.com/a/Bricks053) | cleaner yellow brick | 130 × 130 cm |
| Red brick | [`Bricks097`](https://ambientcg.com/a/Bricks097) | weathered red, dirty mortar | 2:1, size not given |
| | [`Bricks059`](https://ambientcg.com/a/Bricks059) | crisp red, procedural | square |
| Slate roof | [`RoofingTiles003`](https://ambientcg.com/a/RoofingTiles003) | rectangular slates in courses, the Welsh-slate look | square |
| | [`RoofingTiles001`](https://ambientcg.com/a/RoofingTiles001) | old fish-scale slate | square |
| Pavement | [`Tiles038`](https://ambientcg.com/a/Tiles038) | grey square paving flags | 110 × 55 cm |
| | [`PavingStones033`](https://ambientcg.com/a/PavingStones033) | granite setts | square |
| Road | [`Asphalt033`](https://ambientcg.com/a/Asphalt033) | dark urban asphalt | 250 × 250 cm |
| Front path | [`Tiles012`](https://ambientcg.com/a/Tiles012) | black-and-white marble chequer | square |
| Stucco and plaster | [`Plaster001`](https://ambientcg.com/a/Plaster001) | clean white stucco | square |
| | [`PaintedPlaster017`](https://ambientcg.com/a/PaintedPlaster017) | painted plaster, scanned | 2:1 |
| Concrete | [`Concrete045`](https://ambientcg.com/a/Concrete045) | board-marked, Barbican-style | 200 × 200 cm |
| | [`Concrete034`](https://ambientcg.com/a/Concrete034) | smooth light concrete | 110 × 55 cm |
| Wood | [`WoodFloor051`](https://ambientcg.com/a/WoodFloor051) | warm parquet | 180 × 180 cm |
| | [`Planks021`](https://ambientcg.com/a/Planks021) | raw planks, for hoardings and sheds | 140 × 140 cm |
| | [`PaintedWood009C`](https://ambientcg.com/a/PaintedWood009C) | pale painted boards, for cladding and doors | square |
| Paper | [`Paper001`](https://ambientcg.com/a/Paper001) | white cold-press grain | about 1.7:1 |
| | [`Paper003`](https://ambientcg.com/a/Paper003) | creased white paper | square |
| | [`Paper006`](https://ambientcg.com/a/Paper006) | brown kraft | square |

Swap any id into the search URL to see its maps, or open `https://ambientcg.com/a/<id>`.

## Use it in your brand

There are no brand colours to map: these are photographs of real surfaces, and they read best close to true. Bring them into a palette the way a photographer would:

- **In the studio**, `mat_pbr()` already takes `tint` (an RGB multiply), `sat` and `val`. The studio's own scenes use them to warm or quieten a texture, for example `mat_pbr("brick2", "brick_wall_006", 1.7, tint=(0.93, 0.86, 0.8), sat=0.85)` in `the_lift.py`. Keep tints gentle; a brick pushed to brand green stops reading as brick.
- **Paper grain behind web graphics**: use the `_Color` map of `Paper001` as a texture under your brand surface, so the colour still comes from your CSS variables:

  ```css
  .paper { background: var(--background) url(/textures/Paper001_Color.jpg) center / 600px; background-blend-mode: multiply; }
  ```

- **Grain behind print or video figures**: lay the same map over the artwork in *multiply* at 20–40% opacity.

## Notes

- CC0 means no notice is needed in shipped work. If you'd like to credit anyway, the site suggests "Created using `<asset name>` from ambientCG.com, licensed under CC0 1.0".
- `mat_pbr()` scales both axes by one `size`, so it suits square materials. A 2:1 set such as `Bricks105` or `Tiles038` comes out stretched to twice its height: pick a square one, or set the Mapping node's Y scale to `2 / size` in a scene's own copy of the helper. (Tested on 2026-10-15: `Bricks105` through `svkit.mat_pbr` in Blender 5.2, which rendered with tall bricks.)
- `mat_pbr()` joins its texture name onto `assets/tex/`, so an absolute path also works, which is handy for trying a material before filing it in the studio.
- The site is run by one person and says the API "is potentially not as reliable or stable as needed for an 'enterprise-level' application". Download what a scene needs and keep it locally, as the studio does with Poly Haven; don't hot-link the files from a live site.
- Patreon supporters see some new assets early (marked NEW on the site). They go public, and CC0, on release.
- The preview above shows ambientCG's own CC0 preview images (`surface-preview/<id>/<id>_SQ_Color.jpg`), cropped into strips.
