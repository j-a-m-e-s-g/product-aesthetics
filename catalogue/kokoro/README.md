# Kokoro

A voiceover from a script, made on your own machine for free. Kokoro is a text-to-speech model with only 82 million parameters, small enough to run on an ordinary laptop's CPU, and it sounds far more human than its size suggests. Its 54 voices cover American and British English, Spanish, French, Italian, Brazilian Portuguese, Hindi, Japanese and Mandarin. The model card counts over 10 million downloads. Nothing is sent anywhere, there's no account, and the audio is yours.

<img src="preview.png" width="600" alt="The waveform of one Kokoro take in the British voice bm_george, reading 'Every word lands on the beat, because the timing comes from the voice itself', with the eight British voices listed below">

| | |
|---|---|
| **By** | hexgrad (model); thewh1teagle (the `kokoro-onnx` runtime) |
| **Model** | [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) v1.0 on Hugging Face |
| **Licence** | Apache-2.0 for the model weights. The lighter runtime, [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), is MIT. It's an app you run, so the speech you make is yours, with no credit. Read on 2026-10-16 |
| **Needs** | Python 3.10+. About 350 MB of model files. No GPU |

## Install

The lightest route is `kokoro-onnx`, which runs the model through ONNX Runtime:

```bash
pip install kokoro-onnx soundfile        # or: uv add kokoro-onnx soundfile
# then download kokoro-v1.0.onnx and voices-v1.0.bin from
# https://github.com/thewh1teagle/kokoro-onnx/releases (tag model-files-v1.0)
```

The original PyTorch package is `pip install kokoro`; it also needs `espeak-ng` installed for pronunciation.

## Use it as it comes

```python
import soundfile as sf
from kokoro_onnx import Kokoro

kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
samples, sample_rate = kokoro.create(
    "Every word lands on the beat, because the timing comes from the voice itself.",
    voice="bm_george", speed=1.0, lang="en-gb")
sf.write("take.wav", samples, sample_rate)
```

That's the preview's take: 4.8 seconds of audio. Voice names start with a language and sex: `b` is British English, `a` American, then `f` or `m`. The British ones are `bf_alice`, `bf_emma`, `bf_isabella`, `bf_lily`, `bm_daniel`, `bm_fable`, `bm_george` and `bm_lewis`. `speed` slows or quickens delivery without changing pitch.

For a video, follow it with [faster-whisper](../faster-whisper) to get the time of every word, so cuts and captions land on the speech.

## Use it in your brand

There's nothing visual to map. A brand's voice is a choice of one voice and one speed, used every time. Try a script in all eight British voices before settling on one.

## Notes

- Kokoro reads what it's given, so write numbers and abbreviations the way they should be said ("twenty twenty-six", "per cent"), or check how it says them.
- The pronunciation step uses `phonemizer` and `espeak-ng`, which are GPL. They run on your machine and don't affect the licence of the audio you make.
- A take is generated from scratch each time and comes out slightly different. Save the take you like rather than regenerating it.
