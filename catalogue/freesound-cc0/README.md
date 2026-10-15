# Freesound CC0 sound kit

Twenty-one sound effects for video and motion, one for each job a cut usually needs: a whoosh for a transition, a pop when something appears, a tick for a counter, an impact under the big number, a riser before a reveal, typing, a page turn, a pen scribble, a stamp. Each is the most-downloaded public-domain sound on [Freesound](https://freesound.org) for its job, so the picks are the ones thousands of editors have already chosen. Between them they have about 820,000 downloads. Freesound is the open sound library run by the Music Technology Group at Universitat Pompeu Fabra in Barcelona, and everything here is CC0.

<img src="preview.png" width="600" alt="Waveforms of eight of the sounds, each labelled with its job and download count: Whoosh 209,307, Typing 83,267, Pop 62,230, Cash register 51,161, Impact 40,672, Clock tick 38,488, Correct 34,020, Camera 19,469">

| | |
|---|---|
| **By** | Freesound contributors, named per sound below |
| **Source** | [freesound.org](https://freesound.org), searched with the licence filter set to Creative Commons 0 and sorted by downloads, on 2026-10-15 |
| **Licence** | CC0 1.0 (no strings): use, change and sell anything you make with them, with no credit. Each sound's own Freesound page was checked and shows CC0. Freesound licenses sound by sound, so anything you add from outside this list needs its own check |
| **Needs** | Anything that plays WAV, MP3 or OGG |

## Install

Each name in the table links to the sound's Freesound page. The **Download** button there gives the original file, often a WAV, and needs a free Freesound account.

Every sound also has a public preview that needs no account: a 192 kbps OGG, listed as `preview` for each sound in [`kit.json`](kit.json). That's plenty for social video, and it's what was measured below.

```bash
# every preview in the kit, named by job (needs jq)
jq -r '.sounds[] | "\(.job) \(.preview)"' kit.json | while read job url; do curl -sL -o "$job.ogg" "$url"; done
```

## The kit

Ranked within each job by Freesound downloads; the rating is Freesound's five-star average. **Starts at** is when the sound actually begins, measured from the file (the first moment it passes −30 dBFS), so you can line it up with a cut: place the file that much before the frame it belongs to.

| Job | Use it for | Sound | Downloads | Rating | Length | Starts at | Notes |
|---|---|---|---|---|---|---|---|
| whoosh | Transitions and cuts | [Whoosh](https://freesound.org/people/qubodup/sounds/60013/) by qubodup | 209,307 | 4.4 | 0.4 s | 0.02 s | The most downloaded CC0 sound effect we found |
| swipe | A card or word sliding in | [Swipe Whoosh](https://freesound.org/people/qubodup/sounds/60007/) by qubodup | 25,166 | 4.6 | 0.5 s | 0.02 s | |
| swoosh | A longer move across the frame | [swoosh](https://freesound.org/people/Halgrimm/sounds/169867/) by Halgrimm | 26,709 | 4.4 | 2.3 s | 0.29 s | See Notes on the more popular "Swoosh" |
| pop | Something appears | [Pop sound](https://freesound.org/people/deraj/sounds/202230/) by deraj | 62,230 | 4.4 | 0.7 s | 0.20 s | |
| ui-tick | A tap, a toggle, a counter step | [Menu Selection Click](https://freesound.org/people/NenadSimic/sounds/171697/) by NenadSimic | 22,025 | 4.8 | 0.2 s | 0.00 s | |
| mouse-click | A real mouse click, for screen recordings | [Mouse Click Sound.mp3](https://freesound.org/people/Pixeliota/sounds/678248/) by Pixeliota | 27,256 | 4.7 | 1.2 s | 0.39 s | Mostly silence: trim before the click |
| notification | A message or alert arrives | [Notification Sound](https://freesound.org/people/yfjesse/sounds/235911/) by yfjesse | 21,461 | 4.7 | 0.7 s | 0.00 s | |
| correct | A figure lands, a box gets ticked | [Correct.mp3](https://freesound.org/people/LittleRainySeasons/sounds/335908/) by LittleRainySeasons | 34,020 | 4.6 | 1.0 s | 0.08 s | A bright chime |
| impact | The big number, the statement | [Cinematic Impact](https://freesound.org/people/deleted_user_3277771/sounds/177242/) (uploader's account since deleted) | 40,672 | 4.7 | 7.9 s | 0.56 s | Long tail: fade it out |
| riser | Build-up before a reveal | [Riser sound effect short.wav](https://freesound.org/people/syntheffects/sounds/685256/) by syntheffects | 7,646 | 4.7 | 3.0 s | 0.78 s | Peaks at the end, so line its end up with the reveal |
| typing | Text typing on, a search box | [Keyboard Typing](https://freesound.org/people/Trollarch2/sounds/331656/) by Trollarch2 | 83,267 | 4.5 | 15.5 s | 0.07 s | Steady typing: cut a stretch to fit |
| page-turn | A page or card turns | [Page Turn](https://freesound.org/people/davidbain/sounds/136778/) by davidbain | 5,555 | 4.7 | 2.0 s | 0.10 s | The more downloaded page sounds are long recordings |
| scribble | A pen draws, a line appears | [scribble.mp3](https://freesound.org/people/indigosierra/sounds/82610/) by indigosierra | 12,013 | 4.3 | 4.1 s | 0.07 s | |
| camera | A photo appears | [Camera shutter and flash combined](https://freesound.org/people/montclairguy/sounds/353044/) by montclairguy | 19,469 | 4.7 | 3.0 s | 0.87 s | The most downloaded, [232130](https://freesound.org/people/Werra/sounds/232130/) (29,993), is an old flash-powder pop |
| stamp | Approved, rejected, signed off | [traditional stamp.wav](https://freesound.org/people/I.fekry/sounds/470710/) by I.fekry | 9,932 | 4.8 | 1.6 s | 0.50 s | |
| clock-tick | A countdown, a deadline | [ClockTickSound_01.wav](https://freesound.org/people/abyeditsound/sounds/450509/) by abyeditsound | 38,488 | 4.5 | 8.0 s | 0.10 s | Eight ticks, a second apart |
| cash-register | Money, costs, prices | [Cash Register Purchase](https://freesound.org/people/Zott820/sounds/209578/) by Zott820 | 51,161 | 4.7 | 2.8 s | 0.09 s | Mastered hot: turn it down |
| record-scratch | "Wait, what?" | [record_scratch.wav](https://freesound.org/people/simkiott/sounds/43404/) by simkiott | 42,017 | 4.4 | 1.6 s | 0.14 s | Distorted on purpose, and loud |
| buzzer | Wrong answer | [buzzer.wav](https://freesound.org/people/guitarguy1985/sounds/54047/) by guitarguy1985 | 31,464 | 4.2 | 1.9 s | 0.00 s | A raw full-scale square wave: use it quietly |
| fanfare | Success, a win | [Success Fanfare Trumpets.mp3](https://freesound.org/people/FunWithSound/sounds/456966/) by FunWithSound | 22,315 | 4.8 | 4.4 s | 0.01 s | |
| cheer | A crowd celebrates | [Cheer 2.wav](https://freesound.org/people/jayfrosting/sounds/333404/) by jayfrosting | 27,848 | 4.5 | 4.1 s | 0.11 s | |

The last five are the loud, meme-flavoured end of the kit. They work in fast social edits and jar anywhere calmer.

## Use it in your brand

There's nothing to map: a sound has no colour or font. What keeps a brand's videos consistent is using the same few sounds every time, at the same level. Pick one whoosh, one pop and one impact and stick to them, and set effects well under the voice: about 12 dB below it is a common starting point.

## Notes

- **How the picks were checked.** Popularity stood in for listening. Each pick was then measured from its preview: when it starts, its peak, whether it clips, how much of it is sound, and a spectrogram for hiss, hum or a muffled recording. Three popular sounds were passed over on that evidence:
  - Shinplaster's [Swoosh](https://freesound.org/people/Shinplaster/sounds/264777/) (38,775 downloads) clips on thousands of samples and stops dead.
  - Tomoyo Ichijou's [Scribble](https://freesound.org/people/Tomoyo%20Ichijou/sounds/211247/) peaks at −25 dB, so bringing it up to level raises the hiss with it.
  - The 10,441-download "Bass Drop Huge" clips, with 1,730 samples over full scale.
- The previews are lossy, and the hottest picks (cash register, record scratch, swipe, stamp) go a little over full scale once decoded. Normalise every sound to a true peak of −1 dB before mixing, or download the original.
- Download counts are skewed toward sounds that have been up longest: qubodup's whoosh dates from 2008. A newer sound can be better and less downloaded, which is why the riser and the page turn have fewer downloads than the rest.
- Freesound uploaders choose their own licence and the site moderates uploads, but provenance isn't guaranteed. For anything high-stakes, such as an ad buy or broadcast, download the original and keep a note of its page.
- CC0 means no credit is owed, on screen or in a description.
