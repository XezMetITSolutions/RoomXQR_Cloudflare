'use client';

import Link from 'next/link';
import { FaArrowLeft, FaBuilding } from 'react-icons/fa';

export default function YasalBilgilerPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold mb-8 text-sm">
                        <FaArrowLeft /> Ana Sayfaya Dön
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaBuilding />
                        </div>
                        <div>
                            <p className="text-purple-400 font-black text-xs uppercase tracking-widest mb-1">YASAL</p>
                            <h1 className="text-3xl md:text-4xl font-black">Yasal Bilgiler</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium">Son güncelleme: 1 Mart 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12 space-y-10">

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-6">Şirket Bilgileri</h2>
                        <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ticaret Unvanı</p>
                                    <p className="text-slate-800 font-bold">RoomXQR</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Faaliyet Alanı</p>
                                    <p className="text-slate-800 font-bold">Otelcilik Yazılım Çözümleri</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                                    <p className="text-slate-800 font-bold">+43 660 868 22 01</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">E-posta</p>
                                    <p className="text-slate-800 font-bold">info@roomxqr.com</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Web Sitesi</p>
                                    <p className="text-slate-800 font-bold">www.roomxqr.com</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                    <p className="text-slate-800 font-bold">+43 660 868 22 01</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">Platform Hakkında</h2>
                        <p className="text-slate-600 leading-relaxed">
                            RoomXQR, otelcilik ve konaklama sektörüne yönelik bulut tabanlı dijital dönüşüm çözümleri sunan bir yazılım platformudur. Misafir deneyimini QR kod teknolojisiyle dijitalleştiren, otel yönetimini kolaylaştıran ve operasyonel verimliliği artıran kapsamlı bir SaaS (Hizmet Olarak Yazılım) ürününü barındırmaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">Teknik Altyapı</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Platform, aşağıdaki teknolojiler üzerine inşa edilmiştir:
                        </p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-purple-500 font-black">•</span><span><strong>Frontend:</strong> Next.js (React) — Yüksek performanslı, SEO uyumlu web arayüzü</span></li>
                            <li className="flex gap-3"><span className="text-purple-500 font-black">•</span><span><strong>Backend:</strong> Node.js / Express — RESTful API mimarisi</span></li>
                            <li className="flex gap-3"><span className="text-purple-500 font-black">•</span><span><strong>Veritabanı:</strong> PostgreSQL (Prisma ORM) — ACID uyumlu ilişkisel veritabanı</span></li>
                            <li className="flex gap-3"><span className="text-purple-500 font-black">•</span><span><strong>Hosting:</strong> Render.com bulut altyapısı — Avrupa veri merkezleri</span></li>
                            <li className="flex gap-3"><span className="text-purple-500 font-black">•</span><span><strong>Güvenlik:</strong> JWT kimlik doğrulama, SSL/TLS şifrelemesi, KVKK/GDPR uyumu</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">Veri İşleme ve Uyumluluk</h2>
                        <p className="text-slate-600 leading-relaxed">
                            RoomXQR, Türkiye&apos;deki 6698 sayılı KVKK ve Avrupa Birliği&apos;ndeki GDPR kapsamındaki veri koruma yükümlülüklerine tam uyum sağlamaktadır. Kullanıcı ve misafir verileri, açık onay alınmadan üçüncü taraflarla paylaşılmaz ve yalnızca hizmetin sunulması için gerekli süreyle muhafaza edilir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">İçerik Sorumluluğu</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Bu web sitesindeki içerikler bilgilendirme amaçlıdır. RoomXQR, içeriklerin doğruluğunu sağlamak için azami özen göstermektedir; ancak herhangi bir hata veya eksiklik durumunda sorumluluk kabul edilmez. Platform üzerinden erişilen üçüncü taraf bağlantılarından RoomXQR sorumlu tutulamaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">Telif Hakkı</h2>
                        <p className="text-slate-600 leading-relaxed">
                            © {new Date().getFullYear()} RoomXQR. Bu web sitesindeki tüm içerikler, görseller, yazılım ve tasarım unsurları telif hakkıyla korunmaktadır. İzinsiz kopyalama, çoğaltma veya dağıtım yasaktır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">İletişim ve Şikayetler</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Yasal bilgiler, telif hakkı ihlalleri veya platformla ilgili şikayetleriniz için:<br />
                            <strong>E-posta:</strong> info@roomxqr.com<br />
                            <strong>Telefon:</strong> +43 660 868 22 01<br />
                            <strong>WhatsApp:</strong> <a href="https://wa.me/436608682201" className="text-blue-600 hover:underline">+43 660 868 22 01</a>
                        </p>
                    </section>

                    <div className="border-t border-slate-100 pt-8 flex flex-wrap gap-4">
                        <Link href="/gizlilik-politikasi" className="text-blue-600 hover:text-blue-700 font-black text-sm underline-offset-2 hover:underline">
                            Gizlilik Politikası →
                        </Link>
                        <Link href="/kullanim-kosullari" className="text-blue-600 hover:text-blue-700 font-black text-sm underline-offset-2 hover:underline">
                            Kullanım Koşulları →
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
