// CharacterForge — Daggerheart adapter — API pubblica per dataManager e componenti

import { DH_WEAPONS } from './weapons';
import { DH_ARMORS } from './armor';
import { DH_CONDITIONS } from './conditions';
import { DH_CLASSES, DH_DOMAINS } from './classes';
import { getDHProficiency, rollDualityDice, DH_TRAITS, DH_TRAIT_ARRAY, DH_ANCESTRIES, DH_COMMUNITIES, createDHDefaultState } from './mechanics';

const daggerheartAdapter = {
  systemId: 'daggerheart',

  getWeapons() {
    return DH_WEAPONS;
  },

  getArmors() {
    return DH_ARMORS;
  },

  getConditions() {
    return DH_CONDITIONS;
  },

  getClasses() {
    return DH_CLASSES.map(c => c.name);
  },

  getClassData(name) {
    return DH_CLASSES.find(c => c.name === name) || null;
  },

  getDomains() {
    return DH_DOMAINS;
  },

  getTraits:      () => DH_TRAIT_ARRAY,
  getTraitMap:    () => DH_TRAITS,
  getAncestries:  () => DH_ANCESTRIES,
  getCommunities: () => DH_COMMUNITIES,

  getProficiency:     getDHProficiency,
  rollDuality:        rollDualityDice,
  createDefaultState: createDHDefaultState,

  calcThresholds(baseThresholds, level) {
    return baseThresholds.map(t => t + level);
  },
};

export default daggerheartAdapter;
