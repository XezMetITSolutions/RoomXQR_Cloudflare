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
        { name: "Havlu", nameKey: "quick.towel", icon: Bath, color: "text-blue-600" },
        { name: "Terlik", nameKey: "quick.slippers", icon: Footprints, color: "text-green-600" },
        { name: "Yastık", nameKey: "quick.pillow", icon: Bed, color: "text-pink-600" },
        { name: "Battaniye", nameKey: "quick.blanket", icon: Bed, color: "text-indigo-600" },
        { name: "Şampuan", nameKey: "quick.shampoo", icon: Droplet, color: "text-orange-600" },
        { name: "Su", nameKey: "quick.water", icon: GlassWater, color: "text-cyan-600" }
    ];

    const maintenanceItems = [
        { name: "Klima/Isıtıcı", nameKey: "maintenance.heater", icon: ThermometerSnowflake, color: "text-orange-500" },
        { name: "Televizyon", nameKey: "maintenance.tv", icon: Tv, color: "text-blue-500" },
        { name: "Kumanda", nameKey: "maintenance.remote", icon: Tv, color: "text-gray-500" },
        { name: "Minibar", nameKey: "maintenance.minibar", icon: Wind, color: "text-cyan-500" },
        { name: "Işık/Lamba", nameKey: "maintenance.light", icon: Lightbulb, color: "text-yellow-500" },
        { name: "Duş/Musluk", nameKey: "maintenance.shower", icon: Droplet, color: "text-blue-400" },
        { name: "Sıcak Su", nameKey: "maintenance.water", icon: Bath, color: "text-blue-400" },
        { name: "WiFi Sorunu", nameKey: "maintenance.wifi", icon: Wifi, color: "text-indigo-500" },
        { name: "Kasa", nameKey: "maintenance.safe", icon: Lock, color: "text-gray-500" },
        { name: "Gider/Lavabo", nameKey: "maintenance.drain", icon: Waves, color: "text-blue-600" },
        { name: "Tuvalet/Klozet", nameKey: "maintenance.toilet", icon: Bath, color: "text-indigo-600" },
        { name: "Kapı/Kilit", nameKey: "maintenance.door", icon: Lock, color: "text-red-400" },
        { name: "Priz/Elektrik", nameKey: "maintenance.plug", icon: PlugZap, color: "text-red-500" },
        { name: "Mobilya/Yatak", nameKey: "maintenance.furniture", icon: Bed, color: "text-brown-500" }
    ];

    const [selectedItem, setSelectedItem] = useState("");
    const [selectedItemKey, setSelectedItemKey] = useState("");
    const [amount, setAmount] = useState(1);
    const [note, setNote] = useState("");

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
        setSelectedItem(itemName);
        setSelectedItemKey(key);
        // Automatically focus or scroll to amount selector if needed
    };

    const sendRequest = async (type: 'housekeeping' | 'general', description: string, isDnd: boolean = false) => {
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
        <div className="min-h-screen flex flex-col items-center py-6 relative" style={{ background: theme.backgroundColor }}>

            {/* Header with Back Button */}
            <div className="w-full max-w-md px-4 mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full shadow-sm hover:bg-opacity-80 transition"
                    style={{ background: theme.cardBackground, color: theme.textColor, border: `1px solid ${theme.borderColor}` }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold" style={{ color: theme.textColor }}>
                    {safeGetTranslation('cleaning.title', 'Oda Temizliği & İstekler')}
                </h1>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            <div className="w-full max-w-md px-4 space-y-6">

                {/* Main Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => sendRequest('housekeeping', safeGetTranslation('cleaning.request_cleaning', 'Oda Temizliği İsteniyor'))}
                        className="flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:scale-105 transition active:scale-95"
                        style={{ background: `${theme.secondaryColor}20`, border: `1px solid ${theme.secondaryColor}40` }}
                    >
                        <div className="p-4 rounded-full mb-3" style={{ background: theme.secondaryColor }}>
                            <Sparkles className="text-3xl text-white" />
                        </div>
                        <span className="font-semibold text-center" style={{ color: theme.textColor }}>
                            {safeGetTranslation('cleaning.clean_my_room', 'Odamı Temizle')}
                        </span>
                    </button>

                    <button
                        onClick={() => sendRequest('housekeeping', safeGetTranslation('cleaning.dnd', 'DO NOT DISTURB'), true)}
                        className="flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:scale-105 transition active:scale-95"
                        style={{ background: '#FECACA30', border: '1px solid #FECACA' }} // Light red for DND
                    >
                        <div className="p-4 rounded-full mb-3 bg-red-500">
                            <BellOff className="text-3xl text-white" />
                        </div>
                        <span className="font-semibold text-center text-red-900">
                            {safeGetTranslation('cleaning.dnd', 'Rahatsız Etmeyin')}
                        </span>
                    </button>
                </div>

                {/* Tab Selection */}
                <div className="flex p-1 rounded-xl bg-gray-100 shadow-inner">
                    <button
                        onClick={() => { setActiveTab('housekeeping'); setSelectedItem(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'housekeeping' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                        style={{ color: activeTab === 'housekeeping' ? theme.primaryColor : undefined }}
                    >
                        <Sparkles className="w-4 h-4" />
                        {safeGetTranslation('room.housekeeping', 'İstekler')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('maintenance'); setSelectedItem(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'maintenance' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                        style={{ color: activeTab === 'maintenance' ? theme.primaryColor : undefined }}
                    >
                        <Wrench className="w-4 h-4" />
                        {safeGetTranslation('room.maintenance', 'Teknik')}
                    </button>
                </div>

                {/* Quick Selection Section */}
                <div className="rounded-xl shadow-sm p-5" style={{ background: theme.cardBackground }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: theme.textColor }}>
                        {activeTab === 'housekeeping'
                            ? safeGetTranslation('cleaning.need_something', 'Bir şeye ihtiyacınız mı var?')
                            : safeGetTranslation('maintenance.title', 'Bir sorun mu var?')}
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
                        {(activeTab === 'housekeeping' ? quickItems : maintenanceItems).map((item) => (
                            <button
                                key={item.nameKey}
                                onClick={() => handleQuickSelect(safeGetTranslation(item.nameKey, item.name), item.nameKey)}
                                className={`flex flex-col items-center p-3 rounded-lg transition-all border ${selectedItemKey === item.nameKey
                                    ? 'ring-2 ring-opacity-50'
                                    : 'hover:bg-gray-50'
                                    }`}
                                style={{
                                    borderColor: selectedItemKey === item.nameKey ? theme.primaryColor : theme.borderColor,
                                    background: selectedItemKey === item.nameKey ? `${theme.primaryColor}10` : 'transparent'
                                }}
                            >
                                <item.icon className={`w-8 h-8 mb-2 ${item.color}`} />
                                <span className="text-xs text-center font-medium" style={{ color: theme.textColor }}>
                                    {safeGetTranslation(item.nameKey, item.name)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Amount and Send Section */}
                    {selectedItem && (
                        <div className="animate-fade-in">
                            {activeTab === 'housekeeping' && (
                                <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ background: theme.backgroundColor }}>
                                    <span className="font-medium" style={{ color: theme.textColor }}>{selectedItem}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setAmount(Math.max(1, amount - 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded-full font-bold transition"
                                            style={{ background: theme.borderColor, color: theme.textColor }}
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-bold w-4 text-center" style={{ color: theme.textColor }}>{amount}</span>
                                        <button
                                            onClick={() => setAmount(Math.min(10, amount + 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded-full font-bold transition"
                                            style={{ background: theme.borderColor, color: theme.textColor }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'maintenance' && (
                                <div className="mb-4 p-3 rounded-lg text-center" style={{ background: theme.backgroundColor }}>
                                    <span className="font-bold text-lg" style={{ color: theme.textColor }}>{selectedItem}</span>
                                </div>
                            )}

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={safeGetTranslation('cleaning.add_note', 'Not ekle (opsiyonel)...')}
                                className="w-full p-3 rounded-lg text-sm mb-4 focus:outline-none focus:ring-1"
                                style={{
                                    background: theme.backgroundColor,
                                    color: theme.textColor,
                                    border: `1px solid ${theme.borderColor}`
                                }}
                                rows={2}
                            />

                            <button
                                onClick={handleQuickItemSubmit}
                                className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                                style={{ background: theme.primaryColor }}
                            >
                                <CheckCircle className="w-5 h-5" />
                                {safeGetTranslation('cleaning.order_now', 'Hemen İste')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Always Visible Note / Other Request Section */}
                <div className="rounded-xl shadow-sm p-5 mb-10" style={{ background: theme.cardBackground }}>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5" style={{ color: theme.primaryColor }} />
                        <h2 className="text-lg font-semibold" style={{ color: theme.textColor }}>
                            {safeGetTranslation('room.request_details', 'Özel İstek veya Not')}
                        </h2>
                    </div>

                    <textarea
                        value={selectedItem ? "" : note}
                        disabled={!!selectedItem}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={safeGetTranslation('concierge.custom_placeholder', 'Eklemek istediğiniz notu veya özel isteğinizi buraya yazın...')}
                        className="w-full p-4 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-opacity-50 min-h-[120px]"
                        style={{
                            background: theme.backgroundColor,
                            color: theme.textColor,
                            border: `1px solid ${theme.borderColor}`,
                            borderColor: theme.borderColor,
                            opacity: selectedItem ? 0.5 : 1
                        }}
                    />

                    {!selectedItem && (
                        <button
                            onClick={() => {
                                if (!note.trim()) return;
                                sendRequest('housekeeping', note);
                            }}
                            disabled={!note.trim()}
                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: theme.primaryColor }}
                        >
                            <CheckCircle className="w-5 h-5" />
                            {safeGetTranslation('room.send_request', 'Talebi İlet')}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
