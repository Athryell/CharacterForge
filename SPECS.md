# Spec: Sistema dati modulare con supporto homebrew

## Contesto
CharacterForge è una React PWA per schede personaggio GDR.
Attualmente tutti i dati (classi, specie, incantesimi, armi, ecc.) sono hardcodati
in file statici in `src/data/`. Questa spec descrive il refactor per separare i dati
SRD built-in dai dati custom/homebrew importabili dall'utente.

## Obiettivo
- Mantenere l'app legalmente pulita (solo SRD distribuito con il codice)
- Permettere all'utente di importare pacchetti JSON con contenuto extra (homebrew,
  materiale di espansione, dati custom) senza che questi vengano mai distribuiti
  con l'app stessa
- Non rompere nessuna feature esistente durante il refactor

---

## Architettura target

### Struttura cartelle
```
src/data/
├── srd/
│   ├── spells.js         ← sposta da src/data/spells.js (invariato)
│   ├── weapons.js        ← sposta da src/data/weapons.js (invariato)
│   ├── conditions.js     ← sposta da src/data/conditions.js (invariato)
│   ├── classes.js        ← NUOVO: estrai CLASSES, HIT_DICE, CLASS_SAVE_PROFS,
│   │                          SPELLCASTING_CLASS, SLOT_TABLE da dnd5e.js
│   ├── species.js        ← NUOVO: estrai lista specie da App.jsx (SPECIES_LIST)
│   └── backgrounds.js    ← NUOVO: estrai lista background da App.jsx (BACKGROUNDS_LIST)
├── dnd5e.js              ← mantieni solo: getMod, getProfBonus, fmtMod, ABILITIES,
│                              ABILITY_NAMES, SKILLS, ALIGNMENTS
└── dataManager.js        ← NUOVO (vedi sotto)
```

### dataManager.js — API pubblica
Modulo singleton che fonde dati SRD con homebrew salvato in localStorage.
Deve esporre queste funzioni:

```js
dataManager.getSpells()          // Array di tutti gli incantesimi (SRD + homebrew)
dataManager.getWeapons()         // Array di tutte le armi (SRD + homebrew)
dataManager.getClasses()         // Array dei nomi classe (SRD + homebrew)
dataManager.getClassData(name)   // Oggetto dati classe (hitDie, spellcasting, ecc.)
dataManager.getSpecies()         // Array dei nomi specie (SRD + homebrew)
dataManager.getSpeciesData(name) // Oggetto dati specie (bonuses, traits, ecc.)
dataManager.getBackgrounds()     // Array dei nomi background (SRD + homebrew)
dataManager.getSubclasses(cls)   // Array sottoclassi per una classe
dataManager.getConditions()      // Array condizioni (SRD + homebrew)
dataManager.getSources()         // Array sorgenti attive con metadata
dataManager.addSource(json)      // Importa un pacchetto homebrew, ritorna { ok, errors }
dataManager.removeSource(id)     // Rimuove un pacchetto homebrew per id
dataManager.exportSchema()       // Ritorna JSON template vuoto da compilare
```

**Deduplicazione**: se SRD e homebrew hanno un'entità con lo stesso nome,
il homebrew vince (override). Mostrare badge "homebrew" nell'UI.

**Persistenza**: i pacchetti homebrew vengono salvati in localStorage
con chiave `characterforge_homebrew`. Formato: array di pacchetti JSON.

---

## Schema pacchetto homebrew

Il file JSON importabile deve seguire questo schema.
Tutti i campi sono opzionali — un pacchetto può contenere solo incantesimi,
o solo classi, ecc.

```json
{
  "schemaVersion": "1.0.0",
  "id": "stringa-unica-identificativa",
  "name": "Nome del pacchetto (es. Xanathar's Guide)",
  "author": "Autore o fonte",
  "description": "Descrizione opzionale",

  "classes": [
    {
      "name": "Nome Classe",
      "hitDie": "d8",
      "spellcastingStat": "INT",
      "saveProficiencies": ["INT", "SAG"],
      "skillCount": 2,
      "skillOptions": ["Arcano", "Historia"],
      "features": "Testo descrittivo delle feature principali"
    }
  ],

  "subclasses": [
    {
      "class": "Nome Classe Base",
      "name": "Nome Sottoclasse",
      "description": "Descrizione"
    }
  ],

  "species": [
    {
      "name": "Nome Specie",
      "bonuses": { "FOR": 2, "DES": 1 },
      "bonusChoice": 0,
      "traits": ["Tratto 1", "Tratto 2"]
    }
  ],

  "backgrounds": [
    {
      "name": "Nome Background",
      "skills": ["Abilità 1", "Abilità 2"],
      "description": "Descrizione opzionale"
    }
  ],

  "spells": [
    {
      "name": "Nome Incantesimo",
      "level": 1,
      "school": "Evocazione",
      "classes": ["Mago", "Stregone"],
      "c": false,
      "r": false,
      "desc": "Descrizione effetto"
    }
  ],

  "weapons": [
    {
      "name": "Nome Arma",
      "dmg": "1d8",
      "dmgType": "tagliente",
      "properties": ["finesse"],
      "range": "",
      "prof": false
    }
  ],

  "items": [
    {
      "name": "Nome Oggetto",
      "desc": "Descrizione",
      "weight": "0.5",
      "qty": 1
    }
  ],

  "conditions": [
    {
      "id": "id-univoco",
      "name": "Nome Condizione",
      "icon": "🔴",
      "desc": "Descrizione effetto"
    }
  ]
}
```

---

## Nuovo widget: Sorgenti dati

**Aggiungere** una nuova tab e widget al sistema esistente:

In `layout.js`:
- Aggiungere `{ id: 'sources', label: 'Sorgenti', icon: '📦', visible: true }`
  a `DEFAULT_TABS`
- Aggiungere `{ id: 'sourcesWidget', label: 'Sorgenti dati', defaultTab: 'sources',
  defaultCol: 0, defaultFullWidth: true }` a `WIDGET_DEFS`

Creare `src/components/SourceManager.jsx` con:

**Lista sorgenti attive:**
- Badge verde "SRD" per i dati built-in (non rimovibile)
- Badge blu "Homebrew" per i pacchetti importati
- Per ogni pacchetto homebrew: nome, autore, conteggio entità per tipo
  (es. "12 incantesimi, 3 classi, 5 specie"), bottone "Rimuovi"

**Azioni:**
- Bottone "Importa pacchetto" → file input che accetta .json
  - Valida lo schema prima di importare
  - Mostra errori se il JSON non è valido
  - Mostra riepilogo di cosa verrà aggiunto prima di confermare
- Bottone "Esporta schema vuoto" → scarica `homebrew-schema.json` da compilare
- Bottone "Esporta pacchetto corrente" → esporta homebrew attivi come singolo JSON

---

## Aggiornamenti componenti esistenti

Sostituire tutti i riferimenti a dati statici con chiamate a dataManager:

### App.jsx
```js
// Prima
const SPECIES_LIST = ['Umano', 'Elfo', ...]
const BACKGROUNDS_LIST = ['Accolito', ...]
import { CLASSES } from './data/dnd5e'

// Dopo
import dataManager from './data/dataManager'
// usare dataManager.getSpecies(), dataManager.getBackgrounds(), dataManager.getClasses()
// nei punti in cui vengono renderizzati i dropdown
```

### SpellManager.jsx
```js
// Prima
import { SRD_SPELLS } from '../data/spells'

// Dopo
import dataManager from '../data/dataManager'
// usare dataManager.getSpells() invece di SRD_SPELLS
```

### WeaponManager.jsx
```js
// Prima
import { WEAPON_PRESETS } from '../data/weapons'

// Dopo
import dataManager from '../data/dataManager'
// usare dataManager.getWeapons() invece di WEAPON_PRESETS
```

### CharacterCreator.jsx
```js
// Tutte le liste (CLASSES, RACES, BACKGROUNDS, ecc.) → dataManager.*()
```

### ConditionTracker.jsx
```js
// CONDITIONS → dataManager.getConditions()
```

---

## Ordine di implementazione

Seguire questi step nell'ordine esatto. Dopo ogni step verificare
che l'app compili e funzioni prima di procedere.

**Step 1** — Crea `src/data/srd/` e sposta i file esistenti
- Copia (non spostare ancora) spells.js, weapons.js, conditions.js in srd/
- Crea classes.js, species.js, backgrounds.js estraendo dati da dnd5e.js e App.jsx
- Verifica che i file in srd/ esportino le stesse strutture dati di prima

**Step 2** — Crea `src/data/dataManager.js` con solo SRD
- Importa tutto da srd/
- Implementa tutte le funzioni dell'API pubblica
- Per ora nessun homebrew — ritorna solo dati SRD
- Nessun componente aggiornato ancora

**Step 3** — Aggiorna i componenti uno alla volta
- Inizia da SpellManager.jsx (più isolato)
- Poi WeaponManager.jsx
- Poi CharacterCreator.jsx
- Infine App.jsx (SPECIES_LIST, BACKGROUNDS_LIST, CLASSES)
- Dopo ogni componente: verifica che funzioni

**Step 4** — Aggiungi persistenza homebrew
- dataManager.addSource() salva in localStorage
- dataManager.removeSource() rimuove da localStorage
- dataManager.getSources() legge localStorage
- Le funzioni get*() fondono SRD + homebrew

**Step 5** — Crea SourceManager.jsx e aggiungi tab/widget
- UI lista sorgenti
- Import JSON con validazione
- Export schema vuoto

**Step 6** — Test end-to-end
- Importa un pacchetto JSON di test
- Verifica che le nuove entità appaiano nei dropdown
- Verifica che rimuovere il pacchetto le faccia sparire
- Verifica che il salvataggio personaggio non sia stato rotto

---

## Note e vincoli

- **Lingua**: tutta la UI in italiano (verrà poi gestita da i18n in fase successiva)
- **Licenza SRD**: mantenere i commenti `// CC BY 4.0 — Wizards of the Coast`
  nei file srd/
- **Homebrew**: non deve mai finire nel codice sorgente o nel repo GitHub
- **Retrocompatibilità**: i personaggi già salvati in localStorage non devono
  essere rotti dal refactor
- **No popup nativi**: nessun `window.prompt()` o `window.confirm()` —
  usare UI inline come già fatto in InventoryManager e WeaponManager
- **Errori visibili**: se un pacchetto JSON ha errori di schema, mostrarli
  in modo chiaro nell'UI, non in console
- **Limite dimensione**: avvisare se un pacchetto supera i 2MB

### File da NON toccare
- `src/hooks/useCharacter.js` — usa già `charId`, `saveCharState`, `loadCharState`
  da `src/chars.js` per gestire multi-personaggio. Qualsiasi modifica qui
  rischia di rompere il salvataggio personaggi.
- `src/chars.js` — gestione multi-personaggio, non toccare
- `src/layout.js` — ha già widget `activityLog` e `armor` oltre a quelli
  descritti in questa spec. Non rimuoverli durante il refactor.

### localStorage keys esistenti (non rinominare)
- `characterforge_layout` — layout widget
- `characterforge_tabs` — ordine/visibilità tab
- `characterforge_state` — personaggio legacy (single char)
- `characterforge_lang` — lingua interfaccia (aggiunto da i18n)
- `characterforge_data_lang` — lingua dati SRD (aggiunto da i18n)
- `characterforge_homebrew` — pacchetti homebrew importati (aggiunto da questa spec)

### Widget nuovi da aggiungere in layout.js
Il widget `sourcesWidget` per le sorgenti dati va aggiunto a WIDGET_DEFS:
```js
{ id: 'sourcesWidget', label: 'Sorgenti dati', defaultTab: 'sources',
  defaultCol: 0, defaultFullWidth: true }
```
E la tab `sources` va aggiunta a DEFAULT_TABS:
```js
{ id: 'sources', label: 'Sorgenti', icon: '📦', visible: true }
```
