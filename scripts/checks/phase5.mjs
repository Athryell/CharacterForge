// useCharacter split into an agnostic core plus per-system rules.
// This is the persistence phase, so the checks are about state on disk.
// Run:  node scripts/browser.mjs scripts/checks/phase5.mjs

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

const readChar = page => page.eval(`JSON.parse(localStorage.getItem('characterforge_char_chk'))`);
const readIndex = page => page.eval(`JSON.parse(localStorage.getItem('characterforge_chars_index'))`);

// The rests live in PinnedBar, not the hamburger: a rest button opens a
// dropdown whose two items are short then long.
async function rest(page, which) {
  await page.click('.pinned-rest-btn');
  return page.eval(`
    (() => {
      const items = [...document.querySelectorAll('.rest-dropdown-item')];
      const i = items[${which === 'short' ? 0 : 1}];
      if (!i) return false; i.click(); return true;
    })()
  `);
}

export default async function (page, baseUrl) {
  // ── D&D derived values still come out right ───────────────────────────────
  // A level-5 Wizard: proficiency +3, DEX 14 -> initiative +2,
  // spell save DC = 8 + 3 + INT mod(16 -> +3) = 14.
  await seed(page, baseUrl, 'dnd5e2024', {
    charName: 'Check', charClass: 'Wizard', charLevel: 5,
    abilities: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 8 },
    hpMax: 30, hpCurrent: 20,
  });
  check('no console errors (dnd5e2024)', page.errors().length === 0, page.errors().join(' | '));

  const body = await page.eval(`document.body.textContent`);
  check('proficiency bonus renders as +3', /\+3/.test(body));
  check('spell save DC renders as 14', body.includes('14'));
  await page.shot('phase5-dnd-sheet');

  // ── Long rest goes through the plugin rule and reports via a descriptor ────
  const beforeRest = await readChar(page);
  const restOk = await rest(page, 'long');
  check('long rest button reachable', restOk === true);
  await page.wait(700);
  const afterRest = await readChar(page);
  if (afterRest) {
    check('long rest restores HP to max',
      afterRest.hpCurrent === afterRest.hpMax,
      `${beforeRest.hpCurrent} -> ${afterRest.hpCurrent} / ${afterRest.hpMax}`);
    check('long rest resets spell slots',
      Array.isArray(afterRest.spellSlots) && afterRest.spellSlots.every(s => s.used === 0),
      JSON.stringify(afterRest.spellSlots?.slice(0, 3)));
    check('long rest clears hit dice used', (afterRest.hitDiceUsed ?? 0) === 0);
  } else {
    check('long rest reachable', false, 'character disappeared from storage');
  }

  // The old shortRest returned a hardcoded Italian string that App discarded.
  // Assert the toast is the translated one, not that dead string.
  await rest(page, 'short');
  await page.wait(600);
  const toast = await page.eval(`document.querySelector('.toast')?.textContent ?? ''`);
  check('short rest toast is translated, not the dead Italian literal',
    toast.length > 0 && !toast.includes('Usa i dadi vita per recuperare HP'),
    JSON.stringify(toast.slice(0, 60)));
  await page.shot('phase5-shortrest-toast');

  // ── The contamination fix ─────────────────────────────────────────────────
  // useCharacter used to merge the D&D default state into EVERY character, so a
  // Daggerheart sheet carried spellSlots and saveProficiencies forever.
  await seed(page, baseUrl, 'daggerheart', {
    charName: 'DH', charClass: 'Guardian', charLevel: 2,
    traits: { AGI: 1, STR: 2, FIN: 0, INS: 1, PRE: 0, KNO: -1 },
  });
  check('no console errors (daggerheart)', page.errors().length === 0, page.errors().join(' | '));

  // A real mutation, not just a render: localStorage only reflects what the hook
  // persists, so reading it without writing would just echo the seed back.
  const wrote = await page.eval(`
    (() => {
      const tab = [...document.querySelectorAll('.tab-btn')]
        .find(b => /combatt|combat/i.test(b.textContent));
      if (!tab) return 'no combat tab';
      tab.click();
      return true;
    })()
  `);
  check('daggerheart combat tab reachable', wrote === true, String(wrote));
  await page.wait(500);
  await page.eval(`document.querySelector('.condition-chip')?.click()`);
  await page.wait(500);

  const dh = await readChar(page);
  const dndOnly = ['spellSlots', 'saveProficiencies', 'skillExpertise', 'deathSuccess', 'skillProficiencies'];
  const leaked = dndOnly.filter(k => dh && k in dh);
  check('Daggerheart character carries no D&D keys after a real write',
    leaked.length === 0 && dh?.conditions?.length > 0,
    `leaked: [${leaked.join(', ')}] conditions: ${JSON.stringify(dh?.conditions)}`);
  check('Daggerheart keeps its own state',
    dh?.traits?.STR === 2 && dh?.hope != null && dh?.stressMax != null,
    JSON.stringify({ STR: dh?.traits?.STR, hope: dh?.hope, stressMax: dh?.stressMax }));

  // ── The character index is no longer D&D-shaped ───────────────────────────
  await seed(page, baseUrl, 'custom', {
    charName: 'Cust',
    widgets: [{ id: 'w_a', type: 'notes', tab: 'notes', col: 0, order: 0, config: {} }],
    customFields: {},
  });
  await page.eval(`
    (() => {
      const input = document.querySelector('.widget-content input[type=text], .widget-content input:not([type])');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Renamed');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()
  `);
  await page.wait(500);
  const idx = await readIndex(page);
  const entry = idx?.[0] || {};
  check('custom index entry omits charClass/charLevel',
    !('charClass' in entry) && !('charLevel' in entry),
    JSON.stringify(entry));

  const cust = await readChar(page);
  const custLeaked = dndOnly.filter(k => cust && k in cust);
  check('custom character carries no D&D keys', custLeaked.length === 0, custLeaked.join(', '));
  await page.shot('phase5-custom-sheet');

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
