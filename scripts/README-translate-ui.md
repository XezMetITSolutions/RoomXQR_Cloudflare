# Arayüz metinlerini 4 dilde (TR, DE, EN, RU) DeepL ile çevirme

Bu script, `frontend/src/store/languageStore.ts` içindeki **Türkçe (tr)** arayüz metinlerini DeepL API ile **Almanca, İngilizce ve Rusça**ya çevirir ve `frontend/public/locales/` altında JSON dosyaları üretir. Uygulama açıldığında bu dosyaları yükleyerek admin paneli, müşteri QR arayüzü ve tüm sitede 4 dilde metin gösterir.

## Gereksinim

- Node.js 18+ (fetch kullanılır)
- DeepL API anahtarı: [DeepL](https://www.deepl.com/pro-api) (ücretsiz kotada da çalışır)

## Kullanım

Proje kökünden (RoomXQr klasöründen):

```bash
# Windows (PowerShell)
$env:DEEPL_API_KEY="your-key-here"; node scripts/translate-ui-with-deepl.js

# veya .env kullanıyorsanız (backend .env'de DEEPL_API_KEY varsa)
# Windows: set DEEPL_API_KEY=your-key && node scripts/translate-ui-with-deepl.js
```

Ücretsiz API kullanıyorsanız anahtar `:fx` ile biter; script buna göre `api-free.deepl.com` kullanır.

## Çıktı

- `frontend/public/locales/tr.json` – Türkçe metinler (kaynak)
- `frontend/public/locales/de.json` – Almanca çeviriler
- `frontend/public/locales/en.json` – İngilizce çeviriler  
- `frontend/public/locales/ru.json` – Rusça çeviriler

Bu dosyalar mevcutsa uygulama ilk yüklemede bunları alır ve `languageStore` ile birleştirir; böylece tüm arayüz (admin, müşteri QR, menü, ayarlar vb.) bu 4 dilde görünür.

## Ne zaman çalıştırılır?

- İlk kurulumda bir kez çalıştırın.
- `languageStore.ts` içindeki Türkçe metinlere yeni anahtar eklediğinizde veya metinleri değiştirdiğinizde tekrar çalıştırın.

## Not

- `frontend/src/lib/translateService.ts` içindeki **localDictionary** (ör. "Sepete Ekle", "Geri Dön" gibi ifadeler) şu an script dışında; birçok giriş zaten DE/EN/RU içeriyor. İleride bu liste de scripte eklenebilir.
