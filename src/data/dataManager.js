// Unified access point for system data (SRD) plus imported homebrew.
//
// Every getter takes `systemId` FIRST and an options bag second. That uniformity
// is deliberate: the old surface had getArmors(systemId) taking it first while
// getSpells(lang, systemId) took it second, and six methods didn't accept it at
// all and silently returned D&D data to every system.
//
// This module deliberately does no work at import time — it only calls
// getPlugin() from inside methods. config/homebrewSchema.js and the D&D creator
// both import it while the registry is still evaluating, so touching the
// registry at module scope would be an initialisation-order hazard.

import PLUGINS, { getPlugin, SYSTEM_METAS, DEFAULT_SYSTEM } from '../systems/registry';

const HOMEBREW_KEY   = 'characterforge_homebrew';
const SCHEMA_VERSION = '1.0.0';

// Returned when a system has no adapter, so callers can chain without guards.
const NULL_ADAPTER = {
  systemId: null,
  getSpells: () => [], getWeapons: () => [], getConditions: () => [],
  getArmors: () => [], getClasses: () => [], getClassData: () => null,
  getSpecies: () => [], getBackgrounds: () => [],
};

// Homebrew entries are matched to SRD entries by name, except conditions, which
// carry a stable id. A homebrew entry with a matching key REPLACES the SRD one.
const KEY_FIELD = { conditions: 'id' };

function keyOf(item, type) {
  const field = KEY_FIELD[type] || 'name';
  return item[field] ?? item.id ?? item.name;
}

function mergeHomebrew(srd, homebrew, type) {
  if (!homebrew.length) return srd;
  const map = new Map(srd.map(item => [keyOf(item, type), item]));
  homebrew.forEach(item => {
    const entry = { ...item, _homebrew: true };
    if (entry.id == null && entry.name != null) entry.id = entry.name;
    map.set(keyOf(entry, type), entry);
  });
  return [...map.values()];
}

function loadHomebrew() {
  try { return JSON.parse(localStorage.getItem(HOMEBREW_KEY)) || []; }
  catch { return []; }
}

function saveHomebrew(sources) {
  try { localStorage.setItem(HOMEBREW_KEY, JSON.stringify(sources)); }
  catch (e) { console.error('dataManager: failed to save homebrew', e); }
}

function homebrewEntries(systemId, type) {
  return loadHomebrew()
    .filter(s => (s.system || DEFAULT_SYSTEM) === systemId)
    .flatMap(s => s[type] || []);
}

function getCurrentLang() {
  try { return window.__i18n_lang__ || 'en'; }
  catch { return 'en'; }
}

// The one shape every data getter follows: ask the adapter for the SRD list,
// hand it this system's translations, then merge this system's homebrew over it.
function collect(systemId, type, method, lang) {
  const adapter = getPlugin(systemId).data || NULL_ADAPTER;
  const tr  = adapter.getI18n?.(type, lang) || {};
  const srd = adapter[method]?.(lang, tr) || [];
  return mergeHomebrew(srd, homebrewEntries(systemId, type), type);
}

const dataManager = {
  // ── Adapter registry ─────────────────────────────────────────────────────
  getAdapter(systemId = DEFAULT_SYSTEM) {
    return getPlugin(systemId).data || NULL_ADAPTER;
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  getSpells(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'spells', 'getSpells', lang);
  },

  getWeapons(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'weapons', 'getWeapons', lang);
  },

  getConditions(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'conditions', 'getConditions', lang);
  },

  getArmors(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'armors', 'getArmors', lang);
  },

  getSpecies(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'species', 'getSpecies', lang);
  },

  getBackgrounds(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'backgrounds', 'getBackgrounds', lang);
  },

  getItems(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    return collect(systemId, 'items', 'getItems', lang);
  },

  getSpeciesData(systemId = DEFAULT_SYSTEM, id, { lang = getCurrentLang() } = {}) {
    return this.getSpecies(systemId, { lang }).find(s => s.id === id || s.name === id) || null;
  },

  // ── Classes ──────────────────────────────────────────────────────────────
  getClasses(systemId = DEFAULT_SYSTEM, { lang = getCurrentLang() } = {}) {
    const adapter = this.getAdapter(systemId);
    const srd = adapter.getClasses?.() || [];
    const hb = homebrewEntries(systemId, 'classes')
      .map(c => c.name)
      .filter(n => n && !srd.includes(n));
    return [...srd, ...hb];
  },

  getClassData(systemId = DEFAULT_SYSTEM, name, { lang = getCurrentLang() } = {}) {
    const adapter = this.getAdapter(systemId);
    const tr = adapter.getI18n?.('classes', lang) || {};
    const cls = adapter.getClassData?.(name, tr);
    if (cls) return cls;
    const hb = homebrewEntries(systemId, 'classes').find(c => c.name === name);
    return hb ? { ...hb, _homebrew: true } : null;
  },

  // ── Subclasses (homebrew only — the SRD ones live in the class data) ─────
  getSubclasses(systemId = DEFAULT_SYSTEM, cls) {
    return homebrewEntries(systemId, 'subclasses')
      .filter(sc => sc.class === cls)
      .map(sc => sc.name);
  },

  getSubclassDetails(systemId = DEFAULT_SYSTEM, cls, name) {
    return homebrewEntries(systemId, 'subclasses')
      .find(sc => sc.class === cls && sc.name === name) || null;
  },

  // ── Sources ──────────────────────────────────────────────────────────────
  getSources() {
    const bundled = SYSTEM_METAS
      .map(meta => ({ meta, info: getPlugin(meta.id).homebrew?.sourceInfo?.() }))
      .filter(x => x.info)
      .map(({ meta, info }) => ({ ...info, system: meta.id, type: 'srd' }));

    const imported = loadHomebrew().map(s => ({
      ...s,
      type: 'homebrew',
      counts: Object.fromEntries(
        ['classes', 'subclasses', 'species', 'backgrounds', 'spells',
         'weapons', 'armors', 'items', 'conditions', 'feats']
          .map(k => [k, (s[k] || []).length])
      ),
    }));

    return [...bundled, ...imported];
  },

  addSource(json) {
    const errors = [];
    if (!json || typeof json !== 'object') {
      return { ok: false, errors: ['Il file non è un oggetto JSON valido.'] };
    }
    if (!json.id)   errors.push('Campo "id" mancante o vuoto.');
    if (!json.name) errors.push('Campo "name" mancante o vuoto.');
    const size = new Blob([JSON.stringify(json)]).size;
    if (size > 2 * 1024 * 1024) {
      errors.push(`Il pacchetto è troppo grande (${(size / 1024 / 1024).toFixed(1)} MB, max 2 MB).`);
    }
    if (errors.length) return { ok: false, errors };

    const sources = loadHomebrew();
    const idx = sources.findIndex(s => s.id === json.id);
    if (idx >= 0) sources[idx] = json; else sources.push(json);
    saveHomebrew(sources);
    return { ok: true, errors: [], counts: this.getSources().find(s => s.id === json.id)?.counts };
  },

  removeSource(id) {
    saveHomebrew(loadHomebrew().filter(s => s.id !== id));
  },

  getSourceRaw(id) {
    return loadHomebrew().find(s => s.id === id) || null;
  },

  exportSchema(systemId = DEFAULT_SYSTEM) {
    const template = getPlugin(systemId).homebrew?.exportTemplate?.() || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      id: `homebrew-${Date.now()}`,
      name: 'Il mio Homebrew',
      author: '',
      description: '',
      system: systemId,
      ...template,
    };
  },

  exportAllHomebrew() {
    return loadHomebrew();
  },

  // Systems that ship a bundled ruleset, for UI that lists them.
  getBundledSystems() {
    return PLUGINS.filter(p => p.homebrew?.sourceInfo).map(p => p.meta);
  },
};

export default dataManager;
