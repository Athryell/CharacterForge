import React, { useState } from 'react';
import { KeywordText, NotationHelpBar } from './Tooltip';
import BonusTextarea from './BonusTextarea';
import { TagPill, TagSelector } from './Tags';

const EMPTY_FORM = { name: '', qty: 1, desc: '', weight: '' };

export default function InventoryManager({ items = [], onUpdate, onRoll, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag, onAddAction, onRemoveAction, actionNames }) {
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);

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

  return (
    <div>
      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Nome *</label>
              <input value={addForm.name} onChange={e => patchAdd({ name: e.target.value })}
                placeholder="Es. Pozione di guarigione" autoFocus onKeyDown={e => e.key === 'Enter' && submitAdd()} />
            </div>
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>Quantità</label>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => patchAdd({ qty: Math.max(1, (addForm.qty||1) - 1) })}>−</button>
                <input type="number" min="1" value={addForm.qty}
                  onChange={e => patchAdd({ qty: parseInt(e.target.value) || 1 })}
                  style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }} />
                <button className="mod-btn" onClick={() => patchAdd({ qty: (addForm.qty||1) + 1 })}>+</button>
              </div>
            </div>
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>Peso (kg)</label>
              <input type="text" value={addForm.weight} onChange={e => patchAdd({ weight: e.target.value })} placeholder="0.5" />
            </div>
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>Descrizione / Note</label>
            <BonusTextarea className="notes-area" style={{ minHeight: 56 }} value={addForm.desc}
              onChange={e => patchAdd({ desc: e.target.value })} placeholder="Es. Cura 2d4+2 HP. (@ per bonus)" />
            <NotationHelpBar />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { onAddClose && onAddClose(); setAddForm(EMPTY_FORM); }}>Annulla</button>
            <button className={`io-btn primary ${!addForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitAdd} disabled={!addForm.name.trim()}>+ Aggiungi</button>
          </div>
        </div>
      )}

      {items.length === 0 && !addOpen && (
        <div className="hint-text">Nessun oggetto. Attiva la modalità ✏ e clicca "+ Aggiungi oggetto".</div>
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
                    {(item.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
                  </div>
                  {item.desc && !isExpanded && !isEditing && (
                    <div className="inventory-desc-preview">
                      <KeywordText text={item.desc} onRoll={onRoll} label={item.name} />
                    </div>
                  )}
                </div>

                {item.weight && <span className="inventory-weight">{item.weight}kg</span>}

                <div className="inventory-qty-group" onClick={e => e.stopPropagation()}>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, -1)}>−</button>
                  <span className="inventory-qty">{item.qty || 1}</span>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, 1)}>+</button>
                </div>
              </div>

              {/* Inline edit form */}
              {isEditing && editForm && (
                <div className="inventory-edit-form" onClick={e => e.stopPropagation()}>
                  <div className="field-row">
                    <div className="field" style={{ flex: 2 }}>
                      <label>Nome</label>
                      <input value={editForm.name} onChange={e => patchEdit({ name: e.target.value })} />
                    </div>
                    <div className="field" style={{ flex: '0 0 80px' }}>
                      <label>Quantità</label>
                      <div className="hp-stepper">
                        <button className="mod-btn" onClick={() => patchEdit({ qty: Math.max(1, (editForm.qty||1) - 1) })}>−</button>
                        <input type="number" min="1" value={editForm.qty}
                          onChange={e => patchEdit({ qty: parseInt(e.target.value) || 1 })}
                          style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }} />
                        <button className="mod-btn" onClick={() => patchEdit({ qty: (editForm.qty||1) + 1 })}>+</button>
                      </div>
                    </div>
                    <div className="field" style={{ flex: '0 0 80px' }}>
                      <label>Peso (kg)</label>
                      <input value={editForm.weight || ''} onChange={e => patchEdit({ weight: e.target.value })} placeholder="0.5" />
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 6 }}>
                    <label>Descrizione</label>
                    <BonusTextarea className="notes-area" style={{ minHeight: 56 }}
                      value={editForm.desc || ''} onChange={e => patchEdit({ desc: e.target.value })} />
                    <NotationHelpBar />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {editingTagsFor === item.id ? (
                      <>
                        <TagSelector selected={item.tags || []} allTags={allTags}
                          onChange={tags => onUpdateTags && onUpdateTags(item.id, tags)} onCreateTag={onCreateTag} />
                        <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                      </>
                    ) : (
                      <button className="tag-edit-btn" onClick={() => setEditingTagsFor(item.id)}>
                        🏷 {(item.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {onAddAction && (
                        <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                          title={added ? 'Rimuovi dalle azioni' : 'Aggiungi alle azioni'}
                          onClick={() => {
                            if (added) { onRemoveAction && onRemoveAction(item.name); }
                            else { onAddAction({ id: `item_${item.id}_${Date.now()}`, name: item.name, type: 'action', desc: item.desc || '', dice: '' }); }
                          }}>{added ? '✓' : '⚡'}</button>
                      )}
                      <button className="io-btn danger" onClick={() => removeItem(item.id)}>✕ Elimina</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="io-btn" onClick={cancelEdit}>Annulla</button>
                      <button className="io-btn primary" onClick={saveEdit}>✓ Salva</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded view (non-edit) */}
              {isExpanded && !isEditing && (
                <div className="inventory-desc-full" onClick={e => e.stopPropagation()}>
                  {item.desc && <KeywordText text={item.desc} onRoll={onRoll} label={item.name} />}
                  {(item.bonuses || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {item.bonuses.map((b, i) => (
                        <span key={i} className="bonus-chip">{b.stat} {b.value >= 0 ? '+' : ''}{b.value}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    {editingTagsFor === item.id ? (
                      <>
                        <TagSelector selected={item.tags || []} allTags={allTags}
                          onChange={tags => onUpdateTags && onUpdateTags(item.id, tags)} onCreateTag={onCreateTag} />
                        <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                      </>
                    ) : (
                      <button className="tag-edit-btn" onClick={() => setEditingTagsFor(item.id)}>
                        🏷 {(item.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                      </button>
                    )}
                  </div>
                  <div className="item-edit-actions">
                    <button className="io-btn" onClick={() => startEdit(item)}>✏ Modifica</button>
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
