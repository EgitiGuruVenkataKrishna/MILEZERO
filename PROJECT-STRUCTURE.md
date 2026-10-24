# Project structure

```text
milezero-product/
├── public/
│   ├── index.html                 # Main responsive product and questionnaire UI
│   ├── privacy.html               # Privacy notice template; replace placeholders
│   └── terms.html                 # Terms template; replace placeholders
├── server.mjs                     # Node HTTP server, Gemini, email signup, Turnstile and security guards
├── supabase/migrations/
│   └── 001_waitlist_subscribers.sql
├── examples/
│   └── AI-Engineer-demo-roadmap.html
├── scripts/
│   └── check-inline.mjs
├── test/
│   └── smoke.test.mjs
├── docs/previews/                 # Screenshots from prototype direction
├── .env.example                   # Variable names only; no secret values
├── Dockerfile
├── render.yaml
├── TEST-CHECKLIST.md
├── LAUNCH-INPUTS.md
├── QA-RESULTS.md
└── README.md
```

Node's built-in APIs are used so there is no npm dependency supply chain in the runtime. Production data integrations are server-side. Roadmaps stay in the user's browser/downloaded artifact; the subscriber table contains email consent status only.
