// Layout and tabs moved into the plugins, storage keys unified.
// Run:  node scripts/browser.mjs scripts/checks/phase3.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// The custom system's default sheet, as CustomCreatorBridge would create it.
// Seeded directly so the check doesn't depend on walking the creator.
// Note: the tab BAR reads loadTabsForSystem(), not state.tabs — the two are kept
// in sync by commitTabs() but a fresh profile falls back to the plugin defaults.
const CUSTOM_STATE = {
  systemName: '',
  widgets: [
    { id: 'w_identity', type: 'identity', tab: 'identity', col: 0, order: 0,
      config: { fields: ['name'] } },
    { id: 'w_hp', type: 'bar', tab: 'identity', col: 1, order: 0,
      config: { label: 'HP', fieldId: 'HP', color: '--c-accent', icon: 'heart' } },
  ],
  customFields: { HP: { current: 10, max: 10 } },
  inventory: [], log: [], conditions: [],
};

async function seed(page, baseUrl, system, state) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      const id = 'chk_${system}';
      localStorage.setItem('characterforge_char_' + id, JSON.stringify(
        Object.assign({ system: ${JSON.stringify(system)} }, ${JSON.stringify(state)})));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id, name: 'Check', charClass: '', charLevel: 1, system: ${JSON.stringify(system)} }]));
      localStorage.setItem('characterforge_active', id);
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
      // start from a clean slate so leftover keys can't mask a regression
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
    })()
  `);
  await page.goto(baseUrl);
}

const TABS = `[...document.querySelectorAll('.tab-btn')].map(b => b.textContent.trim())`;

// i18next returns the key itself when it can't resolve one, so a missing key
// shows up as literal "identity.nameLabel" text rather than as any kind of error.
async function noRawI18nKeys(page, where) {
  const leaked = await page.eval(`
    (() => {
      const seen = new Set();
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const s = n.textContent.trim();
        if (/^[a-z][a-zA-Z]*(\\.[a-zA-Z][a-zA-Z0-9]*){1,3}$/.test(s)) seen.add(s);
      }
      // placeholders live on the attribute, not in a text node
      document.querySelectorAll('[placeholder]').forEach(el => {
        const s = el.getAttribute('placeholder').trim();
        if (/^[a-z][a-zA-Z]*(\\.[a-zA-Z][a-zA-Z0-9]*){1,3}$/.test(s)) seen.add(s);
      });
      return [...seen];
    })()
  `);
  check(`no unresolved i18n keys on screen (${where})`, leaked.length === 0, leaked.join(', '));
}

async function menuItem(page, re) {
  await page.click('.hamburger-btn');
  return page.eval(`
    (() => {
      const item = [...document.querySelectorAll('.hmenu-item')]
        .find(b => ${re}.test(b.textContent));
      if (!item) return false;
      item.click();
      return true;
    })()
  `);
}

export default async function (page, baseUrl) {
  // ── D&D ────────────────────────────────────────────────────────────────────
  await seed(page, baseUrl, 'dnd5e2024', { charName: 'Check', charLevel: 1 });
  check('no console errors (dnd5e2024)', page.errors().length === 0, page.errors().join(' | '));
  const dndTabs = await page.eval(TABS);
  check('D&D shows its 6 tabs', dndTabs.length === 6, JSON.stringify(dndTabs));

  // Nothing writes a layout until something saves, so drive a real save.
  // storageSuffix finally has a reader: D&D must stop using the bare legacy key.
  const reset = await menuItem(page, '/reset layout/i');
  check('reset layout reachable', reset);
  await page.wait(400);
  const keys = await page.eval(
    `Object.keys(localStorage).filter(k => k.startsWith('characterforge_layout')).sort()`
  );
  check('D&D writes a suffixed layout key, never the bare legacy one',
    keys.includes('characterforge_layout_dnd5e2024') && !keys.includes('characterforge_layout'),
    JSON.stringify(keys));
  await page.shot('phase3-dnd-sheet');

  // ── Daggerheart ────────────────────────────────────────────────────────────
  await seed(page, baseUrl, 'daggerheart', { charName: 'Check', charLevel: 1 });
  check('no console errors (daggerheart)', page.errors().length === 0, page.errors().join(' | '));
  const dhTabs = await page.eval(TABS);
  check('Daggerheart shows its 4 tabs (no spells, no log)',
    dhTabs.length === 4, JSON.stringify(dhTabs));

  // The bug this phase fixes: the move-to-tab menu listed D&D's tabs in EVERY
  // system, so a DH widget could be sent to a spells tab DH cannot render.
  const edit = await menuItem(page, '/modifica layout|edit layout/i');
  check('edit mode reachable', edit);
  await page.wait(400);

  const opened = await page.eval(`
    (() => {
      const btns = [...document.querySelectorAll('.widget-action-btn')];
      const btn = btns.find(b => b.nextElementSibling?.className === 'widget-tab-menu'
                              || /sposta|move/i.test(b.textContent));
      if (!btn) return { error: 'no move-to button; saw: ' + btns.map(b => b.textContent.trim()).join(', ') };
      btn.click();
      return true;
    })()
  `);
  if (opened?.error) {
    check('move-to-tab menu reachable', false, opened.error);
  } else {
    await page.wait(300);
    const offered = await page.eval(
      `[...document.querySelectorAll('.widget-tab-menu-item')].map(b => b.textContent.trim())`
    );
    check('move-to-tab offers only Daggerheart tabs',
      offered.length === 4 && !offered.some(t => /spell|magi|log/i.test(t)),
      JSON.stringify(offered));
    await page.shot('phase3-dh-movetotab');
  }

  // ── Custom ─────────────────────────────────────────────────────────────────
  await seed(page, baseUrl, 'custom', CUSTOM_STATE);
  check('no console errors (custom)', page.errors().length === 0, page.errors().join(' | '));
  const customTabs = await page.eval(TABS);
  check('custom shows its own 4 tabs', customTabs.length === 4, JSON.stringify(customTabs));
  // A tab id with no ICON_MAP entry leaks its fallback string into the label,
  // which is how 'identity' rendered as the literal word "user".
  check('no tab label leaks a raw icon name',
    !customTabs.some(t => /^(user|backpack|scroll|book-open)\b/.test(t)),
    JSON.stringify(customTabs));

  // Both widgets sit on the identity tab, one per column. This only renders if
  // activeTab starts on a tab the system actually has — it used to default to
  // 'main', which custom does not define, so the sheet opened blank.
  const shells = await page.eval(`document.querySelectorAll('.widget-shell').length`);
  check('custom opens on a real tab and renders both widgets', shells === 2, `${shells} shells`);
  await noRawI18nKeys(page, 'custom');
  await page.shot('phase3-custom-sheet');

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
