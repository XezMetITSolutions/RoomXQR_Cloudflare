// Simple translation service with:
// 1) Local dictionary (instant)
// 2) LocalStorage + in-memory cache
// 3) Optional online fallback to LibreTranslate (no API key, best-effort)

type TranslationsByLang = Record<string, string>;
type Dictionary = Record<string, TranslationsByLang>;

// Minimal dictionary (extend as needed)
const localDictionary: Dictionary = {
  'Havuz Bakımı': { en: 'Pool Maintenance', ru: 'Обслуживание бассейна', ar: 'صيانة المسبح', de: 'Pool-Wartung' },
  'Yeni Menü Öğeleri': { en: 'New Menu Items', ru: 'Новые пункты меню', ar: 'عناصر القائمة الجديدة', de: 'Neue Menüpunkte' },
  'Özel İndirim': { en: 'Special Discount', ru: 'Специальная скидка', ar: 'خصم خاص', de: 'Sonderrabatt' },

  // Otel bilgileri sayfası çevirileri
  'WiFi & İnternet': { en: 'WiFi & Internet', ru: 'WiFi и Интернет', ar: 'واي فاي والإنترنت', de: 'WiFi & Internet' },
  'WiFi Bilgileri': { en: 'WiFi Information', ru: 'Информация о WiFi', ar: 'معلومات الواي فاي', de: 'WiFi-Informationen' },
  'Ağ Adı:': { en: 'Network Name:', ru: 'Имя сети:', ar: 'اسم الشبكة:', de: 'Netzwerkname:' },
  'Şifre:': { en: 'Password:', ru: 'Пароль:', ar: 'كلمة المرور:', de: 'Passwort:' },
  'Hız:': { en: 'Speed:', ru: 'Скорость:', ar: 'السرعة:', de: 'Geschwindigkeit:' },
  'İnternet Kullanımı': { en: 'Internet Usage', ru: 'Использование интернета', ar: 'استخدام الإنترنت', de: 'Internetnutzung' },
  'Sınırsız internet erişimi': { en: 'Unlimited internet access', ru: 'Неограниченный доступ в интернет', ar: 'وصول غير محدود للإنترنت', de: 'Unbegrenzter Internetzugang' },
  'Tüm odalar WiFi kapsamında': { en: 'All rooms covered by WiFi', ru: 'Все номера покрыты WiFi', ar: 'جميع الغرف مغطاة بالواي فاي', de: 'Alle Zimmer mit WiFi abgedeckt' },
  'Lobi ve ortak alanlarda ücretsiz WiFi': { en: 'Free WiFi in lobby and common areas', ru: 'Бесплатный WiFi в лобби и общих зонах', ar: 'واي فاي مجاني في الردهة والمناطق المشتركة', de: 'Kostenloses WiFi in Lobby und Gemeinschaftsbereichen' },
  'Teknik destek:': { en: 'Technical support:', ru: 'Техническая поддержка:', ar: 'الدعم الفني:', de: 'Technischer Support:' },

  'Çalışma Saatleri': { en: 'Working Hours', ru: 'Рабочие часы', ar: 'ساعات العمل', de: 'Arbeitszeiten' },
  'Otel Hizmetleri': { en: 'Hotel Services', ru: 'Услуги отеля', ar: 'خدمات الفندق', de: 'Hotel-Services' },
  'Resepsiyon': { en: 'Reception', ru: 'Ресепшн', ar: 'الاستقبال', de: 'Rezeption' },
  'Restoran': { en: 'Restaurant', ru: 'Ресторан', ar: 'المطعم', de: 'Restaurant' },
  'Bar': { en: 'Bar', ru: 'Бар', ar: 'البار', de: 'Bar' },
  'Spa & Wellness': { en: 'Spa & Wellness', ru: 'Спа и велнес', ar: 'السبا والعافية', de: 'Spa & Wellness' },

  'Otel Olanakları': { en: 'Hotel Amenities', ru: 'Удобства отеля', ar: 'مرافق الفندق', de: 'Hotel-Ausstattung' },
  'Temel Olanaklar': { en: 'Basic Amenities', ru: 'Основные удобства', ar: 'المرافق الأساسية', de: 'Grundausstattung' },
  'Ücretsiz WiFi': { en: 'Free WiFi', ru: 'Бесплатный WiFi', ar: 'واي فاي مجاني', de: 'Kostenloses WiFi' },
  'Otopark': { en: 'Parking', ru: 'Парковка', ar: 'موقف السيارات', de: 'Parkplatz' },
  'Fitness Center': { en: 'Fitness Center', ru: 'Фитнес-центр', ar: 'مركز اللياقة البدنية', de: 'Fitness-Center' },
  'Yüzme Havuzu': { en: 'Swimming Pool', ru: 'Бассейн', ar: 'المسبح', de: 'Schwimmbad' },
  'Çocuk Oyun Alanı': { en: 'Children\'s Playground', ru: 'Детская площадка', ar: 'ملعب الأطفال', de: 'Kinderspielplatz' },

  'Yemek & İçecek': { en: 'Food & Beverage', ru: 'Еда и напитки', ar: 'الطعام والشراب', de: 'Essen & Getränke' },
  'Restoran Hizmetleri': { en: 'Restaurant Services', ru: 'Ресторанные услуги', ar: 'خدمات المطعم', de: 'Restaurant-Services' },
  'Kahvaltı Buffet': { en: 'Breakfast Buffet', ru: 'Завтрак-буфет', ar: 'بوفيه الإفطار', de: 'Frühstücksbuffet' },
  'Öğle Yemeği': { en: 'Lunch', ru: 'Обед', ar: 'الغداء', de: 'Mittagessen' },
  'Akşam Yemeği': { en: 'Dinner', ru: 'Ужин', ar: 'العشاء', de: 'Abendessen' },
  'Room Service': { en: 'Room Service', ru: 'Обслуживание в номере', ar: 'خدمة الغرف', de: 'Zimmerservice' },
  'Havlu değişimi': { en: 'Towel change', ru: 'Смена полотенец', ar: 'تغيير المناشف', de: 'Handtuchwechsel' },
  'Teknik destek': { en: 'Technical support', ru: 'Техническая поддержка', ar: 'الدعم الفني', de: 'Technischer Support' },

  'Geri Dön': { en: 'Go Back', ru: 'Назад', ar: 'العودة', de: 'Zurück' },
  'Otel Bilgileri': { en: 'Hotel Information', ru: 'Информация об отеле', ar: 'معلومات الفندق', de: 'Hotel-Informationen' },
  'Bilgileri gizle': { en: 'Hide details', ru: 'Скрыть детали', ar: 'إخفاء التفاصيل', de: 'Details ausblenden' },
  'Detayları görüntüle': { en: 'View details', ru: 'Показать детали', ar: 'عرض التفاصيل', de: 'Details anzeigen' },

  'Hızlı İletişim': { en: 'Quick Contact', ru: 'Быстрая связь', ar: 'اتصال سريع', de: 'Schneller Kontakt' },
  'Acil durumlar için direkt arayabilirsiniz': { en: 'You can call directly for emergencies', ru: 'Вы можете звонить напрямую в экстренных случаях', ar: 'يمكنك الاتصال مباشرة في حالات الطوارئ', de: 'Sie können direkt für Notfälle anrufen' },
  'Güvenlik': { en: 'Security', ru: 'Безопасность', ar: 'الأمن', de: 'Sicherheit' },
  'Concierge': { en: 'Concierge', ru: 'Консьерж', ar: 'الكونسيرج', de: 'Concierge' },

  // Menü çevirileri
  'dakika': { en: 'minutes', ru: 'минут', ar: 'دقائق', de: 'Minuten' },
  '(İşletme)': { en: '(Business)', ru: '(Бизнес)', ar: '(المؤسسة)', de: '(Geschäft)' },
  'Alerjenler:': { en: 'Allergens:', ru: 'Аллергены:', ar: 'مسببات الحساسية:', de: 'Allergene:' },
  'Sepete Ekle': { en: 'Add to Cart', ru: 'В корзину', ar: 'أضف للسلة', de: 'In den Warenkorb' },
  'Detay': { en: 'Details', ru: 'Подробности', ar: 'التفاصيل', de: 'Details' },
  'Daha az göster': { en: 'Show Less', ru: 'Показать меньше', ar: 'عرض أقل', de: 'Weniger anzeigen' },

  // Demo menü çevirileri
  'Cheeseburger': { tr: 'Çizburger', ru: 'Чизбургер', ar: 'تشيزبرجر', de: 'Cheeseburger' },
  'Margherita Pizza': { tr: 'Margherita Pizza', ru: 'Пицца Маргарита', ar: 'بيتزا مارجريتا', de: 'Margherita Pizza' },
  'Caesar Salad': { tr: 'Sezar Salatası', ru: 'Салат Цезарь', ar: 'سلطة سيزر', de: 'Caesar-Salat' },
  'Chocolate Cake': { tr: 'Çikolatalı Pasta', ru: 'Шоколадный торт', ar: 'كعكة الشوكولاتة', de: 'Schokoladenkuchen' },
  'Turkish Coffee': { tr: 'Türk Kahvesi', ru: 'Турецкий кофе', ar: 'القهوة التركية', de: 'Türkischer Kaffee' },
  'Orange Juice': { tr: 'Portakal Suyu', ru: 'Апельсиновый сок', ar: 'عصير البرتقال', de: 'Orangensaft' },

  // Demo menü açıklamaları
  'Sulu dana köftesi, cheddar peyniri, taze marul, domates ve özel sos ile': {
    en: 'Juicy beef patty, cheddar cheese, fresh lettuce, tomatoes and special sauce',
    ru: 'Сочная говяжья котлета, сыр чеддер, свежий салат, помидоры и специальный соус',
    ar: 'لحم بقري عصاري، جبن شيدر، خس طازج، طماطم وصلصة خاصة',
    de: 'Saftiges Rinderfleisch, Cheddar-Käse, frischer Salat, Tomaten und spezielle Soße'
  },
  'Mozzarella, domates sosu ve taze fesleğen ile': {
    en: 'With mozzarella, tomato sauce and fresh basil',
    ru: 'С моцареллой, томатным соусом и свежим базиликом',
    ar: 'مع الموزاريلا وصلصة الطماطم والريحان الطازج',
    de: 'Mit Mozzarella, Tomatensauce und frischem Basilikum'
  },
  'Patates kızartması ve turşu ile servis edilir.': {
    en: 'Served with french fries and pickles.',
    ru: 'Подается с картофелем фри и соленьями.',
    ar: 'يقدم مع البطاطس المقلية والمخللات.',
    de: 'Wird mit Pommes frites und Gurken serviert.'
  },

  // Ek menü çevirileri


  // Popup ve modal çevirileri
  'Siparişinizi Onaylayın': {
    en: 'Confirm Your Order',
    ru: 'Подтвердите ваш заказ',
    ar: 'تأكيد طلبك',
    de: 'Bestellung bestätigen'
  },
  'Önemli Uyarı': {
    en: 'Important Warning',
    ru: 'Важное предупреждение',
    ar: 'تحذير مهم',
    de: 'Wichtige Warnung'
  },
  'Siparişinizden emin misiniz? Ödeme yaptıktan sonra değişiklik yapamazsınız.': {
    en: 'Are you sure about your order? You cannot make changes after payment.',
    ru: 'Вы уверены в своем заказе? Вы не можете внести изменения после оплаты.',
    ar: 'هل أنت متأكد من طلبك؟ لا يمكنك إجراء تغييرات بعد الدفع.',
    de: 'Sind Sie sich bei Ihrer Bestellung sicher? Sie können nach der Zahlung keine Änderungen vornehmen.'
  },
  'Ödeme': {
    en: 'Payment',
    ru: 'Оплата',
    ar: 'الدفع',
    de: 'Zahlung'
  },
  'Sipariş Özeti': {
    en: 'Order Summary',
    ru: 'Сводка заказа',
    ar: 'ملخص الطلب',
    de: 'Bestellübersicht'
  },
  'Sipariş Tamamlandı': {
    en: 'Order Completed',
    ru: 'Заказ завершен',
    ar: 'تم الطلب',
    de: 'Bestellung abgeschlossen'
  },
  'Siparişiniz başarıyla mutfağa iletildi.': {
    en: 'Your order has been successfully sent to the kitchen.',
    ru: 'Ваш заказ успешно отправлен на кухню.',
    ar: 'تم إرسال طلبك إلى المطبخ بنجاح.',
    de: 'Ihre Bestellung wurde erfolgreich an die Küche gesendet.'
  },
  'Hazırlanma süresi yaklaşık': {
    en: 'Preparation time is approximately',
    ru: 'Время приготовления примерно',
    ar: 'وقت التحضير حوالي',
    de: 'Zubereitungszeit beträgt etwa'
  },
  'dakikadır.': {
    en: 'minutes.',
    ru: 'минут.',
    ar: 'دقيقة.',
    de: 'Minuten.'
  },
  '(En uzun süreye göre)': {
    en: '(Based on the longest time)',
    ru: '(По самому длинному времени)',
    ar: '(بناءً على أطول وقت)',
    de: '(Basierend auf der längsten Zeit)'
  },
  'Resepsiyon Yanıtı': {
    en: 'Reception Response',
    ru: 'Ответ ресепшена',
    ar: 'رد الاستقبال',
    de: 'Rezeptionsantwort'
  },
};

// Normalize key to improve hit rate
function normalizeKey(text: string): string {
  return (text || '').trim();
}

const memoryCache = new Map<string, string>();

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}::${normalizeKey(text)}`;
}

function getFromCache(text: string, targetLang: string): string | null {
  const key = getCacheKey(text, targetLang);
  if (memoryCache.has(key)) return memoryCache.get(key) || null;
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage : null;
    if (!ls) return null;
    const val = ls.getItem(`translate:${key}`);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function saveToCache(text: string, targetLang: string, translated: string) {
  const key = getCacheKey(text, targetLang);
  memoryCache.set(key, translated);
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage : null;
    if (ls) ls.setItem(`translate:${key}`, JSON.stringify(translated));
  } catch {
    // ignore
  }
}

async function onlineTranslate(text: string, targetLang: string): Promise<string | null> {
  // Next.js API route'unu kullan (DeepL API key zaten orada tanımlı)
  try {
    // Timeout ile fetch (5 saniye)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        targetLang: targetLang,
        // sourceLang: 'tr' // Auto-detect source language
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      // Sadece development modunda log
      if (process.env.NODE_ENV === 'development') {
        console.warn('DeepL translation failed:', res.status, errorData);
      }
      return null;
    }

    const data = await res.json();

    // Response formatını kontrol et
    let translated: string | null = null;

    if (data?.translatedText) {
      // String olup olmadığını kontrol et
      if (typeof data.translatedText === 'string') {
        translated = data.translatedText.trim();
      } else {
        console.warn('translatedText bir string değil:', typeof data.translatedText, data.translatedText);
        return null;
      }
    } else if (data?.translations && Array.isArray(data.translations) && data.translations.length > 0) {
      // Alternatif format: translations array
      const firstTranslation = data.translations[0];
      if (typeof firstTranslation === 'string') {
        translated = firstTranslation.trim();
      } else if (firstTranslation?.text && typeof firstTranslation.text === 'string') {
        translated = firstTranslation.text.trim();
      }
    } else {
      console.warn('API response formatı beklenmeyen:', data);
      return null;
    }

    if (!translated || translated === text) {
      // Çeviri sonucu orijinal metinle aynıysa, bu normal olabilir (özellikle özel isimler, markalar için)
      // Sessizce null döndür, uyarı gösterme
      return null;
    }

    return translated;
  } catch (error: any) {
    // Network hatası veya timeout durumunda sessizce null döndür
    if (error?.name === 'AbortError') {
      // Timeout - sessizce devam et
      return null;
    }
    // Sadece development modunda log
    if (process.env.NODE_ENV === 'development') {
      console.warn('Translation error:', error);
    }
    return null;
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text?.trim()) return text;
  if (!targetLang || targetLang === 'tr') return text;

  const normalized = normalizeKey(text);

  // 1) Local dictionary
  const dictHit = localDictionary[normalized]?.[targetLang];
  if (dictHit) {
    saveToCache(text, targetLang, dictHit);
    return dictHit;
  }

  // 2) Cache
  const cached = getFromCache(text, targetLang);
  if (cached) {
    // Cache'den gelen çeviri orijinal metinle aynıysa, bu geçersiz bir cache olabilir
    if (cached !== text) {
      return cached;
    }
  }

  // 3) Online fallback (DeepL API)
  const online = await onlineTranslate(text, targetLang);
  if (online && online !== text) {
    saveToCache(text, targetLang, online);
    return online;
  }

  // Eğer çeviri başarısız olduysa, orijinal metni döndür
  // Sadece development modunda log
  if (process.env.NODE_ENV === 'development') {
    console.warn('Çeviri başarısız oldu, orijinal metin döndürülüyor:', {
      text: typeof text === 'string' ? text : String(text),
      targetLang,
      online: typeof online === 'string' ? online : String(online)
    });
  }
  return text;
}

// Cache temizleme fonksiyonu
export function clearTranslationCache(): void {
  memoryCache.clear();
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage : null;
    if (ls) {
      // Tüm çeviri cache'lerini temizle
      const keys = Object.keys(ls);
      keys.forEach(key => {
        if (key.startsWith('translate:')) {
          ls.removeItem(key);
        }
      });
    }
  } catch {
    // ignore
  }
}



