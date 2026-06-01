// SRD 5.2.1 (CC BY 4.0) — Wizards of the Coast LLC — https://www.dndbeyond.com/srd
// Background mechanical data — translatable strings in backgrounds.i18n.{lang}.json
// SRD 5.2.1 p.83: exactly 4 backgrounds (Acolyte, Criminal, Sage, Soldier)

export const SRD_BACKGROUNDS = [
  { id: 'acolyte',  srd: true, abilityScores: ['INT', 'WIS', 'CHA'], skills: ['insight', 'religion'] },
  { id: 'criminal', srd: true, abilityScores: ['DEX', 'CON', 'INT'], skills: ['sleight-of-hand', 'stealth'] },
  { id: 'sage',     srd: true, abilityScores: ['CON', 'INT', 'WIS'], skills: ['arcana', 'history'] },
  { id: 'soldier',  srd: true, abilityScores: ['STR', 'DEX', 'CON'], skills: ['athletics', 'intimidation'] },
];
