// CharacterForge — D&D 5e adapter — API pubblica per dataManager e componenti

import { DND_SPELLS, SCHOOLS, SPELL_CLASSES, filterSpells } from './spells';
import { DND_WEAPONS, calcWeaponAttack, WEAPON_PROPERTIES, WEAPON_PROPERTY_DESCS, WEAPON_MASTERIES, ABILITY_OPTIONS } from './weapons';
import { DND_CONDITIONS } from './conditions';
import { DND_CLASSES, DND_CLASS_NAMES, CLASS_FEATURES } from './classes';
import { DND_SPECIES } from './species';
import { DND_BACKGROUNDS } from './backgrounds';
import { DND_ARMOR_PRESETS, calcArmorAC, TYPE_LABEL } from './armors';
import { SRD_ITEMS } from './items';
import { getMod, getProfBonus, ABILITIES, SKILLS, ALIGNMENTS, HIT_DICE, SLOT_TABLE, SPELLCASTING_CLASS, DEFAULT_ACTIONS } from './mechanics';
import { getI18n } from './i18n';

const dnd5eAdapter = {
  systemId: 'dnd5e2024',

  // Translation tables for this system's data. dataManager asks for them by
  // entity type and hands the result back to the getters below.
  getI18n,

  // ── Dati base ────────────────────────────────────────────────────────────

  getSpells(lang, i18nData) {
    const tr = i18nData || {};
    return DND_SPELLS.map(s => {
      const t = tr[s.id] || {};
      return { ...s, ...t, name: t.name || s.id };
    });
  },

  getWeapons(lang, i18nData) {
    const tr = i18nData || {};
    return DND_WEAPONS.map(w => ({
      ...w,
      name:    tr[w.id]?.name    || w.id,
      dmgType: tr[w.id]?.dmgType || '',
    }));
  },

  getConditions(lang, i18nData) {
    const tr = i18nData || {};
    return DND_CONDITIONS.map(c => ({ ...c, ...(tr[c.id] || {}) }));
  },

  getClasses() {
    return DND_CLASS_NAMES;
  },

  getClassData(name, i18nData) {
    const cls = DND_CLASSES.find(c => c.name === name) || null;
    if (!cls || !i18nData) return cls;
    return { ...cls, ...(i18nData[name] || {}) };
  },

  getSpecies(lang, i18nData) {
    const tr = i18nData || {};
    return DND_SPECIES.map(s => ({ ...s, ...(tr[s.id] || {}) }));
  },

  getBackgrounds(lang, i18nData) {
    const tr = i18nData || {};
    return DND_BACKGROUNDS.map(b => ({ ...b, ...(tr[b.id] || {}) }));
  },

  getArmors() {
    return DND_ARMOR_PRESETS;
  },

  getItems() {
    return SRD_ITEMS;
  },

  // ── Meccaniche ───────────────────────────────────────────────────────────

  getMod,
  getProfBonus,
  calcArmorAC,

  calcAttackBonus(weapon, abilities, profBonus, isProficient) {
    return calcWeaponAttack({ weapon, abilities, profBonus, isProficient });
  },

  // ── Statici ──────────────────────────────────────────────────────────────

  getAbilities:         () => ABILITIES,
  getSkills:            () => SKILLS,
  getAlignments:        () => ALIGNMENTS,
  getHitDice:           () => HIT_DICE,
  getSlotTable:         () => SLOT_TABLE,
  getSpellcastingClass: () => SPELLCASTING_CLASS,
  getSchools:           () => SCHOOLS,
  getSpellClasses:      () => SPELL_CLASSES,
  getWeaponProperties:     () => WEAPON_PROPERTIES,
  getWeaponPropertyDescs:  () => WEAPON_PROPERTY_DESCS,
  getWeaponMasteries:      () => WEAPON_MASTERIES,
  getAbilityOptions:    () => ABILITY_OPTIONS,
  getArmorTypeLabel:    () => TYPE_LABEL,
  filterSpells,
  getDefaultActions:    () => DEFAULT_ACTIONS,
  getClassFeatures:     (className) => CLASS_FEATURES[className] || [],

  // mergeHomebrew used to live here, which is why homebrew worked for D&D and
  // was silently dropped for every other system. It is now one generic
  // implementation in dataManager.
};

export default dnd5eAdapter;
