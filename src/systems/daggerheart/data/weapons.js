// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license
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
