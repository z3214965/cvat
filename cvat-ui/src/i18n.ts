import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import config from './config';

i18n.use(initReactI18next).init({
    resources: config.languageResources,
    lng: config.defaultLanguage,
    fallbackLng: 'en',
    supportedLngs: config.supportedLanguages,
    interpolation: { escapeValue: false },
});

export default i18n;
