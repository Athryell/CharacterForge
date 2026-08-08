// Verifies the custom system's new "toggle-list" widget (copy of D&D's
// "resources" widget minus the inspiration row): add an item, toggle a pip,
// pin it to the top bar, remove it.
// Run:  node scripts/browser.mjs scripts/checks/toggle-list.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const SEED = {
  system: 'custom',
  charName: 'Check',
  widgets: [
    { id: 'w_i', type: 'identity',    tab: 'identity', col: 0, order: 0, config: { fields: ['name'] } },
    { id: 'w_t', type: 'toggle-list', tab: 'identity', col: 1, order: 0, config: { label: 'My Resources' } },
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

  // The widget card renders with its configured label, not the raw i18n key.
  const titles = await page.eval(`[...document.querySelectorAll('.card-title')].map(e => e.textContent)`);
  check('toggle-list card renders with configured label', titles.some(t => t.includes('My Resources')), titles.join(' | '));

  // No inspiration row copied over.
  const hasInspiration = await page.eval(`!!document.querySelector('.resource-inspiration-row')`);
  check('no inspiration row on the custom toggle-list widget', !hasInspiration);

  // Enter edit mode on the widget (pencil icon-btn inside the card).
  await page.click('.card .icon-btn');
  await page.wait(200);

  await page.click('.resource-edit-panel .icon-btn');
  await page.wait(200);

  await page.eval(`
    (() => {
      const input = document.querySelector('.resource-add-form .field input[type="text"], .resource-add-form .field input:not([type])');
      const el = input || document.querySelector('.resource-add-form .field input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, 'Ki Points');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `);
  await page.wait(100);

  const pinCheckbox = await page.eval(`!!document.querySelector('.resource-add-form .resource-pin-label input[type="checkbox"]')`);
  check('add-form has a pin checkbox (no reset-on dropdown)', pinCheckbox);
  const resetDropdown = await page.eval(`!!document.querySelector('.resource-add-form select')`);
  check('add-form has no reset-on selector', !resetDropdown);

  await page.eval(`
    [...document.querySelectorAll('.resource-add-form .io-btn')]
      .find(b => b.textContent.includes('Add'))?.click()
  `);
  await page.wait(300);

  const errs = page.errors();
  check('no console errors after adding a resource', errs.length === 0, errs.slice(0, 3).join(' | '));

  const itemName = await page.eval(`document.querySelector('.resource-name')?.textContent || ''`);
  check('new resource item shows up', itemName.includes('Ki Points'), itemName);

  const pipCount = await page.eval(`document.querySelectorAll('.resource-pip-btn').length`);
  check('resource renders pip trackers', pipCount === 1, String(pipCount));

  // A freshly-added resource starts full (current === max), so its single pip
  // renders active; clicking it spends the point and turns it off again.
  const pipActiveBefore = await page.eval(`document.querySelector('.resource-pip-btn')?.classList.contains('active')`);
  check('a freshly-added resource starts full (pip active)', pipActiveBefore === true);

  await page.click('.resource-pips .resource-pip-btn');
  const pipActiveAfter = await page.eval(`document.querySelector('.resource-pip-btn')?.classList.contains('active')`);
  check('clicking an active pip spends it (toggles off)', pipActiveAfter === false);

  // Pin the item, exit widget edit mode, and confirm PinnedBar (a shared,
  // system-agnostic component) picks it up — this is the whole reason items
  // live in state.resources instead of a per-widget customFields entry.
  await page.click('.resource-pin-label input[type="checkbox"]');
  await page.wait(200);
  await page.click('.card .icon-btn.active'); // toggle widget out of edit mode
  await page.wait(200);
  const pinnedPipCount = await page.eval(`document.querySelectorAll('.pinned-bar .pin-pip').length`);
  check('pinned resource shows up in the shared PinnedBar', pinnedPipCount >= 1, String(pinnedPipCount));

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
