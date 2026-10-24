import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const htmlPath = new URL('../public/index.html', import.meta.url);
const html = await readFile(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
if (!scripts.length) {
  console.error('No inline JavaScript found in public/index.html.');
  process.exit(1);
}
const dir = await mkdtemp(path.join(tmpdir(), 'milezero-inline-check-'));
try {
  for (let i = 0; i < scripts.length; i++) {
    const file = path.join(dir, `inline-${i + 1}.js`);
    await writeFile(file, scripts[i]);
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout || `Inline script ${i + 1} failed syntax validation.`);
      process.exitCode = result.status || 1;
      break;
    }
  }
  if (!process.exitCode) console.log(`Validated ${scripts.length} inline JavaScript block(s) in public/index.html.`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
