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

export default i18n;
