# Pillow

The image library almost every Python script that touches a picture uses. It opens and saves every common format, and crops, resizes, rotates, blurs, recolours and composites, and it sets type from any TrueType, OpenType or WOFF font. That makes it the quickest way to build a social card, a thumbnail or a batch of resized images, or to draw a text layer for every frame of a video, without opening an editor.

<img src="preview.png" width="600" alt="A card built entirely in Pillow: Hokusai's Great Wave duotoned in navy and pale blue, darkened on the left behind a serif headline 'The wave' and the line 'that broke a thousand posters', with a source line at the bottom">

| | |
|---|---|
| **By** | Jeffrey A. Clark (Alex) and contributors; the fork of PIL |
| **Site** | [python-pillow.github.io](https://python-pillow.github.io) · [source](https://github.com/python-pillow/Pillow) |
| **Licence** | MIT-CMU, a permissive licence that asks only that its notice is kept. An app you run, so the images you make are yours. Read on 2026-10-28 at 13.0.0 |
| **Needs** | Python 3.11+ |

## Install

```bash
pip install pillow      # or: uv add pillow
```

## Use it as it comes

The preview card, start to finish:

```python
from PIL import Image, ImageOps, ImageDraw, ImageFont

W, H = 1200, 600
im = ImageOps.fit(Image.open("wave.jpg").convert("L"), (W, H), centering=(0.62, 0.45))
card = ImageOps.colorize(ImageOps.autocontrast(im, cutoff=1),
                         black="#0b1f4d", mid="#5b7bbf", white="#e9eef7")          # duotone
scrim = Image.linear_gradient("L").rotate(90).resize((W, H))
card = Image.composite(Image.new("RGB", (W, H), "#0b1f4d"), card,
                       scrim.point(lambda v: int((255 - v) ** 1.6 / 255 ** 0.6 * 0.92)))   # darken the left
d = ImageDraw.Draw(card)
d.text((64, 150), "The wave", font=ImageFont.truetype("instrument-serif.woff2", 120), fill="#ffffff")
card.save("card.png")
```

`ImageFont.truetype` reads `.woff2` files as well as `.ttf` and `.otf`, so the Fontsource packages in the [open fonts kit](../open-fonts) work directly. `ImageOps.fit` crops to an exact size around a focal point, and `ImageOps.colorize` maps greys onto two or three colours of your choice.

## Use it in your brand

There's nothing to map, but every colour above is a parameter. A duotone in your darkest and lightest brand colours, with type in your own font files, makes any archive image look like it belongs to the brand.

## Notes

- Pillow doesn't wrap text. Measure with `d.textbbox` and break lines yourself, or set long text in a browser and capture it (see [Playwright](../playwright)).
- For emoji in text, the `pilmoji` add-on fetches Twemoji images by default, and Twemoji's licence (CC BY 4.0) requires credit. Use a CC0 or OFL emoji set instead, or leave emoji out.
- [OpenCV](../opencv) is the stronger tool for edges, shapes and geometry.
