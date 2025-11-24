// Small static server for the normal users site, and proxy for signup to the main backend
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8082;
const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';  // Updated

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Proxy signup to backend
app.post('/api/auth/register', async (req, res) => {
  try {
    const target = `${BACKEND.replace(/\/$/, '')}/api/auth/register`;
    const payload = {
      ...req.body,
      role: req.body.role || 'family'
    };
    
    console.log(`📤 Proxying signup to: ${target}`);
    
    const r = await fetch(target, { 
      method: 'POST', 
      body: JSON.stringify(payload), 
      headers: { 'Content-Type': 'application/json' } 
    });
    
    const text = await r.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch (e) { 
      data = { ok: r.ok, text }; 
    }
    
    console.log(`📥 Backend response:`, r.status, data);
    res.status(r.status).json(data);
  } catch (e) {
    console.error('❌ Proxy error:', e);
    res.status(502).json({ 
      ok: false, 
      message: 'Backend connection failed', 
      error: e.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Normal site running on http://localhost:${PORT}`);
  console.log(`   Proxying to backend: ${BACKEND}`);
});
