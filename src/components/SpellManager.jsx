import DiceText from './DiceText';
import { TagPill, TagSelector, TagFilterBar } from './Tags';
import React, { useState, useMemo } from 'react';
import { SRD_SPELLS, SCHOOLS, SPELL_CLASSES, filterSpells } from '../data/spells';

const LEVEL_LABELS = {
  0: 'Trucchetti', 1: '1°', 2: '2°', 3: '3°', 4: '4°',
  5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
};

const EMPTY_CUSTOM = {
  name: '', level: 0, school: '', concentration: false,
  ritual: false, desc: '',
};

export default function SpellManager({ spells = [], charClass, onUpdate, onRoll, allTags = [], onUpdateTags, onCreateTag }) {
  const [view, setView] = useState('list');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState(charClass || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [spellFilter, setSpellFilter] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [spellTagFilter, setSpellTagFilter] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM);

  const knownNames = useMemo(() => new Set(spells.map(s => s.name)), [spells]);

  // Dynamic level filters based on what the user actually has
  const availableLevels = useMemo(() => {
    const levels = [...new Set(spells.map(s => s.level))].sort((a, b) => a - b);
    return levels;
  }, [spells]);

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
      concentration: spell.c, ritual: spell.r,
      prepared: false, desc: spell.desc,
    }]);
  }

  function removeSpell(name) {
    onUpdate(spells.filter(s => s.name !== name));
  }

  function togglePrepared(name) {
    onUpdate(spells.map(s => s.name === name ? { ...s, prepared: !s.prepared } : s));
  }

  function submitCustom() {
    if (!customForm.name.trim()) return;
    if (knownNames.has(customForm.name.trim())) return;
    onUpdate([...spells, { ...customForm, name: customForm.name.trim(), prepared: false }]);
    setCustomForm(EMPTY_CUSTOM);
    setShowCustomForm(false);
  }

  function patchCustom(obj) {
    setCustomForm(f => ({ ...f, ...obj }));
  }

  // Filtered known spells
  const filteredKnown = useMemo(() => {
    let result = spells;
    if (spellFilter === '0') result = result.filter(s => s.level === 0);
    else if (spellFilter === 'prepared') result = result.filter(s => s.prepared);
    else if (spellFilter !== 'all') { const lvl = parseInt(spellFilter); result = result.filter(s => s.level === lvl); }
    if (spellTagFilter) result = result.filter(s => (s.tags||[]).includes(spellTagFilter));
    return result;
  }, [spells, spellFilter, spellTagFilter]);

  // Group by level
  const byLevel = {};
  filteredKnown.forEach(s => {
    if (!byLevel[s.level]) byLevel[s.level] = [];
    byLevel[s.level].push(s);
  });

  return (
    <div>
      {/* View toggle */}
      <div className="filter-bar" style={{ marginBottom: 10 }}>
        <button className={`filter-chip ${view === 'list' ? 'active' : ''}`} onClick={() => { setView('list'); setShowCustomForm(false); }}>
          📖 I miei incantesimi
        </button>
        <button className={`filter-chip ${view === 'browser' ? 'active' : ''}`} onClick={() => { setView('browser'); setShowCustomForm(false); }}>
          🔍 Sfoglia SRD
        </button>
        <button
          className={`filter-chip ${showCustomForm ? 'active' : ''}`}
          onClick={() => { setShowCustomForm(v => !v); setView('list'); }}
        >
          ✏ Personalizzato
        </button>
      </div>

      {/* ── CUSTOM FORM (inline, stile WeaponManager) ── */}
      {showCustomForm && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Nome *</label>
              <input
                value={customForm.name}
                onChange={e => patchCustom({ name: e.target.value })}
                placeholder="Es. Fiamma della Vendetta"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Livello</label>
              <select value={customForm.level} onChange={e => patchCustom({ level: parseInt(e.target.value) })}>
                {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Scuola</label>
              <select value={customForm.school} onChange={e => patchCustom({ school: e.target.value })}>
                <option value="">—</option>
                {SCHOOLS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 8 }}>
            <label>Descrizione</label>
            <textarea
              className="notes-area"
              style={{ minHeight: 64 }}
              value={customForm.desc}
              onChange={e => patchCustom({ desc: e.target.value })}
              placeholder="Descrivi effetto, danno, gittata..."
            />
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
            <label className="toggle-box">
              <input
                type="checkbox"
                checked={customForm.concentration}
                onChange={e => patchCustom({ concentration: e.target.checked })}
              />
              <span className="toggle-label">Concentrazione</span>
            </label>
            <label className="toggle-box">
              <input
                type="checkbox"
                checked={customForm.ritual}
                onChange={e => patchCustom({ ritual: e.target.checked })}
              />
              <span className="toggle-label">Rituale</span>
            </label>
            <div style={{ flex: 1 }} />
            <button className="io-btn" onClick={() => { setShowCustomForm(false); setCustomForm(EMPTY_CUSTOM); }}>
              Annulla
            </button>
            <button
              className={`io-btn primary ${!customForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom}
              disabled={!customForm.name.trim()}
            >
              + Aggiungi
            </button>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          {/* Dynamic level filters */}
          <div className="filter-bar" style={{ marginBottom: 8 }}>
            <button
              className={`filter-chip ${spellFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSpellFilter('all')}
            >Tutti</button>
            {availableLevels.map(lvl => (
              <button
                key={lvl}
                className={`filter-chip ${spellFilter === String(lvl) ? 'active' : ''}`}
                onClick={() => setSpellFilter(String(lvl))}
              >
                {lvl === 0 ? 'Trucchetti' : LEVEL_LABELS[lvl]}
              </button>
            ))}
            {spells.some(s => s.prepared) && (
              <button
                className={`filter-chip ${spellFilter === 'prepared' ? 'active' : ''}`}
                onClick={() => setSpellFilter('prepared')}
              >Preparati</button>
            )}
          </div>

          {allTags.length > 0 && (
            <TagFilterBar allTags={allTags} activeTag={spellTagFilter} onSelect={setSpellTagFilter} />
          )}

          {spells.length === 0 && (
            <div className="hint-text">Nessun incantesimo. Usa "Sfoglia SRD" per aggiungerne o crea un "Personalizzato".</div>
          )}

          {Object.keys(byLevel).sort((a, b) => a - b).map(lvl => (
            <div key={lvl} style={{ marginBottom: 10 }}>
              <div className="spell-level-header">{LEVEL_LABELS[lvl] || `Liv. ${lvl}`}</div>
              <div className="spell-list">
                {byLevel[lvl].map(spell => (
                  <div
                    key={spell.name}
                    className={`spell-item ${spell.prepared ? 'prepared' : ''} ${expanded === spell.name ? 'expanded' : ''}`}
                    onClick={() => setExpanded(expanded === spell.name ? null : spell.name)}
                  >
                    <div
                      className={`spell-prepared-dot ${spell.prepared ? 'on' : ''}`}
                      onClick={e => { e.stopPropagation(); if (spell.level > 0) togglePrepared(spell.name); }}
                      title={spell.level === 0 ? 'I trucchetti non si preparano' : (spell.prepared ? 'Rimuovi preparazione' : 'Segna come preparato')}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <div className="spell-name">{spell.name}</div>
                        {(spell.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
                      </div>
                      {expanded === spell.name && (
                        <>
                          {spell.desc && <div className="spell-desc"><DiceText text={spell.desc} onRoll={onRoll} label={spell.name} /></div>}
                          <div style={{ marginTop: 6 }} onClick={e => e.stopPropagation()}>
                            {editingTagsFor === spell.name ? (
                              <>
                                <TagSelector
                                  selected={spell.tags || []}
                                  allTags={allTags}
                                  onChange={tags => { onUpdateTags && onUpdateTags(spell.name, tags); }}
                                  onCreateTag={onCreateTag}
                                />
                                <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                              </>
                            ) : (
                              <button className="tag-edit-btn" onClick={() => setEditingTagsFor(spell.name)}>
                                🏷 {(spell.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="spell-school">{spell.school}</div>
                    <div className="spell-level-badge">{spell.level === 0 ? 'Trucco' : `Liv.${spell.level}`}</div>
                    {spell.concentration && <div className="spell-conc" title="Concentrazione">C</div>}
                    {spell.ritual && <div className="spell-ritual" title="Rituale">R</div>}
                    <button className="equip-remove" onClick={e => { e.stopPropagation(); removeSpell(spell.name); }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── BROWSER VIEW ── */}
      {view === 'browser' && (
        <>
          <div className="spell-browser-filters">
            <input
              className="spell-search"
              placeholder="🔍 Cerca per nome..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
            <div className="filter-bar" style={{ marginTop: 6 }}>
              <select className="spell-filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">Tutti i livelli</option>
                {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
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
                <div
                  key={spell.name}
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
                    {isExp && <div className="spell-browser-desc">{spell.desc}</div>}
                  </div>
                  <button
                    className={`spell-add-btn ${already ? 'known' : ''}`}
                    onClick={e => { e.stopPropagation(); if (!already) addSRDSpell(spell); }}
                    disabled={already}
                  >
                    {already ? '✓' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
