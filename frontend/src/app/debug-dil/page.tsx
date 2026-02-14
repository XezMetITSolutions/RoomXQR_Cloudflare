"use client";

import { useState, useEffect } from 'react';

export default function DebugDilPage() {
  const [mounted, setMounted] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [languageStoreData, setLanguageStoreData] = useState<any>(null);
  const [menuTranslatorData, setMenuTranslatorData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    if (typeof window === 'undefined') return;

    // 1. LocalStorage'dan settings'i oku
    try {
      const savedSettings = localStorage.getItem('hotel-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setLocalStorageData({
          exists: true,
          language: parsed.language || null,
          supportedLanguages: parsed.language?.supportedLanguages || [],
          defaultLanguage: parsed.language?.defaultLanguage || null,
          lastUpdated: parsed.lastUpdated || null,
        });
      } else {
        setLocalStorageData({ exists: false });
      }
    } catch (error) {
      setLocalStorageData({ exists: false, error: String(error) });
    }

    // 2. Language Store'dan bilgileri al (güvenli şekilde)
    try {
      setTimeout(() => {
        import('@/store/languageStore').then((module) => {
          try {
            const { useLanguageStore } = module;
            if (useLanguageStore && useLanguageStore.getState) {
              const store = useLanguageStore.getState();
              if (store) {
                setLanguageStoreData({
                  currentLanguage: store.currentLanguage || 'tr',
                  getCurrentLanguage: store.getCurrentLanguage ? store.getCurrentLanguage() : null,
                  getSupportedLanguages: store.getSupportedLanguages ? store.getSupportedLanguages() : [],
                  supportedCount: store.getSupportedLanguages ? store.getSupportedLanguages().length : 0
                });
              } else {
                setLanguageStoreData({ error: 'Store state null' });
              }
            } else {
              setLanguageStoreData({ error: 'Store getState bulunamadı' });
            }
          } catch (storeError) {
            setLanguageStoreData({ error: `Store okuma hatası: ${storeError}` });
          }
        }).catch((importError) => {
          setLanguageStoreData({ error: `Import hatası: ${importError}` });
        });
      }, 100);
    } catch (error) {
      setLanguageStoreData({ error: String(error) });
    }

    // 3. MenuTranslator simülasyonu
    try {
      const savedSettings = localStorage.getItem('hotel-settings');
      if (savedSettings) {
        const settingsData = JSON.parse(savedSettings);
        if (settingsData.language?.supportedLanguages && Array.isArray(settingsData.language.supportedLanguages)) {
          const supported = settingsData.language.supportedLanguages.filter((lang: string) => lang !== 'tr');
          setMenuTranslatorData({
            supported: supported,
            count: supported.length,
            allLanguages: settingsData.language.supportedLanguages
          });
        } else {
          setMenuTranslatorData({ supported: [], count: 0, default: ['en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'zh'] });
        }
      } else {
        setMenuTranslatorData({ supported: [], count: 0, default: ['en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'zh'] });
      }
    } catch (error) {
      setMenuTranslatorData({ error: String(error) });
    }
  };

  const testSave = () => {
    if (typeof window === 'undefined') return;
    const testSettings = {
      hotel: { name: 'Test Hotel' },
      theme: { mode: 'light' },
      language: {
        defaultLanguage: 'tr',
        supportedLanguages: ['tr', 'en', 'de', 'fr']
      },
      socialMedia: {},
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('hotel-settings', JSON.stringify(testSettings));
    loadData();
  };

  const clearStorage = () => {
    if (typeof window === 'undefined') return;
    if (confirm('localStorage temizlensin mi?')) {
      localStorage.removeItem('hotel-settings');
      loadData();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌍 Dil Ayarları Debug</h1>
              <p className="text-sm text-gray-600 mt-1">URL: /debug-dil (Layout'tan bağımsız)</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Yenile
              </button>
              <button
                onClick={testSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🧪 Test Kaydet
              </button>
              <button
                onClick={clearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ Temizle
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LocalStorage */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📦 LocalStorage</h2>
            {localStorageData?.exists ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-800">✅ Settings Mevcut</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Default Language:</p>
                  <p className="text-sm px-3 py-1 bg-blue-100 rounded">{localStorageData.defaultLanguage || 'Yok'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Supported Languages ({localStorageData.supportedLanguages.length}):</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {localStorageData.supportedLanguages.map((lang: string) => (
                      <span
                        key={lang}
                        className={`px-2 py-1 rounded text-xs ${
                          lang === 'tr' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                {localStorageData.lastUpdated && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Son Güncelleme: {new Date(localStorageData.lastUpdated).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-800">⚠️ Settings Bulunamadı</p>
                {localStorageData?.error && (
                  <p className="text-xs text-red-600 mt-1">Hata: {localStorageData.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Language Store */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏪 Language Store</h2>
            {languageStoreData?.error ? (
              <div className="p-3 bg-red-50 rounded">
                <p className="text-sm text-red-800">❌ Hata: {languageStoreData.error}</p>
              </div>
            ) : languageStoreData ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Current Language:</p>
                  <p className="text-sm px-3 py-1 bg-blue-100 rounded">{languageStoreData.currentLanguage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Supported Languages ({languageStoreData.supportedCount}):</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languageStoreData.getSupportedLanguages?.map((lang: any) => (
                      <span
                        key={lang.code}
                        className="px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                      >
                        {lang.flag} {lang.code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Yükleniyor...</p>
              </div>
            )}
          </div>

          {/* MenuTranslator */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">🌍 MenuTranslator</h2>
            {menuTranslatorData?.error ? (
              <div className="p-3 bg-red-50 rounded">
                <p className="text-sm text-red-800">❌ Hata: {menuTranslatorData.error}</p>
              </div>
            ) : menuTranslatorData?.supported && menuTranslatorData.supported.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-800">
                    ✅ {menuTranslatorData.count} Dil Görünecek (Türkçe Hariç)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Görünecek Diller:</p>
                  <div className="flex flex-wrap gap-2">
                    {menuTranslatorData.supported.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-3 py-1 rounded text-sm bg-purple-100 text-purple-800"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Settings Yok - Varsayılan Diller Kullanılacak
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Varsayılan Diller:</p>
                  <div className="flex flex-wrap gap-2">
                    {menuTranslatorData?.default?.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-800"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Veri Akışı */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">🔄 Veri Akışı</h2>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <p className="font-medium mb-2">1. Settings Sayfası (/management/settings)</p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>Kullanıcı dilleri seçer</li>
                  <li>Checkbox değiştiğinde localStorage'a kaydedilir</li>
                  <li>"Kaydet" butonuna tıklanınca localStorage'a kaydedilir</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="font-medium mb-2">2. Language Store</p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>localStorage'dan settings'i okur</li>
                  <li>getSupportedLanguages() fonksiyonu ile dilleri filtreler</li>
                </ul>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="font-medium mb-2">3. MenuTranslator</p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>localStorage'dan settings'i okur</li>
                  <li>Türkçe'yi filtreler (orijinal dil)</li>
                  <li>Settings yoksa varsayılan dilleri kullanır</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


