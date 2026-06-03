// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license
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
