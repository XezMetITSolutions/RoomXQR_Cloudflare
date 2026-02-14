"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Database, Server, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HotelInfo {
  wifi: {
    networkName: string;
    password: string;
    speed: string;
    supportPhone: string;
  };
  hours: {
    reception: string;
    restaurant: string;
    bar: string;
    spa: string;
  };
  dining: {
    breakfast: string;
    lunch: string;
    dinner: string;
    roomService: string;
    towelChange: string;
    techSupport: string;
  };
  amenities: string[];
  contacts: {
    reception: string;
    security: string;
    concierge: string;
  };
}

interface DebugInfo {
  tenantSlug: string;
  apiUrl: string;
  hotelInfoFromAPI: HotelInfo | null;
  hotelInfoFromLocalStorage: any;
  lastSaveTime: string | null;
  apiResponse: any;
  error: string | null;
  isLoading: boolean;
}

export default function DebugHotelInfoPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    tenantSlug: '',
    apiUrl: '',
    hotelInfoFromAPI: null,
    hotelInfoFromLocalStorage: null,
    lastSaveTime: null,
    apiResponse: null,
    error: null,
    isLoading: true
  });

  const loadDebugInfo = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
      
      // URL'den tenant slug'ını al
      let tenantSlug = 'demo';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const token = localStorage.getItem('auth_token');
      const apiUrl = `${API_BASE_URL}/api/hotel/info`;
      
      // API'den veri çek
      const response = await fetch(`${apiUrl}?t=${Date.now()}`, {
        headers: {
          'x-tenant': tenantSlug,
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      let apiData = null;
      let apiResponse = null;
      
      if (response.ok) {
        apiData = await response.json();
        apiResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: apiData
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        apiResponse = {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        };
      }

      // LocalStorage'dan veri çek
      const localStorageData = localStorage.getItem('hotel-info-debug');
      const lastSaveTime = localStorage.getItem('hotel-info-last-save');

      setDebugInfo({
        tenantSlug,
        apiUrl,
        hotelInfoFromAPI: apiData,
        hotelInfoFromLocalStorage: localStorageData ? JSON.parse(localStorageData) : null,
        lastSaveTime,
        apiResponse,
        error: null,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Debug info load error:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message || 'Bilinmeyen hata',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const testSave = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
      
      let tenantSlug = 'demo';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const testData: HotelInfo = {
        wifi: {
          networkName: 'Test_WiFi',
          password: 'Test123!',
          speed: '50 Mbps',
          supportPhone: '+90 555 0000'
        },
        hours: {
          reception: '24 Saat',
          restaurant: '07:00 - 23:00',
          bar: '18:00 - 02:00',
          spa: '09:00 - 21:00'
        },
        dining: {
          breakfast: '07:00-10:00',
          lunch: '12:00-15:00',
          dinner: '18:00-22:00',
          roomService: '24 saat',
          towelChange: 'Günlük',
          techSupport: '24 saat'
        },
        amenities: ['WiFi', 'Otopark', 'Havuz'],
        contacts: {
          reception: '+90 555 0100',
          security: '+90 555 0101',
          concierge: '+90 555 0102'
        }
      };

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/hotel/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': tenantSlug,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(testData)
      });

      const responseData = await response.json();
      
      if (response.ok) {
        alert('Test verisi başarıyla kaydedildi!');
        localStorage.setItem('hotel-info-debug', JSON.stringify(testData));
        localStorage.setItem('hotel-info-last-save', new Date().toISOString());
        await loadDebugInfo();
      } else {
        alert(`Hata: ${responseData.message || 'Kayıt başarısız'}`);
      }
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel Info Debug Sayfası</h1>
          <p className="text-sm text-gray-600 mt-1">
            Veri akışını ve kayıt/okuma noktalarını izleyin
          </p>
        </div>
        <button
          onClick={loadDebugInfo}
          disabled={debugInfo.isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${debugInfo.isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {debugInfo.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-900">Hata:</span>
            <span className="text-red-700">{debugInfo.error}</span>
          </div>
        </div>
      )}

      {/* Genel Bilgiler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Genel Bilgiler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Tenant Slug:</span>
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">{debugInfo.tenantSlug}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">API URL:</span>
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1 break-all">{debugInfo.apiUrl}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Son Kayıt Zamanı:</span>
            <p className="text-sm bg-gray-100 px-2 py-1 rounded mt-1">
              {debugInfo.lastSaveTime ? new Date(debugInfo.lastSaveTime).toLocaleString('tr-TR') : 'Henüz kayıt yok'}
            </p>
          </div>
        </div>
      </div>

      {/* API Response */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-green-600" />
          API Response (GET /api/hotel/info)
        </h2>
        {debugInfo.apiResponse ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                debugInfo.apiResponse.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {debugInfo.apiResponse.status} {debugInfo.apiResponse.statusText}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-2">Response Data:</span>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs">
                {JSON.stringify(debugInfo.apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">API response yükleniyor...</p>
        )}
      </div>

      {/* Backend'den Gelen Veri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Backend'den Gelen Veri (Veritabanı)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Kaynak:</strong> GET {debugInfo.apiUrl} → Backend → PostgreSQL Database → Hotel.settings (JSON)
        </p>
        {debugInfo.hotelInfoFromAPI ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Veri başarıyla yüklendi</span>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96 overflow-y-auto">
              {JSON.stringify(debugInfo.hotelInfoFromAPI, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>Veri yüklenemedi veya boş</span>
          </div>
        )}
      </div>

      {/* Frontend'deki Veri (LocalStorage) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-600" />
          Frontend LocalStorage Verisi
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Not:</strong> Bu veri sadece test amaçlı localStorage'da saklanıyor. Gerçek veri backend'de.
        </p>
        {debugInfo.hotelInfoFromLocalStorage ? (
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96 overflow-y-auto">
            {JSON.stringify(debugInfo.hotelInfoFromLocalStorage, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">LocalStorage'da veri yok</p>
        )}
      </div>

      {/* Veri Akışı Diyagramı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Veri Akışı</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">1. Kaydetme (PUT) - /management/hotel-info</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Frontend: <code className="bg-blue-100 px-1 rounded">hotel-info/page.tsx</code> → handleSave()</p>
              <p>• API Call: <code className="bg-blue-100 px-1 rounded">PUT /api/hotel/info</code></p>
              <p>• Backend: <code className="bg-blue-100 px-1 rounded">server.ts</code> → PUT endpoint</p>
              <p>• Database: <code className="bg-blue-100 px-1 rounded">prisma.hotel.update()</code> → Hotel.settings (JSON)</p>
              <p>• Kayıt Yeri: <strong>PostgreSQL → hotels tablosu → settings kolonu (JSON)</strong></p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-green-900 mb-2">2. Okuma (GET) - /info</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Frontend: <code className="bg-green-100 px-1 rounded">info/page.tsx</code> → loadHotelInfo()</p>
              <p>• API Call: <code className="bg-green-100 px-1 rounded">GET /api/hotel/info</code></p>
              <p>• Backend: <code className="bg-green-100 px-1 rounded">server.ts</code> → GET endpoint</p>
              <p>• Database: <code className="bg-green-100 px-1 rounded">prisma.hotel.findFirst()</code> → Hotel.settings</p>
              <p>• Okuma Yeri: <strong>PostgreSQL → hotels tablosu → settings kolonu (JSON)</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Butonu */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test İşlemleri</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test verisi kaydederek veri akışını test edebilirsiniz.
        </p>
        <button
          onClick={testSave}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Test Verisi Kaydet
        </button>
      </div>

      {/* Karşılaştırma */}
      {debugInfo.hotelInfoFromAPI && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Veri Karşılaştırması</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">WiFi Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Ağ Adı:</span>
                  <span className="ml-2 font-mono">{debugInfo.hotelInfoFromAPI.wifi?.networkName || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Şifre:</span>
                  <span className="ml-2 font-mono">{debugInfo.hotelInfoFromAPI.wifi?.password || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Hız:</span>
                  <span className="ml-2">{debugInfo.hotelInfoFromAPI.wifi?.speed || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Destek:</span>
                  <span className="ml-2">{debugInfo.hotelInfoFromAPI.wifi?.supportPhone || '-'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">İletişim Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Resepsiyon:</span>
                  <span className="ml-2">{debugInfo.hotelInfoFromAPI.contacts?.reception || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Güvenlik:</span>
                  <span className="ml-2">{debugInfo.hotelInfoFromAPI.contacts?.security || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Concierge:</span>
                  <span className="ml-2">{debugInfo.hotelInfoFromAPI.contacts?.concierge || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

