import React from 'react';
import { useTranslation } from 'react-i18next';
import dataManager from '../data/dataManager';
import { useCharContext } from './CharContext';

export default function AlignmentPicker({ value, onChange }) {
  const { t } = useTranslation();
  const { systemId } = useCharContext();
  const adapter = dataManager.getAdapter(systemId);
  const ALIGNMENTS = adapter.getAlignments?.() || [];
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
