export const NOTATION_MENUS = {
  dnd5e2024: [
    {
      group: 'notation.group.dice',
      items: [
        { label: 'notation.item.diceRoll', desc: 'notation.desc.diceRoll', insert: '1d8',             preview: '1d8'          },
      ]
    },
    {
      group: 'notation.group.abilities',
      items: [
        { label: 'notation.item.str',    desc: 'notation.desc.modifier',     insert: '[STR]',          preview: '[STR]'        },
        { label: 'notation.item.dex',    desc: 'notation.desc.modifier',     insert: '[DEX]',          preview: '[DEX]'        },
        { label: 'notation.item.con',    desc: 'notation.desc.modifier',     insert: '[CON]',          preview: '[CON]'        },
        { label: 'notation.item.int',    desc: 'notation.desc.modifier',     insert: '[INT]',          preview: '[INT]'        },
        { label: 'notation.item.wis',    desc: 'notation.desc.modifier',     insert: '[WIS]',          preview: '[WIS]'        },
        { label: 'notation.item.cha',    desc: 'notation.desc.modifier',     insert: '[CHA]',          preview: '[CHA]'        },
        { label: 'notation.item.pro',    desc: 'notation.desc.proficiency',  insert: '[PRO]',          preview: '[PRO]'        },
        { label: 'notation.item.lvlNum', desc: 'notation.desc.lvlNum',       insert: '[LVL]',          preview: '[LVL]'        },
        { label: 'notation.item.lvlHalf',desc: 'notation.desc.lvlHalf',      insert: '[LVL/2]',        preview: '[LVL/2]'      },
      ]
    },
    {
      group: 'notation.group.scaling',
      items: [
        { label: 'notation.item.lvl',    desc: 'notation.desc.lvl',          insert: '[LVL=1:1d6,5:1d8]', preview: '[LVL=…]' },
      ]
    },
    {
      group: 'notation.group.counters',
      items: [
        { label: 'notation.item.counter',    desc: 'notation.desc.counter',    insert: '[count3]',      preview: '[count3]'     },
        { label: 'notation.item.counterPRO', desc: 'notation.desc.counterDyn', insert: '[countPRO]',    preview: '[countPRO]'   },
        { label: 'notation.item.counterCHA', desc: 'notation.desc.counterDyn', insert: '[countCHA]',    preview: '[countCHA]'   },
      ]
    },
    {
      group: 'notation.group.bonuses',
      items: [
        { label: 'notation.item.bonusAC',   desc: 'notation.desc.bonus',      insert: '+2@[AC]',        preview: '+N@[AC]'      },
        { label: 'notation.item.bonusINIT', desc: 'notation.desc.bonus',      insert: '+1@[INIT]',      preview: '+N@[INIT]'    },
        { label: 'notation.item.bonusSPD',  desc: 'notation.desc.bonus',      insert: '+5@[SPD]',       preview: '+N@[SPD]'     },
        { label: 'notation.item.bonusHP',   desc: 'notation.desc.bonus',      insert: '+1@[HP]',        preview: '+N@[HP]'      },
        { label: 'notation.item.bonusSTR',  desc: 'notation.desc.bonus',      insert: '+1@[STR]',       preview: '+N@[STR]'     },
        { label: 'notation.item.bonusDEX',  desc: 'notation.desc.bonus',      insert: '+1@[DEX]',       preview: '+N@[DEX]'     },
        { label: 'notation.item.bonusCON',  desc: 'notation.desc.bonus',      insert: '+1@[CON]',       preview: '+N@[CON]'     },
        { label: 'notation.item.bonusINT',  desc: 'notation.desc.bonus',      insert: '+1@[INT]',       preview: '+N@[INT]'     },
        { label: 'notation.item.bonusWIS',  desc: 'notation.desc.bonus',      insert: '+1@[WIS]',       preview: '+N@[WIS]'     },
        { label: 'notation.item.bonusCHA',  desc: 'notation.desc.bonus',      insert: '+1@[CHA]',       preview: '+N@[CHA]'     },
      ]
    },
    {
      group: 'notation.group.saves',
      items: [
        { label: 'notation.item.savSTR',  desc: 'notation.desc.bonus', insert: '+1@[SAV-STR]', preview: '+N@[SAV-STR]' },
        { label: 'notation.item.savDEX',  desc: 'notation.desc.bonus', insert: '+1@[SAV-DEX]', preview: '+N@[SAV-DEX]' },
        { label: 'notation.item.savCON',  desc: 'notation.desc.bonus', insert: '+1@[SAV-CON]', preview: '+N@[SAV-CON]' },
        { label: 'notation.item.savINT',  desc: 'notation.desc.bonus', insert: '+1@[SAV-INT]', preview: '+N@[SAV-INT]' },
        { label: 'notation.item.savWIS',  desc: 'notation.desc.bonus', insert: '+1@[SAV-WIS]', preview: '+N@[SAV-WIS]' },
        { label: 'notation.item.savCHA',  desc: 'notation.desc.bonus', insert: '+1@[SAV-CHA]', preview: '+N@[SAV-CHA]' },
      ]
    },
    {
      group: 'notation.group.skills',
      items: [
        { label: 'notation.item.skACR',  desc: 'notation.desc.bonus', insert: '+1@[SK-ACR]',  preview: '+N@[SK-ACR]'  },
        { label: 'notation.item.skANH',  desc: 'notation.desc.bonus', insert: '+1@[SK-ANH]',  preview: '+N@[SK-ANH]'  },
        { label: 'notation.item.skARC',  desc: 'notation.desc.bonus', insert: '+1@[SK-ARC]',  preview: '+N@[SK-ARC]'  },
        { label: 'notation.item.skATH',  desc: 'notation.desc.bonus', insert: '+1@[SK-ATH]',  preview: '+N@[SK-ATH]'  },
        { label: 'notation.item.skDEC',  desc: 'notation.desc.bonus', insert: '+1@[SK-DEC]',  preview: '+N@[SK-DEC]'  },
        { label: 'notation.item.skHIS',  desc: 'notation.desc.bonus', insert: '+1@[SK-HIS]',  preview: '+N@[SK-HIS]'  },
        { label: 'notation.item.skINS',  desc: 'notation.desc.bonus', insert: '+1@[SK-INS]',  preview: '+N@[SK-INS]'  },
        { label: 'notation.item.skITM',  desc: 'notation.desc.bonus', insert: '+1@[SK-ITM]',  preview: '+N@[SK-ITM]'  },
        { label: 'notation.item.skINV',  desc: 'notation.desc.bonus', insert: '+1@[SK-INV]',  preview: '+N@[SK-INV]'  },
        { label: 'notation.item.skMED',  desc: 'notation.desc.bonus', insert: '+1@[SK-MED]',  preview: '+N@[SK-MED]'  },
        { label: 'notation.item.skNAT',  desc: 'notation.desc.bonus', insert: '+1@[SK-NAT]',  preview: '+N@[SK-NAT]'  },
        { label: 'notation.item.skPER',  desc: 'notation.desc.bonus', insert: '+1@[SK-PER]',  preview: '+N@[SK-PER]'  },
        { label: 'notation.item.skPRF',  desc: 'notation.desc.bonus', insert: '+1@[SK-PRF]',  preview: '+N@[SK-PRF]'  },
        { label: 'notation.item.skPRS',  desc: 'notation.desc.bonus', insert: '+1@[SK-PRS]',  preview: '+N@[SK-PRS]'  },
        { label: 'notation.item.skREL',  desc: 'notation.desc.bonus', insert: '+1@[SK-REL]',  preview: '+N@[SK-REL]'  },
        { label: 'notation.item.skSLH',  desc: 'notation.desc.bonus', insert: '+1@[SK-SLH]',  preview: '+N@[SK-SLH]'  },
        { label: 'notation.item.skSTL',  desc: 'notation.desc.bonus', insert: '+1@[SK-STL]',  preview: '+N@[SK-STL]'  },
        { label: 'notation.item.skSUR',  desc: 'notation.desc.bonus', insert: '+1@[SK-SUR]',  preview: '+N@[SK-SUR]'  },
      ]
    },
    {
      group: 'notation.group.dynamic',
      items: [
        { label: 'notation.item.dynPROAC',  desc: 'notation.desc.dynamic', insert: '+[PRO]@[AC]',   preview: '+[PRO]@[AC]'   },
        { label: 'notation.item.dynLVL2AC', desc: 'notation.desc.dynamic', insert: '+[LVL/2]@[AC]', preview: '+[LVL/2]@[AC]' },
        { label: 'notation.item.dynSTRAC',  desc: 'notation.desc.dynamic', insert: '+[STR]@[AC]',   preview: '+[STR]@[AC]'   },
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
