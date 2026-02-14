import { NextResponse } from 'next/server';
import trSource from '@/data/tr-source.json';

export const maxDuration = 120;

const LANG_MAP: Record<string, string> = { de: 'DE', en: 'EN', ru: 'RU' };
const BATCH_SIZE = 50;

async function translateBatch(
  texts: string[],
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const body = new URLSearchParams();
  body.append('source_lang', 'TR');
  body.append('target_lang', LANG_MAP[targetLang] || targetLang.toUpperCase());
  texts.forEach((t) => body.append('text', t));
  const url = apiKey.includes('free')
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

export async function POST() {
  try {
    const apiKey = process.env.DEEPL_API_KEY || process.env.DEEPL_API;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Sunucuda DEEPL_API_KEY veya DEEPL_API tanımlı değil.' },
        { status: 500 }
      );
    }

    const tr = trSource as Record<string, string>;
    const keys = Object.keys(tr);
    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, message: 'tr-source.json boş veya bulunamadı.' },
        { status: 500 }
      );
    }

    const result: { tr: Record<string, string>; de: Record<string, string>; en: Record<string, string>; ru: Record<string, string> } = {
      tr: { ...tr },
      de: {},
      en: {},
      ru: {},
    };

    for (const lang of ['de', 'en', 'ru'] as const) {
      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const chunk = keys.slice(i, i + BATCH_SIZE);
        const texts = chunk.map((k) => tr[k]);
        const translated = await translateBatch(texts, lang, apiKey);
        chunk.forEach((k, j) => {
          result[lang][k] = translated[j] || tr[k];
        });
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Çeviriler hazır. Aşağıdaki dosyaları indirip public/locales/ altına koyun veya indir butonlarını kullanın.',
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
