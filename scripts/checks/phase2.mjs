// Verifies what the plugin registry phase actually changed.
// Run:  node scripts/browser.mjs scripts/checks/phase2.mjs

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

export default async function (page, baseUrl) {
  // A blank screen is how the icons.jsx <-> registry import cycle would fail,
  // so booting at all is itself the first assertion.
  await page.goto(baseUrl);
  const booted = await page.eval(`document.querySelector('#root')?.children.length > 0`);
  check('app boots (no import-cycle white screen)', booted);

  check('no console errors on boot', page.errors().length === 0, page.errors().join(' | '));

  // The registry is the only place that should name systems. Confirm all three
  // resolve and that capabilities — not id checks — describe them.
  // page.click() waits for React to re-render; clicking inside the same eval
  // and querying immediately reads the DOM before setState has flushed.
  await page.click('.system-selector-btn');
  const systems = await page.eval(`
    (() => {
      const items = [...document.querySelectorAll('.system-dropdown-item')];
      return {
        count: items.length,
        labels: items.map(i => i.textContent.trim()),
        // an <Icon> renders a span.icon-emoji, an svg.icon-lucide, or nothing in
        // 'none' mode — a raw emoji text node would mean iconId never resolved
        withIcon: items.filter(i =>
          i.querySelector('.icon-emoji, svg, .icon-game')).length,
      };
    })()
  `);
  check('system dropdown lists 3 systems', systems.count === 3, JSON.stringify(systems.labels));
  check('every system renders a resolved <Icon>', systems.withIcon === 3,
    `${systems.withIcon}/3 — a miss means meta.iconId has no ICON_MAP entry`);

  await page.shot('phase2-system-dropdown');

  // Icon modes: the fallback path ignores iconMode, so a system relying on it
  // would still show an emoji here. Walk all three modes.
  for (const mode of ['emoji', 'lucide', 'none']) {
    await page.eval(`localStorage.setItem('characterforge_icon_mode', ${JSON.stringify(mode)})`);
    await page.goto(baseUrl);
    await page.click('.system-selector-btn');
    const shape = await page.eval(`
      (() => {
        const items = [...document.querySelectorAll('.system-dropdown-item')];
        return items.map(i => ({
          emoji:  !!i.querySelector('.icon-emoji'),
          lucide: !!i.querySelector('svg.icon-lucide'),
        }));
      })()
    `);
    const expect = mode === 'emoji' ? s => s.emoji
                 : mode === 'lucide' ? s => s.lucide
                 : s => !s.emoji && !s.lucide;
    check(`icon mode "${mode}" renders correctly`, shape.length === 3 && shape.every(expect),
      JSON.stringify(shape));

    // Two systems mapping to the same glyph passes every presence assertion and
    // still leaves the dropdown unreadable — only comparing the marks catches it.
    if (mode !== 'none') {
      const marks = await page.eval(`
        [...document.querySelectorAll('.system-dropdown-item')].map(i => {
          const svg = i.querySelector('svg.icon-lucide');
          if (svg) return svg.innerHTML;
          return i.querySelector('.icon-emoji')?.textContent ?? '';
        })
      `);
      check(`icon mode "${mode}" gives each system a distinct glyph`,
        new Set(marks).size === marks.length,
        `${new Set(marks).size} distinct of ${marks.length}`);
    }

    await page.shot(`phase2-icons-${mode}`);
  }

  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nall checks passed');
  if (failures) throw new Error(`${failures} check(s) failed`);
}
