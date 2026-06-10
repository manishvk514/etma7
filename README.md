# Everything Media — Cinematic Scroll Film Website

A single-page storytelling website where each scroll section is a film chapter.
The background is a living "wet paint" WebGL field that bleeds between chapter
palettes as you scroll, and stirs around the cursor like a brush in water.

## Stack

| Layer | Tool | Loaded via |
|---|---|---|
| Painted background | Three.js (custom GLSL shader) | CDN |
| Scene animations | GSAP 3 + ScrollTrigger | CDN |
| Smooth scroll | Lenis | CDN |
| Fonts | Marcellus · Archivo · IBM Plex Mono | Google Fonts |

No build step. No npm. Pure static files — host anywhere.

## File structure

```
everything-media/
├── index.html        # all content & chapter structure
├── css/
│   └── style.css     # design tokens, type, layout, responsive, a11y
├── js/
│   ├── background.js # Three.js paint shader + palette bleeding
│   └── main.js       # Lenis + GSAP ScrollTrigger + loader + HUD
└── README.md
```

## Deploy

### Vercel (recommended)
1. Push this folder to a GitHub repository (all files at the repo root).
2. Go to vercel.com → **Add New Project** → import the repo.
3. Framework preset: **Other**. No build command, no output directory needed.
4. Deploy. Done — it's a static site.

### Netlify
Drag the whole folder into app.netlify.com/drop. That's it.

### GitHub Pages
Repo → Settings → Pages → Source: `main` branch, root folder.

## Customizing

- **Copy** — everything is plain text in `index.html`.
- **Contact email** — search for `hello@everythingmedia.studio` and replace
  (appears twice: the CTA button and the credits footer).
- **Chapter colors** — edit `PALETTES` in `js/background.js`
  and the matching `ACCENTS` array in `js/main.js`. Keep both in the same order:
  `[prologue, craft, machine, work, studio, credits]`.
- **Runtime / timecode** — `RUNTIME_FRAMES` in `js/main.js`
  (currently a fictional 4-minute film at 24fps).
- **Scroll feel** — Lenis `duration` in `js/main.js` (higher = floatier).

## Accessibility & fallbacks

- `prefers-reduced-motion`: smooth scroll and entrance animations are disabled,
  all content is visible immediately, and the paint field slows to a near-still.
- If WebGL is unavailable, the canvas hides and a solid ink background takes over.
- Visible keyboard focus styles; semantic headings throughout.

© 2026 Everything Media
