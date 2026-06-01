// CharacterForge — IT→EN schema migration (v1→v2)
// Runs once on character load to upgrade keys to English base language.

export const IT_TO_EN_ABILITY = {
  FOR: 'STR', DES: 'DEX', COS: 'CON', SAG: 'WIS', CAR: 'CHA', INT: 'INT',
};

export const IT_TO_EN_STAT = {
  CA: 'AC', INI: 'INIT', VEL: 'SPD', HP: 'HP',
  FOR: 'STR', DES: 'DEX', COS: 'CON', SAG: 'WIS', CAR: 'CHA', INT: 'INT',
  'TS-FOR': 'TS-STR', 'TS-DES': 'TS-DEX', 'TS-COS': 'TS-CON',
  'TS-INT': 'TS-INT', 'TS-SAG': 'TS-WIS', 'TS-CAR': 'TS-CHA',
};

export const IT_TO_EN_CLASS = {
  'Barbaro': 'Barbarian', 'Bardo': 'Bard', 'Chierico': 'Cleric',
  'Druido': 'Druid', 'Guerriero': 'Fighter', 'Ladro': 'Rogue',
  'Mago': 'Wizard', 'Monaco': 'Monk', 'Paladino': 'Paladin',
  'Ranger': 'Ranger', 'Stregone': 'Sorcerer', 'Warlock': 'Warlock',
};

export const IT_TO_EN_SKILL = {
  'Acrobazia': 'acrobatics', 'Addestrare animali': 'animal-handling',
  'Arcano': 'arcana', 'Atletica': 'athletics', 'Furtività': 'stealth',
  'Inganno': 'deception', 'Intuizione': 'insight', 'Indagare': 'investigation',
  'Intimidire': 'intimidation', 'Intrattenere': 'performance',
  'Medicina': 'medicine', 'Natura': 'nature', 'Percezione': 'perception',
  'Persuasione': 'persuasion', 'Prestidigitazione': 'sleight-of-hand',
  'Religione': 'religion', 'Sopravvivenza': 'survival', 'Storia': 'history',
};

export const IT_TO_EN_SPECIES = {
  // SRD split species
  'Umano': 'human', 'Elfo (Alto)': 'high-elf', 'Elfo (Silvano)': 'wood-elf',
  'Nano (Collina)': 'hill-dwarf', 'Nano (Montagna)': 'mountain-dwarf',
  'Halfling (Pieditozzo)': 'lightfoot-halfling', 'Halfling (Selvatico)': 'stout-halfling',
  'Mezzelfo': 'half-elf', 'Tiefling': 'tiefling', 'Draconico': 'dragonborn',
  'Gnomo (Roccia)': 'rock-gnome', 'Gnomo (Foresta)': 'forest-gnome',
  "Mezz'orco": 'half-orc', 'Aasimar': 'aasimar',
  // PHB 2024 grouped (from CharacterCreator)
  'Elfo': 'elf', 'Nano': 'dwarf', 'Halfling': 'halfling', 'Gnomo': 'gnome',
  'Dragonide': 'dragonborn', 'Orco': 'orc', 'Goliath': 'goliath',
};

export const IT_TO_EN_BACKGROUND = {
  'Accolito': 'acolyte', 'Artigiano': 'artisan', 'Impostore': 'charlatan',
  'Criminale': 'criminal', 'Intrattenitore': 'entertainer', 'Contadino': 'farmer',
  'Guardia': 'guard', 'Guida': 'guide', 'Eremita': 'hermit',
  'Mercante': 'merchant', 'Nobile': 'noble', 'Saggio': 'sage',
  'Marinaio': 'sailor', 'Scrivano': 'scribe', 'Soldato': 'soldier',
  'Viandante': 'wayfarer',
};

export const IT_TO_EN_ALIGNMENT = {
  'Legale Buono': 'Lawful Good', 'Neutrale Buono': 'Neutral Good', 'Caotico Buono': 'Chaotic Good',
  'Legale Neutrale': 'Lawful Neutral', 'Vero Neutrale': 'True Neutral', 'Caotico Neutrale': 'Chaotic Neutral',
  'Legale Malvagio': 'Lawful Evil', 'Neutrale Malvagio': 'Neutral Evil', 'Caotico Malvagio': 'Chaotic Evil',
};

function migrateAbilities(abilities = {}) {
  const result = {};
  for (const [k, v] of Object.entries(abilities)) {
    result[IT_TO_EN_ABILITY[k] || k] = v;
  }
  return result;
}

function migrateItemDesc(desc = '') {
  return desc.replace(/@\[([A-Z-]+)\]/g, (_, stat) => `@[${IT_TO_EN_STAT[stat] || stat}]`);
}

function migrateWeapon(w) {
  return {
    ...w,
    abilityBonus: IT_TO_EN_ABILITY[w.abilityBonus] || w.abilityBonus,
    bonuses: (w.bonuses || []).map(b => ({ ...b, stat: IT_TO_EN_STAT[b.stat] || b.stat })),
    desc: migrateItemDesc(w.desc || ''),
  };
}

function migrateEquipment(e) {
  return {
    ...e,
    bonuses: (e.bonuses || []).map(b => ({ ...b, stat: IT_TO_EN_STAT[b.stat] || b.stat })),
    desc: migrateItemDesc(e.desc || ''),
  };
}

export function migrateCharState(state) {
  if (!state) return state;
  if (state._schema_v2) return state;

  // Already using EN ability keys — just stamp and return
  const abilities = state.abilities || {};
  if ('STR' in abilities || 'DEX' in abilities || Object.keys(abilities).length === 0) {
    return { ...state, _schema_v2: true };
  }

  return {
    ...state,
    abilities: migrateAbilities(abilities),
    saveProficiencies: (state.saveProficiencies || []).map(a => IT_TO_EN_ABILITY[a] || a),
    skillProficiencies: (state.skillProficiencies || []).map(s => IT_TO_EN_SKILL[s] || s),
    skillExpertise: (state.skillExpertise || []).map(s => IT_TO_EN_SKILL[s] || s),
    charClass: IT_TO_EN_CLASS[state.charClass] || state.charClass,
    charRace: IT_TO_EN_SPECIES[state.charRace] || state.charRace,
    charBackground: IT_TO_EN_BACKGROUND[state.charBackground] || state.charBackground,
    charAlignment: IT_TO_EN_ALIGNMENT[state.charAlignment] || state.charAlignment,
    weapons: (state.weapons || []).map(migrateWeapon),
    equipment: (state.equipment || []).map(migrateEquipment),
    _schema_v2: true,
  };
}
