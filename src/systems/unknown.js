import { defineSystem } from './contract';

// Fallback for a system id the registry doesn't know — a character saved by a
// newer build, or a typo'd id.
//
// It deliberately does NOT fall back to D&D. The old dataManager.getAdapter()
// returned the D&D adapter for any unrecognised id, which is exactly how a bad
// id turns into silently corrupted data: the sheet renders, the user edits it,
// and the wrong rules get written back. Every capability here is false, so the
// core offers nothing that could write.

export default defineSystem({
  meta: {
    id:          '__unknown__',
    name:        'Unknown system',
    shortName:   '?',
    description: 'This character was saved with a system this build does not know.',
    iconId:      'action.help',
    order:       999,
  },
  capabilities: { hiddenWidgetTray: false },
  data:     null,
  creator:  null,
  homebrew: null,
  notation: { menu: [] },
  icons:    {},
});
