import { en } from "./locales/en";
import { zhTW } from "./locales/zh-TW";

export const locales = {
  en,
  "zh-TW": zhTW,
} as const;

export type LocaleKey = keyof typeof locales;
export type TranslationKey = keyof typeof zhTW;

export function getTranslations(locale: LocaleKey) {
  return locales[locale];
}

export function translate(key: TranslationKey, locale: LocaleKey): string {
  const translations = getTranslations(locale);
  return translations[key] || key;
}

// Type-safe hook for translations
export function useTranslations(locale: LocaleKey) {
  return {
    t: (key: TranslationKey) => translate(key, locale),
  };
}
