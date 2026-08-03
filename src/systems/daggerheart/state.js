import { createDHDefaultState } from './data/mechanics';

const state = {
  create: createDHDefaultState,
  schemaVersion: '2.0.0',
  charIndexEntry: s => ({ charClass: s.charClass || '', charLevel: s.charLevel || 1 }),
};

export default state;
