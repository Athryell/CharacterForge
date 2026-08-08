# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CharacterForge

React PWA — scheda personaggio multi-sistema (D&D 5e 2024 + Daggerheart), SRD 5.2 (CC BY 4.0).
Deploy: https://Athryell.github.io/CharacterForge

For the full architecture deep-dive (state, registry, data layer, widget system, notation,
homebrew), see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). For refactor history, see
[docs/CHANGELOG.md](docs/CHANGELOG.md). CSS tokens are documented in
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Commands

```bash
npm start          # dev server (localhost:3000)
npm run build      # production build → build/
npm run deploy     # build + push to gh-pages branch (GitHub Pages)
```

No test suite. No linter script — ESLint runs via react-scripts.

### Browser checks — `scripts/browser.mjs`

```bash
npm start                                              # dev server must be up
node scripts/browser.mjs scripts/checks/<name>.mjs     # run a scenario
```

Drives Chrome over the DevTools Protocol using Node's built-in `WebSocket` and `fetch` —
**zero dependencies**. A scenario default-exports `async (page, baseUrl) => {}` and gets
`goto`, `eval`, `click`, `text`, `shot`, `errors`, `wait`. Screenshots land in
`scripts/shots/` (gitignored).

- Use `page.click()`, not `el.click()` inside an `eval` — the latter reads the DOM before
  React has flushed `setState` and produces false negatives
- The driver seeds `characterforge_onboarding_seen` so a fresh profile doesn't render the
  tour over every screenshot
- **Assert on what you'd look at, not just on presence.** Two systems mapped to the same
  Lucide glyph passed every "an icon rendered" check and still left the dropdown
  unreadable; only comparing the glyphs caught it

## Stack

- React 18, Create React App, no TypeScript
- CSS custom (no Tailwind, no CSS modules) — tutto in `src/App.css`
- Persistenza: `localStorage` only, nessun backend
- i18n: `react-i18next`, EN come sorgente, IT/FR/DE/ES — locales in `src/i18n/locales/`; traduzioni gestite via Crowdin (https://crowdin.com/project/characterforge)
- Dark mode automatica via `prefers-color-scheme`
- Font: Cinzel (display/label) + Crimson Pro (body) — Google Fonts
- Analytics: `window.umami?.track(event, payload)` — optional chaining, no crash se bloccato

---

## ⚠ REGOLE OBBLIGATORIE — leggere prima di ogni modifica

### Icone
- MAI emoji hardcodate nei componenti JSX — usa sempre `<Icon id="..." fallback="..." />`
- Il vocabolario **condiviso** sta in `CORE_ICONS` (`src/config/icons.jsx`): tutto ciò che
  un sistema qualunque vorrebbe con quel nome (`widget.*`, `tab.*`, `action.*`,
  `resource.*`, `cond.*`)
- Un sistema dichiara in `src/systems/<id>/icons.js` **solo ciò che il core non sa
  nominare** (es. `game.hope` per DH). Usare un id del core non richiede di ridichiararlo
- Un plugin può aggiungere id nuovi o sovrascrivere i propri, **mai** rivendicare un id
  condiviso — due plugin sullo stesso id producono un `console.warn` in sviluppo
- Il **prefisso è semantico**: `Icon` fa `id.startsWith('action.')` per tenere visibili i
  controlli in modalità `none`. Non inventare prefissi nuovi
- `fallback` è una rete per i tab creati dall'utente, **non** una strategia: ignora
  `iconMode` e mostra emoji anche a chi ha scelto Lucide o `none`

### i18n
- MAI stringhe UI hardcodate in JSX — usa sempre `t('chiave')`
- Per ogni nuova stringa: aggiungila in `en/ui.json` E `it/ui.json`
- Placeholder nei form: `t('placeholders.nomecampo')`
- Segnala se mancano chiavi in de/fr/es — Crowdin le gestisce ma le chiavi EN devono essere complete
- Chiavi organizzate per namespace: `identity.*`, `levelUp.*`, `common.*`, `data.*`, `placeholders.*`, ecc.
- Una chiave va nel bundle del plugin che la chiama (`src/systems/<id>/i18n/ui.i18n.json`),
  non in core, a meno che due sistemi diversi la chiamino con valori diversi — dettagli e
  criterio completo in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#i18n-bundle-split-fase-8--dettaglio)
- Tutte le tabelle SRD (`*.i18n.<lang>.json`, non `ui.i18n.*`) sono oggi copie identiche
  dell'inglese in tutte le lingue — non è un bug, la pipeline Crowdin non ha ancora contenuto

### Validazione form
- Ogni campo obbligatorio deve avere: asterisco visivo nel label, bordo rosso su input vuoto, messaggio errore inline via `t('errors.nomecampo')`
- I bottoni submit restano disabilitati finché i campi obbligatori non sono compilati
- Applica questo pattern in: data sources, homebrew editor, qualsiasi modale con form

**Pattern alternativo per wizard multi-step** (character creators):

- Il bottone Next è sempre abilitato — non viene mai disabilitato
- Al click, se i campi obbligatori mancano, si imposta `nextAttempted: true` e si mostrano warning inline con `<AlertTriangle>` (da `lucide-react`) accanto ai campi mancanti
- Si avanza solo se `canNext` è `true`
- Bottoni footer: Back a sinistra (o `<div />` placeholder allo step 0), Next/Create a destra — `justify-content: space-between`
- Nessun bottone Cancel nel footer — la chiusura avviene solo con la X nell'header

### CSS
- MAI valori hardcodati — usa solo token CSS da `DESIGN_SYSTEM.md`
- MAI `!important` fuori da `.large-targets` e `.high-contrast` (accessibilità)
- MAI aggiungere file CSS aggiuntivi — tutto in `src/App.css`
- Nuove variabili CSS sempre nel blocco `:root`
- Spaziature: multipli di 4px

### Accesso ai dati

- MAI import diretti da `src/systems/*/data/` nei componenti condivisi
- Usa sempre `dataManager.getAdapter(systemId)` per i dati di sistema — `systemId` da
  `useCharContext()`, non hardcodarlo tranne nei componenti DH-specifici
- `systemId` è sempre il PRIMO argomento dei metodi `dataManager` (`getSpells(systemId, {lang})`)

### Widget condivisi — regola propagazione
Prima di modificare un componente che ha versioni multiple (`ConditionTracker` usato per
DnD e DH, `WeaponManager` + `DHWeaponManager`, `ArmorManager` + `DHArmorManager`):
1. Fai grep per trovare tutti i componenti analoghi
2. Elenca esplicitamente i componenti trovati
3. Chiedi: "Vuoi applicare la stessa modifica a: [lista]?"
4. Aspetta conferma prima di procedere

---

## Units & measurements — REGOLA OBBLIGATORIA

L'app supporta tre sistemi di misura per velocità/distanza, configurabili nei Settings:
`ft` (piedi, default D&D), `m` (metri), `sq` (squares, simbolo `□`).

`useUnits()` (`src/hooks/useUnits.js`) espone `speedUnit`, `toDisplaySpeed(valueFt)`,
`fromDisplaySpeed(displayVal)`, `weightUnit`, `toDisplayWeight(valueKg)`.

**Quando scrivi qualsiasi stringa che include velocità, distanza o peso:**
1. Non hardcodare mai "10 ft", "5 ft", "30 ft", "2 lb." come testo statico
2. Usa `toDisplaySpeed(valueFt)` per il numero e `speedUnit === 'sq' ? '□' : speedUnit` per l'unità
3. Usa `toDisplayWeight(valueKg)` per il peso e `weightUnit` per l'unità
4. Nelle chiavi i18n usa interpolazione `{{value}} {{unit}}` e calcola lato componente
5. I componenti senza accesso a `useUnits` ricevono la stringa già formattata come prop da App.jsx

```js
// Pattern corretto in App.jsx
const strPenaltyText = `${toDisplaySpeed(10)} ${speedUnit === 'sq' ? '□' : speedUnit}`;
```

---

## Architecture — overview

Full detail (state shape, gotchas, code examples) in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Quick map:

- **`src/chars.js`** — multi-character storage (`localStorage`), index kept in sync
- **`src/hooks/useCharacter.js`** + **`src/systems/<id>/{state,rules}.js`** — core is
  agnostic storage/identity only; every rules-dependent value (`derived`, `actions`) lives
  in the plugin and is spread onto the hook's return, never read by name
- **`src/systems/registry.js`** — the only core file that names concrete system ids;
  shared code asks `sys.capabilities.X`, never `if (systemId === ...)`. Capabilities are
  declared in `src/systems/contract.js`; unknown ids resolve to `unknown.js` (all
  capabilities false), never silently to D&D
- **`src/systems/custom/`** — user-defined agnostic sheets: widgets/tabs/fields all live
  in `state`, no character creator, no homebrew support (export/import template instead)
- **`src/data/dataManager.js`** — unified SRD + homebrew access; `systemId` always first
  arg; components must call `dataManager`, not the adapter directly, to get homebrew merges
- **`src/layout.js`** + **`src/systems/<id>/layout.js`** — widget catalog and default tabs
  live in the plugin; rendering lives in `src/systems/<id>/widgets.jsx` via `render(id, ctx)`
- **`src/systems/<id>/useWidgetState.js`** — optional hook for a plugin's UI state +
  derived values that depend on React state/units
- **`src/components/Tooltip.jsx`** — `resolveNotations()`, the `[STR]`/`[PRO]`/`[LVL=N:...]`
  notation engine shared across systems, plus custom-field tokens (`[FIELDID]`)
- **`src/utils/homebrewSync.js`** + **`src/config/homebrewSchema.js`** — homebrew draft
  sync and declarative per-system field schema

Adding a new game system means a folder under `src/systems/<id>/` plus one line in
`registry.js` — verified live in Fase 9 (see changelog), then discarded as a proof, not a
shipped system.

## CSS conventions

Variabili in `:root` (`src/App.css`): `--c-bg`, `--c-surface`, `--c-ink`, `--c-muted`,
`--c-hint`, `--c-border`, `--c-border-mid`, `--c-accent`, `--c-accent-light`,
`--c-accent-text`, `--c-success` (`#3B6D11`), `--c-warn`, `--c-warn-text`, `--r` (9px),
`--rl` (14px), `--shadow-card`, `--font-display` (Cinzel), `--font-body` (Crimson Pro),
`--font-mono`. Nuove variabili sempre in `:root`. Nessun file CSS aggiuntivo oltre
`src/App.css`.

Classi utility rilevanti: `.grid-2`, `.trait-grid`, `.alignment-grid`, `.alignment-btn`,
`.level-badge`, `.creator-overlay`/`.creator-modal` (pattern modale), `.filter-chip`,
`.bonus-chip`, `.hint-text`, `.io-btn`, `.io-btn.primary`. Selettori TOUCH-FRIENDLY vivono
dentro `.large-targets` — non definire selettori di accessibilità senza il selettore
antenato corretto.

## i18n

Sorgente EN in `src/i18n/locales/en/ui.json`, traduzioni IT in `it/ui.json`. DE/FR/ES
gestite via Crowdin. `crowdin.yml` copre tabelle SRD e bundle UI con un solo wildcard
(`src/systems/*/i18n/*.i18n.json`); aggiungere un sistema non lo tocca. Vedi la sezione
"Regole obbligatorie → i18n" sopra per le regole di scrittura chiavi.

## Analytics

`window.umami?.track(eventName, payload?)` — sempre con optional chaining (`?.`), nessun
import npm. Eventi principali: `system-selected`, `creator-opened`, `character-created`,
`character-imported`, `character-exported`, `long-rest`, `level-up`, `level-down`,
`homebrew-imported`, `tutorial-opened`, `feedback-clicked`, `crowdin-clicked`.

## Changelog

Refactor history (Fase 1 → Fase 9) moved to [docs/CHANGELOG.md](docs/CHANGELOG.md).
