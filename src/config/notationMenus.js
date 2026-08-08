import { getPlugin } from '../systems/registry';

// The menus themselves now live with their systems, in
// src/systems/<id>/notation.js. This stays as the lookup the UI already uses.
export function getNotationMenu(systemId) {
  return getPlugin(systemId).notation?.menu || [];
}
