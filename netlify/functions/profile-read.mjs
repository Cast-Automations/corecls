// GET /api/profile/read?crd={crd}
// Reads all `profile:{crd}:*` blobs from the "profiles" store and returns
// them aggregated by source. Contract the v0.2 page consumes:
//
//   {
//     "crd": "108998",
//     "sources":   { "adv": <advPayload>, "hubspot": {...}, "monday": {...} },
//     "updatedAt": { "adv": "2026-08-20T...Z", ... }
//   }
//
// Each source payload is returned exactly as it was written, so the ADV
// payload keeps its { fields, extracted_at, extraction_status } shape. The
// page reads sources.adv.fields[...]. Adding hubspot/monday/clio later needs
// no read-endpoint change: they appear under sources automatically.

import { getStore } from '@netlify/blobs';
import { requireAuth } from './_auth.mjs';
import { json, preflight } from './_http.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const auth = requireAuth(req);
  if (!auth.ok) return json({ error: auth.message }, auth.status);

  const crd = new URL(req.url).searchParams.get('crd');
  if (!crd || !/^\d+$/.test(crd)) {
    return json({ error: 'valid numeric crd query param required' }, 400);
  }

  const prefix = `profile:${crd}:`;
  try {
    const store = getStore('profiles');
    const { blobs } = await store.list({ prefix });

    const sources = {};
    const updatedAt = {};
    for (const b of blobs) {
      const source = b.key.slice(prefix.length);
      const res = await store.getWithMetadata(b.key, { type: 'json' });
      if (res) {
        sources[source] = res.data;
        updatedAt[source] = res.metadata?.storedAt || null;
      }
    }

    return json({ crd, sources, updatedAt });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
};

export const config = { path: '/api/profile/read' };
