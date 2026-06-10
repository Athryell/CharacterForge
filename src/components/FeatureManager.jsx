import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeywordText } from './Tooltip';
import NotationTextarea from './NotationTextarea';
import { TagPill, TagSelector } from './Tags';

const SOURCE_BADGE = {
  class:      { labelKey: 'features.sourceClass',      color: '#3B6D11', bg: '#EAF3DE' },
  species:    { labelKey: 'features.sourceSpecies',    color: '#185FA5', bg: '#E6F1FB' },
  background: { labelKey: 'features.sourceBackground', color: '#854F0B', bg: '#FFF3E0' },
  custom:     { labelKey: 'features.sourceCustom',     color: '#5f5e5a', bg: '#f0f0ee' },
};

const EMPTY_FORM = { name: '', desc: '' };

function detectActionType(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('azione bonus') || lower.includes('bonus action')) return 'bonus';
  if (lower.includes('reazione') || lower.includes('reaction')) return 'reaction';
  return 'free';
}

export default function FeatureManager({ features = [], onUpdate, onRoll, onAddAction, onRemoveAction, actionNames, addOpen, onAddClose, allTags = [], onUpdateTags, onCreateTag }) {
  const { t } = useTranslation();
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
      source: t('features.sourceCustom', 'Custom'),
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
            <label>{t('features.formName', 'Name')} *</label>
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('features.namePlaceholder', 'Ex. Second Wind, Sneak Attack...')} autoFocus />
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>{t('features.formDesc', 'Description')}</label>
            <NotationTextarea className="notes-area" style={{ minHeight: 60 }}
              value={addForm.desc} onChange={e => setAddForm(f => ({ ...f, desc: e.target.value }))}
              placeholder={t('features.descPlaceholder', 'Feature description...')} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { onAddClose && onAddClose(); setAddForm(EMPTY_FORM); }}>{t('common.cancel', 'Cancel')}</button>
            <button className={`io-btn primary ${!addForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitCustom} disabled={!addForm.name.trim()}>+ {t('common.add', 'Add')}</button>
          </div>
        </div>
      )}

      {features.length === 0 && !addOpen && (
        <div className="hint-text" style={{ padding: '8px 0' }}>
          {t('features.empty', 'No features. Features are added automatically when you select a class, species, and background.')}
        </div>
      )}

      {['class', 'species', 'background', 'custom'].map(type => {
        const group = grouped[type];
        if (!group.length) return null;
        const badge = SOURCE_BADGE[type];
        return (
          <div key={type} style={{ marginBottom: 10 }}>
            <div className="feature-group-header" style={{ color: badge.color }}>{t(badge.labelKey, type)}</div>
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
                        {(feature.tags||[]).map(tag => <TagPill key={tag} tag={tag} allTags={allTags} small />)}
                      </div>
                      {feature.source && feature.sourceType !== 'custom' && (
                        <div className="feature-source-label">
                          {feature.source}
                          {feature.acquiredAtLevel && <span className="level-badge"> · Lv. {feature.acquiredAtLevel}</span>}
                        </div>
                      )}

                      {isEditing && editForm && (
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
                          <div className="field">
                            <label>{t('features.formName', 'Name')}</label>
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          </div>
                          <div className="field" style={{ marginTop: 6 }}>
                            <label>{t('features.formDesc', 'Description')}</label>
                            <NotationTextarea className="notes-area" style={{ minHeight: 72 }}
                              value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} />
                          </div>
                          <div style={{ marginTop: 6 }}>
                            {editingTagsFor === feature.id ? (
                              <>
                                <TagSelector selected={feature.tags || []} allTags={allTags}
                                  onChange={tags => onUpdateTags && onUpdateTags(feature.id, tags)} onCreateTag={onCreateTag} />
                                <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ {t('common.done', 'Done')}</button>
                              </>
                            ) : (
                              <button className="tag-edit-btn" onClick={() => setEditingTagsFor(feature.id)}>
                                🏷 {(feature.tags||[]).length === 0 ? t('tags.add', 'Add tag') : t('tags.edit', 'Edit tags')}
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {onAddAction && (
                                <button className={`icon-btn add-to-action-btn ${added ? 'added' : ''}`}
                                  title={added ? t('features.removeFromActions', 'Remove from actions') : t('features.addToActions', 'Add to actions')}
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (added) { onRemoveAction && onRemoveAction(feature.name); }
                                    else { onAddAction({ id: `feature_${feature.id}_${Date.now()}`, name: feature.name, type: feature.actionType || detectActionType(feature.desc), desc: feature.desc || '', dice: '' }); }
                                  }}>{added ? '✓' : '⚡'}</button>
                              )}
                              <button className="io-btn danger" onClick={e => { e.stopPropagation(); removeFeature(feature.id); }}>✕ {t('common.delete', 'Delete')}</button>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="io-btn" onClick={e => { e.stopPropagation(); cancelEdit(); }}>{t('common.cancel', 'Cancel')}</button>
                              <button className="io-btn primary" onClick={e => { e.stopPropagation(); saveEdit(); }}>{t('common.save', 'Save')}</button>
                            </div>
                          </div>
                        </div>
                      )}

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
                                <button className="tag-edit-btn" style={{ marginTop: 4 }} onClick={() => setEditingTagsFor(null)}>✓ {t('common.done', 'Done')}</button>
                              </>
                            ) : (
                              <button className="tag-edit-btn" onClick={() => setEditingTagsFor(feature.id)}>
                                🏷 {(feature.tags||[]).length === 0 ? t('tags.add', 'Add tag') : t('tags.edit', 'Edit tags')}
                              </button>
                            )}
                          </div>
                          <div className="item-edit-actions">
                            <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(feature); }}>{t('common.edit', 'Edit')}</button>
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
