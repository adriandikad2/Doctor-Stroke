Doctor Stroke — Landing page (React Native + Web)

This small scaffold contains a responsive landing page built with Expo / React Native and designed to work on mobile (Expo Go) and web (desktop browser via React Native Web).

Files created:
- `package.json` — project manifest
- `app.json` — Expo config
- `App.js` — entry
- `components/LandingScreen.js` — responsive landing page UI

Quick start (Windows PowerShell):

1. Install Node.js 18+ and npm if you don't have them.
2. From this project folder, install dependencies:

```powershell
npm install
```

3. Start the dev server (web):

```powershell
npx expo start --web
```

This will open the Expo devtools in your browser. Choose "Run in web browser" to view the desktop version.

To test on a mobile device, install the Expo Go app on your phone and run:

```powershell
npx expo start
```

Then scan the QR code from the devtools.

Notes and next steps:
- The UI is intentionally a simple, clean landing page that adapts layout based on viewport width.
- I can now: add real assets (logo/screenshots), implement navigation, convert CTAs to real auth flows, or produce a matching React web build and screenshots.

Tell me which next step you want (add assets, implement auth screens, or wire up navigation + routing).

Backend integration
-------------------

This scaffold includes a small API client at `services/api.js` and a configuration file `config.js` where you should set `BACKEND_URL` to point to your backend API.

Default behaviour:
- If `BACKEND_URL` in `config.js` is empty the client returns small mock responses so the UI continues working during development.

Expected endpoints (placeholders — you'll provide the final verification links):
- POST /signup   — used by the Sign Up CTA on the landing page
- GET  /landing  — (optional) returns additional landing information

To connect the real backend:
1. Open `config.js` and set `export const BACKEND_URL = 'https://your-backend.example.com';`
2. Ensure the endpoints above exist, or update `services/api.js` to match your API paths.
3. Re-run the app. The Sign Up and Learn More buttons will call the configured endpoints and show the returned message.

If you want, paste the verification links and I will wire them directly into the client and add success/error handling flows.

In-memory signup demo
----------------------

The Express server includes a simple in-memory signup demo so you can test the sign-up flow without a database.

Endpoints available (development/demo only):
- POST /api/signup       — Accepts { name, email, source } — returns id and a verificationLink
- GET  /api/signups      — Lists stored signups
- GET  /api/verify/:id   — Marks signup as verified (simulate clicking verification link)

Notes:
- Data is stored only in memory and will be lost when the server restarts.
- These endpoints are intentionally unprotected and meant for local development only.

Normal users static signup site (http://localhost:8082)
-----------------------------------------------------

I added a lightweight static signup site at `normal-site/` which is served by a tiny Express server on port 8082 and proxies signup requests to the backend (default http://localhost:5001).

To run it (PowerShell):

```powershell
cd "d:\UI\Smt. 5\Rekayasa Perangkat Lunak\Doctor Stroke\normal-site"
npm install
npm start
```

Note: the normal-site proxy defaults to `http://localhost:4000` for the backend. If your Express API runs on a different port (for example 5001), set `BACKEND_URL` before starting:

```powershell
$env:BACKEND_URL = 'http://localhost:5001'
npm start
```

Open http://localhost:8082 and submit the form — it will POST to `/api/signup` on the configured backend.


Run the web portal + Express server
---------------------------------

This repository now includes a minimal React web portal (Vite) and an Express server.

From the project root (PowerShell):

1. Install dependencies for the server and web-portal:

```powershell
cd "d:\UI\Smt. 5\Rekayasa Perangkat Lunak\Doctor Stroke\server"; npm install
cd "d:\UI\Smt. 5\Rekayasa Perangkat Lunak\Doctor Stroke\web-portal"; npm install
```

2. Start the Express server (dev API):

```powershell
cd "d:\UI\Smt. 5\Rekayasa Perangkat Lunak\Doctor Stroke\server"; npm start
```

3. Start the web portal in dev mode (Vite):

```powershell
cd "d:\UI\Smt. 5\Rekayasa Perangkat Lunak\Doctor Stroke\web-portal"; npm run dev
```

The Vite dev server proxies `/api` requests to the Express server (http://localhost:4000) so the React app can call `/api/landing` and `/api/signup` during development.
