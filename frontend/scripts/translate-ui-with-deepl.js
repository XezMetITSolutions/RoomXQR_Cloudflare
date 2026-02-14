#!/usr/bin/env node
/**
 * Arayüz metinlerini (languageStore tr) DeepL ile DE, EN, RU'ya çevirir.
 * Çıktı: public/locales/{tr,de,en,ru}.json
 * Bu dosya frontend içinde; deploy'da da mevcut olur.
 */

const fs = require('fs');
const path = require('path');

const DEEPL_KEY = process.env.DEEPL_API_KEY || process.env.DEEPL_API;
const LANG_MAP = { tr: 'TR', de: 'DE', en: 'EN', ru: 'RU' };
const BATCH_SIZE = 50;
const ROOT = path.resolve(__dirname, '..');
const STORE_PATH = path.join(ROOT, 'src', 'store', 'languageStore.ts');
const LOCALES_DIR = path.join(ROOT, 'public', 'locales');

if (!DEEPL_KEY) {
  console.error('Hata: DEEPL_API_KEY veya DEEPL_API ortam değişkeni gerekli.');
  process.exit(1);
}

const deeplUrl = DEEPL_KEY.includes('free')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

async function translateBatch(texts, targetLang) {
  const body = new URLSearchParams();
  body.append('source_lang', 'TR');
  body.append('target_lang', LANG_MAP[targetLang] || targetLang.toUpperCase());
  texts.forEach((t) => body.append('text', t));
  const res = await fetch(deeplUrl, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL ${res.status}: ${err}`);
  }
  const data = await res.json();
  return (data.translations || []).map((t) => (t && t.text) || '');
}

async function translateAll(trObj, targetLang) {
  const keys = Object.keys(trObj);
  const out = {};
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const chunk = keys.slice(i, i + BATCH_SIZE);
    const texts = chunk.map((k) => trObj[k]);
    const translated = await translateBatch(texts, targetLang);
    chunk.forEach((k, j) => { out[k] = translated[j] || trObj[k]; });
    process.stdout.write(`  ${targetLang}: ${Math.min(i + BATCH_SIZE, keys.length)}/${keys.length}\r`);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`  ${targetLang}: ${keys.length}/${keys.length} ok`);
  return out;
}

function extractTrFromStore() {
  let content = fs.readFileSync(STORE_PATH, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  const start = content.indexOf('  tr: {');
  let end = content.indexOf('  },\n\n  en: {', start);
  if (end === -1) end = content.indexOf('  en: {', start);
  if (start === -1 || end === -1) {
    throw new Error('languageStore.ts içinde tr bloğu bulunamadı.');
  }
  const block = content.slice(start + 7, end);
  const tr = {};
  const lineRe = /^\s*'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$/;
  block.split('\n').forEach((line) => {
    const m = line.match(lineRe);
    if (m) {
      const key = m[1].replace(/\\'/g, "'");
      const value = m[2].replace(/\\'/g, "'").replace(/\\n/g, '\n');
      tr[key] = value;
    }
  });
  return tr;
}

async function main() {
  console.log('1. languageStore tr bloğu çıkarılıyor...');
  const trFromStore = extractTrFromStore();
  console.log(`   ${Object.keys(trFromStore).length} anahtar bulundu.`);

  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(LOCALES_DIR, 'tr.json'),
    JSON.stringify(trFromStore, null, 0),
    'utf8'
  );
  console.log('   public/locales/tr.json yazıldı.');

  console.log('2. DeepL ile DE, EN, RU çevirileri yapılıyor...');
  for (const lang of ['de', 'en', 'ru']) {
    const translated = await translateAll(trFromStore, lang);
    fs.writeFileSync(
      path.join(LOCALES_DIR, `${lang}.json`),
      JSON.stringify(translated, null, 0),
      'utf8'
    );
  }

  console.log('3. Bitti. Dosyalar: public/locales/tr.json, de.json, en.json, ru.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
