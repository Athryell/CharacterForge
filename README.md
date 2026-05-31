# ⚔ CharacterForge

Scheda personaggio web per GDR — D&D 5e SRD 5.2, con supporto import JSON per sistemi custom.

**[Demo live →](https://<TUO-USERNAME>.github.io/characterforge)**

---

## Feature

- **Calcoli automatici** — modificatori, bonus competenza, CD magia, iniziativa, percezione passiva
- **Competenze cliccabili** — click = competenza, click = expertise, click = rimuovi
- **HP con barra dinamica** — colore verde → arancio → rosso
- **Slot incantesimo** — auto-generati per classe e livello, ripristino con riposo lungo
- **Filtri azioni** — Azione / Bonus / Reazione / Gratuita
- **Tiri salvezza morte**, ispirazione, dadi vita automatici
- **Import / Export JSON** — schema documentato, compatibile con format custom
- **PWA** — installabile su mobile e desktop
- **Dark mode** automatica

---

## Quickstart

```bash
git clone https://github.com/<TUO-USERNAME>/characterforge
cd characterforge
npm install
npm start
```

Apre `http://localhost:3000`.

---

## Deploy su GitHub Pages

```bash
# 1. Aggiorna homepage in package.json con il tuo username
#    "homepage": "https://<TUO-USERNAME>.github.io/characterforge"

npm install
npm run deploy
```

Il comando `npm run deploy` fa build e pubblica su GitHub Pages in automatico.

---

## Deploy su itch.io

```bash
npm run build
```

Comprimi la cartella `build/` come `.zip` e caricala su itch.io come HTML game.
Imposta "Shared Externally" → Kind: HTML.

---

## JSON Schema (Import/Export)

Il file JSON esportato ha questa struttura. Puoi creare file custom o adattare quelli di Character Craft 5.5e.

```json
{
  "schemaVersion": "1.0.0",
  "template": "dnd5e",
  "charName": "Aldric Voss",
  "charClass": "Mago",
  "charRace": "Elfo",
  "charBackground": "Eremita",
  "charLevel": 5,
  "charXP": 6500,
  "charAlignment": "Neutrale Buono",
  "abilities": {
    "FOR": 8, "DES": 14, "COS": 12,
    "INT": 18, "SAG": 13, "CAR": 10
  },
  "saveProficiencies": ["INT", "SAG"],
  "skillProficiencies": ["Arcano", "Storia", "Indagare"],
  "skillExpertise": ["Arcano"],
  "hpCurrent": 28,
  "hpMax": 28,
  "ac": 13,
  "speed": "9m",
  "inspiration": false,
  "deathSuccess": [false, false, false],
  "deathFail": [false, false, false],
  "spellSlots": [
    {"max": 4, "used": 1},
    {"max": 3, "used": 0},
    {"max": 2, "used": 0},
    {"max": 0, "used": 0},
    {"max": 0, "used": 0},
    {"max": 0, "used": 0},
    {"max": 0, "used": 0},
    {"max": 0, "used": 0},
    {"max": 0, "used": 0}
  ],
  "actions": [
    {
      "id": "fireball",
      "name": "Palla di fuoco",
      "type": "action",
      "descShort": "8d6 fuoco in sfera 6m",
      "desc": "Una sfera infuocata esplode in un punto entro gittata. Ogni creatura nella sfera deve superare un TS Destrezza CD 14 o subisce 8d6 danni da fuoco (metà se supera).",
      "dice": "8d6"
    }
  ],
  "spells": [
    {
      "name": "Palla di fuoco",
      "level": 3,
      "school": "Evocazione",
      "concentration": false,
      "prepared": true
    }
  ],
  "equipment": [
    {"name": "Bastone arcano", "qty": 1},
    {"name": "Componenti materiali", "qty": 1}
  ],
  "currency": {"GP": 45, "SP": 12, "CP": 0, "PP": 0},
  "notes": {
    "personality": "Parla poco, osserva molto.",
    "ideals": "La conoscenza è potere.",
    "bonds": "Devo proteggere il mio antico tomo.",
    "flaws": "La curiosità mi trascina sempre nei guai.",
    "free": "Note di sessione...",
    "classFeatures": "Recupero arcano: recupera slot di 1° livello con riposo breve."
  }
}
```

---

## Licenza

- **Codice**: MIT
- **Dati D&D 5e SRD**: Creative Commons Attribution 4.0 International (CC BY 4.0)
  — *Dungeons & Dragons 5th Edition System Reference Document* © Wizards of the Coast LLC

> This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/.
