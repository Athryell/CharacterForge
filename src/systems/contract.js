// The contract every game system implements.
//
// The core must never ask "which system is this?". It asks "does this system
// support X?" via `capabilities`, and delegates everything else to the fields
// below. Adding a capability flag here is the only sanctioned way to introduce
// a new system-dependent branch in shared code.
//
// The object grows across the refactor: `layout`, `state`, `rules`, `widgets`,
// `modals`, `menu` and `pins` are added in later phases. Nothing here requires
// a field to exist, so a partially-implemented plugin is still valid.

export const CAPABILITY_DEFAULTS = {
  levelProgression:   false, // level up/down modals + levelHistory
  rests:              false, // short/long rest controls
  spellSlots:         false,
  exhaustion:         false, // exhaustion track + its d20 penalty
  armorAC:            false, // AC derived from equipped armor
  encumbrance:        false, // STR-based carry weight + speed penalty
  deathSaves:         false,
  homebrew:           false, // can hold homebrew content (needs a schema)
  userDefinedWidgets: false, // widgets live in state.widgets, not in widgetDefs
  editableTabs:       false, // user can add/remove tabs
  hiddenWidgetTray:   true,  // WidgetGrid offers the restore-hidden tray
  templateIO:         false, // sheet template export/import
  scoresAreModifiers: false, // DH: trait values ARE the modifier, never (n-10)/2
};

const REQUIRED_META = ['id', 'name', 'shortName'];

export function defineSystem(spec) {
  REQUIRED_META.forEach(k => {
    if (!spec?.meta?.[k]) throw new Error(`defineSystem: meta.${k} is required`);
  });

  const unknownCaps = Object.keys(spec.capabilities || {})
    .filter(k => !(k in CAPABILITY_DEFAULTS));
  if (unknownCaps.length) {
    // A typo'd capability silently reads as false forever, which is the kind of
    // bug that surfaces as "the rest button just doesn't appear".
    throw new Error(
      `defineSystem(${spec.meta.id}): unknown capabilities ${unknownCaps.join(', ')}. ` +
      `Declare them in CAPABILITY_DEFAULTS first.`
    );
  }

  return Object.freeze({
    ...spec,
    capabilities: Object.freeze({ ...CAPABILITY_DEFAULTS, ...(spec.capabilities || {}) }),
    icons:        Object.freeze({ ...(spec.icons || {}) }),
  });
}
