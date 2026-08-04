import {
  Dices, User, BarChart2, Grid3x3, CircleDot, Type, List, CheckSquare,
  Backpack, ScrollText, BookOpen, Sigma, Table,
  Heart, Shield, Zap, Star, Flame, Droplets,
} from 'lucide-react';

// widgetType.* — icons for the "choose type" chips in WidgetEditor. Bare lucide
// slugs there never matched CORE_ICONS (it only has dotted ids), so every chip
// fell back to "?" — this is what those ids actually resolve to now.
// barIcon.* — same story for the bar-widget color/icon picker.
const icons = {
  'system.custom': { emoji: '🎲', lucide: Dices, label: 'Custom' },

  'widgetType.identity':   { emoji: '👤', lucide: User,        label: 'Identity'    },
  'widgetType.bar':        { emoji: '📊', lucide: BarChart2,   label: 'Bar'         },
  'widgetType.statGrid':   { emoji: '🔢', lucide: Grid3x3,     label: 'Stats'       },
  'widgetType.counter':    { emoji: '⭕', lucide: CircleDot,   label: 'Counter'     },
  'widgetType.text':       { emoji: '📝', lucide: Type,        label: 'Text Field'  },
  'widgetType.list':       { emoji: '📋', lucide: List,        label: 'List'        },
  'widgetType.toggleList': { emoji: '☑',  lucide: CheckSquare, label: 'Toggle List' },
  'widgetType.inventory':  { emoji: '🎒', lucide: Backpack,    label: 'Inventory'   },
  'widgetType.notes':      { emoji: '📜', lucide: ScrollText,  label: 'Notes'       },
  'widgetType.log':        { emoji: '📖', lucide: BookOpen,    label: 'Log'         },
  'widgetType.formula':    { emoji: '∑',  lucide: Sigma,       label: 'Formula'     },
  'widgetType.rollButton': { emoji: '🎲', lucide: Dices,       label: 'Roll Button' },
  'widgetType.table':      { emoji: '▦',  lucide: Table,       label: 'Table'       },

  'barIcon.heart':    { emoji: '❤',  lucide: Heart,    label: 'Heart'    },
  'barIcon.shield':   { emoji: '🛡',  lucide: Shield,   label: 'Shield'   },
  'barIcon.zap':      { emoji: '⚡', lucide: Zap,      label: 'Zap'      },
  'barIcon.star':     { emoji: '⭐', lucide: Star,     label: 'Star'     },
  'barIcon.flame':    { emoji: '🔥', lucide: Flame,    label: 'Flame'    },
  'barIcon.droplets': { emoji: '💧', lucide: Droplets, label: 'Droplets' },
};

export default icons;
