// Shared auth guard for the profile Functions.
//
// Task 4 (this sprint): shared token from env PROFILE_TOKEN, sent by callers
// in the x-cast-token header. Mirrors the Serve v0.1 token pattern so the
// migration is testable end to end before JWT lands.
//
// Task 5: replace the body of requireAuth with signed-JWT verification
// (Authorization: Bearer <jwt>, scope check, exp check). This is the ONLY
// file Task 5 needs to touch. Keep the { ok, status, message } shape stable
// so profile-write.mjs and profile-read.mjs never change for auth.

export function requireAuth(req) {
  const expected = process.env.PROFILE_TOKEN;
  if (!expected) {
    return { ok: false, status: 500, message: 'PROFILE_TOKEN not configured on the site' };
  }
  const token = req.headers.get('x-cast-token');
  if (!token || token !== expected) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }
  return { ok: true };
}
