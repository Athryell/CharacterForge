import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SCHOOLS, SPELL_CLASSES, filterSpells } from '../data/systems/dnd5e2024/spells';
import dataManager from '../data/dataManager';
import { TagPill, TagSelector, TagFilterBar } from './Tags';
import { KeywordText } from './Tooltip';
import { Icon } from '../config/icons';
import FilterSortBar from './FilterSortBar';
import { useCharContext } from './CharContext';
import { syncCustomToDraft } from '../utils/homebrewSync';
import { useFilterSort } from '../hooks/useFilterSort';
import { useUnits, parseSpeedFt } from '../hooks/useUnits';

// Converts "120 feet", "60/120 feet" → "36 m", "18/36 m" etc. based on display unit.
// Non-numeric values (Self, Touch, Sight…) pass through unchanged.
function convertRangeText(text, toDisplaySpeed, speedUnit) {
  if (!text) return text;
  const unitLabel = speedUnit === 'sq' ? 'sq' : speedUnit;
  return text.replace(/(\d+)(?:\/(\d+))?\s*feet/gi, (_, n1, n2) => {
    const v1 = toDisplaySpeed(parseInt(n1));
    if (n2) return `${v1}/${toDisplaySpeed(parseInt(n2))} ${unitLabel}`;
    return `${v1} ${unitLabel}`;
  });
}

const SCHOOL_SHORT = {
  enchantment: 'Enc', divination: 'Div', evocation: 'Evo', illusion: 'Ill',
  conjuration: 'Con', necromancy: 'Nec', transmutation: 'Tra', abjuration: 'Abj',
};

const LEVEL_LABELS = {
  0: 'Trucchetti', 1: '1°', 2: '2°', 3: '3°', 4: '4°',
  5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
};

const ACTION_BADGE = {
  action:   { label: 'Az.',   bg: '#f0f0ee', color: '#5f5e5a' },
  bonus:    { label: 'Bonus', bg: '#FFF3E0', color: '#854F0B' },
  reaction: { label: 'Rea.', bg: '#E6F1FB', color: '#185FA5' },
  free:     { label: 'Lib.', bg: '#EAF3DE', color: '#3B6D11' },
};

const EMPTY_CUSTOM = { name: '', level: 0, school: '', concentration: false, ritual: false, actionType: 'action', duration: '', range: '', desc: '' };

function detectActionType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('azione bonus')) return 'bonus';
  if (t.includes('reazione')) return 'reaction';
  return 'action';
}

function SpellEditForm({ spell, srd, onSave, onCancel, onDelete, allTags, onUpdateTags, onCreateTag }) {
  const { t } = useTranslation();
  const actionTypesSpell = [
    ['action', t('actions.typeAction')],
    ['bonus', t('actions.typeBonus')],
    ['reaction', t('actions.typeReaction')],
    ['free', t('actions.typeFree')],
  ];
  const [form, setForm] = useState({
    name: spell.name,
    level: spell.level,
    school: spell.school || '',
    concentration: spell.concentration || false,
    ritual: spell.ritual || false,
    alwaysPrepared: spell.alwaysPrepared || false,
    actionType: spell.actionType || srd.actionType || detectActionType(spell.desc),
    duration: spell.duration || srd.duration || '',
    range: spell.range || srd.range || '',
    desc: spell.desc || '',
  });
  function patch(obj) { setForm(f => ({ ...f, ...obj })); }

  return (
    <div className="spell-edit-form" onClick={e => e.stopPropagation()}>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label>{t('spells.customName')}</label>
          <input value={form.name} onChange={e => patch({ name: e.target.value })} autoFocus />
        </div>
        <div className="field">
          <label>{t('spells.customLevel')}</label>
          <select value={form.level} onChange={e => patch({ level: parseInt(e.target.value) })}>
            {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('spells.customSchool')}</label>
          <select value={form.school} onChange={e => patch({ school: e.target.value })}>
            <option value="">—</option>
            {SCHOOLS.map(s => <option key={s} value={s}>{t(`data.schools.${s}`, s)}</option>)}
          </select>
        </div>
      </div>
      <div className="field-row" style={{ marginTop: 6 }}>
        <div className="field">
          <label>{t('spells.actionTypeLabel')}</label>
          <select value={form.actionType} onChange={e => patch({ actionType: e.target.value })}>
            {actionTypesSpell.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('spells.durationLabel')}</label>
          <input value={form.duration} onChange={e => patch({ duration: e.target.value })} placeholder="Es. 1 minuto, Istantaneo" />
        </div>
        <div className="field">
          <label>{t('spells.rangeLabel')}</label>
          <input value={form.range} onChange={e => patch({ range: e.target.value })} placeholder="Es. 18m, Sé stessi" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="toggle-box">
          <input type="checkbox" checked={form.concentration} onChange={e => patch({ concentration: e.target.checked })} />
          <span className="toggle-label">{t('spells.concentration')}</span>
        </label>
        <label className="toggle-box">
          <input type="checkbox" checked={form.ritual} onChange={e => patch({ ritual: e.target.checked })} />
          <span className="toggle-label">{t('spells.ritual')}</span>
        </label>
        <label className="toggle-box">
          <input type="checkbox" checked={form.alwaysPrepared} onChange={e => patch({ alwaysPrepared: e.target.checked })} />
          <span className="toggle-label">{t('spells.alwaysPrepared', 'Sempre preparata')}</span>
        </label>
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label>{t('spells.descEditLabel')}</label>
        <textarea className="notes-area" style={{ minHeight: 72 }}
          value={form.desc} onChange={e => patch({ desc: e.target.value })}
          placeholder={t('spells.customDescPlaceholder')} />
      </div>
      {onUpdateTags && (
        <div style={{ marginTop: 6 }}>
          <label style={{ fontSize: '0.733rem', color: 'var(--c-muted)', display: 'block', marginBottom: 3 }}>Tag</label>
          <TagSelector selected={spell.tags || []} allTags={allTags}
            onChange={tags => onUpdateTags(spell.name, tags)} onCreateTag={onCreateTag} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {onDelete && (
            <button className="io-btn danger" onClick={e => { e.stopPropagation(); onDelete(); }}>{t('common.deleteBtn')}</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="io-btn" onClick={onCancel}>{t('common.cancel')}</button>
          <button className="io-btn primary" onClick={() => onSave(spell.name, form)} disabled={!form.name.trim()}>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}

const SPELL_FILTERS = (t, toDisplaySpeed, speedUnit) => [
  {
    id: 'level',
    label: t('spells.filterLevel'),
    options: [
      { value: 'all', label: t('filterSort.all') },
      { value: '0', label: t('spells.filterCantrips') },
      { value: '1', label: '1°' }, { value: '2', label: '2°' }, { value: '3', label: '3°' },
      { value: '4', label: '4°' }, { value: '5', label: '5°' }, { value: '6', label: '6°' },
      { value: '7', label: '7°' }, { value: '8', label: '8°' }, { value: '9', label: '9°' },
    ],
  },
  {
    id: 'school',
    label: t('spells.filterSchool'),
    options: [
      { value: 'all', label: t('filterSort.all') },
      ...SCHOOLS.map(s => ({ value: s, label: SCHOOL_SHORT[s] || t(`data.schools.${s}`, s) })),
    ],
  },
  {
    id: 'prepared',
    label: t('spells.filterPrepared'),
    options: [
      { value: 'all', label: t('filterSort.all') },
      { value: 'prepared', label: t('spells.filterPreparedOnly') },
      { value: 'always', label: t('spells.filterAlwaysPrepared') },
    ],
  },
  {
    id: 'duration',
    label: t('spells.filterDuration'),
    options: [
      { value: 'all', label: t('filterSort.all') },
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
      { value: 'all', label: t('filterSort.all') },
      { value: 'self', label: t('spells.rangeSelf') },
      { value: 'touch', label: t('spells.rangeTouch') },
      { value: 'close', label: t('spells.rangeClose', { val: toDisplaySpeed(30), unit: speedUnit }) },
      { value: 'medium', label: t('spells.rangeMedium', { min: toDisplaySpeed(30), max: toDisplaySpeed(150), unit: speedUnit }) },
      { value: 'long', label: t('spells.rangeLong', { val: toDisplaySpeed(150), unit: speedUnit }) },
    ],
  },
];

const SPELL_SORTS = (t) => [
  { value: 'default', label: t('filterSort.sortDefault') },
  { value: 'alpha', label: t('filterSort.sortAlpha') },
  { value: 'level', label: t('filterSort.sortLevel') },
  { value: 'school', label: t('filterSort.sortSchool') },
];

export default function SpellManager({ spells = [], charClass, onUpdate, onRoll, allTags = [], onUpdateTags, onCreateTag, spellSlots = [], concentratingSpell = null, onCast, onAddAction, onRemoveAction, actionNames, homebrewKey = 0 }) {
  const { t } = useTranslation();
  const { toDisplaySpeed, speedUnit } = useUnits();
  const { systemId } = useCharContext();
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState('srd');
  const [browsedExpanded, setBrowsedExpanded] = useState(null);
  const [castMenu, setCastMenu] = useState(null);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState(charClass || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [spellTagFilter, setSpellTagFilter] = useState(null);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);
  const [editingSpellName, setEditingSpellName] = useState(null);

  const spellFilters = useMemo(() => SPELL_FILTERS(t, toDisplaySpeed, speedUnit), [t, toDisplaySpeed, speedUnit]);
  const spellSorts = useMemo(() => SPELL_SORTS(t), [t]);

  const {
    activeFilters, toggleFilter, resetFilters,
    activeSort, setActiveSort,
    activePanel, togglePanel,
    hasActiveFilters, hasActiveSort,
    filteredItems,
  } = useFilterSort({
    filters: spellFilters,
    sorts: spellSorts,
    items: spells,
    filterFn: (spell, filters) => {
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
      return true;
    },
    sortFn: (items, sort) => {
      if (sort === 'alpha') return items.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'level') return items.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
      if (sort === 'school') return items.sort((a, b) => (a.school || '').localeCompare(b.school || '') || a.name.localeCompare(b.name));
      return items;
    },
    storageKey: 'spells',
  });

  const actionTypesSpell = [
    ['action', t('actions.typeAction')],
    ['bonus', t('actions.typeBonus')],
    ['reaction', t('actions.typeReaction')],
    ['free', t('actions.typeFree')],
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const srdByName = useMemo(() => Object.fromEntries(dataManager.getSpells().map(s => [s.name, s])), [homebrewKey]);
  const knownNames = useMemo(() => new Set(spells.map(s => s.name)), [spells]);

  const browsedSpells = useMemo(() => filterSpells({
    spells: dataManager.getSpells(),
    level: filterLevel !== '' ? parseInt(filterLevel) : undefined,
    school: filterSchool || undefined,
    cls: filterClass || undefined,
    search: filterSearch || undefined,
  }).sort((a, b) => (a.name || '').localeCompare(b.name || '')), [filterLevel, filterSchool, filterClass, filterSearch, homebrewKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function addSRDSpell(spell) {
    if (knownNames.has(spell.name)) return;
    onUpdate([...spells, {
      name: spell.name, level: parseInt(spell.level) || 0, school: spell.school,
      concentration: spell.c, ritual: spell.r, prepared: false, desc: spell.desc,
      actionType: spell.actionType, duration: spell.duration, range: spell.range,
    }]);
  }

  function removeSpell(name) { onUpdate(spells.filter(s => s.name !== name)); }

  function togglePrepared(name) {
    onUpdate(spells.map(s => s.name === name ? { ...s, prepared: !s.prepared } : s));
  }

  function saveSpellEdit(originalName, form) {
    onUpdate(spells.map(s => s.name === originalName ? { ...s, ...form } : s));
    setEditingSpellName(null);
  }

  function submitCustom() {
    if (!customForm.name.trim() || knownNames.has(customForm.name.trim())) return;
    onUpdate([...spells, { ...customForm, name: customForm.name.trim(), prepared: false }]);
    syncCustomToDraft('spells', { ...customForm, name: customForm.name.trim() }, systemId);
    setCustomForm(EMPTY_CUSTOM);
    setAddOpen(false);
  }

  function handleSpellClick(spellName) {
    if (editingSpellName === spellName) return;
    setExpanded(prev => prev === spellName ? null : spellName);
  }

  const filteredKnown = useMemo(() => {
    if (!spellTagFilter) return filteredItems;
    return filteredItems.filter(s => (s.tags || []).includes(spellTagFilter));
  }, [filteredItems, spellTagFilter]);

  const byLevel = {};
  filteredKnown.forEach(s => { if (!byLevel[s.level]) byLevel[s.level] = []; byLevel[s.level].push(s); });

  return (
    <div>
      {/* ── HEADER BAR ── */}
      <div className="section-header-bar">
        <div style={{ flex: 1 }}>
          <FilterSortBar
            filters={spellFilters}
            sorts={spellSorts}
            activeFilters={activeFilters}
            activeSort={activeSort}
            activePanel={activePanel}
            hasActiveFilters={hasActiveFilters}
            hasActiveSort={hasActiveSort}
            onFilterToggle={toggleFilter}
            onSortChange={setActiveSort}
            onPanelToggle={togglePanel}
            onReset={resetFilters}
          />
        </div>
        <button className={`add-icon-btn ${addOpen ? 'active' : ''}`} onClick={() => setAddOpen(v => !v)} title={t('spells.addTitle')}>＋</button>
      </div>

      {/* ── ADD PANEL ── */}
      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="creator-method-bar" style={{ marginBottom: 10 }}>
            <button className={`filter-chip ${addMode === 'srd' ? 'active' : ''}`} onClick={() => setAddMode('srd')}>{t('spells.browseSRD')}</button>
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`} onClick={() => setAddMode('custom')}><Icon id="action.custom" size={12} /> {t('spells.custom')}</button>
          </div>

          {addMode === 'srd' ? (
            <>
              <div className="spell-browser-filters">
                <input className="spell-search" placeholder={t('spells.searchPlaceholder')}
                  value={filterSearch} onChange={e => setFilterSearch(e.target.value)} autoFocus />
                <div className="filter-bar" style={{ marginTop: 6 }}>
                  <select className="spell-filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="">{t('spells.filterAllLevels')}</option>
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <select className="spell-filter-select" value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
                    <option value="">{t('spells.filterAllSchools')}</option>
                    {SCHOOLS.map(s => <option key={s} value={s}>{t(`data.schools.${s}`, s)}</option>)}
                  </select>
                  <select className="spell-filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                    <option value="">{t('spells.filterAllClasses')}</option>
                    {SPELL_CLASSES.map(c => <option key={c} value={c}>{t(`data.classes.${c}`, c)}</option>)}
                  </select>
                </div>
                <div className="hint-text" style={{ marginTop: 4 }}>
                  {browsedSpells.length === 0 && filterClass
                    ? t('spells.foundZeroClass', { class: t(`data.classes.${filterClass}`, filterClass) })
                    : browsedSpells.length === 1
                      ? t('spells.foundSingular', { count: browsedSpells.length })
                      : t('spells.foundPlural', { count: browsedSpells.length })}
                </div>
              </div>
              <div className="spell-browser-list" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {browsedSpells.map(spell => {
                  const already = knownNames.has(spell.name);
                  const isExp = browsedExpanded === spell.name;
                  return (
                    <div key={spell.name}
                      className={`spell-browser-item ${already ? 'already-known' : ''} ${isExp ? 'expanded' : ''}`}
                      onClick={() => setBrowsedExpanded(isExp ? null : spell.name)}>
                      <div className="spell-browser-main">
                        <div className="spell-browser-name">{spell.name}</div>
                        <div className="spell-browser-tags">
                          <span className="spell-level-badge">{parseInt(spell.level) === 0 ? t('spells.filterCantrips') : t('spells.levelLabel', { level: spell.level })}</span>
                          {spell.school && <span className="spell-school-badge">{t(`data.schools.${spell.school}`, spell.school)}</span>}
                          {spell.c && <span className="spell-conc" title={t('spells.concentration')}>C</span>}
                          {spell.r && <span className="spell-ritual" title={t('spells.ritual')}>R</span>}
                        </div>
                        {spell.classes?.length > 0 && <div className="spell-browser-classes">{spell.classes.map(cl => t(`data.classes.${cl}`, cl)).join(', ')}</div>}
                        {isExp && <div className="spell-browser-desc"><KeywordText text={spell.desc} onRoll={onRoll} label={spell.name} /></div>}
                      </div>
                      <button className={`spell-add-btn ${already ? 'known' : ''}`}
                        onClick={e => { e.stopPropagation(); if (already) removeSpell(spell.name); else addSRDSpell(spell); }}>
                        {already ? <Icon id="action.done" size={13} /> : <Icon id="action.add" size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>
              <button className="io-btn" style={{ marginTop: 8 }} onClick={() => setAddOpen(false)}>{t('common.cancel')}</button>
            </>
          ) : (
            <div>
              <div className="field-row">
                <div className="field" style={{ flex: 2 }}>
                  <label>{t('spells.customName')}</label>
                  <input value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Es. Fiamma della Vendetta" autoFocus />
                </div>
                <div className="field">
                  <label>{t('spells.customLevel')}</label>
                  <select value={customForm.level} onChange={e => setCustomForm(f => ({ ...f, level: parseInt(e.target.value) }))}>
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t('spells.customSchool')}</label>
                  <select value={customForm.school} onChange={e => setCustomForm(f => ({ ...f, school: e.target.value }))}>
                    <option value="">—</option>
                    {SCHOOLS.map(s => <option key={s} value={s}>{t(`data.schools.${s}`, s)}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row" style={{ marginTop: 6 }}>
                <div className="field">
                  <label>{t('spells.actionTypeLabel')}</label>
                  <select value={customForm.actionType} onChange={e => setCustomForm(f => ({ ...f, actionType: e.target.value }))}>
                    {actionTypesSpell.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t('spells.durationLabel')}</label>
                  <input value={customForm.duration} onChange={e => setCustomForm(f => ({ ...f, duration: e.target.value }))} placeholder="Es. 1 minuto" />
                </div>
                <div className="field">
                  <label>{t('spells.rangeLabel')}</label>
                  <input value={customForm.range} onChange={e => setCustomForm(f => ({ ...f, range: e.target.value }))} placeholder="Es. 18m" />
                </div>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label>{t('spells.customDesc')}</label>
                <textarea className="notes-area" style={{ minHeight: 64 }}
                  value={customForm.desc} onChange={e => setCustomForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder={t('spells.customDescPlaceholder')} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
                <label className="toggle-box">
                  <input type="checkbox" checked={customForm.concentration}
                    onChange={e => setCustomForm(f => ({ ...f, concentration: e.target.checked }))} />
                  <span className="toggle-label">{t('spells.customConcentration')}</span>
                </label>
                <label className="toggle-box">
                  <input type="checkbox" checked={customForm.ritual}
                    onChange={e => setCustomForm(f => ({ ...f, ritual: e.target.checked }))} />
                  <span className="toggle-label">{t('spells.customRitual')}</span>
                </label>
                <div style={{ flex: 1 }} />
                <button className="io-btn" onClick={() => { setAddOpen(false); setCustomForm(EMPTY_CUSTOM); }}>{t('common.cancel')}</button>
                <button className={`io-btn primary ${!customForm.name.trim() ? 'disabled' : ''}`}
                  onClick={submitCustom} disabled={!customForm.name.trim()}>{t('spells.customAdd')}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {allTags.length > 0 && (
        <TagFilterBar allTags={allTags} activeTag={spellTagFilter} onSelect={setSpellTagFilter} />
      )}

      {/* ── LIST VIEW ── */}
      <>
        {spells.length === 0 && (
          <div className="hint-text" style={{ padding: '12px 0' }}>
            {t('spells.noSpells2')}
          </div>
        )}
        {Object.keys(byLevel).sort((a, b) => a - b).map(lvl => (
          <div key={lvl} style={{ marginBottom: 10 }}>
            <div className="spell-level-header">{LEVEL_LABELS[lvl] || `Liv. ${lvl}`}</div>
            <div className="spell-list">
              {byLevel[lvl].map(spell => {
                const isCantrip = parseInt(spell.level) === 0;
                const srd = srdByName[spell.name] || {};
                const actionType = spell.actionType || srd.actionType || detectActionType(spell.desc);
                const duration = spell.duration || srd.duration || null;
                const range = spell.range || srd.range || null;
                const rangeDisplay = convertRangeText(range, toDisplaySpeed, speedUnit);
                const ab = ACTION_BADGE[actionType] || ACTION_BADGE.action;
                const isEditing = editingSpellName === spell.name;
                const isExpanded = expanded === spell.name;
                const added = actionNames?.has(spell.name);
                const isEffectivePrepared = spell.prepared || spell.alwaysPrepared || isCantrip;

                return (
                  <div key={spell.name}
                    className={`spell-item ${isEffectivePrepared ? 'prepared' : ''} ${isExpanded || isEditing ? 'expanded' : ''} ${isCantrip ? 'cantrip' : ''}`}
                    onClick={() => handleSpellClick(spell.name)}
                  >
                    <div
                      className={`spell-prepared-dot ${isEffectivePrepared ? 'on' : ''} ${isCantrip ? 'cantrip-dot' : ''} ${spell.alwaysPrepared ? 'always-prepared-dot' : ''}`}
                      title={spell.alwaysPrepared ? t('spells.alwaysPrepared') : isCantrip ? undefined : spell.prepared ? t('spells.prepared') : t('spells.notPrepared')}
                      onClick={e => { e.stopPropagation(); if (!isCantrip && !spell.alwaysPrepared) togglePrepared(spell.name); }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <div className="spell-name">
                          {spell.name}
                          {added && <span className="action-added-badge" style={{ marginLeft: 4 }} title={t('common.inAction', 'In azioni')}><Icon id="widget.actions" size={12} /></span>}
                        </div>
                        {spell.acquiredAtLevel && <span className="level-badge">Lv. {spell.acquiredAtLevel}</span>}
                        {(spell.tags || []).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                      </div>
                      {!isExpanded && !isEditing && (rangeDisplay || duration) && (
                        <div style={{ fontSize:10, color:'var(--c-muted)', marginTop:1, display:'flex', gap:8 }}>
                          {rangeDisplay && <span>{rangeDisplay}</span>}
                          {duration && <span>{duration}</span>}
                        </div>
                      )}

                      {isEditing && (
                        <SpellEditForm
                          spell={spell} srd={srd}
                          onSave={saveSpellEdit}
                          onCancel={() => setEditingSpellName(null)}
                          onDelete={() => { removeSpell(spell.name); setEditingSpellName(null); }}
                          allTags={allTags}
                          onUpdateTags={onUpdateTags}
                          onCreateTag={onCreateTag}
                        />
                      )}

                      {isExpanded && !isEditing && (
                        <>
                          {(range || duration) && (
                            <div style={{ display:'flex', gap:10, marginTop:4, fontSize:11, color:'var(--c-muted)' }}>
                              {rangeDisplay && <span>📍 {rangeDisplay}</span>}
                              {duration && <span>⏱ {duration}</span>}
                            </div>
                          )}
                          {spell.desc && (
                            <div className="spell-desc">
                              <KeywordText text={spell.desc} onRoll={onRoll} label={spell.name}
                                counters={spell.counters}
                                onCounterChange={(idx, vals) => onUpdate(spells.map(s2 => s2.name === spell.name ? { ...s2, counters: { ...(s2.counters || {}), [idx]: vals } } : s2))} />
                            </div>
                          )}
                          <div className="item-edit-actions" onClick={e => e.stopPropagation()}>
                            {onAddAction && (
                              <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                                title={added ? t('common.removeFromAction') : t('common.addToAction')}
                                onClick={e => { e.stopPropagation(); if (added) { onRemoveAction && onRemoveAction(spell.name); } else { onAddAction({ id: `spell_${spell.name}_${Date.now()}`, name: spell.name, type: actionType, desc: spell.desc || '', dice: '' }); } }}>
                                {added ? <Icon id="action.done" size={13} /> : <Icon id="widget.actions" size={13} />}
                              </button>
                            )}
                            <button className="io-btn" onClick={() => { setEditingSpellName(spell.name); setExpanded(null); }}>{t('common.edit')}</button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="spell-action-badge" style={{ background: ab.bg, color: ab.color }}>{ab.label}</div>
                    {spell.school && <div className="spell-school">{t(`data.schools.${spell.school}`, spell.school)}</div>}
                    <div className="spell-level-badge">{isCantrip ? t('spells.filterCantrips') : t('spells.levelLabel', { level: spell.level })}</div>
                    {spell.concentration && <div className="spell-conc" title={t('spells.concentration')}>C</div>}
                    {spell.ritual && <div className="spell-ritual" title={t('spells.ritual')}>R</div>}

                    {onCast && (
                      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button className={`spell-cast-btn ${castMenu === spell.name ? 'active' : ''}`} title={t('actions.rollLabel')}
                          onClick={() => {
                            if (isCantrip) { onCast(spell, 0); return; }
                            setCastMenu(castMenu === spell.name ? null : spell.name);
                          }}>🎯</button>
                        {castMenu === spell.name && (
                          <div className="spell-cast-menu">
                            {Array.from({ length: 9 - parseInt(spell.level) + 1 }, (_, i) => parseInt(spell.level) + i).map(lvl => {
                              const slot = (spellSlots || [])[lvl - 1];
                              const avail = slot ? slot.max - slot.used : 0;
                              return (
                                <button key={lvl} className="spell-cast-menu-item" disabled={avail <= 0}
                                  onClick={() => { onCast(spell, lvl); setCastMenu(null); }}>
                                  <span>{t('spells.castSlot', { level: lvl })}</span>
                                  <span className={`spell-cast-slot-count ${avail <= 0 ? 'empty' : ''}`}>{avail}/{slot?.max ?? 0}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    </div>
  );
}
