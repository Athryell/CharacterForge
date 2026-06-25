import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Icon } from '../../config/icons';
import { DH_TRAIT_ARRAY, DH_ANCESTRY_DATA, DH_COMMUNITY_DATA, createDHDefaultState, getDHProficiency } from '../../data/systems/daggerheart/mechanics';
import { DH_CLASSES, DH_SUBCLASSES } from '../../data/systems/daggerheart/classes';

const DH_TRAITS_ORDER = ['AGI','STR','FIN','INS','PRE','KNO'];
const DH_TRAIT_LABELS = { AGI:'Agility', STR:'Strength', FIN:'Finesse', INS:'Instinct', PRE:'Presence', KNO:'Knowledge' };

function DHSubclassPreview({ subclass }) {
  return (
    <div className="dh-subclass-preview">
      {subclass.spellcastTrait && (
        <div className="dh-feature-tier">
          <span className="dh-tier-label">Spellcast Trait</span>
          <span className="dh-spellcast-trait">{subclass.spellcastTrait}</span>
        </div>
      )}
      <div className="dh-feature-tier">
        <span className="dh-tier-label">Foundation</span>
        <div className="dh-feature-list">
          {subclass.foundation.map(f => (
            <div key={f.name} className="dh-feature-card">
              <div className="dh-feature-name">{f.name}</div>
              <div className="dh-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dh-feature-tier locked">
        <span className="dh-tier-label">Specialization</span>
        <div className="dh-feature-list">
          {subclass.specialization.map(f => (
            <div key={f.name} className="dh-feature-card">
              <div className="dh-feature-name">{f.name}</div>
              <div className="dh-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dh-feature-tier locked mastery">
        <span className="dh-tier-label">Mastery</span>
        <div className="dh-feature-list">
          {subclass.mastery.map(f => (
            <div key={f.name} className="dh-feature-card">
              <div className="dh-feature-name">{f.name}</div>
              <div className="dh-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getAncestryFeatureAssignment(ancestries, swap) {
  if (ancestries.length === 0) return null;
  const a0 = DH_ANCESTRY_DATA.find(x => x.name === ancestries[0]);
  if (!a0) return null;
  if (ancestries.length === 1) {
    return {
      feat1: { ancestry: a0.name, feature: a0.features[0] },
      feat2: { ancestry: a0.name, feature: a0.features[1] },
      canSwap: false,
    };
  }
  const a1 = DH_ANCESTRY_DATA.find(x => x.name === ancestries[1]);
  if (!a1) return null;
  const [src0, src1] = swap ? [a1, a0] : [a0, a1];
  return {
    feat1: { ancestry: src0.name, feature: src0.features[0] },
    feat2: { ancestry: src1.name, feature: src1.features[1] },
    canSwap: true,
  };
}

export default function DHCharacterCreator({ onComplete, onCancel }) {
  const { t } = useTranslation();
  const DH_STEPS = ['Identity', 'Heritage', 'Traits', 'Experiences', 'Summary'];
  const [step, setStep] = useState(0);
  const [nextAttempted, setNextAttempted] = useState(false);
  const [data, setData] = useState({
    charName: '',
    charClass: '',
    charSubclass: '',
    ancestries: [],
    ancestrySwap: false,
    community: '',
    traits: { AGI: null, STR: null, FIN: null, INS: null, PRE: null, KNO: null },
    experiences: [{ name: '', modifier: 2 }, { name: '', modifier: 2 }],
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const dhClass = DH_CLASSES.find(c => c.id === data.charClass);
  const assignedValues = Object.values(data.traits).filter(v => v !== null);
  const usedSlots = assignedValues.length;

  function getUnassignedValues() {
    const assigned = Object.values(data.traits).filter(v => v !== null);
    const pool = [...DH_TRAIT_ARRAY];
    assigned.forEach(v => { const idx = pool.indexOf(v); if (idx !== -1) pool.splice(idx, 1); });
    return pool;
  }

  function toggleAncestry(name) {
    const { ancestries } = data;
    if (ancestries.includes(name)) {
      patch({ ancestries: ancestries.filter(x => x !== name), ancestrySwap: false });
    } else if (ancestries.length < 2) {
      patch({ ancestries: [...ancestries, name] });
    }
  }

  const canNext = [
    !!data.charName && !!data.charClass && !!data.charSubclass,
    data.ancestries.length > 0 && !!data.community,
    DH_TRAITS_ORDER.every(tr => data.traits[tr] !== null),
    true,
    true,
  ][step];

  function buildState() {
    const cls = DH_CLASSES.find(c => c.id === data.charClass);
    const base = createDHDefaultState();
    return {
      ...base,
      charName: data.charName,
      charClass: data.charClass,
      charSubclass: data.charSubclass,
      ancestry: data.ancestries[0] || '',
      ancestry2: data.ancestries[1] || '',
      community: data.community,
      charLevel: 1,
      proficiency: getDHProficiency(1),
      traits: Object.fromEntries(Object.entries(data.traits).map(([k, v]) => [k, v ?? 0])),
      evasion: cls?.evasion ?? 10,
      hpCurrent: cls?.hp ?? 6,
      hpMax: cls?.hp ?? 6,
      stressCurrent: 0,
      stressMax: cls?.stress ?? 6,
      experiences: data.experiences.filter(e => e.name),
    };
  }

  const ancestryAssignment = getAncestryFeatureAssignment(data.ancestries, data.ancestrySwap);
  const selectedAncestries = data.ancestries.map(name => DH_ANCESTRY_DATA.find(a => a.name === name)).filter(Boolean);
  const selectedCommunity = DH_COMMUNITY_DATA.find(c => c.name === data.community);

  const ancestryNames = data.ancestries.length === 2
    ? data.ancestries.join(' + ')
    : data.ancestries[0] || '—';

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">🗡 Create Character</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="creator-steps">
          {DH_STEPS.map((s, i) => (
            <div key={i} className={`creator-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < step ? <Icon id="action.done" size={12} /> : i + 1}</div>
              <div className="creator-step-label">{s}</div>
            </div>
          ))}
        </div>

        <div className="creator-body">

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
                  onChange={e => patch({ charName: e.target.value })}
                  placeholder={t('creator.charNameDHPlaceholder')}
                  autoFocus
                  style={nextAttempted && !data.charName ? { borderColor: 'var(--c-warn)' } : undefined}
                />
              </div>
              <div className="creator-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Class
                {nextAttempted && !data.charClass && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontSize: '0.733rem', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    <AlertTriangle size={11} /> Required
                  </span>
                )}
              </div>
              <div className="creator-grid">
                {DH_CLASSES.map(cls => (
                  <div key={cls.id} className={`creator-card ${data.charClass === cls.id ? 'selected' : ''}`}
                    onClick={() => patch({ charClass: cls.id, charSubclass: '' })}>
                    <div className="creator-card-name">{cls.name}</div>
                    <div className="creator-card-sub">{cls.domains.join(' · ')} · HP {cls.hp} · Evasion {cls.evasion}</div>
                  </div>
                ))}
              </div>
              {dhClass && (
                <div style={{ marginTop: 12 }}>
                  <div className="creator-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Subclass
                    {nextAttempted && !data.charSubclass && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontSize: '0.733rem', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                        <AlertTriangle size={11} /> Required
                      </span>
                    )}
                  </div>
                  <div className="creator-grid">
                    {dhClass.subclasses.map(sc => (
                      <div key={sc} className={`creator-card ${data.charSubclass === sc ? 'selected' : ''}`}
                        onClick={() => patch({ charSubclass: sc })}>
                        <div className="creator-card-name">{sc}</div>
                      </div>
                    ))}
                  </div>
                  {data.charSubclass && DH_SUBCLASSES[data.charSubclass] && (
                    <DHSubclassPreview subclass={DH_SUBCLASSES[data.charSubclass]} />
                  )}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="creator-section">
              <div className="creator-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Ancestry
                <span className="dh-step-hint">— up to 2</span>
                {nextAttempted && data.ancestries.length === 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontSize: '0.733rem', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    <AlertTriangle size={11} /> Required
                  </span>
                )}
              </div>
              <div className="creator-grid">
                {DH_ANCESTRY_DATA.map(a => {
                  const isSelected = data.ancestries.includes(a.name);
                  const isMaxed = !isSelected && data.ancestries.length >= 2;
                  return (
                    <div key={a.name}
                      className={`creator-card ${isSelected ? 'selected' : ''} ${isMaxed ? 'disabled' : ''}`}
                      onClick={() => toggleAncestry(a.name)}>
                      <div className="creator-card-name">{a.name}</div>
                    </div>
                  );
                })}
              </div>

              {ancestryAssignment && (
                <div className="dh-subclass-preview">
                  <div className="dh-feature-tier">
                    {!ancestryAssignment.canSwap && selectedAncestries[0] && (
                      <p className="dh-feature-desc" style={{ marginBottom: 8 }}>{selectedAncestries[0].desc}</p>
                    )}
                    <div className="dh-ancestry-features-header">
                      <span className="dh-tier-label">Ancestry Features</span>
                      {ancestryAssignment.canSwap && (
                        <button className="io-btn" style={{ padding: '2px 8px', fontSize: '0.733rem', color: 'var(--c-warn)', borderColor: 'var(--c-warn)' }}
                          onClick={() => patch({ ancestrySwap: !data.ancestrySwap })}>
                          ↔ Swap
                        </button>
                      )}
                    </div>
                    <div className="dh-ancestry-feat-grid">
                      <div className="dh-feature-card">
                        {ancestryAssignment.canSwap && (() => {
                          const src = selectedAncestries.find(a => a.name === ancestryAssignment.feat1.ancestry);
                          return src ? <p className="dh-feature-desc" style={{ marginBottom: 6 }}>{src.desc}</p> : null;
                        })()}
                        {ancestryAssignment.canSwap && (
                          <div className="dh-ancestry-from">from {ancestryAssignment.feat1.ancestry}</div>
                        )}
                        <div className="dh-feature-name">{ancestryAssignment.feat1.feature.name}</div>
                        <div className="dh-feature-desc">{ancestryAssignment.feat1.feature.desc}</div>
                      </div>
                      <div className="dh-feature-card">
                        {ancestryAssignment.canSwap && (() => {
                          const src = selectedAncestries.find(a => a.name === ancestryAssignment.feat2.ancestry);
                          return src ? <p className="dh-feature-desc" style={{ marginBottom: 6 }}>{src.desc}</p> : null;
                        })()}
                        {ancestryAssignment.canSwap && (
                          <div className="dh-ancestry-from">from {ancestryAssignment.feat2.ancestry}</div>
                        )}
                        <div className="dh-feature-name">{ancestryAssignment.feat2.feature.name}</div>
                        <div className="dh-feature-desc">{ancestryAssignment.feat2.feature.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="creator-subtitle" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                Community
                {nextAttempted && !data.community && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontSize: '0.733rem', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    <AlertTriangle size={11} /> Required
                  </span>
                )}
              </div>
              <div className="creator-grid">
                {DH_COMMUNITY_DATA.map(c => (
                  <div key={c.name} className={`creator-card ${data.community === c.name ? 'selected' : ''}`}
                    onClick={() => patch({ community: c.name })}>
                    <div className="creator-card-name">{c.name}</div>
                  </div>
                ))}
              </div>

              {selectedCommunity && (
                <div className="dh-subclass-preview">
                  <div className="dh-feature-tier">
                    <p className="dh-feature-desc" style={{ marginBottom: 8 }}>{selectedCommunity.desc}</p>
                    <span className="dh-tier-label">Community Feature</span>
                    <div className="dh-feature-list">
                      <div className="dh-feature-card">
                        <div className="dh-feature-name">{selectedCommunity.feature.name}</div>
                        <div className="dh-feature-desc">{selectedCommunity.feature.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="creator-section">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="hint-text" style={{ margin: 0 }}>
                  Assign each value from the array to a trait.
                  Array: {DH_TRAIT_ARRAY.map(v => v >= 0 ? `+${v}` : v).join(', ')}
                </p>
                {dhClass?.suggestedTraits && (
                  <button className="io-btn" style={{ flexShrink: 0, marginLeft: 12 }}
                    onClick={() => patch({ traits: { ...dhClass.suggestedTraits } })}>
                    Use Suggested Traits
                  </button>
                )}
              </div>
              <div className="grid-2">
                {DH_TRAITS_ORDER.map(tr => {
                  const remaining = getUnassignedValues();
                  const cur = data.traits[tr];
                  return (
                    <div key={tr} className="field">
                      <label>{DH_TRAIT_LABELS[tr]}</label>
                      <select value={cur ?? ''} onChange={e => {
                        const v = e.target.value === '' ? null : parseInt(e.target.value);
                        patch({ traits: { ...data.traits, [tr]: v } });
                      }}>
                        <option value="">—</option>
                        {DH_TRAIT_ARRAY.filter((v, i, arr) => arr.indexOf(v) === i).map(v => {
                          const inPool = remaining.includes(v) || cur === v;
                          return inPool ? <option key={v} value={v}>{v >= 0 ? `+${v}` : v}</option> : null;
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
              <p className="hint-text" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Assigned: {usedSlots}/{DH_TRAIT_ARRAY.length}
                {nextAttempted && usedSlots < DH_TRAIT_ARRAY.length && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warn)', fontStyle: 'normal' }}>
                    <AlertTriangle size={11} /> Assign all traits first
                  </span>
                )}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="creator-section">
              <p className="hint-text" style={{ marginBottom: 12 }}>
                Add up to 2 Experiences — things your character is especially good at (+2 each).
              </p>
              {data.experiences.map((exp, i) => (
                <div key={i} className="field-row" style={{ marginBottom: 8, alignItems: 'center' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Experience {i + 1}</label>
                    <input value={exp.name}
                      onChange={e => patch({ experiences: data.experiences.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })}
                      placeholder={t('creator.dhBgDescPlaceholder')} />
                  </div>
                  <div className="field" style={{ width: 70 }}>
                    <label>Modifier</label>
                    <input type="number" value={exp.modifier}
                      onChange={e => patch({ experiences: data.experiences.map((x, j) => j === i ? { ...x, modifier: parseInt(e.target.value) || 2 } : x) })} />
                  </div>
                </div>
              ))}
              {data.experiences.length < 4 && (
                <button className="io-btn" style={{ marginTop: 4 }}
                  onClick={() => patch({ experiences: [...data.experiences, { name: '', modifier: 2 }] })}>
                  + Add Experience
                </button>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="creator-section">
              <div className="creator-subtitle">{t('creator.summaryTitle')}</div>
              <div className="identity-info-grid">
                {[
                  ['Name', data.charName],
                  ['Class', dhClass?.name || '—'],
                  ['Subclass', data.charSubclass || '—'],
                  ['Ancestry', ancestryNames],
                  ['Community', data.community || '—'],
                  ['HP', dhClass?.hp ?? 6],
                  ['Evasion', dhClass?.evasion ?? 10],
                ].map(([label, val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <strong style={{ fontSize: 12 }}>Traits:</strong>
                <div className="grid-6" style={{ marginTop: 6 }}>
                  {DH_TRAITS_ORDER.map(tr => (
                    <div key={tr} className="ability-box" style={{ cursor: 'default' }}>
                      <div className="ability-label">{tr}</div>
                      <div className="ability-mod" style={{ cursor: 'default' }}>
                        {(data.traits[tr] ?? 0) >= 0 ? `+${data.traits[tr] ?? 0}` : data.traits[tr]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="creator-footer">
          {step > 0
            ? <button className="io-btn" onClick={() => setStep(s => s - 1)}>{t('creator.back')}</button>
            : <div />
          }
          {step < DH_STEPS.length - 1
            ? <button className="io-btn primary" onClick={() => {
                if (!canNext) { setNextAttempted(true); return; }
                setNextAttempted(false);
                setStep(s => s + 1);
              }}>{t('creator.next')}</button>
            : <button className="io-btn primary" onClick={() => { window.umami?.track('character-created', { system: 'daggerheart', class: data.charClass }); onComplete(buildState()); }}>{t('creator.create')}</button>
          }
        </div>

      </div>
    </div>
  );
}
