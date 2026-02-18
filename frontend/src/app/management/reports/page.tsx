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
    UserCheck,
    Star,
    Wifi,
    Smartphone,
    Activity,
    AlertTriangle,
    ThumbsUp,
    Zap
} from 'lucide-react';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type ReportTab = 'satisfaction' | 'usage' | 'revenue' | 'kitchen' | 'operation' | 'technical';

export default function ReportsPage() {
    const { token, user } = useAuth();
    const { currentLanguage, getTranslation } = useLanguageStore();
    const [activeTab, setActiveTab] = useState<ReportTab>('satisfaction');
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

    // Derived Data for Revenue (formerly Financial) Report
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
        { id: 'satisfaction', label: 'Misafir Memnuniyeti', icon: Star, color: 'text-yellow-500' },
        { id: 'usage', label: 'Kullanım & Etkileşim', icon: Smartphone, color: 'text-purple-600' },
        { id: 'revenue', label: 'Gelir & Upsell', icon: DollarSign, color: 'text-emerald-600' },
        { id: 'kitchen', label: 'Mutfak', icon: Utensils, color: 'text-orange-600' },
        { id: 'operation', label: 'Operasyon', icon: ClipboardList, color: 'text-blue-600' },
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
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center overflow-hidden group ${activeTab === tab.id
                            ? 'border-hotel-gold bg-amber-50/50'
                            : 'border-white bg-white hover:border-gray-100 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className={`p-2 rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110 ${tab.color}`}>
                            <tab.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold block ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabGlow"
                                className="absolute -right-4 -bottom-4 w-12 h-12 bg-hotel-gold/10 rounded-full blur-2xl"
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
                    {activeTab === 'satisfaction' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Net Promoter Score (NPS)</h3>
                                <div className="relative w-48 h-48 flex items-center justify-center my-6">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="3"
                                            strokeDasharray="72, 100"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-emerald-600">72</span>
                                        <span className="text-xs font-bold text-gray-400 mt-1">Excellent</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 w-full text-center text-xs font-bold">
                                    <div>
                                        <span className="block text-emerald-600 text-lg">78%</span>
                                        <span className="text-gray-400">Promoters</span>
                                    </div>
                                    <div>
                                        <span className="block text-yellow-500 text-lg">16%</span>
                                        <span className="text-gray-400">Passives</span>
                                    </div>
                                    <div>
                                        <span className="block text-red-500 text-lg">6%</span>
                                        <span className="text-gray-400">Detractors</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Departman Bazlı Memnuniyet</h3>
                                <div className="h-[300px] flex items-center justify-center">
                                    <Radar
                                        data={{
                                            labels: ['Resepsiyon', 'Temizlik', 'Oda Servisi', 'Konsiyerj', 'WiFi', 'Spa'],
                                            datasets: [{
                                                label: 'Puan',
                                                data: [4.8, 4.5, 4.9, 4.2, 3.8, 4.6],
                                                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                                                borderColor: '#eab308',
                                                pointBackgroundColor: '#eab308',
                                                pointBorderColor: '#fff',
                                            }]
                                        }}
                                        options={{
                                            scales: {
                                                r: {
                                                    min: 0,
                                                    max: 5,
                                                    beginAtZero: true,
                                                    ticks: { backdropColor: 'transparent', font: { size: 10 } }
                                                }
                                            },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Misafir Yorumları Özeti</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { text: 'Harika Kahvaltı', weight: 'text-xl', color: 'text-emerald-600' },
                                            { text: 'Temiz Oda', weight: 'text-lg', color: 'text-emerald-500' },
                                            { text: 'Yavaş İnternet', weight: 'text-sm', color: 'text-red-400' },
                                            { text: 'Personel Güler Yüzlü', weight: 'text-base', color: 'text-blue-500' },
                                            { text: 'Manzara', weight: 'text-lg', color: 'text-purple-500' },
                                            { text: 'Sessiz', weight: 'text-sm', color: 'text-gray-600' },
                                        ].map((tag, i) => (
                                            <span key={i} className={`font-black ${tag.weight} ${tag.color} bg-gray-50 px-2 py-1 rounded-lg`}>
                                                {tag.text}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-3 text-red-500 mb-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="font-bold">Kritik Uyarılar (Son 24s)</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            204 no'lu oda "Sıcak su problemi" bildirdi. (Anket Puanı: 2/5)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usage' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    Saat Bazlı Kullanım Yoğunluğu
                                </h3>
                                <div className="h-[350px]">
                                    <Line
                                        data={{
                                            labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00', '03:00'],
                                            datasets: [{
                                                label: 'Aktif Oturumlar',
                                                data: [12, 85, 45, 32, 78, 95, 25, 5],
                                                borderColor: '#9333ea', // purple-600
                                                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                                fill: true,
                                                tension: 0.4,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { beginAtZero: true, grid: { display: false } },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">En Çok Tıklanan Hizmetler</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Oda Servisi Menüsü', count: 1245, pct: 85, color: 'bg-orange-500' },
                                        { name: 'WiFi Şifresi', count: 890, pct: 62, color: 'bg-blue-500' },
                                        { name: 'Temizlik İsteği', count: 450, pct: 35, color: 'bg-emerald-500' },
                                        { name: 'Konsiyerj/Tur', count: 210, pct: 15, color: 'bg-purple-500' },
                                        { name: 'Anket', count: 120, pct: 8, color: 'bg-gray-400' },
                                    ].map(service => (
                                        <div key={service.name}>
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span>{service.name}</span>
                                                <span className="text-gray-500">{service.count} kez</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${service.color}`}
                                                    style={{ width: `${service.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        Gelir Trendi (Oda Servisi & Upsell)
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 font-medium">Toplam Ek Gelir</p>
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
                                                },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Gelir Dağılımı</h3>
                                    <div className="h-[200px] flex items-center justify-center">
                                        <Doughnut
                                            data={{
                                                labels: ['Oda Servisi', 'Spa', 'Tur/Transfer', 'Minibar'],
                                                datasets: [{
                                                    data: [65, 15, 10, 10],
                                                    backgroundColor: ['#10b981', '#f472b6', '#3b82f6', '#f59e0b'],
                                                    borderWidth: 0,
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { weight: 'bold', size: 10 } } }
                                                },
                                                cutout: '70%'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-white/80 font-bold text-sm uppercase tracking-widest">Kampanya ROI</p>
                                            <p className="text-xs text-white/60">"Spa %20 İndirim" Bannerı</p>
                                        </div>
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black">%18</p>
                                        <p className="mb-2 font-bold text-sm text-white/80">Dönüşüm</p>
                                    </div>
                                    <p className="mt-4 text-xs text-white/60 font-medium bg-white/10 p-2 rounded-lg inline-block">
                                        158 Görüntülenme / 28 Rezervasyon
                                    </p>
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
                                            <span className="text-sm text-gray-500 font-bold">Rahatsız Etmeyin (DND)</span>
                                            <span className="text-2xl font-black text-gray-600">14</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-gray-500 font-bold">Acil Çağrı</span>
                                            <span className="text-2xl font-black text-red-500">2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Wifi className="w-5 h-5 text-gray-600" />
                                    WiFi Sinyal Kalitesi (Heatmap Özeti)
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { zone: '1. Kat Odalar', quality: 'Güçlü', val: 95, color: 'bg-green-500' },
                                        { zone: '2. Kat Odalar', quality: 'Orta', val: 78, color: 'bg-yellow-500' },
                                        { zone: '3. Kat - Köşe', quality: 'Zayıf', val: 45, color: 'bg-red-500' },
                                        { zone: 'Lobi & Restoran', quality: 'Mükemmel', val: 99, color: 'bg-emerald-600' },
                                    ].map(zone => (
                                        <div key={zone.zone}>
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span>{zone.zone}</span>
                                                <span className="text-gray-500">{zone.quality} (%{zone.val})</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${zone.color}`}
                                                    style={{ width: `${zone.val}%` }}
                                                />
                                            </div>
                                            {zone.val < 50 && (
                                                <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Sinyal güçlendirici gerekli
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-blue-600" />
                                    Cihaz Sağlığı & Hatalar
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Crash/Hata</p>
                                        <p className="text-2xl font-black text-gray-900">%0.2</p>
                                        <p className="text-xs text-green-600 font-bold">Mükemmel Stabilite</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Güncel Cihaz</p>
                                        <p className="text-2xl font-black text-gray-900">%100</p>
                                        <p className="text-xs text-green-600 font-bold">Tümü Güncel</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-gray-900 mb-2">Son Sistem Logları</p>
                                    {[
                                        { time: '10:42', msg: 'System update completed successfully', type: 'info' },
                                        { time: '09:15', msg: 'Room 204 tablet reconnecting...', type: 'warn' },
                                        { time: '08:00', msg: 'Daily maintenance check passed', type: 'success' },
                                    ].map((log, i) => (
                                        <div key={i} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                                            <span className="text-gray-400 font-mono mr-2">{log.time}</span>
                                            <span className={`${log.type === 'warn' ? 'text-orange-500' : log.type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>
                                                {log.msg}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
