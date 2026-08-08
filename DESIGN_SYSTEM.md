# CharacterForge — Design System

Documento di riferimento per consistenza visiva e comportamentale.
Ogni nuovo componente o modifica al CSS deve seguire queste specifiche.
Claude Code deve leggere questo file prima di scrivere qualsiasi CSS o JSX.

---

## Principi

1. **Consistenza prima dell'originalità** — usa i token esistenti, non inventare nuovi valori
2. **Mobile-first** — touch targets minimi 44×44px, font minimo 13px
3. **Accessibilità** — contrasto minimo WCAG AA (4.5:1 testo normale, 3:1 testo grande)
4. **Semplicità** — meno classi CSS possibile, massimo riuso

---

## Token CSS (variabili in `:root`)

### Colori
```css
--c-ink          /* testo principale */
--c-muted        /* testo secondario */
--c-hint         /* testo terziario, placeholder */
--c-bg           /* sfondo pagina */
--c-surface      /* sfondo card, input, elementi elevati */
--c-border       /* bordi sottili (8% opacità) */
--c-border-mid   /* bordi medi (16% opacità) */
--c-accent       /* verde primario — azioni principali */
--c-accent-light /* verde chiaro — sfondo accent */
--c-accent-text  /* testo su accent */
--c-success      /* verde successo — #3B6D11 */
--c-warn         /* arancione warning */
--c-warn-text    /* testo warning */
--c-text         /* alias di --c-ink (legacy) */
```

### Tipografia
```css
--font-body      /* corpo testo — Inter o sistema */
--font-display   /* titoli — peso 700 */
--font-mono      /* codice, notazioni */
```

### Border radius
```css
--r   /* 6px — bottoni, input, elementi piccoli */
--rl  /* 10px — card, modali, pannelli */
```

---

## Scala tipografica

| Uso | Dimensione | Peso | Classe esempio |
|-----|-----------|------|----------------|
| Titolo card | 14px | 600 | `.card-title` |
| Testo body | 13px | 400 | `p`, `span` |
| Label campo | 12px | 500 | `label` |
| Testo piccolo | 11px | 400 | `.hint-text`, metadata |
| Testo minimo | 10px | 500 | label uppercase (SOLO per headers sezione) |

**Regola:** mai usare font-size sotto 11px. Mai usare 10px per testo leggibile — solo per label uppercase con letter-spacing.

---

## Altezze e padding — Bottoni

Tutti i bottoni hanno **altezza implicita consistente** tramite padding verticale.
Non usare `height` esplicita sui bottoni — usa padding.

### Gerarchia bottoni

#### Primario — `.io-btn.primary`
Azione principale del contesto (Salva, Conferma, Crea personaggio).
```
padding: 6px 12px
font-size: 13px
font-weight: 500
border-radius: var(--r)
min-height: 32px
```
Colori: `background: var(--c-accent-light)`, `color: var(--c-accent-text)`, `border: 0.5px solid var(--c-accent)`
Hover: `background: var(--c-accent)`, `color: #fff`

#### Secondario — `.io-btn`
Azione secondaria (Annulla, Esporta, Importa).
```
padding: 6px 12px
font-size: 13px
font-weight: 400
border-radius: var(--r)
min-height: 32px
```
Colori: `background: transparent`, `color: var(--c-ink)`, `border: 0.5px solid var(--c-border-mid)`
Hover: `background: var(--c-surface)`

#### Danger — `.io-btn.danger`
Azioni distruttive (Elimina, Rimuovi).
```
/* stessi padding di .io-btn */
border-color: #c0392b
color: #c0392b
```
Hover: `background: #c0392b`, `color: #fff`

#### Icon button — `.icon-btn`
Bottone con solo icona o testo breve (Layout, Modifica, Fine, **Rimuovi/Annulla**).
```
padding: 5px 8px
font-size: 12px
border-radius: var(--r)
min-height: 28px
```
`.icon-btn.active` (stato "confermato"/checkmark): `border-color: var(--c-accent)`,
`background: var(--c-accent-light)`. Ogni bottone icon-only che conferma, annulla o rimuove
un elemento (✓/✕) usa **questa** classe con `<Icon id="action.done|action.edit|action.remove" />`
— mai testo hardcodato (`✕`, `×`) e mai `.mod-btn`, così il bottone "conferma" e il bottone
"annulla/rimuovi" accanto hanno le stesse dimensioni quadrate. `.mod-btn` è riservato allo
stepper qui sotto.

#### Stepper — `.mod-btn`
Bottoni +/- per incrementare valori numerici. **Non riusare per azioni remove/cancel** — quelle
vanno su `.icon-btn` (vedi sopra), altrimenti il bottone "✕" risulta più piccolo e con un
border-radius diverso rispetto al bottone "✓" a fianco.
```
width: 24px
height: 24px
font-size: 14px
border-radius: 4px
/* NON usare !important — definire una sola volta */
```

#### Filter chip — `.filter-chip`
Filtri, tab secondarie, selezioni multiple.
```
padding: 4px 12px
font-size: 12px
border-radius: 20px
min-height: 26px
```

#### Tab — `.tab-btn`
Navigazione principale tra sezioni.
```
padding: 5px 12px
font-size: 12px
font-weight: 500
border-radius: calc(var(--r) - 2px)
min-height: 28px
```

---

## Input e form

### Input testo — `input[type=text]`, `input[type=number]`, `select`
```
padding: 5px 8px
font-size: 13px
border: 0.5px solid var(--c-border-mid)
border-radius: var(--r)
background: var(--c-bg)
color: var(--c-ink)
min-height: 30px
width: 100%
```
Focus: `border-color: var(--c-accent)`, `outline: none`

### Textarea — `.notes-area`
```
padding: 8px 10px
font-size: 13px
border: 0.5px solid var(--c-border-mid)
border-radius: var(--r)
min-height: 80px
resize: vertical
width: 100%
```

### Label
```
font-size: 12px
font-weight: 500
color: var(--c-muted)
margin-bottom: 4px
display: block
```

### Field wrapper — `.field`
```css
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

---

## Card e pannelli

### Card standard — `.card`
```
background: var(--c-surface)
border: 0.5px solid var(--c-border)
border-radius: var(--rl)
padding: 14px 16px
```

### Card title — `.card-title`
```
font-size: 14px
font-weight: 600
color: var(--c-ink)
margin-bottom: 12px
display: flex
align-items: center
gap: 6px
```

### Hint text — `.hint-text`
```
font-size: 12px
color: var(--c-hint)
font-style: italic
```

### Ability box / Stat box — `.ability-box`

Box singolo per una statistica (D&D ability score, DH trait, custom `stat-grid`).
```
background: var(--c-surface)
border: 0.5px solid var(--c-border-mid)
border-radius: var(--rl)
padding: 10px 4px      /* default D&D/DH */
```
Stato `.editing`: `border-color: var(--c-accent)`, `background: var(--c-accent-light)`.

Contenuto interno:

- `.ability-label` — nome/etichetta, uppercase, 10.67px, `--c-hint`, letter-spacing .11em
- `.ability-mod` — modificatore, 23.5px, peso 600, sempre con segno esplicito (`+2`, `-1`, `+0`)
- `.ability-score-static` — valore statico, 17px, peso 500, `--c-muted`, nessun segno

**Variante widget custom "Statistiche"** (`stat-grid`, override inline in `CustomWidget.jsx`):
```
padding: 12px 16px
min-width: 80px          /* view mode */
min-width: 108px         /* edit mode — spazio per i campi ID mod/valore */
```
Container: `display:flex; flex-wrap:wrap; gap:6px` — i box hanno `flex: 0 0 auto`, non si stirano
mai, occupano solo lo spazio necessario e vanno a capo quando non c'entrano in riga.

---

## Spaziature

Usa multipli di 4px per tutte le spaziature.

| Token | Valore | Uso |
|-------|--------|-----|
| 4px  | xs | gap interno tra elementi tight |
| 6px  | sm | gap tra elementi correlati |
| 8px  | md | padding interno compatto |
| 12px | lg | padding card, gap standard |
| 16px | xl | padding sezioni, margini card |
| 24px | 2xl | spaziatura tra sezioni |

**Regola:** non usare valori dispari (3px, 5px, 7px) salvo casi specifici documentati.

---

## Griglie

### Due colonne — `.grid-2`
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 8px;
```

### Tre colonne — `.grid-3`
```css
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 8px;
```

### Sei colonne (caratteristiche) — `.grid-6`
```css
display: grid;
grid-template-columns: repeat(6, 1fr);
gap: 6px;
```
Su mobile (<480px): `grid-template-columns: repeat(3, 1fr)`

### Row orizzontale — `.field-row`
```css
display: flex;
flex-wrap: wrap;
gap: 8px;
```

---

## Badge e pill

### Badge tipo azione
```
font-size: 11px
font-weight: 500
padding: 2px 7px
border-radius: 4px
```
Colori per tipo:
- Action: `background: var(--c-ink)`, `color: var(--c-bg)`
- Bonus: `background: #854F0B`, `color: #FAEEDA`
- Reaction: `background: #185FA5`, `color: #E6F1FB`
- Free: `background: var(--c-surface)`, `color: var(--c-muted)`

### Source badge (homebrew/SRD)
```
font-size: 10px
font-weight: 500
padding: 1px 5px
border-radius: 3px
text-transform: uppercase
letter-spacing: 0.05em
```

---

## Modali e overlay

### Overlay — `.creator-overlay` (riutilizzabile)
```css
position: fixed;
inset: 0;
background: rgba(0,0,0,.45);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
padding: 16px;
```

### Modale — `.creator-modal`
```css
background: var(--c-bg);
border-radius: var(--rl);
width: 100%;
max-width: 560px;
max-height: 90vh;
overflow-y: auto;
box-shadow: 0 8px 32px rgba(0,0,0,.18);
```

Su mobile (<480px): `max-width: 100%`, `border-radius: var(--rl) var(--rl) 0 0`

---

## Toast / notifiche

```
position: fixed
top: 16px
right: 16px
z-index: 9999
padding: 10px 16px
border-radius: var(--rl)
font-size: 13px
max-width: calc(100vw - 32px)
```

---

## Banner di stato / notice

Due pattern distinti, non intercambiabili. **Mai inventare uno schema colore nuovo** (es.
`--c-ink` come sfondo + `--c-bg` come testo + `opacity` per smorzare) — usa uno dei due sotto.

### Banner "modalità attiva" (es. edit mode) — sfondo accent pieno

Segnala che l'utente è dentro una modalità che cambia il comportamento della pagina
(modifica layout, editing di un widget). Sfondo pieno, non tinta trasparente.

```css
background: var(--c-accent);
color: #fff;
padding: 6px 16px;
```

Esempi: `.widget-edit-bar`, `.layout-edit-banner`. **Non** usare `opacity` per attenuare —
riduce il contrasto testo/sfondo sotto WCAG AA. Se serve un tono più tenue, cambia colore
(es. `--c-accent-light` + testo `--c-accent-text`), non aggiungere opacità su un banner a
tinta piena.

### Banner "avviso contestuale" (es. concentrazione attiva, warning) — tinta trasparente

Segnala uno stato o rischio legato a un elemento specifico, senza occupare tutta
l'attenzione. Sfondo colore semantico a bassa opacità + bordo sinistro pieno.

```css
background: rgba(<colore>, 0.08);       /* o color-mix(in srgb, var(--c-warn) 12%, transparent) */
border: 1px solid rgba(<colore>, 0.25);
border-left: 3px solid <colore>;
border-radius: var(--r);
color: <colore>;                         /* stesso colore del bordo sinistro, sul testo chiave */
```

Esempi: `.concentration-banner` (blu `#185FA5`), `.prof-change-warning` (`--c-warn`). Il
colore comunica il tipo di avviso: usa `--c-warn`/`--c-warn-text` per warning, un colore
semantico dedicato (come il blu concentrazione) per notice specifiche di funzionalità.

---

## Stato dei componenti interattivi

Ogni elemento interattivo deve avere stati visivi chiari:

| Stato | Implementazione |
|-------|----------------|
| Default | stile base |
| Hover | `background` o `border-color` leggermente più intenso |
| Active/Selected | `background: var(--c-accent-light)`, `border-color: var(--c-accent)` |
| Disabled | `opacity: 0.38`, `cursor: not-allowed`, `pointer-events: none` |
| Focus | `outline: 2px solid var(--c-accent)`, `outline-offset: 2px` |

**Regola:** mai rimuovere il focus outline — è essenziale per accessibilità.
Usa `outline` non `box-shadow` per il focus (funziona meglio con high contrast).

---

## Iconografia

Il sistema supporta tre modalità (gestite da `useIconMode`):
- `emoji` — default
- `lucide` — icone vettoriali
- `none` — solo testo

Usare sempre `<Icon id="..." />` da `src/config/icons.jsx`.
Mai hardcodare emoji direttamente nei componenti — aggiungere prima la voce in `ICON_MAP`.

**Icona + testo, mai lo stesso glifo due volte.** Quando un bottone accosta `<Icon id="action.add|action.done|action.remove|..." />`
a una stringa i18n, quella stringa non deve avere il glifo corrispondente hardcoded (`"+ Add"`, `"✓ Save"`, `"✕ Delete"`) —
l'icona lo mostra già, e in modalità `lucide`/`none` il doppione resta visibile o rimane comunque un residuo testuale
sbagliato. Le chiavi tipo `common.add` (`"+ Add"`) sono corrette **solo** per bottoni solo-testo, senza `<Icon>`
accanto; per un bottone icona+testo usa una chiave pulita (es. `common.addLabel`: `"Add"`).

---

## Convenzioni CSS

### Naming
- Componente: `.nome-componente` (kebab-case)
- Variante: `.nome-componente.variante`
- Stato: `.nome-componente.active`, `.nome-componente.disabled`
- Elemento figlio: `.nome-componente-elemento`

### Ordine proprietà
```css
.elemento {
  /* Layout */
  display / position / top / right / bottom / left / z-index
  /* Box model */
  width / height / min-* / max-* / padding / margin / border
  /* Visual */
  background / color / border-radius / box-shadow / opacity
  /* Tipografia */
  font-size / font-weight / font-family / line-height / text-*
  /* Interazione */
  cursor / pointer-events / user-select
  /* Animazione */
  transition / animation
}
```

### Regole
- **No `!important`** salvo override di accessibilità (`.large-targets`, `.high-contrast`)
- **No valori magic number** — usa i token CSS o multipli di 4px
- **No `height` esplicita sui bottoni** — usa padding
- **No duplicazione classi** — se una classe è definita due volte, unifica
- **Mobile breakpoint principale**: `@media (max-width: 600px)` per layout, `@media (max-width: 480px)` per micro-aggiustamenti

---

## Notazioni nelle descrizioni (Tooltip / KeywordText)

| Sintassi | Effetto |
|----------|---------|
| `[STR]` `[DEX]` … `[PRO]` `[LVL]` `[LVL/2]` | Modificatore caratteristica, bonus competenza, livello (risolto dinamicamente) |
| `[LVL=1:1d6,5:1d8]` | Valore scalante per livello (da lv 1 → 1d6, da lv 5 → 1d8) |
| `+2@[AC]` | Badge bonus equipaggiamento inline (valore statico) |
| `+[PRO]@[AC]` | Badge bonus dinamico — il valore si risolve da formula |
| `+1@[SAV-STR]` | Bonus al tiro salvezza Forza |
| `+1@[SK-ATH]` | Bonus all'abilità Atletica |
| `[3]` | Counter statico: 3 pip cliccabili |
| `[countCHA]` | Counter dinamico: numero di pip = mod. CHA (min 1) |
| `[countPRO]` | Counter dinamico: pip = bonus competenza |
| `[countLVL]` | Counter dinamico: pip = livello personaggio |
| `[countLVL/2]` | Counter dinamico: pip = livello ÷ 2 (min 1) |
| `[countLVL*5]` | Counter dinamico: pip = livello × 5 |
| `[countN]` | Counter dinamico con valore numerico fisso N |

Le formule `[countX]` sono risolte in `resolveNotations()` (Tooltip.jsx) prima del rendering. Il badge `≈` appare se il testo contiene notazioni dinamiche.

---

## Problemi noti da risolvere

- ~~`.mod-btn` è definito **due volte** con valori inconsistenti~~ — **risolto in Fase 1** (unificato a 24px senza `!important`)
- ~~Sezione TOUCH-FRIENDLY: 6 selettori globali con `!important` senza `.large-targets`~~ — **risolto in Fase 1** (spostati dentro `.large-targets`)
- ~~`.tab-btn-wrapper` e `.pin-pip` definiti più volte~~ — **risolto in Fase 1** (unificati a 1 definizione ciascuno)
- ~~`--font-mono` non definita in `:root`~~ — **risolto in Fase 1** (aggiunta a `:root`)
- `--c-text` e `--c-warn` non sono definite nel `:root` — aggiungere
- Vari bottoni hanno altezze implicite diverse — standardizzare con `min-height`

---

## Changelog

### 2026-06-22 — Refactor Fase 1
- Rimossi 9 alias zombie `SRD_*` da 7 file dati
- Rimosso `CLASSES` ridondante da `mechanics.js`
- Eliminato `BonusTextarea.jsx` (shim non usato)
- Fix CSS TOUCH-FRIENDLY: 6 selettori spostati dentro `.large-targets`
- Unificati `.tab-btn-wrapper` (3→1) e `.pin-pip` (2→1)
- Aggiunti `--font-mono` e `--c-success` al `:root`

### 2026-06-22 — Refactor Fase 2
- Esposti dati statici D&D via `dnd5eAdapter` (16 getter)
- `dhAdapter` collegato a `dataManager`
- `SPELL_CLASSES` derivato da `Object.keys(SPELLCASTING_CLASS)`
- Fix `no-unused-vars` e BOM UTF-8 su 11 file
- Placeholder hardcodati sostituiti con `t('placeholders.*')`

### 2026-06-22 — Refactor Fase 3b
- 7 componenti aggiornati per usare `adapter` invece di import diretti: `WeaponManager`, `SpellManager`, `ArmorManager`, `ConditionTracker`, `AlignmentPicker`, `DHWeaponManager`, `DHArmorManager`
- Aggiunto `getWeaponPropertyDescs()` a `dnd5eAdapter`

---

## Checklist per nuovi componenti

Prima di scrivere il CSS di un nuovo componente, verificare:

- [ ] Usa token CSS (`--c-*`, `--r`, `--rl`, `--font-*`) invece di valori hardcodati
- [ ] Spaziature multiple di 4px
- [ ] Font-size non sotto 11px
- [ ] Bottoni seguono la gerarchia definita sopra
- [ ] Stati hover/active/disabled implementati
- [ ] Focus outline presente su elementi interattivi
- [ ] Funziona su mobile (touch target ≥ 24px, consigliato 44px)
- [ ] Funziona in dark mode
- [ ] Funziona in high-contrast mode
- [ ] Stringhe UI in `t('chiave')` — niente testo hardcodato
