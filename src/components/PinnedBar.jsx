import React from 'react';
import { CONDITIONS } from '../data/conditions';

const PINNABLE = [
  { id: 'hp',          label: 'HP' },
  { id: 'inspiration', label: 'Ispirazione' },
  { id: 'concentration', label: 'Concentrazione' },
  { id: 'conditions',  label: 'Condizioni' },
  { id: 'exhaustion',  label: 'Affaticamento' },
  { id: 'deathSaves',  label: 'TS Morte' },
];

const STORAGE_KEY = 'characterforge_pinned';

export function loadPinned() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(v)) return v;
  } catch {}
  return [];
}

export function savePinned(pinned) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned)); } catch {}
}

export default function PinnedBar({ state, editMode, pinned, onTogglePin, onUpdate }) {
  if (!editMode && pinned.length === 0) return null;

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
            title={editMode ? (isPinned ? 'Rimuovi pin' : 'Fissa in cima') : undefined}
          >
            {editMode && (
              <span className={`pin-toggle-icon ${isPinned ? 'on' : 'off'}`}>
                {isPinned ? '📌' : '📎'}
              </span>
            )}
            <PinContent id={item.id} state={state} onUpdate={onUpdate} active={isPinned || !editMode} editMode={editMode} />
          </div>
        );
      })}
    </div>
  );
}

function PinContent({ id, state, onUpdate, active, editMode }) {
  if (!active) {
    const labels = { hp:'HP', inspiration:'Ispirazione', concentration:'Concentrazione', conditions:'Condizioni', exhaustion:'Affaticamento', deathSaves:'TS Morte' };
    return <span className="pin-content-muted">{labels[id]}</span>;
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
        <span className={`pin-content ${state.inspiration ? 'pin-on' : ''}`}>⭐ Ispirazione</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.inspiration ? 'pin-on' : ''}`}
          onClick={() => onUpdate({ inspiration: !state.inspiration })}
        >
          ⭐ {state.inspiration ? 'Ispirazione' : 'No ispirazione'}
        </button>
      );
    case 'concentration':
      return editMode ? (
        <span className={`pin-content ${state.concentrating ? 'pin-on pin-blue' : ''}`}>🎯 Concentrazione</span>
      ) : (
        <button
          className={`pin-content pin-action ${state.concentrating ? 'pin-on pin-blue' : ''}`}
          onClick={() => onUpdate({ concentrating: !state.concentrating })}
        >
          🎯 {state.concentrating ? 'Concentrazione' : 'No conc.'}
        </button>
      );
    case 'conditions': {
      const active = state.conditions || [];
      const exhLvl = state.exhaustionLevel || 0;
      const hasAny = active.length > 0 || exhLvl > 0;
      return (
        <span className="pin-content">
          🔮{!hasAny
            ? <span className="pin-hint"> Nessuna</span>
            : <>
                {active.map(cid => {
                  const cond = CONDITIONS.find(c => c.id === cid);
                  return <span key={cid} className="pin-cond">{cond ? cond.name : cid}</span>;
                })}
                {exhLvl > 0 && <span className="pin-cond">😓 Aff.{exhLvl}</span>}
              </>
          }
        </span>
      );
    }
    case 'exhaustion': {
      const lvl = state.exhaustionLevel || 0;
      if (lvl === 0) return <span className="pin-content"><span className="pin-hint">😓 Nessun aff.</span></span>;
      return (
        <span className="pin-content pin-on"
          title={`Affaticamento liv. ${lvl}: −${lvl * 5} ft velocità`}>
          😓 Aff. {lvl} · −{lvl * 5}ft
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
    default: return null;
  }
}
