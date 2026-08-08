import { createCustomDefaultState } from './data/mechanics';

const state = {
  create: createCustomDefaultState,
  schemaVersion: '1.0.0',

  // A custom sheet has no class or level, so the list shows neither.
  charIndexEntry: () => ({}),
};

export default state;
