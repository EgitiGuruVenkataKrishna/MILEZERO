# MILEZERO v1 — personalised career-roadmap web product

MILEZERO turns a user's goal, starting point, weekly time, proof of work and constraints into one opinionated, milestone-based roadmap. The output is a standalone interactive HTML file with phase accordions, task checkboxes, progress, resource links and print support.

This repository grows the original visual prototype into a launch-oriented MVP scaffold. **It is not yet cleared for public promotion.** Read `LAUNCH-INPUTS.md` and pass every P0 item in `TEST-CHECKLIST.md` first.

## What is in this release

- Responsive editorial UI and dynamic question flow with student/employee branches.
- Gemini server-side generation with structured JSON response schemas, bounded AI concurrency, input limits and explicit quota error handling.
- Two AI calls in the free journey: a bounded follow-up question set, then the roadmap. The model is not called on every question.
- User answers are not intentionally written to the mailing-list database.
- Optional email marketing consent; the free route works when consent is unchecked.
- Double opt-in confirmation and unsubscribe endpoints using Supabase + Resend in production. In local development, signup is stored only in `data/subscribers.json` and no confirmation email is sent unless you configure Resend.
- Optional Cloudflare Turnstile widget and server-side token verification. Production readiness stays false until Turnstile is configured.
- Strict server-side premium lock. A client-side `mode=premium` cannot unlock premium; no paid checkout is offered in this release.
- Privacy and terms templates, Supabase SQL migration, Dockerfile, Render blueprint, GitHub Actions, automated smoke tests and a manual launch checklist.

## Architecture

```text
Browser (public/index.html)
  ├── GET /api/health
  ├── POST /api/subscribe  ── Turnstile verification ── Supabase waitlist table
  │                                                           └── Resend double-opt-in email
  ├── POST /api/question-plan ── Gemini API
  └── POST /api/roadmap ───────── Gemini API
                                     ↓
Browser generates and downloads a standalone interactive .html roadmap
```

No framework or npm runtime dependency is required; it uses Node's built-in `fetch`, `http`, filesystem and crypto modules. Keep Node at version 20+ (22 recommended). The app is served from the same origin as its API to avoid unnecessary CORS configuration.

## Local setup

1. Install Node.js 20+.
2. Extract this folder and open a terminal here.
3. Copy `.env.example` to `.env` for reference. **The application does not auto-load `.env`**; export variables in your terminal or set them in your process manager.
4. Run:

```bash
npm run check
npm test
npm start
```

Open `http://localhost:4173`. Without a Gemini key, the app uses its demonstration fallback. The app will not call Gemini until `GEMINI_API_KEY` is configured.

PowerShell example:

```powershell
\$env:GEMINI_API_KEY="YOUR_GEMINI_KEY"
\$env:GEMINI_MODEL="gemini-3.8-flash"
node server.mjs
```

Do not place real keys in `public/`, HTML, client JavaScript, a screenshot, or Git. The Gemini key is sent to Google's API using the `x-goog-api-key` header from the server, never to the browser.

## Required production integrations

### 1. Gemini

Set:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (the prepared default is `gemini-3.8-flash`; verify the exact current model string and your account's limits before deployment)
- `MAX_AI_CONCURRENT` (default 2)
- `AI_CALLS_PER_IP_PER_HOUR` (default 12)

The app does not automatically retry a Gemini 429. Its concurrency and IP limits help moderate this application's traffic; they do not change Google's account/project quotas. Quotas vary by model, project and tier.

### 2. Supabase waitlist database

Create a Supabase project. In SQL Editor, run `supabase/migrations/001_waitlist_subscribers.sql`. Configure server-only `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Use a current Supabase Secret key (`sb_secret_...` where enabled), and do not use a publishable key in server configuration. The subscriber table intentionally has no browser access policies; only the backend service is meant to query it.

### 3. Resend email

Verify a domain you control, create an API key, then set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. A subscriber is saved pending confirmation; the link expires after 24 hours. Each email includes an unsubscribe URL. Test delivery, bounces and unsubscribe behaviour before public launch.

### 4. Cloudflare Turnstile

Create a widget restricted to the production hostname and configure `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The browser site key is public; the secret is server-only. The server calls Cloudflare Siteverify to validate the submitted token. Do not trust client-only CAPTCHA success.

### 5. Public app URL and legal pages

Set `PUBLIC_APP_URL` to the final HTTPS address. Replace every bracketed placeholder in `public/privacy.html` and `public/terms.html` before publishing. These pages are templates, not legal advice; review them against the deployed data flow and laws in each target market.

## Production configuration

### Render (default deployment path)

1. Push this folder to a private GitHub repository.
2. Connect the repository to Render using `render.yaml`, or create a Node web service manually.
3. Configure all environment variables in Render's dashboard. Do not paste secrets into `render.yaml` or commit `.env`.
4. Run the Supabase SQL migration and verify your sender domain before promoting the deployment.
5. Set `PUBLIC_APP_URL`, `TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY` to the exact deployed domain.
6. Confirm `/api/health` says `productionReady: true` and `emailSignupEnabled: true`.
7. Complete the P0 checklist in `TEST-CHECKLIST.md` against the deployed domain.

The health endpoint reports configuration readiness; it is not a full integration health test. It does not verify a real message can be delivered or a real Gemini roadmap can be generated. Test those manually.

### Docker

```bash
docker build -t milezero .
docker run --rm -p 4173:4173 --env-file .env milezero
```

For production, provide secrets through the hosting platform's secret manager. Do not mount local subscriber JSON as your production database.

## Environment reference

See `.env.example`. A public launch requires all P0 configuration: Gemini, Supabase, Resend, Turnstile, the public HTTPS URL, real support/privacy contacts and a reviewed legal notice.

## Tests

```bash
npm run check
npm test
```

The built-in Node smoke tests cover server startup, health response, static privacy/terms pages, security headers, invalid email rejection, consent validation and source-file exposure. They do **not** cover real Gemini, Resend, Supabase, Turnstile or cross-browser visual behaviour because those require actual accounts/deployed domain.

Manual and production integration checks live in `TEST-CHECKLIST.md`. Specifically check the generated roadmaps for quality and resource truthfulness; schema-valid JSON is not the same as a correct roadmap.

## Known limitations / explicitly not enabled

- Premium/payment is **off**. No live checkout, provider callback, verified entitlement, refund support or paid access exists yet. Keep the Premium CTA informational only.
- Rate limiting is in-memory and per Node process. Before running multiple instances or spending meaningful money on AI calls, replace it with a shared rate-limit store or enforce robust limits at the proxy/edge layer.
- Subscriber confirmation and unsubscribe are implemented, but there is no admin mailing campaign system, automated retention job or data deletion dashboard yet.
- There is no user account; if a person loses their HTML file, the app has no cloud library/recovery feature.
- Resource URLs are restricted to an allow-list of known educational/documentation domains but are not live-checked during every generation. Manually verify links before advertising them as verified or free.
- The default model can change or become unavailable. Check Google AI Studio model availability/quotas immediately before deployment and measure actual cost/latency on your account.
- Privacy and terms contain placeholders until the operator supplies legal/support details. Do not publish before replacing them and confirming the real data flow.

## Launch rule

Treat MILEZERO as a free beta until P0 testing is completed and signed off. Do not announce job-placement outcomes, guaranteed timelines, verified resource links, or a purchasable Premium tier. Announce the product only after the actual production app—not just the local demo—passes the test checklist.
