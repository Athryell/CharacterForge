// Translation tables for the D&D SRD data, keyed by entity type and language.
//
// This used to sit in dataManager, where resolveLang probed the spells table to
// decide language support for EVERY entity type.

import spellsEN      from '../i18n/spells.i18n.json';
import spellsIT      from '../i18n/spells.i18n.it.json';
import spellsDE      from '../i18n/spells.i18n.de.json';
import spellsES      from '../i18n/spells.i18n.es.json';
import spellsFR      from '../i18n/spells.i18n.fr.json';
import weaponsEN     from '../i18n/weapons.i18n.json';
import weaponsIT     from '../i18n/weapons.i18n.it.json';
import weaponsDE     from '../i18n/weapons.i18n.de.json';
import weaponsES     from '../i18n/weapons.i18n.es.json';
import weaponsFR     from '../i18n/weapons.i18n.fr.json';
import conditionsEN  from '../i18n/conditions.i18n.json';
import conditionsIT  from '../i18n/conditions.i18n.it.json';
import conditionsDE  from '../i18n/conditions.i18n.de.json';
import conditionsES  from '../i18n/conditions.i18n.es.json';
import conditionsFR  from '../i18n/conditions.i18n.fr.json';
import classesEN     from '../i18n/classes.i18n.json';
import classesIT     from '../i18n/classes.i18n.it.json';
import classesDE     from '../i18n/classes.i18n.de.json';
import classesES     from '../i18n/classes.i18n.es.json';
import classesFR     from '../i18n/classes.i18n.fr.json';
import speciesEN     from '../i18n/species.i18n.json';
import speciesIT     from '../i18n/species.i18n.it.json';
import speciesDE     from '../i18n/species.i18n.de.json';
import speciesES     from '../i18n/species.i18n.es.json';
import speciesFR     from '../i18n/species.i18n.fr.json';
import backgroundsEN from '../i18n/backgrounds.i18n.json';
import backgroundsIT from '../i18n/backgrounds.i18n.it.json';
import backgroundsDE from '../i18n/backgrounds.i18n.de.json';
import backgroundsES from '../i18n/backgrounds.i18n.es.json';
import backgroundsFR from '../i18n/backgrounds.i18n.fr.json';

const TABLES = {
  spells:      { en: spellsEN,      it: spellsIT,      de: spellsDE,      es: spellsES,      fr: spellsFR },
  weapons:     { en: weaponsEN,     it: weaponsIT,     de: weaponsDE,     es: weaponsES,     fr: weaponsFR },
  conditions:  { en: conditionsEN,  it: conditionsIT,  de: conditionsDE,  es: conditionsES,  fr: conditionsFR },
  classes:     { en: classesEN,     it: classesIT,     de: classesDE,     es: classesES,     fr: classesFR },
  species:     { en: speciesEN,     it: speciesIT,     de: speciesDE,     es: speciesES,     fr: speciesFR },
  backgrounds: { en: backgroundsEN, it: backgroundsIT, de: backgroundsDE, es: backgroundsES, fr: backgroundsFR },
};

export const LANGS = ['en', 'it', 'de', 'es', 'fr'];

export function resolveLang(lang) {
  const code = (lang || 'en').toLowerCase().slice(0, 2);
  return LANGS.includes(code) ? code : 'en';
}

export function getI18n(type, lang) {
  const table = TABLES[type];
  if (!table) return {};
  return table[resolveLang(lang)] || table.en || {};
}
