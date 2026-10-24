# MILEZERO launch QA checklist

**Rule:** do not promote the product publicly until every P0 item below is checked by a human on the actual production domain. Automated tests are necessary but not sufficient. The current test bundle verifies basic server behaviour; it does not validate a live Gemini key, production SMTP delivery, production Turnstile, or payment flows.

## A. Build and deployment

### P0 — must pass
- [ ] `node --version` is Node 20+ (Node 22 recommended).
- [ ] `npm run check` exits 0.
- [ ] `npm test` exits 0 on a clean checkout.
- [ ] No live secrets appear in Git history, browser source, source maps, static files, logs, or screenshots.
- [ ] Production environment variables are configured in the hosting dashboard, not `.env` committed to the repo.
- [ ] Production URL is HTTPS and `PUBLIC_APP_URL` matches exactly.
- [ ] `/api/health` returns 200 without revealing secrets and reports `productionReady: true` only when all P0 providers are configured.
- [ ] Hosting health check passes after a fresh deploy and a restart.
- [ ] Confirm whether host runs more than one Node instance; if yes, replace in-memory rate limiting with a shared limiter or provider-level rate limiting before launch.
- [ ] Rollback to the prior version is understood and tested.

## B. Landing page and responsive UI

### P0 — must pass
- [ ] Landing page loads on current Chrome, Edge, Firefox and Safari.
- [ ] Test at 320px, 375px, 768px, 1024px and 1440px widths; no horizontal overflow or cut-off CTA.
- [ ] The email-entry card is keyboard-operable and has a visible focus indicator.
- [ ] Email is required; product-update consent is optional and unchecked by default.
- [ ] Privacy and Terms links work and contain no `[PLACEHOLDER]`, `[LEGAL NAME]`, `[SUPPORT EMAIL]`, or fake address.
- [ ] Reduced-motion preference is respected; no animation blocks the task flow.
- [ ] Modal opens/closes by close button and backdrop; keyboard focus and Escape behaviour are verified.
- [ ] Browser zoom at 200% does not hide essential controls.
- [ ] Screen reader labels exist for inputs, buttons, progress, question options, error messages and downloaded-roadmap controls.
- [ ] Colour contrast is tested against WCAG AA for normal text and interactive controls.

## C. Email signup, consent and preferences

### P0 — must pass on the production domain
- [ ] Submit a valid email with product-update consent **unchecked**: user can continue to the questionnaire; address is not added to the mailing list.
- [ ] Submit a valid email with consent checked and Turnstile completed: API returns success/pending confirmation.
- [ ] Invalid email is rejected server-side.
- [ ] `consent: false` is rejected by `/api/subscribe`.
- [ ] Honeypot populated returns an innocuous response and does not add a subscriber.
- [ ] Missing/expired/reused/invalid Turnstile token is rejected server-side.
- [ ] Supabase contains only the minimum subscription fields; raw questionnaire answers and generated roadmaps are not in the subscriber table.
- [ ] First opt-in receives a confirmation email from the verified sender domain.
- [ ] Confirmation email is readable on mobile and does not land in spam for representative inboxes.
- [ ] Confirmation link works once; expired or invalid links do not confirm an address.
- [ ] Duplicate already-confirmed address does not create duplicate rows or spam another confirmation email.
- [ ] Unsubscribe link works, updates the suppression record, and is honoured by future marketing sends.
- [ ] Email delivery failure does not prevent a user from building and downloading a free roadmap; the UI shows a clear warning.
- [ ] Data access/deletion request route/contact exists and is staffed.
- [ ] Retention policy and process for pending, active and unsubscribed records are documented.

## D. Questionnaire functionality

### P0 — must pass
- [ ] Goal/position is the first question and accepts realistic long-form goals.
- [ ] Student branch works from start to finish.
- [ ] Student with no paid internship sees a plain-language definition and questions relevant to limited experience.
- [ ] Student with paid internship can explain their role, deliverables and measurable impact.
- [ ] Employee branch works from start to finish.
- [ ] Employee who wants a role change has questions relevant to current role, gaps and constraints.
- [ ] Employee who wants promotion/advancement has a route-specific question sequence.
- [ ] Every question can be answered using only keyboard controls.
- [ ] Required questions cannot be skipped accidentally; back/next and retry behaviour is clear.
- [ ] Answers remain available after transient network failure; user does not have to re-enter the whole interview.
- [ ] Follow-up count is bounded; current free release asks a short AI-generated follow-up set, never an unbounded interview.
- [ ] Multi-select, single-select and text inputs validate correctly.
- [ ] Inputs are capped; oversized or malformed API payloads are rejected.
- [ ] User-provided text is treated as data, not system instructions.
- [ ] No sensitive or unnecessary demographic questions appear in generated follow-ups.

## E. AI generation and roadmap quality

### P0 — must pass before using “personalised” or “free resources” in marketing
- [ ] Valid API key generates AI follow-up questions on the chosen stable model.
- [ ] Valid API key generates a complete roadmap with 3–6 coherent phases.
- [ ] The route begins with a concrete first milestone achievable within 30 days where realistic.
- [ ] Timeline accounts for weekly hours, current evidence, prerequisites, and chosen horizon.
- [ ] Student/no internship, student/with internship, employee/change role, and employee/advance scenarios were each tested manually.
- [ ] Roadmap has concrete deliverables and proof artifacts, not only a list of topics to study.
- [ ] Each phase has objectives, tasks, checkpoints and exit criteria.
- [ ] The roadmaps recommend one primary route, not a list of unranked options.
- [ ] Course/resource recommendations are genuinely free to access in the target region, or clearly label any limits; no paid course is represented as free.
- [ ] Links use HTTPS and allowed domains; every surfaced link has been clicked and checked by a human. The allow-list is not a substitute for link verification.
- [ ] No hallucinated dates, invented credentials, false guarantees, salary promises, or fabricated company-specific requirements.
- [ ] Generated text handles contradictory/incomplete answers with explicit assumptions instead of false certainty.
- [ ] The roadmap remains useful for an unusual goal outside software (or clearly limits scope rather than hallucinating expertise).
- [ ] JSON/schema failures and empty responses show a clear retry path.
- [ ] User can retry after a timeout without losing their answers.
- [ ] No provider error output or secret is sent to the browser.
- [ ] Prompt injection in a free-text answer cannot override the system instructions or make the model reveal hidden prompts/secrets.
- [ ] Token/output usage is recorded in provider dashboard and a rough cost/quota estimate is documented.
- [ ] The current model is confirmed in Google AI Studio immediately before release; quotas are verified for this project and account tier.

## F. Quota, failure handling and abuse prevention

### P0 — must pass
- [ ] Burst traffic does not exceed configured app concurrency or crash the server.
- [ ] App-level rate limiting returns 429 with a useful message and `Retry-After`.
- [ ] Gemini 429 / `RESOURCE_EXHAUSTED` shows an explicit wait/retry message; automatic repeated retries are not triggered.
- [ ] Gemini 401/403 is visible to operators without exposing key material.
- [ ] Gemini timeout produces a bounded error and retains user answers in the browser session.
- [ ] Request body limit is enforced (413) and malformed JSON returns 400.
- [ ] XSS attempts in goal, question and generated roadmap text render as text, not markup.
- [ ] Static route traversal cannot expose `server.mjs`, `.env`, `data`, SQL migrations, logs or test files.
- [ ] CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` headers are present.
- [ ] Verify actual client IP attribution through the production proxy before setting `TRUST_PROXY=true`.
- [ ] Turnstile secrets are not exposed to the client. Site key may be public; secret must remain server-side.
- [ ] Error monitoring does not capture full questionnaire answers, email tokens, or secrets.

## G. Downloaded interactive HTML

### P0 — must pass
- [ ] Download works after a free roadmap is built.
- [ ] Filename is readable, valid and safe for arbitrary goal strings.
- [ ] Open downloaded file directly from disk with network disconnected; core roadmap content and phase toggles still work.
- [ ] Task checkboxes update progress and persist where browser local-storage restrictions permit.
- [ ] Print / Save as PDF works on Chrome and Edge.
- [ ] Reset progress requires confirmation and behaves correctly.
- [ ] Save-a-copy action works.
- [ ] Roadmap text containing `<script>`, quotes, ampersands or HTML-looking text cannot execute as code.
- [ ] Resource links open with safe `rel` attributes and do not depend on a MILEZERO login.
- [ ] Export does not include the user's email address or private metadata unless a deliberate, documented decision is made.
- [ ] Downloaded artifact gives clear caveat that timeline and employment outcomes are not guaranteed.

## H. Privacy, legal and brand claims

### P0 — must pass
- [ ] Privacy and Terms pages are reviewed by someone competent for India and the markets to be targeted.
- [ ] Applicable Indian data protection, consumer protection, email and tax/payment requirements are evaluated with qualified advice.
- [ ] Provider list and data flow in the privacy notice match the real deployment.
- [ ] Google Gemini API terms/data-use treatment has been checked for the actual project/tier.
- [ ] Privacy contact/support address is monitored and deletion requests can be fulfilled.
- [ ] Marketing consent is recorded with the wording/version and timestamp.
- [ ] Claims like “best,” “verified,” “shortest,” “guaranteed,” “free course,” or “get hired” are removed unless actually substantiated.
- [ ] No fabricated user testimonials, placement rates, before/after claims or logos are used.
- [ ] Product name/domain/social handles do not conflict with a material trademark or existing product; search and legal check completed.
- [ ] A short public support/FAQ page explains free access, what AI does, what gets stored, and what it cannot promise.

## I. Payment and Premium

### **Not testable / not enabled in this release — must stay disabled**
- [ ] Premium remains locked server-side; a browser-set `mode=premium` does not unlock it.
- [ ] Before paid launch: provider account/KYC completed and product/pricing/refund policy approved.
- [ ] Before paid launch: server creates orders and records price/currency from trusted configuration.
- [ ] Before paid launch: payment callback signature and webhook signature are verified server-side.
- [ ] Before paid launch: duplicate events, pending payments, failed payments, refunds, disputes and replay attacks are handled.
- [ ] Before paid launch: entitlement is retrieved from server-side state, not from a browser boolean/token that can be forged.
- [ ] Before paid launch: wrong user/email cannot use another customer's entitlement.
- [ ] Before paid launch: receipt, terms, refund/cancellation route and support response process are tested.
- [ ] Before paid launch: sandbox test matrix and low-value live test pass. Do not announce a purchasable Premium plan before then.

## J. Manual launch rehearsal

### P0 — must pass
- [ ] A first-time user completes the flow on a mobile phone using mobile data.
- [ ] A first-time user completes the flow on desktop Chrome.
- [ ] A returning user rebuilds a route without email duplication or lost progress.
- [ ] One test person unfamiliar with the project understands the questions without coaching.
- [ ] One reviewer with relevant career/hiring experience scores the roadmap for specificity, plausibility and usefulness.
- [ ] A new deployment is performed from Git, not from a developer's local folder.
- [ ] A support/contact query is sent and receives a real reply.
- [ ] The team records the final production URL, current commit, model name, test result, known limitations and rollback version.
- [ ] Owner signs off: **GO** or **NO-GO**. If any P0 fails, do not announce or buy ads.

## After launch — daily for the first 7 days
- [ ] Check server errors, Gemini 429s, average/p95 generation time and quota usage.
- [ ] Check Resend delivery/bounce/complaint rate and remove invalid addresses correctly.
- [ ] Review a small, privacy-safe sample of roadmap quality (do not collect extra personal data just for evaluation).
- [ ] Check feedback and support requests; log each failure with severity and fix owner.
- [ ] Keep promotion modest until the product proves that users finish the questionnaire, download the roadmap and use it again.
