// CharacterForge — D&D 5e SRD 5.2 Species (CC BY 4.0 — Wizards of the Coast)
// Mechanical data — translatable strings in i18n/species.{lang}.json

export const DND_SPECIES = [
  { id: 'dragonborn', speed: 30 },
  { id: 'dwarf',      speed: 30 },
  {
    id: 'elf',
    speed: 30,
    legacyLabel: 'Elven Lineage',
    legacySpellStat: true,
    legacies: [
      {
        id: 'drow',
        name: 'Drow',
        level1Trait: 'Darkvision range increases to 120 feet.',
        spells: [
          { name: 'Dancing Lights', level: 0, unlockLevel: 1 },
          { name: 'Faerie Fire',    level: 1, unlockLevel: 3 },
          { name: 'Darkness',       level: 2, unlockLevel: 5 },
        ],
      },
      {
        id: 'high-elf',
        name: 'High Elf',
        level1Trait: 'You know the Prestidigitation cantrip. You can replace it with another Wizard cantrip after each Long Rest.',
        spells: [
          { name: 'Prestidigitation', level: 0, unlockLevel: 1, replaceable: true },
          { name: 'Detect Magic',     level: 1, unlockLevel: 3 },
          { name: 'Misty Step',       level: 2, unlockLevel: 5 },
        ],
      },
      {
        id: 'wood-elf',
        name: 'Wood Elf',
        level1Trait: 'Your Speed increases to 35 feet.',
        speedOverride: 35,
        spells: [
          { name: 'Druidcraft',       level: 0, unlockLevel: 1 },
          { name: 'Longstrider',      level: 1, unlockLevel: 3 },
          { name: 'Pass without Trace', level: 2, unlockLevel: 5 },
        ],
      },
    ],
  },
  { id: 'gnome',    speed: 30 },
  { id: 'goliath',  speed: 35 },
  { id: 'halfling', speed: 30 },
  { id: 'human',    speed: 30 },
  { id: 'orc',      speed: 30 },
  {
    id: 'tiefling',
    speed: 30,
    fixedSpells: [
      { name: 'Thaumaturgy', level: 0, unlockLevel: 1 },
    ],
    legacyLabel: 'Fiendish Legacy',
    legacySpellStat: true,
    legacies: [
      {
        id: 'abyssal',
        name: 'Abyssal',
        resistance: 'poison',
        level1Trait: 'Resistance to Poison damage.',
        spells: [
          { name: 'Poison Spray',  level: 0, unlockLevel: 1 },
          { name: 'Ray of Sickness', level: 1, unlockLevel: 3 },
          { name: 'Hold Person',   level: 2, unlockLevel: 5 },
        ],
      },
      {
        id: 'chthonic',
        name: 'Chthonic',
        resistance: 'necrotic',
        level1Trait: 'Resistance to Necrotic damage.',
        spells: [
          { name: 'Chill Touch',        level: 0, unlockLevel: 1 },
          { name: 'False Life',         level: 1, unlockLevel: 3 },
          { name: 'Ray of Enfeeblement', level: 2, unlockLevel: 5 },
        ],
      },
      {
        id: 'infernal',
        name: 'Infernal',
        resistance: 'fire',
        level1Trait: 'Resistance to Fire damage.',
        spells: [
          { name: 'Fire Bolt',      level: 0, unlockLevel: 1 },
          { name: 'Hellish Rebuke', level: 1, unlockLevel: 3 },
          { name: 'Darkness',       level: 2, unlockLevel: 5 },
        ],
      },
    ],
  },
];

// Backward-compat alias
export const SRD_SPECIES = DND_SPECIES;

export function getSpeciesData(raceId) {
  return DND_SPECIES.find(s => s.id === raceId) || null;
}

export const SPECIES_FEATURES = {
  'human': [
    { name: 'Polivalenza', desc: 'Guadagni competenza in un\'abilità a scelta.' },
    { name: 'Talento bonus', desc: 'Guadagni un talento di primo livello a scelta.' },
  ],
  'high-elf': [
    { name: 'Sensi acuti', desc: 'Competenza nell\'abilità Percezione.' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Trance', desc: 'Non dormi. Mediti per 4 ore al giorno (equivale a 8 ore di sonno). Puoi essere vigile durante la trance.' },
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m). Solo in bianco e nero nell\'oscurità.' },
    { name: 'Addestramento elfico con le armi', desc: 'Competenza con spade lunghe, spade corte, archi corti e archi lunghi.' },
    { name: 'Trucchetto', desc: 'Conosci un trucchetto della lista del mago. Intelligenza è la caratteristica.' },
  ],
  'wood-elf': [
    { name: 'Sensi acuti', desc: 'Competenza nell\'abilità Percezione.' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Trance', desc: 'Non dormi. Mediti per 4 ore al giorno.' },
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Addestramento elfico con le armi', desc: 'Competenza con spade lunghe, spade corte, archi corti e archi lunghi.' },
    { name: 'Passo del bosco', desc: 'Non sei rallentato da terreno difficile non magico. Puoi muoverti attraverso piante non magiche senza difficoltà.' },
    { name: 'Mascheratura naturale', desc: 'Puoi tentare di nasconderti quando sei leggermente oscurato da fenomeni naturali.' },
  ],
  'hill-dwarf': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resilienza nanica', desc: 'Vantaggio ai tiri salvezza contro il veleno. Resistenza ai danni da veleno.' },
    { name: 'Addestramento nanico con le armi', desc: 'Competenza con asce da battaglia, asce a mano, martelli leggeri e martelli da guerra.' },
    { name: 'Competenza con gli strumenti', desc: 'Competenza con uno strumento artigiano a scelta (arnesi del fabbro, strumenti del birraio o attrezzi del muratore).' },
    { name: 'Senso della pietra', desc: 'Vantaggio alle prove di Storia riguardo lavori in pietra.' },
    { name: 'Tenacia nanica', desc: 'PF massimi aumentano di 1 ad ogni livello.' },
  ],
  'mountain-dwarf': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resilienza nanica', desc: 'Vantaggio ai tiri salvezza contro il veleno. Resistenza ai danni da veleno.' },
    { name: 'Addestramento nanico con le armi', desc: 'Competenza con asce da battaglia, asce a mano, martelli leggeri e martelli da guerra.' },
    { name: 'Competenza con gli strumenti', desc: 'Competenza con uno strumento artigiano a scelta.' },
    { name: 'Senso della pietra', desc: 'Vantaggio alle prove di Storia riguardo lavori in pietra.' },
    { name: 'Addestramento con le armature', desc: 'Competenza con armature leggere e medie.' },
  ],
  'lightfoot-halfling': [
    { name: 'Fortuna', desc: 'Quando tiri 1 su un d20 per attacco, prova o tiro salvezza, puoi ritirare e usare il nuovo risultato.' },
    { name: 'Coraggioso', desc: 'Vantaggio ai tiri salvezza contro la paura.' },
    { name: 'Agilità halfling', desc: 'Puoi muoverti attraverso lo spazio di una creatura di taglia superiore.' },
    { name: 'Invisibilità naturale', desc: 'Puoi tentare di nasconderti quando sei oscurato solo da una creatura Media o superiore.' },
  ],
  'stout-halfling': [
    { name: 'Fortuna', desc: 'Quando tiri 1 su un d20, puoi ritirare e usare il nuovo risultato.' },
    { name: 'Coraggioso', desc: 'Vantaggio ai tiri salvezza contro la paura.' },
    { name: 'Agilità halfling', desc: 'Puoi muoverti attraverso lo spazio di una creatura di taglia superiore.' },
    { name: 'Resilienza selvaggia', desc: 'Vantaggio ai tiri salvezza contro gli effetti di paura e non puoi essere incantato.' },
  ],
  'half-elf': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Lignaggio fatato', desc: 'Vantaggio ai tiri salvezza contro l\'incantamento. Immunità al sonno magico.' },
    { name: 'Polivalenza', desc: 'Competenza in 2 abilità a scelta.' },
  ],
  'tiefling': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Resistenza infernale', desc: 'Resistenza ai danni da fuoco.' },
    { name: 'Eredità infernale', desc: 'Trucchetto Thaumaturgy. Al liv. 3: Hellish Rebuke 2° (1/giorno). Al liv. 5: Darkness (1/giorno). Caratteristica: Carisma.' },
  ],
  'dragonborn': [
    { name: 'Antenato draconico', desc: 'Scegli tipo di drago; determina danno del soffio e resistenza. Parli Draconico.' },
    { name: 'Soffio draconico', desc: 'Azione: attacco ad area (cono 4,5 m o linea). Danni 2d6. TS DES/COS (CD 8 + mod. COS + competenza) per dimezzare. Usi: 1 (riposo breve/lungo).' },
    { name: 'Resistenza ai danni', desc: 'Resistenza al tipo di danno dell\'antenato.' },
  ],
  'rock-gnome': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Astuzia gnomica', desc: 'Vantaggio ai tiri salvezza di INT, SAG e CAR contro la magia.' },
    { name: 'Conoscenza artificiale', desc: 'Competenza con gli strumenti del fabbricante. Puoi costruire piccoli congegni animati.' },
  ],
  'forest-gnome': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Astuzia gnomica', desc: 'Vantaggio ai tiri salvezza di INT, SAG e CAR contro la magia.' },
    { name: 'Illusione naturale', desc: 'Trucchetto Minor Illusion. Caratteristica: Intelligenza.' },
    { name: 'Parlare con le piccole bestie', desc: 'Puoi comunicare idee semplici con bestie Piccole o più piccole.' },
  ],
  'half-orc': [
    { name: 'Visione nel buio', desc: 'Vedi in luce fioca come piena luce, nell\'oscurità come luce fioca (18 m).' },
    { name: 'Minaccioso', desc: 'Competenza nell\'abilità Intimidire.' },
    { name: 'Resistenza instancabile', desc: 'Quando scendi a 0 PF (ma non muori), puoi scendere a 1 invece. Usi: 1 (riposo lungo).' },
    { name: 'Attacchi selvaggi', desc: 'Con colpo critico in mischia, tira un dado di danno aggiuntivo.' },
  ],
};

export function getAutoFeatures(sourceType, sourceName, data) {
  return (data[sourceName] || []).map((f, i) => ({
    id: `${sourceType}_${Date.now()}_${i}`,
    name: f.name,
    desc: f.desc,
    source: sourceName,
    sourceType,
  }));
}
