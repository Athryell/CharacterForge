import dataManager from '../data/dataManager';
import PLUGINS, { getPlugin } from '../systems/registry';

// The schemas themselves now live with their systems, in
// src/systems/<id>/homebrew.js. A system with no schema simply cannot hold
// homebrew content, and never appears in the HomebrewEditor system dropdown.

export function getHomebrewSchema(systemId) {
  return getPlugin(systemId).homebrew?.schema || {};
}

// Systems that can actually hold homebrew, in registry order.
export function getHomebrewSystems() {
  return PLUGINS.filter(p => p.homebrew?.schema).map(p => p.meta);
}

export function resolveOptionsFrom(key, systemId) {
  if (key === 'dnd5e.classNames')   return dataManager.getClasses(undefined, systemId);
  if (key === 'dnd5e.abilityNames') return ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  return [];
}
