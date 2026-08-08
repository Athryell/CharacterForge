import { createDefaultState, JSON_SCHEMA_VERSION } from './data/mechanics';

const state = {
  create: createDefaultState,
  schemaVersion: JSON_SCHEMA_VERSION,

  // What the character list shows for this system.
  charIndexEntry: s => ({ charClass: s.charClass || '', charLevel: s.charLevel || 1 }),
};

export default state;
