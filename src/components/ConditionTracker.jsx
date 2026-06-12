import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DND_CONDITIONS as CONDITIONS } from '../data/systems/dnd5e/conditions';
import { Icon, useIconMode, EMOJI_TO_LUCIDE } from '../config/icons';
import { useUnits } from '../hooks/useUnits';

const CUSTOM_CONDITION_ICONS = [
  '⚠️', '💀', '🔥', '❄️', '⚡', '💧', '🌀', '☠️',
  '😵', '😨', '🤢', '😴', '🩸', '🔮', '⛓️', '🛡️',
  '👁️', '🌑', '💫', '🤕', '🧊', '☁️', '🌿', '⚔️',
];

function ConditionIcon({ icon, size = 14 }) {
  const { iconMode } = useIconMode();
  if (iconMode === 'none') return null;
  if (iconMode === 'lucide') {
    const LucideIcon = EMOJI_TO_LUCIDE[icon];
    if (LucideIcon) return <LucideIcon size={size} />;
  }
  return <span style={{ fontSize: size }}>{icon}</span>;
}

export default function ConditionTracker({ active = [], onChange, exhaustionLevel = 0, onExhaustionChange, conditions: conditionList, onAddCustom, onRemoveCustom }) {
  const { t } = useTranslation();
  const { iconMode } = useIconMode();
  const { toDisplaySpeed, speedUnit } = useUnits();
  const [tooltip, setTooltip] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('⚠️');
  const [formDesc, setFormDesc] = useState('');
  const [nameError, setNameError] = useState(false);

  const conditions = conditionList || CONDITIONS;

  function toggle(id) {
    if (active.includes(id)) onChange(active.filter(c => c !== id));
    else onChange([...active, id]);
  }

  const normalConditions = conditions.filter(c => c.type !== 'counter');
  const exhaustionDef = conditions.find(c => c.id === 'exhaustion');

  function condName(c) {
    return c.name || t(`data.conditions.${c.id}.name`, c.id);
  }
  function condDesc(c) {
    return c.desc || t(`data.conditions.${c.id}.desc`, '');
  }

  function handleAddCustom() {
    const trimmedName = formName.trim();
    if (!trimmedName) { setNameError(true); return; }
    if (onAddCustom) {
      onAddCustom({
        id: `custom_${Date.now()}`,
        name: trimmedName,
        icon: formIcon || '⚠️',
        desc: formDesc.trim(),
      });
    }
    setShowForm(false);
    setFormName('');
    setFormIcon('⚠️');
    setFormDesc('');
    setNameError(false);
  }

  function handleCancel() {
    setShowForm(false);
    setFormName('');
    setFormIcon('⚠️');
    setFormDesc('');
    setNameError(false);
  }

  return (
    <div>
      <div className="condition-grid">
        {[...normalConditions].sort((a, b) => condName(a).localeCompare(condName(b))).map(c => {
          const isActive = active.includes(c.id);
          const isCustom = c.id.startsWith('custom_');
          return (
            <div key={c.id}
              className={`condition-chip ${isActive ? 'active' : ''}`}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => setTooltip(c)}
              onMouseLeave={() => setTooltip(null)}
            >
              {iconMode !== 'none' && (
                <span className="condition-icon">
                  {isCustom
                    ? <ConditionIcon icon={c.icon} size={14} />
                    : <Icon id={c.icon} size={14} fallback={c.icon} />
                  }
                </span>
              )}
              <span className="condition-name">{condName(c)}</span>
              {isCustom && onRemoveCustom && (
                <button
                  className="condition-remove-btn"
                  onClick={e => { e.stopPropagation(); onRemoveCustom(c.id); }}
                  title={t('conditions.remove')}
                >✕</button>
              )}
            </div>
          );
        })}

        {exhaustionDef && (
          <div
            className={`condition-chip exhaustion-chip ${exhaustionLevel > 0 ? 'active' : ''}`}
            onMouseEnter={() => setTooltip(exhaustionDef)}
            onMouseLeave={() => setTooltip(null)}
          >
            {iconMode !== 'none' && <span className="condition-icon"><Icon id={exhaustionDef.icon} size={14} fallback={exhaustionDef.icon} /></span>}
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
          <strong>{iconMode !== 'none' && <Icon id={tooltip.icon} size={13} fallback={tooltip.icon} />} {condName(tooltip)}</strong>
          {tooltip.type === 'counter' && exhaustionLevel > 0 ? (
            <div style={{ marginTop: 4 }}>
              {exhaustionLevel >= 6
                ? t('data.conditions.exhaustion.level6', 'Lv. 6: Death')
                : exhaustionLevel === 5
                  ? t('data.conditions.exhaustion.level5', 'Lv. 5: −10 to all d20 rolls · Speed 0')
                  : t('data.conditions.exhaustion.levelFmt', {
                      level: exhaustionLevel,
                      penalty: exhaustionLevel * 2,
                      speed: toDisplaySpeed(exhaustionLevel * 5),
                      unit: speedUnit,
                    })
              }
            </div>
          ) : tooltip.id === 'exhaustion' ? (
            <div style={{ marginTop: 4 }}>
              {t('data.conditions.exhaustion.desc', {
                speedPerLevel: toDisplaySpeed(5),
                unit: speedUnit,
              })}
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>{condDesc(tooltip)}</div>
          )}
        </div>
      )}

      {onAddCustom && !showForm && (
        <button className="custom-cond-add-btn" onClick={() => setShowForm(true)}>
          {t('conditions.customBtn')}
        </button>
      )}

      {showForm && (
        <div className="custom-cond-form">
          <div className="field">
            <label>{t('conditions.customForm.nameLabel')}</label>
            <input
              type="text"
              className={nameError ? 'input-error' : ''}
              placeholder={t('conditions.customForm.namePlaceholder')}
              value={formName}
              autoFocus
              onChange={e => { setFormName(e.target.value); setNameError(false); }}
            />
            {nameError && <span className="field-error">{t('conditions.customForm.nameRequired')}</span>}
          </div>
          <div className="field">
            <label>{t('conditions.customForm.iconLabel')}</label>
            <div className="condition-icon-picker">
              {CUSTOM_CONDITION_ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`condition-icon-option${formIcon === emoji ? ' selected' : ''}`}
                  onClick={() => setFormIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>{t('conditions.customForm.descLabel')}</label>
            <textarea
              placeholder={t('conditions.customForm.descPlaceholder')}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              rows={2}
              className="notes-area"
            />
          </div>
          <div className="custom-cond-form-btns">
            <button className="io-btn" onClick={handleCancel}>{t('conditions.customForm.cancel')}</button>
            <button className="io-btn primary" onClick={handleAddCustom}>{t('conditions.customForm.add')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
