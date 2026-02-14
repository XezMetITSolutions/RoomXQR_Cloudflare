"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Database, Server, Globe, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  allergens: string[];
  calories?: number;
  preparationTime?: number;
  rating?: number;
}

interface DebugInfo {
  tenantSlug: string;
  apiUrl: string;
  frontendApiUrl: string;
  menuItemsFromBackend: MenuItem[] | null;
  menuItemsFromFrontend: MenuItem[] | null;
  filteredItems: MenuItem[] | null;
  categories: any[];
  apiResponse: any;
  error: string | null;
  isLoading: boolean;
  demoProductsFiltered: string[];
}

export default function DebugMenuPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    tenantSlug: '',
    apiUrl: '',
    frontendApiUrl: '',
    menuItemsFromBackend: null,
    menuItemsFromFrontend: null,
    filteredItems: null,
    categories: [],
    apiResponse: null,
    error: null,
    isLoading: true,
    demoProductsFiltered: []
  });

  // Demo ürünleri filtreleme fonksiyonu
  const isDemoProduct = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    const demoProducts = [
      'karniyarik',
      'karnıyarık',
      'cheeseburger',
      'cheese burger',
      'caesar salad',
      'caesar salata',
      'sezar salata',
      'sezar salatası'
    ];
    return demoProducts.some(demo => normalizedName === demo || normalizedName.includes(demo));
  };

  const loadDebugInfo = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, isLoading: true, error: null }));

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

      // Backend URL'yi düzelt (roomxqr.onrender.com -> roomxqr-backend.onrender.com)
      const backendUrl = API_BASE_URL.replace('roomxqr.onrender.com', 'roomxqr-backend.onrender.com');

      // URL'den tenant slug'ını al
      let tenantSlug = 'demo';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const backendApiUrl = `${backendUrl}/api/menu`;
      const frontendApiUrl = '/api/menu';

      // Backend API'den direkt veri çek
      let backendData = null;
      let backendResponse = null;
      try {
        const backendRes = await fetch(`${backendApiUrl}?t=${Date.now()}`, {
          headers: {
            'x-tenant': tenantSlug
          }
        });

        if (backendRes.ok) {
          backendData = await backendRes.json();
          backendResponse = {
            status: backendRes.status,
            statusText: backendRes.statusText,
            headers: Object.fromEntries(backendRes.headers.entries()),
            data: backendData
          };
        } else {
          const errorData = await backendRes.json().catch(() => ({ message: 'Unknown error' }));
          backendResponse = {
            status: backendRes.status,
            statusText: backendRes.statusText,
            error: errorData
          };
        }
      } catch (backendError: any) {
        backendResponse = {
          error: backendError.message || 'Backend API\'ye ulaşılamadı'
        };
      }

      // Frontend API'den veri çek
      let frontendData = null;
      let frontendResponse = null;
      try {
        const frontendRes = await fetch(`${frontendApiUrl}?t=${Date.now()}`, {
          headers: {
            'x-tenant': tenantSlug
          }
        });

        if (frontendRes.ok) {
          frontendData = await frontendRes.json();
          frontendResponse = {
            status: frontendRes.status,
            statusText: frontendRes.statusText,
            headers: Object.fromEntries(frontendRes.headers.entries()),
            data: frontendData
          };
        } else {
          const errorData = await frontendRes.json().catch(() => ({ message: 'Unknown error' }));
          frontendResponse = {
            status: frontendRes.status,
            statusText: frontendRes.statusText,
            error: errorData
          };
        }
      } catch (frontendError: any) {
        frontendResponse = {
          error: frontendError.message || 'Frontend API\'ye ulaşılamadı'
        };
      }

      // Backend'den gelen menü öğelerini formatla
      let backendMenuItems: MenuItem[] = [];
      // Backend hem menuItems hem de menu döndürebilir
      const backendMenuData = backendData?.menuItems || backendData?.menu || [];
      if (backendMenuData && Array.isArray(backendMenuData) && backendMenuData.length > 0) {
        backendMenuItems = backendMenuData.map((item: any, index: number) => ({
          id: item.id || `backend-${index}`,
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          category: item.category || 'Diğer',
          isAvailable: item.isAvailable !== false,
          allergens: item.allergens || [],
          calories: item.calories,
          image: item.image,
          preparationTime: item.preparationTime,
          rating: item.rating,
        }));
      }

      // Frontend'den gelen menü öğelerini formatla
      let frontendMenuItems: MenuItem[] = [];
      let filteredItems: MenuItem[] = [];
      let demoProductsFiltered: string[] = [];

      if (frontendData?.menu) {
        frontendMenuItems = frontendData.menu.map((item: any, index: number) => ({
          id: item.id || `frontend-${index}`,
          name: item.name,
          description: item.description || '',
          price: item.price,
          category: item.category || 'Diğer',
          isAvailable: item.available !== false,
          allergens: item.allergens || [],
          calories: item.calories,
          image: item.image,
          preparationTime: item.preparationTime,
          rating: item.rating,
        }));

        // Demo ürünleri filtrele
        filteredItems = frontendMenuItems.filter(item => {
          if (isDemoProduct(item.name)) {
            demoProductsFiltered.push(item.name);
            return false;
          }
          return true;
        });
      }

      // Kategorileri yükle
      const storageKey = `menuCategories_${tenantSlug}`;
      const storedCategories = localStorage.getItem(storageKey);
      const categories = storedCategories ? JSON.parse(storedCategories) : [];

      setDebugInfo({
        tenantSlug,
        apiUrl: backendApiUrl,
        frontendApiUrl,
        menuItemsFromBackend: backendMenuItems,
        menuItemsFromFrontend: frontendMenuItems,
        filteredItems,
        categories,
        apiResponse: {
          backend: backendResponse,
          frontend: frontendResponse
        },
        error: null,
        isLoading: false,
        demoProductsFiltered
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Debug Sayfası</h1>
          <p className="text-sm text-gray-600 mt-1">
            Menu veri akışını ve filtreleme işlemlerini izleyin
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
            <span className="text-sm font-medium text-gray-500">Backend API URL:</span>
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1 break-all">{debugInfo.apiUrl}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Frontend API URL:</span>
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1 break-all">{debugInfo.frontendApiUrl}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Kategori Sayısı:</span>
            <p className="text-sm bg-gray-100 px-2 py-1 rounded mt-1">{debugInfo.categories.length}</p>
          </div>
        </div>
      </div>

      {/* Backend API Response */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-green-600" />
          Backend API Response (GET /api/menu)
        </h2>
        {debugInfo.apiResponse?.backend ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${debugInfo.apiResponse.backend.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {debugInfo.apiResponse.backend.status || 'N/A'} {debugInfo.apiResponse.backend.statusText || ''}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-2">Response Data:</span>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96 overflow-y-auto">
                {JSON.stringify(debugInfo.apiResponse.backend, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Backend API response yükleniyor...</p>
        )}
      </div>

      {/* Frontend API Response */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-600" />
          Frontend API Response (GET /api/menu)
        </h2>
        {debugInfo.apiResponse?.frontend ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${debugInfo.apiResponse.frontend.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {debugInfo.apiResponse.frontend.status || 'N/A'} {debugInfo.apiResponse.frontend.statusText || ''}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-2">Response Data:</span>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96 overflow-y-auto">
                {JSON.stringify(debugInfo.apiResponse.frontend, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Frontend API response yükleniyor...</p>
        )}
      </div>

      {/* Backend'den Gelen Ürünler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-green-600" />
          Backend'den Gelen Ürünler
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Kaynak:</strong> Backend API → {debugInfo.apiUrl}
        </p>
        {debugInfo.menuItemsFromBackend && debugInfo.menuItemsFromBackend.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {debugInfo.menuItemsFromBackend.length} ürün bulundu
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugInfo.menuItemsFromBackend.map((item, index) => (
                <div key={item.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Kategori: {item.category} | Fiyat: {item.price} ₺ |
                        {item.isAvailable ? ' ✓ Mevcut' : ' ✗ Mevcut Değil'}
                      </div>
                    </div>
                    {isDemoProduct(item.name) && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>Backend'den ürün yüklenemedi veya boş</span>
          </div>
        )}
      </div>

      {/* Frontend'den Gelen Ürünler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Frontend API'den Gelen Ürünler
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Kaynak:</strong> Frontend API → {debugInfo.frontendApiUrl}
        </p>
        {debugInfo.menuItemsFromFrontend && debugInfo.menuItemsFromFrontend.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {debugInfo.menuItemsFromFrontend.length} ürün bulundu
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugInfo.menuItemsFromFrontend.map((item, index) => (
                <div key={item.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Kategori: {item.category} | Fiyat: {item.price} ₺ |
                        {item.isAvailable ? ' ✓ Mevcut' : ' ✗ Mevcut Değil'}
                      </div>
                    </div>
                    {isDemoProduct(item.name) && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>Frontend API'den ürün yüklenemedi veya boş</span>
          </div>
        )}
      </div>

      {/* Filtrelenmiş Ürünler (Demo Ürünler Çıkarılmış) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Filtrelenmiş Ürünler (Demo Ürünler Çıkarılmış)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Not:</strong> Demo ürünler (karniyarik, cheeseburger, caesar salad) otomatik olarak filtreleniyor.
        </p>
        {debugInfo.demoProductsFiltered.length > 0 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <span className="text-sm font-medium text-yellow-900">Filtrelenen Demo Ürünler:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {debugInfo.demoProductsFiltered.map((name, index) => (
                <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
        {debugInfo.filteredItems && debugInfo.filteredItems.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {debugInfo.filteredItems.length} ürün gösterilecek
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugInfo.filteredItems.map((item, index) => (
                <div key={item.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Kategori: {item.category} | Fiyat: {item.price} ₺ |
                    {item.isAvailable ? ' ✓ Mevcut' : ' ✗ Mevcut Değil'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span>Filtrelenmiş ürün yok</span>
          </div>
        )}
      </div>

      {/* Kategoriler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Kategoriler (LocalStorage)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Kaynak:</strong> LocalStorage → <code>menuCategories_{debugInfo.tenantSlug}</code>
        </p>
        {debugInfo.categories && debugInfo.categories.length > 0 ? (
          <div className="space-y-2">
            {debugInfo.categories.map((cat: any, index: number) => (
              <div key={cat.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="font-semibold text-gray-900">{cat.name}</div>
                {cat.description && (
                  <div className="text-sm text-gray-600">{cat.description}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Kategori yok</p>
        )}
      </div>

      {/* Veri Akışı Diyagramı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Veri Akışı</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">1. Frontend Menu Sayfası (/management/menu)</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Frontend: <code className="bg-blue-100 px-1 rounded">menu/page.tsx</code> → loadData()</p>
              <p>• API Call: <code className="bg-blue-100 px-1 rounded">GET /api/menu</code> (x-tenant header ile)</p>
              <p>• Frontend API: <code className="bg-blue-100 px-1 rounded">api/menu/route.ts</code></p>
              <p>• Backend API: <code className="bg-blue-100 px-1 rounded">GET /api/menu</code> (x-tenant header ile)</p>
              <p>• Database: <code className="bg-blue-100 px-1 rounded">prisma.menuItem.findMany()</code> → MenuItem[]</p>
              <p>• Filtreleme: Demo ürünler çıkarılıyor</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h3 className="font-semibold text-green-900 mb-2">2. QR Menu Sayfası (/qr-menu)</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Frontend: <code className="bg-green-100 px-1 rounded">qr-menu/page.tsx</code> → loadMenuData()</p>
              <p>• API Call: <code className="bg-green-100 px-1 rounded">GET /api/menu</code> (x-tenant header ile)</p>
              <p>• Backend API: <code className="bg-green-100 px-1 rounded">GET /api/menu</code></p>
              <p>• Database: <code className="bg-green-100 px-1 rounded">prisma.menuItem.findMany()</code> → MenuItem[]</p>
            </div>
          </div>
        </div>
      </div>

      {/* Özet */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Özet</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Backend Ürün Sayısı:</span>
            <span className="font-semibold">{debugInfo.menuItemsFromBackend?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Frontend Ürün Sayısı:</span>
            <span className="font-semibold">{debugInfo.menuItemsFromFrontend?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Filtrelenmiş Ürün Sayısı:</span>
            <span className="font-semibold">{debugInfo.filteredItems?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Filtrelenen Demo Ürün Sayısı:</span>
            <span className="font-semibold">{debugInfo.demoProductsFiltered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Kategori Sayısı:</span>
            <span className="font-semibold">{debugInfo.categories.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

