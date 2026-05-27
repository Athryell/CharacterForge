import React, { useState } from 'react';
import { ARMOR_PRESETS, TYPE_LABEL, calcArmorAC } from '../data/armors';

export default function ArmorManager({ equippedArmor, hasShield, desMod, onEquip, onToggleShield, proficiency = '', onUpdateProficiency }) {
  const [showPanel, setShowPanel] = useState(false);

  const baseAC = calcArmorAC(equippedArmor, desMod);
  const totalAC = baseAC + (hasShield ? 2 : 0);

  const byType = { light: [], medium: [], heavy: [] };
  ARMOR_PRESETS.forEach(a => byType[a.type].push(a));

  return (
    <div className="armor-section">
      <div className="armor-header">
        <span className="armor-title">🛡 Armatura</span>
        <div className="armor-stats">
          <span className="armor-ac-badge">CA {totalAC}</span>
          <button
            className={`armor-shield-btn ${hasShield ? 'active' : ''}`}
            onClick={onToggleShield}
            title="Scudo (+2 CA)"
          >
            🛡 Scudo {hasShield ? '✓' : '+2'}
          </button>
        </div>
      </div>

      <div className="proficiency-field">
        <span className="proficiency-label">Competenza:</span>
        <input className="proficiency-input" value={proficiency}
          onChange={e => onUpdateProficiency && onUpdateProficiency(e.target.value)}
          placeholder="Es. Armature leggere, medie, pesanti, scudi..." />
      </div>
      <div className="armor-equipped">
        {equippedArmor ? (
          <div className="armor-equipped-info">
            <span className="armor-name">{equippedArmor.name}</span>
            <span className="armor-type-badge">{TYPE_LABEL[equippedArmor.type]}</span>
            <span className="armor-ac-detail">CA {baseAC}</span>
            <button className="equip-remove" onClick={() => onEquip(null)} title="Rimuovi armatura">✕</button>
          </div>
        ) : (
          <span className="armor-none">Senza armatura (CA {baseAC})</span>
        )}
        <button className="add-action-btn" style={{ marginTop: 6 }} onClick={() => setShowPanel(v => !v)}>
          {showPanel ? '✕ Chiudi' : (equippedArmor ? '↩ Cambia' : '+ Indossa armatura')}
        </button>
      </div>

      {showPanel && (
        <div className="armor-panel">
          {Object.entries(byType).map(([type, armors]) => (
            <div key={type} className="armor-type-group">
              <div className="armor-type-label">{TYPE_LABEL[type]}</div>
              {armors.map(a => {
                const ac = calcArmorAC(a, desMod);
                const isEquipped = equippedArmor?.id === a.id;
                return (
                  <div
                    key={a.id}
                    className={`armor-preset-item ${isEquipped ? 'equipped' : ''}`}
                    onClick={() => { onEquip(isEquipped ? null : a); setShowPanel(false); }}
                  >
                    <span className="armor-name">{a.name}</span>
                    <span className="armor-ac-detail">CA {ac}</span>
                    {a.strReq > 0 && <span className="armor-req">FOR {a.strReq}+</span>}
                    {isEquipped && <span className="armor-check">✓</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
