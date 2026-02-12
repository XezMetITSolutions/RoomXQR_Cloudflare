import { NextRequest, NextResponse } from 'next/server';

const DEEPL_API_KEY = 'bf2e3c01-d17a-43dc-a2f9-31cfa6d7ef2a:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, sourceLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({
        error: 'Text ve targetLang parametreleri gerekli'
      }, { status: 400 });
    }

    // DeepL dil kodlarını büyük harfe zorla (en -> EN, fr -> FR)
    const target = String(targetLang).toUpperCase();

    // DeepL API'sine gönderilecek parametreleri hazırla
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('target_lang', target);

    // Eğer sourceLang 'AUTO' değilse ve varsa ekle, aksi takdirde DeepL otomatik algılar
    if (sourceLang && sourceLang.toUpperCase() !== 'AUTO' && sourceLang !== '') {
      params.append('source_lang', sourceLang.toUpperCase());
    }

    const response = await fetch(DEEPL_API_URL, {
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
