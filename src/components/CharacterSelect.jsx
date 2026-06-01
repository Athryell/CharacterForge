import React from 'react';
import { useTranslation } from 'react-i18next';

const CLASS_ICON = {
  Barbarian:'⚔', Bard:'🎵', Cleric:'✝', Druid:'🌿', Fighter:'🛡',
  Rogue:'🗡', Wizard:'📖', Monk:'👊', Paladin:'⚔', Ranger:'🏹',
  Sorcerer:'✨', Warlock:'👁',
};

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }); }
  catch { return ''; }
}

export default function CharacterSelect({ chars, onSelect, onCreate, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="char-select-overlay">
      <div className="char-select-modal">
        <div className="char-select-header">
          <div className="char-select-title">⚔ CharacterForge</div>
          <div className="char-select-sub">{t('charSelect.subtitle', 'Choose a character or create a new one')}</div>
        </div>

        <div className="char-select-list">
          {chars.length === 0 && (
            <div className="char-select-empty">{t('charSelect.empty', 'No saved characters. Create a new one!')}</div>
          )}
          {chars.map(c => (
            <div key={c.id} className="char-select-item" onClick={() => onSelect(c.id)}>
              <div className="char-select-icon">{CLASS_ICON[c.charClass] || '🧙'}</div>
              <div className="char-select-info">
                <div className="char-select-name">{c.name || t('charSelect.unnamed', 'Unnamed')}</div>
                <div className="char-select-meta">
                  {c.charClass && <span>{t(`data.classes.${c.charClass}`, c.charClass)}</span>}
                  {c.charLevel > 1 && <span>· {t('charSelect.level', 'Level')} {c.charLevel}</span>}
                  {c.lastSaved && <span className="char-select-date">· {fmtDate(c.lastSaved)}</span>}
                </div>
              </div>
              <button
                className="equip-remove"
                style={{ marginLeft: 'auto', flexShrink: 0 }}
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm(t('charSelect.confirmDelete', 'Delete "{{name}}"? This cannot be undone.', { name: c.name || t('charSelect.unnamed', 'Unnamed') }))) {
                    onDelete(c.id);
                  }
                }}
                title={t('charSelect.deleteTitle', 'Delete character')}
              >🗑</button>
            </div>
          ))}
        </div>

        <div className="char-select-footer">
          <button className="io-btn primary" style={{ width: '100%' }} onClick={onCreate}>
            + {t('charSelect.createNew', 'Create new character')}
          </button>
        </div>
      </div>
    </div>
  );
}
