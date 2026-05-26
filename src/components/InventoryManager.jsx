import React, { useState } from 'react';
import DiceText from './DiceText';

const EMPTY_FORM = { name: '', qty: 1, desc: '', weight: '' };

export default function InventoryManager({ items = [], onUpdate, onRoll }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  function patchForm(obj) { setForm(f => ({ ...f, ...obj })); }
  function patchEdit(obj) { setEditForm(f => ({ ...f, ...obj })); }

  function submitAdd() {
    if (!form.name.trim()) return;
    const name = form.name.trim();

    // Stack: if same name exists, increase qty
    const existing = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing !== -1) {
      const updated = items.map((item, idx) =>
        idx === existing
          ? { ...item, qty: (item.qty || 1) + (parseInt(form.qty) || 1) }
          : item
      );
      onUpdate(updated);
    } else {
      onUpdate([...items, {
        id: Date.now().toString(),
        name,
        qty: parseInt(form.qty) || 1,
        desc: form.desc,
        weight: form.weight,
      }]);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ ...item });
    setExpandedId(item.id);
  }

  function saveEdit() {
    onUpdate(items.map(i => i.id === editingId ? { ...i, ...editForm } : i));
    setEditingId(null);
    setEditForm(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function removeItem(id) {
    onUpdate(items.filter(i => i.id !== id));
  }

  function adjustQty(id, delta) {
    onUpdate(items.map(i => {
      if (i.id !== id) return i;
      const next = Math.max(0, (i.qty || 1) + delta);
      if (next === 0) return null; // will be filtered
      return { ...i, qty: next };
    }).filter(Boolean));
  }

  return (
    <div>
      {/* Add form toggle */}
      <div className="filter-bar" style={{ marginBottom: 10 }}>
        <button
          className={`filter-chip ${showForm ? 'active' : ''}`}
          onClick={() => { setShowForm(v => !v); setEditingId(null); }}
        >
          {showForm ? '✕ Chiudi' : '+ Aggiungi oggetto'}
        </button>
      </div>

      {/* ── ADD FORM ── */}
      {showForm && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Nome *</label>
              <input
                value={form.name}
                onChange={e => patchForm({ name: e.target.value })}
                placeholder="Es. Pozione di guarigione"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitAdd()}
              />
            </div>
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>Quantità</label>
              <div className="hp-stepper">
                <button className="mod-btn" onClick={() => patchForm({ qty: Math.max(1, (form.qty||1) - 1) })}>−</button>
                <input
                  type="number" min="1"
                  value={form.qty}
                  onChange={e => patchForm({ qty: parseInt(e.target.value) || 1 })}
                  style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }}
                />
                <button className="mod-btn" onClick={() => patchForm({ qty: (form.qty||1) + 1 })}>+</button>
              </div>
            </div>
            <div className="field" style={{ flex: '0 0 80px' }}>
              <label>Peso (kg)</label>
              <input
                type="text"
                value={form.weight}
                onChange={e => patchForm({ weight: e.target.value })}
                placeholder="Es. 0.5"
              />
            </div>
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>Descrizione / Note (puoi scrivere dadi es. 2d4+2)</label>
            <textarea
              className="notes-area"
              style={{ minHeight: 56 }}
              value={form.desc}
              onChange={e => patchForm({ desc: e.target.value })}
              placeholder="Es. Cura 2d4+2 HP. Oggetto magico comune."
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Annulla</button>
            <button
              className={`io-btn primary ${!form.name.trim() ? 'disabled' : ''}`}
              onClick={submitAdd}
              disabled={!form.name.trim()}
            >
              + Aggiungi
            </button>
          </div>
        </div>
      )}

      {/* ── ITEM LIST ── */}
      {items.length === 0 && !showForm && (
        <div className="hint-text">Nessun oggetto. Clicca "+ Aggiungi oggetto" per iniziare.</div>
      )}

      <div className="inventory-list">
        {items.map(item => {
          const isEditing = editingId === item.id;
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className={`inventory-item ${isExpanded ? 'expanded' : ''}`}>
              {/* Main row */}
              <div
                className="inventory-main-row"
                onClick={() => !isEditing && setExpandedId(isExpanded ? null : item.id)}
              >
                {/* Qty stepper */}
                <div className="inventory-qty-group" onClick={e => e.stopPropagation()}>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, -1)}>−</button>
                  <span className="inventory-qty">{item.qty || 1}</span>
                  <button className="mod-btn" onClick={() => adjustQty(item.id, 1)}>+</button>
                </div>

                <div className="inventory-info">
                  <div className="inventory-name">{item.name}</div>
                  {item.desc && !isExpanded && (
                    <div className="inventory-desc-preview">
                      <DiceText text={item.desc} onRoll={onRoll} label={item.name} />
                    </div>
                  )}
                </div>

                {item.weight && (
                  <span className="inventory-weight">{item.weight}kg</span>
                )}

                <div className="inventory-actions" onClick={e => e.stopPropagation()}>
                  <button className="icon-btn" style={{ padding: '3px 7px', fontSize: 11 }}
                    onClick={() => isEditing ? cancelEdit() : startEdit(item)}>
                    {isEditing ? '✕' : '✏'}
                  </button>
                  <button className="equip-remove" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              </div>

              {/* Expanded: description with dice + edit form */}
              {isExpanded && !isEditing && item.desc && (
                <div className="inventory-desc-full">
                  <DiceText text={item.desc} onRoll={onRoll} label={item.name} />
                </div>
              )}

              {/* Edit form inline */}
              {isEditing && editForm && (
                <div className="inventory-edit-form">
                  <div className="field-row">
                    <div className="field" style={{ flex: 2 }}>
                      <label>Nome</label>
                      <input value={editForm.name} onChange={e => patchEdit({ name: e.target.value })} />
                    </div>
                    <div className="field" style={{ flex: '0 0 80px' }}>
                      <label>Quantità</label>
                      <div className="hp-stepper">
                        <button className="mod-btn" onClick={() => patchEdit({ qty: Math.max(1, (editForm.qty||1) - 1) })}>−</button>
                        <input
                          type="number" min="1"
                          value={editForm.qty}
                          onChange={e => patchEdit({ qty: parseInt(e.target.value) || 1 })}
                          style={{ width: 40, textAlign: 'center', border: '0.5px solid var(--c-border)', borderRadius: 'var(--r)', padding: '4px', background: 'var(--c-bg)', color: 'var(--c-ink)' }}
                        />
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
                    <textarea
                      className="notes-area"
                      style={{ minHeight: 56 }}
                      value={editForm.desc || ''}
                      onChange={e => patchEdit({ desc: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    <button className="io-btn" onClick={cancelEdit}>Annulla</button>
                    <button className="io-btn primary" onClick={saveEdit}>✓ Salva</button>
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
