const fs = require('fs');
let content = fs.readFileSync('src/components/CharacterCreator.jsx', 'utf8');

// 1. Fix import — remove ABILITY_NAMES
content = content.replace(
  "import { ALIGNMENTS, ABILITIES, ABILITY_NAMES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';",
  "import { ALIGNMENTS, ABILITIES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';"
);

// 2. Replace initial abilities (IT keys -> EN keys)
content = content.replace(
  "abilities: { FOR:8, DES:8, COS:8, INT:8, SAG:8, CAR:8 },",
  "abilities: { STR:8, DEX:8, CON:8, INT:8, WIS:8, CHA:8 },"
);
content = content.replace(
  "bgAsi: { FOR:0, DES:0, COS:0, INT:0, SAG:0, CAR:0 },",
  "bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 },"
);

// 3. Replace charAlignment initial value
content = content.replace("charAlignment: 'Legale Buono',", "charAlignment: 'Lawful Good',");

// 4. Fix calcHP
content = content.replace('Math.floor((abs.COS - 10) / 2)', 'Math.floor((abs.CON - 10) / 2)');

// 5. Fix buildFinalState
content = content.replace("ac: 10 + Math.floor((finalAbs.DES - 10) / 2),", "ac: 10 + Math.floor((finalAbs.DEX - 10) / 2),");
content = content.replace("speed: '9m',", "speed: '30ft',");

// 6. selectedBg lookup — use id
content = content.replace(
  "const selectedBg  = data.charBackground === CUSTOM_SENTINEL ? null : allBackgrounds.find(b => b.name === data.charBackground);",
  "const selectedBg  = data.charBackground === CUSTOM_SENTINEL ? null : allBackgrounds.find(b => (b.id || b.name) === data.charBackground);"
);

// 7. bgAsi reset in background click
content = content.replace(
  "onClick={() => patch({ charBackground: b.name, bgAsi: { FOR:0, DES:0, COS:0, INT:0, SAG:0, CAR:0 } })}",
  "onClick={() => patch({ charBackground: b.id || b.name, bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 } })}"
);

// 8. point buy reset
content = content.replace(
  "if (v === 'pointbuy') patch({ abilities: { FOR:8,DES:8,COS:8,INT:8,SAG:8,CAR:8 } });",
  "if (v === 'pointbuy') patch({ abilities: { STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8 } });"
);

// 9. conMod in summary
content = content.replace('(final.COS - 10) / 2)', '(final.CON - 10) / 2)');
content = content.replace('conMod} COS)', 'conMod} CON)');

// 10. CLASS_STANDARD_ARRAYS
const classStdOld = "  const CLASS_STANDARD_ARRAYS = {\n    'Barbaro':   { FOR:15, DES:14, COS:13, INT:12, SAG:10, CAR:8  },\n    'Guerriero': { FOR:15, DES:14, COS:13, INT:12, SAG:10, CAR:8  },\n    'Monaco':    { FOR:12, DES:15, COS:13, INT:8,  SAG:14, CAR:10 },\n    'Paladino':  { FOR:15, DES:8,  COS:14, INT:10, SAG:12, CAR:14 },\n    'Ranger':    { FOR:12, DES:15, COS:14, INT:8,  SAG:13, CAR:10 },\n    'Ladro':     { FOR:8,  DES:15, COS:14, INT:10, SAG:13, CAR:12 },\n    'Bardo':     { FOR:8,  DES:14, COS:13, INT:10, SAG:12, CAR:15 },\n    'Chierico':  { FOR:10, DES:14, COS:13, INT:8,  SAG:15, CAR:12 },\n    'Druido':    { FOR:8,  DES:14, COS:13, INT:10, SAG:15, CAR:12 },\n    'Stregone':  { FOR:8,  DES:13, COS:14, INT:10, SAG:12, CAR:15 },\n    'Warlock':   { FOR:8,  DES:14, COS:13, INT:10, SAG:12, CAR:15 },\n    'Mago':      { FOR:8,  DES:13, COS:14, INT:15, SAG:12, CAR:10 },\n  };\n  function setStandard() {\n    const arr = CLASS_STANDARD_ARRAYS[data.charClass] || { FOR:15, DES:14, COS:13, INT:12, SAG:10, CAR:8 };";
const classStdNew = "  const CLASS_STANDARD_ARRAYS = {\n    'Barbarian': { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8  },\n    'Fighter':   { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8  },\n    'Monk':      { STR:12, DEX:15, CON:13, INT:8,  WIS:14, CHA:10 },\n    'Paladin':   { STR:15, DEX:8,  CON:14, INT:10, WIS:12, CHA:14 },\n    'Ranger':    { STR:12, DEX:15, CON:14, INT:8,  WIS:13, CHA:10 },\n    'Rogue':     { STR:8,  DEX:15, CON:14, INT:10, WIS:13, CHA:12 },\n    'Bard':      { STR:8,  DEX:14, CON:13, INT:10, WIS:12, CHA:15 },\n    'Cleric':    { STR:10, DEX:14, CON:13, INT:8,  WIS:15, CHA:12 },\n    'Druid':     { STR:8,  DEX:14, CON:13, INT:10, WIS:15, CHA:12 },\n    'Sorcerer':  { STR:8,  DEX:13, CON:14, INT:10, WIS:12, CHA:15 },\n    'Warlock':   { STR:8,  DEX:14, CON:13, INT:10, WIS:12, CHA:15 },\n    'Wizard':    { STR:8,  DEX:13, CON:14, INT:15, WIS:12, CHA:10 },\n  };\n  function setStandard() {\n    const arr = CLASS_STANDARD_ARRAYS[data.charClass] || { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8 };";
content = content.split(classStdOld).join(classStdNew);

// 11. ABILITY_NAMES -> t()
content = content.split("ABILITY_NAMES[a]").join("t(`data.abilities.${a}`)");
content = content.split("ABILITY_NAMES[attr]").join("t(`data.abilities.${attr}`)");

// 12. Background card name display
content = content.replace(
  '<div className="creator-card-name">{isCustom ? b.label : b.name}</div>',
  '<div className="creator-card-name">{isCustom ? b.label : t(`data.backgrounds.${b.id || b.name}`, b.name)}</div>'
);

// 13. Species card value — store r.id if present
content = content.replace(
  "onClick={() => patch({ charRace: r.name })}",
  "onClick={() => patch({ charRace: r.id || r.name })}"
);
content = content.replace(
  "const selected = data.charRace === r.name;",
  "const selected = data.charRace === (r.id || r.name);"
);
content = content.replace(
  '<div className="creator-card-name">{isCustom ? r.label : r.name}</div>',
  '<div className="creator-card-name">{isCustom ? r.label : t(`data.species.${r.id || r.name}`, r.name)}</div>'
);
content = content.replace(
  "const isCustom = r.name === CUSTOM_SENTINEL;",
  "const isCustom = (r.id || r.name) === CUSTOM_SENTINEL;"
);

// 14. Class card display
content = content.replace(
  '<div className="creator-card-name">{isCustom ? \'Personalizzata...\' : cls}</div>',
  '<div className="creator-card-name">{isCustom ? t(\'creator.customClassLabel\', \'Custom...\') : t(`data.classes.${cls}`, cls)}</div>'
);

// 15. Class card save profs
content = content.replace(
  "TS: {(CLASS_SAVE_PROFS[cls] || []).join(', ')}</div>",
  "{t('creator.summarySavingThrows')}: {(CLASS_SAVE_PROFS[cls] || []).map(a => t(`data.abilityAbbr.${a}`, a)).join(', ')}</div>"
);

// 16. Skills in step 3 — use IDs
content = content.replace(
  "(CLASS_SKILL_OPTIONS[selectedCls] || SKILLS.map(s => s.name)).map(sk => {",
  "(CLASS_SKILL_OPTIONS[selectedCls] || SKILLS.map(s => s.id)).map(sk => {"
);
content = content.replace(
  "const fromBg = selectedBg?.skills.includes(sk);",
  "const fromBg = selectedBg?.skills?.includes(sk);"
);
content = content.replace(
  '<span className="check-name">{sk}</span>',
  '<span className="check-name">{t(`data.skills.${sk}`, sk)}</span>'
);

// 17. Step 3 header bg skill display
content = content.replace(
  "comp. automatiche in {selectedBg.skills.join(' e ')}.",
  "comp. automatiche in {selectedBg.skills.map(s => t(`data.skills.${s}`, s)).join(' e ')}."
);

// 18. Summary proficiencies display
content = content.replace(
  "<strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].join(', ') || '—'}</strong>",
  "<strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].map(s => t(`data.skills.${s}`, s)).join(', ') || '—'}</strong>"
);

// 19. Summary save throws display
content = content.replace(
  "<strong>{(CLASS_SAVE_PROFS[selectedCls] || []).join(', ') || '—'}</strong>",
  "<strong>{(CLASS_SAVE_PROFS[selectedCls] || []).map(a => t(`data.abilityAbbr.${a}`, a)).join(', ') || '—'}</strong>"
);

// 20. Summary alignment display
content = content.replace(
  "<div className=\"creator-summary-sub\" style={{ marginTop:2 }}>{data.charAlignment}</div>",
  "<div className=\"creator-summary-sub\" style={{ marginTop:2 }}>{data.charAlignment ? t(`data.alignments.${data.charAlignment}`, data.charAlignment) : ''}</div>"
);

// 21. bgAsi info box background skill preview
content = content.replace(
  `Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => \`+\${v} \${t(\`data.abilities.\${a}\`)}\`).join(', ')} (applicati nel riepilogo)`,
  `Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => \`+\${v} \${t(\`data.abilityAbbr.\${a}\`, a)}\`).join(', ')} (applicati nel riepilogo)`
);
// Also fix the version that uses ABILITY_NAMES that was already transformed
content = content.replace(
  'Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${t(`data.abilities.${a}`)}`).join(\', \')} (applicati nel riepilogo)',
  'Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${t(`data.abilityAbbr.${a}`, a)}`).join(\', \')} (applicati nel riepilogo)'
);

// 22. Alignment select
content = content.replace(
  "{ALIGNMENTS.map(a => <option key={a}>{a}</option>)}",
  "{ALIGNMENTS.map(a => <option key={a} value={a}>{t(`data.alignments.${a}`, a)}</option>)}"
);

// 23. charRaceDisplay etc.
content = content.replace(
  "const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || 'Personalizzata') : data.charRace;",
  "const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || '') : (data.charRace ? t(`data.species.${data.charRace}`, data.charRace) : '');"
);
content = content.replace(
  "const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || 'Personalizzato') : data.charBackground;",
  "const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || '') : (data.charBackground ? t(`data.backgrounds.${data.charBackground}`, data.charBackground) : '');"
);
content = content.replace(
  "const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || 'Personalizzata') : data.charClass;",
  "const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || '') : (data.charClass ? t(`data.classes.${data.charClass}`, data.charClass) : '');"
);

// 24. bgList / speciesList custom sentinel
content = content.replace(
  "const bgList      = [...allBackgrounds, { name: CUSTOM_SENTINEL, label: 'Personalizzato...' }];",
  "const bgList      = [...allBackgrounds, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.backgroundCustom', 'Custom...') }];"
);
content = content.replace(
  "const speciesList = [...SPECIES_SRD, { name: CUSTOM_SENTINEL, label: 'Personalizzata...' }];",
  "const speciesList = [...SPECIES_SRD, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.speciesCustom', 'Custom...') }];"
);

// 25. Background name in step 3 info box
content = content.replace(
  "<strong>{data.charBackground}:</strong>",
  "<strong>{selectedBg ? t(`data.backgrounds.${data.charBackground}`, data.charBackground) : data.charBackground}:</strong>"
);

// 26. Spellcasting display in summary
content = content.replace(
  "Sì ({SPELLCASTING_CLASS[selectedCls]})",
  "Yes ({t(`data.abilityAbbr.${SPELLCASTING_CLASS[selectedCls]}`, SPELLCASTING_CLASS[selectedCls])})"
);

fs.writeFileSync('src/components/CharacterCreator.jsx', content, 'utf8');
console.log('Done');
