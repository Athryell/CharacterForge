import React, { useState, useMemo } from 'react';
import { SRD_SPELLS, SCHOOLS, SPELL_CLASSES, filterSpells } from '../data/spells';

const LEVEL_LABELS = {
  0: 'Trucchetti', 1: '1°', 2: '2°', 3: '3°', 4: '4°',
  5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
};

export default function SpellManager({ spells = [], charClass, onUpdate, onRoll }) {
  const [view, setView] = useState('list'); // 'list' | 'browser'
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState(charClass || '');
  const [filterSearch, setFilterSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [spellFilter, setSpellFilter] = useState('all');

  const knownNames = useMemo(() => new Set(spells.map(s => s.name)), [spells]);

  const browsedSpells = useMemo(() => filterSpells({
    level: filterLevel !== '' ? parseInt(filterLevel) : undefined,
    school: filterSchool || undefined,
    cls: filterClass || undefined,
    search: filterSearch || undefined,
  }), [filterLevel, filterSchool, filterClass, filterSearch]);

  function addSpell(spell) {
    if (knownNames.has(spell.name)) return;
    onUpdate([...spells, {
      name: spell.name,
      level: spell.level,
      school: spell.school,
      concentration: spell.c,
      ritual: spell.r,
      prepared: false,
      desc: spell.desc,
    }]);
  }

  function removeSpell(name) {
    onUpdate(spells.filter(s => s.name !== name));
  }

  function togglePrepared(name) {
    onUpdate(spells.map(s => s.name === name ? { ...s, prepared: !s.prepared } : s));
  }

  function addCustom() {
    const name = window.prompt('Nome incantesimo:');
    if (!name) return;
    const level = parseInt(window.prompt('Livello (0 = trucchetto):') || '0');
    const school = window.prompt('Scuola (es. Evocazione):') || '';
    const concInput = window.prompt('Concentrazione? (s/n):') || 'n';
    const concentration = concInput.toLowerCase().startsWith('s');
    const ritualInput = window.prompt('Rituale? (s/n):') || 'n';
    const ritual = ritualInput.toLowerCase().startsWith('s');
    const desc = window.prompt('Descrizione breve:') || '';
    onUpdate([...spells, { name, level, school, concentration, ritual, prepared: false, desc }]);
  }

  const filteredKnown = spellFilter === 'all' ? spells
    : spellFilter === '0' ? spells.filter(s => s.level === 0)
    : spells.filter(s => s.prepared);

  // Group by level for list view
  const byLevel = {};
  filteredKnown.forEach(s => {
    if (!byLevel[s.level]) byLevel[s.level] = [];
    byLevel[s.level].push(s);
  });

  return (
    <div>
      {/* View toggle */}
      <div className="filter-bar" style={{ marginBottom: 10 }}>
        <button className={`filter-chip ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          📖 I miei incantesimi
        </button>
        <button className={`filter-chip ${view === 'browser' ? 'active' : ''}`} onClick={() => setView('browser')}>
          🔍 Sfoglia SRD
        </button>
        <button className="filter-chip" onClick={addCustom}>
          ✏ Personalizzato
        </button>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          <div className="filter-bar" style={{ marginBottom: 8 }}>
            {[['all','Tutti'],['0','Trucchetti'],['prepared','Preparati']].map(([v,l]) => (
              <button key={v} className={`filter-chip ${spellFilter === v ? 'active' : ''}`}
                onClick={() => setSpellFilter(v)}>{l}</button>
            ))}
          </div>

          {spells.length === 0 && (
            <div className="hint-text">Nessun incantesimo. Usa "Sfoglia SRD" per aggiungerne.</div>
          )}

          {Object.keys(byLevel).sort((a,b) => a-b).map(lvl => (
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
                    />
                    <div style={{ flex: 1 }}>
                      <div className="spell-name">{spell.name}</div>
                      {expanded === spell.name && spell.desc && (
                        <div className="spell-desc">{spell.desc}</div>
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
          {/* Filters */}
          <div className="spell-browser-filters">
            <input
              className="spell-search"
              placeholder="🔍 Cerca incantesimo..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
            <div className="filter-bar" style={{ marginTop: 6 }}>
              <select
                className="spell-filter-select"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
              >
                <option value="">Tutti i livelli</option>
                {Object.entries(LEVEL_LABELS).map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <select
                className="spell-filter-select"
                value={filterSchool}
                onChange={e => setFilterSchool(e.target.value)}
              >
                <option value="">Tutte le scuole</option>
                {SCHOOLS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select
                className="spell-filter-select"
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
              >
                <option value="">Tutte le classi</option>
                {SPELL_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="hint-text" style={{ marginTop: 4 }}>
              {browsedSpells.length} incantesim{browsedSpells.length === 1 ? 'o' : 'i'} trovati
            </div>
          </div>

          {/* Results */}
          <div className="spell-browser-list">
            {browsedSpells.map(spell => {
              const already = knownNames.has(spell.name);
              const isExpanded = expanded === spell.name;
              return (
                <div
                  key={spell.name}
                  className={`spell-browser-item ${already ? 'already-known' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpanded(isExpanded ? null : spell.name)}
                >
                  <div className="spell-browser-main">
                    <div className="spell-browser-name">{spell.name}</div>
                    <div className="spell-browser-tags">
                      <span className="spell-level-badge">{spell.level === 0 ? 'Trucco' : `Liv.${spell.level}`}</span>
                      <span className="spell-school-badge">{spell.school}</span>
                      {spell.c && <span className="spell-conc" title="Concentrazione">C</span>}
                      {spell.r && <span className="spell-ritual" title="Rituale">R</span>}
                    </div>
                    <div className="spell-browser-classes">
                      {spell.classes.join(', ')}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="spell-browser-desc">{spell.desc}</div>
                  )}

                  <button
                    className={`spell-add-btn ${already ? 'known' : ''}`}
                    onClick={e => { e.stopPropagation(); if (!already) addSpell(spell); }}
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
