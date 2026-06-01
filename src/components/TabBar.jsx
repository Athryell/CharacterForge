import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function TabBar({ tabs, activeTab, onTabChange, editMode, onReorderTabs }) {
  const { t } = useTranslation();
  const dragIdx     = useRef(null);
  const dragOverIdx = useRef(null);
  const displayTabs = editMode ? tabs : tabs.filter(t => t.visible);

  function onDragStart(i)        { dragIdx.current = i; }
  function onDragOver(e, i)      { e.preventDefault(); dragOverIdx.current = i; }
  function onDrop() {
    const from = dragIdx.current, to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    const next = [...tabs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorderTabs(next);
    dragIdx.current = dragOverIdx.current = null;
  }

  return (
    <div className="topbar">
      <span className="topbar-brand">⚔ CharacterForge</span>
      <div style={{ flex: 1 }} />
      <div className="tab-group-wrap">
      <div className="tab-group">
        {displayTabs.map((tab, i) => (
          <div key={tab.id}
            draggable={editMode}
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={onDrop}
            className={`tab-btn-wrapper ${editMode ? 'edit-mode' : ''} ${!tab.visible ? 'tab-hidden' : ''}`}
          >
            <button
              className={`tab-btn ${activeTab === tab.id && tab.visible ? 'active' : ''}`}
              onClick={() => !editMode && tab.visible && onTabChange(tab.id)}
              style={{ opacity: !tab.visible ? 0.4 : 1, cursor: editMode ? 'grab' : 'pointer' }}
            >
              {editMode && <span className="drag-handle">⠿</span>}
              {tab.icon} {t(tab.label)}
            </button>
            {editMode && (
              <button className={`tab-eye ${tab.visible ? 'on' : 'off'}`}
                onClick={e => { e.stopPropagation(); onTabChange('__toggle__' + tab.id); }}
                title={tab.visible ? 'Nascondi tab' : 'Mostra tab'}>
                {tab.visible ? '👁' : '🚫'}
              </button>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
