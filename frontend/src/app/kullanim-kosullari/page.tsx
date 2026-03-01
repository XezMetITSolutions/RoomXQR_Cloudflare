'use client';

import Link from 'next/link';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';

export default function KullanimKosullariPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold mb-8 text-sm">
                        <FaArrowLeft /> Ana Sayfaya Dön
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaFileContract />
                        </div>
                        <div>
                            <p className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-1">YASAL</p>
                            <h1 className="text-3xl md:text-4xl font-black">Kullanım Koşulları</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium">Son güncelleme: 1 Mart 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12 space-y-10">

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">1. Taraflar ve Kapsam</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Bu Kullanım Koşulları, RoomXQR yazılım platformunu (&quot;Platform&quot;) kullanan gerçek veya tüzel kişi işletmeler (&quot;Kullanıcı&quot;) ile RoomXQR (&quot;Hizmet Sağlayıcı&quot;) arasındaki hizmet ilişkisini düzenler. Platforma kaydolarak veya hizmetleri kullanarak bu koşulları kabul etmiş sayılırsınız.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">2. Hizmet Tanımı</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">RoomXQR, oteller ve konaklama işletmeleri için aşağıdaki hizmetleri sunar:</p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>QR kod tabanlı dijital menü sistemi</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Misafir talep ve sipariş yönetimi</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Çok dilli arayüz ve içerik yönetimi</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Duyuru, kampanya ve reklam yönetimi</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Operasyonel raporlama ve analitik araçları</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Donanım tedariki (opsiyonel: POS bilgisayarı, fiş yazıcısı, ödeme cihazı)</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">3. Kullanıcı Yükümlülükleri</h2>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Platforma yüklenecek içeriklerin hukuka uygun, doğru ve güncel olmasından kullanıcı sorumludur.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Hesap güvenliği kullanıcının sorumluluğundadır; şifre bilgilerinin üçüncü kişilerle paylaşılması yasaktır.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Platform üzerinden hukuka aykırı, yanıltıcı veya zararlı içerik yayınlamak kesinlikle yasaktır.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Kullanıcı, platformu yalnızca işletme faaliyetleri kapsamında kullanmayı kabul eder.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">4. Abonelik ve Ödeme Koşulları</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            RoomXQR, aylık veya yıllık abonelik modeliyle sunulur.
                        </p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Yıllık aboneliklerde 1 ay hizmet hediye olarak sunulur.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>İlk 15 gün ücretsiz deneme hakkı mevcuttur.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Deneme süreci sonrası, abonelik iptal edilmezse ücretlendirme başlar.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Ödemeler, fatura kesim tarihi itibarıyla 30 gün içinde yapılmalıdır.</span></li>
                            <li className="flex gap-3"><span className="text-emerald-500 font-black">•</span><span>Çoklu şube ve büyük kapasiteli otellere özel fiyatlandırma uygulanır.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">5. İptal ve İade Politikası</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Abonelik, herhangi bir zamanda iptal edilebilir. İptal edilmesi durumunda mevcut dönem sonuna kadar hizmet sunulmaya devam eder. 15 günlük deneme süresi içinde iptal edilen aboneliklerde herhangi bir ücret alınmaz. Yıllık aboneliklerde, ilk 30 gün içinde yapılan iptallerde ücret iadesi değerlendirilir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">6. Hizmet Sürekliliği ve Bakım</h2>
                        <p className="text-slate-600 leading-relaxed">
                            RoomXQR, %99.9 uptime hedefiyle çalışır. Planlı bakım çalışmaları önceden kullanıcılara bildirilir. Doğal afet, siber saldırı ve benzeri mücbir sebepler dışında hizmet kesintisi minimumda tutulur. Teknik destek, hafta içi 09:00–18:00 saatleri arasında e-posta ve telefon ile sağlanır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">7. Fikri Mülkiyet</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Platform yazılımı, tasarımı ve altyapısı RoomXQR&apos;e aittir. Kullanıcı, platforma yüklediği içeriklerin (menü görselleri, açıklamalar vb.) fikri mülkiyet haklarını elinde tutar. RoomXQR, bu içerikleri yalnızca hizmetin sunulması amacıyla kullanır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">8. Sorumluluğun Sınırlandırılması</h2>
                        <p className="text-slate-600 leading-relaxed">
                            RoomXQR, kullanıcının platform üzerinden gerçekleştirdiği işlemler sonucunda oluşabilecek dolaylı zararlardan sorumlu tutulamaz. Platformun sağladığı verilere (sipariş, raporlama) dayanılarak alınan kararlardan doğan sonuçlar kullanıcıya aittir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">9. Uygulanacak Hukuk</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Bu sözleşmeden doğacak uyuşmazlıklarda Türk Hukuku uygulanır. Yetkili mahkemeler, RoomXQR merkez ofisinin bulunduğu yüksek yargı bölgesidir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">10. İletişim</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Kullanım koşullarına ilişkin sorularınız için:<br />
                            <strong>E-posta:</strong> info@roomxqr.com<br />
                            <strong>Telefon:</strong> +43 660 868 22 01
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
