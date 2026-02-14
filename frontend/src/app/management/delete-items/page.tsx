"use client";
import { useState, useEffect } from 'react';

export default function DeleteMenuItemsPage() {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadMenuItems();
    }, []);

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/menu');
            if (response.ok) {
                const data = await response.json();
                setMenuItems(data.menu || []);
            }
        } catch (error) {
            console.error('Menü yükleme hatası:', error);
            setMessage('Menü yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (itemId: string, itemName: string) => {
        if (!confirm(`"${itemName}" ürününü silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            setDeleting(itemId);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

            const response = await fetch(`${API_URL}/api/menu/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'x-tenant': 'demo',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setMessage(`✓ "${itemName}" başarıyla silindi`);
                // Listeyi yenile
                await loadMenuItems();
            } else {
                const error = await response.text();
                setMessage(`✗ Silme başarısız: ${error}`);
            }
        } catch (error) {
            console.error('Silme hatası:', error);
            setMessage(`✗ Hata: ${error}`);
        } finally {
            setDeleting(null);
        }
    };

    const deleteMultiple = async (searchTerm: string) => {
        const itemsToDelete = menuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (itemsToDelete.length === 0) {
            setMessage(`"${searchTerm}" içeren ürün bulunamadı`);
            return;
        }

        if (!confirm(`${itemsToDelete.length} ürün silinecek. Emin misiniz?\n\n${itemsToDelete.map(i => i.name).join('\n')}`)) {
            return;
        }

        for (const item of itemsToDelete) {
            await deleteItem(item.id, item.name);
            await new Promise(resolve => setTimeout(resolve, 500)); // Kısa bekleme
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Menü Ürünlerini Sil</h1>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Menü Ürünlerini Sil</h1>

                {message && (
                    <div className={`mb-4 p-4 rounded ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => deleteMultiple('karniyarik')}
                        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                    >
                        Karnıyarık İçeren Tüm Ürünleri Sil
                    </button>
                    <button
                        onClick={() => deleteMultiple('cheeseburger')}
                        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                    >
                        Cheeseburger İçeren Tüm Ürünleri Sil
                    </button>
                    <button
                        onClick={loadMenuItems}
                        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                    >
                        Listeyi Yenile
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Adı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {menuItems.map((item) => (
                                <tr key={item.id} className={
                                    item.name.toLowerCase().includes('karniyarik') ||
                                        item.name.toLowerCase().includes('cheeseburger')
                                        ? 'bg-red-50'
                                        : ''
                                }>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.price}₺
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {item.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => deleteItem(item.id, item.name)}
                                            disabled={deleting === item.id}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {deleting === item.id ? 'Siliniyor...' : 'Sil'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Toplam {menuItems.length} ürün bulundu.
                    {menuItems.filter(i => i.name.toLowerCase().includes('karniyarik') || i.name.toLowerCase().includes('cheeseburger')).length > 0 && (
                        <span className="ml-2 text-red-600 font-semibold">
                            ({menuItems.filter(i => i.name.toLowerCase().includes('karniyarik') || i.name.toLowerCase().includes('cheeseburger')).length} ürün silinmek üzere işaretlendi)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
