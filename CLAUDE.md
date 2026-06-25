# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CharacterForge

React PWA — scheda personaggio multi-sistema (D&D 5e 2024 + Daggerheart), SRD 5.2 (CC BY 4.0).
Deploy: https://Athryell.github.io/CharacterForge

## Commands

```bash
npm start          # dev server (localhost:3000)
npm run build      # production build → build/
npm run deploy     # build + push to gh-pages branch (GitHub Pages)
```

No test suite. No linter script — ESLint runs via react-scripts.

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
- MAI aggiungere icone senza aggiornarle in `ICON_MAP` in `src/config/icons.jsx`
- Se aggiungi una nuova categoria di icone, aggiungi anche il mapping emoji/Lucide in `ICON_MAP`

### i18n
- MAI stringhe UI hardcodate in JSX — usa sempre `t('chiave')`
- Per ogni nuova stringa: aggiungila in `en/ui.json` E `it/ui.json`
- Placeholder nei form: `t('placeholders.nomecampo')`
- Segnala se mancano chiavi nelle altre lingue (de, fr, es) — Crowdin le gestisce ma le chiavi EN devono essere complete
- Chiavi organizzate per namespace: `identity.*`, `levelUp.*`, `common.*`, `data.*`, `placeholders.*`, ecc.

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
- MAI import diretti da `src/data/systems/*/` nei componenti
- Usa sempre `dataManager.getAdapter(systemId)` per i dati di sistema
- `systemId` viene da `useCharContext()` — non hardcodarlo tranne nei componenti DH-specifici

### Widget condivisi — regola propagazione
Prima di modificare un componente che ha versioni multiple (es. ConditionTracker usato in DnD e DH, WeaponManager + DHWeaponManager, ArmorManager + DHArmorManager):
1. Fai grep per trovare tutti i componenti analoghi
2. Elenca esplicitamente i componenti trovati
3. Chiedi: "Vuoi applicare la stessa modifica a: [lista]?"
4. Aspetta conferma prima di procedere

Componenti con versioni multiple attuali:
- `ConditionTracker` — usato per DnD e DH
- `WeaponManager` + `DHWeaponManager`
- `ArmorManager` + `DHArmorManager`

---

## Units & measurements — REGOLA OBBLIGATORIA

L'app supporta tre sistemi di misura per velocità/distanza, configurabili nei Settings:
- `ft` — piedi (default D&D)
- `m` — metri
- `sq` — squares (quadrati, simbolo `□`)

`useUnits()` (da `src/hooks/useUnits.js`) espone:
- `speedUnit` — `'ft' | 'm' | 'sq'`
- `toDisplaySpeed(valueFt)` — converte da piedi al sistema scelto (arrotondato)
- `fromDisplaySpeed(displayVal)` — inverso
- `weightUnit` — `'kg' | 'lbs'`
- `toDisplayWeight(valueKg)` — converte il peso

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

## Architecture

### Multi-character storage — `src/chars.js`

`localStorage` keys: `characterforge_chars_index`, `characterforge_char_${id}`, `characterforge_active`.
`saveCharState(id, state)` auto-aggiorna l'indice. `migrateLegacy()` converte il vecchio formato single-char al primo avvio.

### File immutabili — NON modificare mai

**`src/hooks/useCharacter.js`** e **`src/chars.js`** non vanno mai modificati. Gestiscono persistenza e stato del personaggio — qualsiasi modifica rischia di corrompere i dati salvati in localStorage.

### State management — `src/hooks/useCharacter.js`

`useCharacter(charId)` è l'unica fonte di verità per il personaggio. Esporta:
- `state` — oggetto completo del personaggio
- `update(patch)` — merge superficiale + auto-save su localStorage
- Derivati calcolati: `profBonus`, `initiative`, `passivePerception`, `hitDice`, `spellStat`, `spellSaveDC`, `spellAttackBonus`
- Mutatori specializzati: `onClassOrLevelChange(patch)`, `onUpdateTags`, `onCreateTag`, `onAddAction`, `onRemoveAction`
- `longRest()`, `shortRest()` — riposi con reset slot/HP
- `levelUp(changes)` — applica HP, feature, ASI/feat, incantesimi; aggiorna `levelHistory`
- `levelDown(keepIds)` — inverte il livello precedente, rimuove feature/spell tranne quelle in `keepIds`

`levelHistory: { [level]: { hpGained, features: [id], spells: [name], subclass, feat, abilityScoreImprovement } }` — default `{}` per retrocompatibilità.

### Multi-system support — `src/data/systems.js`

L'app gestisce due sistemi (`dnd5e2024`, `daggerheart`). `activeSystem` è memorizzato in `localStorage`.
Ogni sistema ha la propria cartella dati, layout widget e creatore personaggio.

### Data layer — `src/data/`

**`src/data/dataManager.js`** — punto di accesso unificato SRD + homebrew:
- `getAdapter(systemId)` — restituisce l'adapter per il sistema attivo; è il metodo principale
- `getSpells()`, `getWeapons()`, `getConditions()`, `getClasses()`, `getSpecies()`, `getBackgrounds()`, `getArmors()` — accettano `systemId` opzionale (default `'dnd5e2024'`)
- `addSource(json)`, `removeSource(id)` — gestione sorgenti homebrew
- Homebrew salvato in `localStorage` (`characterforge_homebrew`)

**`src/data/systems/dnd5e2024/adapter.js`** espone tutti i dati statici via metodi:
- `getAbilities()`, `getSkills()`, `getAlignments()`, `getHitDice()`, `getSlotTable()`
- `getSpellcastingClass()`, `getSchools()`, `getSpellClasses()`, `filterSpells`
- `getWeaponProperties()`, `getWeaponPropertyDescs()`, `getWeaponMasteries()`, `getAbilityOptions()`
- `getArmorTypeLabel()`, `calcArmorAC`
- `getDefaultActions()`, `getClassFeatures(className)`
- `getClasses()`, `getClassData(name)`, `getSpecies()`, `getBackgrounds()`, `getWeapons()`, `getArmors()`, `getConditions()`

**`src/data/systems/daggerheart/adapter.js`** espone:
- `getTraits()`, `getTraitMap()`, `getAncestries()`, `getCommunities()`
- `getClasses()`, `getClassData(name)`, `getWeapons()`, `getArmors()`, `getConditions()`
- `getProficiency()`, `rollDuality()`, `calcThresholds()`, `createDefaultState()`

**`src/data/systems/dnd5e2024/`**:
- `mechanics.js` — `ABILITIES`, `SKILLS`, `ALIGNMENTS`, `SLOT_TABLE`, `SPELLCASTING_CLASS`, `DEFAULT_ACTIONS`, `createDefaultState()`
- `classes.js` — `DND_CLASSES` con `levelData` (livelli × classe, SRD 5.2.1); `CLASS_FEATURES`, `CLASS_LEVEL_DATA`
- `species.js`, `backgrounds.js`, `armors.js`, `weapons.js`, `spells.js`, `conditions.js`, `feats.js`, `items.js`

**`src/data/systems/daggerheart/`**:
- `mechanics.js` — `createDHDefaultState()`, `DH_TRAITS`, `DH_TRAIT_ARRAY`, `DH_ANCESTRIES`, `DH_COMMUNITIES`, `rollDualityDice()`, `getDHTier()`
  - `DH_ANCESTRY_DATA` — array 18 oggetti `{name, desc, features: [{name, desc}, {name, desc}]}`
  - `DH_COMMUNITY_DATA` — array 9 oggetti `{name, desc, feature: {name, desc}}`
  - `createDHDefaultState()` include `ancestry2: ''` per la seconda ancestry opzionale
- `classes.js` — `DH_CLASSES` con `suggestedTraits: {AGI,STR,FIN,INS,PRE,KNO}`; `DH_SUBCLASSES` — dizionario `{[subclassName]: {class, spellcastTrait?, foundation[], specialization[], mastery[]}}`
- `weapons.js`, `armor.js`, `conditions.js`

**`src/data/bonuses.js`** — `BONUS_STAT_OPTIONS`: CA, INI, VEL, HP, FOR–CAR, TS-FOR–TS-CAR.

**Nota post-refactor Fase 1-3b:**
- Tutti gli alias `SRD_*` sono stati rimossi — usa solo i nomi canonici (`DND_CLASSES`, `DND_WEAPONS`, ecc.)
- `CLASSES` in `mechanics.js` rimosso — usa `DND_CLASS_NAMES` da `classes.js`
- `BonusTextarea.jsx` eliminato — usa `NotationTextarea`
- `SPELL_CLASSES` derivato da `Object.keys(SPELLCASTING_CLASS)`

### Pattern architetturale — accesso ai dati

I componenti **non importano mai direttamente** da `src/data/systems/*/`. Usano sempre `dataManager.getAdapter(systemId)`:

```js
const { systemId } = useCharContext();
const adapter = dataManager.getAdapter(systemId);
const WEAPON_PROPERTIES = adapter.getWeaponProperties();
const WEAPON_MASTERIES = adapter.getWeaponMasteries();
```

Per i componenti DH-specifici il `systemId` è hardcoded `'daggerheart'`:
```js
const adapter = dataManager.getAdapter('daggerheart');
const DH_WEAPONS = adapter.getWeapons();
```

Eccezioni attuali con import diretti (candidate per refactor futuro — Fase 4):
- `App.jsx` — importa da `dnd5e2024/*` direttamente
- `LevelUpModal.jsx` — importa classi, meccaniche, specie, feats direttamente
- `creators/DNDCharacterCreator.jsx` — importa meccaniche, classi, specie, background direttamente

### Widget system — `src/layout.js`

22 `WIDGET_DEFS` (D&D 5e) + 12 `DH_WIDGET_DEFS` (Daggerheart), ciascuno con `{id, label, defaultTab, defaultCol, defaultFullWidth, defaultBottomFull?}`.
Layout per-sistema: `loadLayoutForSystem(systemId)` / `saveLayoutForSystem(systemId, layout)`.
`getDefaultLayoutForSystem(systemId)` — layout di default per sistema.
`getWidgetsForTab(layout, tab)` — ritorna widget filtrati e ordinati per un tab.
Ogni widget ha un `renderWidget(id)` corrispondente in `App.jsx`.

Tab D&D 5e: `main`, `combat`, `spells`, `inventory`, `notes`, `log`.

### Main component — `src/App.jsx`

Componenti locali (definiti nel file prima di `CharacterApp`):
- `SubclassFeaturesEditor` — editor inline feature di sottoclasse per livello
- `ActionItem` — riga azione nel widget azioni
- `AbilityBox` — riquadro caratteristica con modificatori
- `DHPipRow`, `DHDomainCardForm` — UI specifica Daggerheart

Struttura `CharacterApp`:
- `CharContext` (React Context) — fornisce `{abilities, traitValues, charLevel, profBonus, systemId}` a componenti profondi
- `renderWidget(id)` — switch su tutti i widget ID; accede a `layout` per variazioni responsive
- `showLevelUp` / `showLevelDown` — state per i modal level up/down (solo `activeSystem === 'dnd5e2024'`)

#### Pattern chiave in App.jsx

**`equipBonuses`** (`useMemo`): aggrega `bonuses: [{stat, value}]` da weapon e equipment, espone come `{CA: N, ...}`. Badge `+N 🎒` sui stat interessati.

**`actionNames`** (`useMemo`): Set di nomi azioni già aggiunte — stato ⚡/✓ in WeaponManager e InventoryManager.

**`editMode`**: bool passata a ogni widget. In edit mode click su item apre il form inline; in read mode click espande/collassa.

### Level up/down system (D&D 5e only)

**`src/components/LevelUpModal.jsx`** — wizard multi-step: HP → Feature → Scelte → ASI/Feat → Incantesimi → Riepilogo. Salta step vuoti. Legge `CLASS_LEVEL_DATA[classe][livello]` + `charState.subclassFeatures` per le feature di sottoclasse personalizzate.

**`src/components/LevelDownModal.jsx`** — mostra cosa verrà rimosso da `levelHistory[livelloCorrente]`; checkbox per mantenere feature/spell singole.

### Custom subclass (D&D 5e)

`charSubclass: string` — nome della sottoclasse.
`subclassFeatures: [{id, level, name, desc}]` — feature per livello, inclusi livelli futuri.
L'editor (`SubclassFeaturesEditor`) è nel widget Identità (edit mode). LevelUpModal inietta automaticamente le feature del livello target durante il level up.

### Character creators — `src/components/creators/`

- `DNDCharacterCreator.jsx` — wizard D&D 5e: nome/allineamento → specie (+ lineage) → background → classe → abilità → equipaggiamento
- `DHCharacterCreator.jsx` — wizard Daggerheart, step: Identity → Heritage → Traits → Experiences → Summary
  - Identity: nome + classe + sottoclasse (tutti obbligatori). La sottoclasse selezionata mostra `DHSubclassPreview` con foundation (piena), specialization (40% opacity), mastery (25% opacity), spellcast trait se presente
  - Heritage: fino a 2 ancestries (1 → entrambe le feature auto-assegnate; 2 → feat1 da una, feat2 dall'altra, toggle con tasto Swap in `--c-warn`); 1 community. Descrizioni mostrate solo dopo selezione, non sulle card.
  - Traits: assegnazione `DH_TRAIT_ARRAY [2,1,1,0,0,-1]` + bottone "Use Suggested Traits" da `dhClass.suggestedTraits`
  - Helper `getAncestryFeatureAssignment(ancestries, swap)` — calcola l'assegnazione feat1/feat2 in base alle ancestry selezionate e al bool `ancestrySwap`
  - `buildState()` mappa `ancestry: ancestries[0]`, `ancestry2: ancestries[1]`

### Shared components — `src/components/`

- `AlignmentPicker.jsx` — griglia 3×3 per la selezione allineamento (usato in identity widget + creator D&D)
- `FeatureManager.jsx` — feature di classe/specie/sottoclasse con badge `Lv. N` se `acquiredAtLevel` è impostato
- `SpellManager.jsx`, `WeaponManager.jsx`, `ArmorManager.jsx`, `InventoryManager.jsx` — manager con badge livello e pattern preset-browser
- `DHWeaponManager.jsx`, `DHArmorManager.jsx` — versioni Daggerheart degli stessi manager
- `ConditionTracker.jsx` — tracker condizioni, usato da DnD e DH (da unificare in Fase refactor futura)
- `LevelUpModal.jsx`, `LevelDownModal.jsx` — vedi sopra
- `Tooltip.jsx` — `resolveNotations()`, `KeywordText`, `NotationHelpBar`, `KEYWORD_GLOSSARY`
- `NotationTextarea.jsx` — textarea con menu slash-command per la notazione
- `Tags.jsx` — tag globali per personaggio con color coding
- `BonusEditor.jsx` — editor bonus stat (riutilizzabile in WeaponManager e InventoryManager)
- `FilterSortBar.jsx` — barra filtro/ordinamento generica riutilizzabile
- `SourceManager.jsx` — gestione sorgenti homebrew
- `HomebrewEditor.jsx` — editor modale fullscreen per creazione contenuto homebrew
- `WidgetGrid.jsx` / `WidgetShell.jsx` — layout drag-and-drop con colonne e zone full-width/bottom-full
- `TabBar.jsx` — navigazione tab con bottom nav mobile e drag-reorder in edit mode

### Notation system — `src/components/Tooltip.jsx`

`resolveNotations(text, abilities, charLevel, profBonus, traitMap?)` — risolve:

```
[STR][DEX][CON][INT][WIS][CHA]   → modificatore abilità
[PRO]                             → proficiency bonus
[LVL]                             → livello personaggio come numero
[LVL=N:val,N:val,...]            → scala con livello (N = soglia minima)
[countN]                          → counter statico da N pip
[countCHA][countPRO][countLVL]   → counter dinamico da stat/proficiency/livello
[countLVL/2]                      → counter = livello/2 arrotondato giù
+N@[STAT]                         → bonus equipaggiamento fisso
+[PRO]@[STAT]                     → bonus equipaggiamento dinamico
```

STAT valide per bonus: `AC`, `INIT`, `SPD`, `HP`, `STR`–`CHA`, `SAV-STR`–`SAV-CHA`, `SK-ACRO`–`SK-SURV`

**Nota:** La vecchia sintassi `[LVL:val,N:val]` è stata rimossa. Usa esclusivamente `[LVL=N:...]` dove N è il livello minimo di attivazione.

Esempio:
```
[LVL=1:1d6,5:1d8,11:1d10]   → 1d6 dal lv1, 1d8 dal lv5, 1d10 dall'11
[LVL=3:1d6,5:1d8]            → niente fino al lv2, 1d6 dal lv3, 1d8 dal lv5
```

`KeywordText` usa `useCharContext()` senza prop drilling.
`NotationHelpBar` mostra la reference rapida della sintassi — aggiornala se aggiungi nuovi token.

### Homebrew system — `src/utils/homebrewSync.js`

`syncCustomToDraft(type, item, system)` — quando l'utente aggiunge un elemento custom dalla scheda (arma, incantesimo, condizione, oggetto, feature), lo copia automaticamente nel draft homebrew in localStorage (`characterforge_homebrew_draft`).

`HOMEBREW_SCHEMA` in `src/config/homebrewSchema.js` — configurazione dichiarativa dei campi per ogni tipo di entità homebrew per sistema. `HomebrewEditor` legge questa config per renderizzare i form. Aggiungere nuovi tipi qui prima di modificare `HomebrewEditor`.

## CSS conventions

Variabili in `:root` (`src/App.css`):
- `--c-bg`, `--c-surface`, `--c-ink`, `--c-muted`, `--c-hint`, `--c-border`, `--c-border-mid`
- `--c-accent`, `--c-accent-light`, `--c-accent-text`
- `--c-success` (`#3B6D11`), `--c-warn`, `--c-warn-text`
- `--r` (border-radius base: 9px), `--rl` (large: 14px)
- `--shadow-card` (elevazione card)
- `--font-display` (Cinzel), `--font-body` (Crimson Pro), `--font-mono` (Consolas/Monaco/monospace)

Nuove variabili sempre in `:root`. Nessun file CSS aggiuntivo oltre `src/App.css`.

Classi utility rilevanti: `.grid-2`, `.trait-grid`, `.alignment-grid`, `.alignment-btn`, `.level-badge`, `.creator-overlay`/`.creator-modal` (pattern modale), `.filter-chip`, `.bonus-chip`, `.hint-text`, `.io-btn`, `.io-btn.primary`.

**Nota post-refactor Fase 1:**
- `.tab-btn-wrapper` unificato in una sola definizione
- `.pin-pip` unificato in una sola definizione
- Selettori TOUCH-FRIENDLY spostati dentro `.large-targets` — non definire mai selettori di accessibilità senza il selettore antenato corretto

## i18n

Sorgente EN in `src/i18n/locales/en/ui.json`.
Traduzioni IT in `src/i18n/locales/it/ui.json`.
DE, FR, ES gestite via Crowdin — aggiungere sempre le chiavi EN prima del push.

Chiavi organizzate per namespace: `identity.*`, `levelUp.*`, `levelDown.*`, `common.*`, `data.alignments.*`, `data.weaponProps.*`, `data.masteries.*`, `placeholders.*`, `errors.*`, `notation.*`, `sources.*`, `onboarding.*`, ecc.

File dati i18n per sistema in `src/data/systems/dnd5e2024/i18n/` e `src/data/systems/daggerheart/i18n/` — sincronizzati via Crowdin. Aggiornare `crowdin.yml` se si aggiungono nuovi file.

Nuove stringhe UI **sempre** via `t('chiave')` con chiave aggiunta in EN + IT prima del commit.

## Analytics

`window.umami?.track(eventName, payload?)` — sempre con optional chaining (`?.`), nessun import npm.
Eventi principali: `system-selected`, `creator-opened`, `character-created`, `character-imported`, `character-exported`, `long-rest`, `level-up`, `level-down`, `homebrew-imported`, `tutorial-opened`, `feedback-clicked`, `crowdin-clicked`.

## Changelog

### 2026-06-22 — Refactor Fase 1 (cleanup)
- Rimossi 9 alias zombie `SRD_*` da 7 file dati
- Rimosso `CLASSES` ridondante da `mechanics.js`
- Eliminato `BonusTextarea.jsx` (shim non usato)
- Fix CSS TOUCH-FRIENDLY: 6 selettori spostati dentro `.large-targets`
- Unificati `.tab-btn-wrapper` (3→1) e `.pin-pip` (2→1)
- Aggiunti `--font-mono` e `--c-success` al `:root`

### 2026-06-22 — Refactor Fase 2 (adapter e dataManager)
- Esposti tutti i dati statici D&D via `dnd5eAdapter`
- `dhAdapter` collegato a `dataManager` con metodi pubblici
- `SPELL_CLASSES` derivato da `Object.keys(SPELLCASTING_CLASS)`
- Fix `no-unused-vars`: `ABILITY_LABELS`, `iconMode`, `toDisplaySpeed`, `speedUnit`
- Fix `unicode-bom` su 9 file
- Placeholder hardcodati sostituiti con `t('placeholders.*')`

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
