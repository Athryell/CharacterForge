import React from 'react';
import { useTranslation } from 'react-i18next';

const PINNABLE_DND = [
  { id: 'hp',            labelKey: 'pinned.hp' },
  { id: 'inspiration',   labelKey: 'pinned.inspiration' },
  { id: 'concentration', labelKey: 'pinned.concentration' },
  { id: 'conditions',    labelKey: 'pinned.conditions' },
  { id: 'exhaustion',    labelKey: 'pinned.exhaustion' },
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

export default function PinnedBar({ state, editMode, pinned, onTogglePin, onUpdate, system }) {
  const { t } = useTranslation();
  if (!editMode && pinned.length === 0) return null;

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
    </div>
  );
}

function DHPipRow({ emoji, current, max, pipClass, onUpdate, stateKey, editMode }) {
  return (
    <span className="pin-content pin-dh-pips">
      <span className="pin-dh-emoji">{emoji}</span>
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
          ❤ {state.hpCurrent}<span style={{ fontWeight:400, color:'var(--c-muted)' }}>/{state.hpMax}</span>
          {temp > 0 && <span style={{ color:'#4A90D9', fontWeight:500, marginLeft:4 }}>+🛡{temp}</span>}
        </span>
      );
    }
    case 'inspiration':
      return editMode ? (
        <span className={`pin-content ${state.inspiration ? 'pin-on' : ''}`}>⭐ {t('pinned.inspiration', 'Inspiration')}</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.inspiration ? 'pin-on' : ''}`}
          onClick={() => onUpdate({ inspiration: !state.inspiration })}
        >
          ⭐ {state.inspiration ? t('pinned.inspirationOn', 'Inspired') : t('pinned.inspirationOff', 'No inspiration')}
        </button>
      );
    case 'concentration':
      return editMode ? (
        <span className={`pin-content ${state.concentrating ? 'pin-on pin-blue' : ''}`}>🎯 {t('pinned.concentration', 'Concentration')}</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.concentrating ? 'pin-on pin-blue' : ''}`}
          onClick={() => onUpdate({ concentrating: !state.concentrating })}
        >
          🎯 {state.concentrating ? t('pinned.concentrationOn', 'Concentrating') : t('pinned.concentrationOff', 'No conc.')}
        </button>
      );
    case 'conditions': {
      const active = state.conditions || [];
      const exhLvl = state.exhaustionLevel || 0;
      const hasAny = active.length > 0 || exhLvl > 0;
      return (
        <span className="pin-content">
          🔮{!hasAny
            ? <span className="pin-hint"> {t('pinned.none', 'None')}</span>
            : <>
                {active.map(cid => (
                  <span key={cid} className="pin-cond">{t(`data.conditions.${cid}.name`, cid)}</span>
                ))}
                {exhLvl > 0 && <span className="pin-cond">😓 {t('pinned.exhaustionShort', 'Exh.')}{exhLvl}</span>}
              </>
          }
        </span>
      );
    }
    case 'exhaustion': {
      const lvl = state.exhaustionLevel || 0;
      if (lvl === 0) return <span className="pin-content"><span className="pin-hint">😓 {t('pinned.noExhaustion', 'No exhaustion')}</span></span>;
      return (
        <span className="pin-content pin-on"
          title={`${t('pinned.exhaustionLevel', 'Exhaustion level')} ${lvl}: −${lvl * 5} ft`}>
          😓 {t('pinned.exhaustionShort', 'Exh.')} {lvl} · −{lvl * 5}ft
        </span>
      );
    }
    case 'deathSaves': {
      const succ = state.deathSuccess || [false, false, false];
      const fail = state.deathFail   || [false, false, false];
      return (
        <span className="pin-content pin-death">
          <span className="pin-death-label">💀</span>
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
          🛡 {state.armorName || t('pinned.dhArmor', 'Armor')}
        </span>
      );
      return <DHPipRow emoji="🛡" current={slots} max={max} pipClass="dh-armor-pin-pip" onUpdate={onUpdate} stateKey="armorSlots" editMode={editMode} />;
    }
    case 'dh-hope': {
      const cur = state.hope ?? 0;
      const max = state.hopeMax ?? 6;
      return <DHPipRow emoji="⭐" current={cur} max={max} pipClass="dh-hope-pin-pip" onUpdate={onUpdate} stateKey="hope" editMode={editMode} />;
    }
    case 'dh-fear': {
      const cur = state.fear ?? 0;
      const max = state.fearMax ?? 6;
      return <DHPipRow emoji="💀" current={cur} max={max} pipClass="dh-fear-pin-pip" onUpdate={onUpdate} stateKey="fear" editMode={editMode} />;
    }
    default: return null;
  }
}
