import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Shield, Zap, Star, Flame, Droplets, Wind, Brain, Target, Clock } from 'lucide-react';
import { Icon } from '../../config/icons';
import InventoryManager from '../InventoryManager';

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

// ── Widget sub-components ──────────────────────────────────────────────────

function WidgetIdentity({ widget, state, update }) {
  const { t } = useTranslation();
  const fields = widget.config.fields || ['name', 'image', 'pronouns'];

  const fieldRenderers = {
    name: (
      <div key="name" className="field">
        <label>{t('identity.nameLabel')}</label>
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
        <Icon id="widget.identity" /> {t('customWidgets.identity')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(f => fieldRenderers[f] || null)}
      </div>
    </div>
  );
}

function WidgetBar({ widget, state, update, editMode }) {
  const { t } = useTranslation();
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
      <div className="card-title">
        {BarIcon && <BarIcon size={14} />}
        {' '}{label || t('customWidgets.bar')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <button className="mod-btn" onClick={() => set({ current: Math.max(0, current - 1) })}>−</button>
        <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 600 }}>{current}</span>
        <button className="mod-btn" onClick={() => set({ current: Math.min(max, current + 1) })}>+</button>
        <span style={{ color: 'var(--c-muted)', fontSize: '0.8rem' }}>/ {max}</span>
        {editMode && (
          <input
            type="number"
            min="0"
            value={max}
            onChange={e => set({ max: parseInt(e.target.value) || 0, current: Math.min(current, parseInt(e.target.value) || 0) })}
            style={{ width: 52, marginLeft: 4 }}
            title={t('customWidgets.editMax')}
          />
        )}
      </div>
      <div style={{ height: 8, background: 'var(--c-border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `var(${color})`,
          borderRadius: 4, transition: 'width .2s',
        }} />
      </div>
    </div>
  );
}

function WidgetStatGrid({ widget, state, update, editMode }) {
  const { t } = useTranslation();
  const stats = widget.config.stats || [];

  function getVal(stat) {
    if (stat.id) return state.customFields?.[stat.id] ?? 0;
    return stat.value ?? 0;
  }

  function setVal(idx, val, stat) {
    const n = parseInt(val) || 0;
    if (stat.id) {
      setCustomField(update, stat.id, n);
    } else {
      updateWidgetConfig(update, widget.id, {
        ...widget.config,
        stats: stats.map((s, i) => i === idx ? { ...s, value: n } : s),
      });
    }
  }

  function addStat() {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: [...stats, { label: '', value: 0 }],
    });
  }

  function removeStat(idx) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: stats.filter((_, i) => i !== idx),
    });
  }

  function setLabel(idx, lbl) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      stats: stats.map((s, i) => i === idx ? { ...s, label: lbl } : s),
    });
  }

  return (
    <div className="card">
      <div className="card-title">{t('customWidgets.statGrid')}</div>
      <div className="grid-3" style={{ gap: 6 }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="ability-box" style={{ position: 'relative', padding: '8px 4px' }}>
            {editMode && (
              <button
                onClick={() => removeStat(idx)}
                style={{ position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.667rem', color: 'var(--c-muted)', lineHeight: 1, padding: 2 }}
                title={t('common.deleteBtn')}
              >✕</button>
            )}
            {editMode
              ? <input
                  value={stat.label}
                  onChange={e => setLabel(idx, e.target.value)}
                  placeholder={t('customWidgets.statLabel')}
                  style={{ fontSize: '0.667rem', textAlign: 'center', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid var(--c-border-mid)', marginBottom: 4, color: 'var(--c-muted)', fontWeight: 600 }}
                />
              : <div style={{ fontSize: '0.667rem', color: 'var(--c-muted)', fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>{stat.label}</div>
            }
            <input
              type="number"
              value={getVal(stat)}
              onChange={e => setVal(idx, e.target.value, stat)}
              style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: '1.2rem', background: 'none', border: 'none', color: 'var(--c-ink)' }}
            />
          </div>
        ))}
      </div>
      {editMode && (
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

function WidgetList({ widget, state, update, editMode }) {
  const { t } = useTranslation();
  const [expandedIdx, setExpandedIdx] = useState(null);
  const { fieldId, label, itemFields = ['name', 'desc'] } = widget.config;
  const items = fieldId ? (getCustomField(state, fieldId) ?? []) : [];

  function setItems(newItems) {
    setCustomField(update, fieldId, newItems);
  }

  function addItem() {
    const newItem = Object.fromEntries(itemFields.map(f => [f, '']));
    newItem._id = String(Date.now());
    setItems([...items, newItem]);
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  }

  function updateItem(idx, field, val) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  if (!fieldId) {
    return (
      <div className="card">
        <div className="card-title">{label || t('customWidgets.list')}</div>
        <div className="hint-text">{t('customWidgets.setFieldId')}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>{label || t('customWidgets.list')}</span>
        <button className="icon-btn" onClick={addItem}><Icon id="action.add" size={13} /></button>
      </div>
      {items.length === 0 && <div className="hint-text">{t('customWidgets.emptyList')}</div>}
      {items.map((item, idx) => {
        const isExpanded = expandedIdx === idx;
        const displayName = item[itemFields[0]] || `#${idx + 1}`;
        return (
          <div key={item._id || idx} className={`inventory-item ${isExpanded ? 'expanded' : ''}`}>
            <div
              className="inventory-main-row"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              <div className="inventory-name">{displayName}</div>
              {(editMode || isExpanded) && (
                <button
                  className="mod-btn"
                  style={{ marginLeft: 'auto', fontSize: '0.667rem' }}
                  onClick={e => { e.stopPropagation(); removeItem(idx); }}
                >✕</button>
              )}
            </div>
            {isExpanded && (
              <div className="inventory-edit-form" onClick={e => e.stopPropagation()}>
                {itemFields.map(f => (
                  <div key={f} className="field" style={{ marginBottom: 6 }}>
                    <label style={{ textTransform: 'capitalize' }}>{f}</label>
                    <input
                      value={item[f] || ''}
                      onChange={e => updateItem(idx, f, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WidgetToggleList({ widget, state, update, editMode }) {
  const { t } = useTranslation();
  const [newLabel, setNewLabel] = useState('');
  const { fieldId, label, items: options = [] } = widget.config;
  const active = fieldId ? (getCustomField(state, fieldId) ?? []) : [];

  function toggle(id) {
    if (!fieldId) return;
    const next = active.includes(id) ? active.filter(x => x !== id) : [...active, id];
    setCustomField(update, fieldId, next);
  }

  function addOption() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const newOpt = { id: `opt_${Date.now()}`, label: trimmed };
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      items: [...options, newOpt],
    });
    setNewLabel('');
  }

  function removeOption(id) {
    updateWidgetConfig(update, widget.id, {
      ...widget.config,
      items: options.filter(o => o.id !== id),
    });
    if (fieldId && active.includes(id)) {
      setCustomField(update, fieldId, active.filter(x => x !== id));
    }
  }

  return (
    <div className="card">
      <div className="card-title">{label || t('customWidgets.toggleList')}</div>
      {options.length === 0 && !editMode && (
        <div className="hint-text">{t('customWidgets.emptyToggleList')}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {options.map(opt => (
          <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className={`condition-chip${active.includes(opt.id) ? ' active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => toggle(opt.id)}
            >
              <span className="condition-name">{opt.label}</span>
            </div>
            {editMode && (
              <button
                className="mod-btn"
                style={{ fontSize: '0.667rem' }}
                onClick={() => removeOption(opt.id)}
              >✕</button>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder={t('customWidgets.addOption')}
            onKeyDown={e => e.key === 'Enter' && addOption()}
            style={{ flex: 1 }}
          />
          <button className="io-btn primary" onClick={addOption}><Icon id="action.add" size={13} /></button>
        </div>
      )}
    </div>
  );
}

function WidgetInventory({ widget, state, update }) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="card">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span><Icon id="widget.inventory" /> {t('customWidgets.inventory')}</span>
        <button className="icon-btn" onClick={() => setAddOpen(v => !v)}>
          <Icon id="action.add" size={13} />
        </button>
      </div>
      <InventoryManager
        items={state.inventory || []}
        onUpdate={inventory => update({ inventory })}
        addOpen={addOpen}
        onAddClose={() => setAddOpen(false)}
        hideWeight
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

// ── Main export ────────────────────────────────────────────────────────────

export default function CustomWidget({ widget, state, update, editMode }) {
  switch (widget.type) {
    case 'identity':     return <WidgetIdentity     widget={widget} state={state} update={update} editMode={editMode} />;
    case 'bar':          return <WidgetBar           widget={widget} state={state} update={update} editMode={editMode} />;
    case 'stat-grid':    return <WidgetStatGrid      widget={widget} state={state} update={update} editMode={editMode} />;
    case 'counter':      return <WidgetCounter       widget={widget} state={state} update={update} editMode={editMode} />;
    case 'text':         return <WidgetText          widget={widget} state={state} update={update} editMode={editMode} />;
    case 'list':         return <WidgetList          widget={widget} state={state} update={update} editMode={editMode} />;
    case 'toggle-list':  return <WidgetToggleList    widget={widget} state={state} update={update} editMode={editMode} />;
    case 'inventory':    return <WidgetInventory     widget={widget} state={state} update={update} editMode={editMode} />;
    case 'notes':        return <WidgetNotes         widget={widget} state={state} update={update} editMode={editMode} />;
    case 'log':          return <WidgetLog           widget={widget} state={state} update={update} editMode={editMode} />;
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
