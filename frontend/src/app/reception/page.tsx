'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHotelStore } from '@/store/hotelStore';
import { sampleRequests } from '@/lib/sampleData';
import { translate } from '@/lib/translations';
import { translateText } from '@/lib/translateService';
import { Language, Request } from '@/types';
import { ApiService, GuestRequest, RoomStatus } from '@/services/api';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import {
  Hotel,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  User,
  Calendar,
  Filter,
  Search,
  Volume2,
  VolumeX,
  Zap,
  Bell,
  X,
  Utensils
} from 'lucide-react';
import { Order } from '@/types';

export default function ReceptionPanel() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');

  const t = (key: string) => translate(key, currentLanguage);

  const getLocale = () => {
    switch (currentLanguage) {
      case 'tr': return 'tr-TR';
      case 'de': return 'de-DE';
      default: return 'en-US';
    }
  };

  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'pending' | 'in_progress'>('all');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<GuestRequest | null>(null);
  // Delivery Modal State
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<Order | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [checkoutConfirm, setCheckoutConfirm] = useState<{ roomId: string, pendingPayments: any[], totalAmount: number } | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoomChange, setShowRoomChange] = useState(false);
  const [selectedNewRoom, setSelectedNewRoom] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInRoomId, setCheckInRoomId] = useState('');
  const [newRequests, setNewRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedToday: 0,
    averageResponseTime: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastRequestCount, setLastRequestCount] = useState(0);



  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
  const API_BASE_URL = /\/api\/?$/.test(API_BASE) ? API_BASE.replace(/\/$/, '') : `${API_BASE.replace(/\/$/, '')}/api`;

  // Bildirim sistemi - sadece yeni istekler için
  const { addNotification, notifications, unreadCount, markAsRead } = useNotifications();

  // Oda bilgilerini getir — önce API'den gelen rooms/orders kullanılır
  const getRoomInfo = (roomId: string): {
    floor: string;
    type: string;
    guestName: string;
    checkOut: string;
    phone: string;
    email: string;
    payments: { id: string; item: string; amount: number; date: string; status: string }[];
  } => {
    const roomNum = String(roomId || '').replace(/^\s*room[-\s_]*/i, '').trim().trim();
    const fromApi = rooms.find(
      r => String(r.number ?? r.roomId ?? '').replace(/^\s*room[-\s_]*/i, '').trim().trim() === roomNum
    );
    if (fromApi) {
      const checkOutStr = fromApi.checkOut
        ? new Date(fromApi.checkOut).toLocaleDateString(getLocale())
        : '—';
      const roomIdForOrders = fromApi.roomId;
      const roomOrders = Array.isArray(orders)
        ? orders.filter((o: any) => (o.roomId && (o.roomId === roomIdForOrders || String(o.roomId || '').replace(/^\s*room[-\s_]*/i, '').trim() === roomNum)))
        : [];
      const toNum = (v: any) => (typeof v === 'number' ? v : parseFloat(String(v)) || 0);
      const payments = roomOrders.map((o: any, i: number) => ({
        id: o.id || `ord-${i}`,
        item: o.notes || t('r_order_fallback'),
        amount: toNum(o.totalAmount) || (Array.isArray(o.items) ? o.items.reduce((s: number, it: any) => s + toNum(it?.price) * (it?.quantity ?? 1), 0) : 0),
        date: o.createdAt ? new Date(o.createdAt).toLocaleString(getLocale()) : '—',
        status: (o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'paid' : 'pending') as string
      }));
      return {
        floor: fromApi.floor != null ? `${t('r_floor_n')} ${fromApi.floor}` : '—',
        type: fromApi.type || 'Standard',
        guestName: fromApi.guestName || '—',
        checkOut: checkOutStr,
        phone: '—',
        email: '—',
        payments
      };
    }
    return {
      floor: '—',
      type: 'Standard',
      guestName: '—',
      checkOut: '—',
      phone: '—',
      email: '—',
      payments: []
    };
  };

  // Ses bildirimi fonksiyonu - daha hızlı ve basit
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Daha basit ve hızlı ses bildirimi
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Kısa ve net ses
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Yüksek frekans - dikkat çekici
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);

      // Hızlı fade
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  }, [soundEnabled]);

  // Veri yükleme fonksiyonu
  const loadData = useCallback(async () => {
    if (authLoading) return;

    try {
      setIsLoading(true);
      const [requestsData, statsData, roomsData, ordersData] = await Promise.all([
        ApiService.getGuestRequests(token || undefined),
        token ? ApiService.getStatistics(token) : Promise.resolve({ totalRequests: 0, pendingRequests: 0, completedToday: 0, averageResponseTime: 0 }),
        ApiService.getRooms(token || undefined),
        // Fetch orders
        fetch(`${API_BASE_URL}/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-tenant': typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo',
          }
        }).then(res => res.ok ? res.json() : [])
      ]);


      if (!Array.isArray(requestsData)) {
        console.warn('Requests data is not an array:', requestsData);
      }
      const safeRequestsData = Array.isArray(requestsData) ? requestsData : [];

      if (!Array.isArray(roomsData)) {
        console.warn('Rooms data is not an array:', roomsData);
      }
      const safeRoomsData = Array.isArray(roomsData) ? roomsData : [];

      const safeOrdersData = Array.isArray(ordersData) ? ordersData : [];
      setOrders(safeOrdersData);

      console.log('Resepsiyon paneli - Yüklenen istekler:', safeRequestsData);
      console.log('Resepsiyon paneli - LocalStorage içeriği:', localStorage.getItem('roomapp_requests'));

      // Filtre sayılarını debug et (yemek siparişleri hariç)
      const nonFoodRequests = safeRequestsData.filter(r => r.type !== 'food_order');
      const urgentCount = nonFoodRequests.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
      const pendingCount = safeRequestsData.filter(r => r.status === 'pending').length;
      const inProgressCount = safeRequestsData.filter(r => r.status === 'in_progress' || r.status === 'completed').length;
      console.log('Filtre sayıları (yemek siparişleri hariç):', {
        total: safeRequestsData.length,
        nonFoodTotal: nonFoodRequests.length,
        urgent: urgentCount,
        pending: pendingCount,
        inProgress: inProgressCount
      });

      // Yeni istek kontrolü - ses bildirimi için (yemek siparişleri hariç)
      const nonFoodRequestCount = safeRequestsData.filter(r => r.type !== 'food_order').length;
      if (nonFoodRequestCount > lastRequestCount && lastRequestCount > 0) {
        // Ses bildirimi hemen çal
        playNotificationSound();

        // Yeni gelen istekleri bul ve detaylı bildirim gönder (yemek siparişleri hariç)
        const newRequests = safeRequestsData.filter(r => r.type !== 'food_order').slice(0, nonFoodRequestCount - lastRequestCount);
        newRequests.forEach(request => {
          const roomObj = safeRoomsData.find(r => r.roomId === request.roomId);
          const roomNumber = roomObj?.number || request.roomId.replace(/^\s*room[-\s_]*/i, '').trim();

          // İstek türüne göre bildirim türü belirle
          let notificationType: 'info' | 'warning' | 'success' = 'info';
          if ((request.type || '').toLowerCase() === 'maintenance') {
            notificationType = 'warning'; // Teknik arıza - sarı
          } else if ((request.type || '').toLowerCase() === 'housekeeping') {
            notificationType = 'success'; // Temizlik - yeşil
          } else if ((request.type || '').toLowerCase() === 'concierge') {
            notificationType = 'info'; // Konsiyerj - mavi
          }

          addNotification({
            type: notificationType,
            title: `${t('room')} ${roomNumber}`,
            message: request.description,
          });
        });
      }
      setLastRequestCount(nonFoodRequestCount);

      // Hızlı seçim öğelerinin çeviri sözlüğü
      const quickItemsTranslation: Record<string, Record<string, string>> = {
        'quick.towel': { tr: 'Havlu', en: 'Towel', de: 'Handtuch', ru: 'Полотенце', fr: 'Serviette', es: 'Toalla', it: 'Asciugamano', ar: 'منشفة' },
        'quick.slippers': { tr: 'Terlik', en: 'Slippers', de: 'Hausschuhe', ru: 'Тапочки', fr: 'Pantoufles', es: 'Zapatillas', it: 'Ciabatte', ar: 'شبشب' },
        'quick.toothpaste': { tr: 'Diş Macunu', en: 'Toothpaste', de: 'Zahnpasta', ru: 'Зубная паста', fr: 'Dentifrice', es: 'Pasta de dientes', it: 'Dentifricio', ar: 'معجون أسنان' },
        'quick.pillow': { tr: 'Yastık', en: 'Pillow', de: 'Kopfkissen', ru: 'Подушка', fr: 'Oreiller', es: 'Almohada', it: 'Cuscino', ar: 'وسادة' },
        'quick.blanket': { tr: 'Battaniye', en: 'Blanket', de: 'Bettdecke', ru: 'Одеяло', fr: 'Couverture', es: 'Manta', it: 'Coperta', ar: 'بطانية' },
        'quick.shampoo': { tr: 'Şampuan', en: 'Shampoo', de: 'Shampoo', ru: 'Шампунь', fr: 'Shampooing', es: 'Champú', it: 'Shampoo', ar: 'شامبو' },
        'quick.soap': { tr: 'Sabun', en: 'Soap', de: 'Seife', ru: 'Мыло', fr: 'Savon', es: 'Jabón', it: 'Sapone', ar: 'صابون' },
        'quick.water': { tr: 'Su', en: 'Water', de: 'Wasser', ru: 'Вода', fr: 'Eau', es: 'Agua', it: 'Acqua', ar: 'ماء' }
      };

      // Resepsiyon dili (currentLanguage state'inden alınıyor, ancak burada doğrudan erişilemiyor olabilir,
      // bu yüzden ya prop olarak geçirilmeli ya da state güncellenirken işlenmeli.
      // Şimdilik render sırasında işlenecek şekilde orijinal veriyi saklıyoruz,
      // ama description alanını güncellemek daha iyi olabilir.)

      const processedRequests = safeRequestsData.map(req => {
        // Oda numarasını bul (UUID yerine "101" gibi görünmesi için)
        const roomObj = safeRoomsData.find(r => r.roomId === req.roomId);
        const displayRoomNumber = roomObj?.number || req.roomId.replace(/^\s*room[-\s_]*/i, '').trim();

        // Format: "2 x quick.water" kontrolü
        const match = req.description.match(/^(\d+)\s+x\s+(.+)$/);
        if (match) {
          const [, qty, key] = match;
          const translationDict = quickItemsTranslation[key];
          if (translationDict) {
            return {
              ...req,
              displayRoomNumber,
              originalDescription: req.description,
              isTranslatable: true,
              translationKey: key,
              quantity: qty
            };
          }
        }
        return {
          ...req,
          displayRoomNumber
        };
      });

      setRequests(processedRequests);
      setStatistics(statsData);
      setRooms(safeRoomsData);

      // Yeni istek kontrolü - ses bildirimi için 
      // (yemek siparişleri hariç FAKAT hazır olan yemek siparişleri dahil edilmeli mi? Şimdilik sadece yeni talepler)

      const newCount = requestsData.filter(r =>
        new Date(r.createdAt).getTime() > Date.now() - 300000 // Son 5 dakika
      ).length;
      setNewRequests(newCount);

    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback: Mock data kullan
      setRequests(sampleRequests as any[]);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, lastRequestCount, playNotificationSound, token]);

  // Veri yükleme
  // Browser tab title'ını ayarla
  useEffect(() => {
    document.title = t('r_document_title');
  }, [currentLanguage]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 5 saniyede bir güncelle (yeni istekler için)

    // İnternet geri geldiğinde anında yenile
    window.addEventListener('online', loadData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', loadData);
    };
  }, [loadData]);

  // Test için: Sayfa yüklendiğinde bir test bildirimi ekle (isteğe bağlı)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     addNotification({
  //       type: 'info',
  //       title: 'Sistem Hazır',
  //       message: 'Resepsiyon paneli başarıyla yüklendi. Yeni istekler burada görünecek.',
  //     });
  //   }, 2000);
  //   
  //   return () => clearTimeout(timer);
  // }, [addNotification]);

  // İstek türüne göre otomatik cevaplar
  const getQuickResponses = (requestType: string) => {
    return [
      {
        id: 'in_progress',
        text: t('r_quick_resp_in_progress'),
        icon: Clock
      },
      {
        id: 'follow_up',
        text: t('r_quick_resp_follow_up'),
        icon: MessageSquare
      },
      {
        id: 'delayed',
        text: t('r_quick_resp_delayed'),
        icon: Clock
      }
    ];
  };

  const filteredRequests = requests
    .filter(request => {
      // Yemek siparişlerini resepsiyon panelinden hariç tut
      if (request.type === 'food_order') {
        return false;
      }

      const matchesFilter = filter === 'all' ||
        (filter === 'urgent' && (request.priority === 'urgent' || request.priority === 'high')) ||
        (filter === 'pending' && request.status === 'pending') ||
        (filter === 'in_progress' && (request.status === 'in_progress' || request.status === 'completed'));

      const matchesSearch = request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.roomId.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      // Önce durum sırasına göre (pending > in_progress > completed) - tamamlanan istekler en alta
      const statusOrder = { pending: 4, in_progress: 3, completed: 1, cancelled: 0 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 0;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 0;

      if (aStatus !== bStatus) {
        return bStatus - aStatus;
      }

      // Sonra öncelik sırasına göre (urgent > high > medium > low)
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Son olarak tarihe göre (en yeni üstte)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleQuickResponse = async (requestId: string, responseType: string, requestType: string) => {
    const quickResponses = getQuickResponses(requestType);
    const response = quickResponses.find(r => r.id === responseType);
    if (!response) return;

    try {
      // Yanıt verildiğinde otomatik olarak completed durumuna geç
      const newStatus = 'completed';

      // Önce talep durumunu güncelle
      await ApiService.updateRequestStatus(requestId, newStatus as any, response.text);

      // Müşteriye bildirim gönder
      const request = requests.find(req => req.id === requestId);
      if (request) {
        console.log('Sending notification to guest:', {
          requestId,
          roomId: request.roomId,
          message: response.text,
          allRequests: requests.map(r => ({ id: r.id, roomId: r.roomId }))
        });
        await ApiService.sendNotificationToGuest(request.roomId, response.text, 'response');
        console.log('Notification sent successfully to:', request.roomId);
      } else {
        console.error('Request not found:', requestId, 'Available requests:', requests.map(r => r.id));
      }

      // Local state'i güncelle
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? {
            ...req,
            status: newStatus,
            notes: response.text,
            updatedAt: new Date().toISOString()
          }
          : req
      ));

      console.log('Quick response sent to guest:', response.text);

    } catch (error) {
      console.error('Error updating request:', error);
      // Sadece console'da hata göster, resepsiyon panelinde bildirim gösterme
      console.error('Yanıt gönderilirken bir hata oluştu:', error);
    }

    // Close modal if open
    setSelectedRequest(null);
  };

  // Özel mesaj gönderme fonksiyonu
  const handleCustomMessage = async (requestId: string, message: string) => {
    if (!message.trim()) return;

    try {
      // Özel mesaj gönderildiğinde de completed durumuna geç
      await ApiService.updateRequestStatus(requestId, 'completed', message);

      // Müşteriye özel mesajı bildirim olarak gönder
      const request = requests.find(req => req.id === requestId);
      if (request) {
        await ApiService.sendNotificationToGuest(request.roomId, message, 'response');
      }

      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? {
            ...req,
            status: 'completed',
            notes: message,
            updatedAt: new Date().toISOString()
          }
          : req
      ));

      console.log('Custom message sent to guest:', message);

      setCustomMessage('');
      setSelectedRequest(null);

    } catch (error) {
      console.error('Error sending custom message:', error);
      // Sadece console'da hata göster, resepsiyon panelinde bildirim gösterme
      console.error('Mesaj gönderilirken bir hata oluştu:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'food_order': return '🍽️';
      case 'housekeeping': return '🧹';
      case 'maintenance': return '🔧';
      case 'concierge': return '🏨';
      default: return '📋';
    }
  };

  // Çıkış işlemi fonksiyonu
  const handleCheckout = async (roomId: string) => {
    try {
      // Tüm bekleyen ödemeleri al
      const roomInfo = getRoomInfo(roomId);
      const pendingPayments = roomInfo.payments.filter(p => p.status === 'pending');
      const totalAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Onay popup'ı göster
      setCheckoutConfirm({
        roomId,
        pendingPayments,
        totalAmount
      });

    } catch (error) {
      console.error('Error processing checkout:', error);
      addNotification({
        type: 'error',
        title: t('r_notif_error'),
        message: t('r_notif_checkout_error'),
      });
    }
  };

  // Mevcut odalar listesi — API'den gelen rooms kullanılır
  const availableRooms = rooms.map(r => ({
    id: r.roomId || `room-${r.number}`,
    number: String(r.number ?? r.roomId ?? '').replace(/^\s*room[-\s_]*/i, '').trim(),
    floor: r.floor != null ? `${t('r_floor_n')} ${r.floor}` : '—',
    type: r.type || 'Standard'
  }));

  // Oda değişikliği fonksiyonu
  const handleRoomChange = async (fromRoomId: string, toRoomId: string) => {
    try {
      // Tüm oda bilgilerini yeni odaya taşı
      const roomInfo = getRoomInfo(fromRoomId);

      // Mock API çağrısı - gerçek uygulamada backend'e gönderilecek
      await ApiService.changeRoom(fromRoomId, toRoomId, roomInfo);

      // Local state'i güncelle
      setRequests(prev => prev.map(req =>
        req.roomId === fromRoomId
          ? { ...req, roomId: toRoomId }
          : req
      ));

      addNotification({
        type: 'success',
        title: t('r_notif_room_change'),
        message: `${t('room')} ${fromRoomId.replace(/^\s*room[-\s_]*/i, '').trim()} → ${t('room')} ${toRoomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_room_change_done')}`,
      });

      setShowRoomChange(false);
      setSelectedNewRoom('');

    } catch (error) {
      console.error('Error changing room:', error);
      addNotification({
        type: 'error',
        title: t('r_notif_error'),
        message: t('r_notif_room_change_error'),
      });
    }
  };

  // Müşteri check-in işlemi
  const processCheckIn = async (roomId: string, guestData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    language?: string;
  }) => {
    try {
      const checkInResult = await ApiService.checkInGuest(roomId, guestData);

      if (checkInResult.success) {
        addNotification({
          type: 'success',
          title: t('r_notif_checkin_done'),
          message: `${guestData.firstName} ${guestData.lastName} ${t('room')} ${roomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_checkin_msg')}`,
        });

        if (checkInResult.qrCode) {
          addNotification({
            type: 'info',
            title: t('r_notif_qr_created'),
            message: `${t('room')} ${roomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_qr_created_msg')}`,
          });
        }

        setShowCheckInModal(false);
        setCheckInRoomId('');
      } else {
        addNotification({
          type: 'error',
          title: t('r_notif_error'),
          message: t('r_notif_checkin_error'),
        });
      }
    } catch (error) {
      console.error('Error processing check-in:', error);
      addNotification({
        type: 'error',
        title: t('r_notif_error'),
        message: t('r_notif_checkin_process_error'),
      });
    }
  };

  // Gerçek çıkış işlemi
  const processCheckout = async (roomId: string) => {
    try {
      const roomInfo = getRoomInfo(roomId);
      const pendingPayments = roomInfo.payments.filter(p => p.status === 'pending');

      if (pendingPayments.length > 0) {
        // Toplu ödeme işlemi
        for (const payment of pendingPayments) {
          await ApiService.updatePaymentStatus(payment.id, 'paid');
        }

        addNotification({
          type: 'success',
          title: t('r_notif_payments_received'),
          message: `${pendingPayments.length} ${t('r_notif_payments_received_msg')} ${pendingPayments.reduce((sum, p) => sum + p.amount, 0)} ${t('r_notif_payments_received_suffix')}`,
        });
      }

      // Oda isteklerini temizle
      await ApiService.clearRoomRequests(roomId);

      // Yeni: Müşteri check-out işlemi (QR kod otomatik sıfırlama ile)
      const checkoutResult = await ApiService.checkOutGuest(roomId);

      if (checkoutResult.success) {
        addNotification({
          type: 'success',
          title: t('r_notif_checkout_done'),
          message: `${t('room')} ${roomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_checkout_done_msg')}`,
        });

        if (checkoutResult.qrCode) {
          addNotification({
            type: 'info',
            title: t('r_notif_qr_updated'),
            message: `${t('room')} ${roomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_qr_updated_msg')}`,
          });
        }
      } else {
        await ApiService.resetRoomQR(roomId);

        addNotification({
          type: 'success',
          title: t('r_notif_checkout_done'),
          message: `${t('room')} ${roomId.replace(/^\s*room[-\s_]*/i, '').trim()} ${t('r_notif_checkout_alt_msg')}`,
        });
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      addNotification({
        type: 'error',
        title: t('r_notif_error'),
        message: t('r_notif_checkout_error'),
      });
    }
  };

  // Hazır siparişleri filtrele
  const readyOrders = orders.filter(o => (o.status as string || '').toLowerCase() === 'ready');

  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case 'cash': return t('r_payment_cash');
      case 'pos': return t('r_payment_pos');
      case 'room_charge': return t('r_payment_room_charge');
      case 'online': return t('r_payment_online');
      case 'card': return t('r_payment_card');
      default: return t('r_payment_unspecified');
    }
  };

  const handleOrderDelivery = (order: Order) => {
    setSelectedDeliveryOrder(order);
  };

  const confirmOrderDelivery = async () => {
    if (!selectedDeliveryOrder) return;
    const orderId = selectedDeliveryOrder.id;

    try {
      const tenantSlug = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo';
      await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        },
        body: JSON.stringify({ status: 'DELIVERED' })
      });

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));

      addNotification({
        type: 'success',
        title: t('r_notif_delivered'),
        message: t('r_notif_delivered_msg'),
      });

    } catch (error) {
      console.error('Order update failed', error);
      addNotification({
        type: 'error',
        title: t('r_notif_error'),
        message: t('r_notif_delivery_error'),
      });
    } finally {
      setSelectedDeliveryOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Hotel className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {user?.hotel?.name || t('r_hotel_fallback')} {t('r_reception')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('r_manage_requests')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Test Bildirim Butonu */}
              {/* Bildirim Butonu */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${unreadCount > 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  title={t('r_notifications')}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as Language)}
                className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="de">🇩🇪 Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bildirim Dropdown */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute top-20 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('r_notifications')}</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('r_no_notifications')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:opacity-80 transition-opacity ${notification.read
                        ? 'opacity-60'
                        : notification.type === 'success'
                          ? 'bg-green-50 border-green-400'
                          : notification.type === 'error'
                            ? 'bg-red-50 border-red-400'
                            : notification.type === 'warning'
                              ? 'bg-yellow-50 border-yellow-400'
                              : 'bg-blue-50 border-blue-400'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            {notification.timestamp.toLocaleString(getLocale())}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hazır Siparişler Bölümü */}
      {readyOrders.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                <Utensils className="w-6 h-6" />
                {t('r_ready_orders')} ({readyOrders.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow border border-green-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      {t('room')} {String(order.roomId).replace(/^\s*room[-\s_]*/i, '').trim()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-3 space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx}>- {item.quantity}x {item.menuItem?.name || item.name || t('r_product_fallback')}</li>
                    ))}
                  </ul>
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${order.paymentMethod === 'room_charge' ? 'bg-blue-100 text-blue-800' :
                      (order.paymentMethod as string) === 'online' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800' // Nakit/POS
                      }`}>
                      {getPaymentLabel(order.paymentMethod)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOrderDelivery(order)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('r_deliver')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-900">{t('r_all_rooms')}</h2>

            {/* Floor Tabs (Registerkarteler) */}
            <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 w-full sm:w-auto no-scrollbar">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFloor === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {t('r_all_rooms')}
              </button>
              {Array.from(new Set(rooms.map(r => r.floor || 1))).sort((a: any, b: any) => a - b).map(floor => (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFloor === floor
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {floor}. {t('r_floor')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {isLoading && rooms.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-8 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span>{t('r_loading_rooms')}</span>
              </div>
            ) : rooms.length > 0 ? (
              rooms
                .filter(room => selectedFloor === 'all' || (room.floor || 1) === selectedFloor)
                .map((room) => {
                  const roomNum = String(room.number ?? room.roomId.replace(/^\s*room[-\s_]*/i, '').trim()).trim();
                  const hasActiveRequest = requests.some(r =>
                    String(r.roomId || '').replace(/^\s*room[-\s_]*/i, '').trim() === roomNum && r.status === 'pending'
                  );
                  return (
                    <div
                      key={roomNum}
                      onClick={() => setSearchTerm(roomNum)}
                      className={`
                      p-3 rounded-lg border-2 text-center transition-all cursor-pointer relative overflow-hidden hover:shadow-md
                      ${hasActiveRequest ? 'animate-pulse border-red-500 bg-red-50 shadow-red-200' : ''}
                      ${!hasActiveRequest && room.status === 'occupied' ? 'bg-green-100 border-green-200 text-green-800' : ''}
                      ${!hasActiveRequest && room.status !== 'occupied' ? 'bg-white border-gray-200 text-gray-400' : ''}
                    `}
                    >
                      <div className={`font-bold text-lg ${hasActiveRequest ? 'text-red-700' : ''}`}>{roomNum}</div>
                      <div className="text-xs truncate font-medium">
                        {hasActiveRequest ? `❗️ ${t('r_has_request')}` : (room.guestName || (room.status === 'occupied' ? t('r_occupied') : t('r_vacant')))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                <p>{t('r_no_rooms')}</p>
                <p className="text-sm mt-2">{t('r_no_rooms_hint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('r_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: t('r_filter_all'), count: requests.filter(r => r.type !== 'food_order').length },
                { id: 'urgent', label: t('r_filter_urgent'), count: requests.filter(r => r.type !== 'food_order' && (r.priority === 'urgent' || r.priority === 'high')).length },
                { id: 'pending', label: t('r_filter_pending'), count: requests.filter(r => r.type !== 'food_order' && r.status === 'pending').length },
                { id: 'in_progress', label: t('r_filter_in_progress'), count: requests.filter(r => r.type !== 'food_order' && (r.status === 'in_progress' || r.status === 'completed')).length }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm ${filter === filterOption.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('room')} {(request as any).displayRoomNumber || request.roomId.replace(/^\s*room[-\s_]*/i, '').trim()}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(request.priority)}`}>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(request.priority)}
                          <span>{request.priority === 'urgent' ? t('r_priority_high') :
                            request.priority === 'high' ? t('r_priority_high') :
                              request.priority === 'medium' ? t('r_priority_medium') :
                                request.priority === 'low' ? t('r_priority_low') : String(request.priority || '').toUpperCase()}</span>
                        </div>
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? t('r_status_pending') :
                          request.status === 'in_progress' ? t('r_status_in_progress') :
                            request.status === 'completed' ? t('r_status_completed') : t('r_status_cancelled')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getRequestTypeIcon(request.type)}</span>
                      <span>{request.type?.toLowerCase() === 'housekeeping' ? t('r_type_housekeeping') :
                        request.type?.toLowerCase() === 'maintenance' ? t('r_type_maintenance') :
                          request.type?.toLowerCase() === 'concierge' ? t('r_type_concierge') :
                            request.type?.toLowerCase() === 'food_order' ? t('r_type_food_order') : request.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(request.createdAt).toLocaleString(getLocale())}</span>
                    </div>
                  </div>

                  <RequestDescription
                    text={request.description}
                    targetLang={currentLanguage}
                  />

                  {request.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-blue-900">{t('r_response_label')}</p>
                          <p className="text-xs sm:text-sm text-blue-700">{request.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:gap-2 lg:ml-4">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                  >
                    {t('r_detailed_response')}
                  </button>

                  <button
                    onClick={() => setSelectedRoomInfo(request)}
                    className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                  >
                    {t('r_room_info')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('r_no_requests')}</h3>
            <p className="text-gray-600">
              {searchTerm ? t('r_no_requests_search') : t('r_no_requests_empty')}
            </p>
          </div>
        )}
      </div>

      {/* Checkout Confirmation Modal */}
      {checkoutConfirm && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setCheckoutConfirm(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('r_checkout_confirm')}</h3>
                <p className="text-sm text-gray-600">{t('room')} {checkoutConfirm.roomId.replace(/^\s*room[-\s_]*/i, '').trim()} {t('r_checkout_for')}</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">{t('r_are_you_sure')}</p>
                  <p className="text-xs">{t('r_cannot_undo')}</p>
                </div>
              </div>
            </div>

            {/* Bekleyen ödemeler varsa göster */}
            {checkoutConfirm.pendingPayments.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 text-sm">{t('r_pending_payments')}</span>
                </div>
                <div className="space-y-2">
                  {checkoutConfirm.pendingPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{payment.item}</span>
                      <span className="font-semibold text-gray-900">{payment.amount} TL</span>
                    </div>
                  ))}
                  <div className="border-t border-yellow-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-700">{t('r_total_amount')}</span>
                      <span className="text-red-600 text-lg">{checkoutConfirm.totalAmount} TL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setCheckoutConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                {t('r_cancel')}
              </button>
              <button
                onClick={() => {
                  const roomInfo = {
                    id: checkoutConfirm.roomId,
                    roomId: checkoutConfirm.roomId,
                    type: 'room_change',
                    description: 'Room change',
                    priority: 'medium',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setSelectedRoomInfo(roomInfo as any);
                  setCheckoutConfirm(null);
                  setShowRoomChange(true);
                }}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                {t('r_change_room')}
              </button>
              <button
                onClick={async () => {
                  setCheckoutConfirm(null);
                  await processCheckout(checkoutConfirm.roomId);
                }}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                {t('r_checkout_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Change Modal */}
      {showRoomChange && selectedRoomInfo && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowRoomChange(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Hotel className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('r_room_change')}</h3>
                <p className="text-sm text-gray-600">{t('room')} {(selectedRoomInfo as any).displayRoomNumber || selectedRoomInfo.roomId.replace(/^\s*room[-\s_]*/i, '').trim()} {t('r_select_new_room_for')}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t('r_info_will_be_moved')}</p>
                  <p className="text-xs">{t('r_info_will_be_moved_detail')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                {t('r_select_new_room')}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableRooms
                  .filter(room => room.id !== selectedRoomInfo.roomId)
                  .map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedNewRoom(room.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedNewRoom === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold text-gray-900">{t('room')} {room.number}</div>
                      <div className="text-xs text-gray-600">{room.floor} - {room.type}</div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRoomChange(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                {t('r_cancel')}
              </button>
              <button
                onClick={() => handleRoomChange(selectedRoomInfo.roomId, selectedNewRoom)}
                disabled={!selectedNewRoom}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('r_change_room')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Info Modal */}
      {selectedRoomInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9998] p-2 sm:p-4"
          onClick={() => setSelectedRoomInfo(null)}
        >
          <div
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-sm sm:max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
              {t('room')} {(selectedRoomInfo as any).displayRoomNumber || selectedRoomInfo.roomId.replace(/^\s*room[-\s_]*/i, '').trim()} {t('r_room_info_title')}
            </h3>

            <div className="space-y-3">
              {(() => {
                const roomInfo = getRoomInfo(selectedRoomInfo.roomId);
                return (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hotel className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 text-sm">{t('r_room_details')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_floor')}:</span>
                          <span className="font-medium">{roomInfo.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_type_label')}</span>
                          <span className="font-medium">{roomInfo.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900 text-sm">{t('r_current_guest')}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_full_name')}:</span>
                          <span className="font-medium">{roomInfo.guestName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_checkout_time')}:</span>
                          <span className="font-medium">{roomInfo.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_phone')}:</span>
                          <span className="font-medium text-xs">{roomInfo.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('r_email')}:</span>
                          <span className="font-medium text-xs">{roomInfo.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ödeme Geçmişi */}
                    {roomInfo.payments.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold text-yellow-900 text-sm">{t('r_payment_history')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              {roomInfo.payments.filter(p => p.status === 'pending').length} {t('r_pending_count')}
                            </span>
                            <button
                              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              {showPaymentDetails ? t('r_hide') : t('r_detail')}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {/* Bekleyen Ödemeler - Her zaman göster */}
                          {roomInfo.payments
                            .filter(p => p.status === 'pending')
                            .map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{payment.item}</div>
                                  <div className="text-gray-500 text-xs">{payment.date}</div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <span className="font-semibold text-gray-900">{payment.amount} TL</span>
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                    {t('r_pending_count')}
                                  </span>
                                </div>
                              </div>
                            ))}

                          {/* Ödenen Ödemeler - Sadece detay açıksa göster */}
                          {showPaymentDetails && roomInfo.payments
                            .filter(p => p.status === 'paid')
                            .map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs opacity-75">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-600 truncate">{payment.item}</div>
                                  <div className="text-gray-400 text-xs">{payment.date}</div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <span className="font-semibold text-gray-600">{payment.amount} TL</span>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    {t('r_paid')}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-yellow-200">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{t('r_total_pending')}</span>
                            <span className="text-red-600">
                              {roomInfo.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)} TL
                            </span>
                          </div>
                          {showPaymentDetails && (
                            <div className="flex justify-between text-xs font-semibold mt-1">
                              <span className="text-gray-600">{t('r_total_paid')}</span>
                              <span className="text-green-600">
                                {roomInfo.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)} TL
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Çıkış Butonu */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-red-900 text-sm">{t('r_checkout_action')}</div>
                          <div className="text-xs text-red-700">
                            {roomInfo.payments.filter(p => p.status === 'pending').length > 0
                              ? `${roomInfo.payments.filter(p => p.status === 'pending').length} ${t('r_pending_payments_exist')}`
                              : t('r_no_pending_payments')
                            }
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setCheckInRoomId(selectedRoomInfo.roomId);
                              setShowCheckInModal(true);
                            }}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-xs"
                          >
                            Check-in
                          </button>
                          <button
                            onClick={() => handleCheckout(selectedRoomInfo.roomId)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-xs"
                          >
                            {t('r_checkout_btn')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex space-x-3 mt-3">
              <button
                onClick={() => setSelectedRoomInfo(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-xs sm:text-sm"
              >
                {t('r_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Response Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9997] p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {t('room')} {selectedRequest.roomId.replace(/^\s*room[-\s_]*/i, '').trim()} - {t('r_auto_response')}
            </h3>

            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">{t('r_request_label')}</p>
              <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-3 rounded-lg sm:rounded-xl">{selectedRequest.description}</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">{t('r_auto_responses')}</p>
              {getQuickResponses(selectedRequest.type).map((response) => {
                const IconComponent = response.icon;
                return (
                  <button
                    key={response.id}
                    onClick={() => handleQuickResponse(selectedRequest.id, response.id, selectedRequest.type)}
                    className="w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      <span className="text-xs sm:text-sm text-gray-900">{response.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Özel Mesaj Alanı */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">{t('r_custom_message')}</p>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t('r_custom_message_placeholder')}
                className="w-full p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                rows={3}
              />
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => handleCustomMessage(selectedRequest.id, customMessage)}
                  disabled={!customMessage.trim()}
                  className="flex-1 bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  {t('r_send_message')}
                </button>
                <button
                  onClick={() => setCustomMessage('')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  {t('r_clear')}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
              >
                {t('r_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9997] p-4"
          onClick={() => setShowCheckInModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {t('r_checkin_title')} - {t('room')} {checkInRoomId.replace(/^\s*room[-\s_]*/i, '').trim()}
            </h3>

            <CheckInForm
              roomId={checkInRoomId}
              onSubmit={processCheckIn}
              onCancel={() => {
                setShowCheckInModal(false);
                setCheckInRoomId('');
              }}
              t={t}
            />
          </div>
        </div>
      )}
      {/* Delivery Confirmation Modal */}
      {selectedDeliveryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
              <div className="flex justify-between items-center text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {t('r_delivery_confirm')}
                </h3>
                <button
                  onClick={() => setSelectedDeliveryOrder(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-green-50 rounded-full mb-3">
                  <Utensils className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  {t('room')} {String(selectedDeliveryOrder.roomId).replace(/^\s*room[-\s_]*/i, '').trim()}
                </h4>
                <p className="text-gray-500 text-sm mt-1">{t('r_delivery_needs_confirm')}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('r_payment_method')}</span>
                  <span className={`font-bold ${selectedDeliveryOrder.paymentMethod === 'room_charge' ? 'text-blue-600' :
                    selectedDeliveryOrder.paymentMethod === 'online' ? 'text-purple-600' :
                      'text-yellow-600'
                    }`}>
                    {getPaymentLabel(selectedDeliveryOrder.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('r_total_amount')}</span>
                  <span className="font-bold text-lg text-gray-900">
                    {Number(selectedDeliveryOrder.totalAmount || 0).toFixed(2)}₺
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDeliveryOrder(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  {t('r_cancel')}
                </button>
                <button
                  onClick={confirmOrderDelivery}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('r_delivered')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Check-in Form Component
function CheckInForm({
  roomId,
  onSubmit,
  onCancel,
  t
}: {
  roomId: string;
  onSubmit: (roomId: string, guestData: any) => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'tr'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      onSubmit(roomId, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('r_first_name')} *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('r_first_name_placeholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('r_last_name')} *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('r_last_name_placeholder')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('r_email')}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="musteri@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('r_phone')}
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+90 555 123 4567"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('r_language_preference')}
        </label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="ar">العربية</option>
          <option value="ru">Русский</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
        >
          {t('r_cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
        >
          {t('r_checkin_btn')}
        </button>
      </div>
    </form>
  );
}

// Request description component with translation support
// Quick items dictionary moved outside to prevent re-renders
const quickItemsTranslation: Record<string, Record<string, string>> = {
  'quick.towel': { tr: 'Havlu', en: 'Towel', de: 'Handtuch', ru: 'Полотенце', fr: 'Serviette', es: 'Toalla', it: 'Asciugamano', ar: 'منشفة' },
  'quick.slippers': { tr: 'Terlik', en: 'Slippers', de: 'Hausschuhe', ru: 'Тапочки', fr: 'Pantoufles', es: 'Zapatillas', it: 'Ciabatte', ar: 'شبشب' },
  'quick.toothpaste': { tr: 'Diş Macunu', en: 'Toothpaste', de: 'Zahnpasta', ru: 'Зубная паста', fr: 'Dentifrice', es: 'Pasta de dientes', it: 'Dentifricio', ar: 'معجون أسنان' },
  'quick.pillow': { tr: 'Yastık', en: 'Pillow', de: 'Kopfkissen', ru: 'Подушка', fr: 'Oreiller', es: 'Almohada', it: 'Cuscino', ar: 'وسادة' },
  'quick.blanket': { tr: 'Battaniye', en: 'Blanket', de: 'Bettdecke', ru: 'Одеяло', fr: 'Couverture', es: 'Manta', it: 'Coperta', ar: 'بطانية' },
  'quick.shampoo': { tr: 'Şampuan', en: 'Shampoo', de: 'Shampoo', ru: 'Шампунь', fr: 'Shampooing', es: 'Champú', it: 'Shampoo', ar: 'şampuan' },
  'quick.soap': { tr: 'Sabun', en: 'Soap', de: 'Seife', ru: 'Мыло', fr: 'Savon', es: 'Jabón', it: 'Sapone', ar: 'صابون' },
  'quick.water': { tr: 'Su', en: 'Water', de: 'Wasser', ru: 'Вода', fr: 'Eau', es: 'Agua', it: 'Acqua', ar: 'ماء' }
};

function RequestDescription({ text, targetLang }: { text: string, targetLang: string }) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if it's a quick item format "QTY x KEY"
    const match = text.match(/^(\d+)\s+x\s+(.+)$/);
    if (match) {
      const [, qty, key] = match;
      const translationDict = quickItemsTranslation[key];
      if (translationDict) {
        // Synchronous translation for quick items
        const item = translationDict[targetLang] || translationDict['en'] || key;
        if (isMounted) {
          setTranslatedText(`${qty} x ${item}`);
          setIsTranslating(false);
        }
        return;
      }
    }

    // For regular text, use async translation
    const performTranslation = async () => {
      try {
        setIsTranslating(true);
        // Only translate if target language is different from source (we leverage DeepL auto-detect)
        // If text is short or empty, skip
        if (!text || text.length < 2) {
          if (isMounted) {
            setTranslatedText(text);
            setIsTranslating(false);
          }
          return;
        }

        const result = await translateText(text, targetLang);
        if (isMounted) {
          setTranslatedText(result);
          setIsTranslating(false);
        }
      } catch (error) {
        console.error('Translation failed', error);
        if (isMounted) {
          setTranslatedText(text); // Fallback to original
          setIsTranslating(false);
        }
      }
    };

    performTranslation();

    return () => { isMounted = false; };
  }, [text, targetLang, quickItemsTranslation]);

  return (
    <div className="text-sm sm:text-base text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium relative">
      {isTranslating ? (
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-xs">{translate('r_translating', targetLang as Language)}</span>
        </div>
      ) : (
        <>
          {translatedText || text}
          {translatedText && translatedText !== text && (
            <div className="mt-1 text-xs text-gray-400 font-normal italic border-t border-gray-100 pt-1">
              {translate('r_original', targetLang as Language)} {text}
            </div>
          )}
        </>
      )}
    </div>
  );
}