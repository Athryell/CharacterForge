import React, { useState, useMemo } from 'react';
import { SRD_SPELLS, SCHOOLS, SPELL_CLASSES, filterSpells } from '../data/spells';
import { TagPill, TagSelector, TagFilterBar } from './Tags';
import { KeywordText } from './Tooltip';

const LEVEL_LABELS = {
  0: 'Trucchetti', 1: '1°', 2: '2°', 3: '3°', 4: '4°',
  5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
};
const EMPTY_CUSTOM = { name: '', level: 0, school: '', concentration: false, ritual: false, desc: '' };

export default function SpellManager({ spells = [], charClass, onUpdate, onRoll, allTags = [], onUpdateTags, onCreateTag, spellSlots = [], concentratingSpell = null, onCast }) {
  const [view, setView] = useState('list'); // 'list' | 'srd' | 'custom'
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [castMenu, setCastMenu] = useState(null); // spell.name of open cast menu
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState(charClass || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [spellFilter, setSpellFilter] = useState('all');
  const [spellTagFilter, setSpellTagFilter] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);

  const knownNames = useMemo(() => new Set(spells.map(s => s.name)), [spells]);

  const availableLevels = useMemo(() =>
    [...new Set(spells.map(s => s.level))].sort((a, b) => a - b),
  [spells]);

  const browsedSpells = useMemo(() => filterSpells({
    level: filterLevel !== '' ? parseInt(filterLevel) : undefined,
    school: filterSchool || undefined,
    cls: filterClass || undefined,
    search: filterSearch || undefined,
  }), [filterLevel, filterSchool, filterClass, filterSearch]);

  function addSRDSpell(spell) {
    if (knownNames.has(spell.name)) return;
    onUpdate([...spells, {
      name: spell.name, level: spell.level, school: spell.school,
      concentration: spell.c, ritual: spell.r, prepared: false, desc: spell.desc,
    }]);
  }

  function removeSpell(name) { onUpdate(spells.filter(s => s.name !== name)); }

  function togglePrepared(name) {
    onUpdate(spells.map(s => s.name === name ? { ...s, prepared: !s.prepared } : s));
  }

  function submitCustom() {
    if (!customForm.name.trim() || knownNames.has(customForm.name.trim())) return;
    onUpdate([...spells, { ...customForm, name: customForm.name.trim(), prepared: false }]);
    setCustomForm(EMPTY_CUSTOM);
    setView('list');
  }

  const filteredKnown = useMemo(() => {
    let result = spells;
    if (spellFilter === '0') result = result.filter(s => s.level === 0);
    else if (spellFilter === 'prepared') result = result.filter(s => s.prepared);
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
              <button className={`filter-chip ${spellFilter === 'all' ? 'active' : ''}`} onClick={() => setSpellFilter('all')}>Tutti</button>
              {availableLevels.map(lvl => (
                <button key={lvl} className={`filter-chip ${spellFilter === String(lvl) ? 'active' : ''}`} onClick={() => setSpellFilter(String(lvl))}>
                  {lvl === 0 ? 'Trucchetti' : LEVEL_LABELS[lvl]}
                </button>
              ))}
              {spells.some(s => s.prepared) && (
                <button className={`filter-chip ${spellFilter === 'prepared' ? 'active' : ''}`} onClick={() => setSpellFilter('prepared')}>Preparati</button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="add-icon-btn" onClick={() => setShowAddMenu(v => !v)} title="Aggiungi incantesimo">＋</button>
              {showAddMenu && (
                <div className="spell-add-menu">
                  <button className="spell-add-menu-item" onClick={() => { setView('srd'); setShowAddMenu(false); }}>
                    🔍 Sfoglia SRD
                  </button>
                  <button className="spell-add-menu-item" onClick={() => { setView('custom'); setShowAddMenu(false); }}>
                    ✏ Personalizzato
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="section-header-title">
              {view === 'srd' ? '🔍 Sfoglia SRD' : '✏ Incantesimo personalizzato'}
            </span>
            <button className="add-icon-btn" onClick={() => setView('list')}>✕ Chiudi</button>
          </>
        )}
      </div>

      {/* ── TAG FILTER (list only) ── */}
      {view === 'list' && allTags.length > 0 && (
        <TagFilterBar allTags={allTags} activeTag={spellTagFilter} onSelect={setSpellTagFilter} />
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          {spells.length === 0 && (
            <div className="hint-text" style={{ padding: '12px 0' }}>
              Nessun incantesimo. Clicca <strong>＋</strong> per aggiungerne uno.
            </div>
          )}
          {Object.keys(byLevel).sort((a, b) => a - b).map(lvl => (
            <div key={lvl} style={{ marginBottom: 10 }}>
              <div className="spell-level-header">{LEVEL_LABELS[lvl] || `Liv. ${lvl}`}</div>
              <div className="spell-list">
                {byLevel[lvl].map(spell => {
                  const isCantrip = spell.level === 0;
                  return (
                    <div
                      key={spell.name}
                      className={`spell-item ${spell.prepared || isCantrip ? 'prepared' : ''} ${expanded === spell.name ? 'expanded' : ''} ${isCantrip ? 'cantrip' : ''}`}
                      onClick={() => setExpanded(expanded === spell.name ? null : spell.name)}
                    >
                      <div
                        className={`spell-prepared-dot ${(spell.prepared || isCantrip) ? 'on' : ''} ${isCantrip ? 'cantrip-dot' : ''}`}
                        onClick={e => { e.stopPropagation(); if (!isCantrip) togglePrepared(spell.name); }}
                        title={isCantrip ? 'I trucchetti sono sempre disponibili' : (spell.prepared ? 'Rimuovi preparazione' : 'Segna come preparato')}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <div className="spell-name">{spell.name}</div>
                          {(spell.tags || []).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
                        </div>
                        {expanded === spell.name && (
                          <>
                            {spell.desc && (
                              <div className="spell-desc">
                                <KeywordText text={spell.desc} onRoll={onRoll} label={spell.name} />
                              </div>
                            )}
                            <div style={{ marginTop: 6 }} onClick={e => e.stopPropagation()}>
                              {editingTagsFor === spell.name ? (
                                <>
                                  <TagSelector selected={spell.tags || []} allTags={allTags}
                                    onChange={tags => onUpdateTags && onUpdateTags(spell.name, tags)}
                                    onCreateTag={onCreateTag} />
                                  <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                                </>
                              ) : (
                                <button className="tag-edit-btn" onClick={() => setEditingTagsFor(spell.name)}>
                                  🏷 {(spell.tags || []).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="spell-school">{spell.school}</div>
                      <div className="spell-level-badge">{isCantrip ? 'Trucco' : `Liv.${spell.level}`}</div>
                      {spell.concentration && <div className="spell-conc" title="Concentrazione">C</div>}
                      {spell.ritual && <div className="spell-ritual" title="Rituale">R</div>}
                      {onCast && (
                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                          <button
                            className={`spell-cast-btn ${castMenu === spell.name ? 'active' : ''}`}
                            title="Lancia"
                            onClick={() => {
                              if (isCantrip) { onCast(spell, 0); return; }
                              setCastMenu(castMenu === spell.name ? null : spell.name);
                            }}
                          >🎯</button>
                          {castMenu === spell.name && (
                            <div className="spell-cast-menu">
                              {Array.from({ length: 9 - spell.level + 1 }, (_, i) => spell.level + i).map(lvl => {
                                const slot = (spellSlots || [])[lvl - 1];
                                const avail = slot ? slot.max - slot.used : 0;
                                return (
                                  <button
                                    key={lvl}
                                    className="spell-cast-menu-item"
                                    disabled={avail <= 0}
                                    onClick={() => { onCast(spell, lvl); setCastMenu(null); }}
                                  >
                                    <span>Slot {lvl}°</span>
                                    <span className={`spell-cast-slot-count ${avail <= 0 ? 'empty' : ''}`}>{avail}/{slot?.max ?? 0}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      <button className="equip-remove" onClick={e => { e.stopPropagation(); removeSpell(spell.name); }}>✕</button>
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
            <input className="spell-search" placeholder="🔍 Cerca per nome..."
              value={filterSearch} onChange={e => setFilterSearch(e.target.value)} autoFocus />
            <div className="filter-bar" style={{ marginTop: 6 }}>
              <select className="spell-filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">Tutti i livelli</option>
                {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className="spell-filter-select" value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
                <option value="">Tutte le scuole</option>
                {SCHOOLS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="spell-filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                <option value="">Tutte le classi</option>
                {SPELL_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="hint-text" style={{ marginTop: 4 }}>
              {browsedSpells.length} incantesim{browsedSpells.length === 1 ? 'o' : 'i'} trovati
            </div>
          </div>
          <div className="spell-browser-list">
            {browsedSpells.map(spell => {
              const already = knownNames.has(spell.name);
              const isExp = expanded === spell.name;
              return (
                <div key={spell.name}
                  className={`spell-browser-item ${already ? 'already-known' : ''} ${isExp ? 'expanded' : ''}`}
                  onClick={() => setExpanded(isExp ? null : spell.name)}
                >
                  <div className="spell-browser-main">
                    <div className="spell-browser-name">{spell.name}</div>
                    <div className="spell-browser-tags">
                      <span className="spell-level-badge">{spell.level === 0 ? 'Trucco' : `Liv.${spell.level}`}</span>
                      <span className="spell-school-badge">{spell.school}</span>
                      {spell.c && <span className="spell-conc" title="Concentrazione">C</span>}
                      {spell.r && <span className="spell-ritual" title="Rituale">R</span>}
                    </div>
                    <div className="spell-browser-classes">{spell.classes.join(', ')}</div>
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
              <label>Nome *</label>
              <input value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Es. Fiamma della Vendetta" autoFocus />
            </div>
            <div className="field">
              <label>Livello</label>
              <select value={customForm.level} onChange={e => setCustomForm(f => ({ ...f, level: parseInt(e.target.value) }))}>
                {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Scuola</label>
              <select value={customForm.school} onChange={e => setCustomForm(f => ({ ...f, school: e.target.value }))}>
                <option value="">—</option>
                {SCHOOLS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>Descrizione</label>
            <textarea className="notes-area" style={{ minHeight: 64 }}
              value={customForm.desc}
              onChange={e => setCustomForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Effetto, gittata, danni (es. 2d6 fuoco)..." />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
            <label className="toggle-box">
              <input type="checkbox" checked={customForm.concentration}
                onChange={e => setCustomForm(f => ({ ...f, concentration: e.target.checked }))} />
              <span className="toggle-label">Concentrazione</span>
            </label>
            <label className="toggle-box">
              <input type="checkbox" checked={customForm.ritual}
                onChange={e => setCustomForm(f => ({ ...f, ritual: e.target.checked }))} />
              <span className="toggle-label">Rituale</span>
            </label>
            <div style={{ flex: 1 }} />
            <button className="io-btn" onClick={() => { setView('list'); setCustomForm(EMPTY_CUSTOM); }}>Annulla</button>
            <button className={`io-btn primary ${!customForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom} disabled={!customForm.name.trim()}>+ Aggiungi</button>
          </div>
        </div>
      )}
    </div>
  );
}
