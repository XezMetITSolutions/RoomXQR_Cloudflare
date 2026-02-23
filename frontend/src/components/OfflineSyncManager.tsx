'use client';

import { useEffect, useState } from 'react';
import { ApiService } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';

export default function OfflineSyncManager() {
    const { addNotification } = useNotifications();
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('App is online. Attempting to sync offline requests...');

            // İnternet geldiğinde bekleyen istekleri gönder
            ApiService.syncOfflineRequests().then(({ successes, failures }) => {
                if (successes > 0) {
                    addNotification(
                        'success',
                        'Bağlantı Sağlandı',
                        `${successes} adet bekleyen işleminiz başarıyla gönderildi.`,
                        false,
                        true,
                        5000
                    );
                }
                if (failures > 0) {
                    addNotification(
                        'warning',
                        'Eksik İşlemler',
                        `${failures} adet işlem gönderilirken bir hata oluştu. Tekrar denenecek.`,
                        false,
                        true,
                        5000
                    );
                }
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('App is offline.');
            addNotification(
                'info',
                'Çevrimdışı Mod',
                'İnternet bağlantınız koptu. Merak etmeyin, yaptığınız işlemler kaydedilecek ve bağlantı geldiğinde iletilecek.',
                false,
                true,
                5000
            );
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // İlk yüklemede bekleyen varsa ve online isek dene
        if (navigator.onLine) {
            ApiService.syncOfflineRequests().then(({ successes }) => {
                if (successes > 0) {
                    addNotification(
                        'success',
                        'Senkronizasyon',
                        `${successes} adet bekleyen işleminiz senkronize edildi.`,
                        false,
                        true,
                        5000
                    );
                }
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addNotification]);

    return null; // Görünmez bileşen
}
