// i18n moved into the plugins: ui.json split into core chrome + a per-system
// bundle (dh.*, customWidgets.*, and the untagged D&D vocabulary), merged back
// together in src/i18n/index.js. This is the check the phase's own writeup
// asks for: every language, every system, every tab, no raw key leaking
// through — a wrong bucket boundary shows up as literal "combat.ac" text, not
// as a build error or a console warning.
// Run:  node scripts/browser.mjs scripts/checks/phase8.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// Same pre-existing warning phase6.mjs already tolerates (unkeyed list items in
// InventoryManager/Tooltip) — unrelated to where a translation string lives.
const KNOWN = [/unique "key" prop/];
function realErrors(page) {
  return page.errors().filter(e => !KNOWN.some(k => k.test(e)));
}

const SEEDS = {
  dnd5e2024: {
    charName: 'Check', charClass: 'Wizard', charLevel: 5, charRace: 'human',
    charBackground: 'sage', charAlignment: 'True Neutral', charSubclass: 'Evocation',
    abilities: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 8 },
    hpMax: 30, hpCurrent: 24, concentrating: true,
    spells: [{ name: 'Magic Missile', level: 1, prepared: true }],
    weapons: [{ id: 'w1', name: 'Quarterstaff', dmg: '1d6' }],
    armors: [{ id: 'ar1', name: 'Leather', type: 'light' }],
    equipment: [{ name: 'Rope', weight: 5 }],
    features: [{ id: 'f1', name: 'Arcane Recovery', source: 'class' }],
    actions: [{ id: 'a1', name: 'Dash', type: 'action' }],
    resources: [{ id: 'r1', name: 'arcane_recovery', current: 1, max: 1 }],
    exhaustion: 1,
  },
  daggerheart: {
    charName: 'Check', charClass: 'Guardian', charLevel: 3,
    traits: { AGI: 1, STR: 2, FIN: 0, INS: 1, PRE: 0, KNO: -1 },
    hpMax: 8, hpCurrent: 6, hope: 3, stressCurrent: 1,
    ancestry: 'Human', community: 'Loreborn',
    weapons: [{ id: 'w1', name: 'Longsword', trait: 'STR' }],
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

const RAW_KEY = /^[a-z][a-zA-Z]*(\.[a-zA-Z][a-zA-Z0-9]*){1,4}$/;

async function noRawI18nKeys(page) {
  return page.eval(`
    (() => {
      const seen = new Set();
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const s = n.textContent.trim();
        if (${RAW_KEY}.test(s)) seen.add(s);
      }
      document.querySelectorAll('[placeholder]').forEach(el => {
        const s = el.getAttribute('placeholder').trim();
        if (${RAW_KEY}.test(s)) seen.add(s);
      });
      return [...seen];
    })()
  `);
}

async function seed(page, baseUrl, system, lang) {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('characterforge_layout') || k.startsWith('characterforge_tabs'))
        .forEach(k => localStorage.removeItem(k));
      const id = 'chk';
      const seed = Object.assign({ system: ${JSON.stringify(system)} }, ${JSON.stringify(SEEDS[system])});
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
      localStorage.setItem('characterforge_lang', ${JSON.stringify(lang)});
      localStorage.setItem('characterforge_onboarding_seen', '1');
    })()
  `);
  await page.goto(baseUrl);
  await page.wait(300);
}

export default async function (page, baseUrl) {
  const LANGS = ['it', 'en', 'de', 'fr', 'es'];
  const SYSTEMS = ['dnd5e2024', 'daggerheart', 'custom'];

  for (const lang of LANGS) {
    for (const system of SYSTEMS) {
      await seed(page, baseUrl, system, lang);
      page.clearErrors();

      const tabs = await page.eval(
        `[...document.querySelectorAll('.tab-btn')].map((_, i) => i)`
      );

      const leaked = new Set();
      for (let i = 0; i < tabs.length; i++) {
        await page.eval(`document.querySelectorAll('.tab-btn')[${i}]?.click()`);
        await page.wait(300);
        (await noRawI18nKeys(page)).forEach(k => leaked.add(k));
      }

      // Also pop the hamburger menu — settings/menu strings live outside any tab.
      await page.click('.hamburger-btn');
      await page.wait(200);
      (await noRawI18nKeys(page)).forEach(k => leaked.add(k));
      await page.eval(`document.body.click()`);

      const errs = realErrors(page);
      check(`${lang}/${system}: no raw i18n keys, no console errors`,
        leaked.size === 0 && errs.length === 0,
        [...leaked].join(', ') || errs.slice(0, 2).join(' | '));
    }
  }

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
