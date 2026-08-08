import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';
import { SYSTEM_METAS } from '../systems/registry';

export default function SystemPicker({ onSelect, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="creator-overlay">
      <div className="creator-modal" style={{ maxWidth: 460 }}>
        <div className="creator-header">
          <div className="creator-title">{t('systemPicker.title', 'Choose a system')}</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="char-select-list">
          {SYSTEM_METAS.map(s => (
            <div key={s.id} className="char-select-item" onClick={() => onSelect(s.id)}>
              <div className="char-select-icon"><Icon id={s.iconId} size={22} /></div>
              <div className="char-select-info">
                <div className="char-select-name">{t(`system.${s.id}`, s.name)}</div>
                <div className="char-select-meta">{s.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
