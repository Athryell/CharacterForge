import React from 'react';
import { createPortal } from 'react-dom';
import { getIconMap, useIconMode } from '../../config/icons';

// Small presentational pieces shared by every system's sheet.
// Lifted out of App.jsx unchanged.

export function rollDice(notation) {
  const clean = notation.replace(/\s/g, '').replace(/\+-/g, '-').replace(/--/g, '+');
  const diceMatch = clean.match(/(\d+)d(\d+)/i);
  if (!diceMatch) return null;
  let total = 0;
  const count = parseInt(diceMatch[1]);
  const sides = parseInt(diceMatch[2]);
  let firstRoll = null;
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    if (i === 0) firstRoll = roll;
    total += roll;
  }
  const afterDice = clean.slice(diceMatch.index + diceMatch[0].length);
  for (const m of afterDice.matchAll(/([+-]\d+)/g))
    total += parseInt(m[1]);
  return { total, natural: count === 1 ? firstRoll : null, sides };
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Toast({ message, action }) {
  const [shown, setShown] = React.useState(false);
  const [display, setDisplay] = React.useState(null);
  const hideTimer = React.useRef();

  React.useEffect(() => {
    if (message) {
      clearTimeout(hideTimer.current);
      setDisplay({ message, action });
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    hideTimer.current = setTimeout(() => setDisplay(null), 200);
    return () => clearTimeout(hideTimer.current);
  }, [message, action]);

  if (!display) return null;
  return createPortal(
    <div className={`toast${shown ? ' show' : ''}`}>
      <span>{display.message}</span>
      {display.action && <button className="toast-action-btn" onClick={display.action.onClick}>{display.action.label}</button>}
    </div>,
    document.body
  );
}

export function HPBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const color = pct > 50 ? '#3B6D11' : pct > 25 ? '#854F0B' : '#A32D2D';
  return (
    <div className="hp-bar-wrap">
      <div className="hp-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function HMenuGroup({ label, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="hmenu-group">
      <button className="hmenu-group-btn" onClick={() => setOpen(v => !v)}>
        <span>{label}</span>
        <span className="hmenu-group-caret">{open ? '▾' : '›'}</span>
      </button>
      {open && <div className="hmenu-group-body">{children}</div>}
    </div>
  );
}

export const DICE_ICONS = ['d4','d6','d8','d10','d12','d20'];

export function ResourceIcon({ icon, size = 16 }) {
  const { iconMode } = useIconMode();
  if (DICE_ICONS.includes(icon)) {
    return <span className="resource-dice-icon">{icon}</span>;
  }
  const entry = getIconMap()[`resource.${icon}`];
  if (!entry) return null;
  if (iconMode === 'none') return null;
  if (iconMode === 'lucide' && entry.lucide) {
    const L = entry.lucide;
    return <L size={size} />;
  }
  return <span>{entry.emoji}</span>;
}
