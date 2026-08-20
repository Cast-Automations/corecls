# Core Compliance, Client Profile POC

Static profile site plus Netlify Functions backing the client profile data model.

## Structure

- `index.html` .............. landing page, links to /v0.1/ and /v0.2/
- `v0.1/` .................. Sprint 0 baseline, frozen Deerfield static demo, do not edit
- `v0.2/` .................. live profile page, Financial Trust Asset Management (CRD 108998)
- `netlify/functions/` ..... profile store API (Netlify Functions v2 + Netlify Blobs)
  - `profile-write.mjs` ... POST /api/profile/write, writes one source payload to Blobs
  - `profile-read.mjs` .... GET /api/profile/read?crd=, aggregates source blobs
  - `_auth.mjs` ........... shared auth guard (token now, JWT in Sprint 1B Task 5)
  - `_http.mjs` ........... CORS + JSON helpers
- `netlify.toml` ........... publish dir + functions dir + security headers
- `package.json` ........... @netlify/blobs dependency

## Blob store

Store name `profiles`, key convention `profile:{crd}:{source}` (e.g. `profile:108998:adv`).
Do not deviate: the Clio connector in Sprint 1C depends on this pattern.

## Deploy

Git-connected. Push to the connected branch and Netlify runs `npm install`,
bundles the functions, and publishes. Functions resolve at `/api/profile/read`
and `/api/profile/write` via the v2 `config.path` setting, no redirects needed.

## Environment variables (set in Netlify, not in the repo)

- `PROFILE_TOKEN` .......... shared token for the profile API (Task 4)
- `JWT_SECRET` ............. added in Task 5 when auth moves to signed JWTs

## Local dev

`npm install` then `netlify dev` to run the site + functions locally.
