import React, { useState, useRef } from 'react';
import { useCharacter } from './hooks/useCharacter';
import {
  ABILITIES, ABILITY_NAMES, SKILLS, CLASSES, ALIGNMENTS,
  SPELLCASTING_CLASS, SLOT_TABLE, getMod, fmtMod,
} from './data/dnd5e';
import CharacterCreator from './components/CharacterCreator';
import ConditionTracker from './components/ConditionTracker';
import WeaponManager from './components/WeaponManager';
import TabBar from './components/TabBar';
import SpellManager from './components/SpellManager';
import './App.css';

const SPECIES_LIST = [
  'Umano', 'Elfo (Alto)', 'Elfo (Silvano)', 'Nano (Collina)', 'Nano (Montagna)',
  'Halfling (Pieditozzo)', 'Halfling (Selvatico)', 'Mezzelfo', 'Tiefling', 'Draconico',
  'Gnomo (Roccia)', 'Gnomo (Foresta)', "Mezz'orco", 'Aasimar',
];
const BACKGROUNDS_LIST = [
  'Accolito', 'Artigiano', 'Criminale', 'Eremita', 'Eroe Popolare',
  'Intrattenitore', 'Marinaio', 'Nobile', 'Saggio', 'Soldato',
  'Orfano di strada', 'Seguace di gilda',
];

// ── Utility ─────────────────────────────────────────────────────
function rollDice(notation) {
  const m = notation.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!m) return null;
  let total = 0;
  for (let i = 0; i < parseInt(m[1]); i++)
    total += Math.floor(Math.random() * parseInt(m[2])) + 1;
  if (m[3]) total += parseInt(m[3]);
  return total;
}

// ── Sub-components ───────────────────────────────────────────────
function Toast({ message }) {
  return message ? <div className="toast show">{message}</div> : null;
}

function AbilityBox({ attr, score, onAdjust, onInput, editing, onHover }) {
  const mod = getMod(score);
  return (
    <div
      className={`ability-box ${editing ? 'editing' : ''}`}
      onMouseEnter={() => onHover && onHover(attr)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="ability-label">{attr}</div>
      <div className="ability-mod">{fmtMod(mod)}</div>
      {editing ? (
        <div className="ability-score-row">
          <button className="mod-btn" onClick={() => onAdjust(attr, -1)}>−</button>
          <input
            className="ability-score-input"
            type="number" min="1" max="30"
            value={score}
            onChange={e => onInput(attr, e.target.value)}
          />
          <button className="mod-btn" onClick={() => onAdjust(attr, 1)}>+</button>
        </div>
      ) : (
        <div className="ability-score-static">{score}</div>
      )}
    </div>
  );
}

function HPBar({ current, max, tempHP = 0 }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const tempPct = Math.min(20, (tempHP / Math.max(1, max)) * 100); // max 20% visual
  const color = pct > 50 ? '#3B6D11' : pct > 25 ? '#854F0B' : '#A32D2D';
  return (
    <div className="hp-bar-wrap">
      <div className="hp-bar-fill" style={{ width: `${pct}%`, background: color }} />
      {tempHP > 0 && (
        <div className="hp-bar-temp" style={{ width: `${tempPct}%` }} />
      )}
    </div>
  );
}

function ActionItem({ action, onRoll }) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = {
    action: 'badge-action', bonus: 'badge-bonus',
    reaction: 'badge-reaction', free: 'badge-free',
  }[action.type] || 'badge-free';
  const typeLabel = {
    action: 'Azione', bonus: 'Bonus', reaction: 'Reazione', free: 'Gratuita',
  }[action.type] || action.type;

  return (
    <div className={`action-item ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(e => !e)}>
      <div className={`action-badge ${badgeClass}`}>{typeLabel}</div>
      <div className="action-content">
        <div className="action-name">{action.name}</div>
        <div className="action-desc-short">{action.descShort}</div>
        {expanded && (
          <div className="action-desc-full">
            {action.desc}
            {action.dice && (
              <div className="action-roll" onClick={e => { e.stopPropagation(); onRoll(action.dice, action.name); }}>
                🎲 Lancia {action.dice}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpellSlots({ slots, onToggle }) {
  return (
    <div>
      {slots.map((slot, i) => {
        if (!slot.max) return null;
        return (
          <div key={i} className="spell-slot-row">
            <div className="slot-level">{i + 1}° liv.</div>
            <div className="slot-pips">
              {Array.from({ length: slot.max }, (_, j) => (
                <div
                  key={j}
                  className={`slot-pip ${j >= slot.used ? 'available' : 'used'}`}
                  onClick={() => onToggle(i, j)}
                />
              ))}
            </div>
            <div className="slot-count">{slot.max - slot.used}/{slot.max}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const char = useCharacter();
  const { state, update } = char;
  const [activeTab, setActiveTab] = useState('main');
  const [actionFilter, setActionFilter] = useState('all');
  const [spellFilter, setSpellFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [hpAmount, setHpAmount] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingHP, setEditingHP] = useState(false);
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const fileInputRef = useRef();
  const toastTimer = useRef();

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }

  function handleCreatorComplete(newState) {
    char.importState({ ...char.state, ...newState });
    setShowCreator(false);
    showToast(`Personaggio "${newState.charName}" creato!`);
  }

  function handleRoll(notation, name) {
    const result = rollDice(notation);
    if (result !== null) showToast(`${name}: ${notation} = ${result}`);
  }

  function handleLongRest() {
    char.longRest();
    showToast('Riposo lungo: HP e slot ripristinati!');
  }

  function handleShortRest() {
    showToast(char.shortRest());
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        char.importState(JSON.parse(ev.target.result));
        showToast('Personaggio importato!');
      } catch {
        showToast('Errore: file JSON non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExport() {
    const blob = new Blob([char.exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.charName || 'personaggio'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddAction() {
    const name = window.prompt('Nome azione:');
    if (!name) return;
    const types = ['action', 'bonus', 'reaction', 'free'];
    const idx = parseInt(window.prompt('Tipo:\n0 = Azione\n1 = Bonus\n2 = Reazione\n3 = Gratuita') || '0');
    const type = types[idx] || 'action';
    const desc = window.prompt('Descrizione:') || '';
    const dice = window.prompt('Dado (es. 1d8+3, lascia vuoto se no):') || '';
    char.addAction({ id: Date.now().toString(), name, type, descShort: desc.slice(0, 50), desc, dice });
  }

  function handleAddSpell() {
    const name = window.prompt('Nome incantesimo:');
    if (!name) return;
    const level = parseInt(window.prompt('Livello (0 = trucchetto):') || '0');
    const school = window.prompt('Scuola (es. Evocazione, Necromanzia...):') || '';
    const concInput = window.prompt('Concentrazione? (s/n):') || 'n';
    const concentration = concInput.toLowerCase().startsWith('s');
    char.addSpell({ name, level, school, concentration, prepared: false });
  }

  function handleAddEquip() {
    const name = window.prompt('Oggetto:');
    if (!name) return;
    const qty = parseInt(window.prompt('Quantità:') || '1');
    char.addEquipment({ name, qty });
  }

  const filteredActions = actionFilter === 'all'
    ? state.actions
    : state.actions.filter(a => a.type === actionFilter);

  const filteredSpells = spellFilter === 'all'
    ? state.spells
    : spellFilter === '0'
    ? state.spells.filter(s => s.level === 0)
    : state.spells.filter(s => s.prepared);

  const hasSpells = !!SPELLCASTING_CLASS[state.charClass];

  return (
    <div className="sheet">
      <Toast message={toast} />

      {showCreator && (
        <CharacterCreator
          onComplete={handleCreatorComplete}
          onCancel={() => setShowCreator(false)}
        />
      )}

      {/* Template bar */}
      <div className="template-bar">
        <span className="template-label">Sistema:</span>
        {['dnd5e', 'custom'].map(t => (
          <button
            key={t}
            className={`template-chip ${state.template === t ? 'active' : ''}`}
            onClick={() => update({ template: t })}
          >
            {t === 'dnd5e' ? 'D&D 5e / 2024' : 'Personalizzato'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="io-btn primary" onClick={() => setShowCreator(true)}>⚔ Nuovo personaggio</button>
        <button className="io-btn" onClick={handleExport}>⬇ Esporta JSON</button>
        <button className="io-btn primary" onClick={() => fileInputRef.current?.click()}>⬆ Importa</button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── MAIN PANEL ── */}
      {activeTab === 'main' && (
        <div className="panel">
          {/* Identity */}
          <div className="card">
            <div className="card-title">👤 Identità</div>
            <div className="grid-2">
              <Field label="Nome personaggio">
                <input value={state.charName} onChange={e => update({ charName: e.target.value })} placeholder="Es. Aldric Voss" />
              </Field>
              <Field label="Classe">
                <select value={state.charClass} onChange={e => char.onClassOrLevelChange({ charClass: e.target.value })}>
                  <option value="">— Scegli classe —</option>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Razza / Specie">
                <select value={state.charRace} onChange={e => update({ charRace: e.target.value })}>
                  <option value="">— Scegli specie —</option>
                  {SPECIES_LIST.map(r => <option key={r}>{r}</option>)}
                  <option value="__custom__">Personalizzata...</option>
                </select>
                {state.charRace === '__custom__' && (
                  <input
                    style={{ marginTop: 4 }}
                    value={state.charRaceCustom || ''}
                    onChange={e => update({ charRaceCustom: e.target.value })}
                    placeholder="Scrivi la specie..."
                  />
                )}
              </Field>
              <Field label="Background">
                <select value={state.charBackground} onChange={e => update({ charBackground: e.target.value })}>
                  <option value="">— Scegli background —</option>
                  {BACKGROUNDS_LIST.map(b => <option key={b}>{b}</option>)}
                  <option value="__custom__">Personalizzato...</option>
                </select>
                {state.charBackground === '__custom__' && (
                  <input
                    style={{ marginTop: 4 }}
                    value={state.charBackgroundCustom || ''}
                    onChange={e => update({ charBackgroundCustom: e.target.value })}
                    placeholder="Scrivi il background..."
                  />
                )}
              </Field>
              <Field label="Livello">
                <input type="number" min="1" max="20" value={state.charLevel}
                  onChange={e => char.onClassOrLevelChange({ charLevel: parseInt(e.target.value) || 1 })} />
              </Field>
              <Field label="Bonus competenza">
                <input value={`+${char.profBonus}`} readOnly />
              </Field>
              <Field label="Allineamento">
                <select value={state.charAlignment} onChange={e => update({ charAlignment: e.target.value })}>
                  {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Esperienza (XP)">
                <input type="number" min="0" value={state.charXP} onChange={e => update({ charXP: parseInt(e.target.value) || 0 })} />
              </Field>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>🎲 Caratteristiche</span>
              <button
                className={`icon-btn ${editingAbilities ? 'active' : ''}`}
                onClick={() => setEditingAbilities(e => !e)}
              >
                {editingAbilities ? '✓ Fine' : '✏ Modifica'}
              </button>
            </div>
            <div className="grid-6">
              {ABILITIES.map(attr => (
                <AbilityBox
                  key={attr}
                  attr={attr}
                  score={state.abilities[attr]}
                  onAdjust={(a, d) => char.setAbility(a, (state.abilities[a] || 10) + d)}
                  onInput={char.setAbility}
                  editing={editingAbilities}
                  onHover={setHoveredAttr}
                />
              ))}
            </div>
          </div>

          {/* Saves + Skills */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">🛡 Tiri salvezza</div>
              <div className="check-list">
                {ABILITIES.map(attr => {
                  const prof = state.saveProficiencies.includes(attr);
                  const highlighted = hoveredAttr === attr;
                  return (
                    <div key={attr} className={`check-item ${highlighted ? 'attr-highlight' : ''}`} onClick={() => char.toggleSaveProficiency(attr)}>
                      <div className={`check-dot ${prof ? 'proficient' : ''}`} />
                      <span className="check-val">{fmtMod(char.calcSaveMod(attr))}</span>
                      <span className="check-name">{ABILITY_NAMES[attr]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔧 Abilità</div>
              <div className="check-list">
                {SKILLS.map(sk => {
                  const prof = state.skillProficiencies.includes(sk.name);
                  const exp = state.skillExpertise.includes(sk.name);
                  const highlighted = hoveredAttr === sk.attr;
                  return (
                    <div key={sk.name} className={`check-item ${highlighted ? 'attr-highlight' : ''}`} onClick={() => char.toggleSkillProficiency(sk.name)}>
                      <div className={`check-dot ${exp ? 'expertise' : prof ? 'proficient' : ''}`} />
                      <span className="check-val">{fmtMod(char.calcSkillMod(sk))}</span>
                      <span className="check-name">{sk.name}</span>
                      <span className="check-attr">{sk.attr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Senses */}
          <div className="card">
            <div className="card-title">👁 Sensi & movimento</div>
            <div className="field-row">
              <Field label="Percezione passiva"><input value={char.passivePerception} readOnly /></Field>
              <Field label="Iniziativa"><input value={char.initiative} readOnly /></Field>
              <Field label="Velocità">
                <input value={state.speed} onChange={e => update({ speed: e.target.value })} placeholder="9m" />
              </Field>
              <Field label="Dadi vita"><input value={char.hitDice} readOnly /></Field>
            </div>
          </div>
        </div>
      )}

      {/* ── COMBAT PANEL ── */}
      {activeTab === 'combat' && (
        <div className="panel">
          {/* HP */}
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>❤ Punti ferita</span>
              <button
                className={`icon-btn ${editingHP ? 'active' : ''}`}
                onClick={() => setEditingHP(e => !e)}
              >
                {editingHP ? '✓ Fine' : '✏ Modifica'}
              </button>
            </div>

            {/* Current HP — always editable via +/- */}
            <div className="hp-labeled-row">
              <div className="hp-labeled-group">
                <div className="hp-label">Attuali</div>
                <div className="hp-stepper">
                  <button className="mod-btn" onClick={() => update({ hpCurrent: Math.max(0, state.hpCurrent - 1) })}>−</button>
                  <input className="hp-big" type="number"
                    value={state.hpCurrent}
                    onChange={e => update({ hpCurrent: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                  <button className="mod-btn" onClick={() => update({ hpCurrent: Math.min(state.hpMax, state.hpCurrent + 1) })}>+</button>
                </div>
              </div>

              <span className="hp-sep">/</span>

              {/* Max HP — only editable in edit mode */}
              <div className="hp-labeled-group">
                <div className="hp-label">Massimi</div>
                <div className="hp-stepper">
                  {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: Math.max(1, state.hpMax - 1) })}>−</button>}
                  <input className="hp-big" type="number"
                    value={state.hpMax}
                    readOnly={!editingHP}
                    style={{ background: editingHP ? 'var(--c-bg)' : 'var(--c-surface)', color: editingHP ? 'var(--c-ink)' : 'var(--c-muted)' }}
                    onChange={e => editingHP && update({ hpMax: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                  {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: state.hpMax + 1 })}>+</button>}
                </div>
              </div>
            </div>

            {/* HP bar */}
            <HPBar current={state.hpCurrent} max={state.hpMax} />

            {/* Temp HP bar — separate */}
            {(state.hpTemp > 0 || editingHP) && (
              <div className="hp-temp-section">
                <div className="hp-label" style={{ marginBottom: 4 }}>🛡 HP Temporanei</div>
                <div className="hp-stepper">
                  {editingHP && <button className="mod-btn" onClick={() => update({ hpTemp: Math.max(0, (state.hpTemp||0) - 1) })}>−</button>}
                  <input className="hp-big" type="number"
                    value={state.hpTemp || 0}
                    readOnly={!editingHP}
                    style={{ background: editingHP ? 'var(--c-bg)' : 'var(--c-surface)', color: editingHP ? 'var(--c-ink)' : '#185FA5', fontSize: 20 }}
                    onChange={e => editingHP && update({ hpTemp: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                  {editingHP && <button className="mod-btn" onClick={() => update({ hpTemp: (state.hpTemp||0) + 1 })}>+</button>}
                </div>
                <div className="hp-bar-wrap" style={{ marginTop: 4 }}>
                  <div className="hp-bar-fill" style={{
                    width: `${Math.min(100, ((state.hpTemp||0) / Math.max(1, state.hpMax)) * 100)}%`,
                    background: '#4A90D9'
                  }} />
                </div>
              </div>
            )}

            {/* Quick damage/heal */}
            <div className="hp-actions">
              <input className="hp-amount" type="number" min="0" value={hpAmount} onChange={e => setHpAmount(parseInt(e.target.value) || 0)} />
              <button className="hp-action-btn danger" onClick={() => {
                const temp = state.hpTemp || 0;
                if (temp > 0) {
                  const remaining = temp - hpAmount;
                  if (remaining >= 0) update({ hpTemp: remaining });
                  else update({ hpTemp: 0, hpCurrent: Math.max(0, state.hpCurrent + remaining) });
                } else {
                  char.modHP(-hpAmount);
                }
              }}>💔 Danno</button>
              <button className="hp-action-btn success" onClick={() => char.modHP(hpAmount)}>💚 Cura</button>
              {editingHP && (
                <button className="hp-action-btn" onClick={() => update({ hpTemp: Math.max(state.hpTemp||0, hpAmount) })}
                  title="Gli HP temporanei non si sommano: prendi il valore più alto">
                  🛡 Imposta Temp
                </button>
              )}
            </div>
          </div>

          {/* Combat stats */}
          <div className="card">
            <div className="card-title">⚔ Statistiche combattimento</div>
            <div className="grid-3">
              <div className="stat-pill">
                <div className="stat-pill-label">CA</div>
                <input className="stat-pill-input" type="number" value={state.ac} onChange={e => update({ ac: parseInt(e.target.value) || 10 })} />
              </div>
              <div className="stat-pill">
                <div className="stat-pill-label">Iniziativa</div>
                <div className="stat-pill-val">{char.initiative}</div>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-label">Velocità</div>
                <input className="stat-pill-input" type="text" value={state.speed} onChange={e => update({ speed: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Inspiration + Death saves */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">⭐ Ispirazione</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className={`inspiration-btn ${state.inspiration ? 'active' : ''}`}
                  onClick={() => update({ inspiration: !state.inspiration })}
                  title={state.inspiration ? 'Clicca per rimuovere ispirazione' : 'Clicca per ottenere ispirazione'}
                >
                  ⭐
                </button>
                <span className="toggle-label" style={{ color: state.inspiration ? '#856404' : 'var(--c-hint)' }}>
                  {state.inspiration ? 'Hai ispirazione!' : 'Nessuna ispirazione'}
                </span>
              </div>
            </div>
            <div className="card">
              <div className="card-title">💀 Tiri salvezza morte</div>
              <div className="death-saves">
                {['success', 'fail'].map(type => (
                  <div key={type} className="save-group">
                    <div className="save-group-label">{type === 'success' ? 'Successi' : 'Fallimenti'}</div>
                    <div className="save-pips">
                      {[0,1,2].map(i => {
                        const arr = type === 'success'
                          ? (state.deathSuccess || [false,false,false])
                          : (state.deathFail || [false,false,false]);
                        const on = arr[i] === true;
                        return (
                          <div
                            key={i}
                            className={`save-pip ${on ? type + '-on' : ''}`}
                            onClick={() => {
                              const current = type === 'success'
                                ? [...(state.deathSuccess || [false,false,false])]
                                : [...(state.deathFail || [false,false,false])];
                              current[i] = !current[i];
                              if (type === 'success') update({ deathSuccess: current });
                              else update({ deathFail: current });
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="card">
            <div className="card-title">🔮 Condizioni</div>
            <ConditionTracker
              active={state.conditions || []}
              onChange={conditions => update({ conditions })}
            />
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-title">⚡ Azioni</div>
            <div className="filter-bar">
              {[['all','Tutte'],['action','Azione'],['bonus','Bonus'],['reaction','Reazione'],['free','Gratuita']].map(([v,l]) => (
                <button key={v} className={`filter-chip ${actionFilter === v ? 'active' : ''}`} onClick={() => setActionFilter(v)}>{l}</button>
              ))}
            </div>
            <div className="action-list">
              {filteredActions.map(action => (
                <ActionItem key={action.id || action.name} action={action} onRoll={handleRoll} />
              ))}
            </div>
            <button className="add-action-btn" onClick={handleAddAction}>+ Aggiungi azione</button>
          </div>
        </div>
      )}

      {/* ── WEAPONS PANEL ── */}
      {activeTab === 'weapons' && (
        <div className="panel">
          <div className="card">
            <div className="card-title">⚔ Armi</div>
            <WeaponManager
              weapons={state.weapons || []}
              abilities={state.abilities}
              profBonus={char.profBonus}
              onUpdate={weapons => update({ weapons })}
              onRoll={handleRoll}
            />
          </div>
        </div>
      )}

      {/* ── SPELLS PANEL ── */}
      {activeTab === 'spells' && (
        <div className="panel">
          <div className="card">
            <div className="card-title">✨ Statistiche lancio</div>
            {hasSpells ? (
              <div className="field-row">
                <Field label="Stat. lancio"><input value={char.spellStat || '—'} readOnly /></Field>
                <Field label="CD salvezza"><input value={char.spellSaveDC ?? '—'} readOnly /></Field>
                <Field label="Bonus attacco"><input value={char.spellAttackBonus ?? '—'} readOnly /></Field>
              </div>
            ) : (
              <p className="hint-text">Seleziona una classe incantatore nella scheda personaggio.</p>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>🔥 Slot incantesimo</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="rest-btn" onClick={handleShortRest}>🌙 Riposo breve</button>
                <button className="rest-btn" onClick={handleLongRest}>🛏 Riposo lungo</button>
              </div>
            </div>
            {hasSpells && state.spellSlots.length > 0
              ? <SpellSlots slots={state.spellSlots} onToggle={char.toggleSpellSlot} />
              : <p className="hint-text">Nessuno slot disponibile per questa classe/livello.</p>
            }
          </div>

          <div className="card">
            <div className="card-title">📖 Incantesimi</div>
            <SpellManager
              spells={state.spells}
              charClass={state.charClass}
              onUpdate={spells => update({ spells })}
              onRoll={handleRoll}
            />
          </div>
        </div>
      )}

      {/* ── INVENTORY PANEL ── */}
      {activeTab === 'inventory' && (
        <div className="panel">
          <div className="card">
            <div className="card-title">💰 Valuta</div>
            <div className="currency-row">
              {[['GP','MO','#633806'],['SP','MA','#888780'],['CP','MR','#854F0B'],['PP','PE','#185FA5']].map(([key,label,color]) => (
                <div key={key} className="currency-item">
                  <div className="currency-label" style={{ color }}>{label}</div>
                  <input className="currency-input" type="number" min="0"
                    value={state.currency[key] || 0}
                    onChange={e => update({ currency: { ...state.currency, [key]: parseInt(e.target.value) || 0 } })}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">🎒 Equipaggiamento</div>
            {state.equipment.map((item, i) => (
              <div key={i} className="equip-item">
                <span className="equip-name">{item.name}</span>
                <span className="equip-qty">×{item.qty}</span>
                <button className="equip-remove" onClick={() => char.removeEquipment(i)}>✕</button>
              </div>
            ))}
            <button className="add-action-btn" onClick={handleAddEquip}>+ Aggiungi oggetto</button>
          </div>
        </div>
      )}

      {/* ── NOTES PANEL ── */}
      {activeTab === 'notes' && (
        <div className="panel">
          <div className="card">
            <div className="card-title">👤 Tratti personaggio</div>
            <div className="trait-grid">
              {[
                ['personality','Tratti della personalità','Come ti comporti?'],
                ['ideals','Ideali','Cosa credi?'],
                ['bonds','Legami','Chi o cosa ti lega al mondo?'],
                ['flaws','Difetti','Qual è il tuo tallone d\'Achille?'],
              ].map(([key,label,ph]) => (
                <Field key={key} label={label}>
                  <textarea className="notes-area" placeholder={ph}
                    value={state.notes[key] || ''}
                    onChange={e => update({ notes: { ...state.notes, [key]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">📝 Note libere</div>
            <textarea className="notes-area" style={{ minHeight: '180px' }}
              placeholder="Appunti di sessione, dettagli NPC, misteri da risolvere..."
              value={state.notes.free || ''}
              onChange={e => update({ notes: { ...state.notes, free: e.target.value } })}
            />
          </div>
          <div className="card">
            <div className="card-title">✨ Feature di classe e tratti</div>
            <textarea className="notes-area" style={{ minHeight: '140px' }}
              placeholder="Feature di classe, tratti razziali, talenti..."
              value={state.notes.classFeatures || ''}
              onChange={e => update({ notes: { ...state.notes, classFeatures: e.target.value } })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
