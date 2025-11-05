const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
  next();
});

// Simple API endpoints for the web portal
// In-memory store for signups (development/demo only)
const signups = [];

app.get('/api/landing', (req, res) => {
  res.json({
    title: 'Doctor Stroke — Web Portal',
    description: 'A clinician-facing portal to view patient progress, therapy schedules, and reports.',
    modules: [
      'Scheduling',
      'Medication reminders',
      'Progress monitoring',
      'Structured reporting'
    ]
  });
});

app.post('/api/signup', (req, res) => {
  const { name, email, source } = req.body || {};
  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email is required' });
  }

  const id = String(Date.now()) + Math.floor(Math.random() * 900 + 100);
  const entry = { id, name: name || null, email, source: source || null, createdAt: new Date().toISOString(), verified: false };
  signups.push(entry);

  // In a real system you'd send a verification email. For demo we return a verification link.
  const verificationLink = `/api/verify/${id}`;
  console.log('Signup saved', entry);
  res.json({ ok: true, message: 'Signup received', id, verificationLink, received: entry });
});

// Dev endpoint: list all signups (no auth) — only for demo/dev
app.get('/api/signups', (req, res) => {
  res.json({ ok: true, count: signups.length, signups });
});

// Dev endpoint: verify a signup by id (simulates email verification)
app.get('/api/verify/:id', (req, res) => {
  const id = req.params.id;
  const entry = signups.find((s) => s.id === id);
  if (!entry) return res.status(404).json({ ok: false, message: 'Not found' });
  entry.verified = true;
  res.json({ ok: true, message: 'Verified', id, entry });
});

// Serve static files from web-portal build when available
const staticDir = path.join(__dirname, '..', 'web-portal', 'dist');
if (require('fs').existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Global error handlers (log) to reduce 500 without JSON
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Express error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  try {
    res.status(500).json({ ok: false, error: String(err) });
  } catch (e) {
    res.status(500).send('Internal Server Error');
  }
});
