# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CharacterForge

React PWA — scheda personaggio D&D 5e SRD 5.2 (CC BY 4.0), in italiano.
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
- Dark mode automatica via `prefers-color-scheme`
- Font: Cinzel (display/label) + Crimson Pro (body) — Google Fonts

## Architecture

### Multi-character storage — `src/chars.js`

`localStorage` keys: `characterforge_chars_index`, `characterforge_char_${id}`, `characterforge_active`.  
`saveCharState(id, state)` auto-aggiorna l'indice. `migrateLegacy()` converte il vecchio formato single-char al primo avvio.

### State management — `src/hooks/useCharacter.js`

`useCharacter(charId)` è l'unica fonte di verità per il personaggio. Esporta:
- `state` — oggetto completo del personaggio
- `update(patch)` — merge superficiale + auto-save su localStorage
- Derivati calcolati: `profBonus`, `initiative`, `passivePerception`, `hitDice`, `spellStat`, `spellSaveDC`, `spellAttackBonus`
- Mutatori specializzati: `onClassOrLevelChange(patch)` (ricalcola slot incantesimi), `onUpdateTags`, `onCreateTag`, `onAddAction`, `onRemoveAction`

### Widget system — `src/layout.js`

22 `WIDGET_DEFS` con `{id, label, defaultTab, defaultCol, defaultFullWidth}`.  
6 tab di default: main, combat, spells, inventory, notes, log.  
`loadLayout()` / `saveLayout()` / `loadTabs()` / `saveTabs()` — persistenza su localStorage.  
`getWidgetsForTab(layout, tab)` — ritorna widget filtrati e ordinati per un tab.  
Ogni widget ha un `renderWidget(id)` corrispondente in `App.jsx` (~line 400+).

### Main component — `src/App.jsx`

Struttura principale:
- `CharContext` (React Context) — fornisce `{abilities, charLevel}` a componenti profondi
- `ActionItem` — componente locale per le azioni del personaggio
- `AbilityBox` — componente locale per le caratteristiche
- `renderWidget(id)` — switch su tutti i 22 widget ID

#### Pattern chiave in App.jsx

**`equipBonuses`** (`useMemo`): aggrega `bonuses: [{stat, value}]` da tutti i weapon e equipment, espone come `{CA: N, DES: N, 'TS-FOR': N, ...}`. Passato come badge `+N 🎒` sui stat interessati.

**`actionNames`** (`useMemo`): Set di nomi azioni già aggiunte — usato per lo stato ⚡/✓ in WeaponManager e InventoryManager.

**`editMode`**: prop boolean passata a ogni widget per abilitare modifica inline. In `editMode`, click su un item apre il form inline (click di nuovo chiude). In read mode, click espande/collassa.

### Notation system — `src/components/Tooltip.jsx`

`resolveNotations(text, abilities, charLevel)` — risolve:
- `[FOR]`, `[DES]`, ecc. → modificatore della caratteristica
- `[LVL:base,threshold:value,...]` → scaling per livello

`KeywordText` usa `useCharContext()` per accedere a `abilities`/`charLevel` senza prop drilling.

`KEYWORD_GLOSSARY` — glossario termini D&D 5e italiani con definizioni tooltip.

### Tag system — `src/components/Tags.jsx`

Tag globali per personaggio con color coding. `onUpdateTags(itemId, tags)` e `onCreateTag(tag)` gestiti in `useCharacter.js`. Il sync cross-widget (stesso nome = stessi tag) avviene tramite mutatori nel hook.

### Equipment bonus system

`src/data/bonuses.js` — `BONUS_STAT_OPTIONS`: CA, INI, VEL, HP, FOR–CAR, TS-FOR–TS-CAR.  
`src/components/BonusEditor.jsx` — componente riutilizzabile (usato in WeaponManager e InventoryManager).  
I bonus sono informativi: il valore base rimane sotto controllo dell'utente.

## Key data files

- `src/data/dnd5e.js` — ABILITIES, SKILLS, SLOT_TABLE, SPELLCASTING_CLASS
- `src/data/spells.js` — lista incantesimi SRD 5.2
- `src/data/weapons.js` — WEAPON_PRESETS, WEAPON_PROPERTIES, WEAPON_MASTERIES
- `src/data/bonuses.js` — BONUS_STAT_OPTIONS
- `src/data/conditions.js` — condizioni SRD

## CSS conventions

Variabili in `:root` (src/App.css):
- `--c-bg`, `--c-surface`, `--c-ink`, `--c-muted`, `--c-border`, `--c-border-mid`
- `--c-accent`, `--c-accent-light`, `--c-accent-text`
- `--c-success`, `--c-warn`, `--c-warn-text`
- `--r` (border-radius base: 9px), `--rl` (large: 14px)
- `--shadow-card` (elevazione card)
- `--font-display` (Cinzel), `--font-body` (Crimson Pro)

Nuove variabili sempre in `:root`. Nessun file CSS aggiuntivo.
