// Capabilities drive the UI: the core no longer names a system.
// Run:  node scripts/browser.mjs scripts/checks/phase7.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

async function seed(page, baseUrl, system, state) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('characterforge_char_chk', JSON.stringify(
        Object.assign({ system: ${JSON.stringify(system)} }, ${JSON.stringify(state)})));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id: 'chk', name: 'Check', system: ${JSON.stringify(system)} }]));
      localStorage.setItem('characterforge_active', 'chk');
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
    })()
  `);
  await page.goto(baseUrl);
}

const has = (page, sel) => page.eval(`!!document.querySelector(${JSON.stringify(sel)})`);

export default async function (page, baseUrl) {
  // capabilities.rests — only D&D declares it
  await seed(page, baseUrl, 'dnd5e2024', { charName: 'C', charClass: 'Wizard', charLevel: 3, hpMax: 20, hpCurrent: 20 });
  check('D&D shows the rest control (capabilities.rests)', await has(page, '.pinned-rest-btn'));

  await seed(page, baseUrl, 'daggerheart', { charName: 'C', charClass: 'Guardian', charLevel: 2, traits: { AGI: 1, STR: 2, FIN: 0, INS: 0, PRE: 0, KNO: 0 } });
  check('Daggerheart hides the rest control', !(await has(page, '.pinned-rest-btn')));

  await seed(page, baseUrl, 'custom', { charName: 'C', widgets: [], customFields: {} });
  check('custom hides the rest control', !(await has(page, '.pinned-rest-btn')));

  // capabilities.editableTabs / userDefinedWidgets — only custom declares them
  async function editModeAffordances() {
    await page.click('.hamburger-btn');
    await page.eval(`
      [...document.querySelectorAll('.hmenu-item')]
        .find(b => /modifica layout|edit layout/i.test(b.textContent))?.click()
    `);
    await page.wait(500);
    return page.eval(`({
      addTab:    [...document.querySelectorAll('button')].some(b => /aggiungi tab|add tab/i.test(b.textContent)),
      addWidget: [...document.querySelectorAll('button')].some(b => /aggiungi widget|add widget/i.test(b.textContent)),
    })`);
  }

  const custom = await editModeAffordances();
  check('custom offers add-tab and add-widget in edit mode',
    custom.addTab && custom.addWidget, JSON.stringify(custom));

  await seed(page, baseUrl, 'dnd5e2024', { charName: 'C', charClass: 'Wizard', charLevel: 3 });
  const dnd = await editModeAffordances();
  check('D&D offers neither (capabilities off)',
    !dnd.addTab && !dnd.addWidget, JSON.stringify(dnd));

  // NOT asserted here: capabilities.scoresAreModifiers. Tooltip now passes it
  // into resolveCountFormula so a Daggerheart trait of 4 gives 4 pips instead of
  // Math.floor((4 - 10) / 2) clamped to 1 — but the counter pips only render
  // once an action row is expanded, and driving that reliably was not worth the
  // complexity. Verified by reading the path, not by this harness.

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
