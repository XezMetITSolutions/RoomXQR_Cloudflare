'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic,
    FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket,
    FaShieldAlt, FaStar, FaPhone, FaChevronDown,
    FaBrain, FaGlobe, FaDesktop, FaLaptop, FaPrint, FaCreditCard as FaCreditCardIcon,
    FaArrowRight, FaCogs, FaCreditCard, FaLayerGroup, FaWhatsapp, FaEnvelope, FaTimes, FaWifi,
    FaUserTie, FaLaptopMedical, FaFileAlt, FaBalanceScale
} from 'react-icons/fa';
import { useLanguageStore } from '@/store/languageStore';

import DemoRequestModal from '@/components/DemoRequestModal';

export default function PremiumLanding() {
    const { getTranslation: t, currentLanguage } = useLanguageStore();


    useEffect(() => {
        const title = t('metaTitle');
        if (title && title !== 'metaTitle') {
            document.title = `${title} - RoomXQR`;
        } else {
            document.title = "RoomXQR - Hotel Digital Transformation";
        }
    }, [t, currentLanguage]);

    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [activeBlogPost, setActiveBlogPost] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const blogPostsContent = [
        {
            id: 1,
            title: 'QR Menülerin Otel Gelirlerine Etkisi: %40 Artış Mümkün mü?',
            date: 'Mart 2026',
            category: 'Trendler',
            content: `<p class="mb-4">Otelcilik sektöründe dijital dönüşüm artık bir tercih değil, zorunluluk haline gelmiştir. QR kod tabanlı menü ve sipariş sistemleri, yalnızca misafir deneyimini iyileştirmekle kalmayıp otel gelirlerini doğrudan etkileyen stratejik bir araç olarak öne çıkmaktadır.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Restoran ve Bar Gelirlerinde Artış</h3>
<p class="mb-4">Fiziksel menülerde misafirler ortalama 3-4 dakika inceleme yaparak sipariş verir. Dijital QR menülerde ise etkileşim süresi %70 artmakta, önerilen ürünlere yönelik tıklama oranı %45'e ulaşmaktadır. Bu da doğrudan ek satış (upsell) fırsatı anlamına gelir.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Oda Servisi Kullanımı</h3>
<p class="mb-4">Araştırmalar, QR kod bazlı oda servisi siparişlerinin fiziksel menüye kıyasla %30-40 daha fazla sipariş oluşturduğunu göstermektedir. Çünkü misafirler, süreci pratik buldukları için daha sık sipariş vermektedir.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Gerçek Veriler</h3>
<p class="mb-4">RoomXQR kullanan otellerde ilk 3 ay içinde ortalama %37 ek hizmet geliri artışı gözlemlenmiştir. Bu artış; oda servisi, restoran rezervasyonu ve otel içi hizmet satışlarının toplamından kaynaklanmaktadır.</p>
<p class="mb-4">%40 artış hedefi yalnızca teorik bir rakam değildir — doğru konumlandırma, QR erişim kolaylığı ve anlık güncelleme yeteneğiyle birleştiğinde son derece ulaşılabilir bir hedeftir.</p>`
        },
        {
            id: 2,
            title: 'Temassız Misafir Deneyimi: Yeni Nesil Otelcilikte Standartlar',
            date: 'Şubat 2026',
            category: 'Trendler',
            content: `<p class="mb-4">Pandemi sonrası dünyada misafirler artık fiziksel temastan kaçınmak için değil, pratiklik ve hız için temassız hizmetleri tercih etmektedir. Bu değişim, otelcilik sektöründe kalıcı bir paradigma dönüşümüne yol açmıştır.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Neden Temassız?</h3>
<p class="mb-4">Skift Research'ün 2025 verilerine göre, 5 yıldızlı otel misafirlerinin %68'i dijital self-servis seçeneklerini resepsiyon desteğine tercih etmektedir. Bu oran, lüks segmentte her geçen yıl artmaktadır.</p>
<h3 class="text-xl font-bold mb-3 mt-6">QR ile Temassız Deneyim</h3>
<p class="mb-4">Odaya yerleştirilen tek bir QR kod; menü erişimi, servis talebi, concierge hizmetleri ve anlık bildirimler için tek giriş noktası işlevi görür. Misafir, uygulama indirmek zorunda kalmadan tüm bu hizmetlere tarayıcıdan anında ulaşır.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Operasyonel Kazanımlar</h3>
<p class="mb-4">Temassız sistemlere geçen otellerde resepsiyon telefon trafiği ortalama %50 azalmaktadır. Bu, personelin daha değerli misafir deneyimi faaliyetlerine odaklanmasını sağlar ve operasyonel verimliliği önemli ölçüde artırır.</p>`
        },
        {
            id: 3,
            title: 'AI Destekli Otel Yönetimi: Personel Yükünü Hafifletin',
            date: 'Ocak 2026',
            category: 'Teknoloji',
            content: `<p class="mb-4">Yapay zeka, otel yönetiminin her katmanına entegre olmaya başlamıştır. Rezervasyon yönetiminden misafir iletişimine, menü optimizasyonundan talep yönlendirmeye kadar AI tabanlı araçlar operasyonel maliyetleri önemli ölçüde düşürmektedir.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Akıllı Talep Yönlendirme</h3>
<p class="mb-4">AI destekli sistemler, gelen misafir taleplerini kategorize ederek ilgili departmana (Teknik Servis, Kat Hizmetleri, Mutfak) otomatik olarak iletir. Bu, yanıt sürelerini %60 kısaltmakta ve hata payını minimuma indirmektedir.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Çok Dilli İletişim</h3>
<p class="mb-4">AI tabanlı çeviri sistemleri, misafirlerin tarayıcı diline göre içerikleri otomatik olarak yerelleştirir. Çoklu dil desteğiyle otel personelinin dil bariyerleri olmaksızın küresel misafirlerle sorunsuz iletişim kurması sağlanır.</p>
<h3 class="text-xl font-bold mb-3 mt-6">Maliyet Avantajı</h3>
<p class="mb-4">Dünya Turizm Örgütü'nün 2025 raporuna göre, AI destekli otel yönetim sistemleri kullanan işletmelerde personel başına işlem hacmi %40 artarken, müşteri memnuniyeti ortalaması 0.8 puan yükselmektedir. Bu kombinasyon, hem operasyonel hem finansal sürdürülebilirliği güçlendirmektedir.</p>`
        }
    ];

    const faqs = [
        { icon: FaQrcode, color: "orange-500", question: t('faq1Q'), answer: t('faq1A') },
        { icon: FaRocket, color: "blue-500", question: t('faq2Q'), answer: t('faq2A') },
        { icon: FaShieldAlt, color: "green-500", question: t('faq3Q'), answer: t('faq3A') },
        { icon: FaShoppingCart, color: "purple-500", question: t('faq4Q'), answer: t('faq4A') },
        { icon: FaPhone, color: "red-500", question: t('faq5Q'), answer: t('faq5A') },
        { icon: FaClock, color: "yellow-500", question: t('faq6Q'), answer: t('faq6A') },
        { icon: FaUtensils, color: "indigo-500", question: t('faq7Q'), answer: t('faq7A') },
        { icon: FaChartLine, color: "pink-500", question: t('faq8Q'), answer: t('faq8A') },
        { icon: FaLayerGroup, color: "indigo-600", question: t('faqStokQ'), answer: t('faqStokA') },
        { icon: FaUserTie, color: "slate-900", question: t('faqPerfQ'), answer: t('faqPerfA') },
        { icon: FaBalanceScale, color: "emerald-500", question: t('faqAnalizQ'), answer: t('faqAnalizA') },
        { icon: FaStar, color: "yellow-500", question: t('referralFaqQ'), answer: t('referralFaqA') }
    ];

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-900">


            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[75vh] flex items-center pt-16 md:pt-20 pb-10 md:pb-12 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
                {/* Mobile Hero - Simple Card Style */}
                <div className="md:hidden w-full relative z-10">
                    <div className="container mx-auto px-4">
                        {/* Mobile Hero Content Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50"
                        >
                            <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-full border border-blue-600/30 mb-4">
                                <FaStar className="text-yellow-500 mr-1.5 text-xs animate-pulse" />
                                <span className="text-[9px] font-black tracking-widest uppercase text-blue-700">
                                    {t('heroBadge')}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black mb-3 leading-tight">
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {t('newIntroTitle')}
                                </span>
                            </h1>

                            <p className="text-sm text-slate-600 font-medium mb-5 leading-relaxed">
                                Tek bir QR kod ile tüm otel operasyonlarınızı yönetin. AI destekli menü, anlık sipariş yönetimi ve %40 maliyet azaltma.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowDemoModal(true)}
                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-base shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaUsers className="text-lg" /> 
                                    <span>{t('requestDemo')}</span>
                                </button>
                                <a
                                    href="https://wa.me/436608682201"
                                    target="_blank"
                                    className="w-full px-6 py-3.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-black text-base shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaRocket className="text-lg text-emerald-500" /> 
                                    <span>{t('startNow')}</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Desktop Hero - Original Design */}
                <div className="hidden md:block w-full">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/15 to-blue-400/15 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">
                            {/* Hero Text */}
                            <div className="lg:w-1/2 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 backdrop-blur-2xl rounded-full border border-blue-600/30 mb-6 shadow-lg"
                                >
                                    <FaStar className="text-yellow-500 mr-2 text-sm animate-pulse" />
                                    <span className="text-xs font-black tracking-widest uppercase text-blue-700">
                                        {t('heroBadge')}
                                    </span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl lg:text-5xl font-black mb-4 leading-[1.15] tracking-tight"
                                >
                                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                                        {t('newIntroTitle')}
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg lg:text-xl mb-8 text-slate-700 leading-relaxed max-w-2xl font-medium"
                                >
                                    {t('newIntroDesc')}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6"
                                >
                                    <button
                                        onClick={() => setShowDemoModal(true)}
                                        className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_15px_35px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 text-center"
                                    >
                                        <FaUsers className="text-2xl" /> 
                                        <span>{t('requestDemo')}</span>
                                    </button>
                                    <a
                                        href="https://wa.me/436608682201"
                                        target="_blank"
                                        className="px-12 py-5 bg-white hover:bg-slate-50 border-2 border-blue-600 backdrop-blur-md rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 text-blue-600 flex items-center justify-center gap-4 text-center shadow-lg"
                                    >
                                        <FaRocket className="text-2xl text-emerald-500" /> 
                                        <span>{t('startNow')}</span>
                                    </a>
                                </motion.div>
                            </div>

                            {/* Hero Image */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="lg:w-1/2 relative w-full max-w-md lg:max-w-none"
                            >
                                <div className="relative z-10 rounded-[3rem] overflow-hidden border-2 border-blue-200/50 shadow-2xl">
                                    <img
                                        src="/images/hero.png"
                                        alt="RoomXQR Guest Experience"
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute -top-8 -right-8 w-64 h-64 bg-gradient-to-br from-blue-500/25 to-indigo-500/25 blur-[100px] rounded-full -z-10"></div>
                                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-[100px] rounded-full -z-10"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 text-xl hidden lg:block"
                >
                    <FaChevronDown />
                </motion.div>
            </section>

            {/* Neden RoomXQR? - Consolidation */}
            <section id="neden-roomxqr" className="py-12 md:py-16 bg-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-10 md:mb-12">
                        <span className="text-blue-600 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-3">OTELİNİZE SAĞLADIĞI FAYDALAR</span>
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                            Neden RoomXQR?
                        </h2>
                        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-4"></div>
                        <p className="text-lg md:text-xl text-slate-900 font-black max-w-3xl mx-auto">
                            Misafirinizin Her İhtiyacı, Tek QR'da
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {[
                            {
                                icon: FaQrcode,
                                color: 'bg-blue-600',
                                title: '%100 Dijitalleşme',
                                desc: 'Oda servisi, temizlik ve tüm hizmetleri saniyeler içinde dijitalleştirin. Uygulama indirmeye gerek kalmadan kusursuz erişim.'
                            },
                            {
                                icon: FaCogs,
                                color: 'bg-emerald-600',
                                title: 'POS Entegrasyonu',
                                desc: 'Mevcut POS ile entegre; kasa düzeninizi değiştirmenize gerek yok. Tek çatıda tam kontrol sağlayın.'
                            },
                            {
                                icon: FaChartLine,
                                color: 'bg-blue-600',
                                title: 'Kâr Artışı & EKSTRA GELİR',
                                desc: 'QR Menü ile oda servisi satışlarını artırırken, dijital reklam alanları ile ek gelir fırsatları yaratın.'
                            },
                            {
                                icon: FaMagic,
                                color: 'bg-purple-600',
                                title: 'AI ile Görsel Optimizasyonu',
                                desc: 'Anlık QR Menü Yönetimi: AI destekli iştah açıcı görsellerle satışları ve kullanıcı deneyimini zirveye taşıyın.'
                            },
                            {
                                icon: FaUsers,
                                color: 'bg-pink-600',
                                title: 'Müşteri Memnuniyeti',
                                desc: 'Misafirleri kendi dilinde karşılayın, WiFi bilgilerine anında ulaştırın. Google yorumları ile puanınızı yükseltin.'
                            },
                            {
                                icon: FaBell,
                                color: 'bg-orange-600',
                                title: 'Akıllı Duyuru ve Reklam',
                                desc: 'Otel içi etkinlikleri veya yerel fırsatları anlık olarak duyurun. Misafirlerinize doğru zamanda ulaşın.'
                            },
                            {
                                icon: FaLayerGroup,
                                color: 'bg-indigo-600',
                                title: 'Akıllı Stok Takibi',
                                desc: 'Hem restoran stoklarını (mutfak, bar) hem de otel envanterini (teknik servis malzemeleri, kat hizmetleri, temizlik ürünleri vb.) kapsayan tam kontrol sistemi. Giderleri net hesaplar, fireyi minimize eder.'
                            },
                            {
                                icon: FaBalanceScale,
                                color: 'bg-emerald-500',
                                title: 'Gelişmiş Gelir-Gider Analizi',
                                desc: 'Mutfak harcamaları ve genel envanter giderlerini satışlarla anlık karşılaştırak kârlılığı raporlayan finansal sistem.'
                            },
                            {
                                icon: FaUserTie,
                                color: 'bg-slate-900',
                                title: 'Personel Performans Ölçümü',
                                desc: 'Taleplerin çözüm süresi ve personelin iş yükü analizi ile operasyonel verimliliği ve başarıyı somut verilerle ölçün.'
                            },
                            {
                                icon: FaGlobe,
                                color: 'bg-blue-500',
                                title: 'Dijital Concierge Hizmeti',
                                desc: 'Otel dışı transfer, tur ve aktivite yönlendirmeleri ile misafirinize değer katın, komisyon kazancı elde edin.'
                            },
                            {
                                icon: FaDesktop,
                                color: 'bg-purple-500',
                                title: 'Tek Çatıda Tam Kontrol',
                                desc: 'Teknik servis, kat hizmetleri ve restoran taleplerini tek bir panelden yönetin, operasyonel yükü kökten çözün.'
                            },
                            {
                                icon: FaShieldAlt,
                                color: 'bg-emerald-600',
                                title: 'Güvenilir Altyapı',
                                desc: 'Kesintisiz bulut tabanlı yapı, %100 dijital güvenlik ve hızlı teknik destek ile oteliniz her zaman güvende.'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-xl md:rounded-[2rem] hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                            >
                                <div className={`${item.color} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-white text-lg md:text-xl mb-3 md:mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                                    <item.icon />
                                </div>
                                <h3 className="text-xs md:text-base font-black text-slate-900 mb-1.5 md:mb-2 leading-tight">{item.title}</h3>
                                <p className="text-slate-500 font-bold text-[10px] md:text-xs leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto rounded-[2.5rem] md:rounded-[4rem] bg-slate-900 overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/5 relative">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                variants={fadeIn}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black mb-6 md:mb-8 border border-emerald-500/20 tracking-[0.2em]">
                                    <FaStar className="mr-2 text-yellow-500" /> {t('caseStudyBadge')}
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-8 leading-[1.2]">
                                    {t('customersSuccessTitle')}
                                </h3>
                                <p className="text-lg text-slate-400 mb-10 md:mb-12 leading-relaxed font-medium">
                                    {t('customersSuccessDesc')}
                                </p>

                                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-8 md:mb-12">
                                    {[
                                        { label: t('valPropSatisfy'), icon: FaStar, color: "text-pink-400" },
                                        { label: t('valPropProfit'), icon: FaChartLine, color: "text-emerald-400" },
                                        { label: t('valPropStaff'), icon: FaUsers, color: "text-blue-400" },
                                        { label: t('valPropSpeed'), icon: FaRocket, color: "text-orange-400" },
                                        { label: t('valPropDigital'), icon: FaDesktop, color: "text-purple-400" },
                                        { label: t('valPropTrust'), icon: FaShieldAlt, color: "text-cyan-400" }
                                    ].map((res, i) => (
                                        <div key={i} className="flex items-center gap-2 md:gap-3 bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                            <res.icon className={`${res.color} text-base md:text-xl shrink-0`} />
                                            <span className="text-white font-bold text-[10px] md:text-sm tracking-tight leading-tight">{res.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setShowDemoModal(true)} className="flex items-center gap-4 text-white font-black text-xl hover:gap-6 transition-all group">
                                    {t('examineFeature')} <FaArrowRight className="text-blue-500 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2 bg-[#0F172A] relative min-h-[450px] md:min-h-[550px] overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 8, repeat: Infinity }}
                                    className="w-40 h-40 md:w-56 md:h-56 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-2xl relative"
                                >
                                    <FaUsers className="text-5xl md:text-7xl text-white/20" />
                                    {[
                                        { icon: FaUtensils, color: "text-blue-400", pos: "-top-10 -left-10" },
                                        { icon: FaChartLine, color: "text-emerald-400", pos: "-bottom-10 -right-10" },
                                        { icon: FaQrcode, color: "text-purple-400", pos: "-top-10 -right-10" },
                                        { icon: FaShieldAlt, color: "text-cyan-400", pos: "-bottom-10 -left-10" },
                                        { icon: FaBell, color: "text-pink-400", pos: "top-1/2 -right-16 -translate-y-1/2" },
                                        { icon: FaRocket, color: "text-orange-400", pos: "top-1/2 -left-16 -translate-y-1/2" }
                                    ].map((item, i) => (
                                        <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.7 }} className={`absolute ${item.pos} w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center justify-center text-xl md:text-2xl ${item.color} shadow-2xl`}>
                                            <item.icon />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-[2rem]">
                                    <div className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase mb-1 tracking-widest">MUTLU MÜŞTERİLER</div>
                                    <div className="text-white text-2xl md:text-3xl font-black">500+</div>
                                </div>
                                <div className="bg-emerald-600/10 backdrop-blur-3xl border border-emerald-500/20 p-5 rounded-[2rem] text-right">
                                    <div className="text-emerald-400 text-[8px] md:text-[10px] font-black uppercase mb-1 tracking-widest">OPERASYONEL HIZ</div>
                                    <div className="text-white text-2xl md:text-3xl font-black">+35%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Power Section - Moved and Updated */}
            <section className="py-12 md:py-16 bg-[#0B0F1A] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-white/5 border border-white/10 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 text-xs">RAKAMLARLA ROOMXQR</span>
                        <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                            Klasik Otel Programları <span className="text-red-400 line-through opacity-60">Sadece Kayıt Tutarlar.</span>
                        </h2>
                        <p className="text-lg text-blue-300 font-black max-w-3xl mx-auto">
                            RoomXQR Otelinizin Geleceğini Otomatikleştirir — Tüm süreçlerinizi dijitalin hızıyla <span className="text-emerald-400">akıllıca yönetin.</span>
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {[
                            { number: '%30', label: 'Operasyonel Maliyet Düşüşü', color: 'from-blue-600 to-blue-700' },
                            { number: '+%40', label: 'Restoran & Ek Satış Artışı', color: 'from-emerald-600 to-emerald-700' },
                            { number: '%50', label: 'Resepsiyon Yükü Azalması', color: 'from-orange-600 to-orange-700' },
                            { number: '15dk', label: 'Personel Eğitim Süresi', color: 'from-purple-600 to-purple-700' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className={`bg-gradient-to-br ${stat.color} rounded-xl md:rounded-[2rem] p-4 md:p-6 text-center shadow-2xl`}
                            >
                                <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">{stat.number}</div>
                                <div className="text-white/80 text-[9px] md:text-xs font-bold uppercase tracking-wide leading-tight">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Management & Dashboard Section */}
            <section className="py-12 md:py-16 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
                        {/* Features on Left */}
                        <div className="lg:w-1/2">
                            <span className="text-emerald-600 font-black tracking-[0.2em] text-xs uppercase block mb-6 px-4 py-2 bg-emerald-50 rounded-full w-fit">
                                {t('mgmtControlTitle')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-8 leading-tight tracking-tight">
                                {t('mgmtTitle')}
                            </h2>
                            <p className="text-lg text-slate-600 font-medium mb-12 italic">
                                {t('mgmtNoTechRequired')} 📊
                            </p>

                            <div className="grid grid-cols-2 gap-3 md:gap-6">
                                {[
                                    { icon: FaCogs, title: t('mgmtMenuUpdate'), color: "text-blue-600", bg: "bg-blue-50" },
                                    { icon: FaMagic, title: t('mgmtStockHide'), color: "text-emerald-600", bg: "bg-emerald-50" },
                                    { icon: FaChartLine, title: t('mgmtCampaignDrive'), color: "text-orange-600", bg: "bg-orange-50" },
                                    { icon: FaBell, title: t('mgmtAnnounceDirect'), color: "text-purple-600", bg: "bg-purple-50" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:gap-4 gap-2 text-center md:text-left"
                                    >
                                        <div className={`${item.bg} ${item.color} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0`}>
                                            <item.icon />
                                        </div>
                                        <h4 className="text-xs md:text-base font-black text-slate-900 leading-tight">{item.title}</h4>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Image on Right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="rounded-[3rem] overflow-hidden border border-slate-200 shadow-3xl bg-[#0B0F1A] p-2">
                                <img
                                    src="/images/dashboard.png"
                                    alt="RoomXQR Management Dashboard"
                                    className="w-full h-auto rounded-[2.5rem]"
                                />
                            </div>
                            {/* Stats Badge Overlay */}
                            <div className="absolute -top-6 -left-6 bg-blue-600 text-white p-6 rounded-[2rem] shadow-2xl animate-bounce-slow">
                                <div className="text-2xl font-black mb-1">-%50</div>
                                <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest text-center">İş Yükü Azalması</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Zero Error Section */}
            <section className="py-12 md:py-16 bg-slate-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                        <span className="text-orange-400 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-6">{t('zeroErrorSectionTitle')}</span>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">{t('qrToKitchenTitle')}</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                            Talepler resepsiyonu meşgul etmeden doğrudan ilgili departmana (Kat Hizmetleri, Teknik Servis, Restoran vb.) aktarılır.
                        </p>
                    </div>
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative justify-center">
                        {[
                            { step: "01", title: 'Hızlı QR Erişim', icon: FaQrcode, color: "bg-blue-600", sub: 'Misafir tek tıkla talebi iletir' },
                            { step: "02", title: 'Doğru Departman', icon: FaCogs, color: "bg-orange-600", sub: 'Mutfak, Kat, Teknik, Resepsiyon' },
                            { step: "03", title: 'Anlık Bildirim', icon: FaBell, color: "bg-emerald-600", sub: 'Personel saniyelerde haberdar' },
                            { step: "04", title: 'Hızlı Çözüm', icon: FaCheckCircle, color: "bg-pink-600", sub: 'Misafir memnuniyeti zirveye' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-white/5 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] flex flex-col items-center text-center"
                            >
                                <span className="absolute top-2 left-3 md:top-4 md:left-6 text-white/10 text-3xl md:text-5xl font-black font-mono italic">{item.step}</span>
                                <div className={`${item.color} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center text-xl md:text-3xl shadow-2xl`}><item.icon /></div>
                                <h4 className="text-xs md:text-lg font-black leading-tight mb-1 md:mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-[10px] md:text-xs font-bold">{item.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Revenue & Experience Section */}
            <section className="py-12 md:py-16 bg-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Image Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
                                <img
                                    src="/images/restaurant.png"
                                    alt="RoomXQR Restaurant Revenue"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl hidden md:block">
                                <div className="text-3xl font-black mb-1">+%45</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Restoran Siparişi</div>
                            </div>
                        </motion.div>

                        {/* Content Right */}
                        <div className="lg:w-1/2">
                            <span className="text-emerald-600 font-black tracking-[0.2em] text-xs uppercase block mb-6 px-4 py-2 bg-emerald-50 rounded-full w-fit">
                                GELİR ARTIŞI & KÂRLILIK
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-8 leading-tight tracking-tight">
                                Otelinizin <span className="text-emerald-600">Gelirini Artırın.</span>
                            </h2>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                                RoomXQR, misafir memnuniyetini artırırken operasyonel yükü sıfırlayan tam entegre bir ekosistemdir. Dijital concierge, QR hizmet yönetimi, restoran stokları ve genel otel envanteri (teknik, temizlik vb.) kontrolü ile işletmenizin kâr potansiyelini maksimize edin.
                            </p>
                            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                                {[
                                    { icon: FaChartLine, text: 'Restoran ve Oda Servisi satışlarında %40\'a varan artış.' },
                                    { icon: FaGlobe, text: 'Transfer, Tur ve Aktivite yönlendirmelerinden komisyon kazancı.' },
                                    { icon: FaBell, text: 'QR reklam alanları ile yerel işletmelerden reklam geliri.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 md:gap-5 text-slate-800 font-bold text-sm md:text-lg">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <item.icon className="text-sm md:text-base" />
                                        </div>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowDemoModal(true)} className="px-12 py-5 bg-slate-950 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl uppercase tracking-widest text-sm">
                                Gelirlerinizi Artırmaya Başlayın
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section + Hardware */}
            <section className="py-12 md:py-16 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 md:p-16 text-white text-center relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="relative z-10">
                            <span className="text-blue-200 font-black tracking-[0.3em] text-[10px] md:text-xs uppercase block mb-6">{t('noChangeTitle')}</span>
                            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 leading-tight">{t('noChangeSubtitle')}</h2>
                            <p className="text-lg md:text-xl text-blue-100/80 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">{t('noChangeDesc')}</p>
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-base md:text-lg font-black shadow-2xl mb-10">
                                <FaRocket className="text-emerald-400" /> {t('finalSlogan')}
                            </div>

                            <div className="border-t border-white/10 pt-10">
                                <p className="text-white font-black text-lg mb-6">
                                    Donanım ihtiyacınız mı var? İhtiyaç duyduğunuzda tam paket sunuyoruz.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {[
                                        { icon: FaLaptop, label: 'POS Bilgisayarları' },
                                        { icon: FaPrint, label: 'Adisyon & Fiş Yazıcıları' },
                                        { icon: FaCreditCardIcon, label: 'Ödeme Cihazları' }
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white hover:text-blue-700 transition-all cursor-pointer rounded-xl font-bold text-sm"
                                            onClick={() => setShowDemoModal(true)}
                                        >
                                            <item.icon /> {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-12 md:py-16 bg-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16 px-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="text-blue-600 font-extrabold tracking-[0.3em] text-[10px] md:text-xs uppercase block mb-4"
                        >
                            {t('pricingBadge')}
                        </motion.span>
                        <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            {t('pricingTitle')}
                        </h2>
                        <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-8"></div>
                        <p className="text-lg md:text-xl text-slate-500 font-bold max-w-2xl mx-auto mb-4 italic">
                            🚀 {t('devTeamPromise')}
                        </p>
                        <p className="text-sm font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit mx-auto px-6 py-2 rounded-full border border-emerald-100 shadow-sm">
                            1 YILLIK ALIMLARDA 1 AY HEDİYE
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {[
                            {
                                title: t('planBasicTitle'),
                                desc: t('planBasicDesc'),
                                features: [
                                    t('planBasicFeat1'),
                                    t('planBasicFeat2'),
                                    t('planBasicFeat3'),
                                    t('planBasicFeat4'),
                                    t('planBasicFeat5'),
                                    t('planBasicFeat6')
                                ],
                                color: "blue",
                                badge: "POPULAR"
                            },
                            {
                                title: t('planProTitle'),
                                desc: t('planProDesc'),
                                features: [
                                    t('planProFeat1'),
                                    t('planProFeat2'),
                                    t('planProFeat3'),
                                    t('planProFeat4'),
                                    t('planProFeat5'),
                                    t('planProFeat6')
                                ],
                                color: "emerald",
                                badge: "BEST VALUE",
                                featured: true
                            },
                            {
                                title: t('planEntTitle'),
                                desc: t('planEntDesc'),
                                features: [
                                    t('planEntFeat1'),
                                    t('planEntFeat2'),
                                    t('planEntFeat3'),
                                    t('planEntFeat4'),
                                    t('planEntFeat5'),
                                    t('planEntFeat6'),
                                    t('planEntFeat7')
                                ],
                                color: "slate",
                                badge: "CORPORATE"
                            }
                        ].map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                className={`relative group p-8 md:p-12 rounded-[3rem] border transition-all h-full flex flex-col ${plan.featured
                                    ? 'bg-slate-900 text-white border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] scale-105 z-10'
                                    : 'bg-white text-slate-900 border-slate-100 hover:border-blue-200 shadow-xl'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute -top-4 right-8 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${plan.featured ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">{plan.title}</h3>
                                <p className={`mb-8 font-medium italic ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                                <div className="space-y-4 mb-12 flex-grow">
                                    {plan.features.map((feat, fi) => (
                                        <div key={fi} className="flex items-center gap-3">
                                            <FaCheckCircle className={plan.featured ? 'text-emerald-400' : 'text-blue-600'} />
                                            <span className="font-bold text-sm md:text-base">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowDemoModal(true)}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.featured
                                        ? 'bg-white text-slate-900 hover:bg-emerald-400 hover:text-white'
                                        : 'bg-slate-900 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {t('startNow')}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center space-y-6">
                        <div className="inline-flex flex-wrap justify-center items-center gap-6 px-4">
                            <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-8 py-4 rounded-[2rem] shadow-sm group hover:scale-105 transition-transform duration-300">
                                <FaLayerGroup className="text-blue-600 text-3xl" />
                                <p className="text-blue-900 font-black text-sm md:text-base">
                                    {t('branchDiscountNote')}
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 border border-slate-200 px-8 py-4 rounded-[2rem] shadow-sm group hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center gap-4">
                                    <FaStar className="text-yellow-500 text-3xl animate-pulse" />
                                    <p className="text-slate-700 font-extrabold text-sm md:text-base">
                                        {t('refundNote')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI Calculator Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 10 }}
                        viewport={{ once: true }}
                        className="bg-[#0B1628] rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full"></div>
                        <h3 className="text-xl md:text-3xl font-black text-center mb-8 md:mb-12 relative z-10">Yatırım Geri Dönüş (ROI) Tahmini</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10 relative z-10">
                            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-[2rem] p-5 md:p-8 text-center backdrop-blur-sm">
                                <div className="text-3xl md:text-5xl font-black text-emerald-400 mb-1 md:mb-2">+%37</div>
                                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Hizmet Geliri Artışı</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-[2rem] p-5 md:p-8 text-center backdrop-blur-sm">
                                <div className="text-3xl md:text-5xl font-black text-blue-400 mb-1 md:mb-2">%50</div>
                                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Telefon Trafiği Azalması</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-[2rem] p-5 md:p-8 text-center backdrop-blur-sm col-span-2 md:col-span-1">
                                <div className="text-3xl md:text-5xl font-black text-pink-400 mb-1 md:mb-2">Sıfır</div>
                                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Operasyonel Hata</div>
                            </div>
                        </div>
                        <p className="text-center text-slate-400 italic text-sm font-medium relative z-10">
                            &quot; Mevcut müşteri verilerine göre: RoomXQR kullanımı ile operasyonel verimlilik artarken, aylık kâr ortalama %22 yükselmektedir. &quot;
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Fast Setup - Redesigned to match Image 2 */}
            <section className="py-12 md:py-16 bg-blue-600 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 border border-blue-100">
                                <FaRocket />
                                HIZLI VE SORUNSUZ KURULUM: SİZ HAZIRSANIZ BİZ HAZIRIZ
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                                Hızlı ve Sorunsuz Kurulum: <br /> Siz Hazırsanız Biz Hazırız
                            </h2>
                            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                Hantal ve yavaş kurulan eski sistemleri unutun. RoomXQR sadece bir linkle çalışır. Tek yapmanız gereken bize ulaşmak; tüm kurulum ve menü dijitalleştirme sürecini biz titizlikle hallediyoruz.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => setShowDemoModal(true)}
                                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
                                >
                                    HEMEN BAŞLAYIN
                                </button>
                                <a
                                    href="https://wa.me/436608682201"
                                    target="_blank"
                                    className="px-10 py-5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-3"
                                >
                                    <FaWhatsapp className="text-xl" /> WHATSAPP
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-blue-600 font-extrabold tracking-widest text-xs uppercase block mb-3"
                        >
                            {t('blogSectionBadge')}
                        </motion.span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            {t('blogSectionTitle')}
                        </h2>
                        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                id: 1,
                                title: t('blogPost1Title'),
                                desc: t('blogPost1Desc'),
                                category: t('blogCategoryTrends'),
                                image: "/images/blog/blog1.png",
                                date: "Mar 2026",
                                color: "text-blue-600"
                            },
                            {
                                id: 2,
                                title: t('blogPost2Title'),
                                desc: t('blogPost2Desc'),
                                category: t('blogCategoryTrends'),
                                image: "/images/blog/blog2.png",
                                date: "Feb 2026",
                                color: "text-purple-600"
                            },
                            {
                                id: 3,
                                title: t('blogPost3Title'),
                                desc: t('blogPost3Desc'),
                                category: t('blogCategoryTech'),
                                image: "/images/blog/blog3.png",
                                date: "Jan 2026",
                                color: "text-emerald-600"
                            }
                        ].map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all h-full flex flex-col"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-slate-900 border border-white/20 shadow-lg">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 md:p-10 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        <FaClock className="text-blue-500" /> {post.date}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-base leading-relaxed mb-10 line-clamp-3">
                                        {post.desc}
                                    </p>
                                    <div className="mt-auto">
                                        <button
                                            onClick={() => setActiveBlogPost(post.id)}
                                            className="flex items-center gap-3 font-black text-sm text-slate-900 group-hover:gap-5 transition-all hover:text-blue-600"
                                        >
                                            {t('blogReadMore')} <FaArrowRight className="text-blue-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* FAQ */}
            <section className="py-12 md:py-16 bg-white px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900">{t('faq')}</h2>
                        <p className="text-lg text-slate-500 font-medium">{t('faqDesc')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-slate-100 rounded-[2rem] bg-slate-50 overflow-hidden transition-all hover:shadow-md">
                                <button onClick={() => toggleFAQ(i)} className="w-full p-6 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg"><faq.icon /></div>
                                        <span className="font-bold text-base md:text-lg text-slate-900 leading-tight">{faq.question}</span>
                                    </div>
                                    <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFAQ === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white px-6 pb-6 text-slate-600 font-medium text-sm md:text-base leading-relaxed border-t border-slate-50">
                                            <div className="pt-4 px-4 md:px-10">{faq.answer}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Post Modal */}
            <AnimatePresence>
                {
                    activeBlogPost !== null && (() => {
                        const post = blogPostsContent.find(p => p.id === activeBlogPost);
                        if (!post) return null;
                        return (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                onClick={() => setActiveBlogPost(null)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="p-8 md:p-12">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{post.category}</span>
                                                <p className="text-slate-400 text-sm font-bold mt-2 flex items-center gap-2">
                                                    <FaClock className="text-blue-400" /> {post.date}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setActiveBlogPost(null)}
                                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight">{post.title}</h2>
                                        <div
                                            className="text-slate-600 leading-relaxed font-medium text-base"
                                            dangerouslySetInnerHTML={{ __html: post.content }}
                                        />
                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <button
                                                onClick={() => { setActiveBlogPost(null); setShowDemoModal(true); }}
                                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest"
                                            >
                                                Ücretsiz Demo Al
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })()
                }
            </AnimatePresence>

            {/* Footer */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                        <div className="lg:col-span-2">
                            <img src="/logo.png" alt="RoomXQR Logo" className="h-16 w-auto mb-8 filter brightness-0 invert" />
                            <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-md">{t('footerSlogan')}</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em]">{t('contactUs')}</h4>
                            <div className="space-y-4">
                                <a href="tel:+436608682201" className="flex items-center gap-4 text-slate-300 hover:text-white transition-all font-bold">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400"><FaPhone /></div>
                                    +43 660 868 22 01
                                </a>
                                <a href="mailto:info@roomxqr.com" className="flex items-center gap-4 text-slate-300 hover:text-white transition-all font-bold">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400"><FaEnvelope /></div>
                                    info@roomxqr.com
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em]">YASAL</h4>
                            <div className="space-y-3">
                                <a href="/gizlilik-politikasi" className="block text-slate-400 hover:text-white transition-all font-bold text-sm">Gizlilik Politikası</a>
                                <a href="/kullanim-kosullari" className="block text-slate-400 hover:text-white transition-all font-bold text-sm">Kullanım Koşulları</a>
                                <a href="/yasal-bilgiler" className="block text-slate-400 hover:text-white transition-all font-bold text-sm">Yasal Bilgiler</a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 text-center text-slate-600 text-sm font-bold">
                        © {new Date().getFullYear()} RoomXQR. Tüm hakları saklıdır.
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Action */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <a href="https://wa.me/436608682201" target="_blank" className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-all" aria-label="WhatsApp üzerinden bizimle iletişime geçin"><FaWhatsapp /></a>
            </div>

            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main >
    );
}
