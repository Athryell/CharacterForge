import React, { useState } from 'react';
import { CLASSES, ALIGNMENTS, ABILITIES, ABILITY_NAMES, SKILLS, HIT_DICE, SPELLCASTING_CLASS } from '../data/dnd5e';
import { CLASS_FEATURES, SPECIES_FEATURES, BACKGROUND_FEATURES, getAutoFeatures } from '../data/features';

// SRD 5.5e (2024) — specie: solo tratti, nessun bonus caratteristica
const SPECIES_SRD = [
  { name: 'Umano',     traits: ['Versatile: 1 talento Origin a scelta al 1° livello', 'Eroico: vantaggio ai TS contro paura'] },
  { name: 'Elfo',      traits: ['Visione nel buio 18 m', 'Sensi acuti (comp. Percezione)', 'Ascendenza fatata (vantaggio TS contro magie)', 'Passo fatato (teletrasporto 9 m, usi = bonus comp.)'] },
  { name: 'Nano',      traits: ['Visione nel buio 18 m', 'Resistenza nanica (vantaggio TS veleno, immunità avvelenamento)', 'Tempra nanica', 'Competenza armi da guerra e armature medie'] },
  { name: 'Halfling',  traits: ['Fortunato (ritira i risultati di 1)', 'Coraggioso (vantaggio TS contro paura)', 'Agilità halfling (muoversi nello spazio di creature più grandi)'] },
  { name: 'Gnomo',     traits: ['Visione nel buio 18 m', 'Furbizia gnoma (vantaggio TS INT/SAG/CAR contro magie)', 'Competenza con strumenti artigianali'] },
  { name: 'Dragonide', traits: ['Soffio (azione, scala con livello)', 'Resistenza al danno del tipo draconico', 'Visione nel buio 18 m'] },
  { name: 'Tiefling',  traits: ['Visione nel buio 18 m', 'Resistenza al fuoco', 'Retaggio infernale: Thaumaturgia, Colpo infuocato (liv. 3), Oscurità (liv. 5)'] },
  { name: 'Aasimar',   traits: ['Visione nel buio 18 m', 'Guarigione celeste (PF extra a riposo lungo = bonus prof.)', 'Forma celeste: ali luminose o forma fiamma (1 min, 1× riposo lungo)'] },
  { name: 'Orco',      traits: ['Visione nel buio 18 m', 'Spietato (azione bonus: vantaggio al prossimo attacco nel turno)', 'Resistenza (PF extra pari al livello)'] },
  { name: 'Goliath',   traits: ['Resistenza al freddo', 'Possanza gigante (taglia Grande, oggetti extra-pesanti)', 'Forma gigante: STR o COS Primordiale (1× riposo lungo)'] },
];

// PHB 2024 — background completi con abilityScores consigliati, feat, skills, tool, equipaggiamento
const BACKGROUNDS_SRD = [
  {
    name: 'Accolito',
    desc: 'Hai dedicato la tua vita a servire un tempio, studiando i riti sacri e le dottrine di una divinità. Il tuo spirito è guidato dalla fede.',
    abilityScores: ['INT', 'SAG', 'CAR'],
    feat: 'Iniziato alla Magia (Chierico)',
    skills: ['Intuizione', 'Religione'],
    tool: 'Strumenti calligrafici',
    equipA: 'Simbolo sacro, libro di preghiere, 3 stecche d\'incenso, vesti, abiti comuni, 15 MO',
    equipB: '50 MO',
  },
  {
    name: 'Artigiano',
    desc: 'Hai imparato i segreti di un mestiere artigianale e sei membro di una gilda. Le tue mani sanno creare oggetti di valore.',
    abilityScores: ['FOR', 'DES', 'INT'],
    feat: 'Fabbricante',
    skills: ['Indagare', 'Persuasione'],
    tool: 'Attrezzi da artigiano (a scelta)',
    equipA: 'Attrezzi da artigiano, 2 borse di cuoio, abiti da viaggio, 15 MO',
    equipB: '50 MO',
  },
  {
    name: 'Impostore',
    desc: 'Hai sempre avuto il talento di convincere le persone di qualsiasi cosa. Con un sorriso e le parole giuste puoi essere chiunque.',
    abilityScores: ['DES', 'COS', 'CAR'],
    feat: 'Esperto',
    skills: ['Inganno', 'Prestidigitazione'],
    tool: 'Kit per falsificazioni',
    equipA: 'Kit per falsificazioni, costume, abiti eleganti, 15 MO',
    equipB: '50 MO',
  },
  {
    name: 'Criminale',
    desc: 'Hai vissuto nell\'ombra della società, sviluppando le tue abilità nel crimine. Conosci chi compra e chi vende segreti.',
    abilityScores: ['DES', 'COS', 'INT'],
    feat: 'Allerta',
    skills: ['Prestidigitazione', 'Furtività'],
    tool: 'Attrezzi da ladro',
    equipA: 'Attrezzi da ladro, piede di porco, 2 pugnali, abiti comuni con cappuccio, 16 MO',
    equipB: '50 MO',
  },
  {
    name: 'Intrattenitore',
    desc: 'Hai trascorso la giovinezza a esibirti davanti ai pubblici, padroneggiando la musica, la danza o le arti dello spettacolo.',
    abilityScores: ['FOR', 'DES', 'CAR'],
    feat: 'Musicista',
    skills: ['Acrobazia', 'Intrattenere'],
    tool: 'Strumento musicale (a scelta)',
    equipA: 'Strumento musicale, 2 costumi, specchio, profumo, abiti da viaggio, 11 MO',
    equipB: '50 MO',
  },
  {
    name: 'Contadino',
    desc: 'Sei cresciuto lavorando la terra e ti sei guadagnato da vivere con sudore e fatica. La tua forza e resilienza vengono dalle radici.',
    abilityScores: ['FOR', 'COS', 'SAG'],
    feat: 'Tenace',
    skills: ['Addestrare animali', 'Natura'],
    tool: 'Attrezzi da carpentiere',
    equipA: 'Falce, attrezzi da carpentiere, kit del guaritore, pentola di ferro, pala, abiti da viaggio, 30 MO',
    equipB: '50 MO',
  },
  {
    name: 'Guardia',
    desc: 'Hai prestato servizio come guardia in una città, fortezza o alla corte di un nobile. Sei addestrato a sorvegliare e proteggere.',
    abilityScores: ['FOR', 'INT', 'SAG'],
    feat: 'Allerta',
    skills: ['Atletica', 'Percezione'],
    tool: 'Strumento musicale (a scelta)',
    equipA: 'Lancia, balestra leggera, 20 dardi, strumento musicale, abiti eleganti, 5 MO',
    equipB: '50 MO',
  },
  {
    name: 'Guida',
    desc: 'Hai trascorso anni a esplorare territori selvaggi, tracciando mappe e accompagnando viaggiatori attraverso le terre inesplorate.',
    abilityScores: ['DES', 'COS', 'SAG'],
    feat: 'Iniziato alla Magia (Druido)',
    skills: ['Furtività', 'Sopravvivenza'],
    tool: 'Strumenti del cartografo',
    equipA: 'Arco corto, 20 frecce, strumenti del cartografo, sacco a pelo, corda (15 m), abiti da viaggio, 3 MO',
    equipB: '50 MO',
  },
  {
    name: 'Eremita',
    desc: 'Hai vissuto in isolamento, meditando e studiando i misteri del mondo. La solitudine ti ha dato una profonda comprensione interiore.',
    abilityScores: ['COS', 'INT', 'SAG'],
    feat: 'Iniziato alla Magia (Druido)',
    skills: ['Medicina', 'Religione'],
    tool: 'Kit da erborista',
    equipA: 'Bastone ferrato, kit da erborista, sacco a pelo, libro (filosofia), abiti comuni, 16 MO',
    equipB: '50 MO',
  },
  {
    name: 'Mercante',
    desc: 'Hai guadagnato denaro comprando e vendendo merci in mercati e fiere. Sai riconoscere il valore di qualsiasi cosa e trattare con chiunque.',
    abilityScores: ['COS', 'INT', 'SAG'],
    feat: 'Fortunato',
    skills: ['Addestrare animali', 'Persuasione'],
    tool: 'Strumenti del navigatore',
    equipA: 'Strumenti del navigatore, 2 borse, abiti da viaggio, 22 MO',
    equipB: '50 MO',
  },
  {
    name: 'Nobile',
    desc: 'Sei cresciuto in una famiglia di alto rango, circondato da ricchezza, potere e intrighi di corte. Il tuo nome apre molte porte.',
    abilityScores: ['FOR', 'INT', 'CAR'],
    feat: 'Esperto',
    skills: ['Historia', 'Persuasione'],
    tool: 'Set da gioco (a scelta)',
    equipA: 'Set da gioco, abiti eleganti, anello con sigillo, pergamena di pedigree, 25 MO',
    equipB: '50 MO',
  },
  {
    name: 'Saggio',
    desc: 'Hai trascorso gli anni formativi viaggiando tra manieri e monasteri, studiando libri e pergamene e imparando la storia del multiverso.',
    abilityScores: ['COS', 'INT', 'SAG'],
    feat: 'Iniziato alla Magia (Mago)',
    skills: ['Arcano', 'Historia'],
    tool: 'Strumenti calligrafici',
    equipA: 'Bastone ferrato, strumenti calligrafici, libro (storia), pergamena (8 fogli), veste, 8 MO',
    equipB: '50 MO',
  },
  {
    name: 'Marinaio',
    desc: 'Hai trascorso anni in mare aperto, imparando i segreti della navigazione e affrontando tempeste e pirati. Il mare è la tua casa.',
    abilityScores: ['FOR', 'DES', 'SAG'],
    feat: 'Rissa da Taverna',
    skills: ['Atletica', 'Percezione'],
    tool: 'Strumenti del navigatore',
    equipA: 'Pugnale, strumenti del navigatore, corda (15 m), abiti da viaggio, 20 MO',
    equipB: '50 MO',
  },
  {
    name: 'Scrivano',
    desc: 'Hai imparato a leggere, scrivere e copiare documenti in un ufficio notarile o in una biblioteca. La penna è la tua arma.',
    abilityScores: ['DES', 'INT', 'SAG'],
    feat: 'Esperto',
    skills: ['Indagare', 'Persuasione'],
    tool: 'Strumenti calligrafici',
    equipA: 'Strumenti calligrafici, abiti eleganti, lampada, 3 fiale d\'olio, pergamena (12 fogli), 23 MO',
    equipB: '50 MO',
  },
  {
    name: 'Soldato',
    desc: 'Hai combattuto come parte di un esercito o milizia. La disciplina militare e l\'esperienza di battaglia ti hanno forgiato.',
    abilityScores: ['FOR', 'DES', 'COS'],
    feat: 'Assalitore Selvaggio',
    skills: ['Atletica', 'Intimidire'],
    tool: 'Set da gioco (a scelta)',
    equipA: 'Lancia, arco corto, 20 frecce, set da gioco, abiti da viaggio, 18 MO',
    equipB: '50 MO',
  },
  {
    name: 'Viandante',
    desc: 'Hai vissuto ai margini della società, imparando a sopravvivere con poco e a muoverti nell\'ombra delle grandi città.',
    abilityScores: ['DES', 'SAG', 'CAR'],
    feat: 'Fortunato',
    skills: ['Intuizione', 'Furtività'],
    tool: 'Attrezzi da ladro',
    equipA: 'Pugnale, attrezzi da ladro, set da gioco, sacco a pelo, 2 costumi, 16 MO',
    equipB: '50 MO',
  },
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
    bgAsi: { FOR:0, DES:0, COS:0, INT:0, SAG:0, CAR:0 },
    customSpecies: '',
    customBackground: '',
    customClass: '',
  });

  function patch(obj) { setData(prev => ({ ...prev, ...obj })); }

  const speciesList = [...SPECIES_SRD, { name: CUSTOM_SENTINEL, label: 'Personalizzata...' }];
  const bgList      = [...BACKGROUNDS_SRD, { name: CUSTOM_SENTINEL, label: 'Personalizzato...' }];
  const classList   = [...CLASSES, CUSTOM_SENTINEL];

  const selectedBg  = data.charBackground === CUSTOM_SENTINEL ? null : BACKGROUNDS_SRD.find(b => b.name === data.charBackground);
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

  function setStandard() {
    patch({ abilities: { FOR:15, DES:14, COS:13, INT:12, SAG:10, CAR:8 } });
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
    const conMod = Math.floor((abs.COS - 10) / 2);
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
      ac: 10 + Math.floor((finalAbs.DES - 10) / 2),
      speed: '9m',
    };
  }

  const charRaceDisplay = data.charRace === CUSTOM_SENTINEL ? (data.customSpecies || 'Personalizzata') : data.charRace;
  const charBgDisplay   = data.charBackground === CUSTOM_SENTINEL ? (data.customBackground || 'Personalizzato') : data.charBackground;
  const charClsDisplay  = data.charClass === CUSTOM_SENTINEL ? (data.customClass || 'Personalizzata') : data.charClass;

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

          {/* ── STEP 0 — Identità ── */}
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

              {/* SPECIE */}
              <div className="creator-subtitle">Specie</div>
              <div className="creator-grid">
                {speciesList.map(r => {
                  const isCustom = r.name === CUSTOM_SENTINEL;
                  const selected = data.charRace === r.name;
                  return (
                    <div key={r.name} className={`creator-card ${selected ? 'selected' : ''}`} onClick={() => patch({ charRace: r.name })}>
                      <div className="creator-card-name">{isCustom ? r.label : r.name}</div>
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
              <div className="creator-subtitle" style={{ marginTop: 16 }}>Background</div>
              <div className="creator-grid">
                {bgList.map(b => {
                  const isCustom = b.name === CUSTOM_SENTINEL;
                  const selected = data.charBackground === b.name;
                  return (
                    <div key={b.name} className={`creator-card ${selected ? 'selected' : ''}`}
                      onClick={() => patch({ charBackground: b.name, bgAsi: { FOR:0, DES:0, COS:0, INT:0, SAG:0, CAR:0 } })}>
                      <div className="creator-card-name">{isCustom ? b.label : b.name}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {b.skills.join(', ')} · {b.feat}
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
                  <strong>Bonus caratteristiche da background</strong> — distribuisci +3 totali (max +2 per caratteristica).
                  {selectedBg?.abilityScores && (
                    <span style={{ color:'var(--c-muted)', marginLeft:6 }}>
                      Consigliate: {selectedBg.abilityScores.map(a => ABILITY_NAMES[a]).join(', ')}
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
                                  {a}{recommended ? '★' : ''}
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
                          Totale: {total}/3 {total === 3 ? '✓' : ''}
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
              <div className="creator-subtitle">Scegli la tua classe</div>
              <div className="creator-grid">
                {classList.map(cls => {
                  const isCustom = cls === CUSTOM_SENTINEL;
                  const selected = data.charClass === cls;
                  return (
                    <div key={cls} className={`creator-card ${selected ? 'selected' : ''}`} onClick={() => patch({ charClass: cls })}>
                      <div className="creator-card-name">{isCustom ? 'Personalizzata...' : cls}</div>
                      {!isCustom && (
                        <div className="creator-card-sub">
                          {HIT_DICE[cls] || 'd8'} HP{SPELLCASTING_CLASS[cls] ? ` · Incantatore (${SPELLCASTING_CLASS[cls]})` : ''}
                        </div>
                      )}
                      {isCustom && selected && (
                        <input className="creator-custom-input" value={data.customClass}
                          onChange={e => { e.stopPropagation(); patch({ customClass: e.target.value }); }}
                          onClick={e => e.stopPropagation()} placeholder="Nome classe..." autoFocus />
                      )}
                      {!isCustom && selected && (
                        <div className="creator-traits">
                          <div className="creator-trait">• TS: {(CLASS_SAVE_PROFS[cls] || []).join(', ')}</div>
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
                {[['pointbuy','Point Buy'],['standard','Array standard'],['roll','Lancia i dadi']].map(([v,l]) => (
                  <button key={v} className={`filter-chip ${data.abilitiesMethod === v ? 'active' : ''}`}
                    onClick={() => {
                      patch({ abilitiesMethod: v });
                      if (v === 'standard') setStandard();
                      if (v === 'roll') rollStats();
                      if (v === 'pointbuy') patch({ abilities: { FOR:8,DES:8,COS:8,INT:8,SAG:8,CAR:8 } });
                    }}>{l}</button>
                ))}
                {data.abilitiesMethod === 'roll' && (
                  <button className="filter-chip" onClick={rollStats}>🎲 Rilancia</button>
                )}
              </div>

              {data.abilitiesMethod === 'pointbuy' && (
                <div className="creator-pb-info">
                  Punti rimasti: <strong>{pointsLeft}</strong> / {POINT_BUY_TOTAL}
                  {pointsLeft < 0 && <span style={{ color:'#A32D2D' }}> — troppi punti spesi!</span>}
                </div>
              )}

              {Object.values(data.bgAsi).some(v => v > 0) && (
                <div className="creator-info-box" style={{ marginBottom:8 }}>
                  Background: {Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${ABILITY_NAMES[a]}`).join(', ')} (applicati nel riepilogo)
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
                      <div className="creator-ability-name">{ABILITY_NAMES[attr]}</div>
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
                  <strong>{data.charBackground}:</strong> comp. automatiche in {selectedBg.skills.join(' e ')}.
                  {selectedBg.tool && <> · Strumento: {selectedBg.tool}.</>}
                  {selectedBg.feat && <> · Talento Origin: <strong>{selectedBg.feat}</strong>.</>}
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
                    <div key={sk} className={`check-item ${fromBg ? 'bg-skill' : ''}`}
                      onClick={() => {
                        if (fromBg) return;
                        if (selected) patch({ skillProficiencies: data.skillProficiencies.filter(s => s !== sk) });
                        else if (!maxReached) patch({ skillProficiencies: [...data.skillProficiencies, sk] });
                      }}
                      style={{ opacity: !selected && maxReached && !fromBg ? 0.4 : 1 }}>
                      <div className={`check-dot ${fromBg || selected ? 'proficient' : ''}`} />
                      <span className="check-name">{sk}</span>
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
            const conMod = Math.floor((final.COS - 10) / 2);
            return (
              <div className="creator-section">
                <div className="creator-summary">
                  <div className="creator-summary-name">{data.charName || '—'}</div>
                  <div className="creator-summary-sub">{charRaceDisplay} · {charClsDisplay} · {charBgDisplay}</div>
                  <div className="creator-summary-sub" style={{ marginTop:2 }}>{data.charAlignment}</div>
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
                  <div className="creator-summary-row"><span>HP massimi</span><strong>{hp} ({HIT_DICE[selectedCls] || 'd8'}+{conMod} COS)</strong></div>
                  <div className="creator-summary-row"><span>Tiri salvezza</span><strong>{(CLASS_SAVE_PROFS[selectedCls] || []).join(', ') || '—'}</strong></div>
                  <div className="creator-summary-row"><span>Competenze</span><strong>{[...(selectedBg?.skills || []), ...data.skillProficiencies].join(', ') || '—'}</strong></div>
                  {selectedBg && <>
                    <div className="creator-summary-row"><span>Talento Origin</span><strong>{selectedBg.feat}</strong></div>
                    <div className="creator-summary-row"><span>Strumento</span><strong>{selectedBg.tool}</strong></div>
                  </>}
                  {Object.values(data.bgAsi).some(v => v > 0) && (
                    <div className="creator-summary-row">
                      <span>Bonus background</span>
                      <strong>{Object.entries(data.bgAsi).filter(([,v]) => v > 0).map(([a,v]) => `+${v} ${a}`).join(', ')}</strong>
                    </div>
                  )}
                  {SPELLCASTING_CLASS[selectedCls] && (
                    <div className="creator-summary-row"><span>Incantatore</span><strong>Sì ({SPELLCASTING_CLASS[selectedCls]})</strong></div>
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
          <div style={{ flex:1 }} />
          {step < STEPS.length - 1 ? (
            <button className={`io-btn primary ${!canNextStep ? 'disabled' : ''}`}
              onClick={() => canNextStep && setStep(s => s + 1)}>Avanti →</button>
          ) : (
            <button className="io-btn primary" onClick={() => onComplete(buildFinalState())}>✓ Crea personaggio</button>
          )}
        </div>
      </div>
    </div>
  );
}
