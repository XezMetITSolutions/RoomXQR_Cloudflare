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
                    // Filter only active ones
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
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={handleGoBack}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:scale-90 transition-all"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">
                        <SimpleTranslator text="Otel Olanakları" targetLang={currentLanguage as any} />
                    </h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">Yükleniyor...</p>
                    </div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white p-8 rounded-3xl shadow-sm inline-block">
                            <FaInfoCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">Henüz eklenmiş bir olanak bulunmuyor.</p>
                        </div>
                    </div>
                ) : (
                    facilities.map((facility) => (
                        <div key={facility.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            {facility.image && (
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    <SimpleTranslator text={facility.name} targetLang={currentLanguage as any} />
                                </h2>

                                {facility.description && (
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        <SimpleTranslator text={facility.description} targetLang={currentLanguage as any} />
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {facility.location && (
                                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Konum</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <SimpleTranslator text={facility.location} targetLang={currentLanguage as any} />
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {facility.openingHours && (
                                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FaClock />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Çalışma Saatleri</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <SimpleTranslator text={facility.openingHours} targetLang={currentLanguage as any} />
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {facility.reservationInfo && (
                                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Rezervasyon</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <SimpleTranslator text={facility.reservationInfo} targetLang={currentLanguage as any} />
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {facility.contactInfo && (
                                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FaPhone />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">İletişim</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    <SimpleTranslator text={facility.contactInfo} targetLang={currentLanguage as any} />
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
