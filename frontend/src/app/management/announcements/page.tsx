"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { translateText } from '@/lib/translateService';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { Moon, Sun } from 'lucide-react';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Megaphone,
  AlertCircle,
  CheckCircle,
  X,
  Info,
  Wrench,
  Star,
  Gift,
  Utensils,
  Coffee,
  Wine,
  Heart,
  Leaf,
  Zap,
  Crown,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Bell,
  Home,
  Users,
  Settings
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'promotion' | 'maintenance' | 'advertisement';
  category: 'general' | 'menu' | 'hotel' | 'promotion';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetRooms?: string[];
  createdAt: string;
  createdBy: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  linkUrl?: string;
  linkText?: string;
  icon?: string;
  translations?: {
    [lang: string]: {
      title: string;
      content: string;
      linkText?: string;
    };
  };
}

export default function AnnouncementsManagement() {
  const { currentLanguage, getTranslation } = useLanguageStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Announcement> & { translations?: { [lang: string]: { title: string; content: string; linkText?: string; } } }>({});
  const [showTranslations, setShowTranslations] = useState(false);

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('page.announcements.title');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  // Settings'ten desteklenen dilleri al
  const getSupportedLanguagesForTranslation = (): string[] => {
    try {
      const savedSettings = localStorage.getItem('hotel-settings');
      if (savedSettings) {
        const settingsData = JSON.parse(savedSettings);
        if (settingsData.language?.supportedLanguages && Array.isArray(settingsData.language.supportedLanguages)) {
          return settingsData.language.supportedLanguages;
        }
      }
    } catch (error) {
      console.error('Settings yüklenirken hata:', error);
    }
    // Varsayılan diller
    return ['tr', 'en', 'de', 'fr'];
  };

  // Otomatik çeviri fonksiyonu - Türkçe metin değiştiğinde tetiklenir
  const autoTranslateOnChange = async (field: 'title' | 'content' | 'linkText', value: string) => {
    if (!value.trim()) return;
    
    const newFormData: any = { ...formData, [field]: value };
    const supportedLanguages = getSupportedLanguagesForTranslation();
    
    // Türkçe'yi ekle
    if (!newFormData.translations) newFormData.translations = {};
    newFormData.translations['tr'] = {
      ...newFormData.translations['tr'],
      [field]: value
    };
    
    // Otomatik çevirileri yap (sadece desteklenen diller için)
    for (const lang of supportedLanguages) {
      if (lang === 'tr') continue;
      
      if (!newFormData.translations[lang]) newFormData.translations[lang] = {};
      
      try {
        const translateWithTimeout = (text: string, targetLang: string, timeout: number = 5000): Promise<string> => {
          return Promise.race([
            translateText(text, targetLang),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Translation timeout')), timeout)
            )
          ]);
        };

        const translatedText = await translateWithTimeout(value, lang).catch(() => null);
        
        if (translatedText && translatedText !== value && translatedText.trim() !== '') {
          newFormData.translations[lang][field] = translatedText;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Çeviri hatası (${lang}):`, err);
        }
      }
    }
    
    setFormData(newFormData);
  };

  // İkon seçenekleri
  const iconOptions = [
    { name: 'info', label: 'Bilgi', icon: Info, color: 'text-blue-500' },
    { name: 'megaphone', label: 'Duyuru', icon: Megaphone, color: 'text-orange-500' },
    { name: 'star', label: 'Yıldız', icon: Star, color: 'text-yellow-500' },
    { name: 'gift', label: 'Hediye', icon: Gift, color: 'text-green-500' },
    { name: 'utensils', label: 'Yemek', icon: Utensils, color: 'text-red-500' },
    { name: 'coffee', label: 'Kahve', icon: Coffee, color: 'text-amber-600' },
    { name: 'wine', label: 'İçecek', icon: Wine, color: 'text-purple-500' },
    { name: 'heart', label: 'Kalp', icon: Heart, color: 'text-pink-500' },
    { name: 'leaf', label: 'Sağlıklı', icon: Leaf, color: 'text-green-600' },
    { name: 'zap', label: 'Hızlı', icon: Zap, color: 'text-yellow-400' },
    { name: 'crown', label: 'Premium', icon: Crown, color: 'text-yellow-600' },
    { name: 'flame', label: 'Sıcak', icon: Flame, color: 'text-red-400' },
    { name: 'sparkles', label: 'Özel', icon: Sparkles, color: 'text-indigo-500' },
    { name: 'target', label: 'Hedef', icon: Target, color: 'text-blue-600' },
    { name: 'trophy', label: 'Başarı', icon: Trophy, color: 'text-yellow-500' },
    { name: 'bell', label: 'Bildirim', icon: Bell, color: 'text-gray-600' },
    { name: 'home', label: 'Otel', icon: Home, color: 'text-gray-700' },
    { name: 'users', label: 'Müşteri', icon: Users, color: 'text-blue-700' },
    { name: 'settings', label: 'Sistem', icon: Settings, color: 'text-gray-500' },
    { name: 'wrench', label: 'Bakım', icon: Wrench, color: 'text-orange-600' },
    { name: 'alert-circle', label: 'Uyarı', icon: AlertCircle, color: 'text-red-500' },
    { name: 'check-circle', label: 'Onay', icon: CheckCircle, color: 'text-green-500' },
  ];

  // İkon render fonksiyonu
  const renderIcon = (iconName?: string) => {
    if (!iconName) return <Megaphone className="w-5 h-5 text-gray-500" />;
    
    const iconOption = iconOptions.find(option => option.name === iconName);
    if (!iconOption) return <Megaphone className="w-5 h-5 text-gray-500" />;
    
    const IconComponent = iconOption.icon;
    return <IconComponent className={`w-5 h-5 ${iconOption.color}`} />;
  };

  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useThemeStore();
  const isDarkMode = theme.mode === 'dark';

  // Duyuruları API'den yükle
  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!token || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
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

        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant': tenantSlug
          }
        });

        if (response.ok) {
          const data = await response.json();
          const announcementsData = Array.isArray(data) ? data : [];
          
          // API'den gelen veriyi formatla
          const formattedAnnouncements = announcementsData.map((a: any) => {
            const metadata = (a.metadata as any) || {};
            return {
              id: a.id,
              title: a.title || 'Duyuru',
              content: a.message || '',
              type: (metadata.announcementType || (a.type === 'announcement' ? 'info' : 'info')) as 'info' | 'warning' | 'promotion' | 'maintenance' | 'advertisement',
              category: (metadata.category || 'general') as 'general' | 'menu' | 'hotel' | 'promotion',
              isActive: metadata.isActive !== false,
              startDate: metadata.startDate || (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
              endDate: metadata.endDate || undefined,
              targetRooms: [],
              createdAt: a.createdAt || new Date().toISOString(),
              createdBy: 'Admin',
              priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
              linkUrl: metadata.linkUrl || undefined,
              linkText: metadata.linkText || undefined,
              icon: metadata.icon || undefined,
              translations: metadata.translations || undefined
            };
          });
          
          setAnnouncements(formattedAnnouncements);
        } else {
          setAnnouncements([]);
        }
      } catch (error) {
        console.error('Duyurular yüklenirken hata:', error);
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, [token, user]);

  // Dark mode class'ını document'e ekle
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Megaphone className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'promotion':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <Megaphone className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'promotion':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info':
        return 'Bilgi';
      case 'warning':
        return 'Uyarı';
      case 'promotion':
        return 'Promosyon';
      case 'maintenance':
        return 'Bakım';
      case 'advertisement':
        return 'Reklam';
      default:
        return 'Diğer';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general':
        return 'Genel';
      case 'menu':
        return 'Menü';
      case 'hotel':
        return 'Otel';
      case 'promotion':
        return 'Promosyon';
      default:
        return 'Diğer';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'active') return announcement.isActive;
    if (filter === 'inactive') return !announcement.isActive;
    return true;
  });

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    
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

      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;

      // API'ye güncelleme gönder (isActive durumunu güncelle)
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        },
        body: JSON.stringify({
          isActive: !announcement.isActive
        })
      });

      if (response.ok) {
        setAnnouncements(announcements.map(a => 
          a.id === id ? { ...a, isActive: !a.isActive } : a
        ));
      }
    } catch (error) {
      console.error('Duyuru durumu güncellenirken hata:', error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    if (!token) return;

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

      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        }
      });

      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Duyuru silinirken hata:', error);
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setSelectedIcon(announcement.icon || '');
    setShowEditModal(true);
  };

  const addNewAnnouncement = () => {
    setSelectedAnnouncement(null);
    setSelectedIcon('');
    setShowAddModal(true);
  };

  const saveAnnouncement = async (announcementData: Partial<Announcement>) => {
    if (!token) return;

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

      if (selectedAnnouncement) {
        // Edit existing announcement
        const response = await fetch(`${API_BASE_URL}/api/announcements/${selectedAnnouncement.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-tenant': tenantSlug
          },
          body: JSON.stringify({
            title: announcementData.title,
            content: announcementData.content,
            type: announcementData.type,
            category: announcementData.category,
            startDate: announcementData.startDate,
            endDate: announcementData.endDate,
            isActive: announcementData.isActive,
            linkUrl: announcementData.linkUrl,
            linkText: announcementData.linkText,
            icon: selectedIcon || announcementData.icon,
            translations: announcementData.translations
          })
        });

        if (response.ok) {
          const updated = await response.json();
          const metadata = (updated.metadata as any) || {};
          setAnnouncements(announcements.map(a => 
            a.id === selectedAnnouncement.id ? {
              ...a,
              title: updated.title || a.title,
              content: updated.message || a.content,
              type: (metadata.announcementType || a.type) as 'info' | 'warning' | 'promotion' | 'maintenance' | 'advertisement',
              category: (metadata.category || a.category) as 'general' | 'menu' | 'hotel' | 'promotion',
              isActive: metadata.isActive !== undefined ? metadata.isActive : a.isActive,
              startDate: metadata.startDate || a.startDate,
              endDate: metadata.endDate !== undefined ? metadata.endDate : a.endDate,
              linkUrl: metadata.linkUrl !== undefined ? metadata.linkUrl : a.linkUrl,
              linkText: metadata.linkText !== undefined ? metadata.linkText : a.linkText,
              icon: metadata.icon !== undefined ? metadata.icon : a.icon,
              translations: metadata.translations !== undefined ? metadata.translations : a.translations,
              ...announcementData
            } : a
          ));
          setShowEditModal(false);
        }
      } else {
        // Add new announcement
        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-tenant': tenantSlug
          },
          body: JSON.stringify({
            title: announcementData.title,
            content: announcementData.content,
            type: announcementData.type || 'info',
            category: announcementData.category || 'general',
            startDate: announcementData.startDate || new Date().toISOString().split('T')[0],
            endDate: announcementData.endDate,
            isActive: announcementData.isActive ?? true,
            linkUrl: announcementData.linkUrl,
            linkText: announcementData.linkText,
            icon: selectedIcon || announcementData.icon,
            translations: announcementData.translations
          })
        });

        if (response.ok) {
          const newAnnouncement = await response.json();
          const metadata = (newAnnouncement.metadata as any) || {};
          const formattedAnnouncement: Announcement = {
            id: newAnnouncement.id,
            title: newAnnouncement.title || '',
            content: newAnnouncement.message || '',
            type: (metadata.announcementType || 'info') as 'info' | 'warning' | 'promotion' | 'maintenance' | 'advertisement',
            category: (metadata.category || 'general') as 'general' | 'menu' | 'hotel' | 'promotion',
            isActive: metadata.isActive !== false,
            startDate: metadata.startDate || (newAnnouncement.createdAt ? new Date(newAnnouncement.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            endDate: metadata.endDate || announcementData.endDate,
            targetRooms: announcementData.targetRooms || [],
            createdAt: newAnnouncement.createdAt || new Date().toISOString(),
            createdBy: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin',
            priority: announcementData.priority || 'MEDIUM',
            linkUrl: metadata.linkUrl || announcementData.linkUrl,
            linkText: metadata.linkText || announcementData.linkText,
            icon: metadata.icon || selectedIcon || announcementData.icon,
            translations: metadata.translations || announcementData.translations
          };
          setAnnouncements([formattedAnnouncement, ...announcements]);
          setShowAddModal(false);
        }
      }
      setSelectedAnnouncement(null);
      setSelectedIcon('');
    } catch (error) {
      console.error('Duyuru kaydedilirken hata:', error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    
    // Otomatik çevirileri formData state'inden al
    const translations: { [lang: string]: { title: string; content: string; linkText?: string } } = {};
    
    // Türkçe için form'dan al
    translations['tr'] = {
      title: formDataObj.get('title') as string,
      content: formDataObj.get('content') as string,
      ...(formDataObj.get('linkText') && { linkText: formDataObj.get('linkText') as string })
    };
    
    // Diğer diller için formData state'inden al (desteklenen diller)
    const supportedLanguages = getSupportedLanguagesForTranslation();
    supportedLanguages.forEach(lang => {
      if (lang !== 'tr' && formData.translations?.[lang]) {
        translations[lang] = {
          title: formData.translations[lang].title,
          content: formData.translations[lang].content,
          ...(formData.translations[lang].linkText && { linkText: formData.translations[lang].linkText })
        };
      }
    });
    
    const announcementData = {
      title: formDataObj.get('title') as string,
      content: formDataObj.get('content') as string,
      type: formDataObj.get('type') as any,
      category: formDataObj.get('category') as any,
      startDate: formDataObj.get('startDate') as string,
      endDate: formDataObj.get('endDate') as string || undefined,
      isActive: formDataObj.get('isActive') === 'on',
      linkUrl: formDataObj.get('linkUrl') as string || undefined,
      linkText: formDataObj.get('linkText') as string || undefined,
      icon: selectedIcon || undefined,
      translations: Object.keys(translations).length > 0 ? translations : undefined,
    };
    saveAnnouncement(announcementData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTranslation('page.announcements.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{getTranslation('page.announcements.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const newMode = isDarkMode ? 'light' : 'dark';
                theme.setTheme({ 
                  mode: newMode,
                  backgroundColor: newMode === 'dark' ? '#0F172A' : '#FFFFFF',
                  textColor: newMode === 'dark' ? '#F9FAFB' : '#1F2937',
                  cardBackground: newMode === 'dark' ? '#1E293B' : '#F9FAFB',
                  borderColor: newMode === 'dark' ? '#334155' : '#E5E7EB'
                });
              }}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={addNewAnnouncement}
              className="bg-hotel-gold text-white px-4 py-2 rounded-lg hover:bg-hotel-navy transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{getTranslation('announcements.add')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="hotel-card p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getTranslation('announcements.filter')}</span>
          <div className="flex space-x-2">
            {(['all', 'active', 'inactive'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-hotel-gold text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterOption === 'all' ? getTranslation('announcements.all') : filterOption === 'active' ? getTranslation('announcements.active') : getTranslation('announcements.inactive')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="hotel-card p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {renderIcon(announcement.icon)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{announcement.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                    {getTypeLabel(announcement.type)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCategoryLabel(announcement.category)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    announcement.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {announcement.isActive ? getTranslation('announcements.active') : getTranslation('announcements.inactive')}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">{announcement.content}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{getTranslation('announcements.start_date')}: {new Date(announcement.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {announcement.endDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{getTranslation('announcements.end_date')}: {new Date(announcement.endDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span>{getTranslation('announcements.created_by')}: {announcement.createdBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleActive(announcement.id)}
                  className={`p-2 rounded-lg ${
                    announcement.isActive 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={announcement.isActive ? getTranslation('announcements.make_inactive') : getTranslation('announcements.make_active')}
                >
                  {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => editAnnouncement(announcement)}
                  className="p-2 text-hotel-gold hover:bg-yellow-50 rounded-lg"
                  title={getTranslation('announcements.edit')}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title={getTranslation('announcements.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{getTranslation('announcements.not_found')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {getTranslation('announcements.not_found_desc')}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {showAddModal ? getTranslation('announcements.new') : getTranslation('announcements.edit_title')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Ana Türkçe İçerik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('announcements.title_label')}
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedAnnouncement?.title || ''}
                  onChange={(e) => autoTranslateOnChange('title', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  placeholder={getTranslation('announcements.title_placeholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation('announcements.content_label')}
                </label>
                <textarea
                  name="content"
                  defaultValue={selectedAnnouncement?.content || ''}
                  onChange={(e) => autoTranslateOnChange('content', e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  placeholder={getTranslation('announcements.content_placeholder')}
                />
              </div>

              {/* Çok Dilli Çeviriler */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{getTranslation('announcements.translations_title')}</h3>
                  <button
                    type="button"
                    onClick={() => setShowTranslations(!showTranslations)}
                    className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showTranslations ? 'Gizle' : 'Göster'}</span>
                  </button>
                </div>
                
                {showTranslations && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Otomatik Çeviri Aktif</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Türkçe metin yazdığınızda sistem otomatik olarak seçili dillere çevirir.
                      </p>
                    </div>
                    
                {getSupportedLanguagesForTranslation().filter(lang => lang !== 'tr').map((lang) => {
                  const langNames: { [key: string]: string } = {
                    en: 'İngilizce',
                    ru: 'Rusça', 
                    ar: 'Arapça',
                    de: 'Almanca',
                    fr: 'Fransızca',
                    es: 'İspanyolca',
                    it: 'İtalyanca',
                    zh: 'Çince'
                  };
                  
                  return (
                    <div key={lang} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">{langNames[lang as keyof typeof langNames]}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Başlık</label>
                          <input
                            type="text"
                            name={`${lang}_title`}
                            value={formData.translations?.[lang]?.title || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                            placeholder="Otomatik çevrilecek..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">İçerik</label>
                          <textarea
                            name={`${lang}_content`}
                            value={formData.translations?.[lang]?.content || ''}
                            readOnly
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                            placeholder="Otomatik çevrilecek..."
                          />
                        </div>
                        
                        {formData.linkText && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Link Metni</label>
                            <input
                              type="text"
                              name={`${lang}_linkText`}
                              value={formData.translations?.[lang]?.linkText || ''}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                              placeholder="Otomatik çevrilecek..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tip *
                  </label>
                  <select 
                    name="type"
                    defaultValue={selectedAnnouncement?.type || 'info'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="promotion">Promosyon</option>
                    <option value="maintenance">Bakım</option>
                    <option value="advertisement">Reklam</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori *
                  </label>
                  <select 
                    name="category"
                    defaultValue={selectedAnnouncement?.category || 'general'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="general">Genel</option>
                    <option value="menu">Menü</option>
                    <option value="hotel">Otel</option>
                    <option value="promotion">Promosyon</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={selectedAnnouncement?.startDate || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* İkon Seçici */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İkon Seçin (Opsiyonel)
                </label>
                <div className="grid grid-cols-6 gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 max-h-48 overflow-y-auto">
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <label
                        key={option.name}
                        className={`flex flex-col items-center p-2 cursor-pointer hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors group ${
                          selectedIcon === option.name ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-600' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="icon"
                          value={option.name}
                          checked={selectedIcon === option.name}
                          onChange={() => setSelectedIcon(option.name)}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-lg mb-1 group-hover:scale-110 transition-transform ${option.color} ${
                          selectedIcon === option.name ? 'scale-110' : ''
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Duyuruya uygun bir ikon seçin. Bu ikon QR menüde görünecektir.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bitiş Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={selectedAnnouncement?.endDate || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    name="linkUrl"
                    defaultValue={selectedAnnouncement?.linkUrl || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="https://example.com veya /sayfa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Metni (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    name="linkText"
                    defaultValue={selectedAnnouncement?.linkText || ''}
                    onChange={(e) => autoTranslateOnChange('linkText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Örnek: Menüyü İncele"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={selectedAnnouncement?.isActive ?? true}
                  className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Duyuru aktif
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              >
                İptal
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector('form');
                  if (form) {
                    const formDataObj = new FormData(form);
                    
                    // Otomatik çevirileri formData state'inden al
                    const translations: { [lang: string]: { title: string; content: string; linkText?: string } } = {};
                    
                    // Türkçe için form'dan al
                    translations['tr'] = {
                      title: formDataObj.get('title') as string,
                      content: formDataObj.get('content') as string,
                      ...(formDataObj.get('linkText') && { linkText: formDataObj.get('linkText') as string })
                    };
                    
                    // Diğer diller için formData state'inden al (desteklenen diller)
                    const supportedLanguages = getSupportedLanguagesForTranslation();
                    supportedLanguages.forEach(lang => {
                      if (lang !== 'tr' && formData.translations?.[lang]) {
                        translations[lang] = {
                          title: formData.translations[lang].title,
                          content: formData.translations[lang].content,
                          ...(formData.translations[lang].linkText && { linkText: formData.translations[lang].linkText })
                        };
                      }
                    });
                    
                    const announcementData = {
                      title: formDataObj.get('title') as string,
                      content: formDataObj.get('content') as string,
                      type: formDataObj.get('type') as any,
                      category: formDataObj.get('category') as any,
                      startDate: formDataObj.get('startDate') as string,
                      endDate: formDataObj.get('endDate') as string || undefined,
                      isActive: formDataObj.get('isActive') === 'on',
                      linkUrl: formDataObj.get('linkUrl') as string || undefined,
                      linkText: formDataObj.get('linkText') as string || undefined,
                      translations: Object.keys(translations).length > 0 ? translations : undefined,
                    };
                    saveAnnouncement(announcementData);
                  }
                }}
                className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy"
              >
                {showAddModal ? 'Oluştur' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
