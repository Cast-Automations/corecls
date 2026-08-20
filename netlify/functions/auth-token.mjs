// POST /api/auth/token
// Body: { password }
// If the password matches SITE_PASSWORD, issues a 1-hour read-scoped JWT.
// This is what the v0.2 page calls on load to obtain a token for /api/profile/read.

import { SignJWT } from 'jose';
import { json, preflight } from './_http.mjs';

const encoder = new TextEncoder();

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = process.env.JWT_SECRET;
  const sitePassword = process.env.SITE_PASSWORD;
  if (!secret || !sitePassword) {
    return json({ error: 'Auth not configured (JWT_SECRET or SITE_PASSWORD missing)' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body || body.password !== sitePassword) {
    return json({ error: 'Invalid password' }, 401);
  }

  const token = await new SignJWT({ scope: 'profile:read' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encoder.encode(secret));

  return json({ token, expiresIn: 3600 });
};

export const config = { path: '/api/auth/token' };
