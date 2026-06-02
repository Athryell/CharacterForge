// Registry of supported game systems
export const SYSTEMS = [
  {
    id: 'dnd5e',
    name: 'D&D 5.5e 2024',
    shortName: 'D&D 5e',
    description: 'Dungeons & Dragons 5th Edition (2024)',
    icon: '⚔',
    defaultLayoutKey: 'dnd5e',
  },
  {
    id: 'daggerheart',
    name: 'Daggerheart',
    shortName: 'DH',
    description: 'Daggerheart by Darrington Press',
    icon: '🗡',
    defaultLayoutKey: 'daggerheart',
  },
];

export const DEFAULT_SYSTEM = 'dnd5e';

export function getSystem(id) {
  return SYSTEMS.find(s => s.id === id) || SYSTEMS[0];
}
