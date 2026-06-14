// CharacterForge — D&D 5e SRD 5.2.1 Armor (CC BY 4.0 — Wizards of the Coast)

export const DND_ARMOR_PRESETS = [
  // Light armor — no STR req, full DEX bonus
  { id: 'padded',      name: 'Padded',          type: 'light',  ac: 11, strReq: 0,  maxDex: null },
  { id: 'leather',     name: 'Leather',         type: 'light',  ac: 11, strReq: 0,  maxDex: null },
  { id: 'studded',     name: 'Studded Leather', type: 'light',  ac: 12, strReq: 0,  maxDex: null },
  // Medium armor — DEX capped at +2
  { id: 'hide',        name: 'Hide',            type: 'medium', ac: 12, strReq: 0,  maxDex: 2 },
  { id: 'chainshirt',  name: 'Chain Shirt',     type: 'medium', ac: 13, strReq: 0,  maxDex: 2 },
  { id: 'scale',       name: 'Scale Mail',      type: 'medium', ac: 14, strReq: 0,  maxDex: 2 },
  { id: 'breastplate', name: 'Breastplate',     type: 'medium', ac: 14, strReq: 0,  maxDex: 2 },
  { id: 'halfplate',   name: 'Half Plate',      type: 'medium', ac: 15, strReq: 0,  maxDex: 2 },
  // Heavy armor — no DEX bonus; some require STR
  { id: 'ring',        name: 'Ring Mail',       type: 'heavy',  ac: 14, strReq: 0,  maxDex: 0 },
  { id: 'chainmail',   name: 'Chain Mail',      type: 'heavy',  ac: 16, strReq: 13, maxDex: 0 },
  { id: 'splint',      name: 'Splint',          type: 'heavy',  ac: 17, strReq: 15, maxDex: 0 },
  { id: 'plate',       name: 'Plate',           type: 'heavy',  ac: 18, strReq: 15, maxDex: 0 },
];

// Backward-compat alias
export const ARMOR_PRESETS = DND_ARMOR_PRESETS;

export const TYPE_LABEL = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };

export function calcArmorAC(armor, desMod) {
  if (!armor) return 10 + desMod;
  switch (armor.type) {
    case 'light':  return armor.ac + desMod;
    case 'medium': return armor.ac + Math.min(desMod, armor.maxDex ?? 2);
    case 'heavy':  return armor.ac;
    default:       return armor.ac;
  }
}
