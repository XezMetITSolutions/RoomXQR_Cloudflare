'use client';

import { useEffect } from 'react';
import PremiumLanding from '@/components/PremiumLanding';
import { useLanguageStore } from '@/store/languageStore';

export default function GermanHomePage() {
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    setLanguage('de');
  }, [setLanguage]);

  return <PremiumLanding />;
}
