// Local one-off: mint a 30-day service JWT for the n8n Extract workflow.
// This file lives at the repo root, NOT in netlify/functions, so it is never
// deployed as an endpoint.
//
// Usage:
//   npm install
//   JWT_SECRET='<the same secret set in Netlify>' node mint-service-token.mjs
//
// Paste the printed token into the n8n Header Auth credential as:
//   header name:  Authorization
//   header value: Bearer <token>

import { SignJWT } from 'jose';

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Set JWT_SECRET in the environment, e.g. JWT_SECRET=... node mint-service-token.mjs');
  process.exit(1);
}

const token = await new SignJWT({ scope: 'profile:write' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('30d')
  .sign(new TextEncoder().encode(secret));

console.log(token);
