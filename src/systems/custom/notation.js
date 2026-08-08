// Slash-menu vocabulary for the custom notation engine.
// Moved verbatim out of src/config/notationMenus.js.

const notation = {
  menu: [
    {
      group: 'notation.group.dice',
      items: [
        { label: 'notation.item.diceRoll', desc: 'notation.desc.diceRoll', insert: '1d6', preview: '1d6' },
      ]
    },
    {
      group: 'notation.group.counters',
      items: [
        { label: 'notation.item.counter', desc: 'notation.desc.counter', insert: '[3]', preview: '[3]' },
      ]
    },
  ],
};

export default notation;
