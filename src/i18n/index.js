import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import itUI from './locales/it/ui.json';
import enUI from './locales/en/ui.json';
import itGame from './locales/it/game.json';
import enGame from './locales/en/game.json';
import deUI from './locales/de/ui.json';
import deGame from './locales/de/game.json';
import frUI from './locales/fr/ui.json';
import frGame from './locales/fr/game.json';
import esUI from './locales/es/ui.json';
import esGame from './locales/es/game.json';

import PLUGINS from '../systems/registry';

const CORE_UI   = { it: itUI, en: enUI, de: deUI, fr: frUI, es: esUI };
const CORE_GAME = { it: itGame, en: enGame, de: deGame, fr: frGame, es: esGame };
const LANGS = Object.keys(CORE_UI);

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

// Combines core chrome with what every plugin contributes for a namespace like
// "creator" or "widgets", where core keeps the cross-system keys and each
// plugin adds its own on top — the physical file a key lives in never matters
// to i18next, only the merged shape does.
function deepMerge(...objs) {
  const out = {};
  for (const obj of objs) {
    if (!isPlainObject(obj)) continue;
    for (const [key, val] of Object.entries(obj)) {
      out[key] = isPlainObject(val) && isPlainObject(out[key])
        ? deepMerge(out[key], val)
        : val;
    }
  }
  return out;
}

// Each plugin may contribute i18n.bundles[lng] — merged over core ui.json so a
// system stays fully self-contained: adding one means one line in the
// registry, not an edit to the shared translation files.
const resources = {};
LANGS.forEach(lng => {
  const ui = deepMerge(CORE_UI[lng], ...PLUGINS.map(p => p.i18n?.bundles?.[lng]));
  resources[lng] = { ui, game: CORE_GAME[lng] };
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'ui',
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'characterforge_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

// dataManager reads this to pick translation tables for SRD data. It was read
// but never assigned, so every call that didn't pass a language explicitly
// silently returned English — spell and weapon names included.
function publishLang(lng) {
  try { window.__i18n_lang__ = lng; } catch { /* no window — ignore */ }
}
publishLang(i18n.language);
i18n.on('languageChanged', publishLang);

export default i18n;
