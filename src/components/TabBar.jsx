import React, { useRef } from 'react';

// TabBar now receives tabs + editMode from App — no internal state
export default function TabBar({ tabs, activeTab, onTabChange, editMode, onDragTab, onDropTab, onDragOverTab }) {
  const visibleTabs = tabs.filter(t => t.visible);
  const displayTabs = editMode ? tabs : visibleTabs;

  return (
    <div className="topbar">
      <span className="topbar-brand">⚔ CharacterForge</span>
      <div style={{ flex: 1 }} />
      <div className="tab-group">
        {displayTabs.map((tab, i) => (
          <div
            key={tab.id}
            draggable={editMode}
            onDragStart={() => onDragTab(i)}
            onDragOver={e => { e.preventDefault(); onDragOverTab(i); }}
            onDrop={() => onDropTab(i)}
            className={`tab-btn-wrapper ${editMode ? 'edit-mode' : ''} ${!tab.visible ? 'tab-hidden' : ''}`}
          >
            <button
              className={`tab-btn ${activeTab === tab.id && tab.visible ? 'active' : ''}`}
              onClick={() => !editMode && tab.visible && onTabChange(tab.id)}
              style={{ opacity: !tab.visible ? 0.4 : 1 }}
            >
              {editMode && <span className="drag-handle">⠿</span>}
              {tab.icon} {tab.label}
            </button>
            {editMode && (
              <button
                className={`tab-eye ${tab.visible ? 'on' : 'off'}`}
                onClick={() => onTabChange('__toggle__' + tab.id)}
                title={tab.visible ? 'Nascondi tab' : 'Mostra tab'}
              >
                {tab.visible ? '👁' : '🚫'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
