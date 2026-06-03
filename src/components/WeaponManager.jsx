import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WEAPON_PROPERTIES, WEAPON_MASTERIES } from '../data/systems/dnd5e/weapons';
import dataManager from '../data/dataManager';
import { TagPill, TagSelector } from './Tags';
import { NotationHelpBar, KeywordText } from './Tooltip';
import BonusTextarea from './BonusTextarea';

const BLANK_FORM = {
  name: '', isProficient: true, desc: '', properties: [], mastery: 'none', weight: '',
};

function PropertyMasteryPicker({ properties, mastery, onChangeProperties, onChangeMastery }) {
  const { t } = useTranslation();
  const [custom, setCustom] = useState('');
  const predefinedKeys = Object.keys(WEAPON_PROPERTIES);
  const customProps = properties.filter(p => !predefinedKeys.includes(p));
  const isCustomMastery = mastery && mastery !== 'none' && !WEAPON_MASTERIES[mastery];

  function toggleProp(key) {
    if (properties.includes(key)) onChangeProperties(properties.filter(p => p !== key));
    else onChangeProperties([...properties, key]);
  }
  function removeCustom(val) { onChangeProperties(properties.filter(p => p !== val)); }
  function addCustom() {
    const v = custom.trim();
    if (v && !properties.includes(v)) { onChangeProperties([...properties, v]); }
    setCustom('');
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="prop-picker-section">
        <div className="prop-picker-label">{t('weapons.propsLabel')}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {predefinedKeys.map(key => (
            <button key={key} className={`filter-chip ${properties.includes(key) ? 'active' : ''}`}
              style={{ fontSize: 11 }} onClick={() => toggleProp(key)}>
              {t('data.weaponProps.' + key, WEAPON_PROPERTIES[key])}
            </button>
          ))}
        </div>
        {customProps.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {customProps.map(v => (
              <span key={v} className="bonus-chip">
                {v}
                <button onClick={() => removeCustom(v)}>×</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
          <input value={custom} onChange={e => setCustom(e.target.value)}
            placeholder={t('weapons.customPropPlaceholder')}
            style={{ flex: 1, fontSize: 12 }}
            onKeyDown={e => e.key === 'Enter' && addCustom()} />
          <button className="io-btn" onClick={addCustom}>+</button>
        </div>
      </div>
      <div className="prop-picker-section" style={{ marginTop: 6 }}>
        <div className="prop-picker-label">{t('weapons.masteryLabel')}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(WEAPON_MASTERIES).filter(([k]) => k !== 'none').map(([key, { label, desc }]) => (
            <button key={key} className={`filter-chip ${mastery === key ? 'active' : ''}`}
              style={{ fontSize: 11 }} title={desc}
              onClick={() => onChangeMastery(mastery === key ? 'none' : key)}>
              {t('data.masteries.' + key, label)}
            </button>
          ))}
        </div>
        {mastery && mastery !== 'none' && WEAPON_MASTERIES[mastery] && (
          <div style={{ fontSize: 10, color: 'var(--c-muted)', marginTop: 3 }}>
            {WEAPON_MASTERIES[mastery]?.desc}
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          <div className="prop-picker-label">{t('weapons.customMasteryLabel')}</div>
          <input
            value={isCustomMastery ? mastery : ''}
            placeholder={t('weapons.customMasteryPlaceholder')}
            style={{ fontSize: 12, width: '100%' }}
            onChange={e => onChangeMastery(e.target.value || 'none')}
          />
        </div>
      </div>
    </div>
  );
}

function WeaponEditForm({ form, onChange, onSave, onCancel, onDelete, added, onToggleAction, allTags, onUpdateTags, onCreateTag, weaponId }) {
  const { t } = useTranslation();
  function patch(obj) { onChange(f => ({ ...f, ...obj })); }

  return (
    <div className="weapon-edit-form" onClick={e => e.stopPropagation()}>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label>{t('weapons.customName')}</label>
          <input value={form.name} onChange={e => patch({ name: e.target.value })}
            placeholder="Es. Spada del nonno" autoFocus />
        </div>
        <div className="field" style={{ flex: '0 0 70px' }}>
          <label>{t('inventory.weight', 'Peso')}</label>
          <input type="text" value={form.weight || ''} onChange={e => patch({ weight: e.target.value })} placeholder="0" />
        </div>
        <div className="field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label>{t('weapons.profLabel')}</label>
          <label className="toggle-box" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={form.isProficient}
              onChange={e => patch({ isProficient: e.target.checked })} />
            <span className="toggle-label">{t('weapons.customProf')}</span>
          </label>
        </div>
      </div>
      <div className="field" style={{ marginTop: 6 }}>
        <label>{t('weapons.propsAndMasteryLabel')}</label>
        <PropertyMasteryPicker
          properties={form.properties || []}
          mastery={form.mastery || 'none'}
          onChangeProperties={properties => patch({ properties })}
          onChangeMastery={mastery => patch({ mastery })} />
      </div>
      <div className="field" style={{ marginTop: 6 }}>
        <label>{t('weapons.descLabel')}</label>
        <BonusTextarea className="notes-area" style={{ minHeight: 48 }}
          value={form.desc || ''} onChange={e => patch({ desc: e.target.value })}
          placeholder={t('weapons.descPlaceholder')} />
        <NotationHelpBar />
      </div>
      {allTags && weaponId && (
        <div style={{ marginTop: 6 }}>
          <TagSelector selected={form.tags || []} allTags={allTags}
            onChange={tags => onUpdateTags && onUpdateTags(weaponId, tags)} onCreateTag={onCreateTag} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
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
          <button className="io-btn primary" onClick={onSave} disabled={!form.name.trim()}>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}

export default function WeaponManager({ weapons = [], abilities, profBonus, onUpdate, onRoll, proficiency = '', onUpdateProficiency, onAddAction, onRemoveAction, actionNames, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag, weightUnit = 'kg' }) {
  const { t } = useTranslation();
  const [addMode, setAddMode] = useState('preset');
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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
    onUpdate([...weapons, {
      ...BLANK_FORM,
      name: preset.name,
      isProficient: preset.prof,
      properties: preset.properties || [],
      mastery: preset.mastery || 'none',
      id: Date.now().toString(),
    }]);
    onAddClose && onAddClose();
  }
  function addCustom() {
    if (!addForm.name) return;
    onUpdate([...weapons, { ...addForm, id: Date.now().toString() }]);
    setAddForm(BLANK_FORM);
    onAddClose && onAddClose();
  }
  function removeWeapon(id) { onUpdate(weapons.filter(w => w.id !== id)); }

  function handleRowClick(w) {
    if (editingId === w.id) return;
    if (editingId) cancelEdit();
    setExpandedId(expandedId === w.id ? null : w.id);
  }

  const predefinedKeys = Object.keys(WEAPON_PROPERTIES);

  return (
    <div>
      <div className="proficiency-field">
        <span className="proficiency-label">{t('weapons.proficiencyLabel')}</span>
        <input className="proficiency-input" value={proficiency}
          onChange={e => onUpdateProficiency && onUpdateProficiency(e.target.value)}
          placeholder={t('weapons.proficiencyPlaceholder')} />
      </div>

      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="creator-method-bar" style={{ marginBottom: 10 }}>
            <button className={`filter-chip ${addMode === 'preset' ? 'active' : ''}`} onClick={() => setAddMode('preset')}>{t('weapons.presetSRD')}</button>
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`} onClick={() => setAddMode('custom')}>{t('weapons.custom')}</button>
          </div>
          {addMode === 'preset' ? (
            <div className="weapon-preset-list">
              {dataManager.getWeapons().map(p => (
                <div key={p.name} className="weapon-preset-item" onClick={() => addPreset(p)}>
                  <div className="weapon-name">{p.name}</div>
                  <div className="weapon-meta">
                    {(p.properties || []).map(prop => (
                      <span key={prop} className="weapon-prop">{t("data.weaponProps." + prop, WEAPON_PROPERTIES[prop] || prop)}</span>
                    ))}
                    {p.mastery && p.mastery !== 'none' && (
                      <span className="weapon-prop">{t("data.masteries." + p.mastery, WEAPON_MASTERIES[p.mastery]?.label || p.mastery)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <WeaponEditForm form={addForm} onChange={setAddForm} onSave={addCustom}
              onCancel={onAddClose} />
          )}
          {addMode === 'preset' && (
            <button className="io-btn" style={{ marginTop: 8 }} onClick={onAddClose}>{t('common.cancel')}</button>
          )}
        </div>
      )}

      {weapons.length === 0 && (
        <div className="hint-text" style={{ padding: '8px 0' }}>{t('weapons.noWeapons')}</div>
      )}

      {weapons.map(w => {
        const isEditing = editingId === w.id;
        const isExpanded = expandedId === w.id;
        const added = actionNames?.has(w.name);
        const allProps = w.properties || [];
        const predefinedProps = allProps.filter(p => predefinedKeys.includes(p));
        const customProps = allProps.filter(p => !predefinedKeys.includes(p));

        return (
          <div key={w.id} className={`weapon-item ${isExpanded || isEditing ? 'expanded' : ''}`}>
            <div className="weapon-main" onClick={() => handleRowClick(w)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="weapon-name">{w.name}</div>
                {added && <span className="action-added-badge" title={t('common.inAction', 'In azioni')}>⚡</span>}
                {(w.tags || []).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                {w.mastery && w.mastery !== 'none' && (
                  <span className="weapon-prop" style={{ fontSize: 10, color: 'var(--c-accent-text)', background: 'var(--c-accent-light)' }}
                    title={WEAPON_MASTERIES[w.mastery]?.desc}>
                    {WEAPON_MASTERIES[w.mastery] ? t("data.masteries." + w.mastery, WEAPON_MASTERIES[w.mastery].label) : w.mastery}
                  </span>
                )}
              </div>
              <div className="weapon-meta">
                {predefinedProps.map(p => <span key={p} className="weapon-prop">{t("data.weaponProps." + p, WEAPON_PROPERTIES[p])}</span>)}
                {customProps.map(p => <span key={p} className="weapon-prop">{p}</span>)}
                {w.weight && <span className="weapon-prop" style={{ fontSize: 10 }}>{w.weight} {weightUnit || 'kg'}</span>}
                {!w.isProficient && <span className="weapon-prop" style={{ color: 'var(--c-warn-text)' }}>{t('weapons.noProf')}</span>}
              </div>
            </div>

            {isEditing && editForm && (
              <WeaponEditForm form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={cancelEdit}
                allTags={allTags} weaponId={w.id}
                onUpdateTags={(id, tags) => {
                  onUpdateTags && onUpdateTags(id, tags);
                  setEditForm(f => ({ ...f, tags }));
                }}
                onCreateTag={onCreateTag}
                onDelete={() => { removeWeapon(w.id); cancelEdit(); }}
                added={added}
                onToggleAction={() => {
                  if (added) { onRemoveAction && onRemoveAction(w.name); }
                  else { onAddAction && onAddAction({ id: `weapon_${w.id}_${Date.now()}`, name: w.name, type: 'action', desc: w.desc || '', dice: '' }); }
                }}
              />
            )}

            {isExpanded && !isEditing && (
              <div className="weapon-expanded-section" onClick={e => e.stopPropagation()}>
                {w.desc && <div style={{ fontSize: 12, color: 'var(--c-muted)', marginBottom: 4 }}>
                  <KeywordText text={w.desc}
                    counters={w.counters}
                    onCounterChange={(idx, vals) => onUpdate(weapons.map(w2 => w2.id === w.id ? { ...w2, counters: { ...(w2.counters || {}), [idx]: vals } } : w2))} />
                </div>}
                {w.mastery && w.mastery !== 'none' && (
                  <div style={{ fontSize: 11, color: 'var(--c-muted)', marginBottom: 4 }}>
                    <strong>{WEAPON_MASTERIES[w.mastery] ? t("data.masteries." + w.mastery, WEAPON_MASTERIES[w.mastery].label) : w.mastery}:</strong>
                    {WEAPON_MASTERIES[w.mastery] && ` ${WEAPON_MASTERIES[w.mastery].desc}`}
                  </div>
                )}
                {(w.bonuses || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                    {w.bonuses.map((b, i) => (
                      <span key={i} className="bonus-chip">{b.stat} {b.value >= 0 ? '+' : ''}{b.value}</span>
                    ))}
                  </div>
                )}
                <div className="item-edit-actions">
                  <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(w); }}>{t('common.edit')}</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
