import { getDHProficiency } from './data/mechanics';

// Daggerheart derived values. Deliberately small: most of the sheet's numbers
// are stored directly rather than computed, and the ones that are computed live
// in the widgets.
//
// `profBonus` is the notation engine's name for "the number [PRO] resolves to",
// not a D&D concept — here it is the Daggerheart proficiency for the level.
// Trait values ARE the modifier, so abilityMod is identity: putting them through
// (n - 10) / 2 like D&D is exactly the bug capabilities.scoresAreModifiers guards.

export default function rules({ state, update }) {
  const level = state.charLevel || 1;
  const traits = state.traits || {};

  return {
    derived: {
      profBonus: getDHProficiency(level),
      abilityMod: trait => traits[trait] ?? 0,
    },

    actions: {
      modHP(delta) {
        update(prev => ({
          ...prev,
          hpCurrent: Math.max(0, Math.min(prev.hpMax, prev.hpCurrent + delta)),
        }));
      },
    },
  };
}

export function contextValue(state, derived) {
  const traits = state.traits || {};
  return {
    abilities:   traits,
    traitValues: traits,
    profBonus:   derived.profBonus,
    // Trait values ARE the modifier here; Tooltip must not run (n - 10) / 2.
    traitMap:    traits,
  };
}
