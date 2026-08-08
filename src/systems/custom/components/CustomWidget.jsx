import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Shield, Zap, Star, Flame, Droplets, Wind, Brain, Target, Clock } from 'lucide-react';
import { Icon, getIconMap } from '../../../config/icons';
import InventoryManager from '../../../components/InventoryManager';
import NotationTextarea from '../../../components/NotationTextarea';
import { resolveNotations, KeywordText } from '../../../components/Tooltip';
import { ResourceIcon, DICE_ICONS } from '../../../components/sheet';

// Lucide icons available for bar widget config
const BAR_ICON_MAP = {
  heart: Heart, shield: Shield, zap: Zap, star: Star,
  flame: Flame, droplets: Droplets, wind: Wind, brain: Brain,
  target: Target, clock: Clock,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getCustomField(state, fieldId) {
  if (!fieldId) return undefined;
  return state.customFields?.[fieldId];
}

function setCustomField(update, fieldId, value) {
  if (!fieldId) return;
  update(prev => ({
    ...prev,
    customFields: { ...(prev.customFields || {}), [fieldId]: value },
  }));
}

function updateWidgetConfig(update, widgetId, newConfig) {
  update(prev => ({
    ...prev,
    widgets: (prev.widgets || []).map(w =>
      w.id === widgetId ? { ...w, config: newConfig } : w
    ),
  }));
}

// Sums a plain chain of resolved +/- numbers (e.g. "3+2-1"). Anything that
// doesn't reduce to that shape (dice notation, an unresolved token) is left
// as text — this is deliberately not a general expression evaluator.
function evalSimpleSum(text) {
  const cleaned = String(text ?? '').replace(/\s+/g, '');
  if (!/^[+-]?\d+([+-]\d+)*$/.test(cleaned)) return null;
  return cleaned.match(/[+-]?\d+/g).reduce((sum, n) => sum + parseInt(n, 10), 0);
}

// ── Widget sub-components ──────────────────────────────────────────────────

function WidgetIdentity({ widget, state, update }) {
  const { t } = useTranslation();
  const fields = widget.config.fields || ['name', 'image', 'pronouns'];

  const fieldRenderers = {
    name: (
      <div key="name" className="field">
        <label>{t('identity.name')}</label>
        <input
          value={state.charName || ''}
          onChange={e => update({ charName: e.target.value })}
          placeholder={t('placeholders.charName')}
        />
      </div>
    ),
    image: (
      <div key="image" className="field">
        <label>{t('identity.imageLabel', 'Image URL')}</label>
        <input
          value={state.charImage || ''}
          onChange={e => update({ charImage: e.target.value })}
          placeholder="https://..."
        />
        {state.charImage && (
          <img
            src={state.charImage}
            alt={state.charName || ''}
            style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 'var(--r)', marginTop: 4 }}
          />
        )}
      </div>
    ),
    pronouns: (
      <div key="pronouns" className="field">
        <label>{t('identity.pronounsLabel', 'Pronouns')}</label>
        <input
          value={state.charPronouns || ''}
          onChange={e => update({ charPronouns: e.target.value })}
          placeholder={t('placeholders.pronouns', 'they/them')}
        />
      </div>
    ),
    notes: (
      <div key="notes" className="field">
        <label>{t('identity.notesLabel', 'Notes')}</label>
        <textarea
          className="notes-area"
          style={{ minHeight: 60 }}
          value={state.notes || ''}
          onChange={e => update({ notes: e.target.value })}
        />
      </div>
    ),
  };

  return (
    <div className="card">
      <div className="card-title">
        <Icon id="widget.identity" /> {widget.config.label || t('customWidgets.identity')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(f => fieldRenderers[f] || null)}
      </div>
    </div>
  );
}

function WidgetBar({ widget, state, update }) {
  const { t } = useTranslation();
  const [editingBar, setEditingBar] = useState(false);
  const { fieldId, label, color = '--c-accent', icon = 'heart' } = widget.config;
  const field = getCustomField(state, fieldId);
  const current = field?.current ?? 0;
  const max = field?.max ?? 0;
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const BarIcon = BAR_ICON_MAP[icon];

  if (!fieldId) {
    return (
      <div className="card">
        <div className="card-title">{label || t('customWidgets.bar')}</div>
        <div className="hint-text">{t('customWidgets.setFieldId')}</div>
      </div>
    );
  }

  function set(patch) {
    setCustomField(update, fieldId, { current, max, ...patch });
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>{BarIcon && <BarIcon size={14} />} {label || t('customWidgets.bar')}</span>
        <button
          className={`icon-btn ${editingBar ? 'active' : ''}`}
          onClick={() => setEditingBar(e => !e)}
          title={t('customWidgets.editMax')}
        >
          {editingBar ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
        </button>
      </div>
      <div className="hp-labeled-row">
        <div className="hp-labeled-group">
          <div className="hp-stepper">
            <button className="mod-btn" onClick={() => set({ current: Math.max(0, current - 1) })}>−</button>
            <input
              className="hp-big"
              type="number"
              value={current}
              onChange={e => set({ current: Math.max(0, Math.min(max, parseInt(e.target.value) || 0)) })}
            />
            <button className="mod-btn" onClick={() => set({ current: Math.min(max, current + 1) })}>+</button>
          </div>
        </div>
        <span className="hp-sep">/</span>
        <div className="hp-labeled-group">
          <div className="hp-stepper">
            {editingBar && <button className="mod-btn" onClick={() => set({ max: Math.max(0, max - 1) })}>−</button>}
            <input
              className="hp-big"
              type="number"
              min="0"
              readOnly={!editingBar}
              value={max}
              style={!editingBar ? { background: 'var(--c-surface)', color: 'var(--c-muted)' } : undefined}
              onChange={e => {
                if (!editingBar) return;
                const newMax = Math.max(0, parseInt(e.target.value) || 0);
                set({ max: newMax, current: Math.min(current, newMax) });
              }}
            />
            {editingBar && <button className="mod-btn" onClick={() => set({ max: max + 1 })}>+</button>}
          </div>
        </div>
      </div>
      <div className="hp-bar-wrap">
        <div className="hp-bar-fill" style={{ width: `${pct}%`, background: `var(${color})` }} />
      </div>
    </div>
  );
}

function WidgetStatGrid({ widget, state, update, onRoll }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const stats = widget.config.stats || [];
  const showMod = widget.config.showMod !== false;
  const showValue = widget.config.showValue !== false;
  const diceNotation = widget.config.diceNotation || '1d20';

  function getMod(stat) {
    return stat.modId ? (state.customFields?.[stat.modId] ?? 0) : (stat.mod ?? 0);
  }

  function getValue(stat) {
    return stat.valueId ? (state.customFields?.[stat.valueId] ?? 0) : (stat.value ?? 0);
  }

  function patchStat(idx, patch) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: stats.map((s, i) => i === idx ? { ...s, ...patch } : s),
    });
  }

  function setMod(idx, stat, n) {
    if (stat.modId) setCustomField(update, stat.modId, n);
    else patchStat(idx, { mod: n });
  }

  function setValue(idx, stat, n) {
    if (stat.valueId) setCustomField(update, stat.valueId, n);
    else patchStat(idx, { value: n });
  }

  function addStat() {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: [...stats, { _id: String(Date.now()), label: '', mod: 0, value: 0, modId: '', valueId: '' }],
    });
  }

  function removeStat(idx) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: stats.filter((_, i) => i !== idx),
    });
  }

  function toggleShowMod() {
    updateWidgetConfig(update, widget.id, { ...widget.config, showMod: !showMod });
  }

  function toggleShowValue() {
    updateWidgetConfig(update, widget.id, { ...widget.config, showValue: !showValue });
  }

  function setDiceNotation(notation) {
    updateWidgetConfig(update, widget.id, { ...widget.config, diceNotation: notation });
  }

  function idInput(value) {
    return String(value ?? '').toUpperCase().replace(/[^A-Z0-9_]/g, '');
  }

  function fmtSigned(n) {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  function rollStat(stat, mod) {
    if (!onRoll) return;
    onRoll(`${diceNotation}${fmtSigned(mod)}`, stat.label || t('customWidgets.statGrid'));
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>{widget.config.label || t('customWidgets.statGrid')}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {editing && (
            <>
              <button
                className={`icon-btn${showMod ? ' active' : ''}`}
                onClick={toggleShowMod}
                title={t('customWidgets.toggleMod')}
              >
                <Icon id={showMod ? 'action.show' : 'action.hide'} size={13} />
              </button>
              <button
                className={`icon-btn${showValue ? ' active' : ''}`}
                onClick={toggleShowValue}
                title={t('customWidgets.toggleValue')}
              >
                <Icon id={showValue ? 'action.show' : 'action.hide'} size={13} />
              </button>
            </>
          )}
          <button className={`icon-btn${editing ? ' active' : ''}`} onClick={() => setEditing(v => !v)}>
            <Icon id={editing ? 'action.done' : 'action.edit'} size={13} />
          </button>
        </div>
      </div>
      {editing && showMod && (
        <div className="field" style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label style={{ margin: 0 }}>{t('customWidgets.diceToRoll')}</label>
          <input
            value={diceNotation}
            onChange={e => setDiceNotation(e.target.value)}
            placeholder="1d20"
            style={{ width: 80 }}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {stats.map((stat, idx) => {
          const mod = getMod(stat);
          const value = getValue(stat);
          return (
            <div key={stat._id ?? idx} className={`ability-box${editing ? ' editing' : ''}`} style={{ position: 'relative', padding: '12px 16px', flex: '0 0 auto', minWidth: editing ? 108 : 80 }}>
              {editing && (
                <button
                  onClick={() => removeStat(idx)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.667rem', color: 'var(--c-muted)', lineHeight: 1, padding: 2 }}
                  title={t('common.deleteBtn')}
                >✕</button>
              )}
              {editing
                ? <input
                    value={stat.label}
                    onChange={e => patchStat(idx, { label: e.target.value })}
                    placeholder={t('customWidgets.statLabel')}
                    style={{ fontSize: '0.667rem', textAlign: 'center', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid var(--c-border-mid)', marginBottom: 4, color: 'var(--c-muted)', fontWeight: 600 }}
                  />
                : <div className="ability-label" style={{ marginBottom: 4 }}>{stat.label}</div>
              }
              {showMod && (
                editing ? (
                  <div style={{ width: '100%', marginBottom: showValue ? 4 : 0 }}>
                    <input
                      value={stat.modId || ''}
                      onChange={e => patchStat(idx, { modId: idInput(e.target.value) })}
                      placeholder={t('customWidgets.statModId')}
                      style={{ fontSize: '0.6rem', textAlign: 'center', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid var(--c-border-mid)', color: 'var(--c-hint)', marginBottom: 2 }}
                    />
                    <div className="ability-score-row" style={{ justifyContent: 'center' }}>
                      <button className="mod-btn" onClick={() => setMod(idx, stat, mod - 1)}>−</button>
                      <input
                        type="number"
                        className="ability-score-input"
                        value={mod}
                        onChange={e => setMod(idx, stat, parseInt(e.target.value) || 0)}
                        style={{ fontWeight: 700 }}
                      />
                      <button className="mod-btn" onClick={() => setMod(idx, stat, mod + 1)}>+</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`ability-mod${onRoll ? ' clickable-stat' : ''}`}
                    onClick={onRoll ? () => rollStat(stat, mod) : undefined}
                    title={onRoll ? `${t('customWidgets.rollLabel')} ${diceNotation}${fmtSigned(mod)}` : undefined}
                  >{fmtSigned(mod)}</div>
                )
              )}
              {showValue && (
                editing ? (
                  <div style={{ width: '100%' }}>
                    <input
                      value={stat.valueId || ''}
                      onChange={e => patchStat(idx, { valueId: idInput(e.target.value) })}
                      placeholder={t('customWidgets.statValueId')}
                      style={{ fontSize: '0.6rem', textAlign: 'center', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid var(--c-border-mid)', color: 'var(--c-hint)', marginBottom: 2 }}
                    />
                    <div className="ability-score-row" style={{ justifyContent: 'center' }}>
                      <button className="mod-btn" onClick={() => setValue(idx, stat, value - 1)}>−</button>
                      <input
                        type="number"
                        className="ability-score-input"
                        value={value}
                        onChange={e => setValue(idx, stat, parseInt(e.target.value) || 0)}
                      />
                      <button className="mod-btn" onClick={() => setValue(idx, stat, value + 1)}>+</button>
                    </div>
                  </div>
                ) : (
                  <div className="ability-score-static">{value}</div>
                )
              )}
            </div>
          );
        })}
      </div>
      {editing && (
        <button className="io-btn" style={{ marginTop: 8, width: '100%' }} onClick={addStat}>
          {t('customWidgets.addStat')}
        </button>
      )}
    </div>
  );
}

function WidgetCounter({ widget, state, update, editMode }) {
  const { t } = useTranslation();
  const { fieldId, label, max: configMax = 10 } = widget.config;
  const value = fieldId ? (getCustomField(state, fieldId) ?? 0) : 0;
  const max = editMode ? configMax : configMax;

  function setVal(n) {
    setCustomField(update, fieldId, Math.max(0, Math.min(max, n)));
  }

  function handlePip(pipN) {
    // pipN is 1-indexed
    setVal(value >= pipN ? pipN - 1 : pipN);
  }

  if (!fieldId) {
    return (
      <div className="card">
        <div className="card-title">{label || t('customWidgets.counter')}</div>
        <div className="hint-text">{t('customWidgets.setFieldId')}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">{label || t('customWidgets.counter')}</div>
      <div className="counter-group" style={{ flexWrap: 'wrap', gap: 3, display: 'flex' }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <span
            key={n}
            className={`counter-pip${value >= n ? ' on' : ''}`}
            style={{ width: 14, height: 14 }}
            onClick={() => handlePip(n)}
          />
        ))}
      </div>
      {editMode && (
        <div className="field" style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label style={{ margin: 0 }}>{t('customWidgets.editMax')}</label>
          <input
            type="number"
            min="1"
            max="20"
            value={configMax}
            onChange={e => {
              const newMax = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
              updateWidgetConfig(update, widget.id, { ...widget.config, max: newMax });
              if (value > newMax) setCustomField(update, fieldId, newMax);
            }}
            style={{ width: 60 }}
          />
        </div>
      )}
    </div>
  );
}

function WidgetText({ widget, state, update }) {
  const { t } = useTranslation();
  const { fieldId, label, multiline = false } = widget.config;

  function getValue() {
    if (fieldId) return getCustomField(state, fieldId) ?? '';
    return widget.config.value ?? '';
  }

  function setValue(val) {
    if (fieldId) {
      setCustomField(update, fieldId, val);
    } else {
      updateWidgetConfig(update, widget.id, { ...widget.config, value: val });
    }
  }

  return (
    <div className="card">
      {label && <div className="card-title">{label}</div>}
      {multiline
        ? <textarea
            className="notes-area"
            style={{ minHeight: 80 }}
            value={getValue()}
            onChange={e => setValue(e.target.value)}
            placeholder={t('placeholders.notes', '')}
          />
        : <input
            value={getValue()}
            onChange={e => setValue(e.target.value)}
            placeholder={t('customWidgets.text')}
          />
      }
    </div>
  );
}

// Same interaction model as the D&D FeatureManager (src/components/FeatureManager.jsx)
// — expand/edit-in-place feature cards — but system-agnostic: instead of a fixed
// class/species/background/custom source, the category is free text and items
// group under whichever category text they share (trimmed, case-insensitive).
const EMPTY_FEATURE_FORM = { name: '', desc: '', category: '' };

function categoryKey(cat) {
  return (cat || '').trim().toLowerCase();
}

function groupFeaturesByCategory(items) {
  const groups = [];
  const indexByKey = new Map();
  items.forEach(item => {
    const key = categoryKey(item.category);
    if (!indexByKey.has(key)) {
      indexByKey.set(key, groups.length);
      groups.push({ key, label: (item.category || '').trim(), items: [] });
    }
    groups[indexByKey.get(key)].items.push(item);
  });
  return groups;
}

function WidgetFeatures({ widget, state, update, onRoll }) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FEATURE_FORM);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const { fieldId, label } = widget.config;
  const items = fieldId ? (getCustomField(state, fieldId) ?? []) : [];

  function setItems(newItems) {
    setCustomField(update, fieldId, newItems);
  }

  function submitFeature() {
    if (!addForm.name.trim()) return;
    setItems([...items, {
      id: `feat_${Date.now()}`,
      name: addForm.name.trim(),
      desc: addForm.desc.trim(),
      category: addForm.category.trim(),
    }]);
    setAddForm(EMPTY_FEATURE_FORM);
    setAddOpen(false);
  }

  function removeItem(id) {
    setItems(items.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ name: item.name, desc: item.desc || '' });
    setExpandedId(item.id);
  }

  function saveEdit() {
    setItems(items.map(f => f.id === editingId ? { ...f, ...editForm } : f));
    setEditingId(null);
    setEditForm(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function handleItemClick(item) {
    if (editingId === item.id) return;
    if (editingId) cancelEdit();
    setExpandedId(expandedId === item.id ? null : item.id);
  }

  function setCounters(id, idx, vals) {
    setItems(items.map(f => f.id === id ? { ...f, counters: { ...(f.counters || {}), [idx]: vals } } : f));
  }

  if (!fieldId) {
    return (
      <div className="card">
        <div className="card-title">{label || t('customWidgets.features')}</div>
        <div className="hint-text">{t('customWidgets.setFieldId')}</div>
      </div>
    );
  }

  const groups = groupFeaturesByCategory(items);
  const existingCategories = [...new Set(items.map(f => (f.category || '').trim()).filter(Boolean))];
  const showHeaders = groups.length > 1 || (groups.length === 1 && groups[0].label !== '');
  const datalistId = `${widget.id}-categories`;

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>{label || t('customWidgets.features')}</span>
        <button className={`icon-btn${addOpen ? ' active' : ''}`} onClick={() => setAddOpen(v => !v)}>
          <Icon id="action.add" size={13} />
        </button>
      </div>

      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="field">
            <label>{t('features.formName')} *</label>
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('features.namePlaceholder')} autoFocus />
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>{t('features.formDesc')}</label>
            <NotationTextarea className="notes-area" style={{ minHeight: 60 }}
              value={addForm.desc} onChange={e => setAddForm(f => ({ ...f, desc: e.target.value }))}
              placeholder={t('features.descPlaceholder')} />
          </div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>{t('features.formCategory')}</label>
            <input value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
              placeholder={t('customWidgets.categoryPlaceholder')} list={datalistId} />
            <datalist id={datalistId}>
              {existingCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="io-btn" onClick={() => { setAddOpen(false); setAddForm(EMPTY_FEATURE_FORM); }}>{t('common.cancel')}</button>
            <button className={`io-btn primary ${!addForm.name.trim() ? 'disabled' : ''}`}
              onClick={submitFeature} disabled={!addForm.name.trim()}><Icon id="action.add" size={12} /> {t('common.addLabel')}</button>
          </div>
        </div>
      )}

      {items.length === 0 && !addOpen && <div className="hint-text">{t('customWidgets.emptyList')}</div>}

      {groups.map(group => (
        <div key={group.key} style={{ marginBottom: 10 }}>
          {showHeaders && (
            <div className="feature-group-header" style={{ color: 'var(--c-accent)' }}>
              {group.label || t('customWidgets.uncategorized')}
            </div>
          )}
          <div className="feature-list">
            {group.items.map(item => {
              const isEditing = editingId === item.id;
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id}
                  className={`feature-item ${isExpanded || isEditing ? 'expanded' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="feature-source-dot" style={{ background: 'var(--c-accent)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="feature-name">{item.name}</div>

                    {isEditing && editForm && (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
                        <div className="field">
                          <label>{t('features.formName')}</label>
                          <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="field" style={{ marginTop: 6 }}>
                          <label>{t('features.formDesc')}</label>
                          <NotationTextarea className="notes-area" style={{ minHeight: 72 }}
                            value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                          <button className="io-btn danger" onClick={e => { e.stopPropagation(); removeItem(item.id); }}>
                            <Icon id="action.remove" size={13} /> {t('common.delete')}
                          </button>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="io-btn" onClick={e => { e.stopPropagation(); cancelEdit(); }}>{t('common.cancel')}</button>
                            <button className="io-btn primary" onClick={e => { e.stopPropagation(); saveEdit(); }}>{t('common.save')}</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isExpanded && !isEditing && (
                      <div onClick={e => e.stopPropagation()}>
                        {item.desc && (
                          <div className="feature-desc">
                            <KeywordText text={item.desc} onRoll={onRoll} label={item.name}
                              counters={item.counters}
                              onCounterChange={(idx, vals) => setCounters(item.id, idx, vals)} />
                          </div>
                        )}
                        <div className="item-edit-actions">
                          <button className="io-btn" onClick={e => { e.stopPropagation(); startEdit(item); }}>
                            <Icon id="action.editItem" size={13} /> {t('common.edit')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetInventory({ widget, state, update }) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const items = state.inventory || [];
  const allTags = [...new Set(items.flatMap(i => i.tags || []))];

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span><Icon id="widget.inventory" /> {widget.config.label || t('customWidgets.inventory')}</span>
        <button className="icon-btn" onClick={() => setAddOpen(v => !v)}>
          <Icon id="action.add" size={13} />
        </button>
      </div>
      <InventoryManager
        items={items}
        onUpdate={inventory => update({ inventory })}
        addOpen={addOpen}
        onAddClose={() => setAddOpen(false)}
        hideWeight
        allTags={allTags}
        onUpdateTags={(id, tags) => update({ inventory: items.map(i => i.id === id ? { ...i, tags } : i) })}
        onCreateTag={() => {}}
      />
    </div>
  );
}

function WidgetNotes({ widget, state, update }) {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="card-title">
        <Icon id="widget.notes" /> {widget.config.label || t('customWidgets.notes')}
      </div>
      <textarea
        className="notes-area"
        style={{ minHeight: 120 }}
        value={state.notes || ''}
        onChange={e => update({ notes: e.target.value })}
      />
    </div>
  );
}

function WidgetLog({ widget, state, update }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const entries = state.log || [];

  function addEntry() {
    const text = input.trim();
    if (!text) return;
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    update(prev => ({ ...prev, log: [{ id: Date.now(), text, ts }, ...(prev.log || [])] }));
    setInput('');
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span><Icon id="widget.activityLog" /> {widget.config.label || t('customWidgets.log')}</span>
        {entries.length > 0 && (
          <button className="icon-btn" onClick={() => update({ log: [] })}>
            <Icon id="action.delete" size={13} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          placeholder={t('activityLog.empty', 'Add a log entry...')}
          style={{ flex: 1 }}
        />
        <button className="io-btn primary" onClick={addEntry}><Icon id="action.add" size={13} /></button>
      </div>
      {entries.length === 0
        ? <div className="hint-text">{t('activityLog.empty')}</div>
        : (
          <div className="activity-log-list">
            {entries.map(e => (
              <div key={e.id} className="activity-log-entry">
                <span className="activity-log-text">{e.text}</span>
                <span className="activity-log-ts">{e.ts}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// Boxes are managed on the card itself (pencil toggle), the same pattern as
// WidgetStatGrid — "edit layout" mode only renames the widget (see WidgetEditor).
function WidgetFormula({ widget, state, update, onRoll }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const boxes = widget.config.boxes || [];

  function patchBox(idx, patch) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      boxes: boxes.map((b, i) => i === idx ? { ...b, ...patch } : b),
    });
  }

  function addBox() {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      boxes: [...boxes, { _id: String(Date.now()), label: '', notation: '', active: false }],
    });
  }

  function removeBox(idx) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      boxes: boxes.filter((_, i) => i !== idx),
    });
  }

  function resolveBox(notation) {
    const resolved = resolveNotations(notation, {}, 0, 0, null, state.customFields || {}, false);
    return { resolved, sum: evalSimpleSum(resolved), hasDice: /(\d+)d(\d+)/i.test(resolved) };
  }

  function rollBox(box) {
    if (!onRoll) return;
    const { resolved } = resolveBox(box.notation);
    onRoll(resolved, box.label || t('customWidgets.formula'));
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>{widget.config.label || t('customWidgets.formula')}</span>
        <button className={`icon-btn${editing ? ' active' : ''}`} onClick={() => setEditing(v => !v)}>
          <Icon id={editing ? 'action.done' : 'action.edit'} size={13} />
        </button>
      </div>
      {boxes.length === 0 && !editing && (
        <div className="hint-text">{t('customWidgets.setNotation')}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: editing ? 'flex-start' : 'center' }}>
        {boxes.map((box, idx) => {
          const notation = box.notation || '';
          const { resolved, sum, hasDice } = resolveBox(notation);
          const rollable = !editing && box.active && hasDice && !!onRoll;
          return (
            <div key={box._id ?? idx} className={`ability-box${editing ? ' editing' : ''}`} style={{ position: 'relative', padding: '12px 16px', flex: '0 0 auto', minWidth: editing ? 220 : 90 }}>
              {editing && (
                <button
                  onClick={() => removeBox(idx)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.667rem', color: 'var(--c-muted)', lineHeight: 1, padding: 2 }}
                  title={t('common.deleteBtn')}
                >✕</button>
              )}
              {editing
                ? <input
                    value={box.label}
                    onChange={e => patchBox(idx, { label: e.target.value })}
                    placeholder={t('customWidgets.statLabel')}
                    style={{ fontSize: '0.667rem', textAlign: 'center', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid var(--c-border-mid)', marginBottom: 4, color: 'var(--c-muted)', fontWeight: 600 }}
                  />
                : <div className="ability-label" style={{ marginBottom: 4 }}>{box.label}</div>
              }
              {editing ? (
                <div style={{ width: '100%' }}>
                  <NotationTextarea
                    value={notation}
                    onChange={e => patchBox(idx, { notation: e.target.value })}
                    style={{ minHeight: 32, fontSize: '0.7rem', width: '100%' }}
                    placeholder={t('placeholders.notation')}
                  />
                  <button
                    className={`icon-btn${box.active ? ' active' : ''}`}
                    onClick={() => patchBox(idx, { active: !box.active })}
                    title={t('customWidgets.rollActive')}
                    style={{ marginTop: 4 }}
                  >
                    <Icon id="game.roll" size={13} />
                  </button>
                </div>
              ) : (
                <div
                  className={`ability-mod${rollable ? ' clickable-stat' : ''}`}
                  onClick={rollable ? () => rollBox(box) : undefined}
                  title={rollable ? `${t('customWidgets.rollLabel')} ${notation}` : undefined}
                  style={{ fontSize: '1.1rem' }}
                >
                  {notation.trim() ? (sum !== null ? sum : resolved) : '—'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {editing && (
        <button className="io-btn" style={{ marginTop: 8, width: '100%' }} onClick={addBox}>
          {t('customWidgets.addFormula')}
        </button>
      )}
    </div>
  );
}

// Mirrors the D&D "resources" widget (src/systems/dnd5e2024/widgets.jsx) minus
// the inspiration row: same pip trackers, add/remove, and pin-to-top-bar. Items
// live in state.resources (not customFields) so PinnedBar's generic pinned-
// resources section picks them up for free, same as it already does for D&D.
function WidgetToggleList({ widget, state, update }) {
  const { t } = useTranslation();
  const [editingList, setEditingList] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', icon: 'd6', max: 1, pinned: false });

  const items = state.resources || [];

  function setItems(newItems) {
    update({ resources: newItems });
  }

  function toggleItemPip(id, pipIdx) {
    setItems(items.map(r => r.id === id ? { ...r, current: pipIdx < r.current ? pipIdx : pipIdx + 1 } : r));
  }

  function toggleItemPin(id) {
    setItems(items.map(r => r.id === id ? { ...r, pinned: !r.pinned } : r));
  }

  function removeItem(id) {
    setItems(items.filter(r => r.id !== id));
  }

  function addItem() {
    if (!newItem.name.trim()) return;
    const max = Math.max(1, parseInt(newItem.max, 10) || 1);
    setItems([...items, {
      id: `res_${Date.now()}`,
      name: newItem.name.trim(),
      icon: newItem.icon,
      current: max,
      max,
      pinned: newItem.pinned,
    }]);
    setAddingItem(false);
    setNewItem({ name: '', icon: 'd6', max: 1, pinned: false });
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span><Icon id="widget.resources" /> {widget.config.label || t('customWidgets.toggleList')}</span>
        <button className={`icon-btn${editingList ? ' active' : ''}`}
          onClick={() => { setEditingList(v => !v); setAddingItem(false); }}>
          {editingList ? <Icon id="action.done" size={14} /> : <Icon id="action.edit" size={14} />}
        </button>
      </div>
      {items.filter(r => (r.max ?? 1) > 0).map(r => (
        <div key={r.id} className="resource-item">
          <div className="resource-label-row">
            <ResourceIcon icon={r.icon} size={13} />
            <span className="resource-name">{r.name}</span>
            {editingList && (
              <button className="icon-btn resource-remove-btn" onClick={() => removeItem(r.id)}>
                <Icon id="action.remove" size={11} />
              </button>
            )}
          </div>
          <div className="resource-pips">
            {Array.from({ length: r.max }).map((_, i) => (
              <button key={i}
                className={`icon-btn resource-pip-btn${i < r.current ? ' active' : ''}`}
                onClick={() => toggleItemPip(r.id, i)}>
                <ResourceIcon icon={r.icon} size={13} />
              </button>
            ))}
          </div>
          {editingList && (
            <label className="resource-pin-label">
              <input type="checkbox" checked={r.pinned || false} onChange={() => toggleItemPin(r.id)} />
              <span>{t('customWidgets.toggleListPin')}</span>
            </label>
          )}
        </div>
      ))}
      {editingList && (
        <div className="resource-edit-panel">
          {!addingItem ? (
            <button className="icon-btn" style={{ marginTop: 4 }} onClick={() => setAddingItem(true)}>
              <Icon id="action.add" size={12} /> {t('customWidgets.addItem')}
            </button>
          ) : (
            <div className="resource-add-form">
              <div className="field">
                <label>{t('customWidgets.toggleListName')}</label>
                <input value={newItem.name}
                  onChange={e => setNewItem(r => ({ ...r, name: e.target.value }))}
                  placeholder={t('customWidgets.toggleListName')} />
              </div>
              <div className="field">
                <label>{t('customWidgets.icon')}</label>
                <div className="resource-icon-picker">
                  {DICE_ICONS.map(d => (
                    <button key={d}
                      className={`filter-chip${newItem.icon === d ? ' active' : ''}`}
                      onClick={() => setNewItem(r => ({ ...r, icon: d }))}>
                      {d}
                    </button>
                  ))}
                  {Object.keys(getIconMap()).filter(k => k.startsWith('resource.')).map(k => k.slice(9)).map(ic => (
                    <button key={ic}
                      className={`filter-chip${newItem.icon === ic ? ' active' : ''}`}
                      onClick={() => setNewItem(r => ({ ...r, icon: ic }))}>
                      <ResourceIcon icon={ic} size={12} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>{t('customWidgets.toggleListMax')}</label>
                <input type="number" min="1"
                  value={newItem.max}
                  onChange={e => setNewItem(r => ({ ...r, max: e.target.value }))}
                  placeholder={t('customWidgets.toggleListMax')} />
              </div>
              <label className="resource-pin-label">
                <input type="checkbox" checked={newItem.pinned}
                  onChange={e => setNewItem(r => ({ ...r, pinned: e.target.checked }))} />
                <span>{t('customWidgets.toggleListPin')}</span>
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="io-btn primary" onClick={addItem}>{t('common.add')}</button>
                <button className="io-btn" onClick={() => {
                  setAddingItem(false);
                  setNewItem({ name: '', icon: 'd6', max: 1, pinned: false });
                }}>{t('common.cancel')}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function CustomWidget({ widget, state, update, editMode, onRoll }) {
  switch (widget.type) {
    case 'identity':     return <WidgetIdentity     widget={widget} state={state} update={update} editMode={editMode} />;
    case 'bar':          return <WidgetBar           widget={widget} state={state} update={update} />;
    case 'stat-grid':    return <WidgetStatGrid      widget={widget} state={state} update={update} onRoll={onRoll} />;
    case 'counter':      return <WidgetCounter       widget={widget} state={state} update={update} editMode={editMode} />;
    case 'text':         return <WidgetText          widget={widget} state={state} update={update} editMode={editMode} />;
    case 'features':     return <WidgetFeatures      widget={widget} state={state} update={update} onRoll={onRoll} />;
    case 'inventory':    return <WidgetInventory     widget={widget} state={state} update={update} editMode={editMode} />;
    case 'notes':        return <WidgetNotes         widget={widget} state={state} update={update} editMode={editMode} />;
    case 'log':          return <WidgetLog           widget={widget} state={state} update={update} editMode={editMode} />;
    case 'formula':      return <WidgetFormula       widget={widget} state={state} update={update} onRoll={onRoll} />;
    case 'toggle-list':  return <WidgetToggleList     widget={widget} state={state} update={update} />;
    default:
      return (
        <div className="card">
          <div className="hint-text" style={{ padding: '8px 0' }}>
            Unknown widget type: {widget.type}
          </div>
        </div>
      );
  }
}
