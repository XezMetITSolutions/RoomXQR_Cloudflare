"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaConciergeBell,
  FaWifi,
  FaBroom,
  FaHeadset,
  FaStar,
  FaBell,
  FaBed,
  FaTooth,
  FaShoePrints,
  FaSoap,
  FaWater,
  FaSwimmingPool,
  FaWineBottle,
  FaInstagram,
  FaGoogle,
  FaFacebook
} from "react-icons/fa";
import { ApiService } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { useSocialMediaStore } from '@/store/socialMediaStore';
import { useLanguageStore, languages } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { Globe, ChevronDown } from 'lucide-react';

const DEFAULT_ACTIVITY_IMAGES = [
  { title: 'Spa', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
  { title: 'Hamam', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80' },
  { title: 'Havuz', imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80' },
  { title: 'Fitness', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { title: 'Restoran', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' }
];

interface GuestInterfaceClientProps {
  roomId: string;
  initialLang?: string;
  /** Eski linkler için: URL'de ?guest= ile gelen isim (oda bağlı değil) */
  guestName?: string;
  /** Oda bağlı token: sadece bu oda için isim gösterilir; link 102 yapılırsa isim görünmez */
  guestToken?: string;
}

/** Misafir adından "Sayın Ad S." formatı üretir (örn: Leyla Yılmaz -> Sayın Leyla Y.) */
function formatGuestGreeting(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return `Sayın ${parts[0]}`;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `Sayın ${firstName} ${lastInitial}.`;
}

export default function GuestInterfaceClient({ roomId, initialLang, guestName, guestToken }: GuestInterfaceClientProps) {
  const router = useRouter();
  const [showSurvey, setShowSurvey] = useState(false);
  /** Token doğrulandıktan sonra sadece oda eşleşirse dolu; yoksa legacy guestName kullanılır */
  const [resolvedGuestName, setResolvedGuestName] = useState<string | undefined>(undefined);
  const [guestNameResolved, setGuestNameResolved] = useState(false);
  // Guest info artık kullanılmıyor - soyisim sorusu kaldırıldı
  const [hotelName, setHotelName] = useState<string>('');
  const [activityImages, setActivityImages] = useState<{ title: string; imageUrl: string }[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const { addNotification } = useNotifications();

  // Dil store'u
  const { currentLanguage, setLanguage, getTranslation, getCurrentLanguage, getSupportedLanguages } = useLanguageStore();

  // URL'den gelen dili ayarla
  useEffect(() => {
    if (initialLang && ['tr', 'en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'zh'].includes(initialLang)) {
      setLanguage(initialLang);
    }
  }, [initialLang, setLanguage]);

  // Sabit QR (Permanent Key) Mantığı: Token yoksa bile odadaki aktif misafiri bul
  useEffect(() => {
    const numericRoomId = roomId.replace(/^room-/, '');
    const tenant = typeof window !== 'undefined' ? (() => {
      const h = window.location.hostname.split('.')[0];
      return h && h !== 'www' && h !== 'roomxqr' && h !== 'roomxqr-backend' ? h : 'demo';
    })() : 'demo';

    if (guestToken) {
      // 1. Durum: Tokenlı Link (Dinamik/Güvenli)
      fetch(`/api/guest-token/verify?token=${encodeURIComponent(guestToken)}&roomId=${encodeURIComponent(numericRoomId)}`, {
        headers: { 'x-tenant': tenant },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d && d.guestName) setResolvedGuestName(d.guestName);
          setGuestNameResolved(true);
        })
        .catch(() => setGuestNameResolved(true));
    } else {
      // 2. Durum: Sabit QR (Permanent Key) - Odadaki aktif misafiri sorgula
      fetch(`/api/rooms/${numericRoomId}/active-guest`, {
        headers: { 'x-tenant': tenant },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d && d.guestName) {
            setResolvedGuestName(d.guestName);
          } else if (guestName) {
            // Legacy/Fallback desteği
            setResolvedGuestName(guestName);
          }
          setGuestNameResolved(true);
        })
        .catch(() => {
          if (guestName) setResolvedGuestName(guestName);
          setGuestNameResolved(true);
        });
    }
  }, [guestToken, roomId, guestName]);

  const displayGuestName = guestNameResolved ? resolvedGuestName : undefined;

  const supportedLanguages = getSupportedLanguages();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Theme store'u - hook'ları component'in başında çağır
  const theme = useThemeStore();

  // Güvenli çeviri fonksiyonu
  const safeGetTranslation = (key: string, fallback: string = '') => {
    try {
      return getTranslation ? getTranslation(key) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  // Otel adını yükle
  useEffect(() => {
    const loadHotelName = async () => {
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

        const response = await fetch(`${API_BASE_URL}/api/hotel/info`, {
          headers: {
            'x-tenant': tenantSlug
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.name) {
            setHotelName(data.name);
          }
          if (Array.isArray(data.activityImages) && data.activityImages.length > 0) {
            setActivityImages(data.activityImages);
          } else {
            setActivityImages(DEFAULT_ACTIVITY_IMAGES);
          }
        } else {
          setActivityImages(DEFAULT_ACTIVITY_IMAGES);
        }
      } catch (error) {
        console.error('Error loading hotel name:', error);
        setActivityImages(DEFAULT_ACTIVITY_IMAGES);
      }
    };

    loadHotelName();
  }, []);

  // Slideshow: aktivite görselleri sürekli döner
  const activityList = activityImages.length > 0 ? activityImages : DEFAULT_ACTIVITY_IMAGES;
  useEffect(() => {
    if (activityList.length <= 1) return;
    const t = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activityList.length);
    }, 4000);
    return () => clearInterval(t);
  }, [activityList.length]);

  // Hydration kontrolü
  useEffect(() => {
    setIsHydrated(true);
    // RoomId'yi localStorage'a kaydet (geri dönüş için)
    localStorage.setItem('currentRoomId', roomId);
  }, [roomId]);

  // Dil seçici dropdown'ı dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-selector')) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelector]);





  // Misafir bilgileri artık yüklenmiyor - soyisim sorusu kaldırıldı

  // Otel adına göre hoş geldiniz mesajı formatla (Türkçe dilbilgisi: e/a ekleme)
  const formatWelcomeMessage = (name: string, lang: string = 'tr'): string => {
    if (!name) return safeGetTranslation('room.welcome', 'Hoş Geldiniz');

    // Türkçe dışındaki dillerde sadece "Welcome to {name}" formatı kullan
    if (lang !== 'tr') {
      const welcomeText = safeGetTranslation('room.welcome', 'Welcome');
      return `${welcomeText} ${name}`;
    }

    // Türkçe için dilbilgisi kurallarına göre formatla
    const trimmedName = name.trim();
    const lastChar = trimmedName.slice(-1).toLowerCase();
    const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];

    // Son harf sesli ise "ye" veya "ya" ekle
    if (vowels.includes(lastChar)) {
      // Kalın sesliler: a, ı, o, u -> "ya"
      // İnce sesliler: e, i, ö, ü -> "ye"
      if (lastChar === 'a' || lastChar === 'ı' || lastChar === 'o' || lastChar === 'u') {
        return `${trimmedName}'ya Hoş Geldiniz`;
      } else {
        return `${trimmedName}'ye Hoş Geldiniz`;
      }
    } else {
      // Sessiz harf ise, kelimedeki son sesli harfe göre "e" veya "a" ekle
      const nameLower = trimmedName.toLowerCase();
      let lastVowel = null;
      for (let i = nameLower.length - 1; i >= 0; i--) {
        if (vowels.includes(nameLower[i])) {
          lastVowel = nameLower[i];
          break;
        }
      }

      // Son sesli harf kalın ise "a", ince ise "e"
      if (lastVowel === 'a' || lastVowel === 'ı' || lastVowel === 'o' || lastVowel === 'u') {
        return `${trimmedName}'a Hoş Geldiniz`;
      } else {
        return `${trimmedName}'e Hoş Geldiniz`;
      }
    }
  };

  // Hoş geldiniz bildirimi - sadece ilk kez
  useEffect(() => {
    const fullRoomId = roomId;
    const welcomeKey = `welcome_shown_${fullRoomId}`;

    // Bu oda için hoş geldiniz bildirimi daha önce gösterildi mi?
    const hasShownWelcome = localStorage.getItem(welcomeKey);

    // Otel adı yüklendikten sonra hoş geldiniz mesajını göster
    if (!hasShownWelcome && hotelName) {
      const timer = setTimeout(() => {
        const welcomeMessage = formatWelcomeMessage(hotelName);

        addNotification('info', welcomeMessage, 'Resepsiyon ekibimiz 7/24 hizmetinizdedir. İsteklerinizi buradan gönderebilirsiniz.', false, true, 5000);

        // Bu oda için hoş geldiniz bildirimi gösterildi olarak işaretle
        localStorage.setItem(welcomeKey, 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hotelName, roomId, addNotification]);

  // Sayfa başlığını otel adı ile güncelle
  useEffect(() => {
    if (hotelName) {
      const title = formatWelcomeMessage(hotelName);
      document.title = title;
    } else {
      document.title = 'Hoş Geldiniz';
    }
  }, [hotelName]);


  if (showSurvey) {
    return <SurveyModal roomId={roomId} onClose={() => setShowSurvey(false)} onSurveySent={(message) => addNotification('success', safeGetTranslation('notifications.survey_title', 'Değerlendirme'), message)} />;
  }

  // Hydration kontrolü - client-side rendering bekleniyor
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 relative" style={{ background: theme.backgroundColor }}>
        <div className="w-full max-w-md px-4 mb-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textColor }}>
              {hotelName
                ? formatWelcomeMessage(hotelName, currentLanguage)
                : safeGetTranslation('room.welcome', 'Hoş Geldiniz')
              }
            </h1>
            {displayGuestName && (
              <p className="text-sm sm:text-base mt-1 opacity-90" style={{ color: theme.textColor }}>
                {formatGuestGreeting(displayGuestName)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg shadow-sm" style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
                <Globe className="w-4 h-4" style={{ color: theme.textColor }} />
                <span className="text-sm font-medium" style={{ color: theme.textColor }}>🇹🇷</span>
                <ChevronDown className="w-4 h-4" style={{ color: theme.textColor }} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mb-4 px-4">
          <div className="rounded-lg p-4" style={{ background: `${theme.secondaryColor}20`, border: `1px solid ${theme.secondaryColor}40` }}>
            <div className="text-center" style={{ color: theme.secondaryColor }}>Yükleniyor...</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mb-4 px-4">
          <div className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow" style={{ background: `${theme.primaryColor}20` }}>
            <FaConciergeBell className="text-2xl sm:text-3xl mb-2" style={{ color: theme.primaryColor }} />
            <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>Oda Servisi</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow" style={{ background: `${theme.accentColor}20` }}>
            <FaWifi className="text-2xl sm:text-3xl mb-2" style={{ color: theme.accentColor }} />
            <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>WiFi</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow" style={{ background: `${theme.secondaryColor}20` }}>
            <FaBroom className="text-2xl sm:text-3xl mb-2" style={{ color: theme.secondaryColor }} />
            <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>Temizlik</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow" style={{ background: `${theme.primaryColor}20` }}>
            <FaHeadset className="text-2xl sm:text-3xl mb-2" style={{ color: theme.primaryColor }} />
            <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>Konsiyerj</span>
          </div>
        </div>

        <button className="w-full max-w-md text-white rounded-xl p-3 sm:p-4 shadow-lg mb-4 sm:mb-6 mx-4" style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)` : theme.primaryColor }}>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <FaStar className="text-xl sm:text-2xl" />
            <span className="text-base sm:text-lg font-semibold">Anket</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 relative" style={{ background: theme.backgroundColor }}>

      {/* Header */}
      <div className="w-full max-w-md px-4 mb-4 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.textColor }}>
            {hotelName
              ? formatWelcomeMessage(hotelName, currentLanguage)
              : safeGetTranslation('room.welcome', 'Hoş Geldiniz')
            }
          </h1>
          {displayGuestName && (
            <p className="text-sm sm:text-base mt-1 opacity-90" style={{ color: theme.textColor }}>
              {formatGuestGreeting(displayGuestName)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dil Seçici */}
          <div className="relative language-selector">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg shadow-sm transition-colors"
              style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}
            >
              <Globe className="w-4 h-4" style={{ color: theme.textColor }} />
              <span className="text-sm font-medium" style={{ color: theme.textColor }}>
                {getCurrentLanguage().flag}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: theme.textColor }} />
            </button>

            {/* Dil Seçenekleri Dropdown */}
            {showLanguageSelector && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg z-50" style={{ background: theme.cardBackground, border: `1px solid ${theme.borderColor}` }}>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageSelector(false);
                      // URL'i güncelle
                      const roomNumber = roomId.replace('room-', '');
                      router.push(`/${lang.code}/guest/${roomNumber}`);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${currentLanguage === lang.code ? 'opacity-80' : ''
                      }`}
                    style={{
                      background: currentLanguage === lang.code ? `${theme.primaryColor}20` : 'transparent',
                      color: theme.textColor
                    }}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs opacity-70">{lang.nativeName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Üstte sürekli dönen slideshow - yazısız tek görsel */}
      <div className="w-full max-w-md mb-4 px-4">
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: theme.borderColor }}>
          {activityList.map((item, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: idx === slideIndex ? 1 : 0, zIndex: idx === slideIndex ? 1 : 0 }}
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Duyuru Banner */}
      <div className="w-full max-w-md mb-4 px-4">
        <AnnouncementBanner roomId={roomId} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mb-4 px-4">
        {/* Oda Servisi */}
        <button
          className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow hover:scale-105 transition"
          style={{ background: `${theme.primaryColor}20` }}
          onClick={() => {
            // Oda numarasını localStorage'a kaydet ve query parameter olarak ekle
            const roomNumber = roomId.replace('room-', '');
            localStorage.setItem('currentRoomId', roomId);
            router.push(`/qr-menu?roomId=${roomNumber}`);
          }}
        >
          <FaConciergeBell className="text-2xl sm:text-3xl mb-2" style={{ color: theme.primaryColor }} />
          <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>{safeGetTranslation('room.room_service', 'Oda Servisi')}</span>
        </button>
        {/* Bilgi & Wifi */}
        <button
          className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow hover:scale-105 transition"
          style={{ background: `${theme.accentColor}20` }}
          onClick={() => router.push('/bilgi')}
        >
          <FaWifi className="text-2xl sm:text-3xl mb-2" style={{ color: theme.accentColor }} />
          <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>{safeGetTranslation('room.wifi', 'Bilgi & Wifi')}</span>
        </button>
        {/* Oda Temizliği */}
        <button
          className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow hover:scale-105 transition"
          style={{ background: `${theme.secondaryColor}20` }}
          onClick={async () => {
            try {
              await ApiService.createGuestRequest({
                roomId: roomId,
                type: 'housekeeping',
                priority: 'medium',
                status: 'pending',
                description: safeGetTranslation('notifications.housekeeping_description', 'Oda temizliği talep edildi'),
              });
              addNotification('success', safeGetTranslation('notifications.housekeeping_title', 'Temizlik Talebi'), safeGetTranslation('notifications.housekeeping_message', 'Oda temizliği talebiniz resepsiyona iletildi. En kısa sürede yanıtlanacaktır.'));
            } catch (error) {
              addNotification('success', safeGetTranslation('notifications.housekeeping_title', 'Temizlik Talebi'), safeGetTranslation('notifications.housekeeping_message', 'Oda temizliği talebiniz resepsiyona iletildi. En kısa sürede yanıtlanacaktır.'));
            }
          }}
        >
          <FaBroom className="text-2xl sm:text-3xl mb-2" style={{ color: theme.secondaryColor }} />
          <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>{safeGetTranslation('room.housekeeping', 'Oda Temizliği')}</span>
        </button>
        {/* Konsiyerj - yeni sayfaya yönlendir */}
        <button
          className="flex flex-col items-center justify-center rounded-xl p-4 sm:p-6 shadow hover:scale-105 transition"
          style={{ background: `${theme.primaryColor}20` }}
          onClick={() => {
            const roomNumber = roomId.replace('room-', '');
            router.push(`/concierge?roomId=${roomNumber}`);
          }}
        >
          <FaHeadset className="text-2xl sm:text-3xl mb-2" style={{ color: theme.primaryColor }} />
          <span className="font-medium text-sm sm:text-base" style={{ color: theme.textColor }}>{safeGetTranslation('room.concierge', 'Konsiyerj')}</span>
        </button>
      </div>

      {/* Bizi Puanla Butonu */}
      <button
        onClick={() => setShowSurvey(true)}
        className="w-full max-w-md text-white rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mb-4 sm:mb-6 mx-4"
        style={{ background: theme.gradientColors?.length ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)` : theme.primaryColor }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <FaStar className="text-xl sm:text-2xl" />
          <span className="text-base sm:text-lg font-semibold">{safeGetTranslation('room.survey', 'Bizi Puanla')}</span>
        </div>
      </button>

      {/* Diğer İstekler Alanı */}
      <DigerIstekler onRequestSent={(message) => addNotification('info', safeGetTranslation('notifications.general_request_title', 'Genel Talep'), message, true, true, 5000)} roomId={roomId} />

    </div>
  );
}

function DigerIstekler({ onRequestSent, roomId }: { onRequestSent: (message: string) => void; roomId: string }) {
  const { getTranslation } = useLanguageStore();
  const theme = useThemeStore();
  const [istek, setIstek] = useState("");
  const [miktar, setMiktar] = useState(1);
  const [selectedItem, setSelectedItem] = useState("");

  // Güvenli çeviri fonksiyonu
  const safeGetTranslation = (key: string, fallback: string = '') => {
    try {
      return getTranslation ? getTranslation(key) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  // Hızlı seçim öğeleri
  const quickItems = [
    { name: "Havlu", nameKey: "quick.towel", emoji: "🛁", color: "text-blue-600" },
    { name: "Terlik", nameKey: "quick.slippers", emoji: "🥿", color: "text-green-600" },
    { name: "Diş Macunu", nameKey: "quick.toothpaste", emoji: "🦷", color: "text-purple-600" },
    { name: "Yastık", nameKey: "quick.pillow", emoji: "🛏️", color: "text-pink-600" },
    { name: "Battaniye", nameKey: "quick.blanket", emoji: "🛌", color: "text-indigo-600" },
    { name: "Şampuan", nameKey: "quick.shampoo", emoji: "🧴", color: "text-orange-600" },
    { name: "Sabun", nameKey: "quick.soap", emoji: "🧼", color: "text-teal-600" },
    { name: "Su", nameKey: "quick.water", emoji: "💧", color: "text-cyan-600" }
  ];

  const handleQuickSelect = (item: string) => {
    setSelectedItem(item);
    setIstek(`${miktar} adet ${item}`);
  };

  // Miktar değiştiğinde istek alanını güncelle
  useEffect(() => {
    if (selectedItem) {
      setIstek(`${miktar} adet ${selectedItem}`);
    }
  }, [miktar, selectedItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!istek.trim()) return;

    console.log('Gönderilen istek:', istek);
    console.log('Miktar:', miktar);
    console.log('Seçili öğe:', selectedItem);
    console.log('RoomId format:', roomId);

    try {
      // İstek içeriğine göre priority belirle
      let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
      let type: 'housekeeping' | 'maintenance' | 'concierge' | 'general' | 'food_order' = 'general';

      if (istek.toLowerCase().includes('acil') || istek.toLowerCase().includes('urgent') || istek.toLowerCase().includes('arıza')) {
        priority = 'urgent';
        type = 'maintenance';
      } else if (istek.toLowerCase().includes('temizlik') || istek.toLowerCase().includes('temizle')) {
        priority = 'medium';
        type = 'housekeeping';
      } else if (istek.toLowerCase().includes('konsiyerj') || istek.toLowerCase().includes('concierge') || istek.toLowerCase().includes('rezervasyon') || istek.toLowerCase().includes('transfer')) {
        priority = 'medium';
        type = 'concierge';
      }

      console.log('İstek priority ve type:', { priority, type, istek });

      // API'ye talep gönder
      await ApiService.createGuestRequest({
        roomId: roomId, // roomId zaten 'room-102' formatında
        type: type,
        priority: priority,
        status: 'pending',
        description: istek,
      });

      onRequestSent(`"${istek}" talebiniz resepsiyona iletildi. En kısa sürede yanıtlanacaktır.`);
    } catch (error) {
      console.error('Error creating request:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      const is404 = typeof errMsg === 'string' && (errMsg.includes('404') || errMsg.includes('Tenant'));
      onRequestSent(
        is404
          ? 'Otel sistemi şu an tanımlı değil. Lütfen resepsiyonu arayın veya daha sonra tekrar deneyin.'
          : 'Talep gönderilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin veya resepsiyonu arayın.'
      );
    }

    setIstek("");
    setSelectedItem("");
    setMiktar(1);
  };

  return (
    <div className="w-full max-w-md mx-4 mt-2">
      {/* Hızlı Seçim Butonları */}
      <div className="mb-3">
        <p className="text-xs sm:text-sm mb-2 px-1" style={{ color: theme.textColor }}>{safeGetTranslation('room.quick_select', 'Hızlı seçim')}:</p>
        <div className="grid grid-cols-4 gap-2">
          {quickItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleQuickSelect(item.name)}
              className={`p-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${selectedItem === item.name ? 'shadow-md' : ''
                }`}
              style={{
                background: selectedItem === item.name ? theme.primaryColor : theme.borderColor,
                color: selectedItem === item.name ? 'white' : theme.textColor
              }}
            >
              <div className="flex justify-center mb-1">
                <span className="text-sm sm:text-base">{item.emoji}</span>
              </div>
              <div className="font-medium">{safeGetTranslation(item.nameKey, item.name)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Miktar Seçimi */}
      {selectedItem && (
        <div className="mb-3 rounded-lg p-3" style={{ background: `${theme.secondaryColor}20` }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: theme.textColor }}>
              {selectedItem} miktarı:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMiktar(Math.max(1, miktar - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                style={{ background: theme.borderColor, color: theme.textColor }}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold" style={{ color: theme.textColor }}>{miktar}</span>
              <button
                onClick={() => setMiktar(Math.min(10, miktar + 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                style={{ background: theme.borderColor, color: theme.textColor }}
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: theme.textColor }}>
            Seçili: {miktar} adet {selectedItem}
          </p>
        </div>
      )}

      {/* İstek Formu */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl shadow p-3 sm:p-4 flex items-center gap-2"
        style={{ background: theme.cardBackground }}
      >
        <input
          type="text"
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base"
          style={{
            background: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.borderColor}`,
            boxShadow: 'none'
          }}
          placeholder={selectedItem ? `${miktar} ${safeGetTranslation('room.quantity', 'adet')} ${selectedItem}` : safeGetTranslation('room.request_details', 'Lütfen isteğinizi yazınız...')}
          value={istek}
          onChange={(e) => {
            const value = e.target.value;
            setIstek(value);

            if (value === "") {
              setSelectedItem("");
              setMiktar(1);
            } else {
              // Manuel girişte miktar kontrolü yap
              const miktarMatch = value.match(/^(\d+)\s+adet\s+(.+)$/);
              if (miktarMatch) {
                const [, miktarStr, itemName] = miktarMatch;
                const extractedMiktar = parseInt(miktarStr);
                if (extractedMiktar >= 1 && extractedMiktar <= 10) {
                  setMiktar(extractedMiktar);
                  setSelectedItem(itemName.trim());
                }
              }
            }
          }}
          maxLength={200}
        />
        <button
          type="submit"
          className="flex items-center gap-1 sm:gap-2 font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
          style={{ background: theme.primaryColor, color: 'white' }}
        >
          <FaBell className="text-sm sm:text-lg" />
          <span className="hidden sm:inline">{safeGetTranslation('room.send_request', 'Çağrı Oluştur')}</span>
          <span className="sm:hidden">{safeGetTranslation('room.send_request', 'Çağrı')}</span>
        </button>
      </form>
    </div>
  );
}

function SurveyModal({ roomId, onClose, onSurveySent }: { roomId: string; onClose: () => void; onSurveySent: (message: string) => void }) {
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    service: 0,
    staff: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sosyal medya linklerini store'dan al
  const { getLink } = useSocialMediaStore();

  // Dil store'u ve güvenli çeviri fonksiyonu
  const { getTranslation } = useLanguageStore();
  const theme = useThemeStore();

  const safeGetTranslation = (key: string, fallback: string = '') => {
    try {
      return getTranslation ? getTranslation(key) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const handleRating = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      onSurveySent(safeGetTranslation('notifications.survey_thank_you', 'Yorumunuz için teşekkür ederiz! Geri bildiriminiz bizim için çok değerli.'));
    }, 2000);
  };

  const handleGoogleReview = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=hotel', '_blank');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8" style={{ background: theme.backgroundColor }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${theme.accentColor}20` }}>
            <FaStar className="w-10 h-10" style={{ color: theme.accentColor }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textColor }}>{safeGetTranslation('survey.thank_you', 'Teşekkürler!')}</h2>
          <p style={{ color: theme.textColor }}>{safeGetTranslation('survey.submitted', 'Değerlendirmeniz başarıyla gönderildi.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8" style={{ background: theme.backgroundColor }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl p-6" style={{ background: theme.cardBackground }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.textColor }}>{safeGetTranslation('survey.title', 'Bizi Değerlendirin')}</h1>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: theme.borderColor }}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Temizlik */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{safeGetTranslation('survey.cleanliness', 'Temizlik')}</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating('cleanliness', star)}
                  className="text-3xl transition-colors"
                >
                  <FaStar className={star <= ratings.cleanliness ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Puan: {ratings.cleanliness > 0 ? ratings.cleanliness : 'Seçilmedi'}
            </div>
            <div className="mt-2">
              <select
                value={ratings.cleanliness || ''}
                onChange={(e) => handleRating('cleanliness', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Puan seçin</option>
                <option value="1.0">1.0 ⭐ (Temel)</option>
                <option value="1.5">1.5 ⭐ (Temel+)</option>
                <option value="2.0">2.0 ⭐⭐ (Orta)</option>
                <option value="2.5">2.5 ⭐⭐ (Orta+)</option>
                <option value="3.0">3.0 ⭐⭐⭐ (İyi)</option>
                <option value="3.5">3.5 ⭐⭐⭐ (İyi+)</option>
                <option value="4.0">4.0 ⭐⭐⭐⭐ (Çok İyi)</option>
                <option value="4.5">4.5 ⭐⭐⭐⭐ (Çok İyi+)</option>
                <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Mükemmel)</option>
              </select>
            </div>
          </div>

          {/* Oda Servisi */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{safeGetTranslation('survey.service', 'Oda Servisi')}</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating('service', star)}
                  className="text-3xl transition-colors"
                >
                  <FaStar className={star <= ratings.service ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Puan: {ratings.service > 0 ? ratings.service : 'Seçilmedi'}
            </div>
            <div className="mt-2">
              <select
                value={ratings.service || ''}
                onChange={(e) => handleRating('service', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Puan seçin</option>
                <option value="1.0">1.0 ⭐ (Temel)</option>
                <option value="1.5">1.5 ⭐ (Temel+)</option>
                <option value="2.0">2.0 ⭐⭐ (Orta)</option>
                <option value="2.5">2.5 ⭐⭐ (Orta+)</option>
                <option value="3.0">3.0 ⭐⭐⭐ (İyi)</option>
                <option value="3.5">3.5 ⭐⭐⭐ (İyi+)</option>
                <option value="4.0">4.0 ⭐⭐⭐⭐ (Çok İyi)</option>
                <option value="4.5">4.5 ⭐⭐⭐⭐ (Çok İyi+)</option>
                <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Mükemmel)</option>
              </select>
            </div>
          </div>

          {/* Personel */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{safeGetTranslation('survey.staff', 'Personel')}</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating('staff', star)}
                  className="text-3xl transition-colors"
                >
                  <FaStar className={star <= ratings.staff ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Puan: {ratings.staff > 0 ? ratings.staff : 'Seçilmedi'}
            </div>
            <div className="mt-2">
              <select
                value={ratings.staff || ''}
                onChange={(e) => handleRating('staff', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Puan seçin</option>
                <option value="1.0">1.0 ⭐ (Temel)</option>
                <option value="1.5">1.5 ⭐ (Temel+)</option>
                <option value="2.0">2.0 ⭐⭐ (Orta)</option>
                <option value="2.5">2.5 ⭐⭐ (Orta+)</option>
                <option value="3.0">3.0 ⭐⭐⭐ (İyi)</option>
                <option value="3.5">3.5 ⭐⭐⭐ (İyi+)</option>
                <option value="4.0">4.0 ⭐⭐⭐⭐ (Çok İyi)</option>
                <option value="4.5">4.5 ⭐⭐⭐⭐ (Çok İyi+)</option>
                <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Mükemmel)</option>
              </select>
            </div>
          </div>

          {/* Genel Memnuniyet */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{safeGetTranslation('survey.overall', 'Genel Memnuniyet')}</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating('overall', star)}
                  className="text-3xl transition-colors"
                >
                  <FaStar className={star <= ratings.overall ? 'text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Puan: {ratings.overall > 0 ? ratings.overall : 'Seçilmedi'}
            </div>
            <div className="mt-2">
              <select
                value={ratings.overall || ''}
                onChange={(e) => handleRating('overall', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Puan seçin</option>
                <option value="1.0">1.0 ⭐ (Temel)</option>
                <option value="1.5">1.5 ⭐ (Temel+)</option>
                <option value="2.0">2.0 ⭐⭐ (Orta)</option>
                <option value="2.5">2.5 ⭐⭐ (Orta+)</option>
                <option value="3.0">3.0 ⭐⭐⭐ (İyi)</option>
                <option value="3.5">3.5 ⭐⭐⭐ (İyi+)</option>
                <option value="4.0">4.0 ⭐⭐⭐⭐ (Çok İyi)</option>
                <option value="4.5">4.5 ⭐⭐⭐⭐ (Çok İyi+)</option>
                <option value="5.0">5.0 ⭐⭐⭐⭐⭐ (Mükemmel)</option>
              </select>
            </div>
          </div>

          {/* Yorum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {safeGetTranslation('survey.comment', 'Eklemek istedikleriniz (İsteğe bağlı)')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={safeGetTranslation('survey.comment_placeholder', 'Görüşlerinizi buraya yazabilirsiniz...')}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!ratings.overall}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${ratings.overall ? 'hover:shadow-lg hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
              }`}
            style={{ background: theme.primaryColor }}
          >
            {safeGetTranslation('survey.submit', 'Değerlendirmeyi Gönder')}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">
              {safeGetTranslation('survey.social_media', 'Bizi sosyal medyada takip edin')}
            </p>
            <div className="flex justify-center space-x-4">
              {getLink('instagram') && (
                <a
                  href={getLink('instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                >
                  <FaInstagram className="text-xl" />
                </a>
              )}
              {getLink('google') && (
                <a
                  href={getLink('google')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <FaGoogle className="text-xl" />
                </a>
              )}
              {getLink('facebook') && (
                <a
                  href={getLink('facebook')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  <FaFacebook className="text-xl" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}