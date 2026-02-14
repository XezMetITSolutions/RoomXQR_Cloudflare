'use client';

import { useEffect } from 'react';
import PremiumLanding from '@/components/PremiumLanding';
import { useLanguageStore } from '@/store/languageStore';

export default function RussianHomePage() {
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    setLanguage('ru');
  }, [setLanguage]);

  return <PremiumLanding />;
}
