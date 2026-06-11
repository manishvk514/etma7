# Everything Media — Cinematic Scroll Film Website

A single-page storytelling website where each scroll section is a film chapter.
A living "wet paint" WebGL background bleeds between chapter palettes as you
scroll and stirs around your cursor like a brush in water. A slate HUD runs a
24fps timecode driven by scroll.

## Why one file?

**The entire website — design, animations, shader, smooth scroll — lives inside
`index.html`.** All CSS and JavaScript are inlined. There are no folders and no
local file paths, so it cannot break from upload structure, missing files, or
wrong directories. The only external loads are CDN libraries (Three.js, GSAP,
Lenis) and Google Fonts — and every one of them is guarded: if any fails, the
site still renders fully designed with all content visible.

## Files

```
index.html    ← the complete website (this is everything)
vercel.json   ← optional Vercel config
README.md     ← this file
```

## How to view it right now

Double-click `index.html`. It opens in your browser and works
(internet needed for fonts and animation libraries).

## Deploy

### Vercel (recommended)
1. Create a GitHub repository. Upload `index.html`, `vercel.json`, `README.md`
   at the **root** of the repo (no folders).
2. vercel.com → **Add New Project** → import the repo.
3. Framework preset: **Other**. No build command. Deploy.

### Netlify
Drag the folder onto app.netlify.com/drop.

### GitHub Pages
Repo → Settings → Pages → Source: `main` branch, root.

## Customizing (everything is inside index.html)

| What | Where in index.html |
|---|---|
| All copy / text | The `<main>` section — plain HTML text |
| Contact email | Search `hello@everythingmedia.studio` (2 places) |
| Chapter colors | `PALETTES` array (paint) + `ACCENTS` array (UI) — keep the same order |
| Timecode runtime | `RUNTIME_FRAMES` (currently 4 min @ 24fps) |
| Scroll feel | Lenis `duration` (higher = floatier) |

## Built-in safeguards

- **No WebGL?** Canvas hides, solid ink background takes over.
- **CDN blocked?** Content fully styled and visible, just without motion.
- **Reduced motion preference?** Animations off, everything visible instantly.
- **Slow load?** Loader force-opens after 3.5s — nobody gets trapped.
- Responsive to mobile, visible keyboard focus, semantic headings.

© 2026 Everything Media
