// Simple API client scaffold for Doctor Stroke landing integration
// Configure the backend URL in ../config.js (BACKEND_URL). When BACKEND_URL is empty the client returns mock responses.
import { BACKEND_URL } from '../config';

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    console.warn('[api] BACKEND_URL not set — returning mock response for', path);
    // Return a small mock object to allow the UI to continue working without a backend
    return { ok: true, message: 'mock response', path };
  }

  const url = `${BACKEND_URL.replace(/\/$/, '')}${path}`;
  const init = Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'include' }, options);
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  return { ok: res.ok, text };
}

export async function signUp(payload = {}) {
  return request('/signup', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getLandingInfo() {
  return request('/landing', { method: 'GET' });
}

export default { signUp, getLandingInfo };
