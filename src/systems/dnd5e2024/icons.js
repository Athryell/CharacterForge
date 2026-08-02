import { Sword, Star, Target, Activity } from 'lucide-react';

// Only what the shared vocabulary in config/icons.jsx cannot name.
// Everything generic — widget.armor, widget.inventory, cond.* and the rest —
// stays in the core map and is used from here without being redeclared.
const icons = {
  'system.dnd5e2024':   { emoji: '⚔',  lucide: Sword,    label: 'D&D 5e'        },
  'game.inspiration':   { emoji: '⭐', lucide: Star,     label: 'Inspiration', alwaysLucide: true },
  'game.concentration': { emoji: '🎯', lucide: Target,   label: 'Concentration', alwaysLucide: true },
  'game.exhaustion':    { emoji: '😓', lucide: Activity, label: 'Exhaustion'    },
};

export default icons;
