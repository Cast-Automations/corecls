// Shared HTTP helpers for the profile Functions.
// CORS is open for the demo. The write endpoint is called cross-origin from
// n8n, so it needs CORS and an OPTIONS preflight. Tighten the allowed origin
// to the n8n and site domains when this leaves POC scope.

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-cast-token, Authorization',
};

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extra },
  });
}

export function preflight() {
  return new Response('', { status: 204, headers: CORS });
}
