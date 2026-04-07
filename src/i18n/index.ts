import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';

export const STORAGE_KEY = 'i18nextLng';

export const resources = {
  en: {
    translation: en
  },
  ja: {
    translation: ja
  }
};

void i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: import.meta.env.MODE === 'development',
    resources,
    interpolation: {
      escapeValue: false
    }
  });

if (typeof window === 'undefined') {
  void i18n.changeLanguage('en');
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Locale = 'en' | 'ja' | string;

export default i18n;
