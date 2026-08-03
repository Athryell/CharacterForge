import React, { useState, useRef } from 'react';
import { DEFAULT_SYSTEM } from '../systems/registry';
import { useTranslation } from 'react-i18next';
import dataManager from '../data/dataManager';
import { Icon } from '../config/icons';
import HomebrewEditor from './HomebrewEditor';

const DRAFT_KEY = 'characterforge_homebrew_draft';

function checkDraftHasContent() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (draft.name) return true;
    return ['classes','subclasses','species','backgrounds','spells','weapons','armors','items','conditions','feats']
      .some(k => (draft[k] || []).length > 0);
  } catch { return false; }
}

const COUNT_KEYS = [
  'classes', 'subclasses', 'ancestries', 'communities', 'species', 'backgrounds',
  'spells', 'weapons', 'armors', 'items', 'conditions', 'feats',
];

function countLabel(counts, t) {
  const parts = COUNT_KEYS
    .filter(k => counts[k])
    .map(k => `${counts[k]} ${t(`sources.entities.${k}`, { count: counts[k] })}`);
  return parts.join(', ') || t('sources.entities.none');
}

function ExportSourcesModal({ sources, onClose, t }) {
  const [selected, setSelected] = useState(() => new Set(sources.map(s => s.id)));
  const allSelected = selected.size === sources.length;

  function exportSelected() {
    const toExport = sources.filter(s => selected.has(s.id));
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'homebrew-export.json'; a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  function exportSeparate() {
    sources
      .filter(s => selected.has(s.id))
      .forEach(src => {
        const blob = new Blob([JSON.stringify(src, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${src.id}.json`; a.click();
        URL.revokeObjectURL(url);
      });
    onClose();
  }

  return (
    <div className="creator-overlay" onClick={onClose}>
      <div className="creator-modal" style={{ maxWidth: 400, padding: 20 }} onClick={e => e.stopPropagation()}>
        <div className="card-title">{t('sources.exportData')}</div>
        <button
          className="io-btn"
          style={{ fontSize: '0.8rem', marginBottom: 12 }}
          onClick={() => setSelected(allSelected ? new Set() : new Set(sources.map(s => s.id)))}
        >
          {allSelected ? t('sources.deselectAll') : t('sources.selectAll')}
        </button>
        {sources.map(src => (
          <label key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={selected.has(src.id)}
              onChange={e => {
                const next = new Set(selected);
                if (e.target.checked) next.add(src.id); else next.delete(src.id);
                setSelected(next);
              }}
            />
            <span>{src.name}</span>
          </label>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="io-btn primary" onClick={exportSelected} disabled={selected.size === 0}>
            <Icon id="action.download" size={13} /> {t('sources.exportSelected')}
          </button>
          <button className="io-btn" onClick={exportSeparate} disabled={selected.size === 0}>
            {t('sources.exportSeparate')}
          </button>
          <button className="io-btn" onClick={onClose} style={{ marginLeft: 'auto' }}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SourceManager({ onHomebrewChange }) {
  const { t } = useTranslation();
  const [sources, setSources] = useState(() => dataManager.getSources());
  const [importStatus, setImportStatus] = useState(null);
  const [pending, setPending] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [draftHasContent, setDraftHasContent] = useState(checkDraftHasContent);
  const fileRef = useRef();

  function refresh() {
    setSources(dataManager.getSources());
    setDraftHasContent(checkDraftHasContent());
    onHomebrewChange?.();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        setPending(json);
        setImportStatus(null);
      } catch {
        setImportStatus({ ok: false, errors: ['Il file non è JSON valido.'], name: file.name });
        setPending(null);
      }
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!pending) return;
    const result = dataManager.addSource(pending);
    if (result.ok) {
      setImportStatus({ ok: true, errors: [], counts: result.counts, name: pending.name });
      window.umami?.track('homebrew-imported', { name: pending.name });
      refresh();
    } else {
      setImportStatus({ ok: false, errors: result.errors, name: pending.name });
    }
    setPending(null);
  }

  function removeSource(id) {
    dataManager.removeSource(id);
    refresh();
    setImportStatus(null);
  }

  function exportSchema() {
    const schema = dataManager.exportSchema(draft?.system);
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'homebrew-schema.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function openEditor() {
    setEditingSource(null);
    setEditorOpen(true);
  }

  function editSource(src) {
    setEditingSource(src);
    setEditorOpen(true);
  }

  const homebrewSources = sources.filter(s => s.type === 'homebrew');

  return (
    <div className="source-manager">
      {/* Action buttons */}
      <div className="source-actions">
        <button className="io-btn primary highlighted" onClick={openEditor}>
          <Icon id="action.add" size={14} /> {t('sources.addData')}
        </button>
        <button className="io-btn" onClick={() => fileRef.current?.click()}>
          <Icon id="action.upload" size={14} /> {t('sources.importPackage')}
        </button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        <button className="io-btn" onClick={exportSchema}>
          <Icon id="action.download" size={14} /> {t('sources.emptyTemplate')}
        </button>
        {homebrewSources.length > 0 && (
          <button className="io-btn" onClick={() => setExportModalOpen(true)}>
            <Icon id="action.download" size={14} /> {t('sources.exportData')}
          </button>
        )}
      </div>

      {/* Draft notice */}
      {draftHasContent && (
        <div className="source-draft-notice">
          📝 {t('sources.draftNotice')} —{' '}
          <button onClick={openEditor}>{t('sources.openDraft')}</button>
        </div>
      )}

      {/* Import confirm */}
      {pending && (
        <div className="source-confirm-panel">
          <div className="source-confirm-title">Conferma importazione</div>
          <div className="source-confirm-info">
            <strong>{pending.name || pending.id}</strong>
            {pending.author && <span> · {pending.author}</span>}
            <span className="source-badge system" style={{ marginLeft: 6 }}>
              {t(`system.${pending.system || DEFAULT_SYSTEM}`, pending.system || DEFAULT_SYSTEM)}
            </span>
          </div>
          {pending.description && (
            <div className="source-confirm-desc">{pending.description}</div>
          )}
          <div className="source-confirm-counts">
            {countLabel({
              classes:     (pending.classes     || []).length,
              subclasses:  (pending.subclasses  || []).length,
              species:     (pending.species     || []).length,
              backgrounds: (pending.backgrounds || []).length,
              spells:      (pending.spells      || []).length,
              weapons:     (pending.weapons     || []).length,
              armors:      (pending.armors      || []).length,
              items:       (pending.items       || []).length,
              conditions:  (pending.conditions  || []).length,
              feats:       (pending.feats       || []).length,
            }, t)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="io-btn primary" onClick={confirmImport}>
              <Icon id="action.done" size={13} /> Importa
            </button>
            <button className="io-btn" onClick={() => setPending(null)}>Annulla</button>
          </div>
        </div>
      )}

      {/* Import feedback */}
      {importStatus && (
        <div className={`source-status ${importStatus.ok ? 'ok' : 'err'}`}>
          {importStatus.ok
            ? `✓ "${importStatus.name}" importato — ${countLabel(importStatus.counts || {}, t)}.`
            : importStatus.errors.map((e, i) => <div key={i}><Icon id="action.remove" size={13} /> {e}</div>)
          }
        </div>
      )}

      {/* Source list */}
      <div className="source-list">
        {sources.map(src => (
          <div key={src.id} className="source-item">
            <div className="source-item-header">
              <span className={`source-badge ${src.type}`}>
                {src.type === 'srd' ? 'SRD' : 'Homebrew'}
              </span>
              <span className="source-badge system">
                {t(`system.${src.system || DEFAULT_SYSTEM}`, src.system || DEFAULT_SYSTEM)}
              </span>
              <span className="source-name">{src.name}</span>
              {src.author && <span className="source-author">— {src.author}</span>}
              {src.type === 'homebrew' && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  <button
                    className="io-btn"
                    style={{ padding: '2px 8px', fontSize: '0.733rem' }}
                    onClick={() => editSource(src)}
                  >
                    <Icon id="action.edit" size={12} /> {t('sources.editSource')}
                  </button>
                  <button
                    className="io-btn danger"
                    style={{ padding: '2px 8px', fontSize: '0.733rem' }}
                    onClick={() => removeSource(src.id)}
                  >
                    <Icon id="action.remove" size={13} /> Rimuovi
                  </button>
                </div>
              )}
            </div>
            <div className="source-counts">{countLabel(src.counts || {}, t)}</div>
            {src.description && <div className="source-desc">{src.description}</div>}
          </div>
        ))}
      </div>

      {/* Homebrew editor */}
      <HomebrewEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingSource(null);
          setDraftHasContent(checkDraftHasContent());
        }}
        onPublish={refresh}
        initialDraft={editingSource}
      />

      {/* Export modal */}
      {exportModalOpen && (
        <ExportSourcesModal
          sources={homebrewSources}
          onClose={() => setExportModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}
