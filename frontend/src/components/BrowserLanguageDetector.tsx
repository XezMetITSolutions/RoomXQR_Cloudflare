'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export default function BrowserLanguageDetector() {
  const { setLanguage, currentLanguage } = useLanguageStore();

  useEffect(() => {
    // Sadece ilk yüklemede ve dil seçilmemişse çalışır
    if (typeof window !== 'undefined' && currentLanguage === 'tr') {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const langCode = browserLang.split('-')[0].toLowerCase();

      // Desteklenen diller: tr, de, ar, ru -> diğerleri en
      const languageMap: { [key: string]: string } = {
        'tr': 'tr',
        'de': 'de',
        'ar': 'ar',
        'ru': 'ru',
      };

      const detectedLang = languageMap[langCode] || 'en';
      
      // Sadece farklıysa değiştir
      if (detectedLang !== currentLanguage) {
        setLanguage(detectedLang);
      }
    }
  }, []); // Sadece mount'ta çalışır

  return null;
}
