# Blender

The free 3D studio the whole industry knows: modelling, sculpting, physically accurate rendering with Cycles, fast previews with EEVEE, 2D animation with Grease Pencil, a node compositor and a video editor, in one app. It's also fully scriptable in Python and runs without a window, so a script can build a scene, light it, render it and save the frames, which is how Claude can use it. Pair it with [Poly Haven](../poly-haven) for lighting, surfaces and props, and a product shot or an architectural scene looks photographed.

<img src="preview.png" width="600" alt="A photoreal render: a wooden armchair with black leather cushions and a terracotta pot plant on a pale floor, lit by low afternoon sun from a clear sky, casting long soft shadows">

<sub>Rendered by script with Cycles in 14 seconds on an Apple-silicon Mac: Poly Haven's *Modern Arm Chair 01* and *Potted Plant 02*, lit by its *Kloofendal 43d Clear (Pure Sky)* HDRI, on a plain floor.</sub>

| | |
|---|---|
| **By** | Blender Foundation and its community |
| **Site** | [blender.org](https://www.blender.org) |
| **Licence** | GNU GPL (an app you run, so any open-source licence is fine here). Blender's [licence page](https://www.blender.org/about/license/) says: "What you create with Blender is your sole property", including the images, films and `.blend` files. Read on 2026-10-28 at 5.2.3 LTS |
| **Needs** | macOS, Windows or Linux. A recent GPU makes Cycles much faster (Metal on Apple silicon) |

## Install

Download it from [blender.org](https://www.blender.org/download/), or:

```bash
brew install --cask blender
```

Pick the LTS release for anything that has to keep working: it gets fixes for two years.

## Use it as it comes

**By hand,** Blender is a desktop app with a steep start; the official [Blender Studio](https://studio.blender.org) tutorials and the community's "donut" course are the usual way in.

**By script,** it needs no window. This is the shape of the preview's script: load a sky, import two models, aim a camera, render:

```python
# blender -b -P render.py -- out.png
import bpy, math, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.samples = 128; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1200, 600

world = bpy.data.worlds.new('sky'); sc.world = world; world.use_nodes = True
env = world.node_tree.nodes.new('ShaderNodeTexEnvironment')
env.image = bpy.data.images.load('kloofendal_43d_clear_puresky_4k.hdr')      # Poly Haven
world.node_tree.links.new(env.outputs['Color'], world.node_tree.nodes['Background'].inputs['Color'])

bpy.ops.import_scene.gltf(filepath='modern_arm_chair_01/modern_arm_chair_01.gltf')   # Poly Haven
# … a floor plane, a camera with a Track To constraint …
sc.render.filepath = sys.argv[-1]
bpy.ops.render.render(write_still=True)
```

Render an animation the same way with `bpy.ops.render.render(animation=True)` and an image-sequence output; ffmpeg turns the frames into a video.

## Use it in your brand

There's nothing to map. Brand colours go into materials (a Principled BSDF's Base Color), and type comes in as text objects in your own font file (Add → Text, then point it at your `.ttf`). As with any render, the light sets the mood: [Poly Haven](../poly-haven)'s HDRIs give you a warm studio, an overcast day or golden hour in one line.

## Notes

- **Colour management.** Blender's default view transform since 4.0 is AgX, which handles bright light far better than the old "Standard". Leave it on, or images look flat and clipped. The preview uses AgX with the "Medium High Contrast" look.
- `bpy.ops.wm.read_factory_settings(use_empty=True)` starts from an empty scene, so a script never inherits someone's startup file.
- Free add-ons are at [extensions.blender.org](https://extensions.blender.org). Check each one's licence: add-ons are code that runs in Blender, so they're GPL-compatible by rule, and assets bundled with them can carry their own terms.
- Blender also renders 2D: Grease Pencil draws and animates strokes in 3D space, which is a quick way to get hand-drawn motion.
