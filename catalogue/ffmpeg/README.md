# FFmpeg

The video and audio engine nearly everything else uses, VLC, OBS and HandBrake among them. From one command line it encodes to any format, cuts and joins clips, crossfades, pans and zooms across stills, mixes a voiceover with music that ducks under the speech, measures loudness, burns in text, and turns frames into MP4s or GIFs. For code-driven video it's the last step of every pipeline: something draws the frames, and FFmpeg makes them a film.

<img src="preview.png" width="600" alt="Four frames from one FFmpeg command: a slow push-in on Hokusai's Great Wave, then a crossfade into Van Gogh's Wheat Field with Cypresses">

| | |
|---|---|
| **By** | The FFmpeg developers |
| **Site** | [ffmpeg.org](https://ffmpeg.org) |
| **Licence** | LGPL 2.1 or later, or GPL when built with GPL parts such as the x264 encoder, which most builds include. It's an app you run, so the videos you make are yours. Read on 2026-10-28 at 8.1.3 |
| **Needs** | Nothing beyond the binary |

## Install

```bash
brew install ffmpeg
```

Or download a static build from [ffmpeg.org/download.html](https://ffmpeg.org/download.html). Check that it has `libx264` (H.264 for social video) and `libfreetype` (for `drawtext`) with `ffmpeg -buildconf`.

## Use it as it comes

The preview, as one command: a slow push-in on one public-domain painting, then a crossfade to another.

```bash
ffmpeg -loop 1 -t 3.2 -i wave.jpg -loop 1 -t 3.2 -i cypresses.jpg -filter_complex "
  [0]scale=2400:-2,zoompan=z='1+0.0035*on':x='iw*0.18+on*1.2':y='ih*0.16':d=48:s=1080x540:fps=15[a];
  [1]scale=2400:-2,zoompan=z='1.25-0.003*on':x='iw/2-(iw/zoom/2)':y='ih*0.22':d=48:s=1080x540:fps=15[b];
  [a][b]xfade=transition=fade:duration=0.8:offset=2.4" -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4
```

The commands worth knowing:

| Job | Command or filter |
|---|---|
| Frames to an MP4 that plays everywhere | `ffmpeg -framerate 30 -i f%05d.png -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4` |
| A good GIF | `-vf "split[a][b];[a]palettegen[p];[b][p]paletteuse"` |
| Pan and zoom on a still | `zoompan` (scale the image up first, or the motion judders) |
| Transitions | `xfade` (fade, wipes, slides, circles, dissolve and dozens more) |
| Music that ducks under a voice | `sidechaincompress` |
| Loudness for social video | `loudnorm=I=-14:TP=-1` (two passes for accuracy) |
| Find the pauses in speech | `silencedetect=noise=-40dB:d=0.12` |
| Text on video | `drawtext` (needs a font file) |

## Use it in your brand

There's nothing to map, but `drawtext` takes your own font file (`fontfile=…`) and colours (`fontcolor=#2563eb`), and a brand's end card or watermark can be overlaid on every video with `overlay`.

## Notes

- **zsh catches people out.** In zsh, a variable followed by a colon (`$font:text…`) is read as a modifier and silently mangles the filter. Write `${font}` with braces in filter strings.
- `-pix_fmt yuv420p` matters: without it, H.264 from PNG frames often won't play on phones or in browsers.
- `zoompan` rounds to whole pixels, so slow moves judder on small images. Scaling the image to two or three times the output size first smooths it.
