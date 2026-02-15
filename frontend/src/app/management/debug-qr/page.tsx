'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
const API_BASE_URL = `${API_BASE.replace(/\/$/, '')}/api`;

function getTenantSlug() {
  if (typeof window === 'undefined') return 'demo';
  const h = window.location.hostname.split('.')[0];
  return h && h !== 'www' && h !== 'roomxqr' && h !== 'roomxqr-backend' ? h : 'demo';
}

export default function DebugQRPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roomsRes, setRoomsRes] = useState<{ status: number; ok: boolean; data: any; error?: string } | null>(null);
  const [guestLinksRes, setGuestLinksRes] = useState<{ status: number; ok: boolean; data: any; error?: string } | null>(null);
  const [baseURL, setBaseURL] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const tenant = getTenantSlug();
    if (typeof window !== 'undefined') setBaseURL(window.location.origin);

    try {
      const roomsFetch = fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenant
        }
      });
      const linksFetch = fetch(`${API_BASE_URL}/rooms/guest-links`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenant
        }
      });

      const [rRes, lRes] = await Promise.all([roomsFetch, linksFetch]);

      const roomsData = await rRes.json().catch(() => ({}));
      const linksData = await lRes.json().catch(() => ({}));

      setRoomsRes({
        status: rRes.status,
        ok: rRes.ok,
        data: roomsData,
        error: !rRes.ok ? (roomsData?.message || `HTTP ${rRes.status}`) : undefined
      });
      setGuestLinksRes({
        status: lRes.status,
        ok: lRes.ok,
        data: linksData,
        error: !lRes.ok ? (linksData?.message || `HTTP ${lRes.status}`) : undefined
      });
    } catch (e: any) {
      setRoomsRes({ status: 0, ok: false, data: {}, error: e?.message || 'Fetch failed' });
      setGuestLinksRes({ status: 0, ok: false, data: {}, error: e?.message || 'Fetch failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const roomsList = Array.isArray(roomsRes?.data) ? roomsRes.data : (roomsRes?.data?.rooms || []);
  const linksMap: Record<string, string> = guestLinksRes?.ok && guestLinksRes?.data?.links ? guestLinksRes.data.links : {};

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">QR Kod Oluşturma – Debug</h1>
        <p className="text-gray-600 mt-1">
          API yanıtları ve token’lı link mantığı. Neden QR’da token yok kontrol edin.
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Ortam */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h2 className="font-semibold text-gray-900 mb-2">Ortam</h2>
        <ul className="text-sm font-mono space-y-1 text-gray-700">
          <li><strong>API_BASE_URL:</strong> {API_BASE_URL}</li>
          <li><strong>Tenant (x-tenant):</strong> {getTenantSlug()}</li>
          <li><strong>Frontend baseURL (QR link ön eki):</strong> {baseURL || '—'}</li>
          <li><strong>Token var mı:</strong> {token ? 'Evet' : 'Hayır'}</li>
        </ul>
      </div>

      {/* GET /api/rooms */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 bg-gray-100 font-semibold text-gray-900 flex items-center gap-2">
          {roomsRes?.ok ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
          GET /api/rooms
        </h2>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">
            Status: <strong>{roomsRes?.status ?? '—'}</strong>
            {roomsRes?.error && <span className="text-red-600 ml-2">{roomsRes.error}</span>}
          </p>
          <p className="text-sm text-gray-600 mb-2">Oda sayısı: <strong>{roomsList.length}</strong></p>
          {roomsList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">number</th>
                    <th className="text-left p-2">guestName</th>
                    <th className="text-left p-2">id</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsList.slice(0, 15).map((r: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-2 font-mono">{r.number ?? r.id}</td>
                      <td className="p-2">{r.guestName ?? '—'}</td>
                      <td className="p-2 font-mono text-xs">{String(r.id || '').slice(0, 12)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {roomsList.length > 15 && <p className="text-xs text-gray-500 mt-1">+{roomsList.length - 15} oda daha</p>}
            </div>
          )}
        </div>
      </div>

      {/* GET /api/rooms/guest-links */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 bg-gray-100 font-semibold text-gray-900 flex items-center gap-2">
          {guestLinksRes?.ok ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
          GET /api/rooms/guest-links (auth gerekli)
        </h2>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">
            Status: <strong>{guestLinksRes?.status ?? '—'}</strong>
            {guestLinksRes?.error && <span className="text-red-600 ml-2">{guestLinksRes.error}</span>}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            links anahtarı (oda numarası → token): <strong>{Object.keys(linksMap).length}</strong> oda
          </p>
          {Object.keys(linksMap).length > 0 ? (
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(linksMap, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-amber-700">links boş veya yok. Oda Yönetimi’nde giriş yapılmış odada accessToken olmalı.</p>
          )}
        </div>
      </div>

      {/* Özet: Oda → QR URL */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 bg-gray-100 font-semibold text-gray-900">QR URL mantığı (seçilen oda)</h2>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2">Oda</th>
                <th className="text-left p-2">guestName (rooms)</th>
                <th className="text-left p-2">Token var mı (guest-links)</th>
                <th className="text-left p-2">Üretilen QR URL</th>
              </tr>
            </thead>
            <tbody>
              {roomsList.slice(0, 10).map((r: any) => {
                const num = r.number ?? r.id;
                const tokenForRoom = linksMap[String(num)];
                const url = tokenForRoom
                  ? `${baseURL}/guest/${num}?g=${encodeURIComponent(tokenForRoom)}`
                  : `${baseURL}/guest/${num}`;
                return (
                  <tr key={num} className="border-t border-gray-100">
                    <td className="p-2 font-mono">{num}</td>
                    <td className="p-2">{r.guestName ?? '—'}</td>
                    <td className="p-2">{tokenForRoom ? 'Evet' : 'Hayır'}</td>
                    <td className="p-2 font-mono text-xs break-all max-w-xs">{url}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Kontrol listesi</p>
        <ul className="list-disc list-inside space-y-1">
          <li>guest-links 401 ise: oturum (token) geçersiz veya süresi dolmuş.</li>
          <li>guest-links 200 ama links boş: hiçbir odada aktif misafir + accessToken yok (Oda Yönetimi’nde giriş yapılmış olmalı).</li>
          <li>Oda numarası eşleşmesi: backend rooms number string (örn. &quot;101&quot;), guest-links keys da number. Aynı formatta olmalı.</li>
          <li>QR sayfası bu debug ile aynı API_BASE_URL ve tenant kullanıyor; token guestLinks state’ine yazılıp oda seçiminde URL’e ?g= ekleniyor.</li>
        </ul>
      </div>

      <p className="text-sm text-gray-500">
        <a href="/management/qr-code" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-4 h-4" /> QR Kod sayfasına dön
        </a>
      </p>
    </div>
  );
}
