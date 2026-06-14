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
Bottone con solo icona o testo breve (Layout, Modifica, Fine).
```
padding: 5px 8px
font-size: 12px
border-radius: var(--r)
min-height: 28px
```

#### Stepper — `.mod-btn`
Bottoni +/- per incrementare valori numerici.
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
| `[STR]` `[DEX]` … `[PRO]` | Modificatore caratteristica o bonus competenza (risolto dinamicamente) |
| `[LVL:1d6,5:1d8]` | Valore scalante per livello |
| `+2@[AC]` | Badge bonus equipaggiamento inline |
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

- `.mod-btn` è definito **due volte** con valori inconsistenti (16px e 24px con `!important`) — unificare a 24px senza `!important`
- `--c-text` e `--c-warn` non sono definite nel `:root` — aggiungere
- Vari bottoni hanno altezze implicite diverse — standardizzare con `min-height`
- Alcune classi sono definite in più punti del file CSS — consolidare

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
