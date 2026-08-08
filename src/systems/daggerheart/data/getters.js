// Daggerheart — i18n-aware getter functions
import dhEN from '../i18n/daggerheart.i18n.json';
import dhIT from '../i18n/daggerheart.i18n.it.json';
import dhDE from '../i18n/daggerheart.i18n.de.json';
import dhES from '../i18n/daggerheart.i18n.es.json';
import dhFR from '../i18n/daggerheart.i18n.fr.json';

import { DH_CLASSES, DH_DOMAINS } from './classes';
import { DH_TRAITS, DH_ANCESTRIES, DH_COMMUNITIES, DH_TRAIT_USES } from './mechanics';
import { DH_CONDITIONS } from './conditions';

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
