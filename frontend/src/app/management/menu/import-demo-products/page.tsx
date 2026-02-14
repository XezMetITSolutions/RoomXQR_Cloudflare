"use client";

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function ImportDemoProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  // Demo ürünler (12 adet, çok dilli - Uluslararası)
  const demoProducts = [
    {
      name: "Classic Burger",
      description: "Juicy beef patty with lettuce, tomato, and our secret sauce.",
      price: 18.50,
      category: "Main Courses",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      allergens: ["Gluten", "Dairy", "Egg"],
      calories: 850,
      preparationTime: 20,
      rating: 4.8,
      isAvailable: true,
      translations: {
        tr: { name: "Klasik Burger", description: "Marul, domates ve özel soslu sulu dana köftesi." },
        de: { name: "Klassischer Burger", description: "Saftiges Rindfleischpatty mit Salat, Tomate und unserer Geheimsoße." },
        fr: { name: "Burger Classique", description: "Galette de bœuf juteuse avec laitue, tomate et notre sauce secrète." }
      }
    },
    {
      name: "Pizza Margherita",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
      price: 14.00,
      category: "Main Courses",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
      allergens: ["Gluten", "Dairy"],
      calories: 700,
      preparationTime: 25,
      rating: 4.7,
      isAvailable: true,
      translations: {
        tr: { name: "Pizza Margarita", description: "Domates sosu, mozzarella ve taze fesleğenli klasik pizza." },
        de: { name: "Pizza Margherita", description: "Klassische Pizza mit Tomatensoße, Mozzarella und frischem Basilikum." },
        fr: { name: "Pizza Margherita", description: "Pizza classique avec sauce tomate, mozzarella et basilic frais." }
      }
    },
    {
      name: "Caesar Salad",
      description: "Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.",
      price: 12.50,
      category: "Salads",
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80",
      allergens: ["Gluten", "Dairy", "Egg"],
      calories: 350,
      preparationTime: 15,
      rating: 4.5,
      isAvailable: true,
      translations: {
        tr: { name: "Sezar Salata", description: "Marul, kruton, parmesan peyniri ve Sezar sos." },
        de: { name: "Caesar Salat", description: "Römersalat, Croutons, Parmesan und Caesar-Dressing." },
        fr: { name: "Salade César", description: "Laitue romaine, croûtons, parmesan et vinaigrette César." }
      }
    },
    {
      name: "Club Sandwich",
      description: "Triple-decker sandwich with chicken, bacon, lettuce, tomato, and mayo.",
      price: 16.00,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
      allergens: ["Gluten", "Egg"],
      calories: 600,
      preparationTime: 15,
      rating: 4.6,
      isAvailable: true,
      translations: {
        tr: { name: "Kulüp Sandviç", description: "Tavuk, pastırma, marul, domates ve mayonezli üç katlı sandviç." },
        de: { name: "Club Sandwich", description: "Dreistöckiges Sandwich mit Hähnchen, Speck, Salat, Tomate und Mayonnaise." },
        fr: { name: "Club Sandwich", description: "Sandwich à trois étages avec poulet, bacon, laitue, tomate et mayonnaise." }
      }
    },
    {
      name: "Spaghetti Bolognese",
      description: "Spaghetti served with a rich meat and tomato sauce.",
      price: 15.50,
      category: "Main Courses",
      image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800&q=80",
      allergens: ["Gluten"],
      calories: 550,
      preparationTime: 20,
      rating: 4.7,
      isAvailable: true,
      translations: {
        tr: { name: "Spagetti Bolonez", description: "Zengin kıymalı ve domates soslu spagetti." },
        de: { name: "Spaghetti Bolognese", description: "Spaghetti serviert mit einer reichhaltigen Fleisch- und Tomatensoße." },
        fr: { name: "Spaghetti Bolognaise", description: "Spaghetti servis avec une riche sauce à la viande et à la tomate." }
      }
    },
    {
      name: "Grilled Chicken Breast",
      description: "Tender grilled chicken breast served with steamed vegetables.",
      price: 19.00,
      category: "Main Courses",
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80",
      allergens: [],
      calories: 400,
      preparationTime: 25,
      rating: 4.8,
      isAvailable: true,
      translations: {
        tr: { name: "Izgara Tavuk Göğsü", description: "Buharda pişmiş sebzelerle servis edilen yumuşak ızgara tavuk göğsü." },
        de: { name: "Gegrillte Hähnchenbrust", description: "Zarte gegrillte Hähnchenbrust serviert mit gedünstetem Gemüse." },
        fr: { name: "Poitrine de Poulet Grillée", description: "Poitrine de poulet grillée tendre servie avec des légumes à la vapeur." }
      }
    },
    {
      name: "French Fries",
      description: "Crispy golden potato fries.",
      price: 6.00,
      category: "Sides",
      image: "https://images.unsplash.com/photo-1573080496987-aeb7d53385c7?w=800&q=80",
      allergens: [],
      calories: 300,
      preparationTime: 10,
      rating: 4.5,
      isAvailable: true,
      translations: {
        tr: { name: "Patates Kızartması", description: "Çıtır altın sarısı patates kızartması." },
        de: { name: "Pommes Frites", description: "Knusprige goldene Kartoffelpommes." },
        fr: { name: "Frites", description: "Frites de pommes de terre dorées et croustillantes." }
      }
    },
    {
      name: "Cheesecake",
      description: "Creamy cheesecake with a graham cracker crust and berry topping.",
      price: 9.00,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&q=80",
      allergens: ["Gluten", "Dairy", "Egg"],
      calories: 450,
      preparationTime: 5,
      rating: 4.9,
      isAvailable: true,
      translations: {
        tr: { name: "Cheesecake", description: "Bisküvi tabanlı ve meyve soslu kremalı cheesecake." },
        de: { name: "Käsekuchen", description: "Cremiger Käsekuchen mit Keksboden und Beerenbelag." },
        fr: { name: "Cheesecake", description: "Cheesecake crémeux avec une croûte de biscuits Graham et une garniture aux baies." }
      }
    },
    {
      name: "Tiramisu",
      description: "Classic Italian dessert made with coffee-soaked ladyfingers and mascarpone cream.",
      price: 10.00,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
      allergens: ["Gluten", "Dairy", "Egg"],
      calories: 500,
      preparationTime: 5,
      rating: 4.8,
      isAvailable: true,
      translations: {
        tr: { name: "Tiramisu", description: "Kahveye batırılmış kedi dili ve mascarpone kreması ile yapılan klasik İtalyan tatlısı." },
        de: { name: "Tiramisu", description: "Klassisches italienisches Dessert aus in Kaffee getunkten Löffelbiskuits und Mascarpone-Creme." },
        fr: { name: "Tiramisu", description: "Dessert italien classique fait de boudoirs trempés dans le café et de crème mascarpone." }
      }
    },
    {
      name: "Coca Cola",
      description: "Chilled classic cola.",
      price: 4.00,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80",
      allergens: [],
      calories: 140,
      preparationTime: 2,
      rating: 4.5,
      isAvailable: true,
      translations: {
        tr: { name: "Coca Cola", description: "Soğuk klasik kola." },
        de: { name: "Coca Cola", description: "Gekühlte klassische Cola." },
        fr: { name: "Coca Cola", description: "Cola classique frais." }
      }
    },
    {
      name: "Mineral Water",
      description: "Refreshing sparkling mineral water.",
      price: 3.00,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800&q=80",
      allergens: [],
      calories: 0,
      preparationTime: 2,
      rating: 4.6,
      isAvailable: true,
      translations: {
        tr: { name: "Maden Suyu", description: "Ferahlatıcı maden suyu." },
        de: { name: "Mineralwasser", description: "Erfrischendes Mineralwasser." },
        fr: { name: "Eau Minérale", description: "Eau minérale pétillante rafraîchissante." }
      }
    },
    {
      name: "Coffee",
      description: "Freshly brewed hot coffee.",
      price: 5.00,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
      allergens: [],
      calories: 5,
      preparationTime: 5,
      rating: 4.7,
      isAvailable: true,
      translations: {
        tr: { name: "Kahve", description: "Taze demlenmiş sıcak kahve." },
        de: { name: "Kaffee", description: "Frisch gebrühter heißer Kaffee." },
        fr: { name: "Café", description: "Café chaud fraîchement moulu." }
      }
    }
  ];

  // Kategori çevirileri
  const categoryTranslations: Record<string, { tr: string; de: string; fr: string }> = {
    "Main Courses": { tr: "Ana Yemekler", de: "Hauptgerichte", fr: "Plats Principaux" },
    "Salads": { tr: "Salatalar", de: "Salate", fr: "Salades" },
    "Snacks": { tr: "Atıştırmalıklar", de: "Snacks", fr: "Collations" },
    "Sides": { tr: "Yan Lezzetler", de: "Beilagen", fr: "Accompagnements" },
    "Desserts": { tr: "Tatlılar", de: "Desserts", fr: "Desserts" },
    "Drinks": { tr: "İçecekler", de: "Getränke", fr: "Boissons" }
  };

  const handleImport = async () => {
    setLoading(true);
    setImporting(true);
    setResult(null);

    try {
      // Tenant slug'ını al
      const getTenantSlug = (): string => {
        if (typeof window === 'undefined') return 'demo';
        const hostname = window.location.hostname;

        // localhost kontrolü
        if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
          return 'demo';
        }

        const parts = hostname.split('.');
        const subdomain = parts[0];

        // Ana domain kontrolü (roomxqr.com, roomxqr.onrender.com vb.)
        if (subdomain === 'www' || subdomain === 'roomxqr' || parts.length <= 2) {
          return 'demo';
        }

        return subdomain;
      };

      const tenantSlug = getTenantSlug();
      console.log('🔍 Import Tenant Slug:', tenantSlug);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!token) {
        setResult({
          success: false,
          message: 'Giriş yapmanız gerekiyor. Lütfen önce giriş yapın.',
          details: { redirect: '/login' }
        });
        setLoading(false);
        setImporting(false);
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant': tenantSlug,
        'Authorization': `Bearer ${token}`
      };

      // Önce mevcut ürünleri sil
      await fetch('/api/menu/delete-all', {
        method: 'DELETE',
        headers
      });

      // Ürünleri backend'e gönder
      const response = await fetch('/api/menu/save', {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: demoProducts })
      });

      const responseData = await response.json();

      if (response.ok) {
        // Kategorileri localStorage'a kaydet
        const uniqueCategories = Array.from(new Set(demoProducts.map(p => p.category)));
        const categoriesToSave = uniqueCategories.map(catName => {
          const translations = categoryTranslations[catName];
          return {
            id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: catName,
            translations: translations ? {
              tr: { name: translations.tr },
              de: { name: translations.de },
              fr: { name: translations.fr },
              en: { name: catName } // İngilizce varsayılan olarak kategori adı
            } : {}
          };
        });

        const storageKey = `menuCategories_${tenantSlug}`;
        localStorage.setItem(storageKey, JSON.stringify(categoriesToSave));
        console.log('✅ Kategoriler localStorage\'a kaydedildi:', categoriesToSave);

        setResult({
          success: true,
          message: `Başarıyla ${demoProducts.length} ürün ve ${categoriesToSave.length} kategori import edildi!`,
          details: {
            imported: responseData.items?.length || demoProducts.length,
            total: demoProducts.length,
            categories: categoriesToSave.length
          }
        });

        // 2 saniye sonra menu sayfasına yönlendir
        setTimeout(() => {
          router.push('/management/menu');
        }, 2000);
      } else {
        setResult({
          success: false,
          message: responseData.message || responseData.error || 'Import hatası',
          details: responseData
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Hata: ${error.message}`,
        details: error
      });
    } finally {
      setLoading(false);
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Demo Ürünleri Import Et</h1>
          <p className="text-gray-600 mb-6">
            Bu sayfa demo tenant için 15 çok dilli ürünü (Türkçe, İngilizce, Almanca, Fransızca) veritabanına yükler.
          </p>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Import Edilecek Ürünler ({demoProducts.length} adet):</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {demoProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-400">({product.category})</span>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className={`mb-6 p-4 rounded-lg ${result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {result.success ? 'Başarılı!' : 'Hata!'}
                  </h3>
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                        Detayları Göster
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={async () => {
                if (!confirm('Tüm ürünleri silmek istediğinize emin misiniz?')) return;
                setLoading(true);
                try {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

                  // Tenant slug'ını doğru şekilde al
                  const getTenantSlug = (): string => {
                    if (typeof window === 'undefined') return 'demo';
                    const hostname = window.location.hostname;

                    // localhost kontrolü
                    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
                      return 'demo';
                    }

                    const parts = hostname.split('.');
                    const subdomain = parts[0];

                    // Ana domain kontrolü (roomxqr.com, roomxqr.onrender.com vb.)
                    if (subdomain === 'www' || subdomain === 'roomxqr' || parts.length <= 2) {
                      return 'demo';
                    }

                    return subdomain;
                  };

                  const tenantSlug = getTenantSlug();
                  console.log('🔍 Tenant Slug:', tenantSlug);

                  const response = await fetch('/api/menu/delete-all', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-tenant': tenantSlug,
                      'Authorization': `Bearer ${token}`
                    }
                  });

                  const responseData = await response.json();
                  console.log('🗑️ Delete-All API Yanıtı:', responseData);

                  if (response.ok) {
                    setResult({
                      success: true,
                      message: 'Tüm ürünler başarıyla silindi!',
                      details: responseData
                    });
                  } else {
                    throw new Error('Silme işlemi başarısız oldu');
                  }
                } catch (error: any) {
                  console.error('❌ Silme hatası:', error);
                  setResult({
                    success: false,
                    message: `Silme hatası: ${error.message}`,
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || importing}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Önce Tümünü Sil
            </button>

            <button
              onClick={handleImport}
              disabled={loading || importing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading || importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Import Ediliyor...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Demo Ürünleri Import Et
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/management/menu')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Menu Sayfasına Dön
            </button>
          </div>

          {importing && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Ürünler import ediliyor, lütfen bekleyin... Bu işlem birkaç saniye sürebilir.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ürün Kategorileri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Main Courses', 'Salads', 'Snacks', 'Sides', 'Desserts', 'Drinks'].map((category) => {
              const count = demoProducts.filter(p => p.category === category).length;
              return (
                <div key={category} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-gray-600">{count} ürün</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

