import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharacter } from './hooks/useCharacter';
import { loadCharsIndex, deleteChar, getActiveCharId, setActiveCharId, generateCharId, migrateLegacy, saveCharState } from './chars';
import CharacterSelect, { loadCharFilter, saveCharFilter } from './components/CharacterSelect';
import SystemPicker from './components/SystemPicker';
import Onboarding, { CornerButtons, loadOnboardingSeen } from './components/Onboarding';
import { HIT_DICE, resolveResourceFormula, getProfBonus } from './systems/dnd5e2024/data/mechanics';
import dataManager from './data/dataManager';
import SourceManager from './components/SourceManager';
import HomebrewEditor from './components/HomebrewEditor';
import CharacterCreator from './components/CharacterCreator';
import TabBar from './components/TabBar';
import { resolveNotations } from './components/Tooltip';
import { CharContext } from './components/CharContext';
import WidgetGrid from './components/WidgetGrid';
import PinnedBar, { loadPinned, savePinned } from './components/PinnedBar';
import { DND_CLASSES } from './systems/dnd5e2024/data/classes';
import { getDefaultLayoutForSystem, getWidgetsForTab, loadLayoutForSystem, saveLayoutForSystem, loadTabsForSystem, saveTabsForSystem, getDefaultTabsForSystem, getWidgetLabel } from './layout';
import { SYSTEM_METAS, DEFAULT_SYSTEM, getPlugin } from './systems/registry';
import { useTheme, ACCENT_PRESETS } from './hooks/useTheme';
import { useUnits } from './hooks/useUnits';
import { useAccessibility } from './hooks/useAccessibility';
import { Icon, useIconMode } from './config/icons';
import { getNotationMenu } from './config/notationMenus';
import { Toast, HMenuGroup, rollDice } from './components/sheet';
import './App.css';


// ── Utilities ───────────────────────────────────────────────────






// ── Daggerheart helpers ─────────────────────────────────────────




// ── Resource Icon ────────────────────────────────────────────────


function updateFavicon(accentColor = '#6aaa2a') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="m 102.53 26.063 l 90 345.75 l 289.22 23.25 l -90.03 -345.72 l -289.19 -23.28 Z m -18.968 1.406 c -30.44 11.894 -55.62 53.07 -49.687 75.28 l 3.25 11.813 c 0.654 -1.722 1.345 -3.44 2.063 -5.157 C 49.102 85.688 65.734 62.636 89.56 50.5 l -6 -23.03 Z M 94.44 69.187 c -16.66 10.016 -29.916 28.1 -38 47.437 c -5.2 12.44 -8 25.417 -8.75 36.25 v 0.03 L 112.56 388.5 c 0.305 -0.572 0.593 -1.148 0.907 -1.72 c 10.585 -19.223 27.804 -37.623 51.06 -48.405 L 94.438 69.187 Z M 154 107.968 l 239.78 16.188 l -1.28 18.625 l -239.75 -16.155 L 154 107.97 Z m 46.03 34.407 l 5.657 8.875 l 14.188 22.313 l 39.03 -15.25 l 7.595 -2.938 l 3.97 7.094 l 16.28 29.124 l 4.313 7.72 l -7.438 4.717 c -10.267 6.524 -17.392 12.284 -21.75 16.782 c -3.03 3.13 -4.247 5.232 -4.906 6.594 c 1.38 0.303 3.433 0.577 6.624 0.28 c 18.268 -1.69 56.285 -19.964 79 -61.592 l 5.47 -10.03 l 8.748 7.374 l 46 38.812 l 11.532 9.72 l -13.844 6 l -33.28 14.374 c 5.447 4.925 11.436 5.916 18.436 5.406 c 9.95 -0.724 21.427 -6.07 29.125 -11.063 l 10.158 15.657 c -9.41 6.1 -22.867 12.934 -37.938 14.03 c -15.07 1.098 -32.27 -5.296 -42.594 -23.155 l -5.25 -9.095 l 9.625 -4.156 l 30.44 -13.157 l -26.033 -22 c -25.716 40.294 -62.68 59.168 -87.843 61.5 c -6.78 0.628 -12.945 0.26 -18.594 -2.688 c -5.65 -2.95 -9.984 -10.6 -9 -17.406 c 0.984 -6.806 4.838 -12.4 10.688 -18.44 c 4.385 -4.526 10.612 -9.367 17.875 -14.436 l -8.188 -14.656 L 219.5 193.75 l -7.156 2.78 l -4.125 -6.468 L 196 170.875 c -6.308 7.158 -9.485 14.528 -9 21.406 c 0.654 9.28 7.854 21.054 30.594 33.69 l -9.094 16.343 c -25.688 -14.273 -38.877 -31.016 -40.125 -48.72 c -1.248 -17.703 9.393 -33.013 23.5 -44.562 l 8.156 -6.655 Z m -5.968 118.188 l 239.782 16.156 l -1.25 18.655 l -239.78 -16.188 l 1.25 -18.625 Z m -24.75 96.25 c -17.637 9.072 -31.065 23.708 -39.468 38.968 c -4.49 8.153 -7.307 16.452 -8.72 23.876 l 11.626 42.156 l 1.688 0.157 c -3.824 -27.514 11.358 -60.383 41.187 -80.97 l -6.313 -24.188 Z m 26.22 34 c -32.403 17.28 -46.273 52.303 -41.657 72.78 l 289.78 24.532 c -5.298 -7.743 -8.625 -17.827 -8.592 -28.313 l -22.47 -9.03 l 46.626 -7.313 l -13.69 -13.064 c 5.552 -6.838 13.54 -12.915 24.47 -17.53 l -274.47 -22.063 Z" fill="${accentColor}"/>
  </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  let link = document.querySelector('link[rel="icon"]');
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  if (link.href.startsWith('blob:')) URL.revokeObjectURL(link.href);
  link.href = url;
}

// ── Character App (single character) ────────────────────────────
function CharacterApp({ charId, onBackToSelect, onNewChar, activeSystem }) {
  const { t, i18n } = useTranslation();
  const sys = getPlugin(activeSystem || DEFAULT_SYSTEM);
  const char = useCharacter(charId);
  const { state, update } = char;


  // Layout state
  const [layout, setLayout] = useState(() => loadLayoutForSystem(activeSystem || DEFAULT_SYSTEM));
  const [editMode, setEditMode] = useState(false);
  const [tabs, setTabs] = useState(() => loadTabsForSystem(activeSystem || DEFAULT_SYSTEM));

  // Custom system widget editor
  const [showWidgetEditor, setShowWidgetEditor] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState(null);

  useEffect(() => {
    setLayout(loadLayoutForSystem(activeSystem || DEFAULT_SYSTEM));
    setTabs(loadTabsForSystem(activeSystem || DEFAULT_SYSTEM));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSystem]);

  useEffect(() => {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const update = () => document.documentElement.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const bar = document.querySelector('.top-bar');
    if (!bar) return;
    const update = () => document.documentElement.style.setProperty('--top-bar-height', `${bar.offsetHeight}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
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
  // Not hardcoded 'main': the custom system's tabs are identity/inventory/notes/log,
  // so defaulting to a tab it doesn't have rendered an empty sheet on first open.
  const [activeTab, setActiveTab] = useState(
    () => tabs.find(tb => tb.visible !== false)?.id || 'main'
  );
  const [toast, setToast] = useState('');
  const [toastAction, setToastAction] = useState(null);
  const [hpAmount, setHpAmount] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingHP, setEditingHP] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredAttr, setHoveredAttr] = useState(null);
  const [addOpenFor, setAddOpenFor] = useState(null);
  const [homebrewVersion, setHomebrewVersion] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const [showHomebrewEditor, setShowHomebrewEditor] = useState(false);
  const [homebrewEditorConfig, setHomebrewEditorConfig] = useState({ draft: null, section: 'info' });
  const [showNotations, setShowNotations] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLevelDown, setShowLevelDown] = useState(false);
  const { mode: themeMode, accentId, setThemeMode, setAccent } = useTheme();

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--c-accent').trim();
    updateFavicon(accent || '#6aaa2a');
  }, [accentId, themeMode]);

  const { iconMode, setIconMode, iconAccent, setIconAccent } = useIconMode();
  const { weightUnit, speedUnit, setPref: setUnitPref, toDisplayWeight, toDisplaySpeed, fromDisplaySpeed } = useUnits();

  // The active system's own UI state and derived values. Called through a
  // variable, which is safe because CharacterApp remounts on a system switch.
  const { ui: pluginUi = {}, derived: pluginDerived = {} } =
    sys.useWidgetState?.({ state, char, units: { toDisplaySpeed, speedUnit, weightUnit } }) ?? {};

  // What the notation engine resolves [STR] and friends against, per system.
  const ctxValue = sys.contextValue(state, { ...char.derived, ...pluginDerived });

  // Handlers below still touch a few of the plugin's own UI slots.
  const {
    setConcentrationCheck, newResource, setNewResource, setAddingResource,
    editingCombat,
  } = pluginUi;
  const { prefs: a11y, setPref: setA11y } = useAccessibility();
  const fileInputRef = useRef();
  const templateFileInputRef = useRef();
  const toastTimer = useRef();

  function showToast(msg, action = null, duration = null) {
    setToast(msg);
    setToastAction(action);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => { setToast(''); setToastAction(null); }, duration ?? (action ? 3000 : 2500));
  }

  function openHomebrewEditorFor(sectionKey) {
    const systemNames = Object.fromEntries(SYSTEM_METAS.map(m => [m.id, m.shortName]));
    const sourceId = `my-custom-data-${activeSystem}`;
    const sourceName = `My Custom Data ${systemNames[activeSystem] || activeSystem}`;
    const existing = dataManager.getSourceRaw(sourceId);
    const draft = existing
      ? { ...existing }
      : {
          id: sourceId,
          name: sourceName,
          system: activeSystem,
          author: '',
          description: '',
          classes: [], subclasses: [], species: [], backgrounds: [],
          spells: [], weapons: [], armors: [], items: [], conditions: [], feats: [],
        };
    setHomebrewEditorConfig({ draft, section: sectionKey });
    setShowHomebrewEditor(true);
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

  function createTag() {}

  // In the custom system the tab list lives in two places: the per-system layout
  // storage AND state.tabs, which is what exportCustomTemplate serialises.
  // Every mutation must go through here or the two silently diverge.
  function commitTabs(next) {
    setTabs(next);
    saveTabsForSystem(activeSystem || DEFAULT_SYSTEM, next);
    if (sys.capabilities.userDefinedWidgets) update({ tabs: next });
  }

  function resetLayoutAndTabs() {
    if (!window.confirm(t('menu.resetLayoutConfirm'))) return;
    const sysId = activeSystem || DEFAULT_SYSTEM;
    const nextLayout = getDefaultLayoutForSystem(sysId);
    setLayout(nextLayout);
    saveLayoutForSystem(sysId, nextLayout);
    if (getPlugin(sysId).capabilities.userDefinedWidgets) {
      // Custom widgets live in character state and the default layout references
      // the default widget ids — restoring one without the other leaves every
      // shell empty, because renderWidget finds no matching widget.
      const base = getPlugin('custom').state.create();
      update({ widgets: base.widgets, tabs: base.tabs });
      setTabs(base.tabs);
      saveTabsForSystem(sysId, base.tabs);
      return;
    }
    commitTabs(getDefaultTabsForSystem(sysId));
  }

  function handleTabChange(id) {
    if (id.startsWith('__toggle__')) {
      const tabId = id.replace('__toggle__', '');
      const visibleCount = tabs.filter(t => t.visible).length;
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;
      if (tab.visible && (visibleCount <= 1 || tabId === activeTab)) return;
      const next = tabs.map(t => t.id === tabId ? { ...t, visible: !t.visible } : t);
      commitTabs(next);
      if (tabId === activeTab) {
        const first = next.find(t => t.visible && t.id !== tabId);
        if (first) setActiveTab(first.id);
      }
    } else {
      setActiveTab(id);
    }
  }

  // ── Custom widget handlers ─────────────────────────────────────
  function handleAddWidget({ type, config }) {
    const newWidget = {
      id: `w_${Date.now()}`, type, tab: activeTab, col: 0,
      order: (state.widgets || []).filter(w => w.tab === activeTab).length,
      config,
    };
    update({ widgets: [...(state.widgets || []), newWidget] });
    const newEntry = { id: newWidget.id, tab: activeTab, col: 0, order: newWidget.order, visible: true, fullWidth: false };
    const nextLayout = [...layout, newEntry];
    setLayout(nextLayout);
    saveLayoutForSystem('custom', nextLayout);
    setShowWidgetEditor(false);
  }

  function handleEditWidget(widgetId, { config }) {
    update({ widgets: (state.widgets || []).map(w => w.id === widgetId ? { ...w, config } : w) });
    setShowWidgetEditor(false);
    setEditingWidgetId(null);
  }

  function handleRemoveWidget(widgetId) {
    if (!window.confirm(t('customWidgets.removeWidgetConfirm'))) return;
    update({ widgets: (state.widgets || []).filter(w => w.id !== widgetId) });
    const nextLayout = layout.filter(w => w.id !== widgetId);
    setLayout(nextLayout);
    saveLayoutForSystem('custom', nextLayout);
  }

  function handleAddTab() {
    const newTab = { id: `tab_${Date.now()}`, label: t('customWidgets.newTab'), icon: 'layout', visible: true };
    commitTabs([...tabs, newTab]);
  }

  function handleRemoveTab(tabId) {
    const hasWidgets = (state.widgets || []).some(w => w.tab === tabId);
    if (hasWidgets) { window.alert(t('customWidgets.tabHasWidgets')); return; }
    if (tabs.length <= 1) return;
    const next = tabs.filter(tab => tab.id !== tabId);
    commitTabs(next);
    if (activeTab === tabId) {
      const first = next.find(tab => tab.visible);
      if (first) setActiveTab(first.id);
    }
  }

  function handleRoll(notation, name) {
    const resolved = resolveNotations(notation, ctxValue.abilities, state.charLevel, ctxValue.profBonus);
    const result = rollDice(resolved);
    if (result !== null) {
      const display = resolved !== notation ? `${notation} → ${resolved}` : notation;
      let suffix = '';
      if (result.natural === 20 && result.sides === 20) suffix = ` — ⭐ ${t('dice.natural20')}`;
      else if (result.natural === 1 && result.sides === 20) suffix = ` — 💀 ${t('dice.natural1')}`;
      const exhaustionLvl = sys.capabilities.exhaustion ? (state.exhaustionLevel || 0) : 0;
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

  function handleClassOrLevelChange(patch) {
    char.onClassOrLevelChange(patch);
    if (!sys.capabilities.levelProgression) return;
    const newClass = patch.charClass || state.charClass;
    const newLevel = patch.charLevel || state.charLevel;
    const classData = DND_CLASSES.find(c => c.name === newClass);
    if (!classData?.resources?.length) { update({ resources: (state.resources || []).filter(r => r.source === 'custom' || r.source === 'feat') }); return; }
    const newProfBonus = getProfBonus(newLevel);
    const customResources = (state.resources || []).filter(r => r.source === 'custom' || r.source === 'feat');
    const newResources = classData.resources.map(r => {
      const maxVal = (r.startLevel && newLevel < r.startLevel) ? 0 : resolveResourceFormula(r.formula, state.abilities, newLevel, newProfBonus);
      const existing = (state.resources || []).find(er => er.id === r.id);
      let resetOn = r.resetOn;
      if (r.id === 'bardic_inspiration') resetOn = newLevel >= 5 ? 'short' : 'long';
      return { ...r, resetOn, max: maxVal, current: existing ? Math.min(existing.current, maxVal) : maxVal, pinned: existing?.pinned ?? false };
    });
    if (newClass === 'Bard' && newLevel >= 5 && (state.charLevel || 1) < 5) {
      showToast(t('resources.bardInspirationShortRest'));
    }
    update({ resources: [...newResources, ...customResources] });
  }

  function toggleResourcePip(id, pipIdx) {
    update({
      resources: (state.resources || []).map(r => {
        if (r.id !== id) return r;
        return { ...r, current: pipIdx < r.current ? pipIdx : pipIdx + 1 };
      })
    });
  }
  function incrementResource(id) {
    update({ resources: (state.resources || []).map(r => r.id === id ? { ...r, current: Math.min(r.max, r.current + 1) } : r) });
  }
  function decrementResource(id) {
    update({ resources: (state.resources || []).map(r => r.id === id ? { ...r, current: Math.max(0, r.current - 1) } : r) });
  }
  function toggleResourcePin(id) {
    update({ resources: (state.resources || []).map(r => r.id === id ? { ...r, pinned: !r.pinned } : r) });
  }
  function removeResource(id) {
    update({ resources: (state.resources || []).filter(r => r.id !== id) });
  }
  function addCustomResource() {
    if (!newResource.name.trim()) return;
    const rawFormula = newResource.formula.trim() || 'fixed:1';
    const formula = /^\d+$/.test(rawFormula) ? `fixed:${rawFormula}` : rawFormula;
    const maxVal = resolveResourceFormula(formula, state.abilities, state.charLevel, char.profBonus);
    const r = {
      id: `custom_${Date.now()}`,
      name: newResource.name.trim(),
      icon: newResource.icon,
      formula,
      current: maxVal,
      max: maxVal,
      resetOn: newResource.resetOn,
      source: 'custom',
      pinned: newResource.pinned,
    };
    update({ resources: [...(state.resources || []), r] });
    setAddingResource(false);
    setNewResource({ name:'', icon:'d6', formula:'fixed:1', resetOn:'long', pinned:false });
  }

  // The rest itself belongs to the system's rules; this only reports on it.
  // A descriptor is { messageKey, hintKey?, logKey?, logIcon?, analytics?, durationMs? }.
  function runRest(action) {
    const d = action?.();
    if (!d) return;
    if (d.hintKey) {
      showToast(
        <>{t(d.messageKey)} <em className="toast-hint">{t(d.hintKey)}</em></>,
        { label: t('common.done'), onClick: () => { setToast(''); setToastAction(null); } },
        d.durationMs
      );
    } else {
      showToast(t(d.messageKey), null, d.durationMs);
    }
    if (d.logIcon) addLog(d.logIcon, t(d.logKey || d.messageKey));
    if (d.analytics) window.umami?.track(d.analytics);
  }

  function handleLongRest()  { runRest(char.longRest); }
  function handleShortRest() { runRest(char.shortRest); }
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

  function exportCustomTemplate() {
    const template = {
      templateName: state.systemName || 'Custom Template',
      version: '1.0',
      tabs: state.tabs,
      widgets: state.widgets.map(w => {
        const out = { ...w };
        delete out.id;
        return out;
      }),
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.templateName.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.umami?.track('custom-template-exported', { name: template.templateName });
  }

  function importCustomTemplate(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const template = JSON.parse(ev.target.result);
        if (!template.tabs || !template.widgets) {
          showToast(t('customWidgets.importError'));
          return;
        }
        if (!window.confirm(t('customWidgets.importWarning'))) return;
        const widgets = template.widgets.map(w => ({
          ...w,
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        }));
        update({
          systemName: template.templateName || state.systemName,
          tabs: template.tabs,
          widgets,
        });
        const newLayoutEntries = widgets.map((w, i) => ({
          id: w.id, tab: w.tab, col: w.col ?? 0, order: w.order ?? i, visible: true, fullWidth: false,
        }));
        setLayout(newLayoutEntries);
        saveLayoutForSystem('custom', newLayoutEntries);
        setTabs(template.tabs);
        saveTabsForSystem('custom', template.tabs);
        window.umami?.track('custom-template-imported', { name: template.templateName });
        showToast(t('customWidgets.importSuccess'));
      } catch {
        showToast(t('customWidgets.importError'));
      }
    };
    reader.readAsText(file);
  }

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
    .map(w => ({ ...w, label: getWidgetLabel(w.id, activeSystem || DEFAULT_SYSTEM) }));

  // ── Widget renderer ────────────────────────────────────────────
  const contentEditMap = {
    identity: editingIdentity,
    abilities: editingAbilities,
    hp: editingHP,
    combatStats: editingCombat,
  };

  // Everything the moved widget code used to close over, regrouped. The plugin
  // reads it by name; this component never learns which widget ids exist.
  const widgetCtx = {
    core: { state, update, char, t, editMode, layout, activeSystem },
    ui: {
      // generic sheet affordances every system's widgets use
      editingIdentity, setEditingIdentity, editingAbilities, setEditingAbilities,
      editingHP, setEditingHP, hpAmount, setHpAmount,
      addOpenFor, setAddOpenFor, hoveredAttr, setHoveredAttr, contentEditMap,
      ...pluginUi,
    },
    derived: { ...char.derived, ...pluginDerived },
    shell: {
      handleRoll, handleCastSpell, handleClassOrLevelChange, handleConcentrationRoll,
      handleDeathSaveRoll, handleHitDiceRoll, addLog, showToast, createTag,
      openHomebrewEditorFor, toggleResourcePin, toggleResourcePip,
      incrementResource, decrementResource, addCustomResource, removeResource,
      setShowLevelUp, setShowLevelDown, pinned, homebrewVersion,
      activityLog, setActivityLog, allTags,
      // consumed by the plugins' modals.render()
      showLevelUp, showLevelDown, t,
      showWidgetEditor, setShowWidgetEditor, editingWidgetId, setEditingWidgetId,
      handleAddWidget, handleEditWidget,
    },
    units: { toDisplaySpeed, fromDisplaySpeed, toDisplayWeight, speedUnit, weightUnit },
  };

  const renderWidget = id => sys.widgets.render(id, widgetCtx);


  return (
    <CharContext.Provider value={{
      ...ctxValue,
      charLevel: state.charLevel,
      systemId:  activeSystem || DEFAULT_SYSTEM,
      scoresAreModifiers: sys.capabilities.scoresAreModifiers,
    }}>
    <div className="sheet">
      <Toast message={toast} action={toastAction} />
      {showCreator && <CharacterCreator onComplete={handleCreatorComplete} onCancel={() => setShowCreator(false)} systemId={activeSystem || DEFAULT_SYSTEM} />}
      {sys.modals?.render?.(widgetCtx)}

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

      <HomebrewEditor
        open={showHomebrewEditor}
        onClose={() => setShowHomebrewEditor(false)}
        onPublish={() => { setHomebrewVersion(v => v + 1); setShowHomebrewEditor(false); }}
        initialDraft={homebrewEditorConfig.draft}
        initialSection={homebrewEditorConfig.section}
      />

      {showNotations && (() => {
        const menu = getNotationMenu(activeSystem || DEFAULT_SYSTEM);
        return (
          <div className="creator-overlay" onClick={() => setShowNotations(false)}>
            <div className="sources-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="sources-modal-header">
                <span>📖 {t('menu.notationsTitle')}</span>
                <button className="io-btn" onClick={() => setShowNotations(false)}>✕</button>
              </div>
              <div className="sources-modal-body" style={{ padding: '12px 16px' }}>
                {menu.map(group => (
                  <div key={group.group} style={{ marginBottom: 14 }}>
                    <div className="feature-group-header" style={{ marginBottom: 6 }}>{t(group.group)}</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <tbody>
                        {group.items.map(item => (
                          <tr key={item.insert} style={{ borderBottom: '1px solid var(--c-border)' }}>
                            <td style={{ fontFamily: 'monospace', color: 'var(--c-accent)', padding: '4px 10px 4px 0', whiteSpace: 'nowrap', width: 1 }}>{item.preview}</td>
                            <td style={{ padding: '4px 8px 4px 0', fontWeight: 600 }}>{t(item.label)}</td>
                            <td style={{ padding: '4px 0', color: 'var(--c-muted)' }}>{t(item.desc)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-system-name">⚔ CharacterForge</div>
        {onBackToSelect && (
          <button className="icon-btn" onClick={onBackToSelect} title="Tutti i personaggi"><Icon id="action.allChars" size={16} /></button>
        )}
        {editMode && (
          <>
            <button className="io-btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              onClick={resetLayoutAndTabs}>
              {t('nav.reset')}
            </button>
            <button className="io-btn primary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}
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
              <button className="hmenu-item" onClick={() => { resetLayoutAndTabs(); setShowMenu(false); }}>
                {t('menu.resetLayout')}
              </button>
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
                  {[['it','it','IT'],['en','gb','EN']].map(([lang, flagCode, short]) => (
                    <button key={lang} className={`hmenu-theme-btn ${i18n.language === lang ? 'active' : ''}`}
                      onClick={() => { i18n.changeLanguage(lang); setShowMenu(false); }}>
                      <img src={`https://flagcdn.com/24x18/${flagCode}.png`} alt={short} style={{ borderRadius: '2px', verticalAlign: 'middle', marginRight: 4 }} />
                      {short}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hmenu-section">
                <div className="hmenu-label">{t('menu.units')}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, padding: '0 14px' }}>
                  <span style={{ fontSize: '0.733rem', color: 'var(--c-muted)', minWidth: 52 }}>{t('menu.weightUnit')}</span>
                  {[['kg','kg'],['lbs','lbs']].map(([val, label]) => (
                    <button key={val} className={`hmenu-theme-btn ${weightUnit === val ? 'active' : ''}`}
                      onClick={() => setUnitPref('weightUnit', val)}>{label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '0 14px' }}>
                  <span style={{ fontSize: '0.733rem', color: 'var(--c-muted)', minWidth: 52 }}>{t('menu.speedUnit')}</span>
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
                    { value: 'small',  label: t('accessibility.sizeSmall')  },
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
              {sys.capabilities.templateIO && (
                <>
                  <button className="hmenu-item" onClick={() => { exportCustomTemplate(); setShowMenu(false); }}>
                    {t('customWidgets.exportTemplate')}
                  </button>
                  <button className="hmenu-item" onClick={() => { templateFileInputRef.current?.click(); setShowMenu(false); }}>
                    {t('customWidgets.importTemplate')}
                  </button>
                </>
              )}
              <button className="hmenu-item" onClick={() => { setShowSources(true); setShowMenu(false); }}><Icon id="tab.sources" /> {t('menu.sources')}</button>
              <button className="hmenu-item" onClick={() => { setShowNotations(true); setShowMenu(false); }}>📖 {t('menu.notations')}</button>
            </div>
          </div>
        </>
      )}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport} />
      <input ref={templateFileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={e => { const f = e.target.files[0]; if (f) importCustomTemplate(f); e.target.value = ''; }} />

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        editMode={editMode}
        onReorderTabs={commitTabs}
        systemName={t(`system.${activeSystem || DEFAULT_SYSTEM}`, getPlugin(activeSystem || DEFAULT_SYSTEM).meta.shortName)}
        onAddTab={sys.capabilities.editableTabs ? handleAddTab : undefined}
        onRemoveTab={sys.capabilities.editableTabs ? handleRemoveTab : undefined}
      />

      <PinnedBar
        capabilities={sys.capabilities}
        pinnable={sys.pins?.pinnable}
        state={state}
        editMode={editMode}
        pinned={pinned}
        onTogglePin={handleTogglePin}
        onUpdate={update}
        onShortRest={handleShortRest}
        onLongRest={handleLongRest}
        onToggleResourcePip={toggleResourcePip}
      />

      {editMode && (
        <div className="layout-edit-banner">
          {t('layout.editBanner')}
          {sys.capabilities.userDefinedWidgets && (
            <button
              className="io-btn primary"
              style={{ fontSize: '0.8rem', padding: '4px 12px' }}
              onClick={() => { setEditingWidgetId(null); setShowWidgetEditor(true); }}
            >
              + {t('customWidgets.addWidget')}
            </button>
          )}
        </div>
      )}

      <div className="panel">
        <WidgetGrid
          widgets={tabWidgets}
          editMode={editMode}
          onLayoutChange={handleLayoutChange}
          renderWidget={renderWidget}
          systemId={activeSystem || DEFAULT_SYSTEM}
          tabs={tabs}
          hiddenWidgets={sys.capabilities.hiddenWidgetTray ? hiddenWidgets : []}
          onRestoreWidget={restoreWidget}
          extraShellProps={sys.capabilities.userDefinedWidgets && editMode ? {
            userDefined: true,
            onEdit: id => { setEditingWidgetId(id); setShowWidgetEditor(true); },
            onRemove: id => handleRemoveWidget(id),
          } : {}}
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
    migrateLegacy(getPlugin(DEFAULT_SYSTEM).state.create);
    return getActiveCharId();
  });
  const [showCreator, setShowCreator] = useState(false);
  const [showSystemPicker, setShowSystemPicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !loadOnboardingSeen());
  const [activeSystem, setActiveSystem] = useState(DEFAULT_SYSTEM);
  const [charFilter, setCharFilter] = useState(loadCharFilter);

  function handleFilterChange(systemId) {
    setCharFilter(systemId);
    saveCharFilter(systemId);
  }

  // Keep chars list in sync after any save
  useEffect(() => {
    function syncIndex() { setChars(loadCharsIndex()); }
    window.addEventListener('storage', syncIndex);
    return () => window.removeEventListener('storage', syncIndex);
  }, []);

  function handleSelect(id) {
    const picked = chars.find(c => c.id === id);
    setActiveSystem((picked?.system) || DEFAULT_SYSTEM);
    setActiveCharId(id);
    setActive(id);
    setChars(loadCharsIndex());
  }

  function handleCreateClick() {
    setShowSystemPicker(true);
  }

  function handleSystemPicked(systemId) {
    setActiveSystem(systemId);
    setShowSystemPicker(false);
    setShowCreator(true);
    window.umami?.track('creator-opened', { system: systemId });
  }

  function handleDelete(id) {
    deleteChar(id);
    const next = loadCharsIndex();
    setChars(next);
    if (activeCharId === id) { setActiveCharId(null); setActive(null); }
  }

  function handleCreatorComplete(newState) {
    const id = generateCharId();
    const system = newState.system || activeSystem;
    const sys = getPlugin(system);
    // Was `system === 'custom' ? {} : createDefaultState()`, which seeded every
    // non-D&D character with the D&D default state.
    saveCharState(id, { ...sys.state.create(), ...newState, system }, sys.state.charIndexEntry);
    setActiveCharId(id);
    setActive(id);
    setChars(loadCharsIndex());
    setShowCreator(false);
  }

  return (
    <>
      {!activeCharId ? (
        <>
          <CharacterSelect
            chars={chars}
            filter={charFilter}
            onFilterChange={handleFilterChange}
            onSelect={handleSelect}
            onCreate={handleCreateClick}
            onDelete={handleDelete}
          />
          {showSystemPicker && (
            <SystemPicker
              onSelect={handleSystemPicked}
              onCancel={() => setShowSystemPicker(false)}
            />
          )}
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
          // Remount on a system switch, not just a character switch: later phases
          // let each plugin own React state via its own hooks, and swapping the
          // hook set under a live component breaks the rules of hooks.
          key={`${activeSystem}:${activeCharId}`}
          charId={activeCharId}
          onBackToSelect={() => { setActiveCharId(null); setActive(null); setChars(loadCharsIndex()); }}
          onNewChar={newState => { handleCreatorComplete(newState); }}
          activeSystem={activeSystem}
        />
      )}
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      <CornerButtons onHelp={() => { setShowOnboarding(true); window.umami?.track('tutorial-opened'); }} />
    </>
  );
}
