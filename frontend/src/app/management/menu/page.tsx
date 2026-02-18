"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Upload,
  Download,
  Menu as MenuIcon,
  Utensils,
  Languages,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Image as ImageIcon,
  FolderOpen,
  Tag,
  Megaphone
} from 'lucide-react';
import { MenuTranslator } from '@/components/MenuTranslator';
import { translateText } from '@/lib/translateService';
import { useLanguageStore } from '@/store/languageStore';

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
  translations?: {
    [lang: string]: {
      name: string;
      description: string;
    };
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  translations?: {
    [lang: string]: {
      name: string;
      description?: string;
    };
  };
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  type: string;
  translations?: {
    [lang: string]: {
      title: string;
      description: string;
    };
  };
}

export default function MenuPage() {
  const { currentLanguage, getTranslation } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCategorySelectModal, setShowCategorySelectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryInSelector, setShowAddCategoryInSelector] = useState(false);
  const [categoryTranslations, setCategoryTranslations] = useState<{ [lang: string]: string }>({});

  // Menü verileri state'i
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Campaign modal state
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Toast notification state'i
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Confirmation modal state'i
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, itemId: string | null, itemName: string, type: 'item' | 'category' }>({
    show: false,
    itemId: null,
    itemName: '',
    type: 'item'
  });

  // Bulk upload state'i
  const [bulkUploadData, setBulkUploadData] = useState<{
    file: File | null;
    parsedData: any[];
    errors: string[];
    isValid: boolean;
  }>({
    file: null,
    parsedData: [],
    errors: [],
    isValid: false
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toast notification fonksiyonları
  const showSuccessToast = (message: string) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const showErrorToast = (message: string) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Tenant slug'ını al
  const getTenantSlug = (): string => {
    if (typeof window === 'undefined') return 'demo';
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
      return subdomain;
    }
    return 'demo';
  };

  // Settings'ten desteklenen dilleri al (Türkçe hariç - çeviri için)
  const getSupportedLanguagesForTranslation = (): string[] => {
    if (typeof window === 'undefined') return [];

    try {
      const savedSettings = localStorage.getItem('hotel-settings');
      if (savedSettings) {
        const settingsData = JSON.parse(savedSettings);
        if (settingsData.language?.supportedLanguages && Array.isArray(settingsData.language.supportedLanguages)) {
          const supported = settingsData.language.supportedLanguages.filter((lang: string) => lang !== 'tr');
          if (supported.length > 0) return supported;
        }
      }
    } catch (error) {
      console.error('Settings yüklenirken hata:', error);
    }
    return ['de', 'en', 'ru'];
  };

  // Otomatik çeviri yap
  const autoTranslate = async (name: string, description: string): Promise<{ [lang: string]: { name: string; description: string } }> => {
    const translations: { [lang: string]: { name: string; description: string } } = {};
    const supportedLanguages = getSupportedLanguagesForTranslation();

    // Türkçe'yi de ekle (orijinal metin)
    translations['tr'] = {
      name: name,
      description: description
    };

    // Eğer desteklenen dil yoksa, sadece Türkçe'yi döndür
    if (supportedLanguages.length === 0) {
      return translations;
    }

    // Her dil için çeviri yap (timeout ile)
    for (const lang of supportedLanguages) {
      if (lang === 'tr') continue;

      try {
        // Timeout ile çeviri yap (5 saniye)
        const translateWithTimeout = (text: string, targetLang: string, timeout: number = 5000): Promise<string> => {
          return Promise.race([
            translateText(text, targetLang),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Translation timeout')), timeout)
            )
          ]);
        };

        const translatedName = await translateWithTimeout(name, lang).catch(() => null);
        const translatedDesc = await translateWithTimeout(description, lang).catch(() => null);

        // Çeviri başarılı olduysa kaydet (orijinal metinle aynı değilse ve boş değilse)
        // Not: Bazı kelimeler (özellikle özel isimler, markalar) birçok dilde aynı kalabilir
        // Bu durumda çeviri yapılmaz, sadece farklı olanlar kaydedilir
        if (translatedName && translatedName !== name && translatedName.trim() !== '' && translatedName.trim() !== name.trim()) {
          translations[lang] = {
            name: translatedName,
            description: (translatedDesc && translatedDesc !== description && translatedDesc.trim() !== '') ? translatedDesc : description
          };
        }
      } catch (err) {
        // Çeviri hatası durumunda sessizce devam et (sadece debug modunda log)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Çeviri hatası (${lang}):`, err);
        }
        // Hata durumunda o dil için çeviri yapmadan devam et
      }
    }

    return translations;
  };

  // Kategorileri yükle (tenant-specific, varsayılan kategoriler yok)
  const loadCategories = async () => {
    try {
      const tenantSlug = getTenantSlug();
      const storageKey = `menuCategories_${tenantSlug}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
        return parsed;
      } else {
        // Yeni işletme için boş kategori listesi - varsayılan kategoriler yok
        setCategories([]);
        return [];
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      setCategories([]);
      return [];
    }
  };

  // Kampanyaları yükle
  const loadCampaigns = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const tenantSlug = getTenantSlug();
      const headers: Record<string, string> = { 'x-tenant': tenantSlug };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/campaigns', { headers });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Kampanya yükleme hatası:', error);
    }
  };

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

  // Menü verilerini yükle (yeniden kullanılabilir fonksiyon)
  const loadMenuData = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const currentCategories = await loadCategories();
      await loadCampaigns();

      const tenantSlug = getTenantSlug();
      const response = await fetch('/api/menu', {
        headers: {
          'x-tenant': tenantSlug
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Menü API Yanıtı:', {
          source: data.source || 'unknown',
          itemCount: data.menu?.length || 0,
          firstItem: data.menu?.[0]?.name || 'N/A'
        });
        console.log('Menü yüklendi, toplam item sayısı:', data.menu?.length || 0);
        const formattedItems = data.menu
          .map((item: any, index: number) => {
            // Translations'ı parse et
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

            return {
              id: item.id || `api-${index}`,
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
              translations: translations,
            };
          });

        console.log('Filtrelenmiş menü item sayısı:', formattedItems.length);
        setMenuItems(formattedItems);

        // Kategori Senkronizasyonu: Mevcut ürünlerden eksik kategorileri bul ve ekle
        const existingCategoryNames = new Set(currentCategories.map((c: Category) => c.name));
        const missingCategories: Category[] = [];

        formattedItems.forEach((item: MenuItem) => {
          if (item.category && item.category !== 'Diğer' && !existingCategoryNames.has(item.category)) {
            existingCategoryNames.add(item.category);
            missingCategories.push({
              id: Date.now().toString() + Math.random().toString().slice(2, 7),
              name: item.category,
              description: JSON.stringify({})
            });
          }
        });

        if (missingCategories.length > 0) {
          console.log('Eksik kategoriler bulundu ve ekleniyor:', missingCategories.map(c => c.name));
          const updatedCategories = [...currentCategories, ...missingCategories];
          setCategories(updatedCategories);
          // LocalStorage güncellemesi useEffect içinde yapılacak
        }

        return formattedItems;
      } else {
        console.error('Menü yükleme hatası, response status:', response.status);
        setMenuItems([]);
        return [];
      }
    } catch (error) {
      console.error('Menü yükleme hatası:', error);
      setMenuItems([]);
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Menü verilerini API'den yükle (sayfa ilk yüklendiğinde)
  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('sidebar.menu_management');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  // Kategori listesini güncelle (tenant-specific)
  useEffect(() => {
    const tenantSlug = getTenantSlug();
    const storageKey = `menuCategories_${tenantSlug}`;
    localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories]);

  const filteredItems = menuItems.filter(item => {
    // Demo ürünleri filtreleme kaldırıldı - tüm ürünler gösterilecek
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Resim yükleme fonksiyonu
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Lütfen geçerli bir resim dosyası seçin!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Resim boyutu 5MB\'dan küçük olmalıdır!');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Resmi base64'e çevir
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const toggleAvailability = async (id: string) => {
    try {
      const item = menuItems.find(item => item.id === id);
      if (!item) return;

      const newAvailability = !item.isAvailable;

      const response = await fetch('/api/menu/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image || '',
            allergens: item.allergens || [],
            calories: item.calories,
            preparationTime: item.preparationTime,
            rating: item.rating,
            available: newAvailability,
          }]
        }),
      });

      if (response.ok) {
        setMenuItems(items =>
          items.map(item =>
            item.id === id ? { ...item, isAvailable: newAvailability } : item
          )
        );
        showSuccessToast(newAvailability ? 'Ürün menüde aktif edildi!' : 'Ürün menüden kaldırıldı!');
      } else {
        showErrorToast('Durum güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Availability toggle hatası:', error);
      showErrorToast('Durum güncellenirken hata oluştu!');
    }
  };

  const deleteItem = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      setConfirmModal({
        show: true,
        itemId: id,
        itemName: item.name,
        type: 'item'
      });
    }
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      // Kategori kullanılıyor mu kontrol et
      const itemsInCategory = menuItems.filter(item => item.category === category.name);
      if (itemsInCategory.length > 0) {
        showErrorToast(`Bu kategori ${itemsInCategory.length} üründe kullanılıyor. Önce ürünleri başka kategoriye taşıyın.`);
        return;
      }

      setConfirmModal({
        show: true,
        itemId: id,
        itemName: category.name,
        type: 'category'
      });
    }
  };

  const confirmDelete = async () => {
    if (confirmModal.itemId) {
      let itemToDelete: MenuItem | null = null;

      try {
        if (confirmModal.type === 'item') {
          itemToDelete = menuItems.find(item => item.id === confirmModal.itemId) || null;
          if (itemToDelete) {
            // Önce UI'dan kaldır (optimistic update)
            setMenuItems(items => items.filter(item => item.id !== confirmModal.itemId));

            // Backend'de sil
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };

            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/menu/delete', {
              method: 'POST',
              headers,
              body: JSON.stringify({ id: confirmModal.itemId }),
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
              showSuccessToast('Ürün başarıyla silindi!');
            } else {
              // Hata durumunda geri ekle
              setMenuItems(items => [...items, itemToDelete!]);
              const errorMsg = responseData.error || responseData.message || 'Ürün silinirken hata oluştu!';
              showErrorToast(errorMsg);
              console.error('Silme hatası:', responseData);
            }
          } else {
            showErrorToast('Silinecek ürün bulunamadı!');
          }
        } else {
          setCategories(cats => cats.filter(cat => cat.id !== confirmModal.itemId));
          showSuccessToast('Kategori başarıyla silindi!');
        }
      } catch (error) {
        console.error('Silme hatası:', error);
        // Hata durumunda item'ı geri ekle
        if (confirmModal.type === 'item' && itemToDelete) {
          setMenuItems(items => [...items, itemToDelete]);
        }
        showErrorToast('Silme işlemi sırasında hata oluştu! Lütfen tekrar deneyin.');
      } finally {
        setConfirmModal({ show: false, itemId: null, itemName: '', type: 'item' });
      }
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ show: false, itemId: null, itemName: '', type: 'item' });
  };

  const editItem = (item: MenuItem) => {
    setSelectedItem(item);
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowEditModal(true);
  };

  const editCategory = (category: Category) => {
    setSelectedCategoryForEdit(category);
    setNewCategoryName(category.name);

    // Çevirileri parse et
    let translations: { [lang: string]: string } = {};
    try {
      if (category.description) {
        if (typeof category.description === 'string') {
          translations = JSON.parse(category.description);
        } else if (typeof category.description === 'object') {
          translations = category.description;
        }
      }
    } catch (error) {
      console.warn('Kategori çevirileri parse edilemedi:', error);
      translations = {};
    }
    setCategoryTranslations(translations);
    setShowAddCategoryModal(true);
  };

  const addNewItem = () => {
    setSelectedItem(null);
    setImagePreview(null);
    setImageFile(null);
    setShowAddModal(true);
  };

  const addNewCategory = () => {
    setSelectedCategoryForEdit(null);
    setNewCategoryName('');
    setCategoryTranslations({});
    setShowAddCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!newCategoryName.trim()) {
      showErrorToast('Kategori adı boş olamaz!');
      return;
    }

    // Mevcut çevirileri state'ten al (kullanıcı düzenlemiş olabilir)
    const existingTranslations = { ...categoryTranslations };

    // Otomatik çeviri yap (timeout ile, hata olsa bile devam et)
    // Sadece kategori adı değiştiyse veya yeni kategori ekleniyorsa çeviri yap
    let newAutoTranslations: { [lang: string]: string } = {};
    try {
      const supportedLanguages = getSupportedLanguagesForTranslation();

      // Timeout ile çeviri yap (3 saniye - kategori için daha kısa)
      const translateWithTimeout = (text: string, targetLang: string, timeout: number = 3000): Promise<string> => {
        return Promise.race([
          translateText(text, targetLang),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Translation timeout')), timeout)
          )
        ]);
      };

      // Sadece kategori adı değiştiyse veya yeni kategori ekleniyorsa çeviri yap
      const shouldTranslate = !selectedCategoryForEdit || (selectedCategoryForEdit.name !== newCategoryName.trim());

      if (shouldTranslate) {
        for (const lang of supportedLanguages) {
          if (lang === 'tr') continue;
          // Eğer mevcut çeviri varsa ve kullanıcı düzenlemişse, otomatik çeviri yapma
          if (existingTranslations[lang]) continue;

          try {
            const translatedName = await translateWithTimeout(newCategoryName.trim(), lang).catch(() => null);
            if (translatedName && translatedName !== newCategoryName.trim() && translatedName.trim() !== '') {
              newAutoTranslations[lang] = translatedName;
            }
          } catch (err) {
            // Çeviri hatası durumunda sessizce devam et
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Kategori çeviri hatası (${lang}):`, err);
            }
          }
        }
      }
    } catch (err) {
      // Kritik hata durumunda sessizce devam et
      if (process.env.NODE_ENV === 'development') {
        console.warn('Kategori çeviri hatası:', err);
      }
    }

    if (selectedCategoryForEdit) {
      // Kategori güncelle
      const oldName = selectedCategoryForEdit.name;

      // Mevcut çevirileri (kullanıcı düzenlemiş olabilir) ve yeni otomatik çevirileri birleştir
      const finalTranslations = {
        ...existingTranslations, // Mevcut çeviriler (state'ten, kullanıcı düzenlemiş olabilir)
        ...newAutoTranslations  // Yeni otomatik çeviriler (eğer varsa, üzerine yazar)
      };

      setCategories(cats =>
        cats.map(cat =>
          cat.id === selectedCategoryForEdit.id
            ? { ...cat, name: newCategoryName.trim(), description: JSON.stringify(finalTranslations) }
            : cat
        )
      );

      // Menü öğelerindeki kategori adını da güncelle
      setMenuItems(items =>
        items.map(item =>
          item.category === oldName
            ? { ...item, category: newCategoryName.trim() }
            : item
        )
      );

      showSuccessToast('Kategori başarıyla güncellendi!');
    } else {
      // Yeni kategori ekle
      const finalTranslations = {
        ...existingTranslations, // Mevcut çeviriler (varsa)
        ...newAutoTranslations  // Yeni otomatik çeviriler
      };

      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: JSON.stringify(finalTranslations),
      };
      setCategories(cats => [...cats, newCategory]);
      showSuccessToast('Kategori başarıyla eklendi!');
    }

    setShowAddCategoryModal(false);
    setNewCategoryName('');
    setCategoryTranslations({});
    setSelectedCategoryForEdit(null);
  };

  const handleCampaignImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Lütfen geçerli bir resim dosyası seçin!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Resim boyutu 5MB\'dan küçük olmalıdır!');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      let imageUrl = selectedCampaign?.image || '';

      if (imageFile) {
        imageUrl = await convertImageToBase64(imageFile);
      } else if (imagePreview && !imagePreview.startsWith('data:')) {
        imageUrl = imagePreview;
      }

      const campaignData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        isActive: formData.get('isActive') === 'on',
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        type: formData.get('type') as string,
        image: imageUrl,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const tenantSlug = getTenantSlug();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant': tenantSlug,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = selectedCampaign ? `/api/campaigns/${selectedCampaign.id}` : '/api/campaigns';
      const method = selectedCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        showSuccessToast(selectedCampaign ? 'Kampanya güncellendi!' : 'Kampanya oluşturuldu!');
        setShowAddCampaignModal(false);
        setImageFile(null);
        setImagePreview(null);
        setSelectedCampaign(null);
        loadCampaigns();
      } else {
        const err = await response.json();
        showErrorToast(err.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Kampanya kaydetme hatası:', error);
      showErrorToast('İşlem sırasında bir hata oluştu.');
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const tenantSlug = getTenantSlug();
      const headers: Record<string, string> = { 'x-tenant': tenantSlug };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        showSuccessToast('Kampanya silindi.');
        loadCampaigns();
      } else {
        showErrorToast('Kampanya silinemedi.');
      }
    } catch (error) {
      console.error(error);
      showErrorToast('Silme işlemi başarısız.');
    }
  };

  const saveItem = async (itemData: Partial<MenuItem>) => {
    try {
      let imageUrl = itemData.image || '';

      // Eğer yeni resim yüklendiyse base64'e çevir
      if (imageFile) {
        imageUrl = await convertImageToBase64(imageFile);
      } else if (imagePreview && !imagePreview.startsWith('data:')) {
        // Eğer mevcut resim varsa ve base64 değilse, olduğu gibi kullan
        imageUrl = imagePreview;
      }

      // Otomatik çeviri yap (sadece yeni ürün eklerken veya isim/açıklama değiştiyse)
      let translations = itemData.translations || selectedItem?.translations || {};
      const name = itemData.name || '';
      const description = itemData.description || '';

      // Yeni ürün ekleniyorsa veya isim/açıklama değiştiyse çeviri yap
      if (!selectedItem || (name && name !== selectedItem.name) || (description && description !== selectedItem.description)) {
        if (name && description) {
          try {
            // Çeviriyi arka planda yap, hata olsa bile devam et
            translations = await autoTranslate(name, description).catch((err) => {
              // Çeviri başarısız olsa bile Türkçe'yi ekle
              if (process.env.NODE_ENV === 'development') {
                console.warn('Otomatik çeviri başarısız, sadece Türkçe kaydediliyor:', err);
              }
              return {
                'tr': {
                  name: name,
                  description: description
                }
              };
            });
          } catch (err) {
            // Kritik hata durumunda sadece Türkçe'yi kullan
            if (process.env.NODE_ENV === 'development') {
              console.error('Otomatik çeviri kritik hatası:', err);
            }
            translations = {
              'tr': {
                name: name,
                description: description
              }
            };
          }
        }
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const tenantSlug = getTenantSlug();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant': tenantSlug,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (selectedItem) {
        // Güncelleme işlemi - PUT endpoint kullan
        const apiItem = {
          name: itemData.name || '',
          description: itemData.description || '',
          price: itemData.price || 0,
          category: itemData.category || 'Diğer',
          image: imageUrl,
          allergens: itemData.allergens || [],
          calories: itemData.calories,
          isAvailable: itemData.isAvailable ?? true,
          translations: translations,
        };

        const response = await fetch(`/api/menu/${selectedItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(apiItem),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Güncelleme hatası');
        }

        const responseData = await response.json();
        setMenuItems(items =>
          items.map(item =>
            item.id === selectedItem.id ? { ...item, ...itemData, image: imageUrl, translations } : item
          )
        );
        setShowEditModal(false);
      } else {
        // Yeni öğe ekleme - POST endpoint kullan
        const apiItem = {
          name: itemData.name || '',
          description: itemData.description || '',
          price: itemData.price || 0,
          category: itemData.category || 'Diğer',
          image: imageUrl,
          allergens: itemData.allergens || [],
          calories: itemData.calories,
          preparationTime: itemData.preparationTime,
          rating: itemData.rating || 4,
          isAvailable: itemData.isAvailable ?? true,
          translations: translations,
        };

        const response = await fetch('/api/menu/save', {
          method: 'POST',
          headers,
          body: JSON.stringify({ items: [apiItem] }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kaydetme hatası');
        }

        const responseData = await response.json();
        console.log('Menu save response:', responseData);

        // Backend'den dönen ID'yi kullan
        // Backend formatı: { success: true, items: [{ id, name, ... }] }
        const savedItem = responseData.items?.[0] || responseData.item || null;
        const itemId = savedItem?.id || responseData.items?.[0]?.id;

        if (!itemId) {
          console.error('Backend\'den ID dönmedi, response:', responseData);
          throw new Error('Backend\'den ürün ID\'si alınamadı');
        }

        // Backend'den dönen item'ı kullan veya yeni oluştur
        const newItem: MenuItem = savedItem ? {
          id: savedItem.id,
          name: savedItem.name || itemData.name || '',
          description: savedItem.description || itemData.description || '',
          price: savedItem.price || itemData.price || 0,
          category: savedItem.category || itemData.category || 'Diğer',
          isAvailable: savedItem.isAvailable !== undefined ? savedItem.isAvailable : (itemData.isAvailable ?? true),
          allergens: savedItem.allergens || itemData.allergens || [],
          calories: savedItem.calories || itemData.calories,
          image: savedItem.image || imageUrl,
          preparationTime: savedItem.preparationTime || itemData.preparationTime,
          rating: savedItem.rating || itemData.rating || 4,
          translations: savedItem.translations || translations,
        } : {
          id: itemId,
          name: itemData.name || '',
          description: itemData.description || '',
          price: itemData.price || 0,
          category: itemData.category || 'Diğer',
          isAvailable: itemData.isAvailable ?? true,
          allergens: itemData.allergens || [],
          calories: itemData.calories,
          image: imageUrl,
          preparationTime: itemData.preparationTime,
          rating: itemData.rating || 4,
          translations: translations,
        };

        console.log('Yeni ürün eklendi (ID:', newItem.id, '):', newItem);

        // State'e ekle
        setMenuItems(items => {
          // Aynı ID'ye sahip item varsa güncelle, yoksa ekle
          const existingIndex = items.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            const updated = [...items];
            updated[existingIndex] = newItem;
            return updated;
          }
          return [...items, newItem];
        });

        setShowAddModal(false);

        // Menüyü backend'den yeniden yükle (güncel veriyi al)
        setTimeout(() => {
          loadMenuData(false); // Loading gösterme, sadece veriyi güncelle
        }, 500);
      }
      setSelectedItem(null);
      setImagePreview(null);
      setImageFile(null);

      showSuccessToast('Ürün başarıyla kaydedildi!');
    } catch (error) {
      console.error('Ürün kaydetme hatası:', error);
      showErrorToast('Ürün kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let imageUrl = selectedItem?.image || '';
    if (imageFile) {
      imageUrl = await convertImageToBase64(imageFile);
    } else if (imagePreview && imagePreview.startsWith('data:')) {
      imageUrl = imagePreview;
    }

    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      isAvailable: formData.get('isAvailable') === 'on',
      allergens: (formData.get('allergens') as string)?.split(',').map(a => a.trim()) || [],
      calories: formData.get('calories') ? parseInt(formData.get('calories') as string) : undefined,
      preparationTime: formData.get('preparationTime') ? parseInt(formData.get('preparationTime') as string) : undefined,
      rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : 4.0,
      image: imageUrl,
    };
    saveItem(itemData);
  };

  // Toplu yükleme fonksiyonları
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx|xls)$/)) {
      showErrorToast('Lütfen CSV veya Excel dosyası seçin!');
      return;
    }

    setBulkUploadData(prev => ({ ...prev, file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseFileContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const parseFileContent = (content: string, fileName: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const parsedData: any[] = [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'price', 'category'];

    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        errors.push(`Gerekli sütun bulunamadı: ${header}`);
      }
    }

    if (errors.length > 0) {
      setBulkUploadData(prev => ({ ...prev, errors, isValid: false }));
      return;
    }

    const categoryNames = categories.map(c => c.name);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      if (values.length < headers.length) {
        errors.push(`Satır ${i + 1}: Eksik veri`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      if (!rowData.name || rowData.name.length < 2) {
        errors.push(`Satır ${i + 1}: Ürün adı en az 2 karakter olmalı`);
      }

      if (!rowData.price || isNaN(parseFloat(rowData.price))) {
        errors.push(`Satır ${i + 1}: Geçerli fiyat giriniz`);
      }

      if (!rowData.category || !categoryNames.includes(rowData.category)) {
        errors.push(`Satır ${i + 1}: Geçerli kategori seçiniz`);
      }

      parsedData.push({
        name: rowData.name,
        description: rowData.description || '',
        price: parseFloat(rowData.price),
        category: rowData.category,
        allergens: rowData.allergens ? rowData.allergens.split(',').map((a: string) => a.trim()) : [],
        calories: rowData.calories ? parseInt(rowData.calories) : undefined,
        preparationTime: rowData.preparationtime ? parseInt(rowData.preparationtime) : 15,
        rating: rowData.rating ? parseFloat(rowData.rating) : 4.0,
        isAvailable: rowData.isavailable !== 'false'
      });
    }

    setBulkUploadData(prev => ({
      ...prev,
      parsedData,
      errors,
      isValid: errors.length === 0
    }));
  };

  const handleBulkSave = async () => {
    if (!bulkUploadData.isValid || bulkUploadData.parsedData.length === 0) {
      showErrorToast('Geçerli veri bulunamadı!');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/menu/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: bulkUploadData.parsedData }),
      });

      if (!response.ok) {
        throw new Error('API hatası');
      }

      const newItems: MenuItem[] = bulkUploadData.parsedData.map((item, index) => ({
        id: Date.now().toString() + index,
        ...item
      }));

      setMenuItems(prev => [...prev, ...newItems]);
      setShowBulkUploadModal(false);
      setBulkUploadData({ file: null, parsedData: [], errors: [], isValid: false });

      showSuccessToast(`${bulkUploadData.parsedData.length} ${mounted ? getTranslation('page.menu.success_upload') : 'ürün başarıyla yüklendi!'}`);
    } catch (error) {
      console.error('Toplu yükleme hatası:', error);
      showErrorToast(mounted ? getTranslation('page.menu.error_upload') : 'Ürünler yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'category', 'allergens', 'calories', 'preparationtime', 'rating', 'isavailable'];
    const sampleData = [
      ['Margherita Pizza', 'Domates sosu, mozzarella, fesleğen', '45', 'Pizza', 'Gluten,Süt', '280', '20', '4.5', 'true'],
      ['Cheeseburger', 'Dana eti, cheddar peyniri, marul', '35', 'Burger', 'Gluten,Süt,Yumurta', '520', '15', '4.0', 'true']
    ];

    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'menu_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mounted ? getTranslation('page.menu.title') : 'Menü Yönetimi'}</h1>
            <p className="text-gray-600">{mounted ? getTranslation('page.menu.subtitle') : 'Menü ürünlerini ve kategorileri düzenleyin'}</p>
          </div>
          {activeTab === 'menu' && (
            <div className="flex space-x-3">
              <button
                onClick={addNewItem}
                className="bg-hotel-gold text-white px-4 py-2 rounded-lg hover:bg-hotel-navy transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{mounted ? getTranslation('page.menu.add_item') : 'Ürün Ekle'}</span>
              </button>

              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>{mounted ? getTranslation('page.menu.bulk_upload') : 'Toplu Yükle'}</span>
              </button>


            </div>
          )}
          {activeTab === 'categories' && (
            <button
              onClick={addNewCategory}
              className="bg-hotel-gold text-white px-4 py-2 rounded-lg hover:bg-hotel-navy transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{mounted ? getTranslation('page.menu.add_category') : 'Kategori Ekle'}</span>
            </button>
          )}

          {activeTab === 'campaigns' && (
            <button
              onClick={() => {
                setSelectedCampaign(null);
                setImagePreview(null);
                setImageFile(null);
                setShowAddCampaignModal(true);
              }}
              className="bg-hotel-gold text-white px-4 py-2 rounded-lg hover:bg-hotel-navy transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Kampanya Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-4 px-6 border-b-2 font-semibold text-base transition-colors ${activeTab === 'menu'
              ? 'border-hotel-gold text-hotel-gold bg-hotel-cream'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <MenuIcon className="w-5 h-5" />
              <span>{mounted ? getTranslation('page.menu.tab_menu') : 'Menü'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-6 border-b-2 font-semibold text-base transition-colors ${activeTab === 'categories'
              ? 'border-hotel-gold text-hotel-gold bg-hotel-cream'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>{mounted ? getTranslation('page.menu.tab_categories') : 'Kategoriler'}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-6 border-b-2 font-semibold text-base transition-colors ${activeTab === 'campaigns'
              ? 'border-hotel-gold text-hotel-gold bg-hotel-cream'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5" />
              <span>Kampanyalar</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Menu Tab Content */}
      {
        activeTab === 'menu' && (
          <>
            {/* Filters and Search */}
            <div className="hotel-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={mounted ? getTranslation('page.menu.search_placeholder') : "Ürün ara..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                  >
                    <option value="all">{mounted ? getTranslation('page.menu.all_categories') : 'Tüm Kategoriler'}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {mounted && category.translations?.[currentLanguage]?.name
                          ? category.translations[currentLanguage].name
                          : category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="hotel-card p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="hotel-card p-6">
                    {item.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mounted && item.translations?.[currentLanguage]?.name ? item.translations[currentLanguage].name : item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {mounted && item.translations?.[currentLanguage]?.description ? item.translations[currentLanguage].description : item.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className={`p-1 rounded ${item.isAvailable
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                            }`}
                        >
                          {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => editItem(item)}
                          className="p-1 text-hotel-gold hover:bg-yellow-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{mounted ? getTranslation('page.menu.category_label') : 'Kategori:'}</span>
                        <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{mounted ? getTranslation('page.menu.price_label') : 'Fiyat:'}</span>
                        <span className="text-lg font-bold text-hotel-gold">₺{item.price}</span>
                      </div>
                      {item.calories && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{mounted ? getTranslation('page.menu.calories_label') : 'Kalori:'}</span>
                          <span className="text-sm text-gray-900">{item.calories} {mounted ? getTranslation('page.menu.kcal') : 'kcal'}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{mounted ? getTranslation('page.menu.status_label') : 'Durum:'}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {mounted ? (item.isAvailable ? getTranslation('page.menu.status_available') : getTranslation('page.menu.status_unavailable')) : (item.isAvailable ? 'Mevcut' : 'Mevcut Değil')}
                        </span>
                      </div>
                    </div>

                    {item.allergens.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">{mounted ? getTranslation('page.menu.allergens_label') : 'Alerjenler:'}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.allergens.map((allergen, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <MenuIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{mounted ? getTranslation('page.menu.no_items') : 'Ürün bulunamadı'}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {mounted ? getTranslation('page.menu.no_items_desc') : 'Arama kriterlerinizi değiştirerek tekrar deneyin.'}
                </p>
              </div>
            )}
          </>
        )
      }

      {/* Categories Tab Content */}
      {
        activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const itemCount = menuItems.filter(item => item.category === category.name).length;

              // Çevirileri parse et
              let translations: { [lang: string]: string } = {};
              try {
                if (category.description) {
                  if (typeof category.description === 'string') {
                    translations = JSON.parse(category.description);
                  } else if (typeof category.description === 'object') {
                    translations = category.description;
                  }
                }
              } catch (error) {
                // JSON parse hatası, çeviri yok demektir
              }

              const langNames: { [key: string]: string } = {
                en: 'EN',
                de: 'DE',
                fr: 'FR',
                es: 'ES',
                it: 'IT',
                ru: 'RU',
                ar: 'AR',
                zh: 'ZH'
              };

              return (
                <div key={category.id} className="hotel-card p-6 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {mounted && category.translations?.[currentLanguage]?.name
                          ? category.translations[currentLanguage].name
                          : category.name}
                      </h3>
                      {Object.keys(translations).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(translations).map(([lang, translation]) => (
                            <span
                              key={lang}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              title={`${langNames[lang] || lang}: ${translation}`}
                            >
                              <span className="font-semibold mr-1">{langNames[lang] || lang}:</span>
                              <span>{translation}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {itemCount} ürün
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editCategory(category)}
                        className="p-1 text-hotel-gold hover:bg-yellow-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{mounted ? getTranslation('page.menu.no_categories') : 'Henüz kategori yok'}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {mounted ? getTranslation('page.menu.no_categories_desc') : 'İlk kategorinizi eklemek için yukarıdaki "Kategori Ekle" butonuna tıklayın.'}
                </p>
              </div>
            )}
          </div>
        )
      }

      {/* Campaigns Tab Content */}
      {
        activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="hotel-card p-6 relative group">
                {campaign.image && (
                  <div className="mb-4 rounded-lg overflow-hidden h-48 relative">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${campaign.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                      {campaign.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                    <span className="text-xs font-medium text-hotel-gold bg-hotel-cream px-2 py-1 rounded mt-1 inline-block">
                      {campaign.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setImagePreview(campaign.image || null);
                        setImageFile(null);
                        setShowAddCampaignModal(true);
                      }}
                      className="p-1 text-hotel-gold hover:bg-yellow-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {campaign.description}
                </p>

                {(campaign.startDate || campaign.endDate) && (
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100 flex justify-between">
                    {campaign.startDate && <span>Başlangıç: {new Date(campaign.startDate).toLocaleDateString()}</span>}
                    {campaign.endDate && <span>Bitiş: {new Date(campaign.endDate).toLocaleDateString()}</span>}
                  </div>
                )}
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz kampanya yok</h3>
                <p className="mt-1 text-sm text-gray-500">
                  İlk kampanyanızı oluşturmak için yukarıdaki "Kampanya Ekle" butonuna tıklayın.
                </p>
              </div>
            )}
          </div>
        )
      }

      {/* Add/Edit Item Modal */}
      {
        (showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showAddModal ? (mounted ? getTranslation('page.menu.new_item') : 'Yeni Ürün Ekle') : (mounted ? getTranslation('page.menu.edit_item') : 'Ürün Düzenle')}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {mounted ? getTranslation('page.menu.image_label') : 'Ürün Resmi *'}
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-40 w-40 object-cover rounded-lg border-2 border-hotel-gold shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-6 py-3 border-2 border-hotel-gold rounded-lg hover:bg-hotel-gold hover:text-white transition-colors cursor-pointer font-medium"
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        {imagePreview ? (mounted ? getTranslation('page.menu.change_image') : 'Resmi Değiştir') : (mounted ? getTranslation('page.menu.upload_image') : 'Resim Yükle (JPG, PNG, max 5MB)')}
                      </label>
                      {!imagePreview && (
                        <p className="text-xs text-gray-500 mt-2">
                          {mounted ? getTranslation('page.menu.image_help') : 'Ürün için bir resim yükleyin. Bu resim menüde görüntülenecektir.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.name_label') : 'Ürün Adı *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedItem?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      placeholder={mounted ? getTranslation('page.menu.name_placeholder') : "Ürün adı"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.category_select_label') : 'Kategori *'}
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        defaultValue={selectedItem?.category || ''}
                        required
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setShowCategorySelectModal(true);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="">{mounted ? getTranslation('page.menu.select_category') : 'Kategori seçin'}</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {mounted && category.translations?.[currentLanguage]?.name
                              ? category.translations[currentLanguage].name
                              : category.name}
                          </option>
                        ))}
                        <option value="" disabled className="text-gray-400">──────────</option>
                        <option value="__add_new__" className="text-hotel-gold font-bold bg-hotel-cream">
                          {mounted ? getTranslation('page.menu.add_new_category_option') : '➕ Yeni Kategori Ekle'}
                        </option>
                      </select>
                      {categories.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {mounted ? getTranslation('page.menu.no_category_error') : 'Henüz kategori yok. Lütfen önce bir kategori ekleyin.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {mounted ? getTranslation('page.menu.description_label') : 'Açıklama'}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedItem?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                    placeholder={mounted ? getTranslation('page.menu.description_placeholder') : "Ürün açıklaması"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.price_input_label') : 'Fiyat (₺) *'}
                    </label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={selectedItem?.price || ''}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.prep_time_label') : 'Hazırlık Süresi (dk)'}
                    </label>
                    <input
                      type="number"
                      name="preparationTime"
                      defaultValue={selectedItem?.preparationTime || ''}
                      min="1"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.calories_input_label') : 'Kalori'}
                    </label>
                    <input
                      type="number"
                      name="calories"
                      defaultValue={selectedItem?.calories || ''}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      placeholder={mounted ? getTranslation('page.menu.calories_input_label') : "Kalori"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.rating_label') : 'Kalite Puanı (1-5) *'}
                    </label>
                    <select
                      name="rating"
                      defaultValue={selectedItem?.rating || '4.0'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="4.0">4.0 ⭐⭐⭐⭐ (Çok İyi)</option>
                      <option value="4.5">4.5 ⭐⭐⭐⭐ (Çok İyi++)</option>
                      <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Mükemmel)</option>
                      <option value="3.5">3.5 ⭐⭐⭐ (İyi++)</option>
                      <option value="3.0">3.0 ⭐⭐⭐ (İyi)</option>
                      <option value="2.5">2.5 ⭐⭐ (Orta++)</option>
                      <option value="2.0">2.0 ⭐⭐ (Orta)</option>
                      <option value="1.5">1.5 ⭐ (Temel++)</option>
                      <option value="1.0">1.0 ⭐ (Temel)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mounted ? getTranslation('page.menu.allergens_input_label') : 'Alerjenler'}
                    </label>
                    <input
                      type="text"
                      name="allergens"
                      defaultValue={selectedItem?.allergens?.join(', ') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                      placeholder={mounted ? getTranslation('page.menu.allergens_placeholder') : "Gluten, Süt, Yumurta"}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={selectedItem?.isAvailable ?? true}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {mounted ? getTranslation('page.menu.is_available_label') : 'Ürün mevcut'}
                  </label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedItem(null);
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {mounted ? getTranslation('page.menu.cancel') : 'İptal'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy"
                  >
                    {showAddModal ? (mounted ? getTranslation('page.menu.add_btn') : 'Ürün Ekle') : (mounted ? getTranslation('page.menu.update_btn') : 'Güncelle')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Add/Edit Category Modal */}
      {
        showAddCategoryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {selectedCategoryForEdit ? (mounted ? getTranslation('page.menu.edit_category') : 'Kategori Düzenle') : (mounted ? getTranslation('page.menu.new_category') : 'Yeni Kategori Ekle')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {mounted ? getTranslation('page.menu.category_name_label') : 'Kategori Adı (Türkçe) *'}
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                    placeholder={mounted ? getTranslation('page.menu.category_name_placeholder') : "Kategori adı"}
                  />
                </div>

                {/* Çeviriler */}
                {selectedCategoryForEdit && Object.keys(categoryTranslations).length > 0 && (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{mounted ? getTranslation('page.menu.translations_title') : 'Çeviriler'}</h4>
                    <div className="space-y-2">
                      {Object.entries(categoryTranslations).map(([lang, translation]) => {
                        const langNames: { [key: string]: string } = {
                          en: 'İngilizce',
                          de: 'Almanca',
                          fr: 'Fransızca',
                          es: 'İspanyolca',
                          it: 'İtalyanca',
                          ru: 'Rusça',
                          ar: 'Arapça',
                          zh: 'Çince'
                        };
                        return (
                          <div key={lang} className="flex items-center space-x-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 w-20">
                              {langNames[lang] || lang}:
                            </label>
                            <input
                              type="text"
                              value={translation}
                              onChange={(e) => {
                                setCategoryTranslations({
                                  ...categoryTranslations,
                                  [lang]: e.target.value
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategoryModal(false);
                      setNewCategoryName('');
                      setCategoryTranslations({});
                      setSelectedCategoryForEdit(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                  >
                    {mounted ? getTranslation('page.menu.cancel') : 'İptal'}
                  </button>
                  <button
                    onClick={saveCategory}
                    className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy"
                  >
                    {selectedCategoryForEdit ? (mounted ? getTranslation('page.menu.update_btn') : 'Güncelle') : (mounted ? getTranslation('common.add') : 'Ekle')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Category Select Modal (when adding new category from product form) */}
      {
        showCategorySelectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {mounted ? getTranslation('page.menu.new_category') : 'Yeni Kategori Ekle'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {mounted ? getTranslation('page.menu.category_name_label') : 'Kategori Adı *'}
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white"
                    placeholder={mounted ? getTranslation('page.menu.category_name_placeholder') : "Kategori adı"}
                    autoFocus
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategorySelectModal(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {mounted ? getTranslation('page.menu.cancel') : 'İptal'}
                  </button>
                  <button
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        const newCategory: Category = {
                          id: Date.now().toString(),
                          name: newCategoryName.trim(),
                        };
                        setCategories(cats => [...cats, newCategory]);
                        showSuccessToast('Kategori başarıyla eklendi!');
                        setShowCategorySelectModal(false);
                        setNewCategoryName('');
                        // Form'daki kategori select'ini güncelle
                        const select = document.querySelector('select[name="category"]') as HTMLSelectElement;
                        if (select) {
                          select.value = newCategory.name;
                        }
                      }
                    }}
                    className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy"
                  >
                    {mounted ? getTranslation('page.menu.add_and_select') : 'Ekle ve Seç'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Confirmation Modal */}
      {
        confirmModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
                  {confirmModal.type === 'item' ? (mounted ? getTranslation('page.menu.delete_item_title') : 'Ürünü Sil') : (mounted ? getTranslation('page.menu.delete_category_title') : 'Kategoriyi Sil')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                  <span className="font-semibold text-gray-900">{confirmModal.itemName}</span> {confirmModal.type === 'item' ? (mounted ? getTranslation('page.menu.delete_confirm_item') : 'ürününü silmek istediğinizden emin misiniz?') : (mounted ? getTranslation('page.menu.delete_confirm_category') : 'kategorisini silmek istediğinizden emin misiniz?')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {mounted ? getTranslation('page.menu.cancel') : 'İptal'}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    {mounted ? getTranslation('page.menu.yes_delete') : 'Evet, Sil'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Translation Modal */}
      {
        showTranslationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Languages className="w-6 h-6 text-blue-600" />
                    <span>{mounted ? getTranslation('page.menu.translation_title') : 'Menü Çevirisi'}</span>
                  </h2>
                  <button
                    onClick={() => setShowTranslationModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        <MenuTranslator
                          menuItem={item}
                          onTranslated={async (translations) => {
                            // Menu item'ı güncelle
                            setMenuItems(items =>
                              items.map(menuItem =>
                                menuItem.id === item.id
                                  ? { ...menuItem, translations }
                                  : menuItem
                              )
                            );

                            // Frontend API route üzerinden backend'e kaydet
                            try {
                              const token = localStorage.getItem('auth_token');

                              if (!token) {
                                console.error('❌ Token bulunamadı. Lütfen tekrar giriş yapın.');
                                alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                                return;
                              }

                              const tenantSlug = getTenantSlug();

                              // Frontend API route'unu kullan (proxy yapar)
                              const response = await fetch(`/api/menu/${item.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                                  'x-tenant': tenantSlug
                                },
                                body: JSON.stringify({
                                  translations: translations
                                })
                              });

                              if (response.ok) {
                                console.log('✅ Çeviriler başarıyla kaydedildi');
                                showSuccessToast('Çeviriler başarıyla kaydedildi!');
                              } else {
                                const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
                                console.error('❌ Çeviriler kaydedilirken hata:', errorData);

                                if (response.status === 401) {
                                  alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                                  // İsteğe bağlı: login sayfasına yönlendir
                                  // window.location.href = '/login';
                                } else if (response.status === 404) {
                                  alert('Ürün bulunamadı. Sayfayı yenileyip tekrar deneyin.');
                                } else {
                                  alert('Çeviriler kaydedilirken bir hata oluştu: ' + (errorData.error || errorData.message || 'Bilinmeyen hata'));
                                }
                              }
                            } catch (error) {
                              console.error('❌ Çeviriler kaydedilirken hata:', error);
                              alert('Çeviriler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  {menuItems.length === 0 && (
                    <div className="text-center py-12">
                      <Languages className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{mounted ? getTranslation('page.menu.no_items_translation') : 'Henüz menü öğesi yok'}</h3>
                      <p className="text-gray-600">{mounted ? getTranslation('page.menu.no_items_translation_desc') : 'Önce menü öğeleri ekleyin, sonra çeviri yapabilirsiniz.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Bulk Upload Modal */}
      {
        showBulkUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <span>{mounted ? getTranslation('page.menu.bulk_upload_title') : 'Toplu Ürün Yükleme'}</span>
                  </h2>
                  <button
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setBulkUploadData({ file: null, parsedData: [], errors: [], isValid: false });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">{mounted ? getTranslation('page.menu.download_template') : 'Şablon İndir'}</h3>
                        <p className="text-blue-700 text-sm">{mounted ? getTranslation('page.menu.download_template_desc') : 'Önce şablonu indirin ve doldurun, sonra yükleyin.'}</p>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {mounted ? getTranslation('page.menu.download_template') : 'Şablon İndir'}
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{mounted ? getTranslation('page.menu.select_file_title') : 'Dosya Seçin'}</h3>
                    <p className="text-gray-600 mb-4">{mounted ? getTranslation('page.menu.select_file_desc') : 'CSV veya Excel dosyası yükleyin'}</p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="bulk-upload-file"
                    />
                    <label
                      htmlFor="bulk-upload-file"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {mounted ? getTranslation('page.menu.select_file_btn') : 'Dosya Seç'}
                    </label>
                  </div>

                  {bulkUploadData.file && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileSpreadsheet className="w-5 h-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{bulkUploadData.file.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {(bulkUploadData.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  )}

                  {bulkUploadData.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="text-lg font-semibold text-red-900">{mounted ? getTranslation('page.menu.errors_title') : 'Hatalar'}</h3>
                      </div>
                      <ul className="space-y-1">
                        {bulkUploadData.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {bulkUploadData.parsedData.length > 0 && bulkUploadData.isValid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-green-900">
                          {mounted ? getTranslation('page.menu.preview_title') : 'Önizleme'} ({bulkUploadData.parsedData.length} {mounted ? getTranslation('page.menu.items_count') : 'ürün'})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{mounted ? getTranslation('page.menu.name_label') : 'Ürün Adı'}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{mounted ? getTranslation('page.menu.category_label') : 'Kategori'}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{mounted ? getTranslation('page.menu.price_label') : 'Fiyat'}</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{mounted ? getTranslation('page.menu.status_label') : 'Durum'}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bulkUploadData.parsedData.slice(0, 5).map((item, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm text-gray-900">{item.name}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">{item.category}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">₺{item.price}</td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.isAvailable ? (mounted ? getTranslation('page.menu.status_available') : 'Aktif') : (mounted ? getTranslation('page.menu.status_unavailable') : 'Pasif')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {bulkUploadData.parsedData.length > 5 && (
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            ... ve {bulkUploadData.parsedData.length - 5} ürün daha
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowBulkUploadModal(false);
                        setBulkUploadData({ file: null, parsedData: [], errors: [], isValid: false });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {mounted ? getTranslation('page.menu.cancel') : 'İptal'}
                    </button>
                    <button
                      onClick={handleBulkSave}
                      disabled={!bulkUploadData.isValid || bulkUploadData.parsedData.length === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkUploadData.parsedData.length} {mounted ? getTranslation('page.menu.upload_btn') : 'Ürünü Yükle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Notification */}
      {
        toast.show && (
          <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50">
            <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center space-x-2 sm:space-x-3 transform transition-all duration-300 ${toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
              }`}>
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }
      {/* Add/Edit Campaign Modal */}
      {
        showAddCampaignModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
              </h3>

              <form onSubmit={saveCampaign} className="space-y-4">
                {/* Image Upload */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kampanya Görseli
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-40 w-40 object-cover rounded-lg border-2 border-hotel-gold shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCampaignImageUpload}
                        className="hidden"
                        id="campaign-image-upload"
                      />
                      <label
                        htmlFor="campaign-image-upload"
                        className="inline-flex items-center px-6 py-3 border-2 border-hotel-gold rounded-lg hover:bg-hotel-gold hover:text-white transition-colors cursor-pointer font-medium"
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        {imagePreview ? 'Resmi Değiştir' : 'Resim Yükle'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Başlığı *</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedCampaign?.title || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold"
                      placeholder="Örn: Hafta Sonu İndirimi"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                      name="description"
                      defaultValue={selectedCampaign?.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold"
                      placeholder="Kampanya detayları..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={selectedCampaign?.startDate ? new Date(selectedCampaign.startDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={selectedCampaign?.endDate ? new Date(selectedCampaign.endDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Tipi</label>
                    <select
                      name="type"
                      defaultValue={selectedCampaign?.type || 'GENERAL'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold"
                    >
                      <option value="GENERAL">Genel</option>
                      <option value="FOOD">Yiyecek</option>
                      <option value="DRINK">İçecek</option>
                      <option value="SPA">Spa & Wellness</option>
                      <option value="EVENT">Etkinlik</option>
                    </select>
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActiveCampaign"
                      defaultChecked={selectedCampaign?.isActive ?? true}
                      className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold h-4 w-4"
                    />
                    <label htmlFor="isActiveCampaign" className="ml-2 text-sm text-gray-700">Kampanya Aktif</label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddCampaignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy"
                  >
                    {selectedCampaign ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
