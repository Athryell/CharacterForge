// The custom system has no rules by definition: every value on the sheet is
// whatever the user put there. Only the notation engine's ABI keys are filled,
// so [PRO] and friends resolve to something rather than blowing up.

export default function rules() {
  return {
    derived: {
      profBonus: 0,
      abilityMod: () => 0,
    },
    actions: {},
  };
}
