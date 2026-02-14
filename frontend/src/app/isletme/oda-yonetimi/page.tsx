'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { ApiService, RoomStatus } from '@/services/api';
import {
  BedDouble,
  User,
  Calendar,
  Wallet,
  LogIn,
  LogOut,
  Plus,
  ChevronDown,
  Loader2,
  X,
} from 'lucide-react';

interface OrderRow {
  id: string;
  roomId: string;
  totalAmount: number;
  status: string;
}

export default function OdaYonetimiPage() {
  const { token } = useAuth();
  const { getTranslation } = useLanguageStore();
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInModal, setCheckInModal] = useState<{ roomId: string; number: string } | null>(null);
  const [checkOutConfirm, setCheckOutConfirm] = useState<{ roomId: string; number: string; guestName: string; debt: number } | null>(null);
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
  const API_BASE_URL = /\/api\/?$/.test(API_BASE) ? API_BASE.replace(/\/$/, '') : `${API_BASE.replace(/\/$/, '')}/api`;

  const getTenantSlug = () => {
    if (typeof window === 'undefined') return 'demo';
    const hostname = window.location.hostname;
    const sub = hostname.split('.')[0];
    return sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend' ? sub : 'demo';
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setError(null);
    setIsLoading(true);
    try {
      const [roomsData, ordersRes] = await Promise.all([
        ApiService.getRooms(token),
        fetch(`${API_BASE_URL}/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-tenant': getTenantSlug(),
          },
        }),
      ]);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const list = Array.isArray(ordersData) ? ordersData : [];
        setOrders(list.map((o: any) => ({
          id: o.id,
          roomId: o.roomId || '',
          totalAmount: parseFloat(o.totalAmount) || 0,
          status: (o.status || '').toUpperCase(),
        })));
      } else {
        setOrders([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Veri yüklenemedi');
      setRooms([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const roomDebt = useCallback((roomId: string, roomNumber: string) => {
    const norm = (id: string) => (id || '').replace(/^room-/, '');
    const num = norm(roomId) || roomNumber;
    return orders
      .filter(o => (norm(o.roomId) || o.roomId) === num && (o.status === 'DELIVERED' || o.status === 'READY'))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const roomsByFloor = rooms.reduce<Record<number, RoomStatus[]>>((acc, r) => {
    const floor = typeof r.floor === 'number' ? r.floor : parseInt(String(r.floor), 10) || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(r);
    return acc;
  }, {});

  const floorNumbers = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);

  useEffect(() => {
    if (rooms.length > 0 && expandedFloors.size === 0) {
      const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
      setExpandedFloors(new Set(floors));
    }
  }, [rooms.length]);

  const toggleFloor = (floor: number) => {
    setExpandedFloors(prev => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BedDouble className="w-7 h-7 text-amber-600" />
          {getTranslation('sidebar.room_management')}
        </h1>
        <p className="text-gray-600 mt-1">
          Tüm odaları katlara göre görüntüleyin, dolu/boş durumu, misafir bilgileri ve çıkışta alınacak borçları yönetin.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          <BedDouble className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p>Henüz oda kaydı yok.</p>
          <p className="text-sm mt-1">QR Kod sayfasından oda oluşturabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floorNumbers.map(floor => {
            const floorRooms = roomsByFloor[floor] || [];
            const isOpen = expandedFloors.has(floor);
            return (
              <div key={floor} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFloor(floor)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                >
                  <span className="font-semibold text-gray-900">{floor}. Kat</span>
                  <span className="text-sm text-gray-500">{floorRooms.length} oda</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {floorRooms.map(room => {
                      const num = room.number || room.roomId.replace(/^room-/, '');
                      const occupied = room.status === 'occupied';
                      const debt = roomDebt(room.roomId, num);
                      return (
                        <div
                          key={room.roomId}
                          className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-gray-50/50"
                        >
                          <div className="w-14 flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg bg-amber-50 text-amber-800 border border-amber-200">
                              {num}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${occupied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {occupied ? 'Dolu' : 'Boş'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{room.guestName || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {room.checkIn ? new Date(room.checkIn).toLocaleDateString('tr-TR') : '—'} – {room.checkOut ? new Date(room.checkOut).toLocaleDateString('tr-TR') : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span className={debt > 0 ? 'font-medium text-amber-700' : 'text-gray-500'}>
                                {debt > 0 ? `₺${debt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {occupied ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCheckOutConfirm({
                                    roomId: room.roomId,
                                    number: num,
                                    guestName: room.guestName || 'Misafir',
                                    debt,
                                  })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Çıkış
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCheckInModal({ roomId: room.roomId, number: num })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm font-medium"
                              >
                                <LogIn className="w-4 h-4" />
                                Giriş
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Check-in modal */}
      {checkInModal && (
        <CheckInModal
          roomId={checkInModal.roomId}
          roomNumber={checkInModal.number}
          onClose={() => setCheckInModal(null)}
          onSuccess={() => {
            setCheckInModal(null);
            loadData();
          }}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {/* Check-out confirm */}
      {checkOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Çıkış onayı</h3>
            <p className="text-gray-600 text-sm">
              <strong>Oda {checkOutConfirm.number}</strong> – {checkOutConfirm.guestName}
            </p>
            {checkOutConfirm.debt > 0 && (
              <p className="mt-2 text-amber-700 font-medium">
                Çıkışta alınacak tutar: <strong>₺{checkOutConfirm.debt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Bu tutarı aldıktan sonra çıkış işlemini onaylayın.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCheckOutConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await ApiService.checkOutGuest(checkOutConfirm.roomId);
                    setCheckOutConfirm(null);
                    loadData();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Çıkış yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckInModal({
  roomId,
  roomNumber,
  onClose,
  onSuccess,
  submitting,
  setSubmitting,
}: {
  roomId: string;
  roomNumber: string;
  onClose: () => void;
  onSuccess: () => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setSubmitting(true);
    try {
      await ApiService.checkInGuest(roomId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Oda {roomNumber} – Giriş</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giriş tarihi</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış tarihi</label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Giriş yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
