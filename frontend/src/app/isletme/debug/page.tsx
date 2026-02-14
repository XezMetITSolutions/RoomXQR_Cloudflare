'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService, RoomStatus } from '@/services/api';
import { AlertCircle, CheckCircle, RefreshCw, Hotel, UtensilsCrossed, Users, QrCode } from 'lucide-react';

export default function DebugRoomsPage() {
    const { token, user } = useAuth();
    const [rooms, setRooms] = useState<RoomStatus[]>([]);
    const [kitchenRooms, setKitchenRooms] = useState<RoomStatus[]>([]);
    const [receptionRooms, setReceptionRooms] = useState<RoomStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rawResponse, setRawResponse] = useState<any>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching rooms with token:', token ? 'Present' : 'Missing');

            // 1. Fetch raw rooms data for debugging
            let tenantSlug = 'demo';
            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                    tenantSlug = subdomain;
                }
            }

            const headers: any = { 'Content-Type': 'application/json', 'x-tenant': tenantSlug };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
            const rawRes = await fetch(`${baseUrl}/api/rooms`, { headers });
            const rawJson = await rawRes.json();
            setRawResponse(rawJson);

            // 2. Use service to simulate app logic
            const roomsData = await ApiService.getRooms(token || undefined);
            setRooms(roomsData);

            // Simulate Reception View Logic (usually shows all rooms)
            setReceptionRooms(roomsData);

            // Simulate Kitchen View Logic (usually cares about occupied rooms or active orders, but basic list is same)
            setKitchenRooms(roomsData);

        } catch (err: any) {
            console.error('Debug fetch error:', err);
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-8 h-8 text-blue-600" />
                            Sistem Debug Paneli
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Oda, Misafir ve QR Kod Durum Analizi
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Yenile
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* 1. All Rooms & Guests Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Hotel className="w-5 h-5 text-purple-600" />
                            Tüm Odalar ve Misafir Durumu ({rooms.length})
                        </h2>
                        <span className="text-xs font-mono text-gray-500">
                            Source: GET /api/rooms
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Oda No</th>
                                    <th className="px-6 py-3">Kat</th>
                                    <th className="px-6 py-3">Durum</th>
                                    <th className="px-6 py-3">Misafir Adı</th>
                                    <th className="px-6 py-3">Giriş / Çıkış</th>
                                    <th className="px-6 py-3">QR Kod Modu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Oda bulunamadı veya yükleniyor...
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.roomId} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {room.number || room.roomId.replace('room-', '')}
                                            </td>
                                            <td className="px-6 py-4">{room.floor || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${room.status === 'occupied'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {room.status === 'occupied' ? 'Dolu' : 'Boş'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-blue-600">
                                                {room.guestName || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {room.checkIn ? (
                                                    <div className="flex flex-col">
                                                        <span>Giriş: {new Date(room.checkIn).toLocaleDateString('tr-TR')}</span>
                                                        {room.checkOut && <span>Çıkış: {new Date(room.checkOut).toLocaleDateString('tr-TR')}</span>}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <QrCode className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-mono text-gray-600">
                                                        {room.guestName ? 'Misafir (Dinamik)' : 'Sabit (Oda)'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Reception View Simulation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Hotel className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold">Resepsiyon Görünümü (Simülasyon)</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            Resepsiyon panelinde ({receptionRooms.length}) oda görüntüleniyor.
                        </p>
                        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-2 text-xs font-mono">
                            {JSON.stringify(receptionRooms.map(r => ({ no: r.number, status: r.status, guest: r.guestName })), null, 2)}
                        </div>
                    </div>

                    {/* 3. Kitchen View Simulation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold">Mutfak Görünümü (Simülasyon)</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            Mutfak panelinde ({kitchenRooms.length}) oda görüntüleniyor.
                        </p>
                        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-2 text-xs font-mono">
                            {JSON.stringify(kitchenRooms.map(r => ({ no: r.number, status: r.status, guest: r.guestName })), null, 2)}
                        </div>
                    </div>
                </div>

                {/* 4. Raw API Response */}
                <div className="bg-gray-900 text-gray-100 rounded-xl shadow-sm p-4 overflow-hidden">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Ham API Yanıtı ({rooms.length} items)
                    </h3>
                    <pre className="text-xs overflow-auto max-h-60 p-2 bg-gray-800 rounded">
                        {rawResponse ? JSON.stringify(rawResponse, null, 2) : 'Yükleniyor...'}
                    </pre>
                </div>

            </div>
        </div>
    );
}
