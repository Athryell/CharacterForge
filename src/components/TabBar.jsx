import React, { useState, useRef } from 'react';

export default function TabBar({ tabs, activeTab, onTabChange, editMode, onReorderTabs }) {
  const [dragId, setDragId] = useState(null);
  const [insertBefore, setInsertBefore] = useState(null); // id of tab to insert before, or 'end'
  const itemRefs = useRef({});

  const displayTabs = editMode ? tabs : tabs.filter(t => t.visible);

  function handleDragStart(e, tab) {
    setDragId(tab.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('tabId', tab.id);
    // ghost image
    e.dataTransfer.setDragImage(e.currentTarget, 20, 12);
  }

  function handleDragOver(e, tab) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragId || dragId === tab.id) return;

    // Determine if cursor is in left or right half of target tab
    const el = itemRefs.current[tab.id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      setInsertBefore(tab.id);
    } else {
      // insert after this tab = before the next one
      const idx = displayTabs.findIndex(t => t.id === tab.id);
      const next = displayTabs[idx + 1];
      setInsertBefore(next ? next.id : 'end');
    }
  }

  function handleDragOverContainer(e) {
    e.preventDefault();
    // if dragging past last tab
    if (dragId) setInsertBefore('end');
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!dragId || insertBefore === null) { reset(); return; }

    const allTabs = [...tabs];
    const fromIdx = allTabs.findIndex(t => t.id === dragId);
    if (fromIdx === -1) { reset(); return; }

    const [moved] = allTabs.splice(fromIdx, 1);

    if (insertBefore === 'end') {
      allTabs.push(moved);
    } else {
      const toIdx = allTabs.findIndex(t => t.id === insertBefore);
      if (toIdx === -1) allTabs.push(moved);
      else allTabs.splice(toIdx, 0, moved);
    }

    onReorderTabs(allTabs);
    reset();
  }

  function reset() {
    setDragId(null);
    setInsertBefore(null);
  }

  function handleTabClick(tab) {
    if (!editMode && tab.visible) {
      onTabChange(tab.id);
    }
  }

  function handleToggleVisible(e, tabId) {
    e.stopPropagation();
    onTabChange('__toggle__' + tabId);
  }

  return (
    <div className="topbar">
      <span className="topbar-brand">⚔ CharacterForge</span>
      <div style={{ flex: 1 }} />

      <div
        className="tab-group"
        onDragOver={handleDragOverContainer}
        onDrop={handleDrop}
      >
        {displayTabs.map((tab) => {
          const isDragging = dragId === tab.id;
          const showInsertBefore = insertBefore === tab.id && dragId !== tab.id;

          return (
            <div
              key={tab.id}
              ref={el => itemRefs.current[tab.id] = el}
              draggable={editMode}
              onDragStart={e => handleDragStart(e, tab)}
              onDragOver={e => handleDragOver(e, tab)}
              onDragEnd={reset}
              className={`tab-btn-wrapper ${editMode ? 'edit-mode' : ''} ${!tab.visible ? 'tab-hidden' : ''} ${isDragging ? 'tab-dragging' : ''}`}
            >
              {/* Drop indicator line */}
              {showInsertBefore && <div className="tab-insert-indicator" />}

              <button
                className={`tab-btn ${activeTab === tab.id && tab.visible ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
                style={{ opacity: !tab.visible ? 0.4 : 1, cursor: editMode ? 'grab' : 'pointer' }}
              >
                {editMode && <span className="drag-handle">⠿</span>}
                {tab.icon} {tab.label}
              </button>

              {editMode && (
                <button
                  className={`tab-eye ${tab.visible ? 'on' : 'off'}`}
                  onClick={e => handleToggleVisible(e, tab.id)}
                  title={tab.visible ? 'Nascondi tab' : 'Mostra tab'}
                >
                  {tab.visible ? '👁' : '🚫'}
                </button>
              )}
            </div>
          );
        })}

        {/* End-of-list drop indicator */}
        {insertBefore === 'end' && dragId && (
          <div className="tab-insert-indicator tab-insert-end" />
        )}
      </div>
    </div>
  );
}
