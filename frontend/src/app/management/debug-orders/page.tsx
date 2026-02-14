'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService, RoomStatus } from '@/services/api';

export default function DebugOrdersPage() {
    const { token } = useAuth();
    const [rooms, setRooms] = useState<RoomStatus[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
    const API_BASE_URL = /\/api\/?$/.test(API_BASE) ? API_BASE.replace(/\/$/, '') : `${API_BASE.replace(/\/$/, '')}/api`;

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [roomsData, ordersRes] = await Promise.all([
                    ApiService.getRooms(token).catch(e => {
                        console.error("Rooms fetch failed", e);
                        return [];
                    }),
                    fetch(`${API_BASE_URL}/orders`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'x-tenant': typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo',
                        },
                    }).catch(e => {
                        console.error("Orders fetch failed", e);
                        return { ok: false, status: 500, json: async () => [] } as any;
                    }),
                ]);

                const rawRooms = Array.isArray(roomsData) ? roomsData : [];
                setRooms(rawRooms);

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(Array.isArray(ordersData) ? ordersData : []);
                } else {
                    setError(`Orders API returned status: ${ordersRes.status}`);
                }
            } catch (e: any) {
                console.error('Debug load error:', e);
                setError(e.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token, API_BASE_URL]);

    const norm = (val: any) => String(val ?? '').replace(/^room-/i, '').trim();

    // Safe Date Formatter
    const safeDate = (dateVal: any) => {
        try {
            if (!dateVal) return 'Yok';
            return new Date(dateVal).toLocaleString();
        } catch {
            return 'Geçersiz Tarih';
        }
    };

    const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);
    const selectedRoomNorm = selectedRoom ? norm(selectedRoom.number ?? selectedRoom.roomId) : '';

    // Safe filtering logic
    const matchingOrders = orders.filter(o => {
        if (!selectedRoomId) return false;
        return norm(o.roomId) === selectedRoomNorm;
    });

    if (error) {
        return <div className="p-8 text-red-600 bg-red-50">{error}</div>;
    }

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Debug Sipariş & Oda Eşleşmesi (Safe Mode)</h1>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 rounded">Yenile</button>
            </div>

            {loading && <div className="p-4 bg-blue-100 text-blue-700 rounded">Veriler yükleniyor...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Sol Kolon: Odalar */}
                <div className="border p-4 rounded bg-white shadow-sm">
                    <h2 className="font-bold text-lg mb-4 border-b pb-2">1. Oda Seçimi ({rooms.length})</h2>
                    <div className="mb-4">
                        <select
                            className="w-full p-2 border rounded bg-gray-50"
                            value={selectedRoomId}
                            onChange={e => setSelectedRoomId(e.target.value)}
                        >
                            <option value="">-- Oda Seç --</option>
                            {rooms.map((r, i) => (
                                <option key={r.roomId || i} value={r.roomId}>
                                    {r.number} (ID: {r.roomId}) {r.status === 'occupied' ? 'Dolu' : 'Boş'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedRoom && (
                        <div className="p-4 bg-yellow-50 rounded border border-yellow-200 text-sm space-y-2">
                            <div className="font-bold text-yellow-800">Seçili Oda Tespiti:</div>
                            <div><strong>Ham ID:</strong> "{selectedRoom.roomId}"</div>
                            <div><strong>Numara:</strong> "{selectedRoom.number}"</div>
                            <div><strong>Normalize (Hedef):</strong> <span className="font-mono bg-white px-1 rounded">"{selectedRoomNorm}"</span></div>
                        </div>
                    )}
                </div>

                {/* Sağ Kolon: Siparişler */}
                <div className="border p-4 rounded bg-white shadow-sm">
                    <h2 className="font-bold text-lg mb-4 border-b pb-2">2. Eşleşen Siparişler ({matchingOrders.length} / {orders.length})</h2>

                    {!selectedRoomId ? (
                        <div className="text-gray-500 italic">Analiz için soldan oda seçin.</div>
                    ) : (
                        <div className="space-y-4 h-[600px] overflow-auto pr-2">
                            {matchingOrders.length === 0 ? (
                                <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                                    Bu oda id'si ile normalizasyon sonrası eşleşen sipariş bulunamadı.
                                    <hr className="my-2 border-red-200" />
                                    <strong>Neye Bakıldı?</strong>
                                    <div>Hedef Normalize ID: "{selectedRoomNorm}"</div>
                                    <br />
                                    <strong>Örnek Eşleşmeyen Raw Sipariş ID'leri (ilk 5):</strong>
                                    <div className="text-xs font-mono mt-1">
                                        {orders.slice(0, 5).map(o => (
                                            <div key={o.id}>
                                                Raw: "{o.roomId}" -> Norm: "{norm(o.roomId)}"
                                                {norm(o.roomId) === selectedRoomNorm ? ' (EŞLEŞMELİYDİ!)' : ' (X)'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                matchingOrders.map(o => (
                                    <div key={o.id || Math.random()} className="p-3 border rounded text-xs space-y-1 border-green-500 bg-green-50">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-gray-700">#{String(o.id).slice(0, 6)}</span>
                                            <span className="px-2 py-0.5 rounded text-white bg-blue-500">{o.status}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <span className="text-gray-500 block">Sipariş Oda ID:</span>
                                                <code className="bg-white px-1 rounded border">"{o.roomId}"</code>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Normalize:</span>
                                                <code className="bg-white px-1 rounded border">"{norm(o.roomId)}"</code>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-green-200">
                                            <div className="flex justify-between font-bold">
                                                <span>{o.totalAmount} TL</span>
                                                <span className="text-gray-500 font-normal">{safeDate(o.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
