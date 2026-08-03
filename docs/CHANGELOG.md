# Refactor changelog

History of the incremental refactor phases. See [CLAUDE.md](../CLAUDE.md) for current
rules and [ARCHITECTURE.md](ARCHITECTURE.md) for how the code works today.

### 2026-08-03 — Refactor Fase 9 (quarto sistema, la prova — verificata e scartata)

Costruito `src/systems/fate/` (Fate Core: 3 widget, 2 tab, capabilities tutte false,
`creator` un bridge che completa subito come `CustomCreatorBridge`, `homebrew: null`) più
la riga in `registry.js`. Verificato dal vivo — dropdown a 4 voci, icona distinta in tutte
e tre le modalità, creazione, entrambe le tab, tutti e tre i widget scrivono lo stato,
zero chiavi i18n grezze, zero errori console — e `git diff --stat` mostrava esattamente
`src/systems/fate/**` più le due righe attese in `registry.js`, nient'altro: la Fase 8 ha
retto, un sistema nuovo non tocca il core.

**Scartato dopo la verifica** — era una prova architetturale, non una richiesta di
supportare Fate Core in produzione (mancano traduzioni DE/FR/ES, contenuto SRD reale,
`scripts/checks/phase2.mjs` avrebbe richiesto l'aggiornamento del conteggio hardcoded a 4
sistemi). Se in futuro serve un quarto sistema per davvero, la fase è ripetibile com'è:
la cartella qui sopra è la forma minima che il contratto richiede.

### 2026-08-03 — Refactor Fase 8 (i18n nei plugin)

- `src/data/systems/` eliminato: le tabelle i18n SRD si spostano con `git mv` dentro
  `src/systems/<id>/i18n/`, a fianco del nuovo bundle di stringhe UI del plugin
- `ui.json` (5 lingue) diviso in chrome condiviso + bundle per plugin: `dh.*` e
  `customWidgets.*` interi, il vocabolario D&D non taggato (`combat`, `concentration`,
  `deathSave`, `hp`, `senses`, `notes`, `currency`, `feats`, `levelUp`, `levelDown`,
  `resources`, `armor`, `spells`, `data.*`), più le porzioni D&D/DH di `identity`,
  `creator`, `widgets`, `placeholders` — core tiene solo le chiavi che due o più sistemi
  chiamano davvero
- Nuovo campo di contratto `i18n: { bundles: { en, it, de, fr, es } }`; `src/i18n/index.js`
  smette di essere l'unico posto che nomina le lingue caricate e fonde (`deepMerge`) core +
  bundle di ogni plugin nel registry — un plugin senza `i18n` semplicemente non contribuisce
  nulla oltre al chrome
- `crowdin.yml` passa da 9 entry a 3: core `ui.json`/`game.json` più un wildcard
  `src/systems/*/i18n/*.i18n.json` che copre tabelle SRD e bundle UI di ogni sistema,
  presente e futuro
- Nuovo `scripts/checks/phase8.mjs`: 5 lingue × 3 sistemi, nessuna chiave i18n grezza in
  nessuna tab né nel menu hamburger

### 2026-06-26 — Refactor Fase 3a + sistema custom

- Estratto `PresetBrowser` generico, applicato a `WeaponManager`, `ArmorManager`, `InventoryManager`
- `ConditionTracker` unificato per DnD e DH — collapsible, pills, adapter-aware
- Sistema `custom` aggiunto: `CustomWidget`, `WidgetEditor`, export/import template
- Notazione estesa con `customFields` — `[FIELDID]`, `[FIELDID.max]`
- Aggiunte variabili CSS `--c-bar-red`, `--c-bar-blue` per i colori widget custom

### 2026-06-25 — DHCharacterCreator rework

- Aggiunto `DH_SUBCLASSES` in `classes.js` con feature foundation/specialization/mastery per 18 sottoclassi
- Corretti `suggestedTraits` per 7 classi DH (guardian, ranger, rogue, seraph, sorcerer, warrior, wizard)
- Aggiunti `DH_ANCESTRY_DATA` e `DH_COMMUNITY_DATA` in `mechanics.js`; `ancestry2` in `createDHDefaultState()`
- DHCharacterCreator: subclass preview, ancestry feature assignment (swap), community panel, suggested traits
- Creator footer unificato (DnD + DH): Back sinistra, Next destra, nessun Cancel nel footer
- Step "Origin" rinominato "Heritage"

### 2026-06-22 — Refactor Fase 3b (import via adapter)

- 7 componenti aggiornati per usare adapter invece di import diretti:
  `WeaponManager`, `SpellManager`, `ArmorManager`, `ConditionTracker`, `AlignmentPicker`, `DHWeaponManager`, `DHArmorManager`
- `ActionManager`: `SCHOOLS` via adapter

### 2026-06-22 — Refactor Fase 2 (adapter e dataManager)

- Esposti tutti i dati statici D&D via `dnd5eAdapter`
- `dhAdapter` collegato a `dataManager` con metodi pubblici
- `SPELL_CLASSES` derivato da `Object.keys(SPELLCASTING_CLASS)`
- Fix `no-unused-vars`: `ABILITY_LABELS`, `iconMode`, `toDisplaySpeed`, `speedUnit`
- Fix `unicode-bom` su 9 file
- Placeholder hardcodati sostituiti con `t('placeholders.*')`

### 2026-06-22 — Refactor Fase 1 (cleanup)

- Rimossi 9 alias zombie `SRD_*` da 7 file dati
- Rimosso `CLASSES` ridondante da `mechanics.js`
- Eliminato `BonusTextarea.jsx` (shim non usato)
- Fix CSS TOUCH-FRIENDLY: 6 selettori spostati dentro `.large-targets`
- Unificati `.tab-btn-wrapper` (3→1) e `.pin-pip` (2→1)
- Aggiunti `--font-mono` e `--c-success` al `:root`
