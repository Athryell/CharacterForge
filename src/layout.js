// Widget layout system
// Each widget has: id, tab, column (0=left, 1=right), order

export const WIDGET_DEFS = [
  // Tab: main
  { id: 'identity',    label: 'Identità',         defaultTab: 'main',      defaultCol: 0 },
  { id: 'abilities',   label: 'Caratteristiche',   defaultTab: 'main',      defaultCol: 0 },
  { id: 'saves',       label: 'Tiri salvezza',     defaultTab: 'main',      defaultCol: 1 },
  { id: 'skills',      label: 'Abilità',           defaultTab: 'main',      defaultCol: 1 },
  { id: 'senses',      label: 'Sensi',             defaultTab: 'main',      defaultCol: 0 },
  // Tab: combat
  { id: 'hp',          label: 'Punti ferita',      defaultTab: 'combat',    defaultCol: 0 },
  { id: 'combatStats', label: 'Statistiche combattimento', defaultTab: 'combat', defaultCol: 0 },
  { id: 'inspiration', label: 'Ispirazione & Concentrazione', defaultTab: 'combat', defaultCol: 1 },
  { id: 'deathSaves',  label: 'Tiri salvezza morte', defaultTab: 'combat',  defaultCol: 1 },
  { id: 'conditions',  label: 'Condizioni',        defaultTab: 'combat',    defaultCol: 1 },
  { id: 'actions',     label: 'Azioni',            defaultTab: 'combat',    defaultCol: 0 },
  // Tab: weapons
  { id: 'weapons',     label: 'Armi',              defaultTab: 'weapons',   defaultCol: 0 },
  // Tab: spells
  { id: 'spellStats',  label: 'Statistiche lancio', defaultTab: 'spells',   defaultCol: 0 },
  { id: 'spellSlots',  label: 'Slot incantesimo',  defaultTab: 'spells',    defaultCol: 0 },
  { id: 'spells',      label: 'Incantesimi',       defaultTab: 'spells',    defaultCol: 1 },
  // Tab: inventory
  { id: 'currency',    label: 'Valuta',            defaultTab: 'inventory', defaultCol: 0 },
  { id: 'inventory',   label: 'Equipaggiamento',   defaultTab: 'inventory', defaultCol: 1 },
  // Tab: notes
  { id: 'traits',      label: 'Tratti personaggio', defaultTab: 'notes',    defaultCol: 0 },
  { id: 'freeNotes',   label: 'Note libere',       defaultTab: 'notes',     defaultCol: 1 },
  { id: 'classFeatures', label: 'Feature di classe', defaultTab: 'notes',   defaultCol: 1 },
];

const STORAGE_KEY = 'characterforge_layout';

export function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved)) {
      // Merge: keep saved, add any new widgets at default position
      const savedIds = new Set(saved.map(w => w.id));
      const newWidgets = WIDGET_DEFS
        .filter(w => !savedIds.has(w.id))
        .map((w, i) => ({ id: w.id, tab: w.defaultTab, col: w.defaultCol, order: i + 1000 }));
      return [...saved, ...newWidgets];
    }
  } catch (e) {}
  return getDefaultLayout();
}

export function getDefaultLayout() {
  return WIDGET_DEFS.map((w, i) => ({
    id: w.id,
    tab: w.defaultTab,
    col: w.defaultCol,
    order: i,
    visible: true,
  }));
}

export function saveLayout(layout) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch (e) {}
}

export function getWidgetsForTab(layout, tab) {
  return layout
    .filter(w => w.tab === tab && w.visible !== false)
    .sort((a, b) => a.order - b.order);
}

export function getWidgetLabel(id) {
  return WIDGET_DEFS.find(w => w.id === id)?.label || id;
}

export const ALL_TABS = [
  { id: 'main',      label: 'Personaggio' },
  { id: 'combat',    label: 'Combattimento' },
  { id: 'weapons',   label: 'Armi' },
  { id: 'spells',    label: 'Magie' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'notes',     label: 'Note' },
];
