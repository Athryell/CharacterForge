import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharContext } from './CharContext';
import { getNotationMenu } from '../config/notationMenus';

const FIELD_GROUP = 'notation.group.customFields';

// Custom-system fields are per-character, so they can't live in a static menu.
// Labels are raw ids — t() passes unknown keys through unchanged.
function customFieldItems(customFields) {
  if (!customFields) return [];
  return Object.entries(customFields).flatMap(([id, val]) => {
    const items = [{
      label: id, desc: 'notation.desc.customField',
      insert: `[${id}]`, preview: `[${id}]`, group: FIELD_GROUP,
    }];
    if (val && typeof val === 'object') {
      items.push({
        label: `${id}.max`, desc: 'notation.desc.customFieldMax',
        insert: `[${id}.max]`, preview: `[${id}.max]`, group: FIELD_GROUP,
      });
    }
    return items;
  });
}

export default function NotationTextarea({ value, onChange, className, style, ...props }) {
  const { systemId, customFields } = useCharContext();
  const { t } = useTranslation();
  const [menu, setMenu] = useState(null);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef();

  const allItems = useMemo(() => [
    ...getNotationMenu(systemId).flatMap(g => g.items.map(item => ({ ...item, group: g.group }))),
    ...customFieldItems(customFields),
  ], [systemId, customFields]);

  function getQuery(text, cursorPos) {
    const before = text.slice(0, cursorPos);
    const match = before.match(/(?:^|[\s\n])\/([a-zA-Z0-9+]*)$/);
    return match ? match[1].toLowerCase() : null;
  }

  function handleInput(e) {
    onChange(e);
    const ta = ref.current;
    if (!ta) return;
    const query = getQuery(ta.value, ta.selectionStart);
    if (query !== null) {
      const filtered = query === ''
        ? allItems
        : allItems.filter(item =>
            t(item.label).toLowerCase().includes(query) ||
            item.preview.toLowerCase().includes(query)
          );
      if (filtered.length > 0) {
        const rect = ta.getBoundingClientRect();
        setMenu({
          pos: { top: rect.bottom + 4, left: rect.left, width: Math.max(260, rect.width) },
          query,
          items: filtered,
        });
      } else {
        setMenu(null);
      }
    } else {
      setMenu(null);
    }
  }

  function insertItem(item) {
    const ta = ref.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const text = ta.value;
    const before = text.slice(0, pos);
    const actualSlash = before.lastIndexOf('/');
    if (actualSlash === -1) return;
    const next = text.slice(0, actualSlash) + item.insert + text.slice(pos);
    onChange({ target: { value: next } });
    setMenu(null);
    setTimeout(() => {
      const newPos = actualSlash + item.insert.length;
      ta.selectionStart = ta.selectionEnd = newPos;
      ta.focus();
    }, 0);
  }

  useEffect(() => { setHighlighted(0); }, [menu?.query]);

  function handleKeyDown(e) {
    if (!menu) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, menu.items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertItem(menu.items[highlighted]); }
    else if (e.key === 'Escape') { setMenu(null); }
  }

  useEffect(() => {
    if (!menu) return;
    function onDown(e) {
      if (!e.target.closest('.notation-slash-menu')) setMenu(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menu]);

  function renderMenu() {
    const rows = [];
    let lastGroup = null;
    menu.items.forEach((item, idx) => {
      if (item.group !== lastGroup) {
        rows.push({ type: 'header', label: item.group, key: `h-${item.group}` });
        lastGroup = item.group;
      }
      rows.push({ type: 'item', item, idx, key: `i-${idx}` });
    });
    return rows;
  }

  return (
    <>
      <textarea
        ref={ref}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setMenu(null), 150)}
        className={className}
        style={style}
        {...props}
      />
      <p className="notation-slash-hint">💡 {t('notation.slashHint')}</p>
      {menu && (
        <div className="notation-slash-menu" style={{
          position: 'fixed',
          top: menu.pos.top,
          left: menu.pos.left,
          width: menu.pos.width,
          zIndex: 9000,
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {renderMenu().map(row => {
            if (row.type === 'header') return (
              <div key={row.key} className="notation-menu-group">{t(row.label)}</div>
            );
            const { item, idx } = row;
            return (
              <button key={row.key}
                className={`notation-menu-item${idx === highlighted ? ' highlighted' : ''}`}
                onMouseDown={e => { e.preventDefault(); insertItem(item); }}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <span className="notation-menu-preview">{item.preview}</span>
                <span className="notation-menu-label">{t(item.label)}</span>
                <span className="notation-menu-desc">{t(item.desc)}</span>
              </button>
            );
          })}
          {menu.query && (
            <div className="notation-menu-hint">
              ↑↓ navigate · Enter insert · Esc close
            </div>
          )}
        </div>
      )}
    </>
  );
}
