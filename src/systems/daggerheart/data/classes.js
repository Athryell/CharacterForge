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
    suggestedTraits: { AGI: 1, STR: 2, FIN: -1, INS: 0, PRE: 1, KNO: 0 },
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
    suggestedTraits: { AGI: 2, STR: 0, FIN: 1, INS: 1, PRE: -1, KNO: 0 },
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
    suggestedTraits: { AGI: 1, STR: -1, FIN: 2, INS: 0, PRE: 1, KNO: 0 },
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
    suggestedTraits: { AGI: 0, STR: 2, FIN: 0, INS: 1, PRE: 1, KNO: -1 },
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
    suggestedTraits: { AGI: 0, STR: -1, FIN: 1, INS: 2, PRE: 1, KNO: 0 },
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
    suggestedTraits: { AGI: 2, STR: 1, FIN: 0, INS: 1, PRE: -1, KNO: 0 },
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
    suggestedTraits: { AGI: -1, STR: 0, FIN: 0, INS: 1, PRE: 1, KNO: 2 },
    features: [
      { name: 'Spellbook Mastery', desc: 'Your spellbook contains one additional domain card of your level or lower from the Codex or Splendor domain.' },
      { name: 'Arcane Recovery', desc: 'Once per long rest, you can clear 1d4 Stress as you channel ambient magic into yourself.' },
    ],
  },
];

export const DH_SUBCLASSES = {
  // ── BARD ──────────────────────────────────────────────────────────────────
  'Troubadour': {
    class: 'bard', spellcastTrait: 'Presence',
    foundation: [
      { name: 'Gifted Performer', desc: "You can play three different types of songs, once each per long rest: a Relaxing Song (restore HP to self and nearby allies), an Epic Song (make a target temporarily Vulnerable), or a Heartbreaking Song (grant Hope to self and nearby allies)." },
    ],
    specialization: [
      { name: 'Maestro', desc: "When you give a Rally Die to an ally, they can gain a Hope or clear a Stress." },
    ],
    mastery: [
      { name: 'Virtuoso', desc: "You can perform each of your 'Gifted Performer' feature's songs twice per long rest." },
    ],
  },
  'Wordsmith': {
    class: 'bard', spellcastTrait: 'Presence',
    foundation: [
      { name: 'Rousing Speech', desc: "Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress." },
      { name: 'Heart of a Poet', desc: "After making action rolls to impress, persuade, or offend someone, you may spend Hope to add a d4 to the roll." },
    ],
    specialization: [
      { name: 'Eloquent', desc: "Once per session when you inspire an ally, choose one: provide a mundane object or tool they need, assist an ally without spending Hope, or grant an extra downtime move during their next rest." },
    ],
    mastery: [
      { name: 'Epic Poetry', desc: "Your Rally Die increases to d10. When you Help an Ally, narrate as if documenting their heroism and roll a d10 as your advantage die." },
    ],
  },
  // ── DRUID ─────────────────────────────────────────────────────────────────
  'Warden of the Elements': {
    class: 'druid', spellcastTrait: 'Instinct',
    foundation: [
      { name: 'Elemental Incarnation', desc: "Mark a Stress to channel one of four elements (Fire, Earth, Water, or Air) until taking Severe damage or resting. Each element provides distinct benefits—Fire causes damage reflection, Earth boosts damage thresholds, Water forces Stress on nearby foes, and Air enables hovering with Agility advantages." },
    ],
    specialization: [
      { name: 'Elemental Aura', desc: "Once per rest while channeling, assume an aura within Close range. Fire makes adversaries mark Stress when taking damage; Earth grants allies +1 Strength; Water allows stress-marked repositioning of attackers; Air reduces ranged damage by 1d8." },
    ],
    mastery: [
      { name: 'Elemental Dominion', desc: "While channeling, gain element-specific mastery benefits. Fire adds +1 Proficiency to damaging attacks; Earth reduces Hit Points marked via d6 rolls; Water makes successful attackers temporarily Vulnerable when you mark Stress; Air improves Evasion and grants flight." },
    ],
  },
  'Warden of Renewal': {
    class: 'druid', spellcastTrait: 'Instinct',
    foundation: [
      { name: 'Clarity of Nature', desc: "Once per long rest, you can create a space of natural serenity within Close range. When you spend a few minutes resting within the space, clear Stress equal to your Instinct, distributed as you choose between you and your allies." },
      { name: 'Regeneration', desc: "Touch a creature and spend 3 Hope. That creature clears 1d4 Hit Points." },
    ],
    specialization: [
      { name: 'Regenerative Reach', desc: "Your Regeneration feature's range extends to Very Close range." },
      { name: "Warden's Protection", desc: "Once per long rest, spend 2 Hope to clear 2 Hit Points on 1d4 allies within Close range." },
    ],
    mastery: [
      { name: 'Defender', desc: "When you're in Beastform and an ally within Close range marks 2 or more Hit Points, you can mark a Stress to reduce the number of Hit Points they mark by 1." },
    ],
  },
  // ── GUARDIAN ──────────────────────────────────────────────────────────────
  'Stalwart': {
    class: 'guardian', spellcastTrait: null,
    foundation: [
      { name: 'Unwavering', desc: "Gain a permanent +1 bonus to your damage thresholds." },
      { name: 'Iron Will', desc: "When you take physical damage, you can mark an additional Armor Slot to reduce the severity." },
    ],
    specialization: [
      { name: 'Unrelenting', desc: "Gain a permanent +2 bonus to your damage thresholds." },
      { name: 'Partners-in-Arms', desc: "When an ally within Very Close range takes damage, you can mark an Armor Slot to reduce the severity by one threshold." },
    ],
    mastery: [
      { name: 'Undaunted', desc: "Gain a permanent +3 bonus to your damage thresholds." },
      { name: 'Loyal Protector', desc: "When an ally within Close range has 2 or fewer Hit Points and would take damage, you can mark a Stress to sprint to their side and take the damage instead." },
    ],
  },
  'Vengeance': {
    class: 'guardian', spellcastTrait: null,
    foundation: [
      { name: 'At Ease', desc: "Gain an additional Stress slot." },
      { name: 'Revenge', desc: "When an adversary in melee range successfully attacks you, spend 2 Stress to force the attacker to mark a Hit Point." },
    ],
    specialization: [
      { name: 'Act of Reprisal', desc: "When an adversary damages an ally within melee range, gain a +1 bonus to your Proficiency for the next successful attack against that adversary." },
    ],
    mastery: [
      { name: 'Nemesis', desc: "Spend 2 Hope to prioritize a single adversary until your next rest. While attacking your prioritized target, you may swap the results of your Hope and Fear Dice." },
    ],
  },
  // ── RANGER ────────────────────────────────────────────────────────────────
  'Beastbound': {
    class: 'ranger', spellcastTrait: 'Agility',
    foundation: [
      { name: 'Companion', desc: "You have an animal companion of your choice (at the GM's discretion). They stay by your side unless you tell them otherwise. You receive a Ranger Companion sheet and select level-up options for your companion as you advance." },
    ],
    specialization: [
      { name: 'Expert Training', desc: "Your companion gains an additional level-up option." },
      { name: 'Battle-Bonded', desc: "When an adversary attacks you while they're within your companion's Melee range, you gain a +2 bonus to your Evasion against the attack." },
    ],
    mastery: [
      { name: 'Advanced Training', desc: "Your companion gains two additional level-up options." },
      { name: 'Loyal Friend', desc: "Once per long rest, when damage would mark your companion's last Stress or your last Hit Point and you're within Close range of each other, you or your companion can rush to the other's side and take that damage instead." },
    ],
  },
  'Wayfinder': {
    class: 'ranger', spellcastTrait: 'Agility',
    foundation: [
      { name: 'Ruthless Predator', desc: "When you make a damage roll, you can mark a Stress to gain a +1 bonus to your Proficiency. Foes who take Severe damage must also mark Stress." },
      { name: 'Path Forward', desc: "You can navigate to previously visited locations or destinations associated with carried objects by identifying the shortest, most direct path." },
    ],
    specialization: [
      { name: 'Elusive Predator', desc: "When your Focus makes an attack against you, gain a +2 bonus to your Evasion." },
    ],
    mastery: [
      { name: 'Apex Predator', desc: "Before attacking your Focus, spend Hope to remove a Fear from the GM's pool upon a successful hit." },
    ],
  },
  // ── ROGUE ─────────────────────────────────────────────────────────────────
  'Nightwalker': {
    class: 'rogue', spellcastTrait: 'Finesse',
    foundation: [
      { name: 'Shadow Stepper', desc: "You can move from shadow to shadow. When you move into an area of darkness or a shadow cast by another creature or object, you can mark a Stress to disappear from where you are and reappear inside another shadow within Far range. When you reappear, you are Cloaked." },
    ],
    specialization: [
      { name: 'Dark Cloud', desc: "Make a Spellcast Roll (15). On a success, create a temporary dark cloud that covers any area within Close range. Anyone in this cloud can't see outside of it, and anyone outside of it can't see in. You're considered Cloaked from any adversary for whom the cloud blocks line of sight." },
      { name: 'Adrenaline', desc: "While you're Vulnerable, add your level to your damage rolls." },
    ],
    mastery: [
      { name: 'Fleeting Shadow', desc: "Gain a permanent +1 bonus to your Evasion. You can use your 'Shadow Stepper' feature to move within Very Far range." },
      { name: 'Vanishing Act', desc: "Mark a Stress to become Cloaked at any time. When Cloaked from this feature, you automatically clear the Restrained condition if you have it. You remain Cloaked in this way until you roll with Fear or until your next rest." },
    ],
  },
  'Syndicate': {
    class: 'rogue', spellcastTrait: 'Finesse',
    foundation: [
      { name: 'Well-Connected', desc: "When you arrive in a prominent town or environment, you know somebody who calls this place home. You establish a contact and choose one complicating factor (an outstanding favor, a potential demand, or a complicated history)." },
    ],
    specialization: [
      { name: 'Contacts Everywhere', desc: "Once per session, you can briefly call on a shady contact. Choose one benefit: provide gold, tools, or objects; grant a +3 bonus to Hope or Fear Die on your next action roll; or add 2d8 to your next damage roll." },
    ],
    mastery: [
      { name: 'Reliable Backup', desc: "Contacts Everywhere now has three uses per session. Additional benefits include reducing Hit Points marked by 1 when damaged, or rolling a d20 as your Hope Die during presence-based conversations." },
    ],
  },
  // ── SERAPH ────────────────────────────────────────────────────────────────
  'Divine Wielder': {
    class: 'seraph', spellcastTrait: 'Strength',
    foundation: [
      { name: 'Spirit Weapon', desc: "When you have an equipped weapon with a range of Melee or Very Close, it can fly from your hand to attack an adversary within Close range and then return to you. You may mark Stress to target an additional adversary with the same attack roll." },
      { name: 'Sparing Touch', desc: "Once per long rest, touch a creature and restore 2 Hit Points or 2 Stress." },
    ],
    specialization: [
      { name: 'Devout', desc: "Roll an additional Prayer Die and discard the lowest. Also gain two uses of Sparing Touch per long rest instead of one." },
    ],
    mastery: [
      { name: 'Sacred Resonance', desc: "When you roll damage for your 'Spirit Weapon' feature, if any of the die results match, double the value of each matching die." },
    ],
  },
  'Winged Sentinel': {
    class: 'seraph', spellcastTrait: 'Strength',
    foundation: [
      { name: 'Wings of Light', desc: "You can fly. While flying, you can: mark a Stress to pick up and carry another willing creature approximately your size or smaller, or spend a Hope to deal an extra 1d8 damage on a successful attack." },
    ],
    specialization: [
      { name: 'Ethereal Visage', desc: "Your supernatural appearance grants advantage on Presence Rolls while airborne. When you roll with Hope on a Presence Roll, you can remove a Fear from the GM's Fear pool instead of gaining Hope." },
    ],
    mastery: [
      { name: 'Ascendant', desc: "Gain a permanent +4 bonus to your Severe damage threshold." },
      { name: 'Power of the Gods', desc: "While flying, you deal an extra 1d12 damage instead of 1d8 from your Wings of Light feature." },
    ],
  },
  // ── SORCERER ──────────────────────────────────────────────────────────────
  'Elemental Origin': {
    class: 'sorcerer', spellcastTrait: 'Instinct',
    foundation: [
      { name: 'Elementalist', desc: "Select one element (air, earth, fire, lightning, or water) at creation. You can shape this element into harmless effects. Spend a Hope and describe how your control over this element helps an action roll, then gain a +2 bonus to the roll or a +3 bonus to the roll's damage." },
    ],
    specialization: [
      { name: 'Natural Evasion', desc: "When an attack roll against you succeeds, you can mark a Stress and describe how you use your element to defend you. Roll a d6 and add its result to your Evasion against the attack." },
    ],
    mastery: [
      { name: 'Transcendence', desc: "Once per long rest, you can transform into a physical manifestation of your element. Select two benefits from: +4 to Severe threshold, +1 to a character trait, +1 to Proficiency, or +2 to Evasion until your next rest." },
    ],
  },
  'Primal Origin': {
    class: 'sorcerer', spellcastTrait: 'Instinct',
    foundation: [
      { name: 'Manipulate Magic', desc: "After you cast a spell or make an attack using a weapon that deals magic damage, you can mark a Stress to: extend the reach by one range, gain +2 to the action roll's result, double a damage die of your choice, or hit an additional target within range." },
    ],
    specialization: [
      { name: 'Enchanted Aid', desc: "When helping an ally with a Spellcast Roll, roll a d8 as your advantage die. Once per long rest after assisting an ally, you can swap their Duality Dice results." },
    ],
    mastery: [
      { name: 'Arcane Charge', desc: "When you take magic damage, you become Charged. You can also spend 2 Hope to become Charged. While Charged, successful magic attacks allow you to clear the Charge for either +10 damage or +3 Difficulty to a target's reaction roll." },
    ],
  },
  // ── WARRIOR ───────────────────────────────────────────────────────────────
  'Call of the Brave': {
    class: 'warrior', spellcastTrait: null,
    foundation: [
      { name: 'Courage', desc: "When you fail a roll with Fear, you gain a Hope." },
      { name: 'Battle Ritual', desc: "Once per long rest, describe ritual preparations before a dangerous situation to clear 2 Stress and gain 2 Hope." },
    ],
    specialization: [
      { name: 'Rise to the Challenge', desc: "While at 2 or fewer unmarked Hit Points, you can use a d20 as your Hope Die." },
    ],
    mastery: [
      { name: 'Camaraderie', desc: "You can initiate one additional Tag Team Roll per session, and allies only need 2 Hope to initiate a Tag Team Roll with you." },
    ],
  },
  'Call of the Slayer': {
    class: 'warrior', spellcastTrait: null,
    foundation: [
      { name: 'Slayer', desc: "You gain a pool of Slayer Dice. On a roll with Hope, you can place a d6 here instead of gaining a Hope, up to your Proficiency. When you make an attack or damage roll, spend any number of Slayer Dice to add their results. At end of session, clear unspent Slayer Dice and gain a Hope per die cleared." },
    ],
    specialization: [
      { name: 'Weapon Specialist', desc: "When you succeed on an attack, spend a Hope to add one of your secondary weapon's damage dice to the roll. Once per long rest when you roll Slayer Dice, reroll any 1s." },
    ],
    mastery: [
      { name: 'Martial Preparation', desc: "Your party gains access to the Martial Preparation downtime move. During a rest, describe how you train with your party. You and each ally who chooses this move gain a d6 Slayer Die to spend on an attack or damage roll." },
    ],
  },
  // ── WIZARD ────────────────────────────────────────────────────────────────
  'School of Knowledge': {
    class: 'wizard', spellcastTrait: 'Knowledge',
    foundation: [
      { name: 'Prepared', desc: "Take an additional domain card of your level or lower from a domain you have access to." },
      { name: 'Adept', desc: "When you Utilize an Experience, you can mark a Stress instead of spending a Hope. If you do, double your Experience modifier for that roll." },
    ],
    specialization: [
      { name: 'Accomplished', desc: "Take an additional domain card of your level or lower from a domain you have access to." },
      { name: 'Perfect Recall', desc: "Once per rest, when you recall a domain card in your vault, you can reduce its Recall Cost by 1." },
    ],
    mastery: [
      { name: 'Brilliant', desc: "Take an additional domain card of your level or lower from a domain you have access to." },
      { name: 'Honed Expertise', desc: "When you use an Experience, roll a d6. On a result of 5 or higher, you can use it without spending Hope." },
    ],
  },
  'School of War': {
    class: 'wizard', spellcastTrait: 'Knowledge',
    foundation: [
      { name: 'Battlemage', desc: "You've focused your studies on becoming an unconquerable force on the battlefield. Gain an additional Hit Point slot." },
      { name: 'Face Your Fear', desc: "When you succeed with Fear on an attack roll, you deal an extra 1d10 magic damage." },
    ],
    specialization: [
      { name: 'Conjure Shield', desc: "While you have at least 2 Hope, add your Proficiency to your Evasion." },
      { name: 'Fueled by Fear', desc: "The bonus damage from Face Your Fear increases to 2d10." },
    ],
    mastery: [
      { name: 'Thrive in Chaos', desc: "When you succeed on an attack, you can mark a Stress after rolling damage to force the target to mark an additional Hit Point." },
      { name: 'Have No Fear', desc: "The bonus damage from Face Your Fear increases to 3d10." },
    ],
  },
};

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
