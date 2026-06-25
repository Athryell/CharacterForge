// CharacterForge — dataManager
// Singleton che fonde dati SRD built-in con pacchetti homebrew salvati in localStorage.
// I pacchetti homebrew NON vanno mai nel codice sorgente o nel repo.

import dnd5eAdapter   from './systems/dnd5e2024/adapter';
import dhAdapter      from './systems/daggerheart/adapter';

// Raw data for SRD counts in getSources()
import { DND_SPELLS }      from './systems/dnd5e2024/spells';
import { DND_WEAPONS }     from './systems/dnd5e2024/weapons';
import { DND_CONDITIONS }  from './systems/dnd5e2024/conditions';
import { DND_CLASS_NAMES } from './systems/dnd5e2024/classes';
import { DND_ARMOR_PRESETS } from './systems/dnd5e2024/armors';
import { SRD_ITEMS }        from './systems/dnd5e2024/items';
import { DND_SPECIES }     from './systems/dnd5e2024/species';
import { DND_BACKGROUNDS } from './systems/dnd5e2024/backgrounds';

// ── i18n — D&D 5e (da nuova posizione) ──────────────────────────────────────
import spellsEN      from './systems/dnd5e2024/i18n/spells.i18n.json';
import spellsIT      from './systems/dnd5e2024/i18n/spells.i18n.it.json';
import spellsDE      from './systems/dnd5e2024/i18n/spells.i18n.de.json';
import spellsES      from './systems/dnd5e2024/i18n/spells.i18n.es.json';
import spellsFR      from './systems/dnd5e2024/i18n/spells.i18n.fr.json';
import weaponsEN     from './systems/dnd5e2024/i18n/weapons.i18n.json';
import weaponsIT     from './systems/dnd5e2024/i18n/weapons.i18n.it.json';
import weaponsDE     from './systems/dnd5e2024/i18n/weapons.i18n.de.json';
import weaponsES     from './systems/dnd5e2024/i18n/weapons.i18n.es.json';
import weaponsFR     from './systems/dnd5e2024/i18n/weapons.i18n.fr.json';
import conditionsEN  from './systems/dnd5e2024/i18n/conditions.i18n.json';
import conditionsIT  from './systems/dnd5e2024/i18n/conditions.i18n.it.json';
import conditionsDE  from './systems/dnd5e2024/i18n/conditions.i18n.de.json';
import conditionsES  from './systems/dnd5e2024/i18n/conditions.i18n.es.json';
import conditionsFR  from './systems/dnd5e2024/i18n/conditions.i18n.fr.json';
import classesEN     from './systems/dnd5e2024/i18n/classes.i18n.json';
import classesIT     from './systems/dnd5e2024/i18n/classes.i18n.it.json';
import classesDE     from './systems/dnd5e2024/i18n/classes.i18n.de.json';
import classesES     from './systems/dnd5e2024/i18n/classes.i18n.es.json';
import classesFR     from './systems/dnd5e2024/i18n/classes.i18n.fr.json';
import speciesEN     from './systems/dnd5e2024/i18n/species.i18n.json';
import speciesIT     from './systems/dnd5e2024/i18n/species.i18n.it.json';
import speciesDE     from './systems/dnd5e2024/i18n/species.i18n.de.json';
import speciesES     from './systems/dnd5e2024/i18n/species.i18n.es.json';
import speciesFR     from './systems/dnd5e2024/i18n/species.i18n.fr.json';
import backgroundsEN from './systems/dnd5e2024/i18n/backgrounds.i18n.json';
import backgroundsIT from './systems/dnd5e2024/i18n/backgrounds.i18n.it.json';
import backgroundsDE from './systems/dnd5e2024/i18n/backgrounds.i18n.de.json';
import backgroundsES from './systems/dnd5e2024/i18n/backgrounds.i18n.es.json';
import backgroundsFR from './systems/dnd5e2024/i18n/backgrounds.i18n.fr.json';

const I18N = {
  spells:      { en: spellsEN,      it: spellsIT,      de: spellsDE,      es: spellsES,      fr: spellsFR },
  weapons:     { en: weaponsEN,     it: weaponsIT,     de: weaponsDE,     es: weaponsES,     fr: weaponsFR },
  conditions:  { en: conditionsEN,  it: conditionsIT,  de: conditionsDE,  es: conditionsES,  fr: conditionsFR },
  classes:     { en: classesEN,     it: classesIT,     de: classesDE,     es: classesES,     fr: classesFR },
  species:     { en: speciesEN,     it: speciesIT,     de: speciesDE,     es: speciesES,     fr: speciesFR },
  backgrounds: { en: backgroundsEN, it: backgroundsIT, de: backgroundsDE, es: backgroundsES, fr: backgroundsFR },
};

const ADAPTERS = {
  dnd5e2024:   dnd5eAdapter,
  daggerheart: dhAdapter,
};

const HOMEBREW_KEY   = 'characterforge_homebrew';
const SCHEMA_VERSION = '1.0.0';

function resolveLang(lang) {
  if (!lang) return 'en';
  const code = lang.toLowerCase().slice(0, 2);
  return I18N.spells[code] ? code : 'en';
}

function loadI18n(type, lang) {
  const code = resolveLang(lang);
  return I18N[type]?.[code] || I18N[type]?.en || {};
}

function loadHomebrew() {
  try { return JSON.parse(localStorage.getItem(HOMEBREW_KEY)) || []; }
  catch { return []; }
}

function saveHomebrew(sources) {
  try { localStorage.setItem(HOMEBREW_KEY, JSON.stringify(sources)); }
  catch (e) { console.error('dataManager: failed to save homebrew', e); }
}

function getCurrentLang() {
  try { return window.__i18n_lang__ || 'en'; }
  catch { return 'en'; }
}

const dataManager = {
  // ── Adapter registry ─────────────────────────────────────────────────────
  getAdapter(systemId = 'dnd5e2024') {
    return ADAPTERS[systemId] || ADAPTERS.dnd5e2024;
  },

  // ── Incantesimi ──────────────────────────────────────────────────────────
  getSpells(lang = getCurrentLang(), systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    const tr = loadI18n('spells', lang);
    const hb = loadHomebrew().flatMap(s => s.spells || []);
    const srd = adapter.getSpells?.(lang, tr) || [];
    return adapter.mergeHomebrew ? adapter.mergeHomebrew(srd, hb, 'spells') : srd;
  },

  // ── Armi ─────────────────────────────────────────────────────────────────
  getWeapons(lang = getCurrentLang(), systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    const tr = loadI18n('weapons', lang);
    const hb = loadHomebrew().flatMap(s => s.weapons || []);
    const srd = adapter.getWeapons?.(lang, tr) || [];
    return adapter.mergeHomebrew ? adapter.mergeHomebrew(srd, hb, 'weapons') : srd;
  },

  // ── Condizioni ───────────────────────────────────────────────────────────
  getConditions(lang = getCurrentLang(), systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    const tr = loadI18n('conditions', lang);
    const hb = loadHomebrew().flatMap(s => s.conditions || []);
    const srd = adapter.getConditions?.(lang, tr) || [];
    return adapter.mergeHomebrew ? adapter.mergeHomebrew(srd, hb, 'conditions') : srd;
  },

  // ── Classi ───────────────────────────────────────────────────────────────
  getClasses(lang = getCurrentLang(), systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    if (systemId !== 'dnd5e2024') return adapter.getClasses?.() || [];
    const hbNames = loadHomebrew()
      .flatMap(s => (s.classes || []).map(c => c.name))
      .filter(n => !DND_CLASS_NAMES.includes(n));
    return [...adapter.getClasses(), ...hbNames];
  },

  getClassData(name, lang = getCurrentLang(), systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    if (systemId !== 'dnd5e2024') return adapter.getClassData?.(name) || null;
    const tr = loadI18n('classes', lang);
    const cls = adapter.getClassData(name, tr);
    if (cls) return cls;
    for (const src of loadHomebrew()) {
      const hbCls = (src.classes || []).find(c => c.name === name);
      if (hbCls) return { ...hbCls, _homebrew: true };
    }
    return null;
  },

  // ── Specie ───────────────────────────────────────────────────────────────
  getSpecies(lang = getCurrentLang()) {
    const tr = loadI18n('species', lang);
    const srd = dnd5eAdapter.getSpecies(lang, tr);
    const srdIds = DND_SPECIES.map(s => s.id);
    const hbExtra = loadHomebrew()
      .flatMap(s => s.species || [])
      .filter(sp => !srdIds.includes(sp.id || sp.name))
      .map(sp => ({ id: sp.id || sp.name, name: sp.name, _homebrew: true }));
    return [...srd, ...hbExtra];
  },

  getSpeciesData(id, lang = getCurrentLang()) {
    const tr = loadI18n('species', lang);
    const srd = DND_SPECIES.find(s => s.id === id);
    if (srd) return { ...srd, ...(tr[id] || {}) };
    for (const src of loadHomebrew()) {
      const sp = (src.species || []).find(s => s.id === id || s.name === id);
      if (sp) return { ...sp, _homebrew: true };
    }
    return null;
  },

  // ── Background ───────────────────────────────────────────────────────────
  getBackgrounds(lang = getCurrentLang()) {
    const tr = loadI18n('backgrounds', lang);
    const srd = dnd5eAdapter.getBackgrounds(lang, tr);
    const srdIds = DND_BACKGROUNDS.map(b => b.id);
    const hbExtra = loadHomebrew()
      .flatMap(s => s.backgrounds || [])
      .filter(b => !srdIds.includes(b.id))
      .map(b => ({ ...b, _homebrew: true }));
    return [...srd, ...hbExtra];
  },

  // ── Armature ─────────────────────────────────────────────────────────────
  getArmors(systemId = 'dnd5e2024') {
    const adapter = this.getAdapter(systemId);
    if (systemId !== 'dnd5e2024') return adapter.getArmors?.() || [];
    const srdIds = DND_ARMOR_PRESETS.map(a => a.id);
    const hbExtra = loadHomebrew()
      .flatMap(s => s.armors || [])
      .filter(a => !srdIds.includes(a.id || a.name))
      .map(a => ({ ...a, id: a.id || a.name, _homebrew: true }));
    return [...DND_ARMOR_PRESETS, ...hbExtra];
  },

  // ── Oggetti ──────────────────────────────────────────────────────────────
  getItems() {
    const srdIds = SRD_ITEMS.map(i => i.id);
    const hbExtra = loadHomebrew()
      .flatMap(s => s.items || [])
      .filter(i => !srdIds.includes(i.id || i.name))
      .map(i => ({ ...i, id: i.id || i.name, _homebrew: true }));
    return [...SRD_ITEMS, ...hbExtra];
  },

  // ── Sottoclassi ──────────────────────────────────────────────────────────
  getSubclasses(cls) {
    return loadHomebrew()
      .flatMap(s => (s.subclasses || []).filter(sc => sc.class === cls).map(sc => sc.name));
  },

  getSubclassDetails(charClass, subclassName) {
    for (const src of loadHomebrew()) {
      const sc = (src.subclasses || []).find(s => s.class === charClass && s.name === subclassName);
      if (sc) return sc;
    }
    return null;
  },

  // ── Sorgenti ─────────────────────────────────────────────────────────────
  getSources() {
    const hb = loadHomebrew();
    const srdCounts = {
      spells:      DND_SPELLS.length,
      weapons:     DND_WEAPONS.length,
      classes:     DND_CLASS_NAMES.length,
      species:     DND_SPECIES.length,
      backgrounds: DND_BACKGROUNDS.length,
      conditions:  DND_CONDITIONS.length,
      items:       SRD_ITEMS.length,
    };
    return [
      { id: 'srd', name: 'SRD 5.2.1', author: 'Wizards of the Coast', type: 'srd', counts: srdCounts },
      ...hb.map(s => ({
        ...s,
        type: 'homebrew',
        counts: {
          classes:     (s.classes     || []).length,
          subclasses:  (s.subclasses  || []).length,
          species:     (s.species     || []).length,
          backgrounds: (s.backgrounds || []).length,
          spells:      (s.spells      || []).length,
          weapons:     (s.weapons     || []).length,
          armors:      (s.armors      || []).length,
          items:       (s.items       || []).length,
          conditions:  (s.conditions  || []).length,
          feats:       (s.feats       || []).length,
        },
      })),
    ];
  },

  addSource(json) {
    const errors = [];
    if (!json || typeof json !== 'object') { errors.push('Il file non è un oggetto JSON valido.'); return { ok: false, errors }; }
    if (!json.id)   errors.push('Campo "id" mancante o vuoto.');
    if (!json.name) errors.push('Campo "name" mancante o vuoto.');
    const size = new Blob([JSON.stringify(json)]).size;
    if (size > 2 * 1024 * 1024) errors.push(`Il pacchetto è troppo grande (${(size / 1024 / 1024).toFixed(1)} MB, max 2 MB).`);
    if (errors.length) return { ok: false, errors };

    const sources = loadHomebrew();
    const idx = sources.findIndex(s => s.id === json.id);
    if (idx >= 0) sources[idx] = json;
    else sources.push(json);
    saveHomebrew(sources);
    return { ok: true, errors: [], counts: dataManager.getSources().find(s => s.id === json.id)?.counts };
  },

  removeSource(id) {
    saveHomebrew(loadHomebrew().filter(s => s.id !== id));
  },

  getSourceRaw(id) {
    return loadHomebrew().find(s => s.id === id) || null;
  },

  exportSchema() {
    return {
      schemaVersion: SCHEMA_VERSION,
      id: `homebrew-${Date.now()}`,
      name: 'Il mio Homebrew',
      author: '',
      description: '',
      classes: [],
      subclasses: [],
      species: [],
      backgrounds: [],
      spells: [],
      weapons: [],
      items: [],
      conditions: [],
    };
  },

  exportAllHomebrew() {
    return loadHomebrew();
  },
};

export default dataManager;
