import React, { useState, useEffect } from 'react';
import { WEAPON_PRESETS, WEAPON_PROPERTIES, WEAPON_MASTERIES, ABILITY_OPTIONS, calcWeaponAttack, fmtWeaponDmg } from '../data/weapons';
import { TagPill, TagSelector } from './Tags';
import { NotationHelpBar } from './Tooltip';

const BLANK_FORM = {
  name: '', dmg: '1d6', dmgType: 'tagliente', properties: [],
  isProficient: true, abilityBonus: 'auto', mastery: 'none', range: '', notes: '',
};

function WeaponEditForm({ form, onChange, onSave, onCancel, abilities, profBonus }) {
  function patch(obj) { onChange(f => ({ ...f, ...obj })); }
  function toggleProp(prop) {
    const has = form.properties.includes(prop);
    patch({ properties: has ? form.properties.filter(p => p !== prop) : [...form.properties, prop] });
  }
  const { attackBonus, dmgBonus } = calcWeaponAttack({ weapon: form, abilities, profBonus, isProficient: form.isProficient });
  const atkStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

  return (
    <div className="weapon-edit-form" onClick={e => e.stopPropagation()}>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label>Nome</label>
          <input value={form.name} onChange={e => patch({ name: e.target.value })} placeholder="Es. Spada del nonno" autoFocus />
        </div>
        <div className="field">
          <label>Danni</label>
          <input value={form.dmg} onChange={e => patch({ dmg: e.target.value })} placeholder="1d8" />
        </div>
        <div className="field">
          <label>Tipo danno</label>
          <select value={form.dmgType} onChange={e => patch({ dmgType: e.target.value })}>
            {['tagliente','perforante','contundente','fuoco','freddo','fulmine','acido','veleno','necrotico','radiante','tuono','forza','psichico'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="field-row" style={{ marginTop: 6 }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Caratteristica bonus</label>
          <select value={form.abilityBonus || 'auto'} onChange={e => patch({ abilityBonus: e.target.value })}>
            {ABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Gittata</label>
          <input value={form.range} onChange={e => patch({ range: e.target.value })} placeholder="6/18" />
        </div>
      </div>
      <div className="field" style={{ marginTop: 6 }}>
        <label>Proprietà</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {Object.entries(WEAPON_PROPERTIES).map(([key, label]) => (
            <button key={key} className={`filter-chip ${form.properties.includes(key) ? 'active' : ''}`}
              onClick={() => toggleProp(key)} style={{ fontSize: 11 }}>{label}</button>
          ))}
        </div>
      </div>
      <div className="field-row" style={{ marginTop: 6 }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Maestria</label>
          <select value={form.mastery || 'none'} onChange={e => patch({ mastery: e.target.value })}>
            {Object.entries(WEAPON_MASTERIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {form.mastery && form.mastery !== 'none' && (
            <div style={{ fontSize: 10, color: 'var(--c-muted)', marginTop: 3 }}>{WEAPON_MASTERIES[form.mastery]?.desc}</div>
          )}
        </div>
        <div className="field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label>Competenza</label>
          <label className="toggle-box" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={form.isProficient} onChange={e => patch({ isProficient: e.target.checked })} />
            <span className="toggle-label">Hai competenza</span>
          </label>
        </div>
      </div>
      <div className="field" style={{ marginTop: 6 }}>
        <label>Note / Descrizione</label>
        <textarea className="notes-area" style={{ minHeight: 48 }}
          value={form.notes || ''} onChange={e => patch({ notes: e.target.value })}
          placeholder="Descrizione, proprietà speciali, bonus magici..." />
        <NotationHelpBar />
      </div>
      <div style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 4 }}>
        Anteprima: {atkStr} attacco · {fmtWeaponDmg(form.dmg, dmgBonus)} {form.dmgType}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
        <button className="io-btn" onClick={onCancel}>Annulla</button>
        <button className="io-btn primary" onClick={onSave} disabled={!form.name.trim()}>✓ Salva</button>
      </div>
    </div>
  );
}

export default function WeaponManager({ weapons = [], abilities, profBonus, onUpdate, onRoll, proficiency = '', onUpdateProficiency, onAddAction, onRemoveAction, actionNames, editMode, allTags = [], onUpdateTags, onCreateTag }) {
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState('preset'); // 'preset' | 'custom'
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);

  useEffect(() => {
    if (!editMode) { setShowAdd(false); setEditingId(null); setEditForm(null); setEditingTagsFor(null); }
  }, [editMode]);

  function startEdit(w) {
    setEditingId(w.id);
    setEditForm({ ...BLANK_FORM, ...w });
    setExpandedId(w.id);
  }
  function saveEdit() {
    onUpdate(weapons.map(w => w.id === editingId ? { ...w, ...editForm } : w));
    setEditingId(null); setEditForm(null);
  }
  function cancelEdit() { setEditingId(null); setEditForm(null); }

  function addPreset(preset) {
    onUpdate([...weapons, { ...preset, isProficient: preset.prof, id: Date.now().toString() }]);
    setShowAdd(false);
  }
  function addCustom() {
    if (!addForm.name) return;
    onUpdate([...weapons, { ...addForm, id: Date.now().toString() }]);
    setAddForm(BLANK_FORM);
    setShowAdd(false);
  }
  function removeWeapon(id) { onUpdate(weapons.filter(w => w.id !== id)); }

  function handleRowClick(w) {
    if (editMode) {
      if (editingId === w.id) cancelEdit();
      else startEdit(w);
    } else {
      setExpandedId(expandedId === w.id ? null : w.id);
    }
  }

  return (
    <div>
      <div className="proficiency-field">
        <span className="proficiency-label">Competenza:</span>
        <input className="proficiency-input" value={proficiency}
          onChange={e => onUpdateProficiency && onUpdateProficiency(e.target.value)}
          placeholder="Es. Armi semplici, spade corte, archi..." />
      </div>

      {/* Add button at top, in edit mode */}
      {editMode && (
        <div className="filter-bar" style={{ marginBottom: 10 }}>
          <button className={`filter-chip ${showAdd ? 'active' : ''}`}
            onClick={() => { setShowAdd(v => !v); cancelEdit(); }}>
            {showAdd ? '✕ Chiudi' : '+ Aggiungi arma'}
          </button>
        </div>
      )}

      {/* Add panel */}
      {showAdd && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="creator-method-bar" style={{ marginBottom: 10 }}>
            <button className={`filter-chip ${addMode === 'preset' ? 'active' : ''}`} onClick={() => setAddMode('preset')}>Preset SRD</button>
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`} onClick={() => setAddMode('custom')}>Personalizzata</button>
          </div>
          {addMode === 'preset' ? (
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
                      {p.mastery && p.mastery !== 'none' && <span className="weapon-prop">{WEAPON_MASTERIES[p.mastery]?.label}</span>}
                      {p.range && <span className="weapon-prop">{p.range}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <WeaponEditForm form={addForm} onChange={setAddForm} onSave={addCustom} onCancel={() => setShowAdd(false)} abilities={abilities} profBonus={profBonus} />
          )}
          {addMode === 'preset' && (
            <button className="io-btn" style={{ marginTop: 8 }} onClick={() => setShowAdd(false)}>Annulla</button>
          )}
        </div>
      )}

      {weapons.length === 0 && (
        <div className="hint-text" style={{ padding: '8px 0' }}>Nessuna arma. Clicca "+ Aggiungi arma" per iniziarne una.</div>
      )}

      {weapons.map(w => {
        const { attackBonus, dmgBonus } = calcWeaponAttack({ weapon: w, abilities, profBonus, isProficient: w.isProficient });
        const atkStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
        const dmgStr = fmtWeaponDmg(w.dmg, dmgBonus);
        const isEditing = editingId === w.id;
        const isExpanded = expandedId === w.id;
        const added = actionNames?.has(w.name);

        return (
          <div key={w.id} className={`weapon-item ${isExpanded || isEditing ? 'expanded' : ''}`}>
            <div className="weapon-main" onClick={() => handleRowClick(w)} style={{ cursor: editMode ? 'pointer' : 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="weapon-name">{w.name}</div>
                {(w.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
                {w.mastery && w.mastery !== 'none' && (
                  <span className="weapon-prop" style={{ fontSize: 10, color: 'var(--c-accent-text)', background: 'var(--c-accent-light)' }}
                    title={WEAPON_MASTERIES[w.mastery]?.desc}>
                    {WEAPON_MASTERIES[w.mastery]?.label}
                  </span>
                )}
              </div>
              <div className="weapon-stats" onClick={e => e.stopPropagation()}>
                <span className="action-roll"
                  onClick={() => onRoll(`1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`, `Attacco ${w.name}`)}>
                  🎲 {atkStr} attacco
                </span>
                <span className="action-roll"
                  style={{ background: 'var(--c-surface)', color: 'var(--c-muted)', border: '0.5px solid var(--c-border)' }}
                  onClick={() => onRoll(dmgStr, `Danno ${w.name}`)}>
                  💥 {dmgStr} {w.dmgType}
                </span>
              </div>
              <div className="weapon-meta">
                {w.properties?.map(p => <span key={p} className="weapon-prop">{WEAPON_PROPERTIES[p] || p}</span>)}
                {w.range && <span className="weapon-prop">Gittata {w.range}</span>}
                {!w.isProficient && <span className="weapon-prop" style={{ color: 'var(--c-warn-text)' }}>Senza competenza</span>}
                {w.abilityBonus && w.abilityBonus !== 'auto' && <span className="weapon-prop">{w.abilityBonus}</span>}
              </div>
            </div>

            {/* Inline edit form */}
            {isEditing && editForm && (
              <WeaponEditForm form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={cancelEdit} abilities={abilities} profBonus={profBonus} />
            )}

            {/* Expanded view (non-edit): tags */}
            {isExpanded && !isEditing && (
              <div className="weapon-expanded-section" onClick={e => e.stopPropagation()}>
                {w.notes && <div style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 4 }}>{w.notes}</div>}
                {w.mastery && w.mastery !== 'none' && (
                  <div style={{ fontSize: 11, color: 'var(--c-muted)', marginBottom: 4 }}>
                    <strong>{WEAPON_MASTERIES[w.mastery]?.label}:</strong> {WEAPON_MASTERIES[w.mastery]?.desc}
                  </div>
                )}
                <div style={{ marginTop: 4 }}>
                  {editingTagsFor === w.id ? (
                    <>
                      <TagSelector selected={w.tags || []} allTags={allTags}
                        onChange={tags => onUpdateTags && onUpdateTags(w.id, tags)} onCreateTag={onCreateTag} />
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
                {onAddAction && (
                  <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                    title={added ? 'Rimuovi dalle azioni' : 'Aggiungi alle azioni'}
                    onClick={e => {
                      e.stopPropagation();
                      if (added) { onRemoveAction && onRemoveAction(w.name); }
                      else { onAddAction({
                        id: `weapon_${w.id}_${Date.now()}`,
                        name: w.name,
                        type: 'action',
                        descShort: `${atkStr} per colpire · ${dmgStr} ${w.dmgType}`,
                        desc: `Attacco con ${w.name}. Tiro per colpire: ${atkStr}. Danni: ${dmgStr} ${w.dmgType}.${w.notes ? ' ' + w.notes : ''}`,
                        dice: `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`,
                      }); }
                    }}>{added ? '✓' : '⚡'}</button>
                )}
                <button className="equip-remove" onClick={e => { e.stopPropagation(); removeWeapon(w.id); }}>✕</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
