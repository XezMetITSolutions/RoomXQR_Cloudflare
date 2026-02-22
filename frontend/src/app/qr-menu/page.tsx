"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Clock, Star, Image as ImageIcon, Minus, Plus, X, ArrowLeft, Info, AlertTriangle, Megaphone, Wrench } from 'lucide-react';
import NextImage from 'next/image';
import { FaBell, FaTimes } from 'react-icons/fa';
import { ApiService } from '@/services/api';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { getProductImageUrl } from '@/lib/imageService';


// Sabit kategoriler (fallback için)
const defaultCategories = [
  { id: 'all', nameKey: 'category.all' },
  { id: 'breakfast', nameKey: 'category.breakfast' },
  { id: 'main', nameKey: 'category.main' },
  { id: 'appetizer', nameKey: 'category.appetizer' },
  { id: 'dessert', nameKey: 'category.dessert' },
  { id: 'beverage', nameKey: 'category.beverage' },
];

const subCategories = {
  breakfast: [
    { id: 'classic', nameKey: 'subcategory.classic' },
  ],
  main: [
    { id: 'meat', nameKey: 'subcategory.meat' },
    { id: 'fish', nameKey: 'subcategory.fish' },
  ],
  dessert: [
    { id: 'classic', nameKey: 'subcategory.classic' },
  ],
  beverage: [
    { id: 'hot', nameKey: 'subcategory.hot' },
    { id: 'juice', nameKey: 'subcategory.juice' },
  ],
};

import Image from 'next/image';

// Kategori mapping fonksiyonu (artık kullanılmıyor, backend'den gelen kategori adı direkt kullanılıyor)
// const mapCategoryToQRFormat = (category: string): string => {
//   const categoryMap: { [key: string]: string } = {
//     'Pizza': 'main',
//     'Burger': 'main', 
//     'Ana Yemek': 'main',
//     'Salata': 'appetizer',
//     'Mezeler': 'appetizer',
//     'İçecek': 'beverage',
//     'Tatlı': 'dessert',
//     'Çorba': 'appetizer',
//     'Kahvaltı': 'breakfast',
//   };
//   return categoryMap[category] || 'main';
// };

// Varsayılan menü verileri - Tüm ürünler silindi, boş array
const defaultMenuData: any[] = [];

export default function QRMenuPage() {
  // Tema store
  const theme = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ lineId: string; id: string; quantity: number; note?: string }[]>([]);
  const [productModal, setProductModal] = useState<any | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartNote, setCartNote] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'payment' | 'finalized'>('idle');

  // Menü verileri için state
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Backend'den gelen kategoriler için state
  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string; translations?: { [lang: string]: string } }[]>([]);

  // Dil store'u
  const { getTranslation, currentLanguage } = useLanguageStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Oda numarası state
  const [roomId, setRoomId] = useState<string>('');

  // Hydration kontrolü ve oda numarasını al
  useEffect(() => {
    setIsHydrated(true);
    // URL'den oda numarasını al
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomIdParam = urlParams.get('roomId') || '';
      const storedRoomId = localStorage.getItem('currentRoomId') || '';

      // Önce URL'den, yoksa localStorage'dan al
      if (roomIdParam) {
        setRoomId(roomIdParam);
        localStorage.setItem('currentRoomId', `room-${roomIdParam}`);
      } else if (storedRoomId) {
        const roomNumber = storedRoomId.replace('room-', '');
        setRoomId(roomNumber);
      }
    }
  }, []);

  // Menü verilerini API'den yükle (tenant subdomain'den; böylece kategoriler doğru gelir)
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        let tenantSlug = 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const sub = hostname.split('.')[0];
          if (sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend') tenantSlug = sub;
        }
        const response = await fetch(`/api/menu?tenant=${encodeURIComponent(tenantSlug)}`, {
          headers: { 'x-tenant': tenantSlug }
        });
        if (response.ok) {
          const data = await response.json();
          // API'den gelen veriyi QR menü formatına çevir
          // Önce tüm ürünler için görselleri yükle (async)
          const formattedMenuPromises = data.menu.map(async (item: any, index: number) => {
            console.log('API Item:', item); // Debug için

            // Dil seçimine göre çeviriyi al
            let translations = {};
            try {
              if (item.translations) {
                if (typeof item.translations === 'string') {
                  translations = JSON.parse(item.translations);
                } else if (typeof item.translations === 'object') {
                  translations = item.translations;
                }
              }
            } catch (parseError) {
              console.warn(`Translation parse error for item ${item.id}:`, parseError);
              translations = {};
            }
            const currentLang = currentLanguage || 'tr';
            const translation = translations[currentLang];

            // Debug log
            if (index === 0) {
              console.log('Menu translation debug:', {
                itemId: item.id,
                itemName: item.name,
                currentLang,
                translations,
                translation,
                finalName: translation?.name || item.name
              });
            }

            // Ürün adını kullanarak dinamik görsel al (İngilizce arama ile)
            const productImage = await getProductImageUrl(
              item.name,
              item.image,
              item.category
            );

            return {
              id: item.id || `api-${index}`,
              name: translation?.name || item.name,
              description: translation?.description || item.description || '',
              price: item.price,
              preparationTime: item.preparationTime || 15, // API'den gelen veya varsayılan hazırlık süresi
              rating: item.rating || 4, // API'den gelen rating veya varsayılan 4
              category: item.category || 'Diğer', // Backend'den gelen kategori adını direkt kullan
              originalCategory: item.category || 'Diğer', // Orijinal kategori adını sakla
              subCategory: 'general',
              image: productImage, // Dinamik olarak oluşturulan görsel
              allergens: item.allergens || [],
              service: '',
              available: item.available !== false,
              translations: translations, // Çevirileri de sakla
            };
          });

          // Tüm görselleri paralel olarak yükle
          const formattedMenu = await Promise.all(formattedMenuPromises);
          // Sadece API'den gelen gerçek ürünleri kullan, demo ürünleri ekleme
          setMenuData(formattedMenu);

          // Backend'den gelen kategorileri çıkar (ürün müsait olmasa da kategori listelensin)
          const uniqueCategories = new Set<string>();
          formattedMenu.forEach((item: any) => {
            if (item.category && item.category.trim()) {
              uniqueCategories.add(item.category.trim());
            }
          });

          // Kategorileri localStorage'dan yükle (isletme/menu sayfasından kaydedilen kategoriler)
          let categoriesFromStorage: { id: string; name: string; description?: string }[] = [];
          try {
            if (typeof window !== 'undefined') {
              // Tenant slug'ını al
              let tenantSlug = 'demo';
              const hostname = window.location.hostname;
              const subdomain = hostname.split('.')[0];
              if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                tenantSlug = subdomain;
              }

              const storageKey = `menuCategories_${tenantSlug}`;
              const storedCategories = localStorage.getItem(storageKey);
              if (storedCategories) {
                categoriesFromStorage = JSON.parse(storedCategories);
              }
            }
          } catch (error) {
            console.warn('Kategoriler localStorage\'dan yüklenemedi:', error);
          }

          // Kategorileri birleştir: Önce localStorage'dan, sonra menüden çıkarılanlar
          const categoryMap = new Map<string, { id: string; name: string; translations?: { [lang: string]: string } }>();

          // localStorage'dan gelen kategorileri ekle
          categoriesFromStorage.forEach(cat => {
            let translations: { [lang: string]: string } = {};
            try {
              if (cat.description) {
                if (typeof cat.description === 'string') {
                  translations = JSON.parse(cat.description);
                } else if (typeof cat.description === 'object') {
                  translations = cat.description;
                }
              }
            } catch (e) {
              // Parse hatası, devam et
            }
            categoryMap.set(cat.name, {
              id: cat.name,
              name: cat.name,
              translations: translations
            });
          });

          // Menüden çıkarılan kategorileri ekle (eğer yoksa)
          Array.from(uniqueCategories).forEach(catName => {
            if (!categoryMap.has(catName)) {
              categoryMap.set(catName, {
                id: catName,
                name: catName
              });
            }
          });

          setDynamicCategories(Array.from(categoryMap.values()));
        } else {
          // API hatası durumunda boş menü göster
          setMenuData([]);
        }
      } catch (error) {
        console.error('Menü yükleme hatası:', error);
        // Hata durumunda boş menü göster
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [currentLanguage]); // currentLanguage değiştiğinde menüyü yeniden yükle

  // Dil değiştiğinde menu item'larının çevirilerini güncelle
  useEffect(() => {
    if (menuData.length > 0 && currentLanguage) {
      const updatedMenu = menuData.map((item: any) => {
        let translations = {};
        try {
          if (item.translations) {
            if (typeof item.translations === 'string') {
              translations = JSON.parse(item.translations);
            } else if (typeof item.translations === 'object') {
              translations = item.translations;
            }
          }
        } catch (parseError) {
          console.warn(`Translation parse error for item ${item.id}:`, parseError);
          translations = {};
        }
        const translation = translations[currentLanguage];

        return {
          ...item,
          name: translation?.name || item.name,
          description: translation?.description || item.description || '',
        };
      });
      setMenuData(updatedMenu);
    }
  }, [currentLanguage]);

  // Duyurular state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);


  // Duyuruları API'den yükle (sadece menü kategorisindeki)
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';

        // URL'den tenant slug'ını al
        let tenantSlug = 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
            tenantSlug = subdomain;
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
          headers: {
            'x-tenant': tenantSlug
          }
        });

        if (response.ok) {
          const data = await response.json();
          const announcementsData = Array.isArray(data) ? data : [];

          console.log('API\'den gelen duyurular:', announcementsData); // Debug için

          // API'den gelen veriyi formatla ve aktif duyuruları filtrele
          const formattedAnnouncements = announcementsData
            .map((a: any) => {
              const metadata = (a.metadata as any) || {};
              const category = metadata.category || 'general';
              // isActive undefined veya null ise true kabul et (default aktif)
              const isActive = metadata.isActive === undefined || metadata.isActive === null ? true : metadata.isActive;

              console.log('Duyuru kontrolü:', {
                id: a.id,
                title: a.title,
                category,
                isActive,
                metadata: JSON.stringify(metadata)
              }); // Debug için

              // Sadece aktif duyuruları göster (tüm kategoriler)
              if (isActive === false) {
                console.log('Duyuru aktif değil:', a.id);
                return null;
              }

              // Tarih kontrolü (opsiyonel - eğer tarih yoksa göster)
              const now = new Date().toISOString().split('T')[0];
              const startDate = metadata.startDate || (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : null);
              const endDate = metadata.endDate;

              // StartDate varsa ve gelecekteyse gösterme
              if (startDate && startDate > now) {
                console.log('Başlangıç tarihi gelecekte:', startDate, '>', now);
                return null;
              }
              // EndDate varsa ve geçmişse gösterme
              if (endDate && endDate < now) {
                console.log('Bitiş tarihi geçmiş:', endDate, '<', now);
                return null;
              }

              console.log('Duyuru eklendi:', a.title);

              // Translations'ı parse et
              let translations = {};
              try {
                const translationsData = metadata.translations || a.translations;
                if (translationsData) {
                  if (typeof translationsData === 'string') {
                    translations = JSON.parse(translationsData);
                  } else if (typeof translationsData === 'object') {
                    translations = translationsData;
                  }
                }
              } catch (parseError) {
                console.warn(`Announcement translation parse error for ${a.id}:`, parseError);
                translations = {};
              }

              return {
                id: a.id,
                title: a.title || 'Duyuru',
                content: a.message || '',
                type: (metadata.announcementType || 'info') as 'info' | 'warning' | 'promotion' | 'maintenance' | 'advertisement',
                category: category as 'general' | 'menu' | 'hotel' | 'promotion',
                isActive: true,
                startDate: startDate,
                endDate: endDate || undefined,
                linkUrl: metadata.linkUrl || undefined,
                linkText: metadata.linkText || undefined,
                icon: metadata.icon || undefined,
                translations: translations
              };
            })
            .filter((a: any) => a !== null);

          console.log('Filtrelenmiş duyurular:', formattedAnnouncements);
          setAnnouncements(formattedAnnouncements);
        } else {
          console.error('API yanıt hatası:', response.status, response.statusText);
          setAnnouncements([]);
        }
      } catch (error) {
        console.error('Duyurular yüklenirken hata:', error);
        setAnnouncements([]);
      }
    };

    loadAnnouncements();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [currentLanguage]); // currentLanguage değiştiğinde duyuruları yeniden yükle

  // Otomatik duyuru rotasyonu
  useEffect(() => {
    if (announcements.length > 1) {
      const rotationInterval = setInterval(() => {
        setCurrentAnnouncementIndex((prevIndex) =>
          (prevIndex + 1) % announcements.length
        );
      }, 4000); // 4 saniyede bir değiştir

      return () => clearInterval(rotationInterval);
    }
  }, [announcements.length]);

  // Sepetteki ürünleri getir (lineId ve note dahil)
  const getCartItems = useCallback(() => cart.map(ci => {
    const product = menuData.find(m => m.id === ci.id);
    return product ? { ...product, lineId: ci.lineId, quantity: ci.quantity, note: ci.note } : null;
  }).filter(Boolean) as (typeof menuData[0] & { lineId: string; quantity: number; note?: string })[], [cart, menuData]);

  // Finalized modal'ını 3 saniye sonra otomatik kapat
  useEffect(() => {
    if (orderStatus === 'finalized') {
      const timer = setTimeout(() => {
        setOrderStatus('idle');
        setCart([]);
        setCartNote('');
        // Hazırlık süresini hesapla
        const cartItems = getCartItems();
        const maxPreparationTime = Math.max(...cartItems.map(item => item.preparationTime || 15));
        const preparationMessage = cartItems.length === 1
          ? `Hazırlanma süresi yaklaşık ${maxPreparationTime} dakikadır.`
          : `Hazırlanma süresi yaklaşık ${maxPreparationTime} dakikadır. (En uzun süreye göre)`;

        addNotification('success', 'Sipariş Tamamlandı', `Siparişiniz başarıyla mutfağa iletildi. ${preparationMessage}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [orderStatus, getCartItems]);

  // Bildirim sistemi
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: Date;
  }>>([]);

  // Bildirim ekleme fonksiyonu
  const addNotification = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Max 5 bildirim

    // 8 saniye sonra otomatik kapat
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 8000);
  };

  // Bildirim kapatma
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // WebSocket bağlantısı - resepsiyondan gelen bildirimleri dinle
  useEffect(() => {
    // URL'den oda numarasını al (örnek: /qr-menu?roomId=101)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId') || '101';

    const ws = ApiService.connectWebSocket(roomId, (data) => {
      console.log('QR Menü bildirimi alındı:', data);

      if (data.type === 'guest_notification') {
        addNotification('info', 'Resepsiyon Yanıtı', data.message);
      }
    });

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Aktif kategorileri bul (ürün bulunan kategoriler)
  const activeCategories = useMemo(() => {
    // Menüde aktif (görünür) ürünü olan kategorileri topla
    const activeCategoryNames = new Set<string>();
    menuData.forEach(item => {
      if (item.category && item.category.trim() && item.available) {
        activeCategoryNames.add(item.category.trim());
      }
    });

    // Backend'den gelen kategorileri kullan
    if (dynamicCategories.length > 0) {
      // Sadece en az bir aktif ürüne sahip olan kategorileri dahil et
      const filteredCategories = dynamicCategories.filter(cat =>
        activeCategoryNames.has(cat.name.trim())
      );

      // Kategorileri çevirilerle birlikte göster
      const translatedCategories = filteredCategories.map(cat => {
        const currentLang = currentLanguage || 'tr';
        let displayName = cat.name;

        // Eğer çeviri varsa kullan
        if (cat.translations && cat.translations[currentLang]) {
          displayName = cat.translations[currentLang];
        }

        return {
          id: cat.name, // ID orijinal kategori adı olmalı (filtreleme için)
          name: displayName, // Gösterim adı çevrilmiş olabilir
          originalName: cat.name, // Orijinal kategori adını sakla (filtreleme için)
          nameKey: undefined // nameKey yok, direkt name kullanılacak
        };
      });

      return [
        { id: 'all', name: getTranslation('category.all') || 'Tümü', nameKey: 'category.all' },
        ...translatedCategories
      ];
    }

    // Fallback: Eğer dinamik kategoriler yoksa, menüden çıkar
    if (menuData.length === 0) {
      return [{ id: 'all', name: getTranslation('category.all') || 'Tümü', nameKey: 'category.all' }];
    }

    const categoriesWithProducts = new Set<string>();
    categoriesWithProducts.add('all'); // "Tümü" her zaman göster

    menuData.forEach(item => {
      if (item.category && item.category.trim() && item.available) {
        categoriesWithProducts.add(item.category.trim());
      }
    });

    const menuCategories = Array.from(categoriesWithProducts)
      .filter(cat => cat !== 'all')
      .map(catName => ({
        id: catName,
        name: (() => {
          // Kategori ismini çevirmeyi dene
          const keyMap: { [key: string]: string } = {
            'Main Dishes': 'category.main',
            'Ana Yemekler': 'category.main',
            'Hauptgerichte': 'category.main',
            'Appetizers': 'category.appetizer',
            'Mezeler': 'category.appetizer',
            'Vorspeisen': 'category.appetizer',
            'Desserts': 'category.dessert',
            'Tatlılar': 'category.dessert',
            'Beverages': 'category.beverage',
            'İçecekler': 'category.beverage',
            'Getränke': 'category.beverage',
            'Breakfast': 'category.breakfast',
            'Kahvaltı': 'category.breakfast',
            'Frühstück': 'category.breakfast',
            'Snacks': 'category.snack',
            'Atıştırmalıklar': 'category.snack'
          };
          const key = keyMap[catName];
          return key ? getTranslation(key) : catName;
        })(),
        originalName: catName,
        nameKey: undefined
      }));

    return [
      { id: 'all', name: getTranslation('category.all') || 'Tümü', nameKey: 'category.all' },
      ...menuCategories
    ];
  }, [menuData, dynamicCategories, getTranslation, currentLanguage]);

  // Kategori ve alt kategoriye göre filtrele
  let filteredMenu = menuData.filter(item => {
    // Kategori eşleşmesi: selectedCategory 'all' ise veya kategori adı eşleşiyorsa
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else {
      // selectedCategory çevrilmiş kategori adı olabilir, orijinal kategori adıyla karşılaştır
      const activeCat = activeCategories.find(cat => cat.id === selectedCategory);
      if (activeCat) {
        // Orijinal kategori adını kullan
        const originalCategoryName = (activeCat as any).originalName || activeCat.name;
        matchesCategory = item.category === originalCategoryName || item.category === activeCat.name;
      } else {
        matchesCategory = item.category === selectedCategory;
      }
    }

    const matchesSubCategory = !selectedSubCategory || item.subCategory === selectedSubCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch && item.available;
  });

  // Alt kategori gösterimi
  const showSubCategories = selectedCategory !== 'all' && (subCategories as any)[selectedCategory]?.length > 0;

  // Sepete ekle (modal'dan: adet + yorum ile)
  const addToCart = (id: string, quantity: number = 1, note: string = '') => {
    setCart(prev => [...prev, { lineId: `line-${Date.now()}-${Math.random().toString(36).slice(2)}`, id, quantity, note: note.trim() || undefined }]);
  };
  // Sepetten çıkar (satır bazlı)
  const removeFromCart = (lineId: string) => {
    setCart(prev => prev.filter(item => item.lineId !== lineId));
  };
  // Adet değiştir
  const setCartQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
    } else {
      setCart(prev => prev.map(item => item.lineId === lineId ? { ...item, quantity } : item));
    }
  };
  // Sepet toplamı
  const getCartTotal = () => getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Duyuru helper fonksiyonları
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'promotion': return <Megaphone className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'advertisement': return <Star className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'promotion': return 'bg-green-50 border-green-200 text-green-800';
      case 'maintenance': return 'bg-red-50 border-red-200 text-red-800';
      case 'advertisement': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      ru: 'ru-RU',
      ar: 'ar-SA',
      de: 'de-DE'
    };
    const locale = localeMap[currentLanguage as keyof typeof localeMap] || 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Siparişi onayla - doğrudan ödemeye geç (emin misiniz adımı kaldırıldı)
  const handleOrder = () => {
    setShowCart(false);
    setOrderStatus('payment');
  };

  // Hydration kontrolü - client-side rendering bekleniyor
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] py-8 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{getTranslation('menu.back')}</span>
            </button>
          </div>

          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-3xl font-extrabold text-[#223] tracking-tight text-center">
                Oda Servisi Menüsü
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
              {['Tümü', 'Kahvaltı', 'Ana Yemekler', 'Mezeler', 'Tatlılar', 'İçecekler'].map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                >
                  {category}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ürün ara..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#222] text-base min-w-[180px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
              <div className="text-gray-500">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative" style={{ background: theme.backgroundColor }}>
      {/* Bildirim Sistemi */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 space-y-2 max-w-xs sm:max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`w-full bg-white rounded-xl shadow-2xl border-l-4 p-4 sm:p-5 transform transition-all duration-500 notification-slide-in notification-gentle-pulse ${notification.type === 'success' ? 'border-green-500 bg-green-50' :
              notification.type === 'info' ? 'border-blue-500 bg-blue-50' :
                'border-yellow-500 bg-yellow-50'
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <FaBell className={`w-4 h-4 ${notification.type === 'success' ? 'text-green-600' :
                    notification.type === 'info' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">{notification.title}</h4>
                </div>
                <p className="text-gray-700 text-sm sm:text-base mt-1 leading-relaxed font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span>🕐</span>
                  {notification.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 hover:bg-gray-200 rounded-full"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Geri Dönüş Butonu */}
        <div className="mb-6">
          <button
            onClick={() => {
              // Oda QR sayfasına geri dön (dil seçimi ve resepsiyona istek sayfası)
              const roomId = localStorage.getItem('currentRoomId') || 'room-102';
              window.location.href = `/guest/${roomId}`;
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{getTranslation('menu.back')}</span>
          </button>
        </div>

        <div className="mb-8">
          {/* Başlık */}
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-center" style={{ color: theme.textColor }}>
              {getTranslation('menu.title')}
            </h1>
            {roomId && (() => {
              // Oda numarasını temizle: "room-room-room-room-101" -> "101"
              // Tüm "room-" ve "room" prefix'lerini kaldır
              let cleanRoomNumber = roomId;
              // Önce tüm "room-" prefix'lerini kaldır
              while (cleanRoomNumber.toLowerCase().startsWith('room-')) {
                cleanRoomNumber = cleanRoomNumber.substring(5);
              }
              // Sonra başta kalan "room" varsa kaldır
              if (cleanRoomNumber.toLowerCase().startsWith('room')) {
                cleanRoomNumber = cleanRoomNumber.substring(4);
              }
              // Başta kalan tireleri temizle
              cleanRoomNumber = cleanRoomNumber.replace(/^-+/, '');

              return (
                <p className="text-center mt-2 text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                  {cleanRoomNumber} {getTranslation('room.number')}
                </p>
              );
            })()}
          </div>

          {/* Duyurular */}
          {announcements.length > 0 ? (
            <div className="max-w-sm mx-auto mb-4">
              {announcements.length > 1 && (
                <div className="flex justify-center space-x-1 mb-2">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentAnnouncementIndex(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentAnnouncementIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              )}

              <div className={`border rounded-lg p-3 shadow-sm ${getTypeColor(announcements[currentAnnouncementIndex]?.type || 'info')} transition-all duration-500`}>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {getTypeIcon(announcements[currentAnnouncementIndex]?.type || 'info')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {(() => {
                          const announcement = announcements[currentAnnouncementIndex];
                          if (!announcement) return '';

                          // Çeviri varsa kullan, yoksa Türkçe fallback
                          return announcement.translations?.[currentLanguage]?.title || announcement.title;
                        })()}
                      </h3>
                      <span className="text-xs opacity-75 flex items-center ml-2 flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(announcements[currentAnnouncementIndex]?.startDate || '')}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-tight mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {(() => {
                        const announcement = announcements[currentAnnouncementIndex];
                        if (!announcement) return '';

                        // Çeviri varsa kullan, yoksa Türkçe fallback
                        return announcement.translations?.[currentLanguage]?.content || announcement.content;
                      })()}
                    </p>
                    {announcements[currentAnnouncementIndex]?.linkUrl && announcements[currentAnnouncementIndex]?.linkText && (
                      <div className="flex justify-end">
                        <a
                          href={announcements[currentAnnouncementIndex]?.linkUrl}
                          target={announcements[currentAnnouncementIndex]?.linkUrl?.startsWith('http') ? '_blank' : '_self'}
                          rel={announcements[currentAnnouncementIndex]?.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-current hover:opacity-80 transition-opacity bg-white/20 px-2 py-1 rounded-full"
                        >
                          <span>
                            {(() => {
                              const announcement = announcements[currentAnnouncementIndex];
                              if (!announcement) return '';

                              // Link metni çevirisi varsa kullan, yoksa Türkçe fallback
                              return announcement.translations?.[currentLanguage]?.linkText || announcement.linkText;
                            })()}
                          </span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {/* Kategori ve Arama */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
            {activeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedSubCategory('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${selectedCategory === category.id
                  ? 'text-white shadow-lg'
                  : ''
                  }`}
                style={selectedCategory === category.id
                  ? { background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)` : theme.primaryColor }
                  : { background: theme.cardBackground, color: theme.textColor, border: `1px solid ${theme.borderColor}` }}
              >
                {category.nameKey ? getTranslation(category.nameKey) : category.name}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={getTranslation('menu.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none text-base min-w-[180px]"
            style={{
              background: theme.cardBackground,
              color: theme.textColor,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: 'none'
            }}
          />
        </div>
        {/* Alt Kategoriler - Daha belirgin tasarım */}
        {showSubCategories && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{getTranslation('menu.subcategories')}</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedSubCategory('')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${selectedSubCategory === ''
                  ? 'bg-gray-800 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg border border-gray-200'
                  }`}
              >
                {getTranslation('category.all')}
              </button>
              {(subCategories as any)[selectedCategory].map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${selectedSubCategory === sub.id
                    ? 'bg-gray-800 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg border border-gray-200'
                    }`}
                >
                  {getTranslation(sub.nameKey)}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Menü Grid - Mobilde 1, tablette 2, masaüstünde 3 sütun */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <MenuCard
                key={item.id}
                {...item}
                onAdd={() => setProductModal(item)}
                getTranslation={getTranslation}
              />
            ))}
          </div>
        )}
        {filteredMenu.length === 0 && (
          <div className="p-12 text-center mt-8 rounded-xl" style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
            <h3 className="text-lg font-medium mb-2" style={{ color: theme.textColor }}>{getTranslation('general.no_products')}</h3>
            <p style={{ color: theme.textColor }}>
              {searchTerm ? getTranslation('general.no_search_results') : getTranslation('general.no_category_products')}
            </p>
          </div>
        )}
        {/* Sepet Butonu */}
        {cart.length > 0 && orderStatus === 'idle' && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
            <button
              onClick={() => setShowCart(true)}
              className="text-white px-8 py-4 rounded-full shadow-xl text-lg font-bold flex items-center space-x-3 transition-all duration-200 hover:shadow-2xl hover:scale-105"
              style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)` : theme.primaryColor }}
            >
              <span>🛒 Sepet ({getCartItems().length})</span>
              <span className="text-base font-normal">{getCartTotal()}₺</span>
            </button>
          </div>
        )}
        {/* Ürün detay modalı - adet ve yorum ile sepete ekle */}
        {productModal && (
          <ProductModal
            item={productModal}
            onAdd={(quantity, note) => {
              addToCart(productModal.id, quantity, note);
              setProductModal(null);
            }}
            onClose={() => setProductModal(null)}
            getTranslation={getTranslation}
          />
        )}
        {/* Sepet Modal */}
        {showCart && (
          <CartModal
            items={getCartItems()}
            note={cartNote}
            setNote={setCartNote}
            onClose={() => setShowCart(false)}
            onOrder={handleOrder}
            setCartQuantity={setCartQuantity}
            removeFromCart={removeFromCart}
            total={getCartTotal()}
            getTranslation={getTranslation}
          />
        )}
        {/* Ödeme Modalı */}
        {orderStatus === 'payment' && (
          <PaymentModal
            items={getCartItems()}
            note={cartNote}
            total={getCartTotal()}
            roomId={roomId}
            onPaymentSuccess={() => setOrderStatus('finalized')}
            onBack={() => setOrderStatus('idle')}
            getTranslation={getTranslation}
          />
        )}

        {/* Sipariş Finalize */}
        {orderStatus === 'finalized' && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Siparişiniz mutfağa iletildi!</h2>
              <p className="text-gray-700 mb-4">Siparişiniz hazırlanıyor. Afiyet olsun!</p>
              <p className="text-sm text-gray-500">Bu pencere 3 saniye sonra otomatik olarak kapanacak...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ item, onAdd, onClose, getTranslation }: {
  item: any;
  onAdd: (quantity: number, note: string) => void;
  onClose: () => void;
  getTranslation: (key: string) => string;
}) {
  const theme = useThemeStore();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rounded-3xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
          <h2 className="text-lg font-bold" style={{ color: theme.textColor }}>{item.name}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.borderColor }}>
            <X className="w-5 h-5" style={{ color: theme.textColor }} />
          </button>
        </div>
        <div className="relative w-full h-48 sm:h-52 bg-gray-100">
          {item.image ? (
            <NextImage src={item.image} alt={item.name} fill className="object-cover" sizes="400px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <span className="text-4xl font-bold text-orange-500">{item.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-4">
          {item.description && (
            <p className="text-sm" style={{ color: theme.textColor }}>{item.description}</p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>{item.price}₺</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>{getTranslation('room.quantity') || 'Adet'}</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold" style={{ color: theme.textColor }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Yorum / Not</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Acılı, acısız, ekstra sos, soğansız..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border resize-none text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: theme.borderColor, background: theme.backgroundColor, color: theme.textColor }}
            />
          </div>
          <button
            onClick={() => onAdd(quantity, note)}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[2]} 0%, ${theme.gradientColors[3]} 100%)` : theme.secondaryColor }}
          >
            {getTranslation('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuCard({ name, description, price, preparationTime, rating, image, allergens, service, onAdd, getTranslation }: {
  name: string;
  description: string;
  price: number;
  preparationTime: number;
  rating?: number;
  image?: string;
  allergens?: string[];
  service?: string;
  onAdd: () => void;
  getTranslation: (key: string) => string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isLongDescription = description.length > 80;
  const isLongAllergens = allergens && allergens.length > 2;
  const theme = useThemeStore();
  return (
    <div className="rounded-3xl shadow-lg flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
      {/* Görsel - Responsive ve optimize edilmiş */}
      <div
        className="relative w-full h-48 sm:h-56 md:h-52 lg:h-56 cursor-pointer"
        onClick={onAdd}
      >
        {image ? (
          <NextImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="w-full h-48 sm:h-56 md:h-52 lg:h-56 bg-gradient-to-br from-orange-100 to-red-100 flex flex-col items-center justify-center">
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 mb-2 sm:mb-3" />
            <span className="text-3xl sm:text-4xl font-bold text-orange-500">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="font-bold text-xl leading-tight flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: theme.textColor }}
            onClick={onAdd}
          >
            {name}
          </h3>
          <div className="text-2xl font-extrabold ml-3" style={{ color: theme.primaryColor }}>{price}₺</div>
        </div>

        <div className="mb-3">
          <p
            className="text-sm leading-relaxed cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: theme.textColor }}
            onClick={onAdd}
          >
            {showDetails ? description : (isLongDescription ? description.substring(0, 80) + '...' : description)}
          </p>
          {isLongDescription && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium transition-colors"
            >
              {showDetails ? getTranslation('product.show_less') : getTranslation('product.show_details')}
            </button>
          )}
        </div>

        {service && (
          <p className="text-xs mb-4 italic px-3 py-2 rounded-lg" style={{ color: theme.secondaryColor, background: `${theme.secondaryColor}20` }}>
            {service}
          </p>
        )}

        <div className="flex items-center space-x-4 text-sm mb-4" style={{ color: theme.textColor }}>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{preparationTime} {getTranslation('product.minutes')}</span>
          </div>
          {rating && (
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" style={{ color: theme.accentColor }} />
              <span>{rating}</span>
              <span className="text-xs text-gray-400">{getTranslation('product.rating')}</span>
            </div>
          )}
        </div>

        {allergens && allergens.length > 0 && (
          <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: '#b91c1c', background: '#fee2e2' }}>
            {getTranslation('product.allergens')}: {showDetails ? allergens.map(a => getTranslation(`allergen.${a.toLowerCase()}`) || a).join(', ') : (isLongAllergens ? allergens.slice(0, 2).map(a => getTranslation(`allergen.${a.toLowerCase()}`) || a).join(', ') + '...' : allergens.map(a => getTranslation(`allergen.${a.toLowerCase()}`) || a).join(', '))}
            {isLongAllergens && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs ml-2 font-medium transition-colors"
                style={{ color: theme.secondaryColor }}
              >
                {showDetails ? getTranslation('product.show_less') : getTranslation('product.show_details')}
              </button>
            )}
          </div>
        )}

        <button
          onClick={onAdd}
          className="mt-auto px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[2]} 0%, ${theme.gradientColors[3]} 100%)` : theme.secondaryColor }}
        >
          {getTranslation('product.add_to_cart')}
        </button>
      </div>
    </div>
  );
}

function CartModal({ items, note, setNote, onClose, onOrder, setCartQuantity, removeFromCart, total, getTranslation }: {
  items: any[];
  note: string;
  setNote: (v: string) => void;
  onClose: () => void;
  onOrder: () => void;
  setCartQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  total: number;
  getTranslation: (key: string) => string;
}) {
  const theme = useThemeStore();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="rounded-3xl max-w-lg w-full shadow-2xl max-h-[95vh] overflow-hidden mx-2 sm:mx-0" style={{ background: theme.cardBackground }}>
        <div className="flex justify-between items-center p-6" style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
          <h2 className="text-2xl font-bold" style={{ color: theme.textColor }}>{getTranslation('cart.title')}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: theme.borderColor }}
          >
            <X className="w-5 h-5" style={{ color: theme.textColor }} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.textColor }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: theme.borderColor }}>
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-lg font-medium">{getTranslation('cart.empty')}</p>
              <p className="text-sm">{getTranslation('cart.add_products')}</p>
            </div>
          ) : (
            <>
              <div className="p-4 space-y-3">
                {items.map(item => (
                  <div key={item.lineId} className="flex items-center space-x-3 p-3 rounded-xl" style={{ background: theme.borderColor }}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <NextImage src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-500">{item.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: theme.textColor }}>{item.name}</div>
                      <div className="text-xs" style={{ color: theme.textColor }}>{item.price}₺</div>
                      {item.note && (
                        <div className="text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>Not: {item.note}</div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCartQuantity(item.lineId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm" style={{ color: theme.textColor }}>{item.quantity}</span>
                      <button
                        onClick={() => setCartQuantity(item.lineId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.lineId)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: '#fee2e2', color: '#b91c1c' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 sm:p-6" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.textColor }}>Ekstra İstekleriniz</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Örn: Soğansız olsun, yanında limon, az tuzlu..."
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent resize-none text-sm"
                    style={{
                      background: theme.backgroundColor,
                      color: theme.textColor,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: 'none'
                    }}
                    rows={2}
                  />
                </div>

                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-base sm:text-lg font-semibold" style={{ color: theme.textColor }}>Toplam</span>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: theme.primaryColor }}>{total}₺</span>
                </div>

                <button
                  onClick={onOrder}
                  className="w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[2]} 0%, ${theme.gradientColors[3]} 100%)` : theme.secondaryColor, color: 'white' }}
                >
                  Siparişi onayla ve ödemeye geç
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ items, note, total, roomId, onPaymentSuccess, onBack, getTranslation }: {
  items: any[];
  note: string;
  total: number;
  roomId: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
  getTranslation: (key: string) => string;
}) {
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'pos' | 'card' | 'room'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useThemeStore();

  // Sipariş oluşturma fonksiyonu
  const handlePayment = async () => {
    if (!roomId) {
      alert('Oda numarası bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    setIsSubmitting(true);
    try {
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

      // Sipariş item'larını hazırla (ürün bazlı not + genel not)
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.note || note || undefined
      }));

      // Guest ID'yi bul veya oluştur (roomId'den)
      const guestId = `guest-${roomId}`;
      const roomIdFormatted = `room-${roomId}`;

      // Backend'e sipariş oluştur
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': tenantSlug,
        },
        body: JSON.stringify({
          roomId: roomIdFormatted,
          guestId: guestId,
          items: orderItems,
          notes: note || undefined,
          paymentMethod: selectedPayment === 'room' ? 'room_charge' : selectedPayment === 'pos' ? 'pos' : selectedPayment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sipariş oluşturulamadı');
      }

      const orderData = await response.json();
      console.log('Sipariş oluşturuldu:', orderData);

      // Başarılı olduğunda callback'i çağır
      onPaymentSuccess();
    } catch (error: any) {
      console.error('Sipariş oluşturma hatası:', error);
      alert(`Sipariş oluşturulamadı: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="rounded-3xl max-w-lg w-full shadow-2xl max-h-[95vh] overflow-hidden" style={{ background: theme.cardBackground }}>
        <div className="flex justify-between items-center p-4 sm:p-6" style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textColor }}>Ödeme</h2>
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: theme.borderColor }}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.textColor }} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Sipariş Özeti */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: theme.textColor }}>Sipariş Özeti</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.lineId || item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                        {item.image ? (
                          <NextImage src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: `${theme.primaryColor}20` }}>
                            <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>{item.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: theme.textColor }}>{item.name}</div>
                        <div className="text-sm" style={{ color: theme.textColor }}>x {item.quantity}{item.note ? ` · ${item.note}` : ''}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.textColor }}>{item.price * item.quantity}₺</div>
                  </div>
                ))}
              </div>
              {note && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: theme.borderColor }}>
                  <div className="text-sm font-medium mb-1" style={{ color: theme.textColor }}>Özel İstek:</div>
                  <div className="text-sm" style={{ color: theme.textColor }}>{note}</div>
                </div>
              )}
            </div>

            {/* Toplam */}
            <div className="pt-4" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold" style={{ color: theme.textColor }}>Toplam</span>
                <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>{total}₺</span>
              </div>
            </div>

            {/* Ödeme Yöntemleri */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textColor }}>Ödeme Yöntemi</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedPayment('cash')}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${selectedPayment === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  style={selectedPayment === 'cash' ? { borderColor: theme.accentColor, background: `${theme.accentColor}20` } : { borderColor: theme.borderColor }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.accentColor }}>
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: theme.textColor }}>Nakit</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('pos')}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${selectedPayment === 'pos' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                  style={selectedPayment === 'pos' ? { borderColor: '#0d9488', background: 'rgba(20,184,166,0.15)' } : { borderColor: theme.borderColor }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500">
                      <span className="text-white text-sm font-bold">📱</span>
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: theme.textColor }}>POS Cihazı istiyorum</div>
                    </div>
                  </div>
                </button>

                <div className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 bg-gray-100 opacity-75 cursor-not-allowed" style={{ borderColor: theme.borderColor }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-400">
                      <span className="text-white text-sm font-bold">💳</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-500">Kredi Kartı / Online Ödeme</div>
                      <div className="text-xs text-gray-500">Yakında aktifleşecek</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('room')}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${selectedPayment === 'room' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                  style={selectedPayment === 'room' ? { borderColor: theme.primaryColor, background: `${theme.primaryColor}20` } : { borderColor: theme.borderColor }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.primaryColor }}>
                      <span className="text-white text-sm font-bold">🏨</span>
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: theme.textColor }}>Çıkışta ödeyeceğim</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Ödeme Butonu */}
            <button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)` : theme.primaryColor, color: 'white' }}
            >
              {isSubmitting ? 'Gönderiliyor...' : (
                <>
                  {selectedPayment === 'cash' && '💰 Nakit ile Sipariş Ver'}
                  {selectedPayment === 'pos' && '📱 POS ile Sipariş Ver'}
                  {selectedPayment === 'room' && '🏨 Çıkışta Öde - Sipariş Ver'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

