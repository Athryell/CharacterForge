// Daggerheart SRD 1.0 — Darrington Press Community Gaming License
// © 2025 Critical Role LLC — https://www.darringtonpress.com/license

export const DH_TRAITS = ['AGI', 'STR', 'FIN', 'INS', 'PRE', 'KNO'];

export const DH_TRAIT_NAMES = {
  AGI: 'Agility', STR: 'Strength', FIN: 'Finesse',
  INS: 'Instinct', PRE: 'Presence', KNO: 'Knowledge',
};

export const DH_TRAIT_USES = {
  AGI: 'Sprint, Leap, Maneuver',
  STR: 'Lift, Smash, Grapple',
  FIN: 'Control, Hide, Tinker',
  INS: 'Perceive, Sense, Navigate',
  PRE: 'Charm, Perform, Deceive',
  KNO: 'Recall, Analyze, Comprehend',
};

export const DH_TRAIT_ARRAY = [2, 1, 1, 0, 0, -1];

export const DH_ANCESTRIES = [
  'Clank','Drakona','Dwarf','Elf','Faerie','Faun','Firbolg','Fungril',
  'Galapa','Giant','Goblin','Halfling','Human','Infernis','Katari',
  'Orc','Ribbet','Simiah',
];

export const DH_COMMUNITIES = [
  'Highborne','Loreborne','Orderborne','Ridgeborne','Seaborne',
  'Slyborne','Underborne','Wanderborne','Wildborne',
];

export const DH_ANCESTRY_DATA = [
  {
    name: 'Clank',
    desc: "Sentient mechanical beings constructed from various materials whose physical forms can be customized and modified, with lifespans potentially extending indefinitely through part acquisition and replacement.",
    features: [
      { name: 'Purposeful Design', desc: "During character creation, select who constructed you and their intended purpose. Choose one of your Experiences that aligns with this purpose and receive a permanent +1 bonus to that Experience." },
      { name: 'Efficient', desc: "When you take a short rest, you can choose a long rest move instead of a short rest move." },
    ],
  },
  {
    name: 'Drakona',
    desc: "Wingless, humanoid dragons with thick protective scales and elemental breath abilities, standing 5–7 feet tall with lifespans around 350 years.",
    features: [
      { name: 'Scales', desc: "Your scales act as natural protection. When you would take Severe damage, you can mark a Stress to mark 1 fewer Hit Points." },
      { name: 'Elemental Breath', desc: "Choose an elemental type for your breath. You can use this breath against a target or group within Very Close range, treating it as an Instinct weapon that deals d8 magic damage using your Proficiency." },
    ],
  },
  {
    name: 'Dwarf',
    desc: "Sturdy humanoids standing 4 to 5½ feet tall with dense musculature, thick hair, and naturally resilient skin, typically living up to 250 years.",
    features: [
      { name: 'Thick Skin', desc: "When you take Minor damage, you can mark 2 Stress instead of marking a Hit Point." },
      { name: 'Increased Fortitude', desc: "Spend 3 Hope to halve incoming physical damage." },
    ],
  },
  {
    name: 'Elf',
    desc: "Tall humanoids with pointed ears and heightened senses who can enter a celestial trance instead of sleeping, sometimes developing mystic forms reflecting deep connections to nature.",
    features: [
      { name: 'Quick Reactions', desc: "Mark a Stress to gain advantage on a reaction roll." },
      { name: 'Celestial Trance', desc: "During a rest, you can drop into a trance to choose an additional downtime move." },
    ],
  },
  {
    name: 'Faerie',
    desc: "Winged humanoid beings with insectile characteristics ranging from subtle to pronounced, standing between 2–7 feet tall and living approximately 50 years.",
    features: [
      { name: 'Luckbender', desc: "Once per session, after you or a willing ally within Close range makes an action roll, you can spend 3 Hope to reroll the Duality Dice." },
      { name: 'Wings', desc: "You can fly. While flying, mark a Stress after an adversary makes an attack against you to gain a +2 bonus to your Evasion against that attack." },
    ],
  },
  {
    name: 'Faun',
    desc: "Humanoid goats with curved horns and cloven hooves, standing 4–6½ feet tall with long limbs and lifespans around 225 years.",
    features: [
      { name: 'Caprine Leap', desc: "You can leap anywhere within Close range as though using normal movement, vaulting obstacles, jumping across gaps, or scaling barriers with ease." },
      { name: 'Kick', desc: "When you land a successful melee attack, mark a Stress to kick yourself off them, dealing an extra 2d6 damage and knocking back either yourself or the target to Very Close range." },
    ],
  },
  {
    name: 'Firbolg',
    desc: "Bovine humanoids with broad noses, long ears, and muscular frames covered in fur in earth tones or pastel colors, living approximately 150 years.",
    features: [
      { name: 'Charge', desc: "When you successfully roll Agility to move from Far or Very Far range into Melee range, you can mark a Stress to deal 1d12 physical damage to all targets within Melee range." },
      { name: 'Unshakable', desc: "When you mark a Stress, roll a d6. On a result of 6, don't mark it." },
    ],
  },
  {
    name: 'Fungril',
    desc: "Humanoid mushroom-like beings with remarkable physical diversity, ranging from 2 to 7 feet tall with a typical lifespan of approximately 300 years.",
    features: [
      { name: 'Fungril Network', desc: "Make an Instinct Roll (12) to use your mycelial array to speak with others of your ancestry. On a success, you can communicate across any distance." },
      { name: 'Death Connection', desc: "While touching a corpse that died recently, you can mark a Stress to extract one memory from the corpse related to a specific emotion or sensation of your choice." },
    ],
  },
  {
    name: 'Galapa',
    desc: "Anthropomorphic turtles standing 4–6 feet tall with large domed shells and earth-toned coloring, living approximately 150 years.",
    features: [
      { name: 'Shell', desc: "Gain a bonus to your damage thresholds equal to your Proficiency." },
      { name: 'Retract', desc: "Mark a Stress to retract into your shell, gaining resistance to physical damage. While retracted, you have disadvantage on action rolls and can't move." },
    ],
  },
  {
    name: 'Giant',
    desc: "Towering humanoids standing 6½ to 8½ feet tall with broad shoulders and long arms, featuring one to three eyes that develop over their first decade of life.",
    features: [
      { name: 'Endurance', desc: "Gain an additional Hit Point slot at character creation." },
      { name: 'Reach', desc: "Treat any weapon, ability, spell, or other feature with Melee range as though it has Very Close range instead." },
    ],
  },
  {
    name: 'Goblin',
    desc: "Small humanoids with distinctive large eyes and membranous ears, standing 3–4 feet tall with keen hearing and sharp eyesight that helps them navigate in darkness.",
    features: [
      { name: 'Surefooted', desc: "You ignore disadvantage on Agility Rolls." },
      { name: 'Danger Sense', desc: "Once per rest, mark a Stress to force an adversary to reroll an attack against you or an ally within Very Close range." },
    ],
  },
  {
    name: 'Halfling',
    desc: "Small humanoids with large hairy feet and prominent rounded ears, standing 3–4 feet tall with a lifespan around 150 years and natural attunement to magnetic fields.",
    features: [
      { name: 'Luckbringer', desc: "At the start of each session, everyone in your party gains a Hope." },
      { name: 'Internal Compass', desc: "When you roll a 1 on your Hope Die, you can reroll it." },
    ],
  },
  {
    name: 'Human',
    desc: "Versatile beings with dexterous hands and rounded ears, with bodies built for endurance and an average lifespan of about 100 years.",
    features: [
      { name: 'High Stamina', desc: "Gain an additional Stress slot at character creation." },
      { name: 'Adaptability', desc: "When you fail a roll that utilized one of your Experiences, you can mark a Stress to reroll." },
    ],
  },
  {
    name: 'Infernis',
    desc: "Horned, sharp-toothed humanoids descended from demons, standing 5–7 feet tall with distinctive features like pointed ears, long fingers, and sometimes tails.",
    features: [
      { name: 'Fearless', desc: "When you roll with Fear, you can mark 2 Stress to change it into a roll with Hope instead." },
      { name: 'Dread Visage', desc: "You have advantage on rolls to intimidate hostile creatures." },
    ],
  },
  {
    name: 'Katari',
    desc: "Feline humanoids featuring retractable claws, vertical pupils, and triangular ears with heightened senses, living around 150 years.",
    features: [
      { name: 'Feline Instincts', desc: "When you make an Agility Roll, you can spend 2 Hope to reroll your Hope Die." },
      { name: 'Retracting Claws', desc: "Make an Agility Roll to scratch a target in Melee range. On a success, the target becomes temporarily Vulnerable." },
    ],
  },
  {
    name: 'Orc',
    desc: "Humanoids distinguished by square features and prominent boar-like tusks, with skin and hair in green, blue, pink, or gray tones and typically muscular builds.",
    features: [
      { name: 'Sturdy', desc: "When you have 1 Hit Point remaining, attacks against you have disadvantage." },
      { name: 'Tusks', desc: "When you succeed on an attack within Melee range, spend a Hope to gore the target with your tusks, dealing an extra 1d6 damage." },
    ],
  },
  {
    name: 'Ribbet',
    desc: "Anthropomorphic frogs standing 3–4½ feet tall who move by hopping and possess webbed appendages for swimming.",
    features: [
      { name: 'Amphibious', desc: "You can breathe and move naturally underwater." },
      { name: 'Long Tongue', desc: "You can use your long tongue to grab onto things within Close range. By marking a Stress, you can wield your tongue as a Finesse Close weapon dealing d12 physical damage using your Proficiency." },
    ],
  },
  {
    name: 'Simiah',
    desc: "Anthropomorphic primates with long limbs and prehensile feet, ranging from 2 to 6 feet tall with remarkable agility and climbing abilities.",
    features: [
      { name: 'Natural Climber', desc: "You have advantage on Agility Rolls that involve balancing and climbing." },
      { name: 'Nimble', desc: "Gain a permanent +1 bonus to your Evasion at character creation." },
    ],
  },
];

export const DH_COMMUNITY_DATA = [
  {
    name: 'Highborne',
    desc: "An elite social class characterized by wealth, power, and influence, controlling political and economic systems within their territories.",
    feature: { name: 'Privilege', desc: "You have advantage on rolls to consort with nobles, negotiate prices, or leverage your reputation to get what you want." },
  },
  {
    name: 'Loreborne',
    desc: "Societies that prioritize knowledge and intellectual achievement, through historical preservation, political advancement, scientific study, or the compilation of lore and mythology.",
    feature: { name: 'Well-Read', desc: "You have advantage on rolls that involve the history, culture, or politics of a prominent person or place." },
  },
  {
    name: 'Orderborne',
    desc: "Communities united around shared discipline, faith, or principles—whether religious, doctrinal, or martial—enabling their leadership to mobilize populations toward common goals.",
    feature: { name: 'Dedicated', desc: "Record three sayings or values your upbringing instilled in you. Once per rest, when you describe how you're embodying one of these principles through your current action, you can roll a d20 as your Hope Die." },
  },
  {
    name: 'Ridgeborne',
    desc: "Communities inhabiting mountainous terrain, where residents develop exceptional strength and resilience through navigating rocky peaks and dangerous cliffs.",
    feature: { name: 'Steady', desc: "You have advantage on rolls to traverse dangerous cliffs and ledges, navigate harsh environments, and use your survival knowledge." },
  },
  {
    name: 'Seaborne',
    desc: "Communities centered around large bodies of water, where residents master sailing, fishing, and swimming from birth.",
    feature: { name: 'Know the Tide', desc: "When you roll with Fear, gain a token (up to your level). Before making an action roll, spend any number of tokens to gain +1 per token. All unspent tokens clear at end of session." },
  },
  {
    name: 'Slyborne',
    desc: "Communities of individuals operating outside the law—criminals, grifters, and con artists—united by clever methods and strict codes of honor despite appearing disloyal to outsiders.",
    feature: { name: 'Scoundrel', desc: "You have advantage on rolls to negotiate with criminals, detect lies, or find a safe place to hide." },
  },
  {
    name: 'Underborne',
    desc: "Members of subterranean societies ranging from small burrows to massive cavern cities, renowned for architectural skill, engineering prowess, and bravery against underground threats.",
    feature: { name: 'Low-Light Living', desc: "When you're in an area with low light or heavy shadow, you have advantage on rolls to hide, investigate, or perceive details within that area." },
  },
  {
    name: 'Wanderborne',
    desc: "Nomadic communities defined by their traveling lifestyle rather than location, united by shared values or experiences and known for their loyalty and unconventional approaches to life.",
    feature: { name: 'Nomadic Pack', desc: "Once per session, you can spend a Hope to reach into this pack and pull out a mundane item that's useful to your situation." },
  },
  {
    name: 'Wildborne',
    desc: "Forest-dwelling societies dedicated to environmental conservation, integrating their settlements harmoniously with nature while maintaining strong cultural ties to local fauna.",
    feature: { name: 'Lightfoot', desc: "Your movement is naturally silent. You have advantage on rolls to move without being heard." },
  },
];

// Tier: 1=L1, 2=L2-4, 3=L5-7, 4=L8-10
export function getDHTier(level) {
  if (level >= 8) return 4;
  if (level >= 5) return 3;
  if (level >= 2) return 2;
  return 1;
}

// Base proficiency = tier (can be manually increased above this)
export function getDHProficiency(level) {
  return getDHTier(level);
}

// Duality Dice roll result
// Returns { total, hopeRoll, fearRoll, result: 'critical'|'hope'|'fear'|'fail', withHope }
export function rollDualityDice(traitMod = 0, difficulty = 12) {
  const hopeRoll = Math.floor(Math.random() * 12) + 1;
  const fearRoll = Math.floor(Math.random() * 12) + 1;
  const total = Math.max(hopeRoll, fearRoll) + traitMod;
  const critical = hopeRoll === fearRoll;
  const withHope = hopeRoll >= fearRoll;
  const success = total >= difficulty;
  let result;
  if (critical) result = 'critical';
  else if (success && withHope) result = 'hope';
  else if (success && !withHope) result = 'fear';
  else result = 'fail';
  return { total, hopeRoll, fearRoll, result, withHope, success, critical };
}

export function createDHDefaultState() {
  return {
    system: 'daggerheart',
    schemaVersion: '2.0.0',
    charName: '',
    charClass: '',
    charSubclass: '',
    ancestry: '',
    ancestry2: '',
    community: '',
    charLevel: 1,
    traits: { AGI: 0, STR: 0, FIN: 0, INS: 0, PRE: 0, KNO: 0 },
    evasion: 10,
    hpCurrent: 6,
    hpMax: 6,
    stressCurrent: 0,
    stressMax: 6,
    hope: 2,
    hopeMax: 6,
    fear: 0,
    fearMax: 6,
    proficiency: 1,
    armorSlots: 0,
    armorSlotsMax: 0,
    armorName: '',
    armorFeature: '',
    thresholdMinor: 0,
    thresholdMajor: 0,
    thresholdSevere: 0,
    dhCounterMode: 'pip',
    experiences: [
      { name: '', modifier: 2 },
      { name: '', modifier: 2 },
    ],
    domainCards: [],
    weapons: [],
    equipment: [],
    gold: 0,
    notes: { background: '', connections: '', free: '' },
    actions: [],
    conditions: [],
  };
}
