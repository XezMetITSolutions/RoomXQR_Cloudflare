"use client";

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { Save, Wifi, Clock, UtensilsCrossed, Building2, Phone, Plus, X, Image as ImageIcon } from 'lucide-react';

const DEFAULT_ACTIVITY_IMAGES = [
  { title: 'Spa', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
  { title: 'Hamam', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80' },
  { title: 'Havuz', imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80' },
  { title: 'Fitness', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { title: 'Restoran', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' }
];

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
  activityImages?: { title: string; imageUrl: string }[];
}

export default function HotelInfoPage() {
  const { currentLanguage, getTranslation } = useLanguageStore();
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState('');

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('page.hotel_info.title');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  useEffect(() => {
    loadHotelInfo();
  }, []);

  const loadHotelInfo = async () => {
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

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/hotel/info`, {
        headers: {
          'x-tenant': tenantSlug,
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded hotel info:', JSON.stringify(data, null, 2));
        setHotelInfo({
          ...data,
          activityImages: Array.isArray(data.activityImages) && data.activityImages.length > 0
            ? data.activityImages
            : DEFAULT_ACTIVITY_IMAGES
        });
      } else {
        console.error('Failed to load hotel info');
      }
    } catch (error) {
      console.error('Error loading hotel info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hotelInfo) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);
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
      
      console.log('Saving hotel info:', JSON.stringify(hotelInfo, null, 2));
      
      const payload = { ...hotelInfo };
      if (!payload.activityImages || payload.activityImages.length === 0) {
        payload.activityImages = DEFAULT_ACTIVITY_IMAGES;
      }
      const response = await fetch(`${API_BASE_URL}/api/hotel/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': tenantSlug,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Save response:', responseData);
        setSaveMessage('Bilgiler başarıyla kaydedildi!');
        // Veriyi yeniden yükle
        await loadHotelInfo();
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        setSaveMessage(`Hata: ${errorData.message || 'Kayıt başarısız'}`);
      }
    } catch (error) {
      console.error('Error saving hotel info:', error);
      setSaveMessage('Kayıt sırasında bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && hotelInfo) {
      setHotelInfo({
        ...hotelInfo,
        amenities: [...hotelInfo.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    if (hotelInfo) {
      setHotelInfo({
        ...hotelInfo,
        amenities: hotelInfo.amenities.filter((_, i) => i !== index)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{getTranslation('hotel_info.loading')}</p>
        </div>
      </div>
    );
  }

  if (!hotelInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">{getTranslation('hotel_info.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTranslation('page.hotel_info.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{getTranslation('page.hotel_info.subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? getTranslation('common.loading') : getTranslation('hotel_info.save')}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-lg ${saveMessage.includes('Hata') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {saveMessage}
        </div>
      )}

      {/* WiFi Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wifi className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{getTranslation('hotel_info.wifi_internet')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.network_name')}</label>
            <input
              type="text"
              value={hotelInfo.wifi.networkName}
              onChange={(e) => setHotelInfo({ ...hotelInfo, wifi: { ...hotelInfo.wifi, networkName: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.password')}</label>
            <input
              type="text"
              value={hotelInfo.wifi.password}
              onChange={(e) => setHotelInfo({ ...hotelInfo, wifi: { ...hotelInfo.wifi, password: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.speed')}</label>
            <input
              type="text"
              value={hotelInfo.wifi.speed}
              onChange={(e) => setHotelInfo({ ...hotelInfo, wifi: { ...hotelInfo.wifi, speed: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.tech_support_phone')}</label>
            <input
              type="text"
              value={hotelInfo.wifi.supportPhone}
              onChange={(e) => setHotelInfo({ ...hotelInfo, wifi: { ...hotelInfo.wifi, supportPhone: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Çalışma Saatleri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{getTranslation('hotel_info.working_hours')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.reception')}</label>
            <input
              type="text"
              value={hotelInfo.hours.reception}
              onChange={(e) => setHotelInfo({ ...hotelInfo, hours: { ...hotelInfo.hours, reception: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.restaurant')}</label>
            <input
              type="text"
              value={hotelInfo.hours.restaurant}
              onChange={(e) => setHotelInfo({ ...hotelInfo, hours: { ...hotelInfo.hours, restaurant: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.bar')}</label>
            <input
              type="text"
              value={hotelInfo.hours.bar}
              onChange={(e) => setHotelInfo({ ...hotelInfo, hours: { ...hotelInfo.hours, bar: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.spa')}</label>
            <input
              type="text"
              value={hotelInfo.hours.spa}
              onChange={(e) => setHotelInfo({ ...hotelInfo, hours: { ...hotelInfo.hours, spa: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Yemek & İçecek */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Yemek & İçecek</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kahvaltı</label>
            <input
              type="text"
              value={hotelInfo.dining.breakfast}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, breakfast: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.lunch')}</label>
            <input
              type="text"
              value={hotelInfo.dining.lunch}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, lunch: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.dinner')}</label>
            <input
              type="text"
              value={hotelInfo.dining.dinner}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, dinner: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.room_service')}</label>
            <input
              type="text"
              value={hotelInfo.dining.roomService}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, roomService: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.towel_change')}</label>
            <input
              type="text"
              value={hotelInfo.dining.towelChange}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, towelChange: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.tech_support')}</label>
            <input
              type="text"
              value={hotelInfo.dining.techSupport}
              onChange={(e) => setHotelInfo({ ...hotelInfo, dining: { ...hotelInfo.dining, techSupport: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Otel Olanakları */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{getTranslation('hotel_info.amenities')}</h2>
        </div>
        <div className="space-y-2 mb-4">
          {hotelInfo.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={amenity}
                onChange={(e) => {
                  const newAmenities = [...hotelInfo.amenities];
                  newAmenities[index] = e.target.value;
                  setHotelInfo({ ...hotelInfo, amenities: newAmenities });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeAmenity(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
            placeholder={getTranslation('common.add') + '..."'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addAmenity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {getTranslation('common.add')}
          </button>
        </div>
      </div>

      {/* Otel Aktivite Görselleri - Misafir sayfasında hoş geldiniz altında gösterilir */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Otel Aktivite Görselleri</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">Misafir arayüzünde hoş geldiniz mesajı ile hizmet butonları arasında gösterilir. Görsel URL’leri Unsplash veya kendi linkleriniz olabilir.</p>
        <div className="space-y-4">
          {(hotelInfo.activityImages || DEFAULT_ACTIVITY_IMAGES).map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const next = [...(hotelInfo.activityImages || DEFAULT_ACTIVITY_IMAGES)];
                      next[index] = { ...next[index], title: e.target.value };
                      setHotelInfo({ ...hotelInfo, activityImages: next });
                    }}
                    placeholder="Örn: Spa, Hamam"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Görsel URL (Unsplash vb.)</label>
                  <input
                    type="url"
                    value={item.imageUrl}
                    onChange={(e) => {
                      const next = [...(hotelInfo.activityImages || DEFAULT_ACTIVITY_IMAGES)];
                      next[index] = { ...next[index], imageUrl: e.target.value };
                      setHotelInfo({ ...hotelInfo, activityImages: next });
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    const next = (hotelInfo.activityImages || DEFAULT_ACTIVITY_IMAGES).filter((_, i) => i !== index);
                    setHotelInfo({ ...hotelInfo, activityImages: next.length ? next : DEFAULT_ACTIVITY_IMAGES });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const current = hotelInfo.activityImages || DEFAULT_ACTIVITY_IMAGES;
            setHotelInfo({
              ...hotelInfo,
              activityImages: [...current, { title: 'Yeni Aktivite', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' }]
            });
          }}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Görsel Ekle
        </button>
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{getTranslation('hotel_info.contacts')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.reception')}</label>
            <input
              type="text"
              value={hotelInfo.contacts.reception}
              onChange={(e) => setHotelInfo({ ...hotelInfo, contacts: { ...hotelInfo.contacts, reception: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.security')}</label>
            <input
              type="text"
              value={hotelInfo.contacts.security}
              onChange={(e) => setHotelInfo({ ...hotelInfo, contacts: { ...hotelInfo.contacts, security: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('hotel_info.concierge')}</label>
            <input
              type="text"
              value={hotelInfo.contacts.concierge}
              onChange={(e) => setHotelInfo({ ...hotelInfo, contacts: { ...hotelInfo.contacts, concierge: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

