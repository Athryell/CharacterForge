import React, { useState, useEffect } from 'react';
import { KeywordText } from './Tooltip';
import { TagPill, TagSelector } from './Tags';

const SOURCE_BADGE = {
  class:      { label: 'Classe',      color: '#3B6D11', bg: '#EAF3DE' },
  species:    { label: 'Specie',      color: '#185FA5', bg: '#E6F1FB' },
  background: { label: 'Background',  color: '#854F0B', bg: '#FFF3E0' },
  custom:     { label: 'Personalizzato', color: '#5f5e5a', bg: '#f0f0ee' },
};

const EMPTY_FORM = { name: '', desc: '' };

function detectActionType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('azione bonus')) return 'bonus';
  if (t.includes('reazione')) return 'reaction';
  return 'free';
}

export default function FeatureManager({ features = [], onUpdate, onRoll, onAddAction, onRemoveAction, actionNames, editMode, allTags = [], onUpdateTags, onCreateTag }) {
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingTagsFor, setEditingTagsFor] = useState(null);
  useEffect(() => { if (!editMode) { setShowAdd(false); setEditingTagsFor(null); } }, [editMode]);

  function removeFeature(id) {
    onUpdate(features.filter(f => f.id !== id));
  }

  function submitCustom() {
    if (!form.name.trim()) return;
    onUpdate([...features, {
      id: `custom_${Date.now()}`,
      name: form.name.trim(),
      desc: form.desc.trim(),
      source: 'Personalizzato',
      sourceType: 'custom',
    }]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  }

  const grouped = { class: [], species: [], background: [], custom: [] };
  features.forEach(f => {
    const key = f.sourceType || 'custom';
    if (grouped[key]) grouped[key].push(f); else grouped.custom.push(f);
  });

  return (
    <div>
      {features.length === 0 && !showAdd && (
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
              {group.map(feature => (
                <div key={feature.id}
                  className={`feature-item ${expanded === feature.id ? 'expanded' : ''}`}
                  onClick={() => setExpanded(expanded === feature.id ? null : feature.id)}
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
                    {expanded === feature.id && (
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
                                onChange={tags => onUpdateTags && onUpdateTags(feature.id, tags)}
                                onCreateTag={onCreateTag} />
                              <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ Fine</button>
                            </>
                          ) : (
                            <button className="tag-edit-btn" onClick={() => setEditingTagsFor(feature.id)}>
                              🏷 {(feature.tags||[]).length === 0 ? 'Aggiungi tag' : 'Modifica tag'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {editMode && onAddAction && (() => {
                    const added = actionNames?.has(feature.name);
                    return (
                      <button
                        className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                        title={added ? 'Rimuovi dalle azioni' : 'Aggiungi alle azioni'}
                        onClick={e => {
                          e.stopPropagation();
                          if (added) { onRemoveAction && onRemoveAction(feature.name); }
                          else { onAddAction({
                            id: `feature_${feature.id}_${Date.now()}`,
                            name: feature.name,
                            type: feature.actionType || detectActionType(feature.desc),
                            descShort: feature.source || feature.name,
                            desc: feature.desc || '',
                            dice: '',
                          }); }
                        }}
                      >{added ? '✓' : '⚡'}</button>
                    );
                  })()}
                  {editMode && <button className="equip-remove" onClick={e => { e.stopPropagation(); removeFeature(feature.id); }}>✕</button>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {editMode && showAdd ? (
        <div className="weapon-add-panel" style={{ marginTop: 8 }}>
          <div className="field">
            <label>Nome *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Es. Secondo vento, Attacco furtivo..." autoFocus />
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>Descrizione</label>
            <textarea className="notes-area" style={{ minHeight: 60 }}
              value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Descrizione della feature..." />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}>Annulla</button>
            <button className={`io-btn primary ${!form.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom} disabled={!form.name.trim()}>+ Aggiungi</button>
          </div>
        </div>
      ) : editMode ? (
        <button className="add-action-btn" style={{ marginTop: 6 }} onClick={() => setShowAdd(true)}>
          + Aggiungi feature personalizzata
        </button>
      ) : null}
    </div>
  );
}
