'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHotelStore } from '@/store/hotelStore';
import { sampleRequests } from '@/lib/sampleData';
import { translate } from '@/lib/translations';
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
  X
} from 'lucide-react';

export default function ReceptionPanel() {
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'pending' | 'in_progress'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<GuestRequest | null>(null);
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

  // Bildirim sistemi - sadece yeni istekler için
  const { addNotification, notifications, unreadCount, markAsRead } = useNotifications();

  // Oda bilgilerini getir
  const getRoomInfo = (roomId: string) => {
    const roomNumber = roomId.replace('room-', '');
    const mockRoomData = {
      '101': {
        floor: 'Kat 1',
        type: 'Standard',
        guestName: 'Ahmet Yılmaz',
        checkOut: '28.09.2024',
        phone: '+90 532 123 4567',
        email: 'ahmet.yilmaz@email.com',
        payments: [
          { id: '1', item: 'Kahve', amount: 25, date: '26.09.2024 14:30', status: 'pending' },
          { id: '2', item: 'Sandwich', amount: 45, date: '26.09.2024 15:45', status: 'pending' },
          { id: '3', item: 'Su', amount: 15, date: '26.09.2024 16:20', status: 'paid' }
        ]
      },
      '102': {
        floor: 'Kat 1',
        type: 'Deluxe',
        guestName: 'Maria Garcia',
        checkOut: '14.09.2024',
        phone: '+34 123 456 789',
        email: 'maria.garcia@email.com',
        payments: [
          { id: '1', item: 'Kahvaltı', amount: 45, date: '25.09.2024 08:30', status: 'paid' },
          { id: '2', item: 'Öğle Yemeği', amount: 85, date: '25.09.2024 13:15', status: 'paid' },
          { id: '3', item: 'İçecek', amount: 25, date: '25.09.2024 16:45', status: 'paid' },
          { id: '4', item: 'Çay', amount: 20, date: '26.09.2024 10:15', status: 'pending' },
          { id: '5', item: 'Pasta', amount: 35, date: '26.09.2024 11:30', status: 'pending' },
          { id: '6', item: 'Sandwich', amount: 40, date: '26.09.2024 14:30', status: 'pending' }
        ]
      },
      '201': {
        floor: 'Kat 2',
        type: 'Suite',
        guestName: 'John Smith',
        checkOut: '30.09.2024',
        phone: '+1 555 123 4567',
        email: 'john.smith@email.com',
        payments: [
          { id: '6', item: 'Kahve', amount: 25, date: '26.09.2024 09:00', status: 'paid' },
          { id: '7', item: 'Tost', amount: 40, date: '26.09.2024 12:15', status: 'pending' },
          { id: '8', item: 'Meyve Suyu', amount: 30, date: '26.09.2024 14:00', status: 'pending' }
        ]
      },
      '301': {
        floor: 'Kat 3',
        type: 'Standard',
        guestName: 'Ayşe Demir',
        checkOut: '25.09.2024',
        phone: '+90 533 987 6543',
        email: 'ayse.demir@email.com',
        payments: []
      }
    };

    return mockRoomData[roomNumber as keyof typeof mockRoomData] || {
      floor: 'Kat 1',
      type: 'Standard',
      guestName: 'Misafir',
      checkOut: 'Bilinmiyor',
      phone: 'Bilinmiyor',
      email: 'Bilinmiyor',
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
    try {
      setIsLoading(true);
      const [requestsData, statsData, roomsData] = await Promise.all([
        ApiService.getGuestRequests(),
        ApiService.getStatistics(),
        ApiService.getRooms(),
      ]);

      console.log('Resepsiyon paneli - Yüklenen istekler:', requestsData);
      console.log('Resepsiyon paneli - LocalStorage içeriği:', localStorage.getItem('roomapp_requests'));

      // Filtre sayılarını debug et (yemek siparişleri hariç)
      const nonFoodRequests = requestsData.filter(r => r.type !== 'food_order');
      const urgentCount = nonFoodRequests.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
      const pendingCount = nonFoodRequests.filter(r => r.status === 'pending').length;
      const inProgressCount = nonFoodRequests.filter(r => r.status === 'in_progress' || r.status === 'completed').length;
      console.log('Filtre sayıları (yemek siparişleri hariç):', {
        total: requestsData.length,
        nonFoodTotal: nonFoodRequests.length,
        urgent: urgentCount,
        pending: pendingCount,
        inProgress: inProgressCount
      });

      // Yeni istek kontrolü - ses bildirimi için (yemek siparişleri hariç)
      const nonFoodRequestCount = requestsData.filter(r => r.type !== 'food_order').length;
      if (nonFoodRequestCount > lastRequestCount && lastRequestCount > 0) {
        // Ses bildirimi hemen çal
        playNotificationSound();

        // Yeni gelen istekleri bul ve detaylı bildirim gönder (yemek siparişleri hariç)
        const newRequests = requestsData.filter(r => r.type !== 'food_order').slice(0, nonFoodRequestCount - lastRequestCount);
        newRequests.forEach(request => {
          const roomNumber = request.roomId.replace('room-', '');

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
            title: `Oda ${roomNumber}`,
            message: request.description,
          });
        });
      }
      setLastRequestCount(nonFoodRequestCount);

      setLastRequestCount(nonFoodRequestCount);

      setRequests(requestsData);
      setStatistics(statsData);
      setRooms(roomsData);

      // Yeni talepleri kontrol et
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
  }, [addNotification, lastRequestCount, playNotificationSound]);

  // Veri yükleme
  // Browser tab title'ını ayarla
  useEffect(() => {
    document.title = 'Resepsiyon Paneli - RoomXQR';
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 5 saniyede bir güncelle (yeni istekler için)
    return () => clearInterval(interval);
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
    // Tüm istek türleri için genel yanıtlar
    return [
      {
        id: 'in_progress',
        text: 'Yetkili ekibimizi yönlendirdik. En kısa sürede yanınızda olacaklar.',
        icon: Clock
      },
      {
        id: 'follow_up',
        text: 'Sorun devam ederse lütfen tekrar çağrı oluşturun. Talebiniz öne çıkarılacaktır.',
        icon: MessageSquare
      },
      {
        id: 'delayed',
        text: 'Yoğunluk nedeniyle biraz daha beklememiz gerekiyor. Özür dileriz.',
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
        title: 'Hata',
        message: 'Çıkış işlenirken bir hata oluştu.',
      });
    }
  };

  // Mevcut odalar listesi
  const availableRooms = [
    { id: 'room-101', number: '101', floor: 'Kat 1', type: 'Standard' },
    { id: 'room-102', number: '102', floor: 'Kat 1', type: 'Deluxe' },
    { id: 'room-201', number: '201', floor: 'Kat 2', type: 'Suite' },
    { id: 'room-301', number: '301', floor: 'Kat 3', type: 'Standard' },
    { id: 'room-302', number: '302', floor: 'Kat 3', type: 'Deluxe' },
    { id: 'room-401', number: '401', floor: 'Kat 4', type: 'Suite' },
  ];

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
        title: 'Oda Değişikliği',
        message: `Oda ${fromRoomId.replace('room-', '')} → Oda ${toRoomId.replace('room-', '')} değişikliği tamamlandı.`,
      });

      setShowRoomChange(false);
      setSelectedNewRoom('');

    } catch (error) {
      console.error('Error changing room:', error);
      addNotification({
        type: 'error',
        title: 'Hata',
        message: 'Oda değişikliği sırasında bir hata oluştu.',
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
          title: 'Check-in Tamamlandı',
          message: `${guestData.firstName} ${guestData.lastName} oda ${roomId.replace('room-', '')} için check-in yapıldı.`,
        });

        // QR kod güncelleme bildirimi
        if (checkInResult.qrCode) {
          addNotification({
            type: 'info',
            title: 'QR Kod Oluşturuldu',
            message: `Oda ${roomId.replace('room-', '')} için müşteri adını içeren QR kod oluşturuldu.`,
          });
        }

        setShowCheckInModal(false);
        setCheckInRoomId('');
      } else {
        addNotification({
          type: 'error',
          title: 'Hata',
          message: 'Check-in işlemi sırasında bir hata oluştu.',
        });
      }
    } catch (error) {
      console.error('Error processing check-in:', error);
      addNotification({
        type: 'error',
        title: 'Hata',
        message: 'Check-in işlenirken bir hata oluştu.',
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
          title: 'Ödemeler Alındı',
          message: `${pendingPayments.length} adet ödeme toplam ${pendingPayments.reduce((sum, p) => sum + p.amount, 0)} TL olarak alındı.`,
        });
      }

      // Oda isteklerini temizle
      await ApiService.clearRoomRequests(roomId);

      // Yeni: Müşteri check-out işlemi (QR kod otomatik sıfırlama ile)
      const checkoutResult = await ApiService.checkOutGuest(roomId);

      if (checkoutResult.success) {
        addNotification({
          type: 'success',
          title: 'Çıkış Tamamlandı',
          message: `Oda ${roomId.replace('room-', '')} için çıkış işlemi tamamlandı. QR kod yeni müşteri için hazırlandı.`,
        });

        // QR kod güncelleme bildirimi
        if (checkoutResult.qrCode) {
          addNotification({
            type: 'info',
            title: 'QR Kod Güncellendi',
            message: `Oda ${roomId.replace('room-', '')} için QR kod yeni müşteri için hazırlandı.`,
          });
        }
      } else {
        // Fallback: Eski yöntem
        await ApiService.resetRoomQR(roomId);

        addNotification({
          type: 'success',
          title: 'Çıkış Tamamlandı',
          message: `Oda ${roomId.replace('room-', '')} için çıkış işlemi tamamlandı, istekler temizlendi ve QR kod sıfırlandı.`,
        });
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      addNotification({
        type: 'error',
        title: 'Hata',
        message: 'Çıkış işlenirken bir hata oluştu.',
      });
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
                  {user?.hotel?.name || 'Otel'} Resepsiyon
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Misafir taleplerini yönetin ve takip edin
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
                  title="Bildirimler"
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
                <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
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
                  <p>Henüz bildirim yok</p>
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
                            {notification.timestamp.toLocaleString('tr-TR')}
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

      {/* Tüm Odalar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tüm Odalar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {rooms.length > 0 ? rooms.map((room) => {
              const hasActiveRequest = requests.some(r => r.roomId === room.roomId && r.status === 'pending');
              const roomNum = room.number || room.roomId.replace('room-', '');
              return (
                <div
                  key={room.roomId}
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
                    {hasActiveRequest ? '❗️ İstek Var' : (room.guestName || (room.status === 'occupied' ? 'Dolu' : 'Boş'))}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center text-gray-400 py-4">Oda bilgisi yükleniyor...</div>
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
                  placeholder="Oda numarası veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Tümü', count: requests.filter(r => r.type !== 'food_order').length },
                { id: 'urgent', label: 'Acil', count: requests.filter(r => r.type !== 'food_order' && (r.priority === 'urgent' || r.priority === 'high')).length },
                { id: 'pending', label: 'Bekleyen', count: requests.filter(r => r.type !== 'food_order' && r.status === 'pending').length },
                { id: 'in_progress', label: 'İşlemde', count: requests.filter(r => r.type !== 'food_order' && (r.status === 'in_progress' || r.status === 'completed')).length }
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
                      Oda {request.roomId.replace('room-', '')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(request.priority)}`}>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(request.priority)}
                          <span>{request.priority === 'urgent' ? 'YÜKSEK' :
                            request.priority === 'high' ? 'YÜKSEK' :
                              request.priority === 'medium' ? 'ORTA' :
                                request.priority === 'low' ? 'DÜŞÜK' : String(request.priority || '').toUpperCase()}</span>
                        </div>
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? 'BEKLEMEDE' :
                          request.status === 'in_progress' ? 'İŞLEMDE' :
                            request.status === 'completed' ? 'TAMAMLANDI' : 'İPTAL'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getRequestTypeIcon(request.type)}</span>
                      <span>{request.type?.toLowerCase() === 'housekeeping' ? 'Temizlik' :
                        request.type?.toLowerCase() === 'maintenance' ? 'Bakım' :
                          request.type?.toLowerCase() === 'concierge' ? 'Konsiyerj' :
                            request.type?.toLowerCase() === 'food_order' ? 'Yemek Siparişi' : request.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(request.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-700 mb-4">{request.description}</p>

                  {request.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-blue-900">Yanıt:</p>
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
                    Detaylı Yanıt
                  </button>

                  <button
                    onClick={() => setSelectedRoomInfo(request)}
                    className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                  >
                    Oda Bilgisi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">İstek Bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Arama kriterlerinize uygun istek bulunamadı.' : 'Henüz hiç istek bulunmuyor.'}
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
                <h3 className="text-lg font-bold text-gray-900">Çıkış Onayı</h3>
                <p className="text-sm text-gray-600">Oda {checkoutConfirm.roomId.replace('room-', '')} için çıkış işlemi</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">İşlemden emin misiniz?</p>
                  <p className="text-xs">Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?</p>
                </div>
              </div>
            </div>

            {/* Bekleyen ödemeler varsa göster */}
            {checkoutConfirm.pendingPayments.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 text-sm">Bekleyen Ödemeler</span>
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
                      <span className="text-gray-700">Toplam Tutar:</span>
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
                İptal
              </button>
              <button
                onClick={() => {
                  // Oda değiştirme için selectedRoomInfo'yu set et
                  const roomInfo = {
                    id: checkoutConfirm.roomId,
                    roomId: checkoutConfirm.roomId,
                    type: 'room_change',
                    description: 'Oda değişikliği',
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
                Oda Değiştir
              </button>
              <button
                onClick={async () => {
                  setCheckoutConfirm(null);
                  await processCheckout(checkoutConfirm.roomId);
                }}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Çıkış Yap
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
                <h3 className="text-lg font-bold text-gray-900">Oda Değişikliği</h3>
                <p className="text-sm text-gray-600">Oda {selectedRoomInfo.roomId.replace('room-', '')} için yeni oda seçin</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Tüm bilgiler yeni odaya taşınacak</p>
                  <p className="text-xs">Misafir bilgileri, ödemeler ve talepler yeni odaya aktarılacak.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Yeni Oda Seçin
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
                      <div className="font-semibold text-gray-900">Oda {room.number}</div>
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
                İptal
              </button>
              <button
                onClick={() => handleRoomChange(selectedRoomInfo.roomId, selectedNewRoom)}
                disabled={!selectedNewRoom}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Oda Değiştir
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
              Oda {selectedRoomInfo.roomId.replace('room-', '')} Bilgileri
            </h3>

            <div className="space-y-3">
              {(() => {
                const roomInfo = getRoomInfo(selectedRoomInfo.roomId);
                return (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hotel className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 text-sm">Oda Detayları</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kat:</span>
                          <span className="font-medium">{roomInfo.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tür:</span>
                          <span className="font-medium">{roomInfo.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900 text-sm">Mevcut Misafir</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ad Soyad:</span>
                          <span className="font-medium">{roomInfo.guestName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Çıkış Saati:</span>
                          <span className="font-medium">{roomInfo.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefon:</span>
                          <span className="font-medium text-xs">{roomInfo.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">E-posta:</span>
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
                            <span className="font-semibold text-yellow-900 text-sm">Ödeme Geçmişi</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              {roomInfo.payments.filter(p => p.status === 'pending').length} Bekleyen
                            </span>
                            <button
                              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              {showPaymentDetails ? 'Gizle' : 'Detay'}
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
                                    Bekleyen
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
                                    Ödendi
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-yellow-200">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Toplam Bekleyen:</span>
                            <span className="text-red-600">
                              {roomInfo.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)} TL
                            </span>
                          </div>
                          {showPaymentDetails && (
                            <div className="flex justify-between text-xs font-semibold mt-1">
                              <span className="text-gray-600">Toplam Ödenen:</span>
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
                          <div className="font-semibold text-red-900 text-sm">Çıkış İşlemi</div>
                          <div className="text-xs text-red-700">
                            {roomInfo.payments.filter(p => p.status === 'pending').length > 0
                              ? `${roomInfo.payments.filter(p => p.status === 'pending').length} adet bekleyen ödeme var`
                              : 'Bekleyen ödeme yok'
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
                            Çıkış Yap
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
                Kapat
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
              Oda {selectedRequest.roomId.replace('room-', '')} - Otomatik Yanıt
            </h3>

            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">İstek:</p>
              <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-3 rounded-lg sm:rounded-xl">{selectedRequest.description}</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Otomatik Yanıtlar:</p>
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
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Özel Mesaj Yaz:</p>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Kendi mesajınızı yazın..."
                className="w-full p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                rows={3}
              />
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => handleCustomMessage(selectedRequest.id, customMessage)}
                  disabled={!customMessage.trim()}
                  className="flex-1 bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  Mesaj Gönder
                </button>
                <button
                  onClick={() => setCustomMessage('')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                >
                  Temizle
                </button>
              </div>
            </div>

            <div className="flex space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
              >
                İptal
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
              Müşteri Check-in - Oda {checkInRoomId.replace('room-', '')}
            </h3>

            <CheckInForm
              roomId={checkInRoomId}
              onSubmit={processCheckIn}
              onCancel={() => {
                setShowCheckInModal(false);
                setCheckInRoomId('');
              }}
            />
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
  onCancel
}: {
  roomId: string;
  onSubmit: (roomId: string, guestData: any) => void;
  onCancel: () => void;
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
            Ad *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Müşteri adı"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Soyad *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Müşteri soyadı"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          E-posta
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
          Telefon
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
          Dil Tercihi
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
          İptal
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
        >
          Check-in Yap
        </button>
      </div>
    </form>
  );
}