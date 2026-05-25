import React, { useState } from 'react';
import { CONDITIONS } from '../data/conditions';

export default function ConditionTracker({ active = [], onChange }) {
  const [tooltip, setTooltip] = useState(null);

  function toggle(id) {
    if (active.includes(id)) onChange(active.filter(c => c !== id));
    else onChange([...active, id]);
  }

  return (
    <div>
      <div className="condition-grid">
        {CONDITIONS.map(c => {
          const isActive = active.includes(c.id);
          return (
            <div
              key={c.id}
              className={`condition-chip ${isActive ? 'active' : ''}`}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => setTooltip(c)}
              onMouseLeave={() => setTooltip(null)}
            >
              <span className="condition-icon">{c.icon}</span>
              <span className="condition-name">{c.name}</span>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <div className="condition-tooltip">
          <strong>{tooltip.icon} {tooltip.name}</strong>
          <div style={{ marginTop: 4 }}>{tooltip.desc}</div>
        </div>
      )}

      {active.length > 0 && (
        <div className="condition-active-list">
          {active.map(id => {
            const c = CONDITIONS.find(x => x.id === id);
            if (!c) return null;
            return (
              <div key={id} className="condition-active-item">
                <span>{c.icon} {c.name}</span>
                <button className="equip-remove" onClick={() => toggle(id)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
