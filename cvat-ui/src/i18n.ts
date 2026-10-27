import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import config from './config';

i18n.use(initReactI18next).init({
    resources: config.LANGUAGE_RESOURCES,
    lng: config.DEFAULT_LANGUAGE,
    fallbackLng: 'en',
    supportedLngs: config.SUPPORT_LANGUAGES,
    interpolation: { escapeValue: false },
});

export default i18n;
