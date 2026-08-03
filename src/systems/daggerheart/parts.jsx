import React from 'react';
import { Icon } from '../../config/icons';

// Daggerheart-only presentational pieces, lifted out of App.jsx unchanged.

export function DHDomainCardForm({ domains, onAdd, onCancel, t }) {
  const [form, setForm] = React.useState({ name:'', domain:'', level:'', type:'ability', desc:'' });
  return (
    <div className="weapon-add-panel" style={{ marginBottom:8 }}>
      <div className="field-row">
        <div className="field">
          <label>{t('identity.name')}</label>
          <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Card name..." autoFocus />
        </div>
        <div className="field">
          <label>{t('dh.domains','Domain')}</label>
          <select value={form.domain} onChange={e => setForm(f => ({...f, domain:e.target.value}))}>
            <option value="">—</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Level</label>
          <input type="number" min="1" max="6" value={form.level} onChange={e => setForm(f => ({...f, level:e.target.value}))} style={{ width:52 }} />
        </div>
      </div>
      <div className="field">
        <label>{t('inventory.descLabel','Description')}</label>
        <textarea rows={2} value={form.desc} onChange={e => setForm(f => ({...f, desc:e.target.value}))} placeholder="Card effect..." style={{ width:'100%' }} />
      </div>
      <div style={{ display:'flex', gap:6, marginTop:6 }}>
        <button className="io-btn primary" onClick={() => form.name && onAdd(form)}><Icon id="action.add" size={12} /> {t('common.add','Add')}</button>
        <button className="io-btn" onClick={onCancel}>{t('common.cancel','Cancel')}</button>
      </div>
    </div>
  );
}

export function DHPipRow({ current, max, pipClass, onToggle }) {
  return (
    <div className="dh-pip-row">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}
          className={`dh-pip ${pipClass}${i < current ? ' on' : ''}`}
          onClick={() => onToggle(i < current ? i : i + 1)}
        />
      ))}
    </div>
  );
}
