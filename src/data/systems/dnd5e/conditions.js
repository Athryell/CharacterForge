// CharacterForge — D&D 5e SRD 5.2 Conditions (CC BY 4.0 — Wizards of the Coast)
// Unified from data/srd/conditions.js (icons) + data/conditions.js (rich desc)
// English base — translations via i18n data.conditions.<id>.{name,desc}

export const DND_CONDITIONS = [
  { id: 'blinded',       icon: '👁️',  desc: 'Cannot see. Automatically fails checks requiring sight. Attack rolls against it have advantage; its attack rolls have disadvantage.' },
  { id: 'charmed',       icon: '💫',  desc: 'Cannot attack the charmer or target them with harmful effects. The charmer has advantage on social interaction checks.' },
  { id: 'deafened',      icon: '🔇',  desc: 'Cannot hear. Automatically fails checks requiring hearing.' },
  { id: 'frightened',    icon: '😨',  desc: 'Disadvantage on ability checks and attack rolls while the source of fear is in sight. Cannot willingly move closer to the source.' },
  { id: 'grappled',      icon: '🤼',  desc: 'Speed reduced to 0. Ends if the grappler is incapacitated or the creature is moved beyond the grappler\'s reach.' },
  { id: 'incapacitated', icon: '😵',  desc: 'Cannot take actions, bonus actions, or reactions.' },
  { id: 'invisible',     icon: '👻',  desc: 'Cannot be seen without magic. Attack rolls against it have disadvantage; its attacks have advantage.' },
  { id: 'paralyzed',     icon: '🧊',  desc: 'Incapacitated, cannot move or speak. Fails STR and DEX saves. Melee hits within 5ft are automatic criticals.' },
  { id: 'petrified',     icon: '🗿',  desc: 'Turned to stone. Incapacitated, resistance to all damage, immune to poison and disease, does not age.' },
  { id: 'poisoned',      icon: '☠️',  desc: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone',         icon: '⬇️',  desc: 'Can only crawl. Disadvantage on attack rolls. Melee hits have advantage; ranged hits have disadvantage.' },
  { id: 'restrained',    icon: '⛓️',  desc: 'Speed 0. Disadvantage on attack rolls and DEX saves. Attack rolls against it have advantage.' },
  { id: 'stunned',       icon: '⭐',  desc: 'Incapacitated, cannot move, speaks only falteringly. Fails STR and DEX saves. Attack rolls against it have advantage.' },
  { id: 'unconscious',   icon: '💤',  desc: 'Incapacitated, cannot move or speak. Drops held items. Fails STR and DEX saves. Melee hits within 5ft are automatic criticals.' },
  {
    id: 'exhaustion',
    icon: '😓',
    type: 'counter',
    maxLevel: 6,
    levels: [
      'Lv. 1: −2 to all d20 rolls · Speed −5 ft',
      'Lv. 2: −4 to all d20 rolls · Speed −10 ft',
      'Lv. 3: −6 to all d20 rolls · Speed −15 ft',
      'Lv. 4: −8 to all d20 rolls · Speed −20 ft',
      'Lv. 5: −10 to all d20 rolls · Speed 0',
      'Lv. 6: Death',
    ],
    desc: 'Each level subtracts 2 from d20 rolls and reduces speed by 5 ft. Lv. 5: speed 0. Lv. 6: instant death. Reduces by 1 on each long rest.',
  },
];

// Backward-compat aliases
export const CONDITIONS = DND_CONDITIONS;
export const SRD_CONDITIONS = DND_CONDITIONS;
