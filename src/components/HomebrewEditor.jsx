import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';
import dataManager from '../data/dataManager';
import { HOMEBREW_SCHEMA, resolveOptionsFrom } from '../config/homebrewSchema';

const DRAFT_KEY = 'characterforge_homebrew_draft';

function createEmptyDraft() {
  return {
    id: '',
    name: '',
    author: '',
    description: '',
    system: 'dnd5e2024',
    classes: [],
    subclasses: [],
    species: [],
    backgrounds: [],
    spells: [],
    weapons: [],
    armors: [],
    items: [],
    conditions: [],
    feats: [],
  };
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return createEmptyDraft();
    return { ...createEmptyDraft(), ...JSON.parse(raw) };
  } catch {
    return createEmptyDraft();
  }
}

function saveDraftToLS(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('HomebrewEditor: failed to save draft', e);
  }
}

function clearDraftFromLS() {
  localStorage.removeItem(DRAFT_KEY);
}

function countSummary(draft, schema) {
  const parts = Object.keys(schema)
    .map(key => {
      const n = (draft[key] || []).length;
      return n > 0 ? `${n} ${schema[key].label.toLowerCase()}` : null;
    })
    .filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function buildEmptyItem(fields) {
  return Object.fromEntries(
    fields.map(f => [
      f.id,
      f.type === 'multiselect' ? [] :
      f.type === 'list'        ? [] :
      f.type === 'checkbox'    ? false : '',
    ])
  );
}

// ── Generic field renderer ────────────────────────────────────────────────────

function renderField(field, value, onChange) {
  switch (field.type) {
    case 'number':
      return (
        <input
          type="number"
          value={value ?? ''}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder || ''}
          onChange={e => onChange(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
        />
      );

    case 'text':
      return (
        <input
          type="text"
          value={value ?? ''}
          placeholder={field.placeholder || ''}
          onChange={e => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <textarea
          className="notes-area"
          style={{ minHeight: 56 }}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      );

    case 'select': {
      const opts = field.optionsFrom
        ? resolveOptionsFrom(field.optionsFrom)
        : (field.options || []);
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)}>
          <option value="">—</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }

    case 'multiselect': {
      const opts = field.optionsFrom
        ? resolveOptionsFrom(field.optionsFrom)
        : (field.options || []);
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="hbe-multiselect">
          {opts.map(o => (
            <label key={o} className="hbe-multiselect-opt">
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={e => {
                  if (e.target.checked) onChange([...selected, o]);
                  else onChange(selected.filter(s => s !== o));
                }}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
      );
    }

    case 'checkbox':
      return (
        <div className="hbe-checkbox-wrap">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
        </div>
      );

    case 'list': {
      const listVal = Array.isArray(value) ? value : [];
      return (
        <div className="hbe-sublist">
          {listVal.map((sub, i) => (
            <div key={i} className="hbe-sublist-item">
              <div className="hbe-sublist-fields">
                {field.subfields.map(sf => (
                  <div
                    key={sf.id}
                    className={`field${sf.type === 'textarea' ? ' hbe-full-width' : ''}`}
                  >
                    <label>{sf.label}</label>
                    {renderField(sf, sub[sf.id], v =>
                      onChange(listVal.map((s, j) => j === i ? { ...s, [sf.id]: v } : s))
                    )}
                  </div>
                ))}
              </div>
              <button
                className="io-btn danger"
                style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '2px 8px', marginTop: 2 }}
                onClick={() => onChange(listVal.filter((_, j) => j !== i))}
              >
                <Icon id="action.remove" size={11} /> Remove
              </button>
            </div>
          ))}
          <button
            className="io-btn"
            style={{ fontSize: '0.8rem', marginTop: listVal.length > 0 ? 6 : 0 }}
            onClick={() => onChange([...listVal, Object.fromEntries(field.subfields.map(sf => [sf.id, '']))])}
          >
            <Icon id="action.add" size={12} /> Add
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

// ── Info section ──────────────────────────────────────────────────────────────

function InfoSection({ draft, updateDraft, onClear, t }) {
  return (
    <div className="hbe-section">
      <div className="field">
        <label>{t('sources.nameLabel')} *</label>
        <input
          type="text"
          value={draft.name}
          onChange={e => updateDraft({ name: e.target.value })}
          placeholder={t('placeholders.homebrewName')}
          autoFocus
        />
      </div>
      <div className="field">
        <label>{t('sources.authorLabel')}</label>
        <input
          type="text"
          value={draft.author}
          onChange={e => updateDraft({ author: e.target.value })}
        />
      </div>
      <div className="field">
        <label>{t('sources.descLabel')}</label>
        <textarea
          className="notes-area"
          value={draft.description}
          onChange={e => updateDraft({ description: e.target.value })}
        />
      </div>
      <div className="field">
        <label>{t('sources.systemLabel')}</label>
        <select value={draft.system} onChange={e => updateDraft({ system: e.target.value })}>
          <option value="dnd5e2024">D&D 5.5e</option>
          <option value="daggerheart">Daggerheart</option>
        </select>
      </div>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--c-border-mid)' }}>
        <button className="io-btn danger" onClick={onClear}>
          {t('sources.clearDraft')}
        </button>
      </div>
    </div>
  );
}

// ── Entity section (generic) ──────────────────────────────────────────────────

function EntitySection({ sectionKey, sectionDef, draft, updateDraft }) {
  const [form, setForm] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);

  const items = draft[sectionKey] || [];

  function saveItem() {
    const updated =
      editIndex >= 0
        ? items.map((it, i) => (i === editIndex ? { ...form } : it))
        : [...items, { ...form }];
    updateDraft({ [sectionKey]: updated });
    setForm(null);
    setEditIndex(-1);
  }

  function removeItem(idx) {
    updateDraft({ [sectionKey]: items.filter((_, i) => i !== idx) });
  }

  function startEdit(idx) {
    setEditIndex(idx);
    setForm({ ...items[idx] });
  }

  function startAdd() {
    setEditIndex(-1);
    setForm(buildEmptyItem(sectionDef.fields));
  }

  const isFormValid = form
    ? !sectionDef.fields.some(f => f.required && !form[f.id])
    : false;

  // Cheap pluralization for "Add Weapon" / "Add Spells" etc.
  const singularLabel = sectionDef.label.endsWith('s')
    ? sectionDef.label.slice(0, -1)
    : sectionDef.label;

  return (
    <div className="hbe-section">
      {items.length > 0 && (
        <div className="hbe-item-list">
          {items.map((item, i) => (
            <div key={i} className="hbe-item-row">
              <span className="hbe-item-name">{item.name || `#${i + 1}`}</span>
              {item._fromSheet && <span className="hbe-badge-sheet">From sheet</span>}
              <button
                className="icon-btn"
                style={{ padding: '2px 6px' }}
                onClick={() => startEdit(i)}
                disabled={!!form}
              >
                <Icon id="action.editItem" size={12} />
              </button>
              <button
                className="icon-btn"
                style={{ padding: '2px 6px' }}
                onClick={() => removeItem(i)}
                disabled={!!form}
              >
                <Icon id="action.remove" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!form && items.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', fontStyle: 'italic', margin: '0 0 10px' }}>
          No {sectionDef.label.toLowerCase()} added yet.
        </p>
      )}

      {!form && (
        <button className="io-btn" onClick={startAdd}>
          <Icon id="action.add" size={13} /> Add {singularLabel}
        </button>
      )}

      {form && (
        <div className="hbe-form">
          <div className="hbe-form-grid">
            {sectionDef.fields.map(field => (
              <div
                key={field.id}
                className={`field${['textarea', 'list', 'multiselect'].includes(field.type) ? ' hbe-full-width' : ''}`}
              >
                <label>{field.label}{field.required ? ' *' : ''}</label>
                {renderField(field, form[field.id], v =>
                  setForm(prev => ({ ...prev, [field.id]: v }))
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="io-btn primary" onClick={saveItem} disabled={!isFormValid}>
              <Icon id="action.done" size={13} /> {editIndex >= 0 ? 'Update' : 'Add'}
            </button>
            <button className="io-btn" onClick={() => { setForm(null); setEditIndex(-1); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HomebrewEditor({ open, onClose, onPublish, initialDraft = null }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(createEmptyDraft);
  const [activeSection, setActiveSection] = useState('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (initialDraft !== null) {
      setDraft({ ...createEmptyDraft(), ...initialDraft });
    } else {
      setDraft(loadDraft());
    }
    setActiveSection('info');
    setShowConfirm(false);
  }, [open, initialDraft]);

  const systemSchema = HOMEBREW_SCHEMA[draft.system] || {};
  const sectionEntries = Object.entries(systemSchema);
  const canPublish = !!draft.name.trim();

  function updateDraft(patch) {
    setDraft(prev => {
      const next = { ...prev, ...patch };
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveDraftToLS(next), 500);
      return next;
    });
  }

  function handleClose() {
    clearTimeout(saveTimerRef.current);
    saveDraftToLS(draft);
    onClose?.();
  }

  function handleClearDraft() {
    if (!window.confirm(t('sources.clearDraftConfirm'))) return;
    clearDraftFromLS();
    setDraft(createEmptyDraft());
    setActiveSection('info');
  }

  function handlePublish() {
    const id = draft.id || `homebrew-${Date.now()}`;
    // Strip _fromSheet metadata from all items before saving
    const cleaned = {
      ...draft,
      id,
      ...Object.fromEntries(
        Object.keys(systemSchema).map(key => [
          key,
          (draft[key] || []).map(({ _fromSheet, ...rest }) => rest),
        ])
      ),
    };
    const result = dataManager.addSource(cleaned);
    if (result.ok) {
      clearDraftFromLS();
      setDraft(createEmptyDraft());
      setShowConfirm(false);
      onPublish?.();
      onClose?.();
      window.umami?.track('homebrew-published', { name: cleaned.name });
    }
  }

  if (!open) return null;

  return (
    <div className="hbe-overlay">
      <div className="hbe-modal">

        {/* ── Header ── */}
        <div className="hbe-header">
          <button className="icon-btn" onClick={handleClose} aria-label="Close">
            <Icon id="action.remove" size={14} />
          </button>
          <span className="hbe-title">{t('sources.editorTitle')}</span>
          <button
            className="io-btn primary"
            disabled={!canPublish}
            onClick={() => setShowConfirm(true)}
            title={canPublish ? undefined : t('sources.noName')}
          >
            {t('sources.publish')} →
          </button>
        </div>

        {/* ── Body ── */}
        <div className="hbe-body">

          {/* Sidebar */}
          <nav className="hbe-sidebar">
            <button
              className={`hbe-nav-item${activeSection === 'info' ? ' active' : ''}`}
              onClick={() => setActiveSection('info')}
            >
              📋 <span className="hbe-nav-label">Info</span>
            </button>

            {sectionEntries.length > 0 && (
              <div className="hbe-nav-divider">
                {draft.system === 'dnd5e2024' ? 'D&D 5.5e' : 'Daggerheart'}
              </div>
            )}

            {sectionEntries.map(([key, sec]) => {
              const count = (draft[key] || []).length;
              return (
                <button
                  key={key}
                  className={`hbe-nav-item${activeSection === key ? ' active' : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  <Icon id={sec.icon} size={13} />
                  <span className="hbe-nav-label">{sec.label}</span>
                  {count > 0 && <span className="hbe-nav-badge">{count}</span>}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="hbe-content">
            {activeSection === 'info' ? (
              <InfoSection
                draft={draft}
                updateDraft={updateDraft}
                onClear={handleClearDraft}
                t={t}
              />
            ) : systemSchema[activeSection] ? (
              <EntitySection
                key={activeSection}
                sectionKey={activeSection}
                sectionDef={systemSchema[activeSection]}
                draft={draft}
                updateDraft={updateDraft}
              />
            ) : null}
          </div>
        </div>

        {/* ── Publish confirmation overlay ── */}
        {showConfirm && (
          <div className="hbe-confirm-overlay">
            <div className="hbe-confirm-box">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {t('sources.publishConfirm', { name: draft.name })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: 16 }}>
                {countSummary(draft, systemSchema)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="io-btn primary" onClick={handlePublish}>
                  <Icon id="action.done" size={13} /> {t('sources.publish')}
                </button>
                <button className="io-btn" onClick={() => setShowConfirm(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
