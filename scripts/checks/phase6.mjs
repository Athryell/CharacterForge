// Widget rendering moved into the plugins. This walks every tab of every
// system and asserts each declared widget actually produced content — a move
// of 1371 lines can compile perfectly and still render an empty card.
// Run:  node scripts/browser.mjs scripts/checks/phase6.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// Pre-existing and unrelated to this phase: KeywordText renders an array of
// parsed fragments without keys, and React attributes the warning to whichever
// component owns it. Listed explicitly rather than filtered silently, so it
// stays visible until someone fixes Tooltip.jsx.
const KNOWN = [/unique "key" prop/];
function realErrors(page) {
  const all = page.errors();
  const known = all.filter(e => KNOWN.some(k => k.test(e)));
  if (known.length) console.log(`      (known pre-existing: ${known.length} React key warning(s))`);
  return all.filter(e => !KNOWN.some(k => k.test(e)));
}

const SEEDS = {
  dnd5e2024: {
    charName: 'Check', charClass: 'Wizard', charLevel: 5,
    abilities: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 8 },
    hpMax: 30, hpCurrent: 24,
    spells: [{ name: 'Magic Missile', level: 1, prepared: true }],
    weapons: [{ id: 'w1', name: 'Quarterstaff', dmg: '1d6' }],
    equipment: [{ name: 'Rope', weight: 5 }],
    features: [{ id: 'f1', name: 'Arcane Recovery', source: 'class' }],
    actions: [{ id: 'a1', name: 'Dash', type: 'action' }],
  },
  daggerheart: {
    charName: 'Check', charClass: 'Guardian', charLevel: 3,
    traits: { AGI: 1, STR: 2, FIN: 0, INS: 1, PRE: 0, KNO: -1 },
    hpMax: 8, hpCurrent: 6, hope: 3, stressCurrent: 1,
    experiences: [{ id: 'e1', name: 'Soldier', bonus: 2 }],
  },
  custom: {
    charName: 'Check',
    widgets: [
      { id: 'w_i', type: 'identity',  tab: 'identity',  col: 0, order: 0, config: { fields: ['name'] } },
      { id: 'w_b', type: 'bar',       tab: 'identity',  col: 1, order: 0, config: { label: 'HP', fieldId: 'HP' } },
      { id: 'w_n', type: 'notes',     tab: 'notes',     col: 0, order: 0, config: {} },
      { id: 'w_v', type: 'inventory', tab: 'inventory', col: 0, order: 0, config: {} },
    ],
    customFields: { HP: { current: 5, max: 10 } },
    inventory: [], log: [],
  },
};

async function seed(page, baseUrl, system) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
      const id = 'chk';
      const seed = Object.assign({ system: ${JSON.stringify(system)} }, ${JSON.stringify(SEEDS[system])});
      // A custom sheet keeps its widgets in state; the layout must agree or the
      // shells render empty with no error at all.
      if (seed.widgets) {
        localStorage.setItem('characterforge_layout_custom', JSON.stringify(
          seed.widgets.map((w, i) => ({
            id: w.id, tab: w.tab, col: w.col, order: w.order ?? i,
            visible: true, fullWidth: false,
          }))));
      }
      localStorage.setItem('characterforge_char_' + id, JSON.stringify(seed));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id, name: 'Check', system: ${JSON.stringify(system)} }]));
      localStorage.setItem('characterforge_active', id);
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
    })()
  `);
  await page.goto(baseUrl);
}

export default async function (page, baseUrl) {
  for (const system of ['dnd5e2024', 'daggerheart', 'custom']) {
    await seed(page, baseUrl, system);
    page.clearErrors();

    const tabs = await page.eval(
      `[...document.querySelectorAll('.tab-btn')].map(b => b.textContent.trim())`
    );
    check(`${system}: tabs render`, tabs.length > 0, JSON.stringify(tabs));

    let totalShells = 0;
    const empty = [];
    for (let i = 0; i < tabs.length; i++) {
      await page.eval(`document.querySelectorAll('.tab-btn')[${i}]?.click()`);
      await page.wait(450);
      const shells = await page.eval(`
        [...document.querySelectorAll('.widget-shell')].map(w => ({
          label: (w.querySelector('.widget-label')?.textContent || '').trim(),
          chars: (w.querySelector('.widget-content')?.textContent || '').trim().length,
          nodes: w.querySelectorAll('.widget-content *').length,
        }))
      `);
      totalShells += shells.length;
      // "rendered" means it put something in the DOM — an empty shell is exactly
      // what a botched move produces, and it throws no error.
      shells.forEach((s, j) => {
        if (s.nodes === 0 && s.chars === 0) empty.push(`${tabs[i]}#${j}`);
      });
    }

    check(`${system}: every widget renders content`, empty.length === 0,
      `${totalShells} widgets across ${tabs.length} tabs; empty: ${empty.join(', ') || 'none'}`);
    const errs = realErrors(page);
    check(`${system}: no console errors while walking tabs`,
      errs.length === 0, errs.slice(0, 2).join(' | '));

    await page.shot(`phase6-${system}`);
  }

  // dh-actions used to alias the D&D case; the copy must still work.
  await seed(page, baseUrl, 'daggerheart');
  await page.eval(`
    [...document.querySelectorAll('.tab-btn')].find(b => /combatt|combat/i.test(b.textContent))?.click()
  `);
  await page.wait(500);
  const hasActions = await page.eval(`
    [...document.querySelectorAll('.widget-shell')]
      .some(w => w.textContent.includes('Dash') || /azioni|actions/i.test(w.textContent))
  `);
  check('daggerheart actions widget still renders after de-aliasing', hasActions === true);

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
