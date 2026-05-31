// D&D 5e SRD 5.2 class data (CC BY 4.0 — Wizards of the Coast)

import { SKILLS } from '../dnd5e';

const ALL_SKILLS = SKILLS.map(s => s.name);

export const SRD_CLASSES = [
  {
    name: 'Barbaro',
    hitDie: 'd12',
    spellcasting: null,
    saveProficiencies: ['FOR', 'COS'],
    skillCount: 2,
    skillOptions: ['Addestrare animali', 'Atletica', 'Intimidire', 'Natura', 'Percezione', 'Sopravvivenza'],
  },
  {
    name: 'Bardo',
    hitDie: 'd8',
    spellcasting: 'CAR',
    saveProficiencies: ['DES', 'CAR'],
    skillCount: 3,
    skillOptions: ALL_SKILLS,
  },
  {
    name: 'Chierico',
    hitDie: 'd8',
    spellcasting: 'SAG',
    saveProficiencies: ['SAG', 'CAR'],
    skillCount: 2,
    skillOptions: ['Storia', 'Indagare', 'Medicina', 'Persuasione', 'Religione'],
  },
  {
    name: 'Druido',
    hitDie: 'd8',
    spellcasting: 'SAG',
    saveProficiencies: ['INT', 'SAG'],
    skillCount: 2,
    skillOptions: ['Arcano', 'Addestrare animali', 'Indagare', 'Medicina', 'Natura', 'Percezione', 'Religione', 'Sopravvivenza'],
  },
  {
    name: 'Guerriero',
    hitDie: 'd10',
    spellcasting: null,
    saveProficiencies: ['FOR', 'COS'],
    skillCount: 2,
    skillOptions: ['Acrobazia', 'Addestrare animali', 'Atletica', 'Storia', 'Indagare', 'Intimidire', 'Percezione', 'Sopravvivenza'],
  },
  {
    name: 'Ladro',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['DES', 'INT'],
    skillCount: 4,
    skillOptions: ['Acrobazia', 'Atletica', 'Inganno', 'Indagare', 'Intimidire', 'Percezione', 'Persuasione', 'Furtività', 'Prestidigitazione'],
  },
  {
    name: 'Mago',
    hitDie: 'd6',
    spellcasting: 'INT',
    saveProficiencies: ['INT', 'SAG'],
    skillCount: 2,
    skillOptions: ['Arcano', 'Storia', 'Indagare', 'Medicina', 'Religione'],
  },
  {
    name: 'Monaco',
    hitDie: 'd8',
    spellcasting: null,
    saveProficiencies: ['FOR', 'DES'],
    skillCount: 2,
    skillOptions: ['Acrobazia', 'Atletica', 'Storia', 'Indagare', 'Religione', 'Furtività'],
  },
  {
    name: 'Paladino',
    hitDie: 'd10',
    spellcasting: 'CAR',
    saveProficiencies: ['SAG', 'CAR'],
    skillCount: 2,
    skillOptions: ['Atletica', 'Indagare', 'Intimidire', 'Medicina', 'Persuasione', 'Religione'],
  },
  {
    name: 'Ranger',
    hitDie: 'd10',
    spellcasting: 'SAG',
    saveProficiencies: ['FOR', 'DES'],
    skillCount: 3,
    skillOptions: ['Addestrare animali', 'Atletica', 'Indagare', 'Natura', 'Percezione', 'Furtività', 'Sopravvivenza'],
  },
  {
    name: 'Stregone',
    hitDie: 'd6',
    spellcasting: 'CAR',
    saveProficiencies: ['COS', 'CAR'],
    skillCount: 2,
    skillOptions: ['Arcano', 'Inganno', 'Indagare', 'Intimidire', 'Natura', 'Persuasione', 'Religione'],
  },
  {
    name: 'Warlock',
    hitDie: 'd8',
    spellcasting: 'CAR',
    saveProficiencies: ['SAG', 'CAR'],
    skillCount: 2,
    skillOptions: ['Arcano', 'Inganno', 'Storia', 'Indagare', 'Intimidire', 'Natura', 'Religione'],
  },
];

export const SRD_CLASS_NAMES = SRD_CLASSES.map(c => c.name);
export const CLASS_SAVE_PROFS = Object.fromEntries(SRD_CLASSES.map(c => [c.name, c.saveProficiencies]));
export const CLASS_SKILL_COUNT = Object.fromEntries(SRD_CLASSES.map(c => [c.name, c.skillCount]));
export const CLASS_SKILL_OPTIONS = Object.fromEntries(SRD_CLASSES.map(c => [c.name, c.skillOptions]));
