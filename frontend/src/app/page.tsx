'use client';

import { useEffect } from 'react';
import PremiumLanding from '@/components/PremiumLanding';
import { useLanguageStore } from '@/store/languageStore';

export default function HomePage() {
    const { currentLanguage, setLanguage } = useLanguageStore();

    useEffect(() => {
        // Tarayıcı dilini anasayfa girişinde kontrol et
        const navLang = navigator.language.split('-')[0];
        let targetLang = 'en';

        if (navLang === 'de') targetLang = 'de';
        else if (navLang === 'tr') targetLang = 'tr';

        // Eğer mevcut dil sistem tarafından varsayılan atanan ise veya 
        // kullanıcı hiçbir şey seçmemişse (veya istek gereği anasayfada zorla):
        if (currentLanguage !== targetLang) {
            setLanguage(targetLang);
        }
    }, [currentLanguage, setLanguage]);

    return <PremiumLanding />;
}
