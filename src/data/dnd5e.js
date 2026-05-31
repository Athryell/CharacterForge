// CharacterForge — D&D 5e SRD 5.2 Data (CC BY 4.0 — Wizards of the Coast)
// https://dnd.wizards.com/resources/systems-reference-document

export const ABILITIES = ['FOR', 'DES', 'COS', 'INT', 'SAG', 'CAR'];
export const ABILITY_NAMES = {
  FOR: 'Forza', DES: 'Destrezza', COS: 'Costituzione',
  INT: 'Intelligenza', SAG: 'Saggezza', CAR: 'Carisma'
};

export const SKILLS = [
  { name: 'Acrobazia', attr: 'DES' },
  { name: 'Addestrare animali', attr: 'SAG' },
  { name: 'Arcano', attr: 'INT' },
  { name: 'Atletica', attr: 'FOR' },
  { name: 'Furtività', attr: 'DES' },
  { name: 'Inganno', attr: 'CAR' },
  { name: 'Indagare', attr: 'INT' },
  { name: 'Intimidire', attr: 'CAR' },
  { name: 'Intrattenere', attr: 'CAR' },
  { name: 'Medicina', attr: 'SAG' },
  { name: 'Natura', attr: 'INT' },
  { name: 'Percezione', attr: 'SAG' },
  { name: 'Persuasione', attr: 'CAR' },
  { name: 'Prestidigitazione', attr: 'DES' },
  { name: 'Religione', attr: 'INT' },
  { name: 'Sopravvivenza', attr: 'SAG' },
  { name: 'Storia', attr: 'INT' },
];

export const SPELLCASTING_CLASS = {
  Mago: 'INT', Chierico: 'SAG', Druido: 'SAG',
  Bardo: 'CAR', Stregone: 'CAR', Warlock: 'CAR',
  Paladino: 'CAR', Ranger: 'SAG',
};

export const HIT_DICE = {
  Barbaro: 'd12', Guerriero: 'd10', Paladino: 'd10', Ranger: 'd10',
  Bardo: 'd8', Chierico: 'd8', Druido: 'd8', Monaco: 'd8', Ladro: 'd8', Warlock: 'd8',
  Stregone: 'd6', Mago: 'd6',
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

export const DEFAULT_ACTIONS = [
  {
    id: 'azione_base',
    name: 'Azione',
    type: 'action',
    desc: "Con la tua azione puoi: **Attaccare** – un attacco in mischia o a distanza. **Scattare** – raddoppia la velocità. **Disimpegnarti** – ti sposti senza provocare attacchi d'opportunità. **Schivare** – svantaggio agli attacchi contro di te, vantaggio ai TS Destrezza. **Aiutare** – concede vantaggio a un alleato. **Nascondersi** – prova di Furtività (DES). **Prepararti** – prepara una reazione. **Usare un oggetto** – interagisci con un oggetto del tuo inventario.",
    dice: '',
  },
];

export const CLASSES = [
  'Barbaro', 'Bardo', 'Chierico', 'Druido', 'Guerriero',
  'Ladro', 'Mago', 'Monaco', 'Paladino', 'Ranger', 'Stregone', 'Warlock',
];

export const ALIGNMENTS = [
  'Legale Buono', 'Neutrale Buono', 'Caotico Buono',
  'Legale Neutrale', 'Vero Neutrale', 'Caotico Neutrale',
  'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio',
];

// JSON Import Schema — compatibile con Character Craft 5.5e (parziale)
// Le chiavi sono documentate per consentire import di file custom
export const JSON_SCHEMA_VERSION = '1.0.0';

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
    template: 'dnd5e',
    charName: '',
    charClass: '',
    charRace: '',
    charBackground: '',
    charLevel: 1,
    charXP: 0,
    charAlignment: 'Legale Buono',
    abilities: { FOR: 10, DES: 10, COS: 10, INT: 10, SAG: 10, CAR: 10 },
    saveProficiencies: [],
    skillProficiencies: [],
    skillExpertise: [],
    hpCurrent: 10,
    hpMax: 10,
    hpTemp: 0,
    ac: 10,
    speed: '9m',
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
  };
}
