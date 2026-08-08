// Widget layout for D&D 5e 2024. Moved verbatim out of src/layout.js.
// Each widget: id, label (i18n key), defaultTab, defaultCol (0=left, 1=right),
// defaultFullWidth, defaultBottomFull.

const layout = {
  storageSuffix: 'dnd5e2024',

  widgetDefs: [
    { id: 'identity',      label: 'widgets.identity',      defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
    { id: 'abilities',     label: 'widgets.abilities',     defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
    { id: 'saves',         label: 'widgets.saves',         defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
    { id: 'skills',        label: 'widgets.skills',        defaultTab: 'main',      defaultCol: 1, defaultFullWidth: false },
    { id: 'senses',        label: 'widgets.senses',        defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
    { id: 'hp',            label: 'widgets.hp',            defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
    { id: 'combatStats',   label: 'widgets.combatStats',   defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
    { id: 'resources',     label: 'widgets.resources',     defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: false },
    { id: 'conditions',    label: 'widgets.conditions',    defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
    { id: 'deathSaves',    label: 'widgets.deathSaves',    defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
    { id: 'actions',       label: 'widgets.actions',       defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true,  defaultBottomFull: true },
    { id: 'armor',         label: 'widgets.armor',         defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
    { id: 'weapons',       label: 'widgets.weapons',       defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
    { id: 'spellStats',    label: 'widgets.spellStats',    defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: false },
    { id: 'spellSlots',    label: 'widgets.spellSlots',    defaultTab: 'spells',    defaultCol: 1, defaultFullWidth: false },
    { id: 'spells',        label: 'widgets.spells',        defaultTab: 'spells',    defaultCol: 0, defaultFullWidth: true,  defaultBottomFull: true },
    { id: 'inventory',     label: 'widgets.inventory',     defaultTab: 'inventory', defaultCol: 1, defaultFullWidth: false },
    { id: 'currency',      label: 'widgets.currency',      defaultTab: 'inventory', defaultCol: 1, defaultFullWidth: false },
    { id: 'classFeatures', label: 'widgets.classFeatures', defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: false },
    { id: 'traits',        label: 'widgets.traits',        defaultTab: 'notes',     defaultCol: 1, defaultFullWidth: false },
    { id: 'freeNotes',     label: 'widgets.freeNotes',     defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: true,  defaultBottomFull: true },
    { id: 'activityLog',   label: 'widgets.activityLog',   defaultTab: 'log',       defaultCol: 0, defaultFullWidth: true  },
  ],

  defaultTabs: [
    { id: 'main',      label: 'tabs.main',      icon: '👤', visible: true },
    { id: 'combat',    label: 'tabs.combat',    icon: '⚔',  visible: true },
    { id: 'spells',    label: 'tabs.spells',    icon: '✨',  visible: true },
    { id: 'inventory', label: 'tabs.inventory', icon: '🎒',  visible: true },
    { id: 'notes',     label: 'tabs.notes',     icon: '📝',  visible: true },
    { id: 'log',       label: 'tabs.log',       icon: '📋',  visible: true },
  ],

  // One-off id renames applied to a saved layout on load.
  renames: { inspiration: 'resources' },
};

export default layout;
