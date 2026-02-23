'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaHeadset,
  FaArrowLeft,
  FaCommentDots,
  FaPaperPlane,
  FaConciergeBell
} from 'react-icons/fa';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { ApiService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CONCIERGE_OPTIONS = [
  { id: 'restaurant', icon: 'https://img.icons8.com/3d-fluency/94/restaurant.png', titleKey: 'concierge.restaurant', descKey: 'concierge.restaurant_desc', color: '#EF4444' },
  { id: 'transfer', icon: 'https://img.icons8.com/3d-fluency/94/car.png', titleKey: 'concierge.transfer', descKey: 'concierge.transfer_desc', color: '#3B82F6' },
  { id: 'spa', icon: 'https://img.icons8.com/3d-fluency/94/spa.png', titleKey: 'concierge.spa', descKey: 'concierge.spa_desc', color: '#8B5CF6' },
  { id: 'valet', icon: 'https://img.icons8.com/3d-fluency/188/bell-service.png', titleKey: 'concierge.valet', descKey: 'concierge.valet_desc', color: '#10B981' },
  { id: 'wakeup', icon: 'https://img.icons8.com/3d-fluency/94/alarm-clock.png', titleKey: 'concierge.wakeup', descKey: 'concierge.wakeup_desc', color: '#F59E0B' },
  { id: 'laundry', icon: 'https://img.icons8.com/3d-fluency/94/washing-machine.png', titleKey: 'concierge.laundry', descKey: 'concierge.laundry_desc', color: '#06B6D4' },
  { id: 'gift', icon: 'https://img.icons8.com/3d-fluency/94/gift.png', titleKey: 'concierge.gift', descKey: 'concierge.gift_desc', color: '#EC4899' },
  { id: 'tour', icon: 'https://img.icons8.com/3d-fluency/94/mountain.png', titleKey: 'concierge.tour', descKey: 'concierge.tour_desc', color: '#F97316' },
];

export default function ConciergePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId') || '';
  const roomId = roomIdParam ? `room-${roomIdParam}` : '';

  const theme = useThemeStore();
  const { getTranslation, currentLanguage } = useLanguageStore();
  const [customRequest, setCustomRequest] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const t = (key: string, fallback: string) => getTranslation(key) || fallback;

  const sendRequest = async (description: string, id: string = 'custom') => {
    if (!roomId) return;
    setSending(id);
    try {
      await ApiService.createGuestRequest({
        roomId,
        type: 'concierge',
        priority: 'medium',
        status: 'pending',
        description,
      });
      setSent(id);
      setTimeout(() => setSent(null), 3000);
    } catch {
      setSent(id);
      setTimeout(() => setSent(null), 3000);
    } finally {
      setSending(null);
    }
  };

  const handleQuickRequest = (option: typeof CONCIERGE_OPTIONS[0]) => {
    const title = t(option.titleKey, option.id);
    const desc = t(option.descKey, '');
    sendRequest(desc ? `${title}: ${desc}` : title, option.id);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customRequest.trim();
    if (!text) return;
    sendRequest(text);
    setCustomRequest('');
  };

  const goBack = () => {
    if (roomIdParam) {
      const lang = currentLanguage && currentLanguage !== 'tr' ? currentLanguage : 'tr';
      router.push(`/${lang}/guest/${roomIdParam}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#F9FAFB' }}>
      {/* Premium Header */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-md mx-auto px-6 pt-8">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 transition shadow-lg active:scale-90"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>

          <div className="mt-4 sm:mt-8">
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {t('room.concierge', 'Konsiyerj')}
            </h1>
            <p className="text-white/90 text-sm mt-1 font-medium drop-shadow-md">
              {t('concierge.subtitle', 'Size nasıl yardımcı olabiliriz?')}
            </p>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="flex-1 -mt-8 relative z-20 bg-gray-50 rounded-t-[2.5rem] px-6 pt-8 pb-12 shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {CONCIERGE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSending = sending === option.id;
              const isSent = sent === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleQuickRequest(option)}
                  disabled={!!sending}
                  className="group relative flex flex-col items-start p-5 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-75 overflow-hidden"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${option.color}15` }}
                  >
                    <img src={option.icon} alt="" className="w-8 h-8 object-contain" />
                  </div>

                  <div className="text-left w-full">
                    <div className="font-bold text-gray-900" style={{ fontSize: '1.05rem' }}>
                      {t(option.titleKey, option.id)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed opacity-80">
                      {t(option.descKey, '')}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <AnimatePresence mode="wait">
                      {isSending ? (
                        <motion.div
                          key="sending"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-5 h-5 border-2 border-primary rounded-full border-t-transparent animate-spin"
                          style={{ borderColor: option.color, borderTopColor: 'transparent' }}
                        />
                      ) : isSent ? (
                        <motion.div
                          key="sent"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-green-500 font-bold text-xs"
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <FaPaperPlane className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Request Section */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 px-2">
              <FaCommentDots className="text-blue-500" />
              {t('concierge.custom_request', 'Özel Talebiniz')}
            </h3>
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder={t('concierge.custom_placeholder', 'Rezervasyon, transfer, tur veya diğer isteklerinizi yazın...')}
                  rows={4}
                  className="w-full px-5 py-4 rounded-3xl bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none text-gray-700 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!customRequest.trim() || !!sending}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
                  color: '#fff'
                }}
              >
                {sending === 'custom' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    {t('concierge.send', 'Talep Gönder')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <FaConciergeBell className="text-blue-500" />
              24/7 Professional Service
            </div>
            <p className="text-xs text-gray-400 leading-relaxed px-4">
              {t('concierge.footer', 'Tüm talepleriniz ekibimize iletilir. Size en kısa sürede dönüş sağlayacağız.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
