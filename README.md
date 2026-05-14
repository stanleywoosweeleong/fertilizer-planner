# Fertilizer Planner · 肥培管理 — PWA

A bilingual durian-orchard fertilizer planner, packaged as an installable Progressive Web App. **Fully offline-capable on first launch** — no CDN dependencies at runtime.

## Files

```
.
├── index.html                  # Main app (was fertilizer-planner.html)
├── manifest.json               # PWA manifest — name, icons, theme color, etc.
├── service-worker.js           # Offline cache + update strategy
├── icons/
│   ├── icon-192.png            # Home-screen icon (Android, iOS)
│   ├── icon-512.png            # Splash / large icon
│   └── icon-maskable-512.png   # Maskable variant for Android adaptive icons
├── vendor/
│   ├── lucide.min.js           # Lucide icon library (ISC, self-hosted)
│   ├── LICENSE-lucide.txt
│   └── fonts/                  # Self-hosted DM Sans + Noto Sans SC
│       ├── fonts.css
│       ├── LICENSE-DMSans.txt
│       ├── LICENSE-NotoSansSC.txt
│       └── files/              # woff2 files (variable, subsetted)
├── .nojekyll                   # Tell GitHub Pages not to run Jekyll
└── README.md
```

All paths in `manifest.json`, `index.html`, and `service-worker.js` are **relative** (`./`), so the app works at any sub-path — e.g. `https://<you>.github.io/<repo>/`.

## What's bundled locally (and why)

The original file pulled lucide from `unpkg.com` and fonts from Google Fonts. The PWA now ships everything itself so it installs and launches **fully offline on the first cold start** — no "online once first" requirement.

| Asset | Source | Size on disk | Notes |
|---|---|---|---|
| `lucide.min.js` | `lucide@1.16.0` from npm | ~400 KB | Full library. Gzip ~80 KB on the wire. |
| `dm-sans-latin-wght-normal.woff2` | `@fontsource-variable/dm-sans` | ~37 KB | Variable font, weights 100–1000 in one file. |
| `dm-sans-latin-ext-wght-normal.woff2` | same | ~18 KB | Latin Extended (accents). |
| Noto Sans SC subsets (× 21 woff2) | `@fontsource-variable/noto-sans-sc` | ~115 KB total | **Custom-subsetted** to only the 288 CJK characters this app actually uses. Down from the 75 MB the full font weighs. |

Total deploy size: **~756 KB** uncompressed, **~250 KB gzipped on the wire**.

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `fertilizer-planner`).
2. Push every file in this folder to the **root** of that repo, preserving the `icons/` and `vendor/` folders.
3. In the repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`** → Save.
4. Wait ~30 seconds, then visit `https://<your-username>.github.io/<repo-name>/`.
5. On Chrome desktop you'll see an install icon in the address bar. On Android Chrome / iOS Safari, use **Add to Home Screen** from the share menu.

> ⚠️ **HTTPS is required for service workers.** GitHub Pages serves HTTPS automatically, so this works out of the box. For local testing, use `http://localhost` (also exempt) — open a terminal in this folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000/`.

## Updating the app

When you edit `index.html` (or any cached file), bump `CACHE_VERSION` at the top of `service-worker.js`:

```js
const CACHE_VERSION = 'v1.1.1';   // was v1.1.0
```

Bumping the version invalidates the old cache so users get the new build on next load.

## Adding new Chinese characters

The Noto Sans SC subset only contains the 288 characters the original `index.html` used. **If you add new Chinese text, those characters won't render properly** — the browser will fall back to the system font.

Two options:

1. **Simple:** Switch the `fonts.css` Noto entries back to the full Google Fonts URL (sacrifices first-launch offline for new characters). Or use the full `@fontsource/noto-sans-sc` package and ship all 75 MB (don't).
2. **Proper:** Re-run the subsetting pipeline. The build scripts scan `index.html` for CJK characters and rebuild the subsets. Ask if you'd like a `tools/build-fonts.sh` checked in for this.

## What's PWA-enabled

- ✅ Installable on Android, iOS, Windows, macOS, Chrome OS
- ✅ Standalone display (no browser chrome when launched from home screen)
- ✅ **Fully offline on first launch** — no CDN dependencies
- ✅ Custom theme color (`#059669` emerald — matches the app palette)
- ✅ Maskable icon for Android adaptive icon shapes
- ✅ Works from any sub-path (relative URLs everywhere)

## Notes

- The service worker registers on `load` and uses **network-first for navigations** so you always see the latest `index.html` when online, falling back to cache when offline.
- Static assets are **cache-first** (fast and offline-safe).
- Browsers only download woff2 files whose `unicode-range` matches characters actually on the page — so even though 21 CJK subsets ship, a typical English-mode session only fetches the Latin ones.

## Licenses

- App code: yours.
- **Lucide** icons — ISC. See `vendor/LICENSE-lucide.txt`.
- **DM Sans** font — OFL-1.1. See `vendor/fonts/LICENSE-DMSans.txt`.
- **Noto Sans SC** font — OFL-1.1. See `vendor/fonts/LICENSE-NotoSansSC.txt`.
