import React, { useState, useRef, useEffect } from 'react';
import { BONUS_STAT_OPTIONS } from '../data/bonuses';

export default function BonusTextarea({ value, onChange, className, style, ...props }) {
  const [menuPos, setMenuPos] = useState(null);
  const ref = useRef();

  function handleKeyUp() {
    const ta = ref.current;
    if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart);
    if (/@[^\]]*$/.test(before)) {
      const rect = ta.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    } else {
      setMenuPos(null);
    }
  }

  function insertStat(statValue) {
    const ta = ref.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const text = ta.value;
    const atIdx = text.lastIndexOf('@', pos - 1);
    if (atIdx === -1) return;
    const next = text.slice(0, atIdx) + `@[${statValue}]` + text.slice(pos);
    onChange({ target: { value: next } });
    setMenuPos(null);
    setTimeout(() => {
      const newPos = atIdx + statValue.length + 3;
      ta.selectionStart = ta.selectionEnd = newPos;
      ta.focus();
    }, 0);
  }

  useEffect(() => {
    if (!menuPos) return;
    function onDown(e) {
      if (!e.target.closest('.bonus-at-menu')) setMenuPos(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuPos]);

  return (
    <>
      <textarea ref={ref} value={value} onChange={onChange}
        onKeyUp={handleKeyUp}
        onBlur={() => setTimeout(() => setMenuPos(null), 150)}
        className={className} style={style} {...props} />
      {menuPos && (
        <div className="bonus-at-menu"
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9000 }}>
          {BONUS_STAT_OPTIONS.map(o => (
            <button key={o.value} className="bonus-at-item"
              onMouseDown={e => { e.preventDefault(); insertStat(o.value); }}>
              {o.label}
              <span className="bonus-at-key">@[{o.value}]</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
