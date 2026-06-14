export const NOTATION_MENUS = {
  dnd5e2024: [
    {
      group: 'notation.group.dice',
      items: [
        { label: 'notation.item.diceRoll', desc: 'notation.desc.diceRoll', insert: '1d8',          preview: '1d8'         },
      ]
    },
    {
      group: 'notation.group.abilities',
      items: [
        { label: 'notation.item.str',  desc: 'notation.desc.modifier',     insert: '[STR]',        preview: '[STR]'       },
        { label: 'notation.item.dex',  desc: 'notation.desc.modifier',     insert: '[DEX]',        preview: '[DEX]'       },
        { label: 'notation.item.con',  desc: 'notation.desc.modifier',     insert: '[CON]',        preview: '[CON]'       },
        { label: 'notation.item.int',  desc: 'notation.desc.modifier',     insert: '[INT]',        preview: '[INT]'       },
        { label: 'notation.item.wis',  desc: 'notation.desc.modifier',     insert: '[WIS]',        preview: '[WIS]'       },
        { label: 'notation.item.cha',  desc: 'notation.desc.modifier',     insert: '[CHA]',        preview: '[CHA]'       },
        { label: 'notation.item.pro',  desc: 'notation.desc.proficiency',  insert: '[PRO]',        preview: '[PRO]'       },
      ]
    },
    {
      group: 'notation.group.scaling',
      items: [
        { label: 'notation.item.lvl',  desc: 'notation.desc.lvl',          insert: '[LVL:1d6,5:1d8]', preview: '[LVL:…]' },
      ]
    },
    {
      group: 'notation.group.counters',
      items: [
        { label: 'notation.item.counter', desc: 'notation.desc.counter',   insert: '[3]',          preview: '[3]'         },
      ]
    },
    {
      group: 'notation.group.bonuses',
      items: [
        { label: 'notation.item.bonusAC',    desc: 'notation.desc.bonus',  insert: '+2@[AC]',      preview: '+N@[AC]'     },
        { label: 'notation.item.bonusINIT',  desc: 'notation.desc.bonus',  insert: '+1@[INIT]',    preview: '+N@[INIT]'   },
        { label: 'notation.item.bonusSPD',   desc: 'notation.desc.bonus',  insert: '+5@[SPD]',     preview: '+N@[SPD]'    },
        { label: 'notation.item.bonusHP',    desc: 'notation.desc.bonus',  insert: '+1@[HP]',      preview: '+N@[HP]'     },
        { label: 'notation.item.bonusSTR',   desc: 'notation.desc.bonus',  insert: '+1@[STR]',     preview: '+N@[STR]'    },
        { label: 'notation.item.bonusDEX',   desc: 'notation.desc.bonus',  insert: '+1@[DEX]',     preview: '+N@[DEX]'    },
        { label: 'notation.item.bonusCON',   desc: 'notation.desc.bonus',  insert: '+1@[CON]',     preview: '+N@[CON]'    },
        { label: 'notation.item.bonusINT',   desc: 'notation.desc.bonus',  insert: '+1@[INT]',     preview: '+N@[INT]'    },
        { label: 'notation.item.bonusWIS',   desc: 'notation.desc.bonus',  insert: '+1@[WIS]',     preview: '+N@[WIS]'    },
        { label: 'notation.item.bonusCHA',   desc: 'notation.desc.bonus',  insert: '+1@[CHA]',     preview: '+N@[CHA]'    },
        { label: 'notation.item.bonusTSSTR', desc: 'notation.desc.bonus',  insert: '+1@[TS-STR]',  preview: '+N@[TS-STR]' },
        { label: 'notation.item.bonusTSDEX', desc: 'notation.desc.bonus',  insert: '+1@[TS-DEX]',  preview: '+N@[TS-DEX]' },
        { label: 'notation.item.bonusTSCON', desc: 'notation.desc.bonus',  insert: '+1@[TS-CON]',  preview: '+N@[TS-CON]' },
        { label: 'notation.item.bonusTSINT', desc: 'notation.desc.bonus',  insert: '+1@[TS-INT]',  preview: '+N@[TS-INT]' },
        { label: 'notation.item.bonusTSWIS', desc: 'notation.desc.bonus',  insert: '+1@[TS-WIS]',  preview: '+N@[TS-WIS]' },
        { label: 'notation.item.bonusTSCHA', desc: 'notation.desc.bonus',  insert: '+1@[TS-CHA]',  preview: '+N@[TS-CHA]' },
      ]
    },
  ],

  daggerheart: [
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

export function getNotationMenu(systemId) {
  return NOTATION_MENUS[systemId] || NOTATION_MENUS.dnd5e2024;
}
