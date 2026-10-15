# Poly Haven

The most-used free 3D library there is: about 1,000 HDRIs, 870 textures and 520 models, all made by Poly Haven's own staff or donated directly to it, and all public domain. HDRIs are what make a render look real: a single 360° photograph of a sky or a studio that lights the whole scene and puts true reflections on every surface. The textures are full PBR sets (colour, roughness, normal, displacement) and the models are photoscanned plants, furniture and props. Between them they've been downloaded 124 million times. Every asset is free to download with no login and no watermark; the only thing Poly Haven sells is a convenience add-on for Blender (below).

<img src="preview.png" width="600" alt="Poly Haven's own previews of eight of its most-downloaded assets: three HDRIs (a cloudy sky, a night golf course, a photo studio), three textures on spheres (plywood, sandy rocks, mud and leaves), a grass clump and a small tree, each with its download count">

| | |
|---|---|
| **By** | Poly Haven (founded by Greg Zaal; funded by Patreon supporters and sponsors) |
| **Site** | [polyhaven.com](https://polyhaven.com) |
| **Licence** | CC0 1.0 (no strings) for every asset: use, change, redistribute and sell, with no credit. Read on 2026-10-15 at [polyhaven.com/license](https://polyhaven.com/license). **The live API has one extra rule** (see Notes) |
| **Needs** | Something that renders 3D: Blender, three.js, Unreal, Unity… HDRIs come as `.hdr` or `.exr`; textures as JPG/PNG/EXR maps; models as glTF, FBX or `.blend` |

## Install

Three ways in, from easiest:

- **The site.** Every asset page has a download button with a resolution picker (1k to 16k+) and a format picker.
- **Blender.** Download the files and load them yourself (below). The [Poly Haven Asset Browser](https://polyhaven.com/plugins/blender) add-on puts the whole library in Blender's asset browser for drag and drop, but it's a paid product; the assets it loads are the same free ones.
- **The API**, for scripts and Claude: no key, no account.

```bash
# the 10 most-downloaded HDRIs
curl -s -A "your-app-name" "https://api.polyhaven.com/assets?t=hdris" \
  | jq -r 'to_entries | sort_by(-.value.download_count) | .[:10][] | "\(.value.download_count)\t\(.key)"'

# every file for one asset, at every resolution: pick the URL you want
curl -s -A "your-app-name" "https://api.polyhaven.com/files/kloofendal_48d_partly_cloudy_puresky" \
  | jq -r '.hdri."2k".hdr.url'
```

## Use it as it comes

**In Blender.** World → Color → Environment Texture, then open the `.hdr`. That alone gives realistic light and reflections. Turn the HDRI with a Mapping node's Z rotation to move the sun.

**In three.js.** Load the HDRI as the scene's environment, so every physical material reflects it:

```js
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';   // was RGBELoader before r180

const hdr = await new HDRLoader().loadAsync('/kloofendal_48d_partly_cloudy_puresky_2k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr;           // lighting and reflections
scene.background = hdr;            // optional: show the sky too
```

**Which to start with.** By downloads: the HDRIs *Kloofendal 48d Partly Cloudy (Pure Sky)*, *Moonless Golf* and *Brown Photostudio 02*; the textures *Plywood*, *Coast Sand Rocks 02* and *Laminate Floor 02*. Pure-sky HDRIs have the ground removed, so they light an outdoor scene without a stray horizon. The studio HDRIs give clean product-shot light.

## Use it in your brand

There's nothing to map. A render takes your brand from the materials and colours you set on your own objects. Poly Haven supplies the light and the surfaces around them. For a scene that feels on-brand, pick an HDRI whose light matches your palette: warm studios for warm brands, overcast skies for cool ones.

## Notes

- **The API's credit rule.** Downloaded files never need credit. But if your own app or website shows Poly Haven content *live through the API*, its [terms](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md) ask for a small visible credit ("Powered by Poly Haven", or Poly Haven named in the interface), and every API call must send a User-Agent or Referer naming your app. Fetching files by script to use in your own renders and videos doesn't count as surfacing content.
- **Sizes.** A 4k HDRI is about 20 MB (1k is 1.4 MB). A texture set comes in several formats; take the 1k or 2k JPGs, which are plenty for screens and social video. Keep the downloads out of git.
- [ambientCG](../ambientcg) in this catalogue is the other big CC0 materials library; between the two, almost any surface is covered.
