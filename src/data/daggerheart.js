// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license
// This work uses material from the Daggerheart SRD, available at
// https://www.daggerheart.com/srd under the DPCGL.

import dhEN from './daggerheart.i18n.json';
import dhIT from './daggerheart.i18n.it.json';

const DH_I18N = { en: dhEN, it: dhIT };

function resolveDHLang(lang) {
  const code = (lang || 'en').slice(0, 2).toLowerCase();
  return DH_I18N[code] ? code : 'en';
}

function dhI18n(lang) {
  return DH_I18N[resolveDHLang(lang)];
}

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

// ── WEAPONS SRD ─────────────────────────────────────────────────
// Range values: 'Melee' | 'Very Close' | 'Close' | 'Far' | 'Very Far'
// Damage types: 'phy' (physical) | 'mag' (magic)
// Hands: 'one-handed' | 'two-handed'

export const DH_WEAPONS = [
  // ── Tier 1 One-Handed Primary ──
  { id: 'short-sword',  name: 'Short Sword',  trait: 'AGI', range: 'Melee',      dmgDie: 'd8',    dmgType: 'phy', hands: 'one-handed', feature: null },
  { id: 'dagger',       name: 'Dagger',        trait: 'FIN', range: 'Melee',      dmgDie: 'd6',    dmgType: 'phy', hands: 'one-handed', feature: 'Thrown: You can attack a target at Close range with this weapon.' },
  { id: 'mace',         name: 'Mace',          trait: 'STR', range: 'Melee',      dmgDie: 'd8',    dmgType: 'phy', hands: 'one-handed', feature: null },
  { id: 'rapier',       name: 'Rapier',        trait: 'PRE', range: 'Melee',      dmgDie: 'd8',    dmgType: 'phy', hands: 'one-handed', feature: 'Quick: When you make an attack, you can mark a Stress to target another creature within range.' },
  { id: 'small-dagger', name: 'Small Dagger',  trait: 'FIN', range: 'Melee',      dmgDie: 'd8',    dmgType: 'phy', hands: 'one-handed', feature: 'Paired: +2 to primary weapon damage to targets within Melee range.' },
  { id: 'wand',         name: 'Wand',          trait: 'KNO', range: 'Very Close', dmgDie: 'd6',    dmgType: 'mag', hands: 'one-handed', feature: null },
  { id: 'shortbow',     name: 'Shortbow',      trait: 'AGI', range: 'Close',      dmgDie: 'd6',    dmgType: 'phy', hands: 'one-handed', feature: null },
  // ── Tier 1 One-Handed Secondary ──
  { id: 'round-shield', name: 'Round Shield',  trait: 'STR', range: 'Melee',      dmgDie: 'd4',    dmgType: 'phy', hands: 'one-handed', feature: 'Protective: +1 to Armor Score.' },
  { id: 'buckler',      name: 'Buckler',       trait: 'AGI', range: 'Melee',      dmgDie: 'd4',    dmgType: 'phy', hands: 'one-handed', feature: 'Reactive: Once per rest, you can use this weapon to give yourself +2 Evasion until your next turn.' },
  { id: 'tome',         name: 'Tome',          trait: 'KNO', range: 'Melee',      dmgDie: 'd4',    dmgType: 'mag', hands: 'one-handed', feature: 'Arcane Focus: You can use this as a spellcasting focus.' },
  // ── Tier 1 Two-Handed Primary ──
  { id: 'longsword',    name: 'Longsword',     trait: 'STR', range: 'Melee',      dmgDie: 'd10+1', dmgType: 'phy', hands: 'two-handed', feature: null },
  { id: 'greataxe',     name: 'Greataxe',      trait: 'STR', range: 'Melee',      dmgDie: 'd12',   dmgType: 'phy', hands: 'two-handed', feature: 'Cleave: When you roll max damage, deal half damage to another target within Melee range.' },
  { id: 'shortstaff',   name: 'Shortstaff',    trait: 'INS', range: 'Close',      dmgDie: 'd8+1',  dmgType: 'mag', hands: 'two-handed', feature: null },
  { id: 'longbow',      name: 'Longbow',       trait: 'AGI', range: 'Far',        dmgDie: 'd8+1',  dmgType: 'phy', hands: 'two-handed', feature: null },
  { id: 'war-hammer',   name: 'War Hammer',    trait: 'STR', range: 'Melee',      dmgDie: 'd10',   dmgType: 'phy', hands: 'two-handed', feature: 'Brutal: When you succeed on an attack, you can mark a Stress to deal an extra d6 damage.' },
  { id: 'glaive',       name: 'Glaive',        trait: 'STR', range: 'Melee',      dmgDie: 'd10',   dmgType: 'phy', hands: 'two-handed', feature: 'Reach: You can attack targets at Very Close range.' },
  { id: 'crossbow',     name: 'Crossbow',      trait: 'FIN', range: 'Far',        dmgDie: 'd8',    dmgType: 'phy', hands: 'two-handed', feature: 'Reload: After attacking, you must spend your next action reloading before attacking again.' },
  { id: 'grappler',     name: 'Grappler',      trait: 'STR', range: 'Close',      dmgDie: 'd6',    dmgType: 'phy', hands: 'two-handed', feature: 'Pull: When you succeed on an attack, you can pull the target to Melee range.' },
  { id: 'spellbook',    name: 'Spellbook',     trait: 'KNO', range: 'Close',      dmgDie: 'd8+1',  dmgType: 'mag', hands: 'two-handed', feature: 'Tome: You can use this as a spellcasting focus.' },
  { id: 'harp',         name: 'Harp',          trait: 'PRE', range: 'Close',      dmgDie: 'd6+1',  dmgType: 'mag', hands: 'two-handed', feature: 'Harmonic: When you succeed on an attack, an ally within range gains a Hope.' },
];

// ── ARMOR SRD ────────────────────────────────────────────────────
// baseThresholds: [minor, major] — player adds level to both
// baseScore: armor score before bonuses

export const DH_ARMORS = [
  { id: 'none',            name: 'No Armor',        baseThresholds: [3, 7],   baseScore: 0, feature: null },
  { id: 'gambeson',        name: 'Gambeson Armor',  baseThresholds: [5, 11],  baseScore: 3, feature: 'Flexible: +1 to Evasion.' },
  { id: 'leather',         name: 'Leather Armor',   baseThresholds: [6, 13],  baseScore: 3, feature: null },
  { id: 'studded-leather', name: 'Studded Leather', baseThresholds: [6, 14],  baseScore: 3, feature: null },
  { id: 'chainmail',       name: 'Chainmail',       baseThresholds: [7, 15],  baseScore: 4, feature: 'Noisy: You have disadvantage on Finesse rolls to be stealthy.' },
  { id: 'half-plate',      name: 'Half Plate',      baseThresholds: [8, 16],  baseScore: 5, feature: 'Sturdy: When you take damage, you can spend an Armor Slot to reduce it by 2.' },
  { id: 'full-plate',      name: 'Full Plate',      baseThresholds: [9, 18],  baseScore: 6, feature: 'Impenetrable: When you take Severe damage, treat it as Major instead.' },
];

// ── CLASSES ──────────────────────────────────────────────────────

export const DH_CLASSES = [
  {
    id: 'bard', name: 'Bard',
    domains: ['codex', 'grace'],
    evasion: 12, hp: 6, stress: 6,
    subclasses: ['Troubadour', 'Wordsmith'],
    primaryWeaponOptions: 'rapier, small dagger, wand, shortbow, dagger, spellbook, harp',
    secondaryWeaponOptions: 'round shield, buckler, tome, small dagger',
    suggestedTraits: { AGI: 0, STR: -1, FIN: 1, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Bardic Flourish', desc: "When you succeed on an attack with a weapon in your primary hand, you can mark a Stress to roll your secondary weapon's damage dice and add that result to the damage you deal." },
      { name: 'Rally', desc: 'When you or an ally within Close range takes damage, you can spend a Hope to have them clear a Stress or mark a Hit Point instead.' },
    ],
  },
  {
    id: 'druid', name: 'Druid',
    domains: ['arcana', 'sage'],
    evasion: 11, hp: 6, stress: 6,
    subclasses: ['Warden of the Elements', 'Warden of Renewal'],
    primaryWeaponOptions: 'shortstaff, shortbow, dagger, wand',
    secondaryWeaponOptions: 'round shield, tome',
    suggestedTraits: { AGI: 1, STR: 0, FIN: 1, INS: 2, PRE: -1, KNO: 0 },
    features: [
      { name: 'Wildtouch', desc: 'You can perform harmless, subtle effects that involve nature—such as causing a flower to rapidly grow, summoning a slight gust of wind, or starting a campfire—at will.' },
      { name: 'Beastform', desc: 'Choose a Beastform from the Druid Beastform list. You can spend a Hope to transform into that creature as an action.' },
    ],
  },
  {
    id: 'guardian', name: 'Guardian',
    domains: ['blade', 'valor'],
    evasion: 12, hp: 7, stress: 6,
    subclasses: ['Stalwart', 'Vengeance'],
    primaryWeaponOptions: 'longsword, greataxe, war-hammer, glaive, mace',
    secondaryWeaponOptions: 'round shield, buckler, short-sword, dagger',
    suggestedTraits: { AGI: 0, STR: 2, FIN: -1, INS: 1, PRE: 0, KNO: 1 },
    features: [
      { name: 'Stalwart Mark', desc: 'Once per session, you can mark an adversary. You have advantage on attacks against marked adversaries, and allies have advantage on Presence rolls to assist you against them.' },
      { name: 'Protective Presence', desc: 'Once per long rest, when an ally within Close range would take damage, you can use your reaction to take half that damage instead.' },
    ],
  },
  {
    id: 'ranger', name: 'Ranger',
    domains: ['bone', 'sage'],
    evasion: 12, hp: 6, stress: 6,
    subclasses: ['Beastbound', 'Wayfinder'],
    primaryWeaponOptions: 'longbow, crossbow, short-sword, dagger, shortbow',
    secondaryWeaponOptions: 'dagger, small dagger, buckler',
    suggestedTraits: { AGI: 1, STR: 0, FIN: 0, INS: 2, PRE: -1, KNO: 1 },
    features: [
      { name: "Ranger's Focus", desc: 'Once per session, you can declare a creature as your Quarry. You have advantage on attack rolls and Instinct rolls involving your Quarry.' },
      { name: 'Survivalist', desc: 'When you make a roll to navigate, forage, or track, you can add your Instinct modifier twice.' },
    ],
  },
  {
    id: 'rogue', name: 'Rogue',
    domains: ['grace', 'midnight'],
    evasion: 13, hp: 5, stress: 6,
    subclasses: ['Nightwalker', 'Syndicate'],
    primaryWeaponOptions: 'dagger, rapier, short-sword, shortbow',
    secondaryWeaponOptions: 'small dagger, dagger, buckler',
    suggestedTraits: { AGI: 2, STR: -1, FIN: 1, INS: 1, PRE: 0, KNO: 0 },
    features: [
      { name: 'Hidden Strike', desc: 'When you attack from Hiding or when an ally is in Melee range of your target, you can spend a Hope to add your Finesse modifier to your damage roll.' },
      { name: 'Evasive', desc: 'When a creature makes an attack against you, you can spend a Hope to add +2 to your Evasion against that attack.' },
    ],
  },
  {
    id: 'seraph', name: 'Seraph',
    domains: ['splendor', 'valor'],
    evasion: 11, hp: 7, stress: 6,
    subclasses: ['Divine Wielder', 'Winged Sentinel'],
    primaryWeaponOptions: 'longsword, mace, war-hammer, shortstaff',
    secondaryWeaponOptions: 'round shield, buckler, tome',
    suggestedTraits: { AGI: -1, STR: 1, FIN: 0, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Healing Hands', desc: 'Once per session, you can lay hands on a creature and spend any number of Hope. That creature clears that many Hit Points.' },
      { name: 'Divine Aura', desc: 'Allies within Close range of you have +1 to their Evasion.' },
    ],
  },
  {
    id: 'sorcerer', name: 'Sorcerer',
    domains: ['arcana', 'midnight'],
    evasion: 11, hp: 5, stress: 6,
    subclasses: ['Elemental Origin', 'Primal Origin'],
    primaryWeaponOptions: 'shortstaff, wand, spellbook, dagger',
    secondaryWeaponOptions: 'tome, wand, dagger',
    suggestedTraits: { AGI: 0, STR: -1, FIN: 1, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Arcane Surge', desc: 'Once per session, when you cast a spell, you can mark a Stress to double the number of damage dice you roll.' },
      { name: 'Innate Magic', desc: 'You can spend a Hope to cast any cantrip from the Arcana domain without expending a domain card.' },
    ],
  },
  {
    id: 'warrior', name: 'Warrior',
    domains: ['blade', 'bone'],
    evasion: 11, hp: 8, stress: 6,
    subclasses: ['Call of the Brave', 'Call of the Slayer'],
    primaryWeaponOptions: 'longsword, greataxe, war-hammer, glaive, grappler',
    secondaryWeaponOptions: 'round shield, buckler, short-sword, dagger',
    suggestedTraits: { AGI: 0, STR: 2, FIN: 0, INS: 1, PRE: -1, KNO: 1 },
    features: [
      { name: 'Extra Attack', desc: 'When you take the Attack action, you can attack twice instead of once.' },
      { name: 'Battle Cry', desc: 'Once per short rest, you can use a bonus action to give all allies within Close range advantage on their next attack roll.' },
    ],
  },
  {
    id: 'wizard', name: 'Wizard',
    domains: ['codex', 'splendor'],
    evasion: 10, hp: 5, stress: 6,
    subclasses: ['School of Knowledge', 'School of War'],
    primaryWeaponOptions: 'spellbook, shortstaff, wand, dagger',
    secondaryWeaponOptions: 'tome, wand, dagger',
    suggestedTraits: { AGI: -1, STR: 0, FIN: 1, INS: 1, PRE: 0, KNO: 2 },
    features: [
      { name: 'Spellbook Mastery', desc: 'Your spellbook contains one additional domain card of your level or lower from the Codex or Splendor domain.' },
      { name: 'Arcane Recovery', desc: 'Once per long rest, you can clear 1d4 Stress as you channel ambient magic into yourself.' },
    ],
  },
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

// ── CONDITIONS ───────────────────────────────────────────────────

export const DH_CONDITIONS = [
  { id: 'restrained',  name: 'Restrained',  icon: '⛓',  desc: 'You cannot move from your current position.' },
  { id: 'vulnerable',  name: 'Vulnerable',  icon: '💢',  desc: 'Attacks against you deal +1d4 damage.' },
  { id: 'hidden',      name: 'Hidden',      icon: '👻',  desc: 'You cannot be targeted by attacks until you act or are revealed.' },
  { id: 'slow',        name: 'Slow',        icon: '🐌',  desc: 'You cannot take a reaction this round.' },
  { id: 'frightened',  name: 'Frightened',  icon: '😨',  desc: 'You must move away from the source of your fear when possible.' },
  { id: 'unconscious', name: 'Unconscious', icon: '💤',  desc: 'You are incapacitated and cannot take actions.' },
];

// ── Getters (i18n-aware) ─────────────────────────────────────────

export function getDHClasses(lang) {
  const tr = dhI18n(lang).classes || {};
  return DH_CLASSES.map(c => ({
    ...c,
    name: tr[c.id]?.name || c.name,
    subclasses: tr[c.id]?.subclasses || c.subclasses,
  }));
}

export function getDHDomains(lang) {
  const tr = dhI18n(lang).domains || {};
  return DH_DOMAINS.map(d => ({
    ...d,
    name: tr[d.id]?.name || d.name,
    desc: tr[d.id]?.desc || d.desc,
  }));
}

export function getDHAncestries(lang) {
  const tr = dhI18n(lang).ancestries || {};
  return DH_ANCESTRIES.map(a => tr[a] || a);
}

export function getDHCommunities(lang) {
  const tr = dhI18n(lang).communities || {};
  return DH_COMMUNITIES.map(c => ({ id: c, name: tr[c] || c }));
}

export function getDHConditions(lang) {
  const tr = dhI18n(lang).conditions || {};
  return DH_CONDITIONS.map(c => ({
    ...c,
    name: tr[c.id]?.name || c.name,
    desc: tr[c.id]?.desc || c.desc,
  }));
}

export function getDHTraitUses(lang) {
  const tr = dhI18n(lang).traits || {};
  const result = {};
  DH_TRAITS.forEach(k => { result[k] = tr[k]?.uses || DH_TRAIT_USES[k]; });
  return result;
}

// ── Utility ──────────────────────────────────────────────────────

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
