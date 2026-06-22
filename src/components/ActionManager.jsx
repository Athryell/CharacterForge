import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';
import { KeywordText } from './Tooltip';
import { TagPill, TagSelector, TagFilterBar } from './Tags';
import FilterSortBar from './FilterSortBar';
import { useFilterSort } from '../hooks/useFilterSort';
import { useUnits, parseSpeedFt } from '../hooks/useUnits';
import { SCHOOLS } from '../data/systems/dnd5e2024/spells';
import NotationTextarea from './NotationTextarea';

const ACTION_TYPE_KEYS = ['action', 'bonus', 'reaction', 'free'];

const SCHOOL_SHORT = {
  enchantment: 'Enc', divination: 'Div', evocation: 'Evo', illusion: 'Ill',
  conjuration: 'Con', necromancy: 'Nec', transmutation: 'Tra', abjuration: 'Abj',
};

const DEFAULT_FORM = { name: '', type: 'action', desc: '', dice: '' };
const TYPE_ORDER = { action: 0, bonus: 1, reaction: 2, free: 3 };

function buildFilters(t, toDisplaySpeed, speedUnit) {
  return [
    {
      id: 'type',
      label: t('actions.filterType'),
      options: ACTION_TYPE_KEYS.map(v => ({
        value: v,
        label: t(`actions.type${v.charAt(0).toUpperCase()}${v.slice(1)}`),
      })),
    },
    {
      id: 'level',
      label: t('spells.filterLevel'),
      options: [
        { value: '0', label: t('spells.filterCantrips') },
        { value: '1', label: '1°' }, { value: '2', label: '2°' }, { value: '3', label: '3°' },
        { value: '4', label: '4°' }, { value: '5', label: '5°' }, { value: '6', label: '6°' },
        { value: '7', label: '7°' }, { value: '8', label: '8°' }, { value: '9', label: '9°' },
      ],
    },
    {
      id: 'school',
      label: t('spells.filterSchool'),
      options: SCHOOLS.map(s => ({ value: s, label: SCHOOL_SHORT[s] || s })),
    },
    {
      id: 'prepared',
      label: t('spells.filterPrepared'),
      options: [
        { value: 'prepared', label: t('spells.filterPreparedOnly') },
        { value: 'always', label: t('spells.filterAlwaysPrepared') },
      ],
    },
    {
      id: 'duration',
      label: t('spells.filterDuration'),
      options: [
        { value: 'instant', label: t('spells.durationInstant') },
        { value: '1round', label: t('spells.duration1Round') },
        { value: '1min', label: t('spells.duration1Min') },
        { value: '10min', label: t('spells.duration10Min') },
        { value: '1hour', label: t('spells.duration1Hour') },
        { value: 'concentration', label: t('spells.durationConc') },
      ],
    },
    {
      id: 'range',
      label: t('spells.filterRange'),
      options: [
        { value: 'self', label: t('spells.rangeSelf') },
        { value: 'touch', label: t('spells.rangeTouch') },
        { value: 'close', label: t('spells.rangeClose', { val: toDisplaySpeed(30), unit: speedUnit }) },
        { value: 'medium', label: t('spells.rangeMedium', { min: toDisplaySpeed(30), max: toDisplaySpeed(150), unit: speedUnit }) },
        { value: 'long', label: t('spells.rangeLong', { val: toDisplaySpeed(150), unit: speedUnit }) },
      ],
    },
  ];
}

function buildSorts(t) {
  return [
    { value: 'default', label: t('filterSort.sortDefault') },
    { value: 'alpha', label: t('filterSort.sortAlpha') },
    { value: 'type', label: t('filterSort.sortType') },
  ];
}

function ActionItem({ action, allTags = [], onRoll, onUpdateTags, onCreateTag, onRemove, onEdit, onToggleHide }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const badgeClass = { action:'badge-action', bonus:'badge-bonus', reaction:'badge-reaction', free:'badge-free' }[action.type] || 'badge-free';
  const typeLabels = { action: t('actions.typeAction'), bonus: t('actions.typeBonus'), reaction: t('actions.typeReaction'), free: t('actions.typeFree') };
  const typeLabel = typeLabels[action.type] || action.type;
  const isHidden = !!action.hidden;

  function startEdit(e) {
    e.stopPropagation();
    setForm({ name: action.name, type: action.type||'action', desc: action.desc||'' });
    setEditing(true);
  }
  function saveEdit(e) {
    e.stopPropagation();
    if (form.name.trim()) { onEdit && onEdit(action.id, form); }
    setEditing(false);
  }

  if (editing && form) {
    return (
      <div className={`action-item expanded${isHidden ? ' action-hidden' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`action-badge ${badgeClass}`}>
          <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
            style={{ background:'transparent', border:'none', color:'inherit', font:'inherit', cursor:'pointer' }}>
            {ACTION_TYPE_KEYS.map(v => <option key={v} value={v}>{typeLabels[v]}</option>)}
          </select>
        </div>
        <div className="action-content" style={{ flex:1 }}>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            style={{ width:'100%', marginBottom:4, fontSize:13, fontWeight:600, background:'var(--c-bg)', color:'var(--c-ink)', border:'0.5px solid var(--c-border-mid)', borderRadius:'var(--r)', padding:'5px 8px' }} placeholder={t('actions.addFormNamePlaceholder')} autoFocus />
          <NotationTextarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))}
            className="notes-area" style={{ minHeight:48, marginBottom:4 }} placeholder={t('actions.addFormDescPlaceholder')} />
          <div style={{ marginTop:6 }}>
            <TagSelector selected={action.tags||[]} allTags={allTags}
              onChange={tags => onUpdateTags && onUpdateTags(action.id, tags)} onCreateTag={onCreateTag} />
          </div>
          <div style={{ display:'flex', gap:6, marginTop:8, justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:6 }}>
              {onRemove && (
                <button className="io-btn danger" onClick={e => { e.stopPropagation(); onRemove(action.id); setEditing(false); }}>{t('actions.deleteBtn')}</button>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="io-btn" onClick={e => { e.stopPropagation(); setEditing(false); }}>{t('common.cancel')}</button>
              <button className="io-btn primary" onClick={saveEdit}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`action-item ${expanded ? 'expanded' : ''}${isHidden ? ' action-hidden' : ''}`}
      onClick={() => setExpanded(e => !e)}>
      <div className={`action-badge ${badgeClass}`}>{typeLabel}</div>
      <div className="action-content">
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div className="action-name" style={{ flex:1 }}>{action.name}</div>
          {(action.tags||[]).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
        </div>
        {expanded && (
          <div className="action-desc-full" onClick={e => e.stopPropagation()}>
            <KeywordText text={action.desc} onRoll={onRoll} label={action.name} />
            {action.dice && (
              <div className="action-roll" onClick={e => { e.stopPropagation(); onRoll(action.dice, action.name); }}>
                {t('actions.rollLabel')} {action.dice}
              </div>
            )}
            <div className="item-edit-actions">
              <button className="io-btn" onClick={startEdit}><Icon id="action.editItem" size={13} /> {t('common.edit')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActionManager({ actions = [], spells = [], allTags = [], onUpdate, onRoll, onUpdateTags, onCreateTag }) {
  const { t } = useTranslation();
  const { toDisplaySpeed, speedUnit } = useUnits();
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(DEFAULT_FORM);
  const [tagFilter, setTagFilter] = useState(null);

  const spellByName = useMemo(() => Object.fromEntries(spells.map(s => [s.name, s])), [spells]);
  const hasSpellActions = useMemo(() => actions.some(a => !!spellByName[a.name]), [actions, spellByName]);

  // Always build all filters so useFilterSort state is always fully initialized.
  // FilterSortBar only shows spell groups when hasSpellActions.
  const allFilters = useMemo(() => buildFilters(t, toDisplaySpeed, speedUnit), [t, toDisplaySpeed, speedUnit]);
  const visibleFilters = useMemo(
    () => hasSpellActions ? allFilters : allFilters.filter(f => f.id === 'type'),
    [allFilters, hasSpellActions]
  );
  const sorts = useMemo(() => buildSorts(t), [t]);

  const {
    activeFilters, toggleFilter, resetFilters,
    activeSort, setActiveSort,
    activePanel, togglePanel,
    hasActiveFilters, hasActiveSort,
    filteredItems,
  } = useFilterSort({
    filters: allFilters,
    sorts,
    items: actions,
    filterFn: (action, filters) => {
      if (filters.type.length > 0 && !filters.type.includes(action.type)) return false;

      const spell = spellByName[action.name];
      const hasSpellFilters =
        (filters.level || []).length > 0 ||
        (filters.school || []).length > 0 ||
        (filters.prepared || []).length > 0 ||
        (filters.duration || []).length > 0 ||
        (filters.range || []).length > 0;

      if (hasSpellFilters) {
        if (!spell) return false;
        if (filters.level.length > 0 && !filters.level.includes(String(spell.level))) return false;
        if (filters.school.length > 0 && !filters.school.includes(spell.school)) return false;
        if (filters.prepared.length > 0) {
          const ok = filters.prepared.some(p => {
            if (p === 'prepared') return spell.prepared || spell.alwaysPrepared;
            if (p === 'always') return spell.alwaysPrepared;
            return false;
          });
          if (!ok) return false;
        }
        if (filters.duration.length > 0) {
          const d = (spell.duration || '').toLowerCase();
          const ok = filters.duration.some(dur => {
            if (dur === 'instant') return d.includes('instant');
            if (dur === '1round') return d.includes('round');
            if (dur === '1min') return d.includes('1 minute') || d.includes('1 minuto');
            if (dur === '10min') return d.includes('10 minute') || d.includes('10 minuti');
            if (dur === '1hour') return d.includes('hour') || d.includes('ora');
            if (dur === 'concentration') return !!spell.concentration;
            return false;
          });
          if (!ok) return false;
        }
        if (filters.range.length > 0) {
          const r = (spell.range || '').toLowerCase();
          const isSelf = r.includes('self') || r.includes('sé');
          const isTouch = r.includes('touch') || r.includes('contatto');
          const rangeFt = isSelf || isTouch ? 0 : parseSpeedFt(spell.range || '');
          const ok = filters.range.some(range => {
            if (range === 'self') return isSelf;
            if (range === 'touch') return isTouch;
            if (range === 'close') return !isSelf && !isTouch && rangeFt > 0 && rangeFt <= 30;
            if (range === 'medium') return rangeFt > 30 && rangeFt <= 150;
            if (range === 'long') return rangeFt > 150;
            return false;
          });
          if (!ok) return false;
        }
      }
      return true;
    },
    sortFn: (items, sort) => {
      if (sort === 'alpha') return items.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'type') return items.sort((a, b) =>
        (TYPE_ORDER[a.type] ?? 4) - (TYPE_ORDER[b.type] ?? 4) || a.name.localeCompare(b.name));
      return items;
    },
    storageKey: 'actions',
  });

  const typeLabels = {
    action: t('actions.typeAction'),
    bonus: t('actions.typeBonus'),
    reaction: t('actions.typeReaction'),
    free: t('actions.typeFree'),
  };

  const displayedActions = tagFilter
    ? filteredItems.filter(a => (a.tags || []).includes(tagFilter))
    : filteredItems;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <FilterSortBar
            filters={visibleFilters}
            sorts={sorts}
            activeFilters={activeFilters}
            activeSort={activeSort}
            activePanel={activePanel}
            hasActiveFilters={hasActiveFilters}
            hasActiveSort={hasActiveSort}
            onFilterToggle={toggleFilter}
            onSortChange={setActiveSort}
            onPanelToggle={togglePanel}
            onReset={resetFilters}
          >
            {allTags.length > 0 && (
              <TagFilterBar allTags={allTags} activeTag={tagFilter} onSelect={setTagFilter} />
            )}
          </FilterSortBar>
        </div>
        <button
          className={`icon-btn ${addOpen ? 'active' : ''}`}
          onClick={() => {
            const defaultType = activeFilters.type.length === 1 ? activeFilters.type[0] : 'action';
            setAddForm(f => ({ ...f, type: defaultType }));
            setAddOpen(v => !v);
          }}
        ><Icon id="action.add" size={13} /></button>
      </div>

      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 8 }}>
          <div className="field-row">
            <div className="field">
              <label>{t('actions.addFormName')}</label>
              <input value={addForm.name} onChange={e => setAddForm(f => ({...f, name: e.target.value}))}
                placeholder={t('actions.addFormNamePlaceholder')} autoFocus />
            </div>
            <div className="field">
              <label>{t('actions.addFormType')}</label>
              <select value={addForm.type} onChange={e => setAddForm(f => ({...f, type: e.target.value}))}>
                {ACTION_TYPE_KEYS.map(v => <option key={v} value={v}>{typeLabels[v]}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>{t('actions.addFormDesc')}</label>
            <NotationTextarea className="notes-area" style={{ minHeight: 48 }}
              value={addForm.desc} onChange={e => setAddForm(f => ({...f, desc: e.target.value}))}
              placeholder={t('actions.addFormDescPlaceholder')} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { setAddOpen(false); setAddForm(DEFAULT_FORM); }}>
              {t('common.cancel')}
            </button>
            <button className="io-btn primary" disabled={!addForm.name.trim()} onClick={() => {
              if (!addForm.name.trim()) return;
              onUpdate([...actions, { ...addForm, id: Date.now().toString() }]);
              setAddOpen(false);
              setAddForm(DEFAULT_FORM);
            }}>{t('common.add')}</button>
          </div>
        </div>
      )}

      <div className="action-list">
        {displayedActions.map(action => (
          <ActionItem
            key={action.id || action.name}
            action={action}
            allTags={allTags}
            onRoll={onRoll}
            onUpdateTags={onUpdateTags}
            onCreateTag={onCreateTag}
            onRemove={id => onUpdate(actions.filter(a => a.id !== id))}
            onEdit={(id, patch) => onUpdate(actions.map(a => a.id === id ? { ...a, ...patch } : a))}
            onToggleHide={id => onUpdate(actions.map(a => a.id === id ? { ...a, hidden: !a.hidden } : a))}
          />
        ))}
      </div>
    </div>
  );
}
