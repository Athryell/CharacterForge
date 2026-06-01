import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CONDITIONS } from '../data/conditions';

export default function ConditionTracker({ active = [], onChange, exhaustionLevel = 0, onExhaustionChange }) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState(null);

  function toggle(id) {
    if (active.includes(id)) onChange(active.filter(c => c !== id));
    else onChange([...active, id]);
  }

  const normalConditions = CONDITIONS.filter(c => c.type !== 'counter');
  const exhaustionDef = CONDITIONS.find(c => c.id === 'exhaustion');

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
              <span className="condition-icon">{c.icon}</span>
              <span className="condition-name">{t(`data.conditions.${c.id}.name`, c.id)}</span>
            </div>
          );
        })}

        {/* Exhaustion counter chip */}
        {exhaustionDef && (
          <div
            className={`condition-chip exhaustion-chip ${exhaustionLevel > 0 ? 'active' : ''}`}
            onMouseEnter={() => setTooltip(exhaustionDef)}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="condition-icon">{exhaustionDef.icon}</span>
            <span className="condition-name">{t('data.conditions.exhaustion.name', 'Exhaustion')}</span>
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
          <strong>{tooltip.icon} {t(`data.conditions.${tooltip.id}.name`, tooltip.id)}</strong>
          {tooltip.type === 'counter' && exhaustionLevel > 0 ? (
            <div style={{ marginTop: 4 }}>{tooltip.levels[exhaustionLevel - 1]}</div>
          ) : (
            <div style={{ marginTop: 4 }}>{t(`data.conditions.${tooltip.id}.desc`, tooltip.desc)}</div>
          )}
        </div>
      )}
    </div>
  );
}
