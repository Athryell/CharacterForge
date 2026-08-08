import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WidgetShell from './WidgetShell';

// Placeholder shown in edit mode for empty drop zones
function DropPlaceholder({ label, onDragOver, onDrop }) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`widget-placeholder ${over ? 'over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); onDragOver && onDragOver(e); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop && onDrop(e); }}
    >
      {label}
    </div>
  );
}

// Thin line shown between widgets as insertion target
function InsertLine({ active }) {
  return <div className={`widget-insert-line ${active ? 'active' : ''}`} />;
}

// Drop zone wrapper — MUST be defined outside WidgetGrid to avoid remount on every render
function LineZone({ zoneKey, children, insertKey, dragId, onHover, onCommitDrop }) {
  const active = insertKey === zoneKey && dragId;
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); onHover(zoneKey); }}
      onDrop={e    => { e.preventDefault(); e.stopPropagation(); onCommitDrop(zoneKey); }}
    >
      <InsertLine active={!!active} />
      {children}
    </div>
  );
}

export default function WidgetGrid({
  widgets, editMode, onLayoutChange, renderWidget,
  hiddenWidgets = [], onRestoreWidget,
  systemId, tabs = [],
  extraShellProps = {},
}) {
  const { t } = useTranslation();
  const [dragId,      setDragId]      = useState(null);
  const [insertKey,   setInsertKey]   = useState(null);
  // insertKey format:
  //   'full:N'    — before full-width widget at index N in fullWidgets
  //   'full:end'  — after all full-width widgets
  //   'col:C:N'   — before half-width widget at index N in column C
  //   'col:C:end' — after all half-width widgets in column C

  // ── partitions ───────────────────────────────────────────────
  const topFull    = widgets.filter(w =>  w.fullWidth && !w.bottomFull).sort((a,b) => a.order - b.order);
  const bottomFull = widgets.filter(w =>  w.fullWidth &&  w.bottomFull).sort((a,b) => a.order - b.order);
  const fullWidgets = [...topFull, ...bottomFull]; // used for existing drag order logic
  const col0        = widgets.filter(w => !w.fullWidth && w.col === 0).sort((a,b) => a.order - b.order);
  const col1        = widgets.filter(w => !w.fullWidth && w.col === 1).sort((a,b) => a.order - b.order);

  // ── drag helpers ──────────────────────────────────────────────
  function startDrag(id)  { setDragId(id); }
  function endDrag()      { setDragId(null); setInsertKey(null); }

  function hover(key) {
    if (!dragId) return;
    setInsertKey(key);
  }

  function commitDrop(key) {
    if (!dragId || !key) { endDrag(); return; }

    const next = widgets.map(w => ({ ...w })); // clone
    const src  = next.find(w => w.id === dragId);
    if (!src) { endDrag(); return; }

    const [zone, ...rest] = key.split(':');

    if (zone === 'full') {
      // Drop into full-width zone → make dragged widget full-width
      src.fullWidth = true;
      const refIdx  = rest[0] === 'end' ? fullWidgets.length : parseInt(rest[0]);
      // Assign order: insert before refIdx in full list (excluding src)
      const others  = fullWidgets.filter(w => w.id !== dragId);
      others.splice(refIdx, 0, src);
      others.forEach((w, i) => { const item = next.find(x => x.id === w.id); if (item) item.order = i; });
      // Reset order for half-width columns
      reorderCol(next, 0); reorderCol(next, 1);

    } else {
      // Drop into column zone → make dragged widget half-width
      const col    = parseInt(rest[0]);
      const refIdx = rest[1] === 'end' ? Infinity : parseInt(rest[1]);
      src.fullWidth = false;
      src.col       = col;
      const colList = (col === 0 ? col0 : col1).filter(w => w.id !== dragId);
      const insertAt = Math.min(refIdx, colList.length);
      colList.splice(insertAt, 0, src);
      colList.forEach((w, i) => { const item = next.find(x => x.id === w.id); if (item) item.order = i; });
      reorderCol(next, col === 0 ? 1 : 0);
      // Also reorder full-width
      fullWidgets.filter(w => w.id !== dragId).forEach((w, i) => { const item = next.find(x => x.id === w.id); if (item) item.order = i; });
    }

    onLayoutChange(next);
    endDrag();
  }

  function reorderCol(arr, col) {
    let i = 0;
    arr.filter(w => !w.fullWidth && w.col === col).sort((a,b) => a.order - b.order).forEach(w => { w.order = i++; });
  }

  // ── shell props factory ───────────────────────────────────────
  function shellProps(w) {
    return {
      id: w.id, fullWidth: w.fullWidth, editMode,
      onDragStart: startDrag,
      onDragOver: () => {},  // handled by InsertLine areas
      onDrop: () => {},
      onMoveToTab:      (id, tab)  => onLayoutChange(null, { type: 'moveTab', widgetId: id, tabId: tab }),
      onToggleVisible:  (id)       => onLayoutChange(null, { type: 'hide', widgetId: id }),
      onToggleFullWidth:(id)       => {
        const next = widgets.map(w => w.id === id ? { ...w, fullWidth: !w.fullWidth, col: 0, bottomFull: false } : w);
        onLayoutChange(next);
      },
      onToggleBottomFull:(id)      => {
        const next = widgets.map(w => w.id === id ? { ...w, bottomFull: !w.bottomFull } : w);
        onLayoutChange(next);
      },
      bottomFull: w.bottomFull || false,
      isDragOver: false,
      systemId,
      tabs,
      ...extraShellProps,
    };
  }

  const lzProps = { insertKey, dragId, onHover: hover, onCommitDrop: commitDrop };

  return (
    <div onDragEnd={endDrag}>

      {/* ── TOP FULL-WIDTH SECTION ── */}
      <div className="widget-full-section">
        {editMode && (
          <DropPlaceholder
            label={t('layout.dragHereFull')}
            onDragOver={() => hover('full:0')}
            onDrop={() => commitDrop('full:0')}
          />
        )}

        {topFull.map((w, i) => (
          <LineZone key={w.id} zoneKey={`full:${i}`} {...lzProps}>
            <WidgetShell {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
          </LineZone>
        ))}

        {editMode && topFull.length > 0 && (
          <div
            onDragOver={e => { e.preventDefault(); hover('full:end'); }}
            onDrop={e  => { e.preventDefault(); commitDrop('full:end'); }}
          >
            <InsertLine active={insertKey === 'full:end' && !!dragId} />
          </div>
        )}
      </div>

      {/* ── TWO-COLUMN SECTION ── */}
      {(col0.length > 0 || col1.length > 0 || editMode) && (
        <div className="widget-grid">

          {/* Column 0 */}
          <div className="widget-col">
            {editMode && col0.length === 0 && (
              <DropPlaceholder
                label={t('layout.dragHereLeft')}
                onDragOver={() => hover('col:0:0')}
                onDrop={() => commitDrop('col:0:0')}
              />
            )}
            {col0.map((w, i) => (
              <LineZone key={w.id} zoneKey={`col:0:${i}`} {...lzProps}>
                <WidgetShell {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
              </LineZone>
            ))}
            {editMode && col0.length > 0 && (
              <div
                onDragOver={e => { e.preventDefault(); hover('col:0:end'); }}
                onDrop={e  => { e.preventDefault(); commitDrop('col:0:end'); }}
              >
                <InsertLine active={insertKey === 'col:0:end' && !!dragId} />
                <div className="widget-col-drop-tail" />
              </div>
            )}
          </div>

          {/* Column 1 */}
          <div className="widget-col">
            {editMode && col1.length === 0 && (
              <DropPlaceholder
                label={t('layout.dragHereRight')}
                onDragOver={() => hover('col:1:0')}
                onDrop={() => commitDrop('col:1:0')}
              />
            )}
            {col1.map((w, i) => (
              <LineZone key={w.id} zoneKey={`col:1:${i}`} {...lzProps}>
                <WidgetShell {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
              </LineZone>
            ))}
            {editMode && col1.length > 0 && (
              <div
                onDragOver={e => { e.preventDefault(); hover('col:1:end'); }}
                onDrop={e  => { e.preventDefault(); commitDrop('col:1:end'); }}
              >
                <InsertLine active={insertKey === 'col:1:end' && !!dragId} />
                <div className="widget-col-drop-tail" />
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── BOTTOM FULL-WIDTH SECTION ── */}
      {(bottomFull.length > 0 || editMode) && (
        <div className="widget-full-section widget-bottom-full">
          {editMode && (
            <DropPlaceholder
              label={t('layout.dragHereFull')}
              onDragOver={() => hover('full:end')}
              onDrop={() => commitDrop('full:end')}
            />
          )}
          {bottomFull.map((w, i) => (
            <LineZone key={w.id} zoneKey={`bfull:${i}`} {...lzProps}>
              <WidgetShell {...shellProps(w)}>{renderWidget(w.id)}</WidgetShell>
            </LineZone>
          ))}
        </div>
      )}

      {/* ── HIDDEN WIDGETS RESTORE ── */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="widget-hidden-panel">
          <div className="widget-hidden-title">{t('layout.hiddenWidgets')}</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {hiddenWidgets.map(w => (
              <button key={w.id} className="filter-chip" onClick={() => onRestoreWidget(w.id)}>
                {t('layout.restore', { label: t(w.label) })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
