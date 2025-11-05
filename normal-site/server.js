// Small static server for the normal users site, and proxy for signup to the main backend
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8082;
// Default backend for the proxy: use 4000 (safer default) — override with BACKEND_URL env var
const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Proxy /api/signup to the backend server
app.post('/api/signup', async (req, res) => {
  try {
    const target = `${BACKEND.replace(/\/$/, '')}/api/signup`;
    const r = await fetch(target, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' } });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = { ok: r.ok, text }; }
    res.status(r.status).json(data);
  } catch (e) {
    console.error('proxy error while calling backend', BACKEND, e && e.stack ? e.stack : e);
    // Return more helpful error to client for local debugging
    res.status(502).json({ ok: false, message: 'Backend proxy failed', error: String(e), backend: BACKEND });
  }
});

app.listen(PORT, () => console.log(`Normal site listening on http://localhost:${PORT} (proxy -> ${BACKEND})`));
