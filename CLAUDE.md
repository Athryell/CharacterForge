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
- i18n: `react-i18next`, EN come sorgente, IT/FR/DE/ES — locales in `src/i18n/locales/`
- Dark mode automatica via `prefers-color-scheme`
- Font: Cinzel (display/label) + Crimson Pro (body) — Google Fonts
- Analytics: `window.umami?.track(event, payload)` — optional chaining, no crash se bloccato

## Architecture

### Multi-character storage — `src/chars.js`

`localStorage` keys: `characterforge_chars_index`, `characterforge_char_${id}`, `characterforge_active`.  
`saveCharState(id, state)` auto-aggiorna l'indice. `migrateLegacy()` converte il vecchio formato single-char al primo avvio.

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

L'app gestisce due sistemi (`dnd5e`, `daggerheart`). `activeSystem` è memorizzato in `localStorage`.  
Ogni sistema ha la propria cartella dati, layout widget e creatore personaggio.

### Data layer — `src/data/`

**`src/data/dataManager.js`** — punto di accesso unificato SRD + homebrew:
- `getSpells()`, `getWeapons()`, `getConditions()`, `getClasses()`, `getSpecies()`, `getBackgrounds()`
- `addSource(json)`, `removeSource(id)` — gestione sorgenti homebrew
- Homebrew salvato in `localStorage` (`characterforge_homebrew`)

**`src/data/systems/dnd5e/`**:
- `mechanics.js` — `ABILITIES`, `SKILLS`, `ALIGNMENTS`, `SLOT_TABLE`, `SPELLCASTING_CLASS`, `createDefaultState()`
- `classes.js` — `DND_CLASSES` con `levelData` (20 livelli × classe, SRD 5.2.1); `CLASS_FEATURES`, `CLASS_LEVEL_DATA`
- `species.js`, `backgrounds.js`, `armors.js`, `weapons.js`, `spells.js`, `conditions.js`

**`src/data/systems/daggerheart/`**:
- `mechanics.js` — `createDHDefaultState()`, `DH_TRAITS`, `rollDualityDice()`, `getDHTier()`
- `classes.js`, `weapons.js`, `armor.js`, `conditions.js`, `getters.js`

**`src/data/bonuses.js`** — `BONUS_STAT_OPTIONS`: CA, INI, VEL, HP, FOR–CAR, TS-FOR–TS-CAR.

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
- `CharContext` (React Context) — fornisce `{abilities, charLevel}` a componenti profondi
- `renderWidget(id)` — switch su tutti i widget ID; accede a `layout` per variazioni responsive (es. traits 2×2 / 1×4)
- `showLevelUp` / `showLevelDown` — state per i modal level up/down (solo `activeSystem === 'dnd5e'`)

#### Pattern chiave in App.jsx

**`equipBonuses`** (`useMemo`): aggrega `bonuses: [{stat, value}]` da weapon e equipment, espone come `{CA: N, ...}`. Badge `+N 🎒` sui stat interessati.

**`actionNames`** (`useMemo`): Set di nomi azioni già aggiunte — stato ⚡/✓ in WeaponManager e InventoryManager.

**`editMode`**: bool passata a ogni widget. In edit mode click su item apre il form inline; in read mode click espande/collassa.

### Level up/down system (D&D 5e only)

**`src/components/LevelUpModal.jsx`** — wizard multi-step: HP → Feature → Scelte → ASI/Epic Boon → Incantesimi → Riepilogo. Salta step vuoti. Legge `CLASS_LEVEL_DATA[classe][livello]` + `charState.subclassFeatures` per le feature di sottoclasse personalizzate del livello target (pallino ambra).

**`src/components/LevelDownModal.jsx`** — mostra cosa verrà rimosso da `levelHistory[livelloCorrente]`; checkbox per mantenere feature/spell singole.

### Custom subclass (D&D 5e)

`charSubclass: string` — nome della sottoclasse.  
`subclassFeatures: [{id, level, name, desc}]` — feature per livello, inclusi livelli futuri.  
L'editor (`SubclassFeaturesEditor`) è nel widget Identità (edit mode). LevelUpModal inietta automaticamente le feature del livello target durante il level up.

### Character creators — `src/components/creators/`

- `DNDCharacterCreator.jsx` — wizard D&D 5e: nome/allineamento → specie → background → classe → abilità → equipaggiamento
- `DHCharacterCreator.jsx` — wizard Daggerheart

### Shared components — `src/components/`

- `AlignmentPicker.jsx` — griglia 3×3 per la selezione allineamento (usato in identity widget + creator)
- `FeatureManager.jsx` — feature di classe/specie/sottoclasse con badge `Lv. N` se `acquiredAtLevel` è impostato
- `SpellManager.jsx`, `WeaponManager.jsx`, `InventoryManager.jsx` — idem per badge livello
- `LevelUpModal.jsx`, `LevelDownModal.jsx` — vedi sopra
- `Tooltip.jsx` — `resolveNotations()`, `KeywordText`, `KEYWORD_GLOSSARY`
- `Tags.jsx` — tag globali per personaggio con color coding
- `BonusEditor.jsx` — editor bonus stat (riutilizzabile in WeaponManager e InventoryManager)
- `SourceManager.jsx` — gestione sorgenti homebrew
- `WidgetGrid.jsx` / `WidgetShell.jsx` — layout drag-and-drop con colonne e zone full-width/bottom-full

### Notation system — `src/components/Tooltip.jsx`

`resolveNotations(text, abilities, charLevel)` — risolve `[FOR]`, `[DES]` → modificatore; `[LVL:base,threshold:value,...]` → scaling livello.  
`KeywordText` usa `useCharContext()` senza prop drilling.

## CSS conventions

Variabili in `:root` (`src/App.css`):
- `--c-bg`, `--c-surface`, `--c-ink`, `--c-muted`, `--c-border`, `--c-border-mid`
- `--c-accent`, `--c-accent-light`, `--c-accent-text`
- `--c-success`, `--c-warn`, `--c-warn-text`
- `--r` (border-radius base: 9px), `--rl` (large: 14px)
- `--shadow-card` (elevazione card)
- `--font-display` (Cinzel), `--font-body` (Crimson Pro)

Nuove variabili sempre in `:root`. Nessun file CSS aggiuntivo oltre `src/App.css`.

Classi utility rilevanti: `.grid-2`, `.trait-grid`, `.alignment-grid`, `.alignment-btn`, `.level-badge`, `.creator-overlay`/`.creator-modal` (pattern modale).

## i18n

Sorgente EN in `src/i18n/locales/en/ui.json`. Traduzioni IT in `src/i18n/locales/it/ui.json`.  
Chiavi organizzate per namespace: `identity.*`, `levelUp.*`, `levelDown.*`, `common.*`, `data.alignments.*`, ecc.  
Nuove stringhe UI sempre via `t('chiave')` con chiave aggiunta in EN + IT.

## Analytics

`window.umami?.track(eventName, payload?)` — sempre con optional chaining (`?.`), nessun import npm.  
Eventi principali: `system-selected`, `creator-opened`, `character-created`, `character-imported`, `character-exported`, `long-rest`, `level-up`, `level-down`, `homebrew-imported`, `tutorial-opened`, `feedback-clicked`.
