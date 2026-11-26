# Portfolio: Valeria López

Static site (HTML + CSS + JS, no build). ES/EN, light/dark.

## Local preview

```powershell
python -m http.server 5173
```

Open http://localhost:5173

## Deploy

**GitHub Pages**
1. Create repo `valelop2606.github.io`, push this folder's contents to `main`.
2. Settings → Pages → Source: `main` / root. URL: `https://valelop2606.github.io`.

**Vercel**
1. `npx vercel` inside this folder (framework: Other, no build command).

## Editing content

- Projects: `data.js` → `window.PROJECTS`. First item renders as featured.
- Text (ES/EN): `data.js` → `window.I18N`. Keys match `data-i18n` in `index.html`.
- CV PDFs: replace `assets/CV_Valeria_Lopez_EN.pdf` / `_ES.pdf`.

### Screenshots

Put image in `assets/`, then in the project:

```js
media: { type: 'image', src: 'assets/wallet.png', alt: 'Wallet dashboard' },
```

Click opens it full size. Without `media`, card shows the code panel (`code`).

### Demo videos

- Short loop on card: `media: { type: 'video', src: 'assets/wallet.mp4', poster: 'assets/wallet.png' }`
- "Watch demo" button: `video: 'assets/wallet-demo.mp4'` or `video: { type: 'youtube', id: 'VIDEO_ID' }`

Keep MP4s under ~5 MB (1280px wide, 20–40 s). Record with OBS or Windows Snipping Tool (Win+Shift+R).
