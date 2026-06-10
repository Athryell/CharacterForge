import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DND_CLASSES, SUBCLASS_DATA } from '../data/systems/dnd5e/classes';
import { ABILITIES } from '../data/systems/dnd5e/mechanics';

const ABILITY_LABELS = { STR: 'STR', DEX: 'DEX', CON: 'CON', INT: 'INT', WIS: 'WIS', CHA: 'CHA' };

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
  const isSpellcaster = !!classData?.spellcasting;
  const spellsToLearn = ld.spellsToLearn || 0;

  // Build step list, skipping empty steps
  const STEPS = useMemo(() => {
    const s = ['hp'];
    if (autoFeatures.length > 0) s.push('features');
    if (choiceFeatures.length > 0) s.push('choices');
    if (ld.asi || ld.epicBoon) s.push('asi');
    if (isSpellcaster && spellsToLearn > 0) s.push('spells');
    s.push('summary');
    return s;
  }, [autoFeatures.length, choiceFeatures.length, ld.asi, ld.epicBoon, isSpellcaster, spellsToLearn]);

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
  const [asiMode, setAsiMode] = useState('plus2');
  const [asiPlus2, setAsiPlus2] = useState('STR');
  const [asiPlus1A, setAsiPlus1A] = useState('STR');
  const [asiPlus1B, setAsiPlus1B] = useState('DEX');
  const [featName, setFeatName] = useState('');
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
        return c && (c.selected || c.custom?.trim());
      });
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
    });

    let asiObj = null, featObj = null, epicBoonObj = null;
    if (ld.asi) {
      if (asiType === 'feat') { featObj = featName; }
      else if (asiMode === 'plus2') { asiObj = { [asiPlus2]: 2 }; }
      else { asiObj = { [asiPlus1A]: (asiPlus1A === asiPlus1B ? 2 : 1), ...(asiPlus1A !== asiPlus1B ? { [asiPlus1B]: 1 } : {}) }; }
    } else if (ld.epicBoon) {
      epicBoonObj = epicBoonName;
    }

    return { hpGained, features, spells: [], asi: asiObj, feat: featObj, epicBoon: epicBoonObj };
  }

  const changes = useMemo(buildChanges, // eslint-disable-next-line react-hooks/exhaustive-deps
    [hpGained, autoFeatures, choiceFeatures, choices, asiType, asiMode, asiPlus2, asiPlus1A, asiPlus1B, featName, epicBoonName, ld, subclassName]);

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
          <button className="creator-close" onClick={onCancel}>✕</button>
        </div>

        <div className="creator-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`creator-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < stepIdx ? '✓' : i + 1}</div>
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
            </div>
          )}

          {/* ── Choices step ── */}
          {currentStep === 'choices' && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('levelUp.stepChoices')}</div>
              {choiceFeatures.map((f, fi) => {
                const c = choices[f.name] || {};
                return (
                  <div key={fi} style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
                    <p className="hint-text" style={{ marginBottom: 8 }}>{f.desc}</p>
                    <div className="creator-grid">
                      {(f.choices || []).map(opt => (
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
                      <input style={{ marginTop: 8, width: '100%' }}
                        placeholder={t('levelUp.customChoice')}
                        value={c.custom || ''}
                        onChange={e => setChoices(prev => ({ ...prev, [f.name]: { selected: null, custom: e.target.value } }))} />
                    )}
                    {!c.selected && c.custom === undefined && (
                      <input style={{ marginTop: 8, width: '100%' }}
                        placeholder={t('levelUp.customChoice')}
                        value=""
                        onChange={e => setChoices(prev => ({ ...prev, [f.name]: { selected: null, custom: e.target.value } }))} />
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
                      placeholder="Boon of Combat Prowess" autoFocus />
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

                  {asiType === 'asi' && (
                    <>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        {['plus2', 'plus1'].map(opt => (
                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <input type="radio" checked={asiMode === opt} onChange={() => setAsiMode(opt)} />
                            {opt === 'plus2' ? t('levelUp.asiPlus2') : t('levelUp.asiPlus1')}
                          </label>
                        ))}
                      </div>
                      {asiMode === 'plus2' && (
                        <div className="field">
                          <label>Ability (+2)</label>
                          <select value={asiPlus2} onChange={e => setAsiPlus2(e.target.value)}>
                            {ABILITIES.map(a => (
                              <option key={a} value={a}>{ABILITY_LABELS[a]} ({charState.abilities?.[a] || 10} → {Math.min(20, (charState.abilities?.[a] || 10) + 2)})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {asiMode === 'plus1' && (
                        <div className="grid-2">
                          <div className="field">
                            <label>First ability (+1)</label>
                            <select value={asiPlus1A} onChange={e => setAsiPlus1A(e.target.value)}>
                              {ABILITIES.map(a => (
                                <option key={a} value={a}>{ABILITY_LABELS[a]} ({charState.abilities?.[a] || 10} → {Math.min(20, (charState.abilities?.[a] || 10) + (a === asiPlus1B ? 2 : 1))})</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <label>Second ability (+1)</label>
                            <select value={asiPlus1B} onChange={e => setAsiPlus1B(e.target.value)}>
                              {ABILITIES.map(a => (
                                <option key={a} value={a}>{ABILITY_LABELS[a]} ({charState.abilities?.[a] || 10} → {Math.min(20, (charState.abilities?.[a] || 10) + (a === asiPlus1A ? 2 : 1))})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {asiType === 'feat' && (
                    <>
                      <div className="field">
                        <label>{t('levelUp.featPlaceholder')}</label>
                        <input value={featName} onChange={e => setFeatName(e.target.value)}
                          placeholder="War Caster, Alert, Lucky..." autoFocus />
                      </div>
                      <p className="hint-text" style={{ marginTop: 4 }}>{t('levelUp.featCategories')}</p>
                    </>
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
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>New Features</div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {changes.features.map((f, i) => <li key={i} style={{ fontSize: 13 }}>{f.name}</li>)}
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
          <span style={{ fontSize: 12, color: 'var(--c-accent)', fontWeight: 600 }}>{noted}</span>
        </div>
        {open && <div className="feature-desc" style={{ marginTop: 4 }}>{feature.desc}</div>}
      </div>
    </div>
  );
}
