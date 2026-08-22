// Verifies the three micro-interaction additions: toast enter/exit animation,
// :active press-scale on action buttons, and the sliding tab indicator.
// Run:  node scripts/browser.mjs scripts/checks/micro-interactions.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

async function seed(page, baseUrl, system, state) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      const id = 'chk';
      localStorage.setItem('characterforge_char_' + id, JSON.stringify(
        Object.assign({ system: ${JSON.stringify(system)} }, ${JSON.stringify(state)})));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id, name: 'Check', system: ${JSON.stringify(system)} }]));
      localStorage.setItem('characterforge_active', id);
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
    })()
  `);
  await page.goto(baseUrl);
}

// Same trigger phase5.mjs uses: the rest button opens a dropdown whose two
// items are short then long — short rest is the simplest system-agnostic
// showToast(msg) call (no action button attached).
async function shortRest(page) {
  await page.click('.pinned-rest-btn');
  return page.eval(`
    (() => {
      const item = document.querySelectorAll('.rest-dropdown-item')[0];
      if (!item) return false; item.click(); return true;
    })()
  `);
}

const rectOf = (page, sel) => page.eval(`
  (() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null; })()
`);

const near = (a, b, tol = 2) => a != null && b != null && Math.abs(a - b) <= tol;

export default async function (page, baseUrl) {
  await seed(page, baseUrl, 'dnd5e2024', {
    charName: 'Check', charClass: 'Wizard', charLevel: 5,
    abilities: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 8 },
    hpMax: 30, hpCurrent: 20,
  });
  check('no console errors on boot', page.errors().length === 0, page.errors().join(' | '));

  // ── 1. Tab sliding indicator ─────────────────────────────────────────────
  const indicatorRect0 = await rectOf(page, '.tab-indicator');
  const activeBtnRect0 = await rectOf(page, '.tab-btn.active');
  check('indicator sits under the initially active tab',
    near(indicatorRect0?.left, activeBtnRect0?.left) && near(indicatorRect0?.width, activeBtnRect0?.width),
    JSON.stringify({ indicatorRect0, activeBtnRect0 }));

  // Switch to the "combat" tab (second .tab-btn) and let the .2s transition finish.
  const switched = await page.eval(`
    (() => {
      const btns = [...document.querySelectorAll('.tab-btn')].filter(b => !b.closest('.edit-mode'));
      const combat = btns.find(b => b.textContent.includes('Combat')) || btns[1];
      if (!combat) return false; combat.click(); return true;
    })()
  `);
  check('clicked a second tab', switched);
  await page.wait(300);

  const indicatorRect1 = await rectOf(page, '.tab-indicator');
  const activeBtnRect1 = await rectOf(page, '.tab-btn.active');
  check('indicator follows the newly active tab after switching',
    near(indicatorRect1?.left, activeBtnRect1?.left) && near(indicatorRect1?.width, activeBtnRect1?.width),
    JSON.stringify({ indicatorRect1, activeBtnRect1 }));
  check('indicator actually moved (not stuck on the first tab)',
    !near(indicatorRect1?.left, indicatorRect0?.left, 0.5),
    JSON.stringify({ before: indicatorRect0?.left, after: indicatorRect1?.left }));
  await page.shot('micro-tab-indicator');

  // ── 2. Toast enter/exit animation ────────────────────────────────────────
  page.clearErrors();
  const restOk = await shortRest(page);
  check('short rest reachable (toast trigger)', restOk === true);
  await page.wait(120); // well past the requestAnimationFrame flip, well short of the 2.5s auto-hide
  const toastShown = await page.eval(`document.querySelector('.toast.show') != null`);
  check('toast is mounted and carries the .show class shortly after triggering', toastShown);
  const toastStyle = await page.eval(`
    (() => { const el = document.querySelector('.toast');
      if (!el) return null; const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: s.transform }; })()
  `);
  check('toast reaches full opacity (real enter transition, not instant-mount dead CSS)',
    toastStyle?.opacity === '1', JSON.stringify(toastStyle));

  // Short rest reports via a descriptor with a hintKey, so runRest() takes the
  // action-button branch with its own durationMs (10000ms) rather than the
  // 2500ms default for a plain showToast(msg) call.
  await page.wait(10200); // durationMs (10000ms) + the 200ms exit fade
  const toastGone = await page.eval(`document.querySelector('.toast') == null`);
  check('toast unmounts after its exit fade completes', toastGone);
  check('no console errors from the toast lifecycle', page.errors().length === 0, page.errors().join(' | '));

  // ── 3. Button press-scale (:active) — verified statically: page.click()
  // goes through Element.click(), which never enters the browser's real
  // :active pseudo-class chain, so there's no reliable way to catch the
  // transient state through this driver. Confirm the rule itself is wired
  // up instead.
  const activeRule = await page.eval(`
    (() => {
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules) {
          if (r.selectorText && r.selectorText.includes('.io-btn:active') && r.style.transform) {
            return r.selectorText + ' { transform: ' + r.style.transform + ' }';
          }
        }
      }
      return null;
    })()
  `);
  check('.io-btn:active press-scale rule is present in the stylesheet', !!activeRule, activeRule || '');

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
