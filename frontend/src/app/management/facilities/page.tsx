"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    AlertCircle,
    X,
    Image as ImageIcon,
    MapPin,
    Clock,
    Calendar,
    Phone,
    Search,
    Languages
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translateText } from '@/lib/translateService';

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

export default function FacilitiesPage() {
    const { currentLanguage, getTranslation } = useLanguageStore();
    const [facilities, setFacilities] = useState<HotelFacility[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<HotelFacility | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showSuccessToast = (message: string) => {
        setToast({ show: true, message, type: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const showErrorToast = (message: string) => {
        setToast({ show: true, message, type: 'error' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const getTenantSlug = (): string => {
        if (typeof window === 'undefined') return 'demo';
        const hostname = window.location.hostname;
        if (hostname.includes('grandhotel')) return 'grandhotel';
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
            return subdomain;
        }
        return 'demo';
    };

    const loadFacilities = useCallback(async () => {
        try {
            setLoading(true);
            const tenantSlug = getTenantSlug();
            const response = await fetch('/api/facilities', {
                headers: { 'x-tenant': tenantSlug }
            });
            if (response.ok) {
                const data = await response.json();
                setFacilities(data);
            }
        } catch (error) {
            console.error('Error loading facilities:', error);
            showErrorToast('Olanaklar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            let imageUrl = imagePreview;
            if (imageFile) {
                imageUrl = await convertImageToBase64(imageFile);
            }

            const facilityData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                location: formData.get('location') as string,
                openingHours: formData.get('openingHours') as string,
                reservationInfo: formData.get('reservationInfo') as string,
                contactInfo: formData.get('contactInfo') as string,
                isActive: formData.get('isActive') === 'on',
                image: imageUrl,
                translations: selectedFacility?.translations || {}
            };

            const tenantSlug = getTenantSlug();
            const token = localStorage.getItem('auth_token');
            const url = selectedFacility ? `/api/facilities/${selectedFacility.id}` : '/api/facilities';
            const method = selectedFacility ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant': tenantSlug,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facilityData)
            });

            if (response.ok) {
                showSuccessToast(selectedFacility ? 'Olanak güncellendi' : 'Olanak eklendi');
                setShowModal(false);
                loadFacilities();
            } else {
                showErrorToast('Kaydedilemedi');
            }
        } catch (error) {
            console.error('Error saving facility:', error);
            showErrorToast('Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu olanağı silmek istediğinizden emin misiniz?')) return;

        try {
            const tenantSlug = getTenantSlug();
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/facilities/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-tenant': tenantSlug,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showSuccessToast('Olanak silindi');
                loadFacilities();
            } else {
                showErrorToast('Silinemedi');
            }
        } catch (error) {
            console.error('Error deleting facility:', error);
            showErrorToast('Bir hata oluştu');
        }
    };

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        loadFacilities();
    }, [loadFacilities]);

    if (!isHydrated) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{getTranslation('sidebar.facilities')}</h1>
                    <p className="text-gray-500">Otel olanaklarını ve aktivitelerini yönetin</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedFacility(null);
                        setImagePreview(null);
                        setImageFile(null);
                        setShowModal(true);
                    }}
                    className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Yeni Olanak Ekle</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Olanak ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map((facility) => (
                        <div key={facility.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                {facility.image ? (
                                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${facility.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {facility.isActive ? 'Aktif' : 'Pasif'}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{facility.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{facility.description || 'Açıklama yok'}</p>

                                <div className="space-y-2 mb-6">
                                    {facility.location && (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-yellow-500" />
                                            {facility.location}
                                        </div>
                                    )}
                                    {facility.openingHours && (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Clock className="w-3.5 h-3.5 mr-2 text-yellow-500" />
                                            {facility.openingHours}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => {
                                            setSelectedFacility(facility);
                                            setImagePreview(facility.image);
                                            setImageFile(null);
                                            setShowModal(true);
                                        }}
                                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        <Edit className="w-4 h-4 mr-1.5" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(facility.id)}
                                        className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedFacility ? 'Olanağı Düzenle' : 'Yeni Olanak Ekle'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Görsel</label>
                                <div
                                    onClick={() => document.getElementById('facility-image')?.click()}
                                    className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all overflow-hidden relative"
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-medium">
                                                Resmi Değiştir
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                                            <span className="text-sm text-gray-500">Resim Seçmek İçin Tıklayın</span>
                                        </>
                                    )}
                                    <input id="facility-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Olanak Adı</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={selectedFacility?.name}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Konum (Kat, Bölüm vb.)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            name="location"
                                            defaultValue={selectedFacility?.location || ''}
                                            placeholder="Örn: Kat -1, Lobi yanı"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Açıklama</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    defaultValue={selectedFacility?.description || ''}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Çalışma Saatleri</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            name="openingHours"
                                            defaultValue={selectedFacility?.openingHours || ''}
                                            placeholder="Örn: 09:00 - 22:00"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">İletişim Bilgisi (Dahili No)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            name="contactInfo"
                                            defaultValue={selectedFacility?.contactInfo || ''}
                                            placeholder="Örn: Dahili 1005"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Rezervasyon Bilgisi</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        name="reservationInfo"
                                        defaultValue={selectedFacility?.reservationInfo || ''}
                                        placeholder="Örn: 2 saat önceden rezervasyon gereklidir"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    defaultChecked={selectedFacility ? selectedFacility.isActive : true}
                                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Bu olanak misafirlere gösterilsin</label>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-2xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-200"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[60] flex items-center px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                    } animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                    {toast.type === 'success' ? <CheckCircle className="w-6 h-6 mr-3 text-green-600" /> : <AlertCircle className="w-6 h-6 mr-3 text-red-600" />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
