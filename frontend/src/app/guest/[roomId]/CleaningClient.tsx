"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FaBroom,
    FaBellSlash,
    FaArrowLeft,
    FaBed,
    FaTooth,
    FaShoePrints,
    FaSoap,
    FaWater,
    FaCheckCircle
} from "react-icons/fa";
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
        { name: "Havlu", nameKey: "quick.towel", emoji: "🛁", color: "text-blue-600" },
        { name: "Terlik", nameKey: "quick.slippers", emoji: "🥿", color: "text-green-600" },
        { name: "Diş Macunu", nameKey: "quick.toothpaste", emoji: "🦷", color: "text-purple-600" },
        { name: "Yastık", nameKey: "quick.pillow", emoji: "🛏️", color: "text-pink-600" },
        { name: "Battaniye", nameKey: "quick.blanket", emoji: "🛌", color: "text-indigo-600" },
        { name: "Şampuan", nameKey: "quick.shampoo", emoji: "🧴", color: "text-orange-600" },
        { name: "Sabun", nameKey: "quick.soap", emoji: "🧼", color: "text-teal-600" },
        { name: "Su", nameKey: "quick.water", emoji: "💧", color: "text-cyan-600" },
        { name: "Tuvalet Kağıdı", nameKey: "quick.toilet_paper", emoji: "🧻", color: "text-gray-600" }
    ];

    const [selectedItem, setSelectedItem] = useState("");
    const [selectedItemKey, setSelectedItemKey] = useState("");
    const [amount, setAmount] = useState(1);
    const [note, setNote] = useState("");

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
        const desc = `${amount} x ${selectedItemKey || selectedItem} ${note ? `(${note})` : ''}`;
        sendRequest('housekeeping', desc);
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-6 relative" style={{ background: theme.backgroundColor }}>

            {/* Header with Back Button */}
            <div className="w-full max-w-md px-4 mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full shadow-sm hover:bg-opacity-80 transition"
                    style={{ background: theme.cardBackground, color: theme.textColor }}
                >
                    <FaArrowLeft />
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
                        style={{ background: `${theme.secondaryColor}20` }}
                    >
                        <div className="p-4 rounded-full mb-3" style={{ background: theme.secondaryColor }}>
                            <FaBroom className="text-3xl text-white" />
                        </div>
                        <span className="font-semibold text-center" style={{ color: theme.textColor }}>
                            {safeGetTranslation('cleaning.clean_my_room', 'Odamı Temizle')}
                        </span>
                    </button>

                    <button
                        onClick={() => sendRequest('housekeeping', 'DO NOT DISTURB / RAHATSIZ ETMEYİN', true)}
                        className="flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:scale-105 transition active:scale-95"
                        style={{ background: '#FECACA' }} // Light red for DND
                    >
                        <div className="p-4 rounded-full mb-3 bg-red-500">
                            <FaBellSlash className="text-3xl text-white" />
                        </div>
                        <span className="font-semibold text-center text-red-900">
                            {safeGetTranslation('cleaning.dnd', 'Rahatsız Etmeyin')}
                        </span>
                    </button>
                </div>

                {/* Quick Selection Section */}
                <div className="rounded-xl shadow-sm p-5" style={{ background: theme.cardBackground }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: theme.textColor }}>
                        {safeGetTranslation('cleaning.need_something', 'Bir şeye ihtiyacınız mı var?')}
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
                        {quickItems.map((item) => (
                            <button
                                key={item.name}
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
                                <span className="text-2xl mb-1">{item.emoji}</span>
                                <span className="text-xs text-center font-medium" style={{ color: theme.textColor }}>
                                    {safeGetTranslation(item.nameKey, item.name)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Amount and Send Section */}
                    {selectedItem && (
                        <div className="animate-fade-in">
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
                                className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
                                style={{ background: theme.primaryColor }}
                            >
                                <FaCheckCircle />
                                {safeGetTranslation('cleaning.order_now', 'Hemen İste')}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
