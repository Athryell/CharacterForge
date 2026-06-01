// SRD 5.2.1 (CC BY 4.0) — Wizards of the Coast LLC — https://www.dndbeyond.com/srd
// Background mechanical data — translatable strings in backgrounds.i18n.{lang}.json
// srd: true → officially in SRD 5.2.1 p.83 (Sage, Soldier)

export const SRD_BACKGROUNDS = [
  { id: 'acolyte',    abilityScores: ['INT', 'WIS', 'CHA'], skills: ['insight', 'religion'] },
  { id: 'artisan',    abilityScores: ['STR', 'DEX', 'INT'], skills: ['investigation', 'persuasion'] },
  { id: 'charlatan',  abilityScores: ['DEX', 'CON', 'CHA'], skills: ['deception', 'sleight-of-hand'] },
  { id: 'criminal',   abilityScores: ['DEX', 'CON', 'INT'], skills: ['sleight-of-hand', 'stealth'] },
  { id: 'entertainer',abilityScores: ['STR', 'DEX', 'CHA'], skills: ['acrobatics', 'performance'] },
  { id: 'farmer',     abilityScores: ['STR', 'CON', 'WIS'], skills: ['animal-handling', 'nature'] },
  { id: 'guard',      abilityScores: ['STR', 'INT', 'WIS'], skills: ['athletics', 'perception'] },
  { id: 'guide',      abilityScores: ['DEX', 'CON', 'WIS'], skills: ['stealth', 'survival'] },
  { id: 'hermit',     abilityScores: ['CON', 'INT', 'WIS'], skills: ['medicine', 'religion'] },
  { id: 'merchant',   abilityScores: ['CON', 'INT', 'WIS'], skills: ['animal-handling', 'persuasion'] },
  { id: 'noble',      abilityScores: ['STR', 'INT', 'CHA'], skills: ['history', 'persuasion'] },
  { id: 'sage',       abilityScores: ['CON', 'INT', 'WIS'], skills: ['arcana', 'history'],       srd: true },
  { id: 'sailor',     abilityScores: ['STR', 'DEX', 'WIS'], skills: ['athletics', 'perception'] },
  { id: 'scribe',     abilityScores: ['DEX', 'INT', 'WIS'], skills: ['investigation', 'persuasion'] },
  { id: 'soldier',    abilityScores: ['STR', 'DEX', 'CON'], skills: ['athletics', 'intimidation'],srd: true },
  { id: 'wayfarer',   abilityScores: ['DEX', 'WIS', 'CHA'], skills: ['insight', 'stealth'] },
];
