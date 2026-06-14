// Multi-character storage helpers

const INDEX_KEY  = 'characterforge_chars_index';
const CHAR_KEY   = id => `characterforge_char_${id}`;
const ACTIVE_KEY = 'characterforge_active';
const LEGACY_KEY = 'characterforge_state';

export function loadCharsIndex() {
  try { const v = localStorage.getItem(INDEX_KEY); return v ? JSON.parse(v) : []; } catch { return []; }
}

export function saveCharsIndex(chars) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(chars)); } catch {}
}

export function loadCharState(id) {
  try { const v = localStorage.getItem(CHAR_KEY(id)); return v ? JSON.parse(v) : null; } catch { return null; }
}

export function saveCharState(id, state) {
  try { localStorage.setItem(CHAR_KEY(id), JSON.stringify(state)); } catch {}
  // update index entry
  try {
    const idx = loadCharsIndex();
    const entry = { id, name: state.charName || 'Personaggio', charClass: state.charClass || '', charLevel: state.charLevel || 1, lastSaved: new Date().toISOString(), system: state.system || 'dnd5e2024' };
    const next = idx.find(c => c.id === id) ? idx.map(c => c.id === id ? entry : c) : [...idx, entry];
    saveCharsIndex(next);
  } catch {}
}

export function getCharsBySystem(systemId) {
  return loadCharsIndex().filter(c => (c.system || 'dnd5e2024') === systemId);
}

export function deleteChar(id) {
  try { localStorage.removeItem(CHAR_KEY(id)); } catch {}
  saveCharsIndex(loadCharsIndex().filter(c => c.id !== id));
  if (getActiveCharId() === id) setActiveCharId(null);
}

export function getActiveCharId() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function setActiveCharId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
}

export function generateCharId() {
  return 'char_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// Migrate from single-char legacy storage on first run
export function migrateLegacy(createDefaultState) {
  if (loadCharsIndex().length > 0) return; // already migrated
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const state = { ...createDefaultState(), ...JSON.parse(raw) };
    const id = generateCharId();
    saveCharState(id, state);
    setActiveCharId(id);
  } catch {}
}
