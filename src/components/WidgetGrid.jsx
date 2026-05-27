import React, { useState } from 'react';
import WidgetShell from './WidgetShell';

export default function WidgetGrid({ widgets, editMode, onLayoutChange, renderWidget, hiddenWidgets=[], onRestoreWidget }) {
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Separate full-width widgets (always span both columns, rendered at the top in order)
  const fullWidgets = widgets.filter(w => w.fullWidth).sort((a,b) => a.order - b.order);
  const col0 = widgets.filter(w => !w.fullWidth && w.col === 0).sort((a,b) => a.order - b.order);
  const col1 = widgets.filter(w => !w.fullWidth && w.col === 1).sort((a,b) => a.order - b.order);

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { reset(); return; }
    const newWidgets = [...widgets];
    const dragIdx = newWidgets.findIndex(w => w.id === dragId);
    if (dragIdx === -1) { reset(); return; }

    const targetIdx = newWidgets.findIndex(w => w.id === targetId);
    const targetCol = targetIdx !== -1 ? newWidgets[targetIdx].col : (dragOverCol ?? newWidgets[dragIdx].col);
    const [dragged] = newWidgets.splice(dragIdx, 1);
    dragged.col = targetCol;

    const finalIdx = newWidgets.findIndex(w => w.id === targetId);
    finalIdx !== -1 ? newWidgets.splice(finalIdx, 0, dragged) : newWidgets.push(dragged);

    reorder(newWidgets);
    onLayoutChange(newWidgets);
    reset();
  }

  function handleColDrop(e, col) {
    e.preventDefault();
    if (!dragId) return;
    const newWidgets = widgets.map(w => {
      if (w.id !== dragId) return w;
      const colItems = widgets.filter(x => x.col === col && x.id !== dragId && !x.fullWidth);
      return { ...w, col, order: colItems.length * 10 };
    });
    reorder(newWidgets);
    onLayoutChange(newWidgets);
    reset();
  }

  function reorder(arr) {
    [0,1,'full'].forEach(key => {
      let order = 0;
      arr
        .filter(w => key === 'full' ? w.fullWidth : (!w.fullWidth && w.col === key))
        .sort((a,b) => a.order - b.order)
        .forEach(w => { w.order = order++; });
    });
  }

  function handleToggleFullWidth(widgetId) {
    const newWidgets = widgets.map(w => w.id === widgetId ? { ...w, fullWidth: !w.fullWidth } : w);
    reorder(newWidgets);
    onLayoutChange(newWidgets);
  }

  function reset() { setDragId(null); setDragOverId(null); setDragOverCol(null); }

  function shellProps(w) {
    return {
      id: w.id,
      fullWidth: w.fullWidth,
      editMode,
      onDragStart: setDragId,
      onDragOver: setDragOverId,
      onDrop: handleDrop,
      onMoveToTab: (id, tab) => onLayoutChange(null, { type:'moveTab', widgetId:id, tabId:tab }),
      onToggleVisible: (id) => onLayoutChange(null, { type:'hide', widgetId:id }),
      onToggleFullWidth: handleToggleFullWidth,
      isDragOver: dragOverId === w.id && dragId !== w.id,
    };
  }

  return (
    <div>
      {/* Full-width widgets stacked above columns */}
      {fullWidgets.map(w => (
        <div key={w.id} style={{ marginBottom: 10 }}>
          <WidgetShell {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
        </div>
      ))}

      {/* Two-column layout */}
      {(col0.length > 0 || col1.length > 0 || editMode) && (
        <div className="widget-grid">
          {/* Col 0 */}
          <div
            className={`widget-col ${dragOverCol===0 && !dragOverId ? 'col-drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOverCol(0); }}
            onDrop={e => handleColDrop(e, 0)}
          >
            {col0.map(w => (
              <WidgetShell key={w.id} {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
            ))}
            {editMode && col0.length === 0 && <div className="widget-col-empty">Trascina qui</div>}
          </div>
          {/* Col 1 */}
          <div
            className={`widget-col ${dragOverCol===1 && !dragOverId ? 'col-drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOverCol(1); }}
            onDrop={e => handleColDrop(e, 1)}
          >
            {col1.map(w => (
              <WidgetShell key={w.id} {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
            ))}
            {editMode && col1.length === 0 && <div className="widget-col-empty">Trascina qui</div>}
          </div>
        </div>
      )}

      {/* Hidden widgets restore */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="widget-hidden-panel">
          <div className="widget-hidden-title">Widget nascosti</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
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
