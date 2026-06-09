import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALIGNMENTS } from '../data/systems/dnd5e/mechanics';

export default function AlignmentPicker({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="alignment-grid">
      {ALIGNMENTS.map(a => (
        <button key={a} type="button"
          className={`alignment-btn${value === a ? ' active' : ''}`}
          onClick={() => onChange(a)}>
          {t(`data.alignments.${a}`, a)}
        </button>
      ))}
    </div>
  );
}
