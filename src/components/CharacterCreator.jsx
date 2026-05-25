import React, { useState } from 'react';
import { CLASSES, ALIGNMENTS, ABILITIES, ABILITY_NAMES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';

const BACKGROUNDS = [
  { name: 'Accolito',     skills: ['Religione', 'Indagare'] },
  { name: 'Criminale',    skills: ['Inganno', 'Furtività'] },
  { name: 'Eroe Popolare',skills: ['Addestrare animali', 'Sopravvivenza'] },
  { name: 'Nobile',       skills: ['Historia', 'Persuasione'] },
  { name: 'Saggio',       skills: ['Arcano', 'Historia'] },
  { name: 'Soldato',      skills: ['Atletica', 'Intimidire'] },
  { name: 'Eremita',      skills: ['Medicina', 'Religione'] },
  { name: 'Marinaio',     skills: ['Atletica', 'Percezione'] },
  { name: 'Intrattenitore',skills:['Acrobazia', 'Intrattenere'] },
  { name: 'Artigiano',    skills: ['Indagare', 'Persuasione'] },
];

const RACES = [
  { name: 'Umano',       bonuses: { FOR:1,DES:1,COS:1,INT:1,SAG:1,CAR:1 }, traits: ['Versatile: ottieni un talento aggiuntivo al 1° livello'] },
  { name: 'Elfo (Alto)', bonuses: { DES:2, INT:1 }, traits: ['Visione nel buio 18m', 'Sensi acuti (competenza in Percezione)', 'Ascendenza fatata (vantaggio contro incantesimi)'] },
  { name: 'Elfo (Silvano)',bonuses:{ DES:2, SAG:1 }, traits: ['Visione nel buio 18m', 'Sensi acuti', 'Passo furtivo (velocità +3m in terreno naturale)'] },
  { name: 'Nano (Collina)',bonuses:{ COS:2, SAG:1 }, traits: ['Visione nel buio 18m', 'Resistenza nanica (vantaggio TS veleno)', 'Robustezza nanesca (+1 HP per livello)'] },
  { name: 'Nano (Montagna)',bonuses:{FOR:2,COS:2},   traits: ['Visione nel buio 18m', 'Resistenza nanica', 'Addestramento alle armi naniche'] },
  { name: 'Halfling (Pieditozzo)',bonuses:{DES:2,CAR:1},traits:['Fortunato (ritira 1 sui i dadi)', 'Coraggioso (vantaggio contro paura)', 'Agilità halfling (muoversi attraverso spazi di creature più grandi)'] },
  { name: 'Halfling (Selvatico)',bonuses:{DES:2,COS:1},traits:['Fortunato', 'Coraggioso', 'Furtività naturale (può nascondersi dietro creature di taglia M)'] },
  { name: 'Mezzelfo',    bonuses: { CAR:2 }, bonusChoice: 2, traits: ['Visione nel buio 18m', 'Ascendenza fatata', '2 competenze in abilità a scelta'] },
  { name: 'Tiefling',    bonuses: { INT:1, CAR:2 }, traits: ['Visione nel buio 18m', 'Resistenza al fuoco', 'Trucchetti: Thaumaturgia, poi Colpo infuocato e Oscurità'] },
  { name: 'Draconico',   bonuses: { FOR:2, CAR:1 }, traits: ['Visione nel buio 18m', 'Resistenza legata al tipo draconico', 'Soffio dell\'antenato (1× per riposo breve)'] },
];

const CLASS_SAVE_PROFS = {
  Barbaro: ['FOR','COS'], Bardo: ['DES','CAR'], Chierico: ['SAG','CAR'],
  Druido: ['INT','SAG'], Guerriero: ['FOR','COS'], Ladro: ['DES','INT'],
  Mago: ['INT','SAG'], Monaco: ['FOR','DES'], Paladino: ['SAG','CAR'],
  Ranger: ['FOR','DES'], Stregone: ['COS','CAR'], Warlock: ['SAG','CAR'],
};

const CLASS_SKILL_COUNT = {
  Barbaro:2, Bardo:3, Chierico:2, Druido:2, Guerriero:2, Ladro:4,
  Mago:2, Monaco:2, Paladino:2, Ranger:3, Stregone:2, Warlock:2,
};

const CLASS_SKILL_OPTIONS = {
  Barbaro: ['Addestrare animali','Atletica','Intimidire','Natura','Percezione','Sopravvivenza'],
  Bardo: SKILLS.map(s=>s.name),
  Chierico: ['Historia','Indagare','Medicina','Persuasione','Religione'],
  Druido: ['Arcano','Addestrare animali','Indagare','Medicina','Natura','Percezione','Religione','Sopravvivenza'],
  Guerriero: ['Acrobazia','Addestrare animali','Atletica','Historia','Indagare','Intimidire','Percezione','Sopravvivenza'],
  Ladro: ['Acrobazia','Atletica','Inganno','Indagare','Intimidire','Percezione','Persuasione','Furtività','Prestidigitazione'],
  Mago: ['Arcano','Historia','Indagare','Medicina','Religione'],
  Monaco: ['Acrobazia','Atletica','Historia','Indagare','Religione','Furtività'],
  Paladino: ['Atletica','Indagare','Intimidire','Medicina','Persuasione','Religione'],
  Ranger: ['Addestrare animali','Atletica','Indagare','Natura','Percezione','Furtività','Sopravvivenza'],
  Stregone: ['Arcano','Inganno','Indagare','Intimidire','Natura','Persuasione','Religione'],
  Warlock: ['Arcano','Inganno','Historia','Indagare','Intimidire','Natura','Religione'],
};

const STEPS = ['Identità', 'Classe', 'Statistiche', 'Competenze', 'Riepilogo'];

const POINT_BUY_COSTS = { 8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9 };
const POINT_BUY_TOTAL = 27;

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    charName: '', charRace: '', charBackground: '', charAlignment: 'Legale Buono',
    charClass: '',
    abilities: { FOR:8, DES:8, COS:8, INT:8, SAG:8, CAR:8 },
    abilitiesMethod: 'pointbuy',
    saveProficiencies: [],
    skillProficiencies: [],
    charLevel: 1,
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const selectedRace = RACES.find(r => r.name === data.charRace);
  const selectedBg   = BACKGROUNDS.find(b => b.name === data.charBackground);
  const selectedCls  = data.charClass;

  // Point buy helpers
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

  function setStandard() {
    patch({ abilities: { FOR:15, DES:14, COS:13, INT:12, SAG:10, CAR:8 } });
  }

  // Final abilities with race bonuses
  function getFinalAbilities() {
    const base = { ...data.abilities };
    if (selectedRace?.bonuses) {
      Object.entries(selectedRace.bonuses).forEach(([attr, val]) => {
        if (base[attr] !== undefined) base[attr] = Math.min(20, base[attr] + val);
      });
    }
    return base;
  }

  function buildFinalState() {
    const finalAbs = getFinalAbilities();
    const bgSkills = selectedBg?.skills || [];
    const allSkills = [...new Set([...bgSkills, ...data.skillProficiencies])];
    const saveProficiencies = CLASS_SAVE_PROFS[selectedCls] || [];
    return {
      charName: data.charName,
      charClass: data.charClass,
      charRace: data.charRace,
      charBackground: data.charBackground,
      charAlignment: data.charAlignment,
      charLevel: 1,
      abilities: finalAbs,
      saveProficiencies,
      skillProficiencies: allSkills,
      skillExpertise: [],
      hpCurrent: calcHP(finalAbs, data.charClass),
      hpMax: calcHP(finalAbs, data.charClass),
      ac: 10 + Math.floor((finalAbs.DES - 10) / 2),
      speed: '9m',
    };
  }

  function calcHP(abs, cls) {
    const hd = HIT_DICE[cls] || 'd8';
    const conMod = Math.floor((abs.COS - 10) / 2);
    const hdMax = parseInt(hd.replace('d', ''));
    return hdMax + conMod;
  }

  const canNextStep = [
    data.charName && data.charRace && data.charBackground,
    !!data.charClass,
    true,
    true,
    true,
  ][step];

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        {/* Header */}
        <div className="creator-header">
          <div className="creator-title">⚔ Crea personaggio</div>
          <button className="creator-close" onClick={onCancel}>✕</button>
        </div>

        {/* Step bar */}
        <div className="creator-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`creator-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="creator-step-dot">{i < step ? '✓' : i + 1}</div>
              <div className="creator-step-label">{s}</div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="creator-body">

          {/* STEP 0 — Identità */}
          {step === 0 && (
            <div className="creator-section">
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Nome personaggio</label>
                <input value={data.charName} onChange={e => patch({ charName: e.target.value })} placeholder="Es. Aldric Voss" autoFocus />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Allineamento</label>
                <select value={data.charAlignment} onChange={e => patch({ charAlignment: e.target.value })}>
                  {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div className="creator-subtitle">Razza / Specie</div>
              <div className="creator-grid">
                {RACES.map(r => (
                  <div
                    key={r.name}
                    className={`creator-card ${data.charRace === r.name ? 'selected' : ''}`}
                    onClick={() => patch({ charRace: r.name })}
                  >
                    <div className="creator-card-name">{r.name}</div>
                    <div className="creator-card-sub">
                      {Object.entries(r.bonuses).map(([a, v]) => `${a} +${v}`).join(', ')}
                      {r.bonusChoice ? ` + ${r.bonusChoice} a scelta` : ''}
                    </div>
                    {data.charRace === r.name && (
                      <div className="creator-traits">
                        {r.traits.map((t, i) => <div key={i} className="creator-trait">• {t}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="creator-subtitle" style={{ marginTop: 16 }}>Background</div>
              <div className="creator-grid">
                {BACKGROUNDS.map(b => (
                  <div
                    key={b.name}
                    className={`creator-card ${data.charBackground === b.name ? 'selected' : ''}`}
                    onClick={() => patch({ charBackground: b.name })}
                  >
                    <div className="creator-card-name">{b.name}</div>
                    <div className="creator-card-sub">Competenze: {b.skills.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Classe */}
          {step === 1 && (
            <div className="creator-section">
              <div className="creator-subtitle">Scegli la tua classe</div>
              <div className="creator-grid">
                {CLASSES.map(cls => (
                  <div
                    key={cls}
                    className={`creator-card ${data.charClass === cls ? 'selected' : ''}`}
                    onClick={() => patch({ charClass: cls })}
                  >
                    <div className="creator-card-name">{cls}</div>
                    <div className="creator-card-sub">
                      {HIT_DICE[cls] || 'd8'} HP
                      {SPELLCASTING_CLASS[cls] ? ` · Incantatore (${SPELLCASTING_CLASS[cls]})` : ''}
                    </div>
                    {data.charClass === cls && (
                      <div className="creator-traits">
                        <div className="creator-trait">• Tiri salvezza: {(CLASS_SAVE_PROFS[cls] || []).join(', ')}</div>
                        <div className="creator-trait">• Competenze abilità: {CLASS_SKILL_COUNT[cls] || 2} a scelta</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Statistiche */}
          {step === 2 && (
            <div className="creator-section">
              <div className="creator-method-bar">
                {[['pointbuy','Point Buy'],['standard','Array standard'],['roll','Lancia i dadi']].map(([v,l]) => (
                  <button
                    key={v}
                    className={`filter-chip ${data.abilitiesMethod === v ? 'active' : ''}`}
                    onClick={() => {
                      patch({ abilitiesMethod: v });
                      if (v === 'standard') setStandard();
                      if (v === 'roll') rollStats();
                      if (v === 'pointbuy') patch({ abilities: { FOR:8,DES:8,COS:8,INT:8,SAG:8,CAR:8 } });
                    }}
                  >
                    {l}
                  </button>
                ))}
                {data.abilitiesMethod === 'roll' && (
                  <button className="filter-chip" onClick={rollStats}>🎲 Rilancia</button>
                )}
              </div>

              {data.abilitiesMethod === 'pointbuy' && (
                <div className="creator-pb-info">
                  Punti rimasti: <strong>{pointsLeft}</strong> / {POINT_BUY_TOTAL}
                  {pointsLeft < 0 && <span style={{ color: '#A32D2D' }}> — troppi punti spesi!</span>}
                </div>
              )}

              <div className="creator-abilities">
                {ABILITIES.map(attr => {
                  const base = data.abilities[attr];
                  const raceMod = selectedRace?.bonuses?.[attr] || 0;
                  const final = Math.min(20, base + raceMod);
                  const mod = Math.floor((final - 10) / 2);
                  const fmtMod = mod >= 0 ? `+${mod}` : `${mod}`;
                  return (
                    <div key={attr} className="creator-ability-row">
                      <div className="creator-ability-name">{ABILITY_NAMES[attr]}</div>
                      <div className="creator-ability-controls">
                        {data.abilitiesMethod === 'pointbuy' ? (
                          <>
                            <button className="mod-btn" onClick={() => adjPointBuy(attr, -1)}>−</button>
                            <span className="creator-ability-val">{base}</span>
                            <button className="mod-btn" onClick={() => adjPointBuy(attr, 1)}>+</button>
                          </>
                        ) : (
                          <input
                            className="ability-score-input"
                            type="number" min="3" max="18"
                            value={base}
                            onChange={e => patch({ abilities: { ...data.abilities, [attr]: parseInt(e.target.value) || 8 } })}
                          />
                        )}
                      </div>
                      {raceMod !== 0 && (
                        <div className="creator-race-bonus">+{raceMod} razza</div>
                      )}
                      <div className="creator-ability-final">
                        <span className="creator-ability-total">{final}</span>
                        <span className="creator-ability-mod">{fmtMod}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Competenze */}
          {step === 3 && (
            <div className="creator-section">
              {selectedBg && (
                <div className="creator-info-box">
                  <strong>Background {data.charBackground}:</strong> competenze automatiche in {selectedBg.skills.join(' e ')}.
                </div>
              )}
              <div className="creator-subtitle">
                Scegli {CLASS_SKILL_COUNT[selectedCls] || 2} abilità di classe
                ({data.skillProficiencies.length}/{CLASS_SKILL_COUNT[selectedCls] || 2} selezionate)
              </div>
              <div className="check-list">
                {(CLASS_SKILL_OPTIONS[selectedCls] || []).map(sk => {
                  const fromBg = selectedBg?.skills.includes(sk);
                  const selected = data.skillProficiencies.includes(sk);
                  const maxReached = data.skillProficiencies.length >= (CLASS_SKILL_COUNT[selectedCls] || 2);
                  return (
                    <div
                      key={sk}
                      className={`check-item ${fromBg ? 'bg-skill' : ''}`}
                      onClick={() => {
                        if (fromBg) return;
                        if (selected) patch({ skillProficiencies: data.skillProficiencies.filter(s => s !== sk) });
                        else if (!maxReached) patch({ skillProficiencies: [...data.skillProficiencies, sk] });
                      }}
                      style={{ opacity: !selected && maxReached && !fromBg ? 0.4 : 1 }}
                    >
                      <div className={`check-dot ${fromBg ? 'proficient' : selected ? 'proficient' : ''}`} />
                      <span className="check-name">{sk}</span>
                      {fromBg && <span className="check-attr">background</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Riepilogo */}
          {step === 4 && (() => {
            const final = getFinalAbilities();
            const hp = calcHP(final, selectedCls);
            const conMod = Math.floor((final.COS - 10) / 2);
            return (
              <div className="creator-section">
                <div className="creator-summary">
                  <div className="creator-summary-name">{data.charName || '—'}</div>
                  <div className="creator-summary-sub">
                    {data.charRace} · {selectedCls} · {data.charBackground}
                  </div>
                  <div className="creator-summary-sub" style={{ marginTop: 2 }}>{data.charAlignment}</div>

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

                  <div className="creator-summary-row">
                    <span>HP massimi</span>
                    <strong>{hp} ({HIT_DICE[selectedCls]}+{conMod} COS)</strong>
                  </div>
                  <div className="creator-summary-row">
                    <span>Tiri salvezza</span>
                    <strong>{(CLASS_SAVE_PROFS[selectedCls] || []).join(', ')}</strong>
                  </div>
                  <div className="creator-summary-row">
                    <span>Competenze abilità</span>
                    <strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].join(', ') || '—'}</strong>
                  </div>
                  {SPELLCASTING_CLASS[selectedCls] && (
                    <div className="creator-summary-row">
                      <span>Incantatore</span>
                      <strong>Sì ({SPELLCASTING_CLASS[selectedCls]})</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="creator-footer">
          <button className="io-btn" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
            {step === 0 ? 'Annulla' : '← Indietro'}
          </button>
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button
              className={`io-btn primary ${!canNextStep ? 'disabled' : ''}`}
              onClick={() => canNextStep && setStep(s => s + 1)}
            >
              Avanti →
            </button>
          ) : (
            <button className="io-btn primary" onClick={() => onComplete(buildFinalState())}>
              ✓ Crea personaggio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
