import { useState, useEffect } from 'react';
import { useTranslation, SupportedLanguage, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/hooks/useTranslation';
import { translateText } from '@/lib/translateService';
import { Language } from '@/types';
import { useLanguageStore } from '@/store/languageStore';

interface MenuTranslatorProps {
  menuItem: {
    id: string;
    name: string;
    description: string;
    translations?: {
      [lang: string]: {
        name: string;
        description: string;
      };
    };
  };
  onTranslated: (translations: { [lang: string]: { name: string; description: string } }) => void;
  className?: string;
}

// Settings'ten desteklenen dilleri al (Türkçe hariç - çeviri için)
const getSupportedLanguagesForTranslation = (): SupportedLanguage[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedSettings = localStorage.getItem('hotel-settings');
    console.log('MenuTranslator - localStorage hotel-settings:', savedSettings ? 'Var' : 'Yok');
    
    if (savedSettings) {
      const settingsData = JSON.parse(savedSettings);
      console.log('MenuTranslator - Settings data:', settingsData);
      console.log('MenuTranslator - language object:', settingsData.language);
      console.log('MenuTranslator - supportedLanguages:', settingsData.language?.supportedLanguages);
      console.log('MenuTranslator - supportedLanguages type:', typeof settingsData.language?.supportedLanguages);
      console.log('MenuTranslator - supportedLanguages isArray:', Array.isArray(settingsData.language?.supportedLanguages));
      
      if (settingsData.language?.supportedLanguages && Array.isArray(settingsData.language.supportedLanguages)) {
        // Türkçe'yi çıkar çünkü orijinal dil
        const supported = settingsData.language.supportedLanguages
          .filter((lang: string) => lang !== 'tr') as SupportedLanguage[];
        
        console.log('MenuTranslator - Settings\'ten alınan diller (Türkçe hariç):', supported);
        console.log('MenuTranslator - Filtrelenmiş dil sayısı:', supported.length);
        return supported;
      } else {
        console.warn('MenuTranslator - supportedLanguages bulunamadı veya array değil:', {
          language: settingsData.language,
          hasLanguage: !!settingsData.language,
          hasSupportedLanguages: !!settingsData.language?.supportedLanguages,
          supportedLanguagesType: typeof settingsData.language?.supportedLanguages,
          isArray: Array.isArray(settingsData.language?.supportedLanguages)
        });
      }
    } else {
      console.warn('MenuTranslator - hotel-settings localStorage\'da yok, varsayılan diller kullanılıyor');
    }
  } catch (error) {
    console.error('MenuTranslator - Settings yüklenirken hata:', error);
  }
  
  // Eğer settings yoksa, varsayılan dilleri kullan (Türkçe hariç)
  console.log('MenuTranslator - Settings bulunamadı, varsayılan diller kullanılıyor:', ['en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'zh']);
  return ['en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'zh'];
};

export function MenuTranslator({ menuItem, onTranslated, className = '' }: MenuTranslatorProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<{ [lang: string]: { name: string; description: string } }>(
    menuItem.translations || {}
  );
  const [editingLang, setEditingLang] = useState<SupportedLanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>(getSupportedLanguagesForTranslation());
  
  // Settings değiştiğinde desteklenen dilleri güncelle
  useEffect(() => {
    const updateSupportedLanguages = () => {
      const newSupported = getSupportedLanguagesForTranslation();
      console.log('MenuTranslator - Desteklenen diller güncelleniyor:', newSupported);
      setSupportedLanguages(newSupported);
    };
    
    // İlk yüklemede güncelle
    updateSupportedLanguages();
    
    // localStorage değişikliklerini dinle (farklı tab/window'dan)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hotel-settings') {
        updateSupportedLanguages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Sayfa içi değişiklikler için interval kontrolü (aynı tab'da settings kaydedildiğinde)
    const interval = setInterval(updateSupportedLanguages, 500);
    
    // Custom event dinle (settings sayfasından gönderilecek)
    const handleSettingsUpdate = () => {
      updateSupportedLanguages();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-updated', handleSettingsUpdate);
      clearInterval(interval);
    };
  }, []);
  
  // Tüm dillere çeviri yap
  const handleTranslateAll = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const newTranslations: { [lang: string]: { name: string; description: string } } = {
        ...translations
      };
      
      // Türkçe'yi de ekle (orijinal metin)
      newTranslations['tr'] = {
        name: menuItem.name,
        description: menuItem.description
      };
      
      // Sadece settings'te seçili dillere çeviri yap (Türkçe hariç)
      for (const lang of supportedLanguages) {
        if (lang === 'tr') continue;
        
        try {
          const translatedName = await translateText(menuItem.name, lang);
          const translatedDesc = await translateText(menuItem.description, lang);
          
          // Eğer çeviri başarılı olduysa (orijinal metinle aynı değilse) kaydet
          if (translatedName !== menuItem.name && translatedDesc !== menuItem.description) {
            newTranslations[lang] = {
              name: translatedName,
              description: translatedDesc
            };
          }
        } catch (err) {
          console.error(`Çeviri hatası (${lang}):`, err);
        }
      }
      
      setTranslations(newTranslations);
      onTranslated(newTranslations);
    } catch (err) {
      setError('Çeviri hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };
  
  // Tek bir dile çeviri yap
  const handleTranslateSingle = async (lang: SupportedLanguage) => {
    setError(null);
    setLoading(true);
    
    try {
      const translatedName = await translateText(menuItem.name, lang);
      const translatedDesc = await translateText(menuItem.description, lang);
      
      const newTranslations = {
        ...translations,
        [lang]: {
          name: translatedName,
          description: translatedDesc
        }
      };
      
      setTranslations(newTranslations);
      onTranslated(newTranslations);
    } catch (err) {
      setError('Çeviri hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveTranslation = (lang: SupportedLanguage) => {
    const newTranslations = { ...translations };
    onTranslated(newTranslations);
    setEditingLang(null);
  };
  
  const handleEditTranslation = (lang: SupportedLanguage) => {
    setEditingLang(lang);
  };
  
  const updateTranslation = (lang: SupportedLanguage, field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || { name: '', description: '' }),
        [field]: value
      }
    }));
  };
  
  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🌍</span>
          <h3 className="font-semibold text-gray-900">Menü Çevirisi</h3>
        </div>
        {supportedLanguages.length > 0 && (
          <button
            onClick={handleTranslateAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Tüm Dillere Çeviriliyor...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Tüm Dillere Çevir</span>
            </>
          )}
        </button>
        )}
      </div>
      
      {/* Hata Mesajı */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Tüm Diller */}
      <div className="space-y-3">
        {/* Türkçe (Orijinal) */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">
            {LANGUAGE_FLAGS.tr} {LANGUAGE_NAMES.tr} (Orijinal):
          </h4>
          <div className="space-y-1">
            <p className="text-gray-900 font-medium">{menuItem.name}</p>
            <p className="text-gray-700 text-sm">{menuItem.description}</p>
          </div>
        </div>
        
        {/* Diğer Diller */}
        {supportedLanguages.length === 0 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Settings'te desteklenen dil seçilmedi. Lütfen <strong>/management/settings</strong> sayfasından "Dil Ayarları" bölümünde desteklenen dilleri seçin.
            </p>
          </div>
        ) : (
          supportedLanguages.map((lang) => {
          const translation = translations[lang];
          const isEditing = editingLang === lang;
          
          return (
            <div key={lang} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800">
                  {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}:
                </h4>
                <div className="flex gap-2">
                  {!translation && (
                    <button
                      onClick={() => handleTranslateSingle(lang)}
                      disabled={loading}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Çevir
                    </button>
                  )}
                  {translation && !isEditing && (
                    <button
                      onClick={() => handleEditTranslation(lang)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      ✏️ Düzenle
                    </button>
                  )}
                </div>
              </div>
              
              {translation ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">İsim:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={translation.name}
                        onChange={(e) => updateTranslation(lang, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{translation.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Açıklama:</label>
                    {isEditing ? (
                      <textarea
                        value={translation.description}
                        onChange={(e) => updateTranslation(lang, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm">{translation.description}</p>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditingLang(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleSaveTranslation(lang)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Kaydet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Henüz çevrilmedi</p>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
