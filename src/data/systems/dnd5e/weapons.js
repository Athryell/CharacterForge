// CharacterForge — D&D 5e SRD 5.2 Weapons (CC BY 4.0 — Wizards of the Coast)
// Unified from data/srd/weapons.js (mechanical data) + data/weapons.js (properties, masteries, helpers)

// ── SRD Weapon Data ──────────────────────────────────────────────────────────

export const DND_WEAPONS = [
  // ── Simple Melee ─────────────────────────────────────────────────────────
  { id: 'club',           category: 'simple-melee',   dmg: '1d4',  properties: ['light'],                          mastery: 'slow',   weight: '2 lb.',   cost: '1 SP' },
  { id: 'dagger',         category: 'simple-melee',   dmg: '1d4',  properties: ['finesse','light','thrown'],        mastery: 'nick',   weight: '1 lb.',   cost: '2 GP',  range: '20/60' },
  { id: 'greatclub',      category: 'simple-melee',   dmg: '1d8',  properties: ['two-handed'],                      mastery: 'push',   weight: '10 lb.',  cost: '2 SP' },
  { id: 'handaxe',        category: 'simple-melee',   dmg: '1d6',  properties: ['light','thrown'],                 mastery: 'vex',    weight: '2 lb.',   cost: '5 GP',  range: '20/60' },
  { id: 'javelin',        category: 'simple-melee',   dmg: '1d6',  properties: ['thrown'],                         mastery: 'slow',   weight: '2 lb.',   cost: '5 SP',  range: '30/120' },
  { id: 'light_hammer',   category: 'simple-melee',   dmg: '1d4',  properties: ['light','thrown'],                 mastery: 'nick',   weight: '2 lb.',   cost: '2 GP',  range: '20/60' },
  { id: 'mace',           category: 'simple-melee',   dmg: '1d6',  properties: [],                                  mastery: 'sap',    weight: '4 lb.',   cost: '5 GP' },
  { id: 'quarterstaff',   category: 'simple-melee',   dmg: '1d6',  properties: ['versatile'],  versatileDmg: '1d8', mastery: 'topple', weight: '4 lb.',   cost: '2 SP' },
  { id: 'sickle',         category: 'simple-melee',   dmg: '1d4',  properties: ['light'],                           mastery: 'nick',   weight: '2 lb.',   cost: '1 GP' },
  { id: 'spear',          category: 'simple-melee',   dmg: '1d6',  properties: ['thrown','versatile'], versatileDmg: '1d8', mastery: 'sap', weight: '3 lb.', cost: '1 GP', range: '20/60' },

  // ── Simple Ranged ─────────────────────────────────────────────────────────
  { id: 'dart',           category: 'simple-ranged',  dmg: '1d4',  properties: ['finesse','thrown','ammunition'],  mastery: 'vex',    weight: '1/4 lb.', cost: '5 CP',  range: '20/60' },
  { id: 'light_crossbow', category: 'simple-ranged',  dmg: '1d8',  properties: ['ammunition','loading','two-handed'], mastery: 'slow', weight: '5 lb.',  cost: '25 GP', range: '80/320' },
  { id: 'shortbow',       category: 'simple-ranged',  dmg: '1d6',  properties: ['ammunition','two-handed'],        mastery: 'vex',    weight: '2 lb.',   cost: '25 GP', range: '80/320' },
  { id: 'sling',          category: 'simple-ranged',  dmg: '1d4',  properties: ['ammunition'],                      mastery: 'slow',   weight: '—',       cost: '1 SP',  range: '30/120' },

  // ── Martial Melee ─────────────────────────────────────────────────────────
  { id: 'battleaxe',      category: 'martial-melee',  dmg: '1d8',  properties: ['versatile'],  versatileDmg: '1d10', mastery: 'topple', weight: '4 lb.',  cost: '10 GP' },
  { id: 'flail',          category: 'martial-melee',  dmg: '1d8',  properties: [],                                   mastery: 'sap',    weight: '2 lb.',   cost: '10 GP' },
  { id: 'glaive',         category: 'martial-melee',  dmg: '1d10', properties: ['heavy','reach','two-handed'],       mastery: 'graze',  weight: '6 lb.',   cost: '20 GP' },
  { id: 'greataxe',       category: 'martial-melee',  dmg: '1d12', properties: ['heavy','two-handed'],               mastery: 'cleave', weight: '7 lb.',   cost: '30 GP' },
  { id: 'greatsword',     category: 'martial-melee',  dmg: '2d6',  properties: ['heavy','two-handed'],               mastery: 'graze',  weight: '6 lb.',   cost: '50 GP' },
  { id: 'halberd',        category: 'martial-melee',  dmg: '1d10', properties: ['heavy','reach','two-handed'],       mastery: 'cleave', weight: '6 lb.',   cost: '20 GP' },
  { id: 'lance',          category: 'martial-melee',  dmg: '1d10', properties: ['heavy','reach','two-handed'],       mastery: 'topple', weight: '6 lb.',   cost: '10 GP' },
  { id: 'longsword',      category: 'martial-melee',  dmg: '1d8',  properties: ['versatile'],  versatileDmg: '1d10', mastery: 'sap',    weight: '3 lb.',   cost: '15 GP' },
  { id: 'maul',           category: 'martial-melee',  dmg: '2d6',  properties: ['heavy','two-handed'],               mastery: 'topple', weight: '10 lb.',  cost: '10 GP' },
  { id: 'morningstar',    category: 'martial-melee',  dmg: '1d8',  properties: [],                                   mastery: 'sap',    weight: '4 lb.',   cost: '15 GP' },
  { id: 'pike',           category: 'martial-melee',  dmg: '1d10', properties: ['heavy','reach','two-handed'],       mastery: 'push',   weight: '18 lb.',  cost: '5 GP' },
  { id: 'rapier',         category: 'martial-melee',  dmg: '1d8',  properties: ['finesse'],                          mastery: 'vex',    weight: '2 lb.',   cost: '25 GP' },
  { id: 'scimitar',       category: 'martial-melee',  dmg: '1d6',  properties: ['finesse','light'],                  mastery: 'nick',   weight: '3 lb.',   cost: '25 GP' },
  { id: 'shortsword',     category: 'martial-melee',  dmg: '1d6',  properties: ['finesse','light'],                  mastery: 'vex',    weight: '2 lb.',   cost: '10 GP' },
  { id: 'trident',        category: 'martial-melee',  dmg: '1d8',  properties: ['thrown','versatile'], versatileDmg: '1d10', mastery: 'topple', weight: '4 lb.', cost: '5 GP', range: '20/60' },
  { id: 'warhammer',      category: 'martial-melee',  dmg: '1d8',  properties: ['versatile'],  versatileDmg: '1d10', mastery: 'push',   weight: '5 lb.',   cost: '15 GP' },
  { id: 'war_pick',       category: 'martial-melee',  dmg: '1d8',  properties: ['versatile'],  versatileDmg: '1d10', mastery: 'sap',    weight: '2 lb.',   cost: '5 GP' },
  { id: 'whip',           category: 'martial-melee',  dmg: '1d4',  properties: ['finesse','reach'],                  mastery: 'slow',   weight: '3 lb.',   cost: '2 GP' },

  // ── Martial Ranged ────────────────────────────────────────────────────────
  { id: 'blowgun',        category: 'martial-ranged', dmg: '1',    properties: ['ammunition','loading'],             mastery: 'vex',    weight: '1 lb.',   cost: '10 GP', range: '25/100' },
  { id: 'hand_crossbow',  category: 'martial-ranged', dmg: '1d6',  properties: ['ammunition','light','loading'],    mastery: 'vex',    weight: '3 lb.',   cost: '75 GP', range: '30/120' },
  { id: 'heavy_crossbow', category: 'martial-ranged', dmg: '1d10', properties: ['ammunition','heavy','loading','two-handed'], mastery: 'push', weight: '18 lb.', cost: '50 GP', range: '100/400' },
  { id: 'longbow',        category: 'martial-ranged', dmg: '1d8',  properties: ['ammunition','heavy','two-handed'], mastery: 'slow',   weight: '2 lb.',   cost: '50 GP', range: '150/600' },
  { id: 'musket',         category: 'martial-ranged', dmg: '1d12', properties: ['ammunition','loading','two-handed'], mastery: 'slow', weight: '10 lb.',  cost: '500 GP', range: '40/120' },
  { id: 'pistol',         category: 'martial-ranged', dmg: '1d10', properties: ['ammunition','loading'],             mastery: 'vex',    weight: '3 lb.',   cost: '250 GP', range: '30/90' },
];

// Backward-compat alias
export const SRD_WEAPONS = DND_WEAPONS;

// ── Weapon Mechanics (from data/weapons.js) ──────────────────────────────────

export const WEAPON_PROPERTIES = {
  finesse:    'finesse',
  thrown:     'thrown',
  ranged:     'ranged',
  twoHanded:  'twoHanded',
  versatile:  'versatile',
  light:      'light',
  heavy:      'heavy',
  reach:      'reach',
  loading:    'loading',
  ammunition: 'ammunition',
};

export const WEAPON_MASTERIES = {
  none:   { label: 'none',   desc: '' },
  cleave: { label: 'cleave', desc: 'On a hit, attack one adjacent creature within reach using the same action.' },
  graze:  { label: 'graze',  desc: 'On a miss, deal damage equal to your STR or DEX modifier (minimum 0).' },
  nick:   { label: 'nick',   desc: 'With this Light weapon you can make the extra two-weapon-fighting attack as a free action, without spending a bonus action.' },
  push:   { label: 'push',   desc: 'On a hit, push the target 10 ft (if Large or smaller) provided it has two feet on the ground.' },
  sap:    { label: 'sap',    desc: 'On a hit, the target has disadvantage on its next attack roll until the start of your next turn.' },
  slow:   { label: 'slow',   desc: 'On a hit, the target\'s speed is reduced by 10 ft until the start of your next turn.' },
  topple: { label: 'topple', desc: 'On a hit, the target must succeed on a STR save (DC = 8 + prof bonus + mod) or fall prone.' },
  vex:    { label: 'vex',    desc: 'On a hit, you gain advantage on your next attack roll against the same target before the end of your next turn.' },
};

export const ABILITY_OPTIONS = [
  { value: 'auto', label: 'Auto (STR/DEX)' },
  { value: 'STR',  label: 'Strength (STR)' },
  { value: 'DEX',  label: 'Dexterity (DEX)' },
  { value: 'CON',  label: 'Constitution (CON)' },
  { value: 'INT',  label: 'Intelligence (INT)' },
  { value: 'WIS',  label: 'Wisdom (WIS)' },
  { value: 'CHA',  label: 'Charisma (CHA)' },
];

export function calcWeaponAttack({ weapon, abilities, profBonus, isProficient }) {
  const override = weapon.abilityBonus;
  let statMod;

  if (override && override !== 'auto') {
    statMod = Math.floor(((abilities[override] ?? 10) - 10) / 2);
  } else if (weapon.properties?.includes('finesse')) {
    const strMod = Math.floor(((abilities.STR ?? 10) - 10) / 2);
    const dexMod = Math.floor(((abilities.DEX ?? 10) - 10) / 2);
    statMod = Math.max(strMod, dexMod);
  } else if (weapon.properties?.includes('ranged')) {
    statMod = Math.floor(((abilities.DEX ?? 10) - 10) / 2);
  } else {
    statMod = Math.floor(((abilities.STR ?? 10) - 10) / 2);
  }

  const prof = isProficient ? profBonus : 0;
  const attackBonus = statMod + prof;
  const dmgBonus = statMod;

  return { attackBonus, dmgBonus, statMod, prof };
}

export function fmtWeaponDmg(baseDmg, dmgBonus) {
  if (dmgBonus === 0) return baseDmg;
  if (dmgBonus > 0)  return `${baseDmg}+${dmgBonus}`;
  return `${baseDmg}${dmgBonus}`;
}
