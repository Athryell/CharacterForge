// Slash-menu vocabulary for the daggerheart notation engine.
// Moved verbatim out of src/config/notationMenus.js.

const notation = {
  menu: [
    {
      group: 'notation.group.dice',
      items: [
        { label: 'notation.item.diceRoll', desc: 'notation.desc.diceRoll', insert: '1d8', preview: '1d8' },
      ]
    },
    {
      group: 'notation.group.traits',
      items: [
        { label: 'notation.dh.agi', desc: 'notation.desc.modifier', insert: '[AGI]', preview: '[AGI]' },
        { label: 'notation.dh.str', desc: 'notation.desc.modifier', insert: '[STR]', preview: '[STR]' },
        { label: 'notation.dh.fin', desc: 'notation.desc.modifier', insert: '[FIN]', preview: '[FIN]' },
        { label: 'notation.dh.ins', desc: 'notation.desc.modifier', insert: '[INS]', preview: '[INS]' },
        { label: 'notation.dh.pre', desc: 'notation.desc.modifier', insert: '[PRE]', preview: '[PRE]' },
        { label: 'notation.dh.kno', desc: 'notation.desc.modifier', insert: '[KNO]', preview: '[KNO]' },
        { label: 'notation.item.pro', desc: 'notation.desc.proficiency', insert: '[PRO]', preview: '[PRO]' },
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
