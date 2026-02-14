import { NextRequest, NextResponse } from 'next/server';

const DEEPL_LANG_MAP: Record<string, string> = {
  tr: 'TR', de: 'DE', en: 'EN', ru: 'RU', fr: 'FR', es: 'ES', it: 'IT', ar: 'AR', zh: 'ZH',
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, sourceLang } = await request.json();
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY || process.env.DEEPL_API;
    if (!DEEPL_API_KEY) {
      return NextResponse.json({ error: 'DeepL API anahtarı yapılandırılmamış' }, { status: 500 });
    }
    const deeplUrl = DEEPL_API_KEY.includes('free')
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    if (!text || !targetLang) {
      return NextResponse.json({
        error: 'Text ve targetLang parametreleri gerekli'
      }, { status: 400 });
    }

    const target = String(targetLang).toLowerCase();
    const source = sourceLang ? String(sourceLang).toLowerCase() : 'tr';
    const deeplTarget = DEEPL_LANG_MAP[target] || target.toUpperCase();
    const deeplSource = DEEPL_LANG_MAP[source] || source.toUpperCase();
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('target_lang', deeplTarget);
    params.append('source_lang', deeplSource);

    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let details: any = undefined;
      try { details = JSON.parse(errorText); } catch { }
      console.error('DeepL API Error:', errorText);
      return NextResponse.json({
        error: 'DeepL API hatası',
        details: details || errorText,
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      translatedText: data.translations[0].text,
      detectedLanguage: data.translations[0].detected_source_language,
      success: true,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({
      error: 'Çeviri hatası',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
