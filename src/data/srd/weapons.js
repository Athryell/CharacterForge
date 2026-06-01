// SRD 5.2.1 (CC BY 4.0) — Wizards of the Coast LLC — https://www.dndbeyond.com/srd
// Weapon mechanical data — translatable strings in weapons.i18n.{lang}.json

export const SRD_WEAPONS = [
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
