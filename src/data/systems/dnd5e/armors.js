// CharacterForge — D&D 5e SRD 5.2 Armor (CC BY 4.0 — Wizards of the Coast)

export const DND_ARMOR_PRESETS = [
  // Light
  { id: 'padded',    name: 'Imbottita',        type: 'light',  ac: 11, strReq: 0  },
  { id: 'leather',   name: 'Cuoio',            type: 'light',  ac: 11, strReq: 0  },
  { id: 'studded',   name: 'Cuoio borchiato',  type: 'light',  ac: 12, strReq: 0  },
  // Medium
  { id: 'hide',      name: 'Pellicce',         type: 'medium', ac: 12, strReq: 0  },
  { id: 'chainshirt',name: 'Camicia di maglia',type: 'medium', ac: 13, strReq: 0  },
  { id: 'scale',     name: 'Scaglie',          type: 'medium', ac: 14, strReq: 0  },
  { id: 'breastplate',name: 'Corazza',         type: 'medium', ac: 14, strReq: 0  },
  { id: 'halfplate', name: 'Mezza piastra',    type: 'medium', ac: 15, strReq: 0  },
  // Heavy
  { id: 'ring',      name: 'Maglia ad anelli', type: 'heavy',  ac: 14, strReq: 0  },
  { id: 'chainmail', name: 'Cotta di maglia',  type: 'heavy',  ac: 16, strReq: 13 },
  { id: 'splint',    name: 'Lamelle',          type: 'heavy',  ac: 17, strReq: 15 },
  { id: 'plate',     name: 'Piastra',          type: 'heavy',  ac: 18, strReq: 15 },
];

// Backward-compat alias
export const ARMOR_PRESETS = DND_ARMOR_PRESETS;

export const TYPE_LABEL = { light: 'Leggera', medium: 'Media', heavy: 'Pesante' };

export function calcArmorAC(armor, desMod) {
  if (!armor) return 10 + desMod;
  switch (armor.type) {
    case 'light':  return armor.ac + desMod;
    case 'medium': return armor.ac + Math.min(desMod, 2);
    case 'heavy':  return armor.ac;
    default:       return armor.ac;
  }
}
