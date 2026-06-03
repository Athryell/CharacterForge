import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DND_CONDITIONS as CONDITIONS } from '../data/systems/dnd5e/conditions';
import { useIconMode } from '../config/icons';

export default function ConditionTracker({ active = [], onChange, exhaustionLevel = 0, onExhaustionChange, conditions: customConditions }) {
  const { t } = useTranslation();
  const { iconMode } = useIconMode();
  const [tooltip, setTooltip] = useState(null);

  const conditions = customConditions || CONDITIONS;

  function toggle(id) {
    if (active.includes(id)) onChange(active.filter(c => c !== id));
    else onChange([...active, id]);
  }

  // 'counter' type is D&D exhaustion — not present in DH conditions
  const normalConditions = conditions.filter(c => c.type !== 'counter');
  const exhaustionDef = conditions.find(c => c.id === 'exhaustion');

  function condName(c) {
    return c.name || t(`data.conditions.${c.id}.name`, c.id);
  }
  function condDesc(c) {
    return c.desc || t(`data.conditions.${c.id}.desc`, '');
  }

  return (
    <div>
      <div className="condition-grid">
        {normalConditions.map(c => {
          const isActive = active.includes(c.id);
          return (
            <div key={c.id}
              className={`condition-chip ${isActive ? 'active' : ''}`}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => setTooltip(c)}
              onMouseLeave={() => setTooltip(null)}
            >
              {iconMode !== 'none' && <span className="condition-icon">{c.icon}</span>}
              <span className="condition-name">{condName(c)}</span>
            </div>
          );
        })}

        {exhaustionDef && (
          <div
            className={`condition-chip exhaustion-chip ${exhaustionLevel > 0 ? 'active' : ''}`}
            onMouseEnter={() => setTooltip(exhaustionDef)}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="condition-icon">{exhaustionDef.icon}</span>
            <span className="condition-name">{condName(exhaustionDef)}</span>
            <div className="exhaustion-controls" onClick={e => e.stopPropagation()}>
              <button className="exhaustion-btn"
                onClick={() => onExhaustionChange && onExhaustionChange(Math.max(0, exhaustionLevel - 1))}
                disabled={exhaustionLevel <= 0}>−</button>
              <span className="exhaustion-level-val">{exhaustionLevel}</span>
              <button className="exhaustion-btn"
                onClick={() => onExhaustionChange && onExhaustionChange(Math.min(6, exhaustionLevel + 1))}
                disabled={exhaustionLevel >= 6}>+</button>
            </div>
          </div>
        )}
      </div>

      {tooltip && (
        <div className="condition-tooltip">
          <strong>{iconMode !== 'none' && tooltip.icon} {condName(tooltip)}</strong>
          {tooltip.type === 'counter' && exhaustionLevel > 0 ? (
            <div style={{ marginTop: 4 }}>{tooltip.levels[exhaustionLevel - 1]}</div>
          ) : (
            <div style={{ marginTop: 4 }}>{condDesc(tooltip)}</div>
          )}
        </div>
      )}
    </div>
  );
}
