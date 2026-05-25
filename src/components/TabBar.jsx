import React, { useState, useRef } from 'react';

const DEFAULT_TABS = [
  { id: 'main',      label: 'Personaggio', icon: '👤', visible: true },
  { id: 'combat',    label: 'Combattimento', icon: '⚔', visible: true },
  { id: 'weapons',   label: 'Armi',        icon: '🗡', visible: true },
  { id: 'spells',    label: 'Magie',       icon: '✨', visible: true },
  { id: 'inventory', label: 'Inventario',  icon: '🎒', visible: true },
  { id: 'notes',     label: 'Note',        icon: '📝', visible: true },
];

const STORAGE_KEY = 'characterforge_tabs';

function loadTabs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.length) {
      // Merge: keep saved order/visibility, add any new tabs
      const savedIds = saved.map(t => t.id);
      const newTabs = DEFAULT_TABS.filter(t => !savedIds.includes(t.id));
      return [...saved, ...newTabs];
    }
  } catch (e) {}
  return DEFAULT_TABS;
}

function saveTabs(tabs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch (e) {}
}

export default function TabBar({ activeTab, onTabChange }) {
  const [tabs, setTabs] = useState(loadTabs);
  const [editMode, setEditMode] = useState(false);
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  function updateTabs(next) {
    setTabs(next);
    saveTabs(next);
  }

  function onDragStart(i) {
    dragIdx.current = i;
  }

  function onDragOver(e, i) {
    e.preventDefault();
    dragOverIdx.current = i;
  }

  function onDrop() {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    const next = [...tabs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateTabs(next);
    dragIdx.current = null;
    dragOverIdx.current = null;
  }

  function toggleVisible(id) {
    const visibleCount = tabs.filter(t => t.visible).length;
    const tab = tabs.find(t => t.id === id);
    // Can't hide the last visible tab or the active one
    if (tab.visible && (visibleCount <= 1 || id === activeTab)) return;
    updateTabs(tabs.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
    // If hiding active tab, switch to first visible
    if (id === activeTab) {
      const firstVisible = tabs.find(t => t.visible && t.id !== id);
      if (firstVisible) onTabChange(firstVisible.id);
    }
  }

  function resetTabs() {
    updateTabs(DEFAULT_TABS);
    onTabChange('main');
  }

  const visibleTabs = tabs.filter(t => t.visible);

  return (
    <div className="topbar">
      <span className="topbar-brand">⚔ CharacterForge</span>
      <div style={{ flex: 1 }} />

      {/* Tab group */}
      <div className="tab-group">
        {(editMode ? tabs : visibleTabs).map((tab, i) => (
          <div
            key={tab.id}
            draggable={editMode}
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={onDrop}
            className={`tab-btn-wrapper ${editMode ? 'edit-mode' : ''} ${!tab.visible ? 'tab-hidden' : ''}`}
          >
            <button
              className={`tab-btn ${activeTab === tab.id && tab.visible ? 'active' : ''}`}
              onClick={() => {
                if (!editMode && tab.visible) onTabChange(tab.id);
              }}
              style={{ opacity: !tab.visible ? 0.4 : 1 }}
            >
              {editMode && <span className="drag-handle">⠿</span>}
              {tab.icon} {tab.label}
            </button>
            {editMode && (
              <button
                className={`tab-eye ${tab.visible ? 'on' : 'off'}`}
                onClick={() => toggleVisible(tab.id)}
                title={tab.visible ? 'Nascondi' : 'Mostra'}
              >
                {tab.visible ? '👁' : '🚫'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Edit toggle */}
      <button
        className={`icon-btn ${editMode ? 'active' : ''}`}
        onClick={() => setEditMode(e => !e)}
        title="Personalizza tab"
      >
        {editMode ? '✓ Fine' : '⚙'}
      </button>

      {editMode && (
        <button className="icon-btn" onClick={resetTabs} title="Ripristina ordine">
          ↺
        </button>
      )}
    </div>
  );
}
