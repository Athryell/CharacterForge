// Custom-system widget types: formula (incl. the active/rollable toggle).
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
  // ── formula: boxes are stat-grid style — resolves a customField, sums a plain +/- chain ──
  await seed(page, baseUrl,
    [{ id: 'w_f', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Total', boxes: [{ _id: 'b1', label: 'Sum', notation: '[LUCK]+2', active: false }] } } ],
    { LUCK: 3 });
  const formulaOk = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Total'));
      return !!card && card.textContent.includes('5');
    })()
  `);
  check('formula box resolves [LUCK]+2 against customFields and sums to 5', formulaOk);

  // ── formula, inactive box: shows the resolved value but is not clickable ───
  await seed(page, baseUrl,
    [{ id: 'w_r', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Attack', boxes: [{ _id: 'b1', label: 'Hit', notation: '1d20+[LUCK]', active: false }] } }],
    { LUCK: 3 });
  const inactiveClickable = await has(page, '.card .clickable-stat');
  check('inactive formula box is not clickable', !inactiveClickable);

  // ── formula, active box + dice notation: clickable, fires handleRoll ───────
  await seed(page, baseUrl,
    [{ id: 'w_r', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Attack', boxes: [{ _id: 'b1', label: 'Hit', notation: '1d20+[LUCK]', active: true }] } }],
    { LUCK: 3 });
  const clicked = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Attack'));
      const target = card?.querySelector('.clickable-stat');
      if (target) { target.click(); return true; }
      return false;
    })()
  `);
  await page.wait(300);
  const toastOk = await has(page, '.toast.show');
  check('active formula box with dice notation is clickable and fires a roll', clicked && toastOk);

  // ── formula: boxes are added/removed inline via the card's own pencil toggle,
  // independent of "edit layout" mode ─────────────────────────────────────────
  await seed(page, baseUrl,
    [{ id: 'w_i', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Inline', boxes: [] } }],
    {});
  const inlineCard = () => `[...document.querySelectorAll('.card')].find(c => c.querySelector('.card-title')?.textContent.includes('Inline'))`;
  await page.eval(`${inlineCard()}.querySelector('.card-title .icon-btn').click()`);
  await page.wait(200);
  const addBtnOk = await page.eval(`
    (() => {
      const card = ${inlineCard()};
      return [...card.querySelectorAll('button')].some(b => /add formula|aggiungi formula/i.test(b.textContent));
    })()
  `);
  check('formula card pencil toggle reveals the inline "add formula" box control', addBtnOk);
  await page.eval(`
    (() => {
      const card = ${inlineCard()};
      const btn = [...card.querySelectorAll('button')].find(b => /add formula|aggiungi formula/i.test(b.textContent));
      btn.click();
    })()
  `);
  await page.wait(200);
  const boxAdded = await page.eval(`${inlineCard()}.querySelectorAll('.ability-box').length === 1`);
  check('clicking "add formula" adds one inline box', boxAdded);
  await page.eval(`${inlineCard()}.querySelector('.ability-box button').click()`);
  await page.wait(200);
  const boxRemoved = await page.eval(`${inlineCard()}.querySelectorAll('.ability-box').length === 0`);
  check("the box's own ✕ removes it", boxRemoved);

  // ── formula: "edit layout" mode only lets you rename the widget, boxes are
  // untouched by that modal ───────────────────────────────────────────────────
  await seed(page, baseUrl,
    [{ id: 'w_e', type: 'formula', tab: 'identity', col: 0, order: 0, config: { label: 'Renamed', boxes: [{ _id: 'b1', label: 'Kept', notation: '1d6', active: true }] } }],
    {});
  await enterEditMode(page);
  await page.eval(`
    (() => {
      const shell = [...document.querySelectorAll('.widget-shell')]
        .find(s => s.querySelector('.widget-content .card-title')?.textContent.includes('Renamed'));
      [...shell.querySelectorAll('.widget-action-btn')].find(b => /edit widget|modifica widget/i.test(b.textContent)).click();
    })()
  `);
  await page.wait(300);
  const editModalHasNoNotationField = !(await has(page, '.creator-modal textarea'));
  const editModalHasOnlyLabelField = await page.eval(`document.querySelectorAll('.creator-modal input').length === 1`);
  check('edit-layout "Edit widget" modal for formula shows only the name field, no box/notation editing',
    editModalHasNoNotationField && editModalHasOnlyLabelField);
  await page.eval(`
    (() => {
      const input = document.querySelector('.creator-modal input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Renamed 2');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `);
  await clickText(page, '.creator-modal button', '/Save|Salva/');
  await page.wait(300);
  const renamedResult = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Renamed 2'));
      return { found: !!card, keptBox: !!card && card.textContent.includes('Kept') };
    })()
  `);
  check('renaming a formula widget via "Edit widget" preserves its boxes', renamedResult.found && renamedResult.keptBox, JSON.stringify(renamedResult));

  // ── WidgetEditor: config form shown per new type ────────────────────────────
  await seed(page, baseUrl, [], {});
  await enterEditMode(page);
  await clickText(page, 'button', '/add widget|aggiungi widget/i');
  await page.wait(300);

  // formula no longer takes a notation in this modal — boxes are inline-only —
  // so it gets its own check: a required label input, no notation textarea.
  await clickText(page, '.creator-modal .filter-chip', '/Formula/');
  await page.wait(150);
  const formulaFormOk = await page.eval(`document.querySelectorAll('.creator-modal input').length === 1`)
    && !(await has(page, '.creator-modal textarea'));
  check('WidgetEditor shows only a name field for "formula", no notation/box config', formulaFormOk);

  // ── pre-existing bug fix #1: "list" (now "features") never had a settable Field ID ──
  const featuresFieldIdVisible = await has(page, '.creator-modal input[placeholder="HP"]');
  const featuresChipClicked = await clickText(page, '.creator-modal .filter-chip', '/^Features$|^Feature$/');
  await page.wait(150);
  const featuresFieldIdVisibleAfterSelect = await has(page, '.creator-modal input[placeholder="HP"]');
  check('WidgetEditor now shows a Field ID input for "features"', featuresChipClicked && featuresFieldIdVisibleAfterSelect,
    `before selecting features: ${featuresFieldIdVisible}`);

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

  const featuresResult = await page.eval(`
    (() => {
      const card = [...document.querySelectorAll('.card')]
        .find(c => c.querySelector('.card-title')?.textContent.includes('Items'));
      if (!card) return { found: false };
      return { found: true, noHint: !/Set a Field ID|Imposta un Field ID/.test(card.textContent) };
    })()
  `);
  check('features widget created with a Field ID no longer shows the "set a field id" hint',
    featuresResult.found && featuresResult.noHint, JSON.stringify(featuresResult));

  if (featuresResult.found && featuresResult.noHint) {
    const itemsBefore = await page.eval(`document.querySelectorAll('.feature-item').length`);
    await page.click('.card .card-title .icon-btn');
    await page.wait(150);
    await page.eval(`
      (() => {
        const setNative = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const nameInput = document.querySelector('.weapon-add-panel input');
        if (nameInput) setNative(nameInput, 'Second Wind');
      })()
    `);
    await clickText(page, '.weapon-add-panel button', '/Add|Aggiungi/');
    await page.wait(200);
    const itemsAfter = await page.eval(`document.querySelectorAll('.feature-item').length`);
    check('features widget add-item works once its Field ID is set', itemsAfter === itemsBefore + 1, `${itemsBefore} -> ${itemsAfter}`);
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
