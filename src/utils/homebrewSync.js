const DRAFT_KEY = 'characterforge_homebrew_draft';

// Adds an item to the homebrew draft in localStorage.
// type: 'weapons'|'spells'|'conditions'|'items'|'feats'|'classes'|'subclasses'|'species'|'backgrounds'
// _fromSheet: true marks items synced from the sheet (shown as badge in HomebrewEditor)
export function syncCustomToDraft(type, item, system = 'dnd5e2024') {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? JSON.parse(raw) : {
      id: 'homebrew_draft',
      name: '',
      system,
      classes: [], subclasses: [], species: [], backgrounds: [],
      spells: [], weapons: [], armors: [], items: [], conditions: [], feats: [],
    };
    const existing = draft[type] || [];
    const isDuplicate = existing.some(e =>
      (e.id && e.id === item.id) || (e.name && e.name === item.name)
    );
    if (!isDuplicate) {
      draft[type] = [...existing, { ...item, _fromSheet: true }];
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch (e) {
    console.error('homebrewSync: failed to sync', e);
  }
}
