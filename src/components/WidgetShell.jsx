import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWidgetLabel, ALL_TABS } from '../layout';
import { Icon } from '../config/icons';

export default function WidgetShell({
  id, children, editMode, fullWidth, bottomFull,
  onDragStart, onDragOver, onDrop,
  onMoveToTab, onToggleVisible, onToggleFullWidth, onToggleBottomFull,
  isDragOver,
  systemId, onEdit, onRemove,
}) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const label = t(getWidgetLabel(id));
  const isCustom = systemId === 'custom';

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
          <span className="widget-drag-handle"><Icon id="action.layout" size={16} /></span>
          <span className="widget-label">{label}</span>
          <div style={{ flex:1 }} />

          <button className="widget-action-btn" onClick={() => onToggleFullWidth(id)}>
            {fullWidth ? t('layout.halfWidth') : t('layout.fullWidth')}
          </button>

          {fullWidth && (
            <button className="widget-action-btn" onClick={() => onToggleBottomFull && onToggleBottomFull(id)}>
              {bottomFull ? t('layout.above') : t('layout.below')}
            </button>
          )}

          {isCustom ? (
            <>
              {onEdit && (
                <button className="widget-action-btn" onClick={() => onEdit(id)}>
                  {t('customWidgets.editWidget')}
                </button>
              )}
              {onRemove && (
                <button className="widget-action-btn danger" onClick={() => onRemove(id)}>
                  {t('customWidgets.removeWidget')}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ position:'relative' }}>
                <button className="widget-action-btn" onClick={() => setShowMenu(v => !v)}>{t('layout.moveTo')}</button>
                {showMenu && (
                  <div className="widget-tab-menu">
                    <div className="widget-tab-menu-title">{t('layout.moveToTitle')}</div>
                    {ALL_TABS.map(tab => (
                      <button key={tab.id} className="widget-tab-menu-item"
                        onClick={() => { onMoveToTab(id, tab.id); setShowMenu(false); }}>
                        {tab.icon} {t(tab.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="widget-action-btn danger" onClick={() => onToggleVisible(id)}>{t('layout.hide')}</button>
            </>
          )}
        </div>
      )}
      <div className="widget-content">{children}</div>
    </div>
  );
}
