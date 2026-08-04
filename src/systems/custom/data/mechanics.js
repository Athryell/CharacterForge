export const CUSTOM_WIDGET_TYPES = {
  'identity': {
    label: 'customWidgets.identity',
    icon: 'user',
    defaultConfig: { fields: ['name', 'image', 'pronouns'] },
  },
  'bar': {
    label: 'customWidgets.bar',
    icon: 'bar-chart-2',
    defaultConfig: { label: '', fieldId: '', color: '--c-accent', icon: 'heart' },
  },
  'stat-grid': {
    label: 'customWidgets.statGrid',
    icon: 'grid-3x3',
    defaultConfig: { stats: [] },
  },
  'counter': {
    label: 'customWidgets.counter',
    icon: 'circle-dot',
    defaultConfig: { label: '', fieldId: '', max: 10, resetOn: 'manual' },
  },
  'text': {
    label: 'customWidgets.text',
    icon: 'type',
    defaultConfig: { label: '', fieldId: '', multiline: false },
  },
  'list': {
    label: 'customWidgets.list',
    icon: 'list',
    defaultConfig: { label: '', itemFields: ['name', 'desc'] },
  },
  'toggle-list': {
    label: 'customWidgets.toggleList',
    icon: 'check-square',
    defaultConfig: { label: '', items: [] },
  },
  'inventory': {
    label: 'customWidgets.inventory',
    icon: 'backpack',
    defaultConfig: {},
  },
  'notes': {
    label: 'customWidgets.notes',
    icon: 'scroll',
    defaultConfig: {},
  },
  'log': {
    label: 'customWidgets.log',
    icon: 'book-open',
    defaultConfig: {},
  },
  'formula': {
    label: 'customWidgets.formula',
    icon: 'sigma',
    defaultConfig: { label: '', notation: '' },
  },
  'roll-button': {
    label: 'customWidgets.rollButton',
    icon: 'dices',
    defaultConfig: { label: '', notation: '' },
  },
  'table': {
    label: 'customWidgets.table',
    icon: 'table',
    defaultConfig: {
      label: '', fieldId: '',
      columns: [
        { id: 'name',  label: 'Name',  type: 'text'   },
        { id: 'value', label: 'Value', type: 'number' },
      ],
    },
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
  };
}
