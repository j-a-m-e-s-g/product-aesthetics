# faster-whisper

Speech to text with a timestamp on every word. faster-whisper runs OpenAI's Whisper models on CTranslate2, which makes them several times faster than the original and light enough for a laptop CPU. For video that matters because of the word timings: feed it a voiceover, whether one [Kokoro](../kokoro) made or a person recorded, and you get each word's start and end, so captions appear as the word is said and cuts land on the beat.

<img src="preview.png" width="600" alt="A voiceover waveform with a blue box over each word as faster-whisper timed it, the words labelled underneath, and every start time listed: Every 0.00, word 0.20, lands 0.48 … because 2.16 … itself 3.90">

| | |
|---|---|
| **By** | SYSTRAN, on OpenAI's Whisper models |
| **Source** | [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) (26,000 GitHub stars) |
| **Licence** | MIT for the code and for the Whisper weights. Read on 2026-10-16 at 1.2.1 |
| **Needs** | Python 3.9+. A model: `base.en` is 145 MB and plenty for clean English voiceover; `large-v3` for hard audio |

## Install

```bash
pip install faster-whisper          # or: uv add faster-whisper
```

The first call downloads the model from Hugging Face; pass a local folder instead to work offline.

## Use it as it comes

```python
from faster_whisper import WhisperModel

model = WhisperModel("base.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe("take.wav", language="en", word_timestamps=True)
words = [(w.word.strip(), w.start, w.end) for s in segments for w in s.words]
```

**Transcribe phrase by phrase for accurate timings.** On the preview's take, one pass over the whole file put "because" at 1.64 s, but the word really starts after a pause, at 2.19 s. Splitting the audio at its pauses first (ffmpeg's `silencedetect` finds them) and transcribing each phrase from where its silence ends put it at 2.16 s, within 30 ms. The `vad_filter` option didn't help here, because the pause was too short for it. The preview shows the phrase-by-phrase result.

**Word ends come early before a pause.** Even phrase by phrase, the last word of a phrase ended 0.2 to 0.4 s before the sound did ("beat." at 1.58 s against silence at 1.82 s; "itself." at 4.32 s against 4.74 s). Hold each caption until the next phrase starts, rather than until the word's `end`.

## Use it in your brand

There's nothing visual to map. The timings drive whatever captions you design: word-by-word pops, a highlighted current word, or whole phrases.

## Notes

- For tighter word boundaries than this, [WhisperX](https://github.com/m-bain/whisperX) (BSD-2-Clause) adds forced alignment with a second model.
- Whisper is trained on real speech and handles accents and room noise well, but clean audio still times best. For recordings, run [DeepFilterNet](../deepfilternet) first.
- `compute_type="int8"` keeps CPU use low with no visible loss in timing.
