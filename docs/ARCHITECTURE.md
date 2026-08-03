# Architecture

Deep-dive reference for `src/`. See [CLAUDE.md](../CLAUDE.md) for the mandatory rules and
quick-start commands — this file is for understanding *why* the code is shaped this way
before you change it.

## Multi-character storage — `src/chars.js`

`localStorage` keys: `characterforge_chars_index`, `characterforge_char_${id}`, `characterforge_active`.
`saveCharState(id, state, buildEntry)` auto-aggiorna l'indice; il terzo argomento lascia
al sistema decidere cosa finisce nell'indice (prima era D&D-shaped e portava `charClass`/
`charLevel` anche per una scheda custom che non ne ha). `migrateLegacy()` converte il
vecchio formato single-char al primo avvio.

## State management — `src/hooks/useCharacter.js` + `src/systems/<id>/{state,rules}.js`

`useCharacter(charId)` è **agnostico**: gestisce solo storage, identità e mutazione
generica di liste. Ogni valore che dipende dalle regole vive nel plugin.

```js
// src/systems/<id>/state.js
export default {
  create:         () => ({ … }),   // stato di default del sistema
  schemaVersion:  '1.0.0',
  normalize:      saved => saved,  // opzionale, applicato al load
  charIndexEntry: s => ({ … }),    // cosa mostra la lista personaggi
};

// src/systems/<id>/rules.js — riceve solo { state, update }
export default function rules({ state, update }) {
  return {
    derived: { profBonus, spellSaveDC, … },  // opachi al core
    actions: { longRest, levelUp, … },
  };
}
```

Il core fa lo spread di `derived` e `actions` sull'oggetto ritornato e **non legge mai
una chiave per nome**.

**ResultDescriptor** — un mutatore su cui la UI deve riferire ritorna
`{ messageKey, hintKey?, logKey?, logIcon?, analytics?, durationMs? }`. Il plugin non
tocca mai `t()`, il toast o il log; `runRest()` in App.jsx consuma il descriptor.

⚠ **Un personaggio non-D&D non ha più `state.abilities`.** Prima `useCharacter` fondeva
lo stato di default D&D in *ogni* scheda, quindi `state.abilities.STR` era sicuro per
caso. Qualsiasi codice condiviso che legge campi D&D deve guardarli.

`levelHistory: { [level]: { hpGained, features: [id], spells: [name], subclass, feat, abilityScoreImprovement } }` — default `{}`.

## Multi-system support — `src/systems/registry.js`

`activeSystem` è memorizzato in `localStorage`. **`registry.js` è l'unico file del core che
nomina sistemi concreti**: aggiungerne uno significa una riga lì più la sua cartella.

```js
import { getPlugin, supports, SYSTEM_METAS, DEFAULT_SYSTEM } from './systems/registry';

const sys = getPlugin(activeSystem);       // mai un if su systemId
if (sys.capabilities.rests) { … }          // chiedi cosa supporta, non chi è
```

**Regola:** nel codice condiviso non si scrive `if (systemId === 'daggerheart')`. Si aggiunge
una capability in `CAPABILITY_DEFAULTS` (`src/systems/contract.js`) e si interroga quella.
`defineSystem()` rifiuta le capability non dichiarate: un refuso diventa un errore all'avvio
invece di leggersi come `false` per sempre.

Un id sconosciuto risolve a `src/systems/unknown.js`, che ha tutte le capability a `false`.
**Non ricade su D&D**: il vecchio `getAdapter()` restituiva l'adapter D&D per qualsiasi id,
ed è così che un id sbagliato diventa corruzione silenziosa dei dati.

Campi del contratto già popolati: `meta`, `capabilities`, `icons`, `notation`, `homebrew`,
`data` (l'adapter), `creator`, `layout`, `state`, `rules`, `widgets`, `pins`,
`useWidgetState`, `i18n.bundles`. `modals` e `menu` solo dove servono (D&D e custom hanno
`modals`, DH no). `defineSystem` non richiede che nessuno di questi esista: un plugin che
non dichiara `i18n` semplicemente non contribuisce stringhe oltre a `ui.json`.

⚠ `src/config/icons.jsx` importa il registry, e i plugin importano i componenti creator,
che importano `icons.jsx`: è un ciclo. Per questo `getIconMap()` costruisce la mappa **alla
prima chiamata** e non a livello di modulo.

## Custom system — `src/systems/custom/`

Il sistema `custom` permette di creare schede agnostiche senza regole predefinite. Non ha
character creator — la scheda si apre direttamente con widget di default.

`mechanics.js` — `CUSTOM_WIDGET_TYPES`, `createCustomDefaultState()`.
`adapter.js` — stub per compatibilità con dataManager; `getWidgetTypes()`.

**Tipi di widget:** `identity`, `bar`, `stat-grid`, `counter`, `text`, `list`, `toggle-list`,
`inventory`, `notes`, `log` — definiti in `CUSTOM_WIDGET_TYPES`, aggiungere nuovi tipi qui
e in `CustomWidget.jsx`.

**Struttura state:**
- `state.widgets` — array di widget configurati `{id, type, tab, col, order, config}`
- `state.tabs` — tab configurate dall'utente `{id, label, icon, visible}`
- `state.customFields` — valori dei campi `{ FIELDID: N | { current, max } }`

⚠ **`col` accetta solo `0` (sinistra) e `1` (destra).** `WidgetGrid` filtra esattamente su
questi due valori: un widget con `col: 2` e `fullWidth: false` non finisce in nessuna
colonna e **non viene renderizzato affatto**, senza errori.

⚠ **Le tab custom hanno due fonti di verità**: lo state React `tabs` (persistito in
`characterforge_tabs_custom`) e `state.tabs` nel personaggio, che è ciò che
`exportCustomTemplate` serializza. Ogni mutazione deve passare da `commitTabs()` in
`App.jsx`, che aggiorna entrambe — altrimenti divergono in silenzio e l'export del
template perde le modifiche.

`label` delle tab di default è una chiave i18n (`customWidgets.tab*`); le tab create
dall'utente contengono un literale già tradotto. `TabBar` fa `t(tab.label)`, che
restituisce invariate le chiavi sconosciute, quindi entrambi i casi funzionano.

**Notazione custom fields** — se un widget ha `config.fieldId = 'MANA'`:
- `[MANA]` → valore corrente (number) o current se `{ current, max }`
- `[MANA.max]` → max se il campo è `{ current, max }`
- Appaiono nel menu `/` come gruppo dinamico via `customFieldItems()` in
  `NotationTextarea.jsx`, letto dal `CharContext` — non da `notationMenus.js`, che per
  `custom` contiene solo dadi e counter

**Export/import template:** `{ templateName, tabs, widgets }` — solo struttura, nel menu
hamburger quando `activeSystem === 'custom'`. Import sostituisce layout mantenendo
`customFields`, `inventory`, `log`, `charName`.

**Non supporta homebrew** — il dropdown di `HomebrewEditor` è generato da
`Object.keys(HOMEBREW_SCHEMA)`, che ha solo `dnd5e2024` e `daggerheart`. La condivisione
per `custom` avviene tramite export/import di template.

## Struttura per sistema — `src/systems/<id>/`

```text
src/systems/<id>/
  data/         # tabelle SRD + adapter — l'adapter è la sola API pubblica
  components/   # componenti che esistono solo per questo sistema
  bonuses.js    # (solo dnd5e2024) BONUS_STAT_OPTIONS
  i18n/         # <name>.i18n.json (SRD data) + ui.i18n.json (stringhe UI del plugin)

src/data/
  dataManager.js         # façade sugli adapter — resta condivisa
```

`src/data/systems/` non esiste più (Fase 8): i JSON i18n delle tabelle SRD sono stati
spostati con `git mv` dentro `src/systems/<id>/i18n/`, a fianco del bundle di stringhe UI
del plugin. `getters.js` di Daggerheart e `data/i18n.js` di D&D li raggiungono con
`../i18n/`. Tutti i file in quella cartella seguono la stessa convenzione
`<name>.i18n.json` (sorgente) / `<name>.i18n.<lang>.json` (traduzione), SRD e UI comprese:
è quello che permette a `crowdin.yml` di coprirli con un solo wildcard.

## Data layer — `src/data/dataManager.js`

Punto di accesso unificato SRD + homebrew.

⚠ **`systemId` è sempre il PRIMO argomento**, le opzioni sono un oggetto:

```js
dataManager.getSpells(systemId)                 // lingua corrente
dataManager.getWeapons(systemId, { lang: 'it' })
dataManager.getClassData(systemId, 'Wizard')
dataManager.getSubclasses(systemId, 'Wizard')
```

- `getAdapter(systemId)` — l'adapter del sistema; ritorna un adapter vuoto, mai quello D&D,
  per un id sconosciuto
- `getSources()` — deriva da `plugin.homebrew.sourceInfo()`, niente conteggi hardcodati
- `exportSchema(systemId)` — deriva da `plugin.homebrew.exportTemplate()`
- Homebrew in `localStorage` (`characterforge_homebrew`), filtrato per `system`

**Il merge homebrew è generico**: una voce con la stessa chiave (`name`, o `id` per le
condizioni) **sostituisce** quella SRD.

⚠ **Un componente che chiama `adapter.getX()` invece di `dataManager.getX()` non riceve
l'homebrew.** `ConditionTracker` fa ancora così **di proposito**: passare da `dataManager`
gli darebbe i nomi dalle tabelle i18n dei dati, che sono **non tradotte**, perdendo le
traduzioni reali di `game.json`.

### Adapter API attuali

`src/systems/dnd5e2024/data/adapter.js`: `getAbilities()`, `getSkills()`, `getAlignments()`,
`getHitDice()`, `getSlotTable()`, `getSpellcastingClass()`, `getSchools()`,
`getSpellClasses()`, `filterSpells`, `getWeaponProperties()`, `getWeaponPropertyDescs()`,
`getWeaponMasteries()`, `getAbilityOptions()`, `getArmorTypeLabel()`, `calcArmorAC`,
`getDefaultActions()`, `getClassFeatures(className)`, `getClasses()`, `getClassData(name)`,
`getSpecies()`, `getBackgrounds()`, `getWeapons()`, `getArmors()`, `getConditions()`.

`src/systems/daggerheart/data/adapter.js`: `getTraits()`, `getTraitMap()`,
`getAncestries()`, `getCommunities()`, `getClasses()`, `getClassData(name)`, `getWeapons()`,
`getArmors()`, `getConditions()`, `getProficiency()`, `rollDuality()`, `calcThresholds()`,
`createDefaultState()`.

Data modules: `dnd5e2024/data/{mechanics,classes,species,backgrounds,armors,weapons,spells,conditions,feats,items}.js`;
`daggerheart/data/{mechanics,classes,weapons,armor,conditions}.js`. `dnd5e2024/bonuses.js`
holds `BONUS_STAT_OPTIONS` (CA, INI, VEL, HP, FOR–CAR, TS-FOR–TS-CAR).

### Pattern architetturale — accesso ai dati

I componenti **non importano mai direttamente** da `src/systems/*/data/`. Usano sempre
`dataManager.getAdapter(systemId)`. Eccezioni attuali con import diretti: `App.jsx`
(importa da entrambi i sistemi), `hooks/useCharacter.js` (`dnd5e2024/data/mechanics`),
`components/Tooltip.jsx` e `components/BonusEditor.jsx` (`dnd5e2024/bonuses`),
`components/ActionManager.jsx` (`SCHOOLS` da `dnd5e2024/data/spells`). I componenti
**dentro** `src/systems/<id>/components/` importano invece liberamente da `../data/*`.

### Stato delle traduzioni dei dati

⚠ Tutti i file in `src/systems/*/i18n/*.i18n.<lang>.json` (le tabelle SRD, non il bundle
`ui.i18n.*`) sono attualmente **copie identiche dell'inglese** in tutte e quattro le
lingue, per entrambi i sistemi. La pipeline esiste e funziona, ma non ha ancora contenuto
da Crowdin: qualsiasi verifica basata su "i nomi cambiano con la lingua" fallirà per
questo motivo, non per un bug del codice.

## Widget system — `src/layout.js` + `src/systems/<id>/layout.js`

Il catalogo dei widget e le tab di default vivono nel plugin:

```js
// src/systems/<id>/layout.js
export default {
  storageSuffix: '<id>',     // → characterforge_layout_<id> / _tabs_<id>
  widgetDefs:    [ { id, label, defaultTab, defaultCol, defaultFullWidth, defaultBottomFull } ],
  defaultTabs:   [ { id, label, icon, visible } ],
  renames:       { vecchioId: 'nuovoId' },  // opzionale, applicato al load
  defaultLayout() { … },                    // opzionale — se il layout non deriva da widgetDefs
};
```

`src/layout.js` non nomina più nessun sistema: è tutto lookup dal registry.
`getWidgetLabel(id, systemId)` **richiede** il systemId — non si indovina più il sistema
dal prefisso dell'id. Chiavi localStorage uniformi per tutti: `characterforge_layout_<id>`
/ `characterforge_tabs_<id>`.

⚠ `activeTab` si inizializza dalla **prima tab visibile del sistema**, non da `'main'`
hardcodato: il sistema custom ha tab `identity/inventory/notes/log` e con `'main'` la
scheda si apriva vuota.

⚠ `WidgetShell` riceve `tabs` come prop e non importa più `ALL_TABS`: quelle erano le tab
D&D, offerte dal menu "sposta su tab" **in ogni sistema**, per cui un widget Daggerheart
poteva finire su una tab `spells` che DH non sa renderizzare.

API di `src/layout.js`: `loadLayoutForSystem` / `saveLayoutForSystem`,
`loadTabsForSystem` / `saveTabsForSystem`, `getDefaultLayoutForSystem` /
`getDefaultTabsForSystem`, `getWidgetsForTab(layout, tab)`, `getWidgetLabel(id, systemId)`.

Cataloghi attuali: 22 widget D&D (tab `main`, `combat`, `spells`, `inventory`, `notes`,
`log`) e 12 Daggerheart (tab `main`, `combat`, `inventory`, `notes`).

**Il rendering vive nel plugin**: `src/systems/<id>/widgets.jsx` esporta `render(id, ctx)`.
`App.jsx` costruisce `ctx` una volta e delega — non sa quali id esistano.

```js
ctx = {
  core:    { state, update, char, t, editMode, layout, activeSystem },
  ui:      { …useState di edit-mode, memo dipendenti dalle unità },
  derived: { effectiveAbilities, equipBonuses, acDerivedData, … },
  shell:   { handleRoll, showToast, addLog, apri-modali, … },
  units:   { toDisplaySpeed, toDisplayWeight, speedUnit, weightUnit },
}
```

I pezzi presentazionali condivisi stanno in `src/components/sheet/` (`Field`, `Toast`,
`HPBar`, `HMenuGroup`, `ResourceIcon`, `rollDice`, `DICE_ICONS`); quelli di un solo
sistema in `src/systems/<id>/parts.jsx`.

⚠ `dh-actions` **duplica** il case `actions` invece di riusarlo — il riuso cross-plugin
metterebbe le mani di un plugin dentro un altro. È l'unico punto in cui "sposta" è
diventato "sposta e duplica".

**Lo stato UI e i derivati di un sistema stanno nel plugin**, in
`src/systems/<id>/useWidgetState.js` — un hook, non `rules.js`, perché dipendono da state
React e dalle preferenze di unità:

```js
export default function useWidgetState({ state, char, units }) {
  return { ui: { /* useState + memo */ }, derived: { /* valori calcolati */ } };
}
```

App fonde `ui` e `derived` nel `ctx` e non li nomina. È sicuro chiamarlo tramite variabile
perché `CharacterApp` si rimonta al cambio di sistema; senza, scambiare il set di hook
sotto un componente vivo violerebbe le regole degli hook.

⚠ Il campo `useWidgetState` è **opzionale**: un sistema che non ne ha bisogno non lo
dichiara, e App non tocca nulla — è questo che permette di aggiungere un sistema senza
modificare `App.jsx`.

Il sistema `custom` ha `widgetDefs: []`: i widget stanno in `state.widgets`, li crea
l'utente e li renderizza `CustomWidget`. `capabilities.userDefinedWidgets` fa mostrare a
`WidgetShell` Modifica/Rimuovi invece di Sposta/Nascondi, e `capabilities.editableTabs`
abilita aggiungi/rimuovi tab in `TabBar`.

## Main component — `src/App.jsx`

Componenti locali (definiti nel file prima di `CharacterApp`): `SubclassFeaturesEditor`,
`ActionItem`, `AbilityBox`, `DHPipRow`, `DHDomainCardForm`.

`CharContext` fornisce `{abilities, traitValues, charLevel, profBonus, systemId}` a
componenti profondi. `renderWidget(id)` è lo switch su tutti i widget ID. `showLevelUp` /
`showLevelDown` sono state per i modal level up/down (solo `activeSystem === 'dnd5e2024'`).

Pattern chiave: `equipBonuses` (`useMemo`) aggrega `bonuses: [{stat, value}]` da weapon e
equipment in `{CA: N, ...}`, badge `+N 🎒`. `actionNames` (`useMemo`) è il Set di nomi
azioni già aggiunte — stato ⚡/✓ in WeaponManager/InventoryManager. `editMode` (bool)
passata a ogni widget: in edit mode click apre il form inline, in read mode espande/collassa.

## Level up/down (D&D 5e only)

`dnd5e2024/components/LevelUpModal.jsx` — wizard: HP → Feature → Scelte → ASI/Feat →
Incantesimi → Riepilogo. Salta step vuoti. Legge `CLASS_LEVEL_DATA[classe][livello]` +
`charState.subclassFeatures`.

`dnd5e2024/components/LevelDownModal.jsx` — mostra cosa verrà rimosso da
`levelHistory[livelloCorrente]`; checkbox per mantenere feature/spell singole.

**Custom subclass**: `charSubclass: string`, `subclassFeatures: [{id, level, name, desc}]`.
Editor (`SubclassFeaturesEditor`) nel widget Identità (edit mode). LevelUpModal inietta
automaticamente le feature del livello target.

## Character creators — `src/systems/<id>/components/`

- `dnd5e2024/components/DNDCharacterCreator.jsx` — nome/allineamento → specie (+ lineage)
  → background → classe → abilità → equipaggiamento
- `daggerheart/components/DHCharacterCreator.jsx` — Identity → Heritage → Traits →
  Experiences → Summary
  - Identity: nome + classe + sottoclasse (obbligatori); `DHSubclassPreview` mostra
    foundation (piena), specialization (40% opacity), mastery (25% opacity), spellcast
    trait se presente
  - Heritage: fino a 2 ancestries (1 → entrambe le feature auto-assegnate; 2 → feat1 da
    una, feat2 dall'altra, toggle Swap in `--c-warn`); 1 community. Descrizioni mostrate
    solo dopo selezione
  - Traits: `DH_TRAIT_ARRAY [2,1,1,0,0,-1]` + bottone "Use Suggested Traits" da
    `dhClass.suggestedTraits`
  - `getAncestryFeatureAssignment(ancestries, swap)` calcola feat1/feat2
  - `buildState()` mappa `ancestry: ancestries[0]`, `ancestry2: ancestries[1]`

## Shared components — `src/components/`

`AlignmentPicker.jsx`, `FeatureManager.jsx` (badge `Lv. N`), `PresetBrowser.jsx` (browser
preset generico, prop `groupBy`, usato da Weapon/Armor/InventoryManager),
`SpellManager.jsx`/`WeaponManager.jsx`/`ArmorManager.jsx`/`InventoryManager.jsx`,
`DHWeaponManager.jsx`/`DHArmorManager.jsx`, `ConditionTracker.jsx` (unificato DnD+DH, prop
`collapsible`), `custom/CustomWidget.jsx`, `custom/WidgetEditor.jsx`, `LevelUpModal.jsx`/
`LevelDownModal.jsx`, `Tooltip.jsx` (`resolveNotations()`, `KeywordText`,
`NotationHelpBar`, `KEYWORD_GLOSSARY`), `NotationTextarea.jsx`, `Tags.jsx`,
`BonusEditor.jsx`, `FilterSortBar.jsx`, `SourceManager.jsx`, `HomebrewEditor.jsx`,
`WidgetGrid.jsx`/`WidgetShell.jsx`, `TabBar.jsx`.

## Notation system — `src/components/Tooltip.jsx`

`resolveNotations(text, abilities, charLevel, profBonus, traitMap?, customFields?)` risolve:

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

STAT valide: `AC`, `INIT`, `SPD`, `HP`, `STR`–`CHA`, `SAV-STR`–`SAV-CHA`, `SK-ACRO`–`SK-SURV`.

La vecchia sintassi `[LVL:val,N:val]` è stata rimossa — usa `[LVL=N:...]`. Esempio:
`[LVL=1:1d6,5:1d8,11:1d10]` → 1d6 dal lv1, 1d8 dal lv5, 1d10 dall'11.

`KeywordText` usa `useCharContext()` senza prop drilling. `NotationHelpBar` mostra la
reference rapida — aggiornala se aggiungi nuovi token.

**Custom fields** — quando `activeSystem === 'custom'`, `resolveNotations` riceve
`customFields` dal `CharContext`: `[FIELDID]` → valore grezzo, `[FIELDID.max]` → max se
`{ current, max }`, `[FIELDID.current]` → alias di `[FIELDID]`.

## Homebrew system — `src/utils/homebrewSync.js`

`syncCustomToDraft(type, item, system)` — quando l'utente aggiunge un elemento custom
dalla scheda (arma, incantesimo, condizione, oggetto, feature), lo copia automaticamente
nel draft homebrew in localStorage (`characterforge_homebrew_draft`).

`HOMEBREW_SCHEMA` in `src/config/homebrewSchema.js` — configurazione dichiarativa dei campi
per ogni tipo di entità homebrew per sistema. `HomebrewEditor` legge questa config per
renderizzare i form. Aggiungere nuovi tipi qui prima di modificare `HomebrewEditor`.

## i18n bundle split (Fase 8) — dettaglio

`ui.json` contiene solo il chrome davvero condiviso: navigazione, menu, form generici, il
wizard di creazione (bottoni Back/Next/Create, non i suoi step), i widget riusati da più
sistemi (`widgets.conditions`, `widgets.actions`). Il resto vive nel bundle del plugin:
`src/systems/<id>/i18n/ui.i18n.json` (+ `ui.i18n.<lang>.json`), stessa forma di `ui.json`
— chiave in cima uguale a quella che il componente già chiama con `t()`, perché i bundle
vengono fusi con `deepMerge` dentro `src/i18n/index.js`, non caricati come namespace
i18next separati. Un componente non cambia mai `t('combat.ac')` in `t('dnd.combat.ac')`:
sposta solo il JSON che lo definisce.

**Il criterio per decidere dove va una chiave è "chi chiama `t()` su di essa", non "a chi
sembra appartenere concettualmente".** Se il chiamante vive dentro `src/systems/<id>/`, la
chiave va nel bundle di quel plugin — anche se il codice che la chiama è generico (es.
`armor.*`/`spells.*` sono chiamate solo da `ArmorManager`/`SpellManager`, componenti
condivisi in `src/components/`, ma **oggi** solo D&D li usa: la chiave sta comunque nel
bundle `dnd5e2024`). Se un top-level namespace è usato da **file di sistemi diversi con
chiavi diverse** (es. `creator.nameLabel`/`back`/`next` da entrambi i creator,
`creator.speciesTitle` solo da quello D&D), si spacca: core tiene le chiavi davvero
condivise, ogni plugin aggiunge le proprie sotto lo stesso namespace, `deepMerge` li
ricompone. Namespace il cui codice-chiamante è ancora centralizzato in un file core (es.
`pinned.*`, che `PinnedBar.PinContent` gestisce con `if` su entrambi i sistemi — debito
noto) **restano interi in core**.

`crowdin.yml` copre `src/systems/*/i18n/*.i18n.json` con un solo wildcard (source SRD e
bundle UI condividono la stessa convenzione di nome file): aggiungere un sistema non
tocca `crowdin.yml`.
