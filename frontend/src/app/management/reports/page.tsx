"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Clock,
    Download,
    Calendar as CalendarIcon,
    ChevronRight,
    Filter,
    RefreshCw,
    FileText,
    Utensils,
    ClipboardList,
    UserCheck
} from 'lucide-react';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type ReportTab = 'financial' | 'kitchen' | 'operation' | 'guest';

export default function ReportsPage() {
    const { token, user } = useAuth();
    const { currentLanguage, getTranslation } = useLanguageStore();
    const [activeTab, setActiveTab] = useState<ReportTab>('financial');
    const [dateRange, setDateRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Set page title
    useEffect(() => {
        document.title = `${getTranslation('dashboard.reports') || 'Raporlar'} - RoomXQR`;
    }, [currentLanguage, getTranslation]);

    const loadData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
            const base = /\/api\/?$/.test(API_BASE_URL) ? API_BASE_URL.replace(/\/$/, '') : `${API_BASE_URL.replace(/\/$/, '')}/api`;

            let tenantSlug = 'demo';
            if (typeof window !== 'undefined') {
                const sub = window.location.hostname.split('.')[0];
                if (sub && !['www', 'roomxqr', 'roomxqr-backend'].includes(sub)) tenantSlug = sub;
            }

            // Fetch all necessary data for reports
            const [ordersRes, requestsRes, statsRes] = await Promise.all([
                fetch(`${base}/orders?limit=1000`, { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant': tenantSlug } }),
                fetch(`${base}/requests?limit=1000`, { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant': tenantSlug } }),
                fetch(`${base}/statistics`, { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant': tenantSlug } })
            ]);

            const orders = await ordersRes.json();
            const requests = await requestsRes.json();
            const stats = await statsRes.json();

            setData({
                orders: Array.isArray(orders) ? orders : [],
                requests: Array.isArray(requests) ? requests : [],
                stats
            });
        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    // Derived Data for Financial Report
    const financialStats = useMemo(() => {
        if (!data) return null;
        const orders = data.orders;

        // Revenue by date
        const revenueByDate: Record<string, number> = {};
        orders.forEach((o: any) => {
            const date = new Date(o.createdAt).toLocaleDateString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US');
            revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(o.totalAmount);
        });

        // Payment methods
        const payments: Record<string, number> = {};
        orders.forEach((o: any) => {
            const method = o.paymentMethod || 'Diğer';
            payments[method] = (payments[method] || 0) + parseFloat(o.totalAmount);
        });

        return {
            revenueByDate,
            payments,
            total: orders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0),
            avgOrder: orders.length > 0 ? orders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0) / orders.length : 0
        };
    }, [data, currentLanguage]);

    // Derived Data for Kitchen Report
    const kitchenStats = useMemo(() => {
        if (!data) return null;
        const itemCounts: Record<string, { count: number, revenue: number }> = {};
        data.orders.forEach((o: any) => {
            o.items?.forEach((i: any) => {
                const name = i.menuItem?.name || i.name || 'Bilinmeyen Ürün';
                if (!itemCounts[name]) itemCounts[name] = { count: 0, revenue: 0 };
                itemCounts[name].count += i.quantity;
                itemCounts[name].revenue += (parseFloat(i.price) * i.quantity);
            });
        });

        const topItems = Object.entries(itemCounts)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return { topItems };
    }, [data]);

    // Derived Data for Operation Report
    const operationStats = useMemo(() => {
        if (!data) return null;
        const types: Record<string, number> = {};
        data.requests.forEach((r: any) => {
            const type = r.type || 'Diğer';
            types[type] = (types[type] || 0) + 1;
        });

        return { types };
    }, [data]);

    const tabs: { id: ReportTab; label: string; icon: any; color: string }[] = [
        { id: 'financial', label: 'Finansal Raporlar', icon: DollarSign, color: 'text-emerald-600' },
        { id: 'kitchen', label: 'Mutfak Performansı', icon: Utensils, color: 'text-orange-600' },
        { id: 'operation', label: 'Operasyonel Analiz', icon: ClipboardList, color: 'text-blue-600' },
        { id: 'guest', label: 'Misafir Profili', icon: UserCheck, color: 'text-purple-600' },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-12 h-12 text-hotel-gold animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Veriler analiz ediliyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Raporlar ve Analitik</h1>
                    <p className="text-gray-500 mt-1">İşletmenizin performansını detaylı verilerle takip edin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                        title="Yenile"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                        {['7d', '30d', 'ALL'].map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${dateRange === range
                                        ? 'bg-hotel-navy text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {range === '7d' ? '7 Gün' : range === '30d' ? '30 Gün' : 'Hepsi'}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-hotel-gold text-white rounded-xl hover:bg-hotel-navy transition-all shadow-lg font-bold">
                        <Download className="w-4 h-4" />
                        PDF İndir
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 overflow-hidden group ${activeTab === tab.id
                                ? 'border-hotel-gold bg-amber-50/30'
                                : 'border-white bg-white hover:border-gray-100 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className={`p-3 rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110 ${tab.color}`}>
                            <tab.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className={`text-sm font-bold block ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                {tab.label}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Gözat →</span>
                        </div>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabGlow"
                                className="absolute -right-4 -bottom-4 w-16 h-16 bg-hotel-gold/10 rounded-full blur-2xl"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'financial' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Revenue Chart */}
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        Zaman Serisi Gelir Analizi
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 font-medium">Toplam Dönem Cirosu</p>
                                        <p className="text-2xl font-black text-emerald-600">₺{financialStats?.total.toLocaleString('tr-TR')}</p>
                                    </div>
                                </div>
                                <div className="h-[350px]">
                                    <Line
                                        data={{
                                            labels: Object.keys(financialStats?.revenueByDate || {}),
                                            datasets: [{
                                                label: 'Günlük Ciro (₺)',
                                                data: Object.values(financialStats?.revenueByDate || {}),
                                                borderColor: '#10b981',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                fill: true,
                                                tension: 0.4,
                                                pointRadius: 6,
                                                pointBackgroundColor: '#fff',
                                                pointBorderWidth: 3,
                                                pointHoverRadius: 8,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: 'rgba(0,0,0,0.05)' },
                                                    ticks: { font: { weight: 'bold' } }
                                                },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Payment Methods & Summary */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Ödeme Tipleri</h3>
                                    <div className="h-[200px] flex items-center justify-center">
                                        <Pie
                                            data={{
                                                labels: Object.keys(financialStats?.payments || {}),
                                                datasets: [{
                                                    data: Object.values(financialStats?.payments || {}),
                                                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'],
                                                    borderWidth: 0,
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { weight: 'bold' } } }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-hotel-navy rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <DollarSign className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
                                    <p className="text-white/60 font-bold text-sm uppercase tracking-widest mb-2">Ortalama Sipariş</p>
                                    <p className="text-4xl font-black">₺{financialStats?.avgOrder.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                    <p className="mt-4 text-xs text-white/40 font-medium">Bu veri son 1000 siparişin ortalamasıdır.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'kitchen' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-orange-500" />
                                    Hangi Lezzetler Kazanıyor? (Top 10)
                                </h3>
                                <div className="h-[400px]">
                                    <Bar
                                        data={{
                                            labels: kitchenStats?.topItems.map(i => i.name),
                                            datasets: [{
                                                label: 'Satılan Adet',
                                                data: kitchenStats?.topItems.map(i => i.count),
                                                backgroundColor: '#f97316',
                                                borderRadius: 8,
                                            }]
                                        }}
                                        options={{
                                            indexAxis: 'y',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Mutfak Lider Tablosu (Ciro)</h3>
                                <div className="space-y-4">
                                    {kitchenStats?.topItems.map((item, idx) => (
                                        <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50">
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-black text-gray-400">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">{item.count} Adet Satıldı</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-orange-600">₺{item.revenue.toLocaleString('tr-TR')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'operation' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-8">Misafir Talepleri Dağılımı</h3>
                                <div className="h-[400px]">
                                    <Bar
                                        data={{
                                            labels: Object.keys(operationStats?.types || {}),
                                            datasets: [{
                                                label: 'İşlem Sayısı',
                                                data: Object.values(operationStats?.types || {}),
                                                backgroundColor: '#3b82f6',
                                                borderRadius: 12,
                                                barThickness: 40
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                                                x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                                    <Clock className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Ort. Yanıt Süresi</p>
                                    <p className="text-4xl font-black">12.4 dk</p>
                                    <p className="mt-4 text-xs text-blue-200/60 font-medium">Hedef sürenin %15 altındasınız.</p>
                                </div>
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Operasyon Özeti</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                            <span className="text-sm text-gray-500 font-bold">Toplam Talep</span>
                                            <span className="text-2xl font-black text-blue-600">{data?.requests.length}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                            <span className="text-sm text-gray-500 font-bold">Çözülen Problemler</span>
                                            <span className="text-2xl font-black text-green-600">{data?.requests.filter((r: any) => r.status === 'completed').length}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-gray-500 font-bold">İptal Oranı</span>
                                            <span className="text-2xl font-black text-red-500">%3.8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'guest' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PieChartIcon className="w-12 h-12 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gelişmiş Misafir Analitiği</h3>
                            <p className="text-gray-500 max-w-lg mx-auto mb-8">
                                Misafirlerinizin dil tercihlerini, konaklama alışkanlıklarını ve mobil uygulama kullanım oranlarını bu bölümde inceleyebilirsiniz.
                                Şu anda veri toplama aşamasındayız.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Mobil Kullanım', val: '%92', desc: 'Web arayüzü tercih oranı' },
                                    { label: 'Dil Tercihi', val: 'TR / EN', desc: 'En popüler arayüz dilleri' },
                                    { label: 'Tekrar Gelen', val: '%14', desc: 'Sadık misafir oranı' },
                                ].map(item => (
                                    <div key={item.label} className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100">
                                        <p className="text-2xl font-black text-purple-600 mb-1">{item.val}</p>
                                        <p className="text-sm font-bold text-gray-900 mb-1">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
