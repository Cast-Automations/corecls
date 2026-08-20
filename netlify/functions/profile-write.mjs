// POST /api/profile/write
// Body: { crd, source, payload }
// Writes payload to Netlify Blob key `profile:{crd}:{source}` in the
// "profiles" store, with a storedAt timestamp in metadata.
// Called cross-origin from the n8n Extract workflow.

import { getStore } from '@netlify/blobs';
import { requireAuth } from './_auth.mjs';
import { json, preflight } from './_http.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = requireAuth(req);
  if (!auth.ok) return json({ error: auth.message }, auth.status);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { crd, source, payload } = body || {};
  if (crd == null || source == null || payload === undefined) {
    return json({ error: 'crd, source, and payload are required' }, 400);
  }
  if (!/^\d+$/.test(String(crd))) {
    return json({ error: 'crd must be numeric' }, 400);
  }
  if (!/^[a-z0-9_-]+$/i.test(String(source))) {
    return json({ error: 'source must be alphanumeric (letters, digits, _ or -)' }, 400);
  }

  const key = `profile:${crd}:${source}`;
  try {
    const store = getStore('profiles');
    await store.setJSON(key, payload, {
      metadata: { storedAt: new Date().toISOString(), crd: String(crd), source: String(source) },
    });
    return json({ ok: true, key });
  } catch (err) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};

export const config = { path: '/api/profile/write' };
