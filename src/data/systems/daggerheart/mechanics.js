// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license

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

export const DH_ANCESTRIES = [
  'Clank','Drakona','Dwarf','Elf','Faerie','Faun','Firbolg','Fungril',
  'Galapa','Giant','Goblin','Halfling','Human','Infernis','Katari',
  'Orc','Ribbet','Simiah',
];

export const DH_COMMUNITIES = [
  'Highborne','Loreborne','Orderborne','Ridgeborne','Seaborne',
  'Slyborne','Underborne','Wanderborne','Wildborne',
];

// Tier: 1=L1, 2=L2-4, 3=L5-7, 4=L8-10
export function getDHTier(level) {
  if (level >= 8) return 4;
  if (level >= 5) return 3;
  if (level >= 2) return 2;
  return 1;
}

// Base proficiency = tier (can be manually increased above this)
export function getDHProficiency(level) {
  return getDHTier(level);
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
    hopeMax: 6,
    fear: 0,
    fearMax: 6,
    proficiency: 1,
    armorSlots: 0,
    armorSlotsMax: 0,
    armorName: '',
    armorFeature: '',
    thresholdMinor: 0,
    thresholdMajor: 0,
    thresholdSevere: 0,
    dhCounterMode: 'pip',
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
