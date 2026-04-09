import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import kn from './kn.json';

const savedLang = localStorage.getItem('farmpulse_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      kn: { translation: kn },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Save language choice whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('farmpulse_lang', lng);
});

export default i18n;