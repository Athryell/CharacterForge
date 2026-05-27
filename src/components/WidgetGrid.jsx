import React, { useState } from 'react';
import WidgetShell from './WidgetShell';

export default function WidgetGrid({
  widgets,       // [{id, col, order, ...}] for this tab
  editMode,
  onLayoutChange,
  renderWidget,
  hiddenWidgets = [],
  onRestoreWidget,
}) {
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const col0 = widgets.filter(w => w.col === 0).sort((a, b) => a.order - b.order);
  const col1 = widgets.filter(w => w.col === 1).sort((a, b) => a.order - b.order);

  function handleDragStart(id) {
    setDragId(id);
  }

  function handleDragOver(targetId) {
    setDragOverId(targetId);
  }

  function handleColDragOver(e, col) {
    e.preventDefault();
    setDragOverCol(col);
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) {
      setDragId(null); setDragOverId(null); setDragOverCol(null);
      return;
    }

    const newWidgets = [...widgets];
    const dragIdx = newWidgets.findIndex(w => w.id === dragId);
    const targetIdx = newWidgets.findIndex(w => w.id === targetId);

    if (dragIdx === -1) { setDragId(null); return; }

    const targetCol = targetIdx !== -1 ? newWidgets[targetIdx].col : dragOverCol ?? newWidgets[dragIdx].col;

    // Remove dragged item
    const [dragged] = newWidgets.splice(dragIdx, 1);
    dragged.col = targetCol;

    // Re-insert before target or at end
    const finalTargetIdx = newWidgets.findIndex(w => w.id === targetId);
    if (finalTargetIdx !== -1) {
      newWidgets.splice(finalTargetIdx, 0, dragged);
    } else {
      newWidgets.push(dragged);
    }

    // Re-assign order within each column
    const result = [...newWidgets];
    [0, 1].forEach(col => {
      let order = 0;
      result.filter(w => w.col === col).forEach(w => { w.order = order++; });
    });

    onLayoutChange(result);
    setDragId(null); setDragOverId(null); setDragOverCol(null);
  }

  function handleColDrop(e, col) {
    e.preventDefault();
    if (!dragId) return;
    // Drop into empty column or end of column
    const newWidgets = widgets.map(w => {
      if (w.id !== dragId) return w;
      const colItems = widgets.filter(x => x.col === col && x.id !== dragId);
      return { ...w, col, order: colItems.length * 10 };
    });
    // Reorder
    [0, 1].forEach(c => {
      let order = 0;
      newWidgets.filter(w => w.col === c).sort((a, b) => a.order - b.order).forEach(w => { w.order = order++; });
    });
    onLayoutChange(newWidgets);
    setDragId(null); setDragOverId(null); setDragOverCol(null);
  }

  function handleMoveToTab(widgetId, tabId) {
    onLayoutChange(null, { type: 'moveTab', widgetId, tabId });
  }

  function handleToggleVisible(widgetId) {
    onLayoutChange(null, { type: 'hide', widgetId });
  }

  function renderCol(colWidgets, colIdx) {
    return (
      <div
        className={`widget-col ${dragOverCol === colIdx && !dragOverId ? 'col-drag-over' : ''}`}
        onDragOver={e => handleColDragOver(e, colIdx)}
        onDrop={e => handleColDrop(e, colIdx)}
      >
        {colWidgets.map(w => (
          <WidgetShell
            key={w.id}
            id={w.id}
            editMode={editMode}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMoveToTab={handleMoveToTab}
            onToggleVisible={handleToggleVisible}
            isDragOver={dragOverId === w.id && dragId !== w.id}
          >
            {renderWidget(w.id)}
          </WidgetShell>
        ))}
        {editMode && colWidgets.length === 0 && (
          <div className="widget-col-empty">Trascina qui</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="widget-grid">
        {renderCol(col0, 0)}
        {renderCol(col1, 1)}
      </div>

      {/* Hidden widgets restore panel */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="widget-hidden-panel">
          <div className="widget-hidden-title">Widget nascosti</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hiddenWidgets.map(w => (
              <button key={w.id} className="filter-chip" onClick={() => onRestoreWidget(w.id)}>
                + {w.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
