import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';

export default function TabBar({ tabs, activeTab, onTabChange, editMode, onReorderTabs }) {
  const { t } = useTranslation();
  const dragIdx     = useRef(null);
  const dragOverIdx = useRef(null);
  const groupRef    = useRef(null);
  const [overflows, setOverflows] = useState(false);
  const displayTabs = editMode ? tabs : tabs.filter(t => t.visible);

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [displayTabs]);

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
      <div className={`tab-group-wrap${overflows ? ' scrollable' : ''}`}>
      <div className="tab-group" ref={groupRef}>
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
              {editMode && <span className="drag-handle"><Icon id="action.layout" size={12} fallback="⠿" /></span>}
              <Icon id={`tab.${tab.id}`} fallback={tab.icon} /> {t(tab.label)}
            </button>
            {editMode && (
              <button className={`tab-eye ${tab.visible ? 'on' : 'off'}`}
                onClick={e => { e.stopPropagation(); onTabChange('__toggle__' + tab.id); }}
                title={tab.visible ? 'Nascondi tab' : 'Mostra tab'}>
                <Icon id={tab.visible ? 'action.show' : 'action.hide'} size={12} fallback={tab.visible ? '👁' : '🚫'} />
              </button>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
