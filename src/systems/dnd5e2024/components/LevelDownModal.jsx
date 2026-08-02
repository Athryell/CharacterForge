import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../config/icons';

export default function LevelDownModal({ currentLevel, charState, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const targetLevel = currentLevel - 1;
  const history = (charState.levelHistory || {})[currentLevel] || null;

  const removedFeatures = history
    ? (charState.features || []).filter(f => history.features?.includes(f.id))
    : [];
  const removedSpells = history
    ? (charState.spells || []).filter(s => history.spells?.includes(s.name))
    : [];

  const [keptIds, setKeptIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);

  function toggleKeep(id) {
    setKeptIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const hasHistory = history && (removedFeatures.length > 0 || removedSpells.length > 0 || history.asi || history.feat || history.subclass);

  return (
    <div className="creator-overlay">
      <div className="creator-modal" style={{ maxWidth: 480 }}>
        <div className="creator-header">
          <div className="creator-title">{t('levelDown.title', { level: targetLevel })}</div>
          <button className="creator-close" onClick={onCancel}><Icon id="action.remove" size={14} /></button>
        </div>

        <div className="creator-body">
          <div className="creator-section">
            {!hasHistory ? (
              <p className="hint-text">{t('levelDown.noHistory')}</p>
            ) : (
              <>
                <div className="creator-subtitle" style={{ marginBottom: 8 }}>{t('levelDown.willRemove')}</div>

                {history.hpGained > 0 && (
                  <div className="feature-item" style={{ pointerEvents: 'none' }}>
                    <div className="feature-source-dot" style={{ background: 'var(--c-warn)' }} />
                    <div style={{ flex: 1, fontSize: '0.867rem' }}>HP Max −{history.hpGained}</div>
                  </div>
                )}

                {history.asi && (
                  <div className="feature-item" style={{ pointerEvents: 'none' }}>
                    <div className="feature-source-dot" style={{ background: 'var(--c-warn)' }} />
                    <div style={{ flex: 1, fontSize: '0.867rem' }}>
                      ASI removed: {Object.entries(history.asi).map(([k, v]) => `${k} −${v}`).join(', ')}
                    </div>
                  </div>
                )}

                {history.feat && (
                  <div className="feature-item" style={{ pointerEvents: 'none' }}>
                    <div className="feature-source-dot" style={{ background: 'var(--c-warn)' }} />
                    <div style={{ flex: 1, fontSize: '0.867rem' }}>Feat/Boon: {history.feat}</div>
                  </div>
                )}

                {removedFeatures.map(f => (
                  <div key={f.id} className="feature-item" style={{ cursor: 'pointer' }}
                    onClick={() => toggleKeep(f.id)}>
                    <div className="feature-source-dot" style={{ background: keptIds.has(f.id) ? 'var(--c-accent)' : 'var(--c-warn)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="feature-name">{f.name}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={keptIds.has(f.id)} onChange={() => toggleKeep(f.id)} />
                          {t('levelDown.keepItem')}
                        </label>
                      </div>
                      {expandedId === f.id && f.desc && (
                        <div className="feature-desc" style={{ marginTop: 4 }}>{f.desc}</div>
                      )}
                    </div>
                    <button className="io-btn" style={{ marginLeft: 8, padding: '2px 6px', fontSize: '0.733rem' }}
                      onClick={e => { e.stopPropagation(); setExpandedId(expandedId === f.id ? null : f.id); }}>
                      {expandedId === f.id ? '▲' : '▼'}
                    </button>
                  </div>
                ))}

                {removedSpells.map(s => (
                  <div key={s.name} className="feature-item" style={{ cursor: 'pointer' }}
                    onClick={() => toggleKeep(s.name)}>
                    <div className="feature-source-dot" style={{ background: keptIds.has(s.name) ? 'var(--c-accent)' : 'var(--c-warn)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="feature-name">✨ {s.name}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={keptIds.has(s.name)} onChange={() => toggleKeep(s.name)} />
                          {t('levelDown.keepItem')}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="creator-footer">
          <button className="io-btn" onClick={onCancel}>{t('levelDown.cancel')}</button>
          <button className="io-btn danger solid"
            onClick={() => { window.umami?.track('level-down', { level: targetLevel }); onConfirm([...keptIds]); }}>
            {t('levelDown.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
