// Weapons SRD 5.2 (CC BY 4.0 — Wizards of the Coast)
// Property and mastery labels are i18n keys — display via t('data.weaponProps.<key>') etc.

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

export const WEAPON_PRESETS = [
  // Simple Melee
  { name: 'Club',             dmg: '1d4',  dmgType: 'bludgeoning', properties: ['light'], prof: true, mastery: 'slow' },
  { name: 'Dagger',           dmg: '1d4',  dmgType: 'piercing',    properties: ['finesse','light','thrown'], range: '20/60', prof: true, mastery: 'nick' },
  { name: 'Greatclub',        dmg: '1d8',  dmgType: 'bludgeoning', properties: [], prof: true, mastery: 'topple' },
  { name: 'Handaxe',          dmg: '1d6',  dmgType: 'slashing',    properties: ['light','thrown'], range: '20/60', prof: true, mastery: 'vex' },
  { name: 'Spear',            dmg: '1d6',  dmgType: 'piercing',    properties: ['thrown','versatile'], versatileDmg: '1d8', range: '20/60', prof: true, mastery: 'sap' },
  { name: 'Mace',             dmg: '1d6',  dmgType: 'bludgeoning', properties: [], prof: true, mastery: 'sap' },
  { name: 'Quarterstaff',     dmg: '1d6',  dmgType: 'bludgeoning', properties: ['versatile'], versatileDmg: '1d8', prof: true, mastery: 'topple' },
  // Martial Melee
  { name: 'Shortsword',       dmg: '1d6',  dmgType: 'piercing',    properties: ['finesse','light'], prof: false, mastery: 'vex' },
  { name: 'Longsword',        dmg: '1d8',  dmgType: 'slashing',    properties: ['versatile'], versatileDmg: '1d10', prof: false, mastery: 'sap' },
  { name: 'Greatsword',       dmg: '2d6',  dmgType: 'slashing',    properties: ['heavy','twoHanded'], prof: false, mastery: 'graze' },
  { name: 'Battleaxe',        dmg: '1d8',  dmgType: 'slashing',    properties: ['versatile'], versatileDmg: '1d10', prof: false, mastery: 'topple' },
  { name: 'Halberd',          dmg: '1d10', dmgType: 'slashing',    properties: ['heavy','reach','twoHanded'], prof: false, mastery: 'cleave' },
  { name: 'Rapier',           dmg: '1d8',  dmgType: 'piercing',    properties: ['finesse'], prof: false, mastery: 'vex' },
  // Simple Ranged
  { name: 'Shortbow',         dmg: '1d6',  dmgType: 'piercing',    properties: ['ammunition','ranged','twoHanded'], range: '80/320', prof: true, mastery: 'vex' },
  { name: 'Light Crossbow',   dmg: '1d8',  dmgType: 'piercing',    properties: ['ammunition','ranged','loading'], range: '80/320', prof: true, mastery: 'slow' },
  // Martial Ranged
  { name: 'Longbow',          dmg: '1d8',  dmgType: 'piercing',    properties: ['ammunition','ranged','heavy','twoHanded'], range: '150/600', prof: false, mastery: 'slow' },
  { name: 'Heavy Crossbow',   dmg: '1d10', dmgType: 'piercing',    properties: ['ammunition','ranged','heavy','loading'], range: '100/400', prof: false, mastery: 'push' },
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
