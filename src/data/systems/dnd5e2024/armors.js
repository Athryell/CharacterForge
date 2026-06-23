// CharacterForge — D&D 5e SRD 5.2.1 Armor (CC BY 4.0 — Wizards of the Coast)

export const DND_ARMOR_PRESETS = [
  // Light armor — no STR req, full DEX bonus
  { id: 'padded',      name: 'Padded',          type: 'light',  ac: 11, strReq: 0,  maxDex: null, weightKg:  4 },
  { id: 'leather',     name: 'Leather',         type: 'light',  ac: 11, strReq: 0,  maxDex: null, weightKg:  5 },
  { id: 'studded',     name: 'Studded Leather', type: 'light',  ac: 12, strReq: 0,  maxDex: null, weightKg:  6.5 },
  // Medium armor — DEX capped at +2
  { id: 'hide',        name: 'Hide',            type: 'medium', ac: 12, strReq: 0,  maxDex: 2,    weightKg:  6 },
  { id: 'chainshirt',  name: 'Chain Shirt',     type: 'medium', ac: 13, strReq: 0,  maxDex: 2,    weightKg: 10 },
  { id: 'scale',       name: 'Scale Mail',      type: 'medium', ac: 14, strReq: 0,  maxDex: 2,    weightKg: 22.5 },
  { id: 'breastplate', name: 'Breastplate',     type: 'medium', ac: 14, strReq: 0,  maxDex: 2,    weightKg: 10 },
  { id: 'halfplate',   name: 'Half Plate',      type: 'medium', ac: 15, strReq: 0,  maxDex: 2,    weightKg: 20 },
  // Heavy armor — no DEX bonus; some require STR
  { id: 'ring',        name: 'Ring Mail',       type: 'heavy',  ac: 14, strReq: 0,  maxDex: 0,    weightKg: 20 },
  { id: 'chainmail',   name: 'Chain Mail',      type: 'heavy',  ac: 16, strReq: 13, maxDex: 0,    weightKg: 27.5 },
  { id: 'splint',      name: 'Splint',          type: 'heavy',  ac: 17, strReq: 15, maxDex: 0,    weightKg: 30 },
  { id: 'plate',       name: 'Plate',           type: 'heavy',  ac: 18, strReq: 15, maxDex: 0,    weightKg: 32.5 },
];


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
