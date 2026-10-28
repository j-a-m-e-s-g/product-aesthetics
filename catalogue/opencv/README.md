# OpenCV

The library computer vision is built on, with 91,000 GitHub stars and twenty-five years of filters behind it. For design work it's the toolbox for treating images in code: edge-preserving smoothing, edge detection, blurs, thresholds, masks, colour-space changes and perspective warps. The preview is the classic stylisation: a photo turned into a pencil drawing with an XDoG filter (an edge detector with a soft threshold) and a colour-dodge for tone.

<img src="preview.png" width="600" alt="A rendered photo of a leather armchair and a potted plant, wiped two-thirds of the way across into the same scene as a graphite pencil drawing">

| | |
|---|---|
| **By** | The OpenCV team and contributors (OpenCV.org) |
| **Source** | [opencv/opencv](https://github.com/opencv/opencv) |
| **Licence** | Apache-2.0 for OpenCV; the `opencv-python` wheels are MIT. An app you run, so the images you make are yours. Read on 2026-10-16 at 5.0.0 |
| **Needs** | Python with NumPy (or C++). Use the `-headless` package on servers and in scripts |

## Install

```bash
pip install opencv-python-headless numpy      # or: uv add opencv-python-headless numpy
```

## Use it as it comes

The preview's pencil, in about fifteen lines:

```python
import cv2, numpy as np

bgr = cv2.imread("photo.png")
flat = cv2.edgePreservingFilter(bgr, flags=1, sigma_s=40, sigma_r=0.35)       # smooth flat areas, keep edges
gray = cv2.cvtColor(flat, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255

def xdog(g, sigma=1.3, k=1.6, p=20, eps=0.08, phi=70):                          # the pencil line
    u = (1 + p) * cv2.GaussianBlur(g, (0, 0), sigma) - p * cv2.GaussianBlur(g, (0, 0), sigma * k)
    return np.clip(np.where(u >= eps, 1.0, 1.0 + np.tanh(phi * (u - eps))), 0, 1)

dodge = np.clip(gray / np.maximum(cv2.GaussianBlur(gray, (0, 0), 8), 1e-3), 0, 1) # paper-like tone
shade = np.clip(1 - 0.55 * (1 - gray) ** 1.5, 0, 1)                               # keep weight in dark materials
ink = np.clip(xdog(gray) * (1 - 0.35 * (1 - dodge ** 1.6)) * shade, 0, 1)
paper, lead = np.array([236, 240, 244]), np.array([52, 50, 48])                   # BGR
cv2.imwrite("pencil.png", (lead + (paper - lead) * ink[..., None]).astype(np.uint8))
```

Raise `sigma` for bolder, simpler lines; lower `eps` and `phi` for more shading. Other jobs it does well: `cv2.inpaint` to remove a small object, `cv2.getPerspectiveTransform` with `cv2.warpPerspective` to straighten a photo of a building or a page, and `cv2.grabCut` to cut out a subject.

## Use it in your brand

There's nothing to map, but the pencil's two colours are yours: set `paper` to your background and `lead` to your text colour (both in BGR order), and a set of photos becomes a set of drawings in your palette.

## Notes

- OpenCV loads and saves colours as **BGR**, not RGB. Convert with `cv2.cvtColor` before handing images to Pillow or matplotlib.
- The preview's photo is a [Blender](../blender) render of [Poly Haven](../poly-haven) models, so the drawing is CC0 from end to end. Running the filter over someone else's photo doesn't clear that photo's licence.
- [Pillow](../pillow) is the simpler tool for cropping, resizing, colour and type; reach for OpenCV when the job is about edges, shapes or geometry.
