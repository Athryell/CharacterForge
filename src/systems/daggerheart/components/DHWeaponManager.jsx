import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../config/icons';
import dataManager from '../../../data/dataManager';

const RANGES = ['Melee', 'Very Close', 'Close', 'Far', 'Very Far'];
const TRAITS = ['AGI', 'STR', 'FIN', 'INS', 'PRE', 'KNO'];
const BLANK_FORM = {
  name: '', trait: 'AGI', range: 'Melee',
  dmgDie: 'd6', dmgType: 'phy', hands: 'one-handed', feature: '',
};

function isSecondary(w) {
  return w.dmgDie === 'd4';
}

// "d8" + prof 2 → "2d8" | "d8+1" + prof 2 → "2d8+1"
function buildDmgLabel(dmgDie, proficiency) {
  const prof = Math.max(1, proficiency || 1);
  const m = (dmgDie || 'd6').match(/^d(\d+)([+-]\d+)?$/);
  if (!m) return `${prof}×${dmgDie}`;
  return `${prof}d${m[1]}${m[2] || ''}`;
}

function TraitBadge({ trait }) {
  return <span className={`dh-wm-trait dh-trait-${trait}`}>{trait}</span>;
}

function TypeBadge({ type, t }) {
  return (
    <span className={`dh-wm-type dh-wm-type-${type}`}>
      {type === 'phy' ? t('dh.weapons.phy', 'PHY') : t('dh.weapons.mag', 'MAG')}
    </span>
  );
}

export default function DHWeaponManager({ weapons = [], proficiency = 1, onUpdate, onRoll, addOpen, onAddClose }) {
  const { t } = useTranslation();
  const adapter = dataManager.getAdapter('daggerheart');
  const DH_WEAPONS = adapter.getWeapons();
  const [expanded, setExpanded] = useState(null);
  const [addMode, setAddMode] = useState('preset');
  const [handsFilter, setHandsFilter] = useState(null);
  const [customForm, setCustomForm] = useState(BLANK_FORM);

  function patchCustom(obj) { setCustomForm(f => ({ ...f, ...obj })); }

  function handleRemove(id) { onUpdate(weapons.filter(w => w.id !== id)); }

  function handleAddPreset(preset) {
    onUpdate([...weapons, {
      id: Date.now().toString(),
      name: preset.name, trait: preset.trait, range: preset.range,
      dmgDie: preset.dmgDie, dmgType: preset.dmgType,
      hands: preset.hands, feature: preset.feature,
    }]);
    onAddClose && onAddClose();
  }

  function handleAddCustom() {
    if (!customForm.name.trim()) return;
    onUpdate([...weapons, {
      ...customForm,
      feature: customForm.feature.trim() || null,
      id: Date.now().toString(),
    }]);
    setCustomForm(BLANK_FORM);
    onAddClose && onAddClose();
  }

  const filteredPresets = handsFilter
    ? DH_WEAPONS.filter(w => w.hands === handsFilter)
    : DH_WEAPONS;

  return (
    <div>
      {addOpen && (
        <div className="weapon-add-panel" style={{ marginBottom: 12 }}>
          <div className="creator-method-bar" style={{ marginBottom: 8 }}>
            <button className={`filter-chip ${addMode === 'preset' ? 'active' : ''}`}
              onClick={() => setAddMode('preset')}>
              {t('weapons.presetSRD', 'SRD')}
            </button>
            <button className={`filter-chip ${addMode === 'custom' ? 'active' : ''}`}
              onClick={() => setAddMode('custom')}>
              {t('weapons.custom', 'Custom')}
            </button>
          </div>

          {addMode === 'preset' ? (
            <>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                {[
                  [null,          t('common.all', 'All')],
                  ['one-handed',  t('dh.weapons.oneHanded', '1H')],
                  ['two-handed',  t('dh.weapons.twoHanded', '2H')],
                ].map(([val, label]) => (
                  <button key={String(val)} className={`filter-chip ${handsFilter === val ? 'active' : ''}`}
                    style={{ fontSize: '0.733rem' }} onClick={() => setHandsFilter(val)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="dh-wm-preset-list">
                {filteredPresets.map(p => (
                  <div key={p.id} className="dh-wm-preset-item">
                    <span className="dh-wm-preset-name">{p.name}</span>
                    <TraitBadge trait={p.trait} />
                    <span className="dh-wm-range">{p.range}</span>
                    <span className="dh-wm-dmg" style={{ cursor: 'default' }}>
                      {buildDmgLabel(p.dmgDie, proficiency)}
                    </span>
                    <TypeBadge type={p.dmgType} t={t} />
                    {p.feature && (
                      <span className="dh-wm-chip" title={p.feature}>
                        {t('dh.weapons.feature', 'FT')}
                      </span>
                    )}
                    {isSecondary(p) && (
                      <span className="dh-wm-chip dh-wm-chip-sec">
                        {t('dh.weapons.secondary', 'SEC')}
                      </span>
                    )}
                    <button className="dh-wm-preset-add" onClick={() => handleAddPreset(p)}><Icon id="action.add" size={12} /></button>
                  </div>
                ))}
              </div>
              <button className="io-btn" style={{ marginTop: 8 }} onClick={onAddClose}>
                {t('common.cancel', 'Cancel')}
              </button>
            </>
          ) : (
            <div className="weapon-edit-form">
              <div className="field-row">
                <div className="field" style={{ flex: 3 }}>
                  <label>{t('dh.weapons.name', 'Name')}</label>
                  <input value={customForm.name} autoFocus
                    onChange={e => patchCustom({ name: e.target.value })}
                    placeholder={t('placeholders.dhWeaponName')} />
                </div>
                <div className="field" style={{ flex: '0 0 80px' }}>
                  <label>{t('dh.weapons.trait', 'Trait')}</label>
                  <select value={customForm.trait} onChange={e => patchCustom({ trait: e.target.value })}>
                    {TRAITS.map(tr => <option key={tr} value={tr}>{tr}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row" style={{ marginTop: 6 }}>
                <div className="field">
                  <label>{t('dh.weapons.range', 'Range')}</label>
                  <select value={customForm.range} onChange={e => patchCustom({ range: e.target.value })}>
                    {RANGES.map(r => <option key={r} value={r}>{t(`dh.weapons.ranges.${r}`, r)}</option>)}
                  </select>
                </div>
                <div className="field" style={{ flex: '0 0 90px' }}>
                  <label>{t('dh.weapons.dmgDie', 'Damage Die')}</label>
                  <input value={customForm.dmgDie}
                    onChange={e => patchCustom({ dmgDie: e.target.value })}
                    placeholder={t('placeholders.dhWeaponDie')} />
                </div>
                <div className="field" style={{ flex: '0 0 80px' }}>
                  <label>{t('dh.weapons.dmgType', 'Type')}</label>
                  <select value={customForm.dmgType} onChange={e => patchCustom({ dmgType: e.target.value })}>
                    <option value="phy">{t('dh.weapons.phy', 'Physical')}</option>
                    <option value="mag">{t('dh.weapons.mag', 'Magic')}</option>
                  </select>
                </div>
                <div className="field" style={{ flex: '0 0 80px' }}>
                  <label>{t('dh.weapons.hands', 'Hands')}</label>
                  <select value={customForm.hands} onChange={e => patchCustom({ hands: e.target.value })}>
                    <option value="one-handed">{t('dh.weapons.oneHanded', '1H')}</option>
                    <option value="two-handed">{t('dh.weapons.twoHanded', '2H')}</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginTop: 6 }}>
                <label>
                  {t('dh.weapons.feature', 'Feature')}
                  <span style={{ fontWeight: 400, fontSize: '0.733rem', marginLeft: 4, color: 'var(--c-muted)' }}>
                    ({t('common.optional', 'optional')})
                  </span>
                </label>
                <textarea className="notes-area" style={{ minHeight: 44, fontSize: '0.8rem' }}
                  value={customForm.feature}
                  onChange={e => patchCustom({ feature: e.target.value })}
                  placeholder={t('dh.weapons.featurePlaceholder', 'Reach, Thrown, special effect…')} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                <button className="io-btn" onClick={onAddClose}>{t('common.cancel', 'Cancel')}</button>
                <button className="io-btn primary" onClick={handleAddCustom}
                  disabled={!customForm.name.trim()}>
                  {t('common.add', 'Add')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {weapons.length === 0 && !addOpen && (
        <div className="hint-text" style={{ padding: '8px 0' }}>
          {t('dh.weapons.none', 'No weapons. Add one with +.')}
        </div>
      )}

      {weapons.map(w => {
        const dmgLabel = buildDmgLabel(w.dmgDie, proficiency);
        const isExp = expanded === w.id;
        return (
          <div key={w.id} className="dh-wm-item">
            <div className="dh-wm-row" onClick={() => setExpanded(isExp ? null : w.id)}>
              <span className="dh-wm-name">{w.name}</span>
              <div className="dh-wm-badges">
                <TraitBadge trait={w.trait || 'AGI'} />
                <span className="dh-wm-range">{w.range}</span>
                <span className="dh-wm-dmg"
                  title={`Roll ${dmgLabel}`}
                  onClick={e => { e.stopPropagation(); onRoll && onRoll(dmgLabel, w.name); }}>
                  {dmgLabel}
                </span>
                <TypeBadge type={w.dmgType || 'phy'} t={t} />
                {w.feature && <span className="dh-wm-chip">{t('dh.weapons.feature', 'FT')}</span>}
              </div>
              <button className="dh-wm-remove-btn"
                title={t('common.remove', 'Remove')}
                onClick={e => { e.stopPropagation(); handleRemove(w.id); }}>
                ✕
              </button>
            </div>
            {isExp && w.feature && (
              <div className="dh-wm-feature-expanded">{w.feature}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
