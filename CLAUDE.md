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

### Browser checks — `scripts/browser.mjs`

```bash
npm start                                              # dev server must be up
node scripts/browser.mjs scripts/checks/<name>.mjs     # run a scenario
```

Drives Chrome over the DevTools Protocol using Node's built-in `WebSocket` and
`fetch` — **zero dependencies**, nothing added to `package.json`. A scenario
default-exports `async (page, baseUrl) => {}` and gets `goto`, `eval`, `click`,
`text`, `shot`, `errors`, `wait`. Screenshots land in `scripts/shots/` (gitignored).

- Use `page.click()`, not `el.click()` inside an `eval` — the latter reads the DOM
  before React has flushed `setState` and produces false negatives
- The driver seeds `characterforge_onboarding_seen` so a fresh profile doesn't
  render the tour over every screenshot
- **Assert on what you'd look at, not just on presence.** Two systems mapped to
  the same Lucide glyph passed every "an icon rendered" check and still left the
  dropdown unreadable; only comparing the glyphs caught it

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
- Il vocabolario **condiviso** sta in `CORE_ICONS` in `src/config/icons.jsx`: tutto ciò che
  un sistema qualunque vorrebbe con quel nome (`widget.*`, `tab.*`, `action.*`, `resource.*`,
  e la palette `cond.*`, che è generica per i GDR — Daggerheart ne riusa 3 così com'è)
- Un sistema dichiara in `src/systems/<id>/icons.js` **solo ciò che il core non sa nominare**
  (es. `game.hope` per DH, `game.concentration` per D&D). Usare un id del core non richiede
  di ridichiararlo: basta `<Icon id="widget.armor" />`
- Un plugin può aggiungere id nuovi o sovrascrivere i propri, **mai** rivendicare un id
  condiviso. Due plugin sullo stesso id producono un `console.warn` in sviluppo
- Il **prefisso è semantico**: `Icon` fa `id.startsWith('action.')` per tenere visibili i
  controlli in modalità `none`. Non inventare prefissi nuovi
- `fallback` è una rete per i tab creati dall'utente, **non** una strategia: quel ramo
  ignora `iconMode` e mostra emoji anche a chi ha scelto Lucide o `none`

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
- MAI import diretti da `src/systems/*/data/` nei componenti
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

### State management — `src/hooks/useCharacter.js` + `src/systems/<id>/{state,rules}.js`

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
una chiave per nome**. Lo spread è transitorio: quando la Fase 6 sposterà i widget nei
plugin, si passerà a `ctx.derived.profBonus` e si potrà toglierlo.

**ResultDescriptor** — un mutatore su cui la UI deve riferire ritorna
`{ messageKey, hintKey?, logKey?, logIcon?, analytics?, durationMs? }`. Il plugin non
tocca mai `t()`, il toast o il log; `runRest()` in App.jsx consuma il descriptor.

⚠ **Un personaggio non-D&D non ha più `state.abilities`.** Prima `useCharacter` fondeva
lo stato di default D&D in *ogni* scheda, quindi `state.abilities.STR` era sicuro per
caso. Qualsiasi codice condiviso che legge campi D&D deve guardarli — nei widget D&D,
che la Fase 6 sposterà nel plugin, non serve.

`levelHistory: { [level]: { hpGained, features: [id], spells: [name], subclass, feat, abilityScoreImprovement } }` — default `{}`.

`chars.js` — `saveCharState(id, state, buildEntry)`: il terzo argomento lascia al sistema
decidere cosa finisce nell'indice, che prima era D&D-shaped e portava `charClass` e
`charLevel` anche per una scheda custom che non ne ha.

### Multi-system support — `src/systems/registry.js`

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
`data` (l'adapter), `creator`. `layout`, `state`, `rules`, `widgets`, `modals`, `menu` e
`pins` arrivano nelle fasi successive; `defineSystem` non richiede che esistano.

⚠ `src/config/icons.jsx` importa il registry, e i plugin importano i componenti creator,
che importano `icons.jsx`: è un ciclo. Per questo `getIconMap()` costruisce la mappa **alla
prima chiamata** e non a livello di modulo — leggere `PLUGINS` durante la valutazione
esploderebbe o no a seconda di quale lato del ciclo viene caricato per primo.

### Custom system — `src/systems/custom/data/`

Il sistema `custom` permette di creare schede agnostiche senza regole predefinite.
Non ha character creator — la scheda si apre direttamente con widget di default.

**`mechanics.js`** — `CUSTOM_WIDGET_TYPES`, `createCustomDefaultState()`
**`adapter.js`** — stub per compatibilità con dataManager; `getWidgetTypes()`

**Tipi di widget disponibili:**
`identity`, `bar`, `stat-grid`, `counter`, `text`, `list`, `toggle-list`, `inventory`, `notes`, `log`
Definiti in `CUSTOM_WIDGET_TYPES` — aggiungere nuovi tipi qui e in `CustomWidget.jsx`.

**Struttura state personaggio custom:**

- `state.widgets` — array di widget configurati `{id, type, tab, col, order, config}`
- `state.tabs` — tab configurate dall'utente `{id, label, icon, visible}`
- `state.customFields` — valori dei campi `{ FIELDID: N | { current, max } }`

⚠ **`col` accetta solo `0` (colonna sinistra) e `1` (destra).** `WidgetGrid` filtra
esattamente su questi due valori: un widget con `col: 2` e `fullWidth: false` non
finisce in nessuna colonna e **non viene renderizzato affatto**, senza errori.

⚠ **Le tab del sistema custom hanno due fonti di verità**: lo state React `tabs`
(persistito in `characterforge_tabs_custom`) e `state.tabs` nel personaggio, che è
ciò che `exportCustomTemplate` serializza. Ogni mutazione deve passare da
`commitTabs()` in `App.jsx`, che aggiorna entrambe — altrimenti divergono in silenzio
e l'export del template perde le modifiche.

`label` delle tab di default è una chiave i18n (`customWidgets.tab*`); le tab create
dall'utente contengono un literale già tradotto. `TabBar` fa `t(tab.label)`, che
restituisce invariate le chiavi sconosciute, quindi entrambi i casi funzionano.

**Notazione custom fields:**
Se un widget ha `config.fieldId = 'MANA'`:

- `[MANA]` → valore corrente (number) o current se `{ current, max }`
- `[MANA.max]` → max se il campo è `{ current, max }`
- I custom fields appaiono nel menu `/` come gruppo dinamico, generato da
  `customFieldItems()` in `NotationTextarea.jsx` leggendo `customFields` dal
  `CharContext` — non da `notationMenus.js`, che per `custom` contiene solo dadi e counter

**Export/import template:**

- Template = `{ templateName, tabs, widgets }` — solo struttura, senza dati personaggio
- Disponibile nel menu hamburger quando `activeSystem === 'custom'`
- Import sostituisce layout mantenendo `customFields`, `inventory`, `log`, `charName`

**Il sistema custom non supporta homebrew.** Il dropdown di `HomebrewEditor` è
generato da `Object.keys(HOMEBREW_SCHEMA)`, che ha solo `dnd5e2024` e `daggerheart`:
un sistema senza schema non può essere selezionato. La condivisione per `custom`
avviene tramite export/import di template.

### Struttura per sistema — `src/systems/<id>/`

Ogni sistema di gioco è una cartella auto-contenuta. Aggiungerne uno significa creare
una cartella, non spargere `if (systemId === ...)` nel core.

```text
src/systems/<id>/
  data/         # tabelle SRD + adapter — l'adapter è la sola API pubblica
  components/   # componenti che esistono solo per questo sistema
  bonuses.js    # (solo dnd5e2024) BONUS_STAT_OPTIONS

src/data/
  dataManager.js         # façade sugli adapter — resta condivisa
  systems.js             # registry dei sistemi
  systems/<id>/i18n/     # SOLO i JSON i18n, lasciati qui perché ancorati da crowdin.yml
```

I JSON i18n non sono stati spostati insieme al resto: `crowdin.yml` ne ancora i path e
muoverli richiede di ri-mappare le sorgenti sul progetto Crowdin. `getters.js` di
Daggerheart li raggiunge con `../../../data/systems/daggerheart/i18n/`.

### Data layer — `src/data/`

**`src/data/dataManager.js`** — punto di accesso unificato SRD + homebrew.

⚠ **`systemId` è sempre il PRIMO argomento**, le opzioni sono un oggetto:

```js
dataManager.getSpells(systemId)                 // lingua corrente
dataManager.getWeapons(systemId, { lang: 'it' })
dataManager.getClassData(systemId, 'Wizard')
dataManager.getSubclasses(systemId, 'Wizard')
```

Prima `getArmors(systemId)` lo prendeva primo e `getSpells(lang, systemId)` secondo,
e sei metodi non lo accettavano affatto, restituendo dati D&D a qualunque sistema.

- `getAdapter(systemId)` — l'adapter del sistema; ritorna un adapter vuoto, mai quello D&D,
  per un id sconosciuto
- `getSources()` — deriva da `plugin.homebrew.sourceInfo()`, niente conteggi hardcodati
- `exportSchema(systemId)` — deriva da `plugin.homebrew.exportTemplate()`
- Homebrew in `localStorage` (`characterforge_homebrew`), filtrato per `system`

**Il merge homebrew è generico**: una voce con la stessa chiave (`name`, o `id` per le
condizioni) **sostituisce** quella SRD. Prima `mergeHomebrew` stava sull'adapter D&D,
quindi i pacchetti Daggerheart venivano caricati e poi scartati in silenzio.

⚠ **Un componente che chiama `adapter.getX()` invece di `dataManager.getX()` non riceve
l'homebrew.** È il motivo per cui i manager DH non lo vedevano. `ConditionTracker` fa
ancora così **di proposito**: passare da `dataManager` gli darebbe i nomi dalle tabelle
i18n dei dati, che sono **non tradotte**, perdendo le traduzioni reali di `game.json`.

### Stato delle traduzioni dei dati

⚠ Tutti i file in `src/data/systems/*/i18n/*.i18n.<lang>.json` sono attualmente **copie
identiche dell'inglese** in tutte e quattro le lingue, per entrambi i sistemi. La pipeline
di traduzione dei dati SRD esiste e funziona, ma non ha ancora contenuto da Crowdin:
qualsiasi verifica basata su "i nomi cambiano con la lingua" fallirà per questo motivo,
non per un bug del codice.

**`src/systems/dnd5e2024/data/adapter.js`** espone tutti i dati statici via metodi:
- `getAbilities()`, `getSkills()`, `getAlignments()`, `getHitDice()`, `getSlotTable()`
- `getSpellcastingClass()`, `getSchools()`, `getSpellClasses()`, `filterSpells`
- `getWeaponProperties()`, `getWeaponPropertyDescs()`, `getWeaponMasteries()`, `getAbilityOptions()`
- `getArmorTypeLabel()`, `calcArmorAC`
- `getDefaultActions()`, `getClassFeatures(className)`
- `getClasses()`, `getClassData(name)`, `getSpecies()`, `getBackgrounds()`, `getWeapons()`, `getArmors()`, `getConditions()`

**`src/systems/daggerheart/data/adapter.js`** espone:
- `getTraits()`, `getTraitMap()`, `getAncestries()`, `getCommunities()`
- `getClasses()`, `getClassData(name)`, `getWeapons()`, `getArmors()`, `getConditions()`
- `getProficiency()`, `rollDuality()`, `calcThresholds()`, `createDefaultState()`

**`src/systems/dnd5e2024/data/`**:
- `mechanics.js` — `ABILITIES`, `SKILLS`, `ALIGNMENTS`, `SLOT_TABLE`, `SPELLCASTING_CLASS`, `DEFAULT_ACTIONS`, `createDefaultState()`
- `classes.js` — `DND_CLASSES` con `levelData` (livelli × classe, SRD 5.2.1); `CLASS_FEATURES`, `CLASS_LEVEL_DATA`
- `species.js`, `backgrounds.js`, `armors.js`, `weapons.js`, `spells.js`, `conditions.js`, `feats.js`, `items.js`

**`src/systems/daggerheart/data/`**:
- `mechanics.js` — `createDHDefaultState()`, `DH_TRAITS`, `DH_TRAIT_ARRAY`, `DH_ANCESTRIES`, `DH_COMMUNITIES`, `rollDualityDice()`, `getDHTier()`
  - `DH_ANCESTRY_DATA` — array 18 oggetti `{name, desc, features: [{name, desc}, {name, desc}]}`
  - `DH_COMMUNITY_DATA` — array 9 oggetti `{name, desc, feature: {name, desc}}`
  - `createDHDefaultState()` include `ancestry2: ''` per la seconda ancestry opzionale
- `classes.js` — `DH_CLASSES` con `suggestedTraits: {AGI,STR,FIN,INS,PRE,KNO}`; `DH_SUBCLASSES` — dizionario `{[subclassName]: {class, spellcastTrait?, foundation[], specialization[], mastery[]}}`
- `weapons.js`, `armor.js`, `conditions.js`

**`src/systems/dnd5e2024/bonuses.js`** — `BONUS_STAT_OPTIONS`: CA, INI, VEL, HP, FOR–CAR, TS-FOR–TS-CAR.

**Nota post-refactor Fase 1-3b:**
- Tutti gli alias `SRD_*` sono stati rimossi — usa solo i nomi canonici (`DND_CLASSES`, `DND_WEAPONS`, ecc.)
- `CLASSES` in `mechanics.js` rimosso — usa `DND_CLASS_NAMES` da `classes.js`
- `BonusTextarea.jsx` eliminato — usa `NotationTextarea`
- `SPELL_CLASSES` derivato da `Object.keys(SPELLCASTING_CLASS)`

### Pattern architetturale — accesso ai dati

I componenti **non importano mai direttamente** da `src/systems/*/data/`. Usano sempre `dataManager.getAdapter(systemId)`:

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

Eccezioni attuali con import diretti:

- `App.jsx` — importa da `systems/dnd5e2024/data/*` e `systems/daggerheart/data/*` direttamente
- `hooks/useCharacter.js` — importa `systems/dnd5e2024/data/mechanics`
- `components/Tooltip.jsx` e `components/BonusEditor.jsx` — importano `systems/dnd5e2024/bonuses`
- `components/ActionManager.jsx` — importa `SCHOOLS` da `systems/dnd5e2024/data/spells`

I componenti **dentro** `src/systems/<id>/components/` importano invece liberamente da
`../data/*`: sono parte del proprio sistema, quindi l'accesso diretto è corretto.

### Widget system — `src/layout.js` + `src/systems/<id>/layout.js`

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
`getWidgetLabel(id, systemId)` **richiede** il systemId — non si indovina più il
sistema dal prefisso dell'id (`dh-`, `w_`).

**Chiavi localStorage uniformi**: `characterforge_layout_<id>` e `characterforge_tabs_<id>`
per tutti, D&D incluso, che prima usava la chiave legacy senza suffisso.

⚠ `activeTab` si inizializza dalla **prima tab visibile del sistema**, non da `'main'`
hardcodato: il sistema custom ha tab `identity/inventory/notes/log` e con `'main'`
la scheda si apriva vuota.

⚠ `WidgetShell` riceve `tabs` come prop e non importa più `ALL_TABS`: quelle erano
le tab D&D, offerte dal menu "sposta su tab" **in ogni sistema**, per cui un widget
Daggerheart poteva finire su una tab `spells` che DH non sa renderizzare.

API di `src/layout.js`: `loadLayoutForSystem` / `saveLayoutForSystem`,
`loadTabsForSystem` / `saveTabsForSystem`, `getDefaultLayoutForSystem` /
`getDefaultTabsForSystem`, `getWidgetsForTab(layout, tab)`, `getWidgetLabel(id, systemId)`.

Cataloghi attuali: 22 widget D&D (tab `main`, `combat`, `spells`, `inventory`, `notes`, `log`)
e 12 Daggerheart (tab `main`, `combat`, `inventory`, `notes`).

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

I pezzi presentazionali condivisi stanno in `src/components/sheet/`
(`Field`, `Toast`, `HPBar`, `HMenuGroup`, `ResourceIcon`, `rollDice`, `DICE_ICONS`);
quelli di un solo sistema in `src/systems/<id>/parts.jsx`.

⚠ `dh-actions` **duplica** il case `actions` invece di riusarlo. Prima faceva
`renderWidget('actions')`: il riuso cross-plugin metterebbe le mani di un plugin dentro
un altro. È l'unico punto del refactor in cui "sposta" è diventato "sposta e duplica".

**Lo stato UI e i derivati di un sistema stanno nel plugin**, in
 — un hook, non , perché dipendono da
state React e dalle preferenze di unità:

\
App fonde  e  nel  e non li nomina. È sicuro chiamarlo tramite
variabile perché  si rimonta al cambio di sistema (la key della Fase 3);
senza, scambiare il set di hook sotto un componente vivo violerebbe le regole degli hook.

Restano in App.jsx solo gli affordance generici del foglio (,
, , , ), usati dai widget di ogni sistema.

Il sistema `custom` ha `widgetDefs: []`: i widget stanno in `state.widgets`, li crea l'utente
e li renderizza `CustomWidget`. `WidgetGrid` e `WidgetShell` sono riutilizzati invariati;
`capabilities.userDefinedWidgets` fa mostrare a `WidgetShell` Modifica/Rimuovi invece di
Sposta/Nascondi, e `capabilities.editableTabs` abilita aggiungi/rimuovi tab in `TabBar`.

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

**`src/systems/dnd5e2024/components/LevelUpModal.jsx`** — wizard multi-step: HP → Feature → Scelte → ASI/Feat → Incantesimi → Riepilogo. Salta step vuoti. Legge `CLASS_LEVEL_DATA[classe][livello]` + `charState.subclassFeatures` per le feature di sottoclasse personalizzate.

**`src/systems/dnd5e2024/components/LevelDownModal.jsx`** — mostra cosa verrà rimosso da `levelHistory[livelloCorrente]`; checkbox per mantenere feature/spell singole.

### Custom subclass (D&D 5e)

`charSubclass: string` — nome della sottoclasse.
`subclassFeatures: [{id, level, name, desc}]` — feature per livello, inclusi livelli futuri.
L'editor (`SubclassFeaturesEditor`) è nel widget Identità (edit mode). LevelUpModal inietta automaticamente le feature del livello target durante il level up.

### Character creators — `src/systems/<id>/components/`

- `dnd5e2024/components/DNDCharacterCreator.jsx` — wizard D&D 5e: nome/allineamento → specie (+ lineage) → background → classe → abilità → equipaggiamento
- `daggerheart/components/DHCharacterCreator.jsx` — wizard Daggerheart, step: Identity → Heritage → Traits → Experiences → Summary
  - Identity: nome + classe + sottoclasse (tutti obbligatori). La sottoclasse selezionata mostra `DHSubclassPreview` con foundation (piena), specialization (40% opacity), mastery (25% opacity), spellcast trait se presente
  - Heritage: fino a 2 ancestries (1 → entrambe le feature auto-assegnate; 2 → feat1 da una, feat2 dall'altra, toggle con tasto Swap in `--c-warn`); 1 community. Descrizioni mostrate solo dopo selezione, non sulle card.
  - Traits: assegnazione `DH_TRAIT_ARRAY [2,1,1,0,0,-1]` + bottone "Use Suggested Traits" da `dhClass.suggestedTraits`
  - Helper `getAncestryFeatureAssignment(ancestries, swap)` — calcola l'assegnazione feat1/feat2 in base alle ancestry selezionate e al bool `ancestrySwap`
  - `buildState()` mappa `ancestry: ancestries[0]`, `ancestry2: ancestries[1]`

### Shared components — `src/components/`

- `AlignmentPicker.jsx` — griglia 3×3 per la selezione allineamento (usato in identity widget + creator D&D)
- `FeatureManager.jsx` — feature di classe/specie/sottoclasse con badge `Lv. N` se `acquiredAtLevel` è impostato
- `PresetBrowser.jsx` — browser preset generico riutilizzabile; prop `groupBy` per raggruppare per chiave; usato da `WeaponManager`, `ArmorManager`, `InventoryManager`
- `SpellManager.jsx`, `WeaponManager.jsx`, `ArmorManager.jsx`, `InventoryManager.jsx` — manager con badge livello e pattern preset-browser
- `DHWeaponManager.jsx`, `DHArmorManager.jsx` — versioni Daggerheart degli stessi manager
- `ConditionTracker.jsx` — tracker condizioni unificato per DnD e DH; prop `collapsible` (default `true`), stato aperto/chiuso in `localStorage`
- `custom/CustomWidget.jsx` — renderer generico per widget custom; switch su `widget.type`
- `custom/WidgetEditor.jsx` — modale per aggiungere/configurare widget in edit mode
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

`resolveNotations(text, abilities, charLevel, profBonus, traitMap?, customFields?)` — risolve:

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

**Custom fields** — quando `activeSystem === 'custom'`:
`resolveNotations` riceve `customFields` da `CharContext`.
`[FIELDID]` → valore grezzo dal campo custom (non applica modificatori)
`[FIELDID.max]` → max del campo se è `{ current, max }`
`[FIELDID.current]` → alias di `[FIELDID]`

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

### 2026-06-26 — Refactor Fase 3a + sistema custom

- Estratto `PresetBrowser` generico, applicato a `WeaponManager`, `ArmorManager`, `InventoryManager`
- `ConditionTracker` unificato per DnD e DH — collapsible, pills, adapter-aware
- Sistema `custom` aggiunto: `CustomWidget`, `WidgetEditor`, export/import template
- Notazione estesa con `customFields` — `[FIELDID]`, `[FIELDID.max]`
- Aggiunte variabili CSS `--c-bar-red`, `--c-bar-blue` per i colori widget custom
