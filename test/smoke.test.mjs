import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 43100 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;
let child;

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`${BASE}/api/health`);
      if (response.ok) return await response.json();
    } catch {}
    await delay(150);
  }
  throw new Error('MILEZERO test server failed to start.');
}

test('MILEZERO HTTP smoke checks', async t => {
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'test', PORT: String(PORT), GEMINI_API_KEY: '', SUPABASE_URL: '', SUPABASE_SECRET_KEY: '', RESEND_API_KEY: '', RESEND_FROM_EMAIL: '', TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logs = '';
  child.stdout.on('data', d => { logs += d.toString(); });
  child.stderr.on('data', d => { logs += d.toString(); });
  t.after(() => { if (child && child.exitCode === null) child.kill('SIGTERM'); });

  const health = await waitForServer();
  assert.equal(health.ok, true);
  assert.equal(health.aiEnabled, false);
  assert.equal(health.premiumEnabled, false, 'premium must remain off until payment verification exists');
  assert.equal('apiKey' in health, false, 'health must never reveal secrets');

  const home = await fetch(BASE);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /MILEZERO/);
  assert.match(home.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');

  const privacy = await fetch(`${BASE}/privacy.html`);
  assert.equal(privacy.status, 200);
  assert.match(await privacy.text(), /Privacy/);
  const terms = await fetch(`${BASE}/terms.html`);
  assert.equal(terms.status, 200);
  assert.match(await terms.text(), /Terms/);

  const invalidEmail = await fetch(`${BASE}/api/subscribe`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'not-an-email', consent: true })
  });
  assert.equal(invalidEmail.status, 400);

  const noConsent = await fetch(`${BASE}/api/subscribe`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'reader@example.com', consent: false })
  });
  assert.equal(noConsent.status, 400);

  const hiddenServerFile = await fetch(`${BASE}/server.mjs`);
  assert.equal(hiddenServerFile.status, 404, 'server source must not be served as a static asset');

  const method = await fetch(`${BASE}/api/health`, { method: 'POST' });
  assert.equal(method.status, 405);

  child.kill('SIGTERM');
  await once(child, 'exit');
  assert.match(logs, /MILEZERO running/);
});
