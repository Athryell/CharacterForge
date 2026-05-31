import { useState, useEffect } from 'react';

export const ACCENT_PRESETS = [
  { id: 'green',  label: 'Verde',   light: { accent: '#2D6A0F', accentLight: '#E8F4DC', accentText: '#1A4708' }, dark: { accent: '#6BBF45', accentLight: '#182A0A', accentText: '#8FD460' } },
  { id: 'blue',   label: 'Blu',     light: { accent: '#1558CC', accentLight: '#DCE9FF', accentText: '#0C3A8A' }, dark: { accent: '#5B9BFF', accentLight: '#0D1F3C', accentText: '#85B4FF' } },
  { id: 'purple', label: 'Viola',   light: { accent: '#6B3DB5', accentLight: '#EEE5FF', accentText: '#46259A' }, dark: { accent: '#A67FE8', accentLight: '#1E1035', accentText: '#C4AAFF' } },
  { id: 'red',    label: 'Rosso',   light: { accent: '#B52222', accentLight: '#FFE5E5', accentText: '#8A1818' }, dark: { accent: '#FF6B6B', accentLight: '#2D0808', accentText: '#FF9090' } },
  { id: 'teal',   label: 'Teal',    light: { accent: '#0E7A6A', accentLight: '#D9F5F1', accentText: '#07524A' }, dark: { accent: '#3ECFBC', accentLight: '#082622', accentText: '#7FE8DC' } },
  { id: 'orange', label: 'Arancio', light: { accent: '#B86B00', accentLight: '#FFF0D6', accentText: '#7A4600' }, dark: { accent: '#FFA940', accentLight: '#2A1800', accentText: '#FFD08A' } },
];

function applyTheme(mode, accentId) {
  const root = document.documentElement;

  // Determine effective theme
  const effective = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  root.setAttribute('data-theme', effective);

  const preset = ACCENT_PRESETS.find(p => p.id === accentId) || ACCENT_PRESETS[0];
  const colors = effective === 'dark' ? preset.dark : preset.light;

  root.style.setProperty('--c-accent', colors.accent);
  root.style.setProperty('--c-accent-light', colors.accentLight);
  root.style.setProperty('--c-accent-text', colors.accentText);
}

export function useTheme() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'system');
  const [accentId, setAccentId] = useState(() => localStorage.getItem('theme_accent') || 'green');

  useEffect(() => {
    applyTheme(mode, accentId);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => { if (mode === 'system') applyTheme(mode, accentId); };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [mode, accentId]);

  function setThemeMode(m) {
    setMode(m);
    localStorage.setItem('theme_mode', m);
  }

  function setAccent(id) {
    setAccentId(id);
    localStorage.setItem('theme_accent', id);
  }

  return { mode, accentId, setThemeMode, setAccent };
}
