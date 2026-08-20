// Shared auth guard for the profile Functions.
//
// Task 5: signed JWT verification. Callers send `Authorization: Bearer <jwt>`.
// Tokens are HS256, signed with JWT_SECRET (Netlify env only, never in the repo).
// Claims: { scope: "profile:read" | "profile:write", iat, exp }.
//   - browser read tokens: 1h, minted by /api/auth/token after a password check
//   - service write token: 30d, minted locally by mint-service-token.mjs, pasted
//     into the n8n Header Auth credential
//
// This is the single auth seam. Endpoints call requireAuth(req, scope) and
// never handle tokens directly.
//
// POC scope: no user accounts, no key rotation, no rate limiting. Tech debt for
// a later production-auth workstream.

import { jwtVerify } from 'jose';

const encoder = new TextEncoder();

export async function requireAuth(req, requiredScope) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { ok: false, status: 500, message: 'JWT_SECRET not configured on the site' };
  }

  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { ok: false, status: 401, message: 'Missing bearer token' };
  }

  try {
    const { payload } = await jwtVerify(match[1], encoder.encode(secret));
    if (requiredScope && payload.scope !== requiredScope) {
      return { ok: false, status: 403, message: `Token scope "${payload.scope}" lacks "${requiredScope}"` };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, status: 401, message: 'Invalid or expired token' };
  }
}
