# Spec: Sistema internazionalizzazione (i18n)

## Contesto
CharacterForge è una React PWA con UI attualmente hardcodata in italiano.
Questa spec descrive l'implementazione di i18next per supportare più lingue,
mantenendo italiano come default e aggiungendo inglese come seconda lingua.

I dati SRD (nomi incantesimi, classi, condizioni, ecc.) sono separati dalla UI
e gestiti con un sistema di lingua dati indipendente dalla lingua interfaccia.

## File rilevanti da NON rompere
- `src/App.jsx` — componente principale con tutti i widget
- `src/layout.js` — DEFAULT_TABS con label, WIDGET_DEFS con label
- `src/hooks/useCharacter.js` — usa charId, saveCharState, loadCharState da src/chars
- `src/chars.js` — gestione multi-personaggio (non toccare)
- localStorage keys esistenti: `characterforge_layout`, `characterforge_tabs`,
  `characterforge_state`, `characterforge_homebrew`

---

## Architettura

### Dipendenze da installare
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Struttura file nuovi
```
src/
├── i18n/
│   ├── index.js          ← configurazione i18next
│   ├── locales/
│   │   ├── it/
│   │   │   ├── ui.json        ← stringhe interfaccia italiano
│   │   │   ├── game.json      ← termini di gioco italiano (condizioni, tipi danno, ecc.)
│   │   │   └── srd.json       ← nomi SRD in italiano (incantesimi, classi, ecc.)
│   │   └── en/
│   │       ├── ui.json        ← stringhe interfaccia inglese
│   │       ├── game.json      ← termini di gioco inglese
│   │       └── srd.json       ← nomi SRD in inglese (ufficiali CC BY 4.0)
```

### Configurazione i18n/index.js
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import itUI   from './locales/it/ui.json';
import itGame from './locales/it/game.json';
import enUI   from './locales/en/ui.json';
import enGame from './locales/en/game.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'it',
    defaultNS: 'ui',
    resources: {
      it: { ui: itUI, game: itGame },
      en: { ui: enUI, game: enGame },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'characterforge_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### Importazione in src/index.js
Aggiungere PRIMA di tutto il resto:
```js
import './i18n';   // deve essere la prima riga dopo React
import React from 'react';
// ... resto invariato
```

---

## Due lingue indipendenti

Il sistema ha DUE impostazioni lingua separate:

1. **Lingua interfaccia** (`characterforge_lang`): italiano / inglese
   - Controlla label widget, bottoni, placeholder, messaggi, ecc.
   - Usa i18next / `useTranslation()`

2. **Lingua dati SRD** (`characterforge_data_lang`): italiano / inglese
   - Controlla i nomi di incantesimi, classi, condizioni, tipi danno, ecc.
   - NON usa i18next — usa un semplice import condizionale da srd.it.js / srd.en.js
   - Un giocatore italiano può avere UI italiana ma spell list in inglese
     per coerenza con i manuali fisici che usa

---

## File di traduzione

### src/i18n/locales/it/ui.json (struttura)
```json
{
  "brand": "CharacterForge",
  "nav": {
    "newCharacter": "⚔ Nuovo",
    "export": "⬇ Esporta",
    "import": "⬆ Importa",
    "layout": "⠿ Layout",
    "layoutDone": "✓ Fine layout",
    "reset": "↺ Reset"
  },
  "tabs": {
    "main": "Personaggio",
    "combat": "Combattimento",
    "spells": "Magie",
    "inventory": "Inventario",
    "notes": "Note",
    "log": "Log"
  },
  "widgets": {
    "identity": "Identità",
    "abilities": "Caratteristiche",
    "saves": "Tiri salvezza",
    "skills": "Abilità",
    "senses": "Sensi",
    "hp": "Punti ferita",
    "combatStats": "Statistiche combattimento",
    "inspiration": "Ispirazione & Concentrazione",
    "deathSaves": "Tiri salvezza morte",
    "conditions": "Condizioni",
    "actions": "Azioni",
    "weapons": "Armi",
    "spellStats": "Statistiche lancio",
    "spellSlots": "Slot incantesimo",
    "spells": "Incantesimi",
    "inventory": "Equipaggiamento",
    "currency": "Valuta",
    "traits": "Tratti personaggio",
    "freeNotes": "Note libere",
    "classFeatures": "Feature di classe",
    "activityLog": "Log attività",
    "armor": "Armatura"
  },
  "identity": {
    "name": "Nome personaggio",
    "class": "Classe",
    "classPlaceholder": "— Scegli classe —",
    "species": "Razza / Specie",
    "speciesPlaceholder": "— Scegli specie —",
    "speciesCustom": "Personalizzata...",
    "speciesCustomPlaceholder": "Scrivi la specie...",
    "background": "Background",
    "backgroundPlaceholder": "— Scegli background —",
    "backgroundCustom": "Personalizzato...",
    "backgroundCustomPlaceholder": "Scrivi il background...",
    "level": "Livello",
    "profBonus": "Bonus competenza",
    "alignment": "Allineamento",
    "xp": "Esperienza (XP)"
  },
  "abilities": {
    "editBtn": "✏ Modifica",
    "editDoneBtn": "✓ Fine"
  },
  "hp": {
    "title": "Punti ferita",
    "current": "Attuali",
    "max": "Massimi",
    "temp": "Temp HP",
    "tempFull": "HP Temporanei",
    "damage": "💔 Danno",
    "heal": "💚 Cura",
    "editBtn": "✏ Modifica",
    "editDoneBtn": "✓ Fine"
  },
  "combat": {
    "ac": "CA",
    "initiative": "Iniziativa",
    "speed": "Velocità",
    "inspiration": "Hai ispirazione!",
    "noInspiration": "Nessuna ispirazione",
    "concentrating": "In concentrazione",
    "noConcentration": "Nessuna concentrazione",
    "deathSuccess": "Successi",
    "deathFail": "Fallimenti"
  },
  "actions": {
    "filterAll": "Tutte",
    "filterAction": "Azione",
    "filterBonus": "Bonus",
    "filterReaction": "Reazione",
    "filterFree": "Gratuita",
    "hideBase": "🙈 Nascondi base",
    "showBase": "👁 Mostra base",
    "add": "+ Aggiungi azione",
    "addTagBtn": "🏷 Aggiungi tag",
    "editTagBtn": "🏷 Modifica tag",
    "tagDone": "✓ Fine",
    "typeAction": "Azione",
    "typeBonus": "Bonus",
    "typeReaction": "Reazione",
    "typeFree": "Gratuita"
  },
  "spells": {
    "filterAll": "Tutti",
    "filterCantrips": "Trucchetti",
    "filterPrepared": "Preparati",
    "browseSRD": "＋ SRD",
    "custom": "✏ Personalizzato",
    "close": "✕ Chiudi",
    "searchPlaceholder": "🔍 Cerca per nome...",
    "filterAllLevels": "Tutti i livelli",
    "filterAllSchools": "Tutte le scuole",
    "filterAllClasses": "Tutte le classi",
    "foundSingular": "{{count}} incantesimo trovato",
    "foundPlural": "{{count}} incantesimi trovati",
    "noSpells": "Nessun incantesimo. Clicca ＋ SRD per sfogliare o ✏ per aggiungerne uno personalizzato.",
    "concentration": "Concentrazione",
    "ritual": "Rituale",
    "cantripLabel": "Trucco",
    "levelLabel": "Liv.{{level}}",
    "spellcastingStat": "Stat. lancio",
    "saveDC": "CD salvezza",
    "attackBonus": "Bonus attacco",
    "noSpellcaster": "Seleziona una classe incantatore.",
    "noSlots": "Nessuno slot disponibile.",
    "shortRest": "🌙 Riposo breve",
    "longRest": "🛏 Riposo lungo",
    "addTagBtn": "🏷 Aggiungi tag",
    "editTagBtn": "🏷 Modifica tag",
    "tagDone": "✓ Fine",
    "customName": "Nome *",
    "customLevel": "Livello",
    "customSchool": "Scuola",
    "customDesc": "Descrizione",
    "customDescPlaceholder": "Effetto, gittata, danni (es. 2d6 fuoco)...",
    "customConcentration": "Concentrazione",
    "customRitual": "Rituale",
    "customCancel": "Annulla",
    "customAdd": "+ Aggiungi"
  },
  "inventory": {
    "addBtn": "+ Aggiungi oggetto",
    "closeBtn": "✕ Chiudi",
    "namePlaceholder": "Es. Pozione di guarigione",
    "qty": "Quantità",
    "weight": "Peso (kg)",
    "descLabel": "Descrizione / Note (puoi scrivere dadi es. 2d4+2)",
    "descPlaceholder": "Es. Cura 2d4+2 HP. Oggetto magico comune.",
    "cancel": "Annulla",
    "add": "+ Aggiungi",
    "empty": "Nessun oggetto. Clicca \"+ Aggiungi oggetto\" per iniziare.",
    "editSave": "✓ Salva"
  },
  "currency": {
    "gp": "MO",
    "sp": "MA",
    "cp": "MR",
    "pp": "PE"
  },
  "notes": {
    "personalityLabel": "Tratti della personalità",
    "personalityPlaceholder": "Come ti comporti?",
    "idealsLabel": "Ideali",
    "idealsPlaceholder": "Cosa credi?",
    "bondsLabel": "Legami",
    "bondsPlaceholder": "Chi o cosa ti lega al mondo?",
    "flawsLabel": "Difetti",
    "flawsPlaceholder": "Qual è il tuo tallone d'Achille?",
    "freeNotesPlaceholder": "Appunti di sessione, dettagli NPC, misteri da risolvere...",
    "classFeaturesPlaceholder": "Feature di classe, tratti razziali, talenti..."
  },
  "senses": {
    "passivePerception": "Percezione passiva",
    "initiative": "Iniziativa",
    "speed": "Velocità",
    "hitDice": "Dadi vita",
    "speedPlaceholder": "9m"
  },
  "layout": {
    "editBanner": "⠿ Trascina widget e tab · ▬/⬛ per larghezza piena/mezza · ↗ per cambiare tab · 🚫 per nascondere",
    "moveTo": "↗ Sposta",
    "moveToTitle": "Sposta in:",
    "hide": "🚫",
    "fullWidth": "▬ Piena",
    "halfWidth": "⬛ Mezza",
    "dragHere": "Trascina qui",
    "dragHereFull": "⬛ Trascina qui per larghezza piena",
    "dragHereLeft": "▬ Trascina qui (colonna sinistra)",
    "dragHereRight": "▬ Trascina qui (colonna destra)",
    "hiddenWidgets": "Widget nascosti",
    "restore": "+ {{label}}"
  },
  "tags": {
    "addPlaceholder": "+ Aggiungi tag...",
    "create": "Crea: "
  },
  "weapons": {
    "noWeapons": "Nessuna arma aggiunta. Clicca \"+\" per aggiungerne una.",
    "addBtn": "+ Aggiungi arma",
    "presetSRD": "Preset SRD",
    "custom": "Personalizzata",
    "cancel": "Annulla",
    "add": "+ Aggiungi",
    "proficient": "✓ Comp.",
    "notProficient": "✗ No comp.",
    "customName": "Nome",
    "customDmg": "Danni",
    "customDmgType": "Tipo danno",
    "customProps": "Proprietà",
    "customRange": "Gittata (opzionale)",
    "customRangePlaceholder": "Es. 6/18",
    "customProf": "Hai competenza",
    "noProf": "Senza competenza"
  },
  "conditions": {
    "title": "Condizioni"
  },
  "toast": {
    "longRest": "Riposo lungo: HP e slot ripristinati!",
    "shortRest": "Riposo breve completato. Usa i dadi vita per recuperare HP.",
    "imported": "Personaggio importato!",
    "importError": "Errore: file JSON non valido.",
    "creatorDone": "Personaggio \"{{name}}\" creato!"
  },
  "settings": {
    "uiLanguage": "Lingua interfaccia",
    "dataLanguage": "Lingua dati SRD",
    "italian": "Italiano",
    "english": "English",
    "system": "Sistema",
    "dnd5e": "D&D 5e / 2024",
    "custom": "Personalizzato"
  },
  "creator": {
    "title": "⚔ Crea personaggio",
    "steps": {
      "identity": "Identità",
      "class": "Classe",
      "stats": "Statistiche",
      "proficiencies": "Competenze",
      "summary": "Riepilogo"
    },
    "cancel": "Annulla",
    "back": "← Indietro",
    "next": "Avanti →",
    "create": "✓ Crea personaggio",
    "speciesTitle": "Razza / Specie",
    "backgroundTitle": "Background",
    "classTitle": "Scegli la tua classe",
    "statsTitle": "Metodo statistiche",
    "pointBuy": "Point Buy",
    "standardArray": "Array standard",
    "rollStats": "Lancia i dadi",
    "reroll": "🎲 Rilancia",
    "pointsLeft": "Punti rimasti: {{left}} / {{total}}",
    "tooManyPoints": " — troppi punti spesi!",
    "profTitle": "Scegli {{count}} abilità di classe",
    "profBackground": "Background {{name}}: competenze automatiche in {{skills}}.",
    "profSelected": "({{selected}}/{{max}} selezionate)",
    "summaryTitle": "Riepilogo",
    "summarySubtitle": "{{race}} · {{class}} · {{background}}"
  },
  "common": {
    "edit": "✏ Modifica",
    "editDone": "✓ Fine",
    "cancel": "Annulla",
    "save": "✓ Salva",
    "add": "+ Aggiungi",
    "remove": "✕",
    "noData": "Nessun dato disponibile.",
    "loading": "Caricamento..."
  }
}
```

### src/i18n/locales/en/ui.json
Stessa struttura di it/ui.json con tutti i valori tradotti in inglese.
Esempi chiave:
```json
{
  "brand": "CharacterForge",
  "nav": {
    "newCharacter": "⚔ New",
    "export": "⬇ Export",
    "import": "⬆ Import",
    "layout": "⠿ Layout",
    "layoutDone": "✓ Done",
    "reset": "↺ Reset"
  },
  "tabs": {
    "main": "Character",
    "combat": "Combat",
    "spells": "Spells",
    "inventory": "Inventory",
    "notes": "Notes",
    "log": "Log"
  },
  "hp": {
    "current": "Current",
    "max": "Maximum",
    "temp": "Temp HP",
    "damage": "💔 Damage",
    "heal": "💚 Heal"
  }
}
```
Generare la traduzione completa seguendo esattamente la struttura di it/ui.json.

### src/i18n/locales/it/game.json
Termini meccanici di gioco — usati da Tooltip.jsx per il glossario keyword.
```json
{
  "conditions": {
    "blinded": "Non può vedere. Svantaggio ai tiri per colpire, vantaggio per chi lo attacca.",
    "charmed": "Non può attaccare la fonte dell'incantesimo...",
    "poisoned": "Svantaggio ai tiri per colpire e alle prove di caratteristica."
  },
  "mechanics": {
    "advantage": "Lancia 2d20 e usa il risultato più alto.",
    "disadvantage": "Lancia 2d20 e usa il risultato più basso.",
    "concentration": "Se subisci danni devi superare un TS COS (CD 10 o metà del danno)."
  },
  "weaponProperties": {
    "finesse": "Puoi usare FOR o DES (il più alto) per attacco e danno.",
    "light": "Puoi usare questa arma nel combattimento a due armi."
  },
  "damageTypes": {
    "slashing": "tagliente",
    "piercing": "perforante",
    "bludgeoning": "contundente",
    "fire": "fuoco",
    "cold": "freddo",
    "lightning": "fulmine",
    "acid": "acido",
    "poison": "veleno",
    "necrotic": "necrotico",
    "radiant": "radiante",
    "thunder": "tuono",
    "force": "forza",
    "psychic": "psichico"
  }
}
```

### src/i18n/locales/en/game.json
Stessa struttura con valori in inglese.

---

## Aggiornamento layout.js

Le label di WIDGET_DEFS e DEFAULT_TABS sono attualmente hardcodate in italiano.
Con i18n devono venire dalla funzione `t()`.

**Problema**: layout.js è un modulo puro (non un componente React),
quindi non può usare `useTranslation()`.

**Soluzione**: mantenere le label in layout.js come chiavi di traduzione,
e tradurle nel punto di rendering.

```js
// layout.js — cambia le label in chiavi
export const WIDGET_DEFS = [
  { id: 'identity', label: 'widgets.identity', defaultTab: 'main', ... },
  { id: 'abilities', label: 'widgets.abilities', defaultTab: 'main', ... },
  // ...
];

export const DEFAULT_TABS = [
  { id: 'main',    label: 'tabs.main',    icon: '👤', visible: true },
  { id: 'combat',  label: 'tabs.combat',  icon: '⚔',  visible: true },
  // ...
];
```

Nei componenti che renderizzano label (TabBar, WidgetShell, WidgetGrid):
```js
const { t } = useTranslation();
// ...
<span>{t(tab.label)}</span>
<span>{t(widget.label)}</span>
```

**ATTENZIONE**: `getWidgetLabel(id)` in layout.js ritorna la chiave stringa,
non la label tradotta. I componenti che la usano devono wrappare con `t()`.

---

## Aggiornamento componenti

### Pattern da usare ovunque
```js
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('common.cancel')}</button>;
}
```

### App.jsx — sezioni da aggiornare

**Barra template (in cima)**:
```js
// Prima
<button>⚔ Nuovo</button>
<button>⬇ Esporta</button>

// Dopo
<button>{t('nav.newCharacter')}</button>
<button>{t('nav.export')}</button>
```

**Tutti i widget in renderWidget()**: sostituire ogni stringa UI con `t('chiave')`.
Questa è la parte più lunga — procedere widget per widget.

**Toast messages**: usare `t('toast.longRest')`, ecc.

**Aggiungere selettore lingua** nella barra template:
```jsx
<select
  value={i18n.language}
  onChange={e => i18n.changeLanguage(e.target.value)}
  className="lang-select"
>
  <option value="it">🇮🇹 IT</option>
  <option value="en">🇬🇧 EN</option>
</select>
```

### TabBar.jsx
```js
const { t } = useTranslation();
// label delle tab: t(tab.label)
```

### WidgetShell.jsx
```js
const { t } = useTranslation();
// t(getWidgetLabel(id)) per il nome widget nella barra edit
// t('layout.moveTo'), t('layout.hide'), t('layout.fullWidth'), ecc.
```

### WidgetGrid.jsx
```js
const { t } = useTranslation();
// t('layout.dragHereFull'), t('layout.dragHereLeft'), ecc.
```

### SpellManager.jsx, WeaponManager.jsx, InventoryManager.jsx, ConditionTracker.jsx
Stessa procedura — `useTranslation()` + sostituire stringhe.

### CharacterCreator.jsx
Stessa procedura — usare namespace `creator.*`.

### Tooltip.jsx — KEYWORD_GLOSSARY
Il glossario attualmente è un oggetto con chiavi in italiano e valori in italiano.
Con i18n deve essere dinamico:

```js
// Nuova versione
import { useTranslation } from 'react-i18next';

export function useKeywordGlossary() {
  const { t } = useTranslation('game');
  return {
    // le chiavi rimangono in italiano per il matching nel testo
    // ma i valori vengono dalla traduzione
    'avvelenato':  t('conditions.poisoned'),
    'vantaggio':   t('mechanics.advantage'),
    'finezza':     t('weaponProperties.finesse'),
    // ...
  };
}
```

**NOTA**: il matching delle keyword nel testo funziona sulla lingua del testo
(che dipende dalla lingua dati SRD). Se l'utente usa dati SRD in inglese,
le keyword da matchare cambiano. Gestire questo caso nella lingua dati.

---

## Lingua dati SRD (separata da i18n)

Questo sistema è indipendente da i18next.

### Storage
```
localStorage: characterforge_data_lang = 'it' | 'en'
```

### Implementazione
I file `src/data/spells.js`, `weapons.js`, `conditions.js` mantengono i dati
in italiano (come ora). Aggiungere versioni inglesi:

```
src/data/
├── spells.js          ← dati italiani (esistente)
├── spells.en.js       ← dati inglesi (NUOVO — nomi ufficiali SRD CC BY 4.0)
├── weapons.js         ← dati italiani (esistente)
├── weapons.en.js      ← dati inglesi (NUOVO)
├── conditions.js      ← dati italiani (esistente)
└── conditions.en.js   ← dati inglesi (NUOVO)
```

### Hook useDataLang
```js
// src/hooks/useDataLang.js
import { useState } from 'react';

const STORAGE_KEY = 'characterforge_data_lang';

export function useDataLang() {
  const [dataLang, setDataLang] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'it'
  );

  function changeDataLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    setDataLang(lang);
  }

  return { dataLang, changeDataLang };
}
```

### Selettore in App.jsx
Aggiungere nella barra template, vicino al selettore lingua interfaccia:
```jsx
<select value={dataLang} onChange={e => changeDataLang(e.target.value)} className="lang-select">
  <option value="it">Dati: IT</option>
  <option value="en">Dati: EN</option>
</select>
```

I componenti che usano dati SRD (SpellManager, WeaponManager, ConditionTracker)
ricevono `dataLang` come prop e importano il file corretto:
```js
const spells = dataLang === 'en' ? SRD_SPELLS_EN : SRD_SPELLS_IT;
```

---

## Ordine di implementazione

Seguire questi step nell'ordine esatto. Dopo ogni step verificare
che l'app compili e funzioni prima di procedere.

**Step 1** — Installa dipendenze e crea struttura
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```
- Crea `src/i18n/index.js` con configurazione base
- Crea `src/i18n/locales/it/ui.json` con TUTTE le stringhe (lista completa sopra)
- Crea `src/i18n/locales/en/ui.json` con traduzione completa in inglese
- Aggiungi `import './i18n'` come prima riga di `src/index.js`
- Verifica che l'app si avvii senza errori

**Step 2** — Aggiorna layout.js
- Cambia le label di WIDGET_DEFS e DEFAULT_TABS in chiavi stringa
- Aggiorna TabBar.jsx per usare `t(tab.label)`
- Aggiorna WidgetShell.jsx per usare `t(getWidgetLabel(id))`
- Aggiorna WidgetGrid.jsx per placeholder e messaggi
- Verifica che tab e widget mostrino ancora le label corrette

**Step 3** — Aggiorna App.jsx
- Aggiungi `const { t, i18n } = useTranslation()` in cima al componente
- Aggiungi selettore lingua nella barra template
- Sostituisci tutte le stringhe UI in renderWidget() con `t('chiave')`
- Procedi widget per widget: identity → abilities → saves → skills → senses →
  hp → combatStats → inspiration → deathSaves → conditions → actions →
  weapons → spellStats → spellSlots → spells → currency → inventory →
  traits → freeNotes → classFeatures
- Aggiorna toast messages

**Step 4** — Aggiorna componenti figli
- SpellManager.jsx
- WeaponManager.jsx
- InventoryManager.jsx
- ConditionTracker.jsx
- CharacterCreator.jsx
- TagSelector/TagFilterBar in Tags.jsx

**Step 5** — Aggiorna Tooltip.jsx con glossario dinamico
- Crea `src/i18n/locales/it/game.json` con condizioni, meccaniche, proprietà
- Crea `src/i18n/locales/en/game.json`
- Aggiorna KEYWORD_GLOSSARY per usare traduzioni dinamiche

**Step 6** — Sistema lingua dati SRD
- Crea `src/hooks/useDataLang.js`
- Crea `src/data/spells.en.js`, `weapons.en.js`, `conditions.en.js`
  con i nomi ufficiali inglesi dell'SRD (CC BY 4.0)
- Aggiorna SpellManager, WeaponManager, ConditionTracker per accettare `dataLang`
- Passa `dataLang` dai widget in App.jsx

**Step 7** — Test completo
- Cambia lingua interfaccia → tutta la UI cambia lingua
- Cambia lingua dati → spell list, armi, condizioni cambiano lingua
- I due selettori sono indipendenti
- Ricaricando la pagina le impostazioni persistono (localStorage)
- I personaggi salvati non sono stati rotti

---

## Note e vincoli

- **useCharacter.js**: NON toccare — gestisce la persistenza multi-personaggio
  con charId / saveCharState / loadCharState ed è già funzionante
- **chars.js**: NON toccare
- **localStorage keys esistenti**: non rinominare nessuna chiave esistente
- **Dati personaggio**: il contenuto del personaggio (nome, note, ecc.)
  non viene tradotto — è testo libero dell'utente
- **Retrocompatibilità layout**: le label salvate nel layout localStorage
  erano stringhe italiane, ora diventano chiavi. Aggiornare loadLayout()
  per fare migration se necessario:
  ```js
  // Se una label non inizia con un namespace i18n noto, tenerla così
  // (compatibilità con layout salvati prima della migrazione)
  ```
- **No popup nativi**: nessun `window.prompt()` o `window.confirm()`
- **Tutto il nuovo testo**: aggiungere prima al file it/ui.json,
  poi tradurre in en/ui.json
- **Interpolazione**: usare `t('chiave', { variabile: valore })` per stringhe
  con variabili, es. `t('toast.creatorDone', { name: charName })`
