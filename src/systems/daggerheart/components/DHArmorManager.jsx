import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dataManager from '../../../data/dataManager';

function PipRow({ current, max, pipClass, onToggle, numeric }) {
  if (numeric) {
    return (
      <div className="hp-stepper" style={{ gap: 4 }}>
        <button className="mod-btn" onClick={() => onToggle(Math.max(0, current - 1))}>−</button>
        <input type="number" className="hp-input" value={current}
          onChange={e => onToggle(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))} />
        <button className="mod-btn" onClick={() => onToggle(Math.min(max, current + 1))}>+</button>
      </div>
    );
  }
  if (max === 0) return <span className="hint-text">—</span>;
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

const BLANK_CUSTOM = { name: '', minor: 3, major: 7, score: 0, feature: '' };

export default function DHArmorManager({
  armorName, armorFeature, thresholdMinor, thresholdMajor, thresholdSevere,
  armorSlotsMax, armorSlots, charLevel, numericMode, onUpdate,
}) {
  const { t } = useTranslation();
  // Through dataManager, not the adapter: that is what merges homebrew packs in.
  const DH_ARMORS = dataManager.getArmors('daggerheart');
  const [changing, setChanging] = useState(false);
  const [changeMode, setChangeMode] = useState('preset');
  const [customForm, setCustomForm] = useState(BLANK_CUSTOM);
  const [featureOpen, setFeatureOpen] = useState(false);

  function patchCustom(obj) { setCustomForm(f => ({ ...f, ...obj })); }

  function selectPreset(armor) {
    onUpdate({
      armorName: armor.name,
      armorFeature: armor.feature || '',
      armorSlotsMax: armor.baseScore,
      armorSlots: armor.baseScore,
      thresholdMinor: armor.baseThresholds[0] + charLevel,
      thresholdMajor: armor.baseThresholds[1] + charLevel,
    });
    setChanging(false);
  }

  function saveCustom() {
    if (!customForm.name.trim()) return;
    onUpdate({
      armorName: customForm.name,
      armorFeature: customForm.feature.trim(),
      armorSlotsMax: customForm.score,
      armorSlots: customForm.score,
      thresholdMinor: Number(customForm.minor) + charLevel,
      thresholdMajor: Number(customForm.major) + charLevel,
    });
    setChanging(false);
    setCustomForm(BLANK_CUSTOM);
  }

  const hasArmor = !!armorName;
  const hasFeature = !!armorFeature;

  return (
    <div className="dh-arm-wrap">
      {/* ── Active armor info ── */}
      <div className="dh-arm-header">
        <span className="dh-arm-name">
          🛡 {hasArmor ? armorName : t('dh.armor.none', 'No Armor')}
        </span>
        <button className="io-btn" style={{ fontSize: '0.733rem', padding: '2px 8px' }}
          onClick={() => { setChanging(v => !v); setCustomForm(BLANK_CUSTOM); }}>
          {changing ? t('common.cancel', 'Cancel') : t('dh.armor.select', 'Change')}
        </button>
      </div>

      {/* Armor slots pips */}
      <div style={{ margin: '6px 0' }}>
        <div className="dh-vitals-label" style={{ marginBottom: 4 }}>
          <span>{t('dh.armorScore', 'Armor Score')}</span>
          <span className="dh-vitals-count">{armorSlots}/{armorSlotsMax}</span>
        </div>
        <PipRow
          current={armorSlots} max={armorSlotsMax} pipClass="dh-armor-pip"
          onToggle={v => onUpdate({ armorSlots: v })} numeric={numericMode}
        />
      </div>

      {/* Thresholds */}
      <div className="dh-threshold-row" style={{ marginBottom: hasFeature ? 6 : 0 }}>
        {[
          [t('dh.thresholds.minor', 'Minor'), thresholdMinor],
          [t('dh.thresholds.major', 'Major'), thresholdMajor],
          [t('dh.thresholds.severe', 'Severe'), thresholdSevere],
        ].map(([label, val]) => (
          <div key={label} className="dh-threshold-box">
            <div className="dh-threshold-label">{label}</div>
            <div className="dh-threshold-val">{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* Feature */}
      {hasFeature && (
        <div className="dh-arm-feature-row"
          onClick={() => setFeatureOpen(v => !v)}>
          <span className="dh-arm-feature-chip">
            {t('dh.armor.feature', 'Feature')}
          </span>
          {featureOpen && (
            <span className="dh-arm-feature-text">{armorFeature}</span>
          )}
        </div>
      )}

      {/* ── Change panel ── */}
      {changing && (
        <div className="dh-arm-panel">
          <div className="creator-method-bar" style={{ marginBottom: 8 }}>
            <button className={`filter-chip ${changeMode === 'preset' ? 'active' : ''}`}
              onClick={() => setChangeMode('preset')}>
              {t('weapons.presetSRD', 'SRD')}
            </button>
            <button className={`filter-chip ${changeMode === 'custom' ? 'active' : ''}`}
              onClick={() => setChangeMode('custom')}>
              {t('weapons.custom', 'Custom')}
            </button>
          </div>

          {changeMode === 'preset' ? (
            <div className="dh-arm-preset-list">
              {DH_ARMORS.map(armor => {
                const minor = armor.baseThresholds[0] + charLevel;
                const major = armor.baseThresholds[1] + charLevel;
                return (
                  <div key={armor.id} className="dh-arm-preset-item"
                    onClick={() => selectPreset(armor)}>
                    <div className="dh-arm-preset-main">
                      <span className="dh-arm-preset-name">{armor.name}</span>
                      <div className="dh-arm-preset-meta">
                        <span className="dh-arm-badge">
                          {t('dh.armor.minor', 'Min')} {minor}
                        </span>
                        <span className="dh-arm-badge">
                          {t('dh.armor.major', 'Maj')} {major}
                        </span>
                        {armor.baseScore > 0 && (
                          <span className="dh-arm-badge dh-arm-badge-score">
                            🛡×{armor.baseScore}
                          </span>
                        )}
                        {armor.feature && (
                          <span className="dh-arm-badge dh-arm-badge-ft"
                            title={armor.feature}>
                            FT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="weapon-edit-form">
              <div className="field">
                <label>{t('dh.armor.name', 'Armor name')}</label>
                <input value={customForm.name} autoFocus
                  onChange={e => patchCustom({ name: e.target.value })}
                  placeholder={t('placeholders.armorName')} />
              </div>
              <div className="field-row" style={{ marginTop: 6 }}>
                <div className="field">
                  <label>{t('dh.armor.minor', 'Minor')} (base)</label>
                  <input type="number" value={customForm.minor}
                    onChange={e => patchCustom({ minor: parseInt(e.target.value) || 0 })} />
                  <span className="hint-text" style={{ fontSize: '0.667rem' }}>
                    +{charLevel} = {Number(customForm.minor) + charLevel}
                  </span>
                </div>
                <div className="field">
                  <label>{t('dh.armor.major', 'Major')} (base)</label>
                  <input type="number" value={customForm.major}
                    onChange={e => patchCustom({ major: parseInt(e.target.value) || 0 })} />
                  <span className="hint-text" style={{ fontSize: '0.667rem' }}>
                    +{charLevel} = {Number(customForm.major) + charLevel}
                  </span>
                </div>
                <div className="field" style={{ flex: '0 0 80px' }}>
                  <label>{t('dh.armor.score', 'Score')}</label>
                  <input type="number" value={customForm.score}
                    onChange={e => patchCustom({ score: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 6 }}>
                <label>
                  {t('dh.armor.feature', 'Feature')}
                  <span style={{ fontWeight: 400, fontSize: '0.733rem', marginLeft: 4, color: 'var(--c-muted)' }}>
                    ({t('common.optional', 'optional')})
                  </span>
                </label>
                <textarea className="notes-area" style={{ minHeight: 40, fontSize: '0.8rem' }}
                  value={customForm.feature}
                  onChange={e => patchCustom({ feature: e.target.value })}
                  placeholder={t('placeholders.armorFeature')} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                <button className="io-btn" onClick={() => setChanging(false)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button className="io-btn primary" onClick={saveCustom}
                  disabled={!customForm.name.trim()}>
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
