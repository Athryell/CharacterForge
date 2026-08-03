// Homebrew entity schema for dnd5e2024 — drives the HomebrewEditor form.
// Moved verbatim out of src/config/homebrewSchema.js, along with the two option
// lists it referenced from that file's module scope.

import { DND_SPELLS } from './data/spells';
import { DND_WEAPONS } from './data/weapons';
import { DND_CONDITIONS } from './data/conditions';
import { DND_CLASS_NAMES } from './data/classes';
import { DND_SPECIES } from './data/species';
import { DND_BACKGROUNDS } from './data/backgrounds';
import { SRD_ITEMS } from './data/items';

const ABILITY_OPTIONS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const SKILL_OPTIONS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'Sleight of Hand', 'Stealth', 'Survival',
];

const homebrew = {
  // The bundled ruleset, listed alongside imported packs in SourceManager.
  sourceInfo: () => ({
    id: 'srd',
    name: 'SRD 5.2.1',
    author: 'Wizards of the Coast',
    counts: {
      spells:      DND_SPELLS.length,
      weapons:     DND_WEAPONS.length,
      classes:     DND_CLASS_NAMES.length,
      species:     DND_SPECIES.length,
      backgrounds: DND_BACKGROUNDS.length,
      conditions:  DND_CONDITIONS.length,
      items:       SRD_ITEMS.length,
    },
  }),

  // The empty pack offered by "Empty JSON template".
  exportTemplate: () => ({
    classes: [], subclasses: [], species: [], backgrounds: [],
    spells: [], weapons: [], items: [], conditions: [], feats: [],
  }),

  schema: {
    weapons: {
      label: 'Weapons',
      icon: 'widget.weapons',
      fields: [
        { id: 'name',       label: 'Name',         type: 'text',        required: true },
        { id: 'dmg',        label: 'Damage',        type: 'text',        placeholder: '1d8' },
        { id: 'dmgType',    label: 'Damage Type',   type: 'select',      options: ['slashing', 'piercing', 'bludgeoning'] },
        { id: 'category',   label: 'Category',      type: 'select',      options: ['simple-melee', 'simple-ranged', 'martial-melee', 'martial-ranged'] },
        { id: 'properties', label: 'Properties',    type: 'multiselect', options: ['finesse', 'light', 'heavy', 'thrown', 'versatile', 'two-handed', 'reach', 'loading', 'ammunition'] },
        { id: 'mastery',    label: 'Mastery',       type: 'select',      options: ['nick', 'vex', 'sap', 'push', 'slow', 'topple', 'cleave', 'graze'] },
        { id: 'range',      label: 'Range',         type: 'text',        placeholder: '20/60' },
        { id: 'weight',     label: 'Weight',        type: 'text' },
        { id: 'cost',       label: 'Cost',          type: 'text' },
      ],
    },
    spells: {
      label: 'Spells',
      icon: 'tab.spells',
      fields: [
        { id: 'name',       label: 'Name',          type: 'text',        required: true },
        { id: 'level',      label: 'Level',         type: 'select',      options: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'school',     label: 'School',        type: 'select',      options: ['abjuration','conjuration','divination','enchantment','evocation','illusion','necromancy','transmutation'] },
        { id: 'classes',    label: 'Classes',       type: 'multiselect', optionsFrom: 'dnd5e.classNames' },
        { id: 'time',       label: 'Casting Time',  type: 'text' },
        { id: 'range',      label: 'Range',         type: 'text' },
        { id: 'components', label: 'Components',    type: 'text' },
        { id: 'duration',   label: 'Duration',      type: 'text' },
        { id: 'c',          label: 'Concentration', type: 'checkbox' },
        { id: 'r',          label: 'Ritual',        type: 'checkbox' },
        { id: 'desc',       label: 'Description',   type: 'textarea' },
      ],
    },
    classes: {
      label: 'Classes',
      icon: 'tab.main',
      fields: [
        { id: 'name',                label: 'Name',              type: 'text',        required: true },
        { id: 'hitDie',              label: 'Hit Die',           type: 'select',      options: ['d6', 'd8', 'd10', 'd12'] },
        { id: 'spellcastingAbility', label: 'Spellcasting',      type: 'select',      options: ['none', 'INT', 'WIS', 'CHA'] },
        { id: 'savingThrows',        label: 'Saving Throws',     type: 'multiselect', options: ABILITY_OPTIONS },
        { id: 'skillCount',          label: 'Skill Count',       type: 'select',      options: ['2', '3', '4'] },
        { id: 'features',            label: 'Features',          type: 'list',        subfields: [
          { id: 'name', label: 'Name',        type: 'text' },
          { id: 'desc', label: 'Description', type: 'textarea' },
        ]},
      ],
    },
    subclasses: {
      label: 'Subclasses',
      singular: 'Subclass',
      icon: 'tab.main',
      fields: [
        { id: 'class',    label: 'Class',    type: 'select',  optionsFrom: 'dnd5e.classNames', required: true },
        { id: 'name',     label: 'Name',     type: 'text',    required: true },
        { id: 'features', label: 'Features', type: 'list',    subfields: [
          { id: 'level', label: 'Lv.', type: 'number', min: 1, max: 20, placeholder: '1' },
          { id: 'name',  label: 'Name',        type: 'text' },
          { id: 'desc',  label: 'Description', type: 'textarea' },
        ]},
      ],
    },
    species: {
      label: 'Species',
      icon: 'tab.main',
      fields: [
        { id: 'name',   label: 'Name',   type: 'text',   required: true },
        { id: 'size',   label: 'Size',   type: 'select', options: ['Tiny', 'Small', 'Medium', 'Large'] },
        { id: 'speed',  label: 'Speed',  type: 'text' },
        { id: 'traits', label: 'Traits', type: 'list',   subfields: [
          { id: 'name', label: 'Name',        type: 'text' },
          { id: 'desc', label: 'Description', type: 'textarea' },
        ]},
      ],
    },
    backgrounds: {
      label: 'Backgrounds',
      icon: 'tab.main',
      fields: [
        { id: 'name',     label: 'Name',               type: 'text',        required: true },
        { id: 'skills',   label: 'Skills',              type: 'multiselect', options: SKILL_OPTIONS },
        { id: 'tool',     label: 'Tool Proficiency',    type: 'text' },
        { id: 'language', label: 'Language',            type: 'text' },
        { id: 'desc',     label: 'Description',         type: 'textarea' },
      ],
    },
    armors: {
      label: 'Armors',
      icon: 'widget.armor',
      fields: [
        { id: 'name',    label: 'Name',            type: 'text',   required: true },
        { id: 'type',    label: 'Type',            type: 'select', options: ['light', 'medium', 'heavy'] },
        { id: 'ac',      label: 'AC',              type: 'text' },
        { id: 'strReq',  label: 'STR Requirement', type: 'text' },
        { id: 'maxDex',  label: 'Max DEX Bonus',   type: 'text' },
        { id: 'feature', label: 'Feature',         type: 'text' },
      ],
    },
    items: {
      label: 'Items',
      icon: 'tab.inventory',
      fields: [
        { id: 'name',   label: 'Name',            type: 'text',     required: true },
        { id: 'weight', label: 'Weight',           type: 'text' },
        { id: 'cost',   label: 'Cost',             type: 'text' },
        { id: 'desc',   label: 'Description',      type: 'textarea' },
        { id: 'qty',    label: 'Default Quantity', type: 'text' },
      ],
    },
    conditions: {
      label: 'Conditions',
      icon: 'widget.conditions',
      fields: [
        { id: 'name', label: 'Name',        type: 'text',     required: true },
        { id: 'icon', label: 'Icon',        type: 'text',     placeholder: '😵' },
        { id: 'desc', label: 'Description', type: 'textarea' },
      ],
    },
    feats: {
      label: 'Feats',
      icon: 'tab.spells',
      fields: [
        { id: 'name',         label: 'Name',         type: 'text',   required: true },
        { id: 'prerequisite', label: 'Prerequisite', type: 'text' },
        { id: 'category',     label: 'Category',     type: 'select', options: ['Origin', 'General', 'Fighting Style', 'Epic Boon'] },
        { id: 'desc',         label: 'Description',  type: 'textarea' },
      ],
    },
  },
};

export default homebrew;
