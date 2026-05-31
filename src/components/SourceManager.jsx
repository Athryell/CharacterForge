import React, { useState, useRef } from 'react';
import dataManager from '../data/dataManager';

function countLabel(counts) {
  const parts = [];
  if (counts.classes)     parts.push(`${counts.classes} classi`);
  if (counts.species)     parts.push(`${counts.species} specie`);
  if (counts.backgrounds) parts.push(`${counts.backgrounds} background`);
  if (counts.spells)      parts.push(`${counts.spells} incantesimi`);
  if (counts.weapons)     parts.push(`${counts.weapons} armi`);
  if (counts.items)       parts.push(`${counts.items} oggetti`);
  if (counts.conditions)  parts.push(`${counts.conditions} condizioni`);
  return parts.join(', ') || 'nessuna entità';
}

export default function SourceManager({ onHomebrewChange }) {
  const [sources, setSources] = useState(() => dataManager.getSources());
  const [importStatus, setImportStatus] = useState(null); // null | {ok, errors, counts, name}
  const [pending, setPending] = useState(null); // json da confermare
  const fileRef = useRef();

  function refresh() {
    setSources(dataManager.getSources());
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
    const schema = dataManager.exportSchema();
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'homebrew-schema.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function exportAllHomebrew() {
    const all = dataManager.exportAllHomebrew();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'homebrew-export.json'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="source-manager">
      {/* Bottoni azione */}
      <div className="source-actions">
        <button className="io-btn primary" onClick={() => fileRef.current?.click()}>
          ⬆ Importa pacchetto
        </button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        <button className="io-btn" onClick={exportSchema}>⬇ Schema vuoto</button>
        {sources.filter(s => s.type === 'homebrew').length > 0 && (
          <button className="io-btn" onClick={exportAllHomebrew}>⬇ Esporta homebrew</button>
        )}
      </div>

      {/* Anteprima import in attesa di conferma */}
      {pending && (
        <div className="source-confirm-panel">
          <div className="source-confirm-title">Conferma importazione</div>
          <div className="source-confirm-info">
            <strong>{pending.name || pending.id}</strong>
            {pending.author && <span> · {pending.author}</span>}
          </div>
          {pending.description && (
            <div className="source-confirm-desc">{pending.description}</div>
          )}
          <div className="source-confirm-counts">
            {countLabel({
              classes: (pending.classes||[]).length,
              species: (pending.species||[]).length,
              backgrounds: (pending.backgrounds||[]).length,
              spells: (pending.spells||[]).length,
              weapons: (pending.weapons||[]).length,
              items: (pending.items||[]).length,
              conditions: (pending.conditions||[]).length,
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="io-btn primary" onClick={confirmImport}>✓ Importa</button>
            <button className="io-btn" onClick={() => setPending(null)}>Annulla</button>
          </div>
        </div>
      )}

      {/* Feedback import */}
      {importStatus && (
        <div className={`source-status ${importStatus.ok ? 'ok' : 'err'}`}>
          {importStatus.ok
            ? `✓ "${importStatus.name}" importato — ${countLabel(importStatus.counts || {})}.`
            : importStatus.errors.map((e, i) => <div key={i}>✕ {e}</div>)
          }
        </div>
      )}

      {/* Lista sorgenti */}
      <div className="source-list">
        {sources.map(src => (
          <div key={src.id} className="source-item">
            <div className="source-item-header">
              <span className={`source-badge ${src.type}`}>
                {src.type === 'srd' ? 'SRD' : 'Homebrew'}
              </span>
              <span className="source-name">{src.name}</span>
              {src.author && <span className="source-author">— {src.author}</span>}
              {src.type === 'homebrew' && (
                <button
                  className="io-btn danger"
                  style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 11 }}
                  onClick={() => removeSource(src.id)}
                >
                  ✕ Rimuovi
                </button>
              )}
            </div>
            <div className="source-counts">{countLabel(src.counts || {})}</div>
            {src.description && (
              <div className="source-desc">{src.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
