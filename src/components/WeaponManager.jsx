import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dataManager from '../data/dataManager';
import PresetBrowser from './PresetBrowser';
import { TagPill, TagSelector } from './Tags';
import { KeywordText } from './Tooltip';
import NotationTextarea from './NotationTextarea';
import { Icon } from '../config/icons';
import { useUnits } from '../hooks/useUnits';
import { useCharContext } from './CharContext';
import { syncCustomToDraft } from '../utils/homebrewSync';

const BLANK_FORM = {
  name: '', isProficient: true, desc: '', properties: [], mastery: 'none', isMasteryActive: false, weight: '', throwable: '',
};

// Converts a feet string '20/60' to the display unit — returns 'X/Y' (no suffix)
function convertThrowableToUnit(ftStr, toDisplaySpeed) {
  if (!ftStr) return '';
  const parts = ftStr.split('/');
  if (parts.length !== 2) return ftStr;
  const [n, l] = parts.map(s => parseInt(s.trim(), 10));
  if (isNaN(n) || isNaN(l)) return ftStr;
  return `${toDisplaySpeed(n)}/${toDisplaySpeed(l)}`;
}

// Formats a stored throwable value (already in display unit) for the chip in the preset list
function formatPresetThrowable(ftStr, toDisplaySpeed, speedUnit) {
  const converted = convertThrowableToUnit(ftStr, toDisplaySpeed);
  if (!converted) return null;
  return `${converted} ${speedUnit === 'sq' ? '□' : speedUnit}`;
}

function toWeightInUnit(kg, weightUnit) {
  if (kg == null) return '';
  const val = weightUnit === 'lbs' ? Math.round(kg * 2.205 * 10) / 10 : kg;
  return String(val);
}

function PropertyMasteryPicker({ properties, mastery, onChangeProperties, onChangeMastery }) {
  const { t } = useTranslation();
  const { systemId } = useCharContext();
  const [custom, setCustom] = useState('');
  const adapter = dataManager.getAdapter(systemId);
  const WEAPON_PROPERTIES = adapter.getWeaponProperties();
  const WEAPON_MASTERIES = adapter.getWeaponMasteries();
  const WEAPON_PROPERTY_DESCS = adapter.getWeaponPropertyDescs?.() || {};
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
              style={{ fontSize: '0.733rem' }} title={WEAPON_PROPERTY_DESCS[key]}
              onClick={() => toggleProp(key)}>
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
            style={{ flex: 1, fontSize: '0.8rem' }}
            onKeyDown={e => e.key === 'Enter' && addCustom()} />
          <button className="io-btn" onClick={addCustom}><Icon id="action.add" size={12} /></button>
        </div>
      </div>
      <div className="prop-picker-section" style={{ marginTop: 6 }}>
        <div className="prop-picker-label">{t('weapons.masteryLabel')}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(WEAPON_MASTERIES).filter(([k]) => k !== 'none').map(([key, { label, desc }]) => (
            <button key={key} className={`filter-chip ${mastery === key ? 'active' : ''}`}
              style={{ fontSize: '0.733rem' }} title={desc}
              onClick={() => onChangeMastery(mastery === key ? 'none' : key)}>
              {t('data.masteries.' + key, label)}
            </button>
          ))}
        </div>
        {mastery && mastery !== 'none' && WEAPON_MASTERIES[mastery] && (
          <div style={{ fontSize: '0.667rem', color: 'var(--c-muted)', marginTop: 3 }}>
            {WEAPON_MASTERIES[mastery]?.desc}
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          <div className="prop-picker-label">{t('weapons.customMasteryLabel')}</div>
          <input
            value={isCustomMastery ? mastery : ''}
            placeholder={t('weapons.customMasteryPlaceholder')}
            style={{ fontSize: '0.8rem', width: '100%' }}
            onChange={e => onChangeMastery(e.target.value || 'none')}
          />
        </div>
      </div>
    </div>
  );
}

function WeaponEditForm({ form, onChange, onSave, onCancel, onDelete, allTags, onUpdateTags, onCreateTag, weaponId, wasNotProficient, speedUnit = 'ft' }) {
  const { t } = useTranslation();
  function patch(obj) { onChange(f => ({ ...f, ...obj })); }
  const hasMastery = form.mastery && form.mastery !== 'none';
  const rangeUnitLabel = speedUnit === 'sq' ? '□' : speedUnit;

  return (
    <div className="weapon-edit-form" onClick={e => e.stopPropagation()}>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label>{t('weapons.customName')}</label>
          <input value={form.name} onChange={e => patch({ name: e.target.value })}
            placeholder={t('placeholders.weaponName')} autoFocus />
        </div>
        <div className="field" style={{ flex: '0 0 70px' }}>
          <label>{t('inventory.weight', 'Peso')}</label>
          <input type="text" value={form.weight || ''} onChange={e => patch({ weight: e.target.value })} placeholder="0" />
        </div>
        <div className="field" style={{ flex: '0 0 90px' }}>
          <label>{t('weapons.throwableLabel', 'Gittata')} ({rangeUnitLabel})</label>
          <input type="text" value={form.throwable || ''} onChange={e => patch({ throwable: e.target.value })} placeholder={t('placeholders.weaponRange')} />
        </div>
        <div className="field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label>{t('weapons.profLabel')}</label>
          <label className="toggle-box" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={form.isProficient}
              onChange={e => patch({ isProficient: e.target.checked })} />
            <span className="toggle-label">{t('weapons.customProf')}</span>
          </label>
        </div>
        {hasMastery && (
          <div className="field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label>{t('weapons.masteryLabel')}</label>
            <label className="toggle-box" style={{ marginTop: 6 }}>
              <input type="checkbox" checked={form.isMasteryActive || false}
                onChange={e => patch({ isMasteryActive: e.target.checked })} />
              <span className="toggle-label">{t('weapons.masteryActiveLabel')}</span>
            </label>
          </div>
        )}
      </div>
      {wasNotProficient && form.isProficient && (
        <div className="prof-change-warning">⚠ {t('weapons.profWarning')}</div>
      )}
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
        <NotationTextarea className="notes-area" style={{ minHeight: 48 }}
          value={form.desc || ''} onChange={e => patch({ desc: e.target.value })}
          placeholder={t('weapons.descPlaceholder')} />
      </div>
      {allTags && weaponId && (
        <div style={{ marginTop: 6 }}>
          <TagSelector selected={form.tags || []} allTags={allTags}
            onChange={tags => onUpdateTags && onUpdateTags(weaponId, tags)} onCreateTag={onCreateTag} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
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

export default function WeaponManager({ weapons = [], abilities, profBonus, onUpdate, onRoll, proficiency = '', onUpdateProficiency, onAddAction, onRemoveAction, actionNames, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag, weightUnit = 'kg', toDisplayWeight }) {
  const { t } = useTranslation();
  const { toDisplaySpeed, speedUnit } = useUnits();
  const { systemId } = useCharContext();
  const adapter = dataManager.getAdapter(systemId);
  const WEAPON_PROPERTIES = adapter.getWeaponProperties();
  const WEAPON_MASTERIES = adapter.getWeaponMasteries();
  const WEAPON_PROPERTY_DESCS = adapter.getWeaponPropertyDescs?.() || {};
  const [addMode, setAddMode] = useState('preset');
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [presetSearch, setPresetSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [pendingProf, setPendingProf] = useState(true);
  const [pendingMastery, setPendingMastery] = useState(true);

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

  function selectPreset(preset) {
    setSelectedPreset(preset);
    setPendingProf(preset.prof !== false);
    setPendingMastery(!!(preset.mastery && preset.mastery !== 'none'));
  }

  function addPreset() {
    const preset = selectedPreset;
    const props = preset.properties || [];
    const isFinesse = props.includes('finesse');
    const isVersatile = props.includes('versatile');
    const lines = [];
    if (preset.dmg) {
      lines.push(pendingProf ? t('weapons.presetAttackLineProf') : t('weapons.presetAttackLine'));
      if (isVersatile && preset.versatileDmg) {
        lines.push(t('weapons.presetDmg1h', { dmg: preset.dmg }));
        lines.push(t('weapons.presetDmg2h', { dmg: preset.versatileDmg }));
      } else {
        lines.push(t('weapons.presetDamageLine', { dmg: preset.dmg }));
      }
    }
    if (isFinesse) lines.push(t('weapons.presetFinesseNote'));
    onUpdate([...weapons, {
      ...BLANK_FORM,
      name: preset.name,
      isProficient: pendingProf,
      properties: preset.properties || [],
      mastery: preset.mastery || 'none',
      isMasteryActive: pendingMastery,
      desc: lines.join('\n'),
      weight: toWeightInUnit(preset.weightKg, weightUnit),
      throwable: convertThrowableToUnit(preset.throwable, toDisplaySpeed),
      id: Date.now().toString(),
    }]);
    setSelectedPreset(null);
    onAddClose && onAddClose();
  }
  function addCustom() {
    if (!addForm.name) return;
    onUpdate([...weapons, { ...addForm, id: Date.now().toString() }]);
    syncCustomToDraft('weapons', addForm, systemId);
    setAddForm(BLANK_FORM);
    onAddClose && onAddClose();
  }
  function removeWeapon(id) { onUpdate(weapons.filter(w => w.id !== id)); }

  function handleRowClick(w) {
    if (editingId === w.id) return;
    if (editingId) cancelEdit();
    setExpandedId(expandedId === w.id ? null : w.id);
  }

  function toggleEquip(id) {
    onUpdate(weapons.map(w => w.id === id ? { ...w, equipped: !w.equipped } : w));
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
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`} onClick={() => setAddMode('custom')}><Icon id="action.custom" size={12} /> {t('weapons.custom')}</button>
          </div>
          {addMode === 'preset' ? (
            <PresetBrowser
              items={[...dataManager.getWeapons()].sort((a, b) => a.name.localeCompare(b.name))}
              searchValue={presetSearch}
              onSearchChange={setPresetSearch}
              selectedItem={selectedPreset}
              onSelect={selectPreset}
              onAdd={addPreset}
              onCancel={onAddClose}
              addLabel={t('weapons.addBtn')}
              renderItem={p => (
                <>
                  <div className="weapon-name">{p.name}</div>
                  <div className="weapon-meta">
                    {(p.properties || []).map(prop => (
                      <span key={prop} className="weapon-prop">{t('data.weaponProps.' + prop, WEAPON_PROPERTIES[prop] || prop)}</span>
                    ))}
                    {p.mastery && p.mastery !== 'none' && (
                      <span className="weapon-prop">{t('data.masteries.' + p.mastery, WEAPON_MASTERIES[p.mastery]?.label || p.mastery)}</span>
                    )}
                    {p.weightKg != null && (
                      <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>{toWeightInUnit(p.weightKg, weightUnit)} {weightUnit}</span>
                    )}
                    {p.throwable && (
                      <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>🏹 {formatPresetThrowable(p.throwable, toDisplaySpeed, speedUnit)}</span>
                    )}
                  </div>
                </>
              )}
              renderDetail={p => (
                <>
                  <label className="weapon-preset-confirm-row">
                    <input type="checkbox" checked={pendingProf} onChange={e => setPendingProf(e.target.checked)} />
                    {t('weapons.confirmProficient')}
                  </label>
                  {p.mastery && p.mastery !== 'none' && (
                    <label className="weapon-preset-confirm-row">
                      <input type="checkbox" checked={pendingMastery} onChange={e => setPendingMastery(e.target.checked)} />
                      {t('weapons.confirmMastery')}{' '}
                      <em style={{ color: 'var(--c-muted)', marginLeft: 4 }}>
                        — {t('data.masteries.' + p.mastery, WEAPON_MASTERIES[p.mastery]?.label || p.mastery)}
                      </em>
                    </label>
                  )}
                </>
              )}
            />
          ) : (
            <WeaponEditForm form={addForm} onChange={setAddForm} onSave={addCustom}
              onCancel={onAddClose} speedUnit={speedUnit} />
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
                <button
                  className={`armor-equip-dot ${w.equipped ? 'equipped' : ''}`}
                  title={w.equipped ? t('weapons.unequip') : t('weapons.equip')}
                  onClick={e => { e.stopPropagation(); toggleEquip(w.id); }}
                />
                <div className="weapon-name">{w.name}</div>
                {added && <span className="action-added-badge" title={t('common.inAction', 'In azioni')}><Icon id="widget.actions" size={12} /></span>}
                {w.acquiredAtLevel && <span className="level-badge">Lv. {w.acquiredAtLevel}</span>}
                {(w.tags || []).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                {!w.isProficient && <span className="weapon-prop" style={{ color: 'var(--c-warn-text)' }}>{t('weapons.noProf')}</span>}
              </div>
              <div className="weapon-meta">
                {w.mastery && w.mastery !== 'none' && (
                  <span className={`weapon-prop weapon-mastery-chip ${w.isMasteryActive ? 'weapon-mastery-active' : 'weapon-mastery-inactive'}`}
                    title={WEAPON_MASTERIES[w.mastery]?.desc}>
                    {WEAPON_MASTERIES[w.mastery] ? t("data.masteries." + w.mastery, WEAPON_MASTERIES[w.mastery].label) : w.mastery}
                  </span>
                )}
                {predefinedProps.map(p => <span key={p} className="weapon-prop" title={WEAPON_PROPERTY_DESCS[p]}>{t("data.weaponProps." + p, WEAPON_PROPERTIES[p])}</span>)}
                {customProps.map(p => <span key={p} className="weapon-prop">{p}</span>)}
                {w.weight && <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>{w.weight} {weightUnit || 'kg'}</span>}
                {w.throwable && <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>🏹 {w.throwable} {speedUnit === 'sq' ? '□' : speedUnit}</span>}
              </div>
            </div>

            {isEditing && editForm && (
              <WeaponEditForm form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={cancelEdit}
                wasNotProficient={!w.isProficient} speedUnit={speedUnit}
                allTags={allTags} weaponId={w.id}
                onUpdateTags={(id, tags) => {
                  onUpdateTags && onUpdateTags(id, tags);
                  setEditForm(f => ({ ...f, tags }));
                }}
                onCreateTag={onCreateTag}
                onDelete={() => { removeWeapon(w.id); cancelEdit(); }}
              />
            )}

            {isExpanded && !isEditing && (
              <div className="weapon-expanded-section" onClick={e => e.stopPropagation()}>
                {w.desc && <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: 4 }}>
                  <KeywordText text={w.desc}
                    onRoll={onRoll}
                    label={w.name}
                    counters={w.counters}
                    onCounterChange={(idx, vals) => onUpdate(weapons.map(w2 => w2.id === w.id ? { ...w2, counters: { ...(w2.counters || {}), [idx]: vals } } : w2))} />
                </div>}
                {predefinedProps.filter(p => WEAPON_PROPERTY_DESCS[p]).map(p => (
                  <div key={p} style={{ fontSize: '0.733rem', color: 'var(--c-muted)', marginBottom: 4 }}>
                    <strong>{t("data.weaponProps." + p, WEAPON_PROPERTIES[p] || p)}:</strong> {WEAPON_PROPERTY_DESCS[p]}
                  </div>
                ))}
                {w.mastery && w.mastery !== 'none' && (
                  <div style={{ fontSize: '0.733rem', color: 'var(--c-muted)', marginBottom: 4 }}>
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
                  {onAddAction && (
                    <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                      title={added ? t('common.removeFromAction') : t('common.addToAction')}
                      onClick={e => { e.stopPropagation(); if (added) { onRemoveAction && onRemoveAction(w.name); } else { onAddAction({ id: `weapon_${w.id}_${Date.now()}`, name: w.name, type: 'action', desc: w.desc || '', dice: '' }); } }}>
                      {added ? <Icon id="action.done" size={13} /> : <Icon id="widget.actions" size={13} />}
                    </button>
                  )}
                  <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(w); }}><Icon id="action.editItem" size={13} /> {t('common.edit')}</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
