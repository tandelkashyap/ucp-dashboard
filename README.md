# UCP dashboard

Next.js frontend for the `ucp-platform` Laravel API — register/login and a
dashboard shell that lists (and creates) merchants. First slice, chosen to
prove the whole stack end to end before building out the rest of the
control-plane UI on top of it.

Unlike the Laravel backend, this one is fully verified in the sandbox this
was built in: real `npm install`, a real `next build`, and a clean
`next lint` — not just syntax-checked. See "What was actually verified"
below for the one thing that couldn't be.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point API_URL at your running Laravel API
npm run dev
```

Needs the `ucp-platform` backend running and reachable at `API_URL` —
this has nothing to render on its own.

## Why Next.js, not Inertia

Decided when the Laravel control-plane API was built: it already returns
JSON with Sanctum bearer auth, not `Inertia::render()` page props. Next.js
consumes that as-is; Inertia would have meant reworking every controller.

## Architecture decisions worth knowing

**The auth token lives in an httpOnly cookie, never client-side JS.**
`AuthController` (Laravel) issues a Sanctum bearer token; this app stores
it server-side only and forwards it as an `Authorization` header on every
API call. Login/register/logout are Server Actions
(`lib/actions/auth.ts`), not client-side `fetch` calls — the token never
reaches the browser at all, which closes off an entire class of
XSS-token-theft risk. The trade-off: nothing here can call the Laravel API
directly from a client component. Anything a client component needs has
to be fetched in a Server Component and passed down as props.

**Two layers of auth checking, deliberately not redundant.**
`proxy.ts` (Next 16 renamed `middleware.ts`) checks cookie *presence* at
the edge — cheap, no network call, catches the common case fast. It
can't check whether the token is still *valid* without a round trip to
Laravel on every navigation, so it doesn't try. `apiFetch` (`lib/api.ts`)
makes the real call; a 401 there means "presence checked out but Laravel
rejected it" (revoked, expired) and each Server Component that calls it
catches that specifically and redirects — see `app/dashboard/page.tsx`.

**Fonts are self-hosted via Fontsource, not `next/font/google`.** Started
with `next/font/google`; the build in this sandbox failed because
`fonts.googleapis.com` isn't reachable here. Rather than leave that
unverified, switched to `@fontsource/*` packages (the actual font files,
installed from npm, bundled at build time) — which also happens to be the
better call for a real deployment regardless of the sandbox: one less
runtime dependency on a third-party CDN.

## Design direction

Deliberately not the cream+terracotta or near-black+neon look most
AI-generated UI defaults to. Cool off-white background, near-black ink
text, a deep verified-teal accent (`#0B6E4F`) rather than generic SaaS
blue. Space Grotesk for headings, Inter for body text, and — the one
actual signature choice — JetBrains Mono specifically for anything that's
a literal system-generated value (slugs, status badges, and every
`key_id` once the credentials screen exists) rather than human-authored
text. That distinction is real: it tells you at a glance which strings on
screen are copy-pasteable identifiers versus prose.

## What was actually verified

`npm run build` and `npm run lint` both pass clean in this sandbox for
every page, including the new `[slug]` route. Beyond that, verification
status is now mixed rather than uniformly "untested":

- **Register → login → create merchant is confirmed working against a
  real running backend** — not just built here, actually run and
  screenshotted against a live Laragon instance, cookie and all.
- **Store connections, capability toggles, and agent credential issuance
  (this pass's additions) are not yet confirmed the same way.** They're
  written to match `ucp-platform`'s routes and response shapes exactly,
  and they build and type-check clean, but that's the same guarantee
  login had before it was actually tried against a live backend — not
  proof the round-trip itself is correct. Try connecting a store and
  issuing a credential through the UI next, the same way login got
  proven out, and report back whatever the first real attempt breaks.

## What's here

```
app/
  layout.tsx           Fonts, metadata
  page.tsx              Redirects to /dashboard or /login based on the cookie
  login/page.tsx, register/page.tsx
  dashboard/
    layout.tsx           Nav shell + logout
    page.tsx              Lists merchants (now clickable) + create-merchant form
    [slug]/page.tsx        New — store connections, capabilities, agent credentials
lib/
  session.ts             Cookie name/options, shared by actions + proxy.ts
  api.ts                 Server-only fetch wrapper — see auth notes above
  actions/
    auth.ts               login/register/logout Server Actions
    merchants.ts           createMerchantAction
    store-connections.ts   New — connectStoreAction, disconnectStoreAction
    capabilities.ts        New — toggleCapabilityAction
    credentials.ts         New — issueCredentialAction, revokeCredentialAction
components/
  auth-field.tsx          Shared form field (login + register)
  create-merchant-form.tsx
  connect-store-form.tsx   Platform-conditional fields, mirrors
                           ConnectStoreRequest exactly — 4 platforms now
                           (Shopify, WooCommerce, BigCommerce, Magento)
  store-connection-list.tsx  New
  capability-list.tsx        New — toggle-as-button, same pattern as logout
  issue-credential-form.tsx  New — the one-time-reveal moment
  credential-list.tsx        New
proxy.ts                 Edge auth guard (formerly middleware.ts)
```

## The one-time-reveal, specifically

`IssueCredentialForm` is the one component here that can't just revalidate
and move on — the plaintext token only ever exists in that single response,
so the UI has to stop and make the person actually see it. It swaps to a
"here's your token, copy it now" panel with a local `dismissed` flag rather
than a toast or inline message that could get missed or scroll away. There
is deliberately no way to see a token again after dismissing — that's
correct, not a missing feature. A revoked-and-reissued credential is the
only path back.

## Deliberately not built in this pass

- Any error state beyond "the API call failed" — no retry, no offline
  handling
- Loading states beyond Next's default (no skeleton screens)
- Editing an existing capability's `config` (e.g. WooCommerce's
  `gateway_mapping`) — `CapabilityList` only toggles `enabled`, the
  `config` JSON itself has no UI yet
- Multiple store connections per merchant aren't specially handled beyond
  listing them — the backend allows one row per platform, but nothing here
  warns if a second connection would conflict with an already-`connected`
  one

## Natural next steps

- A `config` editor for capabilities that need it (the WooCommerce gateway
  mapping is the concrete example already sitting in the backend)
- Actually run this against the live backend and fix whatever the first
  real round-trip breaks
- Replace `AuthController` client-side with whatever real auth
  (Fortify/Breeze) ends up backing it, once that exists
