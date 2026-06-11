// CharacterForge — D&D 5e SRD 5.2 Data (CC BY 4.0 — Wizards of the Coast)
// https://dnd.wizards.com/resources/systems-reference-document
// All internal keys use English — display names come from i18n.

export const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const SKILLS = [
  { id: 'acrobatics',    attr: 'DEX' },
  { id: 'animal-handling', attr: 'WIS' },
  { id: 'arcana',        attr: 'INT' },
  { id: 'athletics',     attr: 'STR' },
  { id: 'deception',     attr: 'CHA' },
  { id: 'history',       attr: 'INT' },
  { id: 'insight',       attr: 'WIS' },
  { id: 'intimidation',  attr: 'CHA' },
  { id: 'investigation', attr: 'INT' },
  { id: 'medicine',      attr: 'WIS' },
  { id: 'nature',        attr: 'INT' },
  { id: 'perception',    attr: 'WIS' },
  { id: 'performance',   attr: 'CHA' },
  { id: 'persuasion',    attr: 'CHA' },
  { id: 'religion',      attr: 'INT' },
  { id: 'sleight-of-hand', attr: 'DEX' },
  { id: 'stealth',       attr: 'DEX' },
  { id: 'survival',      attr: 'WIS' },
];

export const SPELLCASTING_CLASS = {
  Wizard: 'INT', Cleric: 'WIS', Druid: 'WIS',
  Bard: 'CHA', Sorcerer: 'CHA', Warlock: 'CHA',
  Paladin: 'CHA', Ranger: 'WIS',
};

export const HIT_DICE = {
  Barbarian: 'd12', Fighter: 'd10', Paladin: 'd10', Ranger: 'd10',
  Bard: 'd8', Cleric: 'd8', Druid: 'd8', Monk: 'd8', Rogue: 'd8', Warlock: 'd8',
  Sorcerer: 'd6', Wizard: 'd6',
};

export const SLOT_TABLE = {
  1:  [2,0,0,0,0,0,0,0,0], 2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0], 4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0], 6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0], 8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0], 10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0], 12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0], 14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0], 16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1], 18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1], 20: [4,3,3,3,3,2,2,1,1],
};

// Default action added to every new character — content is in English (base language).
export const DEFAULT_ACTIONS = [
  {
    id: 'default_action',
    name: 'Action',
    type: 'action',
    desc: "On your turn you can: **Attack** – make a melee or ranged attack. **Dash** – gain extra movement equal to your speed. **Disengage** – your movement doesn't provoke opportunity attacks. **Dodge** – attacks against you have disadvantage; you have advantage on DEX saves. **Help** – grant an ally advantage on their next check or attack. **Hide** – make a Stealth (DEX) check. **Ready** – prepare a reaction to a trigger. **Use an Object** – interact with an item in your inventory.",
    dice: '',
  },
];

export const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
];

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const JSON_SCHEMA_VERSION = '2.0.0';

export function getMod(score) {
  return Math.floor((score - 10) / 2);
}

export function getProfBonus(level) {
  return Math.floor((level - 1) / 4) + 2;
}

export function fmtMod(n) {
  return n >= 0 ? '+' + n : '' + n;
}

export function createDefaultState() {
  return {
    schemaVersion: JSON_SCHEMA_VERSION,
    _schema_v2: true,
    template: 'dnd5e',
    charName: '',
    charClass: '',
    charRace: '',
    charBackground: '',
    charLevel: 1,
    charXP: 0,
    charAlignment: 'Lawful Good',
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    saveProficiencies: [],
    skillProficiencies: [],
    skillExpertise: [],
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    ac: 10,
    speed: '30ft',
    inspiration: false,
    deathSuccess: [false, false, false],
    deathFail: [false, false, false],
    spellSlots: [],
    actions: [...DEFAULT_ACTIONS],
    spells: [],
    equipment: [],
    currency: { GP: 0, SP: 0, CP: 0, PP: 0 },
    charImage: '',
    equippedArmor: null,
    hasShield: false,
    concentratingSpell: null,
    concentrationProficiency: false,
    hitDiceUsed: 0,
    features: [],
    weaponProficiency: '',
    armorProficiency: '',
    notes: {
      personality: '',
      ideals: '',
      bonds: '',
      flaws: '',
      free: '',
      classFeatures: '',
    },
    levelHistory: {},
    charSubclass: '',
    subclassFeatures: [],
  };
}
