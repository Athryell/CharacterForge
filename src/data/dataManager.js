// CharacterForge — dataManager
// Singleton che fonde dati SRD built-in con pacchetti homebrew salvati in localStorage.
// I pacchetti homebrew NON vanno mai nel codice sorgente o nel repo.

import { SRD_SPELLS } from './spells';
import { WEAPON_PRESETS } from './weapons';
import { CONDITIONS } from './conditions';
import { SRD_CLASSES, SRD_CLASS_NAMES } from './srd/classes';
import { SRD_SPECIES } from './srd/species';
import { SRD_BACKGROUNDS } from './srd/backgrounds';

const HOMEBREW_KEY = 'characterforge_homebrew';
const SCHEMA_VERSION = '1.0.0';

function loadHomebrew() {
  try { return JSON.parse(localStorage.getItem(HOMEBREW_KEY)) || []; }
  catch { return []; }
}

function saveHomebrew(sources) {
  try { localStorage.setItem(HOMEBREW_KEY, JSON.stringify(sources)); }
  catch (e) { console.error('dataManager: failed to save homebrew', e); }
}

function mergeByName(srdList, hbList, keyFn = item => item.name) {
  const map = new Map(srdList.map(item => [keyFn(item), item]));
  hbList.forEach(item => map.set(keyFn(item), { ...item, _homebrew: true }));
  return Array.from(map.values());
}

const dataManager = {
  // ── Incantesimi ──────────────────────────────────────────────
  getSpells() {
    const hb = loadHomebrew().flatMap(s => s.spells || []);
    return mergeByName(SRD_SPELLS, hb);
  },

  // ── Armi ─────────────────────────────────────────────────────
  getWeapons() {
    const hb = loadHomebrew().flatMap(s => s.weapons || []);
    return mergeByName(WEAPON_PRESETS, hb);
  },

  // ── Classi ───────────────────────────────────────────────────
  getClasses() {
    const hbNames = loadHomebrew()
      .flatMap(s => (s.classes || []).map(c => c.name))
      .filter(n => !SRD_CLASS_NAMES.includes(n));
    return [...SRD_CLASS_NAMES, ...hbNames];
  },

  getClassData(name) {
    const srd = SRD_CLASSES.find(c => c.name === name);
    if (srd) return srd;
    for (const src of loadHomebrew()) {
      const cls = (src.classes || []).find(c => c.name === name);
      if (cls) return { ...cls, _homebrew: true };
    }
    return null;
  },

  // ── Specie ───────────────────────────────────────────────────
  getSpecies() {
    const srdNames = SRD_SPECIES.map(s => s.name);
    const hbNames = loadHomebrew()
      .flatMap(s => (s.species || []).map(sp => sp.name))
      .filter(n => !srdNames.includes(n));
    return [...srdNames, ...hbNames];
  },

  getSpeciesData(name) {
    const srd = SRD_SPECIES.find(s => s.name === name);
    if (srd) return srd;
    for (const src of loadHomebrew()) {
      const sp = (src.species || []).find(s => s.name === name);
      if (sp) return { ...sp, _homebrew: true };
    }
    return null;
  },

  // ── Background ───────────────────────────────────────────────
  getBackgrounds() {
    const srdNames = SRD_BACKGROUNDS.map(b => b.name);
    const hbExtra = loadHomebrew()
      .flatMap(s => s.backgrounds || [])
      .filter(b => !srdNames.includes(b.name))
      .map(b => ({ ...b, _homebrew: true }));
    return [...SRD_BACKGROUNDS, ...hbExtra];
  },

  // ── Sottoclassi ──────────────────────────────────────────────
  getSubclasses(cls) {
    return loadHomebrew()
      .flatMap(s => (s.subclasses || []).filter(sc => sc.class === cls).map(sc => sc.name));
  },

  // ── Condizioni ───────────────────────────────────────────────
  getConditions() {
    const hb = loadHomebrew().flatMap(s => s.conditions || []);
    return mergeByName(CONDITIONS, hb, item => item.id);
  },

  // ── Sorgenti ─────────────────────────────────────────────────
  getSources() {
    const hb = loadHomebrew();
    const srdCounts = {
      spells: SRD_SPELLS.length,
      weapons: WEAPON_PRESETS.length,
      classes: SRD_CLASS_NAMES.length,
      species: SRD_SPECIES.length,
      backgrounds: SRD_BACKGROUNDS.length,
      conditions: CONDITIONS.length,
    };
    return [
      { id: 'srd', name: 'SRD 5.2', author: 'Wizards of the Coast', type: 'srd', counts: srdCounts },
      ...hb.map(s => ({
        ...s,
        type: 'homebrew',
        counts: {
          spells: (s.spells || []).length,
          weapons: (s.weapons || []).length,
          classes: (s.classes || []).length,
          species: (s.species || []).length,
          backgrounds: (s.backgrounds || []).length,
          conditions: (s.conditions || []).length,
          items: (s.items || []).length,
        },
      })),
    ];
  },

  addSource(json) {
    const errors = [];
    if (!json || typeof json !== 'object') { errors.push('Il file non è un oggetto JSON valido.'); return { ok: false, errors }; }
    if (!json.id) errors.push('Campo "id" mancante o vuoto.');
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
