// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license
// This work uses material from the Daggerheart SRD, available at
// https://www.daggerheart.com/srd under the DPCGL.

export const DH_TRAITS = ['AGI', 'STR', 'FIN', 'INS', 'PRE', 'KNO'];

export const DH_TRAIT_NAMES = {
  AGI: 'Agility', STR: 'Strength', FIN: 'Finesse',
  INS: 'Instinct', PRE: 'Presence', KNO: 'Knowledge',
};

export const DH_TRAIT_USES = {
  AGI: 'Sprint, Leap, Maneuver',
  STR: 'Lift, Smash, Grapple',
  FIN: 'Control, Hide, Tinker',
  INS: 'Perceive, Sense, Navigate',
  PRE: 'Charm, Perform, Deceive',
  KNO: 'Recall, Analyze, Comprehend',
};

export const DH_TRAIT_ARRAY = [2, 1, 1, 0, 0, -1];

export const DH_CLASSES = [
  { id: 'bard',     name: 'Bard',     domains: ['codex','grace'],     evasion: 12, hp: 6,  stress: 6,
    subclasses: ['Troubadour', 'Wordsmith'] },
  { id: 'druid',    name: 'Druid',    domains: ['arcana','sage'],     evasion: 11, hp: 6,  stress: 6,
    subclasses: ['Warden of the Elements', 'Warden of Renewal'] },
  { id: 'guardian', name: 'Guardian', domains: ['blade','valor'],     evasion: 12, hp: 7,  stress: 6,
    subclasses: ['Stalwart', 'Vengeance'] },
  { id: 'ranger',   name: 'Ranger',   domains: ['bone','sage'],       evasion: 12, hp: 6,  stress: 6,
    subclasses: ['Beastbound', 'Wayfinder'] },
  { id: 'rogue',    name: 'Rogue',    domains: ['grace','midnight'],  evasion: 13, hp: 5,  stress: 6,
    subclasses: ['Nightwalker', 'Syndicate'] },
  { id: 'seraph',   name: 'Seraph',   domains: ['splendor','valor'],  evasion: 11, hp: 7,  stress: 6,
    subclasses: ['Divine Wielder', 'Winged Sentinel'] },
  { id: 'sorcerer', name: 'Sorcerer', domains: ['arcana','midnight'], evasion: 11, hp: 5,  stress: 6,
    subclasses: ['Elemental Origin', 'Primal Origin'] },
  { id: 'warrior',  name: 'Warrior',  domains: ['blade','bone'],      evasion: 11, hp: 8,  stress: 6,
    subclasses: ['Call of the Brave', 'Call of the Slayer'] },
  { id: 'wizard',   name: 'Wizard',   domains: ['codex','splendor'],  evasion: 10, hp: 5,  stress: 6,
    subclasses: ['School of Knowledge', 'School of War'] },
];

export const DH_DOMAINS = [
  { id: 'arcana',   name: 'Arcana',   classes: ['druid','sorcerer'],   desc: 'Domain of innate and instinctual magic.' },
  { id: 'blade',    name: 'Blade',    classes: ['guardian','warrior'],  desc: 'Domain of weapon mastery.' },
  { id: 'bone',     name: 'Bone',     classes: ['ranger','warrior'],    desc: 'Domain of tactics and the body.' },
  { id: 'codex',    name: 'Codex',    classes: ['bard','wizard'],       desc: 'Domain of intensive magical study.' },
  { id: 'grace',    name: 'Grace',    classes: ['bard','rogue'],        desc: 'Domain of charisma.' },
  { id: 'midnight', name: 'Midnight', classes: ['rogue','sorcerer'],    desc: 'Domain of shadows and secrecy.' },
  { id: 'sage',     name: 'Sage',     classes: ['druid','ranger'],      desc: 'Domain of the natural world.' },
  { id: 'splendor', name: 'Splendor', classes: ['seraph','wizard'],     desc: 'Domain of life.' },
  { id: 'valor',    name: 'Valor',    classes: ['guardian','seraph'],   desc: 'Domain of protection.' },
];

export const DH_ANCESTRIES = [
  'Clank','Drakona','Dwarf','Elf','Faerie','Faun','Firbolg','Fungril',
  'Galapa','Giant','Goblin','Halfling','Human','Infernis','Katari',
  'Orc','Ribbet','Simiah',
];

export const DH_COMMUNITIES = [
  'Highborne','Loreborne','Orderborne','Ridgeborne','Seaborne',
  'Slyborne','Underborne','Wanderborne','Wildborne',
];

// Proficiency scales with level: 1 at L1-2, 2 at L3-4, 3 at L5-6, etc.
export function getDHProficiency(level) {
  return Math.floor((level - 1) / 2) + 1;
}

// Duality Dice roll result
// Returns { total, hopeRoll, fearRoll, result: 'critical'|'hope'|'fear'|'fail', withHope }
export function rollDualityDice(traitMod = 0, difficulty = 12) {
  const hopeRoll = Math.floor(Math.random() * 12) + 1;
  const fearRoll = Math.floor(Math.random() * 12) + 1;
  const total = Math.max(hopeRoll, fearRoll) + traitMod;
  const critical = hopeRoll === fearRoll;
  const withHope = hopeRoll >= fearRoll;
  const success = total >= difficulty;
  let result;
  if (critical) result = 'critical';
  else if (success && withHope) result = 'hope';
  else if (success && !withHope) result = 'fear';
  else result = 'fail';
  return { total, hopeRoll, fearRoll, result, withHope, success, critical };
}

export function createDHDefaultState() {
  return {
    system: 'daggerheart',
    schemaVersion: '2.0.0',
    charName: '',
    charClass: '',
    charSubclass: '',
    ancestry: '',
    community: '',
    charLevel: 1,
    traits: { AGI: 0, STR: 0, FIN: 0, INS: 0, PRE: 0, KNO: 0 },
    evasion: 10,
    hpCurrent: 6,
    hpMax: 6,
    stressCurrent: 0,
    stressMax: 6,
    hope: 2,
    fear: 0,
    proficiency: 1,
    armorScore: 0,
    armorName: '',
    thresholdMinor: 0,
    thresholdMajor: 0,
    thresholdSevere: 0,
    experiences: [
      { name: '', modifier: 2 },
      { name: '', modifier: 2 },
    ],
    domainCards: [],
    weapons: [],
    equipment: [],
    gold: 0,
    notes: { background: '', connections: '', free: '' },
    actions: [],
    conditions: [],
  };
}
