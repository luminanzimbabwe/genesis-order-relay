# Genesis Order Relay — Build Guide (PWA)

Standalone **Progressive Web App** for customers to find stores and place orders.
Extracted from the Company Portal so it deploys on its own (no company-portal code bundled).

There is **no build step** — it is plain static files. Just deploy the `public/` folder.

## Local test
```powershell
cd GenesisOrderRelay
npm start          # serves public/ on http://localhost:3002
```

## Deploy (any static host)
Upload the contents of `public/` to the root of your site:
- Netlify / Vercel / Render Static / GitHub Pages / any web server

### Requirements for install + notifications
- **HTTPS is required** (browsers only allow PWA install + push over HTTPS)
- `manifest.json` + `sw.js` are already present → users can "Install" / "Add to Home Screen"
- Connects to the shared backend API at `https://genesisbackend-cu69.onrender.com/api/inventory`

## Project layout
- `public/index.html` — the Order Relay app (self-contained: styles, scripts, API config)
- `public/styles.css` — shared styles
- `public/manifest.json` — PWA manifest (name: Genesis Order Relay)
- `public/sw.js` — service worker (offline + order notifications)
- `public/genesislogo.png` — app icon
