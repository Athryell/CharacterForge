import { useState, useEffect, useMemo } from 'react';

// activeFilters: { [filterId]: string[] }  — empty array = "all" (no filter)
// OR within a category, AND across categories
// storageKey: optional string — when set, persists filter/sort state in sessionStorage
const SESSION_PREFIX = 'cf_filtersort_';

export function useFilterSort({ filters = [], sorts = [], items = [], filterFn, sortFn, storageKey }) {
  const defaultSort = sorts[0]?.value || 'default';

  const [activeFilters, setActiveFilters] = useState(() => {
    const base = Object.fromEntries(filters.map(f => [f.id, []]));
    if (!storageKey) return base;
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_PREFIX + storageKey));
      if (saved?.filters) return Object.fromEntries(filters.map(f => [f.id, saved.filters[f.id] || []]));
    } catch {}
    return base;
  });

  const [activeSort, setActiveSort] = useState(() => {
    if (!storageKey) return defaultSort;
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_PREFIX + storageKey));
      if (saved?.sort && sorts.some(s => s.value === saved.sort)) return saved.sort;
    } catch {}
    return defaultSort;
  });

  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(SESSION_PREFIX + storageKey, JSON.stringify({ filters: activeFilters, sort: activeSort }));
    } catch {}
  }, [storageKey, activeFilters, activeSort]);

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
  const hasActiveSort = activeSort !== (sorts[0]?.value || 'default');

  const filteredItems = useMemo(() => {
    let result = filterFn ? items.filter(item => filterFn(item, activeFilters)) : items;
    if (sortFn) result = sortFn([...result], activeSort);
    return result;
  }, [items, activeFilters, activeSort, filterFn, sortFn]);

  function toggleFilter(filterId, value) {
    if (value === 'all') {
      setActiveFilters(prev => ({ ...prev, [filterId]: [] }));
      return;
    }
    setActiveFilters(prev => {
      const current = prev[filterId] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterId]: next };
    });
  }

  function resetFilters() {
    setActiveFilters(Object.fromEntries(filters.map(f => [f.id, []])));
    setActiveSort(sorts[0]?.value || 'default');
  }

  function togglePanel(panel) {
    setActivePanel(prev => prev === panel ? null : panel);
  }

  return {
    activeFilters, toggleFilter, resetFilters,
    activeSort, setActiveSort,
    activePanel, togglePanel,
    hasActiveFilters, hasActiveSort,
    filteredItems,
  };
}
