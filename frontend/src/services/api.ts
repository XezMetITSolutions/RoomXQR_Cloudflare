// API servis dosyası - Gerçek backend entegrasyonu için
import { useState, useEffect } from 'react';

// API kökünü normalle: ENV kök domain ise '/api' ekle, zaten '/api' içeriyorsa olduğu gibi kullan
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.roomxr.com';
const API_BASE_URL = /\/api\/?$/.test(RAW_API_BASE)
  ? RAW_API_BASE.replace(/\/$/, '')
  : `${RAW_API_BASE.replace(/\/$/, '')}/api`;
const USE_MOCK_DATA = true; // Geçici olarak mock data kullan

export interface GuestRequest {
  id: string;
  roomId: string;
  type: 'housekeeping' | 'maintenance' | 'concierge' | 'general' | 'food_order';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  roomId?: string;
  requestId?: string;
  timestamp: string;
  read: boolean;
}

export interface RoomStatus {
  roomId: string;
  status: 'occupied' | 'vacant' | 'cleaning' | 'maintenance';
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  number?: string;
  floor?: number;
  type?: string;
}

// API çağrıları
export class ApiService {
  // Misafir talepleri
  static async getGuestRequests(roomId?: string): Promise<GuestRequest[]> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for requests');
      return this.getMockRequests();
    }

    try {
      const url = roomId ? `${API_BASE_URL}/requests?roomId=${roomId}` : `${API_BASE_URL}/requests`;
      console.log('Fetching requests from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched requests:', data);
      return data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback: Mock data döndür
      return this.getMockRequests();
    }
  }

  static async createGuestRequest(request: Omit<GuestRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<GuestRequest> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for creating request');
      const newRequest = {
        id: Date.now().toString(),
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Global mock listesine ekle
      const currentRequests = this.getMockRequests();
      currentRequests.unshift(newRequest);
      this.saveMockRequests(currentRequests);

      return newRequest;
    }

    try {
      console.log('Creating request:', request);
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(request),
      });

      console.log('Create request response status:', response.status);

      if (!response.ok) {
        console.error('Create request failed:', response.status, response.statusText);
        throw new Error(`Failed to create request: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Created request:', data);
      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      // Fallback: Mock response döndür ve global listeye ekle
      const newRequest = {
        id: Date.now().toString(),
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Global mock listesine ekle
      const currentRequests = this.getMockRequests();
      currentRequests.unshift(newRequest);
      this.saveMockRequests(currentRequests);

      return newRequest;
    }
  }

  static async updateRequestStatus(requestId: string, status: GuestRequest['status'], notes?: string): Promise<GuestRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to update request');
      return await response.json();
    } catch (error) {
      console.error('Error updating request:', error);
      // Fallback: Mock listesinde güncelle
      const currentRequests = this.getMockRequests();
      const requestIndex = currentRequests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        currentRequests[requestIndex] = {
          ...currentRequests[requestIndex],
          status,
          notes: notes || currentRequests[requestIndex].notes,
          updatedAt: new Date().toISOString()
        };
        this.saveMockRequests(currentRequests);
        return currentRequests[requestIndex];
      }
      throw error;
    }
  }

  // Bildirimler
  static async getNotifications(roomId?: string): Promise<NotificationData[]> {
    try {
      const url = roomId ? `${API_BASE_URL}/notifications?roomId=${roomId}` : `${API_BASE_URL}/notifications`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Oda durumu
  static async getRoomStatus(roomId: string): Promise<RoomStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`);
      if (!response.ok) throw new Error('Failed to fetch room status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching room status:', error);
      // Fallback: Mock data
      return {
        roomId,
        status: 'occupied',
        guestName: 'Misafir',
        checkIn: new Date().toISOString(),
      };
    }
  }

  // Tüm odaları çek
  static async getRooms(): Promise<RoomStatus[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Fallback: Mock data
      return [
        { roomId: 'room-101', status: 'occupied', guestName: 'Ahmet Yılmaz', checkIn: new Date().toISOString() },
        { roomId: 'room-102', status: 'occupied', guestName: 'Maria Garcia', checkIn: new Date().toISOString() },
        { roomId: 'room-103', status: 'vacant' },
        { roomId: 'room-104', status: 'occupied', guestName: 'Ali Veli', checkIn: new Date().toISOString() },
        { roomId: 'room-105', status: 'vacant' },
        { roomId: 'room-201', status: 'occupied', guestName: 'John Smith', checkIn: new Date().toISOString() },
        { roomId: 'room-202', status: 'vacant' },
        { roomId: 'room-203', status: 'vacant' },
        { roomId: 'room-301', status: 'occupied', guestName: 'Ayşe Demir', checkIn: new Date().toISOString() },
        { roomId: 'room-302', status: 'vacant' },
      ];
    }
  }

  // İstatistikler
  static async getStatistics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    completedToday: number;
    averageResponseTime: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback: Mock data
      return {
        totalRequests: 45,
        pendingRequests: 8,
        completedToday: 12,
        averageResponseTime: 15, // dakika
      };
    }
  }

  // Toplu oda oluştur
  static async createRooms(rooms: any[]): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rooms }),
      });

      if (!response.ok) throw new Error('Failed to create rooms');
      return await response.json();
    } catch (error) {
      console.error('Error creating rooms:', error);
      throw error;
    }
  }

  // WebSocket bağlantısı (gerçek zamanlı güncellemeler için)
  static connectWebSocket(roomId: string, onMessage: (data: any) => void): WebSocket | null {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.roomxr.com';
      const ws = new WebSocket(`${wsUrl}/ws?roomId=${roomId}`);

      ws.onopen = () => console.log('WebSocket connected');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => console.log('WebSocket disconnected');

      return ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      return null;
    }
  }

  // Ödeme durumu güncelleme
  static async updatePaymentStatus(paymentId: string, status: 'paid' | 'pending'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');
    } catch (error) {
      console.error('Error updating payment status:', error);
      // Mock başarılı yanıt
    }
  }

  // QR kod sıfırlama
  static async resetRoomQR(roomId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/reset-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to reset room QR');
    } catch (error) {
      console.error('Error resetting room QR:', error);
      // Mock başarılı yanıt
    }
  }

  // Yeni: Müşteri adını içeren QR kod oluşturma
  static async generateGuestQR(roomId: string, guestName: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/generate-guest-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestName }),
      });

      if (!response.ok) throw new Error('Failed to generate guest QR');
      const data = await response.json();
      return data.qrCode;
    } catch (error) {
      console.error('Error generating guest QR:', error);
      // Mock QR kod döndür
      return this.generateMockGuestQR(roomId, guestName);
    }
  }

  // Mock müşteri QR kodu oluşturma
  private static generateMockGuestQR(roomId: string, guestName: string): string {
    const qrText = `room-${roomId}-${guestName.replace(/\s+/g, '-').toLowerCase()}`;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#ffffff"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#000000" font-size="12">
          QR: ${qrText}
        </text>
        <text x="50%" y="70%" text-anchor="middle" dy=".3em" fill="#666666" font-size="10">
          ${guestName}
        </text>
      </svg>
    `)}`;
  }

  // Yeni: Müşteri check-in işlemi (QR kod otomatik güncelleme ile)
  static async checkInGuest(roomId: string, guestData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    language?: string;
  }): Promise<{ success: boolean; qrCode?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/guests/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          ...guestData,
        }),
      });

      if (!response.ok) throw new Error('Failed to check in guest');
      const data = await response.json();
      return { success: true, qrCode: data.qrCode };
    } catch (error) {
      console.error('Error checking in guest:', error);
      // Mock başarılı yanıt
      const guestName = `${guestData.firstName} ${guestData.lastName}`;
      const qrCode = this.generateMockGuestQR(roomId, guestName);
      return { success: true, qrCode };
    }
  }

  // Yeni: Müşteri check-out işlemi (QR kod otomatik sıfırlama ile)
  static async checkOutGuest(roomId: string): Promise<{ success: boolean; qrCode?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/guests/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) throw new Error('Failed to check out guest');
      const data = await response.json();
      return { success: true, qrCode: data.qrCode };
    } catch (error) {
      console.error('Error checking out guest:', error);
      // Mock başarılı yanıt - QR kodu sıfırla
      const qrCode = this.generateMockGuestQR(roomId, '');
      return { success: true, qrCode };
    }
  }

  // Oda değişikliği
  static async changeRoom(fromRoomId: string, toRoomId: string, roomData: any): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromRoomId,
          toRoomId,
          roomData
        }),
      });

      if (!response.ok) throw new Error('Failed to change room');
    } catch (error) {
      console.error('Error changing room:', error);
      // Mock başarılı yanıt
    }
  }

  // Müşteriye bildirim gönderme
  static async sendNotificationToGuest(roomId: string, message: string, type: 'response' | 'update' | 'info' = 'response'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/send-to-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          message,
          type,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to send notification to guest');
    } catch (error) {
      console.error('Error sending notification to guest:', error);
      // Mock: Local storage'a bildirim kaydet (misafir tarafı için)
      this.saveGuestNotification(roomId, message, type);
    }
  }

  // Misafir bildirimlerini local storage'a kaydet
  private static saveGuestNotification(roomId: string, message: string, type: string): void {
    if (typeof window === 'undefined') return;

    try {
      const key = `guest_notifications_${roomId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      };

      existing.unshift(notification);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 10))); // Max 10 bildirim
      console.log('Guest notification saved:', { roomId, message, type, key });
    } catch (error) {
      console.error('Error saving guest notification:', error);
    }
  }

  // Misafir bildirimlerini local storage'dan al
  static getGuestNotifications(roomId: string): any[] {
    if (typeof window === 'undefined') return [];

    try {
      const key = `guest_notifications_${roomId}`;
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');
      // Sadece bildirimler varsa log'la
      if (notifications.length > 0) {
        console.log(`Getting notifications for ${roomId}, key: ${key}, found:`, notifications);
      }
      return notifications;
    } catch (error) {
      console.error('Error getting guest notifications:', error);
      return [];
    }
  }

  // Misafir bildirimini okundu olarak işaretle
  static markGuestNotificationAsRead(roomId: string, notificationId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const key = `guest_notifications_${roomId}`;
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');
      const updatedNotifications = notifications.map((notification: any) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      localStorage.setItem(key, JSON.stringify(updatedNotifications));
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // CRM Entegrasyonu - Misafir bilgilerini çek
  static async getGuestFromCRM(roomId: string): Promise<{
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    roomNumber: string;
    guestCount: number;
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/guest/${roomId}`);
      if (!response.ok) throw new Error('Failed to fetch guest data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching guest data from CRM:', error);
      // Mock data döndür
      return this.getMockGuestData(roomId);
    }
  }

  // İsim formatlama fonksiyonu - uzun soyadlarını kısalt
  static formatGuestName(name: string, surname: string, maxLength: number = 15): string {
    const fullName = `${name} ${surname}`;

    // Eğer toplam uzunluk maksimumdan kısaysa, olduğu gibi döndür
    if (fullName.length <= maxLength) {
      return fullName;
    }

    // Soyadını kısalt
    const shortenedSurname = surname.charAt(0).toUpperCase() + '.';
    const shortenedName = `${name} ${shortenedSurname}`;

    // Kısaltılmış isim de hala uzunsa, sadece adı döndür
    if (shortenedName.length > maxLength) {
      return name;
    }

    return shortenedName;
  }

  // Mock misafir verisi
  private static getMockGuestData(roomId: string): {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    roomNumber: string;
    guestCount: number;
  } | null {
    const roomNumber = roomId.replace('room-', '');

    // Farklı odalar için farklı misafir verileri - test için uzun soyadları ekledik
    const mockGuests: { [key: string]: any } = {
      '101': {
        id: 'guest-101',
        name: 'Ahmet',
        surname: 'Yılmaz',
        email: 'ahmet.yilmaz@email.com',
        phone: '+90 555 123 4567',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        roomNumber: '101',
        guestCount: 2
      },
      '102': {
        id: 'guest-102',
        name: 'Ayşe',
        surname: 'Demir',
        email: 'ayse.demir@email.com',
        phone: '+90 555 234 5678',
        checkIn: '2024-01-16',
        checkOut: '2024-01-19',
        roomNumber: '102',
        guestCount: 1
      },
      '103': {
        id: 'guest-103',
        name: 'Mehmet',
        surname: 'Kaya',
        email: 'mehmet.kaya@email.com',
        phone: '+90 555 345 6789',
        checkIn: '2024-01-17',
        checkOut: '2024-01-20',
        roomNumber: '103',
        guestCount: 3
      },
      '104': {
        id: 'guest-104',
        name: 'Fatma',
        surname: 'Çakmakçıoğlu',
        email: 'fatma.cakmakcioglu@email.com',
        phone: '+90 555 456 7890',
        checkIn: '2024-01-18',
        checkOut: '2024-01-21',
        roomNumber: '104',
        guestCount: 2
      },
      '105': {
        id: 'guest-105',
        name: 'Ali',
        surname: 'Kılıçdaroğlu',
        email: 'ali.kilicdaroglu@email.com',
        phone: '+90 555 567 8901',
        checkIn: '2024-01-19',
        checkOut: '2024-01-22',
        roomNumber: '105',
        guestCount: 1
      }
    };

    return mockGuests[roomNumber] || {
      id: `guest-${roomNumber}`,
      name: 'Misafir',
      surname: 'Bey',
      email: 'guest@hotel.com',
      phone: '+90 555 000 0000',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roomNumber,
      guestCount: 1
    };
  }

  // Global mock data - basit ve çalışan sistem
  private static mockRequests: GuestRequest[] = [];

  // Mock data'yı localStorage'dan al
  private static getMockRequests(): GuestRequest[] {
    if (typeof window === 'undefined') return this.mockRequests;

    try {
      const stored = localStorage.getItem('roomxqr_requests');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }

    return this.mockRequests;
  }

  // Mock data'yı localStorage'a kaydet
  private static saveMockRequests(requests: GuestRequest[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('roomxqr_requests', JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving requests:', error);
    }
  }

  // Oda isteklerini temizle (çıkış işleminde)
  static async clearRoomRequests(roomId: string): Promise<void> {
    try {
      // API'ye istek gönder
      const response = await fetch(`${API_BASE_URL}/requests/clear-room`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });

      if (!response.ok) throw new Error('Failed to clear room requests');

    } catch (error) {
      console.error('Error clearing room requests:', error);
      // Mock: Local storage'dan oda isteklerini temizle
      this.clearRoomRequestsFromLocalStorage(roomId);
    }
  }

  // Local storage'dan oda isteklerini temizle
  private static clearRoomRequestsFromLocalStorage(roomId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('roomxqr_requests');
      if (stored) {
        const requests: GuestRequest[] = JSON.parse(stored);
        // Bu oda için olan istekleri filtrele
        const filteredRequests = requests.filter(request => request.roomId !== roomId);
        localStorage.setItem('roomxqr_requests', JSON.stringify(filteredRequests));
        console.log(`Cleared requests for room ${roomId}, remaining: ${filteredRequests.length}`);
      }
    } catch (error) {
      console.error('Error clearing room requests from localStorage:', error);
    }
  }
}

// WebSocket hook'u
export function useWebSocket(roomId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = ApiService.connectWebSocket(roomId, (data) => {
      console.log('WebSocket message received:', data);
      // Burada gelen mesajları işleyebiliriz
    });

    if (websocket) {
      setWs(websocket);
      setIsConnected(true);
    }

    return () => {
      if (websocket) {
        websocket.close();
        setIsConnected(false);
      }
    };
  }, [roomId]);

  return { ws, isConnected };
}

