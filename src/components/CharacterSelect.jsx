import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';
import { SYSTEM_METAS, DEFAULT_SYSTEM, getPlugin } from '../systems/registry';

const CLASS_ICON = {
  Barbarian:'⚔', Bard:'🎵', Cleric:'✝', Druid:'🌿', Fighter:'🛡',
  Rogue:'🗡', Wizard:'📖', Monk:'👊', Paladin:'⚔', Ranger:'🏹',
  Sorcerer:'✨', Warlock:'👁',
};

const STORAGE_KEY = 'characterforge_char_filter';

export function loadCharFilter() {
  try { return localStorage.getItem(STORAGE_KEY) || 'all'; } catch { return 'all'; }
}

export function saveCharFilter(systemId) {
  try { localStorage.setItem(STORAGE_KEY, systemId); } catch {}
}

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }); }
  catch { return ''; }
}

export default function CharacterSelect({ chars, filter, onFilterChange, onSelect, onCreate, onDelete }) {
  const { t } = useTranslation();
  // Only systems that actually own a saved character get a chip — an
  // untouched system never clutters the bar, and a single-system library
  // shows no bar at all (there'd be nothing to filter).
  const systemsPresent = SYSTEM_METAS.filter(m => chars.some(c => (c.system || DEFAULT_SYSTEM) === m.id));
  const visibleChars = filter === 'all' ? chars : chars.filter(c => (c.system || DEFAULT_SYSTEM) === filter);

  return (
    <div className="char-select-overlay">
      <div className="char-select-modal">
        <div className="char-select-header">
          <div className="char-select-title">⚔ CharacterForge</div>
          <div className="char-select-sub">{t('charSelect.subtitle', 'Choose a character or create a new one')}</div>
        </div>

        {systemsPresent.length > 1 && (
          <div className="char-select-filter-bar filter-bar">
            <button
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              {t('charSelect.filterAll', 'All')}
            </button>
            {systemsPresent.map(m => (
              <button
                key={m.id}
                className={`filter-chip ${filter === m.id ? 'active' : ''}`}
                onClick={() => onFilterChange(m.id)}
              >
                <Icon id={m.iconId} size={12} /> {t(`system.${m.id}`, m.shortName)}
              </button>
            ))}
          </div>
        )}

        <div className="char-select-list">
          {visibleChars.length === 0 && (
            <div className="char-select-empty">{t('charSelect.empty', 'No saved characters. Create a new one!')}</div>
          )}
          {visibleChars.map(c => {
            const charSystem = c.system || DEFAULT_SYSTEM;
            return (
              <div key={c.id} className="char-select-item" onClick={() => onSelect(c.id)}>
                <div className="char-select-icon">{CLASS_ICON[c.charClass] || '🧙'}</div>
                <div className="char-select-info">
                  <div className="char-select-name">{c.name || t('charSelect.unnamed', 'Unnamed')}</div>
                  <div className="char-select-meta">
                    {systemsPresent.length > 1 && <span>{t(`system.${charSystem}`, getPlugin(charSystem).meta.shortName)}</span>}
                    {c.charClass && <span>· {t(`data.classes.${c.charClass}`, c.charClass)}</span>}
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
                ><Icon id="action.delete" size={15} /></button>
              </div>
            );
          })}
        </div>

        <div className="char-select-footer">
          <button className="io-btn primary" style={{ width: '100%' }} onClick={onCreate}>
            <Icon id="action.add" size={13} /> {t('charSelect.createNew', 'Create new character')}
          </button>
        </div>
      </div>
    </div>
  );
}
