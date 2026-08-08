import React from 'react';
import { useTranslation } from 'react-i18next';

function isSameItem(a, b) {
  if (!a || !b) return false;
  if (a.id != null && b.id != null) return String(a.id) === String(b.id);
  return a.name === b.name;
}

export default function PresetBrowser({
  items = [],
  searchValue = '',
  onSearchChange,
  selectedItem,
  onSelect,
  onAdd,
  onCancel,
  renderItem,
  renderDetail,
  addLabel,
  emptyLabel,
  groupBy,
  groupLabel,
}) {
  const { t } = useTranslation();

  const filtered = searchValue
    ? items.filter(item => (item.name || '').toLowerCase().includes(searchValue.toLowerCase()))
    : items;

  function renderRow(item) {
    const isSelected = isSameItem(selectedItem, item);
    return (
      <div
        key={item.id ?? item.name}
        className={`weapon-preset-item${isSelected ? ' selected' : ''}`}
        onClick={() => onSelect?.(item)}
      >
        {renderItem(item)}
        {isSelected && renderDetail && (
          <div className="preset-browser-detail" onClick={e => e.stopPropagation()}>
            {renderDetail(item)}
          </div>
        )}
      </div>
    );
  }

  let listContent;
  if (groupBy) {
    const groups = new Map();
    filtered.forEach(item => {
      const key = item[groupBy] ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    listContent = [...groups.entries()].map(([key, groupItems]) => (
      <div key={key}>
        <div className="preset-browser-group-label">
          {groupLabel ? groupLabel(key) : key}
        </div>
        {groupItems.map(item => renderRow(item))}
      </div>
    ));
  } else {
    listContent = filtered.map(item => renderRow(item));
  }

  return (
    <>
      <input
        className="spell-search"
        placeholder={t('spells.searchPlaceholder')}
        value={searchValue}
        onChange={e => onSearchChange?.(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div className="weapon-preset-list">
        {filtered.length === 0
          ? <div className="hint-text" style={{ padding: '6px 0' }}>
              {emptyLabel ?? t('common.noData')}
            </div>
          : listContent
        }
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {onCancel && (
          <button className="io-btn" onClick={onCancel}>{t('common.cancel')}</button>
        )}
        {onAdd && (
          <button className="io-btn primary" onClick={onAdd} disabled={!selectedItem}>
            {addLabel ?? t('common.add')}
          </button>
        )}
      </div>
    </>
  );
}
