import React, { useState } from 'react';
import { getWidgetLabel, ALL_TABS } from '../layout';

export default function WidgetShell({
  id, children, editMode, fullWidth,
  onDragStart, onDragOver, onDrop,
  onMoveToTab, onToggleVisible, onToggleFullWidth,
  isDragOver,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const label = getWidgetLabel(id);

  return (
    <div
      className={`widget-shell ${editMode ? 'edit-mode' : ''} ${isDragOver ? 'drag-over' : ''} ${fullWidth ? 'full-width' : ''}`}
      draggable={editMode}
      onDragStart={e => { e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('widgetId',id); onDragStart(id); }}
      onDragOver={e => { e.preventDefault(); onDragOver(id); }}
      onDrop={e => { e.preventDefault(); onDrop(id); }}
      onDragEnd={() => onDrop(null)}
    >
      {editMode && (
        <div className="widget-edit-bar">
          <span className="widget-drag-handle">⠿⠿</span>
          <span className="widget-label">{label}</span>
          <div style={{ flex:1 }} />

          {/* Full width toggle */}
          <button className="widget-action-btn" onClick={() => onToggleFullWidth(id)}
            title={fullWidth ? 'Riduci a mezza larghezza' : 'Espandi a larghezza piena'}>
            {fullWidth ? '⬛ Mezza' : '▬ Piena'}
          </button>

          {/* Move to tab */}
          <div style={{ position:'relative' }}>
            <button className="widget-action-btn" onClick={() => setShowMenu(v => !v)}>↗ Sposta</button>
            {showMenu && (
              <div className="widget-tab-menu">
                <div className="widget-tab-menu-title">Sposta in:</div>
                {ALL_TABS.map(tab => (
                  <button key={tab.id} className="widget-tab-menu-item"
                    onClick={() => { onMoveToTab(id, tab.id); setShowMenu(false); }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="widget-action-btn danger" onClick={() => onToggleVisible(id)} title="Nascondi">🚫</button>
        </div>
      )}
      <div className="widget-content">{children}</div>
    </div>
  );
}
