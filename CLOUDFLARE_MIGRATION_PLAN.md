# Cloudflare Projesine Geçiş Planı

Merhaba, projenizin hem **Frontend (Netlify -> Cloudflare)** hem de **Backend (Render -> Cloudflare)** kısımlarını tamamen Cloudflare'e geçirmek için gerekli adımları inceledim.

## 1. Frontend (Next.js) -> Cloudflare Pages (Tamamlandı/Hazır)
Frontendinizin Next.js tabanlı olması, Cloudflare Pages'e geçişi oldukça kolaylaştırmaktadır. 
**Yapılan Değişiklikler:**
- `frontend/package.json` içerisine `"pages:build": "npx @cloudflare/next-on-pages"` scripti eklendi.
- `frontend/` klasörüne Cloudflare Pages ayarlarını içeren `wrangler.toml` eklendi.
- Gerekli Cloudflare next-on-pages kütüphaneleri kuruluyor.

**Nasıl Deploy Edilir?**
Cloudflare Dashboard üzerinden **Pages > Connect to Git** diyerek deponuzu bağlayın:
- **Build command:** `npx @cloudflare/next-on-pages`
- **Build output directory:** `.vercel/output/static`

## 2. Backend (Express.js) -> Cloudflare Workers Pürüzleri ve Çözüm Önerileri
Backend kısmı, geleneksel bir Node.js Express.js sunucusu, Socket.IO ve Prisma Postgres içeriyor.
Cloudflare (Workers) sunucusuz (**Serverless & Edge Runtime**) bir mimari olduğu için bazı temel farklar vardır ve backend'in doğrudan bir sunucu gibi Cloudflare'e atılması maalesef mümkün değildir:

### Yaşanacak Teknik Sınırlamalar
1. **Socket.IO:** Cloudflare Workers kalıcı WebSocket bağlantılarını geleneksel `Socket.IO` gibi tutamaz; **Durable Objects** ve native WebSockets kullanılması gerekir.
2. **Prisma & Veritabanı:** Cloudflare edge üzerinde çalıştığı için standart Node.js Postgres TCP bağlantıları yerine Cloudflare Hyperdrive, `@prisma/client/edge` veya Prisma Accelerate adaptörleri gerekmektedir.
3. **Routing (Express):** Cloudflare Workers'da Node API'lerinin tamamı çalışmaz, projede yoğun bir native Node API'si kullanılıyorsa (`fs`, child process `exec` komutları), bu fonksiyonların kaldırılması veya uygun Edge sürümleri ile değiştirilmesi zorunludur.

### Tavsiye Edilen Yeni Cloudflare Backend Yolu
En stabil "Tam Cloudflare" çözümü için iki opsiyonunuz mevcuttur:
**Opsiyon A: Hono.js Mimarisine Geçiş (Tavsiye Edilen Tam Cloudflare)**
- Tüm `Express` projesinin Cloudflare-native bir framework olan `Hono.js`'ye taşınması (Kodun büyük bir bölümü revize edilmelidir).
- Socket.IO yerine Cloudflare WebSockets / PartyKit gibi CF destekli kütüphanelere geçiş yapılması.
  
**Opsiyon B: Backend'i Geçici Olarak Render'da Tutmak (Hızlı Çözüm)**
- Eğer frontend hızını artırmak ve CDN'den faydalanmak istiyorsanız, Cloudflare Pages ile Next.js uygulamasını deploy edin ve API isteklerini Render'daki mevcut sunucuya yönlendirin (`api.roomapp.com`).

Projenizi yeni Cloudflare reponuza push edeceğim. Lütfen backend'i taşımak için yukarıdaki adımlar ışığında bir "Yeniden Yazım" (Refactor) yapmamızı isteyip istemediğinize karar verin.

---

## ⚠️ Sorun Giderme: Build Hataları (ERESOLVE)

Eğer Cloudflare Pages deployment sırasında `npm error ERESOLVE` hatası alıyorsanız (Next.js versiyon çakışması):

1. **Çözüm (Önerilen)**: Cloudflare Dashboard üzerinden **Pages Projesi > Settings > Environment Variables** bölümüne giderek şu değişkeni ekleyin:
   - Variable Name: `NPM_CONFIG_LEGACY_PEER_DEPS`
   - Value: `true`
   
   Veya:
   - Variable Name: `NPM_FLAGS`
   - Value: `--legacy-peer-deps`

2. **Otomatik Çözüm**: Projenin `frontend/` klasörüne otomatik olarak `.npmrc` dosyası ekledim. Bu dosya `npm install` komutunun çakışmaları göz ardı etmesini sağlar.
