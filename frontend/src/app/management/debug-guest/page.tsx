'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, UserPlus, Search, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DebugGuestPage() {
    const { token } = useAuth();
    const [roomId, setRoomId] = useState('101');
    const [guestName, setGuestName] = useState('Test Misafir');
    const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [roomStatus, setRoomStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const checkRoomStatus = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const tenant = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo';
            const slug = tenant && tenant !== 'www' && tenant !== 'roomxqr' ? tenant : 'demo';

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com'}/api/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant': slug
                }
            });
            const data = await response.json();
            const allRooms = Array.isArray(data) ? data : (data.rooms || []);
            const targetRoom = allRooms.find((r: any) => r.number === roomId || r.id === roomId || r.id === `room-${roomId}`);
            setRoomStatus(targetRoom);

            addLog(`Oda Durumu Sorgulandı: ${targetRoom ? 'Bulundu' : 'Bulunamadı'}`, 'info', targetRoom);
        } catch (err: any) {
            setError(err.message);
            addLog(`Oda Sorgulama Hatası: ${err.message}`, 'error');
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const addLog = (message: string, type: 'info' | 'success' | 'error', data?: any) => {
        setResults(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            data
        }, ...prev]);
    };

    const handleCheckIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const tenant = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'demo';
            const slug = tenant && tenant !== 'www' && tenant !== 'roomxqr' ? tenant : 'demo';

            const apiPath = `${window.location.origin}/api/guest-token`;

            addLog(`Check-in başlatılıyor: ${apiPath}`, 'info', { roomId, guestName, checkIn, checkOut });

            const response = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-tenant': slug
                },
                body: JSON.stringify({
                    roomId,
                    guestName,
                    checkIn,
                    checkOut
                })
            });

            const data = await response.json();

            if (response.ok) {
                addLog('Check-in Başarılı!', 'success', data);
                // Refresh status after delay
                setTimeout(() => checkRoomStatus(true), 1500);
            } else {
                addLog('Check-in Başarısız', 'error', data);
            }
        } catch (err: any) {
            setError(err.message);
            addLog(`İstek Hatası: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Misafir Kayıt Debug Paneli</h1>
                    <p className="text-gray-600">Oda atama ve kayıt işlemlerini test etmek için bu sayfayı kullanın.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            Test Verileri
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Oda Numarası</label>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Misafir Ad Soyad</label>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleCheckIn}
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                            >
                                {isLoading ? 'İşlem yapılıyor...' : 'Check-in Gönder'}
                            </button>
                            <button
                                onClick={() => checkRoomStatus()}
                                className="px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Room Status Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-600" />
                            Mevcut Oda Durumu (Backend)
                        </h2>

                        {roomStatus ? (
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-blue-100">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Oda No:</span>
                                    <span className="font-bold">{roomStatus.number || roomStatus.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Durum:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roomStatus.isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {roomStatus.isOccupied ? 'DOLU / GUEST ATANMIŞ' : 'BOŞ'}
                                    </span>
                                </div>
                                {roomStatus.guests && roomStatus.guests.length > 0 ? (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-2">Aktif Misafir Verisi:</p>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-gray-500">İsim:</span> {roomStatus.guests[0].firstName} {roomStatus.guests[0].lastName}</p>
                                            <p><span className="text-gray-500">Check-in:</span> {roomStatus.guests[0].checkIn}</p>
                                            <p><span className="text-gray-500">Check-out:</span> {roomStatus.guests[0].checkOut || '-'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-orange-600 text-sm mt-4 bg-orange-50 p-2 rounded">Odaya henüz bir misafir atanmamış.</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-400">
                                {isLoading ? 'Yükleniyor...' : 'Oda verisi henüz sorgulanmadı.'}
                            </div>
                        )}

                        <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded border border-dashed">
                            DİKKAT: Sayfayı yenilediğinizde "Mevcut Oda Durumu" alanındaki isim kayboluyorsa backend kaydı başarısız oluyor demektir.
                        </div>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">İşlem Günlüğü (Logs)</h3>
                        <button onClick={() => setResults([])} className="text-xs text-gray-500 hover:text-white">Temizle</button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto font-mono text-xs">
                        {results.length === 0 && <p className="text-gray-600 italic">Henüz bir işlem yapılmadı...</p>}
                        {results.map(log => (
                            <div key={log.id} className={`p-3 rounded border-l-4 ${log.type === 'error' ? 'bg-red-900/20 border-red-500' :
                                log.type === 'success' ? 'bg-green-900/20 border-green-500' :
                                    'bg-blue-900/20 border-blue-500'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-300">[{log.timestamp}] {log.message}</span>
                                    {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                </div>
                                {log.data && (
                                    <pre className="mt-2 text-[10px] text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
