// Compatibility shim — data moved to data/systems/daggerheart/
import dhEN from './systems/daggerheart/i18n/daggerheart.i18n.json';
import dhIT from './systems/daggerheart/i18n/daggerheart.i18n.it.json';
import dhDE from './systems/daggerheart/i18n/daggerheart.i18n.de.json';
import dhES from './systems/daggerheart/i18n/daggerheart.i18n.es.json';
import dhFR from './systems/daggerheart/i18n/daggerheart.i18n.fr.json';

import { DH_CLASSES, DH_DOMAINS } from './systems/daggerheart/classes';
import { DH_TRAITS, DH_ANCESTRIES, DH_COMMUNITIES, DH_TRAIT_USES } from './systems/daggerheart/mechanics';
import { DH_CONDITIONS } from './systems/daggerheart/conditions';

export * from './systems/daggerheart/mechanics';
export * from './systems/daggerheart/classes';
export * from './systems/daggerheart/weapons';
export * from './systems/daggerheart/armor';
export * from './systems/daggerheart/conditions';

const DH_I18N = { en: dhEN, it: dhIT, de: dhDE, es: dhES, fr: dhFR };

function resolveDHLang(lang) {
  const code = (lang || 'en').slice(0, 2).toLowerCase();
  return DH_I18N[code] ? code : 'en';
}

function dhI18n(lang) { return DH_I18N[resolveDHLang(lang)]; }

export function getDHClasses(lang) {
  const tr = dhI18n(lang).classes || {};
  return DH_CLASSES.map(c => ({
    ...c,
    name: tr[c.id]?.name || c.name,
    subclasses: tr[c.id]?.subclasses || c.subclasses,
  }));
}

export function getDHDomains(lang) {
  const tr = dhI18n(lang).domains || {};
  return DH_DOMAINS.map(d => ({
    ...d,
    name: tr[d.id]?.name || d.name,
    desc: tr[d.id]?.desc || d.desc,
  }));
}

export function getDHAncestries(lang) {
  const tr = dhI18n(lang).ancestries || {};
  return DH_ANCESTRIES.map(a => tr[a] || a);
}

export function getDHCommunities(lang) {
  const tr = dhI18n(lang).communities || {};
  return DH_COMMUNITIES.map(c => ({ id: c, name: tr[c] || c }));
}

export function getDHConditions(lang) {
  const tr = dhI18n(lang).conditions || {};
  return DH_CONDITIONS.map(c => ({
    ...c,
    name: tr[c.id]?.name || c.name,
    desc: tr[c.id]?.desc || c.desc,
  }));
}

export function getDHTraitUses(lang) {
  const tr = dhI18n(lang).traits || {};
  const result = {};
  DH_TRAITS.forEach(k => { result[k] = tr[k]?.uses || DH_TRAIT_USES[k]; });
  return result;
}
