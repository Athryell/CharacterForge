// Widget layout system.
// Each layout entry: { id, tab, col (0=left, 1=right), order, visible, fullWidth, bottomFull }
//
// The catalogues themselves live with their systems, in src/systems/<id>/layout.js.
// Nothing here names a concrete system: everything is a registry lookup, so a new
// system needs no edit to this file.

import { getPlugin, DEFAULT_SYSTEM } from './systems/registry';

const EMPTY = { widgetDefs: [], defaultTabs: [], storageSuffix: null };

function layoutOf(systemId) {
  return getPlugin(systemId).layout || EMPTY;
}

// Storage keys are uniform across systems — including D&D, which used to live in
// the unsuffixed legacy key. `storageSuffix` is what SYSTEMS[].defaultLayoutKey
// was always meant to be; it just never had a reader.
function storageKey(kind, systemId) {
  const suffix = layoutOf(systemId).storageSuffix || systemId || DEFAULT_SYSTEM;
  return `characterforge_${kind}_${suffix}`;
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota — ignore */ }
}

function entryFor(def, order) {
  return {
    id: def.id, tab: def.defaultTab, col: def.defaultCol, order,
    visible: true,
    fullWidth:  def.defaultFullWidth ?? false,
    bottomFull: def.defaultBottomFull ?? false,
  };
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export function getDefaultLayoutForSystem(systemId) {
  const l = layoutOf(systemId);
  if (l.defaultLayout) return l.defaultLayout();
  return l.widgetDefs.map(entryFor);
}

export function getDefaultTabsForSystem(systemId) {
  return [...layoutOf(systemId).defaultTabs];
}

// ── Load / save ──────────────────────────────────────────────────────────────

export function loadLayoutForSystem(systemId) {
  const l = layoutOf(systemId);
  let saved = readJSON(storageKey('layout', systemId));
  if (!Array.isArray(saved)) return getDefaultLayoutForSystem(systemId);

  if (l.renames) {
    saved = saved.map(w => (l.renames[w.id] ? { ...w, id: l.renames[w.id] } : w));
  }

  // Widgets added to the catalogue since this layout was saved get appended,
  // so a released widget shows up for someone who already has a saved layout.
  const savedIds = new Set(saved.map(w => w.id));
  const added = l.widgetDefs
    .filter(w => !savedIds.has(w.id))
    .map((w, i) => entryFor(w, i + 1000));

  return [...saved, ...added];
}

export function saveLayoutForSystem(systemId, layout) {
  writeJSON(storageKey('layout', systemId), layout);
}

export function loadTabsForSystem(systemId) {
  const saved = readJSON(storageKey('tabs', systemId));
  if (Array.isArray(saved) && saved.length) {
    const savedIds = new Set(saved.map(t => t.id));
    const added = layoutOf(systemId).defaultTabs.filter(t => !savedIds.has(t.id));
    return [...saved, ...added];
  }
  return getDefaultTabsForSystem(systemId);
}

export function saveTabsForSystem(systemId, tabs) {
  writeJSON(storageKey('tabs', systemId), tabs);
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function getWidgetsForTab(layout, tab) {
  return layout
    .filter(w => w.tab === tab && w.visible !== false)
    .sort((a, b) => a.order - b.order);
}

// Returns an i18n key, or the raw id for user-defined widgets, which have none.
// This replaces sniffing the system from an id prefix ('dh-', 'w_').
export function getWidgetLabel(id, systemId) {
  return layoutOf(systemId).widgetDefs.find(w => w.id === id)?.label || id;
}
