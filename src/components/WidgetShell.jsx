import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWidgetLabel } from '../layout';
import { Icon } from '../config/icons';

export default function WidgetShell({
  id, children, editMode, fullWidth, bottomFull,
  onDragStart, onDragOver, onDrop,
  onMoveToTab, onToggleVisible, onToggleFullWidth, onToggleBottomFull,
  isDragOver,
  systemId, tabs = [], userDefined, onEdit, onRemove,
}) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const label = t(getWidgetLabel(id, systemId));

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
            <Icon id={fullWidth ? 'action.shrink' : 'action.expand'} size={14} />
            {fullWidth ? t('layout.halfWidth') : t('layout.fullWidth')}
          </button>

          {fullWidth && (
            <button className="widget-action-btn" onClick={() => onToggleBottomFull && onToggleBottomFull(id)}>
              {bottomFull ? t('layout.above') : t('layout.below')}
            </button>
          )}

          {userDefined ? (
            <>
              {onEdit && (
                <button className="widget-action-btn" onClick={() => onEdit(id)}>
                  {t('customWidgets.editWidget')}
                </button>
              )}
              {onRemove && (
                <button
                  className="widget-action-btn danger icon-only"
                  onClick={() => onRemove(id)}
                  title={t('customWidgets.removeWidget')}
                  aria-label={t('customWidgets.removeWidget')}
                >
                  <Icon id="action.remove" size={14} />
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
                    {/* the active system's own tabs — offering D&D's to every
                        system sent Daggerheart widgets to a spells tab it has
                        no way to render */}
                    {tabs.map(tab => (
                      <button key={tab.id} className="widget-tab-menu-item"
                        onClick={() => { onMoveToTab(id, tab.id); setShowMenu(false); }}>
                        {tab.icon} {t(tab.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="widget-action-btn danger icon-only"
                onClick={() => onToggleVisible(id)}
                title={t('layout.hideWidget')}
                aria-label={t('layout.hideWidget')}
              >
                <Icon id="action.hide" size={14} />
              </button>
            </>
          )}
        </div>
      )}
      <div className="widget-content">{children}</div>
    </div>
  );
}
