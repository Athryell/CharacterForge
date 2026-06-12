import { useState, useMemo } from 'react';

// activeFilters: { [filterId]: string[] }  — empty array = "all" (no filter)
// OR within a category, AND across categories
export function useFilterSort({ filters = [], sorts = [], items = [], filterFn, sortFn }) {
  const [activeFilters, setActiveFilters] = useState(() =>
    Object.fromEntries(filters.map(f => [f.id, []]))
  );
  const [activeSort, setActiveSort] = useState(sorts[0]?.value || 'default');
  const [activePanel, setActivePanel] = useState(null); // null | 'filter' | 'sort'

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
