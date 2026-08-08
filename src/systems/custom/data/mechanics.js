export const CUSTOM_WIDGET_TYPES = {
  'identity': {
    label: 'customWidgets.identity',
    icon: 'widgetType.identity',
    defaultConfig: { fields: ['name', 'image', 'pronouns'] },
  },
  'bar': {
    label: 'customWidgets.bar',
    icon: 'widgetType.bar',
    defaultConfig: { label: '', fieldId: '', color: '--c-accent', icon: 'heart' },
  },
  'stat-grid': {
    label: 'customWidgets.statGrid',
    icon: 'widgetType.statGrid',
    defaultConfig: { stats: [], showMod: true, showValue: true, diceNotation: '1d20' },
  },
  'counter': {
    label: 'customWidgets.counter',
    icon: 'widgetType.counter',
    defaultConfig: { label: '', fieldId: '', max: 10, resetOn: 'manual' },
  },
  'text': {
    label: 'customWidgets.text',
    icon: 'widgetType.text',
    defaultConfig: { label: '', fieldId: '', multiline: false },
  },
  'features': {
    label: 'customWidgets.features',
    icon: 'widgetType.features',
    defaultConfig: { label: '', fieldId: '' },
  },
  'inventory': {
    label: 'customWidgets.inventory',
    icon: 'widgetType.inventory',
    defaultConfig: {},
  },
  'notes': {
    label: 'customWidgets.notes',
    icon: 'widgetType.notes',
    defaultConfig: {},
  },
  'log': {
    label: 'customWidgets.log',
    icon: 'widgetType.log',
    defaultConfig: {},
  },
  'formula': {
    label: 'customWidgets.formula',
    icon: 'widgetType.formula',
    defaultConfig: { label: '', boxes: [] },
  },
  'toggle-list': {
    label: 'customWidgets.toggleList',
    icon: 'widgetType.toggleList',
    defaultConfig: {},
  },
};

export function createCustomDefaultState() {
  return {
    system: 'custom',
    systemName: '',

    charName: '',
    charImage: '',
    notes: '',

    // label = i18n key; user-created tabs store a literal, which t() passes through
    tabs: [
      { id: 'identity',  label: 'customWidgets.tabCharacter', icon: 'user',      visible: true },
      { id: 'inventory', label: 'customWidgets.tabInventory', icon: 'backpack',  visible: true },
      { id: 'notes',     label: 'customWidgets.tabNotes',     icon: 'scroll',    visible: true },
      { id: 'log',       label: 'customWidgets.tabLog',       icon: 'book-open', visible: true },
    ],

    // col: 0 = left column, 1 = right — WidgetGrid renders no other value
    widgets: [
      {
        id: 'w_identity',
        type: 'identity',
        tab: 'identity',
        col: 0,
        order: 0,
        config: { fields: ['name', 'image', 'pronouns'] },
      },
      {
        id: 'w_hp',
        type: 'bar',
        tab: 'identity',
        col: 1,
        order: 0,
        config: { label: 'Hit Points', fieldId: 'HP', color: '--c-accent', icon: 'heart' },
      },
      {
        id: 'w_inventory',
        type: 'inventory',
        tab: 'inventory',
        col: 0,
        order: 0,
        config: {},
      },
      {
        id: 'w_notes',
        type: 'notes',
        tab: 'notes',
        col: 0,
        order: 0,
        config: {},
      },
      {
        id: 'w_log',
        type: 'log',
        tab: 'log',
        col: 0,
        order: 0,
        config: {},
      },
    ],

    customFields: {
      HP: { current: 10, max: 10 },
    },

    inventory: [],
    log: [],
    conditions: [],
    resources: [],
  };
}
