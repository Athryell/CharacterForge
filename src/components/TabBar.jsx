import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';

const MAX_BOTTOM_TABS = 5;

export default function TabBar({ tabs, activeTab, onTabChange, editMode, onReorderTabs, systemName }) {
  const { t } = useTranslation();
  const dragIdx     = useRef(null);
  const dragOverIdx = useRef(null);
  const groupRef    = useRef(null);
  const [overflows, setOverflows] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 599px)').matches);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const displayTabs   = editMode ? tabs : tabs.filter(tab => tab.visible);
  const bottomNavTabs = editMode ? tabs : tabs.filter(tab => tab.visible);

  const hasMore    = bottomNavTabs.length > MAX_BOTTOM_TABS;
  const bottomTabs = hasMore ? bottomNavTabs.slice(0, MAX_BOTTOM_TABS - 1) : bottomNavTabs;
  const moreTabs   = hasMore ? bottomNavTabs.slice(MAX_BOTTOM_TABS - 1) : [];

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [displayTabs]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 599px)');
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function onDragStart(i)   { dragIdx.current = i; }
  function onDragOver(e, i) { e.preventDefault(); dragOverIdx.current = i; }
  function onDrop() {
    const from = dragIdx.current, to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    const next = [...tabs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorderTabs(next);
    dragIdx.current = dragOverIdx.current = null;
  }

  function handleBottomTab(tab) {
    if (!editMode && tab.visible) onTabChange(tab.id);
  }

  return (
    <>
      <div className="topbar">
        <span className="tab-bar-system">{systemName}</span>
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

      {isMobile && (
        <nav className="bottom-nav" role="navigation" aria-label={t('nav.mainNav', 'Main navigation')}>
          {bottomTabs.map(tab => (
            <button
              key={tab.id}
              className={`bottom-nav-item${activeTab === tab.id ? ' active' : ''}${!tab.visible ? ' dimmed' : ''}`}
              onClick={() => handleBottomTab(tab)}
              aria-label={t(tab.label)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="bottom-nav-icon">
                <Icon id={`tab.${tab.id}`} size={22} fallback={tab.icon} />
              </span>
              <span className="bottom-nav-label">{t(tab.label)}</span>
            </button>
          ))}
          {moreTabs.length > 0 && (
            <button
              className={`bottom-nav-item${moreTabs.some(tab => tab.id === activeTab) ? ' active' : ''}`}
              onClick={() => setShowMoreDrawer(v => !v)}
              aria-label={t('nav.more', 'More')}
            >
              <span className="bottom-nav-icon bottom-nav-icon-more">···</span>
              <span className="bottom-nav-label">{t('nav.more', 'More')}</span>
            </button>
          )}
        </nav>
      )}

      {isMobile && showMoreDrawer && (
        <>
          <div className="bottom-drawer-overlay" onClick={() => setShowMoreDrawer(false)} />
          <div className="bottom-drawer" role="dialog" aria-modal="true" aria-label={t('nav.more', 'More')}>
            {moreTabs.map(tab => (
              <button
                key={tab.id}
                className={`bottom-drawer-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => {
                  if (!editMode && tab.visible) { onTabChange(tab.id); setShowMoreDrawer(false); }
                }}
                aria-label={t(tab.label)}
              >
                <Icon id={`tab.${tab.id}`} size={20} fallback={tab.icon} />
                <span>{t(tab.label)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
