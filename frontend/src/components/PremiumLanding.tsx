'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic,
    FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket,
    FaShieldAlt, FaStar, FaPhone, FaChevronDown,
    FaBrain, FaGlobe, FaDesktop, FaLaptop, FaPrint, FaCreditCard as FaCreditCardIcon,
    FaArrowRight, FaCogs, FaCreditCard, FaLayerGroup, FaWhatsapp, FaEnvelope, FaTimes
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
<p class="mb-4">AI tabanlı çeviri sistemleri, misafirlerin tarayıcı diline göre içerikleri otomatik olarak yerelleştirir. 9 dil desteğiyle otel personelinin dil bariyerleri olmaksızın küresel misafirlerle sorunsuz iletişim kurması sağlanır.</p>
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
            <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-[#0B0F1A] text-white overflow-hidden pt-12 md:pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center px-5 py-2.5 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 mb-6 md:mb-8 shadow-2xl"
                    >
                        <FaStar className="text-yellow-400 mr-2 text-sm animate-pulse" />
                        <span className="text-xs md:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-yellow-200 to-orange-300 bg-clip-text text-transparent">
                            {t('heroBadge')}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-[1.1] tracking-tight"
                    >
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{t('newIntroTitle')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.4 }}
                        className="text-base md:text-xl mb-10 md:mb-12 text-slate-300 leading-relaxed max-w-4xl mx-auto font-medium px-4"
                    >
                        {t('newIntroDesc')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 px-4 mb-20"
                    >
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(37,99,235,0.25)]"
                        >
                            <span className="relative flex items-center justify-center gap-3">
                                <FaUsers className="text-xl" /> {t('requestDemo')}
                            </span>
                        </button>
                        <a
                            href="https://wa.me/436608682201"
                            target="_blank"
                            className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 text-white flex items-center justify-center gap-3"
                        >
                            <FaRocket className="text-xl text-emerald-400" /> {t('startNow')}
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-xl"
                >
                    <FaChevronDown />
                </motion.div>
            </section>

            {/* Premium Features */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12 md:mb-16">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="text-blue-600 font-extrabold tracking-widest text-[10px] md:text-xs uppercase block mb-3"
                        >
                            {t('premiumServicesBadge')}
                        </motion.span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                            {t('premiumServices')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { icon: FaQrcode, title: t('qrMenuSystem'), color: "bg-orange-500", desc: t('valPropDigital') },
                            { icon: FaShoppingCart, title: t('orderManagement'), color: "bg-blue-500", desc: t('valPropSpeed') },
                            { icon: FaBrain, title: t('aiTitle'), color: "bg-purple-500", desc: t('valPropSatisfy') },
                            { icon: FaChartLine, title: t('detailedReporting'), color: "bg-green-500", desc: t('valPropProfit') },
                            { icon: FaGlobe, title: t('multiLangTitle'), color: "bg-indigo-500", desc: t('valPropTrust') },
                            { icon: FaBell, title: t('marketingAdsTitle'), color: "bg-yellow-500", desc: t('adIncomeTitle') },
                            { icon: FaCogs, title: t('allInOneTitle'), color: "bg-slate-600", desc: t('valPropDigital') },
                            { icon: FaChartLine, title: t('support247'), color: "bg-red-500", desc: t('valPropTrust') }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.03, duration: 0.4 }}
                                className="flex flex-col items-center bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
                            >
                                <div className={`${s.color} w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-xl md:text-3xl mb-4 md:mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                                    <s.icon />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-center text-slate-900 uppercase tracking-wider mb-1 px-2">{s.title}</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{s.desc}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
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

                                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12">
                                    {[
                                        { label: t('valPropSatisfy'), icon: FaStar, color: "text-pink-400" },
                                        { label: t('valPropProfit'), icon: FaChartLine, color: "text-emerald-400" },
                                        { label: t('valPropStaff'), icon: FaUsers, color: "text-blue-400" },
                                        { label: t('valPropSpeed'), icon: FaRocket, color: "text-orange-400" },
                                        { label: t('valPropDigital'), icon: FaDesktop, color: "text-purple-400" },
                                        { label: t('valPropTrust'), icon: FaShieldAlt, color: "text-cyan-400" }
                                    ].map((res, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                            <res.icon className={`${res.color} text-lg md:text-xl`} />
                                            <span className="text-white font-bold text-xs md:text-sm tracking-tight">{res.label}</span>
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
                                    <div className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase mb-1 tracking-widest">{t('satisfiedClientsLabel')}</div>
                                    <div className="text-white text-2xl md:text-3xl font-black">500+</div>
                                </div>
                                <div className="bg-emerald-600/10 backdrop-blur-3xl border border-emerald-500/20 p-5 rounded-[2rem] text-right">
                                    <div className="text-emerald-400 text-[8px] md:text-[10px] font-black uppercase mb-1 tracking-widest">{t('averageGrowthLabel')}</div>
                                    <div className="text-white text-2xl md:text-3xl font-black">+35%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Misafir & İşletme Deneyimi */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Misafir Tarafı */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl"
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mb-8 shadow-lg">
                                <FaUsers />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                                {t('guestExperienceTitle')}
                            </h2>
                            <p className="text-lg text-slate-600 font-bold mb-8 italic">
                                {t('guestExperienceSubtitle')}
                            </p>
                            <div className="space-y-6">
                                {[
                                    { icon: FaShoppingCart, text: t('guestExp1'), color: "text-blue-500" },
                                    { icon: FaLayerGroup, text: t('guestExp2'), color: "text-purple-500" },
                                    { icon: FaBell, text: t('guestExp3'), color: "text-orange-500" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:scale-[1.02]">
                                        <item.icon className={`${item.color} text-2xl mt-1 shrink-0`} />
                                        <p className="text-slate-700 font-medium text-lg leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* İşletme Tarafı */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#0B0F1A] rounded-[3rem] p-8 md:p-12 text-white border border-white/5 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-8 shadow-lg shadow-emerald-500/20">
                                    <FaChartLine />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                                    {t('businessBenefitsTitle')}
                                </h2>
                                <p className="text-lg text-slate-400 font-bold mb-8 italic">
                                    {t('businessBenefitsDesc')}
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { icon: FaRocket, text: t('businessBenefit1'), color: "text-emerald-400" },
                                        { icon: FaStar, text: t('businessBenefit2'), color: "text-blue-400" },
                                        { icon: FaCheckCircle, text: t('businessBenefit3'), color: "text-cyan-400" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition-all hover:scale-[1.02]">
                                            <item.icon className={`${item.color} text-2xl mt-1 shrink-0`} />
                                            <p className="text-slate-200 font-medium text-lg leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Karşılaştırma Tablosu */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">RoomXQR'ın Farkı</h2>
                        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-blue-600 mb-6 flex items-center gap-3">
                                <FaUsers /> {t('whyGuestTitle')}
                            </h3>
                            {[t('whyGuest1'), t('whyGuest2'), t('whyGuest3')].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm font-bold text-slate-700">
                                    <FaCheckCircle className="text-emerald-500" /> {item}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-emerald-600 mb-6 flex items-center gap-3">
                                <FaCogs /> {t('whyBusinessTitle')}
                            </h3>
                            {[t('whyBusiness1'), t('whyBusiness2'), t('whyBusiness3')].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm font-bold text-slate-700">
                                    <FaCheckCircle className="text-blue-500" /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Management & Control */}
            <section className="py-16 md:py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                        <span className="text-blue-600 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-4">{t('mgmtControlTitle')}</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{t('mgmtTitle')}</h2>
                        <p className="text-lg text-slate-500 font-medium">{t('mgmtNoTechRequired')} 🛠️</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { icon: FaCogs, title: t('mgmtMenuUpdate'), color: "bg-blue-600" },
                            { icon: FaMagic, title: t('mgmtStockHide'), color: "bg-emerald-600" },
                            { icon: FaChartLine, title: t('mgmtCampaignDrive'), color: "bg-orange-600" },
                            { icon: FaBell, title: t('mgmtAnnounceDirect'), color: "bg-purple-600" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-md border border-slate-100 flex flex-col items-center text-center"
                            >
                                <div className={`${item.color} w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl mb-4 md:mb-6 shadow-lg`}><item.icon /></div>
                                <h4 className="text-sm md:text-lg font-black text-slate-900 leading-tight">{item.title}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dijital Concierge Section */}
            <section className="py-16 md:py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <span className="inline-block bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase mb-4">DİJİTAL CONCİERGE</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                                Misafirinizin Her İhtiyacı, <span className="text-emerald-600">Tek QR'da</span>
                            </h2>
                            <p className="text-lg text-slate-500 font-medium max-w-3xl mx-auto">
                                Gerçek bir concierge gibi çalışan dijital asistan: Otel içi hizmetlerden otel dışı turizm imkânlarına kadar her şeyi kapsar — ve her yönlendirme size <strong className="text-emerald-600">yeni bir gelir kapısı</strong> açar.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Otel İçi */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-500/20">
                                        <FaBell />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Otel İçi Hizmetler</h3>
                                    <p className="text-slate-400 font-medium mb-6 text-sm">Operasyonel yükünüzü %50 azaltır</p>
                                    <div className="space-y-3">
                                        {[
                                            { icon: FaShoppingCart, text: 'Oda servisi & menü siparişi — tek tıkla mutfağa', highlight: true },
                                            { icon: FaMagic, text: 'Havlu, temizlik, ek malzeme talepleri — kat hizmetlerine anında', highlight: false },
                                            { icon: FaCogs, text: 'Teknik arıza bildirimi — teknik servise direkt', highlight: false },
                                            { icon: FaBell, text: 'Resepsiyona çevrimiçi mesaj — telefon trafiği sıfıra iner', highlight: true },
                                            { icon: FaStar, text: 'Otel etkinlikleri & kampanya duyuruları — anında tüm odalara', highlight: false },
                                            { icon: FaCheckCircle, text: 'Memnuniyet anketi & Google yorum yönlendirme', highlight: false },
                                        ].map((item, i) => (
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}>
                                                <item.icon className={`mt-0.5 shrink-0 text-sm ${item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                <span className={`text-sm font-bold ${item.highlight ? 'text-white' : 'text-slate-300'}`}>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Otel Dışı & Gelir */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col gap-6"
                            >
                                {/* Dış Concierge */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex-1">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl mb-5">
                                            <FaGlobe />
                                        </div>
                                        <h3 className="text-xl font-black mb-1">Otel Dışı Turizm Yönlendirme</h3>
                                        <p className="text-blue-200 text-sm font-bold mb-5">Her yönlendirme = Komisyon geliri</p>
                                        <div className="space-y-2">
                                            {[
                                                '🚗 Havalimanı & şehir içi transfer rezervasyonu',
                                                '🗺️ Şehir turu & aktivite organizasyonu',
                                                '🍽️ Restoran rezervasyonu (komisyon ile)',
                                                '💆 SPA, masaj, wellness yönlendirme',
                                                '🎭 Etkinlik & eğlence bilet yönlendirme',
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-white/90 font-bold">
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Gelir Vurgusu */}
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-xl shrink-0">
                                            <FaChartLine />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">Yeni Komisyon Gelir Kanalı</h4>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Misafiri dışarıya kaçırmadan tutun. Her turizm yönlendirmesi, transfer ve aktivite rezervasyonundan otomatik komisyon kazanın — <strong>ek personel gerekmez.</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-10 bg-emerald-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div>
                                <p className="font-black text-xl mb-1">Hizmet akışınızı dijitalleştirin</p>
                                <p className="text-emerald-100 font-medium text-sm">Misafir taleplerini saniyeler içinde ilgili birime aktarın, operasyonel yükü kökten azaltın.</p>
                            </div>
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="shrink-0 px-8 py-4 bg-white text-emerald-700 font-black rounded-2xl hover:scale-105 transition-all shadow-lg text-sm uppercase tracking-widest"
                            >
                                Demo Al
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Zero Error Section */}
            <section className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                        <span className="text-orange-400 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-6">{t('zeroErrorSectionTitle')}</span>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">{t('qrToKitchenTitle')}</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                            Talepler resepsiyonu meşgul etmeden doğrudan ilgili departmana (Kat Hizmetleri, Teknik Servis, Restoran vb.) aktarılır.
                        </p>
                    </div>
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 relative justify-center">
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
                                className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center"
                            >
                                <span className="absolute top-4 left-6 text-white/10 text-5xl font-black font-mono italic">{item.step}</span>
                                <div className={`${item.color} w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-2xl`}><item.icon /></div>
                                <h4 className="text-base md:text-lg font-black leading-tight mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-xs font-bold">{item.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extra Income */}
            <section className="py-16 md:py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-4 relative">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    whileHover={{ y: -10 }}
                                    className="aspect-square bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center border border-slate-100 shadow-lg relative z-10"
                                >
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 shadow-xl"><FaChartLine /></div>
                                    <span className="text-slate-900 font-black text-lg leading-tight uppercase tracking-tight">{t('passiveIncomeLabel')}</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    whileHover={{ y: -10 }}
                                    className="aspect-square bg-slate-900 text-white rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center shadow-xl -mt-8 md:-mt-12 relative z-10"
                                >
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 shadow-xl"><FaStar /></div>
                                    <span className="font-black text-lg leading-tight uppercase tracking-tight">{t('premiumSpaceLabel')}</span>
                                </motion.div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <span className="text-purple-600 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-6 px-4 py-2 bg-purple-50 rounded-full w-fit">
                                {t('adIncomeTitle')}
                            </span>
                            <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] tracking-tight">{t('adIncomeSubtitle')}</h2>
                            <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed mb-10 md:mb-12">{t('adIncomeDesc')}</p>
                            <div className="flex flex-wrap gap-3">
                                {[t('adTag1'), t('adTag2'), t('adTag3'), t('adTag4')].map((tag, i) => (
                                    <span key={i} className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border border-slate-200">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-16 md:py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 md:p-20 text-white text-center relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="relative z-10">
                            <span className="text-blue-200 font-black tracking-[0.3em] text-[10px] md:text-xs uppercase block mb-6">{t('noChangeTitle')}</span>
                            <h2 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">{t('noChangeSubtitle')}</h2>
                            <p className="text-lg md:text-2xl text-blue-100/80 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">{t('noChangeDesc')}</p>
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-lg md:text-xl font-black shadow-2xl">
                                <FaRocket className="text-emerald-400" /> {t('finalSlogan')}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Hardware Section */}
            <section className="py-16 md:py-20 bg-blue-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="text-center mb-10"
                    >
                        <p className="text-blue-700 font-black text-lg md:text-xl mb-6">
                            Donanım ihtiyacınız mı var? İhtiyaç duyduğunuzda tam paket sunuyoruz.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { icon: FaLaptop, label: 'POS Bilgisayarları' },
                                { icon: FaPrint, label: 'Adisyon & Fiş Yazıcıları' },
                                { icon: FaCreditCardIcon, label: 'Ödeme Cihazları' }
                            ].map((item, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setShowDemoModal(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white text-blue-900 font-black rounded-2xl shadow-sm transition-all text-sm md:text-base"
                                >
                                    <item.icon className="text-lg" />
                                    {item.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-white overflow-hidden">
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
                                price: t('planBasicPrice'),
                                desc: t('planBasicDesc'),
                                features: [t('planBasicFeat1'), t('planBasicFeat2'), t('planBasicFeat3')],
                                color: "blue",
                                badge: "POPULAR"
                            },
                            {
                                title: t('planProTitle'),
                                price: t('planProPrice'),
                                desc: t('planProDesc'),
                                features: [t('planProFeat1'), t('planProFeat2'), t('planProFeat3')],
                                color: "emerald",
                                badge: "BEST VALUE",
                                featured: true
                            },
                            {
                                title: t('planEntTitle'),
                                price: t('planEntPrice'),
                                desc: t('planEntDesc'),
                                features: [t('planEntFeat1'), t('planEntFeat2'), t('planEntFeat3')],
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
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{plan.title}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl md:text-5xl font-black">{plan.price}</span>
                                </div>
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

            {/* Fast Setup */}
            <section className="py-16 bg-blue-600 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                                <FaRocket />
                                {t('instantSetupTitle')}
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                {t('instantSetupTitle')}
                            </h2>
                            <p className="text-base text-slate-600 font-medium leading-relaxed mb-8">
                                {t('instantSetupDesc')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    onClick={() => setShowDemoModal(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                                >
                                    {t('startNow')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
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

            {/* Power Section - Neden RoomXQR */}
            <section className="py-20 bg-[#0B0F1A] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-white/5 border border-white/10 text-blue-400 px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase mb-4">RAKAMLARLA ROOMXQR</span>
                        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                            Piyasadaki Basit QR Menüler <span className="text-red-400 line-through opacity-60">Sadece Menü Gösterir.</span>
                        </h2>
                        <p className="text-xl text-blue-300 font-black max-w-3xl mx-auto">
                            RoomXQR otelinizi baştan sona dijitalleştirir — Menü, talep, duyuru, concierge, raporlama <span className="text-emerald-400">hepsi bir arada.</span>
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
                                className={`bg-gradient-to-br ${stat.color} rounded-[2rem] p-6 text-center shadow-2xl`}
                            >
                                <div className="text-3xl md:text-4xl font-black mb-2">{stat.number}</div>
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wide leading-tight">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {[
                            {
                                icon: FaDesktop,
                                color: 'bg-blue-600',
                                title: 'Cebinizdeki Otel Yönetimi',
                                desc: 'Menüleri tek tıkla oluşturun, güncelleyin. Duyuruları anında tüm odalara gönderin. Gelir-gider detayları, satış raporları, personel performansı — her şey tek ekranda, her yerden.'
                            },
                            {
                                icon: FaLayerGroup,
                                color: 'bg-emerald-600',
                                title: 'Ek Gelir Patlaması',
                                desc: 'Restoran satışını uçurun + QR reklam alanı açın + concierge yönlendirmelerinden komisyon kazanın. Pasif gelir kapısı olarak çoklu gelir modeli tek platformda.'
                            },
                            {
                                icon: FaShieldAlt,
                                color: 'bg-purple-600',
                                title: 'Sıfır Risk, Aynı Gün Devreye',
                                desc: '15 gün tamamen ücretsiz deneyin — beğenmezseniz tek kuruş ödemeden bırakın. Mevcut altyapınıza dokunmadan, sadece QR kodları yerleştirin, aynı gün çalışsın.'
                            },
                            {
                                icon: FaUsers,
                                color: 'bg-orange-600',
                                title: 'Misafir Bağımlılığı Yaratır',
                                desc: 'Misafir tek QR ile kendi dilinde karşılanır, her şeye ulaşır. Duyurularla haberdar olur, concierge ile ihtiyaçları karşılanır — otelinizden vazgeçemiyor!'
                            },
                            {
                                icon: FaCogs,
                                color: 'bg-slate-600',
                                title: 'Her Otele Özel Entegrasyon',
                                desc: 'Sistemi sizin ihtiyaçlarınıza göre özelleştiriyoruz. Mevcut PMS/POS sistemlerinizde hiçbir değişiklik yapmadan entegre olur — hazır paket değil, size özel.'
                            },
                            {
                                icon: FaChartLine,
                                color: 'bg-pink-600',
                                title: 'Yorucu Excel\'ler Bitti',
                                desc: 'Kâğıt işleri, manuel takip, hatalı sipariş — hepsi bitti. Hangi hizmetin popüler olduğunu görün, personel hız raporları çekin, veriye dayalı yönetin.'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group"
                            >
                                <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon />
                                </div>
                                <h3 className="text-lg font-black mb-3">{item.title}</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 blur-[60px] rounded-full"></div>
                        <h3 className="text-2xl md:text-4xl font-black mb-4 relative z-10">
                            15 Gün Ücretsiz Deneyin — Risksiz Başlayın!
                        </h3>
                        <p className="text-blue-100 font-medium mb-8 max-w-2xl mx-auto relative z-10">
                            Beğenmezseniz tek kuruş ödemeden bırakın. Kaybedecek hiçbir şeyiniz yok — kazanacak çok şeyiniz var.
                        </p>
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="relative z-10 px-10 py-5 bg-white text-blue-700 font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest"
                        >
                            🚀 Ücretsiz Demo Al
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900">{t('faq')}</h2>
                        <p className="text-lg text-slate-500 font-medium">{t('faqDesc')}</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-slate-100 rounded-[2rem] bg-slate-50 overflow-hidden transition-all hover:shadow-md">
                                <button onClick={() => toggleFAQ(i)} className="w-full p-6 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg"><faq.icon /></div>
                                        <span className="font-bold text-lg text-slate-900">{faq.question}</span>
                                    </div>
                                    <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFAQ === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white px-6 pb-6 text-slate-600 font-medium text-base leading-relaxed border-t border-slate-50">
                                            <div className="pt-4 px-10">{faq.answer}</div>
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
                {activeBlogPost !== null && (() => {
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
                })()}
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
        </main>
    );
}
