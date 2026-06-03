// CharacterForge — D&D 5e SRD 5.2 Classes (CC BY 4.0 — Wizards of the Coast)
// Unified from data/srd/classes.js (mechanics) + data/features.js (class features)

import { SKILLS } from './mechanics';

const ALL_SKILLS = SKILLS.map(s => s.id);

// ── Class Features (from data/features.js) ───────────────────────────────────

const CLASS_FEATURES = {
  Barbarian: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Addestrare animali, Atletica, Intimidire, Natura, Percezione, Sopravvivenza.' },
    { name: 'Rabbia', desc: 'Come azione bonus entra in Rabbia (dura 1 min). In rabbia: vantaggio ai tiri FOR, resistenza ai danni fisici, +2 ai danni di mischia. Usi: 2 (ripristinati con riposo lungo).' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. COS.' },
  ],
  Bard: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, spade corte, balestre a mano, spade lunghe, stocchi. Tiri salvezza: Destrezza, Carisma. Strumenti: 3 strumenti musicali. Abilità (3): qualsiasi.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. 4 trucchetti, incantesimi conosciuti in base al livello.' },
    { name: 'Ispirazione bardica', desc: 'Azione bonus: concedi d6 ispirazione a una creatura entro 18 m. Può aggiungerlo a un tiro. Usi = mod. CAR (min. 1); recuperati con riposo lungo.' },
  ],
  Cleric: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Storia, Intuizione, Medicina, Persuasione, Religione.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello. Incantesimi del dominio sempre preparati.' },
    { name: 'Dominio divino', desc: 'Scegli un dominio (Vita, Luce, Natura, Tempesta, Malizia, Guerra…). Concede incantesimi di dominio e capacità extra.' },
    { name: 'Canalizza divinità (1/riposto breve)', desc: 'Usa il potere divino: Allontana non morti (ogni chierico) + opzione del dominio.' },
  ],
  Druid: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi (no metallo). Armi: Semplici (no metallo), scimitarre. Tiri salvezza: Intelligenza, Saggezza. Strumenti: Erboristeria. Abilità (2 tra): Arcano, Addestrare animali, Intuizione, Medicina, Natura, Percezione, Religione, Sopravvivenza.' },
    { name: 'Incantesimi (Saggezza)', desc: 'Incantatore a pieno livello con Saggezza. Preparati = mod. SAG + livello.' },
    { name: 'Forma selvatica (liv 2)', desc: 'Azione (o azione bonus al liv. 2): assumi forma di bestia (CR basato sul livello). Usi: 2 (ripristinati con riposo breve/lungo).' },
    { name: 'Cerchio druidico (liv 2)', desc: 'Scegli una specializzazione: Terra, Luna, ecc.' },
  ],
  Fighter: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Costituzione. Abilità (2 tra): Acrobazia, Addestrare animali, Atletica, Storia, Intuizione, Intimidire, Percezione, Sopravvivenza.' },
    { name: 'Stile di combattimento', desc: 'Scegli uno stile: Arciere (+2 attacchi a distanza), Difesa (+1 CA), Duellante (+2 danni con arma a una mano), Grande arma (riesamina 1-2 su danni), Protezione (reazione per svantaggio ad attacchi contro alleato), Due armi (aggiungi mod. a danni 2° attacco).' },
    { name: 'Riprendere fiato', desc: 'Azione bonus: recupera 1d10 + livello PF. Usi: 1 (ripristinati con riposo breve/lungo).' },
    { name: 'Impeto (liv 2)', desc: 'Azione bonus: compi una seconda azione. Usi: 1 (ripristinati con riposo breve/lungo).' },
  ],
  Rogue: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici, balestre a mano, spade corte, spade lunghe, stocchi. Strumenti: Attrezzi da ladro. Tiri salvezza: Destrezza, Intelligenza. Abilità (4): qualsiasi.' },
    { name: 'Perizia', desc: 'Raddoppia il bonus di competenza per 2 abilità o strumenti a scelta (altre 2 al liv. 6).' },
    { name: 'Attacco furtivo', desc: 'Una volta per turno, danni extra 1d6 quando hai vantaggio o un alleato è adiacente al bersaglio. Scala con il livello.' },
    { name: 'Gergo ladro', desc: 'Linguaggio segreto comprensibile solo ad altri ladri.' },
    { name: 'Azione scaltra', desc: 'Azione bonus: Scatto, Disimpegno o Nascondersi.' },
  ],
  Wizard: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Intelligenza, Saggezza. Abilità (2 tra): Arcano, Storia, Indagare, Intuizione, Medicina, Religione.' },
    { name: 'Incantesimi (Intelligenza)', desc: 'Incantatore a pieno livello con Intelligenza. Libro degli incantesimi (6 incantesimi al livello 1). Preparati = mod. INT + livello.' },
    { name: 'Recupero arcano', desc: 'Una volta al giorno (riposo breve): recupera slot di livello ≤ metà del livello mago (arrotondato su). Slot max 5°.' },
    { name: 'Tradizione arcana (liv 2)', desc: 'Scegli la scuola di magia o tradizione: Evocazione, Divinazione, Illusione, ecc.' },
  ],
  Monk: [
    { name: 'Competenze', desc: 'Armature: Nessuna. Armi: Semplici, spade corte. Tiri salvezza: Forza, Destrezza. Abilità (2 tra): Acrobazia, Atletica, Storia, Furtività, Intuizione, Religione.' },
    { name: 'Difesa senza armatura', desc: 'Senza armatura: CA = 10 + mod. DES + mod. SAG.' },
    { name: 'Arti marziali', desc: 'Usa DES invece di FOR per attacchi con armi da monaco. Attacchi disarmati: d4. Dopo attacco arma/disarmato come azione, puoi fare un attacco disarmato come azione bonus.' },
    { name: 'Ki (liv 2)', desc: 'Punti ki = livello (recuperati con riposo breve/lungo). Azioni ki: Attacco fulmineo, Passo del vento, Pazienza del difensore.' },
  ],
  Paladin: [
    { name: 'Competenze', desc: 'Armature: Tutte, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Atletica, Intuizione, Intimidire, Medicina, Persuasione, Religione.' },
    { name: 'Senso divino', desc: 'Azione: percepisce celesti/infernali/non morti entro 18 m. Usi = 1 + mod. CAR (riposi lunghi).' },
    { name: 'Imposizione delle mani', desc: 'Riserva = livello × 5 PF. Azione: cura o neutralizza malattia/veleno (5 punti). Ripristinata con riposo lungo.' },
    { name: 'Stile di combattimento e Incantesimi (liv 2)', desc: 'Come Guerriero per lo stile. Incantesimi con Carisma (mezzo livello), preparati = mod. CAR + metà livello.' },
    { name: 'Sacro giuramento (liv 3)', desc: 'Scegli il giuramento: Devozione, Antichi, Vendetta… che definisce il tuo credo e poteri.' },
  ],
  Ranger: [
    { name: 'Competenze', desc: 'Armature: Leggere, Medie, Scudi. Armi: Semplici, da Guerra. Tiri salvezza: Forza, Destrezza. Abilità (3 tra): Addestrare animali, Atletica, Intuizione, Indagare, Natura, Percezione, Furtività, Sopravvivenza.' },
    { name: 'Nemico prescelto', desc: 'Scegli tipo di nemico (aberrazioni, bestie, non morti…). Vantaggio a prove di conoscenza/tracciamento; impari un linguaggio associato.' },
    { name: 'Esploratore naturale', desc: 'Scegli un terreno preferito (foresta, pianura…). Vantaggi durante l\'esplorazione in quel tipo di terreno.' },
    { name: 'Incantesimi (Saggezza, liv 2)', desc: 'Incantatore a mezzo livello con Saggezza. Preparati = mod. SAG + metà livello.' },
  ],
  Sorcerer: [
    { name: 'Competenze', desc: 'Armi: Balestre a mano, dardi, fionde, bastoni, spade corte. Tiri salvezza: Costituzione, Carisma. Abilità (2 tra): Arcano, Inganno, Intuizione, Intimidire, Persuasione, Religione.' },
    { name: 'Incantesimi (Carisma)', desc: 'Incantatore a pieno livello con Carisma. Conosci incantesimi fissi (2 al liv. 1). 4 slot al liv. 1.' },
    { name: 'Origine stregonesca', desc: 'Scegli la fonte della tua magia: Draconica (CA 13+DES senza armatura, +1 PF/livello), Caos selvatico, Linea divina, ecc.' },
    { name: 'Punti stregoneria (liv 2)', desc: 'Converti slot in punti e viceversa. Usati per metamagia.' },
  ],
  Warlock: [
    { name: 'Competenze', desc: 'Armature: Leggere. Armi: Semplici. Tiri salvezza: Saggezza, Carisma. Abilità (2 tra): Arcano, Inganno, Storia, Intimidire, Indagare, Natura, Religione.' },
    { name: 'Patrono ultraterreno', desc: 'Scegli il patrono: Arcidemonio, Antico, Celestiale, Genio… Concede incantesimi di patrono e capacità extra.' },
    { name: 'Incantesimi del patto (Carisma)', desc: 'Pochi slot (1 al liv. 1), ma recuperati con riposo breve/lungo. Tutti i slot al livello massimo disponibile. Conosci incantesimi fissi.' },
    { name: 'Invocazioni occulte (liv 2)', desc: 'Impari 2 invocazioni che potenziano le tue capacità arcane.' },
  ],
};

// ── SRD Class Mechanical Data ────────────────────────────────────────────────

const SRD_CLASSES_DATA = [
  {
    name: 'Barbarian',
    hitDie: 'd12',
    spellcasting: null,
    saveProficiencies: ['STR', 'CON'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Bard',
    hitDie: 'd8',
    spellcasting: 'CHA',
    saveProficiencies: ['DEX', 'CHA'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 3,
    skillOptions: ALL_SKILLS,
    subclassLevel: 3,
  },
  {
    name: 'Cleric',
    hitDie: 'd8',
    spellcasting: 'WIS',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Druid',
    hitDie: 'd8',
    spellcasting: 'WIS',
    saveProficiencies: ['INT', 'WIS'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    subclassLevel: 2,
  },
  {
    name: 'Fighter',
    hitDie: 'd10',
    spellcasting: null,
    saveProficiencies: ['STR', 'CON'],
    armorTraining: ['light', 'medium', 'heavy', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Monk',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['STR', 'DEX'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    subclassLevel: 3,
  },
  {
    name: 'Paladin',
    hitDie: 'd10',
    spellcasting: 'CHA',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light', 'medium', 'heavy', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 2,
    skillOptions: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    subclassLevel: 3,
  },
  {
    name: 'Ranger',
    hitDie: 'd10',
    spellcasting: 'WIS',
    saveProficiencies: ['STR', 'DEX'],
    armorTraining: ['light', 'medium', 'shields'],
    weaponTraining: ['simple', 'martial'],
    skillCount: 3,
    skillOptions: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    subclassLevel: 3,
  },
  {
    name: 'Rogue',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['DEX', 'INT'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 4,
    skillOptions: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleight-of-hand', 'stealth'],
    subclassLevel: 3,
  },
  {
    name: 'Sorcerer',
    hitDie: 'd6',
    spellcasting: 'CHA',
    saveProficiencies: ['CON', 'CHA'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'deception', 'insight', 'intimidation', 'nature', 'persuasion', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Warlock',
    hitDie: 'd8',
    spellcasting: 'CHA',
    saveProficiencies: ['WIS', 'CHA'],
    armorTraining: ['light'],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    subclassLevel: 1,
  },
  {
    name: 'Wizard',
    hitDie: 'd6',
    spellcasting: 'INT',
    saveProficiencies: ['INT', 'WIS'],
    armorTraining: [],
    weaponTraining: ['simple'],
    skillCount: 2,
    skillOptions: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    subclassLevel: 3,
  },
];

// ── Unified export: SRD mechanics + features ────────────────────────────────

export const DND_CLASSES = SRD_CLASSES_DATA.map(cls => ({
  ...cls,
  features: CLASS_FEATURES[cls.name] || [],
}));

export const DND_CLASS_NAMES    = DND_CLASSES.map(c => c.name);
export const CLASS_SAVE_PROFS   = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.saveProficiencies]));
export const CLASS_SKILL_COUNT  = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.skillCount]));
export const CLASS_SKILL_OPTIONS = Object.fromEntries(DND_CLASSES.map(c => [c.name, c.skillOptions]));

// Re-export class features for external use
export { CLASS_FEATURES };

// Backward-compat aliases
export const SRD_CLASSES     = DND_CLASSES;
export const SRD_CLASS_NAMES = DND_CLASS_NAMES;
