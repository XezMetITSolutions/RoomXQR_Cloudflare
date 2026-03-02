'use client';

import { useEffect } from 'react';
import PremiumLanding from '@/components/PremiumLanding';
import { useLanguageStore } from '@/store/languageStore';

export default function ArabicHomePage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('ar');
    }, [setLanguage]);

    return (
        <div dir="rtl">
            <PremiumLanding />
        </div>
    );
}
