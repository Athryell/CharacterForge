import dnd5e2024   from './dnd5e2024';
import daggerheart from './daggerheart';
import custom      from './custom';
import unknownSystem from './unknown';

// The only file in the codebase that names concrete game systems.
// Adding a system is one line here plus its folder — nothing else in src/
// should need to change.
const PLUGINS = [dnd5e2024, daggerheart, custom];

const BY_ID = new Map(PLUGINS.map(p => [p.meta.id, p]));

export const SYSTEM_IDS     = PLUGINS.map(p => p.meta.id);
export const DEFAULT_SYSTEM = PLUGINS[0].meta.id;
export const SYSTEM_METAS   = PLUGINS
  .map(p => p.meta)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export function getPlugin(id) {
  return BY_ID.get(id) || unknownSystem;
}

export function supports(id, capability) {
  return !!getPlugin(id).capabilities[capability];
}

export function isKnownSystem(id) {
  return BY_ID.has(id);
}

// Icon ids contributed by plugins, merged over the core map by config/icons.jsx.
// A plugin may add new ids or override its own; two plugins claiming the same id
// is a bug, so say so loudly in development.
export function collectPluginIcons() {
  const merged = {};
  const owner  = {};
  PLUGINS.forEach(p => {
    Object.entries(p.icons || {}).forEach(([iconId, entry]) => {
      if (owner[iconId] && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[systems] icon "${iconId}" is claimed by both "${owner[iconId]}" and ` +
          `"${p.meta.id}". The last one wins; give one of them a distinct id.`
        );
      }
      owner[iconId] = p.meta.id;
      merged[iconId] = entry;
    });
  });
  return merged;
}

export default PLUGINS;
