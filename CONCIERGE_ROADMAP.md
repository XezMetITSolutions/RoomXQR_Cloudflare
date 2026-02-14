# Concierge Servisi Entegrasyonu – Yol Haritası

**Amaç:** Misafir arayüzündeki **Teknik Arıza / Bakım** butonunu **Concierge** servisi ile değiştirmek ve tüm akışı buna göre güncellemek.

---

## 1. Mevcut Durum Özeti

| Katman | Teknik/Bakım | Concierge |
|--------|----------------|-----------|
| **Backend** | `RequestType.MAINTENANCE` | `RequestType.CONCIERGE` zaten var |
| **API** | `POST /api/requests` `type: 'maintenance'` | Aynı endpoint, `type: 'concierge'` destekli |
| **Misafir arayüzü** | 4. buton: "Teknik Arıza" → `maintenance` | Buton yok (eklenecek / Teknik yerine) |
| **Resepsiyon** | "Bakım" etiketi, 🔧 ikon, `warning` bildirim | "Konsiyerj" etiketi ve 🏨 ikon zaten var; bildirim tipi eklenebilir |
| **Çeviriler** | `room.maintenance`, `notifications.maintenance_*` | `room.concierge` vb. eklenmeli |

**Sonuç:** Backend ve resepsiyon tarafında Concierge tipi zaten tanımlı. Yapılacak işler büyük oranda **misafir arayüzü** (buton + metin) ve **çeviriler**.

---

## 2. Entegrasyon Yol Haritası

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONCIERGE ENTEGRASYON AKIŞI                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [MİSAFİR]                    [API]                      [RESEPSİYON]
  ─────────                    ─────                      ────────────

  1. "Concierge"                2. POST /api/requests      3. Yeni talep
     butonuna                       type: 'concierge'         listelenir
     tıklar                           priority: 'medium'       (Konsiyerj)
                                      description: "..."       🏨

  4. Bildirim:                   5. Socket/refresh ile       6. Personel yanıtlar
     "Concierge talebiniz           liste güncellenir          (notes)
     resepsiyona iletildi"
```

---

## 3. Yapılacaklar Listesi

### 3.1 Misafir Arayüzü (Guest – Ana Değişiklik)

| # | Dosya | Yapılacak |
|---|--------|-----------|
| 1 | `frontend/src/app/guest/[roomId]/GuestInterfaceClient.tsx` | **Teknik Arıza** butonunu **Concierge** ile değiştir: ikon (örn. `FaConciergeBell` veya `FaHeadset`), metin, `type: 'concierge'`, `priority: 'medium'`, concierge için description/notification metinleri. |
| 2 | Aynı dosya (loading/skeleton) | Yükleme ekranındaki 4. buton metnini "Bakım" → "Concierge/Konsiyerj" yap. |

**Not:** Oda Servisi zaten `FaConciergeBell` kullanıyor; Concierge için farklı bir ikon (örn. `FaHeadset`, `FaHandsHelping` veya `FaBellConcierge`) kullanılabilir.

---

### 3.2 Çeviriler (Diller)

| # | Dosya | Yapılacak |
|---|--------|-----------|
| 3 | `frontend/src/store/languageStore.ts` | `room.concierge` ekle (TR: "Konsiyerj", EN: "Concierge", DE: "Concierge", vb.). İsteğe bağlı: `room.maintenance` kaldırılabilir veya sadece Diğer İstekler için bırakılır. |
| 4 | Aynı dosya | `notifications.concierge_title`, `notifications.concierge_message`, `notifications.concierge_description` ekle (tüm diller). |
| 5 | `frontend/src/lib/translations.ts` | Varsa `maintenance` kullanımlarını kontrol et; Concierge için yeni anahtarlar ekle. |

---

### 3.3 Resepsiyon Paneli

| # | Dosya | Yapılacak |
|---|--------|-----------|
| 6 | `frontend/src/app/reception/page.tsx` | Yeni gelen talep bildiriminde: `request.type === 'concierge'` için bildirim tipi belirle (örn. `info` veya özel renk). Şu an sadece `maintenance` → warning, `housekeeping` → success var. |
| 7 | Aynı dosya | Liste görünümünde `concierge` için etiket zaten "Konsiyerj"; ikon 🏨 mevcut. Gerekirse filtre/istatistikte Concierge ayrı gösterilebilir. |

**Not:** Demo resepsiyon (`demo_reception/page.tsx`) varsa aynı bildirim mantığı orada da uygulanmalı.

---

### 3.4 Diğer İstekler (DigerIstekler)

| # | Dosya | Yapılacak |
|---|--------|-----------|
| 8 | `frontend/src/app/guest/[roomId]/GuestInterfaceClient.tsx` (DigerIstekler) | Metin içinde "konsiyerj", "concierge", "rezervasyon" vb. geçiyorsa `type = 'concierge'` yap. "Arıza" / "acil" için `type = 'maintenance'` bırakılabilir (opsiyonel). |

---

### 3.5 Backend (Kontrol – Değişiklik Gerekmez)

| # | Kontrol |
|---|--------|
| 9 | Prisma `RequestType` enum: `CONCIERGE` var. |
| 10 | `POST /api/requests`: `type` olarak `concierge` kabul ediliyor. |

---

## 4. Veri Akışı (Özet)

1. **Misafir:** Concierge butonuna tıklar.
2. **Frontend:** `ApiService.createGuestRequest({ roomId, type: 'concierge', priority: 'medium', description: '...' })` çağrılır.
3. **Backend:** `guest_requests` tablosuna `type: CONCIERGE` ile kayıt yazar; gerekirse Socket ile `new-request` yayınlar.
4. **Resepsiyon:** Talepler listesinde "Konsiyerj" olarak görünür; personel yanıtlar (notes günceller).
5. **Misafir:** Başarı bildirimi görür ("Concierge talebiniz resepsiyona iletildi" vb.).

---

## 5. Opsiyonel Geliştirmeler (Sonraki Adımlar)

- **Concierge özel alanları:** Rezervasyon, transfer, restoran önerisi gibi alt tipler (ileride `metadata` veya ayrı alanlarla).
- **İstatistik:** Resepsiyon dashboard’da Concierge taleplerinin sayısı / süresi.
- **Bildirim rengi:** Concierge için sabit bir renk (örn. mor/lacivert) kullanmak.

---

## 6. Kısa Uygulama Sırası Önerisi

1. **GuestInterfaceClient:** Teknik butonunu Concierge’a çevir (ikon, type, description, notification).
2. **languageStore (ve gerekirse translations):** `room.concierge` ve `notifications.concierge_*` ekle.
3. **Reception:** Concierge için bildirim tipi (ve varsa renk) ayarla.
4. **DigerIstekler:** Metin tabanlı type eşlemesine concierge ekle.
5. **Demo / diğer diller:** Aynı değişiklikleri demo ve diğer dil dosyalarına yansıt.

Bu sırayla ilerlediğinizde Teknik yerine Concierge servisi tutarlı şekilde entegre edilmiş olur.
