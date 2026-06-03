import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createDefaultState, getMod, getProfBonus, fmtMod,
  SPELLCASTING_CLASS, HIT_DICE, SLOT_TABLE, SKILLS, JSON_SCHEMA_VERSION,
} from '../data/systems/dnd5e/mechanics';
import { saveCharState, loadCharState } from '../chars';
const LEGACY_KEY = 'characterforge_state';

function loadFromStorage(charId) {
  try {
    if (charId) {
      const saved = loadCharState(charId);
      if (saved) return { ...createDefaultState(), ...saved };
    } else {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) return { ...createDefaultState(), ...JSON.parse(raw) };
    }
  } catch { /* ignore */ }
  return createDefaultState();
}

export function useCharacter(charId) {
  const charIdRef = useRef(charId);
  const [state, setState] = useState(() => loadFromStorage(charId));

  // Reload state when charId changes
  useEffect(() => {
    if (charId !== charIdRef.current) {
      charIdRef.current = charId;
      setState(loadFromStorage(charId));
    }
  }, [charId]);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      const id = charIdRef.current;
      if (id) saveCharState(id, next);
      else { try { localStorage.setItem(LEGACY_KEY, JSON.stringify(next)); } catch {} }
      return next;
    });
  }, []);

  // ── Derived values ──────────────────────────────────────────────
  const level = state.charLevel || 1;
  const profBonus = getProfBonus(level);

  function abilityMod(attr) {
    return getMod(state.abilities[attr] || 10);
  }

  function calcSaveMod(attr) {
    const base = abilityMod(attr);
    const prof = state.saveProficiencies.includes(attr) ? profBonus : 0;
    return base + prof;
  }

  function calcSkillMod(skill) {
    const base = abilityMod(skill.attr);
    if (state.skillExpertise.includes(skill.id)) return base + profBonus * 2;
    if (state.skillProficiencies.includes(skill.id)) return base + profBonus;
    return base;
  }

  const passivePerception = 10 + calcSkillMod(SKILLS.find(s => s.id === 'perception'));
  const initiative = fmtMod(abilityMod('DEX'));
  const hitDice = `${level}× ${HIT_DICE[state.charClass] || 'd8'}`;

  // Spellcasting
  const spellStat = SPELLCASTING_CLASS[state.charClass];
  const spellMod = spellStat ? abilityMod(spellStat) : 0;
  const spellSaveDC = spellStat ? 8 + profBonus + spellMod : null;
  const spellAttackBonus = spellStat ? fmtMod(profBonus + spellMod) : null;

  // ── Mutators ────────────────────────────────────────────────────
  function setAbility(attr, value) {
    update(prev => ({
      ...prev,
      abilities: { ...prev.abilities, [attr]: Math.max(3, Math.min(30, parseInt(value) || 10)) },
    }));
  }

  function toggleSaveProficiency(attr) {
    update(prev => {
      const has = prev.saveProficiencies.includes(attr);
      return {
        ...prev,
        saveProficiencies: has
          ? prev.saveProficiencies.filter(a => a !== attr)
          : [...prev.saveProficiencies, attr],
      };
    });
  }

  function toggleSkillProficiency(skillName) {
    update(prev => {
      const prof = prev.skillProficiencies.includes(skillName);
      const exp = prev.skillExpertise.includes(skillName);
      if (!prof) return { ...prev, skillProficiencies: [...prev.skillProficiencies, skillName] };
      if (!exp)  return { ...prev, skillExpertise: [...prev.skillExpertise, skillName] };
      return {
        ...prev,
        skillProficiencies: prev.skillProficiencies.filter(s => s !== skillName),
        skillExpertise: prev.skillExpertise.filter(s => s !== skillName),
      };
    });
  }

  function modHP(delta) {
    update(prev => {
      const next = Math.max(0, Math.min(prev.hpMax, prev.hpCurrent + delta));
      return { ...prev, hpCurrent: next };
    });
  }

  function longRest() {
    update(prev => {
      const slots = (SLOT_TABLE[prev.charLevel] || SLOT_TABLE[1]).map(max => ({ max, used: 0 }));
      return { ...prev, hpCurrent: prev.hpMax, spellSlots: slots };
    });
  }

  function shortRest() {
    // Subclasses like Fighter/Warlock recover differently; base: nothing by default
    // Hook returns a message — caller can extend
    return 'Riposo breve completato. Usa i dadi vita per recuperare HP.';
  }

  function onClassOrLevelChange(patch) {
    update(prev => {
      const next = { ...prev, ...patch };
      const level = next.charLevel || 1;
      const slots = (SLOT_TABLE[level] || SLOT_TABLE[1]).map(max => ({ max, used: 0 }));
      return { ...next, spellSlots: slots };
    });
  }

  function toggleSpellSlot(levelIdx, pipIdx) {
    update(prev => {
      const slots = prev.spellSlots.map((s, i) => {
        if (i !== levelIdx) return s;
        const used = pipIdx < s.used ? pipIdx : pipIdx + 1;
        return { ...s, used };
      });
      return { ...prev, spellSlots: slots };
    });
  }

  function toggleSpellPrepared(spellName) {
    update(prev => ({
      ...prev,
      spells: prev.spells.map(s =>
        s.name === spellName ? { ...s, prepared: !s.prepared } : s
      ),
    }));
  }

  function addAction(action) {
    update(prev => ({ ...prev, actions: [...prev.actions, action] }));
  }

  function removeAction(id) {
    update(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));
  }

  function addSpell(spell) {
    update(prev => ({ ...prev, spells: [...prev.spells, spell] }));
  }

  function removeSpell(name) {
    update(prev => ({ ...prev, spells: prev.spells.filter(s => s.name !== name) }));
  }

  function addEquipment(item) {
    update(prev => ({ ...prev, equipment: [...prev.equipment, item] }));
  }

  function removeEquipment(idx) {
    update(prev => ({ ...prev, equipment: prev.equipment.filter((_, i) => i !== idx) }));
  }

  function save(s) {
    const id = charIdRef.current;
    if (id) saveCharState(id, s);
    else { try { localStorage.setItem(LEGACY_KEY, JSON.stringify(s)); } catch {} }
  }

  function importState(imported) {
    const merged = { ...createDefaultState(), ...imported, schemaVersion: JSON_SCHEMA_VERSION };
    setState(merged);
    save(merged);
  }

  function exportState() {
    return JSON.stringify(state, null, 2);
  }

  function resetState() {
    const fresh = createDefaultState();
    setState(fresh);
    save(fresh);
  }

  return {
    state, update,
    // derived
    profBonus, initiative, passivePerception, hitDice,
    spellStat, spellSaveDC, spellAttackBonus,
    // calculators
    abilityMod, calcSaveMod, calcSkillMod, fmtMod,
    // mutators
    setAbility, toggleSaveProficiency, toggleSkillProficiency,
    modHP, longRest, shortRest, onClassOrLevelChange,
    toggleSpellSlot, toggleSpellPrepared,
    addAction, removeAction, addSpell, removeSpell,
    addEquipment, removeEquipment,
    importState, exportState, resetState,
  };
}

// Patch for new features — appended
export function extendState(state) {
  return {
    conditions: [],
    weapons: [],
    ...state,
  };
}
