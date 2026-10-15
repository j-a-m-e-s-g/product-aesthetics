# Public-domain image archives

Real pictures, free: Hokusai's *Great Wave*, Van Gogh's cypresses, Monet's water lilies, the Earth at night from the space station. Four archives release high-resolution images with no rights reserved and a free API that needs no key, so a script (or Claude) can search them and pull the image straight into a design, a slide or a video. Between them they hold over 100,000 public-domain artworks, plus NASA's photo library. Use them for backgrounds, editorial art, textures, title cards and anything that would otherwise reach for stock.

<img src="preview.png" width="600" alt="Four public-domain images fetched through the archives' APIs: Hokusai's Great Wave (Art Institute of Chicago), Van Gogh's Wheat Field with Cypresses (The Met), Monet's Water Lilies (Cleveland Museum of Art) and Italy at night photographed from the International Space Station (NASA)">

| | |
|---|---|
| **By** | The Art Institute of Chicago, The Metropolitan Museum of Art, the Cleveland Museum of Art, NASA |
| **Licence** | CC0 for the museums' public-domain images: use, change and sell, with no credit. NASA's are US-government works, not CC0, with their own small print (see Notes). Read on 2026-10-15 |
| **Needs** | Nothing. The APIs return JSON and image URLs |

| Archive | Public-domain images | Best for |
|---|---|---|
| [Art Institute of Chicago](https://www.artic.edu/open-access/open-access-images) | 62,119 public-domain works in its API | Impressionism, Japanese prints, posters, design objects. The easiest API, with IIIF images at any size |
| [The Met](https://www.metmuseum.org/about-the-met/policies-and-documents/image-resources) | 502,915 objects in its API; the public-domain ones are flagged | The widest range: 5,000 years of art, arms and armour, photographs, prints |
| [Cleveland Museum of Art](https://www.clevelandart.org/open-access) | 41,848 CC0 works with images | A clean API with a CC0 filter built in; strong on Asian art and ceramics |
| [NASA Image and Video Library](https://images.nasa.gov) | the agency's photo, video and audio library | Earth from orbit, cities at night, launches, deep space |

## Install

There's nothing to install. Search, read the image URL, download.

**Art Institute of Chicago.** Filter to public domain, then build the image URL from `image_id` with IIIF, at any width. Its docs ask you to send an `AIC-User-Agent` header naming your project and a contact; anonymous use is limited to 60 requests a minute.

```bash
curl -s -H "AIC-User-Agent: my-project (me@example.com)" \
  "https://api.artic.edu/api/v1/artworks/search?q=great%20wave&query[term][is_public_domain]=true&fields=id,title,artist_title,image_id&limit=5"
# then: https://www.artic.edu/iiif/2/{image_id}/full/1686,/0/default.jpg
```

**The Met.** Search returns object IDs; each object returns its image URLs and an `isPublicDomain` flag. Use only objects where that's `true`.

```bash
curl -s "https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=cypresses&hasImages=true&limit=20"
curl -s "https://collectionapi.metmuseum.org/public/collection/v1/objects/436535"    # → primaryImage, isPublicDomain
```

**Cleveland Museum of Art.** `cc0=1` filters to free images; each result carries `images.web` (900 px wide), `images.print` (about 3,400 px) and `images.full` (6,000 px and up).

```bash
curl -s "https://openaccess-api.clevelandart.org/api/artworks/?q=water%20lilies&cc0=1&has_image=1&limit=5"
```

**NASA.**

```bash
curl -s "https://images-api.nasa.gov/search?q=earth%20at%20night&media_type=image"
# each item's links[0].href is a preview; https://images-api.nasa.gov/asset/{nasa_id} lists every size, ~orig.jpg first
```

## Use it as it comes

The images are the artworks themselves, so the craft is in the crop. Some things that work: a detail cropped tight as a full-bleed background (the brushwork of a Van Gogh, the line of a Hokusai wave); a print or engraving behind a big headline; a night-time Earth photograph under a statistic about cities. The scans are large: Cleveland's `full` and the Met's `primaryImage` run to thousands of pixels (the Van Gogh above is an 8 MB original), so they hold up full-screen and in print.

## Use it in your brand

There's nothing to map. To make archive images sit with a brand: treat them consistently. Pick one treatment and use it every time: a halftone or a three-tone dither in brand colours (`HalftoneDots` and `ImageDithering` in [Paper Shaders](../paper-shaders), which its adapter already colours from your brand), or the same crop with the same type over it.

## Notes

- **Only public-domain items are free.** Each archive also holds works still in copyright, and some APIs return images for them too. Always filter (`is_public_domain`, `isPublicDomain`, `cc0=1`) and never use an image whose record isn't marked free.
- **The Met's old search was retired on 1 October 2026.** `/public/collection/v1/search` now returns an error; use `/v1.1/search`, which pages with `offset` and `limit`. Most tutorials and code samples online still show the old one.
- **The Art Institute's text isn't CC0.** Its `description` field is CC BY (credit required); the images and all other data are CC0. Use the pictures and titles freely, and write your own captions.
- **NASA.** Its images are generally free of copyright as US-government works, but they aren't CC0, and the agency asks to be named as the source. Don't use the NASA logo or imply endorsement, and check each record: a few images in the library are by third parties and carry their own rights.
- What the licence doesn't clear: people and trademarks shown in a photograph. That matters far more for NASA's astronaut photos than for paintings.
- No credit is required, though The Met asks people to cite its datasets. A source line ("Art Institute of Chicago, CC0") is good practice in reports anyway.
