// Verifies the custom system's "bar" widget: +/- steppers update current,
// the edit-toggle button reveals a max stepper (D&D HP-style), and the fill
// bar reflects the ratio.
// Run:  node scripts/browser.mjs scripts/checks/bar-widget.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const SEED = {
  system: 'custom',
  charName: 'Check',
  widgets: [
    { id: 'w_b', type: 'bar', tab: 'identity', col: 0, order: 0, config: { label: 'Stamina', fieldId: 'STAMINA', color: '--c-accent', icon: 'heart' } },
  ],
  customFields: {},
  inventory: [], log: [], resources: [],
};

export default async function (page, baseUrl) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
      const id = 'chk';
      localStorage.setItem('characterforge_layout_custom', JSON.stringify(
        ${JSON.stringify(SEED.widgets)}.map((w, i) => ({
          id: w.id, tab: w.tab, col: w.col, order: w.order ?? i,
          visible: true, fullWidth: false,
        }))));
      localStorage.setItem('characterforge_char_' + id, JSON.stringify(${JSON.stringify(SEED)}));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id, name: 'Check', system: 'custom' }]));
      localStorage.setItem('characterforge_active', id);
      localStorage.setItem('characterforge_active_system', 'custom');
      localStorage.setItem('characterforge_lang', 'en');
      localStorage.setItem('characterforge_onboarding_seen', '1');
    })()
  `);
  await page.goto(baseUrl);
  await page.wait(500);
  page.clearErrors();

  const titles = await page.eval(`[...document.querySelectorAll('.card-title')].map(e => e.textContent)`);
  check('bar widget card renders with configured label', titles.some(t => t.includes('Stamina')), titles.join(' | '));

  // Fresh field: current=0, max=0. Edit button should be visible even outside layout editMode.
  const editBtnVisible = await page.eval(`!!document.querySelector('.card .icon-btn')`);
  check('bar widget has its own edit-toggle button (no global layout edit needed)', editBtnVisible);

  // Enter widget edit mode and bump max to 10.
  await page.click('.card .icon-btn');
  await page.wait(200);
  const maxSteppers = await page.eval(`document.querySelectorAll('.hp-labeled-group .mod-btn').length`);
  check('editing mode reveals max +/- steppers', maxSteppers === 4, String(maxSteppers));

  for (let i = 0; i < 10; i++) {
    await page.click('.hp-labeled-group:nth-of-type(2) .mod-btn:last-child');
    await page.wait(30);
  }
  const maxAfter = await page.eval(`document.querySelectorAll('.hp-big')[1]?.value`);
  check('max stepper increments the field max', maxAfter === '10', String(maxAfter));

  // Exit edit mode.
  await page.click('.card .icon-btn.active');
  await page.wait(200);
  const maxInputReadOnly = await page.eval(`document.querySelectorAll('.hp-big')[1]?.readOnly`);
  check('max input goes read-only again outside edit mode', maxInputReadOnly === true);

  // Now the real bug repro: click + on current and confirm it actually updates.
  const currentBefore = await page.eval(`document.querySelectorAll('.hp-big')[0]?.value`);
  await page.click('.hp-labeled-group:nth-of-type(1) .mod-btn:last-child');
  await page.wait(150);
  const currentAfter = await page.eval(`document.querySelectorAll('.hp-big')[0]?.value`);
  check('clicking + updates current', currentBefore === '0' && currentAfter === '1', `${currentBefore} -> ${currentAfter}`);

  await page.click('.hp-labeled-group:nth-of-type(1) .mod-btn:first-child');
  await page.wait(150);
  const currentAfterMinus = await page.eval(`document.querySelectorAll('.hp-big')[0]?.value`);
  check('clicking - updates current back down', currentAfterMinus === '0', currentAfterMinus);

  const fillWidth = await page.eval(`document.querySelector('.hp-bar-fill')?.style.width`);
  check('fill bar reflects 0/10 ratio', fillWidth === '0%', fillWidth);

  const errs = page.errors();
  check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
