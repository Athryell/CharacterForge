import { useState, useMemo } from 'react';
import { ABILITIES, SPELLCASTING_CLASS, getMod } from './data/mechanics';
import { DND_ARMOR_PRESETS } from './data/armors';
import { parseTextBonuses, resolveNotations } from '../../components/Tooltip';

// UI state and derived values that only this system's widgets need.
// A hook, not part of rules.js, because these depend on React state and on the
// unit preferences — neither of which a pure rules function can reach.
//
// Safe to call through a variable because CharacterApp remounts on a system
// switch (the key added in phase 3); without that, swapping the hook set under
// a live component would break the rules of hooks.
export default function useWidgetState({ state, char, units }) {
  const { toDisplaySpeed, speedUnit, weightUnit } = units;

  const [editingCombat, setEditingCombat]       = useState(false);
  const [editingResources, setEditingResources] = useState(false);
  const [addingResource, setAddingResource]     = useState(false);
  const [concentrationCheck, setConcentrationCheck] = useState(null);
  const [newResource, setNewResource] = useState({ name:'', icon:'d6', formula:'fixed:1', resetOn:'long', pinned:false });

  const actionNames = new Set((state.actions||[]).map(a => a.name));
  const hasSpells = !!SPELLCASTING_CLASS[state.charClass];

  const { equipBonuses, equipBonusesDetailed } = useMemo(() => {
    const totals = {};
    const detailed = {};
    const add = (stat, value, name) => {
      totals[stat] = (totals[stat] || 0) + Number(value);
      detailed[stat] = detailed[stat] || [];
      detailed[stat].push({ name, value: Number(value) });
    };
    [...(state.weapons||[]), ...(state.equipment||[])].forEach(item => {
      (item.bonuses||[]).forEach(({ stat, value }) => add(stat, value, item.name));
      const resolvedDesc = resolveNotations(item.desc, state.abilities, state.charLevel, char.profBonus);
      parseTextBonuses(resolvedDesc).forEach(({ stat, value }) => add(stat, value, item.name));
    });
    return { equipBonuses: totals, equipBonusesDetailed: detailed };
  }, [state.weapons, state.equipment, state.abilities, state.charLevel, char.profBonus]);

  const effectiveAbilities = useMemo(() => {
    // Guarded because a non-D&D character no longer carries an `abilities`
    // object at all: useCharacter used to merge the D&D default state into
    // every sheet, which is what made this safe by accident.
    const scores = state.abilities || {};
    const result = {};
    ABILITIES.forEach(attr => { result[attr] = (scores[attr] || 10) + (equipBonuses[attr] || 0); });
    return result;
  }, [state.abilities, equipBonuses]);

  const acDerivedData = useMemo(() => {
    const dexMod = getMod(effectiveAbilities.DEX);
    const armors = state.armors || [];
    const ea = armors.find(a => a.type === 'armor' && a.equipped);
    const preset = ea?.presetId ? DND_ARMOR_PRESETS.find(p => p.id === ea.presetId) : null;
    const dexContrib = preset
      ? (preset.type === 'heavy' ? 0 : Math.min(dexMod, preset.maxDex ?? 100))
      : ea
        ? (ea.armorType === 'heavy' ? 0 : ea.armorType === 'medium' ? Math.min(dexMod, 2) : dexMod)
        : dexMod;
    const shields = armors.filter(a => a.type === 'shield' && a.equipped);
    const shieldBonus = shields.reduce((s, sh) => s + (sh.acValue || 2), 0);
    return { dexContrib, shieldBonus, hasShield: shields.length > 0, preset, ea, shields };
  }, [state.armors, effectiveAbilities]);

  // STR speed penalty: 10 ft if equipped preset armor has strReq and STR < strReq
  const strSpeedPenaltyFt = useMemo(() => {
    const armors = state.armors || [];
    const ea = armors.find(a => a.type === 'armor' && a.equipped && a.presetId);
    if (!ea) return 0;
    const preset = DND_ARMOR_PRESETS.find(p => p.id === ea.presetId);
    if (!preset || !preset.strReq) return 0;
    return (effectiveAbilities.STR || 10) < preset.strReq ? 10 : 0;
  }, [state.armors, effectiveAbilities.STR]);

  const strPenaltyText = `${toDisplaySpeed(10)} ${speedUnit === 'sq' ? '□' : speedUnit}`;

  const { currentWeightKg, maxWeightKg, coinWeightKg } = useMemo(() => {
    const strScore = state.abilities?.STR || 10;
    const inventoryW = (state.equipment || []).reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.qty || 1), 0);
    const weaponW = (state.weapons || []).reduce((s, w) => s + (parseFloat(w.weight) || 0), 0);
    const armorW = (state.armors || []).reduce((s, a) => s + (parseFloat(a.weight) || 0), 0);
    const totalCoins = Object.values(state.currency || {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const coinW_raw = Math.floor(totalCoins / 50);
    const coinW = weightUnit === 'lbs' ? coinW_raw * 2 : coinW_raw;
    const maxW = weightUnit === 'lbs' ? strScore * 15 : strScore * 7;
    return { currentWeightKg: inventoryW + weaponW + armorW + coinW, maxWeightKg: maxW, coinWeightKg: coinW };
  }, [state.equipment, state.weapons, state.armors, state.currency, state.abilities, weightUnit]);
  return {
    ui: {
      editingCombat, setEditingCombat, editingResources, setEditingResources,
      addingResource, setAddingResource, newResource, setNewResource,
      concentrationCheck, setConcentrationCheck,
      currentWeightKg, maxWeightKg, coinWeightKg,
    },
    derived: {
      equipBonuses, equipBonusesDetailed, effectiveAbilities, acDerivedData,
      strSpeedPenaltyFt, strPenaltyText, hasSpells, actionNames,
    },
  };
}
