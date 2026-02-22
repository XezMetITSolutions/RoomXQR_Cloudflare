"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Sparkles,
    BellOff,
    ArrowLeft,
    Bath,
    Footprints,
    Bed,
    Droplet,
    GlassWater,
    CheckCircle,
    MessageSquare,
    Plus,
    Trash2,
    Wrench,
    Tv,
    PlugZap,
    ThermometerSnowflake,
    Wifi,
    Lock,
    Waves,
    Lightbulb,
    Wind
} from "lucide-react";
import { ApiService } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';

import { motion, AnimatePresence } from "framer-motion";

interface CleaningClientProps {
    roomId: string;
    initialLang?: string;
}

export default function CleaningClient({ roomId, initialLang }: CleaningClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addNotification } = useNotifications();
    const { getTranslation, setLanguage } = useLanguageStore();
    const theme = useThemeStore();

    useEffect(() => {
        if (initialLang) {
            setLanguage(initialLang);
        }
    }, [initialLang, setLanguage]);

    // Quick selection items for cleaning
    const quickItems = [
        { name: "Havlu", nameKey: "quick.towel", icon: Bath, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Terlik", nameKey: "quick.slippers", icon: Footprints, color: "text-emerald-500", bg: "bg-emerald-50" },
        { name: "Yastık", nameKey: "quick.pillow", icon: Bed, color: "text-purple-500", bg: "bg-purple-50" },
        { name: "Battaniye", nameKey: "quick.blanket", icon: Bed, color: "text-indigo-500", bg: "bg-indigo-50" },
        { name: "Şampuan", nameKey: "quick.shampoo", icon: Droplet, color: "text-cyan-500", bg: "bg-cyan-50" },
        { name: "Su", nameKey: "quick.water", icon: GlassWater, color: "text-blue-400", bg: "bg-blue-50" }
    ];

    const maintenanceItems = [
        { name: "Klima/Isıtıcı", nameKey: "maintenance.heater", icon: ThermometerSnowflake, color: "text-orange-500", bg: "bg-orange-50" },
        { name: "Televizyon", nameKey: "maintenance.tv", icon: Tv, color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Kumanda", nameKey: "maintenance.remote", icon: Tv, color: "text-slate-500", bg: "bg-slate-50" },
        { name: "Minibar", nameKey: "maintenance.minibar", icon: Wind, color: "text-cyan-500", bg: "bg-cyan-50" },
        { name: "Işık/Lamba", nameKey: "maintenance.light", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-50" },
        { name: "Duş/Musluk", nameKey: "maintenance.shower", icon: Droplet, color: "text-blue-400", bg: "bg-blue-50" },
        { name: "Sıcak Su", nameKey: "maintenance.water", icon: Bath, color: "text-blue-400", bg: "bg-blue-50" },
        { name: "WiFi Sorunu", nameKey: "maintenance.wifi", icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-50" },
        { name: "Kasa", nameKey: "maintenance.safe", icon: Lock, color: "text-slate-500", bg: "bg-slate-50" },
        { name: "Gider/Lavabo", nameKey: "maintenance.drain", icon: Waves, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Tuvalet/Klozet", nameKey: "maintenance.toilet", icon: Bath, color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "Kapı/Kilit", nameKey: "maintenance.door", icon: Lock, color: "text-red-400", bg: "bg-red-50" },
        { name: "Priz/Elektrik", nameKey: "maintenance.plug", icon: PlugZap, color: "text-red-500", bg: "bg-red-50" },
        { name: "Mobilya/Yatak", nameKey: "maintenance.furniture", icon: Bed, color: "text-amber-700", bg: "bg-amber-50" }
    ];

    const [selectedItem, setSelectedItem] = useState("");
    const [selectedItemKey, setSelectedItemKey] = useState("");
    const [amount, setAmount] = useState(1);
    const [note, setNote] = useState("");
    const [sending, setSending] = useState<string | null>(null);

    // Initialize activeTab from query param if available
    const initialTab = searchParams.get('tab') as 'housekeeping' | 'maintenance';
    const [activeTab, setActiveTab] = useState<'housekeeping' | 'maintenance'>(
        (initialTab === 'housekeeping' || initialTab === 'maintenance') ? initialTab : 'housekeeping'
    );

    const safeGetTranslation = (key: string, fallback: string = '') => {
        try {
            return getTranslation ? getTranslation(key) : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const handleQuickSelect = (itemName: string, key: string) => {
        if (selectedItemKey === key) {
            setSelectedItem("");
            setSelectedItemKey("");
        } else {
            setSelectedItem(itemName);
            setSelectedItemKey(key);
            setAmount(1);
        }
    };

    const sendRequest = async (type: 'housekeeping' | 'general', description: string, isDnd: boolean = false) => {
        const requestId = isDnd ? 'dnd' : (selectedItemKey || 'instant');
        setSending(requestId);
        try {
            await ApiService.createGuestRequest({
                roomId: roomId,
                type: type,
                priority: isDnd ? 'high' : 'medium',
                status: 'pending',
                description: description,
            });

            if (isDnd) {
                addNotification(
                    'success',
                    safeGetTranslation('cleaning.dnd_title', 'Rahatsız Etmeyin'),
                    safeGetTranslation('cleaning.dnd_message', 'Talebiniz alınmıştır. Odanız rahatsız edilmeyecektir.')
                );
            } else {
                addNotification(
                    'success',
                    safeGetTranslation('notifications.housekeeping_title', 'Temizlik Talebi'),
                    safeGetTranslation('notifications.request_sent', 'Talebiniz başarıyla iletildi.')
                );
            }

            // Reset form
            setSelectedItem("");
            setSelectedItemKey("");
            setAmount(1);
            setNote("");
        } catch (error) {
            console.error('Error sending request:', error);
            addNotification(
                'warning',
                safeGetTranslation('errors.error', 'Hata'),
                safeGetTranslation('errors.request_failed', 'İstek gönderilemedi.')
            );
        } finally {
            setSending(null);
        }
    };

    const handleQuickItemSubmit = () => {
        if (!selectedItem) return;
        const desc = activeTab === 'housekeeping'
            ? `${amount} x ${selectedItemKey || selectedItem} ${note ? `(${note})` : ''}`
            : `${selectedItemKey || selectedItem} ${note ? `(${note})` : ''}`;
        sendRequest(activeTab === 'housekeeping' ? 'housekeeping' : 'general', desc);
    };

    return (
        <div className="min-h-screen pb-12" style={{ background: '#F8FAFC' }}>
            {/* Premium Header */}
            <div className="relative h-48 w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 scale-105"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10" />

                <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white active:scale-90 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                        {safeGetTranslation('cleaning.title', 'Guest Services')}
                    </h1>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md inline-block px-3 py-1 rounded-full border border-white/20">
                        {activeTab === 'housekeeping' ? safeGetTranslation('room.housekeeping', 'Housekeeping') : safeGetTranslation('room.maintenance', 'Technical Support')}
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-4 relative z-30">
                {/* Main Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!!sending}
                        onClick={() => sendRequest('housekeeping', safeGetTranslation('cleaning.request_cleaning', 'Oda Temizliği İsteniyor'))}
                        className="bg-white p-5 rounded-3xl shadow-xl shadow-blue-500/5 border border-blue-50 flex flex-col items-center justify-center transition-all disabled:opacity-50"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                            {sending === 'instant' ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-7 h-7 text-white" />
                            )}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                            {safeGetTranslation('cleaning.clean_my_room', 'Odamı Temizle')}
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!!sending}
                        onClick={() => sendRequest('housekeeping', safeGetTranslation('cleaning.dnd', 'DO NOT DISTURB'), true)}
                        className="bg-white p-5 rounded-3xl shadow-xl shadow-red-500/5 border border-red-50 flex flex-col items-center justify-center transition-all disabled:opacity-50"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mb-3 shadow-lg shadow-red-500/30">
                            {sending === 'dnd' ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <BellOff className="w-7 h-7 text-white" />
                            )}
                        </div>
                        <span className="font-bold text-red-600 text-sm">
                            {safeGetTranslation('cleaning.dnd', 'Rahatsız Etmeyin')}
                        </span>
                    </motion.button>
                </div>

                {/* Tab Selection */}
                <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-[2rem] border border-gray-200 flex mb-6 shadow-sm">
                    <button
                        onClick={() => { setActiveTab('housekeeping'); setSelectedItem(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.75rem] font-bold text-sm transition-all ${activeTab === 'housekeeping' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        {safeGetTranslation('room.housekeeping', 'İstekler')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('maintenance'); setSelectedItem(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.75rem] font-bold text-sm transition-all ${activeTab === 'maintenance' ? 'bg-white shadow-xl text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Wrench className="w-4 h-4" />
                        {safeGetTranslation('room.maintenance', 'Teknik')}
                    </button>
                </div>

                {/* Quick Selection Grid */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-black text-gray-800 mb-5 pl-2">
                        {activeTab === 'housekeeping'
                            ? safeGetTranslation('cleaning.need_something', 'Bir şeye ihtiyacınız mı var?')
                            : safeGetTranslation('maintenance.title', 'Bir sorun mu var?')}
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-3 gap-3"
                        >
                            {(activeTab === 'housekeeping' ? quickItems : maintenanceItems).map((item) => (
                                <button
                                    key={item.nameKey}
                                    onClick={() => handleQuickSelect(safeGetTranslation(item.nameKey, item.name), item.nameKey)}
                                    className={`relative flex flex-col items-center p-4 rounded-3xl transition-all border group ${selectedItemKey === item.nameKey
                                        ? 'border-blue-500 bg-blue-50/50 shadow-inner'
                                        : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-100'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-2 group-active:scale-90 transition-transform`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold text-center leading-tight ${selectedItemKey === item.nameKey ? 'text-blue-700' : 'text-gray-600'}`}>
                                        {safeGetTranslation(item.nameKey, item.name)}
                                    </span>
                                    {selectedItemKey === item.nameKey && (
                                        <motion.div
                                            layoutId="selected-indicator"
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-white"
                                        >
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Expand Detail Form */}
                    <AnimatePresence>
                        {selectedItem && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden border-t border-gray-100 pt-6"
                            >
                                <div className="flex items-center justify-between mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Seçilen</span>
                                        <span className="text-base font-black text-gray-800">{selectedItem}</span>
                                    </div>

                                    {activeTab === 'housekeeping' && (
                                        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                                            <button
                                                onClick={() => setAmount(Math.max(1, amount - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-800 font-black hover:bg-gray-200 active:scale-90 transition-all"
                                            >
                                                -
                                            </button>
                                            <span className="text-lg font-black w-4 text-center text-blue-600">{amount}</span>
                                            <button
                                                onClick={() => setAmount(Math.min(10, amount + 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-800 font-black hover:bg-gray-200 active:scale-90 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder={safeGetTranslation('cleaning.add_note', 'Not ekle (opsiyonel)...')}
                                            className="w-full p-4 rounded-3xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none text-gray-700 leading-relaxed"
                                            rows={2}
                                        />
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        disabled={!!sending}
                                        onClick={handleQuickItemSubmit}
                                        className="w-full py-4 rounded-2xl font-black text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        style={{
                                            background: activeTab === 'housekeeping'
                                                ? 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
                                                : 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
                                        }}
                                    >
                                        {sending === (selectedItemKey || 'instant') ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                {safeGetTranslation('cleaning.order_now', 'Hemen Talep Et')}
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Custom Note Section */}
                {!selectedItem && (
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4 pl-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-lg font-black text-gray-800">
                                {safeGetTranslation('room.request_details', 'Özel İstek')}
                            </h2>
                        </div>

                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={safeGetTranslation('concierge.custom_placeholder', 'Eklemek istediğiniz notu buraya yazın...')}
                            className="w-full p-5 rounded-3xl bg-gray-50 border border-gray-100 text-sm mb-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all min-h-[120px] text-gray-700"
                        />

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (!note.trim()) return;
                                sendRequest(activeTab === 'housekeeping' ? 'housekeeping' : 'general', note);
                            }}
                            disabled={!note.trim() || !!sending}
                            className="w-full py-4 rounded-2xl font-black text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' }}
                        >
                            {sending === 'instant' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    {safeGetTranslation('room.send_request', 'Talebi İlet')}
                                </>
                            )}
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="max-w-md mx-auto px-6 mt-10 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Express Hospitality Service
                </div>
            </div>
        </div>
    );
}
