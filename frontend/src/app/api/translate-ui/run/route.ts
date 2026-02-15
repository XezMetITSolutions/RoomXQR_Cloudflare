import { NextRequest, NextResponse } from 'next/server';
import trSource from '@/data/tr-source.json';

export const maxDuration = 120;

const BATCH_SIZE = 50;

async function translateBatchViaDeepL(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const LANG_MAP: Record<string, string> = { de: 'DE', en: 'EN', ru: 'RU' };
  const body = new URLSearchParams();
  body.append('source_lang', 'TR');
  body.append('target_lang', LANG_MAP[targetLang] || targetLang.toUpperCase());
  texts.forEach((t) => body.append('text', t));
  const isFreeKey = apiKey.endsWith(':fx');
  const url = isFreeKey
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL ${res.status}: ${err}`);
  }
  const data = (await res.json()) as { translations?: Array<{ text?: string }> };
  return (data.translations || []).map((t) => t?.text || '');
}

async function translateBatchViaBackend(
  texts: string[],
  targetLang: string,
  backendUrl: string,
  authHeader: string | null,
  tenant: string
): Promise<string[]> {
  const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
      'x-tenant': tenant,
    },
    body: JSON.stringify({
      text: texts,
      targetLang,
      sourceLang: 'tr',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Backend ${res.status}`);
  }
  const data = (await res.json()) as { translations?: string[] };
  return data.translations || [];
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const tenant = request.headers.get('x-tenant') || 'demo';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const tr = trSource as Record<string, string>;
    const keys = Object.keys(tr);
    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, message: 'tr-source.json boş veya bulunamadı.' },
        { status: 500 }
      );
    }

    const useBackend = backendUrl && !process.env.DEEPL_API_KEY && !process.env.DEEPL_API;

    const result: {
      tr: Record<string, string>;
      de: Record<string, string>;
      en: Record<string, string>;
      ru: Record<string, string>;
    } = {
      tr: { ...tr },
      de: {},
      en: {},
      ru: {},
    };

    if (useBackend) {
      for (const lang of ['de', 'en', 'ru'] as const) {
        for (let i = 0; i < keys.length; i += BATCH_SIZE) {
          const chunk = keys.slice(i, i + BATCH_SIZE);
          const texts = chunk.map((k) => tr[k]);
          const translated = await translateBatchViaBackend(
            texts,
            lang,
            backendUrl,
            authHeader,
            tenant
          );
          chunk.forEach((k, j) => {
            result[lang][k] = translated[j] ?? tr[k];
          });
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } else {
      const apiKey = process.env.DEEPL_API_KEY || process.env.DEEPL_API;
      if (!apiKey) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Sunucuda DEEPL_API_KEY tanımlı değil ve backend (NEXT_PUBLIC_API_URL) ile bağlantı kurulamadı. Backend\'de DEEPL_API_KEY tanımlı olmalı veya frontend deploy\'a DEEPL_API_KEY ekleyin.',
          },
          { status: 500 }
        );
      }
      for (const lang of ['de', 'en', 'ru'] as const) {
        for (let i = 0; i < keys.length; i += BATCH_SIZE) {
          const chunk = keys.slice(i, i + BATCH_SIZE);
          const texts = chunk.map((k) => tr[k]);
          const translated = await translateBatchViaDeepL(texts, lang, apiKey);
          chunk.forEach((k, j) => {
            result[lang][k] = translated[j] || tr[k];
          });
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Çeviriler hazır. Oturumda yüklendi; kalıcı kullanım için dosyaları indirebilirsiniz.',
      files: {
        tr: result.tr,
        de: result.de,
        en: result.en,
        ru: result.ru,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
