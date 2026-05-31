import React, { useState } from 'react';
import { KeywordText, NotationHelpBar } from './Tooltip';
import { TagPill, TagSelector } from './Tags';

const SOURCE_BADGE = {
  class:      { label: 'Classe',         color: '#3B6D11', bg: '#EAF3DE' },
  species:    { label: 'Specie',         color: '#185FA5', bg: '#E6F1FB' },
  background: { label: 'Background',     color: '#854F0B', bg: '#FFF3E0' },
  custom:     { label: 'Personalizzato', color: '#5f5e5a', bg: '#f0f0ee' },
};

const EMPTY_FORM = { name: '', desc: '' };

function detectActionType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('azione bonus')) return 'bonus';
  if (t.includes('reazione')) return 'reaction';
  return 'free';
}

export default function FeatureManager({ features = [], onUpdate, onRoll, onAddAction, onRemoveAction, actionNames, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag }) {
  const [expanded, setExpanded] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);

  function startEdit(f) {
    setEditingId(f.id);
    setEditForm({ name: f.name, desc: f.desc || '' });
    setExpanded(f.id);
  }
  function saveEdit() {
    onUpdate(features.map(f => f.id === editingId ? { ...f, ...editForm } : f));
    setEditingId(null); setEditForm(null);
  }
  function cancelEdit() { setEditingId(null); setEditForm(null); }

  function handleItemClick(feature) {
    if (editingId === feature.id) return;
    if (editingId) cancelEdit();
    setExpanded(expanded === feature.id ? null : feature.id);
  }

  function removeFeature(id) { onUpdate(features.filter(f => f.id !== id)); }

  function submitCustom() {
    if (!addForm.name.trim()) return;
    onUpdate([...features, {
      id: `custom_${Date.now()}`,
      name: addForm.name.trim(),
      desc: addForm.desc.trim(),
      source: 'Personalizzato',
      sourceType: 'custom',
    }]);
    setAddForm(EMPTY_FORM);
    onAddClose && onAddClose();
  }

  const grouped = { class: [], species: [], background: [], custom: [] };
  features.forEach(f => {
    const key = f.sourceType || 'custom';
    if (grouped[key]) grouped[key].push(f); else grouped.custom.push(f);
  });

  return (
    <div>
      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field">
            <label>Nome *</label>
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Es. Secondo vento, Attacco furtivo..." autoFocus />
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>Descrizione</label>
            <textarea className="notes-area" style={{ minHeight: 60 }}
              value={addForm.desc} onChange={e => setAddForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Descrizione della feature..." />
            <NotationHelpBar />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { onAddClose && onAddClose(); setAddForm(EMPTY_FORM); }}>Annulla</button>
            <button className={`io-btn primary ${!addForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom} disabled={!addForm.name.trim()}>+ Aggiungi</button>
          </div>
        </div>
      )}

      {features.length === 0 && !addOpen && (
        <div className="hint-text" style={{ padding: '8px 0' }}>
          Nessuna feature. Le feature vengono aggiunte automaticamente quando selezioni classe, specie e background.
        </div>
      )}

      {['class', 'species', 'background', 'custom'].map(type => {
        const group = grouped[type];
        if (!group.length) return null;
        const badge = SOURCE_BADGE[type];
        return (
          <div key={type} style={{ marginBottom: 10 }}>
            <div className="feature-group-header" style={{ color: badge.color }}>{badge.label}</div>
            <div className="feature-list">
              {group.map(feature => {
                const isEditing = editingId === feature.id;
                const isExpanded = expanded === feature.id;
                const added = actionNames?.has(feature.name);

                return (
                  <div key={feature.id}
                    className={`feature-item ${isExpanded || isEditing ? 'expanded' : ''}`}
                    onClick={() => handleItemClick(feature)}
                  >
                    <div className="feature-source-dot" style={{ background: badge.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <div className="feature-name">{feature.name}</div>
                        {(feature.tags||[]).map(t => <TagPill key={t} tag={t} allTags={allTags} small />)}
                      </div>
                      {feature.source && feature.sourceType !== 'custom' && (
                        <div className="feature-source-label">{feature.source}</div>
                      )}

                      {/* Edit form */}
                      {isEditing && editForm && (
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
                          <div className="field">
                            <label>Nome</label>
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          </div>
                          <div className="field" style={{ marginTop: 6 }}>
                            <label>Descrizione</label>
                            <textarea className="notes-area" style={{ minHeight: 72 }}
                              value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} />
                            <NotationHelpBar />
                          </div>
                          <div style={{ marginTop: 6 }}>
                            {editingTagsFor === feature.id ? (
                              <>
                                <TagSelector selected={feature.tags || []} allTags={allTags}
                                  onChange={tags => onUpdateTags && onUpdateTags(feature.id, tags)} onCreateTag={onCreateTag} />
                                <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                              </>
                            ) : (
                              <button className="tag-edit-btn" onClick={() => setEditingTagsFor(feature.id)}>
                                🏷 {(feature.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {onAddAction && (
                                <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                                  title={added ? 'Rimuovi dalle azioni' : 'Aggiungi alle azioni'}
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (added) { onRemoveAction && onRemoveAction(feature.name); }
                                    else { onAddAction({ id: `feature_${feature.id}_${Date.now()}`, name: feature.name, type: feature.actionType || detectActionType(feature.desc), desc: feature.desc || '', dice: '' }); }
                                  }}>{added ? '✓' : '⚡'}</button>
                              )}
                              <button className="io-btn danger" onClick={e => { e.stopPropagation(); removeFeature(feature.id); }}>✕ Elimina</button>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="io-btn" onClick={e => { e.stopPropagation(); cancelEdit(); }}>Annulla</button>
                              <button className="io-btn primary" onClick={e => { e.stopPropagation(); saveEdit(); }}>✓ Salva</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expanded view (non-edit) */}
                      {isExpanded && !isEditing && (
                        <div onClick={e => e.stopPropagation()}>
                          {feature.desc && (
                            <div className="feature-desc">
                              <KeywordText text={feature.desc} onRoll={onRoll} label={feature.name} />
                            </div>
                          )}
                          <div style={{ marginTop: 6 }}>
                            {editingTagsFor === feature.id ? (
                              <>
                                <TagSelector selected={feature.tags || []} allTags={allTags}
                                  onChange={tags => onUpdateTags && onUpdateTags(feature.id, tags)} onCreateTag={onCreateTag} />
                                <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                              </>
                            ) : (
                              <button className="tag-edit-btn" onClick={() => setEditingTagsFor(feature.id)}>
                                🏷 {(feature.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                              </button>
                            )}
                          </div>
                          <div className="item-edit-actions">
                            <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(feature); }}>✏ Modifica</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
