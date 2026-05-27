import React from 'react';

const CLASS_ICON = {
  Barbaro:'⚔', Bardo:'🎵', Chierico:'✝', Druido:'🌿', Guerriero:'🛡',
  Ladro:'🗡', Mago:'📖', Monaco:'👊', Paladino:'⚔', Ranger:'🏹',
  Stregone:'✨', Warlock:'👁',
};

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }); }
  catch { return ''; }
}

export default function CharacterSelect({ chars, onSelect, onCreate, onDelete }) {
  return (
    <div className="char-select-overlay">
      <div className="char-select-modal">
        <div className="char-select-header">
          <div className="char-select-title">⚔ CharacterForge</div>
          <div className="char-select-sub">Scegli un personaggio o creane uno nuovo</div>
        </div>

        <div className="char-select-list">
          {chars.length === 0 && (
            <div className="char-select-empty">Nessun personaggio salvato. Creane uno nuovo!</div>
          )}
          {chars.map(c => (
            <div key={c.id} className="char-select-item" onClick={() => onSelect(c.id)}>
              <div className="char-select-icon">{CLASS_ICON[c.charClass] || '🧙'}</div>
              <div className="char-select-info">
                <div className="char-select-name">{c.name || 'Senza nome'}</div>
                <div className="char-select-meta">
                  {c.charClass && <span>{c.charClass}</span>}
                  {c.charLevel > 1 && <span>· Livello {c.charLevel}</span>}
                  {c.lastSaved && <span className="char-select-date">· {fmtDate(c.lastSaved)}</span>}
                </div>
              </div>
              <button
                className="equip-remove"
                style={{ marginLeft: 'auto', flexShrink: 0 }}
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm(`Eliminare "${c.name || 'questo personaggio'}"? L'azione è irreversibile.`)) {
                    onDelete(c.id);
                  }
                }}
                title="Elimina personaggio"
              >🗑</button>
            </div>
          ))}
        </div>

        <div className="char-select-footer">
          <button className="io-btn primary" style={{ width: '100%' }} onClick={onCreate}>
            + Crea nuovo personaggio
          </button>
        </div>
      </div>
    </div>
  );
}
