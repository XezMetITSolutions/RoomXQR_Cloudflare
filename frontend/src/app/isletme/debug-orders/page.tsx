'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService, RoomStatus } from '@/services/api';

export default function DebugOrdersPage() {
    const { token } = useAuth();
    const [rooms, setRooms] = useState<RoomStatus[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
    const API_BASE_URL = /\/api\/?$/.test(API_BASE) ? API_BASE.replace(/\/$/, '') : `${API_BASE.replace(/\/$/, '')}/api`;

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setLoading(true);
            try {
                // Fetch rooms and orders in parallel
                const [roomsData, ordersRes] = await Promise.all([
                    ApiService.getRooms(token),
                    fetch(`${API_BASE_URL}/orders`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'x-tenant': typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo',
                        },
                    }),
                ]);

                console.log('API Rooms Response:', roomsData);

                const rawRooms = Array.isArray(roomsData) ? roomsData : [];
                setRooms(rawRooms);

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    console.log('API Orders Response:', ordersData);
                    setOrders(Array.isArray(ordersData) ? ordersData : []);
                } else {
                    console.error('Orders fetch failed:', ordersRes.status);
                }
            } catch (e) {
                console.error('Debug load error:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token, API_BASE_URL]);

    // Normalization logic same as in OdaYonetimiPage
    const norm = (val: any) => String(val ?? '').replace(/^room-/i, '').trim();

    // Find the selected room object
    const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);
    const selectedRoomNorm = selectedRoom ? norm(selectedRoom.number ?? selectedRoom.roomId) : '';

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Debug Sipariş & Oda Eşleşmesi</h1>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 rounded">Yenile</button>
            </div>

            {loading && <div className="p-4 bg-blue-100 text-blue-700 rounded">Veriler yükleniyor...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Sol Kolon: Odalar */}
                <div className="border p-4 rounded bg-white shadow-sm">
                    <h2 className="font-bold text-lg mb-4 border-b pb-2">1. Oda Seçimi ({rooms.length})</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">İncelenecek Odayı Seçin:</label>
                        <select
                            className="w-full p-2 border rounded bg-gray-50"
                            value={selectedRoomId}
                            onChange={e => setSelectedRoomId(e.target.value)}
                        >
                            <option value="">-- Oda Seç --</option>
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>
                                    {r.number} (ID: {r.roomId}) {r.status === 'occupied' ? '🟢 Dolu' : '⚪ Boş'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedRoom && (
                        <div className="p-4 bg-yellow-50 rounded border border-yellow-200 text-sm space-y-2">
                            <div className="font-bold text-yellow-800">Seçili Oda Detayları:</div>
                            <div><strong>Ham ID:</strong> "{selectedRoom.roomId}"</div>
                            <div><strong>Ham Number:</strong> "{selectedRoom.number}"</div>
                            <div><strong>Normalize Edilmiş Eşleşme Değeri:</strong> <span className="font-mono bg-white px-1 rounded">"{selectedRoomNorm}"</span></div>
                            <div><strong>Durum:</strong> {selectedRoom.status}</div>
                            <div><strong>Misafir:</strong> {selectedRoom.guestName || '-'}</div>
                        </div>
                    )}
                </div>

                {/* Sağ Kolon: Siparişler */}
                <div className="border p-4 rounded bg-white shadow-sm">
                    <h2 className="font-bold text-lg mb-4 border-b pb-2">2. Sipariş Analizi ({orders.length})</h2>

                    {!selectedRoomId ? (
                        <div className="text-gray-500 italic">Lütfen analiz etmek için soldan bir oda seçin.</div>
                    ) : (
                        <div className="space-y-4 h-[600px] overflow-auto pr-2">
                            {orders.map(o => {
                                const orderRoomNorm = norm(o.roomId);
                                const isIdMatch = orderRoomNorm === selectedRoomNorm;

                                // Status check logic
                                const isPaid = o.status === 'PAID' || o.status === 'COMPLETED'; // Depends on your logic what is "history" vs "debt"
                                // Actually the logic in OdaYonetimiPage is:
                                // Debt (Unpaid): status === 'DELIVERED' || status === 'READY'
                                // History: All matching room orders

                                const isDebtStatus = o.status === 'DELIVERED' || o.status === 'READY';

                                if (!isIdMatch) return null; // Sadece eşleşenleri veya potansiyel eşleşenleri göstersek daha iyi, ama debug için hepsini süzmek lazım.
                                // Let's filter visually.

                                return (
                                    <div key={o.id} className={`p-3 border rounded text-xs space-y-1 ${isIdMatch ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50 hidden'}`}>
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-gray-700">Sipariş #{o.id.slice(0, 6)}</span>
                                            <span className={`px-2 py-0.5 rounded text-white ${isDebtStatus ? 'bg-red-500' : 'bg-gray-400'}`}>{o.status}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <span className="text-gray-500 block">Oda ID (Siparişten):</span>
                                                <code className="bg-white px-1 rounded border">"{o.roomId}"</code>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Normalize:</span>
                                                <code className="bg-white px-1 rounded border">"{orderRoomNorm}"</code>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-green-200">
                                            <div className="flex justify-between font-bold">
                                                <span>Tutar:</span>
                                                <span>{o.totalAmount} TL</span>
                                            </div>
                                            <div className="text-gray-500 mt-1">{new Date(o.createdAt).toLocaleString()}</div>
                                            <div className="mt-1">
                                                {o.items?.map((item: any, idx: number) => (
                                                    <div key={idx}>- {item.quantity}x {item.menuItem?.name || 'Item'}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-2 p-1 bg-blue-100 text-blue-800 text-center rounded font-bold">
                                            EŞLEŞME BAŞARILI ✅
                                        </div>
                                    </div>
                                );
                            })}

                            {orders.filter(o => norm(o.roomId) === selectedRoomNorm).length === 0 && (
                                <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                                    Bu oda için hiç sipariş eşleşmedi.
                                    <br /><br />
                                    <strong>Olası Sebepler:</strong>
                                    <ul className="list-disc pl-5 mt-2">
                                        <li>Siparişlerdeki `roomId` alanı boş veya hatalı olabilir.</li>
                                        <li>Back-end'den gelen veride oda numarası farklı formatta olabilir.</li>
                                        <li>Normalize fonksiyonu (boşluk silme vb.) yetersiz kalıyor olabilir.</li>
                                    </ul>
                                    <div className="mt-4">
                                        <strong>Tüm Siparişlerdeki Oda ID'leri:</strong>
                                        <div className="max-h-32 overflow-auto bg-white p-2 border mt-1 text-xs">
                                            {orders.map(o => <div key={o.id}>{o.roomId} (Norm: {norm(o.roomId)})</div>)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
