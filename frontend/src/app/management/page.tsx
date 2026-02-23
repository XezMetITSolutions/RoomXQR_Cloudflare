"use client";

import { useState, useEffect } from 'react';
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
  ChevronDown,
  FileText
} from 'lucide-react';
import { useLanguageStore, languages } from '@/store/languageStore';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const { currentLanguage, setLanguage, getTranslation, getCurrentLanguage, getSupportedLanguages } = useLanguageStore();

  const [supportedLanguages, setSupportedLanguages] = useState(getSupportedLanguages());

  // Ayarlar güncellendiğinde dilleri yenile
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSupportedLanguages(getSupportedLanguages());
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, [getSupportedLanguages]);

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('dashboard.title');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  // Dil değiştiğinde stats'ı güncelle
  useEffect(() => {
    setStats([
      {
        name: getTranslation('dashboard.total_guests'),
        value: stats[0]?.value || '0',
        change: stats[0]?.change || '0%',
        changeType: 'positive' as const,
        icon: Users,
      },
      {
        name: getTranslation('dashboard.active_orders'),
        value: stats[1]?.value || '0',
        change: stats[1]?.change || '0%',
        changeType: 'positive' as const,
        icon: ShoppingCart,
      },
      {
        name: getTranslation('dashboard.pending_requests'),
        value: stats[2]?.value || '0',
        change: stats[2]?.change || '0%',
        changeType: 'negative' as const,
        icon: Bell,
      },
      {
        name: getTranslation('dashboard.daily_revenue'),
        value: stats[3]?.value || '₺0',
        change: stats[3]?.change || '0%',
        changeType: 'positive' as const,
        icon: DollarSign,
      },
    ]);
  }, [currentLanguage]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelector]);
  const [stats, setStats] = useState(() => {
    const getTranslation = useLanguageStore.getState().getTranslation;
    return [
      {
        name: getTranslation('dashboard.total_guests'),
        value: '0',
        change: '0%',
        changeType: 'positive' as const,
        icon: Users,
      },
      {
        name: getTranslation('dashboard.active_orders'),
        value: '0',
        change: '0%',
        changeType: 'positive' as const,
        icon: ShoppingCart,
      },
      {
        name: getTranslation('dashboard.pending_requests'),
        value: '0',
        change: '0%',
        changeType: 'negative' as const,
        icon: Bell,
      },
      {
        name: getTranslation('dashboard.daily_revenue'),
        value: '₺0',
        change: '0%',
        changeType: 'positive' as const,
        icon: DollarSign,
      },
    ];
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  // Gerçek verileri API'den yükle
  useEffect(() => {
    const loadData = async () => {
      if (!token || !user) return;

      try {
        setIsLoading(true);
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

        // Statistics, Orders ve Requests'i paralel olarak yükle
        const [statsRes, ordersRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/statistics`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-tenant': tenantSlug
            }
          }).catch(() => null),
          fetch(`${API_BASE_URL}/api/orders?limit=5`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-tenant': tenantSlug
            }
          }).catch(() => null),
          fetch(`${API_BASE_URL}/api/requests?limit=5`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-tenant': tenantSlug
            }
          }).catch(() => null)
        ]);

        // Statistics
        if (statsRes && statsRes.ok) {
          const statsData = await statsRes.json();
          const getTranslation = useLanguageStore.getState().getTranslation;
          setStats([
            {
              name: getTranslation('dashboard.total_guests'),
              value: String(statsData.totalGuests || 0),
              change: '0%',
              changeType: 'positive',
              icon: Users,
            },
            {
              name: getTranslation('dashboard.active_orders'),
              value: String(statsData.activeOrders || 0),
              change: '0%',
              changeType: 'positive',
              icon: ShoppingCart,
            },
            {
              name: getTranslation('dashboard.pending_requests'),
              value: String(statsData.pendingRequests || 0),
              change: '0%',
              changeType: 'negative',
              icon: Bell,
            },
            {
              name: getTranslation('dashboard.daily_revenue'),
              value: `₺${(statsData.dailyRevenue || 0).toLocaleString('tr-TR')}`,
              change: '0%',
              changeType: 'positive',
              icon: DollarSign,
            },
          ]);
        }

        // Orders
        if (ordersRes && ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
          setRecentOrders(orders.slice(0, 4).map((order: any) => {
            // Room Number'ı al (relation'dan veya roomId'den temizle)
            const roomNumber = order.room?.number || order.roomId?.replace(/^\s*room[-\s_]*/i, '').trim() || '';

            // Items'ı düzelt (menuItem relation'dan name al)
            const itemsText = order.items?.map((item: any) => {
              // Debug için log
              if (!item.menuItem && !item.name) {
                console.warn('Order item without name:', item);
              }

              // Önce menuItem relation'dan name al, yoksa item.name, yoksa menuItemId'den türet, yoksa varsayılan
              const getTranslation = useLanguageStore.getState().getTranslation;
              let itemName = getTranslation('dashboard.unknown_product');
              if (item.menuItem?.name) {
                itemName = item.menuItem.name;
              } else if (item.name) {
                itemName = item.name;
              } else if (item.menuItemId) {
                // menuItemId varsa ama relation yüklenmemişse, ID'yi göster
                itemName = `${getTranslation('dashboard.product_id')}${item.menuItemId.substring(0, 8)}`;
              }

              return `${item.quantity}x ${itemName}`;
            }).join(', ') || 'Sipariş detayı yok';

            // Status'u düzelt (PENDING -> Pending, PREPARING -> Preparing, etc.)
            let statusText = 'Pending';
            if (order.status === 'PENDING') statusText = 'Pending';
            else if (order.status === 'PREPARING') statusText = 'Preparing';
            else if (order.status === 'READY') statusText = 'Ready';
            else if (order.status === 'DELIVERED') statusText = 'Delivered';
            else if (order.status === 'CANCELLED') statusText = 'Cancelled';
            else statusText = order.status || 'Pending';

            return {
              id: order.id || order.orderNumber || `ORD-${Date.now()}`,
              room: roomNumber,
              items: itemsText,
              amount: `₺${(parseFloat(order.totalAmount) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              status: statusText
            };
          }));
        }

        // Requests
        if (requestsRes && requestsRes.ok) {
          const requestsData = await requestsRes.json();
          const requests = Array.isArray(requestsData) ? requestsData : (requestsData.requests || []);
          setRecentRequests(requests.slice(0, 3).map((req: any) => ({
            id: req.id || `REQ-${req.number || ''}`,
            room: req.room?.number || req.roomId?.replace(/^\s*room[-\s_]*/i, '').trim() || req.roomNumber || '',
            type: req.type || req.description || '',
            priority: req.priority || 'Medium',
            time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''
          })));
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, user]);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PREPARING' || status === 'Preparing') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusUpper === 'READY' || status === 'Ready') {
      return 'bg-green-100 text-green-800';
    } else if (statusUpper === 'DELIVERED' || status === 'Delivered') {
      return 'bg-blue-100 text-blue-800';
    } else if (statusUpper === 'PENDING' || status === 'Pending') {
      return 'bg-gray-100 text-gray-800';
    } else if (statusUpper === 'CANCELLED' || status === 'Cancelled') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
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


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTranslation('dashboard.title')}</h1>
            <p className="text-gray-600">{getTranslation('dashboard.subtitle')}</p>
          </div>

          {/* Dil Seçici */}
          <div className="relative language-selector">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {getCurrentLanguage().flag}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dil Seçenekleri Dropdown */}
            {showLanguageSelector && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageSelector(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${currentLanguage === lang.code
                      ? 'bg-hotel-gold bg-opacity-10'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900">{lang.name}</div>
                      <div className="text-xs text-gray-500">{lang.nativeName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
                    <p className={`ml-2 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
            <h3 className="text-lg font-medium text-gray-900">{getTranslation('dashboard.recent_orders')}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{getTranslation('dashboard.room')} {order.room}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.items}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getTranslation(`k_status_${order.status.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>{getTranslation('dashboard.no_orders')}</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <a href="/management/orders" className="text-sm font-medium text-hotel-gold hover:text-hotel-navy">
              {getTranslation('dashboard.view_all_orders')} →
            </a>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="hotel-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{getTranslation('dashboard.recent_requests')}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{getTranslation('dashboard.room')} {request.room}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{request.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.time}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>{getTranslation('dashboard.no_requests')}</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <a href="/management/requests" className="text-sm font-medium text-hotel-gold hover:text-hotel-navy">
              {getTranslation('dashboard.view_all_requests')} →
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hotel-card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{getTranslation('dashboard.quick_actions')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push('/management/qr-code')}
            className="flex items-center p-4 border-2 border-hotel-gold rounded-lg hover:bg-hotel-gold hover:text-white transition-colors"
          >
            <QrCode className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{getTranslation('dashboard.create_qr')}</span>
          </button>
          <button
            onClick={() => router.push('/management/menu')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">{getTranslation('dashboard.edit_menu')}</span>
          </button>
          <button
            onClick={() => router.push('/management/announcements')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">{getTranslation('dashboard.add_announcement')}</span>
          </button>
          <button
            onClick={() => router.push('/management/users')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">{getTranslation('dashboard.add_staff')}</span>
          </button>
          <button
            onClick={() => router.push('/management/reports')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">{getTranslation('dashboard.view_reports')}</span>
          </button>
          <button
            onClick={() => router.push('/management/settings?tab=social')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-5 h-5 text-hotel-gold mr-3" />
            <span className="text-sm font-medium text-gray-700">{getTranslation('dashboard.social_media')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
