import React from 'react';
import { getPlugin, DEFAULT_SYSTEM } from '../systems/registry';

// Dispatches to whichever creator the active system declares. A system with no
// creator renders nothing, which is the right answer for one that has no choices
// to make at creation time.
export default function CharacterCreator({ onComplete, onCancel, systemId = DEFAULT_SYSTEM }) {
  const Creator = getPlugin(systemId).creator;
  if (!Creator) return null;
  return <Creator onComplete={onComplete} onCancel={onCancel} />;
}
