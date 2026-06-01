// CharacterForge — dataManager
// Singleton che fonde dati SRD built-in con pacchetti homebrew salvati in localStorage.
// I pacchetti homebrew NON vanno mai nel codice sorgente o nel repo.

import { SRD_SPELLS }      from './srd/spells';
import { SRD_WEAPONS }     from './srd/weapons';
import { SRD_CONDITIONS }  from './srd/conditions';
import { SRD_CLASSES, SRD_CLASS_NAMES } from './srd/classes';
import { SRD_SPECIES }     from './srd/species';
import { SRD_BACKGROUNDS } from './srd/backgrounds';

// ── i18n translation tables ──────────────────────────────────────────────────
import spellsEN      from './srd/spells.i18n.json';
import spellsIT      from './srd/spells.i18n.it.json';
import weaponsEN     from './srd/weapons.i18n.json';
import weaponsIT     from './srd/weapons.i18n.it.json';
import conditionsEN  from './srd/conditions.i18n.json';
import conditionsIT  from './srd/conditions.i18n.it.json';
import classesEN     from './srd/classes.i18n.json';
import classesIT     from './srd/classes.i18n.it.json';
import speciesEN     from './srd/species.i18n.json';
import speciesIT     from './srd/species.i18n.it.json';
import backgroundsEN from './srd/backgrounds.i18n.json';
import backgroundsIT from './srd/backgrounds.i18n.it.json';

const I18N = {
  spells:      { en: spellsEN,      it: spellsIT },
  weapons:     { en: weaponsEN,     it: weaponsIT },
  conditions:  { en: conditionsEN,  it: conditionsIT },
  classes:     { en: classesEN,     it: classesIT },
  species:     { en: speciesEN,     it: speciesIT },
  backgrounds: { en: backgroundsEN, it: backgroundsIT },
};

const HOMEBREW_KEY    = 'characterforge_homebrew';
const SCHEMA_VERSION  = '1.0.0';

// Resolve language code to one we have translations for (en fallback)
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

function mergeByKey(srdList, hbList, keyFn = item => item.name) {
  const map = new Map(srdList.map(item => [keyFn(item), item]));
  hbList.forEach(item => map.set(keyFn(item), { ...item, _homebrew: true }));
  return Array.from(map.values());
}

// ── Detect current language from i18next (optional dependency) ───────────────
function getCurrentLang() {
  try {
    // Works if i18next is initialised; safe no-op otherwise
    return window.__i18n_lang__ || 'en';
  } catch { return 'en'; }
}

const dataManager = {
  // ── Incantesimi ──────────────────────────────────────────────────────────
  getSpells(lang = getCurrentLang()) {
    const tr  = loadI18n('spells', lang);
    const hb  = loadHomebrew().flatMap(s => s.spells || []);
    const srd = SRD_SPELLS.map(s => ({
      ...s,
      ...(tr[s.id] || {}),
    }));
    return mergeByKey(srd, hb);
  },

  // ── Armi ─────────────────────────────────────────────────────────────────
  getWeapons(lang = getCurrentLang()) {
    const tr  = loadI18n('weapons', lang);
    const hb  = loadHomebrew().flatMap(s => s.weapons || []);
    const srd = SRD_WEAPONS.map(w => ({
      ...w,
      name:    tr[w.id]?.name    || w.id,
      dmgType: tr[w.id]?.dmgType || '',
    }));
    return mergeByKey(srd, hb);
  },

  // ── Condizioni ───────────────────────────────────────────────────────────
  getConditions(lang = getCurrentLang()) {
    const tr  = loadI18n('conditions', lang);
    const hb  = loadHomebrew().flatMap(s => s.conditions || []);
    const srd = SRD_CONDITIONS.map(c => ({
      ...c,
      ...(tr[c.id] || {}),
    }));
    return mergeByKey(srd, hb, item => item.id);
  },

  // ── Classi ───────────────────────────────────────────────────────────────
  getClasses(lang = getCurrentLang()) {
    const tr      = loadI18n('classes', lang);
    const hbNames = loadHomebrew()
      .flatMap(s => (s.classes || []).map(c => c.name))
      .filter(n => !SRD_CLASS_NAMES.includes(n));
    // Return EN names for compatibility with HIT_DICE / CLASS_SAVE_PROFS keys
    return [...SRD_CLASS_NAMES, ...hbNames];
  },

  getClassData(name, lang = getCurrentLang()) {
    const tr  = loadI18n('classes', lang);
    const srd = SRD_CLASSES.find(c => c.name === name);
    if (srd) return { ...srd, ...(tr[name] || {}) };
    for (const src of loadHomebrew()) {
      const cls = (src.classes || []).find(c => c.name === name);
      if (cls) return { ...cls, _homebrew: true };
    }
    return null;
  },

  // ── Specie ───────────────────────────────────────────────────────────────
  getSpecies(lang = getCurrentLang()) {
    const tr     = loadI18n('species', lang);
    const srdIds = SRD_SPECIES.map(s => s.id);
    const srd    = SRD_SPECIES.map(s => ({ ...s, ...(tr[s.id] || {}) }));
    const hbExtra = loadHomebrew()
      .flatMap(s => (s.species || []))
      .filter(sp => !srdIds.includes(sp.id || sp.name))
      .map(sp => ({ id: sp.id || sp.name, name: sp.name, _homebrew: true }));
    return [...srd, ...hbExtra];
  },

  getSpeciesData(id, lang = getCurrentLang()) {
    const tr  = loadI18n('species', lang);
    const srd = SRD_SPECIES.find(s => s.id === id);
    if (srd) return { ...srd, ...(tr[id] || {}) };
    for (const src of loadHomebrew()) {
      const sp = (src.species || []).find(s => s.id === id || s.name === id);
      if (sp) return { ...sp, _homebrew: true };
    }
    return null;
  },

  // ── Background ───────────────────────────────────────────────────────────
  getBackgrounds(lang = getCurrentLang()) {
    const tr     = loadI18n('backgrounds', lang);
    const srdIds = SRD_BACKGROUNDS.map(b => b.id);
    const srd    = SRD_BACKGROUNDS.map(b => ({ ...b, ...(tr[b.id] || {}) }));
    const hbExtra = loadHomebrew()
      .flatMap(s => s.backgrounds || [])
      .filter(b => !srdIds.includes(b.id))
      .map(b => ({ ...b, _homebrew: true }));
    return [...srd, ...hbExtra];
  },

  // ── Sottoclassi ──────────────────────────────────────────────────────────
  getSubclasses(cls) {
    return loadHomebrew()
      .flatMap(s => (s.subclasses || []).filter(sc => sc.class === cls).map(sc => sc.name));
  },

  // ── Sorgenti ─────────────────────────────────────────────────────────────
  getSources() {
    const hb = loadHomebrew();
    const srdCounts = {
      spells:      SRD_SPELLS.length,
      weapons:     SRD_WEAPONS.length,
      classes:     SRD_CLASS_NAMES.length,
      species:     SRD_SPECIES.length,
      backgrounds: SRD_BACKGROUNDS.length,
      conditions:  SRD_CONDITIONS.length,
    };
    return [
      { id: 'srd', name: 'SRD 5.2.1', author: 'Wizards of the Coast', type: 'srd', counts: srdCounts },
      ...hb.map(s => ({
        ...s,
        type: 'homebrew',
        counts: {
          spells:      (s.spells || []).length,
          weapons:     (s.weapons || []).length,
          classes:     (s.classes || []).length,
          species:     (s.species || []).length,
          backgrounds: (s.backgrounds || []).length,
          conditions:  (s.conditions || []).length,
          items:       (s.items || []).length,
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
