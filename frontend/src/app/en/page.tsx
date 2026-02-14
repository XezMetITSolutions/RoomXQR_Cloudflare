'use client';

import { useEffect } from 'react';
import PremiumLanding from '@/components/PremiumLanding';
import { useLanguageStore } from '@/store/languageStore';

export default function EnglishHomePage() {
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  return <PremiumLanding />;
}
