import React, { useState, useEffect } from 'react';
import { WEAPON_PRESETS, WEAPON_PROPERTIES, calcWeaponAttack, fmtWeaponDmg } from '../data/weapons';
import { TagPill, TagSelector } from './Tags';

export default function WeaponManager({ weapons = [], abilities, profBonus, onUpdate, onRoll, proficiency = '', onUpdateProficiency, onAddAction, onRemoveAction, actionNames, editMode, allTags = [], onUpdateTags, onCreateTag }) {
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);
  useEffect(() => { if (!editMode) { setShowAdd(false); setEditingTagsFor(null); } }, [editMode]);
  const [customMode, setCustomMode] = useState(false);
  const [form, setForm] = useState({
    name: '', dmg: '1d6', dmgType: 'tagliente',
    properties: [], isProficient: true, range: '', notes: '',
  });

  function patchForm(obj) { setForm(f => ({ ...f, ...obj })); }

  function addPreset(preset) {
    onUpdate([...weapons, { ...preset, isProficient: preset.prof, id: Date.now().toString() }]);
    setShowAdd(false);
  }

  function addCustom() {
    if (!form.name) return;
    onUpdate([...weapons, { ...form, id: Date.now().toString() }]);
    setForm({ name:'', dmg:'1d6', dmgType:'tagliente', properties:[], isProficient:true, range:'', notes:'' });
    setShowAdd(false);
  }

  function removeWeapon(id) {
    onUpdate(weapons.filter(w => w.id !== id));
  }

  function toggleProp(prop) {
    const has = form.properties.includes(prop);
    patchForm({ properties: has ? form.properties.filter(p => p !== prop) : [...form.properties, prop] });
  }

  return (
    <div>
      {/* Proficiency field */}
      <div className="proficiency-field">
        <span className="proficiency-label">Competenza:</span>
        <input className="proficiency-input" value={proficiency}
          onChange={e => onUpdateProficiency && onUpdateProficiency(e.target.value)}
          placeholder="Es. Armi semplici, spade corte, archi..." />
      </div>

      {/* Weapon list */}
      {weapons.length === 0 && (
        <div className="hint-text" style={{ padding: '8px 0' }}>Nessuna arma aggiunta. Clicca "+" per aggiungerne una.</div>
      )}

      {weapons.map(w => {
        const { attackBonus, dmgBonus } = calcWeaponAttack({ weapon: w, abilities, profBonus, isProficient: w.isProficient });
        const atkStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
        const dmgStr = fmtWeaponDmg(w.dmg, dmgBonus);
        const isExpanded = expandedId === w.id;

        return (
          <div key={w.id} className={`weapon-item ${isExpanded ? 'expanded' : ''}`}>
            <div className="weapon-main" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : w.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="weapon-name">{w.name}</div>
                {(w.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
              </div>
              <div className="weapon-stats" onClick={e => e.stopPropagation()}>
                <span
                  className="action-roll"
                  onClick={() => onRoll(`1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`, `Attacco ${w.name}`)}
                >
                  🎲 {atkStr} attacco
                </span>
                <span
                  className="action-roll"
                  style={{ background: 'var(--c-surface)', color: 'var(--c-muted)', border: '0.5px solid var(--c-border)' }}
                  onClick={() => onRoll(dmgStr, `Danno ${w.name}`)}
                >
                  💥 {dmgStr} {w.dmgType}
                </span>
              </div>
              <div className="weapon-meta">
                {w.properties?.map(p => (
                  <span key={p} className="weapon-prop">{WEAPON_PROPERTIES[p] || p}</span>
                ))}
                {w.range && <span className="weapon-prop">Gittata {w.range}</span>}
                {!w.isProficient && <span className="weapon-prop" style={{ color: 'var(--c-warn-text)' }}>Senza competenza</span>}
              </div>
            </div>

            {/* Expanded: tags editor */}
            {isExpanded && (
              <div className="weapon-expanded-section" onClick={e => e.stopPropagation()}>
                {w.notes && <div style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 4 }}>{w.notes}</div>}
                <div style={{ marginTop: 4 }}>
                  {editingTagsFor === w.id ? (
                    <>
                      <TagSelector selected={w.tags || []} allTags={allTags}
                        onChange={tags => onUpdateTags && onUpdateTags(w.id, tags)}
                        onCreateTag={onCreateTag} />
                      <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                    </>
                  ) : (
                    <button className="tag-edit-btn" onClick={() => setEditingTagsFor(w.id)}>
                      🏷 {(w.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {editMode && (
              <div className="weapon-actions">
                {onAddAction && (() => {
                  const weaponDesc = `Attacco con ${w.name}. Tiro per colpire: ${atkStr}. Danni: ${dmgStr} ${w.dmgType}.${w.notes ? ' ' + w.notes : ''}`;
                  const added = actionNames?.has(w.name);
                  return (
                    <button
                      className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                      title={added ? 'Rimuovi dalle azioni' : 'Aggiungi alle azioni'}
                      onClick={() => {
                        if (added) { onRemoveAction && onRemoveAction(w.name); }
                        else { onAddAction({
                          id: `weapon_${w.id}_${Date.now()}`,
                          name: w.name,
                          type: 'action',
                          descShort: `${atkStr} per colpire · ${dmgStr} ${w.dmgType}`,
                          desc: weaponDesc,
                          dice: `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`,
                        }); }
                      }}
                    >{added ? '✓' : '⚡'}</button>
                  );
                })()}
                <button
                  className="filter-chip"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={() => onUpdate(weapons.map(x => x.id === w.id ? { ...x, isProficient: !x.isProficient } : x))}
                >
                  {w.isProficient ? '✓ Comp.' : '✗ No comp.'}
                </button>
                <button className="equip-remove" onClick={() => removeWeapon(w.id)}>✕</button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add button */}
      {editMode && !showAdd && (
        <button className="add-action-btn" onClick={() => setShowAdd(true)}>+ Aggiungi arma</button>
      )}

      {/* Add panel */}
      {showAdd && (
        <div className="weapon-add-panel">
          <div className="creator-method-bar" style={{ marginBottom: 10 }}>
            <button className={`filter-chip ${!customMode ? 'active' : ''}`} onClick={() => setCustomMode(false)}>Preset SRD</button>
            <button className={`filter-chip ${customMode ? 'active' : ''}`} onClick={() => setCustomMode(true)}>Personalizzata</button>
          </div>

          {!customMode ? (
            <div className="weapon-preset-list">
              {WEAPON_PRESETS.map(p => {
                const { attackBonus, dmgBonus } = calcWeaponAttack({ weapon: p, abilities, profBonus, isProficient: p.prof });
                const atkStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
                return (
                  <div key={p.name} className="weapon-preset-item" onClick={() => addPreset(p)}>
                    <div className="weapon-name">{p.name}</div>
                    <div className="weapon-meta">
                      <span className="weapon-prop">{atkStr} attacco</span>
                      <span className="weapon-prop">{fmtWeaponDmg(p.dmg, dmgBonus)} {p.dmgType}</span>
                      {p.range && <span className="weapon-prop">{p.range}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="weapon-custom-form">
              <div className="field-row">
                <div className="field">
                  <label>Nome</label>
                  <input value={form.name} onChange={e => patchForm({ name: e.target.value })} placeholder="Es. Spada del nonno" />
                </div>
                <div className="field">
                  <label>Danni</label>
                  <input value={form.dmg} onChange={e => patchForm({ dmg: e.target.value })} placeholder="1d8" />
                </div>
                <div className="field">
                  <label>Tipo danno</label>
                  <select value={form.dmgType} onChange={e => patchForm({ dmgType: e.target.value })}>
                    {['tagliente','perforante','contundente','fuoco','freddo','fulmine','acido','veleno','necrotico','radiante','tuono','forza','psichico'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label>Proprietà</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                  {Object.entries(WEAPON_PROPERTIES).map(([key, label]) => (
                    <button
                      key={key}
                      className={`filter-chip ${form.properties.includes(key) ? 'active' : ''}`}
                      onClick={() => toggleProp(key)}
                      style={{ fontSize: 11 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-row" style={{ marginTop: 8 }}>
                <div className="field">
                  <label>Gittata (opzionale)</label>
                  <input value={form.range} onChange={e => patchForm({ range: e.target.value })} placeholder="Es. 6/18" />
                </div>
                <div className="field" style={{ justifyContent: 'flex-end' }}>
                  <label>Competenza</label>
                  <label className="toggle-box" style={{ marginTop: 6 }}>
                    <input type="checkbox" checked={form.isProficient} onChange={e => patchForm({ isProficient: e.target.checked })} />
                    <span className="toggle-label">Hai competenza</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="io-btn" onClick={() => setShowAdd(false)}>Annulla</button>
            {customMode && (
              <button className="io-btn primary" onClick={addCustom}>+ Aggiungi</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
