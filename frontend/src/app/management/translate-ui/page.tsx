'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { Globe, Loader2, CheckCircle, XCircle, Play, Download } from 'lucide-react';
import Link from 'next/link';

function downloadJson(filename: string, obj: Record<string, string>) {
  const blob = new Blob([JSON.stringify(obj, null, 0)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TranslateUiPage() {
  const { token } = useAuth();
  const setLoadedTranslations = useLanguageStore((s) => s.setLoadedTranslations);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; log?: string } | null>(null);
  const [files, setFiles] = useState<{
    tr: Record<string, string>;
    de: Record<string, string>;
    en: Record<string, string>;
    ru: Record<string, string>;
  } | null>(null);

  const runScript = async () => {
    setRunning(true);
    setMessage(null);
    setFiles(null);
    try {
      const tenant =
        typeof window !== 'undefined'
          ? (window.location.hostname.split('.')[0] || 'demo').replace(/^(www|roomxqr|roomxqr-backend)$/i, 'demo') || 'demo'
          : 'demo';
      const headers: Record<string, string> = { 'x-tenant': tenant };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/translate-ui/run', {
        method: 'POST',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Çeviriler hazır.',
        });
        if (data.files) {
          setFiles(data.files);
          ['tr', 'de', 'en', 'ru'].forEach((lang) => {
            setLoadedTranslations(lang, data.files[lang]);
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'İşlem başarısız.',
          log: data.log,
        });
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'İstek gönderilemedi.';
      setMessage({ type: 'error', text: err });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-7 h-7 text-indigo-600" />
          Arayüz Çevirileri (4 Dil)
        </h1>
        <p className="text-gray-600 mt-1">
          Tüm site metinlerini (admin paneli, müşteri QR, menü vb.) Türkçe kaynaktan DeepL ile Almanca, İngilizce ve Rusçaya çevirir. Çeviriler oturumda hemen yüklenir; kalıcı kullanım için dosyaları indirip <code className="bg-gray-100 px-1 rounded">public/locales/</code> altına koyabilirsiniz.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p>{message.text}</p>
              {message.log && (
                <pre className="mt-2 text-xs overflow-auto max-h-32 bg-black/5 p-2 rounded whitespace-pre-wrap">
                  {message.log}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {files && (
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <p className="text-sm font-medium text-green-800 mb-2">Çeviriler bu oturumda yüklendi. Dosya indir (kalıcı kullanım için):</p>
          <div className="flex flex-wrap gap-2">
            {(['tr', 'de', 'en', 'ru'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => downloadJson(`${lang}.json`, files[lang])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-green-300 text-green-800 text-sm font-medium hover:bg-green-100"
              >
                <Download className="w-4 h-4" />
                {lang}.json
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6">
        <p className="text-gray-700 mb-4">
          Sunucuda <strong>DEEPL_API_KEY</strong> veya <strong>DEEPL_API</strong> ortam değişkeni tanımlı olmalı. İşlem birkaç dakika sürebilir (yüzlerce metin DeepL ile çevrilir).
        </p>
        <button
          type="button"
          onClick={runScript}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Çeviriler oluşturuluyor...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Çevirileri oluştur
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        <Link href="/management" className="text-indigo-600 hover:underline">
          ← Yönetim paneline dön
        </Link>
      </p>
    </div>
  );
}
