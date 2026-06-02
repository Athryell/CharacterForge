import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ALIGNMENTS, ABILITIES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';
import { CLASS_FEATURES, SPECIES_FEATURES, BACKGROUND_FEATURES, getAutoFeatures } from '../data/features';
import { CLASS_SAVE_PROFS, CLASS_SKILL_COUNT, CLASS_SKILL_OPTIONS } from '../data/srd/classes';
import dataManager from '../data/dataManager';

// SRD 5.5e (2024) — specie: solo tratti, nessun bonus caratteristica
const SPECIES_SRD = [
  { id: 'human',      name: 'Human',      traits: ['Versatile: 1 talento Origin a scelta al 1° livello', 'Eroico: vantaggio ai TS contro paura'] },
  { id: 'elf',        name: 'Elf',        traits: ['Visione nel buio 18 m', 'Sensi acuti (comp. Percezione)', 'Ascendenza fatata (vantaggio TS contro magie)', 'Passo fatato (teletrasporto 9 m, usi = bonus comp.)'] },
  { id: 'dwarf',      name: 'Dwarf',      traits: ['Visione nel buio 18 m', 'Resistenza nanica (vantaggio TS veleno, immunità avvelenamento)', 'Tempra nanica', 'Competenza armi da guerra e armature medie'] },
  { id: 'halfling',   name: 'Halfling',   traits: ['Fortunato (ritira i risultati di 1)', 'Coraggioso (vantaggio TS contro paura)', 'Agilità halfling (muoversi nello spazio di creature più grandi)'] },
  { id: 'gnome',      name: 'Gnome',      traits: ['Visione nel buio 18 m', 'Furbizia gnoma (vantaggio TS INT/WIS/CHA contro magie)', 'Competenza con strumenti artigianali'] },
  { id: 'dragonborn', name: 'Dragonborn', traits: ['Soffio (azione, scala con livello)', 'Resistenza al danno del tipo draconico', 'Visione nel buio 18 m'] },
  { id: 'tiefling',   name: 'Tiefling',   traits: ['Visione nel buio 18 m', 'Resistenza al fuoco', 'Retaggio infernale: Thaumaturgia, Colpo infuocato (liv. 3), Oscurità (liv. 5)'] },
  { id: 'aasimar',    name: 'Aasimar',    traits: ['Visione nel buio 18 m', 'Guarigione celeste (PF extra a riposo lungo = bonus prof.)', 'Forma celeste: ali luminose o forma fiamma (1 min, 1× riposo lungo)'] },
  { id: 'orc',        name: 'Orc',        traits: ['Visione nel buio 18 m', 'Spietato (azione bonus: vantaggio al prossimo attacco nel turno)', 'Resistenza (PF extra pari al livello)'] },
  { id: 'goliath',    name: 'Goliath',    traits: ['Resistenza al freddo', 'Possanza gigante (taglia Grande, oggetti extra-pesanti)', 'Forma gigante: STR o CON Primordiale (1× riposo lungo)'] },
];


// CLASS_SAVE_PROFS, CLASS_SKILL_COUNT, CLASS_SKILL_OPTIONS → importati da src/data/srd/classes.js

// STEPS is computed inside the component to support i18n

const POINT_BUY_COSTS = { 8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9 };
const POINT_BUY_TOTAL = 27;

const CUSTOM_SENTINEL = '__custom__';

export default function CharacterCreator({ onComplete, onCancel, systemId = 'dnd5e' }) {
  const { t } = useTranslation();
  const STEPS = [
    t('creator.steps.identity'),
    t('creator.steps.class'),
    t('creator.steps.stats'),
    t('creator.steps.proficiencies'),
    t('creator.steps.summary'),
  ];
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    charName: '', charRace: '', charBackground: '', charAlignment: 'Lawful Good',
    charClass: '',
    abilities: { STR:8, DEX:8, CON:8, INT:8, WIS:8, CHA:8 },
    abilitiesMethod: 'pointbuy',
    saveProficiencies: [],
    skillProficiencies: [],
    charLevel: 1,
    bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 },
    customSpecies: '',
    customBackground: '',
    customClass: '',
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const allBackgrounds = dataManager.getBackgrounds();
  const speciesList = [...SPECIES_SRD, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.speciesCustom', 'Custom...') }];
  const bgList      = [...allBackgrounds, { id: CUSTOM_SENTINEL, name: CUSTOM_SENTINEL, label: t('identity.backgroundCustom', 'Custom...') }];
  const classList   = [...dataManager.getClasses(), CUSTOM_SENTINEL];

  const selectedBg  = data.charBackground === CUSTOM_SENTINEL ? null : allBackgrounds.find(b => (b.id || b.name) === data.charBackground);
  const selectedCls = data.charClass === CUSTOM_SENTINEL ? data.customClass : data.charClass;

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

  function getFinalAbilities() {
    const base = { ...data.abilities };
    Object.entries(data.bgAsi).forEach(([attr, bonus]) => {
      if (bonus > 0) base[attr] = Math.min(20, (base[attr] || 10) + bonus);
    });
    return base;
  }

  function calcHP(abs, cls) {
    const hd = HIT_DICE[cls] || 'd8';
    const conMod = Math.floor((abs.CON - 10) / 2);
    return parseInt(hd.replace('d', '')) + conMod;
  }

  function buildFinalState() {
    const finalAbs = getFinalAbilities();
    const bgSkills = selectedBg?.skills || [];
    const allSkills = [...new Set([...bgSkills, ...data.skillProficiencies])];
    const raceName = data.charRace === CUSTOM_SENTINEL ? '' : data.charRace;
    const bgName = data.charBackground === CUSTOM_SENTINEL ? '' : data.charBackground;
    const classFeats = getAutoFeatures('class', selectedCls, CLASS_FEATURES);
    const speciesFeats = raceName ? getAutoFeatures('species', raceName, SPECIES_FEATURES) : [];
    const bgFeats = bgName ? getAutoFeatures('background', bgName, BACKGROUND_FEATURES) : [];
    return {
      system: systemId,
      charName: data.charName,
      charClass: selectedCls,
      charRace: data.charRace === CUSTOM_SENTINEL ? data.customSpecies : data.charRace,
      charBackground: data.charBackground === CUSTOM_SENTINEL ? data.customBackground : data.charBackground,
      charAlignment: data.charAlignment,
      charLevel: 1,
      abilities: finalAbs,
      saveProficiencies: CLASS_SAVE_PROFS[selectedCls] || [],
      skillProficiencies: allSkills,
      skillExpertise: [],
      features: [...classFeats, ...speciesFeats, ...bgFeats],
      hpCurrent: calcHP(finalAbs, selectedCls),
      hpMax: calcHP(finalAbs, selectedCls),
      ac: 10 + Math.floor((finalAbs.DEX - 10) / 2),
      speed: '30ft',
    };
  }

  const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || '') : (data.charRace ? t(`data.species.${data.charRace}`, data.charRace) : '');
  const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || '') : (data.charBackground ? t(`data.backgrounds.${data.charBackground}`, data.charBackground) : '');
  const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || '') : (data.charClass ? t(`data.classes.${data.charClass}`, data.charClass) : '');

  const canNextStep = [
    data.charName && data.charRace && data.charBackground &&
      (data.charRace !== CUSTOM_SENTINEL || data.customSpecies) &&
      (data.charBackground !== CUSTOM_SENTINEL || data.customBackground),
    data.charClass && (data.charClass !== CUSTOM_SENTINEL || data.customClass),
    true, true, true,
  ][step];

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">{t('creator.title')}</div>
          <button className="creator-close" onClick={onCancel}>✕</button>
        </div>

        <div className="creator-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`creator-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < step ? '✓' : i + 1}</div>
              <div className="creator-step-label">{s}</div>
            </div>
          ))}
        </div>

        <div className="creator-body">

          {/* ── STEP 0 — Identità ── */}
          {step === 0 && (
            <div className="creator-section">
              <div className="field" style={{ marginBottom: 12 }}>
                <label>{t('creator.nameLabel')}</label>
                <input value={data.charName} onChange={e => patch({ charName: e.target.value })} placeholder="Es. Aldric Voss" autoFocus />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>{t('identity.alignment')}</label>
                <select value={data.charAlignment} onChange={e => patch({ charAlignment: e.target.value })}>
                  {ALIGNMENTS.map(a => <option key={a} value={a}>{t(`data.alignments.${a}`, a)}</option>)}
                </select>
              </div>

              {/* SPECIE */}
              <div className="creator-subtitle">{t('creator.speciesTitle')}</div>
              <div className="creator-grid">
                {speciesList.map(r => {
                  const isCustom = (r.id || r.name) === CUSTOM_SENTINEL;
                  const selected = data.charRace === (r.id || r.name);
                  return (
                    <div key={r.name} className={`creator-card ${selected ? 'selected' : ''}`} onClick={() => patch({ charRace: r.id || r.name })}>
                      <div className="creator-card-name">{isCustom ? r.label : t(`data.species.${r.id || r.name}`, r.name)}</div>
                      {isCustom && selected && (
                        <input className="creator-custom-input" value={data.customSpecies}
                          onChange={e => { e.stopPropagation(); patch({ customSpecies: e.target.value }); }}
                          onClick={e => e.stopPropagation()} placeholder="Nome specie..." autoFocus />
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          {r.traits.map((t, i) => <div key={i} className="creator-trait">• {t}</div>)}
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
                      onClick={() => patch({ charBackground: b.id || b.name, bgAsi: { STR:0, DEX:0, CON:0, INT:0, WIS:0, CHA:0 } })}>
                      <div className="creator-card-name">{isCustom ? b.label : t(`data.backgrounds.${b.id || b.name}`, b.name)}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {b.skills.map(s => t(`data.skills.${s}`, s)).join(', ')} · {b.feat}
                        </div>
                      )}
                      {isCustom && selected && (
                        <input className="creator-custom-input" value={data.customBackground}
                          onChange={e => { e.stopPropagation(); patch({ customBackground: e.target.value }); }}
                          onClick={e => e.stopPropagation()} placeholder="Nome background..." autoFocus />
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait" style={{ fontStyle:'italic', marginBottom:4 }}>{b.desc}</div>
                          <div className="creator-trait">🗡 Strumento: {b.tool}</div>
                          <div className="creator-trait">🎒 A: {b.equipA}</div>
                          <div className="creator-trait">🎒 B: {b.equipB}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ASI dal background */}
              {data.charBackground && data.charBackground !== CUSTOM_SENTINEL && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>{t('creator.bgAsiLabel')}</strong>
                  {selectedBg?.abilityScores && (
                    <span style={{ color:'var(--c-muted)', marginLeft:6 }}>
                      {t('creator.bgAsiRecommended')} {selectedBg.abilityScores.map(a => t(`data.abilities.${a}`)).join(', ')}
                    </span>
                  )}
                  {(() => {
                    const total = Object.values(data.bgAsi).reduce((s,v) => s+v, 0);
                    return (
                      <div style={{ marginTop:8 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px 12px' }}>
                          {ABILITIES.map(a => {
                            const val = data.bgAsi[a];
                            const recommended = selectedBg?.abilityScores?.includes(a);
                            return (
                              <div key={a} style={{ display:'flex', alignItems:'center', gap:4 }}>
                                <span style={{ fontSize:11, minWidth:32, color: recommended ? 'var(--c-accent)' : 'var(--c-muted)', fontWeight: recommended ? 600 : 400 }}>
                                  {t(`data.abilityAbbr.${a}`, a)}{recommended ? '★' : ''}
                                </span>
                                <button className="mod-btn" style={{ fontSize:11, padding:'1px 6px' }}
                                  onClick={() => val > 0 && patch({ bgAsi: { ...data.bgAsi, [a]: val - 1 } })}>−</button>
                                <span style={{ minWidth:22, textAlign:'center', fontSize:12, fontWeight:600, color: val > 0 ? 'var(--c-accent)' : 'var(--c-muted)' }}>
                                  {val > 0 ? `+${val}` : '0'}
                                </span>
                                <button className="mod-btn" style={{ fontSize:11, padding:'1px 6px' }}
                                  onClick={() => (val < 2 && total < 3) && patch({ bgAsi: { ...data.bgAsi, [a]: val + 1 } })}>+</button>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ marginTop:6, fontSize:11, color: total === 3 ? 'var(--c-accent)' : 'var(--c-muted)' }}>
                          {t('creator.bgAsiTotal', { total })} {total === 3 ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1 — Classe ── */}
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
                        <input className="creator-custom-input" value={data.customClass}
                          onChange={e => { e.stopPropagation(); patch({ customClass: e.target.value }); }}
                          onClick={e => e.stopPropagation()} placeholder="Nome classe..." autoFocus />
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait">• {t('creator.summarySavingThrows')}: {(CLASS_SAVE_PROFS[cls] || []).map(a => t(`data.abilityAbbr.${a}`, a)).join(', ')}</div>
                          <div className="creator-trait">• Abilità: {CLASS_SKILL_COUNT[cls] || 2} a scelta</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                  <strong>{selectedBg ? t(`data.backgrounds.${data.charBackground}`, data.charBackground) : data.charBackground}:</strong> comp. automatiche in {selectedBg.skills.map(s => t(`data.skills.${s}`, s)).join(' e ')}.
                  {selectedBg.tool && <> · Strumento: {selectedBg.tool}.</>}
                  {selectedBg.feat && <> · Talento Origin: <strong>{selectedBg.feat}</strong>.</>}
                </div>
              )}
              <div className="creator-subtitle">
                {t('creator.profTitle', { count: CLASS_SKILL_COUNT[selectedCls] || 2 })}
                {' '}{t('creator.profSelected', { selected: data.skillProficiencies.length, max: CLASS_SKILL_COUNT[selectedCls] || 2 })}
              </div>
              <div className="check-list">
                {(CLASS_SKILL_OPTIONS[selectedCls] || SKILLS.map(s => s.id)).map(sk => {
                  const fromBg = selectedBg?.skills?.includes(sk);
                  const selected = data.skillProficiencies.includes(sk);
                  const maxReached = data.skillProficiencies.length >= (CLASS_SKILL_COUNT[selectedCls] || 2);
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
            const hp = calcHP(final, selectedCls);
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
                  <div className="creator-summary-row"><span>{t('creator.summaryMaxHP')}</span><strong>{hp} ({HIT_DICE[selectedCls] || 'd8'}+{conMod} CON)</strong></div>
                  <div className="creator-summary-row"><span>{t('creator.summarySavingThrows')}</span><strong>{(CLASS_SAVE_PROFS[selectedCls] || []).map(a => t(`data.abilityAbbr.${a}`, a)).join(', ') || '—'}</strong></div>
                  <div className="creator-summary-row"><span>{t('creator.summaryProficiencies')}</span><strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].map(s => t(`data.skills.${s}`, s)).join(', ') || '—'}</strong></div>
                  {selectedBg && <>
                    <div className="creator-summary-row"><span>{t('creator.summaryOriginFeat')}</span><strong>{selectedBg.feat}</strong></div>
                    <div className="creator-summary-row"><span>{t('creator.summaryTool')}</span><strong>{selectedBg.tool}</strong></div>
                  </>}
                  {Object.values(data.bgAsi).some(v => v > 0) && (
                    <div className="creator-summary-row">
                      <span>{t('creator.summaryBgBonus')}</span>
                      <strong>{Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${a}`).join(', ')}</strong>
                    </div>
                  )}
                  {SPELLCASTING_CLASS[selectedCls] && (
                    <div className="creator-summary-row"><span>{t('creator.summarySpellcaster')}</span><strong>Yes ({t(`data.abilityAbbr.${SPELLCASTING_CLASS[selectedCls]}`, SPELLCASTING_CLASS[selectedCls])})</strong></div>
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
            <button className={`io-btn primary ${!canNextStep ? 'disabled' : ''}`}
              onClick={() => canNextStep && setStep(s => s + 1)}>{t('creator.next')}</button>
          ) : (
            <button className="io-btn primary" onClick={() => onComplete(buildFinalState())}>{t('creator.create')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
