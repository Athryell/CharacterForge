import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useCharacter } from './hooks/useCharacter';
import { loadCharsIndex, deleteChar, getActiveCharId, setActiveCharId, generateCharId, migrateLegacy, saveCharState } from './chars';
import CharacterSelect from './components/CharacterSelect';
import Onboarding, { CornerButtons, loadOnboardingSeen } from './components/Onboarding';
import {
  createDefaultState, ABILITIES, SKILLS,
  SPELLCASTING_CLASS, getMod, fmtMod, HIT_DICE,
} from './data/systems/dnd5e/mechanics';
import dataManager from './data/dataManager';
import SourceManager from './components/SourceManager';
import CharacterCreator from './components/CharacterCreator';
import LevelUpModal from './components/LevelUpModal';
import LevelDownModal from './components/LevelDownModal';
import ConditionTracker from './components/ConditionTracker';
import WeaponManager from './components/WeaponManager';
import ArmorManager from './components/ArmorManager';
import { calcArmorAC } from './data/systems/dnd5e/armors';
import TabBar from './components/TabBar';
import SpellManager from './components/SpellManager';
import InventoryManager from './components/InventoryManager';
import { TagFilterBar, TagPill, TagSelector } from './components/Tags';
import { KeywordText, parseTextBonuses, resolveNotations } from './components/Tooltip';
import { CharContext } from './components/CharContext';
import WidgetGrid from './components/WidgetGrid';
import PinnedBar, { loadPinned, savePinned } from './components/PinnedBar';
import FeatureManager from './components/FeatureManager';
import AlignmentPicker from './components/AlignmentPicker';
import DHWeaponManager from './components/DHWeaponManager';
import DHArmorManager from './components/DHArmorManager';
import { CLASS_FEATURES, getSubclassesForClass } from './data/systems/dnd5e/classes';
import { SPECIES_FEATURES, getAutoFeatures } from './data/systems/dnd5e/species';
import { BACKGROUND_FEATURES } from './data/systems/dnd5e/backgrounds';
import { getDefaultLayoutForSystem, getWidgetsForTab, loadLayoutForSystem, saveLayoutForSystem, loadTabsForSystem, saveTabsForSystem, getDefaultTabsForSystem, getWidgetLabel } from './layout';
import { DH_TRAITS, DH_TRAIT_NAMES, rollDualityDice, getDHTier, getDHProficiency } from './data/systems/daggerheart/mechanics';
import { getDHClasses, getDHDomains, getDHAncestries, getDHCommunities, getDHConditions, getDHTraitUses } from './data/systems/daggerheart/getters';
import { SYSTEMS, DEFAULT_SYSTEM, getSystem } from './data/systems';
import { useTheme, ACCENT_PRESETS } from './hooks/useTheme';
import { useUnits, parseSpeedFt } from './hooks/useUnits';
import { useAccessibility } from './hooks/useAccessibility';
import { Icon, useIconMode } from './config/icons';
import './App.css';


// ── Utilities ───────────────────────────────────────────────────
function rollDice(notation) {
  const clean = notation.replace(/\s/g, '').replace(/\+-/g, '-').replace(/--/g, '+');
  const diceMatch = clean.match(/(\d+)d(\d+)/i);
  if (!diceMatch) return null;
  let total = 0;
  const count = parseInt(diceMatch[1]);
  const sides = parseInt(diceMatch[2]);
  let firstRoll = null;
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    if (i === 0) firstRoll = roll;
    total += roll;
  }
  const afterDice = clean.slice(diceMatch.index + diceMatch[0].length);
  for (const m of afterDice.matchAll(/([+-]\d+)/g))
    total += parseInt(m[1]);
  return { total, natural: count === 1 ? firstRoll : null, sides };
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Toast({ message, action }) {
  if (!message) return null;
  return createPortal(
    <div className="toast show">
      <span>{message}</span>
      {action && <button className="toast-action-btn" onClick={action.onClick}>{action.label}</button>}
    </div>,
    document.body
  );
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
  const { t } = useTranslation();
  return (
    <div>
      {slots.map((slot, i) => {
        if (!slot.max) return null;
        return (
          <div key={i} className="spell-slot-row">
            <div className="slot-level">{t('spells.slotLevel', { level: i + 1 })}</div>
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

function SystemSelector({ activeSystem, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const sys = getSystem(activeSystem);
  return (
    <div className="system-selector">
      <button className="system-selector-btn" onClick={() => setOpen(v => !v)}>
        {sys.icon} {t(`system.${sys.id}`, sys.shortName)} <span className="system-selector-caret">▾</span>
      </button>
      {open && (
        <>
          <div className="hamburger-backdrop" onClick={() => setOpen(false)} />
          <div className="system-dropdown">
            {SYSTEMS.map(s => (
              <button
                key={s.id}
                className={`system-dropdown-item ${activeSystem === s.id ? 'active' : ''}`}
                onClick={() => { onChange(s.id); setOpen(false); }}
              >
                <span>{s.icon} {t(`system.${s.id}`, s.name)}</span>
                <span className="system-dropdown-desc">{s.description}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ACTION_TYPE_KEYS = ['action', 'bonus', 'reaction', 'free'];

function ActionItem({ action, allTags = [], onRoll, onUpdateTags, onCreateTag, onRemove, onEdit, onToggleHide }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const badgeClass = { action:'badge-action', bonus:'badge-bonus', reaction:'badge-reaction', free:'badge-free' }[action.type] || 'badge-free';
  const typeLabels = { action: t('actions.typeAction'), bonus: t('actions.typeBonus'), reaction: t('actions.typeReaction'), free: t('actions.typeFree') };
  const typeLabel = typeLabels[action.type] || action.type;
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
            {ACTION_TYPE_KEYS.map(v => <option key={v} value={v}>{typeLabels[v]}</option>)}
          </select>
        </div>
        <div className="action-content" style={{ flex:1 }}>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            style={{ width:'100%', marginBottom:4, fontSize:13, fontWeight:600, background:'var(--c-bg)', color:'var(--c-ink)', border:'0.5px solid var(--c-border-mid)', borderRadius:'var(--r)', padding:'5px 8px' }} placeholder={t('actions.addFormNamePlaceholder')} autoFocus />
          <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))}
            className="notes-area" style={{ minHeight:48, marginBottom:4 }} placeholder={t('actions.addFormDescPlaceholder')} />
          <input value={form.dice} onChange={e => setForm(f => ({...f, dice: e.target.value}))}
            style={{ width:'100%', fontSize:11, background:'var(--c-bg)', color:'var(--c-ink)', border:'0.5px solid var(--c-border-mid)', borderRadius:'var(--r)', padding:'5px 8px' }} placeholder={t('actions.addFormDicePlaceholder')} />
          <div style={{ display:'flex', gap:6, marginTop:8, justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:6 }}>
              {onToggleHide && (
                <button className="icon-btn" title={isHidden ? 'Mostra' : 'Nascondi'}
                  onClick={e => { e.stopPropagation(); onToggleHide(action.id); }}>
                  <Icon id={isHidden ? 'action.show' : 'action.hide'} size={14} />
                </button>
              )}
              {onRemove && (
                <button className="io-btn danger" onClick={e => { e.stopPropagation(); onRemove(action.id); setEditing(false); }}>{t('actions.deleteBtn')}</button>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="io-btn" onClick={e => { e.stopPropagation(); setEditing(false); }}>{t('common.cancel')}</button>
              <button className="io-btn primary" onClick={saveEdit}>{t('common.save')}</button>
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
          {isHidden && <span style={{ opacity:0.5 }} title="Nascosta"><Icon id="action.hide" size={12} /></span>}
        </div>
        {expanded && (
          <div className="action-desc-full" onClick={e => e.stopPropagation()}>
            <KeywordText text={action.desc} onRoll={onRoll} label={action.name} />
            {action.dice && (
              <div className="action-roll" onClick={e => { e.stopPropagation(); onRoll(action.dice, action.name); }}>
                {t('actions.rollLabel')} {action.dice}
              </div>
            )}
            <div style={{ marginTop:8 }}>
              {editingTags ? (
                <>
                  <TagSelector selected={action.tags||[]} allTags={allTags}
                    onChange={tags => onUpdateTags && onUpdateTags(action.id, tags)}
                    onCreateTag={onCreateTag} />
                  <button className="tag-edit-btn" style={{ marginLeft:6 }} onClick={e => { e.stopPropagation(); setEditingTags(false); }}><Icon id="action.done" size={13} /> {t('actions.tagDone')}</button>
                </>
              ) : (
                <button className="tag-edit-btn" onClick={e => { e.stopPropagation(); setEditingTags(true); }}>
                  <Icon id="action.tag" size={13} /> {(action.tags||[]).length === 0 ? t('actions.addTagBtn') : t('actions.editTagBtn')}
                </button>
              )}
            </div>
            <div className="item-edit-actions">
              <button className="io-btn" onClick={startEdit}><Icon id="action.editItem" size={13} /> {t('common.edit')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Daggerheart helpers ─────────────────────────────────────────
function DHDomainCardForm({ domains, onAdd, onCancel, t }) {
  const [form, setForm] = React.useState({ name:'', domain:'', level:'', type:'ability', desc:'' });
  return (
    <div className="weapon-add-panel" style={{ marginBottom:8 }}>
      <div className="field-row">
        <div className="field">
          <label>{t('identity.name')}</label>
          <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Card name..." autoFocus />
        </div>
        <div className="field">
          <label>{t('dh.domains','Domain')}</label>
          <select value={form.domain} onChange={e => setForm(f => ({...f, domain:e.target.value}))}>
            <option value="">—</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Level</label>
          <input type="number" min="1" max="6" value={form.level} onChange={e => setForm(f => ({...f, level:e.target.value}))} style={{ width:52 }} />
        </div>
      </div>
      <div className="field">
        <label>{t('inventory.descLabel','Description')}</label>
        <textarea rows={2} value={form.desc} onChange={e => setForm(f => ({...f, desc:e.target.value}))} placeholder="Card effect..." style={{ width:'100%' }} />
      </div>
      <div style={{ display:'flex', gap:6, marginTop:6 }}>
        <button className="io-btn primary" onClick={() => form.name && onAdd(form)}>+ {t('common.add','Add')}</button>
        <button className="io-btn" onClick={onCancel}>{t('common.cancel','Cancel')}</button>
      </div>
    </div>
  );
}

function DHPipRow({ current, max, pipClass, onToggle }) {
  return (
    <div className="dh-pip-row">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}
          className={`dh-pip ${pipClass}${i < current ? ' on' : ''}`}
          onClick={() => onToggle(i < current ? i : i + 1)}
        />
      ))}
    </div>
  );
}

function SubclassFeaturesEditor({ features, currentLevel, onChange }) {
  const { t } = useTranslation();
  function add() {
    onChange([...(features || []), { id: `scf_${Date.now()}`, level: Math.min(20, currentLevel + 1), name: '', desc: '' }]);
  }
  function remove(id) { onChange((features || []).filter(f => f.id !== id)); }
  function patch(id, obj) { onChange((features || []).map(f => f.id === id ? { ...f, ...obj } : f)); }
  const sorted = [...(features || [])].sort((a, b) => a.level - b.level);
  return (
    <div>
      {sorted.map(f => (
        <div key={f.id} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: '0 0 58px' }}>
            <label>Lv.</label>
            <input type="number" min="1" max="20" value={f.level}
              onChange={e => patch(f.id, { level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
              style={{ width: 50 }} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <input value={f.name} placeholder={t('identity.subclassFeatureName')}
              onChange={e => patch(f.id, { name: e.target.value })} />
            <textarea value={f.desc} placeholder={t('identity.subclassFeatureDesc')}
              onChange={e => patch(f.id, { desc: e.target.value })}
              className="notes-area" style={{ minHeight: 44 }} />
          </div>
          <button onClick={() => remove(f.id)} className="mod-btn"
            style={{ marginTop: 20, color: 'var(--c-warn)', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button className="io-btn" style={{ fontSize: 12, marginTop: 2 }} onClick={add}>
        + {t('identity.addSubclassFeature')}
      </button>
    </div>
  );
}

function SubclassSection({ state, update, t }) {
  const knownSubs = getSubclassesForClass(
    !state.charClass || state.charClass === '__custom__' ? '' : state.charClass
  );
  const isAlreadyCustom = Boolean(state.charSubclass) && !knownSubs.includes(state.charSubclass);
  const [customMode, setCustomMode] = React.useState(isAlreadyCustom);
  const isCustom = customMode || isAlreadyCustom;
  const selectVal = isCustom ? '__custom__' : (state.charSubclass || '');

  return (
    <>
      <Field label={t('identity.subclass')}>
        <select
          value={selectVal}
          onChange={e => {
            const sub = e.target.value;
            if (sub === '__custom__') {
              setCustomMode(true);
              if (knownSubs.includes(state.charSubclass)) update({ charSubclass: '', subclassFeatures: [] });
            } else {
              setCustomMode(false);
              update({ charSubclass: sub, subclassFeatures: [] });
            }
          }}
          disabled={!state.charClass || state.charClass === '__custom__'}
        >
          <option value="">—</option>
          {knownSubs.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="__custom__">{t('identity.subclassCustom')}</option>
        </select>
        {isCustom && (
          <input style={{ marginTop: 4 }}
            value={state.charSubclass}
            onChange={e => update({ charSubclass: e.target.value })}
            placeholder={t('identity.subclassCustomPlaceholder')} />
        )}
      </Field>
      {isCustom && (
        <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-muted)', marginBottom: 6 }}>{t('identity.subclassFeatures')}</div>
          <SubclassFeaturesEditor
            features={state.subclassFeatures || []}
            currentLevel={state.charLevel}
            onChange={feats => update({ subclassFeatures: feats })}
          />
        </div>
      )}
    </>
  );
}

function HMenuGroup({ label, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="hmenu-group">
      <button className="hmenu-group-btn" onClick={() => setOpen(v => !v)}>
        <span>{label}</span>
        <span className="hmenu-group-caret">{open ? '▾' : '›'}</span>
      </button>
      {open && <div className="hmenu-group-body">{children}</div>}
    </div>
  );
}

// ── Character App (single character) ────────────────────────────
function CharacterApp({ charId, onBackToSelect, onNewChar, activeSystem, onSystemChange }) {
  const { t, i18n } = useTranslation();
  const char = useCharacter(charId);
  const { state, update } = char;

  const dhClasses    = useMemo(() => getDHClasses(i18n.language),    [i18n.language]);
  const dhDomains    = useMemo(() => getDHDomains(i18n.language),    [i18n.language]);
  const dhAncestries = useMemo(() => getDHAncestries(i18n.language), [i18n.language]);
  const dhCommunities= useMemo(() => getDHCommunities(i18n.language),[i18n.language]);
  const dhConditions = useMemo(() => getDHConditions(i18n.language), [i18n.language]);
  const dhTraitUses  = useMemo(() => getDHTraitUses(i18n.language),  [i18n.language]);

  // Layout state
  const [layout, setLayout] = useState(() => loadLayoutForSystem(activeSystem || DEFAULT_SYSTEM));
  const [editMode, setEditMode] = useState(false);
  const [tabs, setTabs] = useState(() => loadTabsForSystem(activeSystem || DEFAULT_SYSTEM));

  useEffect(() => {
    setLayout(loadLayoutForSystem(activeSystem || DEFAULT_SYSTEM));
    setTabs(loadTabsForSystem(activeSystem || DEFAULT_SYSTEM));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSystem]);
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
  const [toastAction, setToastAction] = useState(null);
  const [hpAmount, setHpAmount] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingHP, setEditingHP] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingDHEvasion, setEditingDHEvasion] = useState(false);
  const [dhOpenFeature, setDhOpenFeature] = useState(null);
  const [actionTagFilter, setActionTagFilter] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const [addActionForm, setAddActionForm] = useState({ name:'', type:'action', desc:'', dice:'' });
  const [addOpenFor, setAddOpenFor] = useState(null);
  const [homebrewVersion, setHomebrewVersion] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const [speedInputVal, setSpeedInputVal] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLevelDown, setShowLevelDown] = useState(false);
  const [concentrationCheck, setConcentrationCheck] = useState(null);
  const { mode: themeMode, accentId, setThemeMode, setAccent } = useTheme();
  const { iconMode, setIconMode, iconAccent, setIconAccent } = useIconMode();
  const { weightUnit, speedUnit, setPref: setUnitPref, toDisplayWeight, toDisplaySpeed, fromDisplaySpeed } = useUnits();
  const { prefs: a11y, setPref: setA11y } = useAccessibility();
  const fileInputRef = useRef();
  const toastTimer = useRef();

  function showToast(msg, action = null, duration = null) {
    setToast(msg);
    setToastAction(action);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => { setToast(''); setToastAction(null); }, duration ?? (action ? 3000 : 2500));
  }

  function handleConcentrationRoll(dc) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const conMod = char.abilityMod('CON');
    const prof = state.concentrationProficiency ? char.profBonus : 0;
    const modifier = conMod + prof;
    const total = roll + modifier;
    const passed = total >= dc;
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const outcome = passed ? t('concentration.passed') : t('concentration.failed');
    const msg = `${t('concentration.rollLabel')} ${total} (d20: ${roll}${modStr}) — ${outcome}`;
    if (!passed) update({ concentrating: false, concentratingSpell: null });
    addLog('game.roll', msg);
    showToast(msg);
    setConcentrationCheck(null);
  }

  function handleDeathSaveRoll() {
    const roll = Math.floor(Math.random() * 20) + 1;
    const prevSuccess = [...(state.deathSuccess || [false, false, false])];
    const prevFail    = [...(state.deathFail    || [false, false, false])];
    const undoState   = { deathSuccess: prevSuccess, deathFail: prevFail };

    let updates = {};
    let msg = '';

    if (roll === 20) {
      const succ = [...prevSuccess];
      const idx = succ.indexOf(false); if (idx >= 0) succ[idx] = true;
      const newHp = Math.min(state.hpMax || 0, (state.hpCurrent || 0) + 1);
      updates = { deathSuccess: succ, hpCurrent: newHp };
      undoState.hpCurrent = state.hpCurrent;
      msg = t('deathSave.nat20');
    } else if (roll === 1) {
      const fail = [...prevFail];
      let c = 0;
      for (let i = 0; i < 3 && c < 2; i++) if (!fail[i]) { fail[i] = true; c++; }
      updates = { deathFail: fail };
      msg = t('deathSave.nat1');
    } else if (roll >= 10) {
      const succ = [...prevSuccess];
      const idx = succ.indexOf(false); if (idx >= 0) succ[idx] = true;
      updates = { deathSuccess: succ };
      msg = `${t('deathSave.result', { roll })} — ${t('deathSave.successMark')}`;
    } else {
      const fail = [...prevFail];
      const idx = fail.indexOf(false); if (idx >= 0) fail[idx] = true;
      updates = { deathFail: fail };
      msg = `${t('deathSave.result', { roll })} — ${t('deathSave.failMark')}`;
    }

    update(updates);
    addLog('game.roll', msg);
    showToast(msg, {
      label: t('deathSave.undo'),
      onClick: () => { update(undoState); setToast(''); setToastAction(null); },
    });
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

  const { currentWeightKg, maxWeightKg, coinWeightKg } = useMemo(() => {
    const strScore = state.abilities?.STR || 10;
    const inventoryW = (state.equipment || []).reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.qty || 1), 0);
    const weaponW = (state.weapons || []).reduce((s, w) => s + (parseFloat(w.weight) || 0), 0);
    const armorW = (state.armors || []).reduce((s, a) => s + (parseFloat(a.weight) || 0), 0);
    const totalCoins = Object.values(state.currency || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const coinW_raw = Math.floor(totalCoins / 50);
    const coinW = weightUnit === 'lbs' ? coinW_raw * 2 : coinW_raw;
    const maxW = weightUnit === 'lbs' ? strScore * 15 : strScore * 7;
    return { currentWeightKg: inventoryW + weaponW + armorW + coinW, maxWeightKg: maxW, coinWeightKg: coinW };
  }, [state.equipment, state.weapons, state.armors, state.currency, state.abilities, weightUnit]);

  function createTag() {}

  function handleTabChange(id) {
    if (id.startsWith('__toggle__')) {
      const tabId = id.replace('__toggle__', '');
      const visibleCount = tabs.filter(t => t.visible).length;
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;
      if (tab.visible && (visibleCount <= 1 || tabId === activeTab)) return;
      const next = tabs.map(t => t.id === tabId ? { ...t, visible: !t.visible } : t);
      setTabs(next); saveTabsForSystem(activeSystem || DEFAULT_SYSTEM, next);
      if (tabId === activeTab) {
        const first = next.find(t => t.visible && t.id !== tabId);
        if (first) setActiveTab(first.id);
      }
    } else {
      setActiveTab(id);
    }
  }

  function handleRoll(notation, name) {
    const resolved = resolveNotations(notation, effectiveAbilities, state.charLevel, char.profBonus);
    const result = rollDice(resolved);
    if (result !== null) {
      const display = resolved !== notation ? `${notation} → ${resolved}` : notation;
      let suffix = '';
      if (result.natural === 20 && result.sides === 20) suffix = ` — ⭐ ${t('dice.natural20')}`;
      else if (result.natural === 1 && result.sides === 20) suffix = ` — 💀 ${t('dice.natural1')}`;
      const exhaustionLvl = activeSystem === 'dnd5e' ? (state.exhaustionLevel || 0) : 0;
      const penalty = result.sides === 20 && exhaustionLvl > 0 ? exhaustionLvl * 2 : 0;
      const finalTotal = result.total - penalty;
      const exhNote = penalty > 0 ? ` ${t('dice.exhaustionPenalty', { penalty })}` : '';
      showToast(`${name}: ${display} = ${finalTotal}${suffix}${exhNote}`);
      addLog('game.roll', `${name}: ${display} = ${finalTotal}${suffix}${exhNote}`);
    }
  }
  function handleHitDiceRoll() {
    const available = state.charLevel - (state.hitDiceUsed || 0);
    if (available <= 0) return;
    const dieType = HIT_DICE[state.charClass] || 'd8';
    const dieSize = parseInt(dieType.replace('d', ''));
    const roll = Math.floor(Math.random() * dieSize) + 1;
    const conMod = char.abilityMod('CON');
    const healing = Math.max(1, roll + conMod);
    const modStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
    update({ hitDiceUsed: (state.hitDiceUsed || 0) + 1 });
    char.modHP(healing);
    const msg = t('hp.hitDiceResult', { die: dieType, roll, mod: modStr, total: healing });
    showToast(msg);
    addLog('game.heal', msg);
  }

  function handleLongRest() {
    char.longRest();
    update({ hitDiceUsed: 0, exhaustionLevel: Math.max(0, (state.exhaustionLevel || 0) - 1) });
    showToast(t('toast.longRest'));
    addLog('game.longRest', t('toast.longRest'));
    window.umami?.track('long-rest');
  }
  function handleShortRest() {
    char.shortRest();
    showToast(
      <>{t('toast.shortRestMain')} <em className="toast-hint">{t('toast.shortRestHint')}</em></>,
      { label: t('common.done'), onClick: () => { setToast(''); setToastAction(null); } },
      10000
    );
    addLog('game.shortRest', t('toast.shortRest'));
  }
  function handleCastSpell(spell, level) {
    const updates = {};
    if (spell.level > 0 && level > 0) {
      const slot = (state.spellSlots || [])[level - 1];
      if (!slot || slot.used >= slot.max) { showToast(t('toast.noSlot')); return; }
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
    addLog('tab.spells', `${spell.name}${lvlNote}`);
    showToast(t('toast.spellCast', { name: spell.name }));
  }

  function handleCreatorComplete(newState) {
    setShowCreator(false);
    showToast(t('toast.creatorDone', { name: newState.charName }));
    if (onNewChar) onNewChar(newState);
  }
  function handleImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { char.importState(JSON.parse(ev.target.result)); showToast(t('toast.imported')); window.umami?.track('character-imported'); }
      catch { showToast(t('toast.importError')); }
    };
    reader.readAsText(file); e.target.value = '';
  }
  function handleExport() {
    const blob = new Blob([char.exportState()], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${state.charName||'personaggio'}.json`;
    a.click(); URL.revokeObjectURL(url);
    window.umami?.track('character-exported');
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
    saveLayoutForSystem(activeSystem || DEFAULT_SYSTEM, next);
  }

  function restoreWidget(id) {
    const next = layout.map(w => w.id === id ? { ...w, visible: true, tab: activeTab } : w);
    setLayout(next); saveLayoutForSystem(activeSystem || DEFAULT_SYSTEM, next);
  }

  const tabWidgets = getWidgetsForTab(layout, activeTab);
  const hiddenWidgets = layout
    .filter(w => w.visible === false)
    .map(w => ({ ...w, label: getWidgetLabel(w.id) }));

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
            <span><Icon id="widget.identity" /> {t('widgets.identity')}</span>
            <button className={`icon-btn ${editingIdentity ? 'active' : ''}`} onClick={() => setEditingIdentity(v => !v)}>
              {editingIdentity ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="identity-layout">
            {state.charImage && (
              <img src={state.charImage} alt={t('widgets.identity')} className="char-thumbnail"
                onError={e => { e.target.style.display='none'; }} />
            )}
            {editingIdentity ? (() => {
                const knownClasses = dataManager.getClasses();
                const isCustomClass = !state.charClass ? false : !knownClasses.includes(state.charClass);
                const classSelectVal = isCustomClass ? '__custom__' : (state.charClass || '');
                return (
                  <div className="grid-2" style={{ flex:1 }}>
                    <Field label={t('identity.name')}>
                      <input value={state.charName} onChange={e => update({ charName: e.target.value })} placeholder="Es. Aldric Voss" />
                    </Field>
                    <Field label={t('identity.class')}>
                      <select value={classSelectVal} onChange={e => {
                        const cls = e.target.value;
                        if (cls === '__custom__') {
                          update({ charClass: '__custom__', charClassCustom: isCustomClass ? state.charClass : '' });
                        } else {
                          char.onClassOrLevelChange({ charClass: cls });
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'class');
                          update({ features: [...kept, ...getAutoFeatures('class', cls, CLASS_FEATURES)] });
                        }
                      }}>
                        <option value="">{t('identity.classPlaceholder')}</option>
                        {[...knownClasses].sort((a, b) => t(`data.classes.${a}`, a).localeCompare(t(`data.classes.${b}`, b))).map(c => <option key={c} value={c}>{t(`data.classes.${c}`, c)}</option>)}
                        <option value="__custom__">{t('identity.classCustom')}</option>
                      </select>
                      {isCustomClass && (
                        <input style={{ marginTop:4 }}
                          value={state.charClass === '__custom__' ? (state.charClassCustom||'') : state.charClass}
                          onChange={e => {
                            if (state.charClass === '__custom__') update({ charClassCustom: e.target.value });
                            else update({ charClass: e.target.value });
                          }}
                          placeholder={t('identity.classCustomPlaceholder')} />
                      )}
                    </Field>
                    <SubclassSection state={state} update={update} t={t} />
                    <Field label={t('identity.species')}>
                      <select value={state.charRace} onChange={e => {
                        const race = e.target.value;
                        if (race && race !== '__custom__') {
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'species');
                          update({ charRace: race, features: [...kept, ...getAutoFeatures('species', race, SPECIES_FEATURES)] });
                        } else {
                          update({ charRace: race });
                        }
                      }}>
                        <option value="">{t('identity.speciesPlaceholder')}</option>
                        {dataManager.getSpecies().slice().sort((a, b) => t(`data.species.${a.id}`, a.name).localeCompare(t(`data.species.${b.id}`, b.name))).map(r => <option key={r.id} value={r.id}>{t(`data.species.${r.id}`, r.name)}</option>)}
                        <option value="__custom__">{t('identity.speciesCustom')}</option>
                      </select>
                      {state.charRace === '__custom__' && (
                        <input style={{ marginTop:4 }} value={state.charRaceCustom||''} onChange={e => update({ charRaceCustom: e.target.value })} placeholder={t('identity.speciesCustomPlaceholder')} />
                      )}
                    </Field>
                    <Field label={t('identity.background')}>
                      <select value={state.charBackground} onChange={e => {
                        const bg = e.target.value;
                        if (bg && bg !== '__custom__') {
                          const kept = (state.features||[]).filter(f => f.sourceType !== 'background');
                          update({ charBackground: bg, features: [...kept, ...getAutoFeatures('background', bg, BACKGROUND_FEATURES)] });
                        } else {
                          update({ charBackground: bg });
                        }
                      }}>
                        <option value="">{t('identity.backgroundPlaceholder')}</option>
                        {dataManager.getBackgrounds().slice().sort((a, b) => t(`data.backgrounds.${a.id || a.name}`, a.name).localeCompare(t(`data.backgrounds.${b.id || b.name}`, b.name))).map(b => <option key={b.id || b.name} value={b.id || b.name}>{t(`data.backgrounds.${b.id || b.name}`, b.name)}</option>)}
                        <option value="__custom__">{t('identity.backgroundCustom')}</option>
                      </select>
                      {state.charBackground === '__custom__' && (
                        <input style={{ marginTop:4 }} value={state.charBackgroundCustom||''} onChange={e => update({ charBackgroundCustom: e.target.value })} placeholder={t('identity.backgroundCustomPlaceholder')} />
                      )}
                    </Field>
                    <Field label={t('identity.level')}>
                      <div className="hp-stepper" style={{ gap:4 }}>
                        {activeSystem === 'dnd5e'
                          ? <button className="mod-btn" style={{ color: state.charLevel > 1 ? 'var(--c-warn)' : undefined }} disabled={state.charLevel <= 1} onClick={() => setShowLevelDown(true)}>−</button>
                          : <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.max(1, state.charLevel-1) })}>−</button>
                        }
                        <input type="number" min="1" max="20" style={{ width:50, textAlign:'center' }} value={state.charLevel} onChange={e => char.onClassOrLevelChange({ charLevel: Math.max(1, parseInt(e.target.value)||1) })} />
                        {activeSystem === 'dnd5e'
                          ? <button className="mod-btn" style={{ color: state.charLevel < 20 ? 'var(--c-accent)' : undefined }} disabled={state.charLevel >= 20} onClick={() => setShowLevelUp(true)}>+</button>
                          : <button className="mod-btn" onClick={() => char.onClassOrLevelChange({ charLevel: Math.min(20, state.charLevel+1) })}>+</button>
                        }
                      </div>
                    </Field>
                    <Field label={t('identity.profBonus')}><input value={`+${char.profBonus}`} readOnly /></Field>
                    <Field label={t('identity.alignment')}>
                      <AlignmentPicker value={state.charAlignment} onChange={a => update({ charAlignment: a })} />
                    </Field>
                    <Field label={t('identity.xp')}>
                      <input type="number" min="0" value={state.charXP} onChange={e => update({ charXP: parseInt(e.target.value)||0 })} />
                    </Field>
                  </div>
                );
              })() : (
              <div className="identity-info-grid">
                {[
                  [t('identity.name'), state.charName || '—'],
                  [t('identity.class'), state.charClass ? t(`data.classes.${state.charClass}`, state.charClass) : '—'],
                  ...(state.charSubclass ? [[t('identity.subclass'), state.charSubclass]] : []),
                  [t('identity.level'), state.charLevel],
                  [t('identity.profBonus'), `+${char.profBonus}`],
                  [t('identity.species'), state.charRace === '__custom__' ? (state.charRaceCustom||'—') : (state.charRace ? t(`data.species.${state.charRace}`, state.charRace) : '—')],
                  [t('identity.background'), state.charBackground === '__custom__' ? (state.charBackgroundCustom||'—') : (state.charBackground ? t(`data.backgrounds.${state.charBackground}`, state.charBackground) : '—')],
                  [t('identity.alignment'), state.charAlignment ? t(`data.alignments.${state.charAlignment}`, state.charAlignment) : '—'],
                  ...(state.charXP ? [[t('identity.experienceShort'), state.charXP]] : []),
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
            <Field label={t('identity.imageUrl')}>
              <input value={state.charImage||''} onChange={e => update({ charImage: e.target.value })}
                placeholder="https://..." style={{ marginTop:6 }} />
            </Field>
          )}
        </div>
      );

      case 'abilities': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.abilities" /> {t('widgets.abilities')}</span>
            <button className={`icon-btn ${editingAbilities ? 'active' : ''}`} onClick={() => setEditingAbilities(e => !e)}>
              {editingAbilities ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="grid-6">
            {ABILITIES.map(attr => (
              <AbilityBox key={attr} attr={attr} score={state.abilities[attr]}
                effectiveScore={effectiveAbilities[attr]}
                onAdjust={(a,d) => char.setAbility(a, (state.abilities[a]||10)+d)}
                onInput={char.setAbility} editing={editingAbilities} onHover={setHoveredAttr}
                onRoll={!editingAbilities ? (a, mod) => handleRoll(`1d20${mod >= 0 ? '+' : ''}${mod}`, t(`data.abilities.${a}`)) : undefined}
                bonus={equipBonuses[attr] || 0}
                bonusSources={equipBonusesDetailed[attr] || []} />
            ))}
          </div>
        </div>
      );

      case 'saves': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.saves" /> {t('widgets.saves')}</div>
          <div className="check-list">
            {ABILITIES.map(attr => {
              const prof = state.saveProficiencies.includes(attr);
              const effMod = getMod(effectiveAbilities[attr]) + (prof ? char.profBonus : 0) + (equipBonuses[`TS-${attr}`] || 0);
              const tsBonus = equipBonuses[`TS-${attr}`] || 0;
              return (
                <div key={attr} className={`check-item ${hoveredAttr === attr ? 'attr-highlight' : ''}`}
                  onClick={() => handleRoll(`1d20${effMod >= 0 ? '+' : ''}${effMod}`, t(`data.abilities.${attr}`))}>
                  <div className={`check-dot ${prof ? 'proficient' : ''}`}
                    onClick={e => { e.stopPropagation(); char.toggleSaveProficiency(attr); }} />
                  <span className="check-val">{fmtMod(effMod)}</span>
                  <span className="check-name">{t(`data.abilities.${attr}`)}</span>
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
          <div className="card-title"><Icon id="widget.skills" /> {t('widgets.skills')}</div>
          <div className="check-list">
            {SKILLS.map(sk => {
              const prof = state.skillProficiencies.includes(sk.id);
              const exp = state.skillExpertise.includes(sk.id);
              const effSkMod = getMod(effectiveAbilities[sk.attr]) + (exp ? char.profBonus*2 : prof ? char.profBonus : 0);
              return (
                <div key={sk.id} className={`check-item ${hoveredAttr === sk.attr ? 'attr-highlight' : ''}`}
                  onClick={() => handleRoll(`1d20${effSkMod >= 0 ? '+' : ''}${effSkMod}`, t(`data.skills.${sk.id}`))}>
                  <div className={`check-dot ${exp ? 'expertise' : prof ? 'proficient' : ''}`}
                    onClick={e => { e.stopPropagation(); char.toggleSkillProficiency(sk.id); }} />
                  <span className="check-val">{fmtMod(effSkMod)}</span>
                  <span className="check-name">{t(`data.skills.${sk.id}`)}</span>
                  <span className="check-attr">{t(`data.abilityAbbr.${sk.attr}`)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

      case 'senses': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.senses" /> {t('widgets.senses')}</div>
          <div className="field-row">
            <Field label={t('senses.passivePerception')}><input value={char.passivePerception} readOnly /></Field>
            <Field label={t('senses.hitDice')}><input value={char.hitDice} readOnly /></Field>
          </div>
        </div>
      );

      case 'hp': return (
        <div className={`card${ce}`}>
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.hp" /> {t('widgets.hp')}</span>
            <button className={`icon-btn ${editingHP ? 'active' : ''}`} onClick={() => setEditingHP(e => !e)}>
              {editingHP ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
            </button>
          </div>
          <div className="hp-labeled-row">
            <div className="hp-labeled-group">
              <div className="hp-label">{t('hp.current')}</div>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.max(0, state.hpCurrent-1) })}>−</button>
                <input className="hp-big" type="number" value={state.hpCurrent} onChange={e => update({ hpCurrent: Math.max(0, parseInt(e.target.value)||0) })} />
                <button className="mod-btn" onClick={() => update({ hpCurrent: Math.min(state.hpMax, state.hpCurrent+1) })}>+</button>
              </div>
            </div>
            <span className="hp-sep">/</span>
            <div className="hp-labeled-group">
              <div className="hp-label">
                {t('hp.max')}{editingHP ? t('hp.maxBase') : ''}
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
              if (hpAmount > 0 && (state.concentrating || state.concentratingSpell)) {
                setConcentrationCheck({ dc: Math.max(10, Math.floor(hpAmount / 2)) });
              }
            }}><Icon id="game.damage" size={13} /> {t('hp.damage')}</button>
            <button className="hp-action-btn success" onClick={() => char.modHP(hpAmount)}><Icon id="game.heal" size={13} /> {t('hp.heal')}</button>
            <button className="hp-action-btn temp" onClick={() => update({ hpTemp: hpAmount })}><Icon id="game.tempHp" size={13} /> {t('hp.tempBtn')}</button>
          </div>
          {activeSystem === 'dnd5e' && (
            <div className="hit-dice-row">
              <span className="hit-dice-label">{t('hp.hitDiceLabel')}</span>
              <button className="mod-btn" onClick={() => update({ hitDiceUsed: Math.min(state.charLevel, (state.hitDiceUsed||0)+1) })} disabled={(state.hitDiceUsed||0) >= state.charLevel}>−</button>
              <span className="hit-dice-count">
                {state.charLevel - (state.hitDiceUsed||0)}<span style={{ color:'var(--c-muted)', fontWeight:400 }}>/{state.charLevel} {HIT_DICE[state.charClass] || 'd8'}</span>
              </span>
              <button className="mod-btn" onClick={() => update({ hitDiceUsed: Math.max(0, (state.hitDiceUsed||0)-1) })} disabled={(state.hitDiceUsed||0) <= 0}>+</button>
              <button className="hit-dice-use-btn" onClick={handleHitDiceRoll} disabled={(state.hitDiceUsed||0) >= state.charLevel}>
                <Icon id="game.roll" size={12} /> {t('hp.hitDiceRollBtn')}
              </button>
            </div>
          )}
          {concentrationCheck && (
            <div className="concentration-banner">
              <div className="concentration-banner-text">
                <Icon id="game.concentration" size={14} />
                {t('concentration.checkRequired', { dc: concentrationCheck.dc })}
              </div>
              <div className="concentration-banner-actions">
                <button className="io-btn primary" onClick={() => handleConcentrationRoll(concentrationCheck.dc)}>
                  🎲 {t('concentration.rollBtn')}
                </button>
                <button className="io-btn" onClick={() => setConcentrationCheck(null)}>
                  {t('concentration.passBtn')}
                </button>
                <button className="io-btn danger" onClick={() => {
                  update({ concentrating: false, concentratingSpell: null });
                  setConcentrationCheck(null);
                }}>
                  {t('concentration.failBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      );

      case 'combatStats': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.combatStats" /> {t('widgets.combatStats')}</div>
          <div className="grid-3">
            <div className="stat-pill">
              <div className="stat-pill-label">{t('combat.ac')}</div>
              <input className="stat-pill-input" type="number"
                value={state.ac + (equipBonuses.AC || 0)}
                onChange={e => update({ ac: (parseInt(e.target.value)||10) - (equipBonuses.AC||0) })} />
              {equipBonuses.AC ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.AC||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
            <div className="stat-pill clickable-stat"
              onClick={() => { const im = getMod(effectiveAbilities.DEX) + (equipBonuses.INIT || 0); handleRoll(`1d20${im >= 0 ? '+' : ''}${im}`, 'Iniziativa'); }}
              title={`Tira iniziativa: 1d20${fmtMod(getMod(effectiveAbilities.DEX) + (equipBonuses.INIT || 0))}`}>
              <div className="stat-pill-label">{t('combat.initiative')}</div>
              <div className="stat-pill-val">{fmtMod(getMod(effectiveAbilities.DEX) + (equipBonuses.INIT || 0))}</div>
              {equipBonuses.INIT ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.INIT||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
            <div className="stat-pill">
              <div className="stat-pill-label">{t('combat.speed')}</div>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                <input className="stat-pill-input" type="text" inputMode="decimal"
                  value={speedInputVal !== null ? speedInputVal : String(toDisplaySpeed(parseSpeedFt(state.speed)))}
                  onFocus={() => setSpeedInputVal(String(toDisplaySpeed(parseSpeedFt(state.speed))))}
                  onChange={e => setSpeedInputVal(e.target.value)}
                  onBlur={() => { update({ speed: String(fromDisplaySpeed(speedInputVal ?? '0')) }); setSpeedInputVal(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { update({ speed: String(fromDisplaySpeed(speedInputVal ?? '0')) }); setSpeedInputVal(null); e.target.blur(); } }} />
                <span style={{ fontSize:10, color:'var(--c-muted)', whiteSpace:'nowrap' }}>
                  {speedUnit === 'sq' ? '□' : speedUnit}
                </span>
              </div>
              {equipBonuses.SPD ? (
                <span className="equip-bonus-badge"
                  title={(equipBonusesDetailed.SPD||[]).map(s=>`${s.name}: ${s.value>=0?'+':''}${s.value}`).join(', ')}>
                  🎒
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );

      case 'inspiration': return (
        <div className="card">
          <div className="card-title" style={{ marginBottom:12 }}><Icon id="widget.inspiration" /> {t('widgets.inspiration')}</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className={`inspiration-btn ${state.inspiration ? 'active' : ''}`} onClick={() => update({ inspiration:!state.inspiration })}><Icon id="game.inspiration" size={20} /></button>
            <span className="toggle-label" style={{ color: state.inspiration ? '#856404' : 'var(--c-hint)' }}>
              {state.inspiration ? t('combat.inspiration') : t('combat.noInspiration')}
            </span>
          </div>
        </div>
      );

      case 'deathSaves': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.deathSaves" /> {t('widgets.deathSaves')}</div>
          <div className="death-saves">
            {['success','failure'].map(type => (
              <div key={type} className="save-group">
                <div className="save-group-label">{type === 'success' ? t('combat.deathSuccess') : t('combat.deathFail')}</div>
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
            <button className="death-save-roll-btn" onClick={handleDeathSaveRoll}>
              <Icon id="game.roll" size={14} /> {t('deathSave.rollBtn')}
            </button>
          </div>
        </div>
      );

      case 'conditions': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.conditions" /> {t('widgets.conditions')}</div>
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
            <span><Icon id="widget.actions" /> {t('widgets.actions')}</span>
            <button className={`icon-btn ${addOpenFor === 'actions' ? 'active' : ''}`}
              onClick={() => {
                const defaultType = ACTION_TYPE_KEYS.includes(actionFilter) ? actionFilter : 'action';
                setAddActionForm(f => ({ ...f, type: defaultType }));
                setAddOpenFor(v => v === 'actions' ? null : 'actions');
              }}>+</button>
          </div>
          <div className="filter-bar">
            {[['all', t('actions.filterAll')],['action', t('actions.filterAction')],['bonus', t('actions.filterBonus')],['reaction', t('actions.filterReaction')],['free', t('actions.filterFree')]].map(([v,l]) => (
              <button key={v} className={`filter-chip ${actionFilter === v ? 'active' : ''}`} onClick={() => setActionFilter(v)}>{l}</button>
            ))}
          </div>
          {allTags.length > 0 && <TagFilterBar allTags={allTags} activeTag={actionTagFilter} onSelect={setActionTagFilter} />}
          {addOpenFor === 'actions' && (
            <div className="weapon-add-panel" style={{ marginBottom:8 }}>
              <div className="field-row">
                <div className="field">
                  <label>{t('actions.addFormName')}</label>
                  <input value={addActionForm.name} onChange={e => setAddActionForm(f => ({...f, name:e.target.value}))} placeholder={t('actions.addFormNamePlaceholder')} autoFocus />
                </div>
                <div className="field">
                  <label>{t('actions.addFormType')}</label>
                  <select value={addActionForm.type} onChange={e => setAddActionForm(f => ({...f, type:e.target.value}))}>
                    {ACTION_TYPE_KEYS.map(v => <option key={v} value={v}>{t(`actions.type${v.charAt(0).toUpperCase()+v.slice(1)}`)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t('actions.addFormDice')}</label>
                  <input value={addActionForm.dice} onChange={e => setAddActionForm(f => ({...f, dice:e.target.value}))} placeholder={t('actions.addFormDicePlaceholder')} />
                </div>
              </div>
              <div className="field" style={{ marginTop:6 }}>
                <label>{t('actions.addFormDesc')}</label>
                <textarea className="notes-area" style={{ minHeight:48 }} value={addActionForm.desc} onChange={e => setAddActionForm(f => ({...f, desc:e.target.value}))} placeholder={t('actions.addFormDescPlaceholder')} />
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, justifyContent:'flex-end' }}>
                <button className="io-btn" onClick={() => { setAddOpenFor(null); setAddActionForm({ name:'', type:'action', desc:'', dice:'' }); }}>{t('common.cancel')}</button>
                <button className="io-btn primary" disabled={!addActionForm.name.trim()} onClick={() => {
                  if (!addActionForm.name.trim()) return;
                  update({ actions: [...(state.actions||[]), { ...addActionForm, id: Date.now().toString() }] });
                  setAddOpenFor(null);
                  setAddActionForm({ name:'', type:'action', desc:'', dice:'' });
                }}>{t('common.add')}</button>
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
            <span><Icon id="widget.weapons" /> {t('widgets.weapons')}</span>
            <button className={`icon-btn ${addOpenFor === 'weapons' ? 'active' : ''}`}
              onClick={() => setAddOpenFor(v => v === 'weapons' ? null : 'weapons')}>+</button>
          </div>
          <WeaponManager weapons={state.weapons||[]} abilities={state.abilities} profBonus={char.profBonus}
            onUpdate={weapons => update({ weapons })} onRoll={handleRoll}
            proficiency={state.weaponProficiency||''} onUpdateProficiency={v => update({ weaponProficiency: v })}
            actionNames={actionNames} addOpen={addOpenFor === 'weapons'} onAddClose={() => setAddOpenFor(null)}
            allTags={allTags} weightUnit={weightUnit}
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

      case 'armor': {
        // Backward compat: migrate old equippedArmor/hasShield to armors list
        let armorList = state.armors || [];
        if (armorList.length === 0 && (state.equippedArmor || state.hasShield)) {
          armorList = [];
          if (state.equippedArmor) armorList.push({
            id: state.equippedArmor.id || 'migrated_armor',
            name: state.equippedArmor.name, type: 'armor',
            armorType: state.equippedArmor.type || 'medium',
            acValue: calcArmorAC(state.equippedArmor, char.abilityMod('DES')),
            isProficient: true, equipped: true, desc: '', weight: '', tags: [],
          });
          if (state.hasShield) armorList.push({
            id: 'migrated_shield', name: 'Scudo', type: 'shield',
            acValue: 2, isProficient: true, equipped: true, desc: '', weight: '', tags: [],
          });
        }
        function onArmorUpdate(next) {
          const ea = next.find(a => a.type === 'armor' && a.equipped);
          const shieldBonus = next.filter(a => a.type === 'shield' && a.equipped).reduce((s, sh) => s + (sh.acValue || 2), 0);
          const armorAC = ea ? ea.acValue : (10 + char.abilityMod('DES'));
          update({ armors: next, ac: armorAC + shieldBonus });
        }
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.armor" /> {t('widgets.armor')}</span>
              <button className={`icon-btn ${addOpenFor === 'armor' ? 'active' : ''}`}
                onClick={() => setAddOpenFor(v => v === 'armor' ? null : 'armor')}>+</button>
            </div>
            <ArmorManager
              armors={armorList}
              desMod={char.abilityMod('DES')}
              onUpdate={onArmorUpdate}
              proficiency={state.armorProficiency||''} onUpdateProficiency={v => update({ armorProficiency: v })}
              allTags={allTags} weightUnit={weightUnit}
              onUpdateTags={(id, tags) => update({ armors: armorList.map(a => a.id===id ? {...a,tags} : a) })}
              onCreateTag={createTag}
              addOpen={addOpenFor === 'armor'} onAddClose={() => setAddOpenFor(null)}
            />
          </div>
        );
      }

      case 'spellStats': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.spellStats" /> {t('widgets.spellStats')}</div>
          {hasSpells ? (
            <div className="field-row">
              <Field label={t('spells.spellcastingStat')}><input value={char.spellStat||'—'} readOnly /></Field>
              <Field label={t('spells.saveDC')}><input value={char.spellSaveDC??'—'} readOnly /></Field>
              <Field label={t('spells.attackBonus')}><input value={char.spellAttackBonus??'—'} readOnly /></Field>
            </div>
          ) : <p className="hint-text">{t('spells.noSpellcaster')}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, paddingTop:8, borderTop:'0.5px solid var(--c-border)' }}>
            <button className={`inspiration-btn ${state.concentrating ? 'active' : ''}`}
              style={state.concentrating ? { borderColor:'#185FA5', background:'#E6F1FB', boxShadow:'0 0 12px rgba(24,95,165,.35)' } : {}}
              onClick={() => update({ concentrating:!state.concentrating, concentratingSpell: state.concentrating ? null : state.concentratingSpell })}><Icon id="game.concentration" size={20} /></button>
            <span className="toggle-label" style={{ color: state.concentrating ? '#185FA5' : 'var(--c-hint)' }}>
              {state.concentrating
                ? (state.concentratingSpell ? `${t('combat.concentrating')} (${state.concentratingSpell})` : t('combat.concentrating'))
                : t('combat.noConcentration')}
            </span>
          </div>
        </div>
      );

      case 'spellSlots': return (
        <div className="card">
          <div className="card-title">
            <Icon id="widget.spellSlots" /> {t('widgets.spellSlots')}
          </div>
          {hasSpells && state.spellSlots.length > 0
            ? <SpellSlots slots={state.spellSlots} onToggle={char.toggleSpellSlot} />
            : <p className="hint-text">{t('spells.noSlots')}</p>}
        </div>
      );

      case 'spells': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.spells" /> {t('widgets.spells')}</div>
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
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })}
            homebrewKey={homebrewVersion} />
        </div>
      );

      case 'currency': {
        const CURR = [['PP',t('currency.pp'),'#7B68EE'],['GP',t('currency.gp'),'#633806'],['SP',t('currency.sp'),'#888780'],['CP',t('currency.cp'),'#854F0B']];
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
          <div className="card-title"><Icon id="widget.currency" /> {t('widgets.currency')}</div>
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
            <span><Icon id="tab.inventory" /> {t('widgets.inventory')}</span>
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
            onRemoveAction={name => update({ actions: (state.actions||[]).filter(a => a.name !== name) })}
            currentWeightKg={currentWeightKg}
            maxWeightKg={maxWeightKg}
            coinWeightKg={coinWeightKg}
            weightUnit={weightUnit}
            toDisplayWeight={toDisplayWeight} />
        </div>
      );

      case 'traits': {
        const traitsFullWidth = layout.find(w => w.id === 'traits')?.fullWidth ?? true;
        return (
        <div className="card">
          <div className="card-title"><Icon id="widget.traits" /> {t('widgets.traits')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: traitsFullWidth ? '1fr 1fr' : '1fr', gap: 10 }}>
            {[
              ['personality', t('notes.personalityLabel'), t('notes.personalityPlaceholder')],
              ['ideals',      t('notes.idealsLabel'),      t('notes.idealsPlaceholder')],
              ['bonds',       t('notes.bondsLabel'),       t('notes.bondsPlaceholder')],
              ['flaws',       t('notes.flawsLabel'),       t('notes.flawsPlaceholder')],
            ].map(([key,label,ph]) => (
              <Field key={key} label={label}>
                <textarea className="notes-area" placeholder={ph} value={state.notes[key]||''}
                  onChange={e => update({ notes:{...state.notes,[key]:e.target.value} })} />
              </Field>
            ))}
          </div>
        </div>
      );
      }

      case 'freeNotes': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.notes" /> {t('widgets.freeNotes')}</div>
          <textarea className="notes-area" style={{ minHeight:180 }}
            placeholder={t('notes.freeNotesPlaceholder')}
            value={state.notes.free||''} onChange={e => update({ notes:{...state.notes,free:e.target.value} })} />
        </div>
      );

      case 'classFeatures': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.spellStats" /> {t('widgets.classFeatures')}</span>
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
            <span><Icon id="widget.activityLog" /> {t('widgets.activityLog')}</span>
            {activityLog.length > 0 && (
              <button className="icon-btn" onClick={() => {
                setActivityLog([]);
                try { localStorage.removeItem('characterforge_log'); } catch {}
              }}>{t('activityLog.clearBtn')}</button>
            )}
          </div>
          {activityLog.length === 0
            ? <div className="hint-text">{t('activityLog.empty')}</div>
            : (
              <div className="activity-log-list">
                {activityLog.map(e => (
                  <div key={e.id} className="activity-log-entry">
                    <span className="activity-log-icon"><Icon id={e.icon} size={13} fallback={e.icon} /></span>
                    <span className="activity-log-text">{e.text}</span>
                    <span className="activity-log-ts">{e.ts}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      );

      // ── Daggerheart widgets ──────────────────────────────────────

      case 'dh-identity': {
        const dhClass = dhClasses.find(c => c.id === state.charClass);
        return (
          <div className={`card${editingIdentity ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.identity" /> {t('dh.widgets.identity','Identity')}</span>
              <button className={`icon-btn ${editingIdentity ? 'active' : ''}`} onClick={() => setEditingIdentity(v => !v)}>
                {editingIdentity ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            {editingIdentity ? (
              <div className="grid-2">
                <Field label={t('creator.nameLabel')}><input value={state.charName||''} onChange={e => update({ charName: e.target.value })} /></Field>
                <Field label={t('identity.class')}>
                  <select value={state.charClass||''} onChange={e => {
                    const cls = dhClasses.find(c => c.id === e.target.value);
                    update({ charClass: e.target.value, charSubclass:'', evasion: cls?.evasion||10, hpMax: cls?.hp||6, stressMax: cls?.stress||6 });
                    setDhOpenFeature(null);
                  }}>
                    <option value="">—</option>
                    {dhClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.subclass','Subclass')}>
                  <select value={state.charSubclass||''} onChange={e => update({ charSubclass: e.target.value })} disabled={!dhClass}>
                    <option value="">—</option>
                    {(dhClass?.subclasses||[]).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.ancestry','Ancestry')}>
                  <select value={state.ancestry||''} onChange={e => update({ ancestry: e.target.value })}>
                    <option value="">—</option>
                    {dhAncestries.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label={t('dh.community','Community')}>
                  <select value={state.community||''} onChange={e => update({ community: e.target.value })}>
                    <option value="">—</option>
                    {dhCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label={t('identity.level')}>
                  <div className="hp-stepper" style={{ gap:4 }}>
                    <button className="mod-btn" onClick={() => { const lv=Math.max(1,(state.charLevel||1)-1); update({ charLevel:lv, proficiency:getDHTier(lv) }); }}>−</button>
                    <input type="number" min="1" max="10" style={{ width:50, textAlign:'center' }} value={state.charLevel||1}
                      onChange={e => { const lv=Math.max(1,Math.min(10,parseInt(e.target.value)||1)); update({ charLevel:lv, proficiency:getDHTier(lv) }); }} />
                    <button className="mod-btn" onClick={() => { const lv=Math.min(10,(state.charLevel||1)+1); update({ charLevel:lv, proficiency:getDHTier(lv) }); }}>+</button>
                  </div>
                </Field>
                <Field label={t('dh.proficiency','Proficiency')}>
                  <div className="hp-stepper" style={{ gap:4 }}>
                    <button className="mod-btn" onClick={() => update({ proficiency:Math.max(getDHTier(state.charLevel||1),(state.proficiency||1)-1) })}>−</button>
                    <input type="number" style={{ width:50, textAlign:'center' }} value={state.proficiency||1}
                      onChange={e => update({ proficiency:Math.max(getDHTier(state.charLevel||1),parseInt(e.target.value)||1) })} />
                    <button className="mod-btn" onClick={() => update({ proficiency:(state.proficiency||1)+1 })}>+</button>
                  </div>
                </Field>
              </div>
            ) : (
              <div className="identity-info-grid">
                {[
                  [t('identity.name'), state.charName||'—'],
                  [t('identity.class'), dhClass?.name||'—'],
                  [t('dh.subclass','Subclass'), state.charSubclass||'—'],
                  [t('dh.ancestry','Ancestry'), state.ancestry||'—'],
                  [t('dh.community','Community'), state.community||'—'],
                  [t('identity.level'), `${state.charLevel||1} (Tier ${getDHTier(state.charLevel||1)})`],
                  [t('dh.proficiency','Proficiency'), `+${state.proficiency||getDHTier(state.charLevel||1)}`],
                ].map(([label,val]) => (
                  <div key={label} className="identity-info-item">
                    <div className="identity-info-label">{label}</div>
                    <div className="identity-info-val">{val}</div>
                  </div>
                ))}
              </div>
            )}
            {dhClass?.features?.length > 0 && (
              <div className="dh-class-features">
                <div className="dh-class-features-title">{t('dh.classFeatures','Class Features')}</div>
                {dhClass.features.map(feat => (
                  <div key={feat.name} className={`dh-class-feature-item${dhOpenFeature === feat.name ? ' open' : ''}`}
                    onClick={() => setDhOpenFeature(dhOpenFeature === feat.name ? null : feat.name)}>
                    <div className="dh-class-feature-header">
                      <span className="dh-class-feature-name">{feat.name}</span>
                      <span className="dh-class-feature-chevron">{dhOpenFeature === feat.name ? '▲' : '▼'}</span>
                    </div>
                    {dhOpenFeature === feat.name && (
                      <div className="dh-class-feature-desc">{feat.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'dh-traits': {
        const traits = state.traits || { AGI:0, STR:0, FIN:0, INS:0, PRE:0, KNO:0 };
        return (
          <div className={`card${editingAbilities ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.abilities" /> {t('dh.widgets.traits','Traits')}</span>
              <button className={`icon-btn ${editingAbilities ? 'active' : ''}`} onClick={() => setEditingAbilities(v => !v)}>
                {editingAbilities ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <div className="grid-6">
              {DH_TRAITS.map(tr => {
                const mod = traits[tr] ?? 0;
                return (
                  <div key={tr} className={`ability-box ${editingAbilities ? 'editing' : ''}`}>
                    <div className="ability-label">{t(`dh.traits.${tr}`, DH_TRAIT_NAMES[tr])}</div>
                    {editingAbilities ? (
                      <div className="hp-stepper" style={{ gap:2, justifyContent:'center' }}>
                        <button className="mod-btn" onClick={() => update({ traits:{ ...traits, [tr]:mod-1 } })}>−</button>
                        <span style={{ minWidth:20, textAlign:'center', fontWeight:700 }}>{mod>=0?`+${mod}`:mod}</span>
                        <button className="mod-btn" onClick={() => update({ traits:{ ...traits, [tr]:mod+1 } })}>+</button>
                      </div>
                    ) : (
                      <>
                        <div className="ability-mod" style={{ cursor:'pointer' }} onClick={() => {
                          const res = rollDualityDice(mod);
                          const trName = t(`dh.traits.${tr}`, DH_TRAIT_NAMES[tr]);
                          let msg;
                          if (res.result==='critical') msg = `Critical! Both dice show ${res.hopeRoll} = ${res.total}`;
                          else if (res.result==='hope') msg = `${trName}: Hope ${res.hopeRoll} + Fear ${res.fearRoll} = ${res.total} → Success with Hope! ⭐`;
                          else if (res.result==='fear') msg = `${trName}: Fear ${res.fearRoll} + Hope ${res.hopeRoll} = ${res.total} → Success with Fear!`;
                          else msg = `${trName}: ${res.total} → Failure`;
                          showToast(msg); addLog('game.roll', msg);
                        }}>{mod>=0?`+${mod}`:mod}</div>
                        <div style={{ fontSize:9, color:'var(--c-muted)', textAlign:'center', padding:'0 2px 3px' }}>{dhTraitUses[tr]}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {editingAbilities && (
              <p className="hint-text" style={{ marginTop:8 }}>
                Array: {[2,1,1,0,0,-1].map(v => v>=0?`+${v}`:v).join(', ')}
              </p>
            )}
          </div>
        );
      }

      case 'dh-experiences': {
        const experiences = state.experiences || [];
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.inspiration" /> {t('dh.experiences','Experiences')}</span>
              <button className="icon-btn" onClick={() => update({ experiences:[...experiences,{ name:'', modifier:2 }] })}>+</button>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} className="field-row" style={{ alignItems:'center', marginBottom:6 }}>
                <input style={{ flex:1 }} value={exp.name} placeholder="Experience name..."
                  onChange={e => update({ experiences: experiences.map((x,j) => j===i ? {...x, name:e.target.value} : x) })} />
                <div className="hp-stepper" style={{ gap:2 }}>
                  <button className="mod-btn" onClick={() => update({ experiences: experiences.map((x,j) => j===i ? {...x, modifier:(x.modifier||2)-1} : x) })}>−</button>
                  <span style={{ minWidth:24, textAlign:'center', fontWeight:700, fontSize:13 }}>{(exp.modifier||0)>=0?`+${exp.modifier||0}`:exp.modifier}</span>
                  <button className="mod-btn" onClick={() => update({ experiences: experiences.map((x,j) => j===i ? {...x, modifier:(x.modifier||2)+1} : x) })}>+</button>
                </div>
                <button className="mod-btn" style={{ color:'var(--c-muted)', marginLeft:4 }} onClick={() => update({ experiences: experiences.filter((_,j) => j!==i) })}><Icon id="action.remove" size={13} /></button>
              </div>
            ))}
            {experiences.length === 0 && <p className="hint-text">No experiences yet. Click + to add one.</p>}
            <p className="hint-text" style={{ marginTop:6 }}>Spend 1 Hope to add a relevant Experience to your roll.</p>
          </div>
        );
      }

      case 'dh-domains': {
        const dhClassD = dhClasses.find(c => c.id === state.charClass);
        const classDomains = dhClassD ? dhDomains.filter(d => dhClassD.domains.includes(d.id)) : [];
        const domainCards = state.domainCards || [];
        return (
          <div className="card">
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.spells" /> {t('dh.domains','Domain Cards')}</span>
              <button className={`icon-btn ${addOpenFor==='dh-domains'?'active':''}`}
                onClick={() => setAddOpenFor(v => v==='dh-domains'?null:'dh-domains')}>+</button>
            </div>
            {classDomains.length > 0 && (
              <div style={{ marginBottom:8, paddingBottom:8, borderBottom:'0.5px solid var(--c-border)' }}>
                {classDomains.map(d => (
                  <div key={d.id} style={{ display:'flex', gap:6, alignItems:'baseline', marginBottom:3 }}>
                    <span style={{ fontWeight:600, fontSize:12 }}>{d.name}</span>
                    <span style={{ fontSize:11, color:'var(--c-muted)' }}>{d.desc}</span>
                  </div>
                ))}
              </div>
            )}
            {addOpenFor === 'dh-domains' && (
              <DHDomainCardForm domains={dhDomains}
                onAdd={card => { update({ domainCards:[...domainCards,{ ...card, id:Date.now() }] }); setAddOpenFor(null); }}
                onCancel={() => setAddOpenFor(null)} t={t} />
            )}
            {domainCards.length === 0 && addOpenFor !== 'dh-domains' && <p className="hint-text">No domain cards yet.</p>}
            {domainCards.map(card => (
              <div key={card.id} className="check-item" style={{ alignItems:'flex-start', marginBottom:4 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:600, fontSize:13 }}>{card.name}</span>
                  {card.domain && <span style={{ fontSize:11, color:'var(--c-muted)', marginLeft:6 }}>{card.domain}{card.level ? ` · Lv.${card.level}` : ''}</span>}
                  {card.desc && <div style={{ fontSize:12, color:'var(--c-muted)', marginTop:2 }}>{card.desc}</div>}
                </div>
                <button className="mod-btn" style={{ color:'var(--c-muted)' }} onClick={() => update({ domainCards: domainCards.filter(c => c.id!==card.id) })}><Icon id="action.remove" size={13} /></button>
              </div>
            ))}
          </div>
        );
      }

      case 'dh-vitals': {
        const hpCur = state.hpCurrent ?? 0;
        const hpMax = state.hpMax ?? 6;
        const stressCur = state.stressCurrent ?? 0;
        const stressMax = state.stressMax ?? 6;
        const hopeCur = state.hope ?? 0;
        const hopeMax = state.hopeMax ?? 6;
        const numericV = state.dhCounterMode === 'numeric';
        const VitalRow = ({ label, cur, max, pipClass, setCur, setMax, maxKey }) => (
          <div className="dh-vitals-section">
            <div className="dh-vitals-label">
              <span>{label}</span>
              <span className="dh-vitals-count">{cur} / {max}</span>
            </div>
            {numericV ? (
              <div className="hp-stepper" style={{ gap:4 }}>
                <button className="mod-btn" onClick={() => setCur(Math.max(0, cur - 1))}>−</button>
                <input type="number" className="hp-input" value={cur} onChange={e => setCur(Math.max(0, Math.min(max, parseInt(e.target.value)||0)))} />
                <button className="mod-btn" onClick={() => setCur(Math.min(max, cur + 1))}>+</button>
              </div>
            ) : (
              <DHPipRow current={cur} max={max} pipClass={pipClass} onToggle={setCur} />
            )}
            {editingHP && (
              <div className="dh-vitals-max-row">
                <span>Max</span>
                <button className="mod-btn" onClick={() => setMax(Math.max(1, max - 1))}>−</button>
                <span className="dh-vitals-max-val">{max}</span>
                <button className="mod-btn" onClick={() => setMax(max + 1)}>+</button>
              </div>
            )}
          </div>
        );
        return (
          <div className={`card${editingHP ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.hp" /> {t('dh.widgets.vitals','Vitals')}</span>
              <button className={`icon-btn ${editingHP?'active':''}`} onClick={() => setEditingHP(v => !v)}>
                {editingHP ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <VitalRow label="Hit Points" cur={hpCur} max={hpMax} pipClass="dh-hp-pip"
              setCur={v => update({ hpCurrent:v })} setMax={v => update({ hpMax:v })} />
            <VitalRow label="Stress" cur={stressCur} max={stressMax} pipClass="dh-stress-pip"
              setCur={v => update({ stressCurrent:v })} setMax={v => update({ stressMax:v })} />
            <VitalRow label={<><Icon id="game.hope" size={12} /> Hope</>} cur={hopeCur} max={hopeMax} pipClass="dh-hope-pip"
              setCur={v => update({ hope:v })} setMax={v => update({ hopeMax:v })} />
            {editingHP && (
              <label className="dh-counter-mode-toggle">
                <input type="checkbox" checked={numericV}
                  onChange={e => update({ dhCounterMode: e.target.checked ? 'numeric' : 'pip' })} />
                Contatori numerici
              </label>
            )}
          </div>
        );
      }

      case 'dh-evasion': {
        const numericE = state.dhCounterMode === 'numeric';
        return (
          <div className={`card${editingDHEvasion ? ' content-editing' : ''}`}>
            <div className="card-title" style={{ justifyContent:'space-between' }}>
              <span><Icon id="widget.saves" /> {t('dh.widgets.evasion','Evasion & Armor')}</span>
              <button className={`icon-btn ${editingDHEvasion?'active':''}`} onClick={() => setEditingDHEvasion(v => !v)}>
                {editingDHEvasion ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
              </button>
            </div>
            <div className="dh-evasion-row" style={{ marginBottom: 10 }}>
              <div className="dh-evasion-box">
                <div className="dh-evasion-label">{t('dh.evasion','Evasion')}</div>
                {editingDHEvasion
                  ? <input type="number" className="dh-evasion-input" value={state.evasion||10} onChange={e => update({ evasion:parseInt(e.target.value)||10 })} />
                  : <div className="dh-evasion-val">{state.evasion||10}</div>}
              </div>
            </div>
            <DHArmorManager
              armorName={state.armorName||''}
              armorFeature={state.armorFeature||''}
              thresholdMinor={state.thresholdMinor||0}
              thresholdMajor={state.thresholdMajor||0}
              thresholdSevere={state.thresholdSevere||0}
              armorSlotsMax={state.armorSlotsMax??0}
              armorSlots={state.armorSlots??0}
              charLevel={state.charLevel||1}
              numericMode={numericE}
              onUpdate={update}
            />
            {editingDHEvasion && (
              <label className="dh-counter-mode-toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={numericE}
                  onChange={e => update({ dhCounterMode: e.target.checked ? 'numeric' : 'pip' })} />
                Contatori numerici
              </label>
            )}
          </div>
        );
      }

      case 'dh-actions': return renderWidget('actions');

      case 'dh-conditions': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.conditions" /> {t('dh.widgets.conditions','Conditions')}</div>
          <ConditionTracker
            active={state.conditions||[]}
            onChange={conditions => update({ conditions })}
            conditions={dhConditions}
          />
        </div>
      );

      case 'dh-weapons': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="widget.weapons" /> {t('dh.widgets.weapons','Weapons')}</span>
            <button className={`icon-btn ${addOpenFor==='dh-weapons'?'active':''}`}
              onClick={() => setAddOpenFor(v => v==='dh-weapons'?null:'dh-weapons')}>+</button>
          </div>
          <DHWeaponManager
            weapons={state.weapons||[]}
            proficiency={state.proficiency||1}
            onUpdate={weapons => update({ weapons })}
            onRoll={handleRoll}
            addOpen={addOpenFor==='dh-weapons'}
            onAddClose={() => setAddOpenFor(null)}
          />
        </div>
      );

      case 'dh-inventory': return (
        <div className="card">
          <div className="card-title" style={{ justifyContent:'space-between' }}>
            <span><Icon id="tab.inventory" /> {t('dh.widgets.inventory','Inventory')}</span>
            <button className={`icon-btn ${addOpenFor==='dh-inventory'?'active':''}`}
              onClick={() => setAddOpenFor(v => v==='dh-inventory'?null:'dh-inventory')}>+</button>
          </div>
          <InventoryManager
            items={state.equipment||[]}
            onUpdate={equipment => update({ equipment })}
            onRoll={handleRoll}
            allTags={allTags}
            onUpdateTags={(id,tags) => {
              const item = (state.equipment||[]).find(i => i.id===id);
              const upd = { equipment:(state.equipment||[]).map(i => i.id===id?{...i,tags}:i) };
              if (item) upd.actions = (state.actions||[]).map(a => a.name===item.name?{...a,tags}:a);
              update(upd);
            }}
            onCreateTag={createTag}
            actionNames={actionNames}
            onAddAction={action => { if (!actionNames.has(action.name)) update({ actions:[...(state.actions||[]),action] }); }}
            onRemoveAction={name => update({ actions:(state.actions||[]).filter(a => a.name!==name) })}
            hideWeight
            addOpen={addOpenFor==='dh-inventory'} onAddClose={() => setAddOpenFor(null)}
          />
        </div>
      );

      case 'dh-gold': {
        // gold stored as flat handfuls. 10 handfuls = 1 bag, 10 bags = 1 chest.
        const total = state.gold || 0;
        const handfuls = total % 10;
        const bags = Math.floor(total / 10) % 10;
        const chests = Math.floor(total / 100);
        const setTotal = v => update({ gold: Math.max(0, v) });
        return (
          <div className="card">
            <div className="card-title"><Icon id="widget.currency" /> {t('dh.gold','Gold')}</div>
            <div className="dh-gold-denoms">
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">🪙 Chests</div>
                <div className="dh-pip-row">
                  <span className={`dh-pip dh-gold-pip${chests > 0 ? ' on' : ''}`}
                    onClick={() => setTotal((chests > 0 ? 0 : 100) + bags*10 + handfuls)} />
                </div>
                <span className="dh-gold-denom-count">{chests} / 1</span>
              </div>
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">👝 Bags</div>
                <div className="dh-pip-row">
                  {Array.from({ length: 9 }).map((_,i) => (
                    <span key={i}
                      className={`dh-pip dh-gold-pip${i < bags ? ' on' : ''}`}
                      onClick={() => setTotal(chests*100 + (i < bags ? i : i+1)*10 + handfuls)} />
                  ))}
                </div>
                <span className="dh-gold-denom-count">{bags} / 9</span>
              </div>
              <div className="dh-gold-denom">
                <div className="dh-gold-denom-label">🤏 Handfuls</div>
                <div className="dh-pip-row">
                  {Array.from({ length: 9 }).map((_,i) => (
                    <span key={i}
                      className={`dh-pip dh-gold-pip${i < handfuls ? ' on' : ''}`}
                      onClick={() => setTotal(chests*100 + bags*10 + (i < handfuls ? i : i+1))} />
                  ))}
                </div>
                <span className="dh-gold-denom-count">{handfuls} / 9</span>
              </div>
            </div>
          </div>
        );
      }

      case 'dh-notes': return (
        <div className="card">
          <div className="card-title"><Icon id="widget.notes" /> {t('dh.widgets.notes','Notes')}</div>
          <div className="trait-grid">
            {[
              ['background', 'Background Questions', 'What drives your character?'],
              ['connections', 'Connections', 'Who are your allies, rivals, loved ones?'],
              ['free', 'Free Notes', 'Session notes, clues, reminders...'],
            ].map(([key,label,ph]) => (
              <Field key={key} label={label}>
                <textarea className="notes-area" placeholder={ph}
                  value={(state.notes||{})[key]||''}
                  onChange={e => update({ notes:{ ...(state.notes||{}), [key]:e.target.value } })} />
              </Field>
            ))}
          </div>
        </div>
      );

      default: return <div className="card"><div className="hint-text">Widget "{id}" non trovato.</div></div>;
    }
  }

  return (
    <CharContext.Provider value={{
      abilities:   activeSystem === 'daggerheart' ? (state.traits || {}) : effectiveAbilities,
      traitValues: activeSystem === 'daggerheart' ? (state.traits || {}) : effectiveAbilities,
      charLevel:   state.charLevel,
      profBonus:   activeSystem === 'daggerheart' ? getDHProficiency(state.charLevel) : char.profBonus,
      systemId:    activeSystem || 'dnd5e',
    }}>
    <div className="sheet">
      <Toast message={toast} action={toastAction} />
      {showCreator && <CharacterCreator onComplete={handleCreatorComplete} onCancel={() => setShowCreator(false)} systemId={activeSystem || DEFAULT_SYSTEM} />}
      {showLevelUp && activeSystem === 'dnd5e' && (
        <LevelUpModal
          currentLevel={state.charLevel}
          charClass={state.charClass}
          charState={state}
          onComplete={changes => { char.levelUp(changes); setShowLevelUp(false); }}
          onCancel={() => setShowLevelUp(false)}
        />
      )}
      {showLevelDown && activeSystem === 'dnd5e' && (
        <LevelDownModal
          currentLevel={state.charLevel}
          charState={state}
          onConfirm={keepIds => { char.levelDown(keepIds); setShowLevelDown(false); }}
          onCancel={() => setShowLevelDown(false)}
        />
      )}

      {showSources && (
        <div className="creator-overlay" onClick={() => setShowSources(false)}>
          <div className="sources-modal" onClick={e => e.stopPropagation()}>
            <div className="sources-modal-header">
              <span>📦 {t('menu.sources')}</span>
              <button className="io-btn" onClick={() => setShowSources(false)}>✕</button>
            </div>
            <div className="sources-modal-body">
              <SourceManager onHomebrewChange={() => setHomebrewVersion(v => v + 1)} />
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-system-name">
          {getSystem(activeSystem || DEFAULT_SYSTEM).icon} {t(`system.${(activeSystem || DEFAULT_SYSTEM)}`, getSystem(activeSystem || DEFAULT_SYSTEM).shortName)}
        </div>
        {onBackToSelect && (
          <button className="icon-btn" onClick={onBackToSelect} title="Tutti i personaggi"><Icon id="action.allChars" size={16} /></button>
        )}
        {editMode && (
          <>
            <button className="io-btn" style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => { const d = getDefaultLayoutForSystem(activeSystem || DEFAULT_SYSTEM); setLayout(d); saveLayoutForSystem(activeSystem || DEFAULT_SYSTEM, d); const dt = getDefaultTabsForSystem(activeSystem || DEFAULT_SYSTEM); setTabs(dt); saveTabsForSystem(activeSystem || DEFAULT_SYSTEM, dt); }}>
              {t('nav.reset')}
            </button>
            <button className="io-btn primary" style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => setEditMode(false)}>
              {t('nav.layoutDone')}
            </button>
          </>
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
              <div className="hmenu-label">{t('menu.character')}</div>
              <button className="hmenu-item" onClick={() => { setShowCreator(true); setShowMenu(false); window.umami?.track('creator-opened', { system: activeSystem }); }}>
                {t('menu.newCharacter')}
              </button>
            </div>
            <div className="hmenu-divider" />
            <div className="hmenu-section">
              <div className="hmenu-label">{t('menu.layout')}</div>
              <button className={`hmenu-item ${editMode ? 'active' : ''}`}
                onClick={() => { setEditMode(v => !v); setShowMenu(false); }}>
                {editMode ? t('menu.doneLayout') : t('menu.editLayout')}
              </button>
              <button className="hmenu-item" onClick={() => {
                const d = getDefaultLayoutForSystem(activeSystem || DEFAULT_SYSTEM); setLayout(d); saveLayoutForSystem(activeSystem || DEFAULT_SYSTEM, d);
                const dt = getDefaultTabsForSystem(activeSystem || DEFAULT_SYSTEM); setTabs(dt); saveTabsForSystem(activeSystem || DEFAULT_SYSTEM, dt);
                setShowMenu(false);
              }}>{t('menu.resetLayout')}</button>
            </div>
            <div className="hmenu-divider" />
            <HMenuGroup label={t('menu.groupStyle')}>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.theme')}</div>
                <div className="hmenu-row">
                  {[['system', t('menu.themeSystem')],['light', t('menu.themeLight')],['dark', t('menu.themeDark')]].map(([m, label]) => (
                    <button key={m} className={`hmenu-theme-btn ${themeMode === m ? 'active' : ''}`}
                      title={label} onClick={() => setThemeMode(m)}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.color')}</div>
                <div className="hmenu-row">
                  {ACCENT_PRESETS.map(p => (
                    <button key={p.id} className={`accent-swatch ${accentId === p.id ? 'active' : ''}`}
                      title={p.label} onClick={() => setAccent(p.id)}
                      style={{ '--swatch-color': p.light.accent }} />
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.iconMode')}</div>
                <div className="hmenu-row">
                  {[
                    { value: 'emoji',  label: t('menu.iconEmoji'),  preview: '⚔ 🎲 ❤' },
                    { value: 'lucide', label: t('menu.iconLucide'), preview: '◈' },
                    { value: 'none',   label: t('menu.iconNone'),   preview: 'Aa' },
                  ].map(opt => (
                    <button key={opt.value}
                      className={`hmenu-theme-btn ${iconMode === opt.value ? 'active' : ''}`}
                      onClick={() => setIconMode(opt.value)}
                      title={opt.label}>
                      {opt.preview}
                    </button>
                  ))}
                </div>
                {iconMode === 'lucide' && (
                  <div style={{ marginTop: 6, padding: '0 14px' }}>
                    <button
                      className={`hmenu-theme-btn ${iconAccent ? 'active' : ''}`}
                      onClick={() => setIconAccent(!iconAccent)}
                      style={{ width: '100%', justifyContent: 'center' }}>
                      {t('menu.iconAccent')}
                    </button>
                  </div>
                )}
              </div>
            </HMenuGroup>
            <div className="hmenu-divider" />
            <HMenuGroup label={t('menu.groupLangUnits')}>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.uiLang')}</div>
                <div className="hmenu-row">
                  {[['it','🇮🇹 IT'],['en','🇬🇧 EN']].map(([lang, label]) => (
                    <button key={lang} className={`hmenu-theme-btn ${i18n.language === lang ? 'active' : ''}`}
                      onClick={() => { i18n.changeLanguage(lang); setShowMenu(false); }}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.units')}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, padding: '0 14px' }}>
                  <span style={{ fontSize: 11, color: 'var(--c-muted)', minWidth: 52 }}>{t('menu.weightUnit')}</span>
                  {[['kg','kg'],['lbs','lbs']].map(([val, label]) => (
                    <button key={val} className={`hmenu-theme-btn ${weightUnit === val ? 'active' : ''}`}
                      onClick={() => setUnitPref('weightUnit', val)}>{label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '0 14px' }}>
                  <span style={{ fontSize: 11, color: 'var(--c-muted)', minWidth: 52 }}>{t('menu.speedUnit')}</span>
                  {[['ft','ft'],['m','m'],['sq','□']].map(([val, label]) => (
                    <button key={val} className={`hmenu-theme-btn ${speedUnit === val ? 'active' : ''}`}
                      onClick={() => setUnitPref('speedUnit', val)}>{label}</button>
                  ))}
                </div>
              </div>
            </HMenuGroup>
            <div className="hmenu-divider" />
            <HMenuGroup label={t('accessibility.title')}>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('accessibility.font')}</div>
                <div className="hmenu-row">
                  {[
                    { value: 'default',      label: t('accessibility.fontDefault') },
                    { value: 'atkinson',     label: 'Atkinson Hyperlegible' },
                    { value: 'opendyslexic', label: 'OpenDyslexic' },
                  ].map(opt => (
                    <button key={opt.value}
                      className={`hmenu-item ${a11y.font === opt.value ? 'active' : ''}`}
                      onClick={() => setA11y('font', opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('accessibility.textSize')}</div>
                <div className="hmenu-row">
                  {[
                    { value: 'normal', label: t('accessibility.sizeNormal') },
                    { value: 'large',  label: t('accessibility.sizeLarge')  },
                    { value: 'xlarge', label: t('accessibility.sizeXLarge') },
                  ].map(opt => (
                    <button key={opt.value}
                      className={`hmenu-item ${a11y.textSize === opt.value ? 'active' : ''}`}
                      onClick={() => setA11y('textSize', opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('accessibility.contrast')}</div>
                <div className="hmenu-row">
                  {[
                    { value: 'default', label: t('accessibility.contrastDefault') },
                    { value: 'high',    label: t('accessibility.contrastHigh')    },
                  ].map(opt => (
                    <button key={opt.value}
                      className={`hmenu-item ${a11y.contrast === opt.value ? 'active' : ''}`}
                      onClick={() => setA11y('contrast', opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: '4px 0 8px' }}>
                <label className="hmenu-toggle">
                  <input type="checkbox"
                    checked={a11y.largeTargets}
                    onChange={e => setA11y('largeTargets', e.target.checked)} />
                  <span>{t('accessibility.largeTargets')}</span>
                </label>
              </div>
            </HMenuGroup>
            <div className="hmenu-divider" />
            <div className="hmenu-section">
              <div className="hmenu-label">{t('menu.data')}</div>
              <button className="hmenu-item" onClick={() => { handleExport(); setShowMenu(false); }}>{t('menu.exportChar')}</button>
              <button className="hmenu-item" onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}>{t('menu.importChar')}</button>
              <button className="hmenu-item" onClick={() => { setShowSources(true); setShowMenu(false); }}><Icon id="tab.sources" /> {t('menu.sources')}</button>
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
        onReorderTabs={next => { setTabs(next); saveTabsForSystem(activeSystem || DEFAULT_SYSTEM, next); }}
      />

      <PinnedBar
        state={state}
        editMode={editMode}
        pinned={pinned}
        onTogglePin={handleTogglePin}
        onUpdate={update}
        system={activeSystem || DEFAULT_SYSTEM}
        onShortRest={handleShortRest}
        onLongRest={handleLongRest}
      />

      {editMode && (
        <div className="layout-edit-banner">
          {t('layout.editBanner')}
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
  const [showOnboarding, setShowOnboarding] = useState(() => !loadOnboardingSeen());
  const [activeSystem, setActiveSystem] = useState(() => {
    try { return localStorage.getItem('characterforge_active_system') || DEFAULT_SYSTEM; } catch { return DEFAULT_SYSTEM; }
  });

  function handleSystemChange(systemId) {
    setActiveSystem(systemId);
    try { localStorage.setItem('characterforge_active_system', systemId); } catch {}
    window.umami?.track('system-selected', { system: systemId });
  }

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
    saveCharState(id, { ...createDefaultState(), ...newState, system: newState.system || activeSystem });
    setActiveCharId(id);
    setActive(id);
    setChars(loadCharsIndex());
    setShowCreator(false);
  }

  const filteredChars = chars.filter(c => (c.system || 'dnd5e') === activeSystem);
  const systemSelectorNode = <SystemSelector activeSystem={activeSystem} onChange={handleSystemChange} />;

  return (
    <>
      {!activeCharId ? (
        <>
          <CharacterSelect
            chars={filteredChars}
            onSelect={handleSelect}
            onCreate={() => { setShowCreator(true); window.umami?.track('creator-opened', { system: activeSystem }); }}
            onDelete={handleDelete}
            systemSelector={systemSelectorNode}
          />
          {showCreator && (
            <CharacterCreator
              onComplete={handleCreatorComplete}
              onCancel={() => setShowCreator(false)}
              systemId={activeSystem}
            />
          )}
        </>
      ) : (
        <CharacterApp
          key={activeCharId}
          charId={activeCharId}
          onBackToSelect={() => { setActiveCharId(null); setActive(null); setChars(loadCharsIndex()); }}
          onNewChar={newState => { handleCreatorComplete(newState); }}
          activeSystem={activeSystem}
          onSystemChange={handleSystemChange}
        />
      )}
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      <CornerButtons onHelp={() => { setShowOnboarding(true); window.umami?.track('tutorial-opened'); }} />
    </>
  );
}
