'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { useLanguageStore } from '@/store/languageStore'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentLanguage } = useLanguageStore();
  return (
    <html lang={currentLanguage}>
      <head>
        <title>RoomXQR - QR Kodlu Otel Yönetim Sistemi</title>
        <meta name="description" content="Otelinizde dijital dönüşüm: QR ile anında hizmet, AI destekli menü ve %40 gelir artışı" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
