// Homebrew entity schema for daggerheart — drives the HomebrewEditor form.
// Moved verbatim out of src/config/homebrewSchema.js.

const homebrew = {
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
