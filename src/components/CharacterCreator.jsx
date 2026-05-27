import React, { useState } from 'react';
import { CLASSES, ALIGNMENTS, ABILITIES, ABILITY_NAMES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';

// SRD 5.5e (2024) — specie: nessun bonus caratteristica, solo tratti
const SPECIES_SRD = [
  { name: 'Umano',      traits: ['Versatile: 1 talento a scelta (Origin)', 'Eroico: vantaggio ai TS contro effetti di paura'] },
  { name: 'Elfo',       traits: ['Visione nel buio 18 m', 'Sensi acuti (comp. Percezione)', 'Ascendenza fatata (vantaggio TS contro incantesimi)', 'Passo fatato (teletrasporto 9 m, usi = bonus comp.)'] },
  { name: 'Nano',       traits: ['Visione nel buio 18 m', 'Resistenza nanica (vantaggio TS veleno)', 'Tempra nanica (immunità al veleno)', 'Competenza con armi da guerra naniche e armature medie'] },
  { name: 'Halfling',   traits: ['Fortunato (ritira i risultati di 1)', 'Coraggioso (vantaggio TS contro paura)', 'Agilità halfling (passa negli spazi di creature più grandi)'] },
  { name: 'Gnomo',      traits: ['Visione nel buio 18 m', 'Furbizia gnoma (vantaggio TS INT/SAG/CAR contro magie)', 'Competenza con strumenti artigianali'] },
  { name: 'Dragonide', traits: ['Soffio (azione; tiro salvezza COS CD 8+prof+FOR/COS; danni 1d10/punto, scala)', 'Resistenza al tipo draconico', 'Visione nel buio 18 m'] },
  { name: 'Tiefling',  traits: ['Visione nel buio 18 m', 'Resistenza al fuoco', 'Retaggio infernale: Thaumaturgia (a piacere), Colpo infuocato (livello 3), Oscurità (livello 5)'] },
  { name: 'Aasimar',   traits: ['Visione nel buio 18 m', 'Guarigione celeste (bonus prof. PF extra a riposo lungo)', 'Forma celeste (azione bonus; ali luminose o forma fiamma per 1 min, 1×riposo lungo)'] },
  { name: 'Orco',      traits: ['Visione nel buio 18 m', 'Spietato (azione bonus: vantaggio al prossimo tiro attacco nel turno)', 'Resistenza (punti PF extra = livello)'] },
  { name: 'Goliath',   traits: ['Resistenza ai danni da freddo', 'Possanza gigante (dimensione grande, oggetti extra-pesanti)', 'Forma gigante (1× riposo lungo: STR Primordiale o CON Primordiale)'] },
];

// SRD 5.5e (2024) — background: +2 a una stat, +1 a un'altra (a scelta del giocatore); 2 skill; 1 tool; 1 feat Origin
const BACKGROUNDS_SRD = [
  { name: 'Accolito',         skills: ['Intuizione','Religione'],         tool: 'Strumento calligrafico', feat: 'Guaritore' },
  { name: 'Artigiano',        skills: ['Indagare','Persuasione'],         tool: 'Attrezzi da artigiano',  feat: 'Fabbricante' },
  { name: 'Impostore',        skills: ['Inganno','Prestidigitazione'],    tool: 'Kit da travestimento',   feat: 'Attore' },
  { name: 'Criminale',        skills: ['Furtività','Inganno'],            tool: 'Attrezzi da ladro',      feat: 'Scaltro' },
  { name: 'Intrattenitore',   skills: ['Acrobazia','Intrattenere'],       tool: 'Strumento musicale',     feat: 'Atletico' },
  { name: 'Contadino',        skills: ['Addestrare animali','Natura'],    tool: 'Attrezzi da artigiano',  feat: 'Tenace' },
  { name: 'Guardia',          skills: ['Atletica','Percezione'],          tool: 'Strumento musicale',     feat: 'Allerta' },
  { name: 'Guida',            skills: ['Atletica','Sopravvivenza'],       tool: 'Kit cartografico',       feat: 'Prodigio magico' },
  { name: 'Eremita',          skills: ['Medicina','Religione'],           tool: 'Kit da erborista',       feat: 'Guaritore' },
  { name: 'Mercante',         skills: ['Addestrare animali','Persuasione'],tool:'Kit da navigatore',      feat: 'Scaltro' },
  { name: 'Nobile',           skills: ['Historia','Persuasione'],         tool: 'Strumento da gioco',     feat: 'Scaltro' },
  { name: 'Saggio',           skills: ['Arcano','Historia'],              tool: 'Strumento calligrafico', feat: 'Prodigio magico' },
  { name: 'Marinaio',         skills: ['Atletica','Percezione'],          tool: 'Kit da navigatore',      feat: 'Tenace' },
  { name: 'Scrivano',         skills: ['Indagare','Persuasione'],         tool: 'Strumento calligrafico', feat: 'Magia rituale' },
  { name: 'Soldato',          skills: ['Atletica','Intimidire'],          tool: 'Strumento da gioco',     feat: 'Combattente' },
  { name: 'Viandante',        skills: ['Furtività','Sopravvivenza'],      tool: 'Kit da erborista',       feat: 'Scaltro' },
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

const CUSTOM_SENTINEL = '__custom__';

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
    // background ASI: +2 to one, +1 to another
    bgAsiPlus2: '',
    bgAsiPlus1: '',
    // custom fields
    customSpecies: '',
    customBackground: '',
    customClass: '',
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const speciesList = [...SPECIES_SRD, { name: CUSTOM_SENTINEL, label: 'Personalizzata...' }];
  const bgList      = [...BACKGROUNDS_SRD, { name: CUSTOM_SENTINEL, label: 'Personalizzato...' }];
  const classList   = [...CLASSES, CUSTOM_SENTINEL];

  const selectedSpecies = data.charRace === CUSTOM_SENTINEL ? null : SPECIES_SRD.find(r => r.name === data.charRace);
  const selectedBg      = data.charBackground === CUSTOM_SENTINEL ? null : BACKGROUNDS_SRD.find(b => b.name === data.charBackground);
  const selectedCls     = data.charClass === CUSTOM_SENTINEL ? data.customClass : data.charClass;

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

  // 2024: ASI comes from background (+2 to bgAsiPlus2, +1 to bgAsiPlus1)
  function getFinalAbilities() {
    const base = { ...data.abilities };
    if (data.bgAsiPlus2 && base[data.bgAsiPlus2] !== undefined)
      base[data.bgAsiPlus2] = Math.min(20, base[data.bgAsiPlus2] + 2);
    if (data.bgAsiPlus1 && base[data.bgAsiPlus1] !== undefined && data.bgAsiPlus1 !== data.bgAsiPlus2)
      base[data.bgAsiPlus1] = Math.min(20, base[data.bgAsiPlus1] + 1);
    return base;
  }

  function calcHP(abs, cls) {
    const hd = HIT_DICE[cls] || 'd8';
    const conMod = Math.floor((abs.COS - 10) / 2);
    const hdMax = parseInt(hd.replace('d', ''));
    return hdMax + conMod;
  }

  function buildFinalState() {
    const finalAbs = getFinalAbilities();
    const bgSkills = selectedBg?.skills || (data.charBackground === CUSTOM_SENTINEL ? [] : []);
    const allSkills = [...new Set([...bgSkills, ...data.skillProficiencies])];
    const saveProficiencies = CLASS_SAVE_PROFS[selectedCls] || [];
    return {
      charName: data.charName,
      charClass: selectedCls,
      charRace: data.charRace === CUSTOM_SENTINEL ? data.customSpecies : data.charRace,
      charBackground: data.charBackground === CUSTOM_SENTINEL ? data.customBackground : data.charBackground,
      charAlignment: data.charAlignment,
      charLevel: 1,
      abilities: finalAbs,
      saveProficiencies,
      skillProficiencies: allSkills,
      skillExpertise: [],
      hpCurrent: calcHP(finalAbs, selectedCls),
      hpMax: calcHP(finalAbs, selectedCls),
      ac: 10 + Math.floor((finalAbs.DES - 10) / 2),
      speed: '9m',
    };
  }

  const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || 'Personalizzata') : data.charRace;
  const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || 'Personalizzato') : data.charBackground;
  const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || 'Personalizzata') : data.charClass;

  const canNextStep = [
    data.charName && data.charRace && data.charBackground && (data.charRace !== CUSTOM_SENTINEL || data.customSpecies) && (data.charBackground !== CUSTOM_SENTINEL || data.customBackground),
    data.charClass && (data.charClass !== CUSTOM_SENTINEL || data.customClass),
    true,
    true,
    true,
  ][step];

  return (
    <div className="creator-overlay">
      <div className="creator-modal">
        <div className="creator-header">
          <div className="creator-title">⚔ Crea personaggio</div>
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

          {/* STEP 0 — Identità */}
          {step === 0 && (
            <div className="creator-section">
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Nome personaggio</label>
                <input value={data.charName} onChange={e => patch({ charName: e.target.value })} placeholder="Es. Aldric Voss" autoFocus />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Allineamento</label>
                <select value={data.charAlignment} onChange={e => patch({ charAlignment: e.target.value })}>
                  {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              {/* ── SPECIE ── */}
              <div className="creator-subtitle">Specie</div>
              <div className="creator-info-box" style={{ marginBottom: 8 }}>
                🆕 SRD 2024: le specie non danno più bonus alle caratteristiche. I bonus (+2/+1) vengono dal background.
              </div>
              <div className="creator-grid">
                {speciesList.map(r => {
                  const isCustom = r.name === CUSTOM_SENTINEL;
                  const selected = data.charRace === r.name;
                  return (
                    <div
                      key={r.name}
                      className={`creator-card ${selected ? 'selected' : ''}`}
                      onClick={() => patch({ charRace: r.name })}
                    >
                      <div className="creator-card-name">{isCustom ? (r.label) : r.name}</div>
                      {!isCustom && <div className="creator-card-sub">Solo tratti — nessun bonus stat</div>}
                      {isCustom && selected && (
                        <input
                          className="creator-custom-input"
                          value={data.customSpecies}
                          onChange={e => { e.stopPropagation(); patch({ customSpecies: e.target.value }); }}
                          onClick={e => e.stopPropagation()}
                          placeholder="Nome specie personalizzata..."
                          autoFocus
                        />
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

              {/* ── BACKGROUND ── */}
              <div className="creator-subtitle" style={{ marginTop: 16 }}>Background</div>
              <div className="creator-info-box" style={{ marginBottom: 8 }}>
                Il background concede +2 a una caratteristica e +1 a un'altra (a tua scelta), 2 competenze abilità e un talento Origin.
              </div>
              <div className="creator-grid">
                {bgList.map(b => {
                  const isCustom = b.name === CUSTOM_SENTINEL;
                  const selected = data.charBackground === b.name;
                  return (
                    <div
                      key={b.name}
                      className={`creator-card ${selected ? 'selected' : ''}`}
                      onClick={() => patch({ charBackground: b.name, bgAsiPlus2: '', bgAsiPlus1: '' })}
                    >
                      <div className="creator-card-name">{isCustom ? b.label : b.name}</div>
                      {!isCustom && <div className="creator-card-sub">Comp.: {b.skills.join(', ')} · Talento: {b.feat}</div>}
                      {isCustom && selected && (
                        <input
                          className="creator-custom-input"
                          value={data.customBackground}
                          onChange={e => { e.stopPropagation(); patch({ customBackground: e.target.value }); }}
                          onClick={e => e.stopPropagation()}
                          placeholder="Nome background personalizzato..."
                          autoFocus
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Background ASI picker */}
              {data.charBackground && data.charBackground !== CUSTOM_SENTINEL && (
                <div className="creator-info-box" style={{ marginTop: 12 }}>
                  <strong>Bonus caratteristiche da background:</strong>
                  <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
                    <div className="field" style={{ flex:1 }}>
                      <label>+2 a</label>
                      <select value={data.bgAsiPlus2} onChange={e => patch({ bgAsiPlus2: e.target.value, bgAsiPlus1: data.bgAsiPlus1 === e.target.value ? '' : data.bgAsiPlus1 })}>
                        <option value=''>— Scegli —</option>
                        {ABILITIES.map(a => <option key={a} value={a}>{ABILITY_NAMES[a]} ({a})</option>)}
                      </select>
                    </div>
                    <div className="field" style={{ flex:1 }}>
                      <label>+1 a (diversa)</label>
                      <select value={data.bgAsiPlus1} onChange={e => patch({ bgAsiPlus1: e.target.value })}>
                        <option value=''>— Scegli —</option>
                        {ABILITIES.filter(a => a !== data.bgAsiPlus2).map(a => <option key={a} value={a}>{ABILITY_NAMES[a]} ({a})</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Classe */}
          {step === 1 && (
            <div className="creator-section">
              <div className="creator-subtitle">Scegli la tua classe</div>
              <div className="creator-grid">
                {classList.map(cls => {
                  const isCustom = cls === CUSTOM_SENTINEL;
                  const selected = data.charClass === cls;
                  return (
                    <div
                      key={cls}
                      className={`creator-card ${selected ? 'selected' : ''}`}
                      onClick={() => patch({ charClass: cls })}
                    >
                      <div className="creator-card-name">{isCustom ? 'Personalizzata...' : cls}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {HIT_DICE[cls] || 'd8'} HP
                          {SPELLCASTING_CLASS[cls] ? ` · Incantatore (${SPELLCASTING_CLASS[cls]})` : ''}
                        </div>
                      )}
                      {isCustom && selected && (
                        <input
                          className="creator-custom-input"
                          value={data.customClass}
                          onChange={e => { e.stopPropagation(); patch({ customClass: e.target.value }); }}
                          onClick={e => e.stopPropagation()}
                          placeholder="Nome classe personalizzata..."
                          autoFocus
                        />
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait">• Tiri salvezza: {(CLASS_SAVE_PROFS[cls] || []).join(', ')}</div>
                          <div className="creator-trait">• Competenze abilità: {CLASS_SKILL_COUNT[cls] || 2} a scelta</div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

              {(data.bgAsiPlus2 || data.bgAsiPlus1) && (
                <div className="creator-info-box" style={{ marginBottom: 8 }}>
                  Background: {data.bgAsiPlus2 ? `+2 ${ABILITY_NAMES[data.bgAsiPlus2]}` : ''}{data.bgAsiPlus1 ? `, +1 ${ABILITY_NAMES[data.bgAsiPlus1]}` : ''} (applicati nel riepilogo)
                </div>
              )}

              <div className="creator-abilities">
                {ABILITIES.map(attr => {
                  const base = data.abilities[attr];
                  const bgMod = (attr === data.bgAsiPlus2 ? 2 : 0) + (attr === data.bgAsiPlus1 ? 1 : 0);
                  const final = Math.min(20, base + bgMod);
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
                      {bgMod !== 0 && (
                        <div className="creator-race-bonus">+{bgMod} bg</div>
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
                  {selectedBg.tool && <> · Strumento: {selectedBg.tool}.</>}
                  {selectedBg.feat && <> · Talento Origin: {selectedBg.feat}.</>}
                </div>
              )}
              <div className="creator-subtitle">
                Scegli {CLASS_SKILL_COUNT[selectedCls] || 2} abilità di classe
                ({data.skillProficiencies.length}/{CLASS_SKILL_COUNT[selectedCls] || 2} selezionate)
              </div>
              <div className="check-list">
                {(CLASS_SKILL_OPTIONS[selectedCls] || SKILLS.map(s => s.name)).map(sk => {
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
                      <div className={`check-dot ${fromBg || selected ? 'proficient' : ''}`} />
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
                    {charRaceDisplay} · {charClsDisplay} · {charBgDisplay}
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
                    <strong>{hp} ({HIT_DICE[selectedCls] || 'd8'}+{conMod} COS)</strong>
                  </div>
                  <div className="creator-summary-row">
                    <span>Tiri salvezza</span>
                    <strong>{(CLASS_SAVE_PROFS[selectedCls] || []).join(', ') || '—'}</strong>
                  </div>
                  <div className="creator-summary-row">
                    <span>Competenze abilità</span>
                    <strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].join(', ') || '—'}</strong>
                  </div>
                  {selectedBg && (
                    <>
                      <div className="creator-summary-row">
                        <span>Talento Origin</span>
                        <strong>{selectedBg.feat}</strong>
                      </div>
                      <div className="creator-summary-row">
                        <span>Strumento</span>
                        <strong>{selectedBg.tool}</strong>
                      </div>
                    </>
                  )}
                  {(data.bgAsiPlus2 || data.bgAsiPlus1) && (
                    <div className="creator-summary-row">
                      <span>Bonus background</span>
                      <strong>{data.bgAsiPlus2 ? `+2 ${data.bgAsiPlus2}` : ''}{data.bgAsiPlus1 ? `, +1 ${data.bgAsiPlus1}` : ''}</strong>
                    </div>
                  )}
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
