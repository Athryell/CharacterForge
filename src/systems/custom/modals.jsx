import React from 'react';
import WidgetEditor from './components/WidgetEditor';

export function render(ctx) {
  const { core: { state } } = ctx;
  const {
    showWidgetEditor, setShowWidgetEditor, editingWidgetId, setEditingWidgetId,
    handleAddWidget, handleEditWidget,
  } = ctx.shell;
  if (!showWidgetEditor) return null;
  return (
    <>
      {(() => {
        const editingWidget = editingWidgetId ? (state.widgets || []).find(w => w.id === editingWidgetId) : null;
        return (
          <WidgetEditor
            initialType={editingWidget?.type ?? null}
            initialConfig={editingWidget?.config ?? null}
            onAdd={editingWidgetId
              ? cfg => handleEditWidget(editingWidgetId, cfg)
              : handleAddWidget
            }
            onClose={() => { setShowWidgetEditor(false); setEditingWidgetId(null); }}
          />
        );
      })()}
    </>
  );
}
