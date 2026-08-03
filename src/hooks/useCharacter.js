import { useState, useCallback, useEffect, useRef } from 'react';
import { getPlugin, DEFAULT_SYSTEM } from '../systems/registry';
import { saveCharState, loadCharState } from '../chars';

const LEGACY_KEY = 'characterforge_state';

// Storage, identity and generic list mutation. Everything rule-shaped —
// proficiency, spell slots, rests, level up — lives in the active system's
// rules.js and is spread onto the returned object without the core ever reading
// a key by name.

function pluginFor(charState) {
  return getPlugin(charState?.system || DEFAULT_SYSTEM);
}

function hydrate(saved) {
  const sys = pluginFor(saved);
  const base = sys.state?.create?.() ?? {};
  const merged = { ...base, ...saved, system: saved.system || sys.meta.id };
  return sys.state?.normalize ? sys.state.normalize(merged) : merged;
}

function loadFromStorage(charId) {
  try {
    if (charId) {
      const saved = loadCharState(charId);
      if (saved) return hydrate(saved);
    } else {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) return hydrate(JSON.parse(raw));
    }
  } catch { /* fall through to a fresh sheet */ }
  return getPlugin(DEFAULT_SYSTEM).state.create();
}

export function useCharacter(charId) {
  const charIdRef = useRef(charId);
  const [state, setState] = useState(() => loadFromStorage(charId));

  useEffect(() => {
    if (charId !== charIdRef.current) {
      charIdRef.current = charId;
      setState(loadFromStorage(charId));
    }
  }, [charId]);

  const persist = useCallback(next => {
    const id = charIdRef.current;
    if (id) saveCharState(id, next, pluginFor(next).state?.charIndexEntry);
    else { try { localStorage.setItem(LEGACY_KEY, JSON.stringify(next)); } catch { /* quota */ } }
  }, []);

  const update = useCallback(patch => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, [persist]);

  const sys = pluginFor(state);
  const { derived = {}, actions = {} } = sys.rules?.({ state, update }) ?? {};

  // ── Generic list mutation ───────────────────────────────────────────────
  const addTo = useCallback((listKey, item) => {
    update(prev => ({ ...prev, [listKey]: [...(prev[listKey] || []), item] }));
  }, [update]);

  const removeFrom = useCallback((listKey, predicate) => {
    update(prev => ({ ...prev, [listKey]: (prev[listKey] || []).filter(predicate) }));
  }, [update]);

  function save(s) { persist(s); }

  function importState(imported) {
    const merged = hydrate({ ...imported, schemaVersion: sys.state?.schemaVersion });
    setState(merged);
    persist(merged);
  }

  function exportState() {
    return JSON.stringify(state, null, 2);
  }

  function resetState() {
    const fresh = sys.state.create();
    setState(fresh);
    persist(fresh);
  }

  return {
    state, update, save,
    addTo, removeFrom,

    // Named list mutators kept for the existing call sites.
    addAction:     a   => addTo('actions', a),
    removeAction:  id  => removeFrom('actions', a => a.id !== id),
    addSpell:      s   => addTo('spells', s),
    removeSpell:   n   => removeFrom('spells', s => s.name !== n),
    addEquipment:  i   => addTo('equipment', i),
    removeEquipment: idx => update(prev => ({
      ...prev, equipment: (prev.equipment || []).filter((_, i) => i !== idx),
    })),

    importState, exportState, resetState,

    // The active system's rules, opaque to this hook.
    derived, actions,
    // Transitional: keeps char.profBonus resolving at ~30 existing call sites.
    // Drop once the widgets move into the plugins and read ctx.derived instead.
    ...derived, ...actions,
  };
}
