import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SCHOOLS, SPELL_CLASSES, filterSpells } from '../data/systems/dnd5e/spells';
import dataManager from '../data/dataManager';
import { TagPill, TagSelector, TagFilterBar } from './Tags';
import { KeywordText, NotationHelpBar } from './Tooltip';

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

function SpellEditForm({ spell, srd, onSave, onCancel, onDelete, added, onToggleAction, allTags, onUpdateTags, onCreateTag }) {
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
        <NotationHelpBar />
      </div>
      {onUpdateTags && (
        <div style={{ marginTop: 6 }}>
          <label style={{ fontSize: 11, color: 'var(--c-muted)', display: 'block', marginBottom: 3 }}>Tag</label>
          <TagSelector selected={spell.tags || []} allTags={allTags}
            onChange={tags => onUpdateTags(spell.name, tags)} onCreateTag={onCreateTag} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {onToggleAction && (
            <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
              title={added ? t('common.removeFromAction') : t('common.addToAction')}
              onClick={e => { e.stopPropagation(); onToggleAction(); }}>
              {added ? '✓' : '⚡'}
            </button>
          )}
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

export default function SpellManager({ spells = [], charClass, onUpdate, onRoll, allTags = [], onUpdateTags, onCreateTag, spellSlots = [], concentratingSpell = null, onCast, onAddAction, onRemoveAction, actionNames, homebrewKey = 0 }) {
  const { t } = useTranslation();
  const [view, setView] = useState('list');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [castMenu, setCastMenu] = useState(null);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState(charClass || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [spellFilter, setSpellFilter] = useState('all');
  const [spellTagFilter, setSpellTagFilter] = useState(null);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);
  const [editingSpellName, setEditingSpellName] = useState(null);

  const actionTypesSpell = [
    ['action', t('actions.typeAction')],
    ['bonus', t('actions.typeBonus')],
    ['reaction', t('actions.typeReaction')],
    ['free', t('actions.typeFree')],
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const srdByName = useMemo(() => Object.fromEntries(dataManager.getSpells().map(s => [s.name, s])), [homebrewKey]);
  const knownNames = useMemo(() => new Set(spells.map(s => s.name)), [spells]);

  const availableLevels = useMemo(() =>
    [...new Set(spells.map(s => s.level))].sort((a, b) => a - b), [spells]);

  const browsedSpells = useMemo(() => filterSpells({
    spells: dataManager.getSpells(),
    level: filterLevel !== '' ? parseInt(filterLevel) : undefined,
    school: filterSchool || undefined,
    cls: filterClass || undefined,
    search: filterSearch || undefined,
  }), [filterLevel, filterSchool, filterClass, filterSearch, homebrewKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function addSRDSpell(spell) {
    if (knownNames.has(spell.name)) return;
    onUpdate([...spells, {
      name: spell.name, level: spell.level, school: spell.school,
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
    setCustomForm(EMPTY_CUSTOM);
    setView('list');
  }

  function handleSpellClick(spellName) {
    if (editingSpellName === spellName) return;
    setExpanded(prev => prev === spellName ? null : spellName);
  }

  const filteredKnown = useMemo(() => {
    let result = spells;
    if (spellFilter === '0') result = result.filter(s => s.level === 0);
    else if (spellFilter === 'prepared') result = result.filter(s => s.prepared || s.alwaysPrepared);
    else if (spellFilter !== 'all') { const lvl = parseInt(spellFilter); result = result.filter(s => s.level === lvl); }
    if (spellTagFilter) result = result.filter(s => (s.tags || []).includes(spellTagFilter));
    return result;
  }, [spells, spellFilter, spellTagFilter]);

  const byLevel = {};
  filteredKnown.forEach(s => { if (!byLevel[s.level]) byLevel[s.level] = []; byLevel[s.level].push(s); });

  return (
    <div>
      {/* ── HEADER BAR ── */}
      <div className="section-header-bar">
        {view === 'list' ? (
          <>
            <div className="filter-bar" style={{ flex: 1, marginBottom: 0 }}>
              <button className={`filter-chip ${spellFilter === 'all' ? 'active' : ''}`} onClick={() => setSpellFilter('all')}>{t('spells.filterAll')}</button>
              {availableLevels.map(lvl => (
                <button key={lvl} className={`filter-chip ${spellFilter === String(lvl) ? 'active' : ''}`} onClick={() => setSpellFilter(String(lvl))}>
                  {lvl === 0 ? t('spells.filterCantrips') : LEVEL_LABELS[lvl]}
                </button>
              ))}
              {spells.some(s => s.prepared || s.alwaysPrepared) && (
                <button className={`filter-chip ${spellFilter === 'prepared' ? 'active' : ''}`} onClick={() => setSpellFilter('prepared')}>{t('spells.filterPrepared')}</button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="add-icon-btn" onClick={() => setShowAddMenu(v => !v)} title={t('spells.addTitle')}>＋</button>
              {showAddMenu && (
                <div className="spell-add-menu">
                  <button className="spell-add-menu-item" onClick={() => { setView('srd'); setShowAddMenu(false); }}>🔍 {t('spells.browseSRD').replace('＋ ', '').replace('Browse SRD', 'Browse SRD')}</button>
                  <button className="spell-add-menu-item" onClick={() => { setView('custom'); setShowAddMenu(false); }}>{t('spells.custom')}</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="section-header-title">
              {view === 'srd' ? t('spells.browseTitle') : t('spells.customFormTitle')}
            </span>
            <button className="add-icon-btn" onClick={() => setView('list')}>{t('spells.close')}</button>
          </>
        )}
      </div>

      {view === 'list' && allTags.length > 0 && (
        <TagFilterBar allTags={allTags} activeTag={spellTagFilter} onSelect={setSpellTagFilter} />
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
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
                  const isCantrip = spell.level === 0;
                  const srd = srdByName[spell.name] || {};
                  const actionType = spell.actionType || srd.actionType || detectActionType(spell.desc);
                  const duration = spell.duration || srd.duration || null;
                  const range = spell.range || srd.range || null;
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
                        title={spell.alwaysPrepared ? t('spells.alwaysPrepared', 'Sempre preparata') : undefined}
                        onClick={e => { e.stopPropagation(); if (!isCantrip && !spell.alwaysPrepared) togglePrepared(spell.name); }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <div className="spell-name">{spell.name}</div>
                          {added && <span className="action-added-badge" title={t('common.inAction', 'In azioni')}>⚡</span>}
                          {spell.acquiredAtLevel && <span className="level-badge">Lv. {spell.acquiredAtLevel}</span>}
                          {(spell.tags || []).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                        </div>
                        {!isExpanded && !isEditing && (range || duration) && (
                          <div style={{ fontSize:10, color:'var(--c-muted)', marginTop:1, display:'flex', gap:8 }}>
                            {range && <span>{range}</span>}
                            {duration && <span>{duration}</span>}
                          </div>
                        )}

                        {isEditing && (
                          <SpellEditForm
                            spell={spell} srd={srd}
                            onSave={saveSpellEdit}
                            onCancel={() => setEditingSpellName(null)}
                            onDelete={() => { removeSpell(spell.name); setEditingSpellName(null); }}
                            added={added}
                            onToggleAction={onAddAction ? () => {
                              if (added) { onRemoveAction && onRemoveAction(spell.name); }
                              else { onAddAction({ id: `spell_${spell.name}_${Date.now()}`, name: spell.name, type: actionType, desc: spell.desc || '', dice: '' }); }
                            } : null}
                            allTags={allTags}
                            onUpdateTags={onUpdateTags}
                            onCreateTag={onCreateTag}
                          />
                        )}

                        {isExpanded && !isEditing && (
                          <>
                            {(range || duration) && (
                              <div style={{ display:'flex', gap:10, marginTop:4, fontSize:11, color:'var(--c-muted)' }}>
                                {range && <span>📍 {range}</span>}
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
                              {Array.from({ length: 9 - spell.level + 1 }, (_, i) => spell.level + i).map(lvl => {
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
      )}

      {/* ── SRD BROWSER ── */}
      {view === 'srd' && (
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
              {browsedSpells.length === 1
                ? t('spells.foundSingular', { count: browsedSpells.length })
                : t('spells.foundPlural', { count: browsedSpells.length })}
            </div>
          </div>
          <div className="spell-browser-list">
            {browsedSpells.map(spell => {
              const already = knownNames.has(spell.name);
              const isExp = expanded === spell.name;
              return (
                <div key={spell.name}
                  className={`spell-browser-item ${already ? 'already-known' : ''} ${isExp ? 'expanded' : ''}`}
                  onClick={() => setExpanded(isExp ? null : spell.name)}>
                  <div className="spell-browser-main">
                    <div className="spell-browser-name">{spell.name}</div>
                    <div className="spell-browser-tags">
                      <span className="spell-level-badge">{spell.level === 0 ? t('spells.filterCantrips') : t('spells.levelLabel', { level: spell.level })}</span>
                      {spell.school && <span className="spell-school-badge">{t(`data.schools.${spell.school}`, spell.school)}</span>}
                      {spell.c && <span className="spell-conc" title={t('spells.concentration')}>C</span>}
                      {spell.r && <span className="spell-ritual" title={t('spells.ritual')}>R</span>}
                    </div>
                    {spell.classes?.length > 0 && <div className="spell-browser-classes">{spell.classes.map(cl => t(`data.classes.${cl}`, cl)).join(', ')}</div>}
                    {isExp && <div className="spell-browser-desc"><KeywordText text={spell.desc} onRoll={onRoll} label={spell.name} /></div>}
                  </div>
                  <button className={`spell-add-btn ${already ? 'known' : ''}`}
                    onClick={e => { e.stopPropagation(); if (!already) addSRDSpell(spell); }}
                    disabled={already}>{already ? '✓' : '+'}</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── CUSTOM FORM ── */}
      {view === 'custom' && (
        <div className="weapon-add-panel">
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
            <NotationHelpBar />
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
            <button className="io-btn" onClick={() => { setView('list'); setCustomForm(EMPTY_CUSTOM); }}>{t('common.cancel')}</button>
            <button className={`io-btn primary ${!customForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom} disabled={!customForm.name.trim()}>{t('spells.customAdd')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
