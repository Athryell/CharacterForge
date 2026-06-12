import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALIGNMENTS } from '../data/systems/dnd5e/mechanics';

export default function AlignmentPicker({ value, onChange }) {
  const { t } = useTranslation();
  const desc = value ? t(`data.alignments.desc.${value}`, '') : '';
  return (
    <div>
      <div className="alignment-grid">
        {ALIGNMENTS.map(a => (
          <button key={a} type="button"
            className={`alignment-btn${value === a ? ' active' : ''}`}
            onClick={() => onChange(a)}>
            {t(`data.alignments.${a}`, a)}
          </button>
        ))}
      </div>
      {desc && <div className="alignment-selected-desc">{desc}</div>}
    </div>
  );
}
