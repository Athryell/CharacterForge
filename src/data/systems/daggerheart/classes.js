// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license

export const DH_CLASSES = [
  {
    id: 'bard', name: 'Bard',
    domains: ['codex', 'grace'],
    evasion: 12, hp: 6, stress: 6,
    subclasses: ['Troubadour', 'Wordsmith'],
    primaryWeaponOptions: 'rapier, small dagger, wand, shortbow, dagger, spellbook, harp',
    secondaryWeaponOptions: 'round shield, buckler, tome, small dagger',
    suggestedTraits: { AGI: 0, STR: -1, FIN: 1, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Bardic Flourish', desc: "When you succeed on an attack with a weapon in your primary hand, you can mark a Stress to roll your secondary weapon's damage dice and add that result to the damage you deal." },
      { name: 'Rally', desc: 'When you or an ally within Close range takes damage, you can spend a Hope to have them clear a Stress or mark a Hit Point instead.' },
    ],
  },
  {
    id: 'druid', name: 'Druid',
    domains: ['arcana', 'sage'],
    evasion: 11, hp: 6, stress: 6,
    subclasses: ['Warden of the Elements', 'Warden of Renewal'],
    primaryWeaponOptions: 'shortstaff, shortbow, dagger, wand',
    secondaryWeaponOptions: 'round shield, tome',
    suggestedTraits: { AGI: 1, STR: 0, FIN: 1, INS: 2, PRE: -1, KNO: 0 },
    features: [
      { name: 'Wildtouch', desc: 'You can perform harmless, subtle effects that involve nature—such as causing a flower to rapidly grow, summoning a slight gust of wind, or starting a campfire—at will.' },
      { name: 'Beastform', desc: 'Choose a Beastform from the Druid Beastform list. You can spend a Hope to transform into that creature as an action.' },
    ],
  },
  {
    id: 'guardian', name: 'Guardian',
    domains: ['blade', 'valor'],
    evasion: 12, hp: 7, stress: 6,
    subclasses: ['Stalwart', 'Vengeance'],
    primaryWeaponOptions: 'longsword, greataxe, war-hammer, glaive, mace',
    secondaryWeaponOptions: 'round shield, buckler, short-sword, dagger',
    suggestedTraits: { AGI: 0, STR: 2, FIN: -1, INS: 1, PRE: 0, KNO: 1 },
    features: [
      { name: 'Stalwart Mark', desc: 'Once per session, you can mark an adversary. You have advantage on attacks against marked adversaries, and allies have advantage on Presence rolls to assist you against them.' },
      { name: 'Protective Presence', desc: 'Once per long rest, when an ally within Close range would take damage, you can use your reaction to take half that damage instead.' },
    ],
  },
  {
    id: 'ranger', name: 'Ranger',
    domains: ['bone', 'sage'],
    evasion: 12, hp: 6, stress: 6,
    subclasses: ['Beastbound', 'Wayfinder'],
    primaryWeaponOptions: 'longbow, crossbow, short-sword, dagger, shortbow',
    secondaryWeaponOptions: 'dagger, small dagger, buckler',
    suggestedTraits: { AGI: 1, STR: 0, FIN: 0, INS: 2, PRE: -1, KNO: 1 },
    features: [
      { name: "Ranger's Focus", desc: 'Once per session, you can declare a creature as your Quarry. You have advantage on attack rolls and Instinct rolls involving your Quarry.' },
      { name: 'Survivalist', desc: 'When you make a roll to navigate, forage, or track, you can add your Instinct modifier twice.' },
    ],
  },
  {
    id: 'rogue', name: 'Rogue',
    domains: ['grace', 'midnight'],
    evasion: 13, hp: 5, stress: 6,
    subclasses: ['Nightwalker', 'Syndicate'],
    primaryWeaponOptions: 'dagger, rapier, short-sword, shortbow',
    secondaryWeaponOptions: 'small dagger, dagger, buckler',
    suggestedTraits: { AGI: 2, STR: -1, FIN: 1, INS: 1, PRE: 0, KNO: 0 },
    features: [
      { name: 'Hidden Strike', desc: 'When you attack from Hiding or when an ally is in Melee range of your target, you can spend a Hope to add your Finesse modifier to your damage roll.' },
      { name: 'Evasive', desc: 'When a creature makes an attack against you, you can spend a Hope to add +2 to your Evasion against that attack.' },
    ],
  },
  {
    id: 'seraph', name: 'Seraph',
    domains: ['splendor', 'valor'],
    evasion: 11, hp: 7, stress: 6,
    subclasses: ['Divine Wielder', 'Winged Sentinel'],
    primaryWeaponOptions: 'longsword, mace, war-hammer, shortstaff',
    secondaryWeaponOptions: 'round shield, buckler, tome',
    suggestedTraits: { AGI: -1, STR: 1, FIN: 0, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Healing Hands', desc: 'Once per session, you can lay hands on a creature and spend any number of Hope. That creature clears that many Hit Points.' },
      { name: 'Divine Aura', desc: 'Allies within Close range of you have +1 to their Evasion.' },
    ],
  },
  {
    id: 'sorcerer', name: 'Sorcerer',
    domains: ['arcana', 'midnight'],
    evasion: 11, hp: 5, stress: 6,
    subclasses: ['Elemental Origin', 'Primal Origin'],
    primaryWeaponOptions: 'shortstaff, wand, spellbook, dagger',
    secondaryWeaponOptions: 'tome, wand, dagger',
    suggestedTraits: { AGI: 0, STR: -1, FIN: 1, INS: 0, PRE: 2, KNO: 1 },
    features: [
      { name: 'Arcane Surge', desc: 'Once per session, when you cast a spell, you can mark a Stress to double the number of damage dice you roll.' },
      { name: 'Innate Magic', desc: 'You can spend a Hope to cast any cantrip from the Arcana domain without expending a domain card.' },
    ],
  },
  {
    id: 'warrior', name: 'Warrior',
    domains: ['blade', 'bone'],
    evasion: 11, hp: 8, stress: 6,
    subclasses: ['Call of the Brave', 'Call of the Slayer'],
    primaryWeaponOptions: 'longsword, greataxe, war-hammer, glaive, grappler',
    secondaryWeaponOptions: 'round shield, buckler, short-sword, dagger',
    suggestedTraits: { AGI: 0, STR: 2, FIN: 0, INS: 1, PRE: -1, KNO: 1 },
    features: [
      { name: 'Extra Attack', desc: 'When you take the Attack action, you can attack twice instead of once.' },
      { name: 'Battle Cry', desc: 'Once per short rest, you can use a bonus action to give all allies within Close range advantage on their next attack roll.' },
    ],
  },
  {
    id: 'wizard', name: 'Wizard',
    domains: ['codex', 'splendor'],
    evasion: 10, hp: 5, stress: 6,
    subclasses: ['School of Knowledge', 'School of War'],
    primaryWeaponOptions: 'spellbook, shortstaff, wand, dagger',
    secondaryWeaponOptions: 'tome, wand, dagger',
    suggestedTraits: { AGI: -1, STR: 0, FIN: 1, INS: 1, PRE: 0, KNO: 2 },
    features: [
      { name: 'Spellbook Mastery', desc: 'Your spellbook contains one additional domain card of your level or lower from the Codex or Splendor domain.' },
      { name: 'Arcane Recovery', desc: 'Once per long rest, you can clear 1d4 Stress as you channel ambient magic into yourself.' },
    ],
  },
];

export const DH_DOMAINS = [
  { id: 'arcana',   name: 'Arcana',   classes: ['druid','sorcerer'],   desc: 'Domain of innate and instinctual magic.' },
  { id: 'blade',    name: 'Blade',    classes: ['guardian','warrior'],  desc: 'Domain of weapon mastery.' },
  { id: 'bone',     name: 'Bone',     classes: ['ranger','warrior'],    desc: 'Domain of tactics and the body.' },
  { id: 'codex',    name: 'Codex',    classes: ['bard','wizard'],       desc: 'Domain of intensive magical study.' },
  { id: 'grace',    name: 'Grace',    classes: ['bard','rogue'],        desc: 'Domain of charisma.' },
  { id: 'midnight', name: 'Midnight', classes: ['rogue','sorcerer'],    desc: 'Domain of shadows and secrecy.' },
  { id: 'sage',     name: 'Sage',     classes: ['druid','ranger'],      desc: 'Domain of the natural world.' },
  { id: 'splendor', name: 'Splendor', classes: ['seraph','wizard'],     desc: 'Domain of life.' },
  { id: 'valor',    name: 'Valor',    classes: ['guardian','seraph'],   desc: 'Domain of protection.' },
];
