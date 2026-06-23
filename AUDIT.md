# CharacterForge — Audit Report
**Data:** 2026-06-22  
**Scope:** `src/` intero, `src/App.css`

---

## 1. Componenti (`src/components/`)

| File | Funzione | Sorgenti dati importate | Logica duplicata |
|------|----------|------------------------|-----------------|
| `ActionManager.jsx` | Gestisce azioni custom con filtri e integrazione spell | `dnd5e2024/spells` (SCHOOLS diretta) | Pattern preset-browser identico a SpellManager, WeaponManager |
| `AlignmentPicker.jsx` | Griglia 3×3 selezione allineamento | `dnd5e2024/mechanics` (ALIGNMENTS diretta) | — |
| `ArmorManager.jsx` | Inventario armature D&D con peso e CA | `dnd5e2024/armors` (TYPE_LABEL, calcArmorAC dirette); `dataManager` per presets | Pattern add/remove/search identico a WeaponManager |
| `BonusEditor.jsx` | UI inline per aggiungere bonus stat | `data/bonuses` (BONUS_STAT_OPTIONS) | — |
| `BonusTextarea.jsx` | **Shim di compatibilità** — re-esporta NotationTextarea | — | — |
| `CharacterCreator.jsx` | Router che delega a DNDCharacterCreator o DHCharacterCreator | — | — |
| `CharacterSelect.jsx` | Lista personaggi con filtro e creazione | `src/chars.js` | CLASS_ICON map hardcoded (non condivisa con nessun altro file) |
| `CharContext.js` | React Context (abilities, traitValues, charLevel, profBonus, systemId) | — | — |
| `ConditionTracker.jsx` | Tracker condizioni/esaurimento | `dnd5e2024/conditions` (DND_CONDITIONS diretta) | — |
| `DHArmorManager.jsx` | Armature Daggerheart con soglie pip | `daggerheart/armor` (DH_ARMORS diretta) | Pattern add/edit/remove identico a ArmorManager |
| `DHWeaponManager.jsx` | Armi Daggerheart | `daggerheart/weapons` (DH_WEAPONS diretta) | Pattern add/edit/remove identico a WeaponManager |
| `DiceText.jsx` | Testo cliccabile con notazione dadi | — | — |
| `FeatureManager.jsx` | Feature di classe/specie/background con badge livello | — (dati passati come prop) | — |
| `FilterSortBar.jsx` | Barra filtro/ordinamento generica | `lucide-react` | — |
| `HomebrewEditor.jsx` | Editor creazione/modifica contenuto homebrew | `dataManager` | — |
| `InventoryManager.jsx` | Inventario oggetti | `dataManager` | Pattern peso/add/edit condiviso con ArmorManager e WeaponManager |
| `LevelDownModal.jsx` | Dialog rimozione livello con checkbox mantenimento | — (dati da prop `levelHistory`) | — |
| `LevelUpModal.jsx` | Wizard level-up multi-step | `dnd5e2024/classes` (DND_CLASSES, SUBCLASS_DATA dirette); `dnd5e2024/mechanics` (ABILITIES, SKILLS dirette); `dnd5e2024/species` (getSpeciesData diretta); `dnd5e2024/feats` (ALL_DND_FEATS diretta) | — |
| `NotationTextarea.jsx` | Textarea con menu notazione slash-command | `src/config` (getNotationMenu) | — |
| `Onboarding.jsx` | Overlay benvenuto/tutorial con language picker | — | — |
| `PinnedBar.jsx` | Barra fissata HP/ispirazione/condizioni/risorse | — (dati da props) | — |
| `SourceManager.jsx` | Import/export/gestione sorgenti homebrew | `dataManager` | — |
| `SpellManager.jsx` | Browser e tracker preparazione incantesimi | `dnd5e2024/spells` (SCHOOLS, SPELL_CLASSES, filterSpells dirette) | Pattern preset-browser identico a ActionManager, WeaponManager |
| `TabBar.jsx` | Navigazione tab con drag-reorder in edit mode | — | — |
| `Tags.jsx` | Tag personaggio con color coding e filtro | — | — |
| `Tooltip.jsx` | Tooltip keyword, risoluzione notazioni, testo con tiri dadi | — | — |
| `WeaponManager.jsx` | Inventario armi con proprietà e masterie | `dnd5e2024/weapons` (WEAPON_PROPERTIES, WEAPON_PROPERTY_DESCS, WEAPON_MASTERIES dirette) | Pattern add/search/filter identico a ArmorManager, SpellManager |
| `WidgetGrid.jsx` | Layout widget drag-and-drop | — | — |
| `WidgetShell.jsx` | Container widget con controlli edit e drag handle | — | — |
| `creators/DNDCharacterCreator.jsx` | Wizard creazione personaggio D&D 5e | `dnd5e2024/mechanics` (ABILITIES, SKILLS, HIT_DICE, SPELLCASTING_CLASS, SLOT_TABLE dirette); `dnd5e2024/classes` (CLASS_FEATURES, CLASS_SAVE_PROFS, CLASS_SKILL_COUNT, CLASS_SKILL_OPTIONS dirette); `dnd5e2024/species` (DND_SPECIES, SPECIES_FEATURES, getAutoFeatures, getSpeciesData dirette); `dnd5e2024/backgrounds` (BACKGROUND_FEATURES diretta); `dnd5e2024/feats` (ORIGIN_FEATS diretta) | — |
| `creators/DHCharacterCreator.jsx` | Wizard creazione personaggio Daggerheart | `daggerheart/*` (dirette) | — |

**Logica duplicata trasversale:**  
- **Pattern preset-browser** (lista filtrata, expand/collapse, add button): `ActionManager`, `SpellManager`, `WeaponManager`, `DHWeaponManager`, `ArmorManager`, `DHArmorManager`  
- **Pattern add-form con peso**: `WeaponManager`, `ArmorManager`, `InventoryManager`  
- **Pattern bonus inline**: `BonusEditor` + logica locale in `WeaponManager` e `InventoryManager`

---

## 2. Duplicazioni nei dati

### `CLASSES` — lista nomi classe D&D

| File | Export | Contenuto |
|------|--------|-----------|
| `src/data/systems/dnd5e2024/mechanics.js:64` | `CLASSES` | Array 12 nomi stringa |
| `src/data/systems/dnd5e2024/classes.js:962` | `DND_CLASS_NAMES` | Array 12 nomi (derivato da `DND_CLASSES.map(c => c.name)`) |
| `src/data/systems/dnd5e2024/classes.js:972` | `SRD_CLASS_NAMES` | Alias di `DND_CLASS_NAMES` |

`CLASSES` in `mechanics.js` è ridondante con `DND_CLASS_NAMES` in `classes.js` e non è importato da nessun file.

### Alias SRD ridondanti in D&D

Ogni file dati D&D esporta un alias `SRD_*` che punta all'array principale:

| File | Export principale | Alias ridondante |
|------|-------------------|-----------------|
| `dnd5e2024/spells.js:339` | `DND_SPELLS` | `SRD_SPELLS = DND_SPELLS` |
| `dnd5e2024/weapons.js:55` | `DND_WEAPONS` | `SRD_WEAPONS = DND_WEAPONS` |
| `dnd5e2024/armors.js:22` | `DND_ARMOR_PRESETS` | `ARMOR_PRESETS = DND_ARMOR_PRESETS` |
| `dnd5e2024/conditions.js:38-39` | `DND_CONDITIONS` | `CONDITIONS` e `SRD_CONDITIONS` (due alias) |
| `dnd5e2024/backgrounds.js:13` | `DND_BACKGROUNDS` | `SRD_BACKGROUNDS = DND_BACKGROUNDS` |
| `dnd5e2024/species.js:98` | `DND_SPECIES` | `SRD_SPECIES = DND_SPECIES` |
| `dnd5e2024/classes.js:971-972` | `DND_CLASSES`, `DND_CLASS_NAMES` | `SRD_CLASSES`, `SRD_CLASS_NAMES` |

### `SPELL_CLASSES` vs lista nomi in altri punti

`dnd5e2024/spells.js:346` definisce `SPELL_CLASSES` (12 nomi). `dnd5e2024/mechanics.js:28-32` definisce `SPELLCASTING_CLASS` (mappa classe→abilità, 8 classi). I nomi sovrapposti non sono riconciliati (es. `SPELL_CLASSES` include "Artificer" non presente in `SPELLCASTING_CLASS`).

---

## 3. Zombie code

### File mai importati

| File | Motivo |
|------|--------|
| `src/components/BonusTextarea.jsx` | Shim di compatibilità, zero import in tutto `src/`. Confermato con grep. |

### Export mai importati

| File | Export | Verificato |
|------|--------|-----------|
| `src/data/systems/dnd5e2024/mechanics.js:64` | `CLASSES` | Nessun `import.*CLASSES` da `mechanics` in tutto `src/` |
| `src/data/systems/dnd5e2024/conditions.js:38-39` | `CONDITIONS`, `SRD_CONDITIONS` | Solo `DND_CONDITIONS` viene importato; i due alias non vengono usati |
| `src/data/systems/dnd5e2024/classes.js:971-972` | `SRD_CLASSES`, `SRD_CLASS_NAMES` | Nessun import di questi alias trovato in `src/` |
| `src/data/systems/dnd5e2024/species.js:98` | `SRD_SPECIES` | Nessun import trovato in `src/` |
| `src/data/systems/dnd5e2024/backgrounds.js:13` | `SRD_BACKGROUNDS` | Nessun import trovato in `src/` |
| `src/data/systems/dnd5e2024/armors.js:22` | `ARMOR_PRESETS` | Nessun import trovato in `src/` |
| `src/data/systems/dnd5e2024/spells.js:339` | `SRD_SPELLS` | Nessun import trovato in `src/` |
| `src/data/systems/dnd5e2024/weapons.js:55` | `SRD_WEAPONS` | Nessun import trovato in `src/` |

### Export da index.js non verificati

`src/data/systems/dnd5e2024/index.js` e `src/data/systems/daggerheart/index.js` esistono ma il loro contenuto non è stato verificato — potrebbero ri-esportare alias mai usati.

---

## 4. Import inconsistenti (bypass di dataManager)

I seguenti file importano dati D&D o Daggerheart **direttamente** dai file sistema invece di passare per `dataManager.js` o i suoi adapter:

### Componenti

| File | Import | Path diretto |
|------|--------|-------------|
| `ActionManager.jsx:9` | `SCHOOLS` | `dnd5e2024/spells` |
| `AlignmentPicker.jsx:3` | `ALIGNMENTS` | `dnd5e2024/mechanics` |
| `ArmorManager.jsx:4` | `TYPE_LABEL`, `calcArmorAC` | `dnd5e2024/armors` |
| `ConditionTracker.jsx:3` | `DND_CONDITIONS` | `dnd5e2024/conditions` |
| `DHArmorManager.jsx:3` | `DH_ARMORS` | `daggerheart/armor` |
| `DHWeaponManager.jsx:4` | `DH_WEAPONS` | `daggerheart/weapons` |
| `LevelUpModal.jsx:3,5,6,7` | `DND_CLASSES`, `SUBCLASS_DATA`, `ABILITIES`, `SKILLS`, `getSpeciesData`, `ALL_DND_FEATS` | `dnd5e2024/classes`, `mechanics`, `species`, `feats` |
| `SpellManager.jsx:3` | `SCHOOLS`, `SPELL_CLASSES`, `filterSpells` | `dnd5e2024/spells` |
| `WeaponManager.jsx:3` | `WEAPON_PROPERTIES`, `WEAPON_PROPERTY_DESCS`, `WEAPON_MASTERIES` | `dnd5e2024/weapons` |
| `creators/DNDCharacterCreator.jsx:4-9` | `ABILITIES`, `SKILLS`, `HIT_DICE`, `SPELLCASTING_CLASS`, `SLOT_TABLE`, `CLASS_FEATURES`, `CLASS_SAVE_PROFS`, `CLASS_SKILL_COUNT`, `CLASS_SKILL_OPTIONS`, `DND_SPECIES`, `SPECIES_FEATURES`, `getAutoFeatures`, `getSpeciesData`, `BACKGROUND_FEATURES`, `ORIGIN_FEATS` | `dnd5e2024/mechanics`, `classes`, `species`, `backgrounds`, `feats` |

### App.jsx (main component)

| Import | Path diretto |
|--------|-------------|
| `SLOT_TABLE`, `ABILITIES`, `SKILLS`, e altro | `dnd5e2024/mechanics:12` |
| `DND_CONDITIONS` | `dnd5e2024/conditions:13` |
| `calcArmorAC`, `DND_ARMOR_PRESETS` | `dnd5e2024/armors:22` |
| `CLASS_FEATURES`, `DND_CLASSES`, `getSubclassesForClass` | `dnd5e2024/classes:35` |
| `SPECIES_FEATURES`, `getAutoFeatures` | `dnd5e2024/species:36` |
| `BACKGROUND_FEATURES` | `dnd5e2024/backgrounds:37` |

**Nota:** `dataManager` non espone `ALIGNMENTS`, `ABILITIES`, `SKILLS`, `SLOT_TABLE`, `HIT_DICE`, `CLASS_FEATURES`, `SPECIES_FEATURES`, `BACKGROUND_FEATURES`, `WEAPON_PROPERTIES`, `TYPE_LABEL`, `filterSpells` — questi non hanno endpoint nel manager e quindi il bypass è inevitabile con l'architettura attuale.

---

## 5. Hardcoded strings

Stringhe UI visibili all'utente codificate direttamente in JSX invece di `t('chiave')`:

| File | Riga | Stringa | Contesto |
|------|------|---------|---------|
| `WeaponManager.jsx` | 131 | `"Es. Spada del nonno"` | `placeholder` input nome |
| `WeaponManager.jsx` | 139 | `"es. 20/60"` | `placeholder` input gittata |
| `DHArmorManager.jsx` | 178 | `"Es. Magic Leather…"` | `placeholder` input nome |
| `DHArmorManager.jsx` | 213 | `"Flexible: +1 to Evasion…"` | `placeholder` input proprietà |
| `DHWeaponManager.jsx` | 137 | `"Es. Blade of the Moon…"` | `placeholder` input nome |
| `DHWeaponManager.jsx` | 157 | `"d8"` | `placeholder` input dado danno |
| `SpellManager.jsx` | 104 | `"Es. 1 minuto, Istantaneo"` | `placeholder` input durata |
| `SpellManager.jsx` | 108 | `"Es. 18m, Sé stessi"` | `placeholder` input gittata |
| `SpellManager.jsx` | 448 | `"Es. Fiamma della Vendetta"` | `placeholder` input nome |
| `SpellManager.jsx` | 473 | `"Es. 1 minuto"` | `placeholder` input durata custom |
| `SpellManager.jsx` | 477 | `"Es. 18m"` | `placeholder` input gittata custom |
| `HomebrewEditor.jsx` | 210 | `"My Homebrew"` | `placeholder` input nome sorgente |
| `LevelUpModal.jsx` | 415 | `"Boon of Combat Prowess"` | `placeholder` input nome boon |
| `creators/DNDCharacterCreator.jsx` | 382 | `"18 m"` | `placeholder` input velocità |

---

## 6. CSS — problemi

### Selettori duplicati a livello globale

I seguenti selettori compaiono più volte come regole top-level (non all'interno di media query o selettori antenato):

| Selettore | Righe | Nota |
|-----------|-------|------|
| `.tab-btn-wrapper` | 508, 1675, 2595 | Prima definizione: `scroll-snap-align + flex-shrink`. Seconda: `position: relative + display: flex`. Terza: solo `position: relative` |
| `.pin-pip` | 2537, 2991 | Prima definizione (Pinned Bar death saves). Seconda definizione (PinnedBar resources) con più proprietà (`display`, `vertical-align`) |

### Sezione "TOUCH-FRIENDLY SIZING" (righe 1913–1974) — ridefinizioni globali con `!important`

I selettori seguenti sono ridefiniti senza selettore contenitore (non dentro `.large-targets` né media query), usando `!important`. Si sovrascrivono le definizioni base globalmente:

| Selettore | Prima definizione | Ridefinizione |
|-----------|------------------|--------------|
| `.spell-prepared-dot` | 942 | 1916 |
| `.check-dot` | 652 | 1924 |
| `.slot-pip` | 917 | 1932 |
| `.save-pip` | 1056 | 1939 |
| `.spell-add-btn` | 1889 | 1946 |
| `.condition-chip` | 1554 | 1969 |

Queste ridefinizioni sembrano intese per `.large-targets` ma mancano del selettore antenato.

### Variabili CSS usate ma non definite in `:root`

| Variabile | Riga di utilizzo | Note |
|-----------|-----------------|------|
| `--font-mono` | 2986 | Usata con fallback inline (`var(--font-mono, monospace)`) — non dichiarata in `:root` |

### `--c-success` — discrepanza con CLAUDE.md

`CLAUDE.md` elenca `--c-success` tra le variabili CSS di `:root`, ma questa variabile **non è presente** in `src/App.css` né come dichiarazione né come utilizzo.

### Utilizzo di `!important`

Tutte le occorrenze si trovano in blocchi con contesto chiaro:

| Blocco | Righe | Motivazione |
|--------|-------|------------|
| `body.high-contrast` | 393–401, 405–406 | Override accessibilità high-contrast |
| `.large-targets` | 417–419, 424–425 | Touch target minimi accessibilità |
| Sezione TOUCH-FRIENDLY (globale) | 1916–1974 | Nessun selettore contenitore — contesto non giustificato |
| `.tab-dragging .tab-btn` | 2602 | Override stato drag — giustificato |

---

## 7. Struttura dati — fonte di verità per sistema

### D&D 5e 2024 (`src/data/systems/dnd5e2024/`)

| Tipo dato | File | Export canonico | Alias/Duplicati |
|-----------|------|-----------------|-----------------|
| Abilità | `mechanics.js:5` | `ABILITIES` | — |
| Skill | `mechanics.js:7-26` | `SKILLS` | — |
| Nomi classi | `classes.js:962` | `DND_CLASS_NAMES` | `SRD_CLASS_NAMES` (alias), `CLASSES` in `mechanics.js` (ridondante) |
| Classi complete | `classes.js:956` | `DND_CLASSES` | `SRD_CLASSES` (alias) |
| Feature di classe | `classes.js` | `CLASS_FEATURES`, `CLASS_LEVEL_DATA` | — |
| Allineamenti | `mechanics.js:69` | `ALIGNMENTS` | — |
| Dadi vita | `mechanics.js:34` | `HIT_DICE` | — |
| Slot incantesimi | `mechanics.js:40` | `SLOT_TABLE` | — |
| Classe incantamento | `mechanics.js:28` | `SPELLCASTING_CLASS` | — |
| Incantesimi | `spells.js:4` | `DND_SPELLS` | `SRD_SPELLS` (alias non usato) |
| Scuole magia | `spells.js:341` | `SCHOOLS` | — |
| Classi per incantesimi | `spells.js:346` | `SPELL_CLASSES` | — |
| Armi | `weapons.js:6` | `DND_WEAPONS` | `SRD_WEAPONS` (alias non usato) |
| Proprietà armi | `weapons.js:59` | `WEAPON_PROPERTIES` | — |
| Masterie armi | `weapons.js:87` | `WEAPON_MASTERIES` | — |
| Armature | `armors.js:3` | `DND_ARMOR_PRESETS` | `ARMOR_PRESETS` (alias non usato) |
| Condizioni | `conditions.js:5` | `DND_CONDITIONS` | `CONDITIONS`, `SRD_CONDITIONS` (alias non usati) |
| Background | `backgrounds.js:5` | `DND_BACKGROUNDS` | `SRD_BACKGROUNDS` (alias non usato) |
| Specie | `species.js:4` | `DND_SPECIES` | `SRD_SPECIES` (alias non usato) |
| Feat | `feats.js:4` | `DND_FEATS` | `ALL_DND_FEATS` (flat), `ORIGIN_FEATS` (subset) |
| Oggetti | `items.js:3` | `SRD_ITEMS` | `SRD_GEAR`, `SRD_TOOLS`, `SRD_AMMUNITION`, `SRD_PACKS`, `SRD_FOCUS` (viste filtrate) |
| Azioni default | `mechanics.js:54` | `DEFAULT_ACTIONS` | — |
| Bonus stat | `src/data/bonuses.js` | `BONUS_STAT_OPTIONS` | — |

### Daggerheart (`src/data/systems/daggerheart/`)

| Tipo dato | File | Export canonico | Alias/Duplicati |
|-----------|------|-----------------|-----------------|
| Ancestrie | `mechanics.js` | `DH_ANCESTRIES` | — |
| Comunità | `mechanics.js` | `DH_COMMUNITIES` | — |
| Classi | `classes.js` | `DH_CLASSES` | — |
| Domini | `classes.js` | `DH_DOMAINS` | — |
| Armi | `weapons.js` | `DH_WEAPONS` | — |
| Armature | `armor.js` | `DH_ARMORS` | — |
| Condizioni | `conditions.js` | `DH_CONDITIONS` | — |
| Tratti | `mechanics.js` | `DH_TRAIT_ARRAY`, `DH_TRAITS` | — |

### Cosa dataManager non espone

`dataManager.js` non ha endpoint per:
- `ALIGNMENTS` — importato direttamente da componenti
- `ABILITIES`, `SKILLS` — importati direttamente
- `SLOT_TABLE`, `HIT_DICE` — importati direttamente
- `CLASS_FEATURES`, `SPECIES_FEATURES`, `BACKGROUND_FEATURES` — importati direttamente
- `WEAPON_PROPERTIES`, `WEAPON_MASTERIES`, `TYPE_LABEL` — importati direttamente
- `filterSpells`, `SCHOOLS`, `SPELL_CLASSES` — importati direttamente
- Nessun dato Daggerheart — `dhAdapter` è registrato in `ADAPTERS` ma non usato da nessun metodo pubblico del manager

Tutti i dati Daggerheart vengono consumati via import diretti dai componenti `DH*` e `DHCharacterCreator`.
