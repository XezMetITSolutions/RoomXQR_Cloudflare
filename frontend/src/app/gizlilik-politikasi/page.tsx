'use client';

import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

export default function GizlilikPolitikasiPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold mb-8 text-sm">
                        <FaArrowLeft /> Ana Sayfaya Dön
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaShieldAlt />
                        </div>
                        <div>
                            <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">YASAL</p>
                            <h1 className="text-3xl md:text-4xl font-black">Gizlilik Politikası</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium">Son güncelleme: 1 Mart 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12 space-y-10">

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">1. Genel Bilgiler</h2>
                        <p className="text-slate-600 leading-relaxed">
                            RoomXQR (&quot;biz&quot;, &quot;şirket&quot;), kullanıcılarının gizliliğine saygı duyar ve kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), Avrupa Genel Veri Koruma Yönetmeliği (GDPR) ve ilgili mevzuat çerçevesinde işler. Bu gizlilik politikası, RoomXQR platformu ve web sitesi (roomxqr.com) aracılığıyla toplanan verilerin nasıl işlendiğini açıklamaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">2. Toplanan Veriler</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">RoomXQR, aşağıdaki veri kategorilerini toplayabilir:</p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span><strong>İşletme Bilgileri:</strong> Otel veya işletme adı, adres, iletişim bilgileri ve yetkili kişi bilgileri.</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span><strong>Kullanıcı Hesabı Bilgileri:</strong> E-posta adresi, şifre (hashlenmiş), kullanıcı adı ve rol bilgileri.</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span><strong>Misafir Verileri:</strong> Oda numarası, dil tercihi ve anonim etkileşim verileri (isim veya kimlik bilgisi tutulmaz).</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgisi ve oturum süreleri.</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span><strong>Kullanım Verileri:</strong> Sipariş geçmişi, talep logları ve menü etkileşimleri.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">3. Verilerin İşlenme Amaçları</h2>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Platformun temel işlevlerinin sunulması ve hizmet kalitesinin iyileştirilmesi</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Hesap yönetimi ve kimlik doğrulama</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Müşteri desteği ve teknik destek hizmetleri</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Sistem güvenliği ve dolandırıcılık önleme</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Yasal yükümlülüklerin yerine getirilmesi</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Analitik ve sistem performans izleme</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">4. Veri Güvenliği</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Kişisel verileriniz, endüstri standardı SSL/TLS şifrelemesi, güvenli sunucu altyapısı ve erişim kontrol mekanizmaları ile korunmaktadır. Verileriniz, yalnızca yetkili personel tarafından erişilebilir. Şifreler asla düz metin olarak saklanmaz; bcrypt algoritmasıyla hashlenir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">5. Üçüncü Taraflarla Paylaşım</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            RoomXQR, kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmaz:
                        </p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Hizmetin sunulması için zorunlu altyapı sağlayıcıları (cloud hosting, e-posta servisleri)</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Yasal zorunluluk kapsamında yetkili kamu kurumları</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Açık rızanızın bulunduğu durumlar</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">6. Veri Saklama Süresi</h2>
                        <p className="text-slate-600 leading-relaxed">
                            İşletme hesaplarına ait veriler, sözleşme ilişkisi süresince ve sona ermesinden itibaren yasal zorunluluklar çerçevesinde en fazla 10 yıl süreyle saklanır. Misafir etkileşim verileri anonim olarak 12 ay süreyle tutulur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">7. Haklarınız</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="space-y-2 text-slate-600">
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Kişisel verilerinize erişim ve kopyasını talep etme hakkı</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Yanlış veya eksik verilerin düzeltilmesini isteme hakkı</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Verilerinizin silinmesini talep etme hakkı (&quot;unutulma hakkı&quot;)</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Veri işlemeye itiraz etme ve kısıtlama hakkı</span></li>
                            <li className="flex gap-3"><span className="text-blue-500 font-black">•</span><span>Veri taşınabilirliği hakkı</span></li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">Bu haklarınızı kullanmak için <strong>info@roomxqr.com</strong> adresine yazabilirsiniz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4">8. İletişim</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Gizlilik politikamıza ilişkin sorularınız için:<br />
                            <strong>E-posta:</strong> info@roomxqr.com<br />
                            <strong>Telefon:</strong> +43 660 868 22 01
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
