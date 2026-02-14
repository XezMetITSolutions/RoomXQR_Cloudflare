'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaHeadset, FaArrowLeft, FaUtensils, FaCar, FaMountain, FaCommentDots, FaPaperPlane } from 'react-icons/fa';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { ApiService } from '@/services/api';

const CONCIERGE_OPTIONS = [
  { id: 'restaurant', icon: FaUtensils, titleKey: 'concierge.restaurant', descKey: 'concierge.restaurant_desc' },
  { id: 'transfer', icon: FaCar, titleKey: 'concierge.transfer', descKey: 'concierge.transfer_desc' },
  { id: 'tour', icon: FaMountain, titleKey: 'concierge.tour', descKey: 'concierge.tour_desc' },
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

  const sendRequest = async (description: string) => {
    if (!roomId) return;
    setSending('custom');
    try {
      await ApiService.createGuestRequest({
        roomId,
        type: 'concierge',
        priority: 'medium',
        status: 'pending',
        description,
      });
      setSent('custom');
      setTimeout(() => setSent(null), 3000);
    } catch {
      setSent('custom');
      setTimeout(() => setSent(null), 3000);
    } finally {
      setSending(null);
    }
  };

  const handleQuickRequest = (option: typeof CONCIERGE_OPTIONS[0]) => {
    if (!roomId) return;
    const title = t(option.titleKey, option.id);
    const desc = t(option.descKey, '');
    const fullDesc = desc ? `${title}: ${desc}` : title;
    setSending(option.id);
    (async () => {
      try {
        await ApiService.createGuestRequest({
          roomId,
          type: 'concierge',
          priority: 'medium',
          status: 'pending',
          description: fullDesc,
        });
        setSent(option.id);
        setTimeout(() => setSent(null), 3000);
      } catch {
        setSent(option.id);
        setTimeout(() => setSent(null), 3000);
      } finally {
        setSending(null);
      }
    })();
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
    <div className="min-h-screen flex flex-col" style={{ background: theme.backgroundColor }}>
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 mb-6 text-sm font-medium"
          style={{ color: theme.textColor }}
        >
          <FaArrowLeft className="w-4 h-4" />
          {t('general.back', 'Geri')}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.primaryColor}20` }}>
            <FaHeadset className="w-6 h-6" style={{ color: theme.primaryColor }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: theme.textColor }}>
              {t('room.concierge', 'Konsiyerj')}
            </h1>
            <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
              {t('concierge.subtitle', 'Rezervasyon, transfer ve özel istekleriniz için')}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {CONCIERGE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSending = sending === option.id;
            const isSent = sent === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleQuickRequest(option)}
                disabled={!!sending}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition hover:scale-[1.01] disabled:opacity-70"
                style={{ borderColor: theme.borderColor, background: theme.cardBackground }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${theme.primaryColor}20` }}>
                  <Icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ color: theme.textColor }}>{t(option.titleKey, option.id)}</div>
                  <div className="text-xs opacity-80" style={{ color: theme.textColor }}>{t(option.descKey, '')}</div>
                </div>
                <div className="flex-shrink-0">
                  {isSending ? (
                    <span className="text-xs" style={{ color: theme.textColor }}>Gönderiliyor...</span>
                  ) : isSent ? (
                    <span className="text-xs text-green-600">Gönderildi</span>
                  ) : (
                    <FaPaperPlane className="w-4 h-4 opacity-70" style={{ color: theme.primaryColor }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: theme.textColor }}>
            {t('concierge.custom_request', 'Özel isteğiniz')}
          </label>
          <textarea
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            placeholder={t('concierge.custom_placeholder', 'Rezervasyon, transfer, tur veya diğer isteklerinizi yazın...')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none focus:ring-2"
            style={{ borderColor: theme.borderColor, background: theme.cardBackground, color: theme.textColor }}
          />
          <button
            type="submit"
            disabled={!customRequest.trim() || !!sending}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: theme.primaryColor, color: '#fff' }}
          >
            <FaPaperPlane className="w-4 h-4" />
            {sending === 'custom' ? t('common.loading', 'Gönderiliyor...') : t('concierge.send', 'Gönder')}
          </button>
        </form>

        <p className="text-xs text-center mt-6 opacity-70" style={{ color: theme.textColor }}>
          {t('concierge.footer', 'Talepleriniz resepsiyona iletilecektir. En kısa sürede size dönüş yapılacaktır.')}
        </p>
      </div>
    </div>
  );
}
