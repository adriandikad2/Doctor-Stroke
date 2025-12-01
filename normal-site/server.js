const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8082;

// UPDATE 1: Point to port 3001 (Host machine)
// "host.docker.internal" allows Docker to talk to your Windows/Mac localhost
const BACKEND = process.env.BACKEND_URL || 'http://host.docker.internal:3001';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// UPDATE 2: Generic Proxy for ALL API requests (Login, Register, Patients, etc.)
// This replaces the specific '/api/auth/register' block
app.use('/api', async (req, res) => {
  try {
    // Construct the target URL (e.g. http://host.docker.internal:3001/api/auth/login)
    const target = `${BACKEND.replace(/\/$/, '')}${req.originalUrl}`;
    
    console.log(`📤 Proxying ${req.method} ${req.originalUrl} to: ${target}`);

    // Prepare options for the fetch request
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward the auth token if it exists
        'Authorization': req.headers.authorization || ''
      }
    };

    // Attach body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // Send request to the actual backend
    const backendResponse = await fetch(target, options);
    
    // Get the data back
    const data = await backendResponse.json();

    // Send it back to the React Frontend
    console.log(`📥 Backend replied: ${backendResponse.status}`);
    res.status(backendResponse.status).json(data);

  } catch (e) {
    console.error('❌ Proxy error:', e.message);
    res.status(502).json({ 
      ok: false, 
      message: 'Cannot connect to Backend', 
      error: e.message 
    });
  }
});

// Wildcard route for React SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Proxy Server running on port ${PORT}`);
  console.log(`🔗 Connected to Backend at: ${BACKEND}`);
});