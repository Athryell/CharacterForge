import { useState, useEffect } from 'react';

const STORAGE_KEY = 'characterforge_accessibility';

const DEFAULTS = {
  font:         'default',   // 'default' | 'opendyslexic' | 'atkinson'
  textSize:     'normal',    // 'normal' | 'large' | 'xlarge'
  contrast:     'default',   // 'default' | 'high'
  largeTargets: false,
};

export function useAccessibility() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...DEFAULTS, ...saved };
    } catch { return DEFAULTS; }
  });

  useEffect(() => {
    const body = document.body;
    body.classList.remove('font-opendyslexic', 'font-atkinson');
    if (prefs.font !== 'default') body.classList.add(`font-${prefs.font}`);
    body.classList.remove('text-large', 'text-xlarge');
    if (prefs.textSize !== 'normal') body.classList.add(`text-${prefs.textSize}`);
    body.classList.remove('high-contrast');
    if (prefs.contrast === 'high') body.classList.add('high-contrast');
    body.classList.remove('large-targets');
    if (prefs.largeTargets) body.classList.add('large-targets');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  function setPref(key, value) {
    setPrefs(p => ({ ...p, [key]: value }));
  }

  return { prefs, setPref };
}
