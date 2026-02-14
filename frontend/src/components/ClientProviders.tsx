'use client';

import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import DataInitializer from '@/components/DataInitializer';
import ThemeProvider from '@/components/ThemeProvider';
import LocaleLoader from '@/components/LocaleLoader';

interface ClientProvidersProps {
  children: React.ReactNode;
  roomId?: string;
}

export default function ClientProviders({ children, roomId }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <NotificationProvider roomId={roomId}>
        <ThemeProvider>
          <LocaleLoader />
          <DataInitializer />
          {children}
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
