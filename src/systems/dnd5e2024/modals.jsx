import React from 'react';
import LevelUpModal from './components/LevelUpModal';
import LevelDownModal from './components/LevelDownModal';
import { DND_CLASSES } from './data/classes';
import { getProfBonus, resolveResourceFormula } from './data/mechanics';

// Modals this system owns, moved verbatim out of App.jsx. App renders whatever
// the active plugin returns and no longer knows a level-up wizard exists.
export function render(ctx) {
  const { core: { state, update, char, t }, shell } = ctx;
  const { showLevelUp, setShowLevelUp, showLevelDown, setShowLevelDown, showToast } = shell;
  return (
    <>
      {showLevelUp && (
        <LevelUpModal
          currentLevel={state.charLevel}
          charClass={state.charClass}
          charState={state}
          onComplete={changes => {
            char.levelUp(changes);
            const newLevel = (state.charLevel || 1) + 1;
            const classData = DND_CLASSES.find(c => c.name === state.charClass);
            if (classData?.resources?.length) {
              const newProfBonus = getProfBonus(newLevel);
              const customRes = (state.resources || []).filter(r => r.source === 'custom' || r.source === 'feat');
              const classRes = classData.resources.map(r => {
                const maxVal = (r.startLevel && newLevel < r.startLevel) ? 0 : resolveResourceFormula(r.formula, state.abilities, newLevel, newProfBonus);
                const existing = (state.resources || []).find(er => er.id === r.id);
                let resetOn = r.resetOn;
                if (r.id === 'bardic_inspiration') resetOn = newLevel >= 5 ? 'short' : 'long';
                return { ...r, resetOn, max: maxVal, current: existing ? Math.min(existing.current, maxVal) : maxVal, pinned: existing?.pinned ?? false };
              });
              update({ resources: [...classRes, ...customRes] });
              if (state.charClass === 'Bard' && newLevel === 5) showToast(t('resources.bardInspirationShortRest'));
            }
            setShowLevelUp(false);
          }}
          onCancel={() => setShowLevelUp(false)}
        />
      )}
      {showLevelDown && (
        <LevelDownModal
          currentLevel={state.charLevel}
          charState={state}
          onConfirm={keepIds => { char.levelDown(keepIds); setShowLevelDown(false); }}
          onCancel={() => setShowLevelDown(false)}
        />
      )}
    </>
  );
}
