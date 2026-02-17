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
  Pencil,
  Eye,
  Receipt,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    price: number;
  };
}

interface OrderRow {
  id: string;
  roomId: string; // or number?
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentMethod?: string;
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
  const [selectedFloorTab, setSelectedFloorTab] = useState<number | 'all'>('all');
  const [editGuestModal, setEditGuestModal] = useState<{ roomId: string; number: string; guestName: string; checkIn: string; checkOut: string } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null);

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
      // Numarayı her zaman sadece rakam kısmına indirge (room-101 veya "room-101" -> 101)
      const normNum = (val: any) => String(val ?? '').replace(/^room-/, '').trim();
      const rawRooms = Array.isArray(roomsData) ? roomsData : [];
      const byNum = new Map<string, RoomStatus>();
      for (const r of rawRooms) {
        const num = normNum(r.number ?? r.roomId);
        if (!num) continue;
        const existing = byNum.get(num);
        if (!existing) {
          byNum.set(num, { ...r, number: num });
        } else {
          if (r.status === 'occupied' && existing.status !== 'occupied') byNum.set(num, { ...r, number: num });
          else if (normNum(r.roomId) === num && normNum(existing.roomId) !== num) byNum.set(num, { ...r, number: num });
          else byNum.set(num, { ...existing, number: num });
        }
      }
      setRooms(Array.from(byNum.values()));
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const list = Array.isArray(ordersData) ? ordersData : [];
        setOrders(list.map((o: any) => {
          // Use room number if available from the included room object
          const displayRoomId = o.room?.number || o.roomId || '';
          return {
            id: o.id,
            roomId: displayRoomId,
            totalAmount: parseFloat(o.totalAmount) || 0,
            status: (o.status || '').toUpperCase(),
            createdAt: o.createdAt,
            items: o.items || [],
            paymentMethod: o.paymentMethod
          };
        }));
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

  // Helper function for consistent room ID matching
  const matchesRoom = useCallback((orderRoomId: string, targetRoomNum: string) => {
    // Normalize both inputs: remove *all* 'room-' prefixes (case insensitive), trim whitespace
    const n1 = String(orderRoomId || '').replace(/^(room-)+/i, '').trim();
    const n2 = String(targetRoomNum || '').replace(/^(room-)+/i, '').trim();
    return n1 === n2;
  }, []);

  const roomDebt = useCallback((roomId: string, roomNumber: string) => {
    // We can use the passed roomNumber which is already normalized in the loop,
    // or re-normalize roomId just to be safe. "matchesRoom" handles normalization.
    const norm = (id: string) => (id || '').replace(/^(room-)+/i, '').trim();
    const num = norm(roomId) || roomNumber;

    return orders
      .filter(o => matchesRoom(o.roomId, num) && (o.status === 'DELIVERED' || o.status === 'READY'))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders, matchesRoom]);

  const normRoomNum = (val: any) => String(val ?? '').replace(/^(room-)+/i, '').trim();
  // Katlara göre grupla; aynı numara tek satır
  const roomsByFloor = rooms.reduce<Record<number, RoomStatus[]>>((acc, r) => {
    const floor = typeof r.floor === 'number' ? r.floor : parseInt(String(r.floor), 10) || 1;
    const num = normRoomNum(r.number ?? r.roomId);
    if (!num) return acc;
    if (!acc[floor]) acc[floor] = [];
    const atFloor = acc[floor];
    const existingIdx = atFloor.findIndex(x => normRoomNum(x.number ?? x.roomId) === num);
    if (existingIdx === -1) atFloor.push(r);
    else {
      const existing = atFloor[existingIdx];
      if (r.status === 'occupied' && existing.status !== 'occupied') atFloor[existingIdx] = r;
      else if (normRoomNum(r.roomId) === num && normRoomNum(existing.roomId) !== num) atFloor[existingIdx] = r;
    }
    return acc;
  }, {});

  const floorNumbers = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
  const floorsToShow = selectedFloorTab === 'all' ? floorNumbers : [selectedFloorTab];

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
          {getTranslation('page.room_management.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          {getTranslation('page.room_management.subtitle')}
        </p>
        {/* Kat sekmeleri (Registerkarte) */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setSelectedFloorTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFloorTab === 'all' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {getTranslation('room_mgmt.all_rooms')}
          </button>
          {floorNumbers.map(floor => (
            <button
              key={floor}
              type="button"
              onClick={() => setSelectedFloorTab(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFloorTab === floor ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {floor}{getTranslation('room_mgmt.floor_n')}
            </button>
          ))}
        </div>
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
          <p>{getTranslation('room_mgmt.no_rooms_yet')}</p>
          <p className="text-sm mt-1">{getTranslation('room_mgmt.no_rooms_hint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floorsToShow.map(floor => {
            const floorRooms = roomsByFloor[floor] || [];
            const isOpen = expandedFloors.has(floor);
            return (
              <div key={floor} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFloor(floor)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
                >
                  <span className="font-semibold text-gray-900">{floor}{getTranslation('room_mgmt.floor_n')}</span>
                  <span className="text-sm text-gray-500">{floorRooms.length} {getTranslation('room_mgmt.rooms_count')}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {floorRooms.map(room => {
                      const num = normRoomNum(room.number ?? room.roomId);
                      const occupied = room.status === 'occupied';
                      const debt = roomDebt(room.roomId, num);
                      return (
                        <div
                          key={num}
                          className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => {
                            // Sadece butona basılmadığında çalışsın
                            setSelectedRoom(room);
                          }}
                        >
                          <div className="w-14 flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg bg-amber-50 text-amber-800 border border-amber-200">
                              {num}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${occupied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {occupied ? getTranslation('room_mgmt.occupied') : getTranslation('room_mgmt.vacant')}
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
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedRoom(room)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                              title={getTranslation('room_mgmt.detail')}
                            >
                              <Eye className="w-4 h-4" />
                              {getTranslation('room_mgmt.detail')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditGuestModal({
                                roomId: room.roomId,
                                number: num,
                                guestName: room.guestName || '',
                                checkIn: room.checkIn ? new Date(room.checkIn).toISOString().slice(0, 10) : '',
                                checkOut: room.checkOut ? new Date(room.checkOut).toISOString().slice(0, 10) : '',
                              })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                              title={getTranslation('room_mgmt.edit')}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {occupied ? (
                              <button
                                type="button"
                                onClick={() => setCheckOutConfirm({
                                  roomId: room.roomId,
                                  number: num,
                                  guestName: room.guestName || getTranslation('room_mgmt.guest'),
                                  debt,
                                })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                              >
                                <LogOut className="w-4 h-4" />
                                {getTranslation('room_mgmt.checkout')}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCheckInModal({ roomId: room.roomId, number: num })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm font-medium"
                              >
                                <LogIn className="w-4 h-4" />
                                {getTranslation('room_mgmt.checkin')}
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

      {/* Room Detail Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          orders={orders}
          onClose={() => setSelectedRoom(null)}
          onEdit={() => {
            const num = normRoomNum(selectedRoom.number ?? selectedRoom.roomId);
            setEditGuestModal({
              roomId: selectedRoom.roomId,
              number: num,
              guestName: selectedRoom.guestName || '',
              checkIn: selectedRoom.checkIn ? new Date(selectedRoom.checkIn).toISOString().slice(0, 10) : '',
              checkOut: selectedRoom.checkOut ? new Date(selectedRoom.checkOut).toISOString().slice(0, 10) : '',
            });
            setSelectedRoom(null); // Close details to open edit
          }}
        />
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

      {/* Düzenle misafir modal */}
      {editGuestModal && (
        <EditGuestModal
          roomNumber={editGuestModal.number}
          initialGuestName={editGuestModal.guestName}
          initialCheckIn={editGuestModal.checkIn}
          initialCheckOut={editGuestModal.checkOut}
          onClose={() => setEditGuestModal(null)}
          onSuccess={() => {
            setEditGuestModal(null);
            loadData();
          }}
          roomId={editGuestModal.roomId}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {/* Check-out confirm */}
      {checkOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{getTranslation('room_mgmt.checkout_confirm_title')}</h3>
            <p className="text-gray-600 text-sm">
              <strong>{getTranslation('qr.room')} {checkOutConfirm.number}</strong> – {checkOutConfirm.guestName}
            </p>
            {checkOutConfirm.debt > 0 && (
              <p className="mt-2 text-amber-700 font-medium">
                {getTranslation('room_mgmt.checkout_amount')} <strong>₺{checkOutConfirm.debt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {getTranslation('room_mgmt.checkout_confirm_hint')}
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCheckOutConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {getTranslation('general.cancel')}
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
                {getTranslation('room_mgmt.do_checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomDetailModal({
  room,
  orders,
  onClose,
  onEdit
}: {
  room: RoomStatus;
  orders: OrderRow[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const { getTranslation } = useLanguageStore();
  const norm = (id: string | number) => (String(id) || '').replace(/^(room-)+/i, '').trim();
  const roomNum = norm(room.number ?? room.roomId);

  console.log('RoomDetailModal Debug:', {
    roomNumber: room.number,
    roomRoomId: room.roomId,
    derivedRoomNum: roomNum,
    totalOrders: orders.length
  });

  // Filter orders for this room using robust matching
  const roomOrders = orders.filter(o => {
    const orderRoomVal = o.roomId;
    const orderRoom = norm(orderRoomVal);
    const match = orderRoom === roomNum;

    // Log failures to see what's wrong (only first few to avoid spam)
    if (!match && orders.length > 0 && orders.length < 50 && (orderRoom.includes(roomNum) || roomNum.includes(orderRoom))) {
      console.log('Mismatch:', { orderRoomVal, normalized: orderRoom, target: roomNum });
    }

    return match;
  });

  // Unpaid orders (Debt)
  const unpaidOrders = roomOrders.filter(o => o.status === 'DELIVERED' || o.status === 'READY');
  const totalDebt = unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Sort all orders by date desc
  const historyOrders = [...roomOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-xl bg-amber-50 text-amber-800 border border-amber-200">
              {roomNum}
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{getTranslation('room_mgmt.room_details')}</h3>
              <p className="text-sm text-gray-500">{room.floor}{getTranslation('room_mgmt.floor_n')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Guest Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getTranslation('room_mgmt.guest')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{room.guestName || '—'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getTranslation('room_mgmt.stay')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 text-sm">
                    {room.checkIn ? new Date(room.checkIn).toLocaleDateString('tr-TR') : '—'}
                    {' '}<span className="text-gray-400">→</span>{' '}
                    {room.checkOut ? new Date(room.checkOut).toLocaleDateString('tr-TR') : '—'}
                  </span>
                </div>
              </div>
            </div>
            {room.guestName && (
              <button
                onClick={onEdit}
                className="ml-4 p-2 text-amber-600 hover:bg-amber-50 rounded-lg flex-shrink-0"
                title={getTranslation('room_mgmt.guest_info_edit')}
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Unpaid Balance Section */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-amber-600" />
            Ödenecek Tutar (Açık Siparişler)
          </h4>

          {unpaidOrders.length > 0 ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                <span className="text-sm font-medium text-amber-900">Toplam Borç</span>
                <span className="text-lg font-bold text-amber-700">₺{totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {unpaidOrders.map(order => (
                  <div key={order.id} className="p-3 text-sm hover:bg-gray-50">
                    <div className="flex justify-between text-gray-900 font-medium mb-1">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </span>
                      <span>₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="px-2 py-1.5 bg-gray-50 rounded-lg">
                      <ul className="text-gray-600 text-xs space-y-1">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.menuItem?.name || 'Ürün'}</span>
                            <span>₺{(item.price * item.quantity).toLocaleString('tr-TR')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Ödenecek açık sipariş bulunmuyor.
            </div>
          )}
        </div>

        {/* Order History */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Receipt className="w-4 h-4 text-gray-600" />
            Sipariş Geçmişi
          </h4>

          {historyOrders.length > 0 ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {historyOrders.map(order => (
                  <div key={order.id} className="p-3 text-sm hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                          {order.status}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <ul className="pl-2 border-l-2 border-gray-100 ml-1 space-y-1 mt-2">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between text-xs text-gray-600">
                          <span>{item.quantity}x {item.menuItem?.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl text-sm">
              Sipariş geçmişi bulunamadı.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
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
  const { getTranslation } = useLanguageStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [guestLink, setGuestLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setSubmitting(true);
    try {
      const result = await ApiService.checkInGuest(roomId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });
      onSuccess();
      if (result.accessToken && typeof window !== 'undefined') {
        const base = window.location.origin;
        const lang = 'tr';
        setGuestLink(`${base}/${lang}/guest/${roomNumber}?token=${encodeURIComponent(result.accessToken)}`);
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (guestLink) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">{getTranslation('room_mgmt.checkin_complete')}</h3>
            <button type="button" onClick={() => { setGuestLink(null); onClose(); }} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{getTranslation('room_mgmt.guest_link_hint')}</p>
          <div className="flex gap-2">
            <input readOnly value={guestLink} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-gray-50" />
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(guestLink); }}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium whitespace-nowrap"
            >
              {getTranslation('room_mgmt.copy')}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">{getTranslation('room_mgmt.checkout_link_note')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{getTranslation('qr.room')} {roomNumber} – {getTranslation('room_mgmt.checkin')}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.first_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.last_name')}</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.checkin_date')}</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.checkout_date')}</label>
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
              {getTranslation('general.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {getTranslation('room_mgmt.do_checkin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditGuestModal({
  roomId,
  roomNumber,
  initialGuestName,
  initialCheckIn,
  initialCheckOut,
  onClose,
  onSuccess,
  submitting,
  setSubmitting,
}: {
  roomId: string;
  roomNumber: string;
  initialGuestName: string;
  initialCheckIn: string;
  initialCheckOut: string;
  onClose: () => void;
  onSuccess: () => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}) {
  const { getTranslation } = useLanguageStore();
  const parts = (initialGuestName || '').trim().split(/\s+/);
  const [firstName, setFirstName] = useState(parts[0] || '');
  const [lastName, setLastName] = useState(parts.slice(1).join(' ') || '');
  const [checkIn, setCheckIn] = useState(initialCheckIn || new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(initialCheckOut || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiService.updateGuest(roomId, {
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
          <h3 className="text-lg font-semibold text-gray-900">{getTranslation('qr.room')} {roomNumber} – {getTranslation('common.edit')}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.first_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.last_name')}</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.checkin_date')}</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{getTranslation('room_mgmt.checkout_date')}</label>
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
              {getTranslation('general.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
              {getTranslation('general.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
