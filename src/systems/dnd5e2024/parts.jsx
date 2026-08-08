import React from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '../../components/sheet';
import dataManager from '../../data/dataManager';
import { getSubclassesForClass } from './data/classes';
import { getMod, fmtMod } from './data/mechanics';

// D&D-only presentational pieces, lifted out of App.jsx unchanged.

export function AbilityBox({ attr, score, effectiveScore, onAdjust, onInput, editing, onHover, onRoll, bonus, bonusSources = [] }) {
  const mod = getMod(effectiveScore ?? score);
  const srcTitle = bonusSources.map(s => `${s.name} (${s.value >= 0 ? '+' : ''}${s.value})`).join(', ');
  return (
    <div
      className={`ability-box ${editing ? 'editing' : ''}`}
      onMouseEnter={() => onHover && onHover(attr)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="ability-label">{attr}</div>
      <div
        className={`ability-mod ${!editing && onRoll ? 'clickable-stat' : ''}`}
        onClick={!editing && onRoll ? () => onRoll(attr, mod) : undefined}
        title={!editing && onRoll ? `Tira 1d20${fmtMod(mod)}` : undefined}
      >{fmtMod(mod)}</div>
      {editing ? (
        <div className="ability-score-row">
          <button className="mod-btn" onClick={() => onAdjust(attr, -1)}>−</button>
          <input className="ability-score-input" type="number" min="3" max="30"
            value={score} onChange={e => onInput(attr, e.target.value)} />
          <button className="mod-btn" onClick={() => onAdjust(attr, 1)}>+</button>
        </div>
      ) : (
        <div className="ability-score-static">{effectiveScore ?? score}</div>
      )}
      {bonus ? <span className="equip-bonus-badge" title={srcTitle || undefined}>🎒</span> : null}
    </div>
  );
}

export function SpellSlots({ slots, onToggle }) {
  const { t } = useTranslation();
  return (
    <div>
      {slots.map((slot, i) => {
        if (!slot.max) return null;
        return (
          <div key={i} className="spell-slot-row">
            <div className="slot-level">{t('spells.slotLevel', { level: i + 1 })}</div>
            <div className="slot-pips">
              {Array.from({ length: slot.max }, (_, j) => (
                <div key={j} className={`slot-pip ${j >= slot.used ? 'available' : 'used'}`}
                  onClick={() => onToggle(i, j)} />
              ))}
            </div>
            <div className="slot-count">{slot.max - slot.used}/{slot.max}</div>
          </div>
        );
      })}
    </div>
  );
}

export function SubclassSection({ state, update, t, onOpenEditor }) {
  const cls = !state.charClass || state.charClass === '__custom__' ? '' : state.charClass;
  const knownSubs = [...getSubclassesForClass(cls), ...dataManager.getSubclasses('dnd5e2024', cls)];
  const selectVal = knownSubs.includes(state.charSubclass) ? state.charSubclass : '';

  return (
    <Field label={t('identity.subclass')}>
      <select
        value={selectVal}
        onChange={e => {
          const sub = e.target.value;
          if (sub === '__custom__') {
            onOpenEditor?.();
          } else {
            update({ charSubclass: sub, subclassFeatures: [] });
          }
        }}
        disabled={!state.charClass || state.charClass === '__custom__'}
      >
        <option value="">—</option>
        {knownSubs.map(s => <option key={s} value={s}>{s}</option>)}
        <option value="__custom__">{t('identity.subclassCustom')}</option>
      </select>
    </Field>
  );
}
