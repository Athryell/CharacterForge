import { BONUS_STAT_OPTIONS } from './bonuses';
import {
  getMod, getProfBonus, fmtMod,
  SPELLCASTING_CLASS, HIT_DICE, SLOT_TABLE, SKILLS,
} from './data/mechanics';

// D&D 5e derived values and rule-bearing mutators, lifted out of useCharacter.
//
// Everything returned here is opaque to the core: useCharacter spreads it and
// never reads a key by name. Only this system's own widgets know what
// `profBonus` or `spellSaveDC` mean.
//
// Mutators that the UI needs to report on return a ResultDescriptor:
//   { messageKey, hintKey?, logIcon?, analytics?, durationMs? }
// so the plugin never touches t(), the toast, or the activity log.

function slotsFor(level) {
  return (SLOT_TABLE[level] || SLOT_TABLE[1]).map(max => ({ max, used: 0 }));
}

// Shared by onClassOrLevelChange and the level-up modal, which used to carry
// two copies of this.
export function recalcClassResources(charState, level) {
  return { spellSlots: slotsFor(level) };
}

export default function rules({ state, update }) {
  const level = state.charLevel || 1;
  const profBonus = getProfBonus(level);

  const abilityMod = attr => getMod(state.abilities?.[attr] ?? 10);

  const calcSaveMod = attr =>
    abilityMod(attr) + ((state.saveProficiencies || []).includes(attr) ? profBonus : 0);

  function calcSkillMod(skill) {
    const base = abilityMod(skill.attr);
    if ((state.skillExpertise || []).includes(skill.id))     return base + profBonus * 2;
    if ((state.skillProficiencies || []).includes(skill.id)) return base + profBonus;
    return base;
  }

  const spellStat        = SPELLCASTING_CLASS[state.charClass];
  const spellMod         = spellStat ? abilityMod(spellStat) : 0;
  const spellSaveDC      = spellStat ? 8 + profBonus + spellMod : null;
  const spellAttackBonus = spellStat ? fmtMod(profBonus + spellMod) : null;

  return {
    derived: {
      profBonus,
      initiative: fmtMod(abilityMod('DEX')),
      passivePerception: 10 + calcSkillMod(SKILLS.find(s => s.id === 'perception')),
      hitDice: `${level}× ${HIT_DICE[state.charClass] || 'd8'}`,
      spellStat, spellSaveDC, spellAttackBonus,
      abilityMod, calcSaveMod, calcSkillMod, fmtMod,
    },

    actions: {
      setAbility(attr, value) {
        update(prev => ({
          ...prev,
          abilities: { ...prev.abilities, [attr]: Math.max(3, Math.min(30, parseInt(value) || 10)) },
        }));
      },

      toggleSaveProficiency(attr) {
        update(prev => {
          const half = (prev.saveHalfProficiency || []).includes(attr);
          const prof = (prev.saveProficiencies || []).includes(attr);
          if (!half && !prof) return { ...prev, saveHalfProficiency: [...(prev.saveHalfProficiency || []), attr] };
          if (half) return {
            ...prev,
            saveHalfProficiency: (prev.saveHalfProficiency || []).filter(a => a !== attr),
            saveProficiencies: [...(prev.saveProficiencies || []), attr],
          };
          return { ...prev, saveProficiencies: (prev.saveProficiencies || []).filter(a => a !== attr) };
        });
      },

      toggleSkillProficiency(skillName) {
        update(prev => {
          const half = (prev.skillHalfProficiency || []).includes(skillName);
          const prof = (prev.skillProficiencies || []).includes(skillName);
          const exp  = (prev.skillExpertise || []).includes(skillName);
          if (!half && !prof) return { ...prev, skillHalfProficiency: [...(prev.skillHalfProficiency || []), skillName] };
          if (half) return {
            ...prev,
            skillHalfProficiency: (prev.skillHalfProficiency || []).filter(s => s !== skillName),
            skillProficiencies: [...(prev.skillProficiencies || []), skillName],
          };
          if (!exp) return { ...prev, skillExpertise: [...(prev.skillExpertise || []), skillName] };
          return {
            ...prev,
            skillProficiencies: (prev.skillProficiencies || []).filter(s => s !== skillName),
            skillExpertise:     (prev.skillExpertise || []).filter(s => s !== skillName),
          };
        });
      },

      modHP(delta) {
        update(prev => ({
          ...prev,
          hpCurrent: Math.max(0, Math.min(prev.hpMax, prev.hpCurrent + delta)),
        }));
      },

      // Owns the whole rest, including the parts that used to be stranded in
      // App.handleLongRest and applied as a second, separate save.
      longRest() {
        update(prev => ({
          ...prev,
          hpCurrent: prev.hpMax,
          spellSlots: slotsFor(prev.charLevel),
          hitDiceUsed: 0,
          exhaustionLevel: Math.max(0, (prev.exhaustionLevel || 0) - 1),
          resources: (prev.resources || []).map(r =>
            r.resetOn === 'long' || r.resetOn === 'short' ? { ...r, current: r.max } : r
          ),
        }));
        return { messageKey: 'toast.longRest', logIcon: 'game.longRest', analytics: 'long-rest' };
      },

      shortRest() {
        update(prev => ({
          ...prev,
          resources: (prev.resources || []).map(r =>
            r.resetOn === 'short' ? { ...r, current: r.max } : r
          ),
        }));
        return {
          messageKey: 'toast.shortRestMain',
          hintKey:    'toast.shortRestHint',
          logKey:     'toast.shortRest',
          logIcon:    'game.shortRest',
          durationMs: 10000,
        };
      },

      onClassOrLevelChange(patch) {
        update(prev => {
          const next = { ...prev, ...patch };
          return { ...next, ...recalcClassResources(next, next.charLevel || 1) };
        });
      },

      toggleSpellSlot(levelIdx, pipIdx) {
        update(prev => ({
          ...prev,
          spellSlots: prev.spellSlots.map((s, i) =>
            i === levelIdx ? { ...s, used: pipIdx < s.used ? pipIdx : pipIdx + 1 } : s
          ),
        }));
      },

      toggleSpellPrepared(spellName) {
        update(prev => ({
          ...prev,
          spells: prev.spells.map(s => s.name === spellName ? { ...s, prepared: !s.prepared } : s),
        }));
      },

      levelUp(changes) {
        update(prev => {
          const newLevel = prev.charLevel + 1;
          return {
            ...prev,
            charLevel: newLevel,
            hpMax: prev.hpMax + changes.hpGained,
            hpCurrent: Math.min(prev.hpCurrent + changes.hpGained, prev.hpMax + changes.hpGained),
            abilities: changes.asi
              ? Object.fromEntries(Object.entries(prev.abilities).map(([k, v]) => [k, v + (changes.asi[k] || 0)]))
              : prev.abilities,
            features: [
              ...prev.features,
              ...(changes.features || []).map(f => ({ ...f, acquiredAtLevel: newLevel })),
            ],
            spells: [
              ...prev.spells,
              ...(changes.spells || []).map(s => ({ ...s, acquiredAtLevel: newLevel })),
            ],
            spellSlots: slotsFor(newLevel),
            levelHistory: {
              ...prev.levelHistory,
              [newLevel]: {
                hpGained: changes.hpGained,
                features: (changes.features || []).map(f => f.id),
                spells:   (changes.spells || []).map(s => s.name),
                subclass: changes.subclass || null,
                feat:     changes.feat || changes.epicBoon || null,
                abilityScoreImprovement: changes.asi || null,
              },
            },
          };
        });
      },

      levelDown(keepIds = []) {
        update(prev => {
          if (prev.charLevel <= 1) return prev;
          const removing = prev.charLevel;
          const history  = (prev.levelHistory || {})[removing] || {};
          const removedAsi = history.abilityScoreImprovement;
          const newLevel = removing - 1;
          const newHpMax = Math.max(1, prev.hpMax - (history.hpGained || 0));
          const newHistory = { ...(prev.levelHistory || {}) };
          delete newHistory[removing];
          return {
            ...prev,
            charLevel: newLevel,
            hpMax: newHpMax,
            hpCurrent: Math.min(prev.hpCurrent, newHpMax),
            abilities: removedAsi
              ? Object.fromEntries(Object.entries(prev.abilities).map(([k, v]) => [k, v - (removedAsi[k] || 0)]))
              : prev.abilities,
            features: prev.features.filter(f => f.acquiredAtLevel !== removing || keepIds.includes(f.id)),
            spells:   prev.spells.filter(s => s.acquiredAtLevel !== removing || keepIds.includes(s.name)),
            spellSlots: slotsFor(newLevel),
            levelHistory: newHistory,
          };
        });
      },
    },
  };
}

// Values the notation engine and shared components read from CharContext.
// The keys are the engine's ABI, not D&D vocabulary: `profBonus` means "what
// [PRO] resolves to", and each system fills it with whatever that is.
export function contextValue(state, derived) {
  return {
    abilities:   derived.effectiveAbilities,
    traitValues: derived.effectiveAbilities,
    profBonus:   derived.profBonus,
    traitMap:    null,
    bonusStats:  BONUS_STAT_OPTIONS,
  };
}
