// Widget layout system
// Each widget: id, tab, col (0=left,1=right), order, visible, fullWidth

export const WIDGET_DEFS = [
  { id: 'identity',      label: 'widgets.identity',      defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
  { id: 'abilities',     label: 'widgets.abilities',     defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
  { id: 'saves',         label: 'widgets.saves',         defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
  { id: 'skills',        label: 'widgets.skills',        defaultTab: 'main',      defaultCol: 1, defaultFullWidth: false },
  { id: 'senses',        label: 'widgets.senses',        defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
  { id: 'hp',            label: 'widgets.hp',            defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: false },
  { id: 'combatStats',   label: 'widgets.combatStats',   defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'inspiration',   label: 'widgets.inspiration',   defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'deathSaves',    label: 'widgets.deathSaves',    defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
  { id: 'conditions',    label: 'widgets.conditions',    defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
  { id: 'actions',       label: 'widgets.actions',       defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true,  defaultBottomFull: true },
  { id: 'armor',         label: 'widgets.armor',         defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
  { id: 'weapons',       label: 'widgets.weapons',       defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
  { id: 'spellStats',    label: 'widgets.spellStats',    defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: false },
  { id: 'spellSlots',    label: 'widgets.spellSlots',    defaultTab: 'spells',    defaultCol: 1, defaultFullWidth: false },
  { id: 'spells',        label: 'widgets.spells',        defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: true,  defaultBottomFull: true },
  { id: 'inventory',     label: 'widgets.inventory',     defaultTab: 'inventory', defaultCol: 1, defaultFullWidth: false },
  { id: 'currency',      label: 'widgets.currency',      defaultTab: 'inventory', defaultCol: 1, defaultFullWidth: false },
  { id: 'traits',        label: 'widgets.traits',        defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: true  },
  { id: 'freeNotes',     label: 'widgets.freeNotes',     defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: false },
  { id: 'classFeatures', label: 'widgets.classFeatures', defaultTab: 'notes',     defaultCol: 1, defaultFullWidth: false },
  { id: 'activityLog',   label: 'widgets.activityLog',   defaultTab: 'log',       defaultCol: 0, defaultFullWidth: true  },
  { id: 'sourcesWidget', label: 'widgets.sources',        defaultTab: 'sources',   defaultCol: 0, defaultFullWidth: true  },
];

export const DEFAULT_TABS = [
  { id: 'main',      label: 'tabs.main',      icon: '👤', visible: true },
  { id: 'combat',    label: 'tabs.combat',    icon: '⚔',  visible: true },
  { id: 'spells',    label: 'tabs.spells',    icon: '✨',  visible: true },
  { id: 'inventory', label: 'tabs.inventory', icon: '🎒',  visible: true },
  { id: 'notes',     label: 'tabs.notes',     icon: '📝',  visible: true },
  { id: 'log',       label: 'tabs.log',       icon: '📋',  visible: true },
  { id: 'sources',   label: 'tabs.sources',   icon: '📦',  visible: true },
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
    bottomFull: w.defaultBottomFull ?? false,
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
