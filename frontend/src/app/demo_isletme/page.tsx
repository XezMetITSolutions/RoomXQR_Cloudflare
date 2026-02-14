"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Menu, 
  ShoppingCart, 
  Bell, 
  TrendingUp, 
  DollarSign,
  Globe,
  QrCode,
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  
  // Mock data - bu veriler gerçek API'den gelecek
  const stats = [
    {
      name: 'Toplam Misafir',
      value: '124',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Aktif Siparişler',
      value: '23',
      change: '+5%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Bekleyen Talepler',
      value: '7',
      change: '-2%',
      changeType: 'negative',
      icon: Bell,
    },
    {
      name: 'Günlük Gelir',
      value: '₺2,450',
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', room: '101', items: '2x Pizza, 1x Cola', amount: '₺85', status: 'Preparing' },
    { id: 'ORD-002', room: '205', items: '1x Burger, 2x Fries', amount: '₺65', status: 'Ready' },
    { id: 'ORD-003', room: '312', items: '3x Coffee, 2x Cake', amount: '₺45', status: 'Delivered' },
    { id: 'ORD-004', room: '118', items: '1x Pasta, 1x Wine', amount: '₺120', status: 'Pending' },
  ];

  const recentRequests = [
    { id: 'REQ-001', room: '205', type: 'Temizlik', priority: 'High', time: '5 dk önce' },
    { id: 'REQ-002', room: '312', type: 'Bakım', priority: 'Medium', time: '12 dk önce' },
    { id: 'REQ-003', room: '101', type: 'Konuk Hizmetleri', priority: 'Low', time: '18 dk önce' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ready':
        return 'bg-green-100 text-green-800';
      case 'Delivered':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCleanupDemoData = async () => {
    if (!confirm('Demo verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setIsCleaning(true);
    setCleanupMessage(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
      
      // URL'den tenant slug'ını al
      let tenantSlug = 'demo';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/cleanup-demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCleanupMessage('✅ Demo verileri başarıyla temizlendi!');
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setCleanupMessage(`❌ Hata: ${data.error || data.message || 'Bilinmeyen hata'}`);
      }
    } catch (error: any) {
      setCleanupMessage(`❌ Hata: ${error.message || 'Bağlantı hatası'}`);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Otel yönetim paneline hoş geldiniz</p>
          </div>
          <button
            onClick={handleCleanupDemoData}
            disabled={isCleaning}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isCleaning ? 'Temizleniyor...' : 'Demo Verilerini Temizle'}
          </button>
        </div>
        {cleanupMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            cleanupMessage.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {cleanupMessage}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="hotel-card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-hotel-gold rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="hotel-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Son Siparişler</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                    <span className="text-sm text-gray-500">Oda {order.room}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{order.items}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <a href="/management/orders" className="text-sm font-medium text-hotel-gold hover:text-hotel-navy">
              Tüm siparişleri görüntüle →
            </a>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="hotel-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Son Talepler</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">#{request.id}</span>
                      <span className="text-sm text-gray-500">Oda {request.room}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{request.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <a href="/management/requests" className="text-sm font-medium text-hotel-gold hover:text-hotel-navy">
              Tüm talepleri görüntüle →
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hotel-card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={() => router.push('/management/qr-code')}
            className="flex items-center p-4 border-2 border-hotel-gold rounded-lg hover:bg-hotel-gold hover:text-white transition-colors"
          >
            <QrCode className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">QR Kod Oluştur</span>
          </button>
          <button 
            onClick={() => router.push('/management/menu')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">Menü Düzenle</span>
          </button>
          <button 
            onClick={() => router.push('/management/announcements')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">Duyuru Ekle</span>
          </button>
          <button 
            onClick={() => router.push('/management/users')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">Personel Ekle</span>
          </button>
          <button 
            onClick={() => router.push('/management/analytics')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">Rapor Görüntüle</span>
          </button>
          <button 
            onClick={() => router.push('/management/settings?tab=social')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">Sosyal Medya</span>
          </button>
        </div>
      </div>
    </div>
  );
}
