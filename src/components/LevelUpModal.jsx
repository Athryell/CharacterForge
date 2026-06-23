import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DND_CLASSES, SUBCLASS_DATA } from '../data/systems/dnd5e2024/classes';
import dataManager from '../data/dataManager';
import { ABILITIES, SKILLS } from '../data/systems/dnd5e2024/mechanics';
import { getSpeciesData } from '../data/systems/dnd5e2024/species';
import { ALL_DND_FEATS } from '../data/systems/dnd5e2024/feats';
import { Icon } from '../config/icons';


const FIGHTING_STYLE_CLASSES = ['Fighter', 'Paladin', 'Ranger'];

function getAvailableFeats(targetLevel, charClass, existingFeatIds, isSpellcaster) {
  return ALL_DND_FEATS.filter(feat => {
    if (feat.id === 'ability_score_improvement') return false;
    if (feat.category === 'epicBoon' && targetLevel < 19) return false;
    if (feat.category === 'fightingStyle' && !FIGHTING_STYLE_CLASSES.includes(charClass)) return false;
    if (feat.id === 'boon_spell_recall' && !isSpellcaster) return false;
    if (!feat.repeatable && existingFeatIds.has(feat.id)) return false;
    return true;
  });
}

export default function LevelUpModal({ currentLevel, charClass, charState, onComplete, onCancel }) {
  const { t } = useTranslation();
  const targetLevel = currentLevel + 1;

  const classData = DND_CLASSES.find(c => c.name === charClass);
  const ld = useMemo(
    () => classData?.levelData?.[targetLevel] || { features: [], hpDie: classData?.hitDie || 'd8', subclass: false, asi: false, epicBoon: false },
    [classData, targetLevel]
  );
  const hpDie = ld.hpDie || classData?.hitDie || 'd8';
  const dieSides = parseInt(hpDie.replace('d', '')) || 8;
  const conMod = Math.floor(((charState.abilities?.CON || 10) - 10) / 2);
  const avgHp = Math.max(1, Math.ceil(dieSides / 2) + 1 + conMod);

  const customSubclassFeatures = useMemo(
    () => (charState.subclassFeatures || [])
      .filter(f => f.level === targetLevel && f.name?.trim())
      .map(f => ({ name: f.name.trim(), desc: f.desc || '', auto: true, _subclass: true })),
    [charState.subclassFeatures, targetLevel]
  );
  const subclassLevelFeatures = useMemo(() => {
    const sub = charState.charSubclass;
    if (!sub || !SUBCLASS_DATA[charClass]?.[sub]?.[targetLevel]) return [];
    return SUBCLASS_DATA[charClass][sub][targetLevel].map(f => ({ ...f, _subclass: true }));
  }, [charState.charSubclass, charClass, targetLevel]);
  const autoFeatures = useMemo(() => {
    const baseAuto = (ld.features || []).filter(f => f.auto);
    if (subclassLevelFeatures.length === 0) {
      return [...baseAuto, ...customSubclassFeatures];
    }
    const hadPlaceholder = baseAuto.some(f => f.name === 'Subclass Feature');
    const merged = baseAuto.flatMap(f =>
      f.name === 'Subclass Feature' ? subclassLevelFeatures : [f]
    );
    const withInitial = hadPlaceholder ? merged : [...merged, ...subclassLevelFeatures];
    return [...withInitial, ...customSubclassFeatures];
  }, [ld, subclassLevelFeatures, customSubclassFeatures]);
  const choiceFeatures = useMemo(() => (ld.features || []).filter(f => !f.auto), [ld]);
  const hbSubclasses = useMemo(() => dataManager.getSubclasses(charClass), [charClass]);
  const isSpellcaster = !!classData?.spellcasting;

  const existingFeatIds = useMemo(
    () => new Set((charState.feats || []).map(f => f.id)),
    [charState.feats]
  );
  const availableFeats = useMemo(
    () => getAvailableFeats(targetLevel, charClass, existingFeatIds, isSpellcaster),
    [targetLevel, charClass, existingFeatIds, isSpellcaster]
  );

  // Species spells that unlock at this level
  const newSpeciesSpells = useMemo(() => {
    const speciesData = charState.charRace ? getSpeciesData(charState.charRace) : null;
    if (!speciesData?.legacies && !speciesData?.fixedSpells) return [];
    const chosenLegacy = speciesData?.legacies?.find(l => l.id === charState.speciesLegacy);
    const allSpeciesSpells = [
      ...(speciesData?.fixedSpells || []),
      ...(chosenLegacy?.spells || []),
    ];
    const existing = new Set((charState.spells || []).map(s => s.name));
    return allSpeciesSpells.filter(s => s.unlockLevel === targetLevel && !existing.has(s.name));
  }, [charState.charRace, charState.speciesLegacy, charState.spells, targetLevel]);
  const spellsToLearn = ld.spellsToLearn || 0;

  // Build step list, skipping empty steps
  const STEPS = useMemo(() => {
    const s = ['hp'];
    if (autoFeatures.length > 0 || newSpeciesSpells.length > 0) s.push('features');
    if (choiceFeatures.length > 0) s.push('choices');
    if (ld.asi || ld.epicBoon) s.push('asi');
    if (isSpellcaster && spellsToLearn > 0) s.push('spells');
    s.push('summary');
    return s;
  }, [autoFeatures.length, choiceFeatures.length, ld.asi, ld.epicBoon, isSpellcaster, spellsToLearn, newSpeciesSpells.length]);

  const STEP_LABELS = {
    hp: t('levelUp.stepHp'),
    features: t('levelUp.stepFeatures'),
    choices: t('levelUp.stepChoices'),
    asi: ld.epicBoon ? 'Epic Boon' : t('levelUp.stepAsi'),
    spells: t('levelUp.stepSpells'),
    summary: t('levelUp.stepSummary'),
  };

  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = STEPS[stepIdx];

  // HP step
  const [hpGained, setHpGained] = useState(avgHp);
  const [rolledVal, setRolledVal] = useState(null);

  // Choices step: { [featureName]: { selected: string|null, custom: string } }
  const [choices, setChoices] = useState({});

  // ASI step
  const [asiType, setAsiType] = useState('asi');
  const [asiDeltas, setAsiDeltas] = useState({ STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 });
  const [selectedFeat, setSelectedFeat] = useState(null);
  const [customFeatName, setCustomFeatName] = useState('');
  const [featAsiChoice, setFeatAsiChoice] = useState('');
  const [featChoices, setFeatChoices] = useState({});
  const [epicBoonName, setEpicBoonName] = useState('');

  function rollDie() {
    const roll = Math.floor(Math.random() * dieSides) + 1;
    setRolledVal(roll);
    setHpGained(Math.max(1, roll + conMod));
  }

  function canAdvance() {
    if (currentStep === 'choices') {
      return choiceFeatures.every(f => {
        const c = choices[f.name];
        if (!c) return false;
        if ((f.choose || 1) > 1) {
          const selArr = Array.isArray(c.selected) ? c.selected : [];
          return (selArr.length + (c.custom?.trim() ? 1 : 0)) >= f.choose;
        }
        return c.selected || c.custom?.trim();
      });
    }
    if (currentStep === 'asi' && asiType === 'feat') {
      if (!selectedFeat) return false;
      if (selectedFeat.id === '__custom__' && !customFeatName.trim()) return false;
      if (selectedFeat.asi && typeof selectedFeat.asi === 'object' && !featAsiChoice) return false;
      return true;
    }
    return true;
  }

  const subclassName = charState.charSubclass || charClass;

  function buildChanges() {
    const features = autoFeatures.map(f => ({
      id: `${f._subclass ? subclassName : charClass}_lv${targetLevel}_${f.name.replace(/\W+/g, '_')}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      name: f.name,
      desc: f.desc,
      source: f._subclass ? subclassName : charClass,
      sourceType: f._subclass ? 'subclass' : 'class',
    }));

    choiceFeatures.forEach(f => {
      const c = choices[f.name] || {};
      if ((f.choose || 1) > 1) {
        const selArr = Array.isArray(c.selected) ? c.selected : [];
        [...selArr, ...(c.custom?.trim() ? [c.custom.trim()] : [])].forEach(label => {
          features.push({
            id: `${charClass}_lv${targetLevel}_${label.replace(/\W+/g, '_')}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            name: label,
            desc: f.desc,
            source: charClass,
            sourceType: 'class',
          });
        });
      } else {
        const label = c.custom?.trim() || c.selected;
        if (label) {
          features.push({
            id: `${charClass}_lv${targetLevel}_${f.name.replace(/\W+/g, '_')}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            name: label,
            desc: f.desc,
            source: charClass,
            sourceType: 'class',
          });
        }
      }
    });

    let asiObj = null, featObj = null, epicBoonObj = null;
    if (ld.asi) {
      if (asiType === 'feat') {
        const name = selectedFeat?.id === '__custom__'
          ? customFeatName.trim()
          : (selectedFeat?.name || '');
        if (name) featObj = name;
      } else {
        const nonZero = Object.fromEntries(Object.entries(asiDeltas).filter(([, v]) => v > 0));
        if (Object.keys(nonZero).length > 0) asiObj = nonZero;
      }
    } else if (ld.epicBoon) {
      epicBoonObj = epicBoonName;
    }

    const speciesData = charState.charRace ? getSpeciesData(charState.charRace) : null;
    const chosenLegacy = speciesData?.legacies?.find(l => l.id === charState.speciesLegacy);
    const speciesDisplayName = charState.charRace
      ? charState.charRace.charAt(0).toUpperCase() + charState.charRace.slice(1)
      : '';
    const spellsGained = newSpeciesSpells.map(s => ({
      name: s.name,
      level: s.level,
      prepared: true,
      alwaysPrepared: true,
      source: 'species',
      sourceLabel: chosenLegacy
        ? `${speciesDisplayName} (${chosenLegacy.name})`
        : speciesDisplayName,
      spellStat: charState.speciesSpellStat || 'INT',
      acquiredAtLevel: targetLevel,
    }));

    return { hpGained, features, spells: spellsGained, asi: asiObj, feat: featObj, epicBoon: epicBoonObj };
  }

  const changes = useMemo(buildChanges, // eslint-disable-next-line react-hooks/exhaustive-deps
    [hpGained, autoFeatures, choiceFeatures, choices, asiType, asiDeltas, selectedFeat, customFeatName, featAsiChoice, epicBoonName, ld, subclassName, newSpeciesSpells]);

  function handleComplete() {
    window.umami?.track('level-up', { class: charClass, level: targetLevel });
    onComplete(changes);
  }

  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">{t('levelUp.title', { level: targetLevel })}</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="creator-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`creator-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < stepIdx ? <Icon id="action.done" size={12} /> : i + 1}</div>
              <div className="creator-step-label">{STEP_LABELS[s]}</div>
            </div>
          ))}
        </div>

        <div className="creator-body">

          {/* ── HP step ── */}
          {currentStep === 'hp' && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('levelUp.stepHp')}</div>
              <p className="hint-text" style={{ marginBottom: 12 }}>
                CON modifier: {conMod >= 0 ? `+${conMod}` : conMod}
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <button className="io-btn primary" onClick={rollDie}>
                  {t('levelUp.rollDie', { die: hpDie })}
                  {rolledVal !== null && ` → ${rolledVal}`}
                </button>
                <button className="io-btn" onClick={() => { setRolledVal(null); setHpGained(avgHp); }}>
                  {t('levelUp.takeAverage', { val: avgHp })}
                </button>
              </div>
              <div className="field">
                <label>HP Gained</label>
                <input type="number" min="1" style={{ width: 80 }}
                  value={hpGained}
                  onChange={e => setHpGained(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <p className="hint-text" style={{ marginTop: 8 }}>
                {t('levelUp.newHp', { current: charState.hpMax, gain: hpGained, total: charState.hpMax + hpGained })}
              </p>
            </div>
          )}

          {/* ── Auto features step ── */}
          {currentStep === 'features' && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('levelUp.stepFeatures')}</div>
              <div className="feature-list" style={{ marginTop: 8 }}>
                {autoFeatures.map((f, i) => (
                  <ExpandableFeature key={i} feature={f} noted={t('levelUp.noted')} subclass={f._subclass} />
                ))}
              </div>
              {newSpeciesSpells.length > 0 && (
                <div style={{ marginTop: autoFeatures.length > 0 ? 12 : 0 }}>
                  {autoFeatures.length > 0 && (
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('creator.speciesSpells')}
                    </div>
                  )}
                  {newSpeciesSpells.map(s => {
                    const lvlLabel = s.level === 0 ? 'cantrip' : ['','1st','2nd','3rd'][s.level] + ' level';
                    return (
                      <div key={s.name} className="feature-item expanded">
                        <div className="feature-source-dot" style={{ background: 'var(--c-accent-light)', border: '1.5px solid var(--c-accent)' }} />
                        <div style={{ flex: 1, fontSize: '0.867rem' }}>
                          {t('levelUp.newSpeciesSpell', { name: s.name, level: lvlLabel })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Choices step ── */}
          {currentStep === 'choices' && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('levelUp.stepChoices')}</div>
              {choiceFeatures.map((f, fi) => {
                const c = choices[f.name] || {};
                const isMulti = (f.choose || 1) > 1;
                const isSubchoice = f.name?.toLowerCase().includes('subclass');
                const effectiveChoices = isSubchoice
                  ? [...(f.choices || []), ...hbSubclasses.filter(h => !(f.choices || []).includes(h))]
                  : (f.choices || []);

                if (isMulti) {
                  const selArr = Array.isArray(c.selected) ? c.selected : [];
                  const picked = selArr.length + (c.custom?.trim() ? 1 : 0);
                  const needed = f.choose;
                  return (
                    <div key={fi} style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
                      <p className="hint-text" style={{ marginBottom: 8 }}>
                        {f.desc} — <strong>{t('levelUp.chooseProgress', { picked, total: needed })}</strong>
                      </p>
                      <div className="creator-grid">
                        {effectiveChoices.map(opt => {
                          const isSelected = selArr.includes(opt);
                          const maxReached = picked >= needed && !isSelected;
                          return (
                            <div key={opt}
                              className={`creator-card ${isSelected ? 'selected' : ''} ${maxReached ? 'disabled' : ''}`}
                              onClick={() => {
                                if (maxReached) return;
                                const newSel = isSelected ? selArr.filter(s => s !== opt) : [...selArr, opt];
                                setChoices(prev => ({ ...prev, [f.name]: { ...c, selected: newSel } }));
                              }}>
                              <div className="creator-card-name">{opt}</div>
                            </div>
                          );
                        })}
                      </div>
                      {picked < needed && (
                        <input style={{ marginTop: 8 }}
                          placeholder={t('levelUp.customChoice')}
                          value={c.custom || ''}
                          onChange={e => setChoices(prev => ({ ...prev, [f.name]: { ...c, custom: e.target.value } }))} />
                      )}
                    </div>
                  );
                }

                return (
                  <div key={fi} style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
                    <p className="hint-text" style={{ marginBottom: 8 }}>{f.desc}</p>
                    <div className="creator-grid">
                      {effectiveChoices.map(opt => (
                        <div key={opt}
                          className={`creator-card ${c.selected === opt && !c.custom?.trim() ? 'selected' : ''}`}
                          onClick={() => setChoices(prev => ({ ...prev, [f.name]: { selected: opt, custom: '' } }))}>
                          <div className="creator-card-name">{opt}</div>
                        </div>
                      ))}
                      <div className={`creator-card ${c.custom?.trim() ? 'selected' : ''}`}
                        onClick={() => setChoices(prev => ({ ...prev, [f.name]: { ...c, selected: null } }))}>
                        <div className="creator-card-name">{t('levelUp.customChoice')}</div>
                      </div>
                    </div>
                    {(c.custom !== undefined || (!c.selected && c.custom !== undefined)) && (
                      <input style={{ marginTop: 8 }}
                        placeholder={t('levelUp.customChoice')}
                        value={c.custom || ''}
                        onChange={e => setChoices(prev => ({ ...prev, [f.name]: { selected: null, custom: e.target.value } }))} />
                    )}
                    {!c.selected && c.custom === undefined && (
                      <input style={{ marginTop: 8 }}
                        placeholder={t('levelUp.customChoice')}
                        value=""
                        onChange={e => setChoices(prev => ({ ...prev, [f.name]: { selected: null, custom: e.target.value } }))} />
                    )}
                    {isSubchoice && c.selected && !c.custom?.trim() && (
                      <SubclassFeaturePreview charClass={charClass} subclassName={c.selected} targetLevel={targetLevel} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ASI / Epic Boon step ── */}
          {currentStep === 'asi' && (
            <div className="creator-section">
              {ld.epicBoon ? (
                <>
                  <div className="creator-subtitle">Epic Boon</div>
                  <p className="hint-text" style={{ marginBottom: 8 }}>{t('levelUp.epicBoonRecommended')}</p>
                  <div className="field">
                    <label>{t('levelUp.epicBoonPlaceholder')}</label>
                    <input value={epicBoonName} onChange={e => setEpicBoonName(e.target.value)}
                      placeholder={t('placeholders.epicBoonName')} autoFocus />
                  </div>
                </>
              ) : (
                <>
                  <div className="creator-subtitle">{t('levelUp.stepAsi')}</div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    {['asi', 'feat'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="radio" checked={asiType === opt} onChange={() => setAsiType(opt)} />
                        {opt === 'asi' ? t('levelUp.asiOption') : t('levelUp.featOption')}
                      </label>
                    ))}
                  </div>

                  {asiType === 'asi' && (() => {
                    const totalDelta = Object.values(asiDeltas).reduce((s, v) => s + v, 0);
                    return (
                      <>
                        <p className="hint-text" style={{ marginBottom: 10 }}>
                          {t('levelUp.asiPointsLeft', { spent: totalDelta, total: 2 })}
                          {totalDelta === 2 && ' ✓'}
                        </p>
                        <div className="creator-abilities">
                          {ABILITIES.map(attr => {
                            const current = charState.abilities?.[attr] || 10;
                            const delta = asiDeltas[attr];
                            const newVal = Math.min(20, current + delta);
                            const mod = Math.floor((newVal - 10) / 2);
                            const canIncrease = totalDelta < 2 && newVal < 20;
                            const canDecrease = delta > 0;
                            return (
                              <div key={attr} className="creator-ability-row">
                                <div className="creator-ability-name">{t(`data.abilities.${attr}`)}</div>
                                <div className="creator-ability-controls">
                                  <button className="mod-btn" disabled={!canDecrease}
                                    onClick={() => canDecrease && setAsiDeltas(prev => ({ ...prev, [attr]: prev[attr] - 1 }))}>−</button>
                                  <span className="creator-ability-val">{current}</span>
                                  <button className="mod-btn" disabled={!canIncrease}
                                    onClick={() => canIncrease && setAsiDeltas(prev => ({ ...prev, [attr]: prev[attr] + 1 }))}>+</button>
                                </div>
                                {delta > 0 && <div className="creator-race-bonus">+{delta}</div>}
                                <div className="creator-ability-final">
                                  <span className="creator-ability-total">{newVal}</span>
                                  <span className="creator-ability-mod">{mod >= 0 ? `+${mod}` : `${mod}`}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}

                  {asiType === 'feat' && (
                    <div className="feat-selector">
                      {availableFeats.map(feat => {
                        const isSelected = selectedFeat?.id === feat.id;
                        return (
                          <div key={feat.id}
                            className={`feat-card${isSelected ? ' selected' : ''}`}
                            onClick={() => { setSelectedFeat(feat); setFeatAsiChoice(''); setFeatChoices({}); }}>
                            <div className="feat-card-header">
                              <span className="feat-name">{feat.name}</span>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {feat.repeatable && (
                                  <span className="feat-badge">{t('feats.repeatable', 'Repeatable')}</span>
                                )}
                                {feat.asi && typeof feat.asi === 'object' && (
                                  <span className="feat-badge asi">
                                    +{feat.asi.amount} {feat.asi.options === 'any' ? t('feats.anyAbility', 'any') : feat.asi.options.join('/')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {feat.prerequisite && (
                              <div className="feat-prereq">{t('feats.requires', 'Requires')}: {feat.prerequisite}</div>
                            )}
                            <div className="feat-desc">{feat.desc}</div>

                            {isSelected && feat.asi && typeof feat.asi === 'object' && (
                              <div className="feat-asi-picker" onClick={e => e.stopPropagation()}>
                                <div className="feat-asi-label">{t('levelUp.featAsiLabel', 'Choose ability to increase:')}</div>
                                <div className="feat-asi-options">
                                  {(feat.asi.options === 'any' ? ABILITIES : feat.asi.options).map(attr => {
                                    const current = charState.abilities?.[attr] || 10;
                                    const max = feat.asi.max || 20;
                                    const disabled = current >= max;
                                    return (
                                      <button key={attr}
                                        className={`ability-chip${featAsiChoice === attr ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                                        disabled={disabled}
                                        onClick={() => !disabled && setFeatAsiChoice(attr)}>
                                        {attr} {current}→{Math.min(max, current + feat.asi.amount)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {isSelected && feat.choices && (
                              <div onClick={e => e.stopPropagation()}>
                                <FeatChoiceForm feat={feat} choices={featChoices} onChange={setFeatChoices} t={t} />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div
                        className={`feat-card feat-card-custom${selectedFeat?.id === '__custom__' ? ' selected' : ''}`}
                        onClick={() => { setSelectedFeat({ id: '__custom__' }); setFeatAsiChoice(''); setFeatChoices({}); }}>
                        <div className="feat-card-header">
                          <span className="feat-name"><Icon id="action.add" size={12} /> {t('levelUp.featCustom', 'Custom feat')}</span>
                        </div>
                        <div className="feat-desc">{t('levelUp.featCustomDesc', 'Enter a feat not in the SRD')}</div>
                        {selectedFeat?.id === '__custom__' && (
                          <input
                            className="feat-custom-input"
                            placeholder={t('levelUp.featCustomPlaceholder', 'Feat name (refer to your PHB)')}
                            value={customFeatName}
                            onChange={e => setCustomFeatName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Summary step ── */}
          {currentStep === 'summary' && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('levelUp.stepSummary')}</div>
              <div className="identity-info-grid" style={{ marginTop: 8 }}>
                <div className="identity-info-item">
                  <div className="identity-info-label">Level</div>
                  <div className="identity-info-val">{currentLevel} → {targetLevel}</div>
                </div>
                <div className="identity-info-item">
                  <div className="identity-info-label">HP</div>
                  <div className="identity-info-val">{charState.hpMax} → {charState.hpMax + changes.hpGained} (+{changes.hpGained})</div>
                </div>
                {changes.asi && (
                  <div className="identity-info-item">
                    <div className="identity-info-label">ASI</div>
                    <div className="identity-info-val">
                      {Object.entries(changes.asi).map(([k, v]) => `${k} +${v}`).join(', ')}
                    </div>
                  </div>
                )}
                {(changes.feat || changes.epicBoon) && (
                  <div className="identity-info-item">
                    <div className="identity-info-label">{ld.epicBoon ? 'Epic Boon' : 'Feat'}</div>
                    <div className="identity-info-val">{changes.feat || changes.epicBoon || '—'}</div>
                  </div>
                )}
              </div>
              {changes.features.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.867rem', marginBottom: 6 }}>New Features</div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {changes.features.map((f, i) => <li key={i} style={{ fontSize: '0.867rem' }}>{f.name}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="creator-footer">
          <button className="io-btn" onClick={onCancel}>{t('creator.cancel')}</button>
          {stepIdx > 0 && <button className="io-btn" onClick={() => setStepIdx(i => i - 1)}>{t('creator.back')}</button>}
          {!isLast
            ? <button className={`io-btn primary ${!canAdvance() ? 'disabled' : ''}`}
                onClick={() => canAdvance() && setStepIdx(i => i + 1)}>{t('creator.next')}</button>
            : <button className="io-btn primary" onClick={handleComplete}>{t('levelUp.confirm')}</button>
          }
        </div>
      </div>
    </div>
  );
}

function ExpandableFeature({ feature, noted, subclass }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="feature-item expanded" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
      <div className="feature-source-dot" style={{ background: subclass ? 'var(--c-warn)' : 'var(--c-accent)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="feature-name">{feature.name}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--c-accent)', fontWeight: 600 }}>{noted}</span>
        </div>
        {open && <div className="feature-desc" style={{ marginTop: 4 }}>{feature.desc}</div>}
      </div>
    </div>
  );
}

function SubclassFeaturePreview({ charClass, subclassName, targetLevel }) {
  const { t } = useTranslation();

  const srdByLevel = SUBCLASS_DATA[charClass]?.[subclassName] || {};

  const hbByLevel = {};
  const hbDetails = dataManager.getSubclassDetails(charClass, subclassName);
  (hbDetails?.features || []).forEach(f => {
    const lv = parseInt(f.level) || 0;
    if (!lv || !f.name?.trim()) return;
    if (!hbByLevel[lv]) hbByLevel[lv] = [];
    hbByLevel[lv].push({ name: f.name.trim(), desc: f.desc || '' });
  });

  const allLevels = [...new Set([
    ...Object.keys(srdByLevel).map(Number),
    ...Object.keys(hbByLevel).map(Number),
  ])].sort((a, b) => a - b);

  if (allLevels.length === 0) return null;

  return (
    <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--c-surface)', borderRadius: 'var(--r)', border: '1px solid var(--c-border)' }}>
      <div style={{ fontSize: '0.733rem', fontWeight: 700, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {subclassName}
      </div>
      {allLevels.map(lv => {
        const features = [...(srdByLevel[lv] || []), ...(hbByLevel[lv] || [])];
        const isCurrent = lv === targetLevel;
        return (
          <div key={lv} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.733rem', fontWeight: 600, color: isCurrent ? 'var(--c-accent)' : 'var(--c-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              Lv. {lv}
              {isCurrent && <span style={{ fontSize: '0.6rem', background: 'var(--c-accent)', color: 'var(--c-accent-text)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>{t('levelUp.now', 'Now')}</span>}
            </div>
            <div className="feature-list">
              {features.map((f, i) => (
                <ExpandableFeature key={i} feature={f} noted={t('levelUp.noted')} subclass />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeatChoiceForm({ feat, choices, onChange, t }) {
  if (feat.choices?.spellList) {
    return (
      <div className="feat-choices-form">
        <div className="field" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: '0.733rem' }}>{t('feats.choiceSpellList', 'Spell list')}</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {feat.choices.spellList.map(list => (
              <button key={list}
                className={`filter-chip${choices.spellList === list ? ' active' : ''}`}
                onClick={() => onChange(prev => ({ ...prev, spellList: list }))}>
                {list}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label style={{ fontSize: '0.733rem' }}>{t('feats.choiceSpellStat', 'Spellcasting ability')}</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['INT', 'WIS', 'CHA'].map(stat => (
              <button key={stat}
                className={`filter-chip${choices.spellcastingStat === stat ? ' active' : ''}`}
                onClick={() => onChange(prev => ({ ...prev, spellcastingStat: stat }))}>
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (feat.choices?.skills) {
    const selected = choices.skills || [];
    const needed = feat.choices.skills;
    return (
      <div className="feat-choices-form">
        <div style={{ fontSize: '0.733rem', color: 'var(--c-muted)', marginBottom: 6 }}>
          {t('feats.choiceSkills', 'Choose {{n}} skills or tools', { n: needed })} — {selected.length}/{needed}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
          {SKILLS.map(sk => {
            const isSelected = selected.includes(sk.id);
            const maxed = selected.length >= needed && !isSelected;
            return (
              <button key={sk.id}
                className={`filter-chip${isSelected ? ' active' : ''}${maxed ? ' disabled' : ''}`}
                disabled={maxed}
                onClick={() => {
                  if (maxed) return;
                  onChange(prev => ({
                    ...prev,
                    skills: isSelected
                      ? (prev.skills || []).filter(s => s !== sk.id)
                      : [...(prev.skills || []), sk.id],
                  }));
                }}>
                {t(`data.skills.${sk.id}`, sk.id)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
