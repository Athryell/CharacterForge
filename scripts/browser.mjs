// Zero-dependency browser driver over the Chrome DevTools Protocol.
//
// Node 22+ ships WebSocket and fetch as globals, so this needs no packages —
// which matters here, because the project deliberately has no test tooling and
// we don't want to add 300MB of Playwright browsers to verify a refactor.
//
// Usage:  node scripts/browser.mjs <scenario.mjs> [baseUrl]
// A scenario default-exports  async (page) => { ... }  and can use:
//   page.goto(url)            navigate and wait for load
//   page.eval(fn | string)    run in the page, returns the value
//   page.click(selector)      click by CSS selector (throws if not found)
//   page.text(selector)       textContent of the first match
//   page.shot(name)           PNG into scripts/shots/<name>.png
//   page.errors()             console errors + page exceptions so far
//   page.wait(ms)

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const SHOT_DIR = resolve(process.cwd(), 'scripts/shots');

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  throw new Error('No Chrome or Edge binary found');
}

async function waitFor(fn, { timeout = 30000, interval = 250, what = 'condition' } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    try { const v = await fn(); if (v) return v; } catch { /* keep polling */ }
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${what}`);
    await new Promise(r => setTimeout(r, interval));
  }
}

export async function launch({ port = 9222, headless = true } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'cf-chrome-'));
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--disable-dev-shm-usage',
    '--window-size=1400,1000',
    'about:blank',
  ];
  if (headless) args.unshift('--headless=new');

  const proc = spawn(findChrome(), args, { stdio: 'ignore', detached: false });

  const target = await waitFor(async () => {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    const list = await res.json();
    return list.find(t => t.type === 'page');
  }, { what: 'Chrome debugging endpoint' });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });

  let nextId = 0;
  const pending = new Map();
  const events  = [];
  const errors  = [];

  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id != null) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (!p) return;
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      return;
    }
    events.push(msg);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push('console.error: ' + msg.params.args.map(a => a.value ?? a.description ?? '?').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push('uncaught: ' + (d.exception?.description || d.text));
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // A fresh profile has empty localStorage, so the onboarding modal covers the
  // whole app. Assertions against portalled elements still pass, but every
  // screenshot would just show the tour. Seed the "seen" flag before first load.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('characterforge_onboarding_seen', '1'); } catch (e) {}`,
  });

  const page = {
    send,
    errors: () => [...errors],
    clearErrors: () => { errors.length = 0; },
    wait: ms => new Promise(r => setTimeout(r, ms)),

    async goto(url) {
      const before = events.length;
      await send('Page.navigate', { url });
      await waitFor(
        () => events.slice(before).some(e => e.method === 'Page.loadEventFired'),
        { what: `load of ${url}` }
      );
      // React needs a tick past load to paint.
      await page.wait(600);
    },

    async eval(fnOrExpr) {
      const expression = typeof fnOrExpr === 'function'
        ? `(${fnOrExpr.toString()})()`
        : fnOrExpr;
      const r = await send('Runtime.evaluate', {
        expression, returnByValue: true, awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      }
      return r.result.value;
    },

    async click(selector) {
      const ok = await page.eval(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        el.click();
        return true;
      })()`);
      if (!ok) throw new Error(`click: no element matches ${selector}`);
      await page.wait(350);
    },

    text: selector => page.eval(
      `document.querySelector(${JSON.stringify(selector)})?.textContent ?? null`
    ),

    async shot(name) {
      mkdirSync(SHOT_DIR, { recursive: true });
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const file = join(SHOT_DIR, `${name}.png`);
      writeFileSync(file, Buffer.from(data, 'base64'));
      return file;
    },
  };

  const close = () => {
    try { ws.close(); } catch {}
    try { proc.kill(); } catch {}
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  };

  return { page, close };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
// pathToFileURL, not string concatenation: on Windows import.meta.url is
// file:///C:/... with three slashes, so a hand-built file://C:/... never matches
// and the whole CLI block silently no-ops into a passing exit code.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const scenarioPath = resolve(process.cwd(), process.argv[2]);
  const baseUrl = process.argv[3] || 'http://localhost:3000';

  const { page, close } = await launch();
  let failed = false;
  try {
    const { default: scenario } = await import(pathToFileURL(scenarioPath).href);
    await scenario(page, baseUrl);
  } catch (e) {
    failed = true;
    console.error('\nSCENARIO FAILED:', e.message);
  } finally {
    close();
  }
  // Set the code and let Node drain stdout and exit on its own. Calling
  // process.exit() here truncates piped output on Windows — the run looks
  // silent and passing whether or not it actually was.
  process.exitCode = failed ? 1 : 0;
}
