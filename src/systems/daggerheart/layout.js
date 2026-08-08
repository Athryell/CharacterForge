// Widget layout for Daggerheart. Moved verbatim out of src/layout.js.

const layout = {
  storageSuffix: 'daggerheart',

  widgetDefs: [
    { id: 'dh-identity',    label: 'dh.widgets.identity',    defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-traits',      label: 'dh.widgets.traits',      defaultTab: 'main',      defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-experiences', label: 'dh.widgets.experiences', defaultTab: 'main',      defaultCol: 0, defaultFullWidth: false },
    { id: 'dh-domains',     label: 'dh.widgets.domains',     defaultTab: 'main',      defaultCol: 1, defaultFullWidth: false },
    { id: 'dh-vitals',      label: 'dh.widgets.vitals',      defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: false },
    { id: 'dh-evasion',     label: 'dh.widgets.evasion',     defaultTab: 'combat',    defaultCol: 1, defaultFullWidth: false },
    { id: 'dh-actions',     label: 'dh.widgets.actions',     defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-conditions',  label: 'dh.widgets.conditions',  defaultTab: 'combat',    defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-weapons',     label: 'dh.widgets.weapons',     defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-inventory',   label: 'dh.widgets.inventory',   defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: true  },
    { id: 'dh-gold',        label: 'dh.widgets.gold',        defaultTab: 'inventory', defaultCol: 0, defaultFullWidth: false },
    { id: 'dh-notes',       label: 'dh.widgets.notes',       defaultTab: 'notes',     defaultCol: 0, defaultFullWidth: true  },
  ],

  // No spells or log tab — Daggerheart has neither.
  defaultTabs: [
    { id: 'main',      label: 'tabs.main',      icon: '🗡', visible: true },
    { id: 'combat',    label: 'tabs.combat',    icon: '⚔',  visible: true },
    { id: 'inventory', label: 'tabs.inventory', icon: '🎒',  visible: true },
    { id: 'notes',     label: 'tabs.notes',     icon: '📝',  visible: true },
  ],
};

export default layout;
