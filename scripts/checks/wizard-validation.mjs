// CLAUDE.md's multi-step wizard rule: Next is never disabled; a click with
// required fields missing sets nextAttempted=true and shows an inline warning
// (AlertTriangle) next to each missing field; the step only advances once
// canNext is satisfied. This walks the dnd5e2024 creator step by step and
// checks that rule against the real DOM, field by field — not just "does the
// wizard eventually produce a character."
// Run:  node scripts/browser.mjs scripts/checks/wizard-validation.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// Same pre-existing warning phase6.mjs/phase8.mjs already tolerate (unkeyed
// list items) — here it's DNDCharacterCreator's own step grids, unrelated to
// the Next/warning contract this file actually checks.
const KNOWN = [/unique "key" prop/];
const realErrors = page => page.errors().filter(e => !KNOWN.some(k => k.test(e)));

async function bootToCharacterSelect(page, baseUrl, system) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      localStorage.setItem('characterforge_lang', 'en');
      localStorage.setItem('characterforge_chars_index', '[]');
      localStorage.removeItem('characterforge_active');
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
    })()
  `);
  await page.goto(baseUrl);
}

const activeStepIndex = page => page.eval(`
  [...document.querySelectorAll('.creator-step')].findIndex(el => el.className.includes('active'))
`);

const hasVisibleWarning = page => page.eval(`
  !!document.querySelector('.creator-body svg') ||
  [...document.querySelectorAll('.creator-body *')]
    .some(el => el.children.length === 0 && /required/i.test(el.textContent))
`);

async function setInputValue(page, selector, value) {
  await page.eval(`
    (() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `);
}

async function clickCard(page, text) {
  return page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.creator-card')]
        .find(c => new RegExp(${JSON.stringify(text)}, 'i').test(c.textContent));
      if (!card) return false;
      card.click();
      return true;
    })()
  `);
}

const clickNext = page => page.click('.creator-footer .io-btn.primary');

export default async function (page, baseUrl) {
  await bootToCharacterSelect(page, baseUrl, 'dnd5e2024');
  check('character-select screen shows the empty state', await page.eval(
    `!!document.querySelector('.char-select-empty')`));

  await page.click('.char-select-footer .io-btn.primary');
  await page.wait(300);
  check('creator overlay opens', await page.eval(`!!document.querySelector('.creator-overlay')`));
  check('starts on step 0 (Identity)', await activeStepIndex(page) === 0);

  // ── Step 0: click Next with nothing filled ──────────────────────────────
  await clickNext(page);
  await page.wait(150);
  check('missing name blocks advance', await activeStepIndex(page) === 0);
  check('missing name shows a visible warning (AlertTriangle + "Required")',
    await hasVisibleWarning(page));
  check('missing name gives the input a warning border',
    await page.eval(`document.querySelector('.creator-body input')?.style.borderColor === 'var(--c-warn)'`));

  // Fill the name; canNextStep[0] still needs a species, so this alone
  // shouldn't be enough to advance, but the name-specific warning should clear.
  await setInputValue(page, '.creator-body input', 'Test Hero');
  check('warning clears once the name is filled', !(await hasVisibleWarning(page)));

  await clickNext(page);
  await page.wait(150);
  check('missing species still blocks advance (canNextStep requires charRace)',
    await activeStepIndex(page) === 0);
  check('missing species shows a visible warning', await hasVisibleWarning(page));

  const pickedSpecies = await clickCard(page, 'human');
  check('species card "Human" is selectable', pickedSpecies);
  await clickNext(page);
  await page.wait(150);
  check('name + species advances to step 1 (Class & Background)',
    await activeStepIndex(page) === 1);

  // ── Step 1: same story — class + background gate canNextStep[1] ────────
  await clickNext(page);
  await page.wait(150);
  check('missing class/background blocks advance', await activeStepIndex(page) === 1);
  check('missing class/background shows a visible warning', await hasVisibleWarning(page));

  const pickedClass = await clickCard(page, 'wizard');
  const pickedBg = await clickCard(page, 'sage');
  check('class card "Wizard" is selectable', pickedClass);
  check('background card "Sage" is selectable', pickedBg);
  await clickNext(page);
  await page.wait(150);
  check('class + background advances to step 2 (Stats)', await activeStepIndex(page) === 2);

  // ── Steps 2-3 (Stats, Proficiencies): unconditionally advanceable ───────
  await clickNext(page);
  await page.wait(150);
  check('step 2 has nothing required, advances to step 3', await activeStepIndex(page) === 3);
  await clickNext(page);
  await page.wait(150);
  check('step 3 has nothing required, advances to step 4 (Summary)',
    await activeStepIndex(page) === 4);

  // ── Step 4: Create — completes regardless of nextAttempted ─────────────
  const beforeIndex = await page.eval(`JSON.parse(localStorage.getItem('characterforge_chars_index') || '[]')`);
  await clickNext(page); // same footer slot, now labelled "Create"
  await page.wait(400);
  check('creator overlay closes on Create', !(await page.eval(`!!document.querySelector('.creator-overlay')`)));

  const afterIndex = await page.eval(`JSON.parse(localStorage.getItem('characterforge_chars_index') || '[]')`);
  check('a new character was persisted to the index',
    afterIndex.length === beforeIndex.length + 1,
    `before: ${beforeIndex.length}, after: ${afterIndex.length}`);
  const created = afterIndex[afterIndex.length - 1];
  check('new character has the entered name and chosen system',
    created?.name === 'Test Hero' && created?.system === 'dnd5e2024',
    JSON.stringify(created));

  check('no console errors during the wizard flow', realErrors(page).length === 0, realErrors(page).join(' | '));

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
