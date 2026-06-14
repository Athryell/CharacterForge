import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DND_ARMOR_PRESETS as ARMOR_PRESETS, TYPE_LABEL, calcArmorAC } from '../data/systems/dnd5e2024/armors';
import { TagPill, TagSelector } from './Tags';
import { KeywordText } from './Tooltip';
import NotationTextarea from './NotationTextarea';
import { useCharContext } from './CharContext';

const BLANK_FORM = { name: '', type: 'armor', armorType: 'medium', acValue: 14, isProficient: true, equipped: false, desc: '', weight: '' };

const SHIELD_PRESET = { id: 'shield', name: 'Scudo', type: 'shield', acValue: 2 };

function ArmorEditForm({ form, onChange, onSave, onCancel, onDelete, allTags, itemId, onUpdateTags, onCreateTag }) {
  const { t } = useTranslation();
  function patch(obj) { onChange(f => ({ ...f, ...obj })); }

  const isShield = form.type === 'shield';

  return (
    <div className="weapon-edit-form" onClick={e => e.stopPropagation()}>
      <div className="field-row">
        <div className="field" style={{ flex: 2 }}>
          <label>{t('armor.nameLabel', 'Nome')}</label>
          <input value={form.name} onChange={e => patch({ name: e.target.value })}
            placeholder={isShield ? t('armor.shieldNamePlaceholder', 'Es. Scudo di legno') : t('armor.armorNamePlaceholder', 'Es. Corazza di mithral')}
            autoFocus />
        </div>
        <div className="field" style={{ flex: '0 0 90px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label>{t('armor.typeLabel', 'Tipo')}</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button className={`filter-chip ${form.type === 'armor' ? 'active' : ''}`} style={{ fontSize: '0.733rem' }}
              onClick={() => patch({ type: 'armor' })}>{t('armor.typeArmor', 'Armatura')}</button>
            <button className={`filter-chip ${form.type === 'shield' ? 'active' : ''}`} style={{ fontSize: '0.733rem' }}
              onClick={() => patch({ type: 'shield' })}>{t('armor.typeShield', 'Scudo')}</button>
          </div>
        </div>
      </div>

      {!isShield && (
        <div className="field-row" style={{ marginTop: 6 }}>
          <div className="field">
            <label>{t('armor.armorTypeLabel', 'Categoria')}</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {[['light','Leggera'],['medium','Media'],['heavy','Pesante']].map(([k, lbl]) => (
                <button key={k} className={`filter-chip ${form.armorType === k ? 'active' : ''}`} style={{ fontSize: '0.733rem' }}
                  onClick={() => patch({ armorType: k })}>{t('data.armorTypes.' + k, lbl)}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="field-row" style={{ marginTop: 6 }}>
        <div className="field" style={{ flex: '0 0 90px' }}>
          <label>{isShield ? t('armor.acBonusLabel', 'Bonus CA') : t('armor.acTotalLabel', 'CA totale')}</label>
          <input type="number" min="0" value={form.acValue}
            onChange={e => patch({ acValue: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="field" style={{ flex: '0 0 80px' }}>
          <label>{t('inventory.weight', 'Peso')}</label>
          <input type="text" value={form.weight || ''} onChange={e => patch({ weight: e.target.value })} placeholder="0" />
        </div>
        <div className="field" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label>{t('weapons.profLabel', 'Comp.')}</label>
          <label className="toggle-box" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={form.isProficient} onChange={e => patch({ isProficient: e.target.checked })} />
            <span className="toggle-label">{t('weapons.customProf', 'Competente')}</span>
          </label>
        </div>
      </div>

      <div className="field" style={{ marginTop: 6 }}>
        <label>{t('weapons.descLabel', 'Note')}</label>
        <NotationTextarea className="notes-area" style={{ minHeight: 40 }}
          value={form.desc || ''} onChange={e => patch({ desc: e.target.value })}
          placeholder={t('armor.descPlaceholder', 'Es. Richiede competenza in armature pesanti...')} />
      </div>

      {allTags && itemId && (
        <div style={{ marginTop: 6 }}>
          <TagSelector selected={form.tags || []} allTags={allTags}
            onChange={tags => onUpdateTags && onUpdateTags(itemId, tags)} onCreateTag={onCreateTag} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {onDelete && (
            <button className="io-btn danger" onClick={e => { e.stopPropagation(); onDelete(); }}>{t('common.deleteBtn', 'Elimina')}</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="io-btn" onClick={onCancel}>{t('common.cancel', 'Annulla')}</button>
          <button className="io-btn primary" onClick={onSave} disabled={!form.name.trim()}>{t('common.save', 'Salva')}</button>
        </div>
      </div>
    </div>
  );
}

export default function ArmorManager({ armors = [], desMod = 0, onUpdate, proficiency = '', onUpdateProficiency, allTags = [], onUpdateTags, onCreateTag, addOpen, onAddClose, weightUnit = 'kg', strPenaltyText = '' }) {
  const { t } = useTranslation();
  const { abilities } = useCharContext();
  const strScore = abilities?.STR || 10;
  const [addMode, setAddMode] = useState('preset');
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  function startEdit(a) {
    setEditingId(a.id);
    setEditForm({ ...BLANK_FORM, ...a });
    setExpandedId(a.id);
  }
  function saveEdit() {
    onUpdate(armors.map(a => a.id === editingId ? { ...a, ...editForm } : a));
    setEditingId(null); setEditForm(null);
  }
  function cancelEdit() { setEditingId(null); setEditForm(null); }

  function addPreset(preset) {
    const acValue = preset.type === 'shield'
      ? preset.acValue
      : preset.ac;
    onUpdate([...armors, {
      id: Date.now().toString(),
      name: preset.name,
      type: preset.type || 'armor',
      armorType: preset.type === 'armor' ? (preset.armorType || 'medium') : undefined,
      acValue,
      presetId: preset.id,
      isProficient: true,
      equipped: false,
      desc: '',
      weight: '',
      tags: [],
    }]);
    onAddClose && onAddClose();
  }

  function addCustom() {
    if (!addForm.name.trim()) return;
    onUpdate([...armors, { ...addForm, id: Date.now().toString(), tags: [] }]);
    setAddForm(BLANK_FORM);
    onAddClose && onAddClose();
  }

  function removeArmor(id) { onUpdate(armors.filter(a => a.id !== id)); }

  function toggleEquip(item) {
    if (item.type === 'armor') {
      // Only one armor equipped at a time
      onUpdate(armors.map(a => ({
        ...a,
        equipped: a.id === item.id ? !a.equipped : (a.type === 'armor' ? false : a.equipped),
      })));
    } else {
      onUpdate(armors.map(a => a.id === item.id ? { ...a, equipped: !a.equipped } : a));
    }
  }

  function handleRowClick(a) {
    if (editingId === a.id) return;
    if (editingId) cancelEdit();
    setExpandedId(expandedId === a.id ? null : a.id);
  }

  const armorPresets = ARMOR_PRESETS.map(p => ({ ...p, type: 'armor', armorType: p.type }));
  const allPresets = [...armorPresets, { ...SHIELD_PRESET }];
  const grouped = {
    light: allPresets.filter(p => p.type === 'armor' && p.armorType === 'light'),
    medium: allPresets.filter(p => p.type === 'armor' && p.armorType === 'medium'),
    heavy: allPresets.filter(p => p.type === 'armor' && p.armorType === 'heavy'),
    shield: allPresets.filter(p => p.type === 'shield'),
  };

  return (
    <div>
      <div className="proficiency-field">
        <span className="proficiency-label">{t('armor.proficiencyLabel', 'Competenza:')}</span>
        <input className="proficiency-input" value={proficiency}
          onChange={e => onUpdateProficiency && onUpdateProficiency(e.target.value)}
          placeholder={t('armor.proficiencyPlaceholder', 'Es. Armature leggere, medie, pesanti, scudi...')} />
      </div>

      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="creator-method-bar" style={{ marginBottom: 10 }}>
            <button className={`filter-chip ${addMode === 'preset' ? 'active' : ''}`} onClick={() => setAddMode('preset')}>{t('weapons.presetSRD', 'Preset SRD')}</button>
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`} onClick={() => setAddMode('custom')}>{t('weapons.custom', 'Personalizzata')}</button>
          </div>
          {addMode === 'preset' ? (
            <div className="weapon-preset-list">
              {Object.entries(grouped).map(([grp, items]) => items.length === 0 ? null : (
                <div key={grp}>
                  <div style={{ fontSize: '0.667rem', color: 'var(--c-muted)', fontWeight: 600, marginBottom: 3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {grp === 'shield' ? t('armor.typeShield', 'Scudo') : t('data.armorTypes.' + grp, TYPE_LABEL[grp] || grp)}
                  </div>
                  {items.map(p => {
                    const displayAC = p.type === 'shield' ? `+${p.acValue}` : calcArmorAC(p, desMod);
                    const strNotMet = p.strReq > 0 && strScore < p.strReq;
                    return (
                      <div key={p.id} className="weapon-preset-item" onClick={() => addPreset(p)}>
                        <div className="weapon-name">{p.name}</div>
                        <div className="weapon-meta">
                          <span className="weapon-prop">AC {displayAC}</span>
                          {p.strReq > 0 && (
                            <span
                              className={`armor-req-badge str-req${strNotMet ? ' unmet' : ''}`}
                              title={strNotMet ? t('armor.strReqNotMet', { penalty: strPenaltyText }) : undefined}>
                              {t('armor.strReq', { val: p.strReq })}
                            </span>
                          )}
                          {p.maxDex === 0 && (
                            <span className="armor-req-badge dex-limit">{t('armor.noDex')}</span>
                          )}
                          {p.maxDex === 2 && (
                            <span className="armor-req-badge dex-limit">{t('armor.maxDex', { val: 2 })}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <ArmorEditForm form={addForm} onChange={setAddForm} onSave={addCustom} onCancel={onAddClose} />
          )}
          {addMode === 'preset' && (
            <button className="io-btn" style={{ marginTop: 8 }} onClick={onAddClose}>{t('common.cancel', 'Annulla')}</button>
          )}
        </div>
      )}

      {armors.length === 0 && !addOpen && (
        <div className="hint-text" style={{ padding: '8px 0' }}>{t('weapons.noArmor')}</div>
      )}

      {armors.map(a => {
        const isEditing = editingId === a.id;
        const isExpanded = expandedId === a.id;
        const isShield = a.type === 'shield';

        return (
          <div key={a.id} className={`weapon-item ${isExpanded || isEditing ? 'expanded' : ''}`}>
            <div className="weapon-main" onClick={() => handleRowClick(a)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className={`armor-equip-dot ${a.equipped ? 'equipped' : ''}`}
                  title={a.equipped ? t('armor.unequip', 'Dis-indossa') : t('armor.equip', 'Indossa')}
                  onClick={e => { e.stopPropagation(); toggleEquip(a); }}
                />
                <div className="weapon-name">{a.name}</div>
                <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>
                  {isShield ? `+${a.acValue} CA` : `CA ${a.acValue}`}
                </span>
                {!a.isProficient && <span className="weapon-prop" style={{ color: 'var(--c-warn-text)' }}>{t('weapons.noProf', 'No comp.')}</span>}
                {(a.tags || []).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
              </div>
              <div className="weapon-meta">
                <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>
                  {isShield ? t('armor.typeShield', 'Scudo') : (a.armorType ? t('data.armorTypes.' + a.armorType, TYPE_LABEL[a.armorType] || a.armorType) : t('armor.typeArmor', 'Armatura'))}
                </span>
                {a.weight && <span className="weapon-prop" style={{ fontSize: '0.667rem' }}>{a.weight} {weightUnit}</span>}
              </div>
            </div>

            {isEditing && editForm && (
              <ArmorEditForm form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={cancelEdit}
                allTags={allTags} itemId={a.id}
                onUpdateTags={(id, tags) => {
                  onUpdateTags && onUpdateTags(id, tags);
                  setEditForm(f => ({ ...f, tags }));
                }}
                onCreateTag={onCreateTag}
                onDelete={() => { removeArmor(a.id); cancelEdit(); }}
              />
            )}

            {isExpanded && !isEditing && (
              <div className="weapon-expanded-section" onClick={e => e.stopPropagation()}>
                {!isShield && a.presetId && (() => {
                  const preset = ARMOR_PRESETS.find(p => p.id === a.presetId);
                  if (!preset) return null;
                  const strNotMet = preset.strReq > 0 && strScore < preset.strReq;
                  const effDex = Math.min(desMod, preset.maxDex ?? 2);
                  const effDexStr = effDex >= 0 ? `+${effDex}` : String(effDex);
                  return (
                    <div style={{ marginBottom: 4 }}>
                      {strNotMet && (
                        <div className="armor-str-warning">⚠ {t('armor.strReqNotMet', { penalty: strPenaltyText })}</div>
                      )}
                      {preset.type === 'medium' && (
                        <div className="hint-text">
                          {t('armor.dexBonus', { effective: effDexStr, max: preset.maxDex ?? 2 })}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {a.desc && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: 4 }}>
                    <KeywordText text={a.desc} />
                  </div>
                )}
                <div className="item-edit-actions">
                  <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(a); }}>{t('common.edit', 'Modifica')}</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
