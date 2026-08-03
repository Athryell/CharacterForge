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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'ui',
    resources: {
      it: { ui: itUI, game: itGame },
      en: { ui: enUI, game: enGame },
      de: { ui: deUI, game: deGame },
      fr: { ui: frUI, game: frGame },
      es: { ui: esUI, game: esGame },
    },
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
