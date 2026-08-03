// dataManager normalisation: one dispatch tier, systemId always first,
// generic homebrew merge, and the language actually reaching the SRD tables.
// Run:  node scripts/browser.mjs scripts/checks/phase4.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

async function seed(page, baseUrl, system, extra = '') {
  await page.goto(baseUrl);
  await page.eval(`
    (() => {
      const id = 'chk_${system}';
      localStorage.setItem('characterforge_char_' + id, JSON.stringify(
        { system: ${JSON.stringify(system)}, charName: 'Check', charClass: 'Wizard', charLevel: 3 }));
      localStorage.setItem('characterforge_chars_index', JSON.stringify(
        [{ id, name: 'Check', charClass: 'Wizard', charLevel: 3, system: ${JSON.stringify(system)} }]));
      localStorage.setItem('characterforge_active', id);
      localStorage.setItem('characterforge_active_system', ${JSON.stringify(system)});
      ${extra}
    })()
  `);
  await page.goto(baseUrl);
}

// Opens the sources modal, which is the only place dataManager.getSources()
// output is visible without instrumenting the bundle.
async function openSources(page) {
  await page.click('.hamburger-btn');
  await page.eval(`
    [...document.querySelectorAll('.hmenu-item')]
      .find(b => /sorgenti|sources/i.test(b.textContent))?.click()
  `);
  await page.wait(500);
}

export default async function (page, baseUrl) {
  // ── getSources now comes from each plugin's homebrew.sourceInfo() ──────────
  await seed(page, baseUrl, 'dnd5e2024');
  check('no console errors (dnd5e2024)', page.errors().length === 0, page.errors().join(' | '));

  await openSources(page);
  const sources = await page.eval(`
    [...document.querySelectorAll('.source-name')].map(e => e.textContent.trim())
  `);
  check('both bundled rulesets are listed',
    sources.includes('SRD 5.2.1') && sources.includes('Daggerheart Core'),
    JSON.stringify(sources));

  const counts = await page.eval(`
    [...document.querySelectorAll('.source-counts')].map(e => e.textContent.trim())
  `);
  check('bundled sources report non-empty counts',
    counts.length >= 2 && counts.every(c => c && !/nessuna|no entit/i.test(c)),
    JSON.stringify(counts));
  await page.shot('phase4-sources');

  // ── The language bug ──────────────────────────────────────────────────────
  // window.__i18n_lang__ was read by dataManager and assigned by nobody, so
  // every call that didn't pass a language explicitly resolved to English.
  //
  // This asserts the plumbing, not the output: all six SRD i18n tables are
  // currently byte-identical copies of English in all four languages, so the
  // fix has no visible effect until Crowdin actually delivers those files.
  for (const lang of ['en', 'it']) {
    await page.eval(`localStorage.setItem('characterforge_lang', ${JSON.stringify(lang)})`);
    await page.goto(baseUrl);
    const published = await page.eval(`window.__i18n_lang__ ?? null`);
    check(`window.__i18n_lang__ tracks the UI language (${lang})`,
      published === lang, `got ${JSON.stringify(published)}`);
  }
  await page.eval(`localStorage.setItem('characterforge_lang', 'it')`);

  // ── Homebrew is no longer D&D-only ────────────────────────────────────────
  async function openWeaponPresets(itemSelector) {
    await page.eval(`
      [...document.querySelectorAll('.tab-btn')]
        .find(b => /inventario|inventory/i.test(b.textContent))?.click()
    `);
    await page.wait(500);
    // the add control is an icon-only button in the weapons widget
    await page.eval(`document.querySelectorAll('.panel .icon-btn')[0]?.click()`);
    await page.wait(600);
    return page.eval(`
      [...document.querySelectorAll(${JSON.stringify(itemSelector)})]
        .map(e => e.textContent.trim().split('\\n')[0]).slice(0, 40)
    `);
  }

  // mergeHomebrew used to live on the D&D adapter, so a Daggerheart pack was
  // loaded from localStorage and then silently dropped.
  const DH_PACK = JSON.stringify({
    id: 'chk-dh-pack', name: 'Check Pack', author: 'test', system: 'daggerheart',
    weapons: [{ name: 'Zzz Test Blade', trait: 'AGI', range: 'Melee', dmgDie: 'd8' }],
  });
  await seed(page, baseUrl, 'daggerheart',
    `localStorage.setItem('characterforge_homebrew', JSON.stringify([${DH_PACK}]));`);
  check('no console errors (daggerheart + homebrew)',
    page.errors().length === 0, page.errors().join(' | '));

  const dhNames = await openWeaponPresets('.dh-wm-preset-item');
  check('Daggerheart homebrew weapon reaches the preset list',
    dhNames.some(n => n.includes('Zzz Test Blade')),
    `${dhNames.length} presets, sample: ${JSON.stringify(dhNames.slice(0, 3))}`);
  await page.shot('phase4-dh-homebrew');

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
