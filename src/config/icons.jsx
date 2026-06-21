import React, { createContext, useContext, useState } from 'react';
import {
  Sword, Shield, Heart, Star, Zap, BookOpen, Scroll,
  Package, StickyNote, User, Users, Dices, Flame, Skull,
  Link, ArrowDownToLine, EarOff, PersonStanding, Handshake, Shell, Stone,
  Settings, Plus, X, Pencil, SquarePen, Check, Trash2,
  Moon, Sun, RefreshCw, Download, Upload, HelpCircle,
  Coffee, MessageSquare, Tag, Eye, EyeClosed, Grip,
  AlertTriangle, Sparkles,
  Target, Crosshair, Activity, ShoppingBag,
  Snowflake, Droplets, Droplet, Wind, Frown, CircleDot,
  Bandage, Cloud, Leaf, Circle,
  PawPrint, HeartPulse, HandHeart, Layers,
  Music, DiamondPlus,
} from 'lucide-react';

// ── Context ─────────────────────────────────────────────────────────────────

const IconModeContext = createContext({
  iconMode: 'emoji', setIconMode: () => {},
  iconAccent: false, setIconAccent: () => {},
});
export function useIconMode() { return useContext(IconModeContext); }

export function IconModeProvider({ children }) {
  const [iconMode, setIconMode] = useState(
    () => localStorage.getItem('characterforge_icon_mode') || 'lucide'
  );
  const [iconAccent, setIconAccent] = useState(
    () => localStorage.getItem('characterforge_icon_accent') === 'true'
  );
  function changeIconMode(mode) {
    localStorage.setItem('characterforge_icon_mode', mode);
    setIconMode(mode);
  }
  function changeIconAccent(val) {
    localStorage.setItem('characterforge_icon_accent', String(val));
    setIconAccent(val);
  }
  return (
    <IconModeContext.Provider value={{ iconMode, setIconMode: changeIconMode, iconAccent, setIconAccent: changeIconAccent }}>
      {children}
    </IconModeContext.Provider>
  );
}

// ── Icon registry ────────────────────────────────────────────────────────────
// Each entry: { emoji, lucide, gameIcon?, label }
// gameIcon = filename (without .svg) from public/icons/game-icons/
// Source game-icons.net: CC BY 3.0 — Lorc, Delapouite et al.

export const ICON_MAP = {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  'tab.main':       { emoji: '👤', lucide: User,          label: 'Character'    },
  'tab.combat':     { emoji: '⚔',  lucide: Sword,         gameIcon: 'crossed-swords',   label: 'Combat'       },
  'tab.spells':     { emoji: '✨', lucide: Sparkles,      gameIcon: 'magic-swirl',       label: 'Spells'       },
  'tab.inventory':  { emoji: '🎒', lucide: Package,       gameIcon: 'swap-bag',          label: 'Inventory'    },
  'tab.notes':      { emoji: '📝', lucide: StickyNote,    gameIcon: 'scroll-unfurled',   label: 'Notes'        },
  'tab.log':        { emoji: '📋', lucide: Scroll,        label: 'Log'          },
  'tab.sources':    { emoji: '📦', lucide: Package,       label: 'Sources'      },

  // ── Widgets ───────────────────────────────────────────────────────────────
  'widget.hp':          { emoji: '❤',  lucide: Heart,        gameIcon: 'health-normal',   label: 'HP'           },
  'widget.abilities':   { emoji: '🎲', lucide: Dices,        gameIcon: 'dice-six-faces-six', label: 'Abilities' },
  'widget.actions':     { emoji: '⚡', lucide: Zap,          label: 'Actions'      },
  'widget.spells':      { emoji: '📖', lucide: BookOpen,     gameIcon: 'open-book',        label: 'Spells'       },
  'widget.conditions':  { emoji: '🔮', lucide: AlertTriangle,label: 'Conditions'   },
  'widget.weapons':     { emoji: '⚔',  lucide: Sword,        gameIcon: 'crossed-swords',  label: 'Weapons'      },
  'widget.saves':       { emoji: '🛡',  lucide: Shield,       gameIcon: 'shield',           label: 'Saves'        },
  'widget.identity':    { emoji: '👤', lucide: User,         label: 'Identity'     },
  'widget.skills':      { emoji: '🔧', lucide: Settings,     label: 'Skills'       },
  'widget.senses':      { emoji: '👁',  lucide: Eye,          label: 'Senses'       },
  'widget.traits':      { emoji: '📝', lucide: StickyNote,   label: 'Traits'       },
  'widget.currency':    { emoji: '💰', lucide: ShoppingBag,  label: 'Currency'     },
  'widget.notes':       { emoji: '📝', lucide: StickyNote,   gameIcon: 'scroll-unfurled', label: 'Notes'        },
  'widget.inspiration': { emoji: '⭐', lucide: Star,         label: 'Inspiration'  },
  'widget.resources':   { emoji: '♦',  lucide: Layers,       label: 'Resources'    },
  'widget.deathSaves':  { emoji: '💀', lucide: Skull,        gameIcon: 'skulls',           label: 'Death Saves'  },
  'widget.spellSlots':  { emoji: '🔥', lucide: Flame,        gameIcon: 'burning-meteor',   label: 'Spell Slots'  },
  'widget.spellStats':  { emoji: '✨', lucide: Sparkles,     label: 'Spell Stats'  },
  'widget.armor':       { emoji: '🛡',  lucide: Shield,       gameIcon: 'shield',           label: 'Armor'        },
  'widget.combatStats': { emoji: '⚔',  lucide: Crosshair,    label: 'Combat Stats' },
  'widget.activityLog': { emoji: '📋', lucide: Activity,     label: 'Activity'     },

  // ── Actions ───────────────────────────────────────────────────────────────
  'action.edit':     { emoji: '✏',  lucide: SquarePen,    label: 'Edit',          alwaysLucide: true },
  'action.editItem': { emoji: '✏',  lucide: Pencil,       label: 'Edit item',     alwaysLucide: true },
  'action.done':     { emoji: '✓',  lucide: Check,        label: 'Done',          alwaysLucide: true },
  'action.add':      { emoji: '+',  lucide: Plus,         label: 'Add',           alwaysLucide: true },
  'action.remove':   { emoji: '✕',  lucide: X,            label: 'Remove'       },
  'action.delete':   { emoji: '🗑',  lucide: Trash2,       label: 'Delete',        alwaysLucide: true },
  'action.download': { emoji: '⬇',  lucide: Download,     label: 'Export'       },
  'action.upload':   { emoji: '⬆',  lucide: Upload,       label: 'Import'       },
  'action.reset':    { emoji: '↺',  lucide: RefreshCw,    label: 'Reset'        },
  'action.help':     { emoji: '?',  lucide: HelpCircle,   label: 'Help'         },
  'action.layout':   { emoji: '⠿',  lucide: Grip,         label: 'Layout'       },
  'action.settings': { emoji: '⚙',  lucide: Settings,     label: 'Settings'     },
  'action.tag':      { emoji: '🏷',  lucide: Tag,          label: 'Tag'          },
  'action.show':     { emoji: '👁',  lucide: Eye,          label: 'Show'         },
  'action.hide':     { emoji: '🚫', lucide: EyeClosed,    label: 'Hide'         },
  'action.allChars': { emoji: '👥', lucide: Users,        label: 'All characters', alwaysLucide: true },

  // ── Game ──────────────────────────────────────────────────────────────────
  'game.rest':          { emoji: '☕',  lucide: Coffee,      label: 'Rest'         },
  'game.longRest':      { emoji: '🛏',  lucide: Moon,        label: 'Long Rest'    },
  'game.shortRest':     { emoji: '🌙',  lucide: Sun,         label: 'Short Rest'   },
  'game.roll':          { emoji: '🎲',  lucide: Dices,       label: 'Roll'         },
  'game.inspiration':   { emoji: '⭐',  lucide: Star,        label: 'Inspiration', alwaysLucide: true },
  'game.concentration': { emoji: '🎯',  lucide: Target,      label: 'Concentration', alwaysLucide: true },
  'game.hope':          { emoji: '⭐',  lucide: Star,        label: 'Hope'         },
  'game.fear':          { emoji: '💀',  lucide: Skull,       label: 'Fear'         },
  'game.exhaustion':    { emoji: '😓',  lucide: Activity,    label: 'Exhaustion'   },
  'game.damage':        { emoji: '⚔',   lucide: Sword,       label: 'Damage'       },
  'game.heal':          { emoji: '❤',   lucide: Heart,       label: 'Heal'         },
  'game.tempHp':        { emoji: '🛡',  lucide: Shield,      label: 'Temp HP'      },

  // ── Conditions ────────────────────────────────────────────────────────────
  'cond.blinded':       { emoji: '👁️',  lucide: EyeClosed,     label: 'Blinded'       },
  'cond.charmed':       { emoji: '💫',  lucide: Sparkles,      label: 'Charmed'       },
  'cond.deafened':      { emoji: '🔇',  lucide: EarOff,        label: 'Deafened'      },
  'cond.frightened':    { emoji: '😨',  lucide: AlertTriangle, label: 'Frightened'    },
  'cond.grappled':      { emoji: '🤼',  lucide: Handshake,          label: 'Grappled'      },
  'cond.incapacitated': { emoji: '😵',  lucide: Shell,          label: 'Incapacitated' },
  'cond.invisible':     { emoji: '👻',  lucide: EyeClosed,     label: 'Invisible'     },
  'cond.paralyzed':     { emoji: '🧊',  lucide: PersonStanding,          label: 'Paralyzed'     },
  'cond.petrified':     { emoji: '🗿',  lucide: Stone,         label: 'Petrified'     },
  'cond.poisoned':      { emoji: '☠️',  lucide: Skull,         label: 'Poisoned'      },
  'cond.prone':         { emoji: '⬇️',  lucide: ArrowDownToLine, label: 'Prone'         },
  'cond.restrained':    { emoji: '⛓️',  lucide: Link,          label: 'Restrained'    },
  'cond.stunned':       { emoji: '⭐',  lucide: Sparkles,      label: 'Stunned'       },
  'cond.unconscious':   { emoji: '💤',  lucide: Moon,          label: 'Unconscious'   },

  // ── Resources ─────────────────────────────────────────────────────────────
  'resource.sparkles':      { emoji: '✨', lucide: Sparkles,    label: 'Sparkles'     },
  'resource.flame':         { emoji: '🔥', lucide: Flame,       label: 'Flame'        },
  'resource.zap':           { emoji: '⚡', lucide: Zap,         label: 'Zap'          },
  'resource.sun':           { emoji: '☀',  lucide: Sun,         label: 'Sun'          },
  'resource.eye':           { emoji: '👁',  lucide: Eye,         label: 'Eye'          },
  'resource.paw-print':     { emoji: '🐾', lucide: PawPrint,    label: 'Paw Print'    },
  'resource.heart-pulse':   { emoji: '💗', lucide: HeartPulse,  label: 'Heart Pulse'  },
  'resource.hand-heart':    { emoji: '🤲', lucide: HandHeart,   label: 'Hand Heart'   },
  'resource.music':         { emoji: '🎵', lucide: Music,       label: 'Music'        },
  'resource.shield':        { emoji: '🛡',  lucide: Shield,      label: 'Shield'       },
  'resource.target':        { emoji: '🎯', lucide: Target,      label: 'Target'       },
  'resource.star':          { emoji: '⭐', lucide: Star,        label: 'Star'         },
  'resource.diamond-plus':  { emoji: '◈',  lucide: DiamondPlus, label: 'Diamond Plus' },

  // ── Misc ──────────────────────────────────────────────────────────────────
  'misc.kofi':     { emoji: '☕', lucide: Coffee,       label: 'Support'   },
  'misc.feedback': { emoji: '📝', lucide: MessageSquare,label: 'Feedback'  },
};

// ── Emoji → Lucide mapping (for custom condition icons) ─────────────────────
export const EMOJI_TO_LUCIDE = {
  '⚠️': AlertTriangle,
  '💀': Skull,
  '🔥': Flame,
  '❄️': Snowflake,
  '⚡': Zap,
  '💧': Droplets,
  '🌀': Wind,
  '☠️': Skull,
  '😵': Skull,
  '😨': Frown,
  '🤢': Frown,
  '😴': Moon,
  '🩸': Droplet,
  '🔮': CircleDot,
  '⛓️': Link,
  '🛡️': Shield,
  '👁️': Eye,
  '🌑': Circle,
  '💫': Sparkles,
  '🤕': Bandage,
  '🧊': Snowflake,
  '☁️': Cloud,
  '🌿': Leaf,
  '⚔️': Sword,
};

// ── Components ───────────────────────────────────────────────────────────────

// GameIcon — loads SVG from public/icons/game-icons/ (CC BY 3.0 game-icons.net)
export function GameIcon({ name, size = 20, className = '', accent = false }) {
  return (
    <img
      src={`${process.env.PUBLIC_URL}/icons/game-icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={`icon-game ${accent ? 'icon-game-accent' : ''} ${className}`}
    />
  );
}

// Icon — renders the right variant based on iconMode from context
export function Icon({ id, size = 16, className = '', fallback }) {
  const { iconMode, iconAccent } = useIconMode();
  const entry = ICON_MAP[id];

  if (!entry) return fallback != null ? <span>{fallback}</span> : null;

  // alwaysLucide entries render as Lucide regardless of iconMode
  if (entry.alwaysLucide) {
    const LucideIcon = entry.lucide;
    if (LucideIcon) {
      return (
        <LucideIcon
          size={size}
          className={`icon-lucide ${className}`}
          aria-label={entry.label}
          style={iconAccent ? { color: 'var(--c-accent)' } : undefined}
        />
      );
    }
  }

  // action.* are UI controls — always visible; in 'none' mode show a small dot
  if (id.startsWith('action.')) {
    if (iconMode === 'none') {
      return <span className={`icon-none-dot ${className}`} aria-label={entry.label} />;
    }
    const LucideIcon = entry.lucide;
    if (LucideIcon) {
      return (
        <LucideIcon
          size={size}
          className={`icon-lucide ${className}`}
          aria-label={entry.label}
          style={iconAccent ? { color: 'var(--c-accent)' } : undefined}
        />
      );
    }
  }

  if (iconMode === 'none') return null;

  if (iconMode === 'lucide') {
    const LucideIcon = entry.lucide;
    if (LucideIcon) {
      return (
        <LucideIcon
          size={size}
          className={`icon-lucide ${className}`}
          aria-label={entry.label}
          style={iconAccent ? { color: 'var(--c-accent)' } : undefined}
        />
      );
    }
    if (entry.gameIcon) {
      return <GameIcon name={entry.gameIcon} size={size} className={className} accent={iconAccent} />;
    }
  }

  // emoji mode (default)
  return <span className={`icon-emoji ${className}`} aria-label={entry.label}>{entry.emoji}</span>;
}
