import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../config/icons';
import { DH_ANCESTRIES, DH_COMMUNITIES, DH_TRAIT_ARRAY, createDHDefaultState, getDHProficiency } from '../../data/systems/daggerheart/mechanics';
import { DH_CLASSES } from '../../data/systems/daggerheart/classes';

const DH_TRAITS_ORDER = ['AGI','STR','FIN','INS','PRE','KNO'];
const DH_TRAIT_LABELS = { AGI:'Agility', STR:'Strength', FIN:'Finesse', INS:'Instinct', PRE:'Presence', KNO:'Knowledge' };

export default function DHCharacterCreator({ onComplete, onCancel }) {
  const { t } = useTranslation();
  const DH_STEPS = ['Identity','Origin','Traits','Experiences','Summary'];
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    charName: '',
    charClass: '',
    charSubclass: '',
    ancestry: '',
    community: '',
    traits: { AGI:null, STR:null, FIN:null, INS:null, PRE:null, KNO:null },
    experiences: [{ name:'', modifier:2 }, { name:'', modifier:2 }],
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

  const canNext = [
    !!data.charName && !!data.charClass,
    !!data.ancestry && !!data.community,
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
      ancestry: data.ancestry,
      community: data.community,
      charLevel: 1,
      proficiency: getDHProficiency(1),
      traits: { ...data.traits },
      evasion: cls?.evasion ?? 10,
      hpCurrent: cls?.hp ?? 6,
      hpMax: cls?.hp ?? 6,
      stressCurrent: 0,
      stressMax: cls?.stress ?? 6,
      experiences: data.experiences.filter(e => e.name),
    };
  }

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">🗡 Create Character</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="creator-steps">
          {DH_STEPS.map((s, i) => (
            <div key={i} className={`creator-step ${i===step?'active':''} ${i<step?'done':''}`}>
              <div className="creator-step-dot">{i < step ? <Icon id="action.done" size={12} /> : i + 1}</div>
              <div className="creator-step-label">{s}</div>
            </div>
          ))}
        </div>

        <div className="creator-body">

          {step === 0 && (
            <div className="creator-section">
              <div className="field" style={{ marginBottom:12 }}>
                <label>{t('creator.nameLabel')}</label>
                <input value={data.charName} onChange={e => patch({ charName:e.target.value })} placeholder="Es. Rael Ashborn" autoFocus />
              </div>
              <div className="creator-subtitle">Class</div>
              <div className="creator-grid">
                {DH_CLASSES.map(cls => (
                  <div key={cls.id} className={`creator-card ${data.charClass===cls.id?'selected':''}`}
                    onClick={() => patch({ charClass:cls.id, charSubclass:'' })}>
                    <div className="creator-card-name">{cls.name}</div>
                    <div className="creator-card-desc" style={{ fontSize:11, color:'var(--c-muted)' }}>
                      {cls.domains.join(' · ')} · HP {cls.hp} · Evasion {cls.evasion}
                    </div>
                  </div>
                ))}
              </div>
              {dhClass && (
                <div style={{ marginTop:12 }}>
                  <div className="creator-subtitle">Subclass</div>
                  <div className="creator-grid">
                    {dhClass.subclasses.map(sc => (
                      <div key={sc} className={`creator-card ${data.charSubclass===sc?'selected':''}`}
                        onClick={() => patch({ charSubclass:sc })}>
                        <div className="creator-card-name">{sc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="creator-section">
              <div className="creator-subtitle">Ancestry</div>
              <div className="creator-grid">
                {DH_ANCESTRIES.map(a => (
                  <div key={a} className={`creator-card ${data.ancestry===a?'selected':''}`}
                    onClick={() => patch({ ancestry:a })}>
                    <div className="creator-card-name">{a}</div>
                  </div>
                ))}
              </div>
              <div className="creator-subtitle" style={{ marginTop:16 }}>Community</div>
              <div className="creator-grid">
                {DH_COMMUNITIES.map(c => (
                  <div key={c} className={`creator-card ${data.community===c?'selected':''}`}
                    onClick={() => patch({ community:c })}>
                    <div className="creator-card-name">{c}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="creator-section">
              <p className="hint-text" style={{ marginBottom:12 }}>
                Assign each value from the array to a trait.
                Array: {DH_TRAIT_ARRAY.map(v => v>=0?`+${v}`:v).join(', ')}
              </p>
              <div className="grid-2">
                {DH_TRAITS_ORDER.map(tr => {
                  const remaining = getUnassignedValues();
                  const cur = data.traits[tr];
                  return (
                    <div key={tr} className="field">
                      <label>{DH_TRAIT_LABELS[tr]}</label>
                      <select value={cur ?? ''} onChange={e => {
                        const v = e.target.value === '' ? null : parseInt(e.target.value);
                        patch({ traits: { ...data.traits, [tr]:v } });
                      }}>
                        <option value="">—</option>
                        {DH_TRAIT_ARRAY.filter((v, i, arr) => arr.indexOf(v)===i).map(v => {
                          const inPool = remaining.includes(v) || cur===v;
                          return inPool ? <option key={v} value={v}>{v>=0?`+${v}`:v}</option> : null;
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
              <p className="hint-text" style={{ marginTop:8 }}>
                Assigned: {usedSlots}/{DH_TRAIT_ARRAY.length}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="creator-section">
              <p className="hint-text" style={{ marginBottom:12 }}>
                Add up to 2 Experiences — things your character is especially good at (+2 each).
              </p>
              {data.experiences.map((exp, i) => (
                <div key={i} className="field-row" style={{ marginBottom:8, alignItems:'center' }}>
                  <div className="field" style={{ flex:1 }}>
                    <label>Experience {i+1}</label>
                    <input value={exp.name} onChange={e => patch({ experiences: data.experiences.map((x,j) => j===i?{...x,name:e.target.value}:x) })}
                      placeholder="e.g. Former soldier, Herbalist..." />
                  </div>
                  <div className="field" style={{ width:70 }}>
                    <label>Modifier</label>
                    <input type="number" value={exp.modifier} onChange={e => patch({ experiences: data.experiences.map((x,j) => j===i?{...x,modifier:parseInt(e.target.value)||2}:x) })} />
                  </div>
                </div>
              ))}
              {data.experiences.length < 4 && (
                <button className="io-btn" style={{ marginTop:4 }} onClick={() => patch({ experiences:[...data.experiences,{name:'',modifier:2}] })}>+ Add Experience</button>
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
                  ['Ancestry', data.ancestry],
                  ['Community', data.community],
                  ['HP', dhClass?.hp ?? 6],
                  ['Evasion', dhClass?.evasion ?? 10],
                ].map(([label, val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12 }}>
                <strong style={{ fontSize:12 }}>Traits:</strong>
                <div className="grid-6" style={{ marginTop:6 }}>
                  {DH_TRAITS_ORDER.map(tr => (
                    <div key={tr} className="ability-box" style={{ cursor:'default' }}>
                      <div className="ability-label">{tr}</div>
                      <div className="ability-mod" style={{ cursor:'default' }}>
                        {(data.traits[tr]??0)>=0?`+${data.traits[tr]??0}`:data.traits[tr]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="creator-footer">
          <button className="io-btn" onClick={onCancel}>{t('creator.cancel')}</button>
          {step > 0 && <button className="io-btn" onClick={() => setStep(s => s-1)}>{t('creator.back')}</button>}
          {step < DH_STEPS.length-1
            ? <button className={`io-btn primary ${!canNext ? 'disabled' : ''}`} onClick={() => canNext && setStep(s => s+1)}>{t('creator.next')}</button>
            : <button className="io-btn primary" onClick={() => { window.umami?.track('character-created', { system: 'daggerheart', class: data.charClass }); onComplete(buildState()); }}>{t('creator.create')}</button>
          }
        </div>

      </div>
    </div>
  );
}
