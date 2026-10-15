# ambientCG

About 2,900 public-domain surfaces for 3D work: 2,020 PBR materials, 433 HDRIs and a handful of models, all made by one person, Lennart Demes. Most of the materials are procedural, and the best few hundred are photo scans of real walls and floors: brick, slate, paving, plaster, board-marked concrete, timber, marble, fabric and paper grain. Every file is CC0, and the open API means you (or an AI assistant) can search and download with plain `curl`, with no account and no key.

<img src="preview.png" width="600" alt="Six ambientCG materials as they ship: slate roofing, yellow stock brick, paving flags, board-marked concrete, parquet and paper">

| | |
|---|---|
| **By** | Lennart Demes |
| **Site** | [ambientcg.com](https://ambientcg.com) · [API docs](https://docs.ambientcg.com/api/v3/assets/) |
| **Licence** | CC0 1.0 (no strings): "You don't need to give credit", and commercial use is allowed. The CC0 covers the downloads *and* the preview renders on the site. Read on 2026-10-15 |
| **Needs** | Nothing for the maps, which work in any 3D tool. Blender for the ready-made `.blend` in each zip |

## Install

Nothing to install. Browse [ambientcg.com/list](https://ambientcg.com/list), or fetch by API. The API is open and needs no key:

```bash
# 1. Search: id, name and real-world size (cm) of the five most popular slate materials
curl -s "https://ambientcg.com/api/v3/assets?type=material&q=slate&sort=popular&limit=5&include=title,dimensions" \
  | jq -r '.assets[] | "\(.id)\t\(.title)\t\(.dimensions.width)x\(.dimensions.height) cm"'

# 2. List the downloads for one material (1K to 8K, JPG or PNG)
curl -s "https://ambientcg.com/api/v3/assets?id=Bricks105&include=downloads" \
  | jq -r '.assets[0].downloads[] | "\(.attributes)\t\(.size/1e6|floor) MB\t\(.url)"'
#   1K-JPG  4 MB    https://ambientcg.com/get?file=Bricks105_1K-JPG.zip
#   2K-JPG  14 MB   https://ambientcg.com/get?file=Bricks105_2K-JPG.zip  …up to 8K-PNG at 540 MB

# 3. Download a zip at the resolution you want (curl -L follows the redirect), then unzip it
curl -L -o Bricks105_2K-JPG.zip "https://ambientcg.com/get?file=Bricks105_2K-JPG.zip"
unzip Bricks105_2K-JPG.zip -d Bricks105
```

Every material zip holds the maps (`_Color`, `_NormalGL`, `_NormalDX`, `_Roughness`, `_Displacement`, `_AmbientOcclusion`, plus `_Metalness` for metals), a ready-made `.blend`, a MaterialX `.mtlx`, a USD `.usdc`, a Godot `.tres` and the sphere preview `.png`. 2K-JPG is plenty for a whole façade in a render; use 4K for close-ups.

Useful search parameters: `type` (`material`, `hdri`, `3d-model`, `decal`…), `q` (keywords, ANDed), `sort` (`popular`, `latest`, `downloads`, `alphabet`), `id` (comma-separated), `limit` (up to 500) and `include` (`title`, `tags`, `colors`, `dimensions`, `downloads`, `thumbnails`, `previews`, `maps`). Version 2 of the API (`/api/v2/full_json`) still answers, but it no longer gets updates.

## Use it as it comes

**In Blender, by hand.** Open the `.blend` from the zip and append its material (File › Append › Material), or point a Principled BSDF at the maps yourself.

**In Blender, by script.** This builds the standard node setup from an unzipped folder: the colour map into Base Color, roughness (and metalness, if there is one) as non-colour data, the OpenGL normal map through a Normal Map node, and the displacement map as fine bump on top. It uses box projection from object space, so the mesh needs no UVs, and it sizes the texture in real metres:

```python
import bpy, os

def ambientcg_material(folder, width_m, height_m=None, floor=False, name=None):
    """A Principled BSDF material from an unzipped ambientCG folder.
    width_m, height_m: the real size of one repeat in metres (the API's dimensions / 100).
    floor: True for floors, roofs and paving, so a non-square texture keeps its aspect on flat faces."""
    height_m = height_m or width_m
    files = os.listdir(folder)
    def tex(map_name, colour=False):
        fn = next((f for f in files if f.endswith((f"_{map_name}.jpg", f"_{map_name}.png"))), None)
        if fn is None:
            return None
        node = nodes.new("ShaderNodeTexImage")
        node.image = bpy.data.images.load(os.path.join(folder, fn), check_existing=True)
        node.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"
        node.projection = "BOX"          # no UVs needed: projects from object space
        node.projection_blend = 0.15
        links.new(mapping.outputs["Vector"], node.inputs["Vector"])
        return node

    mat = bpy.data.materials.new(name or os.path.basename(os.path.normpath(folder)))
    if mat.node_tree is None:            # Blender 4.x; 5.x always has a node tree
        mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    coords = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    # Object space is in metres once the object's scale is applied (Ctrl+A > Scale).
    # Box projection reads walls as (X or Y, Z) and flat faces as (Y, X),
    # so the texture's height goes on Z for walls and on X for floors.
    w, h = 1 / width_m, 1 / height_m
    mapping.inputs["Scale"].default_value = (h, w, w) if floor else (w, w, h)
    links.new(coords.outputs["Object"], mapping.inputs["Vector"])

    colour = tex("Color", colour=True)
    links.new(colour.outputs["Color"], bsdf.inputs["Base Color"])
    rough = tex("Roughness")
    if rough:
        links.new(rough.outputs["Color"], bsdf.inputs["Roughness"])
    metal = tex("Metalness")
    if metal:
        links.new(metal.outputs["Color"], bsdf.inputs["Metallic"])
    normal = tex("NormalGL")              # Blender reads OpenGL normals; never NormalDX
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Distance"].default_value = 0.01
    if normal:
        nmap = nodes.new("ShaderNodeNormalMap")
        links.new(normal.outputs["Color"], nmap.inputs["Color"])
        links.new(nmap.outputs["Normal"], bump.inputs["Normal"])
    disp = tex("Displacement")
    if disp:
        links.new(disp.outputs["Color"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat

wall.data.materials.append(ambientcg_material("/path/to/Bricks105", 2.4, 1.2))             # 240 × 120 cm
floor.data.materials.append(ambientcg_material("/path/to/Tiles038", 1.1, 0.55, floor=True))  # 110 × 55 cm
```

Tested on 2026-10-15 in Blender 5.2 with Cycles: a 4 m brick wall and a paved floor, checked from the front and from straight above, came out with true-proportion bricks and square paving flags. Apply the object's scale first (Ctrl+A › Scale), or the texture scales with the object. The API's `dimensions` field gives the size in centimetres; where it's 0, judge the scale from a known module, such as a 215 mm brick or a 600 mm paving flag.

The displacement map goes in as bump, which suits most scenes. For real geometric relief, also connect it through a Displacement node to the Material Output, set Material › Settings › Displacement to *Displacement and Bump*, and give the mesh enough subdivision.

**Good starting materials for architecture and interiors** (all checked on 2026-10-15):

| For | Asset id | What it is | Size or shape |
|---|---|---|---|
| Brick | [`Bricks105`](https://ambientcg.com/a/Bricks105) | yellow-buff stock brick, rough, running bond | 240 × 120 cm |
| | [`Bricks053`](https://ambientcg.com/a/Bricks053) | cleaner yellow brick | 130 × 130 cm |
| | [`Bricks097`](https://ambientcg.com/a/Bricks097) | weathered red, dirty mortar | 2:1, size not given |
| | [`Bricks059`](https://ambientcg.com/a/Bricks059) | crisp red, procedural | square |
| Roofing | [`RoofingTiles003`](https://ambientcg.com/a/RoofingTiles003) | rectangular slates in courses | square |
| | [`RoofingTiles001`](https://ambientcg.com/a/RoofingTiles001) | old fish-scale slate | square |
| Paving and streets | [`Tiles038`](https://ambientcg.com/a/Tiles038) | grey square paving flags | 110 × 55 cm |
| | [`PavingStones033`](https://ambientcg.com/a/PavingStones033) | granite setts | square |
| | [`Asphalt033`](https://ambientcg.com/a/Asphalt033) | dark asphalt | 250 × 250 cm |
| Plaster and render | [`Plaster001`](https://ambientcg.com/a/Plaster001) | clean white render | square |
| | [`PaintedPlaster017`](https://ambientcg.com/a/PaintedPlaster017) | painted plaster, scanned | 2:1 |
| Concrete | [`Concrete045`](https://ambientcg.com/a/Concrete045) | board-marked | 200 × 200 cm |
| | [`Concrete034`](https://ambientcg.com/a/Concrete034) | smooth light concrete | 110 × 55 cm |
| Metal | [`CorrugatedSteel009`](https://ambientcg.com/a/CorrugatedSteel009) | dark corrugated cladding, scanned | 2:1 |
| | [`Metal009`](https://ambientcg.com/a/Metal009) | brushed steel | square |
| Wood | [`WoodFloor051`](https://ambientcg.com/a/WoodFloor051) | warm parquet | 180 × 180 cm |
| | [`Planks021`](https://ambientcg.com/a/Planks021) | raw planks | 140 × 140 cm |
| | [`PaintedWood009C`](https://ambientcg.com/a/PaintedWood009C) | pale painted boards, for cladding and doors | square |
| Stone and floors | [`Marble012`](https://ambientcg.com/a/Marble012) | veined white marble | square |
| | [`Travertine009`](https://ambientcg.com/a/Travertine009) | banded travertine | 120 × 120 cm |
| | [`Terrazzo005`](https://ambientcg.com/a/Terrazzo005) | black-and-white terrazzo | square |
| | [`Tiles012`](https://ambientcg.com/a/Tiles012) | black-and-white marble chequer | square |
| Soft furnishings | [`Carpet016`](https://ambientcg.com/a/Carpet016) | beige wool carpet, scanned | 170 × 170 cm |
| | [`Fabric083`](https://ambientcg.com/a/Fabric083) | grey woven check | square |
| Paper | [`Paper001`](https://ambientcg.com/a/Paper001) | white cold-press grain | about 1.7:1 |
| | [`Paper003`](https://ambientcg.com/a/Paper003) | creased white paper | square |
| | [`Paper006`](https://ambientcg.com/a/Paper006) | brown kraft | square |

Swap any id into the search URL to see its maps, or open `https://ambientcg.com/a/<id>`.

## Use it in your brand

There are no brand colours to map: these are photographs and simulations of real surfaces, and they read best close to true. Bring them into a palette the way a photographer would:

- **In a render**, add a Hue/Saturation/Value node, or a Mix node set to *Multiply* with a tint colour, between the colour map and Base Color. Pull saturation down a little and warm or cool the tint towards your palette. Keep it gentle: a brick pushed to your brand colour stops reading as brick. Lighting and the world colour do more for a branded look than recolouring the surfaces.
- **Paper grain behind web graphics**: use the `_Color` map of `Paper001` as a texture under your brand surface, so the colour still comes from your CSS variables:

  ```css
  .paper { background: var(--background) url(/textures/Paper001_Color.jpg) center / 600px; background-blend-mode: multiply; }
  ```

- **Grain behind print or video artwork**: lay the same map over the artwork in *multiply* at 20–40% opacity.

## Notes

- CC0 means no notice is needed in shipped work. If you'd like to credit anyway, the site suggests "Created using `<asset name>` from ambientCG.com, licensed under CC0 1.0".
- **Non-square textures.** Many materials are 2:1 (for example `Bricks105` and `Tiles038`). Scale the mapping by the texture's real width and height separately, as the script does; one uniform scale stretches them to twice their height. With UV mapping instead of box projection, set the Mapping node's Scale to `(1 / width, 1 / height, 1)` with UVs laid out in metres.
- The site is run by one person and says the API "is potentially not as reliable or stable as needed for an 'enterprise-level' application". Download what a project needs and keep it locally; don't hot-link the files from a live site.
- Patreon supporters see some new assets early (marked NEW on the site). They go public, and CC0, on release.
- The preview above shows ambientCG's own CC0 preview images (`surface-preview/<id>/<id>_SQ_Color.jpg`), cropped into strips.
