import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCharacter } from './hooks/useCharacter';
import { loadCharsIndex, deleteChar, getActiveCharId, setActiveCharId, generateCharId, migrateLegacy, saveCharState } from './chars';
import CharacterSelect from './components/CharacterSelect';
import { createDefaultState } from './data/dnd5e';
import {
  ABILITIES, ABILITY_NAMES, SKILLS, CLASSES, ALIGNMENTS,
  SPELLCASTING_CLASS, getMod, fmtMod,
} from './data/dnd5e';
import CharacterCreator from './components/CharacterCreator';
import ConditionTracker from './components/ConditionTracker';
import WeaponManager from './components/WeaponManager';
import ArmorManager from './components/ArmorManager';
import { calcArmorAC } from './data/armors';
import TabBar from './components/TabBar';
import SpellManager from './components/SpellManager';
import InventoryManager from './components/InventoryManager';
import { TagFilterBar, TagPill, TagSelector } from './components/Tags';
import { KeywordText, parseTextBonuses, resolveNotations } from './components/Tooltip';
import { CharContext } from './components/CharContext';
import WidgetGrid from './components/WidgetGrid';
import PinnedBar, { loadPinned, savePinned } from './components/PinnedBar';
import FeatureManager from './components/FeatureManager';
import { CLASS_FEATURES, SPECIES_FEATURES, BACKGROUND_FEATURES, getAutoFeatures } from './data/features';
import { loadLayout, saveLayout, getDefaultLayout, getWidgetsForTab, WIDGET_DEFS, loadTabs, saveTabs, DEFAULT_TABS } from './layout';
import { useTheme, ACCENT_PRESETS } from './hooks/useTheme';
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

// ── Utilities ───────────────────────────────────────────────────
function rollDice(notation) {
  const clean = notation.replace(/\s/g, '').replace(/\+-/g, '-').replace(/--/g, '+');
  const m = clean.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!m) return null;
  let total = 0;
  for (let i = 0; i < parseInt(m[1]); i++)
    total += Math.floor(Math.random() * parseInt(m[2])) + 1;
  if (m[3]) total += parseInt(m[3]);
  return total;
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Toast({ message }) {
  return message ? <div className="toast show">{message}</div> : null;
}

function AbilityBox({ attr, score, effectiveScore, onAdjust, onInput, editing, onHover, onRoll, bonus, bonusSources = [] }) {
  const mod = getMod(effectiveScore ?? score);
  const srcTitle = bonusSources.map(s => `${s.name} (${s.value >= 0 ? '+' : ''}${s.value})`).join(', ');
  return (
    <div
      className={`ability-box ${editing ? 'editing' : ''}`}
      onMouseEnter={() => onHover && onHover(attr)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="ability-label">{attr}</div>
      <div
        className={`ability-mod ${!editing && onRoll ? 'clickable-stat' : ''}`}
        onClick={!editing && onRoll ? () => onRoll(attr, mod) : undefined}
        title={!editing && onRoll ? `Tira 1d20${fmtMod(mod)}` : undefined}
      >{fmtMod(mod)}</div>
      {editing ? (
        <div className="ability-score-row">
          <button className="mod-btn" onClick={() => onAdjust(attr, -1)}>−</button>
          <input className="ability-score-input" type="number" min="3" max="30"
            value={score} onChange={e => onInput(attr, e.target.value)} />
          <button className="mod-btn" onClick={() => onAdjust(attr, 1)}>+</button>
        </div>
      ) : (
        <div className="ability-score-static">{effectiveScore ?? score}</div>
      )}
      {bonus ? <span className="equip-bonus-badge" title={srcTitle || undefined}>🎒</span> : null}
    </div>
  );
}

function HPBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const color = pct > 50 ? '#3B6D11' : pct > 25 ? '#854F0B' : '#A32D2D';
  return (
    <div className="hp-bar-wrap">
      <div className="hp-bar-fill" style={{ width: `${pct}%`, background: color }} />
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
                <div key={j} className={`slot-pip ${j >= slot.used ? 'available' : 'used'}`}
                  onClick={() => onToggle(i, j)} />
              ))}
            </div>
            <div className="slot-count">{slot.max - slot.used}/{slot.max}</div>
          </div>
        );
      })}
    </div>
  );
}

const ACTION_TYPES = [['action','Azione'],['bonus','Bonus'],['reaction','Reazione'],['free','Gratuita']];

function ActionItem({ action, allTags = [], onRoll, onUpdateTags, onCreateTag, onRemove, onEdit, onToggleHide }) {
  const [expanded, setExpanded] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const badgeClass = { action:'badge-action', bonus:'badge-bonus', reaction:'badge-reaction', free:'badge-free' }[action.type] || 'badge-free';
  const typeLabel = { action:'Azione', bonus:'Bonus', reaction:'Reazione', free:'Gratuita' }[action.type] || action.type;
  const isHidden = !!action.hidden;

  function startEdit(e) {
    e.stopPropagation();
    setForm({ name: action.name, type: action.type||'action', desc: action.desc||'', dice: action.dice||'' });
    setEditing(true);
  }
  function saveEdit(e) {
    e.stopPropagation();
    if (form.name.trim()) { onEdit && onEdit(action.id, form); }
    setEditing(false);
  }

  if (editing && form) {
    return (
      <div className={`action-item expanded${isHidden ? ' action-hidden' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`action-badge ${badgeClass}`}>
          <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
            style={{ background:'transparent', border:'none', color:'inherit', font:'inherit', cursor:'pointer' }}>
            {ACTION_TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="action-content" style={{ flex:1 }}>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            style={{ width:'100%', marginBottom:4, fontSize:13, fontWeight:600 }} placeholder="Nome azione" autoFocus />
          <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))}
            className="notes-area" style={{ minHeight:48, marginBottom:4 }} placeholder="Descrizione completa" />
          <input value={form.dice} onChange={e => setForm(f => ({...f, dice: e.target.value}))}
            style={{ width:'100%', fontSize:11 }} placeholder="Dado (es. 1d20+3, vuoto se nessuno)" />
          <div style={{ display:'flex', gap:6, marginTop:8, justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:6 }}>
              {onToggleHide && (
                <button className="icon-btn" title={isHidden ? 'Mostra' : 'Nascondi'}
                  onClick={e => { e.stopPropagation(); onToggleHide(action.id); }}>
                  {isHidden ? '👁' : '🙈'}
                </button>
              )}
              {onRemove && (
                <button className="io-btn danger" onClick={e => { e.stopPropagation(); onRemove(action.id); setEditing(false); }}>✕ Elimina</button>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="io-btn" onClick={e => { e.stopPropagation(); setEditing(false); }}>Annulla</button>
              <button className="io-btn primary" onClick={saveEdit}>✓ Salva</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`action-item ${expanded ? 'expanded' : ''}${isHidden ? ' action-hidden' : ''}`}
      onClick={() => { if (editingTags) return; setExpanded(e => !e); }}>
      <div className={`action-badge ${badgeClass}`}>{typeLabel}</div>
      <div className="action-content">
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div className="action-name" style={{ flex:1 }}>{action.name}</div>
          {(action.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
          {isHidden && <span style={{ fontSize:12, opacity:0.5 }} title="Nascosta">🙈</span>}
        </div>
        {expanded && (
          <div className="action-desc-full" onClick={e => e.stopPropagation()}>
            <KeywordText text={action.desc} onRoll={onRoll} label={action.name} />
            {action.dice && (
              <div className="action-roll" onClick={e => { e.stopPropagation(); onRoll(action.dice, action.name); }}>
                🎲 Lancia {action.dice}
              </div>
            )}
            <div style={{ marginTop:8 }}>
              {editingTags ? (
                <>
                  <TagSelector selected={action.tags||[]} allTags={allTags}
                    onChange={tags => onUpdateTags && onUpdateTags(action.id, tags)}
                    onCreateTag={onCreateTag} />
                  <button className="tag-edit-btn" style={{ marginLeft:6 }} onClick={e => { e.stopPropagation(); setEditingTags(false); }}>✓ Fine</button>
                </>
              ) : (
                <button className="tag-edit-btn" onClick={e => { e.stopPropagation(); setEditingTags(true); }}>
                  🏷 {(action.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                </button>
              )}
            </div>
            <div className="item-edit-actions">
              <button className="io-btn" onClick={startEdit}>✏ Modifica</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Character App (single character) ────────────────────────────
function CharacterApp({ charId, onBackToSelect, onNewChar }) {
  const char = useCharacter(charId);
  const { state, update } = char;

  // Layout state
  const [layout, setLayout] = useState(loadLayout);
  const [editMode, setEditMode] = useState(false);
  const [tabs, setTabs] = useState(loadTabs);
  const [pinned, setPinned] = useState(loadPinned);
  const [activityLog, setActivityLog] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem('characterforge_log')); return Array.isArray(v) ? v : []; } catch { return []; }
  });

  function handleTogglePin(id) {
    const next = pinned.includes(id) ? pinned.filter(p => p !== id) : [...pinned, id];
    setPinned(next); savePinned(next);
  }

  function addLog(icon, text) {
    const ts = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    setActivityLog(prev => {
      const next = [{ id: Date.now(), ts, icon, text }, ...prev].slice(0, 100);
      try { localStorage.setItem('characterforge_log', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // UI state
  const [activeTab, setActiveTab] = useState('main');
  const [actionFilter, setActionFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [hpAmount, setHpAmount] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingHP, setEditingHP] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [actionTagFilter, setActionTagFilter] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const [addActionForm, setAddActionForm] = useState({ name:'', type:'action', desc:'', dice:'' });
  const [addOpenFor, setAddOpenFor] = useState(null);
  const { mode: themeMode, accentId, setThemeMode, setAccent } = useTheme();
  const fileInputRef = useRef();
  const toastTimer = useRef();

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }

  const allTags = [...new Set([
    ...(state.actions||[]).flatMap(a => a.tags||[]),
    ...(state.spells||[]).flatMap(s => s.tags||[]),
    ...(state.weapons||[]).flatMap(w => w.tags||[]),
    ...(state.features||[]).flatMap(f => f.tags||[]),
    ...(state.equipment||[]).flatMap(e => e.tags||[]),
  ])];
  const actionNames = new Set((state.actions||[]).map(a => a.name));
  const { equipBonuses, equipBonusesDetailed } = useMemo(() => {
    const totals = {};
    const detailed = {};
    const add = (stat, value, name) => {
      totals[stat] = (totals[stat] || 0) + Number(value);
      detailed[stat] = detailed[stat] || [];
      detailed[stat].push({ name, value: Number(value) });
    };
    [...(state.weapons||[]), ...(state.equipment||[])].forEach(item => {
      (item.bonuses||[]).forEach(({ stat, value }) => add(stat, value, item.name));
      parseTextBonuses(item.desc).forEach(({ stat, value }) => add(stat, value, item.name));
    });
    return { equipBonuses: totals, equipBonusesDetailed: detailed };
  }, [state.weapons, state.equipment]);

  const effectiveAbilities = useMemo(() => {
    const result = {};
    ABILITIES.forEach(attr => { result[attr] = (state.abilities[attr] || 10) + (equipBonuses[attr] || 0); });
    return result;
  }, [state.abilities, equipBonuses]);
  function createTag() {}

  function handleTabChange(id) {
    if (id.startsWith('__toggle__')) {
      const tabId = id.replace('__toggle__', '');
      const visibleCount = tabs.filter(t => t.visible).length;
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;
      if (tab.visible && (visibleCount <= 1 || tabId === activeTab)) return;
      const next = tabs.map(t => t.id === tabId ? { ...t, visible: !t.visible } : t);
      setTabs(next); saveTabs(next);
      if (tabId === activeTab) {
        const first = next.find(t => t.visible && t.id !== tabId);
        if (first) setActiveTab(first.id);
      }
    } else {
      setActiveTab(id);
    }
  }

  function handleRoll(notation, name) {
    const resolved = resolveNotations(notation, effectiveAbilities, state.charLevel);
    const result = rollDice(resolved);
    if (result !== null) {
      const display = resolved !== notation ? `${notation} → ${resolved}` : notation;
      showToast(`${name}: ${display} = ${result}`);
      addLog('🎲', `${name}: ${display} = ${result}`);
    }
  }
  function handleLongRest() {
    char.longRest();
    showToast('Riposo lungo: HP e slot ripristinati!');
    addLog('🌙', 'Riposo lungo — HP e slot ripristinati');
  }
  function handleShortRest() {
    const msg = char.shortRest();
    showToast(msg);
    addLog('☀', 'Riposo breve');
  }
  function handleCastSpell(spell, level) {
    const updates = {};
    if (spell.level > 0 && level > 0) {
      const slot = (state.spellSlots || [])[level - 1];
      if (!slot || slot.used >= slot.max) { showToast('Nessuno slot disponibile!'); return; }
      updates.spellSlots = state.spellSlots.map((s, i) => i === level - 1 ? { ...s, used: s.used + 1 } : s);
    }
    if (spell.concentration) {
      if (state.concentrating) {
        const currentName = state.concentratingSpell || 'un incantesimo';
        if (!window.confirm(`Stai già concentrandoti su "${currentName}".\nInterrompere la concentrazione?`)) return;
      }
      updates.concentrating = true;
      updates.concentratingSpell = spell.name;
    }
    update(updates);
    const lvlNote = spell.level > 0 && level > spell.level ? ` (slot ${level}°)` : '';
    addLog('✨', `Lanciato: ${spell.name}${lvlNote}`);
    showToast(`✨ ${spell.name} lanciato!`);
  }

  function handleCreatorComplete(newState) {
    setShowCreator(false);
    showToast(`Personaggio "${newState.charName}" creato!`);
    if (onNewChar) onNewChar(newState);
  }
  function handleImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { char.importState(JSON.parse(ev.target.result)); showToast('Personaggio importato!'); }
      catch { showToast('Errore: file JSON non valido.'); }
    };
    reader.readAsText(file); e.target.value = '';
  }
  function handleExport() {
    const blob = new Blob([char.exportState()], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${state.charName||'personaggio'}.json`;
    a.click(); URL.revokeObjectURL(url);
  }
  const filteredActions = (state.actions||[])
    .filter(a => actionFilter === 'all' || a.type === actionFilter);
  const hasSpells = !!SPELLCASTING_CLASS[state.charClass];

  // ── Layout management ──────────────────────────────────────────
  function handleLayoutChange(newWidgets, action) {
    let next = [...layout];
    if (action?.type === 'moveTab') {
      next = next.map(w => w.id === action.widgetId ? { ...w, tab: action.tabId } : w);
    } else if (action?.type === 'hide') {
      next = next.map(w => w.id === action.widgetId ? { ...w, visible: false } : w);
    } else if (newWidgets) {
      // Replace widgets for current tab
      const otherTabs = next.filter(w => !newWidgets.find(nw => nw.id === w.id));
      next = [...otherTabs, ...newWidgets];
    }
    setLayout(next);
    saveLayout(next);
  }

  function restoreWidget(id) {
    const next = layout.map(w => w.id === id ? { ...w, visible: true, tab: activeTab } : w);
    setLayout(next); saveLayout(next);
  }

  const tabWidgets = getWidgetsForTab(layout, activeTab);
  const hiddenWidgets = layout
    .filter(w => w.visible === false)
    .map(w => ({ ...w, label: WIDGET_DEFS.find(d => d.id === w.id)?.label || w.id }));

  // ── Widget renderer ────────────────────────────────────────────
  const contentEditMap = {
    identity: editingIdentity,
    abilities: editingAbilities,
    hp: editingHP,
  };
  function renderWidget(id) {
    const ce = contentEditMap[id] ? ' content-editing' : '';
    switch (id) {

      case 'identity': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>👤 Identità</span>
            <button className={`icon-btn ${editingIdentity ? 'active' : ''}`} onClick={() => setEditingIdentity(v => !v)}>
              {editingIdentity ? '✓' : '✏'}
            </button>
          </div>
          <div className="identity-layout">
            {state.charImage && (
              <img src={state.charImage} alt="Personaggio" className="char-thumbnail"
                onError={e => { e.target.style.display='none'; }} />
            )}
            {editingIdentity ? (
              <div className="grid-2" style={{ flex:1 }}>
                <Field label="Nome"><input value={state.charName} onChange={e => update({ charName: e.target.value })} placeholder="Es. Aldric Voss" /></Field>
                <Field label="Classe">
                  <select value={state.charClass} onChange={e => {
                    const cls = e.target.value;
                    char.onClassOrLevelChange({ charClass: cls });
                    const kept = (state.features||[]).filter(f => f.sourceType !== 'class');
                    update({ features: [...kept, ...getAutoFeatures('class', cls, CLASS_FEATURES)] });
                  }}>
                    <option value="">— Scegli classe —</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Specie">
                  <select value={state.charRace} onChange={e => {
                    const race = e.target.value;
                    update({ charRace: race });
                    if (race && race !== '__custom__') {
                      const kept = (state.features||[]).filter(f => f.sourceType !== 'species');
                      update({ charRace: race, features: [...kept, ...getAutoFeatures('species', race, SPECIES_FEATURES)] });
                    } else {
                      update({ charRace: race });
                    }
                  }}>
                    <option value="">— Scegli specie —</option>
                    {SPECIES_LIST.map(r => <option key={r}>{r}</option>)}
                    <option value="__custom__">Personalizzata...</option>
                  </select>
                  {state.charRace === '__custom__' && (
                    <input style={{ marginTop:4 }} value={state.charRaceCustom||''} onChange={e => update({ charRaceCustom: e.target.value })} placeholder="Scrivi la specie..." />
                  )}
                </Field>
                <Field label="Background">
                  <select value={state.charBackground} onChange={e => {
                    const bg = e.target.value;
                    if (bg && bg !== '__custom__') {
                      const kept = (state.features||[]).filter(f => f.sourceType !== 'background');
                      update({ charBackground: bg, features: [...kept, ...getAutoFeatures('background', bg, BACKGROUND_FEATURES)] });
                    } else {
                      update({ charBackground: bg });
                    }
                  }}>
                    <option value="">— Scegli background —</option>
                    {BACKGROUNDS_LIST.map(b => <option key={b}>{b}</option>)}
                    <option value="__custom__">Personalizzato...</option>
                  </select>
                  {state.charBackground === '__custom__' && (
                    <input style={{ marginTop:4 }} value={state.charBackgroundCustom||''} onChange={e => update({ charBackgroundCustom: e.target.value })} placeholder="Scrivi il background..." />
                  )}
                </Field>
                <Field label="Livello">
                  <div className="hp-stepper" style={{ gap:4 }}>
                    <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.max(1, state.charLevel-1) })}>−</button>
                    <input type="number" min="1" max="20" style={{ width:50, textAlign:'center' }} value={state.charLevel} onChange={e => char.onClassOrLevelChange({ charLevel: Math.max(1, parseInt(e.target.value)||1) })} />
                    <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.min(20, state.charLevel+1) })}>+</button>
                  </div>
                </Field>
                <Field label="Bonus competenza"><input value={`+${char.profBonus}`} readOnly /></Field>
                <Field label="Allineamento">
                  <select value={state.charAlignment} onChange={e => update({ charAlignment: e.target.value })}>
                    {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Esperienza (XP)">
                  <input type="number" min="0" value={state.charXP} onChange={e => update({ charXP: parseInt(e.target.value)||0 })} />
                </Field>
              </div>
            ) : (
              <div className="identity-info-grid">
                {[
                  ['Nome', state.charName || '—'],
                  ['Classe', state.charClass || '—'],
                  ['Livello', state.charLevel],
                  ['Bonus competenza', `+${char.profBonus}`],
                  ['Specie', state.charRace === '__custom__' ? (state.charRaceCustom||'—') : (state.charRace||'—')],
                  ['Background', state.charBackground === '__custom__' ? (state.charBackgroundCustom||'—') : (state.charBackground||'—')],
                  ['Allineamento', state.charAlignment || '—'],
                  ...(state.charXP ? [['Esperienza', state.charXP]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {editingIdentity && (
            <Field label="🖼 Immagine personaggio (URL)">
              <input value={state.charImage||''} onChange={e => update({ charImage: e.target.value })}
                placeholder="https://..." style={{ marginTop:6 }} />
            </Field>
          )}
        </div>
      );

      case 'abilities': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>🎲 Caratteristiche</span>
            <button className={`icon-btn ${editingAbilities ? 'active' : ''}`} onClick={() => setEditingAbilities(e => !e)}>
              {editingAbilities ? '✓' : '✏'}
            </button>
          </div>
          <div className="grid-6">
            {ABILITIES.map(attr => (
              <AbilityBox key={attr} attr={attr} score={state.abilities[attr]}
                effectiveScore={effectiveAbilities[attr]}
                onAdjust={(a,d) => char.setAbility(a, (state.abilities[a]||10)+d)}
                onInput={char.setAbility} editing={editingAbilities} onHover={setHoveredAttr}
                onRoll={!editingAbilities ? (a, mod) => handleRoll(`1d20${mod >= 0 ? '+' : ''}${mod}`, ABILITY_NAMES[a]) : undefined}
                bonus={equipBonuses[attr] || 0}
                bonusSources={equipBonusesDetailed[attr] || []} />
            ))}
          </div>
        </div>
      );

      case 'saves': return (
        <div className="card">
          <div className="card-title">🛡 Tiri salvezza</div>
          <div className="check-list">
            {ABILITIES.map(attr => {
              const prof = state.saveProficiencies.includes(attr);
              const effMod = getMod(effectiveAbilities[attr]) + (prof ? char.profBonus : 0) + (equipBonuses[`TS-${attr}`] || 0);
              const tsBonus = equipBonuses[`TS-${attr}`] || 0;
              return (
                <div key={attr} className={`check-item ${hoveredAttr === attr ? 'attr-highlight' : ''}`} onClick={() => char.toggleSaveProficiency(attr)}>
                  <div className={`check-dot ${prof ? 'proficient' : ''}`} />
                  <span className="check-val">{fmtMod(effMod)}</span>
                  <span className="check-name">{ABILITY_NAMES[attr]}</span>
                  {tsBonus ? <span className="equip-bonus-badge" style={{ marginLeft:'auto' }}
                    title={(equipBonusesDetailed[`TS-${attr}`]||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>🎒</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'skills': return (
        <div className="card">
          <div className="card-title">🔧 Abilità</div>
          <div className="check-list">
            {SKILLS.map(sk => {
              const prof = state.skillProficiencies.includes(sk.name);
              const exp = state.skillExpertise.includes(sk.name);
              const effSkMod = getMod(effectiveAbilities[sk.attr]) + (exp ? char.profBonus*2 : prof ? char.profBonus : 0);
              return (
                <div key={sk.name} className={`check-item ${hoveredAttr === sk.attr ? 'attr-highlight' : ''}`} onClick={() => char.toggleSkillProficiency(sk.name)}>
                  <div className={`check-dot ${exp ? 'expertise' : prof ? 'proficient' : ''}`} />
                  <span className="check-val">{fmtMod(effSkMod)}</span>
                  <span className="check-name">{sk.name}</span>
                  <span className="check-attr">{sk.attr}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'senses': return (
        <div className="card">
          <div className="card-title">👁 Sensi</div>
          <div className="field-row">
            <Field label="Percezione passiva"><input value={char.passivePerception} readOnly /></Field>
            <Field label="Dadi vita"><input value={char.hitDice} readOnly /></Field>
          </div>
        </div>
      );

      case 'hp': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>❤ Punti ferita</span>
            <button className={`icon-btn ${editingHP ? 'active' : ''}`} onClick={() => setEditingHP(e => !e)}>
              {editingHP ? '✓' : '✏'}
            </button>
          </div>
          <div className="hp-labeled-row">
            <div className="hp-labeled-group">
              <div className="hp-label">Attuali</div>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.max(0, state.hpCurrent-1) })}>−</button>
                <input className="hp-big" type="number" value={state.hpCurrent} onChange={e => update({ hpCurrent: Math.max(0, parseInt(e.target.value)||0) })} />
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.min(state.hpMax, state.hpCurrent+1) })}>+</button>
              </div>
            </div>
            <span className="hp-sep">/</span>
            <div className="hp-labeled-group">
              <div className="hp-label">
                {editingHP ? 'Massimi (base)' : 'Massimi'}
                {equipBonuses.HP ? (
                  <span className="equip-bonus-badge" style={{ marginLeft:4 }}
                    title={(equipBonusesDetailed.HP||[]).map(s => `${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                    🎒
                  </span>
                ) : null}
              </div>
              <div className="hp-stepper">
                {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: Math.max(1, state.hpMax-1) })}>−</button>}
                <input className="hp-big" type="number"
                  value={editingHP ? state.hpMax : state.hpMax + (equipBonuses.HP || 0)}
                  readOnly={!editingHP}
                  style={{ background: editingHP ? 'var(--c-bg)' : 'var(--c-surface)', color: editingHP ? 'var(--c-ink)' : 'var(--c-muted)' }}
                  onChange={e => editingHP && update({ hpMax: Math.max(1, parseInt(e.target.value)||1) })} />
                {editingHP && <button className="mod-btn" onClick={() => update({ hpMax: state.hpMax+1 })}>+</button>}
              </div>
            </div>
            {(state.hpTemp||0) > 0 && (
              <div className="hp-labeled-group" style={{ marginLeft:4 }}>
                <div className="hp-label" style={{ color:'#185FA5' }}>Temp</div>
                <div className="hp-big" style={{ color:'#185FA5', fontSize:20 }}>{state.hpTemp}</div>
              </div>
            )}
          </div>
          <HPBar current={state.hpCurrent} max={state.hpMax + (equipBonuses.HP || 0)} />
          {(state.hpTemp||0) > 0 && (
            <div className="hp-bar-wrap" style={{ marginTop:4 }}>
              <div className="hp-bar-fill" style={{ width:`${Math.min(100,((state.hpTemp||0)/Math.max(1,state.hpMax))*100)}%`, background:'#4A90D9' }} />
            </div>
          )}
          <div className="hp-actions">
            <div className="hp-stepper">
              <button className="mod-btn" onClick={() => setHpAmount(a => Math.max(0,a-1))}>−</button>
              <input className="hp-amount" type="number" min="0" value={hpAmount} onChange={e => setHpAmount(Math.max(0,parseInt(e.target.value)||0))} />
              <button className="mod-btn" onClick={() => setHpAmount(a => a+1)}>+</button>
            </div>
            <button className="hp-action-btn danger" onClick={() => {
              const temp = state.hpTemp||0;
              if (temp > 0) { const r = temp-hpAmount; r >= 0 ? update({ hpTemp:r }) : update({ hpTemp:0, hpCurrent:Math.max(0,state.hpCurrent+r) }); }
              else char.modHP(-hpAmount);
            }}>💔 Danno</button>
            <button className="hp-action-btn success" onClick={() => char.modHP(hpAmount)}>💚 Cura</button>
            <button className="hp-action-btn temp" onClick={() => update({ hpTemp: hpAmount })}>🛡 Temp</button>
          </div>
        </div>
      );

      case 'combatStats': return (
        <div className="card">
          <div className="card-title">⚔ Statistiche combattimento</div>
          <div className="grid-3">
            <div className="stat-pill">
              <div className="stat-pill-label">CA</div>
              <input className="stat-pill-input" type="number"
                value={state.ac + (equipBonuses.CA || 0)}
                onChange={e => update({ ac: (parseInt(e.target.value)||10) - (equipBonuses.CA||0) })} />
              {equipBonuses.CA ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.CA||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
            <div className="stat-pill clickable-stat"
              onClick={() => { const im = getMod(effectiveAbilities.DES) + (equipBonuses.INI || 0); handleRoll(`1d20${im >= 0 ? '+' : ''}${im}`, 'Iniziativa'); }}
              title={`Tira iniziativa: 1d20${fmtMod(getMod(effectiveAbilities.DES) + (equipBonuses.INI || 0))}`}>
              <div className="stat-pill-label">Iniziativa</div>
              <div className="stat-pill-val">{fmtMod(getMod(effectiveAbilities.DES) + (equipBonuses.INI || 0))}</div>
              {equipBonuses.INI ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.INI||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
            <div className="stat-pill">
              <div className="stat-pill-label">Velocità</div>
              <input className="stat-pill-input" type="text" value={state.speed} onChange={e => update({ speed:e.target.value })} />
              {equipBonuses.VEL ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.VEL||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );

      case 'inspiration': return (
        <div className="card">
          <div className="card-title" style={{ marginBottom:12 }}>⭐ / 🎯 Stato</div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button className={`inspiration-btn ${state.inspiration ? 'active' : ''}`} onClick={() => update({ inspiration:!state.inspiration })}>⭐</button>
              <span className="toggle-label" style={{ color: state.inspiration ? '#856404' : 'var(--c-hint)' }}>
                {state.inspiration ? 'Ispirazione!' : 'No ispirazione'}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button className={`inspiration-btn ${state.concentrating ? 'active' : ''}`}
                style={state.concentrating ? { borderColor:'#185FA5', background:'#E6F1FB', boxShadow:'0 0 12px rgba(24,95,165,.35)' } : {}}
                onClick={() => update({ concentrating:!state.concentrating, concentratingSpell: state.concentrating ? null : state.concentratingSpell })}>🎯</button>
              <span className="toggle-label" style={{ color: state.concentrating ? '#185FA5' : 'var(--c-hint)' }}>
                {state.concentrating
                  ? (state.concentratingSpell ? `Concentrazione (${state.concentratingSpell})` : 'Concentrazione')
                  : 'No concentrazione'}
              </span>
            </div>
          </div>
        </div>
      );

      case 'deathSaves': return (
        <div className="card">
          <div className="card-title">💀 Tiri salvezza morte</div>
          <div className="death-saves">
            {['success','failure'].map(type => (
              <div key={type} className="save-group">
                <div className="save-group-label">{type === 'success' ? 'Successi' : 'Fallimenti'}</div>
                <div className="save-pips">
                  {[0,1,2].map(i => {
                    const arr = type === 'success' ? (state.deathSuccess||[false,false,false]) : (state.deathFail||[false,false,false]);
                    const on = arr[i] === true;
                    return (
                      <div key={i} className={`save-pip ${on ? type+'-on' : ''}`} onClick={() => {
                        const cur = [...(type === 'success' ? (state.deathSuccess||[false,false,false]) : (state.deathFail||[false,false,false]))];
                        cur[i] = !cur[i];
                        type === 'success' ? update({ deathSuccess:cur }) : update({ deathFail:cur });
                      }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case 'conditions': return (
        <div className="card">
          <div className="card-title">🔮 Condizioni</div>
          <ConditionTracker
            active={state.conditions||[]}
            onChange={conditions => update({ conditions })}
            exhaustionLevel={state.exhaustionLevel||0}
            onExhaustionChange={level => update({ exhaustionLevel: level })}
          />
        </div>
      );

      case 'actions': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>⚡ Azioni</span>
            <button className={`icon-btn ${addOpenFor === 'actions' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'actions' ? null : 'actions')}>+</button>
          </div>
          <div className="filter-bar">
            {[['all','Tutte'],['action','Azione'],['bonus','Bonus'],['reaction','Reazione'],['free','Gratuita']].map(([v,l]) => (
              <button key={v} className={`filter-chip ${actionFilter === v ? 'active' : ''}`} onClick={() => setActionFilter(v)}>{l}</button>
            ))}
          </div>
          {allTags.length > 0 && <TagFilterBar allTags={allTags} activeTag={actionTagFilter} onSelect={setActionTagFilter} />}
          {addOpenFor === 'actions' && (
            <div className="weapon-add-panel" style={{ marginBottom:8 }}>
              <div className="field-row">
                <div className="field">
                  <label>Nome *</label>
                  <input value={addActionForm.name} onChange={e => setAddActionForm(f => ({...f, name:e.target.value}))} placeholder="Es. Secondo vento" autoFocus />
                </div>
                <div className="field">
                  <label>Tipo</label>
                  <select value={addActionForm.type} onChange={e => setAddActionForm(f => ({...f, type:e.target.value}))}>
                    {ACTION_TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Dado (opzionale)</label>
                  <input value={addActionForm.dice} onChange={e => setAddActionForm(f => ({...f, dice:e.target.value}))} placeholder="1d20+3" />
                </div>
              </div>
              <div className="field" style={{ marginTop:6 }}>
                <label>Descrizione / Note</label>
                <textarea className="notes-area" style={{ minHeight:48 }} value={addActionForm.desc} onChange={e => setAddActionForm(f => ({...f, desc:e.target.value}))} placeholder="Descrizione dettagliata..." />
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, justifyContent:'flex-end' }}>
                <button className="io-btn" onClick={() => { setAddOpenFor(null); setAddActionForm({ name:'', type:'action', desc:'', dice:'' }); }}>Annulla</button>
                <button className="io-btn primary" disabled={!addActionForm.name.trim()} onClick={() => {
                  if (!addActionForm.name.trim()) return;
                  update({ actions: [...(state.actions||[]), { ...addActionForm, id: Date.now().toString() }] });
                  setAddOpenFor(null);
                  setAddActionForm({ name:'', type:'action', desc:'', dice:'' });
                }}>+ Aggiungi</button>
              </div>
            </div>
          )}
          <div className="action-list">
            {filteredActions.filter(a => !actionTagFilter || (a.tags||[]).includes(actionTagFilter)).map(action => (
              <ActionItem key={action.id||action.name} action={action} allTags={allTags} onRoll={handleRoll}
                onUpdateTags={(id,tags) => {
                  const action = (state.actions||[]).find(a => a.id===id);
                  const upd = { actions: state.actions.map(a => a.id===id ? {...a,tags} : a) };
                  if (action) {
                    upd.weapons = (state.weapons||[]).map(w => w.name===action.name ? {...w,tags} : w);
                    upd.spells = (state.spells||[]).map(s => s.name===action.name ? {...s,tags} : s);
                    upd.features = (state.features||[]).map(f => f.name===action.name ? {...f,tags} : f);
                    upd.equipment = (state.equipment||[]).map(e => e.name===action.name ? {...e,tags} : e);
                  }
                  update(upd);
                }}
                onCreateTag={createTag}
                onRemove={id => update({ actions: state.actions.filter(a => a.id !== id) })}
                onEdit={(id, patch) => update({ actions: state.actions.map(a => a.id === id ? {...a, ...patch} : a) })}
                onToggleHide={id => update({ actions: state.actions.map(a => a.id === id ? {...a, hidden: !a.hidden} : a) })}
              />
            ))}
          </div>
        </div>
      );

      case 'weapons': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>⚔ Armi</span>
            <button className={`icon-btn ${addOpenFor === 'weapons' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'weapons' ? null : 'weapons')}>+</button>
          </div>
          <WeaponManager weapons={state.weapons||[]} abilities={state.abilities} profBonus={char.profBonus}
            onUpdate={weapons => update({ weapons })} onRoll={handleRoll}
            proficiency={state.weaponProficiency||''} onUpdateProficiency={v => update({ weaponProficiency: v })}
            actionNames={actionNames} addOpen={addOpenFor === 'weapons'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags}
            onUpdateTags={(id, tags) => {
              const weapon = (state.weapons||[]).find(w => w.id===id);
              const upd = { weapons: (state.weapons||[]).map(w => w.id===id ? {...w,tags} : w) };
              if (weapon) upd.actions = (state.actions||[]).map(a => a.name===weapon.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'armor': return (
        <div className="card">
          <div className="card-title">🛡 Armatura</div>
          <ArmorManager
            equippedArmor={state.equippedArmor||null}
            hasShield={state.hasShield||false}
            desMod={char.abilityMod('DES')}
            proficiency={state.armorProficiency||''} onUpdateProficiency={v => update({ armorProficiency: v })}
            onEquip={armor => {
              const base = calcArmorAC(armor, char.abilityMod('DES'));
              update({ equippedArmor: armor, ac: base + (state.hasShield ? 2 : 0) });
            }}
            onToggleShield={() => {
              const shield = !state.hasShield;
              const base = calcArmorAC(state.equippedArmor||null, char.abilityMod('DES'));
              update({ hasShield: shield, ac: base + (shield ? 2 : 0) });
            }}
          />
        </div>
      );

      case 'spellStats': return (
        <div className="card">
          <div className="card-title">✨ Statistiche lancio</div>
          {hasSpells ? (
            <div className="field-row">
              <Field label="Stat. lancio"><input value={char.spellStat||'—'} readOnly /></Field>
              <Field label="CD salvezza"><input value={char.spellSaveDC??'—'} readOnly /></Field>
              <Field label="Bonus attacco"><input value={char.spellAttackBonus??'—'} readOnly /></Field>
            </div>
          ) : <p className="hint-text">Seleziona una classe incantatore.</p>}
        </div>
      );

      case 'spellSlots': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>🔥 Slot incantesimo</span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="rest-btn" onClick={handleShortRest}>🌙 Riposo breve</button>
              <button className="rest-btn" onClick={handleLongRest}>🛏 Riposo lungo</button>
            </div>
          </div>
          {hasSpells && state.spellSlots.length > 0
            ? <SpellSlots slots={state.spellSlots} onToggle={char.toggleSpellSlot} />
            : <p className="hint-text">Nessuno slot disponibile.</p>}
        </div>
      );

      case 'spells': return (
        <div className="card">
          <div className="card-title">📖 Incantesimi</div>
          <SpellManager spells={state.spells} charClass={state.charClass} onUpdate={spells => update({ spells })}
            onRoll={handleRoll} allTags={allTags}
            onUpdateTags={(name,tags) => update({
              spells: state.spells.map(s => s.name===name ? {...s,tags} : s),
              actions: (state.actions||[]).map(a => a.name===name ? {...a,tags} : a),
            })}
            onCreateTag={createTag}
            spellSlots={state.spellSlots||[]}
            concentratingSpell={state.concentratingSpell||null}
            onCast={handleCastSpell}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'currency': {
        const CURR = [['PP','MP','#7B68EE'],['GP','MO','#633806'],['SP','MA','#888780'],['CP','MR','#854F0B']];
        const cur = state.currency || {};
        function convertDown(i) { // 1 di CURR[i] → 10 di CURR[i+1]
          const [fk,,] = CURR[i]; const [tk,,] = CURR[i+1];
          if ((cur[fk]||0) < 1) return;
          update({ currency: { ...cur, [fk]: (cur[fk]||0)-1, [tk]: (cur[tk]||0)+10 } });
        }
        function convertUp(i) { // 10 di CURR[i+1] → 1 di CURR[i]
          const [fk,,] = CURR[i]; const [tk,,] = CURR[i+1];
          if ((cur[tk]||0) < 10) return;
          update({ currency: { ...cur, [tk]: (cur[tk]||0)-10, [fk]: (cur[fk]||0)+1 } });
        }
        return (
        <div className="card">
          <div className="card-title">💰 Valuta</div>
          <div className="currency-row">
            {CURR.map(([key,label,color], idx) => (
              <React.Fragment key={key}>
                <div className="currency-item">
                  <div className="currency-label" style={{ color }}>{label}</div>
                  <input className="currency-input" type="number" min="0"
                    value={cur[key]||0}
                    onChange={e => update({ currency: {...cur, [key]:parseInt(e.target.value)||0} })} />
                </div>
                {idx < CURR.length-1 && (
                  <div className="currency-convert">
                    <button className="currency-conv-btn" onClick={() => convertUp(idx)}
                      disabled={(cur[CURR[idx+1][0]]||0) < 10}
                      title={`10 ${CURR[idx+1][1]} → 1 ${label}`}>▲</button>
                    <button className="currency-conv-btn" onClick={() => convertDown(idx)}
                      disabled={(cur[key]||0) < 1}
                      title={`1 ${label} → 10 ${CURR[idx+1][1]}`}>▼</button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
      }

      case 'inventory': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>🎒 Equipaggiamento</span>
            <button className={`icon-btn ${addOpenFor === 'inventory' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'inventory' ? null : 'inventory')}>+</button>
          </div>
          <InventoryManager items={state.equipment||[]} onUpdate={equipment => update({ equipment })} onRoll={handleRoll}
            addOpen={addOpenFor === 'inventory'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags}
            onUpdateTags={(id, tags) => {
              const item = (state.equipment||[]).find(e => e.id===id);
              const upd = { equipment: (state.equipment||[]).map(e => e.id===id ? {...e,tags} : e) };
              if (item) upd.actions = (state.actions||[]).map(a => a.name===item.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'traits': return (
        <div className="card">
          <div className="card-title">👤 Tratti personaggio</div>
          <div className="trait-grid">
            {[['personality','Tratti della personalità','Come ti comporti?'],['ideals','Ideali','Cosa credi?'],
              ['bonds','Legami','Chi o cosa ti lega al mondo?'],['flaws','Difetti','Qual è il tuo tallone d\'Achille?']
            ].map(([key,label,ph]) => (
              <Field key={key} label={label}>
                <textarea className="notes-area" placeholder={ph} value={state.notes[key]||''}
                  onChange={e => update({ notes:{...state.notes,[key]:e.target.value} })} />
              </Field>
            ))}
          </div>
        </div>
      );

      case 'freeNotes': return (
        <div className="card">
          <div className="card-title">📝 Note libere</div>
          <textarea className="notes-area" style={{ minHeight:180 }}
            placeholder="Appunti di sessione, dettagli NPC, misteri da risolvere..."
            value={state.notes.free||''} onChange={e => update({ notes:{...state.notes,free:e.target.value} })} />
        </div>
      );

      case 'classFeatures': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>✨ Feature di classe e tratti</span>
            <button className={`icon-btn ${addOpenFor === 'features' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'features' ? null : 'features')}>+</button>
          </div>
          <FeatureManager features={state.features||[]} onUpdate={features => update({ features })} onRoll={handleRoll}
            actionNames={actionNames} addOpen={addOpenFor === 'features'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags}
            onUpdateTags={(id, tags) => {
              const feat = (state.features||[]).find(f => f.id===id);
              const upd = { features: (state.features||[]).map(f => f.id===id ? {...f,tags} : f) };
              if (feat) upd.actions = (state.actions||[]).map(a => a.name===feat.name ? {...a,tags} : a);
              update(upd);
            }}
            onCreateTag={createTag}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions: [...(state.actions||[]), action] }); }}
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })} />
        </div>
      );

      case 'activityLog': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span>📋 Log attività</span>
            {activityLog.length > 0 && (
              <button className="icon-btn" onClick={() => {
                setActivityLog([]);
                try { localStorage.removeItem('characterforge_log'); } catch {}
              }}>🗑 Svuota</button>
            )}
          </div>
          {activityLog.length === 0
            ? <div className="hint-text">Nessuna attività registrata.</div>
            : (
              <div className="activity-log-list">
                {activityLog.map(e => (
                  <div key={e.id} className="activity-log-entry">
                    <span className="activity-log-icon">{e.icon}</span>
                    <span className="activity-log-text">{e.text}</span>
                    <span className="activity-log-ts">{e.ts}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      );

      default: return <div className="card"><div className="hint-text">Widget "{id}" non trovato.</div></div>;
    }
  }

  return (
    <CharContext.Provider value={{ abilities: effectiveAbilities, charLevel: state.charLevel }}>
    <div className="sheet">
      <Toast message={toast} />
      {showCreator && <CharacterCreator onComplete={handleCreatorComplete} onCancel={() => setShowCreator(false)} />}

      {/* Top bar */}
      <div className="top-bar">
        <span className="top-bar-brand">D&amp;D 5e 2024</span>
        <div style={{ flex:1 }} />
        {onBackToSelect && (
          <button className="icon-btn" onClick={onBackToSelect} title="Tutti i personaggi">👥</button>
        )}
        <button className="hamburger-btn" onClick={() => setShowMenu(v => !v)} title="Menu" aria-label="Menu">
          ☰
        </button>
      </div>

      {showMenu && (
        <>
          <div className="hamburger-backdrop" onClick={() => setShowMenu(false)} />
          <div className="hamburger-dropdown">
            <div className="hmenu-section">
              <div className="hmenu-label">Personaggio</div>
              <button className="hmenu-item" onClick={() => { setShowCreator(true); setShowMenu(false); }}>
                ⚔ Nuovo personaggio
              </button>
            </div>
            <div className="hmenu-divider" />
            <div className="hmenu-section">
              <div className="hmenu-label">Layout</div>
              <button className={`hmenu-item ${editMode ? 'active' : ''}`}
                onClick={() => { setEditMode(v => !v); setShowMenu(false); }}>
                {editMode ? '✓ Fine modifica layout' : '⠿ Modifica layout'}
              </button>
              <button className="hmenu-item" onClick={() => {
                const d = getDefaultLayout(); setLayout(d); saveLayout(d);
                setTabs(DEFAULT_TABS); saveTabs(DEFAULT_TABS);
                setShowMenu(false);
              }}>↺ Reset layout</button>
            </div>
            <div className="hmenu-divider" />
            <div className="hmenu-section">
              <div className="hmenu-label">Tema</div>
              <div className="hmenu-row">
                {[['system','◑','Sistema'],['light','☀','Chiaro'],['dark','☾','Scuro']].map(([m, icon, label]) => (
                  <button key={m} className={`hmenu-theme-btn ${themeMode === m ? 'active' : ''}`}
                    title={label} onClick={() => setThemeMode(m)}>{icon} {label}</button>
                ))}
              </div>
            </div>
            <div className="hmenu-section">
              <div className="hmenu-label">Colore</div>
              <div className="hmenu-row">
                {ACCENT_PRESETS.map(p => (
                  <button key={p.id} className={`accent-swatch ${accentId === p.id ? 'active' : ''}`}
                    title={p.label} onClick={() => setAccent(p.id)}
                    style={{ '--swatch-color': p.light.accent }} />
                ))}
              </div>
            </div>
            <div className="hmenu-divider" />
            <div className="hmenu-section">
              <div className="hmenu-label">Dati</div>
              <button className="hmenu-item" onClick={() => { handleExport(); setShowMenu(false); }}>⬇ Esporta personaggio</button>
              <button className="hmenu-item" onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}>⬆ Importa personaggio</button>
            </div>
          </div>
        </>
      )}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport} />

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        editMode={editMode}
        onReorderTabs={next => { setTabs(next); saveTabs(next); }}
      />

      <PinnedBar
        state={state}
        editMode={editMode}
        pinned={pinned}
        onTogglePin={handleTogglePin}
        onUpdate={update}
      />

      {editMode && (
        <div className="layout-edit-banner">
          ⠿ Trascina widget e tab · ▬/⬛ per larghezza piena/mezza · ↗ per cambiare tab · 🚫 per nascondere · 📌 per fissare info
        </div>
      )}

      <div className="panel">
        <WidgetGrid
          widgets={tabWidgets}
          editMode={editMode}
          onLayoutChange={handleLayoutChange}
          renderWidget={renderWidget}
          hiddenWidgets={hiddenWidgets}
          onRestoreWidget={restoreWidget}
        />
      </div>
    </div>
    </CharContext.Provider>
  );
}

// ── AppShell — manages active character ─────────────────────────
export default function App() {
  const [chars, setChars] = useState(() => loadCharsIndex());
  const [activeCharId, setActive] = useState(() => {
    migrateLegacy(createDefaultState);
    return getActiveCharId();
  });
  const [showCreator, setShowCreator] = useState(false);

  // Keep chars list in sync after any save
  useEffect(() => {
    function syncIndex() { setChars(loadCharsIndex()); }
    window.addEventListener('storage', syncIndex);
    return () => window.removeEventListener('storage', syncIndex);
  }, []);

  function handleSelect(id) {
    setActiveCharId(id);
    setActive(id);
    setChars(loadCharsIndex());
  }

  function handleDelete(id) {
    deleteChar(id);
    const next = loadCharsIndex();
    setChars(next);
    if (activeCharId === id) { setActiveCharId(null); setActive(null); }
  }

  function handleCreatorComplete(newState) {
    const id = generateCharId();
    saveCharState(id, { ...createDefaultState(), ...newState });
    setActiveCharId(id);
    setActive(id);
    setChars(loadCharsIndex());
    setShowCreator(false);
  }

  if (!activeCharId) {
    return (
      <>
        <CharacterSelect
          chars={chars}
          onSelect={handleSelect}
          onCreate={() => setShowCreator(true)}
          onDelete={handleDelete}
        />
        {showCreator && (
          <CharacterCreator
            onComplete={handleCreatorComplete}
            onCancel={() => setShowCreator(false)}
          />
        )}
      </>
    );
  }

  return (
    <CharacterApp
      key={activeCharId}
      charId={activeCharId}
      onBackToSelect={() => { setActiveCharId(null); setActive(null); setChars(loadCharsIndex()); }}
      onNewChar={newState => { handleCreatorComplete(newState); }}
    />
  );
}
