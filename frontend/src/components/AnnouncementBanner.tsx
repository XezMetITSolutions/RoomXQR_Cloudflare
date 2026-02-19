"use client";

import { useState, useEffect } from 'react';
import {
  X,
  Info,
  AlertTriangle,
  Megaphone,
  Wrench,
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useLanguageStore } from '@/store/languageStore';
import { RealtimeTranslator } from '@/components/RealtimeTranslator';

interface AnnouncementBannerProps {
  roomId?: string;
  className?: string;
  minimal?: boolean;
}

export default function AnnouncementBanner({ roomId, className = '', minimal = false }: AnnouncementBannerProps) {
  const { getAnnouncementsByRoom, getActiveAnnouncements } = useAnnouncementStore();
  const { currentLanguage } = useLanguageStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const loadAnnouncements = () => {
      const activeAnnouncements = roomId
        ? getAnnouncementsByRoom(roomId)
        : getActiveAnnouncements();

      // Oda QR sayfasında menü kategorisindeki duyuruları filtrele (sadece menü duyuruları QR menüde görünsün)
      const filtered = activeAnnouncements.filter(announcement =>
        !dismissedAnnouncements.includes(announcement.id) &&
        announcement.category !== 'menu'
      );

      setAnnouncements(filtered);
    };

    loadAnnouncements();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [roomId, getAnnouncementsByRoom, getActiveAnnouncements, dismissedAnnouncements]);

  // Dil değiştiğinde duyuruları yeniden yükle (re-render için)
  useEffect(() => {
    const activeAnnouncements = roomId
      ? getAnnouncementsByRoom(roomId)
      : getActiveAnnouncements();

    // Oda QR sayfasında menü kategorisindeki duyuruları filtrele (sadece menü duyuruları QR menüde görünsün)
    const filtered = activeAnnouncements.filter(announcement =>
      !dismissedAnnouncements.includes(announcement.id) &&
      announcement.category !== 'menu'
    );

    setAnnouncements(filtered);
  }, [currentLanguage, roomId, getAnnouncementsByRoom, getActiveAnnouncements, dismissedAnnouncements]);

  // Otomatik duyuru rotasyonu
  useEffect(() => {
    if (announcements.length > 1 && autoRotate) {
      const rotationInterval = setInterval(() => {
        setCurrentAnnouncementIndex((prevIndex) =>
          (prevIndex + 1) % announcements.length
        );
      }, 4000); // 4 saniyede bir değiştir

      return () => clearInterval(rotationInterval);
    }
  }, [announcements.length, autoRotate]);

  // Duyuru değiştiğinde index'i sıfırla
  useEffect(() => {
    setCurrentAnnouncementIndex(0);
  }, [announcements]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'promotion':
        return <Megaphone className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'advertisement':
        return <Star className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'promotion':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'maintenance':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'advertisement':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements(prev => [...prev, id]);
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
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Gösterilecek duyurular (dismiss edilmemiş olanlar)
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = visibleAnnouncements[currentAnnouncementIndex];

  if (minimal) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div className="flex flex-col">
          <h4 className="font-bold text-gray-800 text-sm truncate">
            <RealtimeTranslator
              text={currentAnnouncement.translations?.[currentLanguage]?.title || currentAnnouncement.title}
              targetLang={currentLanguage as any}
            />
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1">
            <RealtimeTranslator
              text={currentAnnouncement.translations?.[currentLanguage]?.content || currentAnnouncement.content}
              targetLang={currentLanguage as any}
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAnnouncements.length > 1 && (
        <div className="flex justify-center space-x-1 mb-2">
          {visibleAnnouncements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAnnouncementIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentAnnouncementIndex ? 'bg-current opacity-100' : 'bg-current opacity-30'
                }`}
            />
          ))}
        </div>
      )}

      <div
        key={currentAnnouncement.id}
        className={`border-l-4 border rounded-lg p-4 transition-all duration-500 ${getTypeColor(currentAnnouncement.type)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getTypeIcon(currentAnnouncement.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm">
                  <RealtimeTranslator
                    text={currentAnnouncement.translations?.[currentLanguage]?.title || currentAnnouncement.title}
                    targetLang={currentLanguage as any}
                  />
                </h4>
                <span className="text-xs opacity-75 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(currentAnnouncement.startDate)}
                </span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                <RealtimeTranslator
                  text={currentAnnouncement.translations?.[currentLanguage]?.content || currentAnnouncement.content}
                  targetLang={currentLanguage as any}
                />
              </p>
              {currentAnnouncement.linkUrl && currentAnnouncement.linkText && (
                <div className="mt-3">
                  <a
                    href={currentAnnouncement.linkUrl}
                    target={currentAnnouncement.linkUrl.startsWith('http') ? '_blank' : '_self'}
                    rel={currentAnnouncement.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center space-x-2 text-sm font-medium text-current hover:opacity-80 transition-opacity"
                  >
                    <span>
                      <RealtimeTranslator
                        text={currentAnnouncement.translations?.[currentLanguage]?.linkText || currentAnnouncement.linkText}
                        targetLang={currentLanguage as any}
                      />
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
              {currentAnnouncement.endDate && (
                <p className="text-xs opacity-75 mt-2">
                  {currentLanguage === 'tr' && 'Geçerlilik: '}
                  {currentLanguage === 'en' && 'Valid: '}
                  {currentLanguage === 'ru' && 'Действительно: '}
                  {currentLanguage === 'ar' && 'صالح: '}
                  {currentLanguage === 'de' && 'Gültig: '}
                  {formatDate(currentAnnouncement.startDate)} - {formatDate(currentAnnouncement.endDate)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => dismissAnnouncement(currentAnnouncement.id)}
            className="flex-shrink-0 ml-3 text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
