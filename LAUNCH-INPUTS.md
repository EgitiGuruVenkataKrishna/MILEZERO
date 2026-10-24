# MILEZERO — what is needed besides the Gemini API key?

This file separates items required for a public launch from things that can wait. No secret values should be sent in chat, committed to Git, or put into browser code. Add secrets directly to your hosting provider's encrypted environment settings.

## P0 — Required before collecting real users

| Item | Why it is needed | What you need to provide / do |
|---|---|---|
| **1. Product owner and support contact** | Public privacy/terms pages and a real support path need a responsible operator. | Legal name or business name, support email, privacy contact, and a business address only where applicable/required. Replace every bracketed placeholder in `public/privacy.html` and `public/terms.html`. |
| **2. Domain name** | Makes the brand credible, enables HTTPS and email-domain verification, and gives Turnstile a fixed hostname. | A domain you control (e.g. `milezero...`) and access to its DNS. `PUBLIC_APP_URL` must match the deployed domain exactly. |
| **3. Hosting account** | The Node server and protected API need an always-on HTTPS origin. | Render, Railway, Fly.io, or another Node 20+ host. This bundle includes a Render blueprint and Dockerfile; Render is the lowest-friction default. |
| **4. GitHub repository** | Version history, backup, deploy automation, issue tracking, and a public project home if desired. | Create a private repo first. Review and remove `.env`, local subscriber files, tokens, and private test data before any public release. |
| **5. Supabase project + server Secret key** | Production email subscription records must not live in an ephemeral local JSON file. | Provide `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in hosting settings. Run `supabase/migrations/001_waitlist_subscribers.sql`. Use a server-only secret key (`sb_secret_...` where available), never a browser publishable key. |
| **6. Resend account + verified sender domain** | Confirmation and unsubscribe emails must actually deliver. | `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, plus DNS verification for the sending domain. Start with a sender such as `updates@yourdomain`. Test spam placement, delivery, confirmation, and unsubscribe. |
| **7. Cloudflare Turnstile site + secret keys** | Protects the email signup against bots; server-side validation is implemented. | `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; restrict the widget to your domain. The free local mode can run without these, but production readiness remains false without them. |
| **8. Gemini project/model/limits** | Roadmap generation requires a valid server key and adequate quota. | `GEMINI_API_KEY`, final stable model selected from your live AI Studio project, and a tested quota/budget plan. The default is `gemini-3.8-flash` at the time this bundle was prepared; verify availability and tier limits immediately before launch. |
| **9. Legal/privacy review** | You collect marketing consent and send user answers to an external AI API. | Confirm data flow, Google API terms for your account tier, privacy notice, terms, retention, consent language, deletion handling, applicable Indian DPDP requirements and any other target-market rules with a qualified adviser. |
| **10. Test owner and launch decision** | Someone must own launch-blocking failures and have authority to stop promotion. | Name the person who tests the release, monitors errors, handles user requests, and can roll back the deployment. |

## P1 — Required before paid Premium launch (not enabled in v1)

| Item | Why it is needed | What you need to decide/provide |
|---|---|---|
| Payment provider account | The current app deliberately locks Premium; client-side mode toggles do not grant access. | For India-first, evaluate Razorpay; for wider markets, decide whether you need Stripe or another provider. Account/KYC eligibility, fees, tax, settlement, refunds, disputes and international support need verification. |
| Pricing and product promise | Prevents unclear value claims and refund disputes. | Exact price/currency, what the one-time purchase or subscription includes, usage limits, support/refund rules, and whether a roadmap can be regenerated. Avoid promising faster hiring or a job. |
| Server-side payment verification | Browser success callbacks cannot be trusted. | Order creation on server, signature verification, webhook verification, duplicate-event/idempotency handling, entitlement lookup, refunds/revocation and tests. Keep Premium off until those exist. |
| Payment/legal content | Customers need clear expectations. | Terms, cancellation/refund policy, tax invoices/receipts, support process, billing statements and jurisdiction-specific disclosures. |
| Premium abuse/cost controls | Paid access can still be abused and Gemini calls cost quota. | Usage caps, per-entitlement limits, concurrency queue, model spend alerts, support override and a kill switch. |

## P2 — Useful but can wait until initial beta data exists

- Product analytics (PostHog or similar) with a privacy-conscious event plan and consent review.
- Error monitoring (Sentry or host logs), uptime alerts, and a defined incident process.
- Custom domain email for support and a simple FAQ/help page.
- A user feedback form that does not collect unnecessary sensitive data.
- Additional browser/device test coverage and automated visual regression.
- A curated resource catalog with periodic link checks and manual review of roadmap quality.
- A privacy request workflow for access/deletion and an automated retention job.

## Suggested defaults for the first public beta

- **Audience:** English-speaking students and early-career switchers; start in India, then validate other markets before expanding claims.
- **Release:** free roadmap only; Premium shown as “coming later” and server-disabled.
- **Accounts:** no account/dashboard required; roadmap downloads as standalone HTML.
- **Data:** collect an email only for optional, double-opt-in product updates; do not store roadmap answers in the mailing-list database.
- **AI:** one small follow-up-question call and one final roadmap call; bounded concurrency and no automatic retry storms.
- **Deployment:** one Node service behind HTTPS; Supabase for the subscriber table, Resend for opt-in, Turnstile for signup protection.
- **Launch status:** do not promote publicly until all P0 boxes in `TEST-CHECKLIST.md` are passed and every placeholder in legal pages is replaced.
