// The custom system has no rules at all, so no rules-driven capability applies.
// What it does have is structural: the user builds the sheet itself.
const capabilities = {
  userDefinedWidgets: true,  // widgets live in state.widgets, not in widgetDefs
  editableTabs:       true,
  templateIO:         true,  // sharing happens through template export, not homebrew
  hiddenWidgetTray:   false, // widgets are removed outright, never hidden
};

export default capabilities;
