# Playwright

Remote control for a real browser. Built for testing websites, it's also the simplest way to make video and images from web code: lay a scene out in HTML, CSS and SVG with any library in this catalogue, then have Playwright set each moment and screenshot it, frame by frame, or save the page as a vector PDF. Everything a browser can draw becomes a still, a figure or a film. It works from Python and Node, and runs several pages in parallel to capture faster.

<img src="preview.gif" width="600" alt="A blue ring fills from 0% to 100% beside a counter, captured frame by frame, with the time and frame number of each frame in the corner">

| | |
|---|---|
| **By** | Microsoft |
| **Source** | [microsoft/playwright](https://github.com/microsoft/playwright) (98,000 GitHub stars) |
| **Licence** | Apache-2.0. An app you run, so what you capture is yours. Read on 2026-10-16 at 1.63.0 |
| **Needs** | Python 3.9+ or Node 18+. It downloads its own Chromium, or uses an installed Chrome |

## Install

```bash
pip install playwright && playwright install chromium     # Python
npm i -D playwright && npx playwright install chromium     # Node
```

## Use it as it comes

**Make the picture a function of time.** The page exposes `seek(t)`, which draws the exact state at time `t`, and nothing on the page reads the clock. Then capture is a loop: seek, screenshot. Because each frame stands alone, four pages can capture different frames at once. This is how the preview was made:

```python
import asyncio
from playwright.async_api import async_playwright

async def main(url, frames, fps=25, workers=4):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        pages = [await browser.new_page(viewport={"width": 1080, "height": 1920}) for _ in range(workers)]
        for pg in pages: await pg.goto(url)
        async def work(i, pg):
            for f in range(i, frames, workers):
                await pg.evaluate("([t, f]) => seek(t, f)", [f / fps, f])
                await pg.screenshot(path=f"frames/f{f:05d}.png")
        await asyncio.gather(*(work(i, pg) for i, pg in enumerate(pages)))

asyncio.run(main("file:///…/scene.html", 300))
```

Then `ffmpeg -framerate 25 -i frames/f%05d.png -c:v libx264 -pix_fmt yuv420p out.mp4` (see [FFmpeg](../ffmpeg)).

**For pages you didn't write**, which animate on their own clock, stop the clock instead. Playwright's `page.clock.install()` and `page.clock.run_for(ms)` control timers, `Date` and `requestAnimationFrame`. CSS and Web Animations run on the browser's own timeline, which the clock doesn't control: pause them and set each one's `currentTime` yourself (`document.getAnimations()`). Libraries such as Motion start their animations with `play()` or by setting `startTime`, so catch those too, or headlines finish in real time before your first frame.

**Stills and PDFs.** `page.screenshot(clip=…)` for an exact crop, `device_scale_factor=2` in `new_page` for retina output, and `page.pdf()` for a vector PDF of a figure.

## Use it in your brand

There's nothing to map: it captures whatever the page draws, in your fonts and colours.

## Notes

- Wait for web fonts before the first frame (`await page.evaluate("document.fonts.ready")`), or it draws in the fallback.
- Screenshots in JPEG at quality 90 or so are much faster to write than PNG, and FFmpeg compresses them again anyway.
- Puppeteer (Apache-2.0, 96,000 stars) does the same job from Node. Playwright adds Python, the `clock` API and Firefox and WebKit.
