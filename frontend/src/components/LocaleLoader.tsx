'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

const LOCALE_LANGS = ['tr', 'de', 'en', 'ru'];

export default function LocaleLoader() {
  const setLoadedTranslations = useLanguageStore((s) => s.setLoadedTranslations);

  useEffect(() => {
    let cancelled = false;
    LOCALE_LANGS.forEach((lang) => {
      fetch(`/locales/${lang}.json`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data && typeof data === 'object') {
            setLoadedTranslations(lang, data);
          }
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [setLoadedTranslations]);

  return null;
}
