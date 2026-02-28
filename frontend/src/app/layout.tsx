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
  const { currentLanguage, getTranslation: t } = useLanguageStore();
  const title = t('metaTitle') || 'RoomXQR - Otelinizde Dijital Dönüşüm ve Verimlilik';
  const description = t('metaDescription') || 'Otelinizde dijital dönüşüm: QR kod ile anında hizmet, AI destekli menü ve %40 gelir artışı sağlayın.';

  return (
    <html lang={currentLanguage}>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roomxqr.com/" />
        <meta property="og:title" content="RoomXQR - Next-Gen Hotel Management" />
        <meta property="og:description" content="QR-based, cloud-powered management platform for hotels. Increase guest satisfaction and operational efficiency." />
        <meta property="og:image" content="https://roomxqr.com/logo.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://roomxqr.com/" />
        <meta property="twitter:title" content="RoomXQR - Next-Gen Hotel Management" />
        <meta property="twitter:description" content="QR-based, cloud-powered management platform for hotels. Increase guest satisfaction and operational efficiency." />
        <meta property="twitter:image" content="https://roomxqr.com/logo.png" />

        <link rel="canonical" href="https://roomxqr.com/" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />

        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "RoomXQR",
              "operatingSystem": "Cloud-based",
              "applicationCategory": "BusinessApplication",
              "description": currentLanguage === 'tr' ? 'Oteliniz için QR kod tabanlı, bulut mimarili yönetim platformu.' : currentLanguage === 'de' ? 'QR-basierte, cloud-gestützte Management-Plattform für Hotels.' : 'Cloud-powered, QR-based hotel management platform.',
              "offers": {
                "@type": "Offer",
                "priceCurrency": "TRY",
                "price": "29900"
              },
              "author": {
                "@type": "Organization",
                "name": "RoomXQR"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
