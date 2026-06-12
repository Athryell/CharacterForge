import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListFilter, ArrowDownWideNarrow, X } from 'lucide-react';

export default function FilterSortBar({
  filters,          // [{ id, label, options: [{value, label}] }]
  sorts,            // [{value, label}]
  activeFilters,    // { [filterId]: string[] }
  activeSort,
  activePanel,      // null | 'filter' | 'sort'
  hasActiveFilters,
  hasActiveSort,
  onFilterToggle,   // (filterId, value) => void
  onSortChange,     // (value) => void
  onPanelToggle,    // (panel: 'filter'|'sort') => void
  onReset,          // () => void
  children,
}) {
  const { t } = useTranslation();
  const hasAny = hasActiveFilters || hasActiveSort;
  const activeFilterCount = filters.filter(f => (activeFilters[f.id] || []).length > 0).length;

  return (
    <div className="filter-sort-bar">
      <div className="filter-sort-triggers">
        <button
          className={`filter-sort-btn ${(hasActiveFilters || activePanel === 'filter') ? 'active' : ''}`}
          onClick={() => onPanelToggle('filter')}
          title={t('filterSort.filters')}
        >
          <ListFilter size={14} />
          <span>{t('filterSort.filters')}</span>
          {hasActiveFilters && (
            <span className="filter-sort-count">{activeFilterCount}</span>
          )}
        </button>

        {sorts.length > 0 && (
          <button
            className={`filter-sort-btn ${(hasActiveSort || activePanel === 'sort') ? 'active' : ''}`}
            onClick={() => onPanelToggle('sort')}
            title={t('filterSort.sort')}
          >
            <ArrowDownWideNarrow size={14} />
            <span>{t('filterSort.sort')}</span>
          </button>
        )}

        {hasAny && (
          <button className="filter-sort-reset" onClick={onReset} title={t('filterSort.reset')}>
            <X size={12} />
          </button>
        )}
      </div>

      {activePanel === 'filter' && (
        <div className="filter-sort-panel">
          {filters.map(filter => {
            const selected = activeFilters[filter.id] || [];
            return (
              <div key={filter.id} className="filter-sort-group">
                <div className="filter-sort-group-label">{filter.label}</div>
                <div className="filter-sort-chips">
                  <button
                    className={`filter-chip ${selected.length === 0 ? 'active' : ''}`}
                    onClick={() => onFilterToggle(filter.id, 'all')}
                  >
                    {t('filterSort.all')}
                  </button>
                  {filter.options.filter(o => o.value !== 'all').map(opt => (
                    <button
                      key={opt.value}
                      className={`filter-chip ${selected.includes(opt.value) ? 'active' : ''}`}
                      onClick={() => onFilterToggle(filter.id, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {children}
        </div>
      )}

      {activePanel === 'sort' && sorts.length > 0 && (
        <div className="filter-sort-panel">
          <div className="filter-sort-group">
            <div className="filter-sort-group-label">{t('filterSort.sortBy')}</div>
            <div className="filter-sort-chips">
              {sorts.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-chip ${activeSort === opt.value ? 'active' : ''}`}
                  onClick={() => onSortChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
