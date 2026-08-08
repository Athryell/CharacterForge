import React from 'react';
import CustomWidget from './components/CustomWidget';

// The custom system has no fixed widget catalogue: every widget is an entry in
// the character's own state.widgets, rendered generically by type.
export function render(id, ctx) {
  const { state, update, editMode } = ctx.core;
  const widget = (state.widgets || []).find(w => w.id === id);
  if (!widget) return null;
  return <CustomWidget widget={widget} state={state} update={update} editMode={editMode} onRoll={ctx.shell.handleRoll} />;
}
