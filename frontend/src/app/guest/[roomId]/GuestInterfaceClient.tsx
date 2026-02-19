"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Globe, ChevronDown, Home, LayoutGrid, Settings, Utensils, Wifi, Sparkles, Headset } from 'lucide-react';

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

/** Sadece isim formatlar: Mete B. */
function formatGuestNameOnly(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/** Tam karşılama mesajı: Sayın Mete B. Otel'e Hoş Geldiniz / Welcome to Otel, Mete B. */
function getWelcomeMessageWithGuest(guestName: string, hotelName: string, lang: string): string {
  const formattedName = formatGuestNameOnly(guestName);

  switch (lang) {
    case 'tr':
      return `Sayın ${formattedName} ${hotelWelcomeSuffix(hotelName)}`;
    case 'de':
      return `Willkommen im ${hotelName}, ${formattedName}`; // Basit ve samimi
    case 'ru':
      return `Добро пожаловать в ${hotelName}, ${formattedName}`;
    case 'fr':
      return `Bienvenue à ${hotelName}, ${formattedName}`;
    case 'es':
      return `Bienvenido a ${hotelName}, ${formattedName}`;
    case 'it':
      return `Benvenuti al ${hotelName}, ${formattedName}`;
    default: // en ve diğerleri
      return `Welcome to ${hotelName}, ${formattedName}`;
  }
}

/** Otel adına göre "X Oteline hoş geldiniz" eki (Türkçe sesli uyum) */
function hotelWelcomeSuffix(hotelName: string): string {
  if (!hotelName || !hotelName.trim()) return 'Hoş Geldiniz';
  const t = hotelName.trim();
  const last = t.slice(-1).toLowerCase();
  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  if (vowels.includes(last)) return `${t}'ye Hoş Geldiniz`;
  const nameLower = t.toLowerCase();
  let lastVowel: string | null = null;
  for (let i = nameLower.length - 1; i >= 0; i--) {
    if (vowels.includes(nameLower[i])) { lastVowel = nameLower[i]; break; }
  }
  if (lastVowel === 'a' || lastVowel === 'ı' || lastVowel === 'o' || lastVowel === 'u') return `${t}'a Hoş Geldiniz`;
  return `${t}'e Hoş Geldiniz`;
}

export default function GuestInterfaceClient({ roomId, initialLang, guestName, guestToken }: GuestInterfaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Token zorunlu: Sadece doğru token ile oda eşleşirse isim gösterilir (linke 102 yazıp yan oda çözülemez)
  useEffect(() => {
    const numericRoomId = roomId.replace(/^room-/, '');
    const url = guestToken
      ? `/api/rooms/${numericRoomId}/active-guest?token=${encodeURIComponent(guestToken)}`
      : `/api/rooms/${numericRoomId}/active-guest`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.guestName) {
          setResolvedGuestName(d.guestName);
          if (d.hotelName) setHotelName(d.hotelName);
        } else if (guestName && !guestToken) {
          setResolvedGuestName(guestName);
        }
        setGuestNameResolved(true);
      })
      .catch(() => {
        if (guestName && !guestToken) setResolvedGuestName(guestName);
        setGuestNameResolved(true);
      });
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

  // Sayfa başlığını misafir + otel ile güncelle
  useEffect(() => {
    if (displayGuestName && hotelName) {
      document.title = getWelcomeMessageWithGuest(displayGuestName, hotelName, currentLanguage);
    } else if (hotelName) {
      document.title = formatWelcomeMessage(hotelName);
    } else {
      document.title = safeGetTranslation('room.welcome', 'Hoş Geldiniz');
    }
  }, [hotelName, displayGuestName, currentLanguage]);


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
              {displayGuestName && hotelName
                ? getWelcomeMessageWithGuest(displayGuestName, hotelName, currentLanguage)
                : hotelName
                  ? formatWelcomeMessage(hotelName, currentLanguage)
                  : safeGetTranslation('room.welcome', 'Hoş Geldiniz')
              }
            </h1>
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
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
          alt="Hotel Background"
          className="w-full h-full object-cover scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {safeGetTranslation('welcome_guest', 'Hoşgeldiniz')}, {displayGuestName ? formatGuestNameOnly(displayGuestName) : 'Misafir'}!
            </h1>
            <p className="text-lg opacity-90 font-medium">
              {safeGetTranslation('how_can_we_help', 'Lütfen size nasıl yardımcı olabiliriz?')}
            </p>
          </div>

          <div className="relative language-selector">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="px-3 py-1.5 rounded-full dark-glass flex items-center gap-2 border border-white/20 transition-all active:scale-95"
            >
              <Globe className="w-4 h-4 text-white" />
              <span className="text-sm font-bold uppercase">{currentLanguage}</span>
            </button>

            {/* Language Dropdown */}
            {showLanguageSelector && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-2xl z-50 overflow-hidden glass-card border border-white/30">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageSelector(false);
                      const roomNumber = roomId.replace('room-', '');
                      const paramsString = searchParams ? searchParams.toString() : '';
                      const newUrl = `/${lang.code}/guest/${roomNumber}${paramsString ? `?${paramsString}` : ''}`;
                      window.history.pushState(null, '', newUrl);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 hover:bg-white/20 ${currentLanguage === lang.code ? 'bg-white/10' : ''}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-semibold text-sm text-gray-800">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xl border border-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <FaBell className="text-orange-500 text-lg animate-bounce" />
              </div>
              <div className="flex-1 overflow-hidden">
                <AnnouncementBanner roomId={roomId} minimal={true} />
              </div>
            </div>
            <div className="text-gray-400">
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </div>
          </div>
        </div>

        {/* Action Grid (2x2) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Oda Servisi */}
          <button
            onClick={() => {
              const roomNumber = roomId.replace('room-', '');
              localStorage.setItem('currentRoomId', roomId);
              const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
              params.set('roomId', roomNumber);
              router.push(`/qr-menu?${params.toString()}`);
            }}
            className="glass-card aspect-square rounded-[2.5rem] p-5 flex flex-col items-center justify-between transition-all active:scale-95 shadow-lg border border-white/50"
          >
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <img
                src="/icons/1.png"
                alt="Room Service"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {safeGetTranslation('room.room_service', 'Oda Servisi')}
            </span>
          </button>

          {/* Özel Talepler */}
          <button
            onClick={() => {
              const roomNumber = roomId.replace('room-', '');
              router.push(`/${currentLanguage}/guest/${roomNumber}/cleaning`);
            }}
            className="glass-card aspect-square rounded-[2.5rem] p-5 flex flex-col items-center justify-between transition-all active:scale-95 shadow-lg border border-white/50"
          >
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <img
                src="/icons/2.png"
                alt="Special Requests"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {safeGetTranslation('room.housekeeping', 'Özel Talepler')}
            </span>
          </button>

          {/* Otel Aktiviteleri */}
          <button
            onClick={() => router.push('/info')}
            className="glass-card aspect-square rounded-[2.5rem] p-5 flex flex-col items-center justify-between transition-all active:scale-95 shadow-lg border border-white/50"
          >
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <img
                src="/icons/3.png"
                alt="Hotel Activities"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {safeGetTranslation('hotel_activities', 'Otel Aktiviteleri')}
            </span>
          </button>

          {/* Şehir Turları */}
          <button
            onClick={() => {
              const roomNumber = roomId.replace('room-', '');
              const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
              params.set('roomId', roomNumber);
              router.push(`/concierge?${params.toString()}`);
            }}
            className="glass-card aspect-square rounded-[2.5rem] p-5 flex flex-col items-center justify-between transition-all active:scale-95 shadow-lg border border-white/50"
          >
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <img
                src="/icons/4.png"
                alt="City Tours"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {safeGetTranslation('city_tours', 'Şehir Turları')}
            </span>
          </button>
        </div>

        {/* Secondary Grid (Horizontal) */}
        <div className="grid grid-cols-1 gap-3 mb-10">
          <button
            onClick={() => router.push('/info')}
            className="glass-card rounded-[1.5rem] p-4 flex items-center transition-all active:scale-95 shadow-md border border-white/50"
          >
            <div className="w-12 h-12 flex items-center justify-center mr-4">
              <img
                src="https://img.icons8.com/3d-fluency/94/clipboard.png"
                alt="Info"
                className="w-10 h-10"
              />
            </div>
            <span className="font-bold text-gray-800 text-xl flex-1 text-left">
              {safeGetTranslation('room.wifi', 'Bilgi')}
            </span>
            <ChevronDown className="w-6 h-6 text-gray-400 -rotate-90" />
          </button>

          <button
            onClick={() => setShowSurvey(true)}
            className="glass-card rounded-[1.5rem] p-4 flex items-center transition-all active:scale-95 shadow-md border border-white/50"
          >
            <div className="w-12 h-12 flex items-center justify-center mr-4 font-bold">
              <img
                src="https://img.icons8.com/3d-fluency/94/star--v1.png"
                alt="Feedback"
                className="w-10 h-10"
              />
            </div>
            <span className="font-bold text-gray-800 text-xl flex-1 text-left">
              {safeGetTranslation('survey.title', 'Şikayet / Yorum')}
            </span>
            <div className="flex flex-col items-end">
              <div className="flex -space-x-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                ))}
              </div>
              <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
            </div>
          </button>
        </div>

        {/* Live Support Floating Area */}
        <div className="mt-auto flex flex-col items-center">
          <div className="relative mb-4 group cursor-pointer active:scale-95 transition-transform" onClick={() => addNotification('info', 'Canlı Destek', 'Personelimize bağlanıyorsunuz...')}>
            <div className="bg-gray-800/90 backdrop-blur-md text-white px-8 py-2.5 rounded-full font-bold shadow-2xl flex items-center gap-3 border border-white/20">
              {safeGetTranslation('live_support', 'Canlı Destek')}
            </div>
            <div className="absolute -right-14 -top-14">
              <img
                src="https://img.icons8.com/3d-fluency/188/robot-2.png"
                alt="Bot"
                className="w-24 h-24 drop-shadow-2xl animate-pulse"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="mt-4 opacity-80 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-black text-2xl tracking-[0.2em] italic">ROOM<span className="text-blue-400">X</span>QR</span>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Styles for the specific look */}
      <style jsx>{`
        .glass-card :global(img) {
          transition: transform 0.3s ease;
        }
        .glass-card:hover :global(img) {
          transform: translateY(-5px) scale(1.05);
        }
      `}</style>
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