'use client';

import { useState, useEffect } from 'react';
import { useHotelStore } from '@/store/hotelStore';
import { translate } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import { Language, Order, MenuItem } from '@/types';
import { ApiService, RoomStatus } from '@/services/api';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  Timer,
  X
} from 'lucide-react';

export default function KitchenPanel() {
  const { token } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');
  const [orders, setOrders] = useState<Order[]>([]);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);

  const t = (key: string) => translate(key, currentLanguage);

  const getPaymentLabel = (method?: string) => {
    if (!method) return '';
    switch (method) {
      case 'cash': return t('k_payment_cash');
      case 'pos': return t('k_payment_pos');
      case 'room_charge': return t('k_payment_checkout');
      case 'card': return t('k_payment_card');
      default: return '';
    }
  };

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  // Bildirim sesi çalma fonksiyonu
  const playNotificationSound = () => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Ses çalınamadı:', error);
    }
  };

  // Menüyü backend'den yükle
  // Browser tab title'ını ayarla
  useEffect(() => {
    document.title = `${translate('kitchen_panel_title', currentLanguage)} - RoomXQR`;
  }, [currentLanguage]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          let menuItems = data.menu;

          if (!Array.isArray(menuItems)) {
            console.warn('Menu data is not an array:', data);
            menuItems = [];
          }

          const formattedMenu = menuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || 'Diğer',
            image: item.image || '',
            allergens: item.allergens || [],
            calories: item.calories,
            preparationTime: item.preparationTime || 15,
            rating: item.rating || 4,
            available: item.available !== false,
          }));
          setMenu(formattedMenu);
        }
      } catch (error) {
        console.error('Menü yükleme hatası:', error);
      }
    };

    loadMenu();
  }, []);

  // Yemek siparişlerini backend'den yükle
  useEffect(() => {
    const loadOrders = async () => {
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

        // Token'ı localStorage'dan al
        const token = localStorage.getItem('auth_token');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-tenant': tenantSlug,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Backend'den siparişleri al
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          let backendOrders = await response.json();

          if (!Array.isArray(backendOrders)) {
            console.warn('Backend orders is not an array:', backendOrders);
            backendOrders = [];
          }

          // Backend Order formatını frontend Order formatına çevir
          const formattedOrders: Order[] = backendOrders.map((order: any) => {
            const items = Array.isArray(order.items) ? order.items.map((item: any) => ({
              menuItemId: item.menuItemId,
              name: item.menuItem?.name || '',
              quantity: item.quantity,
              price: parseFloat(item.price) || 0,
              specialRequests: item.notes || '',
            })) : [];

            // Status mapping: PENDING -> pending, PREPARING -> preparing, READY -> ready, DELIVERED -> delivered, CANCELLED -> cancelled
            let status: Order['status'] = 'pending';
            if (order.status === 'PENDING') status = 'pending';
            else if (order.status === 'PREPARING') status = 'preparing';
            else if (order.status === 'READY') status = 'ready';
            else if (order.status === 'DELIVERED') status = 'delivered';
            else if (order.status === 'CANCELLED') status = 'cancelled';

            // Oda numarasını al (UUID yerine "101" gibi görünmesi için)
            const displayRoomNumber = order.room?.number || order.roomId.replace(/^\s*room[-\s_]*/i, '').trim();

            return {
              id: order.id,
              roomId: displayRoomNumber,
              guestId: order.guestId,
              items: items,
              totalAmount: parseFloat(order.totalAmount) || 0,
              status: status,
              paymentStatus: 'paid' as const,
              paymentMethod: order.paymentMethod || undefined,
              specialInstructions: order.notes || '',
              createdAt: new Date(order.createdAt),
              deliveryTime: order.status === 'DELIVERED' ? new Date(order.updatedAt) : undefined,
            } as Order;
          });

          // Mevcut siparişlerle karşılaştır (yeni siparişler için ses çal)
          setOrders(prev => {
            const existingIds = new Set(prev.map(order => order.id));
            const newOrders = formattedOrders.filter(order => !existingIds.has(order.id));

            // Yeni sipariş varsa ses çal
            if (newOrders.length > 0) {
              playNotificationSound();
            }

            // Tüm siparişleri güncelle (backend'den gelen güncel veriler)
            return formattedOrders;
          });

          // Odaları çek
          const roomsData = token ? await ApiService.getRooms(token) : [];
          setRooms(Array.isArray(roomsData) ? roomsData : []);
        }
      } catch (error) {
        console.error('Sipariş yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Her 10 saniyede bir güncelle
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);


  const filteredOrders = orders
    .filter(order => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch = order.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item =>
          menu.find(m => m.id === item.menuItemId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      // Teslim edilen ve iptal edilen siparişler en alta, diğerleri duruma göre sırala
      if ((a.status === 'delivered' || a.status === 'cancelled') &&
        (b.status !== 'delivered' && b.status !== 'cancelled')) return 1;
      if ((b.status === 'delivered' || b.status === 'cancelled') &&
        (a.status !== 'delivered' && a.status !== 'cancelled')) return -1;

      // Aynı durumda olanlar için tarihe göre sırala (yeni olanlar üstte)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Backend'e sipariş durumunu güncelle
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

      // Token'ı localStorage'dan al
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        },
        body: JSON.stringify({
          status: newStatus === 'ready' ? 'READY' :
            newStatus === 'delivered' ? 'DELIVERED' :
              newStatus === 'preparing' ? 'PREPARING' :
                newStatus === 'cancelled' ? 'CANCELLED' : 'PENDING'
        })
      });

      if (response.ok) {
        // Local state'i güncelle
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? {
              ...order,
              status: newStatus,
              ...(newStatus === 'delivered' && { deliveryTime: new Date() })
            }
            : order
        ));

        // Müşteriye bildirim gönder
        const order = orders.find(o => o.id === orderId);
        if (order) {
          try {
            if (newStatus === 'preparing') {
              await ApiService.sendNotificationToGuest(
                `room-${order.roomId}`,
                `Siparişiniz hazırlanmaya başlandı. Tahmini süre: ${calculateTotalPreparationTime(order)} dakika.`,
                'info'
              );
            } else if (newStatus === 'ready') {
              await ApiService.sendNotificationToGuest(
                `room-${order.roomId}`,
                `Siparişiniz hazır! Personel tarafından oda numaranıza teslim edilecek.`,
                'info'
              );
            } else if (newStatus === 'delivered') {
              await ApiService.sendNotificationToGuest(
                `room-${order.roomId}`,
                `Siparişiniz teslim edildi! Afiyet olsun.`,
                'info'
              );
            } else if (newStatus === 'cancelled') {
              await ApiService.sendNotificationToGuest(
                `room-${order.roomId}`,
                `Siparişiniz iptal edildi. Resepsiyon ile iletişime geçebilirsiniz.`,
                'info'
              );
            }
          } catch (error) {
            console.error('Bildirim gönderme hatası:', error);
          }
        }
      }
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <AlertCircle className="w-4 h-4" />;
      case 'preparing': return <Play className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateTotalPreparationTime = (order: Order) => {
    return order.items.reduce((total, item) => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return total + (menuItem?.preparationTime || 0);
    }, 0);
  };

  const getMenuItemName = (menuItemId: string, itemName?: string) => {
    // Eğer itemName varsa onu kullan (QR menüden gelen siparişler için)
    if (itemName) {
      return itemName;
    }
    const menuItem = menu.find(m => m.id === menuItemId);
    return menuItem?.name || t('k_unknown_product');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-hotel-sage rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {translate('kitchen_panel_title', currentLanguage)}
                </h1>
                <p className="text-gray-600">
                  {translate('kitchen_panel_desc', currentLanguage)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tüm Odalar Grid */}
        <div className="hotel-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-900">{t('k_all_rooms')}</h2>

            {/* Floor Tabs (Registerkarteler) */}
            <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 w-full sm:w-auto no-scrollbar">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFloor === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {t('k_all_rooms')}
              </button>
              {Array.from(new Set(rooms.map(r => r.floor || 1))).sort((a, b) => a - b).map(floor => (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFloor === floor
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {floor}. {t('k_floor')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {isLoading && rooms.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-8 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span>{t('k_loading_rooms')}</span>
              </div>
            ) : rooms.length > 0 ? (
              rooms
                .filter(room => selectedFloor === 'all' || (room.floor || 1) === selectedFloor)
                .map((room) => {
                  const roomNum = String(room.number ?? room.roomId.replace(/^\s*room[-\s_]*/i, '').trim()).trim();
                  const hasActiveOrder = orders.some(o =>
                    String(o.roomId || '').replace(/^\s*room[-\s_]*/i, '').trim() === roomNum && o.status === 'pending'
                  );
                  return (
                    <div
                      key={roomNum}
                      onClick={() => setSearchTerm(roomNum)}
                      className={`
                      p-3 rounded-lg border-2 text-center transition-all cursor-pointer relative overflow-hidden hover:shadow-md
                      ${hasActiveOrder ? 'animate-pulse border-red-500 bg-red-50 shadow-red-200' : ''}
                      ${!hasActiveOrder && room.status === 'occupied' ? 'bg-green-100 border-green-200 text-green-800' : ''}
                      ${!hasActiveOrder && room.status !== 'occupied' ? 'bg-white border-gray-200 text-gray-400' : ''}
                    `}
                    >
                      <div className={`font-bold text-lg ${hasActiveOrder ? 'text-red-700' : ''}`}>{roomNum}</div>
                      <div className="text-xs truncate font-medium">
                        {hasActiveOrder ? `❗️ ${t('k_order_exists')}` : (room.guestName || (room.status === 'occupied' ? t('k_occupied') : t('k_vacant')))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                <p>{t('k_no_rooms')}</p>
                <p className="text-sm mt-2">{t('k_no_rooms_hint')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="hotel-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('k_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {[
                { id: 'all', label: t('k_filter_all'), count: orders.length },
                { id: 'pending', label: t('k_filter_pending'), count: orders.filter(o => o.status === 'pending').length },
                { id: 'preparing', label: t('k_filter_preparing'), count: orders.filter(o => o.status === 'preparing').length },
                { id: 'ready', label: t('k_filter_ready'), count: orders.filter(o => o.status === 'ready').length },
                { id: 'delivered', label: t('k_filter_delivered'), count: orders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: t('k_filter_cancelled'), count: orders.filter(o => o.status === 'cancelled').length }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === filterOption.id
                    ? 'bg-hotel-gold text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="hotel-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {t('room')} {order.roomId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>
                        {order.status === 'pending' ? t('k_status_pending') :
                          order.status === 'confirmed' ? t('k_status_confirmed') :
                            order.status === 'preparing' ? t('k_status_preparing') :
                              order.status === 'ready' ? t('k_status_ready') :
                                order.status === 'delivered' ? t('k_status_delivered') : t('k_status_cancelled')}
                      </span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getPaymentLabel(order.paymentMethod)}
                    </span>
                    {order.status === 'preparing' && (
                      <span className="text-sm text-orange-600 font-medium">
                        {t('k_prep_time')}: {calculateTotalPreparationTime(order)} {t('k_min')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('k_order_details')}:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.quantity}x {getMenuItemName(item.menuItemId, (item as any).name)}
                            </span>
                            <span className="font-medium text-gray-900">
                              {(item.price * item.quantity).toFixed(2)}₺
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('k_order_info')}:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{t('k_order_no')}:</span>
                          <span className="font-medium text-gray-900 font-mono">{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('k_total_amount')}:</span>
                          <span className="font-medium text-gray-900">{order.totalAmount.toFixed(2)}₺</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('k_payment')}:</span>
                          <span className="font-medium text-gray-900">
                            {getPaymentLabel(order.paymentMethod) || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('k_estimated_time')}:</span>
                          <span className="font-medium text-gray-900">
                            {calculateTotalPreparationTime(order)} {t('k_min')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-blue-900">{t('k_special_instructions')}:</p>
                      <p className="text-sm text-blue-700">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{t('k_start_preparing')}</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOrderStatusChange(order.id, 'ready')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('k_mark_ready')}</span>
                      </button>
                      <button
                        onClick={() => setCancelOrderId(order.id)}
                        className="bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 p-2 rounded-lg transition-colors"
                        title="İptal Et"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {order.status === 'ready' && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                      ✅ {t('k_ready_waiting')}
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                      ✅ {t('k_delivered_label')}
                      <div className="text-xs mt-1">
                        {order.deliveryTime && (
                          <>{t('k_prep_time')}: {Math.round((new Date(order.deliveryTime).getTime() - new Date(order.createdAt).getTime()) / 60000)} {t('k_min')}</>
                        )}
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                      ❌ {t('k_cancelled_label')}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t('k_details')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="hotel-card p-12 text-center">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('k_no_orders')}</h3>
            <p className="text-gray-600">
              {searchTerm ? t('k_no_orders_search') : t('k_no_orders_empty')}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('k_order_details')} - {t('room')} {selectedOrder.roomId}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('k_order_items')}:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {getMenuItemName(item.menuItemId, (item as any).name)}
                        </p>
                        {item.specialRequests && (
                          <p className="text-sm text-gray-600">{item.specialRequests}</p>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}₺
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>{t('k_total_amount')}:</span>
                  <span>{selectedOrder.totalAmount.toFixed(2)}₺</span>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('k_special_instructions')}:</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('k_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Modal */}
      {showMenuModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMenuModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('k_menu_management')}</h3>

            <div className="space-y-4">
              {menu.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{item.price}₺</span>
                      <span>{item.preparationTime} {t('k_min')}</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setMenu(prev => prev.map(m =>
                          m.id === item.id ? { ...m, available: !m.available } : m
                        ));
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${item.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {item.available ? t('available') : t('unavailable')}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowMenuModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('k_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İptal Onay Modalı */}
      {cancelOrderId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setCancelOrderId(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('k_cancel_order')}
            </h3>

            <p className="text-gray-700 mb-6">
              {t('k_cancel_confirm')}
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setCancelOrderId(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('k_give_up')}
              </button>
              <button
                onClick={() => {
                  handleOrderStatusChange(cancelOrderId, 'cancelled');
                  setCancelOrderId(null);
                }}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('k_cancel_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}