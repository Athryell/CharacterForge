// Verifies the reworked character-select screen: all characters show under an
// implicit "All" filter, per-system filter chips only appear once characters
// from more than one system exist, and "Create new character" now opens a
// system-picker step instead of relying on a persistent dropdown.
// Run:  node scripts/browser.mjs scripts/checks/char-select-screen.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const MIXED_INDEX = [
  { id: 'c1', name: 'Aldric',  system: 'dnd5e2024',  charClass: 'Fighter', charLevel: 3, lastSaved: new Date().toISOString() },
  { id: 'c2', name: 'Brenna',  system: 'dnd5e2024',  charClass: 'Wizard',  charLevel: 5, lastSaved: new Date().toISOString() },
  { id: 'c3', name: 'Corvax',  system: 'daggerheart', lastSaved: new Date().toISOString() },
];

function seed(index) {
  return `
    (() => {
      localStorage.clear();
      localStorage.setItem('characterforge_chars_index', JSON.stringify(${JSON.stringify(index)}));
      localStorage.setItem('characterforge_lang', 'en');
      localStorage.setItem('characterforge_onboarding_seen', '1');
    })()
  `;
}

export default async function (page, baseUrl) {
  // ── Mixed-system library: filter bar should appear ──────────────
  await page.goto(baseUrl);
  await page.eval(seed(MIXED_INDEX));
  await page.goto(baseUrl);
  await page.wait(500);
  page.clearErrors();

  const itemCountAll = await page.eval(`document.querySelectorAll('.char-select-item').length`);
  check('all 3 characters visible under the default "All" filter', itemCountAll === 3, String(itemCountAll));

  const chipLabels = await page.eval(`[...document.querySelectorAll('.filter-chip')].map(e => e.textContent.trim())`);
  check('filter bar shows an All chip plus one per represented system',
    chipLabels.length === 3 && chipLabels[0] === 'All',
    chipLabels.join(' | '));

  await page.click(`.filter-chip:nth-child(3)`); // second system chip → Daggerheart
  await page.wait(200);
  const itemCountFiltered = await page.eval(`document.querySelectorAll('.char-select-item').length`);
  const filteredName = await page.eval(`document.querySelector('.char-select-name')?.textContent`);
  check('selecting a system chip filters the list to that system', itemCountFiltered === 1 && filteredName === 'Corvax',
    `count=${itemCountFiltered} name=${filteredName}`);

  await page.click(`.filter-chip:nth-child(1)`); // back to All
  await page.wait(200);
  const itemCountBack = await page.eval(`document.querySelectorAll('.char-select-item').length`);
  check('clicking All restores the full list', itemCountBack === 3, String(itemCountBack));

  // ── Create flow: clicking Create opens a system picker, not a wizard directly ──
  await page.click('.char-select-footer .io-btn.primary');
  await page.wait(300);
  const pickerTitle = await page.eval(`document.querySelector('.creator-title')?.textContent`);
  const pickerCards = await page.eval(`document.querySelectorAll('.creator-overlay .char-select-item').length`);
  check('Create new character opens a system-picker step with one card per system',
    pickerTitle === 'Choose a system' && pickerCards === 3,
    `title=${pickerTitle} cards=${pickerCards}`);

  // Picking a system with a real wizard (D&D) should open that wizard, not create immediately.
  await page.click('.creator-overlay .char-select-item:nth-child(1)');
  await page.wait(300);
  const wizardSteps = await page.eval(`document.querySelectorAll('.creator-steps .creator-step').length`);
  check('picking D&D opens the D&D creator wizard', wizardSteps > 0, String(wizardSteps));

  await page.click('.creator-close');
  await page.wait(300);
  const backToSelect = await page.eval(`!!document.querySelector('.char-select-overlay')`);
  const countAfterCancel = await page.eval(`document.querySelectorAll('.char-select-item').length`);
  check('cancelling the wizard returns to the select screen with nothing created',
    backToSelect && countAfterCancel === 3, `overlay=${backToSelect} count=${countAfterCancel}`);

  // Picking Custom has no wizard — it should complete immediately into the sheet.
  await page.click('.char-select-footer .io-btn.primary');
  await page.wait(300);
  await page.click('.creator-overlay .char-select-item:nth-child(3)'); // Custom is last (order)
  await page.wait(500);
  const enteredSheet = await page.eval(`!!document.querySelector('.char-select-overlay')`);
  check('picking Custom (no wizard) completes immediately into the character sheet', enteredSheet === false);

  const errs = page.errors();
  check('no console errors during the flow', errs.length === 0, errs.slice(0, 3).join(' | '));

  // ── Single-system library: filter bar should be hidden ──────────
  await page.eval(seed(MIXED_INDEX.slice(0, 2))); // only D&D characters
  await page.goto(baseUrl);
  await page.wait(500);
  const singleSystemChips = await page.eval(`document.querySelectorAll('.filter-chip').length`);
  const singleSystemItems = await page.eval(`document.querySelectorAll('.char-select-item').length`);
  check('filter bar is hidden when every saved character belongs to one system',
    singleSystemChips === 0 && singleSystemItems === 2, `chips=${singleSystemChips} items=${singleSystemItems}`);

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
