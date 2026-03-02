'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export default function BrowserLanguageDetector() {
  const { setLanguage, currentLanguage } = useLanguageStore();

  useEffect(() => {
    // Sadece ilk yüklemede çalışır
    if (typeof window !== 'undefined') {
      // LocalStorage'da kayıtlı dil varsa kullanma
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        return; // Kullanıcı seçimi varsa, algılama yapma
      }

      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const langCode = browserLang.split('-')[0].toLowerCase();

      // Desteklenen diller: tr, de, ar, ru -> diğerleri en
      const supportedLanguages = ['tr', 'de', 'ar', 'ru'];
      const detectedLang = supportedLanguages.includes(langCode) ? langCode : 'en';
      
      // Varsayılan dilden farklıysa değiştir
      if (detectedLang !== 'tr') {
        setLanguage(detectedLang);
      }
    }
  }, []); // Sadece mount'ta çalışır

  return null;
}
