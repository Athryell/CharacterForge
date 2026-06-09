// CharacterForge — D&D 5e SRD 5.2 Classes (CC BY 4.0 — Wizards of the Coast)
// Unified from data/srd/classes.js (mechanics) + data/features.js (class features)

import { SKILLS } from './mechanics';

const ALL_SKILLS = SKILLS.map(s => s.id);

// ── Class Features (from data/features.js) ───────────────────────────────────

const CLASS_FEATURES = {
  Barbarian: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Addestrare animali, Atletica, Intimidire, Natura, Percezione, Sopravvivenza.' },
    { name: 'Rabbia', desc: 'Come azione bonus entra in Rabbia (dura 1 min). In rabbia: vantaggio ai tiri FOR, resistenza ai danni fisici, +2 ai danni di mischia. Usi: 2 (ripristinati con riposo lungo).' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. COS.' },
  ],
  Bard: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, spade corte, balestre a mano, spade lunghe, stocchi. Tiri salvezza: Destrezza, Carisma. Strumenti: 3 strumenti musicali. Abilità (3): qualsiasi.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. 4 trucchetti, incantesimi conosciuti in base al livello.' },
    { name: 'Ispirazione bardica', desc: 'Azione bonus: concedi d6 ispirazione a una creatura entro 18 m. Può aggiungerlo a un tiro. Usi = mod. CAR (min. 1); recuperati con riposo lungo.' },
  ],
  Cleric: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Storia, Intuizione, Medicina, Persuasione, Religione.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello. Incantesimi del dominio sempre preparati.' },
    { name: 'Dominio divino', desc: 'Scegli un dominio (Vita, Luce, Natura, Tempesta, Malizia, Guerra…). Concede incantesimi di dominio e capacità extra.' },
    { name: 'Canalizza divinità (1/riposto breve)', desc: 'Usa il potere divino: Allontana non morti (ogni chierico) + opzione del dominio.' },
  ],
  Druid: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi (no metallo). Armi: Semplici (no metallo), scimitarre. Tiri salvezza: Intelligenza, Saggezza. Strumenti: Erboristeria. Abilità (2 tra): Arcano, Addestrare animali, Intuizione, Medicina, Natura, Percezione, Religione, Sopravvivenza.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello.' },
    { name: 'Forma selvatica (liv 2)', desc: 'Azione (o azione bonus al liv. 2): assumi forma di bestia (CR basato sul livello). Usi: 2 (ripristinati con riposo breve/lungo).' },
    { name: 'Cerchio druidico (liv 2)', desc: 'Scegli una specializzazione: Terra, Luna, ecc.' },
  ],
  Fighter: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Acrobazia, Addestrare animali, Atletica, Storia, Intuizione, Intimidire, Percezione, Sopravvivenza.' },
    { name: 'Stile di combattimento', desc: 'Scegli uno stile: Arciere (+2 attacchi a distanza), Difesa (+1 CA), Duellante (+2 danni con arma a una mano), Grande arma (riesamina 1-2 su danni), Protezione (reazione per svantaggio ad attacchi contro alleato), Due armi (aggiungi mod. a danni 2° attacco).' },
    { name: 'Riprendere fiato', desc: 'Azione bonus: recupera 1d10 + livello PF. Usi: 1 (ripristinati con riposo breve/lungo).' },
    { name: 'Impeto (liv 2)', desc: 'Azione bonus: compi una seconda azione. Usi: 1 (ripristinati con riposo breve/lungo).' },
  ],
  Rogue: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, balestre a mano, spade corte, spade lunghe, stocchi. Strumenti: Attrezzi da ladro. Tiri salvezza: Destrezza, Intelligenza. Abilità (4): qualsiasi.' },
    { name: 'Perizia', desc: 'Raddoppia il bonus di competenza per 2 abilità o strumenti a scelta (altre 2 al liv. 6).' },
    { name: 'Attacco furtivo', desc: 'Una volta per turno, danni extra 1d6 quando hai vantaggio o un alleato è adiacente al bersaglio. Scala con il livello.' },
    { name: 'Gergo ladro', desc: 'Linguaggio segreto comprensibile solo ad altri ladri.' },
    { name: 'Azione scaltra', desc: 'Azione bonus: Scatto, Disimpegno o Nascondersi.' },
  ],
  Wizard: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Intelligenza, Saggezza. Abilità (2 tra): Arcano, Storia, Indagare, Intuizione, Medicina, Religione.' },
    { name: 'Incantesimi (Intelligenza)', desc: 'Incantatore a pieno livello con Intelligenza. Libro degli incantesimi (6 incantesimi al livello 1). Preparati = mod. INT + livello.' },
    { name: 'Recupero arcano', desc: 'Una volta al giorno (riposo breve): recupera slot di livello ≤ metà del livello mago (arrotondato su). Slot max 5°.' },
    { name: 'Tradizione arcana (liv 2)', desc: 'Scegli la scuola di magia o tradizione: Evocazione, Divinazione, Illusione, ecc.' },
  ],
  Monk: [
    { name: 'Competenze', desc: 'Armature: Nessuna. Armi: Semplici, spade corte. Tiri salvezza: Forza, Destrezza. Abilità (2 tra): Acrobazia, Atletica, Storia, Furtività, Intuizione, Religione.' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. SAG.' },
    { name: 'Arti marziali', desc: 'Usa DES invece di FOR per attacchi con armi da monaco. Attacchi disarmati: d4. Dopo attacco arma/disarmato come azione, puoi fare un attacco disarmato come azione bonus.' },
    { name: 'Ki (liv 2)', desc: 'Punti ki = livello (recuperati con riposo breve/lungo). Azioni ki: Attacco fulmineo, Passo del vento, Pazienza del difensore.' },
  ],
  Paladin: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Atletica, Intuizione, Intimidire, Medicina, Persuasione, Religione.' },
    { name: 'Senso divino', desc: 'Azione: percepisce celesti/infernali/non morti entro 18 m. Usi = 1 + mod. CAR (riposi lunghi).' },
    { name: 'Imposizione delle mani', desc: 'Riserva = livello × 5 PF. Azione: cura o neutralizza malattia/veleno (5 punti). Ripristinata con riposo lungo.' },
    { name: 'Stile di combattimento e Incantesimi (liv 2)', desc: 'Come Guerriero per lo stile. Incantesimi con Carisma (mezzo livello), preparati = mod. CAR + metà livello.' },
    { name: 'Sacro giuramento (liv 3)', desc: 'Scegli il giuramento: Devozione, Antichi, Vendetta… che definisce il tuo credo e poteri.' },
  ],
  Ranger: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Destrezza. Abilità (3 tra): Addestrare animali, Atletica, Intuizione, Indagare, Natura, Percezione, Furtività, Sopravvivenza.' },
    { name: 'Nemico prescelto', desc: 'Scegli tipo di nemico (aberrazioni, bestie, non morti…). Vantaggio a prove di conoscenza/tracciamento; impari un linguaggio associato.' },
    { name: 'Esploratore naturale', desc: 'Scegli un terreno preferito (foresta, pianura…). Vantaggi durante l\'esplorazione in quel tipo di terreno.' },
    { name: 'Incantesimi (Saggezza, liv 2)', desc: 'Incantatore a mezzo livello con Saggezza. Preparati = mod. SAG + metà livello.' },
  ],
  Sorcerer: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Costituzione, Carisma. Abilità (2 tra): Arcano, Inganno, Intuizione, Intimidire, Persuasione, Religione.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. Conosci incantesimi fissi (2 al liv. 1). 4 slot al liv. 1.' },
    { name: 'Origine stregonesca', desc: 'Scegli la fonte della tua magia: Draconica (CA 13+DES senza armatura, +1 PF/livello), Caos selvatico, Linea divina, ecc.' },
    { name: 'Punti stregoneria (liv 2)', desc: 'Converti slot in punti e viceversa. Usati per metamagia.' },
  ],
  Warlock: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Arcano, Inganno, Storia, Intimidire, Indagare, Natura, Religione.' },
    { name: 'Patrono ultraterreno', desc: 'Scegli il patrono: Arcidemonio, Antico, Celestiale, Genio… Concede incantesimi di patrono e capacità extra.' },
    { name: 'Incantesimi del patto (Carisma)', desc: 'Pochi slot (1 al liv. 1), ma recuperati con riposo breve/lungo. Tutti i slot al livello massimo disponibile. Conosci incantesimi fissi.' },
    { name: 'Invocazioni occulte (liv 2)', desc: 'Impari 2 invocazioni che potenziano le tue capacità arcane.' },
  ],
};

// ── Level-by-level data (SRD 5.2.1) ─────────────────────────────────────────

const CLASS_LEVEL_DATA = {

  Barbarian: {
    1:  { features: [
            { name: 'Rage', desc: 'Bonus Action: enter Rage for 1 minute. Advantage on STR checks, resistance to B/P/S damage, +2 melee damage. 2 uses, recover on Long Rest.', auto: true },
            { name: 'Unarmored Defense', desc: 'While not wearing armor, AC = 10 + DEX mod + CON mod.', auto: true },
            { name: 'Weapon Mastery', desc: 'Use mastery properties of 2 Simple or Martial weapons. Change one after Long Rest.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Danger Sense', desc: 'Advantage on DEX saves against effects you can see, unless Blinded, Deafened, or Incapacitated.', auto: true },
            { name: 'Reckless Attack', desc: 'When you make your first attack on your turn, you can attack recklessly: advantage on STR attack rolls, but attacks against you have advantage until your next turn.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Barbarian Subclass', desc: 'Choose a Barbarian subclass. The Berserker subclass is in the SRD.', auto: false, choices: ['Berserker'] },
            { name: 'Primal Knowledge', desc: 'Gain proficiency in one skill from the Barbarian skill list.', auto: true },
            { name: 'Rage (3 uses)', desc: 'You can now use Rage 3 times before a Long Rest.', auto: true },
          ], hpDie: 'd12', subclass: true, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd12', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Extra Attack', desc: 'Attack twice instead of once when you take the Attack action.', auto: true },
            { name: 'Fast Movement', desc: 'Your Speed increases by 10 feet while you are not wearing Heavy armor.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Rage (4 uses)', desc: 'You can now use Rage 4 times before a Long Rest.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Feral Instinct', desc: 'Advantage on Initiative rolls. If you are surprised, you can enter Rage as part of your Initiative roll and act normally on your first turn.', auto: true },
            { name: 'Instinctive Pounce', desc: 'When you enter Rage, you can move up to half your Speed as part of that Bonus Action.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd12', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Brutal Strike', desc: 'When you use Reckless Attack and hit, you can forgo advantage to deal +1d10 damage and apply a Brutal Strike effect (Hamstring Blow or Staggering Blow).', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Primal Knowledge (second skill)', desc: 'Gain proficiency in another skill from the Barbarian skill list.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Relentless Rage', desc: 'If you drop to 0 HP while raging, make a DC 10 CON save (DC +5 each use); on success, drop to 1 HP instead.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    12: { features: [
            { name: 'Rage (5 uses)', desc: 'You can now use Rage 5 times before a Long Rest.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Improved Brutal Strike', desc: 'Your Brutal Strike damage increases to +2d10, and you can use two Brutal Strike effects instead of one.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Persistent Rage', desc: 'Your Rage is so fierce it ends only if you fall unconscious or choose to end it (not by time).', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd12', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Improved Brutal Strike (II)', desc: 'You have four Brutal Strike effects available: Hamstring, Staggering, Forceful, and Toppling Blow.', auto: true },
            { name: 'Rage (6 uses)', desc: 'You can now use Rage 6 times before a Long Rest.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Indomitable Might', desc: 'If your total on a STR check or saving throw is less than your STR score, use your STR score instead.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd12', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Primal Champion', desc: 'Your STR and CON scores each increase by 4. Your maximum for those scores becomes 24.', auto: true },
          ], hpDie: 'd12', subclass: false, asi: false, epicBoon: false },
  },

  Bard: {
    1:  { features: [
            { name: 'Spellcasting (CHA)', desc: 'Cast spells using Charisma. Spell save DC = 8 + proficiency + CHA mod. You are a full spellcaster.', auto: true },
            { name: 'Bardic Inspiration (d6)', desc: 'Bonus Action: grant one creature within 60 feet a d6 Bardic Inspiration. The creature adds it to one ability check, attack roll, or saving throw. Uses = CHA mod (min 1), recover on Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Expertise', desc: 'Choose 2 skill proficiencies; double your proficiency bonus for those skills.', auto: true },
            { name: 'Jack of All Trades', desc: 'Add half your proficiency bonus (rounded down) to any ability check that does not use your full proficiency bonus.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Bard Subclass', desc: 'Choose a Bard subclass. The College of Lore subclass is in the SRD.', auto: false, choices: ['College of Lore'] },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Bardic Inspiration (d8)', desc: 'Your Bardic Inspiration die increases to a d8.', auto: true },
            { name: 'Font of Inspiration', desc: 'You now regain all expended Bardic Inspiration uses when you finish a Short or Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Countercharm', desc: 'Action: start a performance. Until the end of your next turn, friendly creatures within 30 feet have advantage on saves against being Charmed or Frightened.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Expertise (2 more)', desc: 'Choose 2 more skill proficiencies to double your proficiency bonus for.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Bardic Inspiration (d10)', desc: 'Your Bardic Inspiration die increases to a d10.', auto: true },
            { name: 'Magical Secrets', desc: 'Learn 2 spells from any class spell list. They count as Bard spells for you.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Magical Secrets (II)', desc: 'Learn 2 more spells from any class spell list.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Bardic Inspiration (d12)', desc: 'Your Bardic Inspiration die increases to a d12.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Magical Secrets (III)', desc: 'Learn 2 more spells from any class spell list.', auto: true },
            { name: 'Superior Inspiration', desc: 'When you roll Initiative and have no Bardic Inspiration uses left, you regain one use.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Words of Creation', desc: 'You know Power Word Heal and Power Word Kill; they count as Bard spells that do not count against your spells prepared.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Cleric: {
    1:  { features: [
            { name: 'Spellcasting (WIS)', desc: 'Cast spells using Wisdom. Spell save DC = 8 + proficiency + WIS mod. Prepare WIS mod + Cleric level spells.', auto: true },
            { name: 'Divine Order', desc: 'Choose: Protector (martial weapons + heavy armor) or Thaumaturge (+1 cantrip + Religion proficiency).', auto: false, choices: ['Protector', 'Thaumaturge'] },
            { name: 'Cleric Subclass', desc: 'Choose a Cleric subclass. The Life Domain subclass is in the SRD.', auto: false, choices: ['Life Domain'] },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Channel Divinity', desc: 'Use Channel Divinity once per Short/Long Rest. Turn Undead: each Undead within 30 ft must make a WIS save or be Turned. Divine Spark: expend one use to add a d8 per Channel Divinity use to heal or deal Radiant damage.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Smite Undead', desc: 'When you use Turn Undead, you can roll 2d8 + WIS mod Radiant damage against each creature Turned; a failed save also destroys creatures with CR ≤ 1/2 your Cleric level.', auto: true },
            { name: 'Channel Divinity (2 uses)', desc: 'You can now use Channel Divinity twice per Short/Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Channel Divinity (3 uses)', desc: 'You can now use Channel Divinity three times per Short/Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Blessed Strikes', desc: 'Choose: Divine Strike (once per turn, +1d8 Radiant on weapon hit) or Potent Spellcasting (add WIS mod to Cleric cantrip damage).', auto: false, choices: ['Divine Strike', 'Potent Spellcasting'] },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Divine Intervention', desc: 'Action: call for divine aid. If you roll ≤ your Cleric level on a d100, your deity intervenes (cast any Cleric spell without expending a slot). Usable once per 7 days after a success.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    11: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Improved Blessed Strikes', desc: 'The damage die of your Blessed Strikes (Divine Strike or Potent Spellcasting) increases to 2d8.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Greater Divine Intervention', desc: 'Divine Intervention now succeeds automatically. You can use it once per Long Rest without the 7-day restriction.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Druid: {
    1:  { features: [
            { name: 'Spellcasting (WIS)', desc: 'Cast spells using Wisdom. Spell save DC = 8 + proficiency + WIS mod. Prepare WIS mod + Druid level spells.', auto: true },
            { name: 'Primal Order', desc: 'Choose: Magician (+1 Druid cantrip + Arcana proficiency) or Warden (martial weapons + medium armor proficiency).', auto: false, choices: ['Magician', 'Warden'] },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Wild Shape', desc: 'Action or Bonus Action (2/Short Rest): transform into a Beast with CR up to 1/4. Duration: max 1 hour. You retain personality and memories.', auto: true },
            { name: 'Druid Subclass', desc: 'Choose a Druid subclass. The Circle of the Land and Circle of the Moon subclasses are in the SRD.', auto: false, choices: ['Circle of the Land', 'Circle of the Moon'] },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    4:  { features: [
            { name: 'Wild Shape Improvement', desc: 'Your Wild Shape Beast CR limit increases to 1/2.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Wild Resurgence', desc: 'If you have no Wild Shape uses, you can expend a spell slot (no action) to regain one Wild Shape use.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Elemental Fury', desc: 'Choose: Potent Spellcasting (add WIS mod to Druid cantrip damage) or Primal Strike (your Wild Shape attacks count as magical).', auto: false, choices: ['Potent Spellcasting', 'Primal Strike'] },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [
            { name: 'Wild Shape Improvement', desc: 'Your Wild Shape Beast CR limit increases to 1.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    11: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [
            { name: 'Wild Shape Improvement', desc: 'Your Wild Shape Beast CR limit increases to 2.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Beast Spells', desc: 'You can cast Druid spells while in Wild Shape form, as long as the spell has no material components.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Archdruid', desc: 'Unlimited uses of Wild Shape. Your Beast form attacks count as magical. Ignore verbal and somatic components when casting Druid spells.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Fighter: {
    1:  { features: [
            { name: 'Fighting Style', desc: 'Choose a Fighting Style feat.', auto: false, choices: ['Archery', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Protection', 'Two-Weapon Fighting'] },
            { name: 'Second Wind', desc: 'Bonus Action: regain 1d10 + Fighter level HP. 2 uses, recover on Short or Long Rest.', auto: true },
            { name: 'Weapon Mastery', desc: 'Use mastery properties of 3 Simple or Martial weapons. Change one after Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false, weaponMasterySlots: 3, secondWindUses: 2 },
    2:  { features: [
            { name: 'Action Surge', desc: 'Once per Short/Long Rest: take one additional action on your turn (not Magic).', auto: true },
            { name: 'Tactical Mind', desc: 'On a failed ability check, expend a Second Wind use to roll 1d10 and add to the check.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Fighter Subclass', desc: 'Choose a Fighter subclass. The Champion subclass is in the SRD.', auto: false, choices: ['Champion'] },
          ], hpDie: 'd10', subclass: true, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false, weaponMasterySlots: 4, secondWindUses: 3 },
    5:  { features: [
            { name: 'Extra Attack', desc: 'Attack twice instead of once when you take the Attack action.', auto: true },
            { name: 'Tactical Shift', desc: 'When you activate Second Wind, move up to half Speed without provoking Opportunity Attacks.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    6:  { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    7:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Indomitable', desc: 'Once per Long Rest: reroll a failed saving throw, adding your Fighter level to the result.', auto: true },
            { name: 'Tactical Master', desc: 'When attacking with a mastered weapon, replace its mastery property with Push, Sap, or Slow.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false, weaponMasterySlots: 5, secondWindUses: 4 },
    11: { features: [
            { name: 'Two Extra Attacks', desc: 'Attack three times instead of once when you take the Attack action.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Indomitable (2 uses)', desc: 'You can now use Indomitable twice before a Long Rest.', auto: true },
            { name: 'Studied Attacks', desc: 'If you miss an attack, you have Advantage on your next attack roll against that creature before end of next turn.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    14: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    15: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false, weaponMasterySlots: 6, secondWindUses: 4 },
    17: { features: [
            { name: 'Action Surge (2 uses)', desc: 'You can now use Action Surge twice before a rest, but still only once per turn.', auto: true },
            { name: 'Indomitable (3 uses)', desc: 'You can now use Indomitable three times before a Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd10', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Three Extra Attacks', desc: 'Attack four times instead of once when you take the Attack action.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
  },

  Monk: {
    1:  { features: [
            { name: 'Martial Arts', desc: 'Use DEX instead of STR for unarmed strikes and monk weapons. Unarmed strike damage: d6. After taking the Attack action, make one unarmed strike as a Bonus Action.', auto: true },
            { name: 'Unarmored Defense', desc: 'While not wearing armor, AC = 10 + DEX mod + WIS mod.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Monk\'s Focus', desc: 'Gain Focus Points = your Monk level (recover on Short/Long Rest). Use them for Flurry of Blows, Patient Defense, Step of the Wind, and more.', auto: true },
            { name: 'Unarmored Movement', desc: 'Speed increases by 10 feet while not wearing armor or a shield. Increases further as you level.', auto: true },
            { name: 'Uncanny Metabolism', desc: 'When you roll Initiative, regain Focus Points equal to your proficiency bonus. You can also expend a Focus Point to regain 1d8 + WIS mod HP (once per Long Rest).', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Deflect Attacks', desc: 'Reaction: reduce damage from a melee or ranged attack by 1d10 + DEX mod + Monk level. If reduced to 0, redirect the attack as a ranged weapon attack.', auto: true },
            { name: 'Monk Subclass', desc: 'Choose a Monk subclass. The Warrior of the Open Hand subclass is in the SRD.', auto: false, choices: ['Warrior of the Open Hand'] },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    4:  { features: [
            { name: 'Slow Fall', desc: 'Reaction: reduce falling damage by 5 × Monk level.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Extra Attack', desc: 'Attack twice instead of once when you take the Attack action.', auto: true },
            { name: 'Stunning Strike', desc: 'When you hit a creature with a monk weapon or unarmed strike, spend 1 Focus Point to attempt to stun it. DC = your Ki save DC (8 + prof + WIS mod). On a failed CON save, the creature is Stunned until start of your next turn.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Empowered Strikes', desc: 'Your unarmed strikes count as magical for the purpose of overcoming immunity and resistance.', auto: true },
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Evasion', desc: 'When you make a DEX saving throw against an effect that deals half damage on success, you take no damage on success and half damage on a failure.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Acrobatic Movement', desc: 'While not wearing armor, you can move along vertical surfaces and across liquids on your turn without falling.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Self-Restoration', desc: 'At the end of your turn, end one of these conditions affecting you: Charmed, Frightened, or Poisoned. Or reduce one level of Exhaustion.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Deflect Energy', desc: 'You can now use Deflect Attacks against any damage type, not just B/P/S.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Disciplined Survivor', desc: 'Your proficiency bonus is added to all saving throws that don\'t already include it.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Perfect Focus', desc: 'When you roll Initiative and have 0 Focus Points, regain 4 Focus Points.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Superior Defense', desc: 'At the start of your turn, spend 3 Focus Points to gain resistance to all damage types except Force until start of your next turn.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Body and Mind', desc: 'Your STR and DEX scores each increase by 4. Your maximum for those scores becomes 25.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Paladin: {
    1:  { features: [
            { name: 'Lay on Hands', desc: 'Healing pool = Paladin level × 5. Action: restore HP from pool, or expend 5 points to cure one disease or poison. Recovered on Long Rest.', auto: true },
            { name: 'Spellcasting (CHA)', desc: 'Cast spells using Charisma (starting at level 1 in 2024). Spell save DC = 8 + proficiency + CHA mod. Prepare CHA mod + half Paladin level spells.', auto: true },
            { name: 'Weapon Mastery', desc: 'Use mastery properties of 2 Simple or Martial weapons. Change one after Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Fighting Style', desc: 'Choose a Fighting Style feat (Defense, Dueling, Great Weapon Fighting, or Protection).', auto: false, choices: ['Defense', 'Dueling', 'Great Weapon Fighting', 'Protection'] },
            { name: 'Divine Smite', desc: 'When you hit with a melee weapon attack, expend a spell slot to deal +2d8 Radiant (+1d8 per slot level above 1st, max +5d8). +1d8 against Undead or Fiends.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Paladin Subclass', desc: 'Choose a Sacred Oath subclass. The Oath of Devotion subclass is in the SRD.', auto: false, choices: ['Oath of Devotion'] },
            { name: 'Channel Divinity', desc: 'Use Channel Divinity once per Short/Long Rest. Sacred Weapon: Action, touch a weapon; it deals extra Radiant = CHA mod for 1 minute (concentration).', auto: true },
          ], hpDie: 'd10', subclass: true, asi: false, epicBoon: false },
    4:  { features: [
            { name: 'Weapon Mastery Improvement', desc: 'You can now use mastery properties of 3 weapons.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Extra Attack', desc: 'Attack twice instead of once when you take the Attack action.', auto: true },
            { name: 'Faithful Steed', desc: 'You can cast Find Steed without expending a spell slot. Once cast this way, you must finish a Long Rest before doing so again.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Aura of Protection', desc: 'While conscious, you and friendly creatures within 10 feet add your CHA mod (min +1) to all saving throws.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Abjure Foes', desc: 'Action: expend Channel Divinity. Fiends and Undead within 60 feet must make a WIS save or be Frightened and Incapacitated for 1 minute.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Aura of Courage', desc: 'While conscious, you and friendly creatures within 10 feet can\'t be Frightened.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Radiant Strikes', desc: 'Your weapon attacks deal an extra 1d8 Radiant damage.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Restoring Touch', desc: 'When you use Lay on Hands, you can also end one of these conditions on the target: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned (no HP cost).', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Aura Expansion', desc: 'The range of your Aura of Protection and Aura of Courage expands to 30 feet.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd10', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Sacred Weapon', desc: 'As a Bonus Action, you can imbue one weapon you are holding with positive energy; it counts as magical and deals extra Radiant = CHA mod on each hit. Lasts 1 minute. Usable once per Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
  },

  Ranger: {
    1:  { features: [
            { name: 'Spellcasting (WIS)', desc: 'Cast spells using Wisdom (starting at level 1 in 2024). Spell save DC = 8 + proficiency + WIS mod. Prepare WIS mod + half Ranger level spells.', auto: true },
            { name: 'Favored Enemy', desc: 'Choose a type of enemy (Aberrations, Beasts, Celestials, Constructs, Dragons, Elementals, Fey, Fiends, Giants, Monstrosities, Oozes, Plants, or Undead). Hunter\'s Mark against them requires no concentration.', auto: false, choices: ['Aberrations', 'Beasts', 'Dragons', 'Fiends', 'Giants', 'Monstrosities', 'Undead'] },
            { name: 'Weapon Mastery', desc: 'Use mastery properties of 2 Simple or Martial weapons. Change one after Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Deft Explorer', desc: 'Choose: Expertise (double proficiency for one skill), or Canny (learn two languages or tools), or Tireless (Temp HP = 1d8 + WIS mod, and reduce Exhaustion by 1, once per Short Rest).', auto: false, choices: ['Canny', 'Expertise', 'Tireless'] },
            { name: 'Fighting Style', desc: 'Choose a Fighting Style feat (Archery, Defense, Dueling, or Two-Weapon Fighting).', auto: false, choices: ['Archery', 'Defense', 'Dueling', 'Two-Weapon Fighting'] },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Ranger Subclass', desc: 'Choose a Ranger subclass. The Hunter subclass is in the SRD.', auto: false, choices: ['Hunter'] },
          ], hpDie: 'd10', subclass: true, asi: false, epicBoon: false },
    4:  { features: [
            { name: 'Weapon Mastery Improvement', desc: 'You can now use mastery properties of 3 weapons.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Extra Attack', desc: 'Attack twice instead of once when you take the Attack action.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Roving', desc: 'Your Speed increases by 10 feet. You gain Climb Speed and Swim Speed equal to your walking speed.', auto: true },
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Tireless', desc: 'As a Magic action, give yourself 1d8 + WIS mod Temp HP. Also, at the end of a Short Rest, reduce your Exhaustion level by 1. Usable proficiency bonus times per Long Rest.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Nature\'s Veil', desc: 'Bonus Action (prof bonus/Long Rest): become Invisible until start of your next turn.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd10', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Feral Senses', desc: 'You can\'t be surprised while conscious. Dim light doesn\'t impose disadvantage on Perception checks relying on sight.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd10', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Foe Slayer', desc: 'When you hit your Favored Enemy with an attack, add your WIS mod to the damage roll.', auto: true },
          ], hpDie: 'd10', subclass: false, asi: false, epicBoon: false },
  },

  Rogue: {
    1:  { features: [
            { name: 'Expertise', desc: 'Choose 2 skill or tool proficiencies; double your proficiency bonus for those.', auto: true },
            { name: 'Sneak Attack (1d6)', desc: 'Once per turn, deal +1d6 damage when you have advantage on the attack roll, or when an ally is within 5 feet of the target. Increases by 1d6 at each odd Rogue level.', auto: true },
            { name: 'Thieves\' Cant', desc: 'Secret language understood only by Rogues. Also know one additional standard language.', auto: true },
            { name: 'Weapon Mastery', desc: 'Use mastery properties of 2 Simple or Martial weapons. Change one after Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Cunning Action', desc: 'Bonus Action: Dash, Disengage, or Hide.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Rogue Subclass', desc: 'Choose a Rogue subclass. The Thief subclass is in the SRD.', auto: false, choices: ['Thief'] },
            { name: 'Sneak Attack (2d6)', desc: 'Your Sneak Attack increases to 2d6.', auto: true },
            { name: 'Steady Aim', desc: 'Bonus Action: give yourself advantage on your next attack this turn, but your Speed becomes 0 until end of turn.', auto: true },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Cunning Strike', desc: 'When you deal Sneak Attack damage, you can forgo 1d6 to apply one Cunning Strike effect (Disarm, Poison, Trip, or Withdraw).', auto: true },
            { name: 'Sneak Attack (3d6)', desc: 'Your Sneak Attack increases to 3d6.', auto: true },
            { name: 'Uncanny Dodge', desc: 'Reaction: halve the damage of one attack that hits you (must see attacker).', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Expertise (2 more)', desc: 'Choose 2 more proficiencies to double your proficiency bonus for.', auto: true },
            { name: 'Sneak Attack (4d6)', desc: 'Your Sneak Attack increases to 4d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Evasion', desc: 'When you make a DEX saving throw against an effect that deals half damage on success, you take no damage on success and half on a failure.', auto: true },
            { name: 'Reliable Talent', desc: 'Class Feature. See your subclass description.', auto: true },
            { name: 'Sneak Attack (5d6)', desc: 'Your Sneak Attack increases to 5d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [
            { name: 'Sneak Attack (6d6)', desc: 'Your Sneak Attack increases to 6d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Sneak Attack (7d6)', desc: 'Your Sneak Attack increases to 7d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Sneak Attack (8d6)', desc: 'Your Sneak Attack increases to 8d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    11: { features: [
            { name: 'Reliable Talent', desc: 'When you make an ability check using a skill or tool proficiency, treat a roll of 9 or lower as a 10.', auto: true },
            { name: 'Sneak Attack (9d6)', desc: 'Your Sneak Attack increases to 9d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [
            { name: 'Sneak Attack (10d6)', desc: 'Your Sneak Attack increases to 10d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Sneak Attack (11d6)', desc: 'Your Sneak Attack increases to 11d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subtle Strikes', desc: 'When you attack, you can apply a second Cunning Strike effect (forgoing 2d6 total instead of 1d6).', auto: true },
            { name: 'Sneak Attack (12d6)', desc: 'Your Sneak Attack increases to 12d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Slippery Mind', desc: 'Your proficiency is added to WIS and CHA saving throws.', auto: true },
            { name: 'Sneak Attack (13d6)', desc: 'Your Sneak Attack increases to 13d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [
            { name: 'Sneak Attack (14d6)', desc: 'Your Sneak Attack increases to 14d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Sneak Attack (15d6)', desc: 'Your Sneak Attack increases to 15d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Elusive', desc: 'No attack roll has advantage against you while you aren\'t Incapacitated.', auto: true },
            { name: 'Sneak Attack (16d6)', desc: 'Your Sneak Attack increases to 16d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [
            { name: 'Sneak Attack (17d6)', desc: 'Your Sneak Attack increases to 17d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Stroke of Luck', desc: 'If you fail an ability check or miss an attack, you can turn it into a success. Usable once per Short or Long Rest.', auto: true },
            { name: 'Sneak Attack (18d6)', desc: 'Your Sneak Attack increases to 18d6.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Sorcerer: {
    1:  { features: [
            { name: 'Spellcasting (CHA)', desc: 'Cast spells using Charisma. Spell save DC = 8 + proficiency + CHA mod. You are a full spellcaster.', auto: true },
            { name: 'Innate Sorcery', desc: 'Action (once per Long Rest): for 1 minute, your spell save DC increases by 1 and you have advantage on spell attack rolls.', auto: true },
            { name: 'Sorcerer Subclass', desc: 'Choose a Sorcerer subclass. The Draconic Sorcerer and Wild Magic Surge subclasses are in the SRD.', auto: false, choices: ['Draconic Sorcerer', 'Wild Magic Surge'] },
          ], hpDie: 'd6', subclass: true, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Font of Magic', desc: 'Gain Sorcery Points = Sorcerer level (recover on Long Rest). Spend to create spell slots or fuel Metamagic options.', auto: true },
            { name: 'Metamagic', desc: 'Learn 2 Metamagic options (Careful, Distant, Empowered, Extended, Heightened, Quickened, Seeking, Subtle, or Transmuted Spell).', auto: false, choices: ['Careful Spell', 'Distant Spell', 'Empowered Spell', 'Extended Spell', 'Heightened Spell', 'Quickened Spell', 'Subtle Spell', 'Transmuted Spell'] },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Sorcerous Restoration', desc: 'When you finish a Short Rest, regain expended Sorcery Points equal to your proficiency bonus.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    7:  { features: [
            { name: 'Sorcery Incarnate', desc: 'While Innate Sorcery is active, you can use two Metamagic options on a spell instead of one.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    11: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    15: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Metamagic (one more)', desc: 'Learn one additional Metamagic option.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Arcane Apotheosis', desc: 'While Innate Sorcery is active, you can use one Metamagic option on each spell you cast without spending Sorcery Points.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
  },

  Warlock: {
    1:  { features: [
            { name: 'Eldritch Invocations', desc: 'Learn 2 Eldritch Invocations; gain more as you level. Invocations provide passive benefits or new abilities.', auto: true },
            { name: 'Pact Magic (CHA)', desc: 'Cast spells using Charisma. You have Pact Magic spell slots (all the same level) that recover on Short or Long Rest.', auto: true },
            { name: 'Warlock Subclass', desc: 'Choose a Warlock subclass. The Archfey Patron and Fiend Patron subclasses are in the SRD.', auto: false, choices: ['Archfey Patron', 'Fiend Patron'] },
          ], hpDie: 'd8', subclass: true, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Magical Cunning', desc: 'Action (once per Long Rest): regain half your expended Pact Magic slots (rounded up).', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
            { name: 'Pact Boon', desc: 'Choose a Pact Boon: Pact of the Blade, Pact of the Chain, Pact of the Talisman, or Pact of the Tome.', auto: false, choices: ['Pact of the Blade', 'Pact of the Chain', 'Pact of the Talisman', 'Pact of the Tome'] },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    7:  { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    9:  { features: [
            { name: 'Contact Patron', desc: 'You can cast Commune once without expending a spell slot. Usable once per Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    11: { features: [
            { name: 'Mystic Arcanum (6th level)', desc: 'Choose one 6th-level spell from the Warlock list as your Mystic Arcanum. Cast it once per Long Rest without a spell slot.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    13: { features: [
            { name: 'Mystic Arcanum (7th level)', desc: 'Choose one 7th-level spell as an additional Mystic Arcanum. Cast once per Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    15: { features: [
            { name: 'Mystic Arcanum (8th level)', desc: 'Choose one 8th-level spell as an additional Mystic Arcanum. Cast once per Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd8', subclass: false, asi: true, epicBoon: false },
    17: { features: [
            { name: 'Mystic Arcanum (9th level)', desc: 'Choose one 9th-level spell as an additional Mystic Arcanum. Cast once per Long Rest.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    18: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd8', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Eldritch Master', desc: 'Action (once per Long Rest): regain all expended Pact Magic spell slots.', auto: true },
          ], hpDie: 'd8', subclass: false, asi: false, epicBoon: false },
  },

  Wizard: {
    1:  { features: [
            { name: 'Spellcasting (INT)', desc: 'Cast spells using Intelligence. Spell save DC = 8 + proficiency + INT mod. Prepare INT mod + Wizard level spells from your spellbook.', auto: true },
            { name: 'Arcane Recovery', desc: 'Once per day (on a Short Rest): recover spell slots with combined level ≤ half your Wizard level (rounded up), none above 5th level.', auto: true },
            { name: 'Ritual Adept', desc: 'Cast any spell in your spellbook as a ritual without preparing it, if it has the Ritual tag.', auto: true },
            { name: 'Arcane Study', desc: 'Choose: Memorize Spell (prepare one additional spell per Long Rest) or the Scholar ability (History/Arcana proficiency and related bonuses).', auto: false, choices: ['Memorize Spell', 'Scholar'] },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    2:  { features: [
            { name: 'Scholar', desc: 'Double your proficiency bonus for History and Arcana checks. Also learn one additional language or tool proficiency.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    3:  { features: [
            { name: 'Wizard Subclass', desc: 'Choose a Wizard subclass (Arcane Tradition). The Evoker and Illusionist subclasses are in the SRD.', auto: false, choices: ['Evoker', 'Illusionist'] },
          ], hpDie: 'd6', subclass: true, asi: false, epicBoon: false },
    4:  { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    5:  { features: [
            { name: 'Memorize Spell', desc: 'Prepare one additional spell per Long Rest that doesn\'t count against your prepared total.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    6:  { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    7:  { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    8:  { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    9:  { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    10: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    11: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    12: { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    13: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    14: { features: [
            { name: 'Subclass Feature', desc: 'See your subclass description.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    15: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    16: { features: [], hpDie: 'd6', subclass: false, asi: true, epicBoon: false },
    17: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    18: { features: [
            { name: 'Spell Mastery', desc: 'Choose one 1st-level and one 2nd-level Wizard spell; you can cast them at their lowest level without expending a spell slot.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
    19: { features: [], hpDie: 'd6', subclass: false, asi: false, epicBoon: true },
    20: { features: [
            { name: 'Signature Spells', desc: 'Choose two 3rd-level Wizard spells as signature spells. You always have them prepared and can cast each once per Short Rest without expending a slot.', auto: true },
          ], hpDie: 'd6', subclass: false, asi: false, epicBoon: false },
  },
};

// ── SRD Class Mechanical Data ────────────────────────────────────────────────

const SRD_CLASSES_DATA = [
  {
    name: 'Barbarian',
    hitDie: 'd12',
    spellcasting: null,
    saveProficiencies: ['STR', 'CON'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Bard',
    hitDie: 'd8',
    spellcasting: 'CHA',
    saveProficiencies: ['DEX', 'CHA'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 3,
    skillOptions: ALL_SKILLS,
    subclassLevel: 3,
  },
  {
    name: 'Cleric',
    hitDie: 'd8',
    spellcasting: 'WIS',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Druid',
    hitDie: 'd8',
    spellcasting: 'WIS',
    saveProficiencies: ['INT', 'WIS'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    subclassLevel: 2,
  },
  {
    name: 'Fighter',
    hitDie: 'd10',
    spellcasting: null,
    saveProficiencies: ['STR', 'CON'],
    armorTraining: ['light', 'medium', 'heavy', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Monk',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['STR', 'DEX'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    subclassLevel: 3,
  },
  {
    name: 'Paladin',
    hitDie: 'd10',
    spellcasting: 'CHA',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light', 'medium', 'heavy', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    subclassLevel: 3,
  },
  {
    name: 'Ranger',
    hitDie: 'd10',
    spellcasting: 'WIS',
    saveProficiencies: ['STR', 'DEX'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 3,
    skillOptions: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Rogue',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['DEX', 'INT'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 4,
    skillOptions: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleight-of-hand', 'stealth'],
    subclassLevel: 3,
  },
  {
    name: 'Sorcerer',
    hitDie: 'd6',
    spellcasting: 'CHA',
    saveProficiencies: ['CON', 'CHA'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'deception', 'insight', 'intimidation', 'nature', 'persuasion', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Warlock',
    hitDie: 'd8',
    spellcasting: 'CHA',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Wizard',
    hitDie: 'd6',
    spellcasting: 'INT',
    saveProficiencies: ['INT', 'WIS'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    subclassLevel: 3,
  },
];

// ── Unified export: SRD mechanics + features ────────────────────────────────

export const DND_CLASSES = SRD_CLASSES_DATA.map(cls => ({
  ...cls,
  features: CLASS_FEATURES[cls.name] || [],
  levelData: CLASS_LEVEL_DATA[cls.name] || {},
}));

export const DND_CLASS_NAMES    = DND_CLASSES.map(c => c.name);
export const CLASS_SAVE_PROFS   = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.saveProficiencies]));
export const CLASS_SKILL_COUNT  = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.skillCount]));
export const CLASS_SKILL_OPTIONS = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.skillOptions]));

// Re-export class features for external use
export { CLASS_FEATURES };

// Backward-compat aliases
export const SRD_CLASSES     = DND_CLASSES;
export const SRD_CLASS_NAMES = DND_CLASS_NAMES;
