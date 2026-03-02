'use client';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import DataInitializer from '@/components/DataInitializer';
import ThemeProvider from '@/components/ThemeProvider';
import LocaleLoader from '@/components/LocaleLoader';
import OfflineSyncManager from '@/components/OfflineSyncManager';
import BrowserLanguageDetector from '@/components/BrowserLanguageDetector';

interface ClientProvidersProps {
  children: React.ReactNode;
  roomId?: string;
}

export default function ClientProviders({ children, roomId }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <NotificationProvider roomId={roomId}>
        <ThemeProvider>
          <BrowserLanguageDetector />
          <LocaleLoader />
          <DataInitializer />
          <OfflineSyncManager />
          {children}
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
