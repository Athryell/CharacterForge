// CharacterForge — D&D 5e adapter — API pubblica per dataManager e componenti

import { DND_SPELLS } from './spells';
import { DND_WEAPONS, calcWeaponAttack } from './weapons';
import { DND_CONDITIONS } from './conditions';
import { DND_CLASSES, DND_CLASS_NAMES } from './classes';
import { DND_SPECIES } from './species';
import { DND_BACKGROUNDS } from './backgrounds';
import { DND_ARMOR_PRESETS, calcArmorAC } from './armors';
import { getMod, getProfBonus } from './mechanics';

function mergeByKey(srdList, hbList, keyFn = item => item.name) {
  const map = new Map(srdList.map(item => [keyFn(item), item]));
  hbList.forEach(item => map.set(keyFn(item), { ...item, _homebrew: true }));
  return Array.from(map.values());
}

const dnd5eAdapter = {
  systemId: 'dnd5e2024',

  // ── Dati base ────────────────────────────────────────────────────────────

  getSpells(lang, i18nData) {
    const tr = i18nData || {};
    return DND_SPELLS.map(s => ({ ...s, ...(tr[s.id] || {}) }));
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

  // ── Meccaniche ───────────────────────────────────────────────────────────

  getMod,
  getProfBonus,
  calcArmorAC,

  calcAttackBonus(weapon, abilities, profBonus, isProficient) {
    return calcWeaponAttack({ weapon, abilities, profBonus, isProficient });
  },

  // ── Homebrew merge ───────────────────────────────────────────────────────

  mergeHomebrew(srdData, homebrew, type) {
    const keyFn = type === 'conditions' ? item => item.id : item => item.name;
    return mergeByKey(srdData, homebrew, keyFn);
  },
};

export default dnd5eAdapter;
