# FLUX.2 [klein] 4B

An image model from Black Forest Labs, founded by researchers behind Stable Diffusion. It's small enough to run on your own computer, and its licence lets you use what it makes commercially, with no credit. The 4-billion-parameter "klein" version makes a photoreal image from a prompt in a few steps, and can also edit a real photo from instructions. On an Apple-silicon Mac, [mflux](https://github.com/filipstrand/mflux) runs a 4-bit version in about ten seconds and 5 GB of memory.

<img src="preview.png" width="600" alt="An AI-generated photograph, labelled as such: a white ceramic vase of dried grasses on an oak sideboard against a sage limewash wall, lit by low morning sun through a window, with long leaf shadows">

| | |
|---|---|
| **By** | Black Forest Labs (model); Filip Strand (mflux, the Mac runner) |
| **Model** | [black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) |
| **Licence** | Apache-2.0 for the 4B model, which covers commercial use with no credit. mflux is MIT. **Only the 4B is open:** FLUX.2 [klein] 9B, FLUX.2 [dev] and FLUX.1 [dev] are non-commercial. Read on 2026-10-28 |
| **Needs** | An Apple-silicon Mac with 16 GB or more for mflux, or an NVIDIA GPU through Hugging Face `diffusers` |

## Install

```bash
uv tool install mflux                 # Apple silicon; gives the mflux-generate-* commands
```

The model downloads on first use (the 4-bit build is a few GB).

## Use it as it comes

```bash
mflux-generate-flux2 --model mflux-community/flux2-klein-4b-mflux-q4 --base-model flux2-klein-4b \
  --steps 4 --seed 7 --width 1024 --height 512 --output vase.png \
  --prompt "Editorial photograph: a white ceramic vase with dried grasses on an oak sideboard against a limewash wall, soft morning window light from the left, long shadows, muted warm palette, shallow depth of field, 35mm film"
```

That's the preview, unedited apart from the label: 4 steps, 11 seconds on an M-series Mac. Describe light and lens the way a photographer would, and fix `--seed` to get the same image again. `mflux-generate-flux2-edit` takes `--image-paths` and changes a real photo from a prompt.

## Use it in your brand

There's nothing to map, but prompts take colours by name or hex ("a sage limewash wall", "accents in #2563eb"). Keep one prompt suffix for light, lens and palette, and reuse it so a set of images looks like a set.

## Notes

- **Label AI images.** Say on or beside the image that it's AI-generated, and never use one where a viewer would take it as a photograph of a real place, person or event. People trust a picture less once they suspect it's AI, so a real photograph is better wherever one exists.
- Check every image at full size for the usual tells before using it: garbled lettering, irregular window grids, impossible shadows, hands, merged people.
- [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) (Apache-2.0) is a strong photoreal alternative that mflux also runs.
