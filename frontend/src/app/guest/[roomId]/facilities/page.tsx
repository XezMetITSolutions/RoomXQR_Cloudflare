"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaClock,
    FaInfoCircle,
    FaPhone,
    FaCalendarAlt
} from 'react-icons/fa';
import { useLanguageStore } from '@/store/languageStore';
import { SimpleTranslator } from '@/components/RealtimeTranslator';

import { motion, AnimatePresence } from 'framer-motion';

interface HotelFacility {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    location: string | null;
    openingHours: string | null;
    reservationInfo: string | null;
    contactInfo: string | null;
    isActive: boolean;
    translations?: any;
}

export default function GuestFacilitiesPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId as string;
    const { currentLanguage, getTranslation } = useLanguageStore();
    const [facilities, setFacilities] = useState<HotelFacility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                setLoading(true);
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

                let tenantSlug = 'demo';
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    const subdomain = hostname.split('.')[0];
                    if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                        tenantSlug = subdomain;
                    }
                }

                const response = await fetch(`${API_BASE_URL}/api/facilities`, {
                    headers: { 'x-tenant': tenantSlug }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFacilities(data.filter((f: HotelFacility) => f.isActive));
                }
            } catch (error) {
                console.error('Error loading facilities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFacilities();
    }, []);

    const handleGoBack = () => {
        router.push(`/guest/${roomId}`);
    };

    return (
        <div className="min-h-screen pb-12" style={{ background: '#F9FAFB' }}>
            {/* Premium Header */}
            <div className="relative h-64 w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 scale-110"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-10" />

                <div className="absolute inset-x-0 bottom-0 p-8 z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                            <SimpleTranslator text="Hotel Facilities" targetLang={currentLanguage as any} />
                        </h1>
                        <div className="h-1.5 w-16 bg-blue-500 rounded-full mb-6 shadow-lg shadow-blue-500/50" />
                        <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.4em] bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <SimpleTranslator text="Exclusive Experiences" targetLang={currentLanguage as any} />
                        </p>
                    </motion.div>
                </div>

                <div className="absolute top-6 left-6 z-30">
                    <button
                        onClick={handleGoBack}
                        className="p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl active:scale-90 transition-all"
                    >
                        <FaArrowLeft className="text-lg" />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-30 space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin mb-4 shadow-xl"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Yükleniyor...</p>
                    </div>
                ) : facilities.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-[3rem] shadow-2xl border border-gray-100"
                    >
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaInfoCircle className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold">Henüz eklenmiş bir olanak bulunmuyor.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-10">
                        {facilities.map((facility, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                key={facility.id}
                                className="group bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-blue-500/5 transition-all duration-500"
                            >
                                {facility.image && (
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <img
                                            src={facility.image}
                                            alt={facility.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                )}

                                <div className="p-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                                                {facility.translations?.[currentLanguage]?.name || (
                                                    <SimpleTranslator text={facility.name} targetLang={currentLanguage as any} />
                                                )}
                                            </h2>
                                            <div className="h-1 w-10 bg-blue-500 rounded-full" />
                                        </div>
                                    </div>

                                    {(facility.description || facility.translations?.[currentLanguage]?.description) && (
                                        <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                                            {facility.translations?.[currentLanguage]?.description || (
                                                <SimpleTranslator text={facility.description || ''} targetLang={currentLanguage as any} />
                                            )}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                        {(facility.location || facility.translations?.[currentLanguage]?.location) && (
                                            <div className="flex items-center space-x-4 bg-gray-50 p-5 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                                                    <FaMapMarkerAlt className="text-lg" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                                                        <SimpleTranslator text="Location" targetLang={currentLanguage as any} />
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">
                                                        {facility.translations?.[currentLanguage]?.location || (
                                                            <SimpleTranslator text={facility.location || ''} targetLang={currentLanguage as any} />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(facility.openingHours || facility.translations?.[currentLanguage]?.openingHours) && (
                                            <div className="flex items-center space-x-4 bg-gray-50 p-5 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                                    <FaClock className="text-lg" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                                                        <SimpleTranslator text="Opening Hours" targetLang={currentLanguage as any} />
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">
                                                        {facility.translations?.[currentLanguage]?.openingHours || (
                                                            <SimpleTranslator text={facility.openingHours || ''} targetLang={currentLanguage as any} />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(facility.reservationInfo || facility.translations?.[currentLanguage]?.reservationInfo) && (
                                            <div className="flex items-center space-x-4 bg-gray-50 p-5 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                                                    <FaCalendarAlt className="text-lg" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                                                        <SimpleTranslator text="Reservation" targetLang={currentLanguage as any} />
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">
                                                        {facility.translations?.[currentLanguage]?.reservationInfo || (
                                                            <SimpleTranslator text={facility.reservationInfo || ''} targetLang={currentLanguage as any} />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(facility.contactInfo || facility.translations?.[currentLanguage]?.contactInfo) && (
                                            <div className="flex items-center space-x-4 bg-gray-50 p-5 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                                    <FaPhone className="text-lg" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                                                        <SimpleTranslator text="Contact" targetLang={currentLanguage as any} />
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">
                                                        {facility.translations?.[currentLanguage]?.contactInfo || (
                                                            <SimpleTranslator text={facility.contactInfo || ''} targetLang={currentLanguage as any} />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Footer */}
            <div className="max-w-2xl mx-auto px-6 mt-16 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-xl border border-gray-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        Luxury Experience Awaits
                    </span>
                </div>
            </div>
        </div>
    );
}
