import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import itUI from './locales/it/ui.json';
import enUI from './locales/en/ui.json';
import itGame from './locales/it/game.json';
import enGame from './locales/en/game.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'it',
    defaultNS: 'ui',
    resources: {
      it: { ui: itUI, game: itGame },
      en: { ui: enUI, game: enGame },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'characterforge_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
