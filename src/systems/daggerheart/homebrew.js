// Homebrew entity schema for daggerheart — drives the HomebrewEditor form.
// Moved verbatim out of src/config/homebrewSchema.js.

import { DH_CLASSES, DH_SUBCLASSES } from './data/classes';
import { DH_WEAPONS } from './data/weapons';
import { DH_ARMORS } from './data/armor';
import { DH_CONDITIONS } from './data/conditions';
import { DH_ANCESTRIES, DH_COMMUNITIES } from './data/mechanics';

const homebrew = {
  sourceInfo: () => ({
    id: 'dh-core',
    name: 'Daggerheart Core',
    author: 'Darrington Press',
    counts: {
      classes:     DH_CLASSES.length,
      subclasses:  Object.keys(DH_SUBCLASSES).length,
      ancestries:  DH_ANCESTRIES.length,
      communities: DH_COMMUNITIES.length,
      weapons:     DH_WEAPONS.length,
      armors:      DH_ARMORS.length,
      conditions:  DH_CONDITIONS.length,
    },
  }),

  exportTemplate: () => ({ weapons: [], armors: [], conditions: [] }),

  schema: {
    weapons: {
      label: 'Weapons',
      icon: 'widget.weapons',
      fields: [
        { id: 'name',    label: 'Name',       type: 'text',     required: true },
        { id: 'trait',   label: 'Trait',      type: 'select',   options: ['AGI', 'STR', 'FIN', 'INS', 'PRE', 'KNO'] },
        { id: 'range',   label: 'Range',      type: 'select',   options: ['Melee', 'Very Close', 'Close', 'Far', 'Very Far'] },
        { id: 'dmgDie',  label: 'Damage Die', type: 'text',     placeholder: 'd8' },
        { id: 'dmgType', label: 'Type',       type: 'select',   options: ['phy', 'mag'] },
        { id: 'hands',   label: 'Hands',      type: 'select',   options: ['one-handed', 'two-handed'] },
        { id: 'feature', label: 'Feature',    type: 'textarea' },
      ],
    },
  },
};

export default homebrew;
