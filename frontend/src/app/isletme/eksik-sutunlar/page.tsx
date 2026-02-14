'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw, Wrench } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
const API_BASE_URL = /\/api\/?$/.test(API_BASE) ? API_BASE.replace(/\/$/, '') : `${API_BASE.replace(/\/$/, '')}/api`;

function getTenantSlug() {
  if (typeof window === 'undefined') return 'demo';
  const hostname = window.location.hostname;
  const sub = hostname.split('.')[0];
  return sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend' ? sub : 'demo';
}

interface ColumnStatus {
  orders: { paymentMethod: boolean };
  menu_items: { translations: boolean };
}

export default function EksikSutunlarPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState<ColumnStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/setup/columns-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-tenant': getTenantSlug(),
        },
      });
      if (!res.ok) throw new Error(await res.json().then((b) => b.message).catch(() => 'Hata'));
      const data = await res.json();
      setStatus(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Durum alınamadı' });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const ensureColumns = async () => {
    if (!token) return;
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/setup/ensure-columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-tenant': getTenantSlug(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'İşlem başarısız');
      setMessage({ type: 'success', text: 'Eksik sütunlar oluşturuldu.' });
      await fetchStatus();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Sütunlar oluşturulamadı' });
    } finally {
      setRunning(false);
    }
  };

  const rows = status
    ? [
        { table: 'orders', column: 'paymentMethod', label: 'Ödeme yöntemi (sipariş)', ok: status.orders?.paymentMethod },
        { table: 'menu_items', column: 'translations', label: 'Çeviriler (menü)', ok: status.menu_items?.translations },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-7 h-7 text-indigo-600" />
          Eksik Sütunları Oluştur
        </h1>
        <p className="text-gray-600 mt-1">
          Veritabanında uygulamanın ihtiyaç duyduğu sütunların varlığını kontrol edin ve eksik olanları tek tıkla ekleyin.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium text-gray-900">Sütun durumu</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              type="button"
              onClick={ensureColumns}
              disabled={loading || running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
              Eksik sütunları oluştur
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
            <span>Kontrol ediliyor...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Tablo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Sütun</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Açıklama</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Durum</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-sm text-gray-700 font-mono">{r.table}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 font-mono">{r.column}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{r.label}</td>
                    <td className="py-3 px-4">
                      {r.ok ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Mevcut
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Eksik
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Ne işe yarar?</p>
        <p className="text-amber-700">
          Özellikle production ortamında migration çalıştırılmamışsa <strong>orders.paymentMethod</strong> veya <strong>menu_items.translations</strong> sütunları eksik olabilir; bu da sipariş listesinde 500 hatası veya menü çevirilerinde sorunlara yol açar. Bu sayfadan &quot;Eksik sütunları oluştur&quot; ile güvenle ekleyebilirsiniz (zaten varsa tekrar eklenmez).
        </p>
      </div>
    </div>
  );
}
