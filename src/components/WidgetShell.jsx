import React, { useRef, useState } from 'react';
import { getWidgetLabel, ALL_TABS } from '../layout';

export default function WidgetShell({
  id, children, editMode,
  onDragStart, onDragOver, onDrop,
  onMoveToTab, onToggleVisible,
  isDragOver,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();

  const label = getWidgetLabel(id);

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('widgetId', id);
    onDragStart(id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(id);
  }

  function handleDrop(e) {
    e.preventDefault();
    onDrop(id);
  }

  return (
    <div
      ref={ref}
      className={`widget-shell ${editMode ? 'edit-mode' : ''} ${isDragOver ? 'drag-over' : ''}`}
      draggable={editMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={() => onDrop(null)}
    >
      {editMode && (
        <div className="widget-edit-bar">
          <span className="widget-drag-handle" title="Trascina per spostare">⠿⠿</span>
          <span className="widget-label">{label}</span>
          <div style={{ flex: 1 }} />

          {/* Move to tab menu */}
          <div style={{ position: 'relative' }}>
            <button
              className="widget-action-btn"
              onClick={() => setShowMenu(v => !v)}
              title="Sposta in altra tab"
            >
              ↗ Sposta
            </button>
            {showMenu && (
              <div className="widget-tab-menu">
                <div className="widget-tab-menu-title">Sposta in:</div>
                {ALL_TABS.map(tab => (
                  <button
                    key={tab.id}
                    className="widget-tab-menu-item"
                    onClick={() => { onMoveToTab(id, tab.id); setShowMenu(false); }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="widget-action-btn danger"
            onClick={() => onToggleVisible(id)}
            title="Nascondi widget"
          >
            🚫
          </button>
        </div>
      )}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
}
