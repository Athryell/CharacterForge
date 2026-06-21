import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeywordText } from './Tooltip';
import NotationTextarea from './NotationTextarea';
import { TagPill, TagSelector } from './Tags';
import { Icon } from '../config/icons';

const EMPTY_FORM = { name: '', qty: 1, desc: '', weight: '' };

export default function InventoryManager({ items = [], onUpdate, onRoll, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag, onAddAction, onRemoveAction, actionNames, currentWeightKg = 0, maxWeightKg, coinWeightKg = 0, weightUnit = 'kg', toDisplayWeight, hideWeight = false }) {
  const { t } = useTranslation();
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  function patchAdd(obj) { setAddForm(f => ({ ...f, ...obj })); }
  function patchEdit(obj) { setEditForm(f => ({ ...f, ...obj })); }

  function submitAdd() {
    if (!addForm.name.trim()) return;
    const name = addForm.name.trim();
    const existing = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing !== -1) {
      onUpdate(items.map((item, idx) =>
        idx === existing ? { ...item, qty: (item.qty || 1) + (parseInt(addForm.qty) || 1) } : item
      ));
    } else {
      onUpdate([...items, { id: Date.now().toString(), name, qty: parseInt(addForm.qty) || 1, desc: addForm.desc, weight: addForm.weight }]);
    }
    setAddForm(EMPTY_FORM);
    onAddClose && onAddClose();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ ...item });
    setExpandedId(item.id);
  }
  function saveEdit() {
    onUpdate(items.map(i => i.id === editingId ? { ...i, ...editForm } : i));
    setEditingId(null); setEditForm(null);
  }
  function cancelEdit() { setEditingId(null); setEditForm(null); }
  function removeItem(id) { onUpdate(items.filter(i => i.id !== id)); }

  function adjustQty(id, delta) {
    onUpdate(items.map(i => {
      if (i.id !== id) return i;
      const next = Math.max(0, (i.qty || 1) + delta);
      return next === 0 ? null : { ...i, qty: next };
    }).filter(Boolean));
  }

  function handleRowClick(item) {
    if (editingId === item.id) return;
    if (editingId) cancelEdit();
    setExpandedId(expandedId === item.id ? null : item.id);
  }

  const displayW = n => Math.round((toDisplayWeight ? toDisplayWeight(n) : n) * 10) / 10;

  return (
    <div>
      {!hideWeight && maxWeightKg !== undefined && (
        <div className="weight-summary">
          <div className="weight-summary-text">
            <span>{t('inventory.carried')}: <strong>{displayW(currentWeightKg)} {weightUnit}</strong> / {displayW(maxWeightKg)} {weightUnit}</span>
            {coinWeightKg > 0 && (
              <span style={{ fontSize: '0.667rem', color: 'var(--c-muted)' }}>
                ({t('inventory.coinWeight', { n: displayW(coinWeightKg), unit: weightUnit })})
              </span>
            )}
          </div>
          <div className="weight-bar">
            <div className="weight-bar-fill" style={{
              width: `${Math.min(100, (currentWeightKg / maxWeightKg) * 100)}%`,
              background: currentWeightKg > maxWeightKg ? 'var(--c-warn)' : 'var(--c-accent)',
            }} />
          </div>
        </div>
      )}
      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>{t('inventory.nameLabel')}</label>
              <input value={addForm.name} onChange={e => patchAdd({ name: e.target.value })}
                placeholder={t('inventory.namePlaceholder')} autoFocus onKeyDown={e => e.key === 'Enter' && submitAdd()} />
            </div>
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>{t('inventory.qty')}</label>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => patchAdd({ qty: Math.max(1, (addForm.qty||1) - 1) })}>−</button>
                <input type="number" min="1" value={addForm.qty}
                  onChange={e => patchAdd({ qty: parseInt(e.target.value) || 1 })}
                  style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }} />
                <button className="mod-btn" onClick={() => patchAdd({ qty: (addForm.qty||1) + 1 })}>+</button>
              </div>
            </div>
            {!hideWeight && (
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>{t('inventory.weight')}</label>
              <input type="text" value={addForm.weight} onChange={e => patchAdd({ weight: e.target.value })} placeholder="0.5" />
            </div>
            )}
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>{t('inventory.descLabel')}</label>
            <NotationTextarea className="notes-area" style={{ minHeight: 56 }} value={addForm.desc}
              onChange={e => patchAdd({ desc: e.target.value })} placeholder={t('inventory.descAddPlaceholder')} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { onAddClose && onAddClose(); setAddForm(EMPTY_FORM); }}>{t('common.cancel')}</button>
            <button className={`io-btn primary ${!addForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitAdd} disabled={!addForm.name.trim()}>{t('inventory.add')}</button>
          </div>
        </div>
      )}

      {items.length === 0 && !addOpen && (
        <div className="hint-text">{t('inventory.empty2')}</div>
      )}

      <div className="inventory-list">
        {items.map(item => {
          const isEditing = editingId === item.id;
          const isExpanded = expandedId === item.id;
          const added = actionNames?.has(item.name);

          return (
            <div key={item.id} className={`inventory-item ${isExpanded || isEditing ? 'expanded' : ''}`}>
              <div className="inventory-main-row" style={{ cursor: 'pointer' }} onClick={() => handleRowClick(item)}>
                <div className="inventory-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    <div className="inventory-name">{item.name}</div>
                    {added && <span className="action-added-badge" title={t('common.inAction', 'In azioni')}><Icon id="widget.actions" size={12} /></span>}
                    {item.acquiredAtLevel && <span className="level-badge">Lv. {item.acquiredAtLevel}</span>}
                    {(item.tags||[]).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                  </div>
                  {item.desc && !isExpanded && !isEditing && (
                    <div className="inventory-desc-preview">
                      <KeywordText text={item.desc} onRoll={onRoll} label={item.name}
                        counters={item.counters}
                        onCounterChange={(idx, vals) => onUpdate(items.map(i => i.id === item.id ? { ...i, counters: { ...(i.counters || {}), [idx]: vals } } : i))} />
                    </div>
                  )}
                </div>

                {item.weight && <span className="inventory-weight">{displayW(parseFloat(item.weight) || 0)} {weightUnit}</span>}

                <div className="inventory-qty-group" onClick={e => e.stopPropagation()}>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, -1)}>−</button>
                  <span className="inventory-qty">{item.qty || 1}</span>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, 1)}>+</button>
                </div>
              </div>

              {isEditing && editForm && (
                <div className="inventory-edit-form" onClick={e => e.stopPropagation()}>
                  <div className="field-row">
                    <div className="field" style={{ flex: 2 }}>
                      <label>{t('inventory.nameEditLabel')}</label>
                      <input value={editForm.name} onChange={e => patchEdit({ name: e.target.value })} />
                    </div>
                    <div className="field" style={{ flex: '0 0 80px' }}>
                      <label>{t('inventory.qty')}</label>
                      <div className="hp-stepper">
                        <button className="mod-btn" onClick={() => patchEdit({ qty: Math.max(1, (editForm.qty||1) - 1) })}>−</button>
                        <input type="number" min="1" value={editForm.qty}
                          onChange={e => patchEdit({ qty: parseInt(e.target.value) || 1 })}
                          style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }} />
                        <button className="mod-btn" onClick={() => patchEdit({ qty: (editForm.qty||1) + 1 })}>+</button>
                      </div>
                    </div>
                    <div className="field" style={{ flex: '0 0 80px' }}>
                      <label>{t('inventory.weight')}</label>
                      <input value={editForm.weight || ''} onChange={e => patchEdit({ weight: e.target.value })} placeholder="0.5" />
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 6 }}>
                    <label>{t('inventory.descEditLabel')}</label>
                    <NotationTextarea className="notes-area" style={{ minHeight: 56 }}
                      value={editForm.desc || ''} onChange={e => patchEdit({ desc: e.target.value })} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <TagSelector selected={item.tags || []} allTags={allTags}
                      onChange={tags => onUpdateTags && onUpdateTags(item.id, tags)} onCreateTag={onCreateTag} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="io-btn danger" onClick={() => removeItem(item.id)}>{t('common.deleteBtn')}</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="io-btn" onClick={cancelEdit}>{t('common.cancel')}</button>
                      <button className="io-btn primary" onClick={saveEdit}>{t('common.save')}</button>
                    </div>
                  </div>
                </div>
              )}

              {isExpanded && !isEditing && (
                <div className="inventory-desc-full" onClick={e => e.stopPropagation()}>
                  {item.desc && <KeywordText text={item.desc} onRoll={onRoll} label={item.name}
                    counters={item.counters}
                    onCounterChange={(idx, vals) => onUpdate(items.map(i => i.id === item.id ? { ...i, counters: { ...(i.counters || {}), [idx]: vals } } : i))} />}
                  {(item.bonuses || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {item.bonuses.map((b, i) => (
                        <span key={i} className="bonus-chip">{b.stat} {b.value >= 0 ? '+' : ''}{b.value}</span>
                      ))}
                    </div>
                  )}
                  <div className="item-edit-actions">
                    {onAddAction && (
                      <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                        title={added ? t('common.removeFromAction') : t('common.addToAction')}
                        onClick={e => { e.stopPropagation(); if (added) { onRemoveAction && onRemoveAction(item.name); } else { onAddAction({ id: `item_${item.id}_${Date.now()}`, name: item.name, type: 'action', desc: item.desc || '', dice: '' }); } }}>
                        {added ? <Icon id="action.done" size={13} /> : <Icon id="widget.actions" size={13} />}
                      </button>
                    )}
                    <button className="io-btn" onClick={() => startEdit(item)}><Icon id="action.editItem" size={13} /> {t('common.edit')}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
