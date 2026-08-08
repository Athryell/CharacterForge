import { CUSTOM_WIDGET_TYPES, createCustomDefaultState } from './mechanics';

const customAdapter = {
  systemId: 'custom',
  getWidgetTypes: () => CUSTOM_WIDGET_TYPES,
  createDefaultState: createCustomDefaultState,
  // Stub methods for dataManager compatibility
  getConditions: () => [],
  getWeapons: () => [],
  getArmors: () => [],
  getClasses: () => [],
  getSpells: () => [],
};

export default customAdapter;
