import { useState, useCallback } from 'react';

export type SupportedLanguage = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' | 'ar' | 'zh';

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  success: boolean;
}

interface UseTranslationReturn {
  translate: (text: string, targetLang: SupportedLanguage, sourceLang?: SupportedLanguage) => Promise<TranslationResult | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const translate = useCallback(async (
    text: string,
    targetLang: SupportedLanguage,
    sourceLang?: SupportedLanguage
  ): Promise<TranslationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Eğer hedef dil Türkçe ise çeviri yapma
      if (targetLang === 'tr') {
        const result = {
          translatedText: text,
          detectedLanguage: 'tr',
          success: true,
        };
        return result;
      }

      // Check cache first
      const cacheKey = `trans_${targetLang}_${text}`;
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Optionally check timestamp expiration here
            setLoading(false);
            return parsed;
          } catch (e) {
            console.warn('Cache parse error', e);
          }
        }
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          sourceLang: sourceLang || 'tr',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Çeviri başarısız');
      }

      const data = await response.json();

      // Save to cache
      if (typeof window !== 'undefined' && data.success) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          console.warn('Cache write error (likely full)', e);
        }
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.error('Translation error:', err);
      // Fallback: return original text as translated text on error, so UI shows something
      return {
        translatedText: text,
        detectedLanguage: sourceLang || 'tr',
        success: false
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return { translate, loading, error, clearError };
}

// Dil kodları mapping
export const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  'tr': 'TR',
  'en': 'EN',
  'de': 'DE',
  'fr': 'FR',
  'es': 'ES',
  'it': 'IT',
  'ru': 'RU',
  'ar': 'AR',
  'zh': 'ZH',
};

// Dil isimleri
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  'tr': 'Türkçe',
  'en': 'English',
  'de': 'Deutsch',
  'fr': 'Français',
  'es': 'Español',
  'it': 'Italiano',
  'ru': 'Русский',
  'ar': 'العربية',
  'zh': '中文',
};

// Dil bayrakları
export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  'tr': '🇹🇷',
  'en': '🇺🇸',
  'de': '🇩🇪',
  'fr': '🇫🇷',
  'es': '🇪🇸',
  'it': '🇮🇹',
  'ru': '🇷🇺',
  'ar': '🇸🇦',
  'zh': '🇨🇳',
};
