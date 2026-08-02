import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, getIconMap, useIconMode } from '../config/icons';

const DICE_ICONS = ['d4','d6','d8','d10','d12','d20'];

function ResourceIcon({ icon, size = 13 }) {
  const { iconMode } = useIconMode();
  if (DICE_ICONS.includes(icon)) return <span className="resource-dice-icon">{icon}</span>;
  const entry = getIconMap()[`resource.${icon}`];
  if (!entry || iconMode === 'none') return null;
  if (iconMode === 'lucide' && entry.lucide) { const L = entry.lucide; return <L size={size} />; }
  return <span>{entry.emoji}</span>;
}

const PINNABLE_DND = [
  { id: 'hp',            labelKey: 'pinned.hp' },
  { id: 'inspiration',   labelKey: 'pinned.inspiration' },
  { id: 'concentration', labelKey: 'pinned.concentration' },
  { id: 'conditions',    labelKey: 'pinned.conditions' },
  { id: 'deathSaves',    labelKey: 'pinned.deathSaves' },
];

const PINNABLE_DH = [
  { id: 'hp',       labelKey: 'pinned.hp' },
  { id: 'dh-armor', labelKey: 'pinned.dhArmor' },
  { id: 'dh-hope',  labelKey: 'pinned.dhHope' },
  { id: 'dh-fear',  labelKey: 'pinned.dhFear' },
];

const STORAGE_KEY = 'characterforge_pinned';

export function loadPinned() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(v)) return v;
  } catch {}
  return ['hp', 'inspiration'];
}

export function savePinned(pinned) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned)); } catch {}
}

export default function PinnedBar({ state, editMode, pinned, onTogglePin, onUpdate, system, onShortRest, onLongRest, onToggleResourcePip }) {
  const { t } = useTranslation();
  const showRestBtns = !editMode && system === 'dnd5e2024';
  const pinnedResources = (state?.resources || []).filter(r => r.pinned);
  const [restMenuOpen, setRestMenuOpen] = useState(false);
  const restRef = useRef(null);

  useEffect(() => {
    if (!restMenuOpen) return;
    function handleClick(e) {
      if (restRef.current && !restRef.current.contains(e.target)) setRestMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [restMenuOpen]);

  if (!editMode && pinned.length === 0 && !showRestBtns && pinnedResources.length === 0) return null;

  const PINNABLE = system === 'daggerheart' ? PINNABLE_DH : PINNABLE_DND;
  const items = editMode ? PINNABLE : PINNABLE.filter(p => pinned.includes(p.id));

  return (
    <div className="pinned-bar">
      {editMode && <span className="pinned-bar-label">📌</span>}
      {items.map(item => {
        const isPinned = pinned.includes(item.id);
        return (
          <div
            key={item.id}
            className={`pin-item ${isPinned ? '' : 'pin-inactive'} ${editMode ? 'pin-item-edit' : ''}`}
            onClick={editMode ? () => onTogglePin(item.id) : undefined}
            title={editMode ? (isPinned ? t('pinned.removePin', 'Remove pin') : t('pinned.addPin', 'Pin to top')) : undefined}
          >
            {editMode && (
              <span className={`pin-toggle-icon ${isPinned ? 'on' : 'off'}`}>
                {isPinned ? '📌' : '📎'}
              </span>
            )}
            <PinContent id={item.id} labelKey={item.labelKey} state={state} onUpdate={onUpdate} active={isPinned || !editMode} editMode={editMode} />
          </div>
        );
      })}
      {/* Pinned resources (from resource tracker widget) */}
      {pinnedResources.map(r => (
        <div key={r.id} className="pin-item">
          <span className="pin-content">
            <ResourceIcon icon={r.icon} size={13} />
            {' '}
            {r.isPool ? (
              <span>{r.current}/{r.max}</span>
            ) : (
              Array.from({ length: r.max }).map((_, i) => (
                <span key={i}
                  className={`pin-pip${i < r.current ? ' on' : ''}`}
                  onClick={() => onToggleResourcePip?.(r.id, i)} />
              ))
            )}
          </span>
        </div>
      ))}
      {showRestBtns && (
        <div className="pinned-rest-group" ref={restRef}>
          <button
            className={`pinned-rest-btn${restMenuOpen ? ' active' : ''}`}
            onClick={() => setRestMenuOpen(v => !v)}
            aria-label={t('rest.rest', 'Rest')}
            title={t('rest.rest', 'Rest')}
          >
            <Icon id="game.rest" size={13} />
            <span>{t('rest.rest', 'Rest')}</span>
          </button>
          {restMenuOpen && (
            <div className="rest-dropdown">
              <button className="rest-dropdown-item" onClick={() => { onShortRest(); setRestMenuOpen(false); }}>
                <Icon id="game.shortRest" size={14} />
                {t('rest.short', 'Short Rest')}
              </button>
              <button className="rest-dropdown-item" onClick={() => { onLongRest(); setRestMenuOpen(false); }}>
                <Icon id="game.longRest" size={14} />
                {t('rest.long', 'Long Rest')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DHPipRow({ icon, current, max, pipClass, onUpdate, stateKey, editMode }) {
  return (
    <span className="pin-content pin-dh-pips">
      <span className="pin-dh-emoji">{icon}</span>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`pin-pip ${pipClass}${i < current ? ' on' : ''}`}
          onClick={editMode ? undefined : () => onUpdate({ [stateKey]: i < current ? i : i + 1 })}
        />
      ))}
    </span>
  );
}

function PinContent({ id, labelKey, state, onUpdate, active, editMode }) {
  const { t } = useTranslation();
  if (!active) {
    return <span className="pin-content-muted">{t(labelKey, id)}</span>;
  }

  switch (id) {
    case 'hp': {
      const pct = Math.max(0, Math.min(100, (state.hpCurrent / Math.max(1, state.hpMax)) * 100));
      const color = pct > 50 ? 'var(--c-accent)' : pct > 25 ? '#854F0B' : '#A32D2D';
      const temp = state.hpTemp || 0;
      return (
        <span className="pin-content" style={{ color, fontWeight: 600 }}>
          <Icon id="widget.hp" size={13} /> {state.hpCurrent}<span style={{ fontWeight:400, color:'var(--c-muted)' }}>/{state.hpMax}</span>
          {temp > 0 && <span style={{ color:'#4A90D9', fontWeight:500, marginLeft:4 }}>+<Icon id="widget.armor" size={13} />{temp}</span>}
        </span>
      );
    }
    case 'inspiration':
      return editMode ? (
        <span className={`pin-content ${state.inspiration ? 'pin-on' : ''}`}><Icon id="game.inspiration" size={13} /> {t('pinned.inspiration', 'Inspiration')}</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.inspiration ? 'pin-on' : ''}`}
          onClick={() => onUpdate({ inspiration: !state.inspiration })}
        >
          <Icon id="game.inspiration" size={13} /> {state.inspiration ? t('pinned.inspirationOn', 'Inspired') : t('pinned.inspirationOff', 'No inspiration')}
        </button>
      );
    case 'concentration':
      return editMode ? (
        <span className={`pin-content ${state.concentrating ? 'pin-on pin-blue' : ''}`}><Icon id="game.concentration" size={13} /> {t('pinned.concentration', 'Concentration')}</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.concentrating ? 'pin-on pin-blue' : ''}`}
          onClick={() => onUpdate({ concentrating: !state.concentrating })}
        >
          <Icon id="game.concentration" size={13} /> {state.concentrating ? t('pinned.concentrationOn', 'Concentrating') : t('pinned.concentrationOff', 'No conc.')}
        </button>
      );
    case 'conditions': {
      const active = state.conditions || [];
      const exhLvl = state.exhaustionLevel || 0;
      const customConds = state.customConditions || [];
      const hasAny = active.length > 0 || exhLvl > 0;
      return (
        <span className="pin-content">
          <Icon id="widget.conditions" size={13} />{!hasAny
            ? <span className="pin-hint"> {t('pinned.none', 'None')}</span>
            : <>
                {active.map(cid => {
                  const name = cid.startsWith('custom_')
                    ? (customConds.find(c => c.id === cid)?.name ?? cid)
                    : t(`data.conditions.${cid}.name`, cid);
                  return <span key={cid} className="pin-cond">{name}</span>;
                })}
                {exhLvl > 0 && <span className="pin-cond"><Icon id="game.exhaustion" size={12} /> {t('pinned.exhaustionShort', 'Exh.')}{exhLvl}</span>}
              </>
          }
        </span>
      );
    }
    case 'deathSaves': {
      const succ = state.deathSuccess || [false, false, false];
      const fail = state.deathFail   || [false, false, false];
      return (
        <span className="pin-content pin-death">
          <span className="pin-death-label"><Icon id="widget.deathSaves" size={13} /></span>
          <span className="pin-death-group">
            {succ.map((on, i) => (
              <span key={i} className={`pin-pip success-pip ${on ? 'on' : ''}`}
                onClick={editMode ? undefined : () => { const c=[...succ]; c[i]=!c[i]; onUpdate({ deathSuccess:c }); }} />
            ))}
          </span>
          <span className="pin-death-sep">/</span>
          <span className="pin-death-group">
            {fail.map((on, i) => (
              <span key={i} className={`pin-pip failure-pip ${on ? 'on' : ''}`}
                onClick={editMode ? undefined : () => { const c=[...fail]; c[i]=!c[i]; onUpdate({ deathFail:c }); }} />
            ))}
          </span>
        </span>
      );
    }
    case 'dh-armor': {
      const slots = state.armorSlots ?? 0;
      const max = state.armorSlotsMax ?? 0;
      if (max === 0) return (
        <span className="pin-content pin-hint">
          <Icon id="widget.armor" size={13} /> {state.armorName || t('pinned.dhArmor', 'Armor')}
        </span>
      );
      return <DHPipRow icon={<Icon id="widget.armor" size={13} />} current={slots} max={max} pipClass="dh-armor-pin-pip" onUpdate={onUpdate} stateKey="armorSlots" editMode={editMode} />;
    }
    case 'dh-hope': {
      const cur = state.hope ?? 0;
      const max = state.hopeMax ?? 6;
      return <DHPipRow icon={<Icon id="game.hope" size={13} />} current={cur} max={max} pipClass="dh-hope-pin-pip" onUpdate={onUpdate} stateKey="hope" editMode={editMode} />;
    }
    case 'dh-fear': {
      const cur = state.fear ?? 0;
      const max = state.fearMax ?? 6;
      return <DHPipRow icon={<Icon id="game.fear" size={13} />} current={cur} max={max} pipClass="dh-fear-pin-pip" onUpdate={onUpdate} stateKey="fear" editMode={editMode} />;
    }
    default: return null;
  }
}
