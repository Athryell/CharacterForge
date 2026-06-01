import { useState } from 'react';

const STORAGE_KEY = 'characterforge_units';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

// Parse a speed string like "30ft", "9m", "6sq", "30" to feet (internal storage)
export function parseSpeedFt(s) {
  const str = String(s || '').trim().toLowerCase();
  const m = str.match(/^(\d+(?:\.\d+)?)\s*(m|ft|sq|cas)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2] || '';
  if (unit === 'm') return Math.round(n / 0.3);
  if (unit === 'sq' || unit === 'cas') return n * 5;
  return n; // assume feet
}

export function useUnits() {
  const [prefs, setPrefs] = useState(load);
  const weightUnit = prefs.weightUnit || 'kg';
  const speedUnit = prefs.speedUnit || 'ft';

  function setPref(key, val) {
    setPrefs(p => {
      const next = { ...p, [key]: val };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // No numeric conversion — unit is cosmetic, just round the value
  function toDisplayWeight(n) {
    return Math.round(n * 10) / 10;
  }

  // Convert from feet to display unit
  function toDisplaySpeed(ft) {
    const n = parseInt(ft) || 0;
    if (speedUnit === 'm') return Math.round(n * 0.3 * 10) / 10; // 1 decimal: 45ft → 13.5m
    if (speedUnit === 'sq') return Math.round(n / 5);
    return n;
  }

  // Convert from display unit back to feet for storage
  function fromDisplaySpeed(displayVal) {
    const n = parseFloat(displayVal) || 0; // parseFloat supports 13.5m
    if (speedUnit === 'm') return Math.round(n / 0.3);
    if (speedUnit === 'sq') return Math.round(n) * 5;
    return Math.round(n);
  }

  return { weightUnit, speedUnit, setPref, toDisplayWeight, toDisplaySpeed, fromDisplaySpeed };
}
