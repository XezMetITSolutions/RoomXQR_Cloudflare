"use client";

import React, { useEffect, useState } from 'react';

export default function AdminLoginDebug() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
  const [results, setResults] = useState<Array<{ name: string; ok: boolean; status?: number; data?: any; error?: string; warning?: boolean }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const push = (r: { name: string; ok: boolean; status?: number; data?: any; error?: string; warning?: boolean }) => {
    setResults(prev => [...prev, r]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // 0) ENV bilgileri
    push({
      name: 'ENV & Config',
      ok: true,
      data: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
        UsingAPIBase: API_BASE_URL,
        LocationOrigin: typeof window !== 'undefined' ? window.location.origin : 'n/a'
      }
    });

    // 1) Root endpoint testi
    try {
      const res = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      push({ name: 'GET / (Root)', ok: res.ok, status: res.status, data });
    } catch (e: any) {
      push({ name: 'GET / (Root)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2) Health testi (veritabanı bağlantısı dahil)
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      const dbConnected = data.database === 'Connected';
      push({
        name: 'GET /health (Veritabanı Bağlantısı)',
        ok: res.ok && dbConnected,
        status: res.status,
        data,
        warning: res.ok && !dbConnected
      });
    } catch (e: any) {
      push({ name: 'GET /health (Veritabanı Bağlantısı)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3) Preflight (OPTIONS) testi
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://roomxqr.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'x-tenant,content-type',
        } as any,
      } as RequestInit);
      const allowedHeaders = res.headers.get('access-control-allow-headers');
      const hasXTenant = allowedHeaders?.toLowerCase().includes('x-tenant') || allowedHeaders?.toLowerCase().includes('tenant');
      push({
        name: 'OPTIONS /api/auth/login (CORS Preflight)',
        ok: res.ok && hasXTenant,
        status: res.status,
        data: {
          'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': res.headers.get('access-control-allow-methods'),
          'access-control-allow-headers': allowedHeaders,
          'access-control-allow-credentials': res.headers.get('access-control-allow-credentials'),
          'x-tenant-header-allowed': hasXTenant
        },
        warning: res.ok && !hasXTenant
      });
    } catch (e: any) {
      push({ name: 'OPTIONS /api/auth/login (CORS Preflight)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3.5) Kapsamlı Database Setup (ÖNERİLEN)
    try {
      const res = await fetch(`${API_BASE_URL}/debug/database-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json().catch(() => ({}));
      const setupSuccess = res.ok && data.success;
      push({
        name: 'POST /debug/database-setup (Kapsamlı Setup)',
        ok: setupSuccess,
        status: res.status,
        data: {
          message: data.message,
          summary: data.summary,
          results: data.results?.map((r: any) => ({
            step: r.step,
            status: r.status,
            message: r.message
          }))
        },
        warning: !setupSuccess && res.status === 500
      });
    } catch (e: any) {
      push({ name: 'POST /debug/database-setup (Kapsamlı Setup)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); // Setup biraz zaman alabilir

    // 3.6) Migration testi (basit versiyon - eğer setup başarısız olursa)
    try {
      const res = await fetch(`${API_BASE_URL}/debug/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json().catch(() => ({}));
      const migrationSuccess = res.ok && data.success;
      push({
        name: 'POST /debug/migrate (Migration Çalıştır)',
        ok: migrationSuccess,
        status: res.status,
        data: migrationSuccess ? {
          message: data.message,
          output: data.output ? 'Migration çıktısı alındı ✅' : 'Çıktı yok'
        } : data,
        warning: !migrationSuccess && res.status === 500
      });
    } catch (e: any) {
      push({ name: 'POST /debug/migrate (Migration Çalıştır)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Migration biraz zaman alabilir

    // 4) Login endpoint'e POST (yanlış şifre - tenant kontrolü için)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'system-admin'
        },
        body: JSON.stringify({ email: 'roomxqr-admin@roomxqr.com', password: 'wrong-password' })
      });
      const data = await res.json().catch(() => ({}));
      // 400 = tenant bulunamadı, 401 = şifre yanlış (tenant bulundu), 500 = sunucu hatası
      const isTenantOk = res.status === 401; // Şifre yanlış ama tenant bulundu
      push({
        name: 'POST /api/auth/login (Tenant Kontrolü)',
        ok: isTenantOk,
        status: res.status,
        data,
        warning: res.status === 400 || res.status === 500
      });
    } catch (e: any) {
      push({ name: 'POST /api/auth/login (Tenant Kontrolü)', ok: false, error: e?.message || String(e) });
    }
    await new Promise(resolve => setTimeout(resolve, 300));

    // 5) Login endpoint'e POST (doğru şifre - gerçek login testi)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'system-admin'
        },
        body: JSON.stringify({ email: 'roomxqr-admin@roomxqr.com', password: '01528797Mb##' })
      });
      const data = await res.json().catch(() => ({}));
      const loginSuccess = res.ok && data.token;
      push({
        name: 'POST /api/auth/login (Gerçek Login)',
        ok: loginSuccess,
        status: res.status,
        data: loginSuccess ? {
          token: data.token ? 'Token alındı ✅' : 'Token yok ❌',
          user: data.user ? { email: data.user.email, role: data.user.role } : null
        } : data
      });
    } catch (e: any) {
      push({ name: 'POST /api/auth/login (Gerçek Login)', ok: false, error: e?.message || String(e) });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (r: { ok: boolean; warning?: boolean }) => {
    if (r.warning) return 'border-yellow-200 bg-yellow-50';
    return r.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  const getStatusText = (r: { ok: boolean; warning?: boolean }) => {
    if (r.warning) return 'WARNING';
    return r.ok ? 'OK' : 'ERROR';
  };

  const getStatusTextColor = (r: { ok: boolean; warning?: boolean }) => {
    if (r.warning) return 'text-yellow-700';
    return r.ok ? 'text-green-700' : 'text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔧 Admin Login Debug</h1>
            <p className="text-sm text-gray-600">API, CORS, Veritabanı ve Login kontrolleri</p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Testler Çalışıyor...' : '🔄 Testleri Yeniden Çalıştır'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((r, idx) => (
            <div key={idx} className={`border-2 rounded-lg p-4 ${getStatusColor(r)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-lg">{r.name}</div>
                <div className={`text-sm font-bold ${getStatusTextColor(r)}`}>
                  {getStatusText(r)}
                </div>
              </div>
              {r.status && (
                <div className="text-xs text-gray-600 mb-2 font-mono">HTTP {r.status}</div>
              )}
              {r.error && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-red-800 mb-1">Hata:</div>
                  <pre className="text-xs text-red-800 whitespace-pre-wrap bg-red-100 p-2 rounded">{r.error}</pre>
                </div>
              )}
              {r.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-700 hover:text-gray-900">
                    Detayları Göster
                  </summary>
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto bg-white p-3 rounded mt-2 border">
                    {JSON.stringify(r.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">ℹ️ Bilgilendirme</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>API_BASE_URL:</strong> <code className="bg-white px-2 py-1 rounded">{API_BASE_URL}</code></div>
            <div><strong>Bu sayfa:</strong> <code className="bg-white px-2 py-1 rounded">/admin-login/debug</code></div>
            <div className="mt-3">
              <strong>Test Senaryoları:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Veritabanı Bağlantısı:</strong> Health endpoint veritabanı durumunu gösterir</li>
                <li><strong>CORS Preflight:</strong> x-tenant header'ının izin verildiğini kontrol eder</li>
                <li><strong>Kapsamlı Database Setup:</strong> Tüm sorunları otomatik çözer (başarısız migration'ları resolve eder, migration'ları çalıştırır, system-admin tenant ve kullanıcı oluşturur)</li>
                <li><strong>Migration Çalıştır:</strong> Sadece migration'ları çalıştırır (basit versiyon)</li>
                <li><strong>Tenant Kontrolü:</strong> system-admin tenant'ının var olup olmadığını test eder</li>
                <li><strong>Gerçek Login:</strong> Doğru credentials ile login testi yapar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
