// Three new custom-system widget types: formula, roll-button, table.
// Run:  node scripts/browser.mjs scripts/checks/phaseB.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const TABS = [{ id: 'identity', label: 'customWidgets.tabCharacter', icon: 'user', visible: true }];

async function seed(page, baseUrl, widgets, customFields = {}) {
  const layout = widgets.map((w, i) => ({ id: w.id, tab: w.tab, col: w.col, order: i, visible: true, fullWidth: false }));
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('characterforge_layout_custom', JSON.stringify(${JSON.stringify(layout)}));
      localStorage.setItem('characterforge_tabs_custom', JSON.stringify(${JSON.stringify(TABS)}));
      localStorage.setItem('characterforge_char_chk', JSON.stringify(Object.assign({
        system: 'custom', charName: 'Check', tabs: ${JSON.stringify(TABS)},
        widgets: ${JSON.stringify(widgets)}, customFields: ${JSON.stringify(customFields)},
        inventory: [], log: [], conditions: [],
      })));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id: 'chk', name: 'Check', system: 'custom' }]));
      localStorage.setItem('characterforge_active', 'chk');
      localStorage.setItem('characterforge_active_system', 'custom');
    })()
  `);
  await page.goto(baseUrl);
}

const has = (page, sel) => page.eval(`!!document.querySelector(${JSON.stringify(sel)})`);

async function clickText(page, sel, re) {
  const ok = await page.eval(`
    (() => {
      const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(b => ${re}.test(b.textContent.trim()));
      if (el) { el.click(); return true; }
      return false;
    })()
  `);
  await page.wait(250);
  return ok;
}

async function enterEditMode(page) {
  await page.click('.hamburger-btn');
  await clickText(page, '.hmenu-item', '/modifica layout|edit layout/i');
  await page.wait(300);
}

export default async function (page, baseUrl) {
  // ── formula: resolves a customField, sums a plain +/- chain ────────────────
  await seed(page, baseUrl,
    [{ id: 'w_f', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Total', notation: '[LUCK]+2' } }],
    { LUCK: 3 });
  const formulaOk = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Total'));
      return !!card && card.textContent.includes('5');
    })()
  `);
  check('formula widget resolves [LUCK]+2 against customFields and sums to 5', formulaOk);

  // ── roll-button: resolves a customField, fires handleRoll ──────────────────
  await seed(page, baseUrl,
    [{ id: 'w_r', type: 'roll-button', tab: 'identity', col: 0, order: 0, config: { label: 'Attack', notation: '1d20+[LUCK]' } }],
    { LUCK: 3 });
  const clicked = await clickText(page, '.card button', '/1d20/');
  await page.wait(300);
  const toastOk = await has(page, '.toast.show');
  check('roll-button click resolves customFields and fires a roll', clicked && toastOk);

  // ── table: seeded rows render, add-row works in edit mode ──────────────────
  await seed(page, baseUrl,
    [{
      id: 'w_t', type: 'table', tab: 'identity', col: 0, order: 0, config: {
        label: 'Weapons', fieldId: 'WEAPONS',
        columns: [{ id: 'name', label: 'Name', type: 'text' }, { id: 'value', label: 'Value', type: 'number' }],
      },
    }],
    { WEAPONS: [{ name: 'Sword', value: 5 }] });
  const cells = await page.eval(`[...document.querySelectorAll('table input')].map(i => i.value)`);
  check('table widget renders seeded row values', cells.includes('Sword') && cells.includes('5'), JSON.stringify(cells));

  await enterEditMode(page);
  const rowsBefore = await page.eval(`document.querySelectorAll('table tbody tr').length`);
  await page.click('.card-title .icon-btn');
  const rowsAfter = await page.eval(`document.querySelectorAll('table tbody tr').length`);
  check('table add-row increments row count in edit mode', rowsAfter === rowsBefore + 1, `${rowsBefore} -> ${rowsAfter}`);

  // ── WidgetEditor: config form shown per new type ────────────────────────────
  await seed(page, baseUrl, [], {});
  await enterEditMode(page);
  await clickText(page, 'button', '/add widget|aggiungi widget/i');
  await page.wait(300);

  // Match on the label substring, not the full (locale-dependent) text.
  async function checkTypeForm(name, typeRe, hasFieldFn) {
    const clicked = await clickText(page, '.creator-modal .filter-chip', typeRe);
    await page.wait(150);
    const hasField = await hasFieldFn();
    const noConfigHint = await page.eval(`
      [...document.querySelectorAll('.creator-modal .hint-text')]
        .some(el => /no configuration needed|nessuna configurazione necessaria/i.test(el.textContent))
    `);
    check(`WidgetEditor shows the notation/column config for "${name}", not the no-config hint`,
      clicked && hasField && !noConfigHint);
  }

  await checkTypeForm('formula', '/Formula/', () => has(page, '.creator-modal textarea'));
  await checkTypeForm('roll-button', '/Roll Button|Bottone di tiro/', () => has(page, '.creator-modal textarea'));
  await checkTypeForm('table', '/Table|Tabella/', () => page.eval(`
    [...document.querySelectorAll('.creator-modal button')]
      .some(el => /Add column|Aggiungi colonna/.test(el.textContent))
  `));

  // ── pre-existing bug fix #1: "list" never had a settable Field ID ──────────
  const listFieldIdVisible = await has(page, '.creator-modal input[placeholder="HP"]');
  const listChipClicked = await clickText(page, '.creator-modal .filter-chip', '/^Lista$|^List$/');
  await page.wait(150);
  const listFieldIdVisibleAfterSelect = await has(page, '.creator-modal input[placeholder="HP"]');
  check('WidgetEditor now shows a Field ID input for "list"', listChipClicked && listFieldIdVisibleAfterSelect,
    `before selecting list: ${listFieldIdVisible}`);

  await page.eval(`
    (() => {
      const setNative = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const modal = document.querySelector('.creator-modal');
      const labelInput = [...modal.querySelectorAll('input')].find(i => i.placeholder && i.placeholder !== 'HP');
      const fieldIdInput = modal.querySelector('input[placeholder="HP"]');
      if (labelInput) setNative(labelInput, 'Items');
      if (fieldIdInput) setNative(fieldIdInput, 'ITEMS');
    })()
  `);
  await clickText(page, '.creator-modal button', '/Add to sheet|Aggiungi alla scheda/');
  await page.wait(300);

  const listResult = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Items'));
      if (!card) return { found: false };
      return { found: true, noHint: !/Set a Field ID|Imposta un Field ID/.test(card.textContent) };
    })()
  `);
  check('list widget created with a Field ID no longer shows the "set a field id" hint',
    listResult.found && listResult.noHint, JSON.stringify(listResult));

  if (listResult.found && listResult.noHint) {
    const itemsBefore = await page.eval(`document.querySelectorAll('.inventory-item').length`);
    await page.click('.card .icon-btn');
    const itemsAfter = await page.eval(`document.querySelectorAll('.inventory-item').length`);
    check('list widget add-item works once its Field ID is set', itemsAfter === itemsBefore + 1, `${itemsBefore} -> ${itemsAfter}`);
  }

  // ── pre-existing bug fix #2: widget-type picker chips fell back to "?" ─────
  await seed(page, baseUrl, [], {});
  await enterEditMode(page);
  await clickText(page, 'button', '/add widget|aggiungi widget/i');
  await page.wait(300);
  const chipTexts = await page.eval(`[...document.querySelectorAll('.creator-modal .filter-chip')].map(b => b.textContent.trim())`);
  const stillFallsBack = chipTexts.some(t => t.startsWith('?'));
  check('widget-type picker chips no longer fall back to "?"', chipTexts.length > 0 && !stillFallsBack, JSON.stringify(chipTexts));

  check('no console errors / uncaught exceptions during the scenario', page.errors().length === 0, JSON.stringify(page.errors()));

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
