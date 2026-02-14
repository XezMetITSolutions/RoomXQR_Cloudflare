'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic,
    FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket,
    FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown,
    FaBrain, FaCamera, FaGem, FaFire, FaHeart, FaGlobe, FaDesktop,
    FaArrowRight, FaCogs, FaCreditCard, FaLayerGroup
} from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import LandingLanguageToggle from '@/components/LandingLanguageToggle';
import DemoRequestModal from '@/components/DemoRequestModal';

export default function HomeContent() {
    const { t } = useLanguageStore();

    useEffect(() => {
        document.title = t('metaTitle');
    }, [t]);

    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

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
            <LandingLanguageToggle />

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
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{t('heroTitle1')}</span>
                        <br /><span className="text-white">{t('heroTitle2')}</span>
                        <br /><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('heroTitle3')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.4 }}
                        className="text-base md:text-xl mb-10 md:mb-12 text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium px-4"
                    >
                        🚀 <span className="text-white font-bold">{t('heroSubtitle1')}</span>
                        <br className="hidden md:block" />
                        <span className="text-slate-400 text-sm md:text-lg">{t('heroSubtitle2')}</span>
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

            {/* Premium Features - Prominent & Compact */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12 md:mb-16">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="text-blue-600 font-extrabold tracking-widest text-[10px] md:text-xs uppercase block mb-3"
                        >
                            {t('premiumServicesBadge') || 'PREMİUM ÖZELLİKLER'}
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
                            { icon: FaHeart, title: t('support247'), color: "bg-red-500", desc: t('valPropTrust') }
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

            {/* Success Stories Section - Scaled Down */}
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
                                        { label: t('valPropSatisfy'), icon: FaHeart, color: "text-pink-400" },
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
                                        { icon: FaHeart, color: "text-pink-400", pos: "top-1/2 -right-16 -translate-y-1/2" },
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

            {/* Marketing Grid - Scaled Down & Color Titles */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            {t('marketingSectionTitle')}
                        </h2>
                        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: FaUtensils, title: t('kitchenStatTitle'), desc: t('kitchenStatDesc'), color: "blue", badge: "Advanced" },
                            { icon: FaCreditCard, title: t('splitPaymentTitle'), desc: t('splitPaymentDesc'), color: "emerald", badge: "Exclusive" },
                            { icon: FaStar, title: t('socialGrowthTitle'), desc: t('socialGrowthDesc'), color: "orange", badge: "Growth" },
                            { icon: FaLayerGroup, title: t('multiBranchTitle'), desc: t('multiBranchDesc'), color: "purple", badge: "Enterprise" },
                            { icon: FaMagic, title: t('aiTitle'), desc: t('aiDesc'), color: "pink", badge: "AI Powered" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group relative bg-white p-6 md:p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all border border-slate-50 flex flex-col h-full"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                                    ${feature.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                        feature.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                            feature.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'
                                    } transition-transform group-hover:scale-110 shadow-sm`}>
                                    <feature.icon className="text-2xl" />
                                </div>
                                <div className="mb-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full 
                                        ${feature.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                            feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                                feature.color === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                                        }`}>
                                        {feature.badge}
                                    </span>
                                </div>
                                <h3 className={`text-lg md:text-xl font-black mb-4 tracking-tight leading-tight 
                                    ${feature.color === 'blue' ? 'text-blue-600' :
                                        feature.color === 'emerald' ? 'text-emerald-600' :
                                            feature.color === 'purple' ? 'text-purple-600' : 'text-pink-600'
                                    }`}>
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed mb-8 flex-grow">
                                    {feature.desc}
                                </p>
                                <button className="flex items-center gap-2 font-black text-xs md:text-sm text-slate-800 group-hover:gap-4 transition-all uppercase tracking-widest">
                                    {t('learnMore')} <FaArrowRight className={`
                                        ${feature.color === 'blue' ? 'text-blue-500' :
                                            feature.color === 'emerald' ? 'text-emerald-500' :
                                                feature.color === 'purple' ? 'text-purple-500' : 'text-pink-500'
                                        }`} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Management & Control - Simplified */}
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
                            { icon: FaFire, title: t('mgmtCampaignDrive'), color: "bg-orange-600" },
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

            {/* Waiter Calling Section */}
            <section className="py-16 md:py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-8 md:p-16 text-white relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none transition-transform hover:scale-110"><FaBell className="absolute top-10 right-10 text-[15rem] md:text-[20rem] rotate-12" /></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full inline-block text-[10px] md:text-xs font-black tracking-[0.2em] uppercase mb-6 md:mb-8 border border-white/20">{t('waiterCallMainTitle')}</div>
                                <h2 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight">{t('waiterCallTitle')}</h2>
                                <p className="text-lg md:text-xl text-emerald-50 leading-relaxed mb-8 md:mb-10 font-medium opacity-90">{t('waiterCallDesc')}</p>
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-[2rem] flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-600 text-2xl md:text-3xl shadow-xl"><FaCheckCircle /></div>
                                    <p className="text-base md:text-xl font-black leading-tight italic">"{t('waiterCallFooter')}"</p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="relative">
                                    <div className="w-56 h-56 md:w-72 md:h-72 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                                        <FaBell className="text-[6rem] md:text-[8rem] text-white animate-bounce" />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 bg-white text-emerald-600 p-4 rounded-2xl shadow-2xl font-black text-sm md:text-lg flex items-center gap-3"><FaMagic /> SMART CALL</div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Zero Error Section */}
            <section className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                        <span className="text-orange-400 font-black tracking-[0.2em] text-[10px] md:text-xs uppercase block mb-6">{t('zeroErrorSectionTitle')}</span>
                        <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">{t('qrToKitchenTitle')}</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">{t('qrToKitchenDesc')}</p>
                    </div>
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 relative justify-center">
                        {[
                            { step: "01", title: t('zeroErrorList1'), icon: FaQrcode, color: "bg-blue-600" },
                            { step: "02", title: t('zeroErrorList2'), icon: FaLayerGroup, color: "bg-orange-600" },
                            { step: "03", title: t('zeroErrorList3'), icon: FaUtensils, color: "bg-emerald-600" },
                            { step: "04", title: t('zeroErrorList4'), icon: FaRocket, color: "bg-pink-600" }
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
                                <div className={`${item.color} w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl shadow-2xl`}><item.icon /></div>
                                <h4 className="text-base md:text-lg font-black leading-tight">{item.title}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extra Income - Compact */}
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
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 shadow-xl"><FaGem /></div>
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
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-lg md:text-xl font-black italic"><FaRocket className="text-emerald-400" /> "{t('noChangeFooter')}"</div>
                        </motion.div>
                    </div>
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
                            {t('annualGift')}
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
                                    {plan.price !== 'Custom' && plan.price !== 'Özel' && <span className="text-sm font-bold opacity-60 ml-2">TL</span>}
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

                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-black mb-10 text-center tracking-tight">{t('roiTitle')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                                    <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10">
                                        <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-3">{t('roiGrowth')}</div>
                                        <div className="text-lg font-bold text-slate-300 uppercase tracking-widest">{t('roiGrowthSub')}</div>
                                    </div>
                                    <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10">
                                        <div className="text-4xl md:text-5xl font-black text-blue-400 mb-3">{t('roiEfficiency')}</div>
                                        <div className="text-lg font-bold text-slate-300 uppercase tracking-widest">{t('roiEfficiencySub')}</div>
                                    </div>
                                </div>
                                <p className="text-center text-slate-400 font-medium italic mb-2 px-4 italic leading-relaxed">
                                    " {t('roiNote')} "
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fast Setup Section */}
            <section className="py-16 bg-blue-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full -ml-36 -mb-36 blur-3xl"></div>
                </div>
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
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                                >
                                    {t('startNow')}
                                </button>
                                <a
                                    href="https://wa.me/436608682201"
                                    target="_blank"
                                    className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
                                >
                                    <FaWhatsapp className="text-base" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Reward Program Mini Section */}
                <div className="mt-12 container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FaStar className="text-9xl rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                                    {t('referralProgramTitle')}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black mb-4">{t('referralPromoLine')}</h3>
                                <p className="text-indigo-100 font-medium">{t('referralProgramDesc')}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <a
                                    href="https://wa.me/436608682201"
                                    target="_blank"
                                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg inline-block"
                                >
                                    {t('contactUs')}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
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

            {/* Footer */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-16">
                        <div>
                            <div className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">RestXQr</div>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-md">{t('footerSlogan')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">{t('contactUs')}</h4>
                                <div className="space-y-4">
                                    <a href="tel:+436608682201" className="flex items-center gap-4 text-slate-300 hover:text-white transition-all font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400"><FaPhone /></div>
                                        +43 660 868 22 01
                                    </a>
                                    <div className="flex items-center gap-4 text-slate-300 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400"><FaGlobe /></div>
                                        restxqr.com
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">{t('legalLinkSection')}</h4>
                                <div className="flex flex-col gap-4 text-slate-400 font-bold">
                                    <Link href="/datenschutz" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
                                    <Link href="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
                                    <Link href="/impressum" className="hover:text-white transition-colors">{t('legalInfo')}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Action */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <a href="https://wa.me/436608682201" target="_blank" className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-all"><FaWhatsapp /></a>
            </div>

            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main>
    );
}
