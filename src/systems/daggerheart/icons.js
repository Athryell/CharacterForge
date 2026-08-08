import { Sword, Star, Skull, Ghost, Snail, Angry } from 'lucide-react';

// Hope and Fear are Daggerheart mechanics, so the core has no business naming
// them. The three conditions below had no icon at all before this file existed:
// DH_CONDITIONS carries vulnerable/hidden/slow, which the shared cond.* palette
// does not cover, so they fell through to the raw-emoji fallback and ignored the
// user's icon-mode setting. restrained, frightened and unconscious are NOT here
// on purpose — the shared palette already names them and DH reuses them free.
const icons = {
  'system.daggerheart': { emoji: '🗡', lucide: Sword, label: 'Daggerheart' },
  'game.hope':          { emoji: '⭐', lucide: Star,  label: 'Hope'  },
  'game.fear':          { emoji: '💀', lucide: Skull, label: 'Fear'  },
  'cond.vulnerable':    { emoji: '💢', lucide: Angry, label: 'Vulnerable' },
  'cond.hidden':        { emoji: '👻', lucide: Ghost, label: 'Hidden'     },
  'cond.slow':          { emoji: '🐌', lucide: Snail, label: 'Slow'       },
};

export default icons;
