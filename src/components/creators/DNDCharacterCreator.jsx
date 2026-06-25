import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Icon } from '../../config/icons';
import { ABILITIES, SKILLS, HIT_DICE, SPELLCASTING_CLASS, SLOT_TABLE } from '../../data/systems/dnd5e2024/mechanics';
import AlignmentPicker from '../AlignmentPicker';
import { CLASS_FEATURES, CLASS_SAVE_PROFS, CLASS_SKILL_COUNT, CLASS_SKILL_OPTIONS } from '../../data/systems/dnd5e2024/classes';
import { DND_SPECIES, SPECIES_FEATURES, getAutoFeatures, getSpeciesData } from '../../data/systems/dnd5e2024/species';
import { BACKGROUND_FEATURES } from '../../data/systems/dnd5e2024/backgrounds';
import { ORIGIN_FEATS } from '../../data/systems/dnd5e2024/feats';
import dataManager from '../../data/dataManager';
import { syncCustomToDraft } from '../../utils/homebrewSync';


const POINT_BUY_COSTS = { 8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9 };
const POINT_BUY_TOTAL = 27;

const CUSTOM_SENTINEL = '__custom__';

export default function DNDCharacterCreator({ onComplete, onCancel }) {
  const { t } = useTranslation();
  const STEPS = [
    t('creator.steps.identity'),
    t('creator.steps.classAndBg', 'Class & BG'),
    t('creator.steps.stats'),
    t('creator.steps.proficiencies'),
    t('creator.steps.summary'),
  ];
  const [step, setStep] = useState(0);
  const [nextAttempted, setNextAttempted] = useState(false);
  const [data, setData] = useState({
    charName: '', charRace: '', charBackground: '', charAlignment: 'Lawful Good',
    charClass: '',
    abilities: { STR:8, DEX:8, CON:8, INT:8, WIS:8, CHA:8 },
    abilitiesMethod: 'pointbuy',
    saveProficiencies: [],
    skillProficiencies: [],
    charLevel: 1,
    bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 },
    bgEquipmentChoice: null,
    customSpecies: '',
    customSpeciesSpeed: 30,
    customSpeciesDarkvision: false,
    customSpeciesDarkvisionDist: '18 m',
    customSpeciesTraits: [],
    customBackground: '',
    customBgAsiOption: 'A',
    customBgAsiA2: '',
    customBgAsiA1: '',
    customBgAsiB: ['', '', ''],
    customBgSkills: [],
    customBgTool: '',
    customBgLanguage: '',
    customBgFeat: '',
    customBgFeatId: '',
    customBgEquipOption: 'gold',
    customBgEquipItems: '',
    speciesLegacy: null,
    speciesSpellStat: 'INT',
    customClass: '',
    customClassHitDie: 'd8',
    customClassSpellStat: '',
    customClassSaveProfs: [],
    customClassSkillCount: 2,
    customClassSkillOptions: [],
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const allBackgrounds = dataManager.getBackgrounds();
  const speciesList = [...DND_SPECIES, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.speciesCustom', 'Custom...') }];
  const bgList      = [...allBackgrounds, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.backgroundCustom', 'Custom...') }];
  const classList   = [...dataManager.getClasses(), CUSTOM_SENTINEL];

  const selectedBg  = data.charBackground === CUSTOM_SENTINEL ? null : allBackgrounds.find(b => (b.id || b.name) === data.charBackground);
  const selectedCls = data.charClass === CUSTOM_SENTINEL ? data.customClass : data.charClass;

  const selectedSpeciesData = (data.charRace && data.charRace !== CUSTOM_SENTINEL) ? getSpeciesData(data.charRace) : null;

  const isCustomCls    = data.charClass === CUSTOM_SENTINEL;
  const effectiveHitDie     = isCustomCls ? data.customClassHitDie : (HIT_DICE[selectedCls] || 'd8');
  const effectiveSaveProfs  = isCustomCls ? data.customClassSaveProfs : (CLASS_SAVE_PROFS[selectedCls] || []);
  const effectiveSkillCount = isCustomCls ? data.customClassSkillCount : (CLASS_SKILL_COUNT[selectedCls] || 2);
  const effectiveSkillOptions = isCustomCls
    ? (data.customClassSkillOptions.length > 0 ? data.customClassSkillOptions : SKILLS.map(s => s.id))
    : (CLASS_SKILL_OPTIONS[selectedCls] || SKILLS.map(s => s.id));
  const effectiveSpellStat = isCustomCls ? (data.customClassSpellStat || null) : (SPELLCASTING_CLASS[selectedCls] || null);

  const pointsSpent = Object.values(data.abilities).reduce((sum, v) => sum + (POINT_BUY_COSTS[v] ?? 0), 0);
  const pointsLeft  = POINT_BUY_TOTAL - pointsSpent;

  function adjPointBuy(attr, delta) {
    const cur = data.abilities[attr];
    const next = cur + delta;
    if (next < 8 || next > 15) return;
    const cost = (POINT_BUY_COSTS[next] ?? 99) - (POINT_BUY_COSTS[cur] ?? 0);
    if (cost > pointsLeft) return;
    patch({ abilities: { ...data.abilities, [attr]: next } });
  }

  function rollStats() {
    const rolled = {};
    ABILITIES.forEach(attr => {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => a - b);
      rolled[attr] = dice.slice(1).reduce((a, b) => a + b, 0);
    });
    patch({ abilities: rolled });
  }

  const CLASS_STANDARD_ARRAYS = {
    'Barbarian': { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8  },
    'Fighter':   { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8  },
    'Monk':      { STR:12, DEX:15, CON:13, INT:8,  WIS:14, CHA:10 },
    'Paladin':   { STR:15, DEX:8,  CON:14, INT:10, WIS:12, CHA:14 },
    'Ranger':    { STR:12, DEX:15, CON:14, INT:8,  WIS:13, CHA:10 },
    'Rogue':     { STR:8,  DEX:15, CON:14, INT:10, WIS:13, CHA:12 },
    'Bard':      { STR:8,  DEX:14, CON:13, INT:10, WIS:12, CHA:15 },
    'Cleric':    { STR:10, DEX:14, CON:13, INT:8,  WIS:15, CHA:12 },
    'Druid':     { STR:8,  DEX:14, CON:13, INT:10, WIS:15, CHA:12 },
    'Sorcerer':  { STR:8,  DEX:13, CON:14, INT:10, WIS:12, CHA:15 },
    'Warlock':   { STR:8,  DEX:14, CON:13, INT:10, WIS:12, CHA:15 },
    'Wizard':    { STR:8,  DEX:13, CON:14, INT:15, WIS:12, CHA:10 },
  };
  function setStandard() {
    const arr = CLASS_STANDARD_ARRAYS[data.charClass] || { STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8 };
    patch({ abilities: arr });
  }

  function parseStartingEquipment(equipStr) {
    if (!equipStr) return { items: [], gp: 0 };
    const items = [];
    let gp = 0;
    equipStr.split(',').forEach(part => {
      const s = part.trim();
      if (!s) return;
      const gpMatch = s.match(/^(\d+)\s*GP$/i);
      if (gpMatch) { gp += parseInt(gpMatch[1]); return; }
      const qtyMatch = s.match(/^(\d+)\s+(.+)$/);
      if (qtyMatch) {
        items.push({ id: `bg_${Date.now()}_${Math.random().toString(36).slice(2)}`, name: qtyMatch[2], qty: parseInt(qtyMatch[1]), desc: '', weight: '' });
      } else {
        items.push({ id: `bg_${Date.now()}_${Math.random().toString(36).slice(2)}`, name: s, qty: 1, desc: '', weight: '' });
      }
    });
    return { items, gp };
  }

  function getFinalAbilities() {
    const base = { ...data.abilities };
    Object.entries(data.bgAsi).forEach(([attr, bonus]) => {
      if (bonus > 0) base[attr] = Math.min(20, (base[attr] || 10) + bonus);
    });
    return base;
  }

  function calcHP(abs, cls, hd) {
    const hitDie = hd || HIT_DICE[cls] || 'd8';
    const conMod = Math.floor((abs.CON - 10) / 2);
    return parseInt(hitDie.replace('d', '')) + conMod;
  }

  function buildFinalState() {
    const finalAbs = getFinalAbilities();
    const bgSkills = selectedBg?.skills || (data.charBackground === CUSTOM_SENTINEL ? data.customBgSkills : []);
    const allSkills = [...new Set([...bgSkills, ...data.skillProficiencies])];
    const raceName = data.charRace === CUSTOM_SENTINEL ? '' : data.charRace;
    const bgName = data.charBackground === CUSTOM_SENTINEL ? '' : data.charBackground;
    const classFeats = getAutoFeatures('class', selectedCls, CLASS_FEATURES);
    let speciesFeats = [];
    if (data.charRace === CUSTOM_SENTINEL) {
      if (data.customSpeciesDarkvision) {
        speciesFeats.push({
          id: 'species_custom_darkvision',
          name: 'Darkvision',
          desc: `You can see in dim light within ${data.customSpeciesDarkvisionDist || '18 m'} as if it were bright light, and in darkness as if it were dim light.`,
          source: data.customSpecies,
          sourceType: 'species',
        });
      }
      data.customSpeciesTraits.forEach((trait, i) => {
        if (trait.name) speciesFeats.push({
          id: `species_custom_${i}`,
          name: trait.name,
          desc: trait.desc,
          source: data.customSpecies,
          sourceType: 'species',
        });
      });
    } else if (raceName) {
      speciesFeats = getAutoFeatures('species', raceName, SPECIES_FEATURES);
    }
    let bgFeats = bgName ? getAutoFeatures('background', bgName, BACKGROUND_FEATURES) : [];
    if (data.charBackground === CUSTOM_SENTINEL && data.customBgFeat) {
      const knownFeat = ORIGIN_FEATS.find(f => f.name === data.customBgFeat);
      bgFeats = [...bgFeats, {
        id: 'bg_custom_feat',
        name: data.customBgFeat,
        desc: knownFeat?.desc || '',
        source: data.customBackground,
        sourceType: 'background',
      }];
    }

    let startEquipment = [];
    let startGp = 0;
    if (data.bgEquipmentChoice && selectedBg) {
      const equipStr = data.bgEquipmentChoice === 'A' ? selectedBg.equipA : selectedBg.equipB;
      const { items, gp } = parseStartingEquipment(equipStr || '');
      startEquipment = items;
      startGp = gp;
    } else if (data.charBackground === CUSTOM_SENTINEL) {
      if (data.customBgEquipOption === 'gold') {
        startGp = 50;
      } else if (data.customBgEquipItems) {
        const { items, gp } = parseStartingEquipment(data.customBgEquipItems);
        startEquipment = items;
        startGp = gp;
      }
    }

    // Species legacy spells
    const speciesData = data.charRace !== CUSTOM_SENTINEL ? getSpeciesData(data.charRace) : null;
    const chosenLegacy = speciesData?.legacies?.find(l => l.id === data.speciesLegacy);
    const spellStat = data.speciesSpellStat || 'INT';
    const speciesDisplayName = data.charRace ? t(`data.species.${data.charRace}`, data.charRace) : data.charRace;

    const fixedSpells = (speciesData?.fixedSpells || []).map(s => ({
      name: s.name,
      level: s.level,
      prepared: true,
      alwaysPrepared: true,
      source: 'species',
      sourceLabel: speciesDisplayName,
      spellStat,
      acquiredAtLevel: s.unlockLevel,
    }));

    const legacySpells = (chosenLegacy?.spells || [])
      .filter(s => s.unlockLevel <= 1)
      .map(s => ({
        name: s.name,
        level: s.level,
        prepared: true,
        alwaysPrepared: true,
        source: 'species',
        sourceLabel: chosenLegacy ? `${speciesDisplayName} (${chosenLegacy.name})` : speciesDisplayName,
        spellStat,
        acquiredAtLevel: s.unlockLevel,
      }));

    const allSpeciesSpells = [
      ...fixedSpells,
      ...legacySpells.filter(ls => !fixedSpells.find(fs => fs.name === ls.name)),
    ];

    // Speed: base from species data, overridden by lineage speedOverride
    let finalSpeed;
    if (data.charRace === CUSTOM_SENTINEL) {
      finalSpeed = `${data.customSpeciesSpeed || 30}ft`;
    } else {
      finalSpeed = `${speciesData?.speed || 30}ft`;
      if (chosenLegacy?.speedOverride) finalSpeed = `${chosenLegacy.speedOverride}ft`;
    }

    return {
      system: 'dnd5e2024',
      charName: data.charName,
      charClass: selectedCls,
      charRace: data.charRace === CUSTOM_SENTINEL ? data.customSpecies : data.charRace,
      charBackground: data.charBackground === CUSTOM_SENTINEL ? data.customBackground : data.charBackground,
      charAlignment: data.charAlignment,
      charLevel: 1,
      abilities: finalAbs,
      saveProficiencies: effectiveSaveProfs,
      skillProficiencies: allSkills,
      skillExpertise: [],
      features: [...classFeats, ...speciesFeats, ...bgFeats].map(f => ({ ...f, isNew: true })),
      hpCurrent: calcHP(finalAbs, selectedCls, effectiveHitDie),
      hpMax: calcHP(finalAbs, selectedCls, effectiveHitDie),
      ac: 10 + Math.floor((finalAbs.DEX - 10) / 2),
      speed: finalSpeed,
      equipment: startEquipment,
      currency: { GP: startGp, SP: 0, CP: 0, PP: 0 },
      spells: allSpeciesSpells,
      speciesLegacy: data.speciesLegacy,
      speciesSpellStat: spellStat,
      resistances: chosenLegacy?.resistance ? [chosenLegacy.resistance] : [],
      spellSlots: SPELLCASTING_CLASS[selectedCls]
        ? (SLOT_TABLE[1] || []).map(max => ({ max, used: 0 }))
        : [],
    };
  }

  const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || '') : (data.charRace ? t(`data.species.${data.charRace}`, data.charRace) : '');
  const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || '') : (data.charBackground ? t(`data.backgrounds.${data.charBackground}`, data.charBackground) : '');
  const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || '') : (data.charClass ? t(`data.classes.${data.charClass}`, data.charClass) : '');

  const canNextStep = [
    data.charName && data.charRace &&
      (data.charRace !== CUSTOM_SENTINEL || data.customSpecies) &&
      (!selectedSpeciesData?.legacies || data.speciesLegacy),
    data.charClass && (data.charClass !== CUSTOM_SENTINEL || data.customClass) &&
      data.charBackground &&
      (data.charBackground !== CUSTOM_SENTINEL || data.customBackground),
    true, true, true,
  ][step];

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">{t('creator.title')}</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="creator-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`creator-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < step ? <Icon id="action.done" size={12} /> : i + 1}</div>
              <div className="creator-step-label">{s}</div>
            </div>
          ))}
        </div>

        <div className="creator-body">

          {/* ── STEP 0 — Identità ── */}
          {step === 0 && (
            <div className="creator-section">
              <div className="field" style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t('creator.nameLabel')}
                  {nextAttempted && !data.charName && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontSize: '0.8rem', fontWeight: 400 }}>
                      <AlertTriangle size={12} /> {t('sources.nameRequired')}
                    </span>
                  )}
                </label>
                <input
                  value={data.charName}
                  onChange={e => { patch({ charName: e.target.value }); if (e.target.value) setNextAttempted(false); }}
                  placeholder={t('creator.charNamePlaceholder')}
                  autoFocus
                  style={nextAttempted && !data.charName ? { borderColor: 'var(--c-warn)' } : undefined}
                />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>{t('identity.alignment')}</label>
                <AlignmentPicker value={data.charAlignment} onChange={a => patch({ charAlignment: a })} />
              </div>

              {/* SPECIE */}
              <div className="creator-subtitle">{t('creator.speciesTitle')}</div>
              <div className="creator-grid">
                {speciesList.map(r => {
                  const isCustom = (r.id || r.name) === CUSTOM_SENTINEL;
                  const selected = data.charRace === (r.id || r.name);
                  return (
                    <div key={r.name} className={`creator-card ${selected ? 'selected' : ''}`} onClick={() => patch({ charRace: r.id || r.name, speciesLegacy: null, speciesSpellStat: 'INT' })}>
                      <div className="creator-card-name">{isCustom ? r.label : t(`data.species.${r.id}`, r.id)}</div>
                      {isCustom && selected && (
                        <div className="creator-custom-form" onClick={e => e.stopPropagation()}>
                          <div className="field" style={{ marginTop: 6 }}>
                            <label>{t('creator.customSpeciesName', 'Species name')}</label>
                            <input value={data.customSpecies} autoFocus
                              onChange={e => patch({ customSpecies: e.target.value })}
                              placeholder={t('creator.customSpeciesNamePlaceholder')} />
                          </div>
                          <div className="field-row" style={{ marginTop: 8, alignItems: 'flex-end', gap: 8 }}>
                            <div className="field" style={{ flex: '0 0 90px' }}>
                              <label>{t('creator.customSpeciesSpeed', 'Speed (ft)')}</label>
                              <input type="number" min="0" step="5" value={data.customSpeciesSpeed}
                                onChange={e => patch({ customSpeciesSpeed: parseInt(e.target.value) || 30 })} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 6 }}>
                              <input type="checkbox" id="cs-dv" checked={data.customSpeciesDarkvision}
                                onChange={e => patch({ customSpeciesDarkvision: e.target.checked })} />
                              <label htmlFor="cs-dv" style={{ cursor: 'pointer', marginBottom: 0, userSelect: 'none' }}>
                                {t('creator.customSpeciesDarkvision', 'Darkvision')}
                              </label>
                              {data.customSpeciesDarkvision && (
                                <input style={{ width: 64, fontSize: '0.8rem' }} value={data.customSpeciesDarkvisionDist}
                                  onChange={e => patch({ customSpeciesDarkvisionDist: e.target.value })}
                                  placeholder={t('placeholders.creatorSpeed')} />
                              )}
                            </div>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                              {t('creator.customSpeciesTraits', 'Traits')}
                            </div>
                            {data.customSpeciesTraits.map((trait, ti) => (
                              <div key={trait.id} style={{ marginBottom: 6, background: 'var(--c-bg)', borderRadius: 6, padding: '6px 8px' }}>
                                <div className="field-row" style={{ alignItems: 'flex-start', gap: 6 }}>
                                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                                    <label>{t('creator.customSpeciesTraitName', 'Trait name')}</label>
                                    <input value={trait.name}
                                      onChange={e => patch({ customSpeciesTraits: data.customSpeciesTraits.map((tr, j) => j === ti ? { ...tr, name: e.target.value } : tr) })}
                                      placeholder={t('creator.customSpeciesTraitNamePlaceholder')} />
                                  </div>
                                  <button className="dh-wm-remove-btn" style={{ marginTop: 18, flexShrink: 0 }}
                                    onClick={() => patch({ customSpeciesTraits: data.customSpeciesTraits.filter((_, j) => j !== ti) })}>
                                    <Icon id="action.remove" size={13} />
                                  </button>
                                </div>
                                <div className="field" style={{ marginTop: 4, marginBottom: 0 }}>
                                  <label>{t('creator.customSpeciesTraitDesc', 'Description')}</label>
                                  <textarea className="notes-area" style={{ minHeight: 44, fontSize: '0.8rem' }}
                                    value={trait.desc}
                                    onChange={e => patch({ customSpeciesTraits: data.customSpeciesTraits.map((tr, j) => j === ti ? { ...tr, desc: e.target.value } : tr) })}
                                    placeholder={t('creator.customSpeciesTraitDescPlaceholder')} />
                                </div>
                              </div>
                            ))}
                            <button className="io-btn" style={{ fontSize: '0.733rem', marginTop: 2 }}
                              onClick={() => patch({ customSpeciesTraits: [...data.customSpeciesTraits, { id: `cst_${Date.now()}`, name: '', desc: '' }] })}>
                              {t('creator.customSpeciesAddTrait', '+ Add trait')}
                            </button>
                          </div>
                        </div>
                      )}
                      {!isCustom && selected && (SPECIES_FEATURES[r.id] || []).length > 0 && (
                        <div className="creator-traits">
                          {(SPECIES_FEATURES[r.id] || []).map((f, i) => (
                            <div key={i} className="creator-trait">• <strong>{f.name}</strong>: {f.desc}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* LINEAGE — shown when selected species has legacies */}
              {selectedSpeciesData?.legacies && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.chooseLineage', { lineageLabel: selectedSpeciesData.legacyLabel })}</strong>

                  {selectedSpeciesData.fixedSpells?.length > 0 && (
                    <div className="hint-text" style={{ marginTop: 6, marginBottom: 4 }}>
                      {t('creator.tieflingFixedNote')}
                    </div>
                  )}

                  <div className="creator-grid" style={{ marginTop: 8 }}>
                    {selectedSpeciesData.legacies.map(legacy => {
                      const legSelected = data.speciesLegacy === legacy.id;
                      return (
                        <div key={legacy.id}
                          className={`creator-card ${legSelected ? 'selected' : ''}`}
                          onClick={() => patch({ speciesLegacy: legacy.id })}>
                          <div className="creator-card-name">{legacy.name}</div>
                          <div className="creator-traits">
                            <div className="creator-trait" style={{ marginBottom: 4 }}>
                              <strong>{t('creator.lineageLevel1Trait')}</strong> {legacy.level1Trait}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 6, marginBottom: 2 }}>
                              {t('creator.speciesSpells')}
                            </div>
                            {legacy.spells.map(s => (
                              <div key={s.name} className="creator-trait"
                                style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <span>
                                  {s.level === 0 ? 'Cantrip' : ['','1st','2nd','3rd'][s.level] + ' level'} — {s.name}
                                </span>
                                <span style={{ color: 'var(--c-muted)', flexShrink: 0 }}>
                                  {s.unlockLevel === 1
                                    ? t('creator.speciesSpellAlways')
                                    : t('creator.speciesSpellAtLevel', { level: s.unlockLevel })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedSpeciesData.legacySpellStat && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: 6, color: 'var(--c-muted)' }}>
                        {t('creator.lineageSpellStat')}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['INT', 'WIS', 'CHA'].map(stat => (
                          <button key={stat}
                            className={`filter-chip ${data.speciesSpellStat === stat ? 'active' : ''}`}
                            onClick={e => { e.stopPropagation(); patch({ speciesSpellStat: stat }); }}>
                            {stat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── STEP 1 — Classe & BG ── */}
          {step === 1 && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('creator.classTitle')}</div>
              <div className="creator-grid">
                {classList.map(cls => {
                  const isCustom = cls === CUSTOM_SENTINEL;
                  const selected = data.charClass === cls;
                  return (
                    <div key={cls} className={`creator-card ${selected ? 'selected' : ''}`} onClick={() => patch({ charClass: cls })}>
                      <div className="creator-card-name">{isCustom ? t('creator.customClassLabel', 'Custom...') : t(`data.classes.${cls}`, cls)}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {HIT_DICE[cls] || 'd8'} HP{SPELLCASTING_CLASS[cls] ? ` · ${t('creator.spellcaster', 'Spellcaster')} (${t(`data.abilityAbbr.${SPELLCASTING_CLASS[cls]}`, SPELLCASTING_CLASS[cls])})` : ''}
                        </div>
                      )}
                      {isCustom && selected && (
                        <div className="creator-custom-form" onClick={e => e.stopPropagation()}>
                          <div className="field" style={{ marginTop: 6 }}>
                            <label>{t('creator.customClsName', 'Class name')}</label>
                            <input value={data.customClass} autoFocus
                              onChange={e => patch({ customClass: e.target.value })}
                              placeholder={t('creator.customClsNamePlaceholder')} />
                          </div>
                          <div className="field-row" style={{ marginTop: 8, gap: 8 }}>
                            <div className="field">
                              <label>{t('creator.customClsHitDie', 'Hit Die')}</label>
                              <select value={data.customClassHitDie}
                                onChange={e => patch({ customClassHitDie: e.target.value })}>
                                {['d6','d8','d10','d12'].map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <div className="field">
                              <label>{t('creator.customClsSpellStat', 'Spellcasting ability')}</label>
                              <select value={data.customClassSpellStat}
                                onChange={e => patch({ customClassSpellStat: e.target.value })}>
                                <option value="">{t('creator.customClsSpellNone', 'None')}</option>
                                {ABILITIES.map(a => <option key={a} value={a}>{t(`data.abilityAbbr.${a}`, a)}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Saving throw proficiencies */}
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                              {t('creator.customClsSaveProfs', 'Saving Throws')}
                              <span style={{ fontSize: '0.733rem', fontWeight: 400, marginLeft: 6, color: 'var(--c-muted)' }}>
                                ({data.customClassSaveProfs.length}/2)
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                              {ABILITIES.map(a => {
                                const checked = data.customClassSaveProfs.includes(a);
                                const maxed = data.customClassSaveProfs.length >= 2;
                                return (
                                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', cursor: checked || !maxed ? 'pointer' : 'default', opacity: !checked && maxed ? 0.4 : 1 }}>
                                    <input type="checkbox" checked={checked}
                                      disabled={!checked && maxed}
                                      onChange={e => {
                                        if (e.target.checked && data.customClassSaveProfs.length < 2)
                                          patch({ customClassSaveProfs: [...data.customClassSaveProfs, a] });
                                        else if (!e.target.checked)
                                          patch({ customClassSaveProfs: data.customClassSaveProfs.filter(x => x !== a) });
                                      }} />
                                    {t(`data.abilityAbbr.${a}`, a)}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Skill count */}
                          <div className="field" style={{ marginTop: 10 }}>
                            <label>{t('creator.customClsSkillCount', 'Number of class skills')}</label>
                            <select value={data.customClassSkillCount}
                              onChange={e => patch({ customClassSkillCount: parseInt(e.target.value) })}>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                            </select>
                          </div>

                          {/* Skill options */}
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>
                              {t('creator.customClsSkillOptions', 'Available skills')}
                              <span style={{ fontSize: '0.733rem', fontWeight: 400, marginLeft: 6, color: 'var(--c-muted)' }}>
                                {data.customClassSkillOptions.length === 0
                                  ? t('creator.customClsSkillAllAvail', '(all skills)')
                                  : `(${data.customClassSkillOptions.length} selected)`}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 8px' }}>
                              {SKILLS.map(sk => {
                                const checked = data.customClassSkillOptions.includes(sk.id);
                                return (
                                  <label key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.733rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={checked}
                                      onChange={e => {
                                        if (e.target.checked)
                                          patch({ customClassSkillOptions: [...data.customClassSkillOptions, sk.id] });
                                        else
                                          patch({ customClassSkillOptions: data.customClassSkillOptions.filter(x => x !== sk.id) });
                                      }} />
                                    {t(`data.skills.${sk.id}`, sk.id)}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait">• {t('creator.summarySavingThrows')}: {(CLASS_SAVE_PROFS[cls] || []).map(a => t(`data.abilityAbbr.${a}`, a)).join(', ')}</div>
                          <div className="creator-trait">{t('creator.clsSkillsInfo', { count: CLASS_SKILL_COUNT[cls] || 2 })}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BACKGROUND */}
              <div className="creator-subtitle" style={{ marginTop: 16 }}>{t('creator.backgroundTitle')}</div>
              <div className="creator-grid">
                {bgList.map(b => {
                  const isCustom = (b.id || b.name) === CUSTOM_SENTINEL;
                  const selected = data.charBackground === (b.id || b.name);
                  return (
                    <div key={b.id || b.name} className={`creator-card ${selected ? 'selected' : ''}`}
                      onClick={() => patch({ charBackground: b.id || b.name, bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 }, bgEquipmentChoice: null })}>
                      <div className="creator-card-name">{isCustom ? b.label : t(`data.backgrounds.${b.id || b.name}`, b.name)}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {b.skills.map(s => t(`data.skills.${s}`, s)).join(', ')} · {b.feat}
                        </div>
                      )}
                      {isCustom && selected && (
                        <div className="creator-custom-form" onClick={e => e.stopPropagation()}>
                          <div className="field" style={{ marginTop: 6 }}>
                            <label>{t('creator.customBgName', 'Background name')}</label>
                            <input value={data.customBackground} autoFocus
                              onChange={e => patch({ customBackground: e.target.value })}
                              placeholder={t('creator.customBgNamePlaceholder')} />
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                              {t('creator.customBgSkillsLabel', 'Skill Proficiencies')}
                            </div>
                            <div className="field-row" style={{ gap: 8 }}>
                              {[0, 1].map(si => (
                                <div key={si} className="field">
                                  <label style={{ fontSize: '0.733rem' }}>Skill {si + 1}</label>
                                  <select value={data.customBgSkills[si] || ''} onChange={e => {
                                    const next = [data.customBgSkills[0] || '', data.customBgSkills[1] || ''];
                                    next[si] = e.target.value;
                                    patch({ customBgSkills: next.filter(Boolean) });
                                  }}>
                                    <option value="">—</option>
                                    {SKILLS.map(sk => (
                                      <option key={sk.id} value={sk.id}
                                        disabled={data.customBgSkills.includes(sk.id) && data.customBgSkills[si] !== sk.id}>
                                        {t(`data.skills.${sk.id}`, sk.id)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="field-row" style={{ marginTop: 8, gap: 8 }}>
                            <div className="field">
                              <label>{t('creator.customBgTool', 'Tool Proficiency')}</label>
                              <input value={data.customBgTool}
                                onChange={e => patch({ customBgTool: e.target.value })}
                                placeholder={t('creator.customBgToolPlaceholder')} />
                            </div>
                            <div className="field">
                              <label>{t('creator.customBgLanguage', 'Language')}</label>
                              <input value={data.customBgLanguage}
                                onChange={e => patch({ customBgLanguage: e.target.value })}
                                placeholder={t('creator.customBgLanguagePlaceholder')} />
                            </div>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-muted)', display: 'block', marginBottom: 4 }}>
                              {t('creator.customBgFeat', 'Origin Feat')}
                            </label>
                            <select value={data.customBgFeatId} onChange={e => {
                              const id = e.target.value;
                              const feat = ORIGIN_FEATS.find(f => f.id === id);
                              patch({ customBgFeatId: id, customBgFeat: feat ? feat.name : '' });
                            }}>
                              <option value="">—</option>
                              {ORIGIN_FEATS.map(feat => (
                                <option key={feat.id} value={feat.id}>{feat.name}</option>
                              ))}
                              <option value={CUSTOM_SENTINEL}>{t('creator.customBgFeatCustom', 'Custom…')}</option>
                            </select>
                            {data.customBgFeatId && data.customBgFeatId !== CUSTOM_SENTINEL && (() => {
                              const feat = ORIGIN_FEATS.find(f => f.id === data.customBgFeatId);
                              return feat ? <span className="feat-inline-desc" style={{ marginTop: 4 }}>{feat.desc}</span> : null;
                            })()}
                            {data.customBgFeatId === CUSTOM_SENTINEL && (
                              <input style={{ marginTop: 6 }}
                                value={data.customBgFeat}
                                onChange={e => patch({ customBgFeat: e.target.value })}
                                placeholder={t('creator.customBgFeatCustomPlaceholder')}
                                autoFocus />
                            )}
                          </div>
                        </div>
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait" style={{ fontStyle:'italic', marginBottom:4 }}>{b.desc}</div>
                          {b.feat && (() => {
                            const knownFeat = ORIGIN_FEATS.find(f => b.feat.startsWith(f.name));
                            return (
                              <div className="creator-trait">
                                ✨ {t('creator.originFeatLabel', 'Origin Feat')}: <strong>{b.feat}</strong>
                                {knownFeat && <span className="feat-inline-desc">{knownFeat.desc}</span>}
                              </div>
                            );
                          })()}
                          <div className="creator-trait">🗡 {t('creator.profBgTool')} {b.tool}</div>
                          <div className="creator-trait">🎒 {t('creator.bgEquipOption', { opt: 'A' })} {b.equipA}</div>
                          <div className="creator-trait">🎒 {t('creator.bgEquipOption', { opt: 'B' })} {b.equipB}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom background — Starting Equipment */}
              {data.charBackground === CUSTOM_SENTINEL && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.bgEquipTitle')}</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {[['gold', t('creator.customBgEquipGold', '50 GP to spend')], ['items', t('creator.customBgEquipItems', 'List specific items')]].map(([opt, lbl]) => (
                      <div key={opt}
                        className={`creator-card ${data.customBgEquipOption === opt ? 'selected' : ''}`}
                        style={{ padding: '8px 10px', cursor: 'pointer' }}
                        onClick={() => patch({ customBgEquipOption: opt })}>
                        <div className="creator-card-name">{lbl}</div>
                      </div>
                    ))}
                    {data.customBgEquipOption === 'items' && (
                      <textarea className="notes-area" style={{ minHeight: 44, fontSize: '0.8rem', marginTop: 4 }}
                        value={data.customBgEquipItems}
                        onChange={e => patch({ customBgEquipItems: e.target.value })}
                        placeholder={t('creator.customBgEquipItemsPlaceholder')} />
                    )}
                  </div>
                </div>
              )}

              {/* Custom background — ASI */}
              {data.charBackground === CUSTOM_SENTINEL && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.bgAsiLabel')}</strong>
                  {(() => {
                    const total = Object.values(data.bgAsi).reduce((s, v) => s + v, 0);
                    return (
                      <>
                        <p className="hint-text" style={{ margin: '6px 0 8px' }}>
                          {t('levelUp.asiPointsLeft', { spent: total, total: 3 })}
                          {total === 3 && ' ✓'}
                        </p>
                        <div className="creator-abilities">
                          {ABILITIES.map(a => {
                            const val = data.bgAsi[a];
                            const canIncrease = val < 2 && total < 3;
                            const canDecrease = val > 0;
                            return (
                              <div key={a} className="creator-ability-row">
                                <div className="creator-ability-name">{t(`data.abilities.${a}`)}</div>
                                <div className="creator-ability-controls">
                                  <button className="mod-btn" disabled={!canDecrease}
                                    onClick={() => canDecrease && patch({ bgAsi: { ...data.bgAsi, [a]: val - 1 } })}>−</button>
                                  <span className="creator-ability-val">{val > 0 ? `+${val}` : '0'}</span>
                                  <button className="mod-btn" disabled={!canIncrease}
                                    onClick={() => canIncrease && patch({ bgAsi: { ...data.bgAsi, [a]: val + 1 } })}>+</button>
                                </div>
                                {val > 0 && <div className="creator-race-bonus">+{val}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Equipment choice */}
              {data.charBackground && data.charBackground !== CUSTOM_SENTINEL && selectedBg?.equipA && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.bgEquipTitle')}</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {[['A', selectedBg.equipA], ['B', selectedBg.equipB]].map(([opt, desc]) => (
                      <div key={opt}
                        className={`creator-card ${data.bgEquipmentChoice === opt ? 'selected' : ''}`}
                        style={{ padding: '8px 10px', cursor: 'pointer' }}
                        onClick={() => patch({ bgEquipmentChoice: opt })}>
                        <div className="creator-card-name" style={{ marginBottom: 2 }}>
                          {t('creator.bgEquipOption', { opt })}
                        </div>
                        <div className="creator-card-sub">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASI dal background */}
              {data.charBackground && data.charBackground !== CUSTOM_SENTINEL && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.bgAsiLabel')}</strong>
                  {selectedBg?.abilityScores && (
                    <span style={{ color: 'var(--c-muted)', marginLeft: 6 }}>
                      {t('creator.bgAsiRecommended')} {selectedBg.abilityScores.map(a => t(`data.abilities.${a}`)).join(', ')}
                    </span>
                  )}
                  {(() => {
                    const total = Object.values(data.bgAsi).reduce((s, v) => s + v, 0);
                    return (
                      <>
                        <p className="hint-text" style={{ margin: '6px 0 8px' }}>
                          {t('levelUp.asiPointsLeft', { spent: total, total: 3 })}
                          {total === 3 && ' ✓'}
                        </p>
                        <div className="creator-abilities">
                          {ABILITIES.map(a => {
                            const val = data.bgAsi[a];
                            const recommended = selectedBg?.abilityScores?.includes(a);
                            const canIncrease = val < 2 && total < 3;
                            const canDecrease = val > 0;
                            return (
                              <div key={a} className="creator-ability-row">
                                <div className="creator-ability-name" style={{ color: recommended ? 'var(--c-accent)' : undefined, fontWeight: recommended ? 600 : undefined }}>
                                  {t(`data.abilities.${a}`)}{recommended ? ' ★' : ''}
                                </div>
                                <div className="creator-ability-controls">
                                  <button className="mod-btn" disabled={!canDecrease}
                                    onClick={() => canDecrease && patch({ bgAsi: { ...data.bgAsi, [a]: val - 1 } })}>−</button>
                                  <span className="creator-ability-val">{val > 0 ? `+${val}` : '0'}</span>
                                  <button className="mod-btn" disabled={!canIncrease}
                                    onClick={() => canIncrease && patch({ bgAsi: { ...data.bgAsi, [a]: val + 1 } })}>+</button>
                                </div>
                                {val > 0 && <div className="creator-race-bonus">+{val}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 — Statistiche ── */}
          {step === 2 && (
            <div className="creator-section">
              <div className="creator-method-bar">
                {[['pointbuy', t('creator.pointBuy')],['standard', t('creator.standardArray')],['roll', t('creator.rollStats')]].map(([v,l]) => (
                  <button key={v} className={`filter-chip ${data.abilitiesMethod === v ? 'active' : ''}`}
                    onClick={() => {
                      patch({ abilitiesMethod: v });
                      if (v === 'standard') setStandard();
                      if (v === 'roll') rollStats();
                      if (v === 'pointbuy') patch({ abilities: { STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8 } });
                    }}>{l}</button>
                ))}
                {data.abilitiesMethod === 'roll' && (
                  <button className="filter-chip" onClick={rollStats}>{t('creator.reroll')}</button>
                )}
              </div>

              {data.abilitiesMethod === 'pointbuy' && (
                <div className="creator-pb-info">
                  {t('creator.pointsLeft', { left: pointsLeft, total: POINT_BUY_TOTAL })}
                  {pointsLeft < 0 && <span style={{ color:'#A32D2D' }}>{t('creator.tooManyPoints')}</span>}
                </div>
              )}

              {Object.values(data.bgAsi).some(v => v > 0) && (
                <div className="creator-info-box" style={{ marginBottom:8 }}>
                  Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${t(`data.abilityAbbr.${a}`, a)}`).join(', ')} (applicati nel riepilogo)
                </div>
              )}

              <div className="creator-abilities">
                {ABILITIES.map(attr => {
                  const base = data.abilities[attr];
                  const bgMod = data.bgAsi[attr] || 0;
                  const final = Math.min(20, base + bgMod);
                  const mod = Math.floor((final - 10) / 2);
                  return (
                    <div key={attr} className="creator-ability-row">
                      <div className="creator-ability-name">{t(`data.abilities.${attr}`)}</div>
                      <div className="creator-ability-controls">
                        {data.abilitiesMethod === 'pointbuy' ? (
                          <>
                            <button className="mod-btn" onClick={() => adjPointBuy(attr, -1)}>−</button>
                            <span className="creator-ability-val">{base}</span>
                            <button className="mod-btn" onClick={() => adjPointBuy(attr, 1)}>+</button>
                          </>
                        ) : (
                          <input className="ability-score-input" type="number" min="3" max="18" value={base}
                            onChange={e => patch({ abilities: { ...data.abilities, [attr]: parseInt(e.target.value) || 8 } })} />
                        )}
                      </div>
                      {bgMod !== 0 && <div className="creator-race-bonus">+{bgMod} bg</div>}
                      <div className="creator-ability-final">
                        <span className="creator-ability-total">{final}</span>
                        <span className="creator-ability-mod">{mod >= 0 ? `+${mod}` : `${mod}`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3 — Competenze ── */}
          {step === 3 && (
            <div className="creator-section">
              {selectedBg && (
                <div className="creator-info-box">
                  <strong>{t(`data.backgrounds.${data.charBackground}`, data.charBackground)}:</strong>{' '}
                  {t('creator.profBgAutoSkills', { skills: selectedBg.skills.map(s => t(`data.skills.${s}`, s)).join(', ') })}
                  {selectedBg.tool && <> · {t('creator.profBgTool')} {selectedBg.tool}.</>}
                  {selectedBg.feat && <> · {t('creator.profBgFeat')} <strong>{selectedBg.feat}</strong>.</>}
                </div>
              )}
              <div className="creator-subtitle">
                {t('creator.profTitle', { count: effectiveSkillCount })}
                {' '}{t('creator.profSelected', { selected: data.skillProficiencies.length, max: effectiveSkillCount })}
              </div>
              <div className="check-list">
                {effectiveSkillOptions.map(sk => {
                  const fromBg = selectedBg?.skills?.includes(sk) || (data.charBackground === CUSTOM_SENTINEL && data.customBgSkills.includes(sk));
                  const selected = data.skillProficiencies.includes(sk);
                  const maxReached = data.skillProficiencies.length >= effectiveSkillCount;
                  return (
                    <div key={sk} className={`check-item ${fromBg ? 'bg-skill' : ''}`}
                      onClick={() => {
                        if (fromBg) return;
                        if (selected) patch({ skillProficiencies: data.skillProficiencies.filter(s => s !== sk) });
                        else if (!maxReached) patch({ skillProficiencies: [...data.skillProficiencies, sk] });
                      }}
                      style={{ opacity: !selected && maxReached && !fromBg ? 0.4 : 1 }}>
                      <div className={`check-dot ${fromBg || selected ? 'proficient' : ''}`} />
                      <span className="check-name">{t(`data.skills.${sk}`, sk)}</span>
                      {fromBg && <span className="check-attr">background</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 4 — Riepilogo ── */}
          {step === 4 && (() => {
            const final = getFinalAbilities();
            const hp = calcHP(final, selectedCls, effectiveHitDie);
            const conMod = Math.floor((final.CON - 10) / 2);
            return (
              <div className="creator-section">
                <div className="creator-summary">
                  <div className="creator-summary-name">{data.charName || '—'}</div>
                  <div className="creator-summary-sub">{charRaceDisplay} · {charClsDisplay} · {charBgDisplay}</div>
                  <div className="creator-summary-sub" style={{ marginTop:2 }}>{data.charAlignment ? t(`data.alignments.${data.charAlignment}`, data.charAlignment) : ''}</div>
                  <div className="creator-summary-grid">
                    {ABILITIES.map(attr => {
                      const val = final[attr];
                      const mod = Math.floor((val - 10) / 2);
                      return (
                        <div key={attr} className="creator-summary-stat">
                          <div className="creator-summary-attr">{attr}</div>
                          <div className="creator-summary-val">{val}</div>
                          <div className="creator-summary-mod">{mod >= 0 ? `+${mod}` : mod}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="creator-summary-row"><span>{t('creator.summaryMaxHP')}</span><strong>{hp} ({effectiveHitDie}+{conMod} CON)</strong></div>
                  <div className="creator-summary-row"><span>{t('creator.summarySavingThrows')}</span><strong>{effectiveSaveProfs.map(a => t(`data.abilityAbbr.${a}`, a)).join(', ') || '—'}</strong></div>
                  <div className="creator-summary-row"><span>{t('creator.summaryProficiencies')}</span><strong>{[
                    ...(selectedBg?.skills || (data.charBackground === CUSTOM_SENTINEL ? data.customBgSkills : [])),
                    ...data.skillProficiencies,
                  ].map(s => t(`data.skills.${s}`, s)).join(', ') || '—'}</strong></div>
                  {selectedBg && <>
                    <div className="creator-summary-row"><span>{t('creator.summaryOriginFeat')}</span><strong>{selectedBg.feat}</strong></div>
                    <div className="creator-summary-row"><span>{t('creator.summaryTool')}</span><strong>{selectedBg.tool}</strong></div>
                  </>}
                  {data.charBackground === CUSTOM_SENTINEL && <>
                    {data.customBgFeat && <div className="creator-summary-row"><span>{t('creator.summaryOriginFeat')}</span><strong>{data.customBgFeat}</strong></div>}
                    {data.customBgTool && <div className="creator-summary-row"><span>{t('creator.summaryTool')}</span><strong>{data.customBgTool}</strong></div>}
                    {data.customBgLanguage && <div className="creator-summary-row"><span>{t('creator.customBgLanguage', 'Language')}</span><strong>{data.customBgLanguage}</strong></div>}
                    <div className="creator-summary-row">
                      <span>{t('creator.summaryEquipment')}</span>
                      <strong>{data.customBgEquipOption === 'gold' ? '50 GP' : (data.customBgEquipItems || '—')}</strong>
                    </div>
                  </>}
                  {Object.values(data.bgAsi).some(v => v > 0) && (
                    <div className="creator-summary-row">
                      <span>{t('creator.summaryBgBonus')}</span>
                      <strong>{Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${a}`).join(', ')}</strong>
                    </div>
                  )}
                  {data.bgEquipmentChoice && selectedBg && (
                    <div className="creator-summary-row">
                      <span>{t('creator.summaryEquipment')}</span>
                      <strong>{data.bgEquipmentChoice === 'A' ? selectedBg.equipA : selectedBg.equipB}</strong>
                    </div>
                  )}
                  {data.charRace === CUSTOM_SENTINEL && (data.customSpeciesDarkvision || data.customSpeciesTraits.some(tr => tr.name)) && (
                    <div className="creator-summary-row" style={{ alignItems: 'flex-start' }}>
                      <span>{t('creator.customSpeciesTraits', 'Traits')}</span>
                      <strong style={{ textAlign: 'right' }}>
                        {[
                          data.customSpeciesDarkvision && `Darkvision ${data.customSpeciesDarkvisionDist || '18 m'}`,
                          ...data.customSpeciesTraits.filter(tr => tr.name).map(tr => tr.name),
                        ].filter(Boolean).join(' · ')}
                      </strong>
                    </div>
                  )}
                  {effectiveSpellStat && (
                    <div className="creator-summary-row"><span>{t('creator.summarySpellcaster')}</span><strong>Yes ({t(`data.abilityAbbr.${effectiveSpellStat}`, effectiveSpellStat)})</strong></div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="creator-footer">
          <button className="io-btn" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
            {step === 0 ? t('creator.cancel') : t('creator.back')}
          </button>
          <div style={{ flex:1 }} />
          {step < STEPS.length - 1 ? (
            <button className="io-btn primary"
              onClick={() => {
                if (!canNextStep) { setNextAttempted(true); return; }
                setNextAttempted(false);
                setStep(s => s + 1);
              }}>{t('creator.next')}</button>
          ) : (
            <button className="io-btn primary" onClick={() => {
              window.umami?.track('character-created', { system: 'dnd5e2024', class: data.charClass });
              if (data.charClass === CUSTOM_SENTINEL && data.customClass) {
                syncCustomToDraft('classes', { name: data.customClass, hitDie: data.customClassHitDie, spellcastingAbility: data.customClassSpellStat || 'none', savingThrows: data.customClassSaveProfs, skillCount: String(data.customClassSkillCount) }, 'dnd5e2024');
              }
              if (data.charRace === CUSTOM_SENTINEL && data.customSpecies) {
                syncCustomToDraft('species', { name: data.customSpecies, speed: String(data.customSpeciesSpeed || 30), traits: data.customSpeciesTraits }, 'dnd5e2024');
              }
              if (data.charBackground === CUSTOM_SENTINEL && data.customBackground) {
                syncCustomToDraft('backgrounds', { name: data.customBackground, skills: data.customBgSkills, tool: data.customBgTool, language: data.customBgLanguage }, 'dnd5e2024');
              }
              onComplete(buildFinalState());
            }}>{t('creator.create')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
