import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../config/icons';
import { BONUS_STAT_OPTIONS } from '../data/bonuses';

export default function BonusEditor({ bonuses, onChange }) {
  const { t } = useTranslation();
  const [stat, setStat] = useState('AC');
  const [value, setValue] = useState(1);

  function addBonus() {
    onChange([...(bonuses || []), { stat, value: Number(value) }]);
  }

  return (
    <div className="bonus-editor">
      <label>{t('weapons.equipBonusLabel', 'Equipment bonuses')}</label>
      {(bonuses || []).length > 0 && (
        <div className="bonus-chips">
          {bonuses.map((b, i) => (
            <span key={i} className="bonus-chip">
              {t(`data.stats.${b.stat}`, BONUS_STAT_OPTIONS.find(o => o.value === b.stat)?.label || b.stat)}
              {' '}{b.value >= 0 ? '+' : ''}{b.value}
              <button onClick={e => { e.stopPropagation(); onChange(bonuses.filter((_, j) => j !== i)); }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="bonus-add-row">
        <select value={stat} onChange={e => setStat(e.target.value)}>
          {BONUS_STAT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{t(`data.stats.${o.value}`, o.label)}</option>
          ))}
        </select>
        <input type="number" value={value}
          onChange={e => setValue(parseInt(e.target.value) || 0)}
          style={{ width: 52 }} />
        <button className="io-btn" onClick={e => { e.stopPropagation(); addBonus(); }}><Icon id="action.add" size={12} /></button>
      </div>
    </div>
  );
}
