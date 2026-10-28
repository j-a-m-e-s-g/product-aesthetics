# DeepFilterNet

Noise removal for voice, done by a small neural network on your own machine. Give it a recording made in a kitchen, an office or a car, and it takes out the hiss, the hum and the room while keeping the voice sounding like a person rather than a robot. It runs as a single command-line program, faster than real time on a laptop CPU, which makes it the step to run on any recorded voiceover before it goes into a video.

<img src="preview.png" width="600" alt="Two spectrograms of the same voice take: before, the whole frequency range is filled with noise and a hum; after, the noise floor is gone and only the voice's harmonics remain">

| | |
|---|---|
| **By** | Hendrik Schröter |
| **Source** | [Rikorose/DeepFilterNet](https://github.com/Rikorose/DeepFilterNet) |
| **Licence** | MIT or Apache-2.0, your choice. It's an app you run, so the cleaned audio is yours. Read on 2026-10-16 at 0.5.6 |
| **Needs** | Nothing, for the prebuilt binary (macOS, Linux, Windows). Audio at 48 kHz |

## Install

Download `deep-filter` for your platform from the [releases page](https://github.com/Rikorose/DeepFilterNet/releases), or `pip install deepfilternet` for the Python version.

## Use it as it comes

```bash
ffmpeg -i recording.m4a -ar 48000 -ac 1 voice48.wav          # it works at 48 kHz
deep-filter -D -o clean/ voice48.wav                           # -D keeps the timing exact
deep-filter -D -a 15 -o clean/ voice48.wav                     # gentler: take off at most 15 dB
```

The preview is a [Kokoro](../kokoro) take buried in pink noise and a 50 Hz hum, then run through `deep-filter -D`. `-D` compensates for the model's delay, so the cleaned file lines up with the original. `-a` limits how much noise it removes. On a voice that's only a little noisy, a limit of 10 to 15 dB sounds more natural than full removal.

## Use it in your brand

There's nothing to map.

## Notes

- The project has been quiet since October 2024. Version 0.5.6 works, and its binary has no dependencies to break.
- It's tuned for speech. It will treat music under a voice as noise, so clean the voice before adding music, never after.
- ffmpeg's `afftdn` filter is the fallback when the binary isn't available, but it's noticeably weaker on hum and room noise.
