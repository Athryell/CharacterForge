import { createCustomDefaultState } from './data/mechanics';

// The custom system has no fixed widget catalogue: widgets live in the
// character's own state.widgets and are created by the user. widgetDefs is
// therefore empty, and the default layout is derived from the default sheet.

const layout = {
  storageSuffix: 'custom',
  widgetDefs:    [],
  defaultTabs:   createCustomDefaultState().tabs,

  // Overrides the usual "derive the layout from widgetDefs" path.
  defaultLayout() {
    return createCustomDefaultState().widgets.map((w, i) => ({
      id: w.id, tab: w.tab, col: w.col,
      order: w.order ?? i, visible: true, fullWidth: false,
    }));
  },
};

export default layout;
