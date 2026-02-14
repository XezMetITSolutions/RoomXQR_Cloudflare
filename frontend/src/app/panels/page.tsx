"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Hotel, 
  Users, 
  ChefHat, 
  Settings, 
  BarChart3,
  ScanLine
} from 'lucide-react';
import { Language } from '@/types';

export default function PanelsIndexPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');
  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  // Tenant bilgilerini yükle
  useEffect(() => {
    const loadTenantInfo = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
        
        // URL'den tenant slug'ını al
        let tenantSlug = user.tenant?.slug || 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
            tenantSlug = subdomain;
          }
        }

        // Tenant bilgilerini al (eğer backend'de endpoint varsa)
        // Şimdilik user'dan gelen tenant bilgilerini kullan
        setTenantInfo({
          name: user.tenant?.name || 'İşletme',
          slug: user.tenant?.slug || tenantSlug
        });
      } catch (error) {
        console.error('Tenant bilgileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantInfo();
  }, [user, token]);

  const panels = [
    {
      id: 'reception',
      title: 'Resepsiyon Paneli',
      description: 'Oda istekleri, anında yanıt sistemi ve misafir hizmetleri',
      icon: Hotel,
      color: 'bg-hotel-gold',
      hoverColor: 'hover:bg-yellow-500',
      route: '/reception',
      requiresAuth: false
    },
    {
      id: 'kitchen',
      title: 'Mutfak Paneli',
      description: 'Oda servisi siparişleri ve menü yönetimi',
      icon: ChefHat,
      color: 'bg-hotel-sage',
      hoverColor: 'hover:bg-green-600',
      route: '/kitchen',
      requiresAuth: false
    },
    {
      id: 'qr-menu',
      title: 'QR Menü',
      description: 'QR ile menü erişimi ve sipariş',
      icon: ScanLine,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      route: '/qr-menu',
      requiresAuth: false
    },
    {
      id: 'guest-demo',
      title: 'Misafir Arayüzü',
      description: 'Misafir deneyimini önizleyin',
      icon: Users,
      color: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-700',
      route: '/guest/demo',
      requiresAuth: false
    },
    {
      id: 'admin',
      title: 'İşletme Paneli',
      description: tenantInfo ? `${tenantInfo.name} - Menü yönetimi, duyurular, kullanıcılar ve ayarlar` : 'Menü yönetimi, duyurular, kullanıcılar ve ayarlar',
      icon: Settings,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      route: '/management',
      requiresAuth: true
    },
    {
      id: 'system-admin',
      title: 'Sistem Yönetimi',
      description: 'Platform yönetimi, işletmeler, faturalandırma ve destek',
      icon: BarChart3,
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
      route: '/system-admin',
      requiresAuth: true
    }
  ];

  // Auth gerektiren panelleri filtrele
  const availablePanels = panels.filter(panel => !panel.requiresAuth || user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* QR kod benzeri tasarım */}
                <div className="absolute inset-1 bg-white rounded-lg grid grid-cols-3 gap-0.5 p-1">
                  <div className="bg-blue-600 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-blue-600 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-blue-600 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-blue-600 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-blue-600 rounded-sm"></div>
                </div>
                {/* X harfi overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-lg drop-shadow-lg">X</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Paneller</h1>
                <p className="text-gray-600">
                  {tenantInfo 
                    ? `${tenantInfo.name} - Tüm yönetim panellerine buradan erişin`
                    : 'Tüm yönetim panellerine buradan erişin'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as Language)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="de">🇩🇪 Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
              <p className="mt-4 text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availablePanels.map((panel) => {
            const IconComponent = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => router.push(panel.route)}
                className="hotel-card p-8 text-left h-full flex flex-col justify-between group hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className={`w-14 h-14 ${panel.color} ${panel.hoverColor} rounded-2xl flex items-center justify-center mb-6 transition-colors`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{panel.title}</h3>
                  <p className="text-gray-600">{panel.description}</p>
                </div>
                <div className="mt-6 text-hotel-gold font-semibold">Panele Git →</div>
              </button>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}