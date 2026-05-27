// Widget layout system
// Each widget: id, tab, col (0=left,1=right), order, visible, fullWidth

export const WIDGET_DEFS = [
  { id: 'identity',      label: 'Identità',                   defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
  { id: 'abilities',     label: 'Caratteristiche',             defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
  { id: 'saves',         label: 'Tiri salvezza',               defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
  { id: 'skills',        label: 'Abilità',                     defaultTab: 'main',      defaultCol: 1, defaultFullWidth: false },
  { id: 'senses',        label: 'Sensi',                       defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
  { id: 'hp',            label: 'Punti ferita',                defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: false },
  { id: 'combatStats',   label: 'Statistiche combattimento',   defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'inspiration',   label: 'Ispirazione & Concentrazione',defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'deathSaves',    label: 'Tiri salvezza morte',         defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'conditions',    label: 'Condizioni',                  defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
  { id: 'actions',       label: 'Azioni',                      defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
  { id: 'weapons',       label: 'Armi',                        defaultTab: 'weapons',   defaultCol: 0, defaultFullWidth: true  },
  { id: 'spellStats',    label: 'Statistiche lancio',          defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: false },
  { id: 'spellSlots',    label: 'Slot incantesimo',            defaultTab: 'spells',    defaultCol: 1, defaultFullWidth: false },
  { id: 'spells',        label: 'Incantesimi',                 defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: true  },
  { id: 'currency',      label: 'Valuta',                      defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
  { id: 'inventory',     label: 'Equipaggiamento',             defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: true  },
  { id: 'traits',        label: 'Tratti personaggio',          defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: true  },
  { id: 'freeNotes',     label: 'Note libere',                 defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: false },
  { id: 'classFeatures', label: 'Feature di classe',           defaultTab: 'notes',     defaultCol: 1, defaultFullWidth: false },
];

export const DEFAULT_TABS = [
  { id: 'main',      label: 'Personaggio', icon: '👤', visible: true },
  { id: 'combat',    label: 'Combattimento', icon: '⚔', visible: true },
  { id: 'weapons',   label: 'Armi',        icon: '🗡', visible: true },
  { id: 'spells',    label: 'Magie',       icon: '✨', visible: true },
  { id: 'inventory', label: 'Inventario',  icon: '🎒', visible: true },
  { id: 'notes',     label: 'Note',        icon: '📝', visible: true },
];

const WIDGET_STORAGE = 'characterforge_layout';
const TAB_STORAGE    = 'characterforge_tabs';

export function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(WIDGET_STORAGE));
    if (saved && Array.isArray(saved)) {
      const savedIds = new Set(saved.map(w => w.id));
      const newWidgets = WIDGET_DEFS
        .filter(w => !savedIds.has(w.id))
        .map((w, i) => ({ id: w.id, tab: w.defaultTab, col: w.defaultCol, order: i+1000, visible: true, fullWidth: w.defaultFullWidth }));
      return [...saved, ...newWidgets];
    }
  } catch (e) {}
  return getDefaultLayout();
}

export function getDefaultLayout() {
  return WIDGET_DEFS.map((w, i) => ({
    id: w.id, tab: w.defaultTab, col: w.defaultCol,
    order: i, visible: true, fullWidth: w.defaultFullWidth ?? false,
  }));
}

export function saveLayout(layout) {
  try { localStorage.setItem(WIDGET_STORAGE, JSON.stringify(layout)); } catch (e) {}
}

export function loadTabs() {
  try {
    const saved = JSON.parse(localStorage.getItem(TAB_STORAGE));
    if (saved && Array.isArray(saved) && saved.length) {
      const savedIds = saved.map(t => t.id);
      const newTabs = DEFAULT_TABS.filter(t => !savedIds.includes(t.id));
      return [...saved, ...newTabs];
    }
  } catch (e) {}
  return DEFAULT_TABS;
}

export function saveTabs(tabs) {
  try { localStorage.setItem(TAB_STORAGE, JSON.stringify(tabs)); } catch (e) {}
}

export function getWidgetsForTab(layout, tab) {
  return layout.filter(w => w.tab === tab && w.visible !== false).sort((a,b) => a.order - b.order);
}

export function getWidgetLabel(id) {
  return WIDGET_DEFS.find(w => w.id === id)?.label || id;
}

export const ALL_TABS = DEFAULT_TABS;
